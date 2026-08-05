#!/usr/bin/env node
/**
 * Génère un script SQL (schéma + seed) pour le pilier Mythologie, à coller
 * dans l'éditeur SQL de Supabase, sur le modèle de generate-decouverte-seed.mjs.
 *
 * Schéma : voir livrables/sites-web/afroback/app-mobile/data-model-mythologie.md
 *
 * Usage : node scripts/generate-mythologie-seed.mjs <in.json> <out.sql>
 * (par défaut : src/data/mythologie.generated.json → supabase/schema-mythologie.sql)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const [, , inPathArg, outPathArg] = process.argv;
const inPath = inPathArg || join(__dirname, '..', 'src', 'data', 'mythologie.generated.json');
const outPath = outPathArg || join(__dirname, '..', 'supabase', 'schema-mythologie.sql');

const items = JSON.parse(readFileSync(inPath, 'utf8'));

function sqlString(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlTextArray(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::text[]';
  return `ARRAY[${arr.map((v) => sqlString(v)).join(', ')}]::text[]`;
}

function sqlJsonb(value) {
  const json = JSON.stringify(value ?? []);
  return `'${json.replace(/'/g, "''")}'::jsonb`;
}

const schema = `
-- AFROBACK Mobile — schéma Postgres pour le pilier Mythologie
-- Généré le ${new Date().toISOString().slice(0, 10)} à partir de
-- livrables/sites-web/afroback/app-mobile/data-model-mythologie.md
--
-- Contenu éditorial public (comme heros/decouverte_items) : lecture publique,
-- écriture réservée à service_role. image_url est renseigné pour les 5
-- mythes depuis le 2026-08-05 (photos retrouvées dans le dossier local
-- "AFROBACK CONTENT/Photos" de Yannick, à uploader manuellement dans le
-- bucket heroes-media/images/mythologie/ avant que ces URLs ne répondent
-- réellement). narration_audio_url reste NULL, aucune narration produite
-- à ce jour : l'app affiche un état "bientôt disponible" pour ce format.

create extension if not exists pgcrypto;

create table if not exists public.mythes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titre text not null,
  sous_titre text not null,
  peuple text not null,
  region text not null,
  zone text not null,
  epoque text not null,
  type_contenu text not null,
  theme text not null,
  recit_chapitres_fr jsonb not null default '[]',
  sources text[] not null default '{}',
  couleur text not null default '#E9BE77',
  image_url text,
  narration_audio_url text,
  ordre_affichage integer not null default 0,
  fichier_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mythes enable row level security;

drop policy if exists "Public read access" on public.mythes;
create policy "Public read access" on public.mythes
  for select
  using (true);

-- Écriture réservée au rôle service_role (dashboard / futur back-office),
-- jamais au rôle anon utilisé par l'app mobile.

truncate table public.mythes;
`.trimStart();

const cols = [
  'slug',
  'titre',
  'sous_titre',
  'peuple',
  'region',
  'zone',
  'epoque',
  'type_contenu',
  'theme',
  'recit_chapitres_fr',
  'sources',
  'couleur',
  'image_url',
  'narration_audio_url',
  'ordre_affichage',
  'fichier_source',
];

const inserts = items
  .map((it) => {
    const values = [
      sqlString(it.slug),
      sqlString(it.titre),
      sqlString(it.sous_titre),
      sqlString(it.peuple),
      sqlString(it.region),
      sqlString(it.zone),
      sqlString(it.epoque),
      sqlString(it.type_contenu),
      sqlString(it.theme),
      sqlJsonb(it.recit_chapitres_fr),
      sqlTextArray(it.sources),
      sqlString(it.couleur),
      sqlString(it.image_url),
      sqlString(it.narration_audio_url),
      String(it.ordre_affichage),
      sqlString(it.fichier_source),
    ];
    return `insert into public.mythes (${cols.join(', ')}) values (\n  ${values.join(',\n  ')}\n);`;
  })
  .join('\n\n');

writeFileSync(outPath, schema + '\n' + inserts + '\n', 'utf8');
console.log('OK — SQL écrit dans', outPath, `(${items.length} mythes)`);
