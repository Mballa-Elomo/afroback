'use server';

import { revalidatePath } from 'next/cache';
import { createClient, type User } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, type AdminUser } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { chiffres } from '@/lib/utilisateurs';

/**
 * Module Utilisateurs (cdc-module-utilisateurs.md, § 5). Chaque action :
 * revérifie l'administrateur, recharge le compte visé, applique les
 * garde-fous (pas d'action grave sur un admin ni sur soi-même), puis écrit
 * le journal d'activité avec l'e-mail du compte concerné.
 */

export type Resultat = { ok: boolean; message: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Contexte = { admin: AdminUser; cible: User; libelle: string; estAdmin: boolean };

async function contexte(id: string): Promise<Contexte | Resultat> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id)) return { ok: false, message: 'Compte invalide.' };
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error || !data.user) return { ok: false, message: 'Compte introuvable.' };
  const email = (data.user.email ?? '').toLowerCase();
  const { data: adminRow } = await supabase.from('admin_users').select('email').ilike('email', email || '-').maybeSingle();
  return { admin, cible: data.user, libelle: data.user.email || (data.user.phone ? `+${chiffres(data.user.phone)}` : id), estAdmin: !!adminRow };
}

function protege(c: Contexte): Resultat | null {
  if ((c.cible.email ?? '').toLowerCase() === c.admin.email.toLowerCase()) {
    return { ok: false, message: 'Action impossible sur votre propre compte.' };
  }
  if (c.estAdmin) return { ok: false, message: 'Ce compte est administrateur : action impossible depuis ce module.' };
  return null;
}

async function fini(c: Contexte, journal: string, message: string): Promise<Resultat> {
  await logActivity(c.admin.email, `Utilisateurs · ${c.libelle} : ${journal}`);
  revalidatePath('/utilisateurs');
  revalidatePath(`/utilisateurs/${c.cible.id}`);
  return { ok: true, message };
}

const erreur = (e: { message: string } | null | undefined, quoi: string): Resultat => ({ ok: false, message: `${quoi} impossible : ${e?.message ?? 'erreur inconnue'}` });

// ---------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------

const PAYS = /^[A-Z]{2}$/;

export async function modifierProfil(id: string, saisie: { prenom: string; telephone: string; pays: string; langue: string }): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const prenom = String(saisie.prenom ?? '').trim();
  const tel = chiffres(String(saisie.telephone ?? ''));
  const pays = String(saisie.pays ?? '').trim().toUpperCase();
  const langue = String(saisie.langue ?? '');
  if (prenom.length < 1 || prenom.length > 40) return { ok: false, message: 'Le prénom doit faire entre 1 et 40 caractères.' };
  if (tel && (tel.length < 8 || tel.length > 15)) return { ok: false, message: 'Téléphone invalide (8 à 15 chiffres, indicatif compris).' };
  if (pays && !PAYS.test(pays)) return { ok: false, message: 'Pays : code à 2 lettres (ex. CM, FR).' };
  if (langue && langue !== 'fr' && langue !== 'en') return { ok: false, message: 'Langue : fr ou en.' };

  const supabase = getSupabaseAdmin();
  const telAvant = chiffres(c.cible.phone);
  const meta = (c.cible.user_metadata ?? {}) as Record<string, unknown>;
  const changements: string[] = [];
  if ((meta.prenom ?? '') !== prenom) changements.push(`prénom « ${meta.prenom ?? ''} » → « ${prenom} »`);
  if ((meta.pays ?? null) !== (pays || null)) changements.push(`pays ${meta.pays ?? '—'} → ${pays || '—'}`);
  const langueAvant = (meta.langue_interface ?? meta.langue ?? '') as string;
  if (langue && langueAvant !== langue) changements.push(`langue ${langueAvant || '—'} → ${langue}`);
  if (tel !== telAvant) changements.push(`téléphone ${telAvant ? '+' + telAvant : '—'} → ${tel ? '+' + tel : '—'}`);
  if (!changements.length) return { ok: true, message: 'Aucun changement.' };

  if (tel && tel !== telAvant) {
    const { data: libre } = await supabase.rpc('telephone_disponible', { p_telephone: tel });
    if (libre === false) return { ok: false, message: 'Ce numéro est déjà utilisé par un autre compte.' };
  }
  if (!tel && telAvant) return { ok: false, message: 'Le téléphone ne peut pas être effacé (il sert à la connexion).' };

  const { error } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { ...meta, prenom, pays: pays || null, ...(langue ? { langue_interface: langue, langue } : {}) },
    ...(tel && tel !== telAvant ? { phone: tel, phone_confirm: true } : {}),
  });
  if (error) return erreur(error, 'Modification');
  return fini(c, `profil modifié (${changements.join(' ; ')})`, 'Profil mis à jour.');
}

