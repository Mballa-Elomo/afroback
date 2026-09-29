import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../src/theme/tokens';
import { AnimatedTitleBlock } from '../../src/onboarding/AnimatedText';
import { useI18n } from '../../src/i18n';
import { LanguageDropdown } from '../../src/i18n/LanguageDropdown';
import { INTRO_SLIDES } from '../../src/onboarding/content';
import { hasSeenIntro } from '../../src/onboarding/introSeen';
import {
  BrandMark,
  GoldParticles,
  IllustratedBackground,
  ONBOARDING_BG,
  ONBOARDING_ILLUSTRATIONS,
  PillButton,
  useReduceMotion,
} from '../../src/onboarding/ui';
import { TextLinkButton } from '../../src/components/Buttons';

/**
 * Écrans 1 à 4 du parcours (maquette de Yannick du 2026-09-29, voir
 * app-mobile/cdc-onboarding.md) : écran du logo puis carrousel de 3 écrans.
 *
 * - Écran du logo : **aucune durée d'affichage** (demande de Yannick) — on
 *   y choisit sa langue (français / anglais, tout le parcours d'entrée est
 *   traduit) puis on appuie sur "Commencer", comme sur les autres écrans.
 *   Les illustrations se préchargent pendant ce temps.
 * - Intro déjà vue sur cet appareil (ex. après déconnexion) : "Commencer"
 *   mène directement à "Bienvenue dans ton voyage", sans repasser le carrousel.
 * - Carrousel : swipe horizontal et boutons, "Passer" toujours visible.
 * - Parallaxe : en glissant, l'image avance moins vite que l'écran et le
 *   texte plus vite (profondeur) ; chaque illustration dérive aussi
 *   lentement en continu (IllustratedBackground). Tout est coupé si
 *   "Réduire les animations" est actif.
 */

const USE_NATIVE = Platform.OS !== 'web';

// L'image avance à la moitié de la vitesse de l'écran. Aucun bord vide ne peut
// apparaître : la partie visible d'un écran qui entre ou sort est toujours
// couverte par son image (vérifié pour toute valeur ≤ 1), donc pas de zoom.
const PARALLAX = 0.5;

const FADE_OUT_MS = 380;
const FADE_IN_MS = 520;

export default function OnboardingIntroScreen() {
  const router = useRouter();
  const reduceMotion = useReduceMotion();
  const [phase, setPhase] = useState<'splash' | 'intro'>('splash');
  const [seen, setSeen] = useState<boolean | null>(null);
  // Fondu entre l'écran 1 et la suite (demande de Yannick : "transition fluide, fondu").
  const fade = useRef(new Animated.Value(1)).current;
  const leaving = useRef(false);

  useEffect(() => {
    Asset.loadAsync(Object.values(ONBOARDING_ILLUSTRATIONS)).catch(() => {});
    hasSeenIntro().then(setSeen);
  }, []);

  useEffect(() => {
    if (phase !== 'intro') return;
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: reduceMotion ? 0 : FADE_IN_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: USE_NATIVE,
    }).start();
  }, [phase, fade, reduceMotion]);

  const start = () => {
    if (leaving.current) return;
    leaving.current = true;
    // L'écran 1 s'efface vers le noir, puis la suite apparaît en fondu
    // (carrousel ici, ou "Bienvenue", déclaré en animation 'fade' dans app/_layout.tsx).
    Animated.timing(fade, {
      toValue: 0,
      duration: reduceMotion ? 0 : FADE_OUT_MS,
      easing: Easing.in(Easing.quad),
      useNativeDriver: USE_NATIVE,
    }).start(() => {
      if (seen) router.replace('/onboarding/bienvenue');
      else setPhase('intro');
    });
  };

  return (
    <View style={styles.fadeRoot}>
      <Animated.View style={[styles.fadeRoot, { opacity: fade }]}>
        {phase === 'splash' ? <Splash onStart={start} ready={seen !== null} /> : <IntroCarousel />}
      </Animated.View>
    </View>
  );
}

