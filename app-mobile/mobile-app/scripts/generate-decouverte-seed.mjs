#!/usr/bin/env node
/**
 * Génère un script SQL (schéma + seed) pour le pilier Découverte, à coller
 * dans l'éditeur SQL de Supabase (Dashboard → SQL Editor → New query → Run),
 * sur le modèle de generate-supabase-seed.mjs (pilier Histoires & Héros).
 *
 * Schéma : voir livrables/sites-web/afroback/app-mobile/data-model-decouverte.md
 *
 * Usage : node scripts/generate-decouverte-seed.mjs <in.json> <out.sql>
 * (par défaut : src/data/decouverte.generated.json → supabase/seed-decouverte.sql)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const [, , inPathArg, outPathArg] = process.argv;
const inPath = inPathArg || join(__dirname, '..', 'src', 'data', 'decouverte.generated.json');
const outPath = outPathArg || join(__dirname, '..', 'supabase', 'seed-decouverte.sql');

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
-- AFROBACK Mobile — schéma Postgres pour le pilier Découverte
-- Généré le ${new Date().toISOString().slice(0, 10)} à partir de
-- livrables/sites-web/afroback/app-mobile/data-model-decouverte.md

create extension if not exists pgcrypto;

create table if not exists public.decouverte_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null check (type in ('village', 'coutume', 'objet', 'personnage', 'fait')),
  pays text not null,
  region_ethnie text not null,
  titre text not null,
  sous_titre text not null,
  resume_liste text not null,
  contenu_fr_texte text not null,
  contenu_en_texte text,
  statut_fait_legende jsonb not null default '[]',
  image_url text,
  sources text[] not null default '{}',
  heros_lies text[] not null default '{}',
  items_lies text[] not null default '{}',
  statut_contenu text not null default 'pret',
  ordre_affichage integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decouverte_pays (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nom text not null,
  resume text not null,
  ordre_affichage integer not null default 0
);

alter table public.decouverte_items enable row level security;
alter table public.decouverte_pays enable row level security;

drop policy if exists "Public read access" on public.decouverte_items;
create policy "Public read access" on public.decouverte_items
  for select
  using (true);

drop policy if exists "Public read access" on public.decouverte_pays;
create policy "Public read access" on public.decouverte_pays
  for select
  using (true);

-- Écriture réservée au rôle service_role (dashboard / futur back-office),
-- jamais au rôle anon utilisé par l'app mobile.

truncate table public.decouverte_items;
truncate table public.decouverte_pays;

insert into public.decouverte_pays (slug, nom, resume, ordre_affichage) values (
  'cameroun',
  'Cameroun',
  'Premier pays couvert par le pilier Découverte d''AFROBACK : villages, traditions, objets et rôles traditionnels des royaumes et peuples déjà croisés dans le pilier Histoires & Héros (Bamoun, Sawa, Bulu/Beti).',
  0
);
`.trimStart();

const cols = [
  'slug',
  'type',
  'pays',
  'region_ethnie',
  'titre',
  'sous_titre',
  'resume_liste',
  'contenu_fr_texte',
  'contenu_en_texte',
  'statut_fait_legende',
  'image_url',
  'sources',
  'heros_lies',
  'items_lies',
  'statut_contenu',
  'ordre_affichage',
];

const inserts = items
  .map((it) => {
    const values = [
      sqlString(it.slug),
      sqlString(it.type),
      sqlString(it.pays),
      sqlString(it.region_ethnie),
      sqlString(it.titre),
      sqlString(it.sous_titre),
      sqlString(it.resume_liste),
      sqlString(it.contenu_fr_texte),
      sqlString(it.contenu_en_texte),
      sqlJsonb(it.statut_fait_legende),
      sqlString(it.image_url),
      sqlTextArray(it.sources),
      sqlTextArray(it.heros_lies),
      sqlTextArray(it.items_lies),
      sqlString(it.statut_contenu),
      String(it.ordre_affichage),
    ];
    return `insert into public.decouverte_items (${cols.join(', ')}) values (\n  ${values.join(',\n  ')}\n);`;
  })
  .join('\n\n');

writeFileSync(outPath, schema + '\n' + inserts + '\n', 'utf8');
console.log('OK — SQL écrit dans', outPath, `(${items.length} items Découverte)`);
