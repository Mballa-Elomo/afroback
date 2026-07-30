import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldButton } from '../../src/components/Buttons';
import { colors, typography } from '../../src/theme/tokens';

/**
 * Splash/onboarding — 3 slides. La maquette Claude Design (`AFROBACK
 * Mobile.dc.html`) utilise une scène three.js (canvas WebGL) pour l'animation
 * d'intro : ce contenu précis (géométrie, shaders) n'a pas pu être récupéré
 * (fichier de maquette tronqué à 256 Kio côté outil de lecture, cette section
 * tombait après la coupure). Le layout, les couleurs, la typographie et la
 * structure (logo, titre, texte, pagination, boutons) restent fidèles à la
 * maquette ; l'animation est remplacée par un halo pulsé + anneau rotatif en
 * pur React Native (Animated), sans dépendance WebGL supplémentaire — à
 * remplacer par une vraie scène 3D (expo-gl + three.js) si Yannick veut la
 * fidélité exacte du prototype sur ce point précis.
 */

const SLIDES = [
  {
    title: 'Retour aux origines',
    text: "Découvre les récits vrais des héros qui ont façonné l'Afrique, racontés comme des légendes.",
  },
  {
    title: 'Une culture vivante',
    text: "Villages, traditions, langues, savoirs : explore les richesses d'un continent trop souvent réduit au silence.",
  },
  {
    title: 'Raconte-toi, toi aussi',
    text: 'Écoute, apprends, partage. Crée ton compte pour commencer ton retour aux origines.',
  },
];

export default function OnboardingIntroScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;

  const goLogin = () => router.replace('/onboarding/login');

  const next = () => {
    if (isLast) {
      goLogin();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.glowBlob} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.brand}>AFROBACK</Text>

          <OnboardingMotif />

          <View style={styles.spacer} />

          <View>
            <Text style={styles.title}>{SLIDES[step].title}</Text>
            <Text style={styles.text}>{SLIDES[step].text}</Text>
          </View>

          <View style={styles.spacer} />

          <View style={styles.bottom}>
            <View style={styles.dots}>
              {SLIDES.map((_, i) => (
                <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
              ))}
            </View>
            <GoldButton label={isLast ? 'Commencer' : 'Suivant'} onPress={next} />
            <Pressable onPress={goLogin} style={styles.skip}>
              <Text style={styles.skipLabel}>Passer l'introduction</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

/** Halo pulsé + anneau rotatif, tient lieu de scène 3D (voir note en tête de fichier). */
function OnboardingMotif() {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 14000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.motifWrap}>
      <Animated.View style={[styles.motifGlow, { opacity, transform: [{ scale }] }]} />
      <Animated.View style={[styles.motifRing, { transform: [{ rotate: spin }] }]}>
        {Array.from({ length: 10 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.motifDot,
              {
                transform: [
                  { rotate: `${(360 / 10) * i}deg` },
                  { translateY: -78 },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.backgroundPlayerTo,
  },
  glowBlob: {
    position: 'absolute',
    left: '50%',
    bottom: -180,
    marginLeft: -190,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(210,120,45,.18)',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 24,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  brand: {
    fontFamily: typography.displayExtraBold,
    letterSpacing: 3.5,
    fontSize: 13,
    color: colors.accentGoldBright,
    marginTop: 12,
  },
  motifWrap: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(240,195,107,.28)',
  },
  motifRing: {
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accentGold,
  },
  spacer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 27,
    color: colors.textHeading,
    textAlign: 'center',
    lineHeight: 31,
  },
  text: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textQuote,
    textAlign: 'center',
    marginTop: 14,
    maxWidth: 275,
    alignSelf: 'center',
  },
  bottom: {
    width: '100%',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.placeholderStripeLight,
  },
  dotActive: {
    backgroundColor: colors.accentGold,
  },
  skip: {
    marginTop: 14,
    alignItems: 'center',
  },
  skipLabel: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
  },
});
