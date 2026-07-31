/**
 * Types miroir du schéma Postgres du pilier Communauté (voir
 * supabase/schema-communaute.sql et app-mobile/data-model-communaute.md).
 *
 * Distinction importante, cohérente avec le pseudonymat structuré (décision
 * du 2026-07-30) :
 * - `CommunityProfilePublic` = ce que tout le monde peut voir (vue
 *   `community_profiles_public`, jamais `user_id`/`is_banned`/`ban_reason`).
 * - `CommunityProfileOwn` = la ligne complète de la table, lisible
 *   uniquement par son propriétaire (RLS `user_id = auth.uid()`).
 */

export type CommunityPostStatut = 'publie' | 'masque_filtre_auto' | 'masque_signalement' | 'supprime';
export type CommunityReportTargetType = 'post' | 'commentaire' | 'profil';
export type CommunityReportMotif =
  | 'contenu_inapproprie'
  | 'harcelement'
  | 'desinformation'
  | 'spam'
  | 'autre';
export type CommunityReportStatut = 'en_attente' | 'traite_action' | 'traite_rejete';

export interface CommunityProfilePublic {
  id: string;
  pseudo: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface CommunityProfileOwn {
  id: string;
  user_id: string;
  pseudo: string;
  avatar_url: string | null;
  bio: string | null;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  contenu_texte: string;
  image_url: string | null;
  statut: CommunityPostStatut;
  nb_signalements: number;
  created_at: string;
  updated_at: string;
}

/** Post enrichi de son auteur, tel que consommé par l'UI (fil, détail de post). */
export interface CommunityPostWithAuthor extends CommunityPost {
  author: CommunityProfilePublic | null;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  contenu_texte: string;
  statut: CommunityPostStatut;
  nb_signalements: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityCommentWithAuthor extends CommunityComment {
  author: CommunityProfilePublic | null;
}
