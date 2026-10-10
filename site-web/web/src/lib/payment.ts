'use client';

import { supabase } from './supabase';
import { tc } from './lang';

/**
 * Paiement Mobile Money (Campay) SANS QUITTER LE SITE (cdc-paiement-sans-sortie.md,
 * 2026-10-07). Même fonction serveur que l'application (`campay`) :
 * - `demander` : le serveur envoie la demande de paiement au numéro MTN ou
 *   Orange, la personne valide sur son téléphone avec son code secret ;
 * - `verifier` : appelé toutes les 3 s par l'écran d'attente ;
 * - `annuler` : abandonne la demande (si elle est validée quand même, elle est
 *   créditée normalement : la personne ne perd jamais son argent).
 * Le montant d'un abonnement est toujours calculé côté serveur.
 *
 * L'ancien parcours (`creer` + page Campay dans un onglet) n'est plus utilisé
 * par le site ; `/paiement/retour` reste pour les paiements déjà commencés.
 */

export type Plan = 'racines' | 'heritage';
export type Periode = 'monthly' | 'yearly';
export type PaymentStatus = 'en_attente' | 'reussi' | 'echoue' | 'annule' | 'expire' | 'rembourse';
export type Operateur = 'MTN' | 'ORANGE';
export type PaymentRequest = { type: 'abonnement'; plan: Plan; periode: Periode } | { type: 'don'; montant: number; anonyme?: boolean };

export const PRICES: Record<Plan, number> = { racines: 1500, heritage: 3000 };
let YEARLY_FACTOR = 0.83;
export const price = (plan: Plan, periode: Periode) => (periode === 'monthly' ? PRICES[plan] : Math.round(PRICES[plan] * 12 * YEARLY_FACTOR));

/** Prix réglés dans le back-office (Paramètres), appliqués par SettingsProvider. Le serveur de paiement calcule le même montant. */
export function setPricing(racines: number, heritage: number, reductionPct: number) {
  if (racines > 0) PRICES.racines = racines;
  if (heritage > 0) PRICES.heritage = heritage;
  if (reductionPct >= 0 && reductionPct <= 90) YEARLY_FACTOR = 1 - reductionPct / 100;
}
export const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
/** Noms de marque, identiques en anglais. */
export const PLAN_NAME: Record<Plan, string> = { racines: 'Racines', heritage: 'Héritage' };

async function call<T>(body: Record<string, unknown>): Promise<{ data?: T; error?: string; detail?: string }> {
  const { data, error } = await supabase.functions.invoke('campay', { body });
  if (error) {
    let code = 'reseau';
    let detail: string | undefined;
    try {
      const ctx = (error as { context?: Response }).context;
      const parsed = ctx ? await ctx.json() : null;
      if (parsed?.error) code = parsed.error;
      if (parsed?.detail) detail = String(parsed.detail);
    } catch {
      /* réponse illisible */
    }
    return { error: code, detail };
  }
  if (!data?.ok) return { error: data?.error ?? 'inconnu', detail: data?.detail ? String(data.detail) : undefined };
  return { data: data as T };
}

/* ---------- Numéro Mobile Money (mêmes règles que la fonction serveur) ---------- */

/** 9 chiffres locaux (6XXXXXXXX) à partir de 6XX…, 2376XX…, +237…, 00237…, avec espaces. */
export function localDigits(v: string | null | undefined): string {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.startsWith('00237')) d = d.slice(5);
  // Un numéro local commence toujours par 6 : « 237… » est forcément l'indicatif.
  else if (d.startsWith('237')) d = d.slice(3);
  return d.slice(0, 9);
}

/** MTN : 67, 68, 650 à 654 · Orange : 69, 655 à 659, 640. Détecté dès 2 ou 3 chiffres. */
export function detectOperateur(v: string): Operateur | null {
  const n = localDigits(v);
  if (/^6[78]/.test(n) || /^65[0-4]/.test(n)) return 'MTN';
  if (/^69/.test(n) || /^65[5-9]/.test(n) || /^640/.test(n)) return 'ORANGE';
  return null;
}

export const isValidMobileMoney = (v: string) => /^6\d{8}$/.test(localDigits(v)) && !!detectOperateur(v);

