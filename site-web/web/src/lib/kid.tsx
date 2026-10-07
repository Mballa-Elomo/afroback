'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth';
import { endSession, startSession, type ChildProfile } from './kids';

/**
 * Profil enfant actif, façon Netflix Kids. Comme dans l'app
 * (src/profils/ActiveProfileProvider.tsx), c'est un état du navigateur, pas
 * une session Supabase : auth.uid() reste celui du parent. Il est gardé dans
 * le navigateur pour qu'un rechargement de page ne fasse pas sortir l'enfant
 * de son espace. Sortir demande le code PIN du parent (voir PinGate).
 */
const KEY = 'afroback-web:enfant';
const CHOSEN = 'afroback-web:qui-regarde';

type Stored = { profil: ChildProfile; sessionId: string | null; startedAt: number };

type Ctx = {
  ready: boolean;
  kid: ChildProfile | null;
  /** Démarre l'espace enfant et le suivi réel du temps passé. */
  enterKid: (p: ChildProfile) => void;
  /** À n'appeler qu'APRÈS le code PIN validé. Clôt la session de l'enfant. */
  exitKid: () => void;
  /** Met à jour le profil actif (ex. réglage Découverte modifié par le parent). */
  refreshKid: (p: ChildProfile) => void;
  /** « Qui regarde ? » déjà répondu dans cet onglet. */
  chosen: boolean;
  markChosen: () => void;
};
const KidContext = createContext<Ctx | null>(null);

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}
function write(v: Stored | null) {
  try {
    if (v) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  } catch {}
}

export function KidProvider({ children }: { children: React.ReactNode }) {
  const { ready: authReady, session } = useAuth();
  const [stored, setStored] = useState<Stored | null>(null);
  const [ready, setReady] = useState(false);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    setStored(read());
    try {
      setChosen(sessionStorage.getItem(CHOSEN) === '1');
    } catch {}
    setReady(true);
  }, []);

  // Déconnecté ou autre compte : l'espace enfant ne survit pas.
  useEffect(() => {
    if (!authReady || !stored) return;
    if (!session || session.user.id !== stored.profil.parent_user_id) {
      write(null);
      setStored(null);
    }
  }, [authReady, session, stored]);

  const markChosen = useCallback(() => {
    setChosen(true);
    try {
      sessionStorage.setItem(CHOSEN, '1');
    } catch {}
  }, []);

  const enterKid = useCallback(
    (profil: ChildProfile) => {
      const v: Stored = { profil, sessionId: null, startedAt: Date.now() };
      write(v);
      setStored(v);
      markChosen();
      startSession(profil.id)
        .then((id) => {
          const cur = read();
          if (cur && cur.profil.id === profil.id) {
            const next = { ...cur, sessionId: id };
            write(next);
            setStored(next);
          }
        })
        .catch(() => {});
    },
    [markChosen],
  );

  const exitKid = useCallback(() => {
    const cur = read();
    if (cur?.sessionId) endSession(cur.sessionId, (Date.now() - cur.startedAt) / 1000).catch(() => {});
    write(null);
    setStored(null);
  }, []);

  const refreshKid = useCallback((profil: ChildProfile) => {
    const cur = read();
    if (cur && cur.profil.id === profil.id) {
      const next = { ...cur, profil };
      write(next);
      setStored(next);
    }
  }, []);

  const value = useMemo(
    () => ({ ready, kid: stored?.profil ?? null, enterKid, exitKid, refreshKid, chosen, markChosen }),
    [ready, stored, enterKid, exitKid, refreshKid, chosen, markChosen],
  );
  return <KidContext.Provider value={value}>{children}</KidContext.Provider>;
}

export function useKid() {
  const c = useContext(KidContext);
  if (!c) throw new Error('useKid doit être utilisé dans <KidProvider>.');
  return c;
}
