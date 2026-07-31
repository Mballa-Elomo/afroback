import { supabase } from './supabaseClient';
import type {
  CommunityComment,
  CommunityCommentWithAuthor,
  CommunityPost,
  CommunityPostWithAuthor,
  CommunityProfileOwn,
  CommunityProfilePublic,
  CommunityReportMotif,
  CommunityReportTargetType,
} from './communityTypes';

/**
 * Source de données réelle : tables `community_profiles` / `community_posts`
 * / `community_comments` / `community_reports` sur Supabase (voir
 * supabase/schema-communaute.sql, exécuté dans le dashboard le 2026-07-30).
 *
 * Contrairement à heroesRepository.ts / decouverteRepository.ts, ce
 * repository n'est PAS lecture seule : c'est du contenu généré par les
 * utilisateurs. Pas de cache mémoire ici (les données changent en continu),
 * contrairement aux deux autres repositories dont le contenu est éditorial
 * et stable le temps d'une session.
 *
 * Respect strict du pseudonymat (décision du 2026-07-30) : toute lecture
 * publique d'un profil passe par `community_profiles_public`
 * (jamais `user_id`). `getOwnProfile()` est la seule fonction qui lit la
 * table `community_profiles` directement, et uniquement pour sa propre
 * ligne (appliqué à la fois par la RLS et par le filtre explicite ici).
 */

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

/** Profil complet du membre connecté (y compris is_banned). `null` si aucun profil créé. */
export async function getOwnProfile(): Promise<CommunityProfileOwn | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('community_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    throw new Error(`Impossible de charger le profil communautaire : ${error.message}`);
  }
  return data as CommunityProfileOwn | null;
}

export async function createOwnProfile(params: {
  pseudo: string;
  avatarUrl?: string | null;
  bio?: string | null;
}): Promise<{ profile: CommunityProfileOwn | null; error: string | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { profile: null, error: 'Aucune session active.' };

  const { data, error } = await supabase
    .from('community_profiles')
    .insert({
      user_id: userId,
      pseudo: params.pseudo,
      avatar_url: params.avatarUrl ?? null,
      bio: params.bio ?? null,
    })
    .select('*')
    .single();

  if (error) {
    // Erreur la plus probable en usage normal : pseudo déjà pris (contrainte unique).
    return { profile: null, error: translateCommunityError(error.message) };
  }
  return { profile: data as CommunityProfileOwn, error: null };
}

export async function updateOwnProfile(params: {
  pseudo?: string;
  avatarUrl?: string | null;
  bio?: string | null;
}): Promise<{ error: string | null }> {
  const patch: Record<string, unknown> = {};
  if (params.pseudo !== undefined) patch.pseudo = params.pseudo;
  if (params.avatarUrl !== undefined) patch.avatar_url = params.avatarUrl;
  if (params.bio !== undefined) patch.bio = params.bio;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: 'Aucune session active.' };

  const { error } = await supabase.from('community_profiles').update(patch).eq('user_id', userId);
  return { error: error ? translateCommunityError(error.message) : null };
}

async function getPublicProfilesByIds(ids: string[]): Promise<Map<string, CommunityProfilePublic>> {
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await supabase.from('community_profiles_public').select('*').in('id', uniqueIds);
  if (error) {
    throw new Error(`Impossible de charger les profils publics : ${error.message}`);
  }
  const map = new Map<string, CommunityProfilePublic>();
  for (const profile of (data ?? []) as CommunityProfilePublic[]) {
    map.set(profile.id, profile);
  }
  return map;
}

export async function getPublicProfileById(id: string): Promise<CommunityProfilePublic | null> {
  const map = await getPublicProfilesByIds([id]);
  return map.get(id) ?? null;
}

// ---------------------------------------------------------------------------
// Fil / posts
// ---------------------------------------------------------------------------

/**
 * Fil principal. La RLS renvoie déjà uniquement les posts `publie` + les
 * posts du membre connecté quel que soit leur statut (voir schema-communaute.sql).
 * `author` est `null` si le profil de l'auteur a été banni entre-temps (exclu
 * de la vue publique) — l'UI doit gérer cet auteur "non résolu" (voir specs).
 */
export async function getFeedPosts(limit = 30): Promise<CommunityPostWithAuthor[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new Error(`Impossible de charger le fil communautaire : ${error.message}`);
  }
  const posts = (data ?? []) as CommunityPost[];
  const authors = await getPublicProfilesByIds(posts.map((p) => p.author_id));
  return posts.map((post) => ({ ...post, author: authors.get(post.author_id) ?? null }));
}

/** Posts publiés d'un membre donné (utilisé par l'écran "Profil membre"). */
export async function getPostsByAuthor(authorProfileId: string): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .eq('author_id', authorProfileId)
    .eq('statut', 'publie')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(`Impossible de charger les publications de ce membre : ${error.message}`);
  }
  return (data ?? []) as CommunityPost[];
}