export async function confirmerEmail(id: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  if (c.cible.email_confirmed_at) return { ok: true, message: 'E-mail déjà confirmé.' };
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(id, { email_confirm: true });
  if (error) return erreur(error, 'Confirmation');
  return fini(c, 'e-mail confirmé manuellement', 'E-mail confirmé.');
}

export async function enregistrerNote(id: string, texte: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const note = String(texte ?? '').trim();
  if (note.length > 2000) return { ok: false, message: 'Note trop longue (2 000 caractères maximum).' };
  const supabase = getSupabaseAdmin();
  const { error } = note
    ? await supabase.from('admin_notes_utilisateurs').upsert({ user_id: id, note, auteur: c.admin.email, modifie_le: new Date().toISOString() })
    : await supabase.from('admin_notes_utilisateurs').delete().eq('user_id', id);
  if (error) {
    return { ok: false, message: /admin_notes_utilisateurs/.test(error.message) ? 'Exécutez d’abord schema-utilisateurs-admin.sql dans Supabase.' : `Enregistrement impossible : ${error.message}` };
  }
  return fini(c, note ? 'note interne modifiée' : 'note interne effacée', note ? 'Note enregistrée.' : 'Note effacée.');
}

// ---------------------------------------------------------------------
// Accès et sécurité
// ---------------------------------------------------------------------

const DUREES: Record<string, { ban: string; jours: number | null; texte: string }> = {
  '24h': { ban: '24h', jours: 1, texte: '24 heures' },
  '7j': { ban: '168h', jours: 7, texte: '7 jours' },
  '30j': { ban: '720h', jours: 30, texte: '30 jours' },
  indefini: { ban: '876000h', jours: null, texte: 'jusqu’à réactivation' },
};

async function revoquer(id: string) {
  const { error } = await getSupabaseAdmin().rpc('admin_revoquer_sessions', { p_user: id });
  return !error;
}

export async function suspendre(id: string, motif: string, duree: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const p = protege(c);
  if (p) return p;
  const raison = String(motif ?? '').trim();
  const d = DUREES[duree];
  if (raison.length < 3 || raison.length > 300) return { ok: false, message: 'Indiquez un motif (3 à 300 caractères).' };
  if (!d) return { ok: false, message: 'Durée invalide.' };

  const le = new Date();
  const jusqu = d.jours === null ? null : new Date(le.getTime() + d.jours * 86400000).toISOString();
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(id, {
    ban_duration: d.ban,
    app_metadata: { ...(c.cible.app_metadata ?? {}), suspension: { motif: raison, par: c.admin.email, le: le.toISOString(), jusqu_au: jusqu } },
  });
  if (error) return erreur(error, 'Suspension');
  const deco = await revoquer(id);
  return fini(
    c,
    `compte suspendu ${d.texte} (motif : ${raison})`,
    deco ? `Compte suspendu (${d.texte}) et déconnecté.` : `Compte suspendu (${d.texte}). Déconnexion immédiate indisponible : exécutez schema-utilisateurs-admin.sql.`
  );
}

