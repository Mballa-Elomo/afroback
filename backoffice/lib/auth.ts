import { redirect } from 'next/navigation';
import { createSessionClient, getSupabaseAdmin } from './supabase/server';

export interface AdminUser {
  id: string;
  email: string;
  nom: string;
  role: 'admin_complet';
}

/**
 * Vérifie qu'une session Supabase Auth valide existe (le middleware l'a déjà
 * fait une première fois, mais un Server Component ne peut pas faire
 * confiance au middleware seul — protection réelle contre la classe de
 * faille "middleware bypass" de Next.js, CVE-2025-29927) ET que l'email
 * correspond à une ligne dans `admin_users` — double contrôle volontaire :
 * avoir un compte Supabase Auth valide ne suffit pas à administrer AFROBACK,
 * il faut être explicitement listé. Redirige vers /login si pas de session ;
 * retourne `null` (jamais une redirection en boucle) si la session est
 * valide mais pas autorisée — la page appelante affiche alors un message
 * "Accès refusé" avec un lien de déconnexion.
 *
 * Perf corrigée le 2026-08-06 : utilisait `getUser()`, un deuxième
 * aller-retour réseau vers Supabase Auth à chaque navigation (en plus de
 * celui déjà fait par le middleware, `lib/supabase/middleware.ts`) — les
 * deux réunis expliquaient la lenteur signalée par Yannick. Remplacé par
 * `getClaims()` (vérification locale du JWT, voir le détail complet dans
 * `lib/supabase/middleware.ts`) : même niveau de vérification réelle
 * (double contrôle conservé, pas de recul sur la protection CVE-2025-29927),
 * juste sans le coût réseau.
 */
export async function requireAdmin(): Promise<AdminUser | null> {
  const session = await createSessionClient();
  const { data } = await session.auth.getClaims();
  const claims = data?.claims;
  const email = claims?.email;

  if (!email) {
    redirect('/login');
  }

  const admin = getSupabaseAdmin();
  const { data: adminRow } = await admin.from('admin_users').select('id, email, nom, role').eq('email', email).maybeSingle();

  if (!adminRow) return null;
  return adminRow as AdminUser;
}
