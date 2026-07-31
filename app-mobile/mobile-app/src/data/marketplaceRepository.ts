import { supabase } from './supabaseClient';
import type {
  MarketplaceCategorie,
  MarketplaceOrder,
  MarketplaceOrderItem,
  MarketplacePaymentMethod,
  MarketplaceProduct,
  MarketplaceProductWithVendor,
  MarketplaceReviewPublic,
  MarketplaceVendorOwn,
  MarketplaceVendorPublic,
} from './marketplaceTypes';

/**
 * Source de données réelle : tables `marketplace_vendors` / `_products` /
 * `_orders` / `_reviews` sur Supabase (voir supabase/schema-marketplace.sql).
 * Catalogue vide au démarrage — aucune donnée insérée par ce workspace,
 * conforme à la décision de Yannick du 2026-07-31 (pas de vendeur/produit
 * fictif). Pas de cache mémoire (contenu commercial dynamique, comme
 * communityRepository.ts).
 */

// ---------------------------------------------------------------------------
// Vendeur
// ---------------------------------------------------------------------------

export async function getOwnVendor(): Promise<MarketplaceVendorOwn | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase.from('marketplace_vendors').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw new Error(`Impossible de charger le profil vendeur : ${error.message}`);
  return data as MarketplaceVendorOwn | null;
}

export async function createOwnVendor(params: {
  nomBoutique: string;
  region: string;
  artisanat: string;
  bio?: string | null;
  avatarUrl?: string | null;
}): Promise<{ vendor: MarketplaceVendorOwn | null; error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { vendor: null, error: 'Aucune session active.' };

  const { data, error } = await supabase
    .from('marketplace_vendors')
    .insert({
      user_id: userId,
      nom_boutique: params.nomBoutique,
      region: params.region,
      artisanat: params.artisanat,
      bio: params.bio ?? null,
      avatar_url: params.avatarUrl ?? null,
    })
    .select('*')
    .single();

  if (error) return { vendor: null, error: translateMarketError(error.message) };
  return { vendor: data as MarketplaceVendorOwn, error: null };
}

export async function getVendorPublicById(id: string): Promise<MarketplaceVendorPublic | null> {
  const { data, error } = await supabase.from('marketplace_vendors_public').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Impossible de charger ce vendeur : ${error.message}`);
  return data as MarketplaceVendorPublic | null;
}

async function getVendorsPublicByIds(ids: string[]): Promise<Map<string, MarketplaceVendorPublic>> {
  const uniqueIds = Array.from(new Set(ids));
  const map = new Map<string, MarketplaceVendorPublic>();
  if (uniqueIds.length === 0) return map;
  const { data, error } = await supabase.from('marketplace_vendors_public').select('*').in('id', uniqueIds);
  if (error) throw new Error(`Impossible de charger les vendeurs : ${error.message}`);
  for (const v of (data ?? []) as MarketplaceVendorPublic[]) map.set(v.id, v);
  return map;
}

// ---------------------------------------------------------------------------
// Produits
// ---------------------------------------------------------------------------

export async function getProducts(): Promise<MarketplaceProductWithVendor[]> {
  const { data, error } = await supabase.from('marketplace_products').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(`Impossible de charger le catalogue : ${error.message}`);
  const products = (data ?? []) as MarketplaceProduct[];
  const vendors = await getVendorsPublicByIds(products.map((p) => p.vendor_id));
  return products.map((p) => ({ ...p, vendor: vendors.get(p.vendor_id) ?? null }));
}

export async function getProductById(id: string): Promise<MarketplaceProductWithVendor | null> {
  const { data, error } = await supabase.from('marketplace_products').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Impossible de charger ce produit : ${error.message}`);
  if (!data) return null;
  const product = data as MarketplaceProduct;
  const vendor = await getVendorPublicById(product.vendor_id);
  return { ...product, vendor };
}

/**
 * Incrémente le compteur de vues (donnée réelle affichée côté vendeur, pas
 * inventée). Lecture puis écriture plutôt qu'une fonction RPC dédiée, pour
 * rester simple : accepte une petite marge d'imprécision en cas de vues
 * concurrentes, sans conséquence sur un simple compteur d'affichage.
 */
