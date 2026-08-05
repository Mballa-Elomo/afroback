/**
 * Types miroir du schéma Postgres du module Don (voir supabase/schema-don.sql).
 * Une seule cause générique à ce jour ("soutenir_afroback"), pas de type
 * union sur `cause` : garder une simple `string` évite de coder en dur une
 * liste qui pourrait évoluer sans que ce soit une vraie décision produit.
 */

export type DonPaymentMethod = 'mtn_momo' | 'orange_money';

export interface Don {
  id: string;
  donateur_user_id: string;
  montant_fcfa: number;
  cause: string;
  recurrent: boolean;
  anonyme: boolean;
  methode_paiement: DonPaymentMethod;
  statut: string;
  created_at: string;
}
