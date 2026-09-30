/**
 * Prépare le dossier `dist/` (export web) avant publication sur Vercel.
 *
 * Problème corrigé le 2026-09-30 : `expo export` range les polices (Cinzel,
 * Manrope, Space Mono) et les icônes de navigation dans
 * `dist/assets/node_modules/…`. Or Vercel exclut d'office tout dossier
 * nommé `node_modules` de l'envoi : ces fichiers n'étaient jamais publiés,
 * chaque demande recevait la page d'accueil à la place, les polices
 * retombaient sur celles du système et le navigateur retentait le
 * téléchargement à chaque changement d'écran (lenteurs, plantages).
 *
 * Correctif : renommer ce dossier en `dist/assets/vendor/` et réécrire les
 * références dans les fichiers générés.
 *
 * Usage : node scripts/prepare-web-dist.mjs  (après `npx expo export -p web`)
 */
import { existsSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const FROM = join(DIST, 'assets', 'node_modules');
const TO = join(DIST, 'assets', 'vendor');

if (!existsSync(FROM)) {
  console.log('Rien à faire : dist/assets/node_modules absent.');
  process.exit(0);
}
renameSync(FROM, TO);

const TEXT = /\.(js|html|json|css|map)$/;
let patched = 0;
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (p !== TO) walk(p);
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
