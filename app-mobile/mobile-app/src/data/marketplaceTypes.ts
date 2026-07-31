/**
 * Types miroir du schéma Postgres du pilier Marketplace (voir
 * supabase/schema-marketplace.sql). Mêmes conventions que les autres
 * piliers : `| null` pour les colonnes vides, jamais `undefined`.
 *
 * Volontairement absent : tout ce qui touche à une commission ou un palier
 * d'abonnement vendeur — ce n'est pas une décision prise par Yannick à ce
 * jour (voir data-model-marketplace.md).
 */

export type MarketplaceCategorie =
  | 'sculpture'
  | 'bijoux'
  | 'textile'
  | 'poterie'
  | 'peinture'
  | 'instrument'
  | 'autre';

export type MarketplaceProductStatut = 'en_ligne' | 'rupture';
export type MarketplaceOrderStatut = 'en_attente_paiement' | 'expediee' | 'livree' | 'annulee';
export type MarketplacePaymentMethod = 'mtn_momo' | 'orange_money';

export interface MarketplaceVendorPublic {
  id: string;
  nom_boutique: string;
  region: string;
  artisanat: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface MarketplaceVendorOwn {
  id: string;
  user_id: string;
  nom_boutique: string;
  region: string;
  artisanat: string;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MarketplaceProduct {
  id: string;
  vendor_id: string;
  nom: string;
  description: string | null;
  categorie: MarketplaceCategorie;
  prix_fcfa: number;
  stock: number;
  statut: MarketplaceProductStatut;
  image_url: string | null;
  vues: number;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceProductWithVendor extends MarketplaceProduct {
  vendor: MarketplaceVendorPublic | null;
}

export interface MarketplaceOrderItem {
  product_id: string;
  nom: string;
  prix_unitaire_fcfa: number;
  quantite: number;
}

export interface MarketplaceOrder {
  id: string;
  buyer_user_id: string;
  vendor_id: string;
  items: MarketplaceOrderItem[];
  montant_total_fcfa: number;
  livraison_nom_complet: string;
  livraison_adresse: string;
  livraison_ville: string;
  livraison_telephone: string;
  methode_paiement: MarketplacePaymentMethod;
  statut: MarketplaceOrderStatut;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceReviewPublic {
  id: string;
  product_id: string;
  auteur_nom: string;
  note: number;
  commentaire: string;
  image_url: string | null;
  reponse_vendeur: string | null;
  created_at: string;
}
