import { getSupabaseAdmin } from '../supabase/server';

/**
 * Miroir de `hero_engagement` (mobile-app/supabase/schema-engagement.sql).
 * 3 compteurs réels, incrémentés par l'app mobile à chaque lecture/écoute/
 * visionnage de contenu réel (pas au simple atterrissage sur un état
 * "bientôt disponible" — voir les gardes dans recit.tsx/audio.tsx/video.tsx
 * côté app mobile). Pas de compteur "likes" : contrairement à la maquette
 * (qui en affichait un fictif), aucun système de réaction n'existe dans le
 * modèle de données de ce projet — décision déjà prise et documentée pour
 * le fil Communauté (voir `mobile-app/README.md`, "Pas de compteur ♥"),
 * appliquée ici à l'identique plutôt que de fabriquer un chiffre.
 */
export interface HeroEngagement {
  lectures_recit: number;
  ecoutes_audio: number;
  visionnages_video: number;
}

const EMPTY_ENGAGEMENT: HeroEngagement = { lectures_recit: 0, ecoutes_audio: 0, visionnages_video: 0 };

/**
 * Engagement d'un héros précis. Ne lève jamais d'exception : si
 * `schema-engagement.sql` n'a pas encore été exécuté par Yannick (table
 * absente) ou en cas d'erreur réseau, retombe sur 0 partout plutôt que de
 * faire planter la fiche héros pour un panneau secondaire — cohérent avec
 * "0 réel tant qu'aucun événement n'existe" (littéralement vrai : sans la
 * table, aucun événement n'a jamais pu être enregistré).
 */
export async function getHeroEngagement(heroId: string): Promise<HeroEngagement> {
  const { data, error } = await getSupabaseAdmin()
    .from('hero_engagement')
    .select('lectures_recit, ecoutes_audio, visionnages_video')
    .eq('hero_id', heroId)
    .maybeSingle();
  if (error || !data) return EMPTY_ENGAGEMENT;
  return data as HeroEngagement;
}

/** Somme des 3 compteurs sur tous les héros — utilisé par le Tableau de bord. Même dégradation silencieuse que ci-dessus si la table est absente. */
export async function getTotalEngagement(): Promise<HeroEngagement> {
  const rows = await fetchAllEngagementRows();
  return rows.reduce<HeroEngagement>(
    (acc, row) => ({
      lectures_recit: acc.lectures_recit + (row.lectures_recit ?? 0),
      ecoutes_audio: acc.ecoutes_audio + (row.ecoutes_audio ?? 0),
      visionnages_video: acc.visionnages_video + (row.visionnages_video ?? 0),
    }),
    { ...EMPTY_ENGAGEMENT }
  );
}

/**
 * Engagement de tous les héros, en une seule requête (pas une requête par
 * héros dans une boucle) — utilisé par la liste des héros pour afficher 3
 * indicateurs compacts par ligne. `Map` indexée par `hero_id`, avec
 * `EMPTY_ENGAGEMENT` en repli pour tout héros sans ligne dans
 * `hero_engagement` (aucun événement enregistré à ce jour, ou table absente).
 */
export async function getEngagementByHero(): Promise<Map<string, HeroEngagement>> {
  const rows = await fetchAllEngagementRowsWithId();
  const map = new Map<string, HeroEngagement>();
  for (const row of rows) {
    map.set(row.hero_id, { lectures_recit: row.lectures_recit, ecoutes_audio: row.ecoutes_audio, visionnages_video: row.visionnages_video });
  }
  return map;
}

export function engagementFor(map: Map<string, HeroEngagement>, heroId: string): HeroEngagement {
  return map.get(heroId) ?? EMPTY_ENGAGEMENT;
}

async function fetchAllEngagementRows(): Promise<HeroEngagement[]> {
  const { data, error } = await getSupabaseAdmin().from('hero_engagement').select('lectures_recit, ecoutes_audio, visionnages_video');
  if (error || !data) return [];
  return data as HeroEngagement[];
}

async function fetchAllEngagementRowsWithId(): Promise<(HeroEngagement & { hero_id: string })[]> {
  const { data, error } = await getSupabaseAdmin().from('hero_engagement').select('hero_id, lectures_recit, ecoutes_audio, visionnages_video');
  if (error || !data) return [];
  return data as (HeroEngagement & { hero_id: string })[];
}

/**
 * Détail FR/EN et par chapitre vidéo — extension du 2026-08-06 (demande de
 * Yannick : savoir quel audio et quel chapitre sont les plus consultés),
 * voir `mobile-app/supabase/schema-engagement-detail.sql`.
 *
 * Requêtes VOLONTAIREMENT séparées des fonctions ci-dessus, jamais fusionnées
 * dans le même `select()` : si `schema-engagement-detail.sql` n'a pas encore
 * été exécuté (colonnes `ecoutes_audio_fr`/`_en` ou table
 * `hero_video_chapter_engagement` absentes), une requête qui les demanderait
 * dans le même appel que `lectures_recit`/`ecoutes_audio`/`visionnages_video`
 * échouerait EN BLOC — ce qui aurait fait régresser à 0 le panneau
 * ENGAGEMENT GLOBAL déjà fonctionnel depuis ce matin. En les isolant, seul
 * le détail fin dégrade silencieusement vers 0/absent tant que la migration
 * n'est pas jouée ; les totaux agrégés déjà en place restent intacts.
 */
export interface AudioEngagementDetail {
  fr: number;
  en: number;
}

const EMPTY_AUDIO_DETAIL: AudioEngagementDetail = { fr: 0, en: 0 };

export async function getAudioEngagementDetail(heroId: string): Promise<AudioEngagementDetail> {
  const { data, error } = await getSupabaseAdmin()
    .from('hero_engagement')
    .select('ecoutes_audio_fr, ecoutes_audio_en')
    .eq('hero_id', heroId)
    .maybeSingle();
  if (error || !data) return EMPTY_AUDIO_DETAIL;
  return { fr: data.ecoutes_audio_fr ?? 0, en: data.ecoutes_audio_en ?? 0 };
}

export interface VideoChapterEngagementRow {
  chapitre_numero: number;
  langue: 'fr' | 'en';
  visionnages: number;
}

/** Toutes les lignes de détail vidéo pour UN héros — utilisé par la fiche détail (grille "Vidéo par chapitre × langue"). */
export async function getVideoChapterEngagement(heroId: string): Promise<VideoChapterEngagementRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('hero_video_chapter_engagement')
    .select('chapitre_numero, langue, visionnages')
    .eq('hero_id', heroId);
  if (error || !data) return [];
  return data as VideoChapterEngagementRow[];
}

/** `Map` indexée `"numero-langue"` (ex. `"1-fr"`) pour une lecture O(1) case par case dans `ChapterVideoGrid`. */
export function videoChapterEngagementMap(rows: VideoChapterEngagementRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) map.set(`${row.chapitre_numero}-${row.langue}`, row.visionnages);
  return map;
}
