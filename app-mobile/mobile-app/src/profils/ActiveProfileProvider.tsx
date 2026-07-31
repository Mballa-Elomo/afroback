import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { endChildSession, getChildProfiles, startChildSession } from '../data/parentEnfantRepository';
import type { ChildProfile } from '../data/parentEnfantTypes';

/**
 * État "quel profil est actif" (façon Netflix — un seul compte Supabase,
 * plusieurs profils dedans). Décision de Yannick, 2026-07-31 : l'enfant ne
 * se connecte jamais lui-même, donc ceci est un état purement côté app,
 * jamais une session Supabase distincte — `auth.uid()` reste tout du long
 * celui du parent.
 *
 * 'checking'   → liste des profils enfants pas encore chargée.
 * 'selecting'  → écran "Qui est-ce ?" affiché (au moins un profil enfant existe).
 * 'adult'      → navigation normale (5 onglets), comme avant ce chantier.
 * 'child'      → mode enfant plein écran, tab bar masquée.
 *
 * Règle : si le parent n'a AUCUN profil enfant, le statut passe directement
 * à 'adult' sans jamais montrer le sélecteur — comportement strictement
 * identique à avant ce chantier tant qu'aucun enfant n'est ajouté (ne casse
 * rien pour Yannick qui teste en direct).
 */
type ProfileState =
  | { status: 'checking' }
  | { status: 'selecting' }
  | { status: 'adult' }
  | { status: 'child'; profil: ChildProfile };

interface ActiveProfileValue {
  state: ProfileState;
  /** Liste des profils enfants du parent connecté, tenue à jour via refreshChildren(). */
  children: ChildProfile[];
  /** À appeler après un ajout/une suppression de profil enfant pour rafraîchir la liste (sélecteur, Espace Parent). */
  refreshChildren: () => Promise<void>;
  /** Choix libre, sans PIN — utilisé depuis le sélecteur "Qui est-ce ?" en état neutre. */
  chooseAdult: () => void;
  /** Choix libre, sans PIN — démarre aussi le suivi de session réel (voir schema-parent-enfant.sql). */
  chooseChild: (profil: ChildProfile) => void;
  /**
   * Retour au sélecteur, à n'appeler QU'APRÈS validation du code PIN côté
   * appelant (voir src/profils/PinGate.tsx) — ce provider ne connaît pas le
   * PIN, il fait confiance à l'écran appelant. Clôture aussi la session
   * enfant en cours si on quitte un profil enfant.
   */
  returnToSelector: () => void;
}

const ActiveProfileContext = createContext<ActiveProfileValue | undefined>(undefined);

export function ActiveProfileProvider({ children: reactChildren }: { children: ReactNode }) {
  const { session, onboardingComplete } = useAuth();
  const [state, setState] = useState<ProfileState>({ status: 'checking' });
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const initialDecisionMade = useRef(false);
  const currentSessionId = useRef<string | null>(null);
  const currentSessionStartedAt = useRef<number | null>(null);

  const loadChildren = useCallback(async () => {
    try {
      const list = await getChildProfiles();
      setChildProfiles(list);
      return list;
    } catch (e) {
      // Échec réseau ou table pas encore créée côté Supabase (script
      // schema-parent-enfant.sql pas encore exécuté) : on ne bloque jamais
      // l'app pour autant, on se comporte comme s'il n'y avait aucun enfant.
      console.warn('Chargement des profils enfants impossible, mode adulte par défaut :', e);
      setChildProfiles([]);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!session || !onboardingComplete) {
      // Session pas prête : rien à décider tant que l'auth/onboarding n'est
      // pas résolu (les écrans onboarding/login gèrent déjà cet état).
      return;
    }
    if (initialDecisionMade.current) return;
    let alive = true;
    loadChildren().then((list) => {
      if (!alive) return;
      initialDecisionMade.current = true;
      setState(list.length === 0 ? { status: 'adult' } : { status: 'selecting' });
    });
    return () => {
      alive = false;
    };
  }, [session, onboardingComplete, loadChildren]);

  const refreshChildren = useCallback(async () => {
    await loadChildren();
  }, [loadChildren]);

  const chooseAdult = useCallback(() => {
    setState({ status: 'adult' });
  }, []);

  const chooseChild = useCallback((profil: ChildProfile) => {
    setState({ status: 'child', profil });
    currentSessionStartedAt.current = Date.now();
    startChildSession(profil.id)
      .then((id) => {
        currentSessionId.current = id;
      })
      .catch((e) => {
        // Pas de suivi de session possible (table pas encore créée, réseau) :
        // le mode enfant reste utilisable quand même, juste sans stats réelles.
        console.warn('Suivi de session enfant impossible :', e);
        currentSessionId.current = null;
      });
  }, []);

  const returnToSelector = useCallback(() => {
    if (currentSessionId.current && currentSessionStartedAt.current) {
      const dureeSecondes = (Date.now() - currentSessionStartedAt.current) / 1000;
      endChildSession(currentSessionId.current, dureeSecondes).catch(() => {});
    }
    currentSessionId.current = null;
    currentSessionStartedAt.current = null;
    setState({ status: 'selecting' });
  }, []);

  const value = useMemo<ActiveProfileValue>(
    () => ({ state, children: childProfiles, refreshChildren, chooseAdult, chooseChild, returnToSelector }),
    [state, childProfiles, refreshChildren, chooseAdult, chooseChild, returnToSelector]
  );

  return <ActiveProfileContext.Provider value={value}>{reactChildren}</ActiveProfileContext.Provider>;
}

export function useActiveProfile(): ActiveProfileValue {
  const ctx = useContext(ActiveProfileContext);
  if (!ctx) throw new Error('useActiveProfile doit être utilisé à l’intérieur de <ActiveProfileProvider>.');
  return ctx;
}
