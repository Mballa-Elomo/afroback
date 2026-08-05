import { supabase } from './supabaseClient';
import type { Don, DonPaymentMethod } from './donTypes';

/**
 * Source de données réelle : table `dons` sur Supabase (voir
 * supabase/schema-don.sql). Comme marketplaceRepository.ts/placeOrder :
 * jamais de faux succès de paiement, le don est enregistré avec le statut
 * 'en_attente_paiement' tant que Mobile Money n'est pas intégré.
 */
export async function createDon(params: {
  montantFcfa: number;
  recurrent: boolean;
  anonyme: boolean;
  methodePaiement: DonPaymentMethod;
}): Promise<{ don: Don | null; error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { don: null, error: 'Aucune session active.' };

  const { data, error } = await supabase
    .from('dons')
    .insert({
      donateur_user_id: userId,
      montant_fcfa: params.montantFcfa,
      recurrent: params.recurrent,
      anonyme: params.anonyme,
      methode_paiement: params.methodePaiement,
    })
    .select('*')
    .single();

  if (error) {
    const lower = error.message.toLowerCase();
    const msg = lower.includes('row-level security') || lower.includes('policy')
      ? 'Action non autorisée pour ce compte.'
      : error.message;
    return { don: null, error: msg };
  }
  return { don: data as Don, error: null };
}
