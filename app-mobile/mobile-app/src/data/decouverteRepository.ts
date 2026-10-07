import { supabase } from './supabaseClient';
import type { DecouverteItem, DecouvertePays } from './decouverteTypes';
import { getContentDetail } from './contentAccess';
import i18n from '../i18n';
import { DECOUVERTE_EN_COLUMNS, DECOUVERTE_EN_FIELDS, PAYS_EN_FIELDS, localize } from '../i18n/content';

/**
 * Source de données réelle : tables `decouverte_items` et `decouverte_pays`
 * sur Supabase (voir supabase/seed-decouverte.sql pour le schéma, exécuté
 * dans le dashboard le 2026-07-30). Lecture publique en RLS, écriture
 * réservée à service_role — ce repository est donc lecture seule, comme
 * heroesRepository.ts. Toute l'UI ne doit consommer que les fonctions
 * exportées ici.
 */

/** Colonnes publiques du catalogue ; le texte, les sources et la vidéo passent par `get_decouverte_detail` (voir heroesRepository.ts). */
const DECOUVERTE_CATALOGUE =
  'id,slug,type,pays,region_ethnie,titre,sous_titre,resume_liste,image_url,heros_lies,items_lies,statut_contenu,' +
  'ordre_affichage,statut_publication,a_la_une';

let itemsCache: DecouverteItem[] | null = null;
let itemsInflight: Promise<DecouverteItem[]> | null = null;
let paysCache: DecouvertePays[] | null = null;
let paysInflight: Promise<DecouvertePays[]> | null = null;
i18n.on('languageChanged', () => {
  itemsCache = null;
  paysCache = null;
});

async function fetchDecouverteItems(): Promise<DecouverteItem[]> {
  let { data, error }: { data: unknown; error: { message: string } | null } = await supabase
    .from('decouverte_items')
    .select(DECOUVERTE_CATALOGUE + DECOUVERTE_EN_COLUMNS)
    .order('ordre_affichage', { ascending: true });
  if (error) {
    ({ data, error } = await supabase.from('decouverte_items').select(DECOUVERTE_CATALOGUE).order('ordre_affichage', { ascending: true }));
  }
  if (error) {
    throw new Error(`Impossible de charger le contenu Découverte depuis Supabase : ${error.message}`);
  }
  const items = ((data ?? []) as unknown as Record<string, unknown>[]).map((raw) => localize(raw, DECOUVERTE_EN_FIELDS)).map((row) => ({
    contenu_fr_texte: '',
    contenu_en_texte: null,
    statut_fait_legende: [],
    sources: [],
    ...row,
    statut_publication: row.statut_publication ?? 'publie',
    a_la_une: row.a_la_une ?? false,
    videos: {},
  })) as unknown as DecouverteItem[];
  // Filtré côté client, pas dans la requête : reste compatible même si
  // schema-decouverte-extended.sql n'a pas encore été exécuté par Yannick
  // (colonne absente -> traité comme publié), même principe que
  // heroesRepository.ts.
  return items.filter((it) => (it.statut_publication ?? 'publie') !== 'depublie');
}

export async function getDecouverteItems(): Promise<DecouverteItem[]> {
  if (itemsCache) return itemsCache;
  if (!itemsInflight) {
    itemsInflight = fetchDecouverteItems()
      .then((items) => {
        itemsCache = items;
        return items;
      })
      .finally(() => {
        itemsInflight = null;
      });
  }
  return itemsInflight;
}

/** Force un vrai aller-retour Supabase, en ignorant le cache — même usage que refreshHeroes() (rafraîchissement auto après une action back-office). */
export async function refreshDecouverteItems(): Promise<DecouverteItem[]> {
  const items = await fetchDecouverteItems();
  itemsCache = items;
  return items;
}

/** Fiche complète (texte, faits, sources, vidéo) si autorisée, sinon catalogue + aperçu et `acces.verrouille`. */
export async function getDecouverteItemBySlug(slug: string): Promise<DecouverteItem | undefined> {
  const items = await getDecouverteItems();
  const base = items.find((it) => it.slug === slug);
  if (!base) return undefined;
  const detail = await getContentDetail('decouverte', slug);
  if (!detail) return undefined;
  if (detail.verrouille) {
    return { ...base, acces: { verrouille: true, apercu_fr: detail.apercu_fr, apercu_en: detail.apercu_en } };
  }
  const row = localize(detail.row, DECOUVERTE_EN_FIELDS);
  return {
    ...base,
    ...(row as unknown as DecouverteItem),
    videos: (row.videos as Record<string, string>) ?? {},
    acces: { verrouille: false },
  };
}

/** Regroupe par type (village/coutume/objet/personnage/fait) — utile pour la liste et le hub pays. */
export async function getDecouverteItemsByType(type: DecouverteItem['type']): Promise<DecouverteItem[]> {
  const items = await getDecouverteItems();
  return items.filter((it) => it.type === type);
}

export async function getDecouverteItemsByPays(pays: string): Promise<DecouverteItem[]> {
  const items = await getDecouverteItems();
  return items.filter((it) => it.pays === pays);
}

/** Items Découverte liés à un héros donné (pont explicite entre les deux piliers, ex. depuis la fiche héros). */
export async function getDecouverteItemsForHero(heroSlug: string): Promise<DecouverteItem[]> {
  const items = await getDecouverteItems();
  return items.filter((it) => it.heros_lies.includes(heroSlug));
}

export async function getRelatedDecouverteItems(item: DecouverteItem): Promise<DecouverteItem[]> {
  const all = await getDecouverteItems();
  return item.items_lies
    .map((slug) => all.find((it) => it.slug === slug))
    .filter((it): it is DecouverteItem => Boolean(it));
}

async function fetchDecouvertePays(): Promise<DecouvertePays[]> {
  const { data, error } = await supabase
    .from('decouverte_pays')
    .select('*')
    .order('ordre_affichage', { ascending: true });
  if (error) {
    throw new Error(`Impossible de charger les pays Découverte depuis Supabase : ${error.message}`);
  }
  return ((data ?? []) as DecouvertePays[]).map((p) => localize(p, PAYS_EN_FIELDS));
}

export async function getDecouvertePays(): Promise<DecouvertePays[]> {
  if (paysCache) return paysCache;
  if (!paysInflight) {
    paysInflight = fetchDecouvertePays()
      .then((pays) => {
        paysCache = pays;
        return pays;
      })
      .finally(() => {
        paysInflight = null;
      });
  }
  return paysInflight;
}
