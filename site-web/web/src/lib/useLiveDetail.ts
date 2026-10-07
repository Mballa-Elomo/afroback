'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useMember } from './auth';
import type { ContentType, Detail } from './types';

const RPC: Record<ContentType, string> = { heros: 'get_heros_detail', mythe: 'get_mythe_detail', decouverte: 'get_decouverte_detail' };

/**
 * Le serveur prépare les pages en invité (aperçu si réservé). Pour un membre
 * connecté, on redemande le détail avec SA session : un abonné reçoit le
 * contenu complet, un compte gratuit garde l'aperçu (décision côté serveur).
 */
export function useLiveDetail(type: ContentType, slug: string, initial: Detail | null): Detail | null {
  const { member, subscription } = useMember();
  const [detail, setDetail] = useState(initial);
  useEffect(() => setDetail(initial), [initial]);
  useEffect(() => {
    if (!member || !initial?.verrouille) return;
    let alive = true;
    supabase.rpc(RPC[type], { p_slug: slug }).then(({ data }) => {
      if (alive && data) setDetail(data as Detail);
    });
    return () => {
      alive = false;
    };
  }, [member, subscription?.plan, type, slug, initial]);
  return detail;
}