/**
 * Nombre de commentaires par post, calculé côté client (pas de colonne
 * dénormalisée dédiée, contrairement à `nb_signalements`). Utilisé pour le
 * tri "Populaire" du fil (proxy honnête d'engagement, faute de système de
 * likes — voir specs-phase3-communaute.md §1) et pour l'affichage du
 * compteur sur chaque carte.
 */
export async function getCommentCounts(postIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (postIds.length === 0) return map;
  const { data, error } = await supabase.from('community_comments').select('post_id').in('post_id', postIds);
  if (error) {
    throw new Error(`Impossible de charger les compteurs de commentaires : ${error.message}`);
  }
  for (const row of (data ?? []) as { post_id: string }[]) {
    map.set(row.post_id, (map.get(row.post_id) ?? 0) + 1);
  }
  return map;
}

export async function getPostWithComments(
  postId: string
): Promise<{ post: CommunityPostWithAuthor | null; comments: CommunityCommentWithAuthor[] }> {
  const { data: postData, error: postError } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .maybeSingle();
  if (postError) {
    throw new Error(`Impossible de charger le post : ${postError.message}`);
  }
  if (!postData) return { post: null, comments: [] };

  const { data: commentsData, error: commentsError } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (commentsError) {
    throw new Error(`Impossible de charger les commentaires : ${commentsError.message}`);
  }
  const comments = (commentsData ?? []) as CommunityComment[];

  const authorIds = [postData.author_id as string, ...comments.map((c) => c.author_id)];
  const authors = await getPublicProfilesByIds(authorIds);

  return {
    post: { ...(postData as CommunityPost), author: authors.get(postData.author_id) ?? null },
    comments: comments.map((c) => ({ ...c, author: authors.get(c.author_id) ?? null })),
  };
}

/**
 * `authorProfileId` doit venir d'un profil déjà créé (voir getOwnProfile/
 * createOwnProfile) — la RLS refuse toute insertion dont `author_id` ne
 * correspond pas au profil du membre connecté.
 * Le statut retourné peut être `masque_filtre_auto` : c'est le trigger côté
 * base qui en décide (voir community_apply_auto_filter dans
 * schema-communaute.sql), pas ce repository — l'UI doit lire `statut` sur la
 * réponse pour savoir si le post est réellement visible publiquement.
 */
export async function createPost(params: {
  authorProfileId: string;
  contenuTexte: string;
  imageUrl?: string | null;
}): Promise<{ post: CommunityPost | null; error: string | null }> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      author_id: params.authorProfileId,
      contenu_texte: params.contenuTexte,
      image_url: params.imageUrl ?? null,
    })
    .select('*')
    .single();
  if (error) {
    return { post: null, error: translateCommunityError(error.message) };
  }
  return { post: data as CommunityPost, error: null };
}

export async function createComment(params: {
  authorProfileId: string;
  postId: string;
  contenuTexte: string;
}): Promise<{ comment: CommunityComment | null; error: string | null }> {
  const { data, error } = await supabase
    .from('community_comments')
    .insert({
      author_id: params.authorProfileId,
      post_id: params.postId,
      contenu_texte: params.contenuTexte,
    })
    .select('*')
    .single();
  if (error) {
    return { comment: null, error: translateCommunityError(error.message) };
  }
  return { comment: data as CommunityComment, error: null };
}

// ---------------------------------------------------------------------------
// Signalement
// ---------------------------------------------------------------------------

/**
 * Écriture seule : la RLS n'autorise aucune lecture des signalements côté
 * app (ni même pour le signalant), voir data-model-communaute.md §6. La
 * confirmation affichée à l'utilisateur doit donc rester honnête sur
 * l'absence de suivi visible, conformément à specs-phase3-communaute.md §5.
 */
export async function createReport(params: {
  reporterProfileId: string;
  targetType: CommunityReportTargetType;
  targetId: string;
  motif: CommunityReportMotif;
  description?: string | null;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('community_reports').insert({
    reporter_id: params.reporterProfileId,
    target_type: params.targetType,
    target_id: params.targetId,
    motif: params.motif,
    description: params.description ?? null,
  });
  return { error: error ? translateCommunityError(error.message) : null };
}

// ---------------------------------------------------------------------------

/** Messages Postgres/Supabase traduits pour l'UI, sans changer le comportement. */
function translateCommunityError(message: string): string {
  if (message.includes('community_profiles_pseudo_key') || message.toLowerCase().includes('duplicate')) {
    return 'Ce pseudo est déjà pris, choisis-en un autre.';
  }
  if (message.toLowerCase().includes('row-level security') || message.toLowerCase().includes('policy')) {
    return "Action non autorisée — vérifie que ton profil communautaire est bien créé.";
  }
  return message;
}
