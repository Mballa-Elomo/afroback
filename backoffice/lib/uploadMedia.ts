import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from './supabase/server';
import { requireAdmin } from './auth';
import { logActivity } from './activityLog';
import { getHeroBySlugAdmin, type VideoChapitreAdmin } from './data/heros';
import { LANGUES_VIDEO } from './langues';
import { applyWatermark } from './watermark';

/**
 * Logique d'upload de médias héros, PARTAGÉE entre les Route Handlers
 * (`app/api/heros/[slug]/media/route.ts`, `.../chapter-video/route.ts`) —
 * jamais des Server Actions pour un transfert de fichier réel, voir
 * l'explication détaillée dans backoffice/README.md ("Bug corrigé — upload
 * réel qui échouait systématiquement, 2026-08-06 (v2)").
 *
 * Résumé de la raison : `saveMetadata`/`removeMedia`/etc. restent des
 * Server Actions (petits payloads, aucun souci constaté), mais le transfert
 * du FICHIER lui-même passe maintenant par un Route Handler classique
 * (`request.formData()`, API Fetch standard), pas par le mécanisme
 * multipart spécifique aux Server Actions (busboy + `decodeReplyFromBusboy`
 * + `pipeline`, voir `node_modules/next/dist/server/app-render/
 * action-handler.js` — chemin de code qui porte encore un commentaire
 * `TODO-APP: Add streaming support` dans cette version de Next.js).
 */

export const BUCKET = 'heroes-media';

export type MediaSlot = 'photo' | 'audioFr' | 'audioEn' | 'video';

export const SLOT_COLUMN: Record<MediaSlot, string> = {
  photo: 'image_carte_catalogue',
  audioFr: 'narration_audio_fr_url',
  audioEn: 'narration_audio_en_url',
  video: 'video_url',
};

const SLOT_EXT: Record<MediaSlot, string[]> = {
  photo: ['jpg', 'jpeg', 'png', 'webp'],
  audioFr: ['mp3'],
  audioEn: ['mp3'],
  video: ['mp4'],
};

const SLOT_PATH_PREFIX: Record<MediaSlot, string> = {
  photo: 'images',
  audioFr: 'audio',
  audioEn: 'audio',
  video: 'video',
};

const SLOT_SUFFIX: Record<MediaSlot, string> = {
  photo: '',
  audioFr: '-fr',
  audioEn: '-en',
  video: '',
};

export function describeError(e: unknown): string {
  if (e instanceof Error) return e.message || 'Erreur inattendue — réessaie.';
  return 'Erreur inattendue — réessaie.';
}

export function isMediaSlot(v: unknown): v is MediaSlot {
  return v === 'photo' || v === 'audioFr' || v === 'audioEn' || v === 'video';
}

export async function performMediaUpload(slug: string, kind: MediaSlot, file: File): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!SLOT_EXT[kind].includes(ext)) {
    return { error: `Format .${ext || '?'} non accepté pour ce champ (attendu : ${SLOT_EXT[kind].join(', ')}).` };
  }

  try {
    const path = `${SLOT_PATH_PREFIX[kind]}/${slug}${SLOT_SUFFIX[kind]}.${ext}`;
    const admin_ = getSupabaseAdmin();
    // Filigrane discret (lot cybersécurité, 2026-09-25) : uniquement sur les
    // photos, jamais sur audio/vidéo. Voir lib/watermark.ts pour la limite
    // connue (webp non supporté, passe alors tel quel).
    const uploadBody =
      kind === 'photo'
        ? (await applyWatermark(Buffer.from(await file.arrayBuffer()), file.type || 'image/jpeg')).buffer
        : file;
    const { error: uploadError } = await admin_.storage.from(BUCKET).upload(path, uploadBody, { upsert: true, contentType: file.type || undefined });
    if (uploadError) return { error: `Échec de l'upload : ${uploadError.message}` };

    const { data: pub } = admin_.storage.from(BUCKET).getPublicUrl(path);
    const { error: dbError } = await admin_
      .from('heros')
      .update({ [SLOT_COLUMN[kind]]: pub.publicUrl })
      .eq('slug', slug);
    if (dbError) return { error: dbError.message };

    await logActivity(admin.email, `A uploadé un média (${kind}) pour « ${slug} »`);
    revalidatePath(`/heros/${slug}`);
    revalidatePath('/heros');
    revalidatePath('/');
    revalidatePath('/media');
    return { error: null };
  } catch (e) {
    return { error: `Échec de l'upload : ${describeError(e)}` };
  }
}

/** Code de langue vidéo (ex. `"fr"`, `"en"`) — un des codes configurés dans `lib/langues.ts` (LANGUES_VIDEO), pas un enum fixe. */
export type VideoLang = string;

export function isVideoLang(v: unknown): v is VideoLang {
  return typeof v === 'string' && LANGUES_VIDEO.some((l) => l.code === v);
}

/** Retourne une copie de la liste avec une entrée garantie pour ce numéro de chapitre (créée si absente), triée par numéro. */
export function upsertChapterEntry(chapters: VideoChapitreAdmin[], numero: number): { list: VideoChapitreAdmin[]; index: number } {
  const list = chapters.map((c) => ({ ...c }));
  let index = list.findIndex((c) => c.numero === numero);
  if (index === -1) {
    list.push({ numero, titre_chapitre: '', videos: {} });
    list.sort((a, b) => a.numero - b.numero);
    index = list.findIndex((c) => c.numero === numero);
  }
  return { list, index };
}

export async function performChapterVideoUpload(
  slug: string,
  chapterNum: number,
  lang: VideoLang,
  file: File
): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > 4) return { error: 'Chapitre invalide.' };
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext !== 'mp4') return { error: `Format .${ext || '?'} non accepté (attendu : mp4).` };

  const hero = await getHeroBySlugAdmin(slug);
  if (!hero) return { error: 'Héros introuvable.' };

  try {
    const path = `video/${slug}-chap${chapterNum}-${lang}.${ext}`;
    const admin_ = getSupabaseAdmin();
    const { error: uploadError } = await admin_.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (uploadError) return { error: `Échec de l'upload : ${uploadError.message}` };

    const { data: pub } = admin_.storage.from(BUCKET).getPublicUrl(path);
    const { list, index } = upsertChapterEntry(hero.video_chapitres ?? [], chapterNum);
    list[index] = { ...list[index], videos: { ...(list[index].videos ?? {}), [lang]: pub.publicUrl } };

    const { error: dbError } = await admin_.from('heros').update({ video_chapitres: list }).eq('slug', slug);
    if (dbError) return { error: dbError.message };

    await logActivity(admin.email, `A uploadé la vidéo du chapitre ${chapterNum} (${lang.toUpperCase()}) de « ${hero.nom_affiche} »`);
    revalidatePath(`/heros/${slug}`);
    revalidatePath('/heros');
    return { error: null };
  } catch (e) {
    return { error: `Échec de l'upload : ${describeError(e)}` };
  }
}
