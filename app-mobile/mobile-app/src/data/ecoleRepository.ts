import { supabase } from './supabaseClient';
import type {
  EcoleLecon,
  EcoleLeconStatut,
  EcoleNiveau,
  EcoleQuizNiveauQuestion,
  EcoleQuizQuestion,
  EnfantEcoleProgression,
  EnfantLeconResultat,
  EnfantQuizNiveauResultat,
} from './ecoleTypes';

/**
 * Source de données réelle : tables ecole_niveaux/ecole_lecons/
 * ecole_quiz_questions/ecole_quiz_niveau (contenu éditorial, lecture
 * publique) et enfant_ecole_progression/enfant_lecon_resultats/
 * enfant_quiz_niveau_resultats (propres à chaque enfant, scopées par
 * `child_profiles.parent_user_id = auth.uid()` côté RLS) — voir
 * supabase/schema-ecole-heros.sql. Pas de cache pour les tables enfant_*
 * (comme parentEnfantRepository.ts) ; un léger cache mémoire pour le
 * contenu éditorial (comme heroesRepository.ts), qui change rarement.
 */

let niveauxCache: EcoleNiveau[] | null = null;

export async function getNiveaux(): Promise<EcoleNiveau[]> {
  if (niveauxCache) return niveauxCache;
  const { data, error } = await supabase.from('ecole_niveaux').select('*').order('niveau', { ascending: true });
  if (error) throw new Error(`Impossible de charger les niveaux : ${error.message}`);
  niveauxCache = (data ?? []) as EcoleNiveau[];
  return niveauxCache;
}

export async function getNiveauByNumero(niveau: number): Promise<EcoleNiveau | undefined> {
  const niveaux = await getNiveaux();
  return niveaux.find((n) => n.niveau === niveau);
}

export async function getLeconsByNiveau(niveau: number): Promise<EcoleLecon[]> {
  const { data, error } = await supabase
    .from('ecole_lecons')
    .select('*')
    .eq('niveau', niveau)
    .order('ordre_dans_niveau', { ascending: true });
  if (error) throw new Error(`Impossible de charger les leçons : ${error.message}`);
  return (data ?? []) as EcoleLecon[];
}

/** Toutes les leçons, tous niveaux confondus — utilisé par l'écran Collection. */
export async function getAllLecons(): Promise<EcoleLecon[]> {
  const { data, error } = await supabase
    .from('ecole_lecons')
    .select('*')
    .order('niveau', { ascending: true })
    .order('ordre_dans_niveau', { ascending: true });
  if (error) throw new Error(`Impossible de charger les leçons : ${error.message}`);
  return (data ?? []) as EcoleLecon[];
}

