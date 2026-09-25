#!/usr/bin/env node
/**
 * Génère src/data/heroes.generated.json à partir des récits du griot
 * (livrables/sites-web/afroback/Héros/[pays]/[slug]/fr.md et en.md).
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
const RECITS_DIR = join(__dirname, '..', '..', '..', 'Héros');
const STORYBOARDS_DIR = join(__dirname, '..', '..', '..', 'Récits africains storyboards');
const OUT_FILE = join(__dirname, '..', 'src', 'data', 'heroes.generated.json');

const KNOWN_SLUGS = [
  { slug: 'reine-nzinga', pays: 'Angola', names: ['Reine Nzinga', 'Njinga', 'Nzinga Mbandi'] },
  { slug: 'martin-paul-samba', pays: 'Cameroun', names: ['Martin Paul Samba', 'Martin-Paul Samba', 'Mebenga'] },
  { slug: 'rudolf-douala-manga-bell', pays: 'Cameroun', names: ['Rudolf Douala Manga Bell', 'Rudolf Duala Manga Bell', 'Manga Bell'] },
  { slug: 'sultan-njoya', pays: 'Cameroun', names: ['Sultan Njoya', 'Ibrahim Njoya', 'Njoya'] },
  { slug: 'ruben-um-nyobe', pays: 'Cameroun', names: ['Ruben Um Nyobè', 'Um Nyobè', 'Um Nyobe'] },
  { slug: 'charles-atangana', pays: 'Cameroun', names: ['Charles Atangana', 'Atangana', 'Ntsama'] },
  { slug: 'felix-moumie', pays: 'Cameroun', names: ['Félix-Roland Moumié', 'Félix Moumié', 'Moumié'] },
  { slug: 'ernest-ouandie', pays: 'Cameroun', names: ['Ernest Ouandié', 'Ouandié'] },
  { slug: 'manu-dibango', pays: 'Cameroun', names: ['Manu Dibango', 'Dibango'] },
];

const PAYS_PAR_SLUG = Object.fromEntries(KNOWN_SLUGS.map((h) => [h.slug, h.pays]));

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

/**
 * Ancrages de découpage en chapitres du récit texte (pilier lecture), calés
 * sur les 4 vrais chapitres du storyboard vidéo (mêmes titres, voir
 * `chapitres_storyboard`) plutôt que sur une coupe arbitraire à volume de
 * mots égal. Chaque ancre est le tout début (verbatim) du paragraphe où
 * démarre, dans le récit, le chapitre 2, 3 ou 4 — déterminé par lecture du
 * texte en le confrontant au titre et aux planches d'ouverture de chaque
 * chapitre du storyboard (2026-07-31). Le chapitre 1 n'a pas besoin d'ancre :
 * il commence au tout début du récit.
 */
