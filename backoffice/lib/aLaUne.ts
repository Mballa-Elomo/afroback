import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from './supabase/server';

/**
 * « À la une » unique sur tout AFROBACK (2026-10-17, demande de Yannick) :
 * un seul contenu à la fois, héros, mythe OU fiche Découverte. Il apparaît
 * dans « Histoire du jour » de l'app et en tête de l'accueil du site.
 * Avant, l'unicité n'était garantie que dans une même catégorie.
 *
 * Retire la une de tous les autres contenus (les 3 tables) et renvoie leurs
 * noms, pour le journal d'activité.
 */
const TABLES = [
  { table: 'heros', nom: 'nom_affiche' },
  { table: 'mythes', nom: 'titre' },
  { table: 'decouverte_items', nom: 'titre' },
] as const;

export async function retirerLesAutresUnes(table: (typeof TABLES)[number]['table'], slug: string): Promise<string[]> {
  const db = getSupabaseAdmin();
  const retires: string[] = [];
  for (const t of TABLES) {
    let lecture = db.from(t.table).select(`slug, ${t.nom}`).eq('a_la_une', true);
    if (t.table === table) lecture = lecture.neq('slug', slug);
    const { data, error } = await lecture;
    if (error) throw new Error(error.message);
    if (!data?.length) continue;
    const slugs = (data as unknown as Record<string, string>[]).map((r) => r.slug);
    const { error: e2 } = await db.from(t.table).update({ a_la_une: false }).in('slug', slugs);
    if (e2) throw new Error(e2.message);
    retires.push(...(data as unknown as Record<string, string>[]).map((r) => r[t.nom]));
  }
  if (retires.length > 0) for (const p of ['/heros', '/mythologie', '/decouverte', '/']) revalidatePath(p);
  return retires;
}
