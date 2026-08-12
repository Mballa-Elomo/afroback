-- AFROBACK Back-office — RPC de lecture combinée pour la fiche héros
-- Généré le 2026-08-12, à exécuter dans le SQL Editor du dashboard Supabase.
--
-- Contexte : Yannick a signalé une lenteur réelle sur /heros/[slug] (jusqu'à
-- 2,3s mesurés). Diagnostic fait avec une instrumentation temporaire
-- (lib/timing.ts, retirée après ce chantier) : le chargement enchaînait 2
-- allers-retours réseau SÉQUENTIELS vers Supabase (lecture du héros, puis
-- lecture des 3 compteurs d'engagement une fois l'id du héros connu) — un
-- aller-retour réel prend entre 300ms et 1100ms selon les mesures, donc les
-- additionner coûtait cher. Cette fonction fusionne les deux étapes en UNE
-- seule requête PostgREST (`rpc(...)`) exécutée entièrement côté base, avec
-- le calcul des 3 compteurs fait par la base plutôt que par 2 requêtes
-- séparées depuis Next.js.
--
-- Ne remplace PAS la vérification admin (`admin_users`, lib/auth.ts) : ce
-- contrôle reste une étape distincte dans le layout Next.js, pas fusionnable
-- ici sans restructurer l'authentification du back-office (hors périmètre
-- de ce correctif de performance).

create or replace function public.admin_get_hero_detail(p_slug text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'hero', to_jsonb(h.*),
    'engagement', jsonb_build_object(
      'lectures_recit', coalesce(e.lectures_recit, 0),
      'ecoutes_audio', coalesce(e.ecoutes_audio, 0),
      'visionnages_video', coalesce(e.visionnages_video, 0),
      'ecoutes_audio_fr', coalesce(e.ecoutes_audio_fr, 0),
      'ecoutes_audio_en', coalesce(e.ecoutes_audio_en, 0)
    ),
    'video_chapter_engagement', coalesce(
      (
        select jsonb_agg(jsonb_build_object(
          'chapitre_numero', v.chapitre_numero,
          'langue', v.langue,
          'visionnages', v.visionnages
        ))
        from public.hero_video_chapter_engagement v
        where v.hero_id = h.id
      ),
      '[]'::jsonb
    )
  )
  from public.heros h
  left join public.hero_engagement e on e.hero_id = h.id
  where h.slug = p_slug;
$$;

-- Cohérent avec le reste du projet (schema-admin-heros.sql) : seule
-- service_role appelle cette fonction (client back-office Next.js), jamais
-- anon/authenticated. `security invoker` (comportement par défaut) suffit
-- puisque service_role contourne déjà RLS par construction.
grant execute on function public.admin_get_hero_detail(text) to service_role;