const CHAPITRE_ANCHORS = {
  'charles-atangana': {
    fr: [
      "En 1902, l'administration allemande fait de lui son représentant officiel",
      "En 1914, l'histoire le frôle une seconde fois par le chemin de la résistance",
      "Sous les Français, le pouvoir des chefs traditionnels est bien plus étroit",
    ],
    en: [
      'In 1902, the German administration made him its official representative',
      'In 1914, history brushed past him a second time on the path of resistance',
      'Under the French, the power of traditional chiefs was far narrower',
    ],
  },
  'martin-paul-samba': {
    fr: [
      "Car c'est bien ce qui arrive. En 1902, Samba quitte l'armée.",
      "L'été 1914 arrive, et avec lui, l'Europe entière glisse vers la guerre.",
      "Ce que l'on raconte à Ebolowa depuis, la tradition populaire l'a gardé précieusement",
    ],
    en: [
      'Because that is exactly what happens. In 1902, Samba leaves the army.',
      'Summer 1914 arrives, and with it, all of Europe slides toward war.',
      'What has been told in Ebolowa ever since, popular tradition has carefully kept',
    ],
  },
  'rudolf-douala-manga-bell': {
    fr: [
      'Le 2 septembre 1908, à la mort de son père, Rudolf devient à son tour roi du clan Bell',
      "L'Europe, cet été-là, bascule dans la guerre. Le 10 mai 1914, Manga Bell et Ngoso Din sont arrêtés",
      'On raconte, dans la mémoire populaire et dans une pièce de théâtre camerounaise consacrée à sa vie',
    ],
    en: [
      "On 2 September 1908, upon his father's death, Rudolf in turn becomes king of the Bell clan",
      'That summer, Europe slides into war. On 10 May 1914, Manga Bell and Ngoso Din are arrested',
      'It is told, in popular memory and in a Cameroonian play devoted to his life',
    ],
  },
  'sultan-njoya': {
    fr: [
      'Cela ne suffit pas à asseoir son trône. Entre 1892 et 1895, une guerre civile déchire le royaume.',
      "Et Njoya ne s'arrête pas là. Il ouvre des écoles au palais dès 1898",
      "Car le vent a tourné. Après la Première Guerre mondiale, l'Allemagne perd le Cameroun",
    ],
    en: [
      'That alone does not secure his throne. Between 1892 and 1895, civil war tears the kingdom apart.',
      'And Njoya does not stop there. He opens schools at the palace as early as 1898',
      'For the wind has turned. After the First World War, Germany loses Cameroon',
    ],
  },
  'ruben-um-nyobe': {
    fr: [
      "Il faut te dire une première fois, ici, une vérité qu'on oublie souvent de raconter",
      "Mais parler à l'ONU ne suffit pas à faire plier un empire colonial. En mai 1955",
      'Le 13 septembre 1958, après des mois de traque menée par le capitaine Agostini',
    ],
    en: [
      'I must tell you something here, a truth too often left out',
      'But speaking at the UN is not enough to bend a colonial empire. In May 1955',
      'On 13 September 1958, after months of tracking led by Captain Agostini',
    ],
  },
  'felix-moumie': {
    fr: [
      'Sa progression est rapide. En avril 1950, au congrès de Dschang',
      "Puis vient mai 1955. Le 22, l'UPC adopte son emblème",
      'Qui a commandité ce meurtre ? Les archives, les enquêtes journalistiques',
    ],
    en: [
      'His rise is swift. In April 1950, at the Dschang congress',
      'Then comes May 1955. On the 22nd, the UPC adopts its emblem',
      'Who ordered this murder? The archives, the journalistic investigations',
    ],
  },
  'ernest-ouandie': {
    fr: [
      "Mais écoute ce qui arrive ensuite, car c'est là que bascule l'histoire du Cameroun tout entier. Le 13 juillet 1955",
      'Comprends bien ce moment. Deux dirigeants fondateurs assassinés en deux ans',
      'Entre 1965 et 1970, Mgr Albert Ndongmo, évêque bamiléké comme lui',
    ],
    en: [
      'But listen to what happens next, for this is where the history of the whole of Cameroon turns. On 13 July 1955',
      'Understand this moment well. Two founding leaders assassinated within two years',
      'Between 1965 and 1970, Bishop Albert Ndongmo, a Bamiléké bishop like him',
    ],
  },
  'manu-dibango': {
    fr: [
      "En 1949, il a quinze ans. Ses parents décident de l'envoyer étudier en France",
      'En 1965, il retourne en France, presque recommencer à zéro.',
      "Le succès américain aurait pu suffire à toute une vie. Pour Dibango, il n'est qu'un chapitre parmi d'autres. En 1975",
    ],
    en: [
      'In 1949, he is fifteen years old. His parents decide to send him to study in France',
      'In 1965, he returns to France, almost starting from zero.',
      'American success alone could have filled a lifetime. For Dibango, it is only one chapter among many. In 1975',
    ],
  },
  'reine-nzinga': {
    fr: [
      'En 1621, Njinga se rend à Luanda, la place forte portugaise',
      'Face à elle, les Portugais choisissent un rival, refusent de la reconnaître, et en mars 1626',
      'Avec l\'appui hollandais, elle reprend une grande partie de Ndongo entre 1641 et 1644',
    ],
    en: [
      'In 1621, Njinga travels to Luanda, the Portuguese stronghold',
      'Facing her, the Portuguese choose a rival, refuse to recognize her, and in March 1626',
      'With Dutch support, she retakes much of Ndongo between 1641 and 1644',
    ],
  },
};

