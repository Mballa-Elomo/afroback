import { supabase } from './supabase';
import { pick, type Lang } from './lang';

/**
 * Quiz de fin de contenu + progression du lecteur (cdc-quiz-progression.md,
 * validé le 2026-10-07). Mêmes fonctions serveur que l'application
 * (app-mobile/mobile-app/supabase/schema-quiz.sql) : les bonnes réponses ne
 * sont jamais envoyées au navigateur avant le choix, le score est recalculé
 * côté serveur. Tant que le script n'est pas installé (fonction absente),
 * chaque appel renvoie un état « indisponible », jamais une erreur affichée.
 */

export type QuizType = 'heros' | 'mythe';
export const isQuizType = (t: string): t is QuizType => t === 'heros' || t === 'mythe';

export type EtatQuiz = { disponible: boolean; nb_questions: number; meilleur_score: number | null; tentatives: number };

export type QuizQuestion = {
  id: string;
  ordre: number;
  question_fr: string;
  question_en: string | null;
  choix_fr: string[];
  choix_en: string[] | null;
};

export type QuizStatut = 'ok' | 'compte_requis' | 'verrouille' | 'indisponible';
export type GetQuiz = { statut: QuizStatut; questions?: QuizQuestion[] | null; meilleur_score?: number | null };

export type Correction = { correct: boolean; bonne_reponse: number; explication_fr: string; explication_en: string | null };

export type NiveauCode = 'apprenti' | 'curieux' | 'conteur' | 'griot' | 'gardien';
export type Niveau = { rang: number; code: NiveauCode; seuil: number; suivant_code: NiveauCode | null; suivant_seuil: number | null };

export type FinQuiz = {
  score: number;
  total: number;
  meilleur_avant: number | null;
  meilleur: number;
  points_gagnes: number;
  points: number;
  niveau_avant: Niveau;
  niveau: Niveau;
};

export type ResultatQuiz = {
  type: QuizType;
  slug: string;
  titre_fr: string | null;
  titre_en: string | null;
  image: string | null;
  meilleur_score: number | null;
  total: number | null;
  tentatives: number;
  derniere_at: string | null;
};

export type Progression = {
  points: number;
  niveau: Niveau;
  quiz_total: number;
  quiz_faits: number;
  maitrises: number;
  moyenne: number | null;
  resultats: ResultatQuiz[];
};

const NIVEAUX: Record<NiveauCode, [string, string]> = {
  apprenti: ['Apprenti', 'Apprentice'],
  curieux: ['Curieux', 'Curious'],
  conteur: ['Conteur', 'Storyteller'],
  griot: ['Griot', 'Griot'],
  gardien: ['Gardien de la mémoire', 'Keeper of Memory'],
};
export const niveauNom = (code: NiveauCode | null | undefined, lang: Lang) => (code && NIVEAUX[code] ? pick(lang, ...NIVEAUX[code]) : '');

/** Avancement (0 à 1) dans le niveau courant ; 1 au niveau maximum. */
export function niveauRatio(points: number, n: Niveau): number {
  if (n.suivant_seuil === null || n.suivant_seuil === undefined) return 1;
  const span = n.suivant_seuil - n.seuil;
  // Petit départ visible au seuil d'un niveau, plutôt qu'une barre vide qui semble cassée.
  return span > 0 ? Math.min(1, Math.max(0.04, (points - n.seuil) / span)) : 1;
}

/** Texte localisé d'une question (repli sur le français si l'anglais manque). */
export function questionTexte(q: QuizQuestion, lang: Lang) {
  const question = (lang === 'en' && q.question_en) || q.question_fr;
  const en = Array.isArray(q.choix_en) && q.choix_en.length === q.choix_fr.length && q.choix_en.every((c) => typeof c === 'string' && c !== '');
  const choix = lang === 'en' && en ? (q.choix_en as string[]) : q.choix_fr;
  return { question, choix };
}
export const explication = (c: Correction, lang: Lang) => (lang === 'en' && c.explication_en) || c.explication_fr;

/** Mélange (Fisher-Yates) des indices d'origine des réponses. */
export function melanger(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Message bienveillant selon le score (section 4.3). */
export function messageScore(score: number, total: number, lang: Lang): string {
  const r = total > 0 ? score / total : 0;
  if (r >= 1) return pick(lang, 'Tu es un vrai gardien de la mémoire.', 'You are a true keeper of memory.');
  if (r >= 0.8) return pick(lang, "Bravo ! Tu as bien retenu l'histoire.", 'Well done! You remembered the story well.');
  if (r >= 0.6) return pick(lang, "Joli parcours ! Encore un effort pour maîtriser l'histoire.", 'Nice work! One more effort to master the story.');
  return pick(lang, 'Le griot a encore des choses à te raconter.', 'The griot still has things to tell you.');
}

// ---------------------------------------------------------------------
// Appels serveur : jamais d'exception, un état « indisponible » à la place.
// ---------------------------------------------------------------------

export async function etatQuiz(type: QuizType, slug: string): Promise<EtatQuiz | null> {
  try {
    const { data, error } = await supabase.rpc('etat_quiz', { p_type: type, p_slug: slug });
    if (error || !data) return null;
    return data as EtatQuiz;
  } catch {
    return null;
  }
}

export async function getQuiz(type: QuizType, slug: string): Promise<GetQuiz> {
  try {
    const { data, error } = await supabase.rpc('get_quiz', { p_type: type, p_slug: slug });
    if (error || !data) return { statut: 'indisponible' };
    const res = data as GetQuiz;
    if (res.statut === 'ok' && (!Array.isArray(res.questions) || res.questions.length === 0)) return { statut: 'indisponible' };
    return res;
  } catch {
    return { statut: 'indisponible' };
  }
}

export async function verifierReponse(questionId: string, choix: number): Promise<Correction | null> {
  try {
    const { data, error } = await supabase.rpc('verifier_reponse_quiz', { p_question_id: questionId, p_choix: choix });
    if (error || !data) return null;
    return data as Correction;
  } catch {
    return null;
  }
}

export async function terminerQuiz(type: QuizType, slug: string, reponses: { question_id: string; choix: number }[]): Promise<FinQuiz | null> {
  try {
    const { data, error } = await supabase.rpc('terminer_quiz', { p_type: type, p_slug: slug, p_reponses: reponses });
    if (error || !data) return null;
    return data as FinQuiz;
  } catch {
    return null;
  }
}

/** Progression du compte ; null pour un invité ou si le script n'est pas installé. */
export async function maProgression(): Promise<Progression | null> {
  try {
    const { data, error } = await supabase.rpc('ma_progression');
    if (error || !data) return null;
    return data as Progression;
  } catch {
    return null;
  }
}
