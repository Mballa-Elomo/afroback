import { useEffect, useState } from 'react';
import { getHeroBySlug, getHeroes, getRelatedHeroes } from './heroesRepository';
import type { Heros } from './types';

type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: T };

export function useHeroesList(): AsyncState<Heros[]> {
  const [state, setState] = useState<AsyncState<Heros[]>>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getHeroes()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

export function useHero(slug: string | undefined): AsyncState<Heros | undefined> {
  const [state, setState] = useState<AsyncState<Heros | undefined>>({ status: 'loading' });

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setState({ status: 'loading' });
    getHeroBySlug(slug)
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [slug]);

  return state;
}

export function useRelatedHeroes(heros: Heros | undefined): Heros[] {
  const [related, setRelated] = useState<Heros[]>([]);

  useEffect(() => {
    if (!heros) {
      setRelated([]);
      return;
    }
    let alive = true;
    getRelatedHeroes(heros).then((data) => alive && setRelated(data));
    return () => {
      alive = false;
    };
  }, [heros]);

  return related;
}
