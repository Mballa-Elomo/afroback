'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/**
 * Sponsors (backoffice/cdc-module-sponsors.md, étape 2) : emplacements actifs
 * du jour, lus via `sponsors_publics()` (jamais le contrat), et mesure
 * anonyme des affichages et des clics via `sponsor_mesure()`.
 * Jamais utilisé dans l'espace enfant (décision de Yannick).
 */

export type FormatSponsor = 'banniere_accueil' | 'presente_par' | 'fin_video' | 'page_partenaires';

export interface EmplacementSponsor {
  emplacement_id: string;
  format: FormatSponsor;
  cible_type: 'heros' | 'mythe' | 'decouverte' | null;
  cible_slug: string | null;
  accroche_fr: string | null;
  accroche_en: string | null;
  sponsor: {
    id: string;
    nom: string;
    logo_url: string | null;
    site_url: string | null;
    description_fr: string | null;
    description_en: string | null;
  };
}

// Une seule lecture par chargement de page, partagée entre les encarts.
let cache: Promise<EmplacementSponsor[]> | null = null;
let lu = 0;

function charger(): Promise<EmplacementSponsor[]> {
  if (!cache || Date.now() - lu > 5 * 60000) {
    lu = Date.now();
    cache = Promise.resolve(supabase.rpc('sponsors_publics'))
      .then(({ data, error }) => (error || !Array.isArray(data) ? [] : (data as EmplacementSponsor[])))
      .catch(() => []);
  }
  return cache;
}

export function useSponsors(): EmplacementSponsor[] {
  const [liste, setListe] = useState<EmplacementSponsor[]>([]);
  useEffect(() => {
    let actif = true;
    charger().then((l) => actif && setListe(l));
    return () => {
      actif = false;
    };
  }, []);
  return liste;
}

const vus = new Set<string>();

/** Un affichage est compté une fois par page vue ; un clic à chaque ouverture du lien. */
export function mesurer(emplacementId: string, type: 'affichage' | 'clic') {
  if (type === 'affichage') {
    const cle = `${emplacementId}:${typeof location !== 'undefined' ? location.pathname : ''}`;
    if (vus.has(cle)) return;
    vus.add(cle);
  }
  void Promise.resolve(supabase.rpc('sponsor_mesure', { p_emplacement: emplacementId, p_type: type })).catch(() => {});
}
