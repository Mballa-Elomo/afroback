'use client';

import { supabase } from './supabase';
import { tc, timeAgo, type Lang } from './lang';

/**
 * Communauté AFROBACK : mêmes tables et mêmes règles que l'app
 * (community_posts, community_comments, community_profiles_public,
 * community_reports). Les droits (lecture, publication réservée aux abonnés,
 * modération) sont appliqués côté serveur par les règles de la base.
 */

export type Profile = { id: string; pseudo: string; avatar_url: string | null; bio: string | null; created_at: string };
export type Post = { id: string; author_id: string; contenu_texte: string; image_url: string | null; statut: string; created_at: string; author: Profile | null; comments?: number };
export type PostComment = { id: string; post_id: string; author_id: string; contenu_texte: string; statut: string; created_at: string; author: Profile | null };
export type Motif = 'contenu_inapproprie' | 'harcelement' | 'desinformation' | 'spam' | 'autre';

export const MOTIFS: { id: Motif; label: string; en: string }[] = [
  { id: 'contenu_inapproprie', label: 'Contenu inapproprié', en: 'Inappropriate content' },
  { id: 'harcelement', label: 'Harcèlement', en: 'Harassment' },
  { id: 'desinformation', label: 'Désinformation', en: 'Misinformation' },
  { id: 'spam', label: 'Spam', en: 'Spam' },
  { id: 'autre', label: 'Autre', en: 'Other' },
];

async function profiles(ids: string[]) {
  const unique = [...new Set(ids)];
  const map = new Map<string, Profile>();
  if (!unique.length) return map;
  const { data } = await supabase.from('community_profiles_public').select('*').in('id', unique);
  (data as Profile[] | null)?.forEach((p) => map.set(p.id, p));
  return map;
}

export async function feed(limit = 40): Promise<Post[]> {
  const { data } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(limit);
  const posts = (data ?? []) as Omit<Post, 'author'>[];
  const [authors, counts] = await Promise.all([profiles(posts.map((p) => p.author_id)), commentCounts(posts.map((p) => p.id))]);
  return posts.map((p) => ({ ...p, author: authors.get(p.author_id) ?? null, comments: counts.get(p.id) ?? 0 }));
}

export async function commentCounts(ids: string[]) {
  const map = new Map<string, number>();
  if (!ids.length) return map;
  const { data } = await supabase.from('community_comments').select('post_id').in('post_id', ids);
  (data as { post_id: string }[] | null)?.forEach((r) => map.set(r.post_id, (map.get(r.post_id) ?? 0) + 1));
  return map;
}

export async function postWithComments(id: string): Promise<{ post: Post | null; comments: PostComment[] }> {
  const { data: p } = await supabase.from('community_posts').select('*').eq('id', id).maybeSingle();
  if (!p) return { post: null, comments: [] };
  const { data: c } = await supabase.from('community_comments').select('*').eq('post_id', id).order('created_at', { ascending: true });
  const comments = (c ?? []) as Omit<PostComment, 'author'>[];
  const authors = await profiles([p.author_id as string, ...comments.map((x) => x.author_id)]);
  return {
    post: { ...(p as Omit<Post, 'author'>), author: authors.get(p.author_id as string) ?? null, comments: comments.length },
    comments: comments.map((x) => ({ ...x, author: authors.get(x.author_id) ?? null })),
  };
}

export async function memberWithPosts(id: string) {
  const [map, { data }] = await Promise.all([profiles([id]), supabase.from('community_posts').select('*').eq('author_id', id).eq('statut', 'publie').order('created_at', { ascending: false })]);
  const profile = map.get(id) ?? null;
  const posts = ((data ?? []) as Omit<Post, 'author'>[]).map((p) => ({ ...p, author: profile }));
  return { profile, posts };
}

export async function recentMembers(limit = 8): Promise<Profile[]> {
  const { data } = await supabase.from('community_profiles_public').select('*').order('created_at', { ascending: false }).limit(limit);
  return (data ?? []) as Profile[];
}

const translate = (m: string) =>
  /row-level security|policy/i.test(m)
    ? tc('Action réservée aux abonnés, ou profil communautaire manquant.', 'Members only, or your community profile is missing.')
    : /length|check/i.test(m)
      ? tc('Texte trop long ou vide.', 'Text too long or empty.')
      : tc("Ça n'a pas marché. Réessaie.", "That didn't work. Try again.");

export async function createPost(authorId: string, texte: string, imageUrl: string | null) {
  const { data, error } = await supabase.from('community_posts').insert({ author_id: authorId, contenu_texte: texte, image_url: imageUrl }).select('*').single();
  return { post: data as Omit<Post, 'author'> | null, error: error ? translate(error.message) : null };
}

export async function createComment(authorId: string, postId: string, texte: string) {
  const { error } = await supabase.from('community_comments').insert({ author_id: authorId, post_id: postId, contenu_texte: texte });
  return { error: error ? translate(error.message) : null };
}

export async function report(reporterId: string, targetType: 'post' | 'commentaire' | 'profil', targetId: string, motif: Motif, description?: string) {
  const { error } = await supabase.from('community_reports').insert({ reporter_id: reporterId, target_type: targetType, target_id: targetId, motif, description: description || null });
  return { error: error ? translate(error.message) : null };
}

export function ago(iso: string, lang: Lang) {
  return timeAgo(iso, lang);
}
