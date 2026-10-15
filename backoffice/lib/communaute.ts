import { getSupabaseAdmin } from './supabase/server';
import { tousLesComptes } from './utilisateurs';

/**
 * Module Communauté (cdc-module-communaute.md) : lecture côté serveur (clé
 * service_role, qui voit aussi les contenus masqués et les signalements).
 */

export type StatutContenu = 'publie' | 'masque_filtre_auto' | 'masque_signalement' | 'supprime';
export type Motif = 'contenu_inapproprie' | 'harcelement' | 'desinformation' | 'spam' | 'autre';

export interface Membre {
  id: string;
  user_id: string;
  pseudo: string;
  bio: string | null;
  avatar_url: string | null;
  banni: boolean;
  motif_ban: string | null;
  cree_le: string;
  email: string | null;
  publications: number;
  commentaires: number;
  signalements_recus: number;
}

export interface Contenu {
  type: 'post' | 'commentaire';
  id: string;
  post_id: string | null;
  auteur_id: string;
  texte: string;
  image_url: string | null;
  statut: StatutContenu;
  nb_signalements: number;
  cree_le: string;
  nb_commentaires: number;
}

export interface Signalement {
  id: string;
  cible_type: 'post' | 'commentaire' | 'profil';
  cible_id: string;
  signaleur_id: string;
  motif: Motif;
  description: string | null;
  statut: 'en_attente' | 'traite_action' | 'traite_rejete';
  traite_par: string | null;
  cree_le: string;
  resolu_le: string | null;
}

export interface DonneesCommunaute {
  membres: Membre[];
  contenus: Contenu[];
  signalements: Signalement[];
  termes: string[];
  seuil: number;
  moderationInstallee: boolean;
  erreur: string | null;
}

export async function chargerCommunaute(): Promise<DonneesCommunaute> {
  const supabase = getSupabaseAdmin();
  const [comptes, pr, po, co, re, te, reg, test] = await Promise.all([
    tousLesComptes().catch(() => []),
    supabase.from('community_profiles').select('id, user_id, pseudo, bio, avatar_url, is_banned, ban_reason, created_at'),
    supabase.from('community_posts').select('id, author_id, contenu_texte, image_url, statut, nb_signalements, created_at').order('created_at', { ascending: false }).limit(2000),
    supabase.from('community_comments').select('id, post_id, author_id, contenu_texte, statut, nb_signalements, created_at').order('created_at', { ascending: false }).limit(5000),
    supabase.from('community_reports').select('id, target_type, target_id, reporter_id, motif, description, statut, traite_par, created_at, resolved_at').order('created_at', { ascending: false }).limit(5000),
    supabase.from('community_banned_terms').select('term').order('term'),
    supabase.from('app_settings').select('data').eq('id', 1).maybeSingle(),
    supabase.rpc('admin_tester_terme', { p_texte: '' }),
  ]);

  if (pr.error) {
    return { membres: [], contenus: [], signalements: [], termes: [], seuil: 3, moderationInstallee: false, erreur: pr.error.message };
  }

  const emails = new Map(comptes.map((u) => [u.id, u.email ?? null]));
  const posts = (po.data ?? []) as Record<string, unknown>[];
  const comms = (co.data ?? []) as Record<string, unknown>[];
  const reps = (re.data ?? []) as Record<string, unknown>[];

  const nbComm = new Map<string, number>();
  for (const c of comms) if (c.statut !== 'supprime') nbComm.set(String(c.post_id), (nbComm.get(String(c.post_id)) ?? 0) + 1);

  const contenus: Contenu[] = [
    ...posts.map((p) => ({
      type: 'post' as const,
      id: String(p.id),
      post_id: null,
      auteur_id: String(p.author_id),
      texte: String(p.contenu_texte ?? ''),
      image_url: (p.image_url as string) ?? null,
      statut: p.statut as StatutContenu,
      nb_signalements: Number(p.nb_signalements ?? 0),
      cree_le: String(p.created_at),
      nb_commentaires: nbComm.get(String(p.id)) ?? 0,
    })),
    ...comms.map((c) => ({
      type: 'commentaire' as const,
      id: String(c.id),
      post_id: String(c.post_id),
      auteur_id: String(c.author_id),
      texte: String(c.contenu_texte ?? ''),
      image_url: null,
      statut: c.statut as StatutContenu,
      nb_signalements: Number(c.nb_signalements ?? 0),
      cree_le: String(c.created_at),
      nb_commentaires: 0,
    })),
  ];

  const auteurDe = new Map(contenus.map((c) => [c.id, c.auteur_id]));
  const recus = new Map<string, number>();
  for (const r of reps) {
    const cible = r.target_type === 'profil' ? String(r.target_id) : auteurDe.get(String(r.target_id));
    if (cible) recus.set(cible, (recus.get(cible) ?? 0) + 1);
  }
  const compter = (l: Record<string, unknown>[], id: string) => l.filter((x) => x.author_id === id && x.statut !== 'supprime').length;

  const membres: Membre[] = ((pr.data ?? []) as Record<string, unknown>[]).map((m) => ({
    id: String(m.id),
    user_id: String(m.user_id),
    pseudo: String(m.pseudo),
    bio: (m.bio as string) ?? null,
    avatar_url: (m.avatar_url as string) ?? null,
    banni: !!m.is_banned,
    motif_ban: (m.ban_reason as string) ?? null,
    cree_le: String(m.created_at),
    email: emails.get(String(m.user_id)) ?? null,
    publications: compter(posts, String(m.id)),
    commentaires: compter(comms, String(m.id)),
    signalements_recus: recus.get(String(m.id)) ?? 0,
  }));

  const communaute = ((reg.data?.data as Record<string, Record<string, unknown>> | undefined)?.communaute ?? {}) as Record<string, unknown>;

  return {
    membres,
    contenus,
    signalements: reps.map((r) => ({
      id: String(r.id),
      cible_type: r.target_type as Signalement['cible_type'],
      cible_id: String(r.target_id),
      signaleur_id: String(r.reporter_id),
      motif: r.motif as Motif,
      description: (r.description as string) ?? null,
      statut: r.statut as Signalement['statut'],
      traite_par: (r.traite_par as string) ?? null,
      cree_le: String(r.created_at),
      resolu_le: (r.resolved_at as string) ?? null,
    })),
    termes: ((te.data ?? []) as { term: string }[]).map((t) => t.term),
    seuil: Number.isFinite(Number(communaute.seuil_masquage)) ? Number(communaute.seuil_masquage) : 3,
    moderationInstallee: !test.error,
    erreur: null,
  };
}

/** Nombre de signalements en attente (badge du menu). */
export async function nbSignalementsEnAttente(): Promise<number> {
  try {
    const { count } = await getSupabaseAdmin().from('community_reports').select('id', { count: 'exact', head: true }).eq('statut', 'en_attente');
    return count ?? 0;
  } catch {
    return 0;
  }
}
