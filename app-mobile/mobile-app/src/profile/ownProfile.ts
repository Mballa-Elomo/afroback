import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../auth/AuthProvider';
import { getOwnProfile } from '../data/communityRepository';

/**
 * Photo/avatar et pseudo de la personne connectée (profil communautaire),
 * partagés entre tous les écrans qui les affichent (accueil, Profil…).
 * Un seul chargement, mis en cache par compte ; relu au retour sur un écran
 * et immédiatement après "Modifier le profil" (refreshOwnProfile).
 * Corrige le 2026-09-30 : l'accueil affichait une image générique au lieu
 * de la photo choisie.
 */
export interface OwnProfile {
  pseudo: string;
  avatar: string | null;
}

let cache: { userId: string; profile: OwnProfile | null } | null = null;
const listeners = new Set<() => void>();

async function load(userId: string): Promise<void> {
  try {
    const p = await getOwnProfile();
    cache = { userId, profile: p ? { pseudo: p.pseudo, avatar: p.avatar_url ?? null } : null };
    listeners.forEach((l) => l());
  } catch {
    /* hors ligne : on garde la dernière valeur connue */
  }
}

/** À appeler après une modification du profil : tous les écrans se mettent à jour. */
export async function refreshOwnProfile(): Promise<void> {
  if (cache) await load(cache.userId);
}

export function useOwnProfile(): OwnProfile | null {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (userId && cache?.userId !== userId) load(userId);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) load(userId);
    }, [userId])
  );

  if (!userId || cache?.userId !== userId) return null;
  return cache.profile;
}
