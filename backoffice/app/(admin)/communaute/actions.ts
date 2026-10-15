'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin, type AdminUser } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

/**
 * Module Communauté (cdc-module-communaute.md, § 3 et § 5). Aucune ligne
 * n'est effacée : la modération change des statuts, et chaque signalement
 * traité garde l'administrateur et la date.
 */

export type Resultat = { ok: boolean; message: string };
export type Decision = 'masquer' | 'supprimer' | 'republier' | 'rejeter';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TABLE = { post: 'community_posts', commentaire: 'community_comments' } as const;
const NOM = { post: 'publication', commentaire: 'commentaire' } as const;

async function verifier(): Promise<AdminUser | null> {
  return requireAdmin();
}

function fini(admin: AdminUser, journal: string, message: string): Resultat {
  void logActivity(admin.email, `Communauté : ${journal}`);
  revalidatePath('/communaute');
  revalidatePath('/', 'layout');
  return { ok: true, message };
}

async function resoudreSignalements(cibleType: 'post' | 'commentaire' | 'profil', cibleId: string, statut: 'traite_action' | 'traite_rejete', admin: AdminUser) {
  await getSupabaseAdmin()
    .from('community_reports')
    .update({ statut, traite_par: admin.email, resolved_at: new Date().toISOString() })
    .eq('target_type', cibleType)
    .eq('target_id', cibleId)
    .eq('statut', 'en_attente');
}

function extrait(t: string) {
  return t.length > 60 ? `${t.slice(0, 60)}…` : t;
}

export async function moderer(type: 'post' | 'commentaire', id: string, decision: Decision): Promise<Resultat> {
  const admin = await verifier();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(id) || !(type in TABLE)) return { ok: false, message: 'Contenu invalide.' };
  const supabase = getSupabaseAdmin();
  const { data: c } = await supabase.from(TABLE[type]).select('contenu_texte, statut').eq('id', id).maybeSingle();
  if (!c) return { ok: false, message: 'Contenu introuvable.' };

  const statut = decision === 'masquer' ? 'masque_signalement' : decision === 'supprimer' ? 'supprime' : 'publie';
  const { error } = await supabase.from(TABLE[type]).update({ statut }).eq('id', id);
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  await resoudreSignalements(type, id, decision === 'masquer' || decision === 'supprimer' ? 'traite_action' : 'traite_rejete', admin);

  const verbe = { masquer: 'masqué', supprimer: 'supprimé', republier: 'republié', rejeter: 'signalement rejeté, contenu laissé en ligne' }[decision];
  return fini(admin, `${NOM[type]} « ${extrait(String(c.contenu_texte ?? ''))} » : ${verbe}`, `${NOM[type] === 'publication' ? 'Publication' : 'Commentaire'} : ${verbe}.`);
}

export async function bannirMembre(profilId: string, motif: string, contenu?: { type: 'post' | 'commentaire'; id: string }): Promise<Resultat> {
  const admin = await verifier();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  const raison = String(motif ?? '').trim();
  if (!UUID.test(profilId)) return { ok: false, message: 'Membre invalide.' };
  if (raison.length < 3 || raison.length > 300) return { ok: false, message: 'Indiquez un motif (3 à 300 caractères).' };
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('community_profiles').update({ is_banned: true, ban_reason: raison }).eq('id', profilId).select('pseudo');
  if (error || !data?.length) return { ok: false, message: `Échec : ${error?.message ?? 'membre introuvable'}` };
  await resoudreSignalements('profil', profilId, 'traite_action', admin);
  if (contenu && UUID.test(contenu.id) && contenu.type in TABLE) {
    await supabase.from(TABLE[contenu.type]).update({ statut: 'masque_signalement' }).eq('id', contenu.id).eq('statut', 'publie');
    await resoudreSignalements(contenu.type, contenu.id, 'traite_action', admin);
  }
  return fini(admin, `membre @${data[0].pseudo} banni (motif : ${raison})`, `@${data[0].pseudo} est banni de la communauté.`);
}

