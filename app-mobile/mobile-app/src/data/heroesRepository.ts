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
  return (data ?? []) as Heros[];
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
