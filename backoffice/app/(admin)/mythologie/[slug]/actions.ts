'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { getMytheBySlugAdmin, getMytheToggleFields } from '@/lib/data/mythologie';
import { SLOT_COLUMN, type MythologieMediaSlot } from '@/lib/uploadMythologieMedia';
import { upsertChapterEntry, type VideoLang } from '@/lib/uploadMedia';

/**
 * Server Actions de correction pour un mythe — même logique que
 * heros/[slug]/actions.ts et decouverte/[slug]/actions.ts : le pipeline
 * éditorial (agent griot) reste la source de création, ces actions ne
 * touchent que la version publiée dans `mythes`.
 */

export async function saveMytheMetadata(slug: string, formData: FormData): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };

  const titre = String(formData.get('titre') ?? '').trim();
  const sous_titre = String(formData.get('sous_titre') ?? '').trim();
  const peuple = String(formData.get('peuple') ?? '').trim();
  const region = String(formData.get('region') ?? '').trim();
  const zone = String(formData.get('zone') ?? '').trim();
  const epoque = String(formData.get('epoque') ?? '').trim();
  const type_contenu = String(formData.get('type_contenu') ?? '').trim();
  const theme = String(formData.get('theme') ?? '').trim();
  const ordreRaw = String(formData.get('ordre_affichage') ?? '');
  const ordre_affichage = Number.isFinite(Number(ordreRaw)) ? Number(ordreRaw) : 0;

  if (!titre) return { error: 'Le titre ne peut pas être vide.' };

  const { error } = await getSupabaseAdmin()
    .from('mythes')
    .update({ titre, sous_titre, peuple, region, zone, epoque, type_contenu, theme, ordre_affichage })
    .eq('slug', slug);
  if (error) return { error: error.message };

  await logActivity(admin.email, `A modifié les métadonnées du mythe « ${titre} »`);
  revalidatePath(`/mythologie/${slug}`);
  revalidatePath('/mythologie');
  return { error: null };
}

/**
 * Corrige le titre et le texte d'UN chapitre du récit (jsonb
 * `recit_chapitres_fr` ou `recit_chapitres_en` selon `lang`) — les autres
 * chapitres sont réécrits tels quels. `lang='en'` sur un mythe sans version
 * anglaise crée le tableau EN à la volée (chapitres 1-4 vides sauf celui
 * édité) plutôt que d'échouer — cohérent avec le fait qu'aucun mythe n'a de
 * version EN à ce jour (2026-08-12) et que ce panneau sert justement à en
 * démarrer une.
 */
export async function saveMytheChapitre(slug: string, numero: number, lang: 'fr' | 'en', formData: FormData): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!Number.isInteger(numero) || numero < 1) return { error: 'Chapitre invalide.' };

  const titre = String(formData.get('titre') ?? '').trim();
  const texte = String(formData.get('texte') ?? '').trim();
  if (lang === 'fr' && !texte) return { error: 'Le texte du chapitre ne peut pas être vide.' };

  const mythe = await getMytheBySlugAdmin(slug);
  if (!mythe) return { error: 'Mythe introuvable.' };

  const column = lang === 'fr' ? 'recit_chapitres_fr' : 'recit_chapitres_en';
  const source = lang === 'fr' ? mythe.recit_chapitres_fr : mythe.recit_chapitres_en;
  const list = source.map((c) => ({ ...c }));
  let index = list.findIndex((c) => c.numero === numero);
  if (index === -1) {
    list.push({ numero, titre, texte });
    list.sort((a, b) => a.numero - b.numero);
    index = list.findIndex((c) => c.numero === numero);
  } else {
    list[index] = { ...list[index], titre, texte };
  }

  const { error } = await getSupabaseAdmin().from('mythes').update({ [column]: list }).eq('slug', slug);
  if (error) return { error: error.message };

  await logActivity(admin.email, `A modifié le chapitre ${numero} (${lang.toUpperCase()}) du mythe « ${mythe.titre} »`);
  revalidatePath(`/mythologie/${slug}`);
  revalidatePath('/mythologie');
  return { error: null };
}

/** Retire un média (photo/audioFr/audioEn) — vide juste l'URL, ne supprime pas le fichier de Storage. Même principe que removeMedia côté héros. */
export async function removeMythologieMedia(slug: string, kind: MythologieMediaSlot): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const mythe = await getMytheBySlugAdmin(slug);
  if (!mythe) throw new Error('Mythe introuvable.');

  const { error } = await getSupabaseAdmin()
    .from('mythes')
    .update({ [SLOT_COLUMN[kind]]: null })
    .eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(admin.email, `A retiré un média (${kind}) du mythe « ${mythe.titre} »`);
  revalidatePath(`/mythologie/${slug}`);
  revalidatePath('/mythologie');
}

