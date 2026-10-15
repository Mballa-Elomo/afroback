import { getSupabaseAdmin } from './supabase/server';
import { tousLesComptes } from './utilisateurs';

/** Module Marketplace (cdc-module-marketplace.md) : lecture côté serveur (clé service_role). */

export type StatutValidation = 'en_attente' | 'valide' | 'refuse' | 'suspendu';

export interface Boutique {
  id: string;
  user_id: string;
  email: string | null;
  nom: string;
  region: string;
  artisanat: string;
  bio: string | null;
  avatar_url: string | null;
  actif: boolean;
  statut: StatutValidation;
  motif: string | null;
  cree_le: string;
}

export interface Produit {
  id: string;
  boutique_id: string;
  nom: string;
  description: string | null;
  categorie: string;
  prix: number;
  stock: number;
  statut: 'en_ligne' | 'rupture';
  image_url: string | null;
  vues: number;
  masque: boolean;
  motif: string | null;
  cree_le: string;
}

export interface Commande {
  id: string;
  acheteur_id: string;
  acheteur_email: string | null;
  boutique_id: string;
  articles: { nom: string; prix_unitaire_fcfa: number; quantite: number }[];
  montant: number;
  livraison: { nom: string; adresse: string; ville: string; telephone: string };
  paiement: string;
  statut: 'en_attente_paiement' | 'expediee' | 'livree' | 'annulee';
  cree_le: string;
}

export interface Avis {
  id: string;
  produit_id: string;
  auteur: string;
  note: number;
  commentaire: string;
  reponse: string | null;
  masque: boolean;
  cree_le: string;
}

export interface DonneesMarketplace {
  boutiques: Boutique[];
  produits: Produit[];
  commandes: Commande[];
  avis: Avis[];
  moderationInstallee: boolean;
  erreur: string | null;
}

export async function chargerMarketplace(): Promise<DonneesMarketplace> {
  const supabase = getSupabaseAdmin();
  const [comptes, v, p, o, r] = await Promise.all([
    tousLesComptes().catch(() => []),
    supabase.from('marketplace_vendors').select('*').order('created_at', { ascending: false }),
    supabase.from('marketplace_products').select('*').order('created_at', { ascending: false }),
    supabase.from('marketplace_orders').select('*').order('created_at', { ascending: false }),
    supabase.from('marketplace_reviews').select('*').order('created_at', { ascending: false }),
  ]);
  if (v.error) return { boutiques: [], produits: [], commandes: [], avis: [], moderationInstallee: false, erreur: v.error.message };
  const emails = new Map(comptes.map((u) => [u.id, u.email ?? null]));
  const vendeurs = (v.data ?? []) as Record<string, unknown>[];
  // Le script de modération ajoute statut_validation ; avant, toute boutique active est publique.
  const installee = vendeurs.length === 0 ? !(await supabase.from('marketplace_vendors').select('statut_validation').limit(1)).error : 'statut_validation' in vendeurs[0];

  return {
    boutiques: vendeurs.map((b) => ({
      id: String(b.id),
      user_id: String(b.user_id),
      email: emails.get(String(b.user_id)) ?? null,
      nom: String(b.nom_boutique),
      region: String(b.region ?? ''),
      artisanat: String(b.artisanat ?? ''),
      bio: (b.bio as string) ?? null,
      avatar_url: (b.avatar_url as string) ?? null,
      actif: !!b.is_active,
      statut: ((b.statut_validation as StatutValidation) ?? 'valide') as StatutValidation,
      motif: (b.motif_validation as string) ?? null,
      cree_le: String(b.created_at),
    })),
    produits: ((p.data ?? []) as Record<string, unknown>[]).map((x) => ({
      id: String(x.id),
      boutique_id: String(x.vendor_id),
      nom: String(x.nom),
      description: (x.description as string) ?? null,
      categorie: String(x.categorie),
      prix: Number(x.prix_fcfa ?? 0),
      stock: Number(x.stock ?? 0),
      statut: x.statut as Produit['statut'],
      image_url: (x.image_url as string) ?? null,
      vues: Number(x.vues ?? 0),
      masque: !!x.masque_admin,
      motif: (x.motif_masquage as string) ?? null,
      cree_le: String(x.created_at),
    })),
    commandes: ((o.data ?? []) as Record<string, unknown>[]).map((c) => ({
      id: String(c.id),
      acheteur_id: String(c.buyer_user_id),
      acheteur_email: emails.get(String(c.buyer_user_id)) ?? null,
      boutique_id: String(c.vendor_id),
      articles: Array.isArray(c.items) ? (c.items as Commande['articles']) : [],
      montant: Number(c.montant_total_fcfa ?? 0),
      livraison: {
        nom: String(c.livraison_nom_complet ?? ''),
        adresse: String(c.livraison_adresse ?? ''),
        ville: String(c.livraison_ville ?? ''),
        telephone: String(c.livraison_telephone ?? ''),
      },
      paiement: String(c.methode_paiement ?? ''),
      statut: c.statut as Commande['statut'],
      cree_le: String(c.created_at),
    })),
    avis: ((r.data ?? []) as Record<string, unknown>[]).map((a) => ({
      id: String(a.id),
      produit_id: String(a.product_id),
      auteur: String(a.auteur_nom ?? ''),
      note: Number(a.note ?? 0),
      commentaire: String(a.commentaire ?? ''),
      reponse: (a.reponse_vendeur as string) ?? null,
      masque: !!a.masque_admin,
      cree_le: String(a.created_at),
    })),
    moderationInstallee: installee,
    erreur: null,
  };
}

/** Boutiques en attente de validation (badge du menu). 0 si le script de modération n'est pas exécuté. */
export async function nbBoutiquesEnAttente(): Promise<number> {
  try {
    const { count, error } = await getSupabaseAdmin().from('marketplace_vendors').select('id', { count: 'exact', head: true }).eq('statut_validation', 'en_attente');
    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}
