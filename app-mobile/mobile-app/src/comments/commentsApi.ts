import { supabase } from '../data/supabaseClient';
import type { ContentType } from '../data/contentAccess';

/**
 * Commentaires façon YouTube (cdc-commentaires.md). L'app passe uniquement
 * par les fonctions serveur de supabase/schema-commentaires.sql : les règles
 * (accès au contenu, anti-spam, filtre, signalements) sont côté serveur.
 */

export interface ContentComment {
  id: string;
  parent_id: string | null;
  reply_to_pseudo: string | null;
  /** null quand le commentaire a été supprimé (mais garde ses réponses). */
  texte: string | null;
  statut: 'publie' | 'masque_filtre_auto' | 'masque_signalements' | 'masque_moderation' | 'supprime';
  like_count: number;
  reply_count: number;
  created_at: string;
  edited: boolean;
  mine: boolean;
  liked: boolean;
  author: { id: string; pseudo: string; avatar_url: string | null; equipe: boolean } | null;
}

export interface CommentThread {
  total: number;
  peut_commenter: boolean;
  connecte: boolean;
  items: ContentComment[];
}

export type CommentSort = 'pertinents' | 'recents';
export const PAGE_SIZE = 20;

type Result<T> = { data?: T; error?: string };

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<Result<T>> {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    // Fonction absente : schema-commentaires.sql pas encore exécuté.
    return { error: error.code === 'PGRST202' ? 'non_installe' : 'reseau' };
  }
  if (data && typeof data === 'object' && 'ok' in data && data.ok === false) return { error: String(data.error ?? 'inconnu') };
  return { data: data as T };
}

export function listComments(type: ContentType, slug: string, sort: CommentSort, offset = 0) {
  return rpc<CommentThread>('lister_commentaires', { p_type: type, p_slug: slug, p_tri: sort, p_limite: PAGE_SIZE, p_decalage: offset });
}

export function listReplies(parentId: string, offset = 0) {
  return rpc<ContentComment[]>('lister_reponses', { p_parent: parentId, p_limite: PAGE_SIZE, p_decalage: offset });
}

export async function postComment(type: ContentType, slug: string, texte: string, parentId?: string | null) {
  const res = await rpc<{ comment: ContentComment }>('publier_commentaire', {
    p_type: type,
    p_slug: slug,
    p_texte: texte,
    p_parent: parentId ?? null,
  });
  return { comment: res.data?.comment, error: res.error };
}

export async function editComment(id: string, texte: string) {
  const res = await rpc<{ comment: ContentComment }>('modifier_commentaire', { p_id: id, p_texte: texte });
  return { comment: res.data?.comment, error: res.error };
}

export function deleteComment(id: string) {
  return rpc<{ ok: true }>('supprimer_commentaire', { p_id: id });
}

export function likeComment(id: string, like: boolean) {
  return rpc<{ liked: boolean; like_count: number }>('aimer_commentaire', { p_id: id, p_aime: like });
}

export function reportComment(id: string) {
  return rpc<{ ok: true }>('signaler_commentaire', { p_id: id, p_motif: 'contenu_inapproprie' });
}

/** Message affiché pour un code d'erreur serveur. */
export function commentErrorMessage(code?: string): string {
  switch (code) {
    case 'trop_rapide':
      return 'Tu commentes très vite. Patiente quelques minutes avant de publier à nouveau.';
    case 'acces':
      return 'Débloque ce contenu pour participer à la discussion.';
    case 'longueur':
      return 'Ton commentaire doit faire entre 1 et 2 000 caractères.';
    case 'sans_profil':
      return 'Crée ton pseudo (Profil, puis Modifier le profil) pour commenter.';
    case 'banni':
      return 'Ton compte ne peut plus publier de commentaires.';
    case 'non_installe':
      return "Les commentaires ne sont pas encore activés sur AFROBACK.";
    default:
      return "Ça n'a pas marché. Vérifie ta connexion et réessaie.";
  }
}
