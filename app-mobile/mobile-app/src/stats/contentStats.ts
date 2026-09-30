import { useEffect, useState } from 'react';
import { supabase } from '../data/supabaseClient';
import type { ContentType } from '../data/contentAccess';

/**
 * "J'aime" et compteurs publics des contenus (cdc-jaime-compteurs.md).
 * Tout passe par les fonctions serveur de supabase/schema-jaime-compteurs.sql.
 */
export interface ContentStats {
  slug: string;
  lectures: number;
  ecoutes: number;
  vues: number;
  likes: number;
  aime: boolean;
  peut_aimer?: boolean;
}

export async function getContentStats(type: ContentType, slug: string): Promise<ContentStats | null> {
  const { data, error } = await supabase.rpc('stats_contenu', { p_type: type, p_slug: slug });
  if (error || !data) return null;
  return data as ContentStats;
}

export async function likeContent(type: ContentType, slug: string, like: boolean): Promise<{ likes?: number; error?: string }> {
  const { data, error } = await supabase.rpc('aimer_contenu', { p_type: type, p_slug: slug, p_aime: like });
  if (error) return { error: 'reseau' };
  if (!data?.ok) return { error: String(data?.error ?? 'inconnu') };
  return { likes: data.likes as number };
}

/** Compteurs de J'aime d'une liste de contenus (une seule requête), pour les cartes. */
export function useLikeCounts(type: ContentType, slugs: string[]): Map<string, number> {
  const [map, setMap] = useState<Map<string, number>>(new Map());
  const key = slugs.join('|');
  useEffect(() => {
    if (slugs.length === 0) return;
    let alive = true;
    supabase.rpc('stats_contenus', { p_type: type, p_slugs: slugs }).then(({ data }) => {
      if (!alive || !Array.isArray(data)) return;
      setMap(new Map((data as ContentStats[]).map((s) => [s.slug, s.likes])));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, key]);
  return map;
}

/** Nombre abrégé à la YouTube : 1 200 → "1,2 k", 1 500 000 → "1,5 M". */
export function compactNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace('.', ',').replace(',0', '')} k`;
  return `${(n / 1_000_000).toFixed(1).replace('.', ',').replace(',0', '')} M`;
}

/** "1 lecture" / "12 lectures". */
export function plural(n: number, one: string, many: string): string {
  return `${compactNumber(n)} ${n > 1 ? many : one}`;
}
