'use client';

import { supabase } from './supabase';
import { tc } from './lang';

/**
 * Paiement Mobile Money (Campay), même fonction serveur que l'application
 * (`campay` : actions creer / verifier). Le montant est toujours calculé côté
 * serveur à partir du forfait : le site ne l'envoie jamais pour un abonnement.
 *
 * Sur le site, la page Campay s'ouvre dans un nouvel onglet pendant que le
 * site vérifie le paiement toutes les 4 s : l'abonnement se débloque tout seul
 * dès que Campay confirme, même si l'onglet de paiement ne revient pas sur le site.
 */

export type Plan = 'racines' | 'heritage';
export type Periode = 'monthly' | 'yearly';
export type PaymentStatus = 'en_attente' | 'reussi' | 'echoue' | 'annule' | 'expire' | 'rembourse';

export const PRICES: Record<Plan, number> = { racines: 1500, heritage: 3000 };
export const price = (plan: Plan, periode: Periode) => (periode === 'monthly' ? PRICES[plan] : Math.round(PRICES[plan] * 12 * 0.83));
export const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

async function call<T>(body: Record<string, unknown>): Promise<{ data?: T; error?: string }> {
  const { data, error } = await supabase.functions.invoke('campay', { body });
  if (error) {
    let code = 'reseau';
    try {
      const ctx = (error as { context?: Response }).context;
      const parsed = ctx ? await ctx.json() : null;
      if (parsed?.error) code = parsed.error;
    } catch {
      /* réponse illisible */
    }
    return { error: code };
  }
  if (!data?.ok) return { error: data?.error ?? 'inconnu' };
  return { data: data as T };
}

const MESSAGES: Record<string, [string, string]> = {
  non_connecte: ['Connecte-toi pour payer.', 'Sign in to pay.'],
  montant_invalide: ['Montant invalide (entre 200 et 1 000 000 FCFA).', 'Invalid amount (between 200 and 1,000,000 FCFA).'],
  reseau: ['Connexion au service de paiement impossible. Réessaie.', 'Could not reach the payment service. Try again.'],
};
export const paymentError = (code?: string) =>
  MESSAGES[code ?? ''] ? tc(...MESSAGES[code ?? '']) : tc('Le paiement n’a pas pu démarrer. Réessaie dans un instant.', 'The payment could not start. Try again in a moment.');

/**
 * Démarre le paiement. `win` est l'onglet ouvert au moment du clic (sinon le
 * navigateur le bloquerait) : on y charge la page Campay.
 */
export async function startPayment(
  req: { type: 'abonnement'; plan: Plan; periode: Periode } | { type: 'don'; montant: number; anonyme?: boolean },
  win: Window | null
): Promise<{ paiementId?: string; error?: string }> {
  const { data, error } = await call<{ paiement_id: string; checkout_url: string }>({
    action: 'creer',
    retour_url: `${window.location.origin}/paiement/retour`,
    ...req,
  });
  if (error || !data) {
    win?.close();
    return { error: paymentError(error) };
  }
  try {
    localStorage.setItem('afroback-web:paiement', data.paiement_id);
  } catch {
    /* confort seulement */
  }
  if (win) win.location.href = data.checkout_url;
  else window.location.assign(data.checkout_url);
  return { paiementId: data.paiement_id };
}

export function checkPayment(id: string) {
  return call<{ statut: PaymentStatus; type: 'abonnement' | 'don'; plan: Plan | null; montant: number }>({ action: 'verifier', paiement_id: id });
}

/** Ouvre l'onglet de paiement au moment du clic, avec un message d'attente. */
export function openPaymentTab(): Window | null {
  const w = window.open('', '_blank');
  if (w) {
    w.document.title = tc('Paiement AFROBACK', 'AFROBACK payment');
    w.document.body.style.cssText = 'background:#070504;color:#f0c36b;font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0';
    w.document.body.textContent = tc('Ouverture du paiement Mobile Money…', 'Opening Mobile Money payment…');
  }
  return w;
}
