'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { ContentType } from './types';

/**
 * Galerie d'un récit (supabase/schema-galerie.sql) : images publiées, dans
 * l'ordre choisi. Une archive porte toujours son crédit ; une illustration
 * est affichée comme telle, jamais comme une archive.
 */
export interface ImageGalerie {
  id: string;
  ordre: number;
  nature: 'archive' | 'illustration';
  url: string;
  legende_fr: string;
  legende_en: string | null;
  credit: string | null;
  source_url: string | null;
}

export function useGalerie(type: ContentType, slug: string): ImageGalerie[] {
  const [images, setImages] = useState<ImageGalerie[]>([]);
  useEffect(() => {
    let actif = true;
    Promise.resolve(
      supabase
        .from('galerie_images')
        .select('id, ordre, nature, url, legende_fr, legende_en, credit, source_url')
        .eq('type_contenu', type)
        .eq('slug', slug)
        .order('ordre'),
    )
      .then(({ data, error }) => actif && setImages(error || !data ? [] : (data as ImageGalerie[])))
      .catch(() => {});
    return () => {
      actif = false;
    };
  }, [type, slug]);
  return images;
}
