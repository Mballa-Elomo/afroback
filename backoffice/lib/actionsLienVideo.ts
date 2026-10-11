'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from './supabase/server';
import { requireAdmin } from './auth';
import { logActivity } from './activityLog';
import { getHeroBySlugAdmin, type VideoChapitreAdmin } from './data/heros';
import { getMytheBySlugAdmin } from './data/mythologie';
import { getDecouverteItemBySlugAdmin } from './data/decouverte';
import { isVideoLang, upsertChapterEntry } from './uploadMedia';
import { analyserLienVideo, lienCanonique } from './lienVideo';

/**
 * Vidéos par lien YouTube / Vimeo (2026-10-11) : on enregistre l'adresse de
 * la vidéo au lieu d'envoyer le fichier. Même emplacement en base qu'avant
 * (video_chapitres[].videos[langue] ou decouverte_items.videos[langue]) :
 * l'app et le site reconnaissent le type de lien à la lecture.
 */

export type ResultatLien = { error: string | null };

function verifier(brut: string): { lien: string } | { error: string } {
  const l = analyserLienVideo(brut);
  if (!l || l.type === 'fichier') {
    return { error: 'Lien non reconnu. Collez l’adresse d’une vidéo YouTube (youtube.com/watch?v=…, youtu.be/…) ou Vimeo (vimeo.com/…).' };
  }
  return { lien: lienCanonique(l) };
}

export async function definirLienVideoChapitre(
  type: 'heros' | 'mythe',
  slug: string,
  numero: number,
  lang: string,
  brut: string
): Promise<ResultatLien> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!Number.isInteger(numero) || numero < 1 || numero > 4) return { error: 'Chapitre invalide.' };
  if (!isVideoLang(lang)) return { error: 'Langue invalide.' };
  const v = verifier(brut);
  if ('error' in v) return v;

  const contenu = type === 'heros' ? await getHeroBySlugAdmin(slug) : await getMytheBySlugAdmin(slug);
  if (!contenu) return { error: 'Contenu introuvable.' };
  const { list, index } = upsertChapterEntry((contenu.video_chapitres ?? []) as VideoChapitreAdmin[], numero);
  list[index] = { ...list[index], videos: { ...(list[index].videos ?? {}), [lang]: v.lien } };

  const table = type === 'heros' ? 'heros' : 'mythes';
  const { error } = await getSupabaseAdmin().from(table).update({ video_chapitres: list }).eq('slug', slug);
  if (error) return { error: error.message };

  const nom = 'nom_affiche' in contenu ? contenu.nom_affiche : (contenu as { titre: string }).titre;
  await logActivity(admin.email, `A défini le lien vidéo du chapitre ${numero} (${lang.toUpperCase()}) ${type === 'heros' ? 'de' : 'du mythe'} « ${nom} » : ${v.lien}`);
  const base = type === 'heros' ? '/heros' : '/mythologie';
  revalidatePath(`${base}/${slug}`);
  revalidatePath(base);
  return { error: null };
}

export async function definirLienVideoDecouverte(slug: string, lang: string, brut: string): Promise<ResultatLien> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!isVideoLang(lang)) return { error: 'Langue invalide.' };
  const v = verifier(brut);
  if ('error' in v) return v;

  const item = await getDecouverteItemBySlugAdmin(slug);
  if (!item) return { error: 'Fiche introuvable.' };
  const videos = { ...(item.videos ?? {}), [lang]: v.lien };
  const { error } = await getSupabaseAdmin().from('decouverte_items').update({ videos }).eq('slug', slug);
  if (error) return { error: error.message };

  await logActivity(admin.email, `A défini le lien vidéo (${lang.toUpperCase()}) de la fiche Découverte « ${item.titre} » : ${v.lien}`);
  revalidatePath(`/decouverte/${slug}`);
  revalidatePath('/decouverte');
  return { error: null };
}
