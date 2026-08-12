import { getSupabaseAdmin } from '../supabase/server';

/**
 * Miroir de `decouverte_items` (mobile-app/supabase/seed-decouverte.sql).
 * Lecture seule côté back-office : ce contenu est produit par l'agent
 * `afroback-decouverte` (fiches Markdown) puis injecté par le pipeline
 * `build-decouverte-data.mjs` → `generate-decouverte-seed.mjs`, pas édité
 * ici. Pas de colonne `statut_publication`/`a_la_une` sur cette table
 * (contrairement à `heros`) : `statut_contenu` existe mais vaut toujours
 * `'pret'` dans le pipeline actuel, ce n'est pas un vrai statut éditorial
 * variable — affiché tel quel, jamais transformé en badge publié/dépublié
 * inventé.
 */
export interface DecouverteItem {
  id: string;
  slug: string;
  type: 'village' | 'coutume' | 'objet' | 'personnage' | 'fait';
  pays: string;
  region_ethnie: string;
  titre: string;
  sous_titre: string;
  image_url: string | null;
  statut_contenu: string;
  ordre_affichage: number;
}

const LIST_COLUMNS = 'id, slug, type, pays, region_ethnie, titre, sous_titre, image_url, statut_contenu, ordre_affichage';

export async function getDecouverteItemsAdmin(): Promise<DecouverteItem[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('decouverte_items')
    .select(LIST_COLUMNS)
    .order('ordre_affichage', { ascending: true });
  if (error) throw new Error(`Impossible de charger les fiches Découverte : ${error.message}`);
  return (data ?? []) as unknown as DecouverteItem[];
}
