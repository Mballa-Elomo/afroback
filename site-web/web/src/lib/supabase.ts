import { createClient } from '@supabase/supabase-js';

/**
 * Même Supabase que l'application AFROBACK, avec la clé publique uniquement
 * (aucune clé de service dans le site). Les règles d'accès (RLS, fonctions
 * get_*_detail) s'appliquent donc exactement comme dans l'app.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: typeof window !== 'undefined', storageKey: 'afroback-web' },
});

/** Lecture REST publique, mise en cache par Next (catalogue rafraîchi toutes les 2 minutes). */
export async function restGet<T>(path: string, revalidate = 120): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} sur ${path.split('?')[0]}`);
  return res.json() as Promise<T>;
}

/** Appel d'une fonction serveur (RPC) en lecture publique. */
export async function rpcGet<T>(fn: string, args: Record<string, unknown>, revalidate = 120): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} sur ${fn}`);
  return res.json() as Promise<T>;
}
