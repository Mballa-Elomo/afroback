#!/usr/bin/env node
/**
 * Génère src/data/mythologie.generated.json à partir des 5 récits mythologiques
 * déjà écrits par l'agent griot (livrables/sites-web/afroback/Mythologie/[pays]/[slug]/fr.md)
 * et de leurs storyboards (dossier "Récits africains storyboards/").
 *
 * Contrairement au pipeline héros (build-heroes-data.mjs + heroes.curated.ts,
 * pensé pour 9 récits longs et appelé à grossir), ce pilier ne compte que 5
 * éléments à ce jour : les champs de la "Fiche structurée" (peuple, région,
 * époque, thème, sources) sont extraits mécaniquement ci-dessous, mais le
 * découpage du "Récit du griot" en 4 chapitres (titre + regroupement des
 * paragraphes) est fixé à la main dans MYTHES_CONFIG plutôt que par un
 * mécanisme d'ancres générique — les titres viennent des vrais storyboards
 * (## Chapitre N/4 — ...), les regroupements de paragraphes sont un jugement
 * éditorial (comme CHAPITRE_ANCHORS pour les héros), fait une fois pour 5
 * textes courts plutôt que scripté. À généraliser si ce pilier grossit.
 *
 * Images retrouvées le 2026-08-05 dans le dossier local "AFROBACK CONTENT/
 * Photos" de Yannick (fichiers nommés d'après le titre du mythe plutôt que
 * le slug) : copiées et renommées par slug dans un sous-dossier
 * "mythologie-renamed" du même dossier, sur le modèle de "decouverte-renamed"
 * et "heroes-renamed". `image_url` pointe donc vers l'URL Storage attendue
 * une fois ces 5 fichiers uploadés par Yannick (upload manuel, bucket
 * éditorial contrôlé, comme pour héros/découverte) — pas encore vérifié
 * comme réellement en ligne. Aucune narration audio retrouvée pour la
 * mythologie : `narration_audio_url` reste `null`.
 *
 * Usage : node scripts/build-mythologie-data.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MYTHOLOGIE_DIR = join(__dirname, '..', '..', '..', 'Mythologie');
const OUT_FILE = join(__dirname, '..', 'src', 'data', 'mythologie.generated.json');

const STORAGE_BASE = 'https://ygkyapryramhaskfbrrt.supabase.co/storage/v1/object/public/heroes-media/images/mythologie';

/**
 * Photos réellement produites par slug (dossier local "AFROBACK CONTENT/
 * Photos/mythologie-renamed" de Yannick, retrouvées le 2026-08-05). Un slug
 * absent de cette table n'a simplement aucune photo à ce jour ; `image_url`
 * reste `null` et `HeroPlaceholder` affiche le halo de substitution habituel.
 */
const MYTHES_MEDIA = {
  'mythe-miengu-esprits-eau-sawa': `${STORAGE_BASE}/mythe-miengu-esprits-eau-sawa.jpg`,
  'mythe-nchare-yen-bamoun': `${STORAGE_BASE}/mythe-nchare-yen-bamoun.jpg`,
  'mythe-ngan-medza-beti': `${STORAGE_BASE}/mythe-ngan-medza-beti.jpg`,
  'mythe-ngog-lituba-bassa': `${STORAGE_BASE}/mythe-ngog-lituba-bassa.jpg`,
  'mythe-sao-geants-kotoko': `${STORAGE_BASE}/mythe-sao-geants-kotoko.jpg`,
};

// Palette décorative (pastille de couleur par mythe dans la liste, cyclique,
// reprise de src/theme/tokens.ts) — purement visuelle, pas un jugement de
// contenu.
const PALETTE = ['#E9BE77', '#A0522D', '#8B5A2B', '#C99A5B', '#E3A277'];

/**
 * Config par mythe : zone d'affichage (regroupement de la liste), titres de
 * chapitres (repris verbatim des fichiers storyboard chapitre-N.md) et
 * regroupement des paragraphes du "Récit du griot" (0-based, dans l'ordre)
 * sous chaque chapitre. Vérifié à la main contre chaque texte source.
 */
