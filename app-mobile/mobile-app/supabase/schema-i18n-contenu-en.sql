-- =====================================================================
-- AFROBACK · Contenu en anglais (décision de Yannick du 2026-10-06 :
-- « traduis totalement AFROBACK en français et en anglais, dans le site
-- et dans l'application »).
--
-- À exécuter UNE fois dans Supabase > SQL Editor.
--
-- Principe : chaque champ de texte affiché reçoit son jumeau « _en ». Les
-- colonnes françaises ne changent pas. Une colonne _en vide = l'app et le
-- site affichent le français (repli automatique), donc rien ne casse avant
-- que les traductions soient chargées. Les textes longs avaient déjà leur
-- version anglaise prévue (recit_en_texte, recit_chapitres_en,
-- contenu_en_texte) : ils ne sont pas recréés ici.
--
-- Les fonctions get_*_detail renvoient la ligne entière (to_jsonb) : les
-- nouvelles colonnes y apparaissent sans modifier ces fonctions.
-- =====================================================================

alter table public.heros
  add column if not exists nom_affiche_en text,
  add column if not exists sous_titre_en text,
  add column if not exists epoque_en text,
  add column if not exists region_en text,
  add column if not exists resume_catalogue_en text,
  add column if not exists avertissement_lecture_en text,
  add column if not exists frise_chronologique_en jsonb,
  add column if not exists citations_en jsonb,
  add column if not exists legendes_associees_en jsonb;

alter table public.mythes
  add column if not exists titre_en text,
  add column if not exists sous_titre_en text,
  add column if not exists peuple_en text,
  add column if not exists region_en text,
  add column if not exists zone_en text,
  add column if not exists epoque_en text,
  add column if not exists theme_en text;

alter table public.decouverte_items
  add column if not exists titre_en text,
  add column if not exists sous_titre_en text,
  add column if not exists pays_en text,
  add column if not exists region_ethnie_en text,
  add column if not exists resume_liste_en text,
  add column if not exists statut_fait_legende_en jsonb;

alter table public.decouverte_pays
  add column if not exists nom_en text,
  add column if not exists resume_en text;

alter table public.ecole_niveaux
  add column if not exists nom_en text,
  add column if not exists tranche_age_en text;

-- Les colonnes des cartes du catalogue sont lisibles par tous (comme leurs
-- jumelles françaises, voir schema-acces-abonnement.sql). Le contenu long
-- reste servi uniquement par get_*_detail, qui garde les contenus réservés.
grant select (nom_affiche_en, sous_titre_en, epoque_en, region_en, resume_catalogue_en) on public.heros to anon, authenticated;
grant select (titre_en, sous_titre_en, peuple_en, region_en, zone_en, epoque_en, theme_en) on public.mythes to anon, authenticated;
grant select (titre_en, sous_titre_en, pays_en, region_ethnie_en, resume_liste_en) on public.decouverte_items to anon, authenticated;

-- Contrôle : doit renvoyer 26 lignes.
select table_name, column_name
from information_schema.columns
where table_schema = 'public'
  and table_name in ('heros', 'mythes', 'decouverte_items', 'decouverte_pays', 'ecole_niveaux')
  and column_name in (
    'nom_affiche_en', 'sous_titre_en', 'epoque_en', 'region_en', 'resume_catalogue_en', 'avertissement_lecture_en',
    'frise_chronologique_en', 'citations_en', 'legendes_associees_en', 'titre_en', 'peuple_en',
    'zone_en', 'theme_en', 'pays_en', 'region_ethnie_en', 'resume_liste_en', 'statut_fait_legende_en',
    'nom_en', 'resume_en', 'tranche_age_en'
  )
order by table_name, column_name;
