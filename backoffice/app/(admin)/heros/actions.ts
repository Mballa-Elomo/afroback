'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { getHeroToggleFields } from '@/lib/data/heros';

/**
 * `getHeroToggleFields()` plutôt que `getHeroBySlugAdmin()` (`select('*')`,
 * texte intégral des récits + storyboard complet) : ces 3 actions n'ont
 * besoin que du nom et du statut actuel — retour de lenteur de Yannick le
 * 2026-08-06 (`POST /heros` entre 1,7 et 2,5s), une des pistes identifiées
 * par le chef de projet lors du diagnostic du time-out.
 *
 * Un seul héros à la une à la fois, et jamais un héros dépublié — demandes
 * de Yannick le 2026-08-09 : deux héros à la une en même temps n'a pas de
 * sens sur l'app mobile, et un héros retiré du catalogue public encore
 * moins. Mettre un nouveau héros à la une retire donc automatiquement la
 * mise à la une de tout autre héros qui l'avait (`.neq('slug', slug)` :
 * jamais soi-même, sinon le `update` du héros courant juste après serait
 * immédiatement écrasé), et la mise à la une d'un héros dépublié est
 * refusée. `togglePublication` retire symétriquement la mise à la une d'un
 * héros qu'on dépublie — même logique que `archiveHero` ci-dessous.
 */
export async function toggleFeatured(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const hero = await getHeroToggleFields(slug);
  if (!hero) throw new Error('Héros introuvable.');

  const next = !hero.a_la_une;
  if (next && hero.statut_publication !== 'publie') {
    throw new Error('Impossible de mettre à la une un héros dépublié — publie-le d’abord.');
  }
  const db = getSupabaseAdmin();

  let ancienNom: string | null = null;
  if (next) {
    const { data: autresAlaUne, error: lookupError } = await db.from('heros').select('nom_affiche').eq('a_la_une', true).neq('slug', slug);
    if (lookupError) throw new Error(lookupError.message);
    if (autresAlaUne && autresAlaUne.length > 0) {
      ancienNom = autresAlaUne.map((h) => h.nom_affiche).join(', ');
      const { error: unsetError } = await db.from('heros').update({ a_la_une: false }).eq('a_la_une', true).neq('slug', slug);
      if (unsetError) throw new Error(unsetError.message);
    }
  }

  const { error } = await db.from('heros').update({ a_la_une: next }).eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(
    admin.email,
    `A ${next ? 'mis' : 'retiré'} « ${hero.nom_affiche} » ${next ? 'à' : 'de'} la une${ancienNom ? ` (retirée de « ${ancienNom} »)` : ''}`
  );
  revalidatePath('/heros');
  revalidatePath(`/heros/${slug}`);
  revalidatePath('/');
}

export async function togglePublication(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const hero = await getHeroToggleFields(slug);
  if (!hero) throw new Error('Héros introuvable.');

  const next = hero.statut_publication === 'publie' ? 'depublie' : 'publie';
  const retireDeLaUne = next === 'depublie' && hero.a_la_une;
  const { error } = await getSupabaseAdmin()
    .from('heros')
    .update(retireDeLaUne ? { statut_publication: next, a_la_une: false } : { statut_publication: next })
    .eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(
    admin.email,
    `A ${next === 'publie' ? 'publié' : 'dépublié'} « ${hero.nom_affiche} »${retireDeLaUne ? ' (retiré de la une)' : ''}`
  );
  revalidatePath('/heros');
  revalidatePath(`/heros/${slug}`);
  revalidatePath('/');
}

/**
 * "Dépublier & archiver" — action plus lourde que le simple toggle
 * ci-dessus, gatée par une confirmation explicite côté UI (voir
 * ConfirmModal). Ne supprime rien : dépublie le héros (retiré du catalogue
 * app mobile) et retire aussi la mise à la une si elle était active — un
 * héros dépublié n'a pas de sens à la une. Réversible en republiant depuis
 * la fiche (filtre "Dépubliés" de la liste).
 */
export async function archiveHero(slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error('Non autorisé.');

  const hero = await getHeroToggleFields(slug);
  if (!hero) throw new Error('Héros introuvable.');

  const { error } = await getSupabaseAdmin().from('heros').update({ statut_publication: 'depublie', a_la_une: false }).eq('slug', slug);
  if (error) throw new Error(error.message);

  await logActivity(admin.email, `A dépublié & archivé « ${hero.nom_affiche} »`);
  revalidatePath('/heros');
  revalidatePath(`/heros/${slug}`);
  revalidatePath('/');
}
