import { getSupabaseAdmin } from './supabase/server';

/**
 * Journal d'activité (écran Paramètres du cahier des charges, pas encore
 * construit en lot 1, mais alimenté dès maintenant pour que l'historique
 * existe quand cet écran arrivera). Best-effort : une écriture de log qui
 * échoue ne doit jamais faire échouer l'action métier elle-même.
 */
export async function logActivity(adminEmail: string, action: string): Promise<void> {
  try {
    await getSupabaseAdmin().from('admin_activity_log').insert({ admin_email: adminEmail, action });
  } catch (e) {
    console.warn('Journal d\'activité : écriture impossible :', e);
  }
}
