/**
 * Types miroir du schéma Postgres du module Parent/Enfant (voir
 * supabase/schema-parent-enfant.sql). Mêmes conventions que les autres
 * types.ts du projet : `| null` pour les colonnes nullable, Postgres renvoie
 * `null`, jamais `undefined`.
 */

export type AvatarCouleur = 'terracotta' | 'bleu' | 'violet' | 'or';
export type LangueCamerounaise = 'ewondo' | 'douala' | 'bassa' | 'bamileke';

export interface ChildProfile {
  id: string;
  parent_user_id: string;
  prenom: string;
  age: number;
  avatar_couleur: AvatarCouleur;
  langues_actives: LangueCamerounaise[];
  decouverte_activee: boolean;
  /** V1 informative seulement — voir README, "Module Parent/Enfant". */
  limite_ecran_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface ParentSettings {
  parent_user_id: string;
  /** 4 chiffres, `null` tant que le parent n'a pas encore défini de code. */
  pin_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChildSession {
  id: string;
  child_id: string;
  started_at: string;
  /** `null` tant que la session est en cours (ou si l'app a été fermée brutalement, voir schema). */
  ended_at: string | null;
  duree_secondes: number | null;
  created_at: string;
}

/** Stats du jour affichées dans l'Espace Parent — dérivées de vraies sessions, jamais inventées. */
export interface ChildTodayStats {
  minutesAujourdhui: number;
  aDejaUneSession: boolean;
}
