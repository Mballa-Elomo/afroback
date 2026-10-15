import { supabase } from './supabase';
import type { HerosCard } from './types';
import { pick, tc, type Lang } from './lang';

/**
 * Espace enfant (lot 6) : mêmes tables Supabase que l'application
 * (app-mobile/mobile-app/src/data/parentEnfantRepository.ts et
 * ecoleRepository.ts), mêmes règles. L'enfant ne se connecte jamais
 * lui-même : auth.uid() reste celui du parent, le profil enfant actif est un
 * état du navigateur (voir lib/kid.tsx).
 */

export type AvatarCouleur = 'terracotta' | 'bleu' | 'violet' | 'or';
export type Langue = 'ewondo' | 'douala' | 'bassa' | 'bamileke';

export interface ChildProfile {
  id: string;
  parent_user_id: string;
  prenom: string;
  age: number;
  avatar_couleur: AvatarCouleur;
  langues_actives: Langue[];
  decouverte_activee: boolean;
  limite_ecran_minutes: number | null;
  created_at: string;
}

/** Les 4 dégradés d'avatar de l'app (src/profils/enfantPalette.ts). */
export const AVATAR_GRADIENTS: Record<AvatarCouleur, [string, string]> = {
  terracotta: ['#C25E2E', '#8B3A2F'],
  bleu: ['#3E6B8B', '#274a63'],
  violet: ['#5B4B8A', '#3A2E63'],
  or: ['#D9A441', '#B06A1E'],
};
export const AVATAR_COULEURS: AvatarCouleur[] = ['terracotta', 'bleu', 'violet', 'or'];
export const AVATAR_LABEL: Record<AvatarCouleur, string> = { terracotta: 'Terracotta', bleu: 'Bleu', violet: 'Violet', or: 'Or' };
export const LANGUES: { id: Langue; label: string }[] = [
  { id: 'ewondo', label: 'Ewondo' },
  { id: 'douala', label: 'Douala' },
  { id: 'bassa', label: 'Bassa' },
  { id: 'bamileke', label: 'Bamiléké' },
];

async function uid() {
  return (await supabase.auth.getUser()).data.user?.id ?? null;
}

/** Code parent validé dans cet onglet (Espace Parent, 10 min). */
export const PARENT_OK = 'afroback-web:parent-ok';

/* ---------------- Profils enfants & contrôle parental ---------------- */
export async function childProfiles(): Promise<ChildProfile[]> {
  const u = await uid();
  if (!u) return [];
  const { data } = await supabase.from('child_profiles').select('*').eq('parent_user_id', u).order('created_at');
  return (data ?? []) as ChildProfile[];
}
export async function createChild(p: { prenom: string; age: number; avatar_couleur: AvatarCouleur; langues_actives: Langue[] }) {
  const u = await uid();
  const { error } = await supabase.from('child_profiles').insert({ parent_user_id: u, ...p, prenom: p.prenom.trim() });
  return { error: error ? tc('Impossible d’ajouter ce profil pour l’instant.', 'Could not add this profile right now.') : null };
}
export async function updateChild(id: string, patch: Partial<Pick<ChildProfile, 'decouverte_activee' | 'limite_ecran_minutes'>>) {
  const { error } = await supabase
    .from('child_profiles')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}
export async function getPin(): Promise<string | null> {
  const u = await uid();
  if (!u) return null;
  const { data, error } = await supabase.from('parent_settings').select('pin_code').eq('parent_user_id', u).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as { pin_code: string | null } | null)?.pin_code ?? null;
}
export async function setPin(pin: string) {
  const u = await uid();
  const { error } = await supabase
    .from('parent_settings')
    .upsert({ parent_user_id: u, pin_code: pin, updated_at: new Date().toISOString() }, { onConflict: 'parent_user_id' });
  return { error: error ? tc('Impossible d’enregistrer le code.', 'Could not save the code.') : null };
}

