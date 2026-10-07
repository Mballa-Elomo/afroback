/**
 * Types du catalogue AFROBACK, alignés sur les tables Supabase partagées avec
 * l'application (heros, mythes, decouverte_items). Le site ne lit que les
 * colonnes publiques ; le contenu complet passe par les fonctions serveur
 * get_*_detail, qui gardent les contenus réservés aux abonnés.
 */

export type ContentType = 'heros' | 'mythe' | 'decouverte';

export interface HerosCard {
  id: string;
  slug: string;
  nom_affiche: string;
  nom_complet: string;
  sous_titre: string;
  epoque: string;
  region: string;
  theme: string[];
  resume_catalogue: string;
  image_carte_catalogue: string | null;
  ordre_affichage: number;
  statut_publication?: string | null;
  a_la_une?: boolean | null;
  statut_video?: string | null;
  statut_narration_audio?: string | null;
}

export interface MytheCard {
  id: string;
  slug: string;
  titre: string;
  sous_titre: string;
  peuple: string;
  region: string;
  zone: string;
  epoque: string;
  image_url: string | null;
  ordre_affichage: number;
  statut_publication?: string | null;
  a_la_une?: boolean | null;
}

export type DecouverteKind = 'village' | 'coutume' | 'objet' | 'personnage';

export interface DecouverteCard {
  id: string;
  slug: string;
  type: DecouverteKind;
  pays: string;
  region_ethnie: string;
  titre: string;
  sous_titre: string;
  resume_liste: string;
  image_url: string | null;
  ordre_affichage: number;
  statut_publication?: string | null;
  a_la_une?: boolean | null;
}

/** Carte affichable dans une rangée, quel que soit le type de contenu. */
export interface Tile {
  type: ContentType;
  slug: string;
  title: string;
  kicker: string;
  meta: string;
  summary: string;
  image: string | null;
  free: boolean;
  likes: number;
  /** Activité réelle : lectures + écoutes + vues + J'aime (stats_contenus). */
  score: number;
}

export interface RecitChapitre {
  numero: number;
  titre: string;
  texte: string;
}

export interface VideoChapitre {
  numero: number;
  titre_chapitre: string;
  videos?: Record<string, string> | null;
  video_url_fr?: string | null;
  video_url_en?: string | null;
}

/** Réponse de get_*_detail : contenu complet, ou aperçu si réservé aux abonnés. */
export type Detail =
  | { verrouille: true; apercu_fr: string; apercu_en: string }
  | ({ verrouille: false } & Record<string, unknown>);
