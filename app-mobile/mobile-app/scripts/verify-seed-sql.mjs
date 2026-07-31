#!/usr/bin/env node
/**
 * Vérifie mécaniquement supabase/seed.sql (ou tout fichier passé en argument) :
 * pour CHAQUE `insert into ... (cols) values (...)`, le nombre de colonnes
 * déclarées doit correspondre exactement au nombre de valeurs fournies dans
 * le tuple, et les parenthèses/crochets/guillemets du fichier doivent être
 * équilibrés. Ne compte jamais à la main / à l'œil : le texte des récits
 * contient des virgules, des apostrophes échappées (''), des tirets, etc.,
 * ce qui rend un simple `split(',')` non fiable — d'où un vrai tokenizer
 * conscient des guillemets SQL (échappement `''`) et de la profondeur des
 * parenthèses/crochets.
 *
 * Créé le 2026-07-31 après un bug réel : `generate-supabase-seed.mjs`
 * déclarait 31 colonnes mais n'émettait que 27 valeurs pour chaque héros
 * (4 champs média oubliés dans le tableau `values`), ce qui a fait planter
 * `insert into public.heros (...)` dès le premier héros côté Supabase
 * ("INSERT has more target columns than expressions"). Ce script est le
 * garde-fou pour que ça ne reparte plus en silence.
 *
 * Usage : node scripts/verify-seed-sql.mjs [chemin-vers-seed.sql]
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = process.argv[2] || join(__dirname, '..', 'supabase', 'seed.sql');
const sql = readFileSync(path, 'utf8');

/**
 * Découpe une liste SQL top-level (colonnes ou valeurs) sur les virgules,
 * en ignorant celles qui sont à l'intérieur d'une chaîne '...' (avec '' comme
 * échappement de guillemet) ou à l'intérieur de parenthèses/crochets imbriqués
 * (ARRAY[...], sous-expressions). C'est un tokenizer, pas un split naïf.
 */
function splitTopLevel(text) {
  const items = [];
  let depth = 0;
  let inQuote = false;
  let current = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      current += ch;
      if (ch === "'") {
        if (text[i + 1] === "'") {
          // échappement '' à l'intérieur d'une chaîne — pas la fin de la chaîne
          current += text[i + 1];
          i++;
        } else {
          inQuote = false;
        }
      }
      continue;
    }
    if (ch === "'") {
      inQuote = true;
      current += ch;
      continue;
    }
    if (ch === '(' || ch === '[') {
      depth++;
      current += ch;
      continue;
    }
    if (ch === ')' || ch === ']') {
      depth--;
      current += ch;
      continue;
    }
    if (ch === ',' && depth === 0) {
      items.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim().length > 0) items.push(current.trim());
  return items;
}

/**
 * Retire les commentaires de ligne `-- ...` avant toute analyse de guillemets/
 * parenthèses : ce fichier contient des commentaires en français pleins
 * d'apostrophes de contraction ("l'app", "n'a", "qu'un"...), qui ne sont pas
 * des guillemets SQL et fausseraient le comptage s'ils étaient pris pour tels.
 * Ne retire jamais un `--` situé à l'intérieur d'une chaîne '...'.
 */
function stripLineComments(text) {
  let out = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      out += ch;
      if (ch === "'") {
        if (text[i + 1] === "'") {
          out += text[i + 1];
          i++;
        } else {
          inQuote = false;
        }
      }
      continue;
    }
    if (ch === "'") {
      inQuote = true;
      out += ch;
      continue;
    }
    if (ch === '-' && text[i + 1] === '-') {
      const nl = text.indexOf('\n', i);
      out += '\n';
      i = nl === -1 ? text.length : nl;
      continue;
    }
    out += ch;
  }
  return out;
}

/** Vérifie l'équilibre global des guillemets/parenthèses/crochets du fichier entier (hors chaînes, hors commentaires `-- ...`) — la "syntaxe SQL simple" demandée, sans dépendance à un vrai parseur Postgres. */
function checkBalance(rawText) {
  const text = stripLineComments(rawText);
  let depthParen = 0;
  let depthBracket = 0;
  let inQuote = false;
  const errors = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === "'") {
        if (text[i + 1] === "'") {
          i++;
        } else {
          inQuote = false;
        }
      }
      continue;
    }
    if (ch === "'") {
      inQuote = true;
      continue;
    }
    if (ch === '(') depthParen++;
    else if (ch === ')') {
      depthParen--;
      if (depthParen < 0) errors.push(`Parenthèse fermante en trop à l'offset ${i}`);
    } else if (ch === '[') depthBracket++;
    else if (ch === ']') {
      depthBracket--;
      if (depthBracket < 0) errors.push(`Crochet fermant en trop à l'offset ${i}`);
    }
  }
  if (inQuote) errors.push('Chaîne entre guillemets simples jamais refermée (fichier tronqué ?)');
  if (depthParen !== 0) errors.push(`Parenthèses non équilibrées (delta ${depthParen})`);
  if (depthBracket !== 0) errors.push(`Crochets non équilibrés (delta ${depthBracket})`);
  return errors;
}

// --- 1. Équilibre global du fichier ---
const balanceErrors = checkBalance(sql);

// --- 2. Chaque insert : colonnes déclarées vs valeurs fournies ---
const insertRegex = /insert into public\.heros \(([\s\S]*?)\) values \(\s*\n([\s\S]*?)\n\);/g;
let match;
let count = 0;
const mismatches = [];

while ((match = insertRegex.exec(sql)) !== null) {
  count++;
  const colsRaw = match[1];
  const valuesRaw = match[2];
  const cols = splitTopLevel(colsRaw).filter(Boolean);
  const values = splitTopLevel(valuesRaw).filter(Boolean);
  // slug = première valeur, entre quotes, pour identifier le héros dans le rapport
  const slugValue = values[0] ? values[0].replace(/^'|'$/g, '') : `(insert #${count}, slug introuvable)`;
  if (cols.length !== values.length) {
    mismatches.push({ slug: slugValue, cols: cols.length, values: values.length });
  }
}

console.log(`Fichier vérifié : ${path}`);
console.log(`${count} insert(s) trouvé(s).`);

if (balanceErrors.length > 0) {
  console.error('\n❌ Déséquilibre syntaxique détecté :');
  for (const e of balanceErrors) console.error(`  - ${e}`);
} else {
  console.log('✓ Parenthèses / crochets / guillemets équilibrés sur tout le fichier.');
}

if (mismatches.length > 0) {
  console.error('\n❌ Décalage colonnes/valeurs détecté :');
  for (const m of mismatches) {
    console.error(`  - ${m.slug} : ${m.cols} colonnes déclarées, ${m.values} valeurs fournies`);
  }
} else if (count > 0) {
  console.log(`✓ Les ${count} insert(s) ont un nombre de valeurs strictement égal au nombre de colonnes déclarées.`);
}

if (count === 0) {
  console.error('\n❌ Aucun insert trouvé — le regex ne matche rien, vérifier le format du fichier.');
}

const ok = balanceErrors.length === 0 && mismatches.length === 0 && count > 0;
if (!ok) {
  process.exitCode = 1;
}
