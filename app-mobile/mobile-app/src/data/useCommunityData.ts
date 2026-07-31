import { useCallback, useEffect, useState } from 'react';
import { getCommentCounts, getFeedPosts, getOwnProfile } from './communityRepository';
import type { CommunityPostWithAuthor, CommunityProfileOwn } from './communityTypes';

type AsyncState<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready'; data: T };

/** Profil communautaire du membre connecté. `refresh()` est exposé pour recharger après création/édition. */
export function useOwnProfile(): [AsyncState<CommunityProfileOwn | null>, () => void] {
  const [state, setState] = useState<AsyncState<CommunityProfileOwn | null>>({ status: 'loading' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getOwnProfile()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [tick]);

  return [state, useCallback(() => setTick((t) => t + 1), [])];
}

export interface FeedItem extends CommunityPostWithAuthor {
  commentCount: number;
}

/** Fil communautaire, avec le nombre de commentaires par post (pour l'affichage et le tri "Populaire"). */
export function useFeedPosts(): [AsyncState<FeedItem[]>, () => void] {
  const [state, setState] = useState<AsyncState<FeedItem[]>>({ status: 'loading' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getFeedPosts()
      .then(async (posts) => {
        const counts = await getCommentCounts(posts.map((p) => p.id));
        if (!alive) return;
        setState({
          status: 'ready',
          data: posts.map((p) => ({ ...p, commentCount: counts.get(p.id) ?? 0 })),
        });
      })
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [tick]);

  return [state, useCallback(() => setTick((t) => t + 1), [])];
}
