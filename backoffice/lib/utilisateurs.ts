import type { User } from '@supabase/supabase-js';
import { getSupabaseAdmin } from './supabase/server';

/**
 * Module Utilisateurs (cdc-module-utilisateurs.md) : assemblage côté serveur.
 * Les comptes viennent de auth.users (API d'administration, clé service_role),
 * puis sont joints en mémoire aux tables liées. Aucun secret (mot de passe,
 * secret 2 étapes, PIN parent, jeton) ne sort d'ici.
 */

export type Forfait = 'decouverte' | 'racines' | 'heritage';
export type Statut = 'actif' | 'non_confirme' | 'suspendu';

export interface LigneUtilisateur {
  id: string;
  email: string;
  telephone: string | null;
  prenom: string;
  pays: string | null;
  langue: string | null;
  inscrit_le: string;
  derniere_connexion: string | null;
  derniere_activite: string | null;
  statut: Statut;
  forfait: Forfait;
  forfait_fin: string | null;
  mfa: boolean;
  enfants: number;
  pseudo: string | null;
  banni_communaute: boolean;
  admin: boolean;
  demo_store: boolean;
}

export interface Suspension {
  motif: string;
  par: string;
  le: string;
  jusqu_au: string | null;
}

const ORDRE: Record<Forfait, number> = { decouverte: 0, racines: 1, heritage: 2 };

export function chiffres(tel: string | null | undefined) {
  return (tel ?? '').replace(/\D/g, '');
}

export function estSuspendu(u: Pick<User, 'banned_until'>) {
  return !!u.banned_until && new Date(u.banned_until).getTime() > Date.now();
}

export function statutDe(u: User): Statut {
  if (estSuspendu(u)) return 'suspendu';
  if (!u.email_confirmed_at) return 'non_confirme';
  return 'actif';
}

interface Abonnement {
  user_id: string;
  plan: 'racines' | 'heritage';
  status: string;
  starts_at: string;
  ends_at: string | null;
}

function abonnementActif(s: Abonnement, now: number) {
  return s.status === 'active' && new Date(s.starts_at).getTime() <= now && (!s.ends_at || new Date(s.ends_at).getTime() > now);
}

/** Forfait courant : abonnement actif le plus élevé, sinon Découverte. */
export function forfaitDe(subs: Abonnement[]): { forfait: Forfait; fin: string | null } {
  const now = Date.now();
  let res: { forfait: Forfait; fin: string | null } = { forfait: 'decouverte', fin: null };
  for (const s of subs) {
    if (!abonnementActif(s, now)) continue;
    if (ORDRE[s.plan] > ORDRE[res.forfait] || (s.plan === res.forfait && (!s.ends_at || (res.fin && s.ends_at > res.fin)))) {
      res = { forfait: s.plan, fin: s.ends_at };
    }
  }
  return res;
}

/** Tous les comptes (pages de 1 000), dans la limite raisonnable du § 9. */
export async function tousLesComptes(): Promise<User[]> {
  const supabase = getSupabaseAdmin();
  const comptes: User[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    comptes.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return comptes;
}

/** Lecture tolérante : une table absente (script non exécuté) donne une liste vide. */
async function lignes<T>(requete: PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  try {
    const { data, error } = await requete;
    return error ? [] : ((data ?? []) as T[]);
  } catch {
    return [];
  }
}

function grouper<T extends { user_id: string }>(rows: T[]) {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const l = m.get(r.user_id);
    if (l) l.push(r);
    else m.set(r.user_id, [r]);
  }
  return m;
}

