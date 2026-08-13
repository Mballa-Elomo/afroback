-- AFROBACK — extension du pilier Découverte : publication, mise en avant,
-- vidéo, engagement réel. Généré le 2026-08-12, à exécuter dans le SQL
-- Editor du dashboard Supabase, après seed-decouverte.sql (déjà exécuté).
--
-- Objectif : amener le back-office Découverte à parité avec Héros (demande
-- de Yannick) — mêmes mécanismes, adaptés à un contenu qui n'a pas de
-- chapitres (contrairement à un récit de héros ou de mythe) :
-- - `statut_publication`/`a_la_une` : mêmes colonnes, mêmes valeurs par
--   défaut ('publie' partout, personne "à la une") que
--   backoffice/supabase/schema-admin-heros.sql — ne change rien au
--   comportement actuel de l'app tant que le back-office n'y touche pas.
-- - `videos` (jsonb, map langue -> URL) : PAS de `video_chapitres` comme les
--   héros/mythes, une fiche Découverte n'est pas divisée en chapitres. Une
--   vidéo par langue au maximum.
-- - `decouverte_engagement` : miroir de `hero_engagement`, avec seulement 2
--   compteurs (`consultations`, `visionnages_video`) — une fiche Découverte
--   n'a ni récit à chapitres ni narration audio séparée à ce jour, donc pas
--   de 3e compteur ni de détail par chapitre (juste un détail vidéo par
--   langue, vu l'absence de chapitres).

alter table public.decouverte_items
  add column if not exists statut_publication text not null default 'publie'
    check (statut_publication in ('publie', 'depublie'));

alter table public.decouverte_items
  add column if not exists a_la_une boolean not null default false;

alter table public.decouverte_items
  add column if not exists videos jsonb not null default '{}'::jsonb;

create table if not exists public.decouverte_engagement (
  item_id uuid primary key references public.decouverte_items(id) on delete cascade,
  consultations integer not null default 0,
  visionnages_video integer not null default 0,
  visionnages_video_fr integer not null default 0,
  visionnages_video_en integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.decouverte_engagement enable row level security;
-- Aucune policy : même principe que hero_engagement — écriture uniquement
-- via les fonctions SECURITY DEFINER ci-dessous, lecture uniquement via le
-- back-office (clé service_role, contourne RLS nativement).

create or replace function public.increment_decouverte_consultation(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.decouverte_engagement (item_id, consultations)
  values (p_item_id, 1)
  on conflict (item_id) do update set
    consultations = decouverte_engagement.consultations + 1,
    updated_at = now();
end;
$$;

create or replace function public.increment_decouverte_video(p_item_id uuid, p_langue text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_langue not in ('fr', 'en') then
    raise exception 'langue invalide: %', p_langue;
  end if;

  insert into public.decouverte_engagement (item_id, visionnages_video, visionnages_video_fr, visionnages_video_en)
  values (
    p_item_id,
    1,
    case when p_langue = 'fr' then 1 else 0 end,
    case when p_langue = 'en' then 1 else 0 end
  )
  on conflict (item_id) do update set
    visionnages_video = decouverte_engagement.visionnages_video + 1,
    visionnages_video_fr = decouverte_engagement.visionnages_video_fr + case when p_langue = 'fr' then 1 else 0 end,
    visionnages_video_en = decouverte_engagement.visionnages_video_en + case when p_langue = 'en' then 1 else 0 end,
    updated_at = now();
end;
$$;

grant execute on function public.increment_decouverte_consultation(uuid) to anon, authenticated;
grant execute on function public.increment_decouverte_video(uuid, text) to anon, authenticated;