function Splash({ onStart, ready }: { onStart: () => void; ready: boolean }) {
  const { t } = useI18n();
  const reduceMotion = useReduceMotion();
  const appear = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const controls = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(appear, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: USE_NATIVE }),
      Animated.delay(700),
      Animated.timing(controls, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: USE_NATIVE }),
    ]).start();
  }, [appear, controls]);

  return (
    <IllustratedBackground source={ONBOARDING_ILLUSTRATIONS.splash} fadeFrom={0.5}>
      {/* Voile sombre diffus derrière le logo : le nom doré se détache du ciel doré. */}
      <LinearGradient
        colors={['rgba(11,9,6,0)', 'rgba(11,9,6,0.62)', 'rgba(11,9,6,0.62)', 'rgba(11,9,6,0)']}
        locations={[0.02, 0.2, 0.44, 0.62]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <GoldParticles count={22} />
      <SafeAreaView style={styles.splashSafe} edges={['top', 'bottom']}>
        {/* Sélecteur de langue compact (menu déroulant avec drapeaux), en haut à droite. */}
        <View style={styles.topBar}>
          <LanguageDropdown />
        </View>
        <Animated.View
          style={[
            styles.splashBrand,
            {
              opacity: appear,
              transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
            },
          ]}
        >
          <BrandMark size="xl" animated />
        </Animated.View>

        <Animated.View
          style={[
            styles.splashControls,
            {
              opacity: controls,
              transform: [{ translateY: controls.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <PillButton label={t('splash.start')} onPress={onStart} disabled={!ready} />
        </Animated.View>
      </SafeAreaView>
    </IllustratedBackground>
  );
}

function IntroCarousel() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const reduceMotion = useReduceMotion();
  const listRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;
  const [index, setIndex] = useState(0);
  const isLast = index === INTRO_SLIDES.length - 1;

  // Largeur ET hauteur explicites par écran : sans hauteur fixée, les items
  // d'une FlatList horizontale s'effondrent sur web (constaté au test du 2026-09-29).
  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goTo = (i: number) => {
    listRef.current?.scrollToOffset({ offset: i * width, animated: !reduceMotion });
    setIndex(i);
  };

  const next = () => (isLast ? router.push('/onboarding/transition') : goTo(index + 1));
  const skip = () => router.replace('/onboarding/bienvenue');

  return (
    <View style={styles.carousel} onLayout={onLayout}>
      {width > 0 && (
        <Animated.FlatList
          ref={listRef}
          data={INTRO_SLIDES}
          keyExtractor={(s) => s.key}
          extraData={`${index}-${lang}`}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          // Web : pas d'événement "momentum" fiable, on suit la position en continu.
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: Platform.OS !== 'web',
            listener:
              Platform.OS === 'web'
                ? (e: NativeSyntheticEvent<NativeScrollEvent>) => {
                    const i = Math.round(e.nativeEvent.contentOffset.x / width);
                    if (i !== index) setIndex(i);
                  }
                : undefined,
          })}
          scrollEventThrottle={16}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          renderItem={({ item, index: i }) => {
            const line1 = t(`intro.${item.key}.line1`);
            const line2 = t(`intro.${item.key}.line2`);
            const body = t(`intro.${item.key}.text`);
            const range = [(i - 1) * width, i * width, (i + 1) * width];
            // Image plus lente que l'écran, texte plus rapide : effet de profondeur.
            const parallax = reduceMotion
              ? undefined
              : {
                  transform: [
                    {
                      translateX: scrollX.interpolate({
                        inputRange: range,
                        outputRange: [-width * PARALLAX, 0, width * PARALLAX],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                };
            const textDepth = reduceMotion
              ? undefined
              : {
                  opacity: scrollX.interpolate({ inputRange: range, outputRange: [0, 1, 0], extrapolate: 'clamp' }),
                  transform: [
                    {
                      translateX: scrollX.interpolate({
                        inputRange: range,
                        outputRange: [width * 0.35, 0, -width * 0.35],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                };
            return (
              <View
                style={{ width, height }}
                accessible
                accessibilityLabel={`${t('intro.step', { n: i + 1, total: INTRO_SLIDES.length })} ${line1} ${line2}. ${body}`}
              >
                <IllustratedBackground
                  source={item.image}
                  fadeFrom={0.4}
                  imageStyle={parallax}
                >
                  <SafeAreaView style={styles.slideSafe} edges={['top', 'bottom']}>
                    <Animated.View style={[styles.slideText, textDepth]}>
                      {/* Rejoué à chaque fois que l'écran redevient celui affiché. */}
                      <AnimatedTitleBlock
                        line1={line1}
                        line2={line2}
                        body={body}
                        active={i === index}
                        delay={180}
                        size={38}
                        bodyStyle={styles.slideBody}
                      />
                    </Animated.View>
                  </SafeAreaView>
                </IllustratedBackground>
              </View>
            );
          }}
        />
      )}

      {/* Logo AFROBACK fixe en haut de chaque écran de présentation. */}
      <SafeAreaView style={styles.logoSafe} edges={['top']} pointerEvents="none">
        <BrandMark size="md" />
      </SafeAreaView>

      <SafeAreaView style={styles.controlsSafe} edges={['bottom']} pointerEvents="box-none">
        <View style={styles.controls}>
          <TextLinkButton label={t('common.skip')} onPress={skip} accessibilityLabel={t('intro.skipA11y')} />
          <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {INTRO_SLIDES.map((s, i) => (
              <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.nextWrap}>
            <PillButton
              label={isLast ? t('intro.startAdventure') : t('common.continue')}
              icon={isLast ? 'sparkle' : 'arrowRight'}
              onPress={next}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  splashSafe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  fadeRoot: {
    flex: 1,
    backgroundColor: ONBOARDING_BG,
  },
  topBar: {
    alignItems: 'flex-end',
    paddingTop: 8,
    // Le menu ouvert doit passer au-dessus du logo.
    zIndex: 10,
  },
  splashBrand: {
    marginTop: '4%',
  },
  splashControls: {
    paddingBottom: 22,
    gap: 14,
  },
  carousel: {
    flex: 1,
    backgroundColor: ONBOARDING_BG,
  },
  slideSafe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideText: {
    paddingHorizontal: 26,
    // Laisse la place à la barre de contrôles fixe (Passer / points / Continuer).
    paddingBottom: 108,
  },
  slideBody: {
    fontSize: 19,
    lineHeight: 28,
  },
  logoSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 14,
  },
  controlsSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 22,
    gap: 12,
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(237,227,212,.28)',
  },
  dotActive: {
    backgroundColor: colors.accentGoldBright,
  },
  nextWrap: {
    minWidth: 128,
  },
});
