import { DeviceEventEmitter } from 'react-native';

/**
 * Appui sur un onglet déjà actif, quand on est déjà en haut de sa pile
 * (2026-10-17, retour de test Yannick : « quand je clique sur l'accueil, le
 * contenu n'est pas rechargé »). La barre d'onglets émet l'événement ;
 * l'écran racine de l'onglet remonte en haut et recharge ses données.
 */
const EVENT = 'afroback:onglet-reappuye';

export function signalerOngletReappuye(onglet: string) {
  DeviceEventEmitter.emit(EVENT, onglet);
}

export function surOngletReappuye(onglet: string, action: () => void) {
  const sub = DeviceEventEmitter.addListener(EVENT, (nom: string) => {
    if (nom === onglet) action();
  });
  return () => sub.remove();
}
