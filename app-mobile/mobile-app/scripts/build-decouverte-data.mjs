#!/usr/bin/env node
/**
 * Génère src/data/decouverte.generated.json à partir des fiches produites
 * par l'agent afroback-decouverte (livrables/sites-web/afroback/Découverte/*.md).
 *
 * Contrairement au pipeline héros (build-heroes-data.mjs + heroes.curated.ts),
 * il n'y a pas de couche éditoriale séparée ici : chaque fiche produite par
 * l'agent contient déjà tous les champs (résumé, récit, statut fait/légende,
 * sources, liens) rédigés avec jugement éditorial. Ce script se contente
 * d'une extraction mécanique du Markdown structuré vers du JSON, sans
 * réinterpréter le contenu.
 *
 * Usage : node scripts/build-decouverte-data.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DECOUVERTE_DIR = join(__dirname, '..', '..', '..', 'Découverte');
const OUT_FILE = join(__dirname, '..', 'src', 'data', 'decouverte.generated.json');

const STORAGE_BASE = 'https://ygkyapryramhaskfbrrt.supabase.co/storage/v1/object/public/heroes-media/images/decouverte';

/**
 * Photos réellement produites par slug (dossier local "AFROBACK CONTENT/
 * Photos" de Yannick, 2026-07-31). Un slug absent de cette table n'a
 * simplement aucune photo à ce jour ; `image_url` reste `null` et
 * `HeroPlaceholder` affiche le halo de substitution habituel.
 */
const DECOUVERTE_MEDIA = {
  'fon-chef-traditionnel-bamoun': `${STORAGE_BASE}/fon-chef-traditionnel-bamoun.jpg`,
  nguon: `${STORAGE_BASE}/nguon.jpg`,
  'palais-royal-foumban': `${STORAGE_BASE}/palais-royal-foumban.jpg`,
  'trone-mandu-yenu': `${STORAGE_BASE}/trone-mandu-yenu.jpg`,
  ebolowa: `${STORAGE_BASE}/ebolowa.jpg`,
};

function listMarkdownFiles(dir) {
  const entries = readdirSync(dir);
  let files = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files = files.concat(listMarkdownFiles(full));
    } else if (entry.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

function field(md, label) {
  const re = new RegExp(`\\*\\*${label}\\*\\*\\s*:\\s*(.+)`);
  const m = md.match(re);
  return m ? m[1].trim() : null;
}

function section(md, heading, nextHeadingRegex = /\n##\s/) {
  const re = new RegExp(`##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=${nextHeadingRegex.source}|$)`);
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

function parseFaitsEtStatut(md) {
  const body = section(md, 'Faits et statut');
  const rows = [];
  const lines = body.split('\n').filter((l) => l.trim().startsWith('|'));
  for (const line of lines) {
    const cols = line
      .split('|')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cols.length < 2) continue;
    if (cols[0].toLowerCase().includes('affirmation')) continue; // header row
    if (/^-+$/.test(cols[0])) continue; // separator row
    rows.push({ affirmation: cols[0], statut: cols[1] });
  }
  return rows;
}

function parseSources(md) {
  const body = section(md, 'Sources utilisées');
  return body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.replace(/^-\s*/, '').trim());
}

function parseListField(md, label) {
  const liensBody = section(md, 'Liens');
  const re = new RegExp(`${label}\\s*:\\s*(.+)`);
  const m = liensBody.match(re);
  if (!m) return [];
  let raw = m[1].trim();
  if (!raw || /^\(?laisse vide/i.test(raw) || raw === '-') return [];
  // Les agents ajoutent parfois une annotation entre parenthèses après un
  // slug (ex. "le-ngondo (coutume sawa)"), voire avec une virgule à
  // l'intérieur (ex. "le-ngondo (coutume sawa, dont la course...)"). On
  // retire ces annotations avant de découper sur les virgules pour ne
  // garder que des slugs propres.
  raw = raw.replace(/\([^)]*\)/g, '');
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('('));
}

const files = listMarkdownFiles(DECOUVERTE_DIR).sort();
const items = files.map((filePath, index) => {
  const md = readFileSync(filePath, 'utf8');
  const titreMatch = md.match(/^#\s+(.+)$/m);
  const titre = titreMatch ? titreMatch[1].trim() : null;

  const item = {
    slug: field(md, 'Slug'),
    type: field(md, 'Type'),
    pays: field(md, 'Pays') || 'Cameroun',
    region_ethnie: field(md, 'Région/ethnie'),
    titre,
    sous_titre: field(md, 'Sous-titre'),
    resume_liste: section(md, 'Résumé \\(liste\\)'),
    contenu_fr_texte: section(md, 'Le récit'),
    contenu_en_texte: null,
    statut_fait_legende: parseFaitsEtStatut(md),
    image_url: DECOUVERTE_MEDIA[field(md, 'Slug')] ?? null,
    sources: parseSources(md),
    heros_lies: parseListField(md, 'Héros liés \\(slug\\)'),
    items_lies: parseListField(md, 'Autres items Découverte liés'),
    statut_contenu: 'pret',
    ordre_affichage: index,
    fichier_source: filePath.replace(join(__dirname, '..', '..', '..', '..') + '\\', '').replace(/\\/g, '/'),
  };

  const missing = ['slug', 'type', 'region_ethnie', 'titre', 'sous_titre', 'resume_liste', 'contenu_fr_texte'].filter(
    (k) => !item[k]
  );
  if (missing.length > 0) {
    console.warn(`⚠️  ${filePath} : champs manquants ou mal parsés : ${missing.join(', ')}`);
  }

  return item;
});

writeFileSync(OUT_FILE, JSON.stringify(items, null, 2), 'utf8');
console.log('OK —', items.length, 'items Découverte écrits dans', OUT_FILE);
