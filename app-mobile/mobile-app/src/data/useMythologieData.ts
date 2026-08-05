import { useEffect, useState } from 'react';
import { getMytheBySlug, getMythesGroupedByZone } from './mythologieRepository';
import type { Mythe } from './mythologieTypes';

type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: T };

export function useMythesGroupedByZone(): AsyncState<{ zone: string; items: Mythe[] }[]> {
  const [state, setState] = useState<AsyncState<{ zone: string; items: Mythe[] }[]>>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getMythesGroupedByZone()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, []);

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
