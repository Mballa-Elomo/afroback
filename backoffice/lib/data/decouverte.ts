import { getSupabaseAdmin } from '../supabase/server';

/**
 * Miroir de `decouverte_items` (mobile-app/supabase/seed-decouverte.sql +
 * schema-decouverte-extended.sql, 2026-08-12 — parité Héros : publication,
 * mise en avant, vidéo par langue). Le pipeline `afroback-decouverte`
 * (fiches Markdown → `build-decouverte-data.mjs` → `generate-decouverte-seed.mjs`)
 * reste la source de CRÉATION — comme pour `heros.recit_fr_texte`, le
 * back-office permet de corriger la version publiée en base sans jamais
 * toucher aux fichiers du pipeline. `statut_contenu` existe mais vaut
 * toujours `'pret'` dans le pipeline actuel, ce n'est pas un vrai statut
 * éditorial variable — affiché tel quel, jamais transformé en badge inventé.
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
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
  /** Vidéo par langue — pas de chapitres pour une fiche Découverte. */
  videos: Record<string, string>;
}

export const TYPE_LABELS: Record<string, string> = {
  village: 'Village',
  coutume: 'Coutume',
  objet: 'Objet',
  personnage: 'Personnage',
  fait: 'Fait',
};

/** Une affirmation du texte, étiquetée par l'agent Découverte — jamais réétiquetée depuis le back-office (hors périmètre de la correction éditoriale, voir README). */
export interface FaitLegendeStatut {
  affirmation: string;
  statut: 'atteste' | 'tradition_orale' | 'debattu';
}

export interface DecouverteItemDetailAdmin extends DecouverteItem {
  resume_liste: string;
  contenu_fr_texte: string;
  contenu_en_texte: string | null;
  statut_fait_legende: FaitLegendeStatut[];
  sources: string[];
  heros_lies: string[];
  items_lies: string[];
}

const LIST_COLUMNS =
  'id, slug, type, pays, region_ethnie, titre, sous_titre, image_url, statut_contenu, ordre_affichage, statut_publication, a_la_une, videos';

export async function getDecouverteItemsAdmin(): Promise<DecouverteItem[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('decouverte_items')
    .select(LIST_COLUMNS)
    .order('ordre_affichage', { ascending: true });
  if (error) throw new Error(`Impossible de charger les fiches Découverte : ${error.message}`);
  return ((data ?? []) as unknown as DecouverteItem[]).map((it) => ({
    ...it,
    statut_publication: it.statut_publication ?? 'publie',
    a_la_une: it.a_la_une ?? false,
    videos: it.videos ?? {},
  }));
}

/** Lecture minimale pour les actions de bascule — même raison que `getHeroToggleFields()`. */
export interface DecouverteToggleFields {
  titre: string;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
}

export async function getDecouverteToggleFields(slug: string): Promise<DecouverteToggleFields | null> {
  const { data, error } = await getSupabaseAdmin().from('decouverte_items').select('titre, statut_publication, a_la_une').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`Impossible de charger cette fiche : ${error.message}`);
  return (data as DecouverteToggleFields | null) ?? null;
}

export async function getDecouverteItemBySlugAdmin(slug: string): Promise<DecouverteItemDetailAdmin | null> {
  const { data, error } = await getSupabaseAdmin().from('decouverte_items').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`Impossible de charger cette fiche Découverte : ${error.message}`);
  if (!data) return null;
  const item = data as DecouverteItemDetailAdmin;
  return {
    ...item,
    statut_publication: item.statut_publication ?? 'publie',
    a_la_une: item.a_la_une ?? false,
    videos: item.videos ?? {},
  };
}

export function decouverteHasMedia(it: { image_url: string | null; videos: Record<string, string> }) {
  return {
    photo: !!it.image_url,
    video: Object.values(it.videos ?? {}).some(Boolean),
  };
}
