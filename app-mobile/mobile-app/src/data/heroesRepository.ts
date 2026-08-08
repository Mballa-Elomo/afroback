import { supabase } from './supabaseClient';
import type { Heros } from './types';

/**
 * Source de données réelle : table `heros` sur Supabase (voir
 * supabase/seed.sql pour le schéma et le seed des 9 héros). Toute l'UI ne
 * consomme que les fonctions exportées ici — c'est le seul fichier à
 * modifier si la source change un jour (ex. ajout d'un cache offline).
 */

let cache: Heros[] | null = null;
let inflight: Promise<Heros[]> | null = null;

async function fetchHeroes(): Promise<Heros[]> {
  const { data, error } = await supabase
    .from('heros')
    .select('*')
    .order('ordre_affichage', { ascending: true });
  if (error) {
    throw new Error(`Impossible de charger les héros depuis Supabase : ${error.message}`);
  }
  const heroes = (data ?? []) as Heros[];
  // Filtré côté client, pas dans la requête Supabase : reste compatible même
  // si backoffice/supabase/schema-admin-heros.sql n'a pas encore été exécuté
  // par Yannick (colonne absente -> traité comme publié, comportement
  // identique à avant l'introduction du back-office).
  return heroes.filter((h) => (h.statut_publication ?? 'publie') !== 'depublie');
}

export async function getHeroes(): Promise<Heros[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetchHeroes()
      .then((heroes) => {
        cache = heroes;
        return heroes;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/**
 * Force un vrai aller-retour Supabase, en ignorant le cache mémoire —
 * utilisé par `useHeroesList()` (voir useHeroesData.ts) pour que le
 * catalogue héros et l'accueil se rafraîchissent tout seuls quand l'écran
 * reprend le focus (ex. après une action faite depuis le back-office :
 * publier/dépublier, mettre à la une). Sans cette fonction, `getHeroes()`
 * continuerait à renvoyer le même tableau en mémoire pour toute la durée de
 * vie du process, quel que soit le nombre de refocus.
 */
export async function refreshHeroes(): Promise<Heros[]> {
  const heroes = await fetchHeroes();
  cache = heroes;
  return heroes;
}

export async function getHeroBySlug(slug: string): Promise<Heros | undefined> {
  const heroes = await getHeroes();
  return heroes.find((h) => h.slug === slug);
}

export async function getRelatedHeroes(heros: Heros): Promise<Heros[]> {
  const all = await getHeroes();
  return heros.heros_lies
    .map((slug) => all.find((h) => h.slug === slug))
    .filter((h): h is Heros => Boolean(h));
}
