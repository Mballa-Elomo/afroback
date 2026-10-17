'use client';

import { supabase } from './supabase';
import { pick, tc, type Lang } from './lang';

/**
 * Marché AFROBACK : mêmes tables et règles que l'app (marketplace_*).
 * Paiement des commandes : comme dans l'app, le Mobile Money n'est pas
 * encore branché sur le Marché ; la commande est enregistrée « en attente de
 * paiement » et le vendeur contacte l'acheteur (jamais présenté autrement).
 */

export type Categorie = 'sculpture' | 'bijoux' | 'textile' | 'poterie' | 'peinture' | 'instrument' | 'autre';
export const CATEGORIES: { id: Categorie; label: string; en: string }[] = [
  { id: 'sculpture', label: 'Sculpture', en: 'Sculpture' },
  { id: 'bijoux', label: 'Bijoux', en: 'Jewellery' },
  { id: 'textile', label: 'Textile', en: 'Textile' },
  { id: 'poterie', label: 'Poterie', en: 'Pottery' },
  { id: 'peinture', label: 'Peinture', en: 'Painting' },
  { id: 'instrument', label: 'Instrument', en: 'Instrument' },
  { id: 'autre', label: 'Autre', en: 'Other' },
];
export const catLabel = (c: string, lang: Lang) => {
  const x = CATEGORIES.find((k) => k.id === c);
  return x ? pick(lang, x.label, x.en) : c;
};

export type Vendor = { id: string; nom_boutique: string; region: string; artisanat: string; bio: string | null; avatar_url: string | null; created_at: string; user_id?: string };
export type Product = {
  id: string;
  vendor_id: string;
  nom: string;
  description: string | null;
  categorie: Categorie;
  prix_fcfa: number;
  stock: number;
  statut: 'en_ligne' | 'rupture';
  image_url: string | null;
  created_at: string;
  vendor?: Vendor | null;
};
export type OrderItem = { product_id: string; nom: string; prix_unitaire_fcfa: number; quantite: number };
export type Order = {
  id: string;
  vendor_id: string;
  items: OrderItem[];
  montant_total_fcfa: number;
  livraison_nom_complet: string;
  livraison_adresse: string;
  livraison_ville: string;
  livraison_telephone: string;
  methode_paiement: 'mtn_momo' | 'orange_money';
  statut: 'en_attente_paiement' | 'expediee' | 'livree' | 'annulee';
  created_at: string;
};
export type Review = { id: string; product_id: string; auteur_nom: string; note: number; commentaire: string; reponse_vendeur: string | null; created_at: string };

const STATUT_COMMANDE: Record<Order['statut'], [string, string]> = {
  en_attente_paiement: ['En attente de paiement', 'Awaiting payment'],
  expediee: ['Expédiée', 'Shipped'],
  livree: ['Livrée', 'Delivered'],
  annulee: ['Annulée', 'Cancelled'],
};
export const statutLabel = (s: Order['statut'], lang: Lang) => pick(lang, ...STATUT_COMMANDE[s]);
export const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

const err = (m: string) =>
  /row-level security|policy/i.test(m)
    ? tc('Action non autorisée pour ce compte.', 'This account is not allowed to do that.')
    : /duplicate|unique/i.test(m)
      ? tc('Cet élément existe déjà.', 'This already exists.')
      : /check constraint/i.test(m)
        ? tc('Un champ dépasse la longueur permise ou contient une valeur refusée. Vérifie le nom, la description, le prix et le stock.', 'A field is too long or holds a value that is not allowed. Check the name, description, price and stock.')
        : tc("Ça n'a pas marché. Réessaie.", "That didn't work. Try again.");

async function vendorsByIds(ids: string[]) {
  const map = new Map<string, Vendor>();
  const u = [...new Set(ids)];
  if (!u.length) return map;
  const { data } = await supabase.from('marketplace_vendors_public').select('*').in('id', u);
  (data as Vendor[] | null)?.forEach((v) => map.set(v.id, v));
  return map;
}

