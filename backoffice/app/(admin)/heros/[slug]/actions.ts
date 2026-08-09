'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { getHeroBySlugAdmin } from '@/lib/data/heros';
import { SLOT_COLUMN, describeError, upsertChapterEntry, type MediaSlot, type VideoLang } from '@/lib/uploadMedia';

/**
 * Server Actions restantes pour la fiche héros : métadonnées, récit,
 * retrait de média, titre de chapitre — tous des payloads courts
 * (texte/JSON), jamais un fichier. L'upload de fichier réel (photo/audio/
 * vidéo) est passé en Route Handler (`app/api/heros/[slug]/media/route.ts`
 * et `.../chapter-video/route.ts`, logique dans `lib/uploadMedia.ts`) — voir
 * backoffice/README.md pour la raison (bug d'upload via Server Action
 * multipart, corrigé le 2026-08-06).
 */

export async function saveMetadata(slug: string, formData: FormData): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };

  const theme = String(formData.get('theme') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const region = String(formData.get('region') ?? '').trim();
  const ordreRaw = String(formData.get('ordre_affichage') ?? '');
  const ordre_affichage = Number.isFinite(Number(ordreRaw)) ? Number(ordreRaw) : 0;
  const avertissement = String(formData.get('avertissement_lecture') ?? '').trim();

  if (!region) return { error: 'La région ne peut pas être vide.' };

  try {
    const { error } = await getSupabaseAdmin()
      .from('heros')
      .update({ theme, region, ordre_affichage, avertissement_lecture: avertissement || null })
      .eq('slug', slug);

    if (error) return { error: error.message };

    await logActivity(admin.email, `A modifié les métadonnées de « ${slug} »`);
    revalidatePath(`/heros/${slug}`);
    revalidatePath('/heros');
    return { error: null };
  } catch (e) {
    return { error: describeError(e) };
  }
}

/**
 * Corrige le texte publié d'un récit (FR ou EN) depuis la fiche héros. Le
 * pipeline éditorial (agents griot/storyboard, `Récits africains/*.md`) reste
 * la source de création — cette action ne touche que la version stockée dans
 * `heros.recit_fr_texte`/`recit_en_texte` (celle réellement affichée par
 * l'app mobile), jamais les fichiers du pipeline.
 */
export async function saveRecit(slug: string, lang: 'fr' | 'en', texte: string): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };

  const trimmed = texte.trim();
  if (lang === 'fr' && !trimmed) return { error: 'Le récit FR ne peut pas être vide.' };

  const hero = await getHeroBySlugAdmin(slug);
  if (!hero) return { error: 'Héros introuvable.' };

  const column = lang === 'fr' ? 'recit_fr_texte' : 'recit_en_texte';
  const value = lang === 'en' && !trimmed ? null : trimmed;

  const { error } = await getSupabaseAdmin()
    .from('heros')
    .update({ [column]: value })
    .eq('slug', slug);
  if (error) return { error: error.message };

  await logActivity(admin.email, `A modifié le récit ${lang.toUpperCase()} de « ${hero.nom_affiche} »`);
  revalidatePath(`/heros/${slug}`);
  revalidatePath('/heros');
  return { error: null };
}

/**
 * Retire un média SANS supprimer le fichier de Supabase Storage : vide juste
 * le champ URL correspondant dans `heros` (l'app mobile ne l'affiche donc
 * plus). Simplification assumée pour ce lot 1 : pas de distinction
 * "désactivé temporairement" vs "définitivement absent" — un média retiré
 * redevient disponible en le ré-uploadant (le fichier reste dans le bucket
 * tant qu'il n'est pas explicitement supprimé, ce que cet outil ne fait pas
 * en lot 1).
 */
export async function removeMedia(slug: string, kind: MediaSlot): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const hero = await getHeroBySlugAdmin(slug);
  if (!hero) throw new Error('Héros introuvable.');

  const { error } = await getSupabaseAdmin()
    .from('heros')
    .update({ [SLOT_COLUMN[kind]]: null })
    .eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(admin.email, `A retiré un média (${kind}) de « ${hero.nom_affiche} »`);
  revalidatePath(`/heros/${slug}`);
  revalidatePath('/heros');
  revalidatePath('/');
}

/**
 * Retire une vidéo de chapitre SANS supprimer le fichier de Storage — même
 * principe que `removeMedia` ci-dessus (vide juste l'URL). Gatée par une
 * confirmation explicite côté UI (voir ChapterVideoGrid.tsx), comme toute
 * suppression d'un média déjà en ligne.
 */
export async function removeChapterVideo(slug: string, chapterNum: number, lang: VideoLang): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const hero = await getHeroBySlugAdmin(slug);
  if (!hero) throw new Error('Héros introuvable.');

  const list = (hero.video_chapitres ?? []).map((c) => ({ ...c }));
  const index = list.findIndex((c) => c.numero === chapterNum);
  if (index === -1) return;

  const videos = { ...(list[index].videos ?? {}) };
  delete videos[lang];
  list[index] = { ...list[index], videos };

  const { error } = await getSupabaseAdmin().from('heros').update({ video_chapitres: list }).eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(admin.email, `A retiré la vidéo du chapitre ${chapterNum} (${lang.toUpperCase()}) de « ${hero.nom_affiche} »`);
  revalidatePath(`/heros/${slug}`);
  revalidatePath('/heros');
}

export async function updateChapterTitle(slug: string, chapterNum: number, formData: FormData): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > 4) return { error: 'Chapitre invalide.' };

  const titre = String(formData.get('titre_chapitre') ?? '').trim();

  const hero = await getHeroBySlugAdmin(slug);
  if (!hero) return { error: 'Héros introuvable.' };

  const { list, index } = upsertChapterEntry(hero.video_chapitres ?? [], chapterNum);
  list[index] = { ...list[index], titre_chapitre: titre };

  const { error } = await getSupabaseAdmin().from('heros').update({ video_chapitres: list }).eq('slug', slug);
  if (error) return { error: error.message };

  await logActivity(admin.email, `A modifié le titre du chapitre ${chapterNum} de « ${hero.nom_affiche} »`);
  revalidatePath(`/heros/${slug}`);
  revalidatePath('/heros');
  return { error: null };
}
