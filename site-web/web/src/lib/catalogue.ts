import { restGet, rpcGet } from './supabase';
import type { ContentType, DecouverteCard, DecouverteKind, Detail, HerosCard, MytheCard, Tile } from './types';
import { loc, type Lang } from './lang';

/**
 * Catalogue AFROBACK (lecture seule, côté serveur). Mêmes colonnes publiques
 * que l'application (app-mobile/mobile-app/src/data/*Repository.ts), mêmes
 * règles : contenus dépubliés masqués, contenu complet uniquement via
 * get_*_detail.
 */

const HEROS_COLS =
  'id,slug,nom_affiche,nom_complet,sous_titre,epoque,region,theme,resume_catalogue,image_carte_catalogue,ordre_affichage,statut_publication,a_la_une,statut_video,statut_narration_audio';
const MYTHES_COLS = 'id,slug,titre,sous_titre,peuple,region,zone,epoque,image_url,ordre_affichage,statut_publication,a_la_une';
const DECOUVERTE_COLS = 'id,slug,type,pays,region_ethnie,titre,sous_titre,resume_liste,image_url,ordre_affichage,statut_publication,a_la_une';
// Jumelles anglaises (supabase/schema-i18n-contenu-en.sql). Tant que ce script
// n'est pas exécuté, la lecture retombe sur les seules colonnes françaises.
const HEROS_EN = ',nom_affiche_en,sous_titre_en,epoque_en,region_en,resume_catalogue_en';
const MYTHES_EN = ',titre_en,sous_titre_en,peuple_en,region_en,zone_en,epoque_en';
const DECOUVERTE_EN = ',titre_en,sous_titre_en,pays_en,region_ethnie_en,resume_liste_en';

async function withEn<T>(table: string, cols: string, en: string): Promise<T[]> {
  try {
    return await restGet<T[]>(`${table}?select=${cols}${en}&order=ordre_affichage.asc`);
  } catch {
    return restGet<T[]>(`${table}?select=${cols}&order=ordre_affichage.asc`);
  }
}

const published = <T extends { statut_publication?: string | null }>(rows: T[]) =>
  rows.filter((r) => (r.statut_publication ?? 'publie') !== 'depublie');

export const DECOUVERTE_LABEL: Record<DecouverteKind, string> = {
  village: 'Village',
  coutume: 'Coutume',
  objet: 'Objet',
  personnage: 'Personnage',
};
export const DECOUVERTE_LABEL_EN: Record<DecouverteKind, string> = {
  village: 'Village',
  coutume: 'Custom',
  objet: 'Object',
  personnage: 'Figure',
};
export const decouverteLabel = (k: DecouverteKind, lang: Lang) => (lang === 'en' ? DECOUVERTE_LABEL_EN : DECOUVERTE_LABEL)[k] ?? k;

/** Thèmes des héros : la valeur française reste la clé (filtres), seule l'étiquette change. */
const THEME_EN: Record<string, string> = { Résistance: 'Resistance', Politique: 'Politics', Science: 'Science', Art: 'Art' };
export const themeLabel = (t: string, lang: Lang) => (lang === 'en' ? THEME_EN[t] ?? t : t);

export const TYPE_PATH: Record<ContentType, string> = { heros: 'heros', mythe: 'mythes', decouverte: 'decouverte' };
const DETAIL_RPC: Record<ContentType, string> = {
  heros: 'get_heros_detail',
  mythe: 'get_mythe_detail',
  decouverte: 'get_decouverte_detail',
};

export async function getHeroes(): Promise<HerosCard[]> {
  return published(await withEn<HerosCard>('heros', HEROS_COLS, HEROS_EN));
}
export async function getMythes(): Promise<MytheCard[]> {
  return published(await withEn<MytheCard>('mythes', MYTHES_COLS, MYTHES_EN));
}
export async function getDecouverte(): Promise<DecouverteCard[]> {
  return published(await withEn<DecouverteCard>('decouverte_items', DECOUVERTE_COLS, DECOUVERTE_EN));
}

/** Contenus gratuits (table modifiable depuis le back-office). Clé : "type:slug". */
export async function getFreeSet(): Promise<Set<string>> {
  try {
    const rows = await restGet<{ type: string; slug: string }[]>('contenus_gratuits?select=type,slug');
    return new Set(rows.map((r) => `${r.type}:${r.slug}`));
  } catch {
    return new Set();
  }
}

type Stat = { likes: number; score: number };

/** Statistiques réelles par slug (fonction stats_contenus), jamais inventées. */
export async function getStats(type: ContentType, slugs: string[]): Promise<Map<string, Stat>> {
  if (slugs.length === 0) return new Map();
  try {
    const rows = await rpcGet<{ slug: string; likes: number; lectures: number; ecoutes: number; vues: number }[]>('stats_contenus', { p_type: type, p_slugs: slugs });
    return new Map(rows.map((r) => [r.slug, { likes: r.likes ?? 0, score: (r.lectures ?? 0) + (r.ecoutes ?? 0) + (r.vues ?? 0) + (r.likes ?? 0) }]));
  } catch {
    return new Map();
  }
}