export async function getLeconById(id: string): Promise<EcoleLecon | undefined> {
  const { data, error } = await supabase.from('ecole_lecons').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Impossible de charger cette leçon : ${error.message}`);
  return (data as EcoleLecon | null) ?? undefined;
}

export async function getQuizQuestions(leconId: string): Promise<EcoleQuizQuestion[]> {
  const { data, error } = await supabase
    .from('ecole_quiz_questions')
    .select('*')
    .eq('lecon_id', leconId)
    .order('ordre', { ascending: true });
  if (error) throw new Error(`Impossible de charger le quiz : ${error.message}`);
  return (data ?? []) as EcoleQuizQuestion[];
}

export async function getQuizNiveauQuestions(niveau: number): Promise<EcoleQuizNiveauQuestion[]> {
  const { data, error } = await supabase
    .from('ecole_quiz_niveau')
    .select('*')
    .eq('niveau', niveau)
    .order('ordre', { ascending: true });
  if (error) throw new Error(`Impossible de charger le quiz de fin de niveau : ${error.message}`);
  return (data ?? []) as EcoleQuizNiveauQuestion[];
}

/** Crée la ligne de progression au niveau 1 si elle n'existe pas encore (premier accès de l'enfant au module). */
export async function getOrCreateProgression(childId: string): Promise<EnfantEcoleProgression> {
  const { data, error } = await supabase.from('enfant_ecole_progression').select('*').eq('child_id', childId).maybeSingle();
  if (error) throw new Error(`Impossible de charger la progression : ${error.message}`);
  if (data) return data as EnfantEcoleProgression;

  const { data: created, error: insertError } = await supabase
    .from('enfant_ecole_progression')
    .insert({ child_id: childId, niveau_actuel: 1 })
    .select('*')
    .single();
  if (insertError) throw new Error(`Impossible de démarrer la progression : ${insertError.message}`);
  return created as EnfantEcoleProgression;
}

export async function getLeconResultats(childId: string, leconIds: string[]): Promise<Map<string, EnfantLeconResultat>> {
  const map = new Map<string, EnfantLeconResultat>();
  if (leconIds.length === 0) return map;
  const { data, error } = await supabase
    .from('enfant_lecon_resultats')
    .select('*')
    .eq('child_id', childId)
    .in('lecon_id', leconIds);
  if (error) throw new Error(`Impossible de charger les résultats : ${error.message}`);
  for (const row of (data ?? []) as EnfantLeconResultat[]) map.set(row.lecon_id, row);
  return map;
}

/**
 * Enregistre le résultat d'un quiz de leçon : `meilleur_score` ne baisse
 * jamais (garde le meilleur essai), `tentatives` s'incrémente à chaque
 * passage, `statut` passe à 'termine' si le seuil est atteint (règle
 * appliquée côté écran quiz, voir app/enfant/ecole/quiz/[leconId].tsx).
 */
export async function upsertLeconResultat(params: {
  childId: string;
  leconId: string;
  score: number;
  reussi: boolean;
}): Promise<{ error: string | null }> {
  const { data: existing } = await supabase
    .from('enfant_lecon_resultats')
    .select('*')
    .eq('child_id', params.childId)
    .eq('lecon_id', params.leconId)
    .maybeSingle();

  const previous = existing as EnfantLeconResultat | null;
  const meilleurScore = Math.max(params.score, previous?.meilleur_score ?? 0);
  const statut: EcoleLeconStatut = params.reussi ? 'termine' : previous?.statut === 'termine' ? 'termine' : 'disponible';

  const { error } = await supabase.from('enfant_lecon_resultats').upsert(
    {
      child_id: params.childId,
      lecon_id: params.leconId,
      statut,
      meilleur_score: meilleurScore,
      tentatives: (previous?.tentatives ?? 0) + 1,
      dernier_resultat_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'child_id,lecon_id' }
  );
  return { error: error ? error.message : null };
}

export async function getQuizNiveauResultat(childId: string, niveau: number): Promise<EnfantQuizNiveauResultat | undefined> {
  const { data, error } = await supabase
    .from('enfant_quiz_niveau_resultats')
    .select('*')
    .eq('child_id', childId)
    .eq('niveau', niveau)
    .maybeSingle();
  if (error) throw new Error(`Impossible de charger le résultat du niveau : ${error.message}`);
  return (data as EnfantQuizNiveauResultat | null) ?? undefined;
}

export async function upsertQuizNiveauResultat(params: {
  childId: string;
  niveau: number;
  score: number;
  reussi: boolean;
}): Promise<{ error: string | null }> {
  const { error } = await supabase.from('enfant_quiz_niveau_resultats').upsert(
    { child_id: params.childId, niveau: params.niveau, score: params.score, reussi: params.reussi, date: new Date().toISOString() },
    { onConflict: 'child_id,niveau' }
  );
  return { error: error ? error.message : null };
}

/** Débloque le niveau suivant (jamais au-delà de 4) après un quiz de fin de niveau réussi. */
export async function advanceNiveau(childId: string, nouveauNiveau: number): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('enfant_ecole_progression')
    .update({ niveau_actuel: Math.min(nouveauNiveau, 4), updated_at: new Date().toISOString() })
    .eq('child_id', childId);
  return { error: error ? error.message : null };
}
