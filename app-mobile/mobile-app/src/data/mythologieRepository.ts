import { supabase } from './supabaseClient';
import type { Mythe, VideoChapitre } from './mythologieTypes';

/**
 * Source de données réelle : table `mythes` sur Supabase (voir
 * supabase/schema-mythologie.sql et schema-mythologie-extended.sql).
 * Contenu éditorial public, lecture seule côté app — même pattern de cache
 * mémoire que heroesRepository.ts.
 */

/** Même normalisation que heroesRepository.ts (voir ce fichier pour le détail) — un chapitre vidéo peut encore porter l'ancien format `video_url_fr`/`video_url_en` selon l'ordre d'exécution des migrations. */
interface RawVideoChapitre {
  numero: number;
  titre_chapitre: string;
  videos?: Record<string, string> | null;
  video_url_fr?: string | null;
  video_url_en?: string | null;
}

function normalizeVideoChapitre(raw: RawVideoChapitre): VideoChapitre {
  const videos: Record<string, string> = { ...(raw.videos ?? {}) };
  if (raw.video_url_fr && !videos.fr) videos.fr = raw.video_url_fr;
  if (raw.video_url_en && !videos.en) videos.en = raw.video_url_en;
  return { numero: raw.numero, titre_chapitre: raw.titre_chapitre, videos };
}

let cache: Mythe[] | null = null;
let inflight: Promise<Mythe[]> | null = null;

async function fetchMythes(): Promise<Mythe[]> {
  const { data, error } = await supabase.from('mythes').select('*').order('ordre_affichage', { ascending: true });
  if (error) {
    throw new Error(`Impossible de charger la mythologie depuis Supabase : ${error.message}`);
  }
  const mythes = (data ?? []).map((row) => ({
    ...row,
    recit_chapitres_en: row.recit_chapitres_en ?? [],
    narration_audio_url_en: row.narration_audio_url_en ?? null,
    video_chapitres: ((row.video_chapitres ?? []) as RawVideoChapitre[]).map(normalizeVideoChapitre),
    statut_publication: row.statut_publication ?? 'publie',
    a_la_une: row.a_la_une ?? false,
  })) as Mythe[];
  // Filtré côté client, pas dans la requête : reste compatible même si
  // schema-mythologie-extended.sql n'a pas encore été exécuté par Yannick
  // (colonne absente -> traité comme publié), même principe que
  // heroesRepository.ts.
  return mythes.filter((m) => (m.statut_publication ?? 'publie') !== 'depublie');
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

/** Force un vrai aller-retour Supabase, en ignorant le cache — même usage que refreshHeroes() (rafraîchissement auto après une action back-office). */
export async function refreshMythes(): Promise<Mythe[]> {
  const mythes = await fetchMythes();
  cache = mythes;
  return mythes;
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
