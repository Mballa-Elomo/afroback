import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandMark, GoldParticles, ONBOARDING_BG, useReduceMotion } from '../../src/onboarding/ui';
import { useI18n } from '../../src/i18n';

/**
 * Écran 5 — transition vers l'inscription (maquette de Yannick, 2026-09-29) :
 * fond noir, logo, traînée de particules dorées. 1 s, sans interaction, puis
 * fondu vers "Bienvenue dans ton voyage". "Réduire les animations" : fondu
 * simple de 300 ms, sans particules (cdc-onboarding.md, écran 5).
 */
export default function TransitionScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const total = reduceMotion ? 300 : 1000;
    const anim = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: total * 0.35, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(total * 0.4),
      Animated.timing(opacity, { toValue: 0, duration: total * 0.25, useNativeDriver: true }),
    ]);
    anim.start(({ finished }) => {
      if (finished) router.replace('/onboarding/bienvenue');
    });
    return () => anim.stop();
  }, [opacity, reduceMotion, router]);

  return (
    <View style={styles.wrap} accessibilityLabel={t('intro.transitionA11y')}>
      <GoldParticles count={34} />
      <Animated.View style={{ opacity }}>
        <BrandMark size="md" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: ONBOARDING_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
