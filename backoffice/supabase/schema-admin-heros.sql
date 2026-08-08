-- AFROBACK Back-office — schéma d'administration, lot 1
-- Généré le 2026-08-05, à exécuter dans le SQL Editor du dashboard Supabase
-- (même projet Supabase que l'app mobile, ref ygkyapryramhaskfbrrt — un seul
-- back-end pour les deux apps).
--
-- Ce script ajoute uniquement ce qui manquait pour que le back-office lot 1
-- (Connexion, Tableau de bord, Héros, Bibliothèque médias) fonctionne avec
-- de vraies données :
-- 1. Deux colonnes sur `heros` (publication, mise à la une) qui n'existaient
--    pas encore — leur absence était déjà notée dans
--    context/AFROBACK.md ("le champ mettre en avant n'existe pas encore").
-- 2. Une table `admin_users` : liste des comptes autorisés à se connecter au
--    back-office. Volontairement séparée de `auth.users` de l'app mobile
--    (téléphone) — un compte back-office est un compte email/mot de passe
--    Supabase Auth distinct, dont l'email doit ensuite apparaître ici pour
--    obtenir un accès réel. Un seul rôle existe à ce jour ('admin_complet') :
--    pas de système de rôles multiples tant que Yannick n'a pas tranché
--    "qui d'autre aura accès" (question encore ouverte, voir
--    prompt-claude-design-backoffice.md).
-- 3. Une table `admin_activity_log` : traçabilité des actions d'administration.
--
-- IMPORTANT — accès : RLS activée sur les 2 nouvelles tables SANS AUCUNE
-- policy. Ni `anon` ni `authenticated` (donc ni l'app mobile, ni un compte
-- utilisateur classique) ne peuvent lire ou écrire dedans. Seule la clé
-- `service_role` (utilisée uniquement côté serveur du back-office Next.js,
-- jamais exposée au navigateur) peut les interroger — elle contourne RLS par
-- construction chez Supabase. C'est volontaire et suffisant ici : pas besoin
-- d'écrire une policy qui ne servirait jamais.

create extension if not exists pgcrypto;

-- 1. Colonnes de publication / mise en avant sur heros -----------------------
-- Défauts choisis pour NE RIEN CHANGER au comportement actuel de l'app tant
-- que personne n'a touché au back-office : tous les héros existants
-- deviennent 'publie' (comportement identique à aujourd'hui, où l'app affiche
-- tous les héros sans filtre), et aucun n'est "à la une" au sens de ce
-- nouveau champ (l'app continue d'utiliser la rotation automatique du jour
-- tant qu'aucun héros n'est explicitement mis à la une — voir le changement
-- correspondant dans mobile-app/src/data/heroesRepository.ts et
-- src/profils/heroDuJour.ts... non, app/(tabs)/accueil/index.tsx).
alter table public.heros
  add column if not exists statut_publication text not null default 'publie'
    check (statut_publication in ('publie', 'depublie'));

alter table public.heros
  add column if not exists a_la_une boolean not null default false;

-- 2. Comptes autorisés à administrer AFROBACK --------------------------------
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  -- Doit correspondre à l'email d'un compte Supabase Auth (email/mot de
  -- passe) créé séparément par Yannick via le dashboard Supabase
  -- (Authentication > Users > Add user). Ce script ne crée aucun compte
  -- auth — voir backoffice/README.md, section "Mise en service".
  email text unique not null,
  nom text not null,
  role text not null default 'admin_complet' check (role in ('admin_complet')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Aucune policy : lecture/écriture réservées à service_role (voir note en tête de fichier).

-- 3. Journal d'activité back-office ------------------------------------------
create table if not exists public.admin_activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_activity_log enable row level security;
-- Aucune policy : lecture/écriture réservées à service_role.

-- ============================================================================
-- À exécuter par Yannick APRÈS ce script (pas automatisable depuis ce
-- workspace — nécessite le dashboard Supabase) :
--
-- 1. Authentication > Providers > vérifier que "Email" est activé (devrait
--    l'être par défaut ; "Phone" a déjà été activé séparément pour l'app
--    mobile, les deux coexistent sans conflit sur le même projet Supabase).
-- 2. Authentication > Users > Add user > créer un compte email + mot de passe
--    pour toi (ex. yannick@afroback.co ou ton email réel).
-- 3. Revenir dans le SQL Editor et exécuter, en remplaçant l'email :
--
--    insert into public.admin_users (email, nom, role)
--    values ('TON_EMAIL_ICI', 'Yannick', 'admin_complet');
--
-- Sans ces 3 étapes, la connexion au back-office reste impossible (c'est
-- volontaire : accès nominal, jamais un compte générique).
-- ============================================================================
