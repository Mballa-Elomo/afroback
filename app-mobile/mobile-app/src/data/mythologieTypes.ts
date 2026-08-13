/**
 * Types miroir du schéma Postgres du pilier Mythologie (voir
 * supabase/schema-mythologie.sql, supabase/schema-mythologie-extended.sql et
 * app-mobile/data-model-mythologie.md). Mêmes conventions que les autres
 * types.ts du projet : `| null` pour les colonnes vides.
 */

import type { VideoChapitre } from './types';

export type { VideoChapitre };

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
  /** Ajouté le 2026-08-12 (parité Héros) : vide pour l'instant, aucun mythe n'a de version anglaise à ce jour. */
  recit_chapitres_en: MytheChapitre[];
  sources: string[];
  /** Couleur décorative de la pastille dans la liste — purement visuelle, pas un jugement de contenu. */
  couleur: string;
  /** Aucun des 5 mythes n'a d'image produite à ce jour — reste `null`, jamais une URL inventée. */
  image_url: string | null;
  /** Narration FR — aucun des 5 mythes n'a de narration produite à ce jour, reste `null`. */
  narration_audio_url: string | null;
  /** Narration EN, ajoutée le 2026-08-12 — reste `null` tant qu'aucune n'existe. */
  narration_audio_url_en: string | null;
  /** Vidéo par chapitre × langue, même forme que `Heros.video_chapitres` — vide tant qu'aucune vidéo n'est produite. */
  video_chapitres: VideoChapitre[];
  ordre_affichage: number;
  fichier_source: string | null;
  statut_publication: 'publie' | 'depublie';
  a_la_une: boolean;
}
