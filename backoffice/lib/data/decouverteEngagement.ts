import { getSupabaseAdmin } from '../supabase/server';

/**
 * Miroir de `decouverte_engagement` (schema-decouverte-extended.sql,
 * 2026-08-12) — même principe que `lib/data/engagement.ts` (héros) : 0 réel
 * tant qu'aucun événement n'existe, jamais un chiffre fabriqué, dégradation
 * silencieuse vers 0 si la table n'existe pas encore (migration pas encore
 * exécutée par Yannick).
 */
export interface DecouverteEngagement {
  consultations: number;
  visionnages_video: number;
  visionnages_video_fr: number;
  visionnages_video_en: number;
}

const EMPTY: DecouverteEngagement = { consultations: 0, visionnages_video: 0, visionnages_video_fr: 0, visionnages_video_en: 0 };

export async function getDecouverteEngagement(itemId: string): Promise<DecouverteEngagement> {
  const { data, error } = await getSupabaseAdmin()
    .from('decouverte_engagement')
    .select('consultations, visionnages_video, visionnages_video_fr, visionnages_video_en')
    .eq('item_id', itemId)
    .maybeSingle();
  if (error || !data) return EMPTY;
  return data as DecouverteEngagement;
}

/** Engagement de toutes les fiches, en une seule requête — utilisé par la liste. */
export async function getDecouverteEngagementByItem(): Promise<Map<string, DecouverteEngagement>> {
  const { data, error } = await getSupabaseAdmin()
    .from('decouverte_engagement')
    .select('item_id, consultations, visionnages_video, visionnages_video_fr, visionnages_video_en');
  const map = new Map<string, DecouverteEngagement>();
  if (error || !data) return map;
  for (const row of data as (DecouverteEngagement & { item_id: string })[]) {
    map.set(row.item_id, { consultations: row.consultations, visionnages_video: row.visionnages_video, visionnages_video_fr: row.visionnages_video_fr, visionnages_video_en: row.visionnages_video_en });
  }
  return map;
}

export function decouverteEngagementFor(map: Map<string, DecouverteEngagement>, itemId: string): DecouverteEngagement {
  return map.get(itemId) ?? EMPTY;
}
