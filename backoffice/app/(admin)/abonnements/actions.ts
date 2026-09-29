'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

/**
 * Abonnements (cdc-acces-gratuit-abonnement.md, décision D5 du 2026-09-29) :
 * tant que le paiement Mobile Money n'existe pas (Module 4), Yannick offre
 * des accès aux testeurs et partenaires depuis ici. Tout passe par la clé
 * service_role : l'app mobile ne peut ni créer ni modifier un abonnement.
 * Nécessite app-mobile/mobile-app/supabase/schema-acces-abonnement.sql.
 */

export type ActionState = { ok: boolean; message: string } | null;

const TYPES = ['heros', 'mythe', 'decouverte'] as const;

export async function offrirAbonnement(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };

  const email = String(formData.get('email') ?? '').trim();
  const plan = String(formData.get('plan') ?? 'racines');
  const dureeRaw = String(formData.get('duree') ?? '30');
  const note = String(formData.get('note') ?? '').trim() || null;
  if (!email.includes('@')) return { ok: false, message: 'Adresse e-mail invalide.' };
  if (plan !== 'racines' && plan !== 'heritage') return { ok: false, message: 'Forfait invalide.' };
  const jours = dureeRaw === 'illimite' ? null : Number(dureeRaw);
  if (jours !== null && (!Number.isFinite(jours) || jours <= 0)) return { ok: false, message: 'Durée invalide.' };

  const { data, error } = await getSupabaseAdmin().rpc('offrir_abonnement', {
    p_email: email,
    p_plan: plan,
    p_jours: jours,
    p_note: note,
  });
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  const res = data as { ok: boolean; error?: string } | null;
  if (!res?.ok) {
    return {
      ok: false,
      message:
        res?.error === 'utilisateur_introuvable'
          ? "Aucun compte AFROBACK n'existe avec cet e-mail. La personne doit d'abord créer son compte dans l'app."
          : 'Échec inconnu.',
    };
  }
  await logActivity(admin.email, `Abonnement ${plan} offert à ${email} (${jours === null ? 'sans fin' : `${jours} jours`})`);
  revalidatePath('/abonnements');
  return { ok: true, message: `Abonnement ${plan === 'heritage' ? 'Héritage' : 'Racines'} offert à ${email}.` };
}

export async function retirerAbonnement(id: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('subscriptions').select('user_id, plan').eq('id', id).maybeSingle();
  await supabase.from('subscriptions').update({ status: 'cancelled', ends_at: new Date().toISOString() }).eq('id', id);
  await logActivity(admin.email, `Abonnement ${data?.plan ?? ''} retiré (id ${id})`);
  revalidatePath('/abonnements');
}

export async function ajouterContenuGratuit(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: 'Non autorisé.' };
  const type = String(formData.get('type') ?? '') as (typeof TYPES)[number];
  const slug = String(formData.get('slug') ?? '').trim();
  if (!TYPES.includes(type) || !slug) return { ok: false, message: 'Type ou identifiant manquant.' };

  const supabase = getSupabaseAdmin();
  const table = type === 'heros' ? 'heros' : type === 'mythe' ? 'mythes' : 'decouverte_items';
  const { data: exists } = await supabase.from(table).select('slug').eq('slug', slug).maybeSingle();
  if (!exists) return { ok: false, message: `Aucun contenu "${slug}" dans ${table}. Vérifie l'identifiant (slug).` };

  const { error } = await supabase.from('contenus_gratuits').upsert({ type, slug });
  if (error) return { ok: false, message: `Échec : ${error.message}` };
  await logActivity(admin.email, `Contenu rendu gratuit : ${type}/${slug}`);
  revalidatePath('/abonnements');
  return { ok: true, message: `"${slug}" est maintenant gratuit.` };
}

export async function retirerContenuGratuit(type: string, slug: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  await getSupabaseAdmin().from('contenus_gratuits').delete().eq('type', type).eq('slug', slug);
  await logActivity(admin.email, `Contenu retiré de la liste gratuite : ${type}/${slug}`);
  revalidatePath('/abonnements');
}
