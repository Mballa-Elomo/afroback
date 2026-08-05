import { supabase } from './supabaseClient';
import type { Mythe } from './mythologieTypes';

/**
 * Source de données réelle : table `mythes` sur Supabase (voir
 * supabase/schema-mythologie.sql). Contenu éditorial public, lecture seule
 * côté app — même pattern de cache mémoire que heroesRepository.ts.
 */

let cache: Mythe[] | null = null;
let inflight: Promise<Mythe[]> | null = null;

async function fetchMythes(): Promise<Mythe[]> {
  const { data, error } = await supabase.from('mythes').select('*').order('ordre_affichage', { ascending: true });
  if (error) {
    throw new Error(`Impossible de charger la mythologie depuis Supabase : ${error.message}`);
  }
  return (data ?? []) as Mythe[];
}

export async function getMythes(): Promise<Mythe[]> {
  if (cache) return cache;
  if (!inflight) {
    inflight = fetchMythes()
      .then((mythes) => {
        cache = mythes;
        return mythes;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function getMytheBySlug(slug: string): Promise<Mythe | undefined> {
  const mythes = await getMythes();
  return mythes.find((m) => m.slug === slug);
}

/** Mythes groupés par zone, dans l'ordre où chaque zone apparaît en base (ordre_affichage). */
export async function getMythesGroupedByZone(): Promise<{ zone: string; items: Mythe[] }[]> {
  const mythes = await getMythes();
  const order: string[] = [];
  const map = new Map<string, Mythe[]>();
  for (const m of mythes) {
    if (!map.has(m.zone)) {
      map.set(m.zone, []);
      order.push(m.zone);
    }
    map.get(m.zone)!.push(m);
  }
  return order.map((zone) => ({ zone, items: map.get(zone)! }));
}