/** Détail d'un contenu : complet si gratuit (en invité), aperçu verrouillé sinon. */
export async function getDetail(type: ContentType, slug: string): Promise<Detail | null> {
  try {
    const data = await rpcGet<Detail | null>(DETAIL_RPC[type], { p_slug: slug }, 60);
    return data ?? null;
  } catch {
    return null;
  }
}

function firstSentence(text: string, max = 150): string {
  const t = (text ?? '').replace(/\s+/g, ' ').trim();
  const dot = t.indexOf('. ');
  if (dot > 30 && dot < max) return t.slice(0, dot + 1);
  return t.length <= max ? t : `${t.slice(0, t.lastIndexOf(' ', max))}…`;
}

type Row = Record<string, unknown>;

export function heroTile(h: HerosCard, free: Set<string>, likes: Map<string, Stat>, lang: Lang = 'fr'): Tile {
  const r = h as unknown as Row;
  return {
    type: 'heros',
    slug: h.slug,
    title: loc<string>(r, 'nom_affiche', lang),
    kicker: (h.theme ?? []).map((t) => themeLabel(t, lang)).join(' · ').toUpperCase(),
    meta: (loc<string>(r, 'epoque', lang) ?? '').split(/[(,]/)[0].trim(),
    summary: firstSentence(loc<string>(r, 'sous_titre', lang) || loc<string>(r, 'resume_catalogue', lang)),
    image: h.image_carte_catalogue,
    free: free.has(`heros:${h.slug}`),
    likes: likes.get(h.slug)?.likes ?? 0,
    score: likes.get(h.slug)?.score ?? 0,
  };
}
export function mytheTile(m: MytheCard, free: Set<string>, likes: Map<string, Stat>, lang: Lang = 'fr'): Tile {
  const r = m as unknown as Row;
  return {
    type: 'mythe',
    slug: m.slug,
    title: loc<string>(r, 'titre', lang),
    kicker: (loc<string>(r, 'peuple', lang) ?? '').split(/[(,]/)[0].trim().toUpperCase(),
    meta: loc<string>(r, 'zone', lang),
    summary: firstSentence(loc<string>(r, 'sous_titre', lang)),
    image: m.image_url,
    free: free.has(`mythe:${m.slug}`),
    likes: likes.get(m.slug)?.likes ?? 0,
    score: likes.get(m.slug)?.score ?? 0,
  };
}
export function decouverteTile(d: DecouverteCard, free: Set<string>, likes: Map<string, Stat>, lang: Lang = 'fr'): Tile {
  const r = d as unknown as Row;
  return {
    type: 'decouverte',
    slug: d.slug,
    title: loc<string>(r, 'titre', lang),
    kicker: decouverteLabel(d.type, lang).toUpperCase(),
    meta: [loc<string>(r, 'region_ethnie', lang), loc<string>(r, 'pays', lang)].filter(Boolean).join(' · '),
    summary: firstSentence(loc<string>(r, 'resume_liste', lang) || loc<string>(r, 'sous_titre', lang)),
    image: d.image_url,
    free: free.has(`decouverte:${d.slug}`),
    likes: likes.get(d.slug)?.likes ?? 0,
    score: likes.get(d.slug)?.score ?? 0,
  };
}

/** Tout le catalogue en cartes (accueil, recherche, listes). */
export async function getAllTiles(lang: Lang = 'fr') {
  const [heroes, mythes, decouverte, free] = await Promise.all([getHeroes(), getMythes(), getDecouverte(), getFreeSet()]);
  const [lh, lm, ld] = await Promise.all([
    getStats('heros', heroes.map((h) => h.slug)),
    getStats('mythe', mythes.map((m) => m.slug)),
    getStats('decouverte', decouverte.map((d) => d.slug)),
  ]);
  return {
    heroes,
    mythes,
    decouverte,
    heroTiles: heroes.map((h) => heroTile(h, free, lh, lang)),
    mytheTiles: mythes.map((m) => mytheTile(m, free, lm, lang)),
    decouverteTiles: decouverte.map((d) => decouverteTile(d, free, ld, lang)),
  };
}

/** Héros à la une : choisi depuis le back-office, sinon rotation quotidienne (même règle que l'app). */
export function pickFeatured(heroes: HerosCard[]): HerosCard | undefined {
  if (heroes.length === 0) return undefined;
  const start = Date.UTC(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start) / 86400000);
  const featured = heroes.filter((h) => h.a_la_une);
  if (featured.length > 0) return featured[day % featured.length];
  const withImage = heroes.filter((h) => h.image_carte_catalogue);
  const pool = withImage.length > 0 ? withImage : heroes;
  return pool[day % pool.length];
}

export function tileHref(t: { type: ContentType; slug: string }) {
  return `/${TYPE_PATH[t.type]}/${t.slug}`;
}
