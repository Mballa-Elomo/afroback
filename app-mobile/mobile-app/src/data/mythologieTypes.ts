/**
 * Types miroir du schéma Postgres du pilier Mythologie (voir
 * supabase/schema-mythologie.sql et app-mobile/data-model-mythologie.md).
 * Mêmes conventions que les autres types.ts du projet : `| null` pour les
 * colonnes vides.
 */

export interface MytheChapitre {
  numero: number;
  titre: string;
  texte: string;
}

export interface Mythe {
  id: string;
  slug: string;
  titre: string;
  sous_titre: string;
  peuple: string;
  region: string;
  /** Regroupement d'affichage de la liste (ex. "Littoral", "Extrême-Nord"). */
  zone: string;
  epoque: string;
  type_contenu: string;
  theme: string;
  recit_chapitres_fr: MytheChapitre[];
  sources: string[];
  /** Couleur décorative de la pastille dans la liste — purement visuelle, pas un jugement de contenu. */
  couleur: string;
  /** Aucun des 5 mythes n'a d'image produite à ce jour — reste `null`, jamais une URL inventée. */
  image_url: string | null;
  /** Aucun des 5 mythes n'a de narration produite à ce jour — reste `null`. */
  narration_audio_url: string | null;
  ordre_affichage: number;
  fichier_source: string | null;
}