export async function reactiver(id: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const app = { ...(c.cible.app_metadata ?? {}) } as Record<string, unknown>;
  app.suspension = null;
  const { error } = await getSupabaseAdmin().auth.admin.updateUserById(id, { ban_duration: 'none', app_metadata: app });
  if (error) return erreur(error, 'Réactivation');
  return fini(c, 'compte réactivé', 'Compte réactivé.');
}

export async function deconnecterPartout(id: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const p = protege(c);
  if (p) return p;
  if (!(await revoquer(id))) return { ok: false, message: 'Exécutez d’abord schema-utilisateurs-admin.sql dans Supabase.' };
  return fini(c, 'déconnecté de tous les appareils', 'Toutes les sessions sont fermées (effet complet sous 1 h maximum).');
}

export async function envoyerReinitialisation(id: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  if (!c.cible.email) return { ok: false, message: 'Ce compte n’a pas d’e-mail.' };
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await anon.auth.resetPasswordForEmail(c.cible.email);
  if (error) return erreur(error, 'Envoi');
  return fini(c, 'e-mail de réinitialisation du mot de passe envoyé', `E-mail de réinitialisation envoyé à ${c.cible.email}.`);
}

export async function reinitialiser2fa(id: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('user_totp_factors').delete().eq('user_id', id);
  if (error) return erreur(error, 'Désactivation');
  await supabase.from('mfa_attempts').delete().eq('user_id', id);
  return fini(c, 'vérification en 2 étapes désactivée', 'Vérification en 2 étapes désactivée. La personne pourra la réactiver depuis son profil.');
}

export async function oublierAppareils(id: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const supabase = getSupabaseAdmin();
  const a = await supabase.from('appareils').delete().eq('user_id', id);
  const b = await supabase.from('appareil_actif').delete().eq('user_id', id);
  if (a.error || b.error) return erreur(a.error ?? b.error, 'Opération');
  return fini(c, 'appareils de confiance oubliés', 'Appareils oubliés : la prochaine connexion redemandera un code e-mail.');
}

export async function debloquerConnexion(id: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const supabase = getSupabaseAdmin();
  const tel = chiffres(c.cible.phone);
  if (tel) await supabase.from('login_attempts').delete().in('phone', [tel, `+${tel}`]);
  await supabase.from('mfa_attempts').delete().eq('user_id', id);
  return fini(c, 'connexion débloquée', 'Connexion débloquée.');
}

export async function basculerDemoStore(id: string, actif: boolean): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const supabase = getSupabaseAdmin();
  const { error } = actif
    ? await supabase.from('comptes_revue_store').upsert({ user_id: id, note: `Ajouté depuis le back-office par ${c.admin.email}` })
    : await supabase.from('comptes_revue_store').delete().eq('user_id', id);
  if (error) return erreur(error, 'Opération');
  return fini(c, actif ? 'marqué compte de démonstration store' : 'retiré des comptes de démonstration store', actif ? 'Compte de démonstration activé.' : 'Compte de démonstration retiré.');
}

// ---------------------------------------------------------------------
// Abonnements
// ---------------------------------------------------------------------

export async function offrir(id: string, plan: string, duree: string, note: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  if (plan !== 'racines' && plan !== 'heritage') return { ok: false, message: 'Forfait invalide.' };
  const jours = duree === 'illimite' ? null : Number(duree);
  if (jours !== null && (!Number.isInteger(jours) || jours <= 0 || jours > 3650)) return { ok: false, message: 'Durée invalide.' };
  if (!c.cible.email) return { ok: false, message: 'Ce compte n’a pas d’e-mail.' };
  const { data, error } = await getSupabaseAdmin().rpc('offrir_abonnement', {
    p_email: c.cible.email,
    p_plan: plan,
    p_jours: jours,
    p_note: String(note ?? '').trim().slice(0, 200) || null,
  });
  if (error || !(data as { ok?: boolean } | null)?.ok) return erreur(error ?? { message: 'refusé' }, 'Offre');
  const nom = plan === 'heritage' ? 'Héritage' : 'Racines';
  revalidatePath('/abonnements');
  return fini(c, `abonnement ${nom} offert (${jours === null ? 'sans fin' : `${jours} jours`})`, `Abonnement ${nom} offert.`);
}

