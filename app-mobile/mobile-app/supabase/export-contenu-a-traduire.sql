-- =====================================================================
-- AFROBACK · Export du contenu français à traduire en anglais (2026-10-07)
--
-- Lecture seule : ne modifie rien. À exécuter dans Supabase > SQL Editor,
-- puis « Export » > « Download CSV » et déposer le fichier dans
-- context/import/ (nom libre). Une ligne par contenu, colonne `donnees` =
-- les champs français à traduire, et ce qui existe déjà en anglais.
-- =====================================================================

select 'heros' as type, slug, jsonb_build_object(
  'nom_affiche', nom_affiche, 'sous_titre', sous_titre, 'epoque', epoque, 'region', region,
  'resume_catalogue', resume_catalogue, 'avertissement_lecture', avertissement_lecture,
  'frise_chronologique', frise_chronologique, 'citations', citations, 'legendes_associees', legendes_associees,
  'recit_chapitres_fr', recit_chapitres_fr, 'recit_chapitres_en', recit_chapitres_en,
  'chapitres_video_titres', (select jsonb_agg(jsonb_build_object('numero', c->'numero', 'titre', c->'titre_chapitre')) from jsonb_array_elements(coalesce(video_chapitres, '[]'::jsonb)) c)
) as donnees
from public.heros
where coalesce(statut_publication, 'publie') <> 'depublie'

union all
select 'mythe', slug, jsonb_build_object(
  'titre', titre, 'sous_titre', sous_titre, 'peuple', peuple, 'region', region, 'zone', zone, 'epoque', epoque, 'theme', theme,
  'recit_chapitres_fr', recit_chapitres_fr, 'recit_chapitres_en', recit_chapitres_en
)
from public.mythes
where coalesce(statut_publication, 'publie') <> 'depublie'

union all
select 'decouverte', slug, jsonb_build_object(
  'titre', titre, 'sous_titre', sous_titre, 'pays', pays, 'region_ethnie', region_ethnie, 'resume_liste', resume_liste,
  'contenu_fr_texte', contenu_fr_texte, 'contenu_en_texte', contenu_en_texte, 'statut_fait_legende', statut_fait_legende
)
from public.decouverte_items
where coalesce(statut_publication, 'publie') <> 'depublie'

union all
select 'pays', slug, jsonb_build_object('nom', nom, 'resume', resume) from public.decouverte_pays

union all
select 'niveau', niveau::text, jsonb_build_object('nom', nom, 'tranche_age', tranche_age) from public.ecole_niveaux

order by 1, 2;
