import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from './supabase/server';
import { requireAdmin } from './auth';
import { logActivity } from './activityLog';
import { getMytheBySlugAdmin, type VideoChapitreAdmin } from './data/mythologie';
import { LANGUES_VIDEO } from './langues';
import { describeError, upsertChapterEntry } from './uploadMedia';
import { applyWatermark } from './watermark';

/**
 * Upload de médias Mythologie — même principe que `uploadMedia.ts` (héros),
 * un mythe a exactement la même forme qu'un héros pour les médias (photo,
 * audio FR/EN, vidéo par chapitre × langue), donc les mêmes helpers
 * (`upsertChapterEntry`) sont réutilisés tels quels. Bucket `heroes-media`
 * partagé, sous-dossiers `images/mythologie/`, `audio/mythologie/`,
 * `video/mythologie/` pour ne jamais collisionner avec les chemins héros.
 */

export const BUCKET = 'heroes-media';

export type MythologieMediaSlot = 'photo' | 'audioFr' | 'audioEn';

export const SLOT_COLUMN: Record<MythologieMediaSlot, string> = {
  photo: 'image_url',
  audioFr: 'narration_audio_url',
  audioEn: 'narration_audio_url_en',
};

const SLOT_EXT: Record<MythologieMediaSlot, string[]> = {
  photo: ['jpg', 'jpeg', 'png', 'webp'],
  audioFr: ['mp3'],
  audioEn: ['mp3'],
};

const SLOT_PATH_PREFIX: Record<MythologieMediaSlot, string> = {
  photo: 'images/mythologie',
  audioFr: 'audio/mythologie',
  audioEn: 'audio/mythologie',
};

const SLOT_SUFFIX: Record<MythologieMediaSlot, string> = {
  photo: '',
  audioFr: '-fr',
  audioEn: '-en',
};

export function isMythologieMediaSlot(v: unknown): v is MythologieMediaSlot {
  return v === 'photo' || v === 'audioFr' || v === 'audioEn';
}

export async function performMythologieMediaUpload(slug: string, kind: MythologieMediaSlot, file: File): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!SLOT_EXT[kind].includes(ext)) {
    return { error: `Format .${ext || '?'} non accepté pour ce champ (attendu : ${SLOT_EXT[kind].join(', ')}).` };
  }

  const mythe = await getMytheBySlugAdmin(slug);
  if (!mythe) return { error: 'Mythe introuvable.' };

  try {
    const path = `${SLOT_PATH_PREFIX[kind]}/${slug}${SLOT_SUFFIX[kind]}.${ext}`;
    const admin_ = getSupabaseAdmin();
    const uploadBody =
      kind === 'photo'
        ? (await applyWatermark(Buffer.from(await file.arrayBuffer()), file.type || 'image/jpeg')).buffer
        : file;
    const { error: uploadError } = await admin_.storage.from(BUCKET).upload(path, uploadBody, { upsert: true, contentType: file.type || undefined });
    if (uploadError) return { error: `Échec de l'upload : ${uploadError.message}` };

    const { data: pub } = admin_.storage.from(BUCKET).getPublicUrl(path);
    const { error: dbError } = await admin_
      .from('mythes')
      .update({ [SLOT_COLUMN[kind]]: pub.publicUrl })
      .eq('slug', slug);
    if (dbError) return { error: dbError.message };

    await logActivity(admin.email, `A uploadé un média (${kind}) pour le mythe « ${mythe.titre} »`);
    revalidatePath(`/mythologie/${slug}`);
    revalidatePath('/mythologie');
    revalidatePath('/media');
    return { error: null };
  } catch (e) {
    return { error: `Échec de l'upload : ${describeError(e)}` };
  }
}

export async function performMythologieChapterVideoUpload(
  slug: string,
  chapterNum: number,
  lang: string,
  file: File
): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > 4) return { error: 'Chapitre invalide.' };
  if (!LANGUES_VIDEO.some((l) => l.code === lang)) return { error: 'Langue invalide.' };
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext !== 'mp4') return { error: `Format .${ext || '?'} non accepté (attendu : mp4).` };

  const mythe = await getMytheBySlugAdmin(slug);
  if (!mythe) return { error: 'Mythe introuvable.' };

  try {
    const path = `video/mythologie/${slug}-chap${chapterNum}-${lang}.${ext}`;
    const admin_ = getSupabaseAdmin();
    const { error: uploadError } = await admin_.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (uploadError) return { error: `Échec de l'upload : ${uploadError.message}` };

    const { data: pub } = admin_.storage.from(BUCKET).getPublicUrl(path);
    const { list, index } = upsertChapterEntry((mythe.video_chapitres ?? []) as VideoChapitreAdmin[], chapterNum);
    list[index] = { ...list[index], videos: { ...(list[index].videos ?? {}), [lang]: pub.publicUrl } };

    const { error: dbError } = await admin_.from('mythes').update({ video_chapitres: list }).eq('slug', slug);
    if (dbError) return { error: dbError.message };

    await logActivity(admin.email, `A uploadé la vidéo du chapitre ${chapterNum} (${lang.toUpperCase()}) du mythe « ${mythe.titre} »`);
    revalidatePath(`/mythologie/${slug}`);
    revalidatePath('/mythologie');
    return { error: null };
  } catch (e) {
    return { error: `Échec de l'upload : ${describeError(e)}` };
  }
}
