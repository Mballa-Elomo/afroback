import { useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';

/**
 * Retour qui ne bloque jamais (2026-10-17, retour de test Yannick : « je ne
 * peux pas faire un retour arrière ») : revient à l'écran précédent s'il
 * existe ; sinon (écran ouvert par un lien direct, une notification, un autre
 * onglet) ramène à un écran parent sûr, l'accueil par défaut.
 */
export function useRetour(secours: Href = '/accueil') {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(secours);
  }, [router, secours]);
}
