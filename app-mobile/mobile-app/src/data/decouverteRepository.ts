import { supabase } from './supabaseClient';
import type { DecouverteItem, DecouvertePays } from './decouverteTypes';

/**
 * Source de données réelle : tables `decouverte_items` et `decouverte_pays`
 * sur Supabase (voir supabase/seed-decouverte.sql pour le schéma, exécuté
 * dans le dashboard le 2026-07-30). Lecture publique en RLS, écriture
 * réservée à service_role — ce repository est donc lecture seule, comme
 * heroesRepository.ts. Toute l'UI ne doit consommer que les fonctions
 * exportées ici.
 */

let itemsCache: DecouverteItem[] | null = null;
let itemsInflight: Promise<DecouverteItem[]> | null = null;
let paysCache: DecouvertePays[] | null = null;
let paysInflight: Promise<DecouvertePays[]> | null = null;

async function fetchDecouverteItems(): Promise<DecouverteItem[]> {
  const { data, error } = await supabase
    .from('decouverte_items')
    .select('*')
    .order('ordre_affichage', { ascending: true });
  if (error) {
    throw new Error(`Impossible de charger le contenu Découverte depuis Supabase : ${error.message}`);
  }
  return (data ?? []) as DecouverteItem[];
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

export async function getDecouverteItemBySlug(slug: string): Promise<DecouverteItem | undefined> {
  const items = await getDecouverteItems();
  return items.find((it) => it.slug === slug);
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
  return (data ?? []) as DecouvertePays[];
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
