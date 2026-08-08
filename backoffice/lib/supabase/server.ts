import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Deux clients Supabase distincts, jamais confondus :
 *
 * - `supabaseAdmin` (clé service_role) : contourne RLS, utilisé pour TOUTES
 *   les lectures/écritures de contenu (héros, admin_users, activité,
 *   Storage...). N'existe et ne s'exécute que côté serveur (Server
 *   Components, Server Actions) — jamais importé depuis un composant client.
 *   La clé n'est jamais préfixée NEXT_PUBLIC_, donc jamais envoyée au
 *   navigateur par Next.js.
 * - `createSessionClient()` (clé anon + cookies de session) : sert
 *   UNIQUEMENT à savoir qui est connecté (`auth.getClaims()`, voir
 *   `lib/auth.ts#requireAdmin()` — vérification locale du JWT, plus rapide
 *   que `getUser()`, changé le 2026-08-06). Ne lit ni n'écrit aucun
 *   contenu — l'admin_users/heros passent toujours par `supabaseAdmin`.
 */

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants — voir .env.local (copier .env.local.example).'
    );
  }
  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export async function createSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants — voir .env.local.');
  }
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component (lecture seule) : le
          // rafraîchissement du cookie est déjà géré par le middleware,
          // cet appel peut échouer silencieusement ici sans conséquence.
        }
      },
    },
  });
}
