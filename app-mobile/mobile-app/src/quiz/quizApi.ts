import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../data/supabaseClient';

/**
 * Quiz de fin de contenu + progression (cdc-quiz-progression.md, 2026-10-07).
 * Tout passe par les fonctions serveur de supabase/schema-quiz.sql : l'app ne
 * reçoit jamais la bonne réponse avant d'avoir répondu, et le score est
 * recalculé côté serveur. Tant que le script n'a pas été exécuté, les
 * fonctions n'existent pas : la tuile et la carte de fin restent cachées et
 * l'écran du quiz affiche "bientôt disponible".
 */

export type QuizContentType = 'heros' | 'mythe';
export type NiveauCode = 'apprenti' | 'curieux' | 'conteur' | 'griot' | 'gardien';

export interface QuizNiveau {
  rang: number;
  code: NiveauCode;
  seuil: number;
  suivant_code: NiveauCode | null;
  suivant_seuil: number | null;
}

export interface QuizEtat {
  disponible: boolean;
  nb_questions: number;
  meilleur_score: number | null;
  tentatives: number;
}

export interface QuizQuestion {
  id: string;
  ordre: number;
  question_fr: string;
  question_en: string | null;
  choix_fr: string[];
  choix_en: string[] | null;
}

export type QuizChargement =
  | { statut: 'ok'; questions: QuizQuestion[]; meilleur_score: number | null }
  | { statut: 'compte_requis' | 'verrouille' | 'indisponible' };

export interface QuizCorrection {
  correct: boolean;
  bonne_reponse: number;
  explication_fr: string;
  explication_en: string | null;
}

export interface QuizResultat {
  score: number;
  total: number;
  meilleur_avant: number | null;
  meilleur: number;
  points_gagnes: number;
  points: number;
  niveau_avant: QuizNiveau;
  niveau: QuizNiveau;
}

export interface ProgressionLigne {
  type: QuizContentType;
  slug: string;
  titre_fr: string | null;
  titre_en: string | null;
  image: string | null;
  meilleur_score: number | null;
  total: number | null;
  tentatives: number;
  derniere_at: string | null;
}

export interface Progression {
  points: number;
  niveau: QuizNiveau;
  quiz_total: number;
  quiz_faits: number;
  maitrises: number;
  moyenne: number | null;
  resultats: ProgressionLigne[];
}

/** Fonction serveur absente (schema-quiz.sql pas encore exécuté). */
function isMissingFunction(error: { code?: string; message?: string }) {
  return error.code === 'PGRST202' || /function .* does not exist|Could not find the function/i.test(error.message ?? '');
}

export async function getQuizEtat(type: QuizContentType, slug: string): Promise<QuizEtat | null> {
  const { data, error } = await supabase.rpc('etat_quiz', { p_type: type, p_slug: slug });
  if (error || !data) return null;
  return data as QuizEtat;
}

export async function loadQuiz(type: QuizContentType, slug: string): Promise<QuizChargement> {
  const { data, error } = await supabase.rpc('get_quiz', { p_type: type, p_slug: slug });
  if (error) {
    if (isMissingFunction(error)) return { statut: 'indisponible' };
    throw new Error(error.message);
  }
  return (data ?? { statut: 'indisponible' }) as QuizChargement;
}

export async function checkAnswer(questionId: string, choix: number): Promise<QuizCorrection> {
  const { data, error } = await supabase.rpc('verifier_reponse_quiz', { p_question_id: questionId, p_choix: choix });
  if (error || !data) throw new Error(error?.message ?? 'reseau');
  return data as QuizCorrection;
}

export async function finishQuiz(
  type: QuizContentType,
  slug: string,
  reponses: { question_id: string; choix: number }[]
): Promise<QuizResultat> {
  const { data, error } = await supabase.rpc('terminer_quiz', { p_type: type, p_slug: slug, p_reponses: reponses });
  if (error || !data) throw new Error(error?.message ?? 'reseau');
  return data as QuizResultat;
}

export async function getProgression(): Promise<Progression | null> {
  const { data, error } = await supabase.rpc('ma_progression');
  if (error || !data) return null;
  return data as Progression;
}

/** État du quiz d'un contenu, relu à chaque retour sur l'écran (meilleur score à jour après un quiz). */
export function useQuizEtat(type: QuizContentType, slug: string | undefined): QuizEtat | null {
  const [etat, setEtat] = useState<QuizEtat | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!slug) return;
      let alive = true;
      getQuizEtat(type, slug).then((e) => alive && setEtat(e));
      return () => {
        alive = false;
      };
    }, [type, slug])
  );
  return etat;
}

/** Progression de la personne connectée, relue à chaque retour sur l'écran. */
export function useProgression(enabled = true): { data: Progression | null; loading: boolean } {
  const [data, setData] = useState<Progression | null>(null);
  const [loading, setLoading] = useState(true);
  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        setLoading(false);
        return;
      }
      let alive = true;
      getProgression().then((p) => {
        if (!alive) return;
        setData(p);
        setLoading(false);
      });
      return () => {
        alive = false;
      };
    }, [enabled])
  );
  return { data, loading };
}

/** Chemin de l'écran du quiz. */
export function quizHref(type: QuizContentType, slug: string) {
  return `/quiz/${type}/${slug}` as const;
}

/** Texte dans la langue de l'interface, avec repli sur le français si l'anglais manque. */
export function pickLang<T>(lang: string, fr: T, en: T | null | undefined): T {
  return lang === 'en' && en != null && (!Array.isArray(en) || en.length > 0) ? en : fr;
}
