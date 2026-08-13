import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from './supabase/server';
import { requireAdmin } from './auth';
import { logActivity } from './activityLog';
import { getDecouverteItemBySlugAdmin } from './data/decouverte';
import { LANGUES_VIDEO } from './langues';
import { describeError } from './uploadMedia';

/**
 * Upload de médias Découverte — même principe que `uploadMedia.ts` (héros) :
 * Route Handler dédié pour le transfert de fichier réel (jamais une Server
 * Action, voir le commentaire en tête de `uploadMedia.ts`). Bucket
 * `heroes-media` partagé (déjà utilisé par héros/mythologie/decouverte pour
 * les images), sous-dossier `images/decouverte/` et `video/decouverte/`
 * pour ne jamais collisionner avec les chemins héros.
 *
 * Pas de chapitres ici (contrairement à héros/mythologie) : une fiche
 * Découverte a au plus une vidéo par langue.
 */

export const BUCKET = 'heroes-media';

export async function performDecouvertePhotoUpload(slug: string, file: File): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return { error: `Format .${ext || '?'} non accepté (attendu : jpg, jpeg, png, webp).` };
  }

  const item = await getDecouverteItemBySlugAdmin(slug);
  if (!item) return { error: 'Fiche introuvable.' };

  try {
    const path = `images/decouverte/${slug}.${ext}`;
    const admin_ = getSupabaseAdmin();
    const { error: uploadError } = await admin_.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (uploadError) return { error: `Échec de l'upload : ${uploadError.message}` };

    const { data: pub } = admin_.storage.from(BUCKET).getPublicUrl(path);
    const { error: dbError } = await admin_.from('decouverte_items').update({ image_url: pub.publicUrl }).eq('slug', slug);
    if (dbError) return { error: dbError.message };

    await logActivity(admin.email, `A uploadé la photo de la fiche Découverte « ${item.titre} »`);
    revalidatePath(`/decouverte/${slug}`);
    revalidatePath('/decouverte');
    revalidatePath('/media');
    return { error: null };
  } catch (e) {
    return { error: `Échec de l'upload : ${describeError(e)}` };
  }
}

export async function performDecouverteVideoUpload(slug: string, lang: string, file: File): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!LANGUES_VIDEO.some((l) => l.code === lang)) return { error: 'Langue invalide.' };
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' };

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext !== 'mp4') return { error: `Format .${ext || '?'} non accepté (attendu : mp4).` };

  const item = await getDecouverteItemBySlugAdmin(slug);
  if (!item) return { error: 'Fiche introuvable.' };

  try {
    const path = `video/decouverte/${slug}-${lang}.${ext}`;
    const admin_ = getSupabaseAdmin();
    const { error: uploadError } = await admin_.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (uploadError) return { error: `Échec de l'upload : ${uploadError.message}` };

    const { data: pub } = admin_.storage.from(BUCKET).getPublicUrl(path);
    const videos = { ...(item.videos ?? {}), [lang]: pub.publicUrl };
    const { error: dbError } = await admin_.from('decouverte_items').update({ videos }).eq('slug', slug);
    if (dbError) return { error: dbError.message };

    await logActivity(admin.email, `A uploadé la vidéo (${lang.toUpperCase()}) de la fiche Découverte « ${item.titre} »`);
    revalidatePath(`/decouverte/${slug}`);
    revalidatePath('/decouverte');
    return { error: null };
  } catch (e) {
    return { error: `Échec de l'upload : ${describeError(e)}` };
  }
}
