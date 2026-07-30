#!/usr/bin/env node
/**
 * Génère src/data/heroes.generated.json à partir des récits du griot
 * (livrables/sites-web/afroback/Récits africains/*.md et *-EN.md).
 *
 * Ne parse QUE ce qui est mécaniquement fiable et vérifiable :
 * - le texte intégral du récit (FR + EN)
 * - la frise chronologique (liste à puces "date : événement")
 * - les sources utilisées (liste à puces)
 * - les héros liés (liste à puces, rapprochée des 9 slugs connus)
 *
 * Les champs qui demandent un jugement éditorial (résumé catalogue, thème,
 * citations avec leur statut d'attestation, légendes, avertissement de
 * lecture...) sont volontairement NE PAS auto-extraits ici : ils sont
 * maintenus à la main dans src/data/heroes.curated.ts, après lecture
 * attentive de chaque récit. Un parseur générique sur ces champs-là
 * risquerait de mal classer un fait et une légende, ce qui est exactement
 * ce que le produit doit éviter (cf. specs-phase1-histoires-heros.md).
 *
 * Usage : node scripts/build-heroes-data.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECITS_DIR = join(__dirname, '..', '..', '..', 'Récits africains');
const STORYBOARDS_DIR = join(__dirname, '..', '..', '..', 'Récits africains storyboards');
const OUT_FILE = join(__dirname, '..', 'src', 'data', 'heroes.generated.json');

const KNOWN_SLUGS = [
  { slug: 'reine-nzinga', names: ['Reine Nzinga', 'Njinga', 'Nzinga Mbandi'] },
  { slug: 'martin-paul-samba', names: ['Martin Paul Samba', 'Martin-Paul Samba', 'Mebenga'] },
  { slug: 'rudolf-douala-manga-bell', names: ['Rudolf Douala Manga Bell', 'Rudolf Duala Manga Bell', 'Manga Bell'] },
  { slug: 'sultan-njoya', names: ['Sultan Njoya', 'Ibrahim Njoya', 'Njoya'] },
  { slug: 'ruben-um-nyobe', names: ['Ruben Um Nyobè', 'Um Nyobè', 'Um Nyobe'] },
  { slug: 'charles-atangana', names: ['Charles Atangana', 'Atangana', 'Ntsama'] },
  { slug: 'felix-moumie', names: ['Félix-Roland Moumié', 'Félix Moumié', 'Moumié'] },
  { slug: 'ernest-ouandie', names: ['Ernest Ouandié', 'Ouandié'] },
  { slug: 'manu-dibango', names: ['Manu Dibango', 'Dibango'] },
];

function extractSection(markdown, startHeadingRegex) {
  const lines = markdown.split('\n');
  const startIdx = lines.findIndex((l) => startHeadingRegex.test(l.trim()));
  if (startIdx === -1) return null;
  const body = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s/.test(line.trim()) || line.trim() === '---') break;
    body.push(line);
  }
  // trim leading/trailing blank lines
  while (body.length && body[0].trim() === '') body.shift();
  while (body.length && body[body.length - 1].trim() === '') body.pop();
  return body.join('\n').trim();
}

function extractBulletBlock(markdown, boldHeading) {
  const marker = `**${boldHeading}**`;
  const idx = markdown.indexOf(marker);
  if (idx === -1) return [];
  const rest = markdown.slice(idx + marker.length);
  const lines = rest.split('\n');
  const bullets = [];
  let started = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      if (started) continue;
      else continue;
    }
    if (line.startsWith('- ')) {
      started = true;
      bullets.push(line.slice(2).trim());
      continue;
    }
    if (started) break; // fin de la liste à puces
    if (/^\*\*[^*]+\*\*/.test(line)) break; // section suivante en gras sans puces (bloc en prose ailleurs)
  }
  return bullets;
}

function parseFrise(markdown) {
  return extractBulletBlock(markdown, 'Frise chronologique').map((bullet) => {
    const sepIdx = bullet.indexOf(' : ');
    if (sepIdx === -1) return { date: '', evenement: bullet };
    return {
      date: bullet.slice(0, sepIdx).trim(),
      evenement: bullet.slice(sepIdx + 3).trim(),
    };
  });
}

function parseSources(markdown) {
  return extractBulletBlock(markdown, 'Sources utilisées');
}

function parseHerosLies(markdown, selfSlug) {
  const bullets = extractBulletBlock(markdown, 'Héros liés');
  const slugs = new Set();
  for (const bullet of bullets) {
    for (const known of KNOWN_SLUGS) {
      if (known.slug === selfSlug) continue;
      if (known.names.some((name) => bullet.includes(name))) {
        slugs.add(known.slug);
      }
    }
  }
  return Array.from(slugs);
}

/** Enlève les guillemets droits encadrants, s'ils existent — les deux formats ("..." et sans guillemets) coexistent selon les récits. */
function stripQuotes(value) {
  const v = value.trim();
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).trim();
  return v;
}

/** "4-5 secondes" / "3 secondes" → moyenne en nombre, même règle que production-media (durée totale estimée par héros). */
function parseDureeSecondes(value) {
  const numbers = (value.match(/\d+/g) || []).map(Number);
  if (numbers.length === 0) return null;
  const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Parse les planches d'un chapitre (format posé par l'agent afroback-storyboard,
 * voir `.claude/agents/afroback-storyboard.md`) : blocs "### Planche N/24 — Titre"
 * suivis de champs "- **Label** : valeur". Les libellés varient légèrement d'un
 * récit à l'autre ("Palette dominante" vs "Palette dominante de la planche") :
 * on matche sur un préfixe plutôt qu'une égalité stricte pour rester robuste.
 */