export async function leverBannissement(profilId: string): Promise<Resultat> {
  const admin = await verifier();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(profilId)) return { ok: false, message: 'Membre invalide.' };
  const { data, error } = await getSupabaseAdmin().from('community_profiles').update({ is_banned: false, ban_reason: null }).eq('id', profilId).select('pseudo');
  if (error || !data?.length) return { ok: false, message: `Échec : ${error?.message ?? 'membre introuvable'}` };
  return fini(admin, `bannissement de @${data[0].pseudo} levé`, `Bannissement de @${data[0].pseudo} levé.`);
}

export async function rejeterSignalementsProfil(profilId: string): Promise<Resultat> {
  const admin = await verifier();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  if (!UUID.test(profilId)) return { ok: false, message: 'Membre invalide.' };
  await resoudreSignalements('profil', profilId, 'traite_rejete', admin);
  return fini(admin, `signalements du profil ${profilId.slice(0, 8)} rejetés`, 'Signalements rejetés.');
}

// ---------------------------------------------------------------------
// Mots interdits et réglages
// ---------------------------------------------------------------------

export async function ajouterTerme(brut: string): Promise<Resultat> {
  const admin = await verifier();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  const terme = String(brut ?? '').trim().toLowerCase();
  if (terme.length < 2 || terme.length > 60) return { ok: false, message: 'Le mot doit faire entre 2 et 60 caractères.' };
  const { error } = await getSupabaseAdmin().from('community_banned_terms').upsert({ term: terme });
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  return fini(admin, `mot interdit ajouté (${terme.length} caractères)`, `« ${terme} » ajouté aux mots interdits.`);
}

export async function retirerTerme(terme: string): Promise<Resultat> {
  const admin = await verifier();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  const { error } = await getSupabaseAdmin().from('community_banned_terms').delete().eq('term', String(terme ?? ''));
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  return fini(admin, 'mot interdit retiré', `« ${terme} » retiré des mots interdits.`);
}

export async function testerPhrase(texte: string): Promise<{ ok: boolean; terme: string | null; message: string }> {
  const admin = await verifier();
  if (!admin) return { ok: false, terme: null, message: 'Non autorisé.' };
  const { data, error } = await getSupabaseAdmin().rpc('admin_tester_terme', { p_texte: String(texte ?? '').slice(0, 500) });
  if (error) return { ok: false, terme: null, message: 'Exécutez d’abord schema-communaute-moderation.sql dans Supabase.' };
  const terme = (data as string | null) ?? null;
  return { ok: true, terme, message: terme ? `Bloqué par le mot « ${terme} ».` : 'Autorisé : aucun mot interdit.' };
}

export async function enregistrerSeuil(n: number): Promise<Resultat> {
  const admin = await verifier();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  const seuil = Math.floor(Number(n));
  if (!Number.isFinite(seuil) || seuil < 0 || seuil > 50) return { ok: false, message: 'Seuil entre 0 (désactivé) et 50.' };
  const supabase = getSupabaseAdmin();
  const { data: ligne, error: e1 } = await supabase.from('app_settings').select('data').eq('id', 1).maybeSingle();
  if (e1) return { ok: false, message: `Lecture impossible : ${e1.message}` };
  const data = (ligne?.data as Record<string, unknown>) ?? {};
  const communaute = { ...((data.communaute as Record<string, unknown>) ?? {}), seuil_masquage: seuil };
  const { error } = await supabase.from('app_settings').upsert({ id: 1, data: { ...data, communaute }, updated_at: new Date().toISOString(), updated_by: admin.email });
  if (error) return { ok: false, message: `Enregistrement impossible : ${error.message}` };
  return fini(admin, `masquage automatique réglé à ${seuil === 0 ? 'désactivé' : `${seuil} signaleurs`}`, seuil === 0 ? 'Masquage automatique désactivé.' : `Masquage automatique dès ${seuil} signaleurs différents.`);
}
