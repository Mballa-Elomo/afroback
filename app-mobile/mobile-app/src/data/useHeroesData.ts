import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getHeroBySlug, getHeroes, getRelatedHeroes, refreshHeroes } from './heroesRepository';
import type { Heros } from './types';

type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: T };

/**
 * Catalogue héros — se rafraîchit tout seul à chaque fois que l'écran
 * reprend le focus (retour d'un autre onglet, réouverture de l'app depuis
 * l'arrière-plan...), pour qu'une action faite entre-temps depuis le
 * back-office (publier/dépublier un héros, le mettre à la une) apparaisse
 * sans que Yannick ait besoin de fermer/rouvrir l'app ou de tirer pour
 * rafraîchir.
 *
 * Choix délibéré : un refetch au focus (`useFocusEffect`, déjà le pattern
 * utilisé ailleurs dans l'app — voir `app/(tabs)/accueil/index.tsx` pour la
 * progression de lecture), pas un abonnement Supabase Realtime. Un outil à
 * un seul éditeur (Yannick, back-office) qui modifie rarement le catalogue
 * ne justifie pas la complexité d'un canal websocket (connexion/
 * reconnexion, nettoyage à la fermeture d'écran, activation de la
 * réplication Realtime côté Supabase) pour un gain réel limité. Limite
 * assumée et documentée : si Yannick reste les yeux rivés sur l'écran sans
 * jamais changer d'onglet ni rouvrir l'app, un changement fait entre-temps
 * dans le back-office n'apparaît pas tout seul avant le prochain focus.
 *
 * Le premier chargement affiche un état "loading" ; les rafraîchissements
 * suivants se font en silence derrière les données déjà affichées (jamais
 * de flash de chargement à chaque retour sur l'écran), et un échec de
 * rafraîchissement en arrière-plan n'efface jamais des données déjà
 * affichées avec succès — seul un tout premier chargement raté affiche un
 * état d'erreur.
 */
export function useHeroesList(): AsyncState<Heros[]> {
  const [state, setState] = useState<AsyncState<Heros[]>>({ status: 'loading' });
  const hasData = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const fetcher = hasData.current ? refreshHeroes : getHeroes;
      fetcher()
        .then((data) => {
          if (!alive) return;
          hasData.current = true;
          setState({ status: 'ready', data });
        })
        .catch((error) => {
          if (!alive) return;
          if (!hasData.current) setState({ status: 'error', error });
          // Rafraîchissement en arrière-plan raté (réseau coupé le temps
          // d'un focus, etc.) : on garde silencieusement les données déjà
          // affichées plutôt que de remplacer un catalogue visible par un
          // écran d'erreur.
        });
      return () => {
        alive = false;
      };
    }, [])
  );

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
