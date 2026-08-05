-- AFROBACK Mobile — schéma Postgres pour le module « École des Héros »
-- (mode enfant, voir livrables/sites-web/afroback/prompt-claude-design-ecole-heros.md)
-- Généré le 2026-08-05, à exécuter dans le SQL Editor du dashboard Supabase.
--
-- Voir app-mobile/data-model-ecole-heros.md pour le détail des choix.
-- Rappel important : ce script crée uniquement la structure. Aucune leçon,
-- aucune question de quiz, aucune ligne de ecole_niveaux n'est insérée ici
-- — le contenu (texte adapté, narration enfant, vidéo, BD) n'est pas encore
-- produit et le mapping héros → niveau n'est pas validé par Yannick. Ne pas
-- peupler ces tables avec du contenu inventé.

create extension if not exists pgcrypto;

-- Référentiel des 4 niveaux scolaires ---------------------------------------
-- Métadonnées d'affichage uniquement (nom, tranche d'âge, ton). Le mapping
-- proposé dans le prompt de design (Niveau 1 = Sultan Njoya + Manu Dibango,
-- etc.) est une hypothèse non validée : cette table est créée vide.
create table if not exists public.ecole_niveaux (
  niveau integer primary key check (niveau between 1 and 4),
  nom text not null,
  tranche_age text not null,
  ton_contenu text not null,
  created_at timestamptz not null default now()
);

alter table public.ecole_niveaux enable row level security;
drop policy if exists "Public read ecole_niveaux" on public.ecole_niveaux;
create policy "Public read ecole_niveaux" on public.ecole_niveaux
  for select
  using (true);

-- Leçons : un héros à un niveau donné ---------------------------------------
-- Chaque champ de format est nullable par construction : la disponibilité
-- partielle (ex. texte prêt, audio pas encore produit) est le cas normal,
-- pas une exception. L'app doit afficher un état "bientôt disponible" par
-- onglet de format manquant, jamais un lecteur vide qui semble cassé.
create table if not exists public.ecole_lecons (
  id uuid primary key default gen_random_uuid(),
  heros_id uuid not null references public.heros(id) on delete cascade,
  niveau integer not null check (niveau between 1 and 4),
  ordre_dans_niveau integer not null default 0,
  -- Texte réécrit et adapté au niveau. JAMAIS le récit adulte intégral
  -- (heros.recit_*) réutilisé tel quel — contrainte produit explicite.
  texte_adapte text,
  narration_audio_url text,
  video_url text,
  -- Tableau de planches : [{ image_url, texte, ordre }, ...]. Réutilise la
  -- structure narrative des storyboards déjà écrits par l'agent griot
  -- (Récits africains storyboards/), mais avec de vraies images à produire —
  -- aucune image n'existe nulle part dans le projet à ce jour.
  bd_planches jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (heros_id, niveau)
);

alter table public.ecole_lecons enable row level security;
drop policy if exists "Public read ecole_lecons" on public.ecole_lecons;
create policy "Public read ecole_lecons" on public.ecole_lecons
  for select
  using (true);

-- Questions du quiz de fin de leçon -----------------------------------------
create table if not exists public.ecole_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  lecon_id uuid not null references public.ecole_lecons(id) on delete cascade,
  question text not null,
  choix jsonb not null, -- tableau de libellés, ex. ["Foumban", "Douala", "Yaoundé"]
  reponse_correcte_index integer not null check (reponse_correcte_index >= 0),
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ecole_quiz_questions enable row level security;
drop policy if exists "Public read ecole_quiz_questions" on public.ecole_quiz_questions;
create policy "Public read ecole_quiz_questions" on public.ecole_quiz_questions
  for select
  using (true);

-- Questions du quiz récapitulatif de fin de niveau --------------------------
create table if not exists public.ecole_quiz_niveau (
  id uuid primary key default gen_random_uuid(),
  niveau integer not null check (niveau between 1 and 4),
  question text not null,
  choix jsonb not null,
  reponse_correcte_index integer not null check (reponse_correcte_index >= 0),
  ordre integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ecole_quiz_niveau enable row level security;
drop policy if exists "Public read ecole_quiz_niveau" on public.ecole_quiz_niveau;
create policy "Public read ecole_quiz_niveau" on public.ecole_quiz_niveau
  for select
  using (true);

-- Progression de niveau par enfant ------------------------------------------
create table if not exists public.enfant_ecole_progression (
  child_id uuid primary key references public.child_profiles(id) on delete cascade,
  niveau_actuel integer not null default 1 check (niveau_actuel between 1 and 4),
  updated_at timestamptz not null default now()
);

alter table public.enfant_ecole_progression enable row level security;
drop policy if exists "Parent full access to own children ecole progression" on public.enfant_ecole_progression;
create policy "Parent full access to own children ecole progression" on public.enfant_ecole_progression
  for all
  using (
    child_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  )
  with check (
    child_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  );

-- Résultats par leçon et par enfant ------------------------------------------
create table if not exists public.enfant_lecon_resultats (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  lecon_id uuid not null references public.ecole_lecons(id) on delete cascade,
  statut text not null default 'verrouille'
    check (statut in ('verrouille', 'disponible', 'en_cours', 'termine')),
  meilleur_score integer,
  tentatives integer not null default 0,
  dernier_resultat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, lecon_id)
);

