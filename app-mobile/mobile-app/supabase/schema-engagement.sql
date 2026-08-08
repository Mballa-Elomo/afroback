-- Compteurs d'engagement réel par héros : lectures du récit, écoutes de la
-- narration audio, visionnages vidéo/storyboard. Demande de Yannick le
-- 2026-08-06, pour remplacer le vide du panneau "ENGAGEMENT GLOBAL" de la
-- maquette back-office (jamais construit jusqu'ici faute de vraie donnée,
-- et le compteur de vues Marketplace était le seul tracking réel de tout le
-- projet) par de vrais chiffres. Règle inchangée : jamais un chiffre
-- fabriqué — un héros sans événement affiche 0 réel.
--
-- Anonyme par construction : un total cumulé par héros et par type
-- d'événement, pas de tracking par utilisateur individuel (cohérent avec le
-- fait qu'aucun compte n'est requis pour consulter un héros dans l'app
-- aujourd'hui) — pas de RGPD à gérer en plus.
--
-- À exécuter par Yannick dans le SQL Editor du dashboard Supabase, comme les
-- autres scripts schema-*.sql. Idempotent (safe à rejouer).

create table if not exists public.hero_engagement (
  hero_id uuid primary key references public.heros(id) on delete cascade,
  lectures_recit integer not null default 0,
  ecoutes_audio integer not null default 0,
  visionnages_video integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.hero_engagement enable row level security;
-- Aucune policy : ni l'app mobile (clé anon) ni personne d'autre que le
-- back-office (clé service_role, contourne RLS nativement) ne lit/écrit
-- cette table directement. L'app mobile passe exclusivement par la fonction
-- ci-dessous (SECURITY DEFINER, contourne RLS pour ce seul usage contrôlé) —
-- pas d'écriture directe sur la table exposée à `anon`.

-- Incrémente atomiquement UN des 3 compteurs d'un héros. Choisi plutôt que
-- le pattern "select puis update" déjà utilisé pour
-- `marketplace_products.vues` (qui accepte une petite imprécision en cas de
-- vues simultanées, documenté dans marketplaceRepository.ts) : ici, 3
-- compteurs partagent la même ligne par héros, donc deux écritures
-- concurrentes sur deux compteurs différents du même héros auraient pu se
-- perdre l'une l'autre avec un simple select+update. Une fonction
-- SECURITY DEFINER avec upsert atomique évite ce risque sans complexifier
-- l'app cliente (un seul appel RPC).
create or replace function public.increment_hero_engagement(p_hero_id uuid, p_event text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event not in ('recit', 'audio', 'video') then
    raise exception 'type d''evenement invalide: %', p_event;
  end if;

  insert into public.hero_engagement (hero_id, lectures_recit, ecoutes_audio, visionnages_video)
  values (
    p_hero_id,
    case when p_event = 'recit' then 1 else 0 end,
    case when p_event = 'audio' then 1 else 0 end,
    case when p_event = 'video' then 1 else 0 end
  )
  on conflict (hero_id) do update set
    lectures_recit = hero_engagement.lectures_recit + case when p_event = 'recit' then 1 else 0 end,
    ecoutes_audio = hero_engagement.ecoutes_audio + case when p_event = 'audio' then 1 else 0 end,
    visionnages_video = hero_engagement.visionnages_video + case when p_event = 'video' then 1 else 0 end,
    updated_at = now();
end;
$$;

-- Le rôle anon (app mobile, jamais connectée avec un compte pour cette
-- action précise) doit pouvoir appeler cette fonction. `authenticated`
-- inclus aussi au cas où un futur écran connecté déclenche le même
-- événement (ex. mode enfant, École des Héros).
grant execute on function public.increment_hero_engagement(uuid, text) to anon, authenticated;