export async function products(): Promise<Product[]> {
  const { data } = await supabase.from('marketplace_products').select('*').order('created_at', { ascending: false });
  const list = (data ?? []) as Product[];
  const v = await vendorsByIds(list.map((p) => p.vendor_id));
  return list.map((p) => ({ ...p, vendor: v.get(p.vendor_id) ?? null }));
}
export async function product(id: string): Promise<Product | null> {
  const { data } = await supabase.from('marketplace_products').select('*').eq('id', id).maybeSingle();
  if (!data) return null;
  const v = await vendorsByIds([data.vendor_id as string]);
  return { ...(data as Product), vendor: v.get(data.vendor_id as string) ?? null };
}
export async function vendorPublic(id: string) {
  const [v, { data }] = await Promise.all([vendorsByIds([id]), supabase.from('marketplace_products').select('*').eq('vendor_id', id).order('created_at', { ascending: false })]);
  return { vendor: v.get(id) ?? null, products: (data ?? []) as Product[] };
}
export async function reviews(productId: string): Promise<Review[]> {
  const { data } = await supabase.from('marketplace_reviews_public').select('*').eq('product_id', productId).order('created_at', { ascending: false });
  return (data ?? []) as Review[];
}
export async function addReview(productId: string, auteurNom: string, note: number, commentaire: string) {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  const { error } = await supabase.from('marketplace_reviews').insert({ product_id: productId, buyer_user_id: uid, auteur_nom: auteurNom, note, commentaire });
  return { error: error ? (/policy|security/i.test(error.message) ? tc('Seuls les acheteurs de ce produit peuvent laisser un avis.', 'Only buyers of this item can leave a review.') : err(error.message)) : null };
}

export async function placeOrders(
  byVendor: Map<string, OrderItem[]>,
  livraison: { nom: string; adresse: string; ville: string; telephone: string },
  methode: 'mtn_momo' | 'orange_money'
) {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return { error: tc('Connecte-toi pour commander.', 'Sign in to order.') };
  const rows = [...byVendor.entries()].map(([vendorId, items]) => ({
    buyer_user_id: uid,
    vendor_id: vendorId,
    items,
    montant_total_fcfa: items.reduce((s, i) => s + i.prix_unitaire_fcfa * i.quantite, 0),
    livraison_nom_complet: livraison.nom,
    livraison_adresse: livraison.adresse,
    livraison_ville: livraison.ville,
    livraison_telephone: livraison.telephone,
    methode_paiement: methode,
  }));
  const { error } = await supabase.from('marketplace_orders').insert(rows);
  return { error: error ? err(error.message) : null };
}
export async function myOrders(): Promise<Order[]> {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return [];
  const { data } = await supabase.from('marketplace_orders').select('*').eq('buyer_user_id', uid).order('created_at', { ascending: false });
  return (data ?? []) as Order[];
}

/* ---------------- Espace vendeur ---------------- */
export async function myVendor(): Promise<Vendor | null> {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return null;
  const { data } = await supabase.from('marketplace_vendors').select('*').eq('user_id', uid).maybeSingle();
  return (data as Vendor) ?? null;
}
export async function createVendor(v: { nom_boutique: string; region: string; artisanat: string; bio: string; avatar_url: string | null }) {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  const { data, error } = await supabase.from('marketplace_vendors').insert({ user_id: uid, ...v, bio: v.bio || null }).select('*').single();
  return { vendor: data as Vendor | null, error: error ? err(error.message) : null };
}
export async function vendorProducts(vendorId: string): Promise<Product[]> {
  const { data } = await supabase.from('marketplace_products').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false });
  return (data ?? []) as Product[];
}
export async function saveProduct(vendorId: string, p: { id?: string; nom: string; description: string; categorie: Categorie; prix_fcfa: number; stock: number; image_url: string | null }) {
  const row = { nom: p.nom, description: p.description || null, categorie: p.categorie, prix_fcfa: p.prix_fcfa, stock: p.stock, image_url: p.image_url };
  const { error } = p.id ? await supabase.from('marketplace_products').update(row).eq('id', p.id) : await supabase.from('marketplace_products').insert({ vendor_id: vendorId, ...row });
  if (error) console.error('saveProduct', error.code, error.message);
  return { error: error ? err(error.message) : null };
}
export async function vendorOrders(vendorId: string): Promise<Order[]> {
  const { data } = await supabase.from('marketplace_orders').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false });
  return (data ?? []) as Order[];
}
export async function markShipped(orderId: string) {
  const { error } = await supabase.from('marketplace_orders').update({ statut: 'expediee' }).eq('id', orderId);
  return { error: error ? err(error.message) : null };
}
export async function vendorReviews(productIds: string[]): Promise<Review[]> {
  if (!productIds.length) return [];
  const { data } = await supabase.from('marketplace_reviews_public').select('*').in('product_id', productIds).order('created_at', { ascending: false });
  return (data ?? []) as Review[];
}
export async function replyReview(id: string, reponse: string) {
  const { error } = await supabase.from('marketplace_reviews').update({ reponse_vendeur: reponse }).eq('id', id);
  return { error: error ? err(error.message) : null };
}
