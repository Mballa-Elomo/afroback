import { useCallback, useEffect, useState } from 'react';
import { getOwnVendor, getProductById, getProducts } from './marketplaceRepository';
import type { MarketplaceProductWithVendor, MarketplaceVendorOwn } from './marketplaceTypes';

type AsyncState<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready'; data: T };

export function useMarketplaceProducts(): [AsyncState<MarketplaceProductWithVendor[]>, () => void] {
  const [state, setState] = useState<AsyncState<MarketplaceProductWithVendor[]>>({ status: 'loading' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getProducts()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [tick]);

  return [state, useCallback(() => setTick((t) => t + 1), [])];
}

export function useMarketplaceProduct(id: string | undefined): AsyncState<MarketplaceProductWithVendor | null> {
  const [state, setState] = useState<AsyncState<MarketplaceProductWithVendor | null>>({ status: 'loading' });

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setState({ status: 'loading' });
    getProductById(id)
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [id]);

  return state;
}

export function useOwnVendor(): [AsyncState<MarketplaceVendorOwn | null>, () => void] {
  const [state, setState] = useState<AsyncState<MarketplaceVendorOwn | null>>({ status: 'loading' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    getOwnVendor()
      .then((data) => alive && setState({ status: 'ready', data }))
      .catch((error) => alive && setState({ status: 'error', error }));
    return () => {
      alive = false;
    };
  }, [tick]);

  return [state, useCallback(() => setTick((t) => t + 1), [])];
}
