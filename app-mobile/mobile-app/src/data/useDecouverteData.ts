import { useEffect, useState } from 'react';
import {
  getDecouverteItemBySlug,
  getDecouverteItems,
  getDecouvertePays,
  getRelatedDecouverteItems,
} from './decouverteRepository';
import type { DecouverteItem, DecouvertePays } from './decouverteTypes';

type AsyncState<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready'; data: T };

export function useDecouverteItems(): AsyncState<DecouverteItem[]> {
  const [state, setState] = useState<AsyncState<DecouverteItem[]>>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getDecouverteItems()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, []);

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
