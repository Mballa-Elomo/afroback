'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

/** Module Marketplace (cdc-module-marketplace.md, § 3 et § 4) : décisions de l'administrateur, journalisées. */

export type Resultat = { ok: boolean; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INSTALLER = 'Exécutez d’abord schema-marketplace-moderation.sql dans Supabase.';

function manqueScript(message: string) {
  return /statut_validation|masque_admin|motif_/.test(message);
}

function motifValide(m: string) {
  const t = String(m ?? '').trim();
  return t.length >= 3 && t.length <= 300 ? t : null;
}

export async function deciderBoutique(id: string, decision: 'valider' | 'refuser' | 'suspendre' | 'reactiver', motif = ''): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Boutique invalide.' };
  const raison = decision === 'refuser' || decision === 'suspendre' ? motifValide(motif) : null;
  if ((decision === 'refuser' || decision === 'suspendre') && !raison) return { ok: false, message: 'Indiquez un motif (3 à 300 caractères).' };

  const valeurs: Record<string, unknown> =
    decision === 'valider' || decision === 'reactiver'
      ? { statut_validation: 'valide', motif_validation: null, valide_le: new Date().toISOString(), is_active: true }
      : { statut_validation: decision === 'refuser' ? 'refuse' : 'suspendu', motif_validation: raison };
  const { data, error } = await getSupabaseAdmin().from('marketplace_vendors').update(valeurs).eq('id', id).select('nom_boutique');
  if (error) return { ok: false, message: manqueScript(error.message) ? INSTALLER : `Échec : ${error.message}` };
  if (!data?.length) return { ok: false, message: 'Boutique introuvable.' };

  const verbe = { valider: 'validée', refuser: 'refusée', suspendre: 'suspendue', reactiver: 'réactivée' }[decision];
  await logActivity(admin.email, `Marketplace : boutique « ${data[0].nom_boutique} » ${verbe}${raison ? ` (motif : ${raison})` : ''}`);
  revalidatePath('/marketplace');
  return { ok: true, message: `Boutique ${verbe}.` };
}

export async function masquerProduit(id: string, masquer: boolean, motif = ''): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Produit invalide.' };
  const raison = masquer ? motifValide(motif) : null;
  if (masquer && !raison) return { ok: false, message: 'Indiquez un motif (3 à 300 caractères).' };
  const { data, error } = await getSupabaseAdmin().from('marketplace_products').update({ masque_admin: masquer, motif_masquage: raison }).eq('id', id).select('nom');
  if (error) return { ok: false, message: manqueScript(error.message) ? INSTALLER : `Échec : ${error.message}` };
  if (!data?.length) return { ok: false, message: 'Produit introuvable.' };
  await logActivity(admin.email, `Marketplace : produit « ${data[0].nom} » ${masquer ? `masqué (motif : ${raison})` : 'réaffiché'}`);
  revalidatePath('/marketplace');
  return { ok: true, message: masquer ? 'Produit masqué.' : 'Produit réaffiché.' };
}

export async function annulerCommande(id: string, motif: string): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Commande invalide.' };
  const raison = motifValide(motif);
  if (!raison) return { ok: false, message: 'Indiquez un motif (3 à 300 caractères).' };
  const { data, error } = await getSupabaseAdmin().from('marketplace_orders').update({ statut: 'annulee' }).eq('id', id).neq('statut', 'livree').select('montant_total_fcfa');
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  if (!data?.length) return { ok: false, message: 'Commande introuvable ou déjà livrée.' };
  await logActivity(admin.email, `Marketplace : commande ${id.slice(0, 8)} (${data[0].montant_total_fcfa} FCFA) annulée (motif : ${raison})`);
  revalidatePath('/marketplace');
  return { ok: true, message: 'Commande annulée.' };
}

export async function masquerAvis(id: string, masquer: boolean): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Avis invalide.' };
  const { error } = await getSupabaseAdmin().from('marketplace_reviews').update({ masque_admin: masquer }).eq('id', id);
  if (error) return { ok: false, message: manqueScript(error.message) ? INSTALLER : `Échec : ${error.message}` };
  await logActivity(admin.email, `Marketplace : avis ${id.slice(0, 8)} ${masquer ? 'masqué' : 'réaffiché'}`);
  revalidatePath('/marketplace');
  return { ok: true, message: masquer ? 'Avis masqué.' : 'Avis réaffiché.' };
}
