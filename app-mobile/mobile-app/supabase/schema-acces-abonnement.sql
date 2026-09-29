-- =====================================================================
-- AFROBACK — Accès gratuit / contenus réservés aux abonnés (Lot A)
-- Cahier des charges : app-mobile/cdc-acces-gratuit-abonnement.md
-- Rédigé le 2026-09-29. À exécuter dans le SQL Editor de Supabase.
-- Script idempotent : peut être relancé sans risque.
--
-- Principe : le cadenas n'est pas qu'un affichage. Le SERVEUR décide qui
-- lit le contenu complet (récits, audio, vidéo, textes Découverte) :
--   - colonnes "catalogue" (titre, image, résumé…) : lisibles par tous ;
--   - colonnes "contenu" : plus lisibles directement par l'app, servies
--     uniquement par les fonctions get_*_detail(), qui vérifient
--     "contenu gratuit OU abonnement actif".
-- Le back-office utilise la clé service_role : il n'est pas concerné.
--
-- Limite connue (Lot C) : les fichiers audio/vidéo restent dans un espace
-- de stockage public. Leurs adresses ne sont plus données qu'aux ayants
-- droit, mais une adresse connue reste ouvrable.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Abonnements : modifiables UNIQUEMENT côté serveur
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('racines', 'heritage')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  -- offert (back-office), paiement (Mobile Money, Module 4), test
  source text not null check (source in ('offert', 'paiement', 'test')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;
-- Chacun peut lire SES abonnements ; aucune policy d'écriture : seul le
-- serveur (service_role) crée ou modifie un abonnement.
drop policy if exists "Read own subscriptions" on public.subscriptions;
create policy "Read own subscriptions" on public.subscriptions
  for select using (user_id = auth.uid());
revoke insert, update, delete on public.subscriptions from anon, authenticated;

create or replace function public.has_active_subscription()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = auth.uid()
      and status = 'active'
      and starts_at <= now()
      and (ends_at is null or ends_at > now())
  );
$$;
grant execute on function public.has_active_subscription() to anon, authenticated;

-- Abonnement courant de la personne connectée (affichage dans l'app).
create or replace function public.mon_abonnement()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select jsonb_build_object('plan', plan, 'ends_at', ends_at, 'source', source)
       from public.subscriptions
      where user_id = auth.uid()
        and status = 'active'
        and starts_at <= now()
        and (ends_at is null or ends_at > now())
      order by case plan when 'heritage' then 0 else 1 end, ends_at desc nulls first
      limit 1),
    'null'::jsonb
  );
$$;
grant execute on function public.mon_abonnement() to anon, authenticated;

-- Offrir un abonnement (testeurs, partenaires) : réservé au serveur
-- (back-office, clé service_role). p_jours null = sans date de fin.
create or replace function public.offrir_abonnement(p_email text, p_plan text, p_jours integer, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user uuid;
  v_sub public.subscriptions;
begin
  select id into v_user from auth.users where lower(email) = lower(trim(p_email)) limit 1;
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'utilisateur_introuvable');
  end if;
  insert into public.subscriptions (user_id, plan, status, source, ends_at, note)
  values (v_user, p_plan, 'active', 'offert',
          case when p_jours is null then null else now() + make_interval(days => p_jours) end,
          p_note)
  returning * into v_sub;
  return jsonb_build_object('ok', true, 'id', v_sub.id, 'ends_at', v_sub.ends_at);
end;
$$;
revoke execute on function public.offrir_abonnement(text, text, integer, text) from public, anon, authenticated;
grant execute on function public.offrir_abonnement(text, text, integer, text) to service_role;

-- ---------------------------------------------------------------------
-- 2. Contenus gratuits : liste modifiable sans toucher au code
-- ---------------------------------------------------------------------
create table if not exists public.contenus_gratuits (
  type text not null check (type in ('heros', 'mythe', 'decouverte')),
  slug text not null,
  primary key (type, slug)
);
alter table public.contenus_gratuits enable row level security;
drop policy if exists "Public read access" on public.contenus_gratuits;
create policy "Public read access" on public.contenus_gratuits for select using (true);
revoke insert, update, delete on public.contenus_gratuits from anon, authenticated;

