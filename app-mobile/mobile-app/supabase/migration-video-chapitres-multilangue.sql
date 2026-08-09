-- Passage de heros.video_chapitres du format FR/EN fixe (colonnes
-- video_url_fr/video_url_en dans chaque élément du tableau jsonb) à un
-- format multi-langues arbitraire (une map "videos" code langue -> URL),
-- demande de Yannick le 2026-08-09 : le back-office ne doit plus être limité
-- à 2 langues pour la vidéo par chapitre. Voir backoffice/lib/langues.ts
-- (LANGUES_VIDEO) pour la liste des langues configurées côté back-office —
-- ajouter une langue plus tard n'exige AUCUNE nouvelle migration, juste une
-- entrée dans cette liste + les fichiers vidéo réels.
--
-- ⚠️ ORDRE DE DÉPLOIEMENT IMPORTANT (schéma déjà utilisé par une app mobile
-- avec de vrais utilisateurs) :
--   1. Déployer le nouveau build de l'app mobile et du back-office AVANT ou
--      EN MÊME TEMPS que cette migration. Le code des deux (déjà à jour dans
--      ce commit) sait lire indifféremment l'ancien format
--      (video_url_fr/video_url_en) et le nouveau (videos), donc l'ordre
--      exact n'est pas bloquant — mais tant que cette migration n'a pas
--      tourné, seul l'ancien format existe réellement en base, ce qui reste
--      strictement équivalent au comportement actuel (rien ne casse si tu
--      exécutes ce fichier plus tard).
--   2. Exécuter ce fichier (idempotent — sûr à rejouer).
--   3. Une fois confirmé que tout fonctionne, tu peux (optionnel, pas fait
--      ici) retirer le repli "ancien format" dans
--      mobile-app/src/data/heroesRepository.ts (normalizeVideoChapitre) —
--      aucune urgence, ce repli ne coûte rien à garder.
--
-- ⚠️ DÉPEND de schema-engagement-detail.sql (table
-- hero_video_chapter_engagement) : exécute-le d'abord s'il ne l'a pas encore
-- été.

-- 1) Transforme les données existantes de heros.video_chapitres.
--    Idempotent : un élément déjà au nouveau format (pas de video_url_fr/en)
--    traverse la transformation sans changement, `videos` existant est
--    préservé et complété si besoin.
update public.heros
set video_chapitres = (
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'numero', elem->'numero',
      'titre_chapitre', elem->'titre_chapitre',
      'videos',
        coalesce(elem->'videos', '{}'::jsonb)
        || (case when elem ? 'video_url_fr' and elem->>'video_url_fr' is not null
                  then jsonb_build_object('fr', elem->'video_url_fr') else '{}'::jsonb end)
        || (case when elem ? 'video_url_en' and elem->>'video_url_en' is not null
                  then jsonb_build_object('en', elem->'video_url_en') else '{}'::jsonb end)
    )
  ), '[]'::jsonb)
  from jsonb_array_elements(video_chapitres) as elem
)
where video_chapitres is not null
  and jsonb_typeof(video_chapitres) = 'array'
  and jsonb_array_length(video_chapitres) > 0;

-- 2) Relâche la contrainte de langue de hero_video_chapter_engagement :
--    n'importe quel code de langue configuré (pas seulement fr/en), même
--    format que les codes ISO 639-1/639-2 courts utilisés par LANGUES_VIDEO.
alter table public.hero_video_chapter_engagement
  drop constraint if exists hero_video_chapter_engagement_langue_check;
alter table public.hero_video_chapter_engagement
  add constraint hero_video_chapter_engagement_langue_check check (langue ~ '^[a-z]{2,3}$');

-- 3) increment_video_chapter_engagement : même relâchement de la validation
--    (auparavant `p_langue not in ('fr', 'en')`).
create or replace function public.increment_video_chapter_engagement(p_hero_id uuid, p_chapitre integer, p_langue text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_langue !~ '^[a-z]{2,3}$' then
    raise exception 'langue invalide: %', p_langue;
  end if;
  if p_chapitre is null or p_chapitre < 1 then
    raise exception 'numero de chapitre invalide: %', p_chapitre;
  end if;

  insert into public.hero_video_chapter_engagement (hero_id, chapitre_numero, langue, visionnages)
  values (p_hero_id, p_chapitre, p_langue, 1)
  on conflict (hero_id, chapitre_numero, langue) do update set
    visionnages = hero_video_chapter_engagement.visionnages + 1,
    updated_at = now();
end;
$$;

grant execute on function public.increment_video_chapter_engagement(uuid, integer, text) to anon, authenticated;

-- Note : increment_audio_engagement (narration audio, colonnes fixes
-- narration_audio_fr_url/narration_audio_en_url sur heros) N'EST PAS touché
-- par cette migration — seule la vidéo par chapitre passe en multi-langues
-- pour l'instant. Étendre l'audio à plusieurs langues est une décision
-- séparée (touche le schéma de heros elle-même, pas juste video_chapitres),
-- pas prise ici.
