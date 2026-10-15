'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { analyserLienVideo, lienCanonique } from '@/lib/lienVideo';
import type { Planche } from '@/lib/ecole';

/**
 * École des Héros : éditeur des leçons (finitions du 2026-10-15). Les textes
 * restent rédigés par l'agent /afroback_pedagogue ; ici on relit, corrige et
 * ajoute les médias. Chaque modification est journalisée.
 */

export type Resultat = { ok: boolean; message: string; id?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function lecon(id: string) {
  const { data } = await getSupabaseAdmin().from('ecole_lecons').select('id, niveau, heros:heros_id(nom_affiche)').eq('id', id).maybeSingle();
  if (!data) return null;
  const h = data.heros as unknown as { nom_affiche: string } | null;
  return `${h?.nom_affiche ?? 'Leçon'} (niveau ${data.niveau})`;
}

async function maj(id: string, valeurs: Record<string, unknown>, journal: string, message: string): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Leçon invalide.' };
  const nom = await lecon(id);
  if (!nom) return { ok: false, message: 'Leçon introuvable.' };
  const { error } = await getSupabaseAdmin().from('ecole_lecons').update({ ...valeurs, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { ok: false, message: /narration_audio_url_en/.test(error.message) ? 'Exécutez d’abord schema-ecole-medias.sql dans Supabase.' : `Échec : ${error.message}` };
  await logActivity(admin.email, `École des Héros : ${nom}, ${journal}`);
  revalidatePath('/ecole-heros');
  return { ok: true, message };
}

export async function creerLecon(herosId: string, niveau: number): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(herosId) || ![1, 2, 3, 4].includes(niveau)) return { ok: false, message: 'Héros ou niveau invalide.' };
  const { data, error } = await getSupabaseAdmin().from('ecole_lecons').insert({ heros_id: herosId, niveau }).select('id').single();
  if (error) return { ok: false, message: /duplicate|unique/.test(error.message) ? 'Cette leçon existe déjà.' : `Échec : ${error.message}` };
  await logActivity(admin.email, `École des Héros : leçon créée (niveau ${niveau})`);
  revalidatePath('/ecole-heros');
  return { ok: true, message: 'Leçon créée. Ajoutez son texte adapté.', id: String(data.id) };
}

export async function enregistrerTextes(id: string, fr: string, en: string): Promise<Resultat> {
  const tfr = String(fr ?? '').trim().slice(0, 20000);
  const ten = String(en ?? '').trim().slice(0, 20000);
  return maj(id, { texte_adapte: tfr || null, texte_adapte_en: ten || null }, 'texte modifié', 'Texte enregistré.');
}

export async function definirVideoLecon(id: string, brut: string): Promise<{ error: string | null }> {
  const l = analyserLienVideo(brut);
  if (!l || l.type === 'fichier') return { error: 'Lien non reconnu. Collez l’adresse d’une vidéo YouTube ou Vimeo.' };
  const r = await maj(id, { video_url: lienCanonique(l) }, `vidéo définie (${lienCanonique(l)})`, 'Vidéo enregistrée.');
  return { error: r.ok ? null : r.message };
}

export async function retirerVideoLecon(id: string): Promise<void> {
  await maj(id, { video_url: null }, 'vidéo retirée', 'Vidéo retirée.');
}

export async function retirerAudioLecon(id: string, langue: 'fr' | 'en'): Promise<Resultat> {
  return maj(id, { [langue === 'en' ? 'narration_audio_url_en' : 'narration_audio_url']: null }, `narration ${langue.toUpperCase()} retirée`, 'Narration retirée.');
}

export async function enregistrerPlanches(id: string, planches: Planche[]): Promise<Resultat> {
  if (!Array.isArray(planches) || planches.length > 40) return { ok: false, message: '40 planches maximum.' };
  const propres = planches.map((p, i) => ({
    image_url: String(p.image_url ?? ''),
    texte: String(p.texte ?? '').trim().slice(0, 600),
    texte_en: String(p.texte_en ?? '').trim().slice(0, 600) || undefined,
    ordre: i + 1,
  }));
  if (propres.some((p) => !/^https:\/\//.test(p.image_url))) return { ok: false, message: 'Chaque planche doit avoir une image.' };
  return maj(id, { bd_planches: propres }, `BD enregistrée (${propres.length} planche${propres.length > 1 ? 's' : ''})`, 'BD enregistrée.');
}
