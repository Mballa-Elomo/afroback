import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getMytheBySlug, getMythesGroupedByZone } from './mythologieRepository';
import type { Mythe } from './mythologieTypes';

type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: T };

/**
 * Mythes par zone : rechargés à chaque retour sur l'écran (même principe que
 * le catalogue héros), pour qu'un mythe ajouté ou mis à la une dans le
 * back-office apparaisse sans redémarrer l'app. `cle` force un rechargement.
 */
export function useMythesGroupedByZone(cle = 0): AsyncState<{ zone: string; items: Mythe[] }[]> {
  const [state, setState] = useState<AsyncState<{ zone: string; items: Mythe[] }[]>>({ status: 'loading' });
  const hasData = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getMythesGroupedByZone(hasData.current)
        .then((data) => {
          if (!alive) return;
          hasData.current = true;
          setState({ status: 'ready', data });
        })
        .catch((error) => {
          if (alive && !hasData.current) setState({ status: 'error', error });
        });
      return () => {
        alive = false;
      };
    }, [cle])
  );

  return state;
}

export function useMythe(slug: string | undefined): AsyncState<Mythe | undefined> {
  const [state, setState] = useState<AsyncState<Mythe | undefined>>({ status: 'loading' });

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setState({ status: 'loading' });
    getMytheBySlug(slug)
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [slug]);

  return state;
}
