import { getSupabaseAdmin } from '../supabase/server';

/**
 * Données transverses pour le tableau de bord — utilisateurs et
 * signalements. Comptés réellement via l'API admin Supabase (clé
 * service_role), jamais un chiffre inventé. Best-effort : si une source
 * échoue (ex. table pas encore créée côté Communauté), on retombe sur `null`
 * plutôt que de faire planter tout le tableau de bord.
 */

export interface UsersOverview {
  total: number;
  parForfait: Record<string, number>;
}

/**
 * `auth.admin.listUsers()` est paginé (50 par page par défaut) — l'app
 * mobile est encore jeune (pas de volume à ce jour), donc une seule page
 * suffit en pratique, mais on boucle par sécurité plutôt que de plafonner
 * silencieusement le compte.
 */
export async function getUsersOverview(): Promise<UsersOverview | null> {
  try {
    const admin = getSupabaseAdmin();
    const parForfait: Record<string, number> = {};
    let total = 0;
    let page = 1;
    for (;;) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      for (const u of data.users) {
        total++;
        const forfait = (u.user_metadata?.forfait as string | undefined) ?? 'inconnu';
        parForfait[forfait] = (parForfait[forfait] ?? 0) + 1;
      }
      if (data.users.length < 200) break;
      page++;
      if (page > 20) break; // garde-fou, 4000 comptes — largement au-delà du volume réel actuel
    }
    return { total, parForfait };
  } catch (e) {
    console.warn('Vue d\'ensemble utilisateurs indisponible :', e);
    return null;
  }
}

export async function getPendingReportsCount(): Promise<number | null> {
  try {
    const { count, error } = await getSupabaseAdmin()
      .from('community_reports')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'en_attente');
    if (error) throw error;
    return count ?? 0;
  } catch (e) {
    console.warn('Comptage des signalements indisponible (table pas encore créée ?) :', e);
    return null;
  }
}