/**
 * Découpe un texte de récit en 4 chapitres à partir de 3 ancres (début
 * verbatim des paragraphes où commencent les chapitres 2, 3 et 4). Coupe
 * toujours sur une frontière de paragraphe (jamais en plein milieu d'une
 * phrase) : chaque paragraphe est cherché par correspondance exacte de
 * préfixe, et l'échec est fatal (erreur de build) plutôt que silencieux —
 * si le texte source change, l'ancre doit être mise à jour à la main pour
 * ne jamais produire un découpage arbitraire ou faux.
 */
function splitIntoChapters(texte, anchors, titres, slug, langue) {
  const paragraphs = texte.split(/\n\n+/);
  const starts = [0];
  for (const anchor of anchors) {
    const idx = paragraphs.findIndex((p) => p.trim().startsWith(anchor.trim()));
    if (idx === -1) {
      throw new Error(
        `Ancre de chapitre introuvable (${langue}, ${slug}) : "${anchor.slice(0, 60)}..." — le texte source a peut-être changé, mettre à jour CHAPITRE_ANCHORS dans scripts/build-heroes-data.mjs.`
      );
    }
    if (idx <= starts[starts.length - 1]) {
      throw new Error(`Ancre de chapitre hors-séquence (${langue}, ${slug}) : "${anchor.slice(0, 60)}..."`);
    }
    starts.push(idx);
  }
  starts.push(paragraphs.length);
  const chapitres = [];
  for (let i = 0; i < 4; i++) {
    chapitres.push({
      numero: i + 1,
      titre: titres[i],
      texte: paragraphs.slice(starts[i], starts[i + 1]).join('\n\n'),
    });
  }
  return chapitres;
}

function buildOne({ slug }) {
  const pays = PAYS_PAR_SLUG[slug];
  const frFile = join(RECITS_DIR, pays, slug, 'fr.md');
  const enFile = join(RECITS_DIR, pays, slug, 'en.md');

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

  const chapitres_storyboard = [1, 2, 3, 4].map((n) => parseChapitre(n, slug));
  const titres = chapitres_storyboard.map((c) => c.titre_chapitre);
  const anchors = CHAPITRE_ANCHORS[slug];
  if (!anchors) {
    throw new Error(`Aucune ancre de chapitre définie pour "${slug}" dans CHAPITRE_ANCHORS.`);
  }

  return {
    slug,
    recit_fr_texte,
    recit_fr_fichier_source: `livrables/sites-web/afroback/Héros/${pays}/${slug}/fr.md`,
    recit_en_texte,
    recit_en_fichier_source: `livrables/sites-web/afroback/Héros/${pays}/${slug}/en.md`,
    recit_chapitres_fr: splitIntoChapters(recit_fr_texte, anchors.fr, titres, slug, 'FR'),
    recit_chapitres_en: splitIntoChapters(recit_en_texte, anchors.en, titres, slug, 'EN'),
    frise_chronologique: parseFrise(frRaw),
    sources: parseSources(frRaw),
    heros_lies: parseHerosLies(frRaw, slug),
    chapitres_storyboard,
  };
}

function main() {
  const availablePays = new Set(readdirSync(RECITS_DIR));
  const result = {};
  for (const { slug, pays } of KNOWN_SLUGS) {
    if (!availablePays.has(pays)) {
      throw new Error(`Dossier pays manquant "${pays}" dans ${RECITS_DIR}`);
    }
    const availableSlugs = new Set(readdirSync(join(RECITS_DIR, pays)));
    if (!availableSlugs.has(slug)) {
      throw new Error(`Dossier manquant pour le slug "${slug}" dans ${join(RECITS_DIR, pays)}`);
    }
    const filesInSlugDir = new Set(readdirSync(join(RECITS_DIR, pays, slug)));
    if (!filesInSlugDir.has('fr.md') || !filesInSlugDir.has('en.md')) {
      throw new Error(`Fichiers fr.md/en.md manquants pour le slug "${slug}" dans ${join(RECITS_DIR, pays, slug)}`);
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
