import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  getDecouverteItemBySlug,
  getDecouverteItems,
  refreshDecouverteItems,
  getDecouvertePays,
  getRelatedDecouverteItems,
} from './decouverteRepository';
import type { DecouverteItem, DecouvertePays } from './decouverteTypes';

type AsyncState<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready'; data: T };

/** Fiches Découverte : rechargées à chaque retour sur l'écran ; `cle` force un rechargement. */
export function useDecouverteItems(cle = 0): AsyncState<DecouverteItem[]> {
  const [state, setState] = useState<AsyncState<DecouverteItem[]>>({ status: 'loading' });
  const hasData = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (hasData.current ? refreshDecouverteItems : getDecouverteItems)()
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

export function useDecouverteItem(slug: string | undefined): AsyncState<DecouverteItem | undefined> {
  const [state, setState] = useState<AsyncState<DecouverteItem | undefined>>({ status: 'loading' });

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setState({ status: 'loading' });
    getDecouverteItemBySlug(slug)
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [slug]);

  return state;
}

export function useRelatedDecouverteItems(item: DecouverteItem | undefined): DecouverteItem[] {
  const [related, setRelated] = useState<DecouverteItem[]>([]);

  useEffect(() => {
    if (!item) {
      setRelated([]);
      return;
    }
    let alive = true;
    getRelatedDecouverteItems(item).then((data) => alive && setRelated(data));
    return () => {
      alive = false;
    };
  }, [item]);

  return related;
}

export function useDecouvertePays(): AsyncState<DecouvertePays[]> {
  const [state, setState] = useState<AsyncState<DecouvertePays[]>>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getDecouvertePays()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
