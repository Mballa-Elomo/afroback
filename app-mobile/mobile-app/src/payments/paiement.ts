import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../data/supabaseClient';
import type { Billing, PaidPlan } from '../onboarding/pricing';

/**
 * Paiement Mobile Money via Campay (cdc-paiement-geniuspay.md).
 *
 * L'app ne connaît aucune clé Campay et ne fixe aucun montant : elle
 * demande à la fonction serveur "campay" de créer le paiement, ouvre la
 * page de paiement sécurisée de Campay (MTN / Orange), puis demande au
 * serveur de vérifier le statut. Seul le serveur débloque l'abonnement.
 */

export type PaymentRequest =
  | { type: 'abonnement'; plan: PaidPlan; periode: Billing }
  | { type: 'don'; montant: number; anonyme?: boolean };

export type PaymentStatus = 'en_attente' | 'reussi' | 'echoue' | 'annule' | 'expire' | 'rembourse';

const PENDING_KEY = 'afroback:paiement-en-cours';

/** Adresse de retour : le site lui-même sur web, une page "Paiement terminé" dans le navigateur intégré sinon. */
function returnUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return `${window.location.origin}/paiement/retour`;
  return 'https://afroback-test.vercel.app/paiement-termine.html';
}

async function call<T>(body: Record<string, unknown>): Promise<{ data?: T; error?: string; detail?: string }> {
  const { data, error } = await supabase.functions.invoke('campay', { body });
  if (error) {
    // Le détail de l'erreur renvoyée par la fonction est dans la réponse HTTP.
    let code = 'reseau';
    let detail: string | undefined;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx) detail = `HTTP ${ctx.status}`;
      const parsed = ctx ? await ctx.json() : null;
      if (parsed?.error) code = parsed.error;
      if (parsed?.detail) detail = String(parsed.detail);
      else if (parsed?.message) detail = String(parsed.message);
    } catch {
      /* réponse illisible */
    }
    return { error: code, detail };
  }
  if (!data?.ok) return { error: data?.error ?? 'inconnu' };
  return { data: data as T };
}

/**
 * Crée le paiement et ouvre la page Campay. Sur web, la page entière part
 * vers Campay puis revient sur /paiement/retour. Sur téléphone, la page
 * s'ouvre dans le navigateur intégré ; l'app enchaîne sur l'écran de
 * confirmation, qui vérifie le statut pendant que la personne paie.
 */
export async function startPayment(req: PaymentRequest): Promise<{ paiementId?: string; error?: string }> {
  const { data, error, detail } = await call<{ paiement_id: string; checkout_url: string }>({
    action: 'creer',
    retour_url: returnUrl(),
    ...req,
  });
  // Détail technique (réponse de Campay) ajouté au message : utile pendant la mise en service.
  if (error || !data) return { error: detail ? `${error ?? 'inconnu'}|${detail}` : error ?? 'inconnu' };
  try {
    await AsyncStorage.setItem(PENDING_KEY, data.paiement_id);
  } catch {
    /* confort seulement : l'id revient aussi dans l'adresse de retour */
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.assign(data.checkout_url);
  } else {
    WebBrowser.openBrowserAsync(data.checkout_url, { dismissButtonStyle: 'close' }).catch(() => {});
  }
  return { paiementId: data.paiement_id };
}

export async function checkPayment(paiementId: string) {
  return call<{ statut: PaymentStatus; diag?: string; type: 'abonnement' | 'don'; plan: PaidPlan | null; montant: number }>({
    action: 'verifier',
    paiement_id: paiementId,
  });
}

/** Rattrapage des paiements restés en attente : nombre de paiements crédités + diagnostic du premier non crédité. */
export async function syncPendingPayments(): Promise<{ credite: number; diag: string | null }> {
  const { data } = await call<{ credite: number; diag: string | null }>({ action: 'verifier_en_attente' });
  return { credite: data?.credite ?? 0, diag: data?.diag ?? null };
}

export async function pendingPaymentId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

export async function clearPendingPayment() {
  try {
    await AsyncStorage.removeItem(PENDING_KEY);
  } catch {
    /* sans effet */
  }
}

/** Ferme le navigateur intégré s'il est encore ouvert (téléphone). */
export function closePaymentBrowser() {
  if (Platform.OS !== 'web') {
    try {
      WebBrowser.dismissBrowser();
    } catch {
      /* déjà fermé */
    }
  }
}

// ---------------------------------------------------------------------------
// Paiement SANS QUITTER L'APP (cdc-paiement-sans-sortie.md, 2026-10-07) :
// demande de paiement directe Campay envoyée au numéro MTN / Orange ; la
// personne valide sur son téléphone, l'app attend la confirmation sur place.
// ---------------------------------------------------------------------------

export type Operator = 'MTN' | 'ORANGE';

export interface DirectPayment {
  paiement_id: string;
  montant: number;
  operateur: Operator;
  ussd_code: string;
  telephone_masque: string;
}

/** Les 9 chiffres du numéro camerounais (6XXXXXXXX), sans indicatif ni espaces. */
export function localDigits(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00237')) d = d.slice(5);
  else if (d.startsWith('237') && d.length >= 12) d = d.slice(3);
  return d.slice(0, 9);
}

/** MTN : 67, 68, 650 à 654 · Orange : 69, 655 à 659, 640 (mêmes règles que le serveur). */
export function detectOperator(raw: string): Operator | null {
  const d = localDigits(raw);
  if (d.length < 2) return null;
  if (/^6(7|8|5[0-4])/.test(d)) return 'MTN';
  if (/^6(9|5[5-9]|40)/.test(d)) return 'ORANGE';
  return null;
}

export const isValidMobileMoney = (raw: string) => /^6\d{8}$/.test(localDigits(raw)) && detectOperator(raw) !== null;

/** "6XX XX XX XX" pendant la saisie. */
export function formatLocal(raw: string): string {
  const d = localDigits(raw);
  return [d.slice(0, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

/** Envoie la demande de paiement au numéro : le téléphone de la personne affiche la validation. */
export async function requestPayment(req: PaymentRequest, telephone: string) {
  const { data, error, detail } = await call<DirectPayment>({ action: 'demander', telephone: localDigits(telephone), ...req });
  if (error || !data) return { error: detail ? `${error ?? 'inconnu'}|${detail}` : error ?? 'inconnu' };
  return { data };
}

/** Abandonne une demande en attente (si elle est validée quand même, elle sera créditée). */
export async function cancelPayment(paiementId: string) {
  await call({ action: 'annuler', paiement_id: paiementId });
}

/** Résilier / reprendre son abonnement (schema-paiement-sans-sortie.sql). */
export async function setSubscriptionCancelled(cancel: boolean): Promise<boolean> {
  const { data, error } = await supabase.rpc(cancel ? 'resilier_abonnement' : 'reprendre_abonnement');
  return !error && !!(data as { ok?: boolean } | null)?.ok;
}