function parsePlanches(markdown) {
  const blocks = markdown.split(/^###\s*Planche\s*(\d+)\/(\d+)\s*[—-]\s*(.+)$/m);
  // blocks[0] = préambule avant la 1ère planche ; puis triplets (numero, total, titre, corps) répétés
  const planches = [];
  for (let i = 1; i < blocks.length; i += 4) {
    const numero = Number(blocks[i]);
    const titre = blocks[i + 2].trim();
    const body = blocks[i + 3];
    const fields = {};
    for (const line of body.split('\n')) {
      const m = line.match(/^-\s+\*\*([^*]+)\*\*\s*:\s*(.+)$/);
      if (!m) continue;
      fields[m[1].trim()] = m[2].trim();
    }
    const findField = (prefix) => {
      const key = Object.keys(fields).find((k) => k.toLowerCase().startsWith(prefix.toLowerCase()));
      return key ? fields[key] : '';
    };

    const texteEcranRaw = stripQuotes(findField("Texte à l'écran"));
    const dureeRaw = findField('Durée suggérée');

    planches.push({
      numero,
      titre,
      texte_ecran: texteEcranRaw && texteEcranRaw.toLowerCase() !== 'aucun' ? texteEcranRaw : null,
      voix_off: stripQuotes(findField('Voix off')) || null,
      cadrage: findField('Cadrage') || null,
      action_visuelle: findField('Composition') || findField('Action visuelle') || null,
      decor: findField('Décor') || null,
      ambiance_lumiere: findField('Ambiance') || null,
      palette: findField('Palette dominante') || null,
      duree_secondes: parseDureeSecondes(dureeRaw),
      transition: findField('Transition') || null,
    });
  }
  return planches;
}

function parseChapitre(numero, slug) {
  const fichier = join(STORYBOARDS_DIR, slug, `chapitre-${numero}.md`);
  const raw = readFileSync(fichier, 'utf8');
  const headingLine = raw.split('\n').find((l) => /^#{1,2}\s*Chapitre\s*\d/.test(l.trim()));
  if (!headingLine) {
    throw new Error(`Titre de chapitre introuvable dans ${fichier}`);
  }
  // formats rencontrés : "## Chapitre 1/4 — Titre" ou "# Chapitre 1 — Titre"
  const match = headingLine.match(/Chapitre\s*\d(?:\/4)?\s*[—-]\s*(.+)$/);
  const titre_chapitre = match ? match[1].trim() : headingLine.replace(/^#+\s*/, '').trim();
  const planches = parsePlanches(raw);
  const nb_planches = planches.length || (raw.match(/^#{2,3}\s*Planche\s*\d+\/\d+/gm) || []).length;
  if (planches.length === 0) {
    throw new Error(`Aucune planche extraite dans ${fichier} — vérifier le format des libellés.`);
  }
  return {
    numero,
    titre_chapitre,
    fichier_source: `livrables/sites-web/afroback/Récits africains storyboards/${slug}/chapitre-${numero}.md`,
    nb_planches,
    statut: 'pret',
    planches,
  };
}

function buildOne({ slug }) {
  const frFile = join(RECITS_DIR, `${slug}.md`);
  const enFile = join(RECITS_DIR, `${slug}-EN.md`);

  const frRaw = readFileSync(frFile, 'utf8');
  const enRaw = readFileSync(enFile, 'utf8');

  const recit_fr_texte = extractSection(frRaw, /^##\s+Le récit du griot$/);
  const recit_en_texte = extractSection(enRaw, /^##\s+The griot's tale$/);

  if (!recit_fr_texte) {
    throw new Error(`Section "## Le récit du griot" introuvable dans ${frFile}`);
  }
  if (!recit_en_texte) {
    throw new Error(`Section "## The griot's tale" introuvable dans ${enFile}`);
  }

  return {
    slug,
    recit_fr_texte,
    recit_fr_fichier_source: `livrables/sites-web/afroback/Récits africains/${slug}.md`,
    recit_en_texte,
    recit_en_fichier_source: `livrables/sites-web/afroback/Récits africains/${slug}-EN.md`,
    frise_chronologique: parseFrise(frRaw),
    sources: parseSources(frRaw),
    heros_lies: parseHerosLies(frRaw, slug),
    chapitres_storyboard: [1, 2, 3, 4].map((n) => parseChapitre(n, slug)),
  };
}

function main() {
  const available = new Set(readdirSync(RECITS_DIR));
  const result = {};
  for (const { slug } of KNOWN_SLUGS) {
    if (!available.has(`${slug}.md`) || !available.has(`${slug}-EN.md`)) {
      throw new Error(`Fichiers manquants pour le slug "${slug}" dans ${RECITS_DIR}`);
    }
    result[slug] = buildOne({ slug });
    const frise = result[slug].frise_chronologique.length;
    const sources = result[slug].sources.length;
    const lies = result[slug].heros_lies.length;
    const planches = result[slug].chapitres_storyboard.reduce((sum, c) => sum + c.nb_planches, 0);
    console.log(`✓ ${slug} — ${frise} événements, ${sources} sources, ${lies} héros liés, ${planches} planches (4 chapitres)`);
  }
  writeFileSync(OUT_FILE, JSON.stringify(result, null, 2) + '\n', 'utf8');
  console.log(`\nÉcrit : ${OUT_FILE}`);
}

main();
