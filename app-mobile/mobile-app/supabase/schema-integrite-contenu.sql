-- Lot 2 cybersécurité (2026-09-25) : intégrité et protection du contenu
-- culturel (héros, Découverte, Mythologie) — empêcher qu'un récit soit
-- modifié ou substitué sans que ça se voie.
--
-- MÉCANISME :
-- 1. Empreinte SHA-256 du contenu canonique de chaque fiche, recalculée
--    automatiquement à chaque écriture par un trigger Postgres — pas par le
--    code applicatif (back-office ou pipeline de seed), pour que ça
--    s'applique quel que soit le chemin d'écriture utilisé.
-- 2. "Signature" HMAC-SHA256 avec une clé secrète connue uniquement du
--    serveur (jamais exposée à l'API) : prouve que le hash a bien été
--    calculé par l'infrastructure AFROBACK, pas falsifié après coup par
--    quelqu'un qui recalculerait juste un SHA-256 sur un contenu modifié.
-- 3. Journal `content_integrity_log`, append-only, qui trace chaque
--    changement réel de hash (donc chaque changement réel de contenu).
--
-- LIMITE HONNÊTE À GARDER POUR LA SOUTENANCE : ce n'est pas une signature
-- numérique asymétrique (paire clé publique/privée façon PGP/PKI) — une
-- vraie infrastructure à clés publiques est hors de portée du temps
-- disponible. HMAC avec une clé serveur symétrique démontre le même
-- principe (preuve qu'un secret détenu uniquement côté serveur a validé le
-- contenu) mais avec une garantie plus faible : quiconque a accès à la
-- base (ex. un attaquant avec les identifiants `service_role`) pourrait en
-- théorie falsifier à la fois le contenu ET sa signature. Une vraie
-- signature asymétrique protégerait même dans ce scénario (la clé privée de
-- signature n'a pas besoin d'être dans la même base que le contenu signé).
-- Ne jamais présenter ceci comme une signature numérique complète devant le
-- jury — le terme exact à utiliser est "code d'authentification de message"
-- (HMAC), pas "signature numérique".
--
-- À exécuter par Yannick dans le SQL Editor du dashboard Supabase, APRÈS
-- seed.sql / seed-decouverte.sql / schema-mythologie.sql (dépend des 3
-- tables). Idempotent (safe à rejouer).

create extension if not exists pgcrypto;

-- Clé HMAC, générée une seule fois et jamais régénérée par la suite
-- (sinon toutes les signatures existantes deviendraient invalides).
create table if not exists public.app_secrets (
  key text primary key,
  value text not null
);
alter table public.app_secrets enable row level security;
-- Aucune policy : jamais accessible via l'API (anon/authenticated), lu
-- uniquement à l'intérieur de `compute_content_integrity()` ci-dessous.
-- Même si le rôle service_role du back-office contourne RLS nativement, le
-- back-office ne lit jamais cette table directement dans son code — c'est
-- une donnée strictement interne à Postgres.

insert into public.app_secrets (key, value)
values ('content_signature_hmac_key', encode(gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

-- Journal append-only des changements de contenu réels (pas des changements
-- de métadonnées qui ne touchent pas le texte). Réutilisable par le Lot 4
-- (dashboard de surveillance) comme `security_events`.
create table if not exists public.content_integrity_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  row_id uuid not null,
  slug text,
  ancien_hash text,
  nouveau_hash text not null,
  changed_at timestamptz not null default now()
);
alter table public.content_integrity_log enable row level security;
-- Aucune policy : écrit exclusivement par le trigger ci-dessous. Lecture
-- réservée au back-office (service_role, contourne RLS).

alter table public.heros add column if not exists contenu_hash text;
alter table public.heros add column if not exists contenu_signature text;
alter table public.heros add column if not exists integrite_calculee_le timestamptz;

alter table public.decouverte_items add column if not exists contenu_hash text;
alter table public.decouverte_items add column if not exists contenu_signature text;
alter table public.decouverte_items add column if not exists integrite_calculee_le timestamptz;

alter table public.mythes add column if not exists contenu_hash text;
alter table public.mythes add column if not exists contenu_signature text;
alter table public.mythes add column if not exists integrite_calculee_le timestamptz;

-- Un seul trigger générique pour les 3 tables : le contenu canonique à
-- hasher diffère par table (heros a un texte plat, mythes a des chapitres
-- structurés en jsonb), donc branché sur TG_TABLE_NAME plutôt que dupliqué
-- 3 fois.
create or replace function public.compute_content_integrity()
returns trigger
language plpgsql
as $$
declare
  v_canonical text;
  v_hmac_key text;
  v_old_hash text;
begin
  if TG_TABLE_NAME = 'heros' then
    v_canonical := coalesce(NEW.recit_fr_texte, '');
    v_old_hash := OLD.contenu_hash;
  elsif TG_TABLE_NAME = 'decouverte_items' then
    v_canonical := coalesce(NEW.contenu_fr_texte, '');
    v_old_hash := OLD.contenu_hash;
  elsif TG_TABLE_NAME = 'mythes' then
    v_canonical := coalesce(NEW.recit_chapitres_fr::text, '');
    v_old_hash := OLD.contenu_hash;
  else
    return NEW;
  end if;

  NEW.contenu_hash := encode(digest(v_canonical, 'sha256'), 'hex');

  select value into v_hmac_key from public.app_secrets where key = 'content_signature_hmac_key';
  if v_hmac_key is not null then
    NEW.contenu_signature := encode(hmac(v_canonical, v_hmac_key, 'sha256'), 'hex');
  end if;

  NEW.integrite_calculee_le := now();

  -- Ne journalise que si le contenu a réellement changé (pas à chaque
  -- simple mise à jour de métadonnées comme `a_la_une` ou `statut_video`,
  -- qui passent par la même table mais ne touchent pas le texte).
  if v_old_hash is distinct from NEW.contenu_hash then
    insert into public.content_integrity_log (table_name, row_id, slug, ancien_hash, nouveau_hash)
    values (TG_TABLE_NAME, NEW.id, NEW.slug, v_old_hash, NEW.contenu_hash);
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_heros_integrity on public.heros;
create trigger trg_heros_integrity
before insert or update on public.heros
for each row execute function public.compute_content_integrity();

drop trigger if exists trg_decouverte_integrity on public.decouverte_items;
create trigger trg_decouverte_integrity
before insert or update on public.decouverte_items
for each row execute function public.compute_content_integrity();

drop trigger if exists trg_mythes_integrity on public.mythes;
create trigger trg_mythes_integrity
before insert or update on public.mythes
for each row execute function public.compute_content_integrity();

-- Vérification publique : recalcule le hash à partir du contenu ACTUEL de
-- la ligne et le compare au hash stocké. Si quelqu'un modifiait le contenu
-- par un chemin qui contournerait le trigger (en théorie impossible en SQL
-- standard, mais utile comme garde-fou et comme démonstration pour la
-- soutenance), ou si la ligne a été restaurée depuis une sauvegarde
-- incohérente, cette fonction le détecte. N'expose jamais la clé HMAC.
create or replace function public.verify_content_integrity(p_table_name text, p_row_id uuid)
returns jsonb
language plpgsql
security definer
-- `pgcrypto` (digest()) est installé dans le schéma `extensions` chez
-- Supabase, pas `public` — un `search_path` restreint à `public` seul fait
-- échouer l'appel avec "function digest(text, unknown) does not exist"
-- (bug réel rencontré au premier test, 2026-09-25, corrigé ici).
set search_path = public, extensions
as $$
declare
  v_canonical text;
  v_stored_hash text;
  v_recomputed_hash text;
begin
  if p_table_name = 'heros' then
    select recit_fr_texte, contenu_hash into v_canonical, v_stored_hash from public.heros where id = p_row_id;
  elsif p_table_name = 'decouverte_items' then
    select contenu_fr_texte, contenu_hash into v_canonical, v_stored_hash from public.decouverte_items where id = p_row_id;
  elsif p_table_name = 'mythes' then
    select recit_chapitres_fr::text, contenu_hash into v_canonical, v_stored_hash from public.mythes where id = p_row_id;
  else
    return jsonb_build_object('error', 'table inconnue');
  end if;

  if v_canonical is null and v_stored_hash is null then
    return jsonb_build_object('error', 'introuvable');
  end if;

  v_recomputed_hash := encode(digest(coalesce(v_canonical, ''), 'sha256'), 'hex');

  return jsonb_build_object(
    'stored_hash', v_stored_hash,
    'recomputed_hash', v_recomputed_hash,
    'match', v_stored_hash = v_recomputed_hash
  );
end;
$$;

grant execute on function public.verify_content_integrity(text, uuid) to anon, authenticated;