export async function retirerAbonnement(id: string, abonnementId: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  if (!UUID.test(abonnementId)) return { ok: false, message: 'Abonnement invalide.' };
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('subscriptions').select('plan').eq('id', abonnementId).eq('user_id', id).maybeSingle();
  if (!data) return { ok: false, message: 'Abonnement introuvable pour ce compte.' };
  const { error } = await supabase.from('subscriptions').update({ status: 'cancelled', ends_at: new Date().toISOString() }).eq('id', abonnementId);
  if (error) return erreur(error, 'Retrait');
  revalidatePath('/abonnements');
  return fini(c, `abonnement ${data.plan} retiré`, 'Abonnement retiré.');
}

// ---------------------------------------------------------------------
// Communauté
// ---------------------------------------------------------------------

export async function bannirCommunaute(id: string, banni: boolean, motif: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const raison = String(motif ?? '').trim();
  if (banni && (raison.length < 3 || raison.length > 300)) return { ok: false, message: 'Indiquez un motif (3 à 300 caractères).' };
  const { data, error } = await getSupabaseAdmin()
    .from('community_profiles')
    .update({ is_banned: banni, ban_reason: banni ? raison : null })
    .eq('user_id', id)
    .select('pseudo');
  if (error) return erreur(error, 'Opération');
  if (!data?.length) return { ok: false, message: 'Ce compte n’a pas de profil communauté.' };
  return fini(c, banni ? `banni de la communauté (motif : ${raison})` : 'bannissement communauté levé', banni ? 'Membre banni de la communauté.' : 'Bannissement levé.');
}

// ---------------------------------------------------------------------
// Suppression définitive
// ---------------------------------------------------------------------

async function effacerFichiers(uid: string) {
  const bucket = getSupabaseAdmin().storage.from('user-uploads');
  const fichiers: string[] = [];
  const parcourir = async (prefixe: string, profondeur: number) => {
    const { data } = await bucket.list(prefixe, { limit: 1000 });
    for (const e of data ?? []) {
      const chemin = `${prefixe}/${e.name}`;
      if (e.id) fichiers.push(chemin);
      else if (profondeur < 4) await parcourir(chemin, profondeur + 1);
    }
  };
  await parcourir(uid, 0);
  for (let i = 0; i < fichiers.length; i += 100) await bucket.remove(fichiers.slice(i, i + 100));
  return fichiers.length;
}

export async function supprimerCompte(id: string, confirmation: string): Promise<Resultat> {
  const c = await contexte(id);
  if ('ok' in c) return c;
  const p = protege(c);
  if (p) return p;
  const attendu = (c.cible.email || `+${chiffres(c.cible.phone)}`).toLowerCase();
  if (String(confirmation ?? '').trim().toLowerCase() !== attendu) return { ok: false, message: 'La confirmation ne correspond pas à l’e-mail du compte.' };

  const supabase = getSupabaseAdmin();
  const nbFichiers = await effacerFichiers(id).catch(() => 0);
  const tel = chiffres(c.cible.phone);
  if (tel) await supabase.from('login_attempts').delete().in('phone', [tel, `+${tel}`]);
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return erreur(error, 'Suppression');
  await supabase.from('security_events').insert({ event_type: 'account_deleted', phone: null, detail: { user_id_prefix: id.slice(0, 8), par: 'back-office' } });
  await logActivity(c.admin.email, `Utilisateurs · ${c.libelle} : compte supprimé définitivement (${nbFichiers} fichier${nbFichiers > 1 ? 's' : ''} effacé${nbFichiers > 1 ? 's' : ''})`);
  revalidatePath('/utilisateurs');
  return { ok: true, message: 'Compte supprimé.' };
}

// ---------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------

export async function journaliserExport(nombre: number, filtres: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  await logActivity(admin.email, `Utilisateurs : export CSV de ${Math.max(0, Math.floor(nombre))} comptes${filtres ? ` (${filtres.slice(0, 200)})` : ''}`);
}
