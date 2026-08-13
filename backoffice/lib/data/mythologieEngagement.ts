import { getSupabaseAdmin } from '../supabase/server';

/**
 * Miroir de `mythe_engagement`/`mythe_video_chapter_engagement`
 * (schema-mythologie-extended.sql, 2026-08-12) — même principe que
 * `lib/data/engagement.ts` (héros) : 0 réel tant qu'aucun événement
 * n'existe, dégradation silencieuse vers 0 si la table n'existe pas encore.
 */
export interface MytheEngagement {
  lectures_recit: number;
  ecoutes_audio: number;
  ecoutes_audio_fr: number;
  ecoutes_audio_en: number;
  visionnages_video: number;
}

const EMPTY: MytheEngagement = { lectures_recit: 0, ecoutes_audio: 0, ecoutes_audio_fr: 0, ecoutes_audio_en: 0, visionnages_video: 0 };

export async function getMytheEngagement(mytheId: string): Promise<MytheEngagement> {
  const { data, error } = await getSupabaseAdmin()
    .from('mythe_engagement')
    .select('lectures_recit, ecoutes_audio, ecoutes_audio_fr, ecoutes_audio_en, visionnages_video')
    .eq('mythe_id', mytheId)
    .maybeSingle();
  if (error || !data) return EMPTY;
  return data as MytheEngagement;
}

/** Engagement de tous les mythes, en une seule requête — utilisé par la liste. */
export async function getMytheEngagementByMythe(): Promise<Map<string, MytheEngagement>> {
  const { data, error } = await getSupabaseAdmin()
    .from('mythe_engagement')
    .select('mythe_id, lectures_recit, ecoutes_audio, ecoutes_audio_fr, ecoutes_audio_en, visionnages_video');
  const map = new Map<string, MytheEngagement>();
  if (error || !data) return map;
  for (const row of data as (MytheEngagement & { mythe_id: string })[]) {
    map.set(row.mythe_id, {
      lectures_recit: row.lectures_recit,
      ecoutes_audio: row.ecoutes_audio,
      ecoutes_audio_fr: row.ecoutes_audio_fr,
      ecoutes_audio_en: row.ecoutes_audio_en,
      visionnages_video: row.visionnages_video,
    });
  }
  return map;
}

export function mytheEngagementFor(map: Map<string, MytheEngagement>, mytheId: string): MytheEngagement {
  return map.get(mytheId) ?? EMPTY;
}

export interface MytheVideoChapterEngagementRow {
  chapitre_numero: number;
  langue: string;
  visionnages: number;
}

/** Toutes les lignes de détail vidéo pour UN mythe — utilisé par la fiche détail (grille "Vidéo par chapitre × langue"). */
export async function getMytheVideoChapterEngagement(mytheId: string): Promise<MytheVideoChapterEngagementRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('mythe_video_chapter_engagement')
    .select('chapitre_numero, langue, visionnages')
    .eq('mythe_id', mytheId);
  if (error || !data) return [];
  return data as MytheVideoChapterEngagementRow[];
}