export async function incrementProductViews(id: string): Promise<void> {
  const { data } = await supabase.from('marketplace_products').select('vues').eq('id', id).maybeSingle();
  if (data) {
    await supabase
      .from('marketplace_products')
      .update({ vues: (data.vues as number) + 1 })
      .eq('id', id);
  }
}

export async function getProductsByVendor(vendorId: string, excludeProductId?: string): Promise<MarketplaceProduct[]> {
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Impossible de charger les produits de ce vendeur : ${error.message}`);
  const products = (data ?? []) as MarketplaceProduct[];
  return excludeProductId ? products.filter((p) => p.id !== excludeProductId) : products;
}

export async function getOwnVendorProducts(vendorId: string): Promise<MarketplaceProduct[]> {
  const { data, error } = await supabase
    .from('marketplace_products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Impossible de charger tes produits : ${error.message}`);
  return (data ?? []) as MarketplaceProduct[];
}

export async function createProduct(params: {
  vendorId: string;
  nom: string;
  description?: string | null;
  categorie: MarketplaceCategorie;
  prixFcfa: number;
  stock: number;
  imageUrl?: string | null;
}): Promise<{ product: MarketplaceProduct | null; error: string | null }> {
  const { data, error } = await supabase
    .from('marketplace_products')
    .insert({
      vendor_id: params.vendorId,
      nom: params.nom,
      description: params.description ?? null,
      categorie: params.categorie,
      prix_fcfa: params.prixFcfa,
      stock: params.stock,
      image_url: params.imageUrl ?? null,
    })
    .select('*')
    .single();
  if (error) return { product: null, error: translateMarketError(error.message) };
  return { product: data as MarketplaceProduct, error: null };
}

export async function updateProduct(
  id: string,
  patch: { nom?: string; description?: string | null; categorie?: MarketplaceCategorie; prixFcfa?: number; stock?: number; imageUrl?: string | null }
): Promise<{ error: string | null }> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.nom !== undefined) dbPatch.nom = patch.nom;
  if (patch.description !== undefined) dbPatch.description = patch.description;
  if (patch.categorie !== undefined) dbPatch.categorie = patch.categorie;
  if (patch.prixFcfa !== undefined) dbPatch.prix_fcfa = patch.prixFcfa;
  if (patch.stock !== undefined) dbPatch.stock = patch.stock;
  if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl;
  const { error } = await supabase.from('marketplace_products').update(dbPatch).eq('id', id);
  return { error: error ? translateMarketError(error.message) : null };
}

// ---------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------

/**
 * Éclate le panier (potentiellement multi-vendeurs) en une commande par
 * vendeur, toutes créées avec `statut = 'en_attente_paiement'` — le
 * paiement Mobile Money n'est pas intégré, jamais de faux succès de
 * paiement ici.
 */
export async function placeOrder(params: {
  itemsByVendor: Map<string, MarketplaceOrderItem[]>;
  livraison: { nomComplet: string; adresse: string; ville: string; telephone: string };
  methodePaiement: MarketplacePaymentMethod;
}): Promise<{ orders: MarketplaceOrder[]; error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { orders: [], error: 'Aucune session active.' };

  const rows = Array.from(params.itemsByVendor.entries()).map(([vendorId, items]) => ({
    buyer_user_id: userId,
    vendor_id: vendorId,
    items,
    montant_total_fcfa: items.reduce((sum, it) => sum + it.prix_unitaire_fcfa * it.quantite, 0),
    livraison_nom_complet: params.livraison.nomComplet,
    livraison_adresse: params.livraison.adresse,
    livraison_ville: params.livraison.ville,
    livraison_telephone: params.livraison.telephone,
    methode_paiement: params.methodePaiement,
  }));

  const { data, error } = await supabase.from('marketplace_orders').insert(rows).select('*');
  if (error) return { orders: [], error: translateMarketError(error.message) };
  return { orders: (data ?? []) as MarketplaceOrder[], error: null };
}

