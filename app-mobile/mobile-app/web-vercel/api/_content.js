// Lecture d'un contenu AFROBACK pour le partage (colonnes "catalogue" publiques
// uniquement : titre, résumé, image). Code court : h-<slug> (héros),
// m-<slug> (mythe), d-<slug> (Découverte).
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './_config.js';

const TYPES = {
  h: {
    table: 'heros',
    select: 'slug,nom_affiche,sous_titre,resume_catalogue,image_carte_catalogue',
    path: '/accueil/heros/',
    kicker: 'HISTOIRES & HÉROS',
    accroche: (t) => `Découvre l'histoire de ${t} sur AFROBACK`,
    map: (r) => ({ titre: r.nom_affiche, description: r.sous_titre || r.resume_catalogue, image: r.image_carte_catalogue }),
  },
  m: {
    table: 'mythes',
    select: 'slug,titre,sous_titre,peuple,image_url',
    path: '/accueil/mythologie/',
    kicker: 'MYTHOLOGIE AFRICAINE',
    accroche: (t) => `Découvre le mythe « ${t} » sur AFROBACK`,
    map: (r) => ({ titre: r.titre, description: r.sous_titre, image: r.image_url }),
  },
  d: {
    table: 'decouverte_items',
    select: 'slug,titre,sous_titre,resume_liste,image_url',
    path: '/decouverte/',
    kicker: 'DÉCOUVERTE DU PATRIMOINE',
    accroche: (t) => `À découvrir sur AFROBACK : ${t}`,
    map: (r) => ({ titre: r.titre, description: r.resume_liste || r.sous_titre, image: r.image_url }),
  },
};

/** Première phrase, ou coupe propre à ~160 caractères. */
export function shortDescription(text, max = 160) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  const dot = t.indexOf('. ');
  if (dot > 30 && dot < max) return t.slice(0, dot + 1);
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max)) + '…';
}

export async function loadContent(code) {
  const m = /^([hmd])-([a-z0-9-]{1,80})$/.exec(String(code || ''));
  if (!m) return null;
  const type = TYPES[m[1]];
  const slug = m[2];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${type.table}?slug=eq.${slug}&select=${type.select}&limit=1`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  const rows = res.ok ? await res.json() : [];
  if (!rows[0]) return null;
  const c = type.map(rows[0]);
  return {
    code,
    slug,
    path: type.path + slug,
    kicker: type.kicker,
    titre: c.titre,
    accroche: type.accroche(c.titre),
    description: shortDescription(c.description),
    image: c.image || null,
  };
}

export function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}