export async function removeMytheChapterVideo(slug: string, chapterNum: number, lang: VideoLang): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const mythe = await getMytheBySlugAdmin(slug);
  if (!mythe) throw new Error('Mythe introuvable.');

  const list = (mythe.video_chapitres ?? []).map((c) => ({ ...c }));
  const index = list.findIndex((c) => c.numero === chapterNum);
  if (index === -1) return;

  const videos = { ...(list[index].videos ?? {}) };
  delete videos[lang];
  list[index] = { ...list[index], videos };

  const { error } = await getSupabaseAdmin().from('mythes').update({ video_chapitres: list }).eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(admin.email, `A retiré la vidéo du chapitre ${chapterNum} (${lang.toUpperCase()}) du mythe « ${mythe.titre} »`);
  revalidatePath(`/mythologie/${slug}`);
  revalidatePath('/mythologie');
}

export async function updateMytheChapterTitle(slug: string, chapterNum: number, formData: FormData): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!Number.isInteger(chapterNum) || chapterNum < 1 || chapterNum > 4) return { error: 'Chapitre invalide.' };

  const titre_chapitre = String(formData.get('titre_chapitre') ?? '').trim();

  const mythe = await getMytheBySlugAdmin(slug);
  if (!mythe) return { error: 'Mythe introuvable.' };

  const { list, index } = upsertChapterEntry(mythe.video_chapitres ?? [], chapterNum);
  list[index] = { ...list[index], titre_chapitre };

  const { error } = await getSupabaseAdmin().from('mythes').update({ video_chapitres: list }).eq('slug', slug);
  if (error) return { error: error.message };

  await logActivity(admin.email, `A modifié le titre du chapitre vidéo ${chapterNum} du mythe « ${mythe.titre} »`);
  revalidatePath(`/mythologie/${slug}`);
  revalidatePath('/mythologie');
  return { error: null };
}

/** "À la une" pour Mythologie — même règle que côté héros/Découverte : un seul mythe à la une, jamais un mythe dépublié. Slot indépendant des autres piliers. */
export async function toggleMytheFeatured(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const mythe = await getMytheToggleFields(slug);
  if (!mythe) throw new Error('Mythe introuvable.');

  const next = !mythe.a_la_une;
  if (next && mythe.statut_publication !== 'publie') {
    throw new Error('Impossible de mettre à la une un mythe dépublié — publie-le d’abord.');
  }
  const db = getSupabaseAdmin();

  let ancienTitre: string | null = null;
  if (next) {
    const { data: autresAlaUne, error: lookupError } = await db.from('mythes').select('titre').eq('a_la_une', true).neq('slug', slug);
    if (lookupError) throw new Error(lookupError.message);
    if (autresAlaUne && autresAlaUne.length > 0) {
      ancienTitre = autresAlaUne.map((m) => m.titre).join(', ');
      const { error: unsetError } = await db.from('mythes').update({ a_la_une: false }).eq('a_la_une', true).neq('slug', slug);
      if (unsetError) throw new Error(unsetError.message);
    }
  }

  const { error } = await db.from('mythes').update({ a_la_une: next }).eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(
    admin.email,
    `A ${next ? 'mis' : 'retiré'} le mythe « ${mythe.titre} » ${next ? 'à' : 'de'} la une${ancienTitre ? ` (retirée de « ${ancienTitre} »)` : ''}`
  );
  revalidatePath('/mythologie');
  revalidatePath(`/mythologie/${slug}`);
}

export async function toggleMythePublication(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const mythe = await getMytheToggleFields(slug);
  if (!mythe) throw new Error('Mythe introuvable.');

  const next = mythe.statut_publication === 'publie' ? 'depublie' : 'publie';
  const retireDeLaUne = next === 'depublie' && mythe.a_la_une;
  const { error } = await getSupabaseAdmin()
    .from('mythes')
    .update(retireDeLaUne ? { statut_publication: next, a_la_une: false } : { statut_publication: next })
    .eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(
    admin.email,
    `A ${next === 'publie' ? 'publié' : 'dépublié'} le mythe « ${mythe.titre} »${retireDeLaUne ? ' (retiré de la une)' : ''}`
  );
  revalidatePath('/mythologie');
  revalidatePath(`/mythologie/${slug}`);
}
