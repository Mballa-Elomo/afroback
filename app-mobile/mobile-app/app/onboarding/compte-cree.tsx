import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { AnimatedWords } from '../../src/onboarding/AnimatedText';
import { BrandMark, GoldParticles, MotifFrieze, ONBOARDING_BG, PillButton, useReduceMotion } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';

/**
 * Écran 9 — "Ton compte est créé !" (maquette de Yannick, 2026-09-29) :
 * cercle doré, coche qui se trace, halo lumineux, frise de motifs. Mène à
 * "Protège ton compte" (MFA, existant), puis au choix du forfait
 * (cdc-onboarding.md, décision D5).
 */
const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LENGTH = 40;

export default function CompteCreeScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const reduceMotion = useReduceMotion();
  const draw = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const halo = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      draw.setValue(1);
      halo.setValue(1);
      return;
    }
    Animated.sequence([
      Animated.timing(halo, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(draw, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, [draw, halo, reduceMotion]);

  return (
    <View style={styles.wrap}>
      <GoldParticles count={16} style={styles.particles} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.logo}>
          <BrandMark layout="inline" />
        </View>
        <View style={styles.center}>
          <Animated.View
            style={[
              styles.halo,
              {
                opacity: halo,
                transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
              },
            ]}
          >
            <Svg width={96} height={96} viewBox="0 0 96 96">
              <Circle cx={48} cy={48} r={45} stroke={colors.accentGoldBright} strokeWidth={2.5} fill="rgba(240,195,107,0.05)" />
              <AnimatedPath
                d="M31 49 L43 61 L66 36"
                stroke={colors.accentGoldBright}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={`${CHECK_LENGTH * 1.2}`}
                strokeDashoffset={draw.interpolate({ inputRange: [0, 1], outputRange: [CHECK_LENGTH * 1.2, 0] })}
              />
            </Svg>
          </Animated.View>

          <AnimatedWords
            text={t('compteCree.title')}
            delay={reduceMotion ? 0 : 850}
            stagger={80}
            fromScale={0.9}
            align="center"
            gap={7}
            accessibilityRole="header"
            style={styles.title}
          />
          <View style={styles.textWrap}>
            <AnimatedWords
              text={t('compteCree.body')}
              delay={reduceMotion ? 0 : 1250}
              stagger={30}
              duration={420}
              rise={8}
              align="center"
              gap={4}
              style={styles.text}
            />
          </View>
        </View>

        <View style={styles.frieze}>
          <MotifFrieze width={360} height={20} opacity={0.5} />
        </View>

        <View style={styles.bottom}>
          <PillButton label={t('common.continue')} onPress={() => router.replace('/onboarding/mfa-proposal')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  particles: { top: '-20%' },
  safe: { flex: 1 },
  logo: { paddingTop: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  halo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.07)',
    shadowColor: '#F0C36B',
    shadowOpacity: 0.55,
    shadowRadius: 26,
    marginBottom: 30,
  },
  title: { fontFamily: typography.display, fontSize: 30, lineHeight: 36, color: colors.textHeading, textAlign: 'center' },
  textWrap: { marginTop: 10 },
  text: {
    fontFamily: typography.body,
    fontSize: 17,
    lineHeight: 25,
    color: colors.textBody,
    textAlign: 'center',
  },
  frieze: { alignItems: 'center', marginBottom: 26, overflow: 'hidden' },
  bottom: { paddingHorizontal: 24, paddingBottom: 18 },
});
