'use server';

import { getSupabaseAdmin } from './supabase/server';

/**
 * Lot 2 cybersécurité (2026-09-25) : vérifie l'intégrité d'une fiche de
 * contenu (héros, Découverte, Mythologie) en recalculant son empreinte
 * SHA-256 côté base (fonction `verify_content_integrity`, voir
 * mobile-app/supabase/schema-integrite-contenu.sql) et en la comparant à
 * l'empreinte stockée. Partagé entre les 3 fiches plutôt que dupliqué —
 * seul `tableName` change.
 */
export type IntegrityCheckResult =
  | { ok: true; match: boolean; storedHash: string | null; recomputedHash: string }
  | { ok: false; error: string };

export async function verifyContentIntegrity(
  tableName: 'heros' | 'decouverte_items' | 'mythes',
  rowId: string
): Promise<IntegrityCheckResult> {
  const { data, error } = await getSupabaseAdmin().rpc('verify_content_integrity', {
    p_table_name: tableName,
    p_row_id: rowId,
  });
  if (error) return { ok: false, error: error.message };
  if (!data || data.error) return { ok: false, error: data?.error ?? 'Réponse inattendue.' };
  return { ok: true, match: !!data.match, storedHash: data.stored_hash ?? null, recomputedHash: data.recomputed_hash };
}