const MYTHES_CONFIG = {
  'mythe-miengu-esprits-eau-sawa': {
    pays: 'Cameroun',
    zone: 'Littoral',
    chapitres: [
      { titre: 'Origines : le monde sous les eaux', paragraphes: [0, 1] },
      { titre: 'Les pouvoirs et le choix', paragraphes: [2] },
      { titre: "L'affrontement : résistance et mystère du plongeur", paragraphes: [3, 4] },
      { titre: 'Héritage : une présence vivante aujourd\'hui', paragraphes: [5] },
    ],
  },
  'mythe-nchare-yen-bamoun': {
    pays: 'Cameroun',
    zone: 'Ouest (Grassfields)',
    chapitres: [
      { titre: 'Rifum, trois héritiers pour un seul trône', paragraphes: [0, 1] },
      { titre: "L'épreuve de la course se prépare", paragraphes: [2] },
      { titre: 'La course truquée', paragraphes: [3] },
      { titre: 'La naissance du royaume bamoun', paragraphes: [4, 5, 6, 7] },
    ],
  },
  'mythe-ngan-medza-beti': {
    pays: 'Cameroun',
    zone: 'Centre',
    chapitres: [
      { titre: 'Nanga et les enfants de la savane (Origines)', paragraphes: [0] },
      { titre: 'La pression du nord et la fuite', paragraphes: [1] },
      { titre: 'Le pont vivant sur la Sanaga', paragraphes: [2, 3] },
      { titre: 'La mémoire du serpent (Héritage)', paragraphes: [4, 5] },
    ],
  },
  'mythe-ngog-lituba-bassa': {
    pays: 'Cameroun',
    zone: 'Littoral',
    chapitres: [
      { titre: 'Le rocher et la traque', paragraphes: [0] },
      { titre: 'La toile qui sauve un peuple', paragraphes: [1] },
      { titre: 'Les enfants du rocher percé', paragraphes: [2, 3] },
      { titre: 'Un lieu sacré vivant', paragraphes: [4, 5] },
    ],
  },
  'mythe-sao-geants-kotoko': {
    pays: 'Cameroun',
    zone: 'Extrême-Nord',
    chapitres: [
      { titre: 'La légende des géants', paragraphes: [0, 1] },
      { titre: 'La terre parle : la vraie civilisation sao', paragraphes: [2, 3] },
      { titre: "De la chute des cités à l'héritier", paragraphes: [4] },
      { titre: 'Deux visages, une même vérité', paragraphes: [5, 6] },
    ],
  },
};

function field(md, label) {
  const re = new RegExp(`\\*\\*${label}\\*\\*\\s*:\\s*(.+)`);
  const m = md.match(re);
  return m ? m[1].trim() : null;
}

function section(md, heading, stopRegex = /\n---|\n##\s/) {
  const re = new RegExp(`##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=${stopRegex.source}|$)`);
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

/**
 * Les fiches du griot utilisent des sous-titres en gras (**Titre**) plutôt
 * que des vrais titres Markdown (##) pour les sections de la "Fiche
 * structurée" (Sources utilisées, Légendes associées, etc.) — différent du
 * pattern Découverte (vrais ## heading). Sections suivantes coupées sur la
 * prochaine ligne en gras, un autre ## heading, un --- ou la fin du fichier.
 */
function boldSection(md, label) {
  const re = new RegExp(`\\*\\*${label}[^*]*\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n\\*\\*|\\n##\\s|\\n---|$)`);
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

function parseSources(md) {
  const body = boldSection(md, 'Sources utilisées');
  return body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-'))
    .map((l) => l.replace(/^-\s*/, '').trim());
}

function parseParagraphs(md) {
  const body = section(md, 'Le récit du griot');
  return body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

const slugs = Object.keys(MYTHES_CONFIG).sort();

const items = slugs.map((slug, index) => {
  const config = MYTHES_CONFIG[slug];
  const filePath = join(MYTHOLOGIE_DIR, config.pays, slug, 'fr.md');
  const md = readFileSync(filePath, 'utf8');

  const titreMatch = md.match(/^#\s+(.+)$/m);
  const titre = titreMatch ? titreMatch[1].trim() : null;
  const lines = md.split('\n').map((l) => l.trim());
  const sousTitre = lines.slice(1).find((l) => l.length > 0 && l !== '---') || null;

  const paragraphes = parseParagraphs(md);
  const chapitres = config.chapitres.map((ch, i) => ({
    numero: i + 1,
    titre: ch.titre,
    texte: ch.paragraphes.map((p) => paragraphes[p]).join('\n\n'),
  }));

  const item = {
    slug,
    titre,
    sous_titre: sousTitre,
    peuple: field(md, "Peuple d'origine"),
    region: field(md, 'Région'),
    zone: config.zone,
    epoque: field(md, 'Époque'),
    type_contenu: field(md, 'Type de contenu'),
    theme: field(md, 'Thème'),
    recit_chapitres_fr: chapitres,
    sources: parseSources(md),
    couleur: PALETTE[index % PALETTE.length],
    // Image si retrouvée dans MYTHES_MEDIA (voir en tête de fichier), sinon
    // null — jamais une URL inventée. Aucune narration audio à ce jour.
    image_url: MYTHES_MEDIA[slug] ?? null,
    narration_audio_url: null,
    ordre_affichage: index,
    fichier_source: `livrables/sites-web/afroback/Mythologie/${config.pays}/${slug}/fr.md`,
  };

  const missing = ['titre', 'sous_titre', 'peuple', 'region', 'epoque', 'theme'].filter((k) => !item[k]);
  if (missing.length > 0) {
    console.warn(`⚠️  ${slug} : champs manquants ou mal parsés : ${missing.join(', ')}`);
  }
  const totalParas = config.chapitres.reduce((sum, ch) => sum + ch.paragraphes.length, 0);
  if (totalParas !== paragraphes.length) {
    console.warn(
      `⚠️  ${slug} : ${paragraphes.length} paragraphes dans le récit mais ${totalParas} référencés dans MYTHES_CONFIG — vérifier le découpage.`
    );
  }

  return item;
});

writeFileSync(OUT_FILE, JSON.stringify(items, null, 2), 'utf8');
console.log('OK —', items.length, 'mythes écrits dans', OUT_FILE);
