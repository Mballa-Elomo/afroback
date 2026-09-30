import { useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { NavigationContext } from '@react-navigation/native';

/** Réglage système "Réduire les animations" (iOS/Android/web), suivi en direct. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setReduce(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

/**
 * Les animations en boucle (particules, dérive d'image, halo, reflet) ne
 * tournent que si l'écran qui les porte est visible et que "Réduire les
 * animations" est désactivé. Sans cette garde, un écran resté dans
 * l'historique de navigation (ex. le splash derrière l'app en mode invité)
 * continuait d'animer en arrière-plan : sur navigateur de téléphone, l'app
 * devenait lente au toucher (retour de test de Yannick, 2026-09-29).
 * Hors navigation (écran de chargement), l'écran est considéré visible.
 */
export function useMotionAllowed(): boolean {
  const reduce = useReduceMotion();
  const navigation = useContext(NavigationContext);
  const [focused, setFocused] = useState(() => navigation?.isFocused() ?? true);
  useEffect(() => {
    if (!navigation) return;
    setFocused(navigation.isFocused());
    const offFocus = navigation.addListener('focus', () => setFocused(true));
    const offBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);
  return !reduce && focused;
}
