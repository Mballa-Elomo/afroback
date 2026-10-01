/**
 * Prépare le dossier `dist/` (export web) avant publication sur Vercel.
 *
 * 1. Fonctions de partage (2026-09-30) : copie `web-vercel/` (fonctions
 *    `api/share` et `api/og`, `vercel.json`, `package.json`) dans `dist/`,
 *    et écrit `api/_config.js` avec l'adresse Supabase et la clé publique
 *    ("anon", déjà présente dans l'app : aucune donnée secrète).
 *
 * 2. Polices (2026-09-30) : `expo export` range les polices (Cinzel,
 *    Manrope, Space Mono) et les icônes de navigation dans
 *    `dist/assets/node_modules/…`. Or Vercel exclut d'office tout dossier
 *    nommé `node_modules` de l'envoi : ces fichiers n'étaient jamais publiés,
 *    chaque demande recevait la page d'accueil à la place, les polices
 *    retombaient sur celles du système et le navigateur retentait le
 *    téléchargement à chaque changement d'écran (lenteurs, plantages).
 *    Correctif : renommer ce dossier en `dist/assets/vendor/` et réécrire
 *    les références dans les fichiers générés.
 *
 * Usage : node scripts/prepare-web-dist.mjs  (après `npx expo export -p web`)
 */
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const FROM = join(DIST, 'assets', 'node_modules');
const TO = join(DIST, 'assets', 'vendor');

// 1. Fonctions de partage + configuration Vercel.
cpSync(join(process.cwd(), 'web-vercel'), DIST, { recursive: true });
const env = {};
for (const line of readFileSync(join(process.cwd(), '.env'), 'utf8').split(/\r?\n/)) {
  const i = line.indexOf('=');
  if (i > 0 && !line.startsWith('#')) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}
writeFileSync(
  join(DIST, 'api', '_config.js'),
  `export const SUPABASE_URL = ${JSON.stringify(env.EXPO_PUBLIC_SUPABASE_URL)};\nexport const SUPABASE_ANON_KEY = ${JSON.stringify(env.EXPO_PUBLIC_SUPABASE_ANON_KEY)};\n`
);
console.log('Fonctions de partage copiées dans dist/api/.');

// 2. Polices et icônes hors d'un dossier "node_modules".
if (!existsSync(FROM)) {
  console.log('Pas de dossier dist/assets/node_modules.');
  process.exit(0);
}
renameSync(FROM, TO);

const TEXT = /\.(js|html|json|css|map)$/;
let patched = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (p !== TO && name !== 'api') walk(p);
    } else if (TEXT.test(name)) {
      const src = readFileSync(p, 'utf8');
      if (src.includes('assets/node_modules/')) {
        writeFileSync(p, src.split('assets/node_modules/').join('assets/vendor/'));
        patched++;
      }
    }
  }
}
walk(DIST);
console.log(`Polices et icônes déplacées dans dist/assets/vendor/ (${patched} fichier(s) mis à jour).`);