export async function chargerListe(): Promise<LigneUtilisateur[]> {
  const supabase = getSupabaseAdmin();
  const [comptes, subs, totp, enfants, communaute, admins, demo, activite] = await Promise.all([
    tousLesComptes(),
    lignes<Abonnement>(supabase.from('subscriptions').select('user_id, plan, status, starts_at, ends_at')),
    lignes<{ user_id: string; verified: boolean }>(supabase.from('user_totp_factors').select('user_id, verified')),
    lignes<{ parent_user_id: string }>(supabase.from('child_profiles').select('parent_user_id')),
    lignes<{ user_id: string; pseudo: string; is_banned: boolean }>(supabase.from('community_profiles').select('user_id, pseudo, is_banned')),
    lignes<{ email: string }>(supabase.from('admin_users').select('email')),
    lignes<{ user_id: string }>(supabase.from('comptes_revue_store').select('user_id')),
    lignes<{ user_id: string; derniere_activite: string }>(supabase.from('appareils').select('user_id, derniere_activite')),
  ]);

  const subsPar = grouper(subs);
  const mfa = new Set(totp.filter((t) => t.verified).map((t) => t.user_id));
  const nbEnfants = new Map<string, number>();
  for (const e of enfants) nbEnfants.set(e.parent_user_id, (nbEnfants.get(e.parent_user_id) ?? 0) + 1);
  const comm = new Map(communaute.map((c) => [c.user_id, c]));
  const adminEmails = new Set(admins.map((a) => a.email.toLowerCase()));
  const demoIds = new Set(demo.map((d) => d.user_id));
  const act = new Map<string, string>();
  for (const a of activite) if (!act.has(a.user_id) || a.derniere_activite > act.get(a.user_id)!) act.set(a.user_id, a.derniere_activite);

  return comptes.map((u) => {
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
    const f = forfaitDe(subsPar.get(u.id) ?? []);
    const c = comm.get(u.id);
    return {
      id: u.id,
      email: u.email ?? '',
      telephone: u.phone ? `+${chiffres(u.phone)}` : null,
      prenom: typeof meta.prenom === 'string' ? meta.prenom : '',
      pays: typeof meta.pays === 'string' ? meta.pays : null,
      langue: typeof meta.langue_interface === 'string' ? meta.langue_interface : typeof meta.langue === 'string' ? meta.langue : null,
      inscrit_le: u.created_at,
      derniere_connexion: u.last_sign_in_at ?? null,
      derniere_activite: act.get(u.id) ?? null,
      statut: statutDe(u),
      forfait: f.forfait,
      forfait_fin: f.fin,
      mfa: mfa.has(u.id),
      enfants: nbEnfants.get(u.id) ?? 0,
      pseudo: c?.pseudo ?? null,
      banni_communaute: !!c?.is_banned,
      admin: adminEmails.has((u.email ?? '').toLowerCase()),
      demo_store: demoIds.has(u.id),
    };
  });
}

// ---------------------------------------------------------------------
// Fiche d'un compte
// ---------------------------------------------------------------------

export interface FicheUtilisateur {
  ligne: LigneUtilisateur;
  email_confirme_le: string | null;
  suspension: Suspension | null;
  suspendu_jusqu_au: string | null;
  usages: string[];
  consentement: { le: string | null; version: string | null };
  note: { texte: string; auteur: string; le: string } | null;
  notesDisponibles: boolean;
  abonnements: { id: string; plan: string; status: string; source: string; starts_at: string; ends_at: string | null; note: string | null; actif: boolean }[];
  paiements: { id: string; type: string; plan: string | null; periode: string | null; montant_fcfa: number; statut: string; moyen: string | null; created_at: string }[];
  appareils: { device_id: string; nom: string | null; valide_le: string; derniere_activite: string; actif: boolean }[];
  blocage: { echecs: number; jusqu_au: string | null } | null;
  blocage2fa: { echecs: number; jusqu_au: string | null } | null;
  evenements: { id: number; event_type: string; detail: Record<string, unknown> | null; created_at: string }[];
  enfants: { id: string; prenom: string; age: number; avatar_couleur: string; decouverte_activee: boolean; limite_ecran_minutes: number | null }[];
  codeParent: boolean;
  communaute: { pseudo: string; bio: string | null; is_banned: boolean; ban_reason: string | null; publications: number; cree_le: string } | null;
  boutique: { nom_boutique: string; region: string; artisanat: string; is_active: boolean } | null;
  quiz: { tentatives: number; moyenne: number | null };
  journal: { id: string; admin_email: string; action: string; created_at: string }[];
}

