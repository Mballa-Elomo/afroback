'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

/**
 * Module Paiements & revenus (cdc-module-paiements.md, § 3.2 et § 4).
 * Le back-office ne change jamais lui-même le statut d'un paiement : il
 * demande à la fonction `campay` de relire le vrai statut chez Campay.
 */

export type Resultat = { ok: boolean; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LIBELLES: Record<string, string> = {
  reussi: 'réussi',
  echoue: 'échoué',
  en_attente: 'toujours en attente',
  annule: 'annulé',
  expire: 'expiré',
  rembourse: 'remboursé',
};

export async function reverifierPaiement(id: string): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Paiement invalide.' };
  const supabase = getSupabaseAdmin();
  const { data: avant } = await supabase.from('paiements').select('statut, reference').eq('id', id).maybeSingle();
  if (!avant) return { ok: false, message: 'Paiement introuvable.' };
  if (!avant.reference) return { ok: false, message: 'Ce paiement n’a jamais été transmis à Campay (pas de référence) : rien à revérifier.' };

  // Même chemin qu'un rappel de Campay : la fonction relit le statut chez Campay et crédite si réussi.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '');
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  let statut: string | null = null;
  try {
    const r = await fetch(`${url}/functions/v1/campay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anon}`, apikey: anon },
      body: JSON.stringify({ external_reference: id }),
      cache: 'no-store',
    });
    const d = (await r.json().catch(() => null)) as { statut?: string } | null;
    statut = d?.statut ?? null;
    if (!r.ok) return { ok: false, message: `La fonction Campay a répondu ${r.status}.` };
  } catch {
    return { ok: false, message: 'Campay injoignable pour le moment. Réessayez plus tard.' };
  }

  const { data: apres } = await supabase.from('paiements').select('statut').eq('id', id).maybeSingle();
  const final = apres?.statut ?? statut ?? avant.statut;
  await logActivity(admin.email, `Paiements : revérification Campay du paiement ${avant.reference} (${avant.statut} → ${final})`);
  revalidatePath('/paiements');
  return {
    ok: true,
    message: final === avant.statut ? `Campay confirme : paiement ${LIBELLES[final] ?? final}.` : `Statut mis à jour : ${LIBELLES[avant.statut] ?? avant.statut} → ${LIBELLES[final] ?? final}.`,
  };
}

/** Litige « j'ai payé mais je n'ai pas accès » : offre l'accès correspondant au paiement. */
export async function offrirAccesLitige(id: string): Promise<Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Paiement invalide.' };
  const supabase = getSupabaseAdmin();
  const { data: p } = await supabase.from('paiements').select('user_id, type, plan, periode, reference, subscription_id, statut').eq('id', id).maybeSingle();
  if (!p) return { ok: false, message: 'Paiement introuvable.' };
  if (p.type !== 'abonnement' || !p.plan) return { ok: false, message: 'Seul un paiement d’abonnement peut donner un accès.' };
  if (p.subscription_id) return { ok: false, message: 'Ce paiement a déjà crédité un abonnement.' };
  if (p.statut !== 'reussi' && p.statut !== 'en_attente') {
    return { ok: false, message: 'Paiement échoué ou annulé : aucun argent débité. Revérifiez d’abord auprès de Campay.' };
  }
  if (!p.user_id) return { ok: false, message: 'Le compte a été supprimé.' };
  const { data: u } = await supabase.auth.admin.getUserById(p.user_id);
  if (!u.user?.email) return { ok: false, message: 'Compte introuvable ou sans e-mail.' };

  const jours = p.periode === 'yearly' ? 365 : 30;
  const { data, error } = await supabase.rpc('offrir_abonnement', {
    p_email: u.user.email,
    p_plan: p.plan,
    p_jours: jours,
    p_note: `Litige paiement ${p.reference ?? id}`,
  });
  if (error || !(data as { ok?: boolean } | null)?.ok) return { ok: false, message: `Échec : ${error?.message ?? 'refusé'}` };
  await logActivity(admin.email, `Paiements : accès ${p.plan} offert (${jours} jours) à ${u.user.email} pour le litige du paiement ${p.reference ?? id}`);
  revalidatePath('/paiements');
  return { ok: true, message: `Accès ${p.plan === 'heritage' ? 'Héritage' : 'Racines'} offert pour ${jours} jours.` };
}

export async function journaliserExportPaiements(nombre: number, description: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  await logActivity(admin.email, `Paiements : export CSV de ${Math.max(0, Math.floor(nombre))} lignes${description ? ` (${description.slice(0, 200)})` : ''}`);
}