export async function getOwnBuyerOrders(): Promise<MarketplaceOrder[]> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from('marketplace_orders')
    .select('*')
    .eq('buyer_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Impossible de charger tes commandes : ${error.message}`);
  return (data ?? []) as MarketplaceOrder[];
}

export async function getVendorOrders(vendorId: string): Promise<MarketplaceOrder[]> {
  const { data, error } = await supabase
    .from('marketplace_orders')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Impossible de charger les commandes : ${error.message}`);
  return (data ?? []) as MarketplaceOrder[];
}

export async function markOrderShipped(orderId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('marketplace_orders').update({ statut: 'expediee' }).eq('id', orderId);
  return { error: error ? translateMarketError(error.message) : null };
}

// ---------------------------------------------------------------------------
// Avis
// ---------------------------------------------------------------------------

export async function getProductReviews(productId: string): Promise<MarketplaceReviewPublic[]> {
  const { data, error } = await supabase
    .from('marketplace_reviews_public')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Impossible de charger les avis : ${error.message}`);
  return (data ?? []) as MarketplaceReviewPublic[];
}

export async function createReview(params: {
  productId: string;
  auteurNom: string;
  note: number;
  commentaire: string;
  imageUrl?: string | null;
}): Promise<{ error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: 'Aucune session active.' };
  const { error } = await supabase.from('marketplace_reviews').insert({
    product_id: params.productId,
    buyer_user_id: userId,
    auteur_nom: params.auteurNom,
    note: params.note,
    commentaire: params.commentaire,
    image_url: params.imageUrl ?? null,
  });
  return { error: error ? translateMarketError(error.message) : null };
}

/** Avis sur tous les produits d'un vendeur, avec le nom du produit joint pour l'affichage. */
export async function getVendorReviews(
  vendorId: string
): Promise<(MarketplaceReviewPublic & { productNom: string })[]> {
  const products = await getOwnVendorProducts(vendorId);
  if (products.length === 0) return [];
  const productMap = new Map(products.map((p) => [p.id, p.nom]));
  const { data, error } = await supabase
    .from('marketplace_reviews_public')
    .select('*')
    .in('product_id', products.map((p) => p.id))
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Impossible de charger les avis : ${error.message}`);
  return ((data ?? []) as MarketplaceReviewPublic[]).map((r) => ({
    ...r,
    productNom: productMap.get(r.product_id) ?? 'Produit',
  }));
}

/** Moyenne + nombre d'avis par produit — pour la note affichée sur les cartes catalogue. Jamais une note inventée : `undefined`/absent tant qu'aucun avis n'existe. */
export async function getProductRatingSummaries(
  productIds: string[]
): Promise<Map<string, { moyenne: number; total: number }>> {
  const map = new Map<string, { moyenne: number; total: number }>();
  const uniqueIds = Array.from(new Set(productIds));
  if (uniqueIds.length === 0) return map;
  const { data, error } = await supabase.from('marketplace_reviews_public').select('product_id, note').in('product_id', uniqueIds);
  if (error) throw new Error(`Impossible de charger les notes produits : ${error.message}`);
  const sums = new Map<string, { sum: number; count: number }>();
  for (const row of (data ?? []) as { product_id: string; note: number }[]) {
    const cur = sums.get(row.product_id) ?? { sum: 0, count: 0 };
    cur.sum += row.note;
    cur.count += 1;
    sums.set(row.product_id, cur);
  }
  for (const [id, { sum, count }] of sums) {
    map.set(id, { moyenne: sum / count, total: count });
  }
  return map;
}

export async function replyToReview(reviewId: string, reponse: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('marketplace_reviews').update({ reponse_vendeur: reponse }).eq('id', reviewId);
  return { error: error ? translateMarketError(error.message) : null };
}

// ---------------------------------------------------------------------------

function translateMarketError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('row-level security') || lower.includes('policy')) {
    return 'Action non autorisée pour ce compte.';
  }
  if (lower.includes('duplicate key') && lower.includes('marketplace_vendors')) {
    return 'Tu as déjà une boutique enregistrée sur ce compte.';
  }
  return message;
}