export async function chargerFiche(id: string): Promise<FicheUtilisateur | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error || !data.user) return null;
  const u = data.user;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const app = (u.app_metadata ?? {}) as Record<string, unknown>;
  const tel = chiffres(u.phone);
  const identifiants = [tel, tel ? `+${tel}` : '', u.email ?? ''].filter(Boolean);
  const now = Date.now();

  const [subs, totp, enfants, parent, comm, admins, demo, appareils, actif, paiements, quiz, boutique, journal, noteRes, mfaTry] = await Promise.all([
    lignes<FicheUtilisateur['abonnements'][number] & { user_id: string }>(
      supabase.from('subscriptions').select('id, user_id, plan, status, source, starts_at, ends_at, note').eq('user_id', id).order('created_at', { ascending: false })
    ),
    lignes<{ verified: boolean }>(supabase.from('user_totp_factors').select('verified').eq('user_id', id)),
    lignes<FicheUtilisateur['enfants'][number]>(
      supabase.from('child_profiles').select('id, prenom, age, avatar_couleur, decouverte_activee, limite_ecran_minutes').eq('parent_user_id', id).order('created_at')
    ),
    lignes<{ pin_code: string | null }>(supabase.from('parent_settings').select('pin_code').eq('parent_user_id', id)),
    lignes<{ id: string; pseudo: string; bio: string | null; is_banned: boolean; ban_reason: string | null; created_at: string }>(
      supabase.from('community_profiles').select('id, pseudo, bio, is_banned, ban_reason, created_at').eq('user_id', id)
    ),
    lignes<{ email: string }>(supabase.from('admin_users').select('email')),
    lignes<{ user_id: string }>(supabase.from('comptes_revue_store').select('user_id').eq('user_id', id)),
    lignes<{ device_id: string; nom: string | null; valide_le: string; derniere_activite: string }>(
      supabase.from('appareils').select('device_id, nom, valide_le, derniere_activite').eq('user_id', id).order('derniere_activite', { ascending: false })
    ),
    lignes<{ device_id: string }>(supabase.from('appareil_actif').select('device_id').eq('user_id', id)),
    lignes<FicheUtilisateur['paiements'][number]>(
      supabase.from('paiements').select('id, type, plan, periode, montant_fcfa, statut, moyen, created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(50)
    ),
    lignes<{ score: number; total: number }>(supabase.from('quiz_tentatives').select('score, total').eq('user_id', id)),
    lignes<NonNullable<FicheUtilisateur['boutique']>>(supabase.from('marketplace_vendors').select('nom_boutique, region, artisanat, is_active').eq('user_id', id)),
    u.email
      ? lignes<FicheUtilisateur['journal'][number]>(
          supabase.from('admin_activity_log').select('id, admin_email, action, created_at').ilike('action', `%${u.email.replace(/[%_]/g, '')}%`).order('created_at', { ascending: false }).limit(50)
        )
      : Promise.resolve([]),
    supabase.from('admin_notes_utilisateurs').select('note, auteur, modifie_le').eq('user_id', id).maybeSingle(),
    lignes<{ failed_count: number; locked_until: string | null }>(supabase.from('mfa_attempts').select('failed_count, locked_until').eq('user_id', id)),
  ]);

  const [blocageRows, evenements, nbPosts] = await Promise.all([
    tel ? lignes<{ failed_count: number; locked_until: string | null }>(supabase.from('login_attempts').select('failed_count, locked_until').in('phone', [tel, `+${tel}`])) : Promise.resolve([]),
    identifiants.length
      ? lignes<FicheUtilisateur['evenements'][number]>(
          supabase.from('security_events').select('id, event_type, detail, created_at').in('phone', identifiants).order('created_at', { ascending: false }).limit(30)
        )
      : Promise.resolve([]),
    comm[0]
      ? supabase.from('community_posts').select('id', { count: 'exact', head: true }).eq('author_id', comm[0].id).then((r) => r.count ?? 0, () => 0)
      : Promise.resolve(0),
  ]);

  const f = forfaitDe(subs as unknown as Abonnement[]);
  const idActif = actif[0]?.device_id;
  const blocage = blocageRows.find((b) => b.failed_count > 0 || (b.locked_until && new Date(b.locked_until).getTime() > now));
  const b2 = mfaTry.find((b) => b.failed_count > 0 || (b.locked_until && new Date(b.locked_until).getTime() > now));
  const susp = app.suspension as Suspension | undefined;

  const ligne: LigneUtilisateur = {
    id: u.id,
    email: u.email ?? '',
    telephone: tel ? `+${tel}` : null,
    prenom: typeof meta.prenom === 'string' ? meta.prenom : '',
    pays: typeof meta.pays === 'string' ? meta.pays : null,
    langue: typeof meta.langue_interface === 'string' ? meta.langue_interface : typeof meta.langue === 'string' ? meta.langue : null,
    inscrit_le: u.created_at,
    derniere_connexion: u.last_sign_in_at ?? null,
    derniere_activite: appareils[0]?.derniere_activite ?? null,
    statut: statutDe(u),
    forfait: f.forfait,
    forfait_fin: f.fin,
    mfa: totp.some((t) => t.verified),
    enfants: enfants.length,
    pseudo: comm[0]?.pseudo ?? null,
    banni_communaute: !!comm[0]?.is_banned,
    admin: admins.some((a) => a.email.toLowerCase() === (u.email ?? '').toLowerCase()),
    demo_store: demo.length > 0,
  };

  const notes = quiz.length ? Math.round((quiz.reduce((s, q) => s + q.score / q.total, 0) / quiz.length) * 100) : null;

  return {
    ligne,
    email_confirme_le: u.email_confirmed_at ?? null,
    suspension: estSuspendu(u) ? (susp ?? { motif: '', par: '', le: '', jusqu_au: u.banned_until ?? null }) : null,
    suspendu_jusqu_au: estSuspendu(u) ? (u.banned_until ?? null) : null,
    usages: Array.isArray(meta.usages) ? (meta.usages as unknown[]).map(String) : [],
    consentement: {
      le: typeof meta.consent_at === 'string' ? meta.consent_at : null,
      version: typeof meta.consent_version === 'string' ? meta.consent_version : null,
    },
    note: noteRes.data ? { texte: noteRes.data.note, auteur: noteRes.data.auteur, le: noteRes.data.modifie_le } : null,
    notesDisponibles: !noteRes.error,
    abonnements: subs.map((s) => ({ ...s, actif: abonnementActif(s as unknown as Abonnement, now) })),
    paiements,
    appareils: appareils.map((a) => ({ ...a, actif: a.device_id === idActif })),
    blocage: blocage ? { echecs: blocage.failed_count, jusqu_au: blocage.locked_until } : null,
    blocage2fa: b2 ? { echecs: b2.failed_count, jusqu_au: b2.locked_until } : null,
    evenements,
    enfants,
    codeParent: !!parent[0]?.pin_code,
    communaute: comm[0]
      ? { pseudo: comm[0].pseudo, bio: comm[0].bio, is_banned: comm[0].is_banned, ban_reason: comm[0].ban_reason, publications: nbPosts, cree_le: comm[0].created_at }
      : null,
    boutique: boutique[0] ?? null,
    quiz: { tentatives: quiz.length, moyenne: notes },
    journal,
  };
}
