#!/usr/bin/env node
/**
 * Génère un script SQL (schéma + seed des 9 héros) à coller dans l'éditeur
 * SQL de Supabase (Dashboard → SQL Editor → New query → Run).
 *
 * Usage : node scripts/generate-supabase-seed.mjs <chemin-json-export> <chemin-sortie.sql>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error('Usage: node scripts/generate-supabase-seed.mjs <in.json> <out.sql>');
  process.exit(1);
}

const heroes = JSON.parse(readFileSync(inPath, 'utf8'));

function sqlString(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlTextArray(arr) {
  if (!arr || arr.length === 0) return "ARRAY[]::text[]";
  return `ARRAY[${arr.map((v) => sqlString(v)).join(', ')}]::text[]`;
}

function sqlJsonb(value) {
  const json = JSON.stringify(value ?? []);
  return `'${json.replace(/'/g, "''")}'::jsonb`;
}

/** Comme sqlJsonb, mais préserve `null` (ex. recit_chapitres_en pour un héros sans version EN) au lieu de le remplacer par un tableau vide. */
function sqlJsonbNullable(value) {
  if (value === null || value === undefined) return 'null';
  return sqlJsonb(value);
}

const schema = `
-- AFROBACK Mobile — schéma Postgres pour le pilier Histoires & Héros
-- Généré le ${new Date().toISOString().slice(0, 10)} à partir de
-- livrables/sites-web/afroback/app-mobile/data-model-heros.md

create extension if not exists pgcrypto;

create table if not exists public.heros (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nom_affiche text not null,
  nom_complet text not null,
  sous_titre text not null,
  epoque text not null,
  region text not null,
  theme text[] not null default '{}',
  resume_catalogue text not null,
  annee_naissance_indicative text,
  annee_mort_indicative text,
  recit_fr_texte text not null,
  recit_fr_fichier_source text not null,
  recit_chapitres_fr jsonb not null default '[]',
  recit_en_texte text,
  recit_en_fichier_source text,
  recit_chapitres_en jsonb,
  frise_chronologique jsonb not null default '[]',
  citations jsonb not null default '[]',
  sources text[] not null default '{}',
  legendes_associees jsonb not null default '[]',
  heros_lies text[] not null default '{}',
  chapitres_storyboard jsonb not null default '[]',
  statut_recit_texte text not null default 'pret',
  statut_narration_audio text not null default 'a_produire',
  statut_video text not null default 'storyboard_pret',
  image_carte_catalogue text,
  narration_audio_fr_url text,
  narration_audio_en_url text,
  video_url text,
  video_chapitres jsonb not null default '[]',
  avertissement_lecture text,
  ordre_affichage integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Colonnes ajoutées le 2026-07-31 pour la pagination du lecteur par
-- chapitre (voir app/(tabs)/accueil/heros/[slug]/recit.tsx) — \`alter ... add column if not
-- exists\` plutôt que de compter sur \`create table if not exists\`, qui ne
-- touche pas une table déjà existante en production.
alter table public.heros add column if not exists recit_chapitres_fr jsonb not null default '[]';
alter table public.heros add column if not exists recit_chapitres_en jsonb;

-- Colonne ajoutée le 2026-07-31 pour les chapitres du documentaire
-- réellement tourné (distincts de chapitres_storyboard, l'avant-goût
-- dessiné) — voir app/(tabs)/accueil/heros/[slug]/video.tsx.
alter table public.heros add column if not exists video_chapitres jsonb not null default '[]';

alter table public.heros enable row level security;

drop policy if exists "Public read access" on public.heros;
create policy "Public read access" on public.heros
  for select
  using (true);

-- Écriture réservée au rôle service_role (dashboard / futur back-office),
-- jamais au rôle anon utilisé par l'app mobile.

truncate table public.heros;
`.trimStart();

const inserts = heroes
  .map((h) => {
    const cols = [
      'slug',
      'nom_affiche',
      'nom_complet',
      'sous_titre',
      'epoque',
      'region',
      'theme',
      'resume_catalogue',
      'annee_naissance_indicative',
      'annee_mort_indicative',
      'recit_fr_texte',
      'recit_fr_fichier_source',
      'recit_chapitres_fr',
      'recit_en_texte',
      'recit_en_fichier_source',
      'recit_chapitres_en',
      'frise_chronologique',
      'citations',
      'sources',
      'legendes_associees',
      'heros_lies',
      'chapitres_storyboard',
      'statut_recit_texte',
      'statut_narration_audio',
      'statut_video',
      'image_carte_catalogue',
      'narration_audio_fr_url',
      'narration_audio_en_url',
      'video_url',
      'video_chapitres',
      'avertissement_lecture',
      'ordre_affichage',
    ];
    const values = [
      sqlString(h.slug),
      sqlString(h.nom_affiche),
      sqlString(h.nom_complet),
      sqlString(h.sous_titre),
      sqlString(h.epoque),
      sqlString(h.region),
      sqlTextArray(h.theme),
      sqlString(h.resume_catalogue),
      sqlString(h.annee_naissance_indicative),
      sqlString(h.annee_mort_indicative),
      sqlString(h.recit_fr_texte),
      sqlString(h.recit_fr_fichier_source),
      sqlJsonb(h.recit_chapitres_fr),
      sqlString(h.recit_en_texte),
      sqlString(h.recit_en_fichier_source),
      sqlJsonbNullable(h.recit_chapitres_en),
      sqlJsonb(h.frise_chronologique),
      sqlJsonb(h.citations),
      sqlTextArray(h.sources),
      sqlJsonb(h.legendes_associees),
      sqlTextArray(h.heros_lies),
      sqlJsonb(h.chapitres_storyboard),
      sqlString(h.statut_recit_texte),
      sqlString(h.statut_narration_audio),
      sqlString(h.statut_video),
      sqlString(h.image_carte_catalogue),
      sqlString(h.narration_audio_fr_url),
      sqlString(h.narration_audio_en_url),
      sqlString(h.video_url),
      sqlJsonb(h.video_chapitres),
      sqlString(h.avertissement_lecture),
      String(h.ordre_affichage),
    ];
    return `insert into public.heros (${cols.join(', ')}) values (\n  ${values.join(',\n  ')}\n);`;
  })
  .join('\n\n');

writeFileSync(outPath, schema + '\n' + inserts + '\n', 'utf8');
console.log('OK — SQL écrit dans', outPath, `(${heroes.length} héros)`);
