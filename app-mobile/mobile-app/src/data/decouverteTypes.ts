/**
 * Types miroir du schéma Postgres du pilier Découverte (voir
 * supabase/seed-decouverte.sql et app-mobile/data-model-decouverte.md).
 * Mêmes conventions que src/data/types.ts (héros) : champs optionnels typés
 * `| null` en plus d'`undefined`, Postgres renvoie `null` pour une colonne
 * vide, jamais `undefined`.
 */

export type DecouverteType = 'village' | 'coutume' | 'objet' | 'personnage' | 'fait';
export type StatutFactuel = 'atteste' | 'tradition_orale' | 'debattu';
export type StatutContenuDecouverte = 'pret' | 'brouillon' | 'a_produire';

export interface AffirmationStatuee {
  affirmation: string;
  statut: StatutFactuel;
}

export interface DecouverteItem {
  id: string;
  slug: string;
  type: DecouverteType;
  pays: string;
  region_ethnie: string;
  titre: string;
  sous_titre: string;
  resume_liste: string;
  contenu_fr_texte: string;
  contenu_en_texte?: string | null;
  statut_fait_legende: AffirmationStatuee[];
  image_url?: string | null;
  sources: string[];
  heros_lies: string[];
  items_lies: string[];
  statut_contenu: StatutContenuDecouverte;
  ordre_affichage: number;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
  /** Vidéo par langue (pas de chapitres pour une fiche Découverte), ajouté le 2026-08-12 — parité Héros/Mythologie. */
  videos: Record<string, string>;
}

export interface DecouvertePays {
  id: string;
  slug: string;
  nom: string;
  resume: string;
  ordre_affichage: number;
}
