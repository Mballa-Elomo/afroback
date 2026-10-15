import { getSupabaseAdmin } from './supabase/server';
import { tousLesComptes } from './utilisateurs';

/**
 * Module Paiements & revenus (cdc-module-paiements.md) : lecture côté
 * serveur (clé service_role). Les calculs (totaux, périodes, environnement
 * réel/démo) se font dans le navigateur à partir de ces listes : les volumes
 * restent petits et les filtres sont instantanés.
 */

export type Environnement = 'live' | 'demo';

export interface Paiement {
  id: string;
  user_id: string | null;
  email: string | null;
  prenom: string | null;
  type: 'abonnement' | 'don';
  plan: 'racines' | 'heritage' | null;
  periode: 'monthly' | 'yearly' | null;
  montant: number;
  statut: 'en_attente' | 'reussi' | 'echoue' | 'annule' | 'expire' | 'rembourse';
  operateur: string | null;
  telephone: string | null;
  reference: string | null;
  environnement: Environnement;
  anonyme: boolean;
  cree_le: string;
  confirme_le: string | null;
  subscription_id: string | null;
}

export interface Abonnement {
  id: string;
  user_id: string;
  email: string | null;
  prenom: string | null;
  plan: 'racines' | 'heritage';
  status: 'active' | 'cancelled' | 'expired';
  source: 'offert' | 'paiement' | 'test';
  starts_at: string;
  ends_at: string | null;
  resilie_le: string | null;
  note: string | null;
}

export interface DonneesPaiements {
  paiements: Paiement[];
  abonnements: Abonnement[];
  gratuits: { type: string; slug: string }[];
  prix: { racines: number; heritage: number };
  erreur: string | null;
}

/** Normalise le nom d'opérateur (Campay renvoie « ORANGE », « MTN »…, l'ancien parcours « Orange »). */
export function operateurDe(brut: string | null): 'MTN' | 'Orange' | null {
  const s = (brut ?? '').toLowerCase();
  if (s.includes('mtn')) return 'MTN';
  if (s.includes('orange')) return 'Orange';
  return null;
}

export async function chargerPaiements(): Promise<DonneesPaiements> {
  const supabase = getSupabaseAdmin();
  const [comptes, pRes, sRes, gRes, reglages] = await Promise.all([
    tousLesComptes().catch(() => []),
    supabase
      .from('paiements')
      .select('id, user_id, type, plan, periode, montant_fcfa, statut, operateur, moyen, telephone_masque, reference, environnement, anonyme, created_at, confirme_le, subscription_id')
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase.from('subscriptions').select('id, user_id, plan, status, source, starts_at, ends_at, resilie_le, note').order('created_at', { ascending: false }),
    supabase.from('contenus_gratuits').select('type, slug').order('type'),
    supabase.from('app_settings').select('data').eq('id', 1).maybeSingle(),
  ]);

  const parId = new Map(comptes.map((u) => [u.id, u]));
  const ident = (id: string | null) => {
    const u = id ? parId.get(id) : undefined;
    return { email: u?.email ?? null, prenom: typeof u?.user_metadata?.prenom === 'string' ? (u.user_metadata.prenom as string) : null };
  };

  const pai = ((pRes.data ?? []) as Record<string, unknown>[]).map((p) => ({
    id: String(p.id),
    user_id: (p.user_id as string) ?? null,
    ...ident((p.user_id as string) ?? null),
    type: p.type as Paiement['type'],
    plan: (p.plan as Paiement['plan']) ?? null,
    periode: (p.periode as Paiement['periode']) ?? null,
    montant: Number(p.montant_fcfa ?? 0),
    statut: p.statut as Paiement['statut'],
    operateur: operateurDe((p.operateur as string) ?? (p.moyen as string) ?? null),
    telephone: (p.telephone_masque as string) ?? null,
    reference: (p.reference as string) ?? null,
    environnement: (p.environnement === 'live' ? 'live' : 'demo') as Environnement,
    anonyme: !!p.anonyme,
    cree_le: String(p.created_at),
    confirme_le: (p.confirme_le as string) ?? null,
    subscription_id: (p.subscription_id as string) ?? null,
  }));

  // Version sans la colonne resilie_le si le script « paiement sans sortie » n'est pas exécuté.
  let subsBrut = sRes.data as Record<string, unknown>[] | null;
  if (sRes.error) {
    const r = await supabase.from('subscriptions').select('id, user_id, plan, status, source, starts_at, ends_at, note').order('created_at', { ascending: false });
    subsBrut = r.data as Record<string, unknown>[] | null;
  }
  const abonnements = (subsBrut ?? []).map((s) => ({
    id: String(s.id),
    user_id: String(s.user_id),
    ...ident(String(s.user_id)),
    plan: s.plan as Abonnement['plan'],
    status: s.status as Abonnement['status'],
    source: s.source as Abonnement['source'],
    starts_at: String(s.starts_at),
    ends_at: (s.ends_at as string) ?? null,
    resilie_le: (s.resilie_le as string) ?? null,
    note: (s.note as string) ?? null,
  }));

  const p = ((reglages.data?.data as Record<string, Record<string, unknown>> | undefined)?.paiements ?? {}) as Record<string, unknown>;
  return {
    paiements: pai,
    abonnements,
    gratuits: (gRes.data ?? []) as { type: string; slug: string }[],
    prix: { racines: Number(p.prix_racines ?? 1500), heritage: Number(p.prix_heritage ?? 3000) },
    erreur: pRes.error ? pRes.error.message : null,
  };
}