/* ---------------- Suivi du temps (sessions réelles, jamais estimées) ---------------- */
export async function startSession(childId: string): Promise<string | null> {
  const { data } = await supabase.from('child_sessions').insert({ child_id: childId, started_at: new Date().toISOString() }).select('id').single();
  return (data as { id: string } | null)?.id ?? null;
}
export async function endSession(id: string, secondes: number) {
  await supabase
    .from('child_sessions')
    .update({ ended_at: new Date().toISOString(), duree_secondes: Math.max(0, Math.round(secondes)) })
    .eq('id', id);
}
export async function childStats(childId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [today, last] = await Promise.all([
    supabase.from('child_sessions').select('duree_secondes').eq('child_id', childId).gte('started_at', start.toISOString()).not('duree_secondes', 'is', null),
    supabase.from('child_sessions').select('started_at').eq('child_id', childId).order('started_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const rows = (today.data ?? []) as { duree_secondes: number | null }[];
  return {
    minutes: Math.round(rows.reduce((s, r) => s + (r.duree_secondes ?? 0), 0) / 60),
    aDejaUneSession: rows.length > 0,
    derniere: (last.data as { started_at: string } | null)?.started_at ?? null,
  };
}
export function formatMinutes(m: number) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r > 0 ? `${h}h${String(r).padStart(2, '0')}` : `${h}h`;
}

/* ---------------- Héros (lecture publique) ---------------- */
let herosCache: HerosCard[] | null = null;
export async function heroesList(): Promise<HerosCard[]> {
  if (herosCache) return herosCache;
  const cols = 'id,slug,nom_affiche,nom_complet,sous_titre,epoque,region,theme,resume_catalogue,image_carte_catalogue,ordre_affichage,statut_publication';
  // Jumelles anglaises si le script schema-i18n-contenu-en.sql est passé, sinon français seul.
  const first = await supabase.from('heros').select(`${cols},nom_affiche_en,sous_titre_en,epoque_en,region_en,resume_catalogue_en`).order('ordre_affichage');
  const data = first.error ? (await supabase.from('heros').select(cols).order('ordre_affichage')).data : first.data;
  herosCache = ((data ?? []) as HerosCard[]).filter((h) => (h.statut_publication ?? 'publie') !== 'depublie');
  return herosCache;
}
/** « Histoire du jour » : un vrai héros du catalogue, stable 24 h (même règle que l'app). */
export function heroDuJour(list: HerosCard[]): HerosCard | undefined {
  if (!list.length) return undefined;
  const now = new Date();
  const day = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  return list[day % list.length];
}

/* ---------------- École des Héros ---------------- */
export interface Niveau {
  niveau: number;
  nom: string;
  tranche_age: string;
  nom_en?: string | null;
  tranche_age_en?: string | null;
}
export interface Lecon {
  id: string;
  heros_id: string;
  niveau: number;
  ordre_dans_niveau: number;
  texte_adapte: string | null;
  /** Version anglaise (schema-ecole-contenu.sql, 2026-10-07) ; repli sur le français. */
  texte_adapte_en?: string | null;
  narration_audio_url: string | null;
  /** Narration anglaise (prévue) ; repli sur le français. */
  narration_audio_url_en?: string | null;
  video_url: string | null;
  bd_planches: { image_url: string; texte: string; texte_en?: string; ordre: number }[];
}
export interface Resultat {
  lecon_id: string;
  statut: 'verrouille' | 'disponible' | 'en_cours' | 'termine';
  meilleur_score: number | null;
  tentatives: number;
}
export type Question = {
  question: string;
  choix: string[];
  reponse_correcte_index: number;
  question_en?: string | null;
  choix_en?: string[] | null;
  /** « Le savais-tu ? » affiché après la réponse. */
  explication?: string | null;
  explication_en?: string | null;
};

/** Question dans la langue du site (repli sur le français si l'anglais manque). */
export function questionLocale(q: Question, lang: string): { question: string; choix: string[]; bonne: number; explication: string | null } {
  const en = lang === 'en';
  return {
    question: (en && q.question_en) || q.question,
    choix: en && q.choix_en && q.choix_en.length === q.choix.length ? q.choix_en : q.choix,
    bonne: q.reponse_correcte_index,
    explication: (en && q.explication_en) || q.explication || null,
  };
}

/** Seuil de réussite d'un quiz : 60 % (même valeur que l'app). */
export const PASS_RATIO = 0.6;

export async function niveaux(): Promise<Niveau[]> {
  const first = await supabase.from('ecole_niveaux').select('niveau,nom,tranche_age,nom_en,tranche_age_en').order('niveau');
  const data = first.error ? (await supabase.from('ecole_niveaux').select('niveau,nom,tranche_age').order('niveau')).data : first.data;
  return (data ?? []) as Niveau[];
}
export async function leconsDuNiveau(n: number): Promise<Lecon[]> {
  const { data } = await supabase.from('ecole_lecons').select('*').eq('niveau', n).order('ordre_dans_niveau');
  return (data ?? []) as Lecon[];
}
export async function toutesLecons(): Promise<Lecon[]> {
  const { data } = await supabase.from('ecole_lecons').select('*').order('niveau').order('ordre_dans_niveau');
  return (data ?? []) as Lecon[];
}
export async function lecon(id: string): Promise<Lecon | null> {
  const { data } = await supabase.from('ecole_lecons').select('*').eq('id', id).maybeSingle();
  return (data as Lecon | null) ?? null;
}
export async function questionsLecon(leconId: string): Promise<Question[]> {
  const { data } = await supabase.from('ecole_quiz_questions').select('*').eq('lecon_id', leconId).order('ordre');
  return (data ?? []) as Question[];
}
export async function questionsNiveau(n: number): Promise<Question[]> {
  const { data } = await supabase.from('ecole_quiz_niveau').select('*').eq('niveau', n).order('ordre');
  return (data ?? []) as Question[];
}
/** Crée la progression au niveau 1 au premier passage de l'enfant. */
export async function progression(childId: string): Promise<number> {
  const { data } = await supabase.from('enfant_ecole_progression').select('niveau_actuel').eq('child_id', childId).maybeSingle();
  if (data) return (data as { niveau_actuel: number }).niveau_actuel;
  await supabase.from('enfant_ecole_progression').insert({ child_id: childId, niveau_actuel: 1 });
  return 1;
}
export async function resultats(childId: string, leconIds: string[]): Promise<Map<string, Resultat>> {
  const m = new Map<string, Resultat>();
  if (!leconIds.length) return m;
  const { data } = await supabase.from('enfant_lecon_resultats').select('lecon_id,statut,meilleur_score,tentatives').eq('child_id', childId).in('lecon_id', leconIds);
  ((data ?? []) as Resultat[]).forEach((r) => m.set(r.lecon_id, r));
  return m;
}
export async function quizNiveauReussi(childId: string, n: number): Promise<boolean> {
  const { data } = await supabase.from('enfant_quiz_niveau_resultats').select('reussi').eq('child_id', childId).eq('niveau', n).maybeSingle();
  return (data as { reussi: boolean } | null)?.reussi ?? false;
}
/** Le meilleur score ne baisse jamais ; une leçon terminée le reste. */
export async function enregistrerLecon(childId: string, leconId: string, score: number, reussi: boolean) {
  const { data } = await supabase.from('enfant_lecon_resultats').select('statut,meilleur_score,tentatives').eq('child_id', childId).eq('lecon_id', leconId).maybeSingle();
  const prev = data as Resultat | null;
  await supabase.from('enfant_lecon_resultats').upsert(
    {
      child_id: childId,
      lecon_id: leconId,
      statut: reussi || prev?.statut === 'termine' ? 'termine' : 'disponible',
      meilleur_score: Math.max(score, prev?.meilleur_score ?? 0),
      tentatives: (prev?.tentatives ?? 0) + 1,
      dernier_resultat_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'child_id,lecon_id' },
  );
}
export async function enregistrerNiveau(childId: string, n: number, score: number, reussi: boolean) {
  await supabase
    .from('enfant_quiz_niveau_resultats')
    .upsert({ child_id: childId, niveau: n, score, reussi, date: new Date().toISOString() }, { onConflict: 'child_id,niveau' });
  if (reussi && n < 4) {
    await supabase
      .from('enfant_ecole_progression')
      .update({ niveau_actuel: Math.min(n + 1, 4), updated_at: new Date().toISOString() })
      .eq('child_id', childId);
  }
}

/** « Colonial (royaume Bamoun…) » → « Colonial » : libellés courts pour les enfants. */
export const shortEra = (s: string) => (s ?? '').split(/[,(]/)[0].trim();

/** Libellés de l'âge d'un enfant et du temps relatif, dans la langue choisie. */
export const ageLabel = (age: number, lang: Lang) => pick(lang, `${age} ans`, `${age} years old`);
