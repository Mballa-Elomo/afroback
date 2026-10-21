import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

/**
 * Navigation fluide (2026-10-17, retour de test Yannick) : glissement latéral
 * entre écrans, et retour par glissement depuis n'importe où sur l'écran
 * (iPhone), pas seulement depuis le bord.
 */
export const NAVIGATION_FLUIDE: NativeStackNavigationOptions = {
  animation: 'slide_from_right',
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};
