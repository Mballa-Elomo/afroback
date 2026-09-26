import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GoldButton } from '../../src/components/Buttons';
import { OnboardingScene3D } from '../../src/components/OnboardingScene3D';
import { colors, typography } from '../../src/theme/tokens';

/**
 * Splash/onboarding — refonte du 2026-09-26, fidèle au markup verbatim de
 * la maquette (`AFROBACK Mobile.dc.html`, section `<!-- ==== ONBOARDING
 * (3D) ==== -->`, lignes 68-93, lue via DesignSync le même jour) : fond en
 * dégradé chaud montant du bas de l'écran, halo, logo, wordmark, et une
 * zone de scène 3D (`<canvas id="afb-onb">` dans la maquette) entre le logo
 * et le titre.
 *
 * **Vraie scène 3D** (demande explicite de Yannick, pas une imitation 2D) :
 * `expo-gl` + `three.js`, voir `src/components/OnboardingScene3D.tsx` — le
 * script exact de la maquette (WebGL/Three.js chargé via CDN) est hors de
 * portée de la lecture à 256 Kio de `AFROBACK Mobile.dc.html`, remplacé par
 * une composition originale cohérente avec l'identité de marque (particules
 * dorées, anneaux filaires, cœur lumineux pulsé) plutôt qu'une copie du
 * script introuvable.
 *
 * Simplification assumée restante : **wordmark en dégradé texte**
 * (`background-clip:text` CSS, non supporté nativement par RN sans
 * `@react-native-masked-view`, pas ajouté) — approximé par une couleur
 * pleine, le ton le plus clair du dégradé (`accentGoldPale`).
 */

// Couleurs extraites verbatim de cette section de la maquette — pas encore
// dans theme/tokens.ts (qui vient d'autres écrans), locales à ce fichier.
const MOCKUP = {
  gradientTop: '#0d0805',
  gradientMidLow: '#160d06',
  gradientMidHigh: '#3a1d0a',
  gradientBottom: '#7a3d12',
  bodyText: '#E7D6BE',
};

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
  const next = () => (isLast ? goLogin() : setStep((s) => s + 1));

  return (
    <View style={styles.wrap}>
      {/* Dégradé radial(150% 70% at 50% 118%, ...) approximé par un dégradé
          vertical — RN n'a pas de radial-gradient natif, la lecture visuelle
          (sombre en haut, chaud en bas) reste fidèle sur un écran portrait. */}
      <LinearGradient
        colors={[MOCKUP.gradientTop, MOCKUP.gradientMidLow, MOCKUP.gradientMidHigh, MOCKUP.gradientBottom]}
        locations={[0, 0.42, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowBlob} pointerEvents="none" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logoGlow} />
            <Image source={require('../../assets/icon.png')} style={styles.logo} />
          </View>
          <Text style={styles.brand}>AFROBACK</Text>

          <OnboardingScene3D height={250} />

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


const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: MOCKUP.gradientTop,
    overflow: 'hidden',
  },
  glowBlob: {
    position: 'absolute',
    left: '50%',
    bottom: -180,
    width: 380,
    height: 380,
    marginLeft: -190,
    borderRadius: 190,
    backgroundColor: 'rgba(255,205,120,.22)',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 34,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(240,195,107,.3)',
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
  },
  brand: {
    fontFamily: typography.displayExtraBold,
    fontSize: 13,
    letterSpacing: 2.9,
    color: colors.accentGoldPale,
    marginTop: 12,
  },
  spacer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 27,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 31,
    textAlign: 'center',
    maxWidth: 290,
    textShadowColor: 'rgba(0,0,0,.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 18,
  },
  text: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 22,
    color: MOCKUP.bodyText,
    textAlign: 'center',
    maxWidth: 275,
    marginTop: 14,
    alignSelf: 'center',
    textShadowColor: 'rgba(0,0,0,.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
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
    backgroundColor: 'rgba(240,195,107,.25)',
  },
  dotActive: {
    backgroundColor: colors.accentGold,
  },
  skip: {
    alignItems: 'center',
    marginTop: 14,
  },
  skipLabel: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMutedAlt,
  },
});
