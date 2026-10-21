-- =====================================================================
-- AFROBACK — Teasers (vidéo d'introduction de 30 s de chaque contenu), 2026-10-17
-- Chaque héros, mythe et fiche Découverte peut avoir un teaser en 4 versions :
--   { "fr": { "paysage": "<lien>", "vertical": "<lien>" },
--     "en": { "paysage": "<lien>", "vertical": "<lien>" } }
-- Les liens sont des vidéos YouTube / Vimeo (comme les autres vidéos depuis
-- le 2026-10-11), collés dans le back-office (section « Teaser »).
-- Le teaser est une bande-annonce : visible par tous, abonnés ou non
-- (colonne lisible par la clé publique, comme le titre ou l'image).
-- Produits par l'agent afroback-teaser + afroback-video (/afroback_teaser).
-- À exécuter dans Supabase > SQL Editor. Idempotent.
-- =====================================================================

alter table public.heros add column if not exists teaser jsonb not null default '{}'::jsonb;
alter table public.mythes add column if not exists teaser jsonb not null default '{}'::jsonb;
alter table public.decouverte_items add column if not exists teaser jsonb not null default '{}'::jsonb;

grant select (teaser) on public.heros to anon, authenticated;
grant select (teaser) on public.mythes to anon, authenticated;
grant select (teaser) on public.decouverte_items to anon, authenticated;
