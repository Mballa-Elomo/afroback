-- AFROBACK Mobile — schéma Postgres pour le module Don
-- Généré le 2026-08-05, à exécuter dans le SQL Editor du dashboard Supabase.
--
-- Version volontairement simplifiée (décision de Yannick, 2026-08-05, voir
-- context/AFROBACK.md) : une seule cause générique "Soutenir AFROBACK"
-- (finance le fonctionnement général de la plateforme), pas de causes par
-- héros/histoire. Pas de table `dons_causes` séparée : une seule colonne
-- `cause` avec une valeur constante, pour ne pas sur-construire une table
-- entière pour une seule ligne conceptuelle. Si Yannick valide un jour des
-- causes multiples, cette colonne suffit à absorber le changement sans
-- migration structurelle lourde.
--
-- Même règle que le checkout Marketplace : jamais un faux succès de
-- paiement. Une ligne est créée avec statut 'en_attente_paiement', le
-- paiement Mobile Money n'étant pas intégré à ce jour.
--
-- Volontairement absents (questions ouvertes, non résolues par ce schéma,
-- voir context/AFROBACK.md) :
-- - aucune colonne de reçu fiscal (statut juridique d'AFROBACK non tranché) ;
-- - aucun objectif chiffré / montant collecté agrégé (Yannick : "AFROBACK
--   est un vrai projet", pas de compteur tant qu'il n'affiche pas un vrai
--   chiffre) ;
-- - aucune colonne "confirmé par" (qui gère l'argent collecté n'est pas
--   décidé) — `statut` n'a pas de check constraint fermé, pour ne pas figer
--   un workflow de confirmation qui n'existe pas encore.

create extension if not exists pgcrypto;

create table if not exists public.dons (
  id uuid primary key default gen_random_uuid(),
  donateur_user_id uuid not null references auth.users(id) on delete cascade,
  montant_fcfa integer not null check (montant_fcfa > 0),
  cause text not null default 'soutenir_afroback',
  recurrent boolean not null default false,
  anonyme boolean not null default false,
  methode_paiement text not null check (methode_paiement in ('mtn_momo', 'orange_money')),
  statut text not null default 'en_attente_paiement',
  created_at timestamptz not null default now()
);

alter table public.dons enable row level security;

drop policy if exists "Donateur cree son don" on public.dons;
create policy "Donateur cree son don" on public.dons
  for insert
  with check (donateur_user_id = auth.uid());

drop policy if exists "Donateur voit ses dons" on public.dons;
create policy "Donateur voit ses dons" on public.dons
  for select
  using (donateur_user_id = auth.uid());

-- Pas de policy update/delete : un don enregistré n'est modifiable par
-- personne depuis l'app (intégrité d'un enregistrement financier), y compris
-- par le donateur lui-même. Une correction éventuelle passera par un futur
-- back-office administrateur, pas par l'app mobile.
