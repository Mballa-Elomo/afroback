'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { getDecouverteItemBySlugAdmin, getDecouverteToggleFields } from '@/lib/data/decouverte';

/**
 * Server Actions de correction pour une fiche Découverte — même logique que
 * heros/[slug]/actions.ts (saveMetadata/saveRecit) : le pipeline éditorial
 * (agent afroback-decouverte, fiches Markdown) reste la source de création,
 * ces actions ne touchent que la version publiée dans `decouverte_items`.
 * `type` (village/coutume/objet/personnage/fait) n'est volontairement pas
 * modifiable ici : c'est un enum contraint côté base dont dépend le
 * classement dans l'app mobile, une correction de catégorie relève du
 * pipeline, pas d'une faute de frappe corrigeable en un clic.
 */

export async function saveDecouverteMetadata(slug: string, formData: FormData): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };

  const titre = String(formData.get('titre') ?? '').trim();
  const sous_titre = String(formData.get('sous_titre') ?? '').trim();
  const pays = String(formData.get('pays') ?? '').trim();
  const region_ethnie = String(formData.get('region_ethnie') ?? '').trim();
  const ordreRaw = String(formData.get('ordre_affichage') ?? '');
  const ordre_affichage = Number.isFinite(Number(ordreRaw)) ? Number(ordreRaw) : 0;

  if (!titre) return { error: 'Le titre ne peut pas être vide.' };
  if (!pays) return { error: 'Le pays ne peut pas être vide.' };

  const { error } = await getSupabaseAdmin()
    .from('decouverte_items')
    .update({ titre, sous_titre, pays, region_ethnie, ordre_affichage })
    .eq('slug', slug);
  if (error) return { error: error.message };

  await logActivity(admin.email, `A modifié les métadonnées de la fiche Découverte « ${titre} »`);
  revalidatePath(`/decouverte/${slug}`);
  revalidatePath('/decouverte');
  return { error: null };
}

/**
 * Corrige le texte publié (FR ou EN) d'une fiche Découverte. `contenu_en_texte`
 * peut être vide (pas de traduction anglaise encore produite pour toutes les
 * fiches) — vider le champ EN le remet à `null`, jamais à une chaîne vide.
 */
export async function saveDecouverteTexte(slug: string, lang: 'fr' | 'en', texte: string): Promise<{ error: string | null }> {
  const admin = await requireAdmin();
  if (!admin) return { error: 'Non autorisé.' };

  const trimmed = texte.trim();
  if (lang === 'fr' && !trimmed) return { error: 'Le contenu FR ne peut pas être vide.' };

  const item = await getDecouverteItemBySlugAdmin(slug);
  if (!item) return { error: 'Fiche introuvable.' };

  const column = lang === 'fr' ? 'contenu_fr_texte' : 'contenu_en_texte';
  const value = lang === 'en' && !trimmed ? null : trimmed;

  const { error } = await getSupabaseAdmin()
    .from('decouverte_items')
    .update({ [column]: value })
    .eq('slug', slug);
  if (error) return { error: error.message };

  await logActivity(admin.email, `A modifié le contenu ${lang.toUpperCase()} de « ${item.titre} »`);
  revalidatePath(`/decouverte/${slug}`);
  revalidatePath('/decouverte');
  return { error: null };
}

/** Retire la photo (vide juste l'URL, ne supprime pas le fichier de Storage) — même principe que removeMedia côté héros. */
export async function removeDecouvertePhoto(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const item = await getDecouverteItemBySlugAdmin(slug);
  if (!item) throw new Error('Fiche introuvable.');

  const { error } = await getSupabaseAdmin().from('decouverte_items').update({ image_url: null }).eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(admin.email, `A retiré la photo de la fiche Découverte « ${item.titre} »`);
  revalidatePath(`/decouverte/${slug}`);
  revalidatePath('/decouverte');
}

/** Retire la vidéo d'une langue (vide juste l'URL) — même principe que removeChapterVideo côté héros, sans notion de chapitre ici. */
export async function removeDecouverteVideo(slug: string, lang: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const item = await getDecouverteItemBySlugAdmin(slug);
  if (!item) throw new Error('Fiche introuvable.');

  const videos = { ...(item.videos ?? {}) };
  delete videos[lang];

  const { error } = await getSupabaseAdmin().from('decouverte_items').update({ videos }).eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(admin.email, `A retiré la vidéo (${lang.toUpperCase()}) de la fiche Découverte « ${item.titre} »`);
  revalidatePath(`/decouverte/${slug}`);
  revalidatePath('/decouverte');
}

/**
 * "À la une" pour Découverte — même règle que côté héros (toggleFeatured,
 * heros/actions.ts) : une seule fiche à la une à la fois, jamais une fiche
 * dépubliée. Slot indépendant du "à la une" héros (deux tables séparées).
 */
export async function toggleDecouverteFeatured(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const item = await getDecouverteToggleFields(slug);
  if (!item) throw new Error('Fiche introuvable.');

  const next = !item.a_la_une;
  if (next && item.statut_publication !== 'publie') {
    throw new Error('Impossible de mettre à la une une fiche dépubliée — publie-la d’abord.');
  }
  const db = getSupabaseAdmin();

  let ancienTitre: string | null = null;
  if (next) {
    const { data: autresAlaUne, error: lookupError } = await db.from('decouverte_items').select('titre').eq('a_la_une', true).neq('slug', slug);
    if (lookupError) throw new Error(lookupError.message);
    if (autresAlaUne && autresAlaUne.length > 0) {
      ancienTitre = autresAlaUne.map((it) => it.titre).join(', ');
      const { error: unsetError } = await db.from('decouverte_items').update({ a_la_une: false }).eq('a_la_une', true).neq('slug', slug);
      if (unsetError) throw new Error(unsetError.message);
    }
  }

  const { error } = await db.from('decouverte_items').update({ a_la_une: next }).eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(
    admin.email,
    `A ${next ? 'mis' : 'retiré'} « ${item.titre} » ${next ? 'à' : 'de'} la une${ancienTitre ? ` (retirée de « ${ancienTitre} »)` : ''}`
  );
  revalidatePath('/decouverte');
  revalidatePath(`/decouverte/${slug}`);
}

export async function toggleDecouvertePublication(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const item = await getDecouverteToggleFields(slug);
  if (!item) throw new Error('Fiche introuvable.');

  const next = item.statut_publication === 'publie' ? 'depublie' : 'publie';
  const retireDeLaUne = next === 'depublie' && item.a_la_une;
  const { error } = await getSupabaseAdmin()
    .from('decouverte_items')
    .update(retireDeLaUne ? { statut_publication: next, a_la_une: false } : { statut_publication: next })
    .eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(
    admin.email,
    `A ${next === 'publie' ? 'publié' : 'dépublié'} la fiche Découverte « ${item.titre} »${retireDeLaUne ? ' (retirée de la une)' : ''}`
  );
  revalidatePath('/decouverte');
  revalidatePath(`/decouverte/${slug}`);
}
