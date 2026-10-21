'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from './supabase/server';
import { requireAdmin } from './auth';
import { logActivity } from './activityLog';
import { analyserLienVideo, lienCanonique } from './lienVideo';

/**
 * Teaser d'un contenu (2026-10-17) : vidéo d'introduction de 30 s, 4 versions
 * (FR / EN × paysage 16:9 / vertical 9:16), stockée dans la colonne jsonb
 * `teaser` = { fr: { paysage, vertical }, en: { … } } (supabase/schema-teasers.sql).
 * Liens YouTube / Vimeo, comme les autres vidéos depuis le 2026-10-11.
 */

export type TeaserType = 'heros' | 'mythe' | 'decouverte';
export type TeaserLang = 'fr' | 'en';
export type TeaserFormat = 'paysage' | 'vertical';
export type Teaser = Partial<Record<TeaserLang, Partial<Record<TeaserFormat, string>>>>;

const TABLE: Record<TeaserType, string> = { heros: 'heros', mythe: 'mythes', decouverte: 'decouverte_items' };
const PAGE: Record<TeaserType, string> = { heros: '/heros', mythe: '/mythologie', decouverte: '/decouverte' };
const LIBELLE: Record<TeaserType, string> = { heros: 'du héros', mythe: 'du mythe', decouverte: 'de la fiche Découverte' };

function valide(type: string, lang: string, format: string): boolean {
  return type in TABLE && (lang === 'fr' || lang === 'en') && (format === 'paysage' || format === 'vertical');
}

async function lire(type: TeaserType, slug: string): Promise<{ teaser: Teaser; nom: string } | null> {
  const nomCol = type === 'heros' ? 'nom_affiche' : 'titre';
  const { data, error } = await getSupabaseAdmin().from(TABLE[type]).select(`teaser, ${nomCol}`).eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  const row = data as Record<string, unknown>;
  return { teaser: (row.teaser ?? {}) as Teaser, nom: String(row[nomCol] ?? slug) };
}

async function ecrire(type: TeaserType, slug: string, teaser: Teaser): Promise<string | null> {
  const { error } = await getSupabaseAdmin().from(TABLE[type]).update({ teaser }).eq('slug', slug);
  if (!error) return null;
  return /teaser/.test(error.message) ? 'Exécutez d’abord supabase/schema-teasers.sql dans Supabase.' : error.message;
}

export async function definirLienTeaser(type: TeaserType, slug: string, lang: TeaserLang, format: TeaserFormat, brut: string): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };
  if (!valide(type, lang, format)) return { error: 'Emplacement invalide.' };
  const l = analyserLienVideo(brut);
  if (!l || l.type === 'fichier') {
    return { error: 'Lien non reconnu. Collez l’adresse d’une vidéo YouTube (youtube.com/watch?v=…, youtu.be/…, youtube.com/shorts/…) ou Vimeo (vimeo.com/…).' };
  }
  const lien = lienCanonique(l);
  const actuel = await lire(type, slug);
  if (!actuel) return { error: 'Contenu introuvable.' };
  const teaser: Teaser = { ...actuel.teaser, [lang]: { ...(actuel.teaser[lang] ?? {}), [format]: lien } };
  const err = await ecrire(type, slug, teaser);
  if (err) return { error: err };
  await logActivity(admin.email, `A défini le teaser ${lang.toUpperCase()} ${format} ${LIBELLE[type]} « ${actuel.nom} » : ${lien}`);
  revalidatePath(`${PAGE[type]}/${slug}`);
  return { error: null };
}

export async function retirerTeaser(type: TeaserType, slug: string, lang: TeaserLang, format: TeaserFormat): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');
  if (!valide(type, lang, format)) throw new Error('Emplacement invalide.');
  const actuel = await lire(type, slug);
  if (!actuel) throw new Error('Contenu introuvable.');
  const parLangue = { ...(actuel.teaser[lang] ?? {}) };
  delete parLangue[format];
  const teaser: Teaser = { ...actuel.teaser, [lang]: parLangue };
  const err = await ecrire(type, slug, teaser);
  if (err) throw new Error(err);
  await logActivity(admin.email, `A retiré le teaser ${lang.toUpperCase()} ${format} ${LIBELLE[type]} « ${actuel.nom} »`);
  revalidatePath(`${PAGE[type]}/${slug}`);
}
