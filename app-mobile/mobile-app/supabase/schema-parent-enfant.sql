-- AFROBACK Mobile — schéma Postgres pour le module Parent/Enfant
-- Généré le 2026-07-31, à exécuter dans le SQL Editor du dashboard Supabase.
--
-- Mécanique confirmée par Yannick (façon Netflix) : un seul compte
-- (auth.users, téléphone + mot de passe), plusieurs profils dedans — un
-- profil adulte implicite + des profils enfants explicites. L'enfant ne se
-- connecte jamais lui-même : pas de ligne dans auth.users, pas de mot de
-- passe séparé, pas de session Supabase distincte. Toutes les tables
-- ci-dessous sont donc scopées par `parent_user_id = auth.uid()` — c'est
-- toujours le PARENT authentifié qui agit, l'app bascule juste d'apparence.
--
-- Pas de logique de tarification par enfant ici (décision de Yannick,
-- 2026-07-31) : l'ajout d'un profil enfant est gratuit et sans friction de
-- paiement en V1, comme les commissions Marketplace laissées "pas encore
-- configurées". Aucune colonne de prix/forfait dans child_profiles.

create extension if not exists pgcrypto;

-- Profils enfants ---------------------------------------------------------
create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  prenom text not null,
  age integer not null check (age >= 0 and age <= 17),
  -- Pas de photo uploadée : 4 couleurs d'avatar fixes, fidèles à la maquette
  -- (ONBOARDING · PROFILS ENFANTS, 4 pastilles dégradées). Voir
  -- src/profils/enfantPalette.ts pour le mapping couleur → dégradé réel.
  avatar_couleur text not null default 'terracotta'
    check (avatar_couleur in ('terracotta', 'bleu', 'violet', 'or')),
  -- Sous-ensemble de {ewondo, douala, bassa, bamileke}. Stocké comme vraie
  -- préférence parent (donnée réelle), mais non consommé par aucune leçon
  -- réelle à ce jour : le pilier "apprentissage des langues" est bloqué
  -- (traductions insuffisantes, voir context/AFROBACK.md). Ne pas construire
  -- de logique dessus tant qu'aucun contenu de leçon n'existe.
  langues_actives text[] not null default '{}',
  decouverte_activee boolean not null default true,
  -- V1 informative seulement (décision par défaut du chef de projet,
  -- Yannick n'a pas tranché explicitement — voir context/AFROBACK.md) :
  -- affichée au parent, jamais utilisée pour verrouiller l'app.
  limite_ecran_minutes integer check (limite_ecran_minutes is null or limite_ecran_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.child_profiles enable row level security;
drop policy if exists "Parent full access to own children" on public.child_profiles;
create policy "Parent full access to own children" on public.child_profiles
  for all
  using (parent_user_id = auth.uid())
  with check (parent_user_id = auth.uid());

-- Réglages parent (code PIN) ------------------------------------------------
create table if not exists public.parent_settings (
  parent_user_id uuid primary key references auth.users(id) on delete cascade,
  -- Code à 4 chiffres, décision PAR DÉFAUT du chef de projet (Yannick n'a
  -- pas explicitement tranché ce point, voir context/AFROBACK.md) :
  -- demandé uniquement pour (a) revenir au profil adulte depuis un profil
  -- enfant, (b) entrer dans l'Espace Parent — jamais pour choisir un profil
  -- enfant depuis le sélecteur. Stocké en clair volontairement : c'est un
  -- verrou anti-enfant local (empêcher un enfant de 8 ans de revenir seul
  -- à l'espace adulte), pas un secret de sécurité informatique au sens where
  -- un hash serait attendu — comparable au code parental d'une télécommande
  -- de TV, pas à un mot de passe de compte.
  pin_code text check (pin_code is null or pin_code ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.parent_settings enable row level security;
drop policy if exists "Parent full access to own settings" on public.parent_settings;
create policy "Parent full access to own settings" on public.parent_settings
  for all
  using (parent_user_id = auth.uid())
  with check (parent_user_id = auth.uid());

-- Sessions enfant (temps réellement suivi, pour l'Espace Parent) ----------
create table if not exists public.child_sessions (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.child_profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  -- Calculé côté client à la fermeture de session (Date.now() - début) et
  -- envoyé en une seule fois : simplification assumée, une fermeture brutale
  -- de l'app (kill process) ne clôt pas la session, elle reste "ouverte"
  -- (ended_at/duree_secondes null) et n'est pas comptée dans les stats du
  -- jour. Pas de tâche de fond pour la fiabiliser en V1 — voir README.
  duree_secondes integer,
  created_at timestamptz not null default now()
);

alter table public.child_sessions enable row level security;
drop policy if exists "Parent full access to own children sessions" on public.child_sessions;
create policy "Parent full access to own children sessions" on public.child_sessions
  for all
  using (
    child_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  )
  with check (
    child_id in (select id from public.child_profiles where parent_user_id = auth.uid())
  );

-- Note RLS : contrairement au bug corrigé le 2026-07-31 sur
-- marketplace_products (sous-requête vers une table protégée par RLS,
-- invisible pour un lecteur "public"), ici la sous-requête ci-dessus est
-- sans risque : il n'existe aucun accès "public/anon" à ces tables, seul le
-- parent authentifié (auth.uid()) les interroge jamais, sur ses propres
-- lignes des deux côtés de la sous-requête.
