import { supabase } from './supabaseClient';
import type { Heros, VideoChapitre } from './types';

/**
 * Source de données réelle : table `heros` sur Supabase (voir
 * supabase/seed.sql pour le schéma et le seed des 9 héros). Toute l'UI ne
 * consomme que les fonctions exportées ici — c'est le seul fichier à
 * modifier si la source change un jour (ex. ajout d'un cache offline).
 */

/**
 * Forme brute possible d'un chapitre vidéo en base au moment de cette
 * transition (2026-08-09, passage FR/EN fixe -> `videos` multi-langues, voir
 * backoffice/supabase/migration-video-chapitres-multilangue.sql) : selon que
 * la migration a déjà tourné ou non côté Supabase, une ligne peut encore
 * porter les anciennes clés `video_url_fr`/`video_url_en` au lieu de
 * `videos`. Normalisé ici, une seule fois, pour que le reste de l'app ne
 * connaisse plus que la forme `videos`.
 */
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
  const heroes = (data ?? []).map((row) => ({
    ...row,
    video_chapitres: ((row.video_chapitres ?? []) as RawVideoChapitre[]).map(normalizeVideoChapitre),
  })) as Heros[];
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
