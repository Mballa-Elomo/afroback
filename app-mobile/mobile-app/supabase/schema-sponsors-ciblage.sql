-- =====================================================================
-- AFROBACK — Sponsors : ciblage par format et par chapitre (2026-10-15)
-- Cahier des charges : backoffice/cdc-module-sponsors.md (§ 9).
-- À exécuter APRÈS schema-sponsors.sql. Idempotent.
--
-- « Présenté par » peut viser : la fiche (tous formats), la lecture,
-- l'écoute ou la vidéo d'un contenu ; et, pour la lecture et la vidéo, un
-- chapitre précis. La fin de vidéo peut viser un chapitre précis.
-- =====================================================================

alter table public.sponsor_emplacements add column if not exists cible_format text;
alter table public.sponsor_emplacements drop constraint if exists sponsor_emplacements_cible_format_check;
alter table public.sponsor_emplacements add constraint sponsor_emplacements_cible_format_check
  check (cible_format is null or cible_format in ('lecture', 'ecoute', 'video'));

alter table public.sponsor_emplacements add column if not exists cible_chapitre integer;
alter table public.sponsor_emplacements drop constraint if exists sponsor_emplacements_cible_chapitre_check;
alter table public.sponsor_emplacements add constraint sponsor_emplacements_cible_chapitre_check
  check (cible_chapitre is null or cible_chapitre between 1 and 20);

-- Lecture publique : mêmes règles qu'avant, avec les deux nouveaux champs.
create or replace function public.sponsors_publics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'emplacement_id', e.id,
    'format', e.format,
    'cible_type', e.cible_type,
    'cible_slug', e.cible_slug,
    'cible_format', e.cible_format,
    'cible_chapitre', e.cible_chapitre,
    'accroche_fr', e.accroche_fr,
    'accroche_en', e.accroche_en,
    'sponsor', jsonb_build_object(
      'id', s.id,
      'nom', s.nom,
      'logo_url', s.logo_url,
      'site_url', s.site_url,
      'description_fr', s.description_fr,
      'description_en', s.description_en
    )
  )), '[]'::jsonb)
  from public.sponsor_emplacements e
  join public.sponsors s on s.id = e.sponsor_id
  where s.actif and e.actif
    and (s.date_debut is null or s.date_debut <= current_date)
    and (s.date_fin is null or s.date_fin >= current_date);
$$;
grant execute on function public.sponsors_publics() to anon, authenticated;