/** Affichage « 6XX XX XX XX » pendant la saisie. */
export function formatLocal(v: string): string {
  const d = localDigits(v);
  return [d.slice(0, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

/** Téléphone du compte (auth ou métadonnées), seulement s'il est camerounais Mobile Money. */
export function accountPhone(user: { phone?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): string {
  const candidates = [user?.phone, user?.user_metadata?.telephone, user?.user_metadata?.phone];
  for (const c of candidates) {
    if (typeof c !== 'string' || !c) continue;
    const d = String(c).replace(/\D/g, '');
    // Numéro étranger (+33…) : pas de pré-remplissage.
    if (d.length > 9 && !d.startsWith('237') && !d.startsWith('00237')) continue;
    if (isValidMobileMoney(c)) return formatLocal(c);
  }
  return '';
}

/* ---------- Messages d'erreur ---------- */

const MESSAGES: Record<string, [string, string]> = {
  non_connecte: ['Connecte-toi pour payer.', 'Sign in to pay.'],
  non_authentifie: ['Ta session a expiré. Reconnecte-toi pour payer.', 'Your session has expired. Sign in again to pay.'],
  numero_invalide: [
    'Numéro Mobile Money invalide. Indique un numéro MTN ou Orange du Cameroun (6XX XX XX XX).',
    'Invalid Mobile Money number. Enter a Cameroon MTN or Orange number (6XX XX XX XX).',
  ],
  trop_de_demandes: ['Trop de demandes de paiement en une heure. Réessaie un peu plus tard.', 'Too many payment requests in one hour. Try again a little later.'],
  passerelle: [
    'Le service Mobile Money n’a pas accepté la demande. Vérifie le numéro puis réessaie dans un instant.',
    'The Mobile Money service did not accept the request. Check the number and try again in a moment.',
  ],
  non_configure: ['Le paiement n’est pas encore disponible. Réessaie plus tard.', 'Payment is not available yet. Try again later.'],
  montant_invalide: ['Montant invalide (entre 200 et 1 000 000 FCFA).', 'Invalid amount (between 200 and 1,000,000 FCFA).'],
  forfait_invalide: ['Ce forfait n’existe pas. Choisis Racines ou Héritage.', 'This plan does not exist. Choose Racines or Héritage.'],
  paiements_desactives: ['Le paiement est momentanément indisponible. Réessaie plus tard.', 'Payment is temporarily unavailable. Please try again later.'],
  dons_desactives: ['Les dons sont momentanément indisponibles.', 'Donations are temporarily unavailable.'],
  abonnements_desactives: ['Les abonnements sont momentanément indisponibles.', 'Subscriptions are temporarily unavailable.'],
  operateur_indisponible: ['Cet opérateur est momentanément indisponible. Utilise un numéro de l’autre opérateur.', 'This operator is temporarily unavailable. Use a number from the other operator.'],
  reseau: ['Connexion au service de paiement impossible. Vérifie ta connexion et réessaie.', 'Could not reach the payment service. Check your connection and try again.'],
};
export const paymentError = (code?: string) =>
  MESSAGES[code ?? ''] ? tc(...MESSAGES[code ?? '']) : tc('Le paiement n’a pas pu démarrer. Réessaie dans un instant.', 'The payment could not start. Try again in a moment.');

/* ---------- Appels serveur ---------- */

export type Demande = { paiement_id: string; montant: number; operateur: Operateur; ussd_code: string; telephone_masque: string };

/** Envoie la demande de paiement au téléphone (aucune page externe). */
export async function requestPayment(req: PaymentRequest, telephone: string): Promise<{ data?: Demande; error?: string; code?: string }> {
  const { data, error } = await call<Demande>({ action: 'demander', ...req, telephone: localDigits(telephone) });
  if (error || !data) return { error: paymentError(error), code: error };
  try {
    localStorage.setItem('afroback-web:paiement', data.paiement_id);
  } catch {
    /* confort seulement */
  }
  return { data };
}

export function checkPayment(id: string) {
  return call<{ statut: PaymentStatus; type: 'abonnement' | 'don'; plan: Plan | null; montant: number }>({ action: 'verifier', paiement_id: id });
}

export async function cancelPayment(id: string) {
  try {
    localStorage.removeItem('afroback-web:paiement');
  } catch {
    /* confort seulement */
  }
  return call<{ ok: true }>({ action: 'annuler', paiement_id: id });
}

/* ---------- Résiliation (schema-paiement-sans-sortie.sql) ---------- */

async function rpcAbonnement(name: 'resilier_abonnement' | 'reprendre_abonnement'): Promise<{ error: string | null }> {
  const { data, error } = await supabase.rpc(name);
  const res = data as { ok?: boolean; error?: string } | null;
  if (error || !res?.ok) {
    if (res?.error === 'non_authentifie') return { error: paymentError('non_authentifie') };
    return { error: tc('L’opération n’a pas abouti. Réessaie dans un instant.', 'The operation failed. Try again in a moment.') };
  }
  return { error: null };
}
export const cancelSubscription = () => rpcAbonnement('resilier_abonnement');
export const resumeSubscription = () => rpcAbonnement('reprendre_abonnement');
