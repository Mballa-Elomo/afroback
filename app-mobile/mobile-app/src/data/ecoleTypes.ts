/**
 * Types miroir du schéma Postgres du module École des Héros (voir
 * supabase/schema-ecole-heros.sql et app-mobile/data-model-ecole-heros.md).
 * Mêmes conventions que les autres types.ts du projet : `| null` pour les
 * colonnes nullable. Les 4 champs de format d'une leçon sont tous
 * potentiellement vides — c'est le cas normal tant que le contenu réel n'est
 * pas produit, jamais une exception à traiter comme une erreur.
 */

export type EcoleLeconStatut = 'verrouille' | 'disponible' | 'en_cours' | 'termine';
export type EcoleFormat = 'lire' | 'ecouter' | 'regarder' | 'bd';

export interface EcoleNiveau {
  niveau: number;
  nom: string;
  tranche_age: string;
  ton_contenu: string;
}

export interface BdPlanche {
  image_url: string;
  texte: string;
  ordre: number;
}

export interface EcoleLecon {
  id: string;
  heros_id: string;
  niveau: number;
  ordre_dans_niveau: number;
  texte_adapte: string | null;
  narration_audio_url: string | null;
  video_url: string | null;
  bd_planches: BdPlanche[];
  created_at: string;
  updated_at: string;
}

export interface EcoleQuizQuestion {
  id: string;
  lecon_id: string;
  question: string;
  choix: string[];
  reponse_correcte_index: number;
  ordre: number;
}

export interface EcoleQuizNiveauQuestion {
  id: string;
  niveau: number;
  question: string;
  choix: string[];
  reponse_correcte_index: number;
  ordre: number;
}

export interface EnfantEcoleProgression {
  child_id: string;
  niveau_actuel: number;
  updated_at: string;
}

export interface EnfantLeconResultat {
  id: string;
  child_id: string;
  lecon_id: string;
  statut: EcoleLeconStatut;
  meilleur_score: number | null;
  tentatives: number;
  dernier_resultat_at: string | null;
}

export interface EnfantQuizNiveauResultat {
  id: string;
  child_id: string;
  niveau: number;
  reussi: boolean;
  score: number | null;
  date: string;
}
