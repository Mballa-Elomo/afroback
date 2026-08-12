import { getSupabaseAdmin } from '../supabase/server';
import { normalizeHeroVideoChapitres, type HerosAdmin } from './heros';
import type { AudioEngagementDetail, HeroEngagement, VideoChapterEngagementRow } from './engagement';

/**
 * Lecture combinée pour la fiche héros admin (`/heros/[slug]`) : héros +
 * engagement global + détail audio + détail vidéo par chapitre, en UN SEUL
 * aller-retour réseau via la fonction Postgres `admin_get_hero_detail`
 * (`supabase/schema-hero-detail-rpc.sql`), plutôt que 2 étapes séquentielles
 * (lecture du héros, puis — une fois son id connu — 3 requêtes d'engagement
 * en parallèle). Diagnostic du 2026-08-12 (retour de lenteur de Yannick,
 * instrumentation temporaire dans lib/timing.ts) : chaque aller-retour réel
 * mesuré entre 300ms et 1100ms, les additionner coûtait jusqu'à ~2,3s par
 * chargement de fiche. Le contrôle admin (`admin_users`, lib/auth.ts) reste
 * une étape séparée dans le layout — non fusionnable ici sans restructurer
 * l'authentification, hors périmètre de ce correctif.
 */
export interface HeroAdminDetail {
  hero: HerosAdmin;
  engagement: HeroEngagement;
  audioDetail: AudioEngagementDetail;
  videoChapterEngagement: VideoChapterEngagementRow[];
}

const EMPTY_ENGAGEMENT: HeroEngagement = { lectures_recit: 0, ecoutes_audio: 0, visionnages_video: 0 };
const EMPTY_AUDIO_DETAIL: AudioEngagementDetail = { fr: 0, en: 0 };

export async function getHeroAdminDetail(slug: string): Promise<HeroAdminDetail | null> {
  const { data, error } = await getSupabaseAdmin().rpc('admin_get_hero_detail', { p_slug: slug });
  if (error) throw new Error(`Impossible de charger ce héros : ${error.message}`);
  if (!data || !data.hero) return null;

  const raw = data as {
    hero: Record<string, unknown>;
    engagement: (HeroEngagement & AudioEngagementDetail) | null;
    video_chapter_engagement: VideoChapterEngagementRow[] | null;
  };

  return {
    hero: normalizeHeroVideoChapitres(raw.hero as unknown as HerosAdmin),
    engagement: raw.engagement
      ? {
          lectures_recit: raw.engagement.lectures_recit ?? 0,
          ecoutes_audio: raw.engagement.ecoutes_audio ?? 0,
          visionnages_video: raw.engagement.visionnages_video ?? 0,
        }
      : EMPTY_ENGAGEMENT,
    audioDetail: raw.engagement ? { fr: raw.engagement.fr ?? 0, en: raw.engagement.en ?? 0 } : EMPTY_AUDIO_DETAIL,
    videoChapterEngagement: raw.video_chapter_engagement ?? [],
  };
}
