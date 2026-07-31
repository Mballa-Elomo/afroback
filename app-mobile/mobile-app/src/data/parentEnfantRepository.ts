import { supabase } from './supabaseClient';
import type {
  AvatarCouleur,
  ChildProfile,
  ChildTodayStats,
  LangueCamerounaise,
  ParentSettings,
} from './parentEnfantTypes';

/**
 * Source de données réelle : tables `child_profiles`, `parent_settings`,
 * `child_sessions` sur Supabase (voir supabase/schema-parent-enfant.sql).
 * Contrairement à heroesRepository/decouverteRepository (contenu éditorial
 * public, en cache), ces données sont propres à chaque parent et mutables
 * en continu (ajout d'enfant, réglages, sessions) : pas de cache module,
 * chaque fonction interroge Supabase directement — même choix que
 * communityRepository.ts pour le contenu généré par l'utilisateur.
 */

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Impossible de déterminer l'utilisateur connecté.");
  }
  return data.user.id;
}

export async function getChildProfiles(): Promise<ChildProfile[]> {
  const parentUserId = await currentUserId();
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('parent_user_id', parentUserId)
    .order('created_at', { ascending: true });
  if (error) {
    throw new Error(`Impossible de charger les profils enfants : ${error.message}`);
  }
  return (data ?? []) as ChildProfile[];
}

export async function createChildProfile(params: {
  prenom: string;
  age: number;
  avatarCouleur: AvatarCouleur;
  languesActives: LangueCamerounaise[];
}): Promise<ChildProfile> {
  const parentUserId = await currentUserId();
  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      parent_user_id: parentUserId,
      prenom: params.prenom.trim(),
      age: params.age,
      avatar_couleur: params.avatarCouleur,
      langues_actives: params.languesActives,
    })
    .select('*')
    .single();
  if (error) {
    throw new Error(`Impossible de créer le profil enfant : ${error.message}`);
  }
  return data as ChildProfile;
}

export async function updateChildDecouverteActivee(childId: string, activee: boolean): Promise<void> {
  const { error } = await supabase
    .from('child_profiles')
    .update({ decouverte_activee: activee, updated_at: new Date().toISOString() })
    .eq('id', childId);
  if (error) {
    throw new Error(`Impossible de mettre à jour le réglage Découverte : ${error.message}`);
  }
}

export async function updateChildLimiteEcran(childId: string, minutes: number | null): Promise<void> {
  const { error } = await supabase
    .from('child_profiles')
    .update({ limite_ecran_minutes: minutes, updated_at: new Date().toISOString() })
    .eq('id', childId);
  if (error) {
    throw new Error(`Impossible de mettre à jour la limite d'écran : ${error.message}`);
  }
}

export async function getParentSettings(): Promise<ParentSettings | null> {
  const parentUserId = await currentUserId();
  const { data, error } = await supabase
    .from('parent_settings')
    .select('*')
    .eq('parent_user_id', parentUserId)
    .maybeSingle();
  if (error) {
    throw new Error(`Impossible de charger les réglages parent : ${error.message}`);
  }
  return (data as ParentSettings | null) ?? null;
}

/** Crée ou met à jour (upsert) le code PIN du parent — un seul par compte. */
export async function setParentPin(pinCode: string): Promise<void> {
  const parentUserId = await currentUserId();
  const { error } = await supabase
    .from('parent_settings')
    .upsert(
      { parent_user_id: parentUserId, pin_code: pinCode, updated_at: new Date().toISOString() },
      { onConflict: 'parent_user_id' }
    );
  if (error) {
    throw new Error(`Impossible d'enregistrer le code PIN : ${error.message}`);
  }
}

export async function startChildSession(childId: string): Promise<string> {
  const { data, error } = await supabase
    .from('child_sessions')
    .insert({ child_id: childId, started_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) {
    throw new Error(`Impossible de démarrer le suivi de session : ${error.message}`);
  }
  return data.id as string;
}

export async function endChildSession(sessionId: string, dureeSecondes: number): Promise<void> {
  const { error } = await supabase
    .from('child_sessions')
    .update({ ended_at: new Date().toISOString(), duree_secondes: Math.max(0, Math.round(dureeSecondes)) })
    .eq('id', sessionId);
  if (error) {
    // Best-effort : une session non close reste juste absente des stats du
    // jour (voir schema-parent-enfant.sql), on ne bloque jamais la sortie
    // du mode enfant pour cette raison.
    console.warn('Impossible de clôturer la session enfant :', error.message);
  }
}

/** Horodatage de la dernière session démarrée (close ou non) — `null` si l'enfant n'a jamais ouvert son profil. */
export async function getChildLastActivity(childId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('child_sessions')
    .select('started_at')
    .eq('child_id', childId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`Impossible de charger la dernière activité : ${error.message}`);
  }
  return (data as { started_at: string } | null)?.started_at ?? null;
}

/** Stats du jour pour un enfant — uniquement les sessions déjà closes (duree_secondes non nul), jamais une estimation inventée. */
export async function getChildTodayStats(childId: string): Promise<ChildTodayStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('child_sessions')
    .select('duree_secondes')
    .eq('child_id', childId)
    .gte('started_at', startOfDay.toISOString())
    .not('duree_secondes', 'is', null);
  if (error) {
    throw new Error(`Impossible de charger les statistiques du jour : ${error.message}`);
  }
  const rows = (data ?? []) as { duree_secondes: number | null }[];
  const totalSecondes = rows.reduce((sum, r) => sum + (r.duree_secondes ?? 0), 0);
  return {
    minutesAujourdhui: Math.round(totalSecondes / 60),
    aDejaUneSession: rows.length > 0,
  };
}