alter table public.enfant_lecon_resultats enable row level security;
drop policy if exists "Parent full access to own children lecon resultats" on public.enfant_lecon_resultats;
create policy "Parent full access to own children lecon resultats" on public.enfant_lecon_resultats
  for all
  using (
    child_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  )
  with check (
    child_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  );

-- Résultats du quiz de fin de niveau par enfant ------------------------------
create table if not exists public.enfant_quiz_niveau_resultats (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  niveau integer not null check (niveau between 1 and 4),
  reussi boolean not null default false,
  score integer,
  date timestamptz not null default now(),
  unique (child_id, niveau)
);

alter table public.enfant_quiz_niveau_resultats enable row level security;
drop policy if exists "Parent full access to own children quiz niveau resultats" on public.enfant_quiz_niveau_resultats;
create policy "Parent full access to own children quiz niveau resultats" on public.enfant_quiz_niveau_resultats
  for all
  using (
    child_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  )
  with check (
    child_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  );

-- Note RLS : comme pour child_sessions dans schema-parent-enfant.sql, les
-- sous-requêtes ci-dessus sont sans risque — aucun accès public/anon n'existe
-- sur les tables enfant_*, seul le parent authentifié (auth.uid()) les
-- interroge, toujours sur ses propres profils enfants des deux côtés.

-- ============================================================================
-- Structure de départ (2026-08-05) — Yannick a validé d'étendre l'architecture
-- à plusieurs/tous les héros plutôt que de rester sur un pilote à 1 seul
-- héros (voir context/AFROBACK.md). Ce qui suit est STRUCTUREL uniquement :
-- les 4 niveaux (noms/tranches d'âge/ton, repris tels quels de la
-- proposition que Yannick a lui-même écrite dans
-- prompt-claude-design-ecole-heros.md) et le rattachement de chaque héros
-- réel du catalogue à un niveau (mapping proposé dans ce même prompt).
-- AUCUN CONTENU n'est inséré : texte_adapte, narration_audio_url, video_url
-- et bd_planches restent tous NULL/vides sur les 9 lignes ci-dessous. Tant
-- qu'aucun contenu réel n'existe, l'app affichera un état "pas encore
-- disponible" par format sur chaque héros — c'est le comportement honnête
-- attendu, pas un bug. Le mapping ci-dessous est une hypothèse : comme
-- aucun contenu n'y est attaché, le corriger plus tard ne coûte qu'un
-- UPDATE, jamais une réécriture de contenu produit.
-- ============================================================================

insert into public.ecole_niveaux (niveau, nom, tranche_age, ton_contenu) values
  (1, 'Les Premiers Récits', '3-5 ans', 'Quasi aucun texte, portrait + un fait marquant, tout en audio/image, ton conte'),
  (2, 'Petits Explorateurs', '6-8 ans', 'Phrases courtes et illustrées, un fait historique + un trait de caractère'),
  (3, 'Grands Explorateurs', '9-11 ans', 'Texte complet mais simplifié, plusieurs faits, premières nuances'),
  (4, 'Héritiers de l''Histoire', '12 ans et plus', 'Contenu proche du récit adulte, nuances assumées mais sans détail graphique')
on conflict (niveau) do nothing;

insert into public.ecole_lecons (heros_id, niveau, ordre_dans_niveau)
select h.id, v.niveau, v.ordre
from (values
  ('sultan-njoya', 1, 1),
  ('manu-dibango', 1, 2),
  ('reine-nzinga', 2, 1),
  ('sultan-njoya', 2, 2),
  ('martin-paul-samba', 3, 1),
  ('rudolf-douala-manga-bell', 3, 2),
  ('charles-atangana', 3, 3),
  ('ruben-um-nyobe', 4, 1),
  ('ernest-ouandie', 4, 2),
  ('felix-moumie', 4, 3)
) as v(slug, niveau, ordre)
join public.heros h on h.slug = v.slug
on conflict (heros_id, niveau) do nothing;
