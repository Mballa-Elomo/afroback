'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

/**
 * Modération des commentaires des contenus (cdc-commentaires.md, décision D4
 * du 2026-09-30). Passe par la clé service_role : l'app ne peut pas
 * modérer. Nécessite app-mobile/mobile-app/supabase/schema-commentaires.sql.
 */

async function recountReplies(parentId: string | null) {
  if (!parentId) return;
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from('content_comments')
    .select('id', { count: 'exact', head: true })
    .eq('parent_id', parentId)
    .eq('statut', 'publie');
  await supabase.from('content_comments').update({ reply_count: count ?? 0 }).eq('id', parentId);
}

/** Masque un commentaire (reste en base, invisible dans l'app). */
export async function masquerCommentaire(id: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('content_comments')
    .update({ statut: 'masque_moderation' })
    .eq('id', id)
    .select('parent_id, content_type, content_slug')
    .maybeSingle();
  await recountReplies(data?.parent_id ?? null);
  await logActivity(admin.email, `Commentaire masqué (${data?.content_type ?? ''}/${data?.content_slug ?? ''}, id ${id})`);
  revalidatePath('/commentaires');
}

/** Rétablit un commentaire masqué (filtre, signalements ou modération) et remet ses signalements à zéro. */
export async function retablirCommentaire(id: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  const supabase = getSupabaseAdmin();
  await supabase.from('content_comment_reports').delete().eq('comment_id', id);
  const { data } = await supabase
    .from('content_comments')
    .update({ statut: 'publie', nb_signalements: 0 })
    .eq('id', id)
    .neq('statut', 'supprime')
    .select('parent_id, content_type, content_slug')
    .maybeSingle();
  await recountReplies(data?.parent_id ?? null);
  await logActivity(admin.email, `Commentaire rétabli (${data?.content_type ?? ''}/${data?.content_slug ?? ''}, id ${id})`);
  revalidatePath('/commentaires');
}