insert into public.contenus_gratuits (type, slug) values
  ('heros', 'reine-nzinga'),
  ('mythe', 'mythe-ngan-medza-beti'),
  ('decouverte', 'palais-royal-foumban'),
  ('decouverte', 'ebolowa')
on conflict do nothing;

create or replace function public.acces_contenu(p_type text, p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.contenus_gratuits where type = p_type and slug = p_slug)
      or public.has_active_subscription();
$$;
grant execute on function public.acces_contenu(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Colonnes "catalogue" en lecture publique, contenu complet protégé
-- ---------------------------------------------------------------------
revoke select on public.heros from anon, authenticated;
grant select (
  id, slug, nom_affiche, nom_complet, sous_titre, epoque, region, theme, resume_catalogue,
  annee_naissance_indicative, annee_mort_indicative, image_carte_catalogue, avertissement_lecture,
  ordre_affichage, statut_publication, a_la_une, statut_recit_texte, statut_narration_audio,
  statut_video, heros_lies, created_at, updated_at
) on public.heros to anon, authenticated;

revoke select on public.mythes from anon, authenticated;
grant select (
  id, slug, titre, sous_titre, peuple, region, zone, epoque, type_contenu, theme, couleur,
  image_url, ordre_affichage, statut_publication, a_la_une, created_at, updated_at
) on public.mythes to anon, authenticated;

revoke select on public.decouverte_items from anon, authenticated;
grant select (
  id, slug, type, pays, region_ethnie, titre, sous_titre, resume_liste, image_url, heros_lies,
  items_lies, statut_contenu, ordre_affichage, statut_publication, a_la_une, created_at, updated_at
) on public.decouverte_items to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Détail : contenu complet si autorisé, sinon un court aperçu
-- ---------------------------------------------------------------------
create or replace function public.get_heros_detail(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.heros;
begin
  select * into r from public.heros where slug = p_slug and coalesce(statut_publication, 'publie') <> 'depublie';
  if not found then return null; end if;
  if public.acces_contenu('heros', p_slug) then
    return to_jsonb(r) || jsonb_build_object('verrouille', false);
  end if;
  return jsonb_build_object(
    'verrouille', true,
    'apercu_fr', left(coalesce(r.recit_fr_texte, ''), 600),
    'apercu_en', left(coalesce(r.recit_en_texte, ''), 600)
  );
end;
$$;
grant execute on function public.get_heros_detail(text) to anon, authenticated;

create or replace function public.get_mythe_detail(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.mythes;
begin
  select * into r from public.mythes where slug = p_slug and coalesce(statut_publication, 'publie') <> 'depublie';
  if not found then return null; end if;
  if public.acces_contenu('mythe', p_slug) then
    return to_jsonb(r) || jsonb_build_object('verrouille', false);
  end if;
  return jsonb_build_object(
    'verrouille', true,
    'apercu_fr', left(coalesce(r.recit_chapitres_fr -> 0 ->> 'texte', ''), 600),
    'apercu_en', left(coalesce(r.recit_chapitres_en -> 0 ->> 'texte', ''), 600)
  );
end;
$$;
grant execute on function public.get_mythe_detail(text) to anon, authenticated;

create or replace function public.get_decouverte_detail(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  r public.decouverte_items;
begin
  select * into r from public.decouverte_items where slug = p_slug and coalesce(statut_publication, 'publie') <> 'depublie';
  if not found then return null; end if;
  if public.acces_contenu('decouverte', p_slug) then
    return to_jsonb(r) || jsonb_build_object('verrouille', false);
  end if;
  return jsonb_build_object(
    'verrouille', true,
    'apercu_fr', left(coalesce(r.contenu_fr_texte, ''), 600),
    'apercu_en', left(coalesce(r.contenu_en_texte, ''), 600)
  );
end;
$$;
grant execute on function public.get_decouverte_detail(text) to anon, authenticated;
