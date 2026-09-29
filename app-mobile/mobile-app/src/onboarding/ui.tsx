import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, typography } from '../theme/tokens';
import { AnimatedLetters } from './AnimatedText';
import { PremiumButton } from '../components/Buttons';
import type { IconName } from '../components/Icons';
import { useReduceMotion } from './useReduceMotion';
import { useI18n } from '../i18n';

/**
 * Briques visuelles du parcours onboarding → création de compte (Module 1,
 * `app-mobile/cdc-onboarding.md`), tirées de la maquette 10 écrans fournie
 * par Yannick le 2026-09-29 : illustration plein écran assombrie vers le
 * bas, titre sur deux lignes (blanc cassé + or), bouton pilule or, frise de
 * motifs géométriques en bordure, particules dorées.
 *
 * Titres en Cinzel (décision D7 : cohérence avec le reste de l'app), pas la
 * sans-serif arrondie de la maquette. Tout ce qui bouge respecte le réglage
 * système "Réduire les animations" (`useReduceMotion`).
 */

export const ONBOARDING_ILLUSTRATIONS = {
  splash: require('../../assets/onboarding/splash.jpg'),
  racines: require('../../assets/onboarding/racines.jpg'),
  histoires: require('../../assets/onboarding/histoires.jpg'),
  transmettre: require('../../assets/onboarding/transmettre.jpg'),
  voyage: require('../../assets/onboarding/voyage.jpg'),
  bienvenue: require('../../assets/onboarding/bienvenue.jpg'),
} as const;

/** Fond de la maquette, légèrement plus profond que `colors.background`. */
export const ONBOARDING_BG = '#0B0906';

export { useReduceMotion };

const USE_NATIVE = Platform.OS !== 'web';

/**
 * Illustration plein écran + dégradé vers le noir sous le texte (lisibilité
 * WCAG garantie quel que soit le recadrage). `cover` : l'image est recadrée
 * sur les côtés sur les écrans plus allongés que 9:16, jamais déformée.
 */
export function IllustratedBackground({
  source,
  fadeFrom = 0.42,
  children,
  imageStyle,
  parallaxRoom = 0,
  drift = true,
}: {
  source: ImageSourcePropType;
  /** Position (0-1) où le dégradé commence à assombrir l'image. */
  fadeFrom?: number;
  children?: ReactNode;
  /** Transformations externes (ex. parallaxe du carrousel). */
  imageStyle?: StyleProp<ViewStyle>;
  /**
   * Marge d'image de chaque côté (fraction de la largeur) pour que la
   * parallaxe du carrousel ne découvre jamais le bord de l'image.
   */
  parallaxRoom?: number;
  /** Mouvement lent et continu façon caméra (zoom + léger déplacement). */
  drift?: boolean;
}) {
  const reduceMotion = useReduceMotion();
  const t = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (reduceMotion || !drift) {
      t.setValue(0.5);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE }),
        Animated.timing(t, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, reduceMotion, drift]);

  const room = parallaxRoom > 0 ? (`${-parallaxRoom * 100}%` as DimensionValue) : 0;
  return (
    <View style={styles.bgWrap}>
      <Animated.View style={[styles.imageBox, { left: room, right: room }, imageStyle]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [
                { scale: t.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1.22] }) },
                { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [-16, 16] }) },
                { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [14, -14] }) },
              ],
            },
          ]}
        >
          <Image source={source} style={styles.bgImage} resizeMode="cover" accessibilityIgnoresInvertColors />
        </Animated.View>
      </Animated.View>
      <LinearGradient
        // Haut assombri : le logo reste lisible même sur un ciel clair (constaté au test du 2026-09-29).
        colors={['rgba(11,9,6,0.7)', 'rgba(11,9,6,0)', 'rgba(11,9,6,0.55)', ONBOARDING_BG]}
        locations={[0, 0.24, fadeFrom + 0.16, fadeFrom + 0.34 > 1 ? 1 : fadeFrom + 0.34]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const BRAND_SIZES = {
  sm: { logo: 46, word: 17, tagline: 11 },
  md: { logo: 64, word: 24, tagline: 13 },
  lg: { logo: 92, word: 34, tagline: 15 },
  // Splash (demande de Yannick : logo "plus gros et vraiment prononcé", texte "vraiment gros").
  xl: { logo: 136, word: 42, tagline: 19 },
} as const;

/**
 * Logo AFROBACK : médaillon + "AFROBACK" + "Retour aux origines".
 * - `layout="inline"` : version compacte (médaillon + nom sur une ligne) pour
 *   le haut des écrans de formulaire — le logo figure sur chaque écran du
 *   parcours (demande de Yannick du 2026-09-29).
 * - `animated` : lettres une à une et halo doré pulsé (splash).
 */
export function BrandMark({
  size = 'md',
  animated = false,
  layout = 'stacked',
}: {
  size?: keyof typeof BRAND_SIZES;
  animated?: boolean;
  layout?: 'stacked' | 'inline';
}) {
  const reduceMotion = useReduceMotion();
  const { t } = useI18n();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animated || reduceMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animated, reduceMotion, pulse]);

  if (layout === 'inline') {
    return (
      <View style={styles.brandInline} accessible accessibilityLabel="AFROBACK">
        <View style={[styles.logoRing, { width: 38, height: 38, borderRadius: 19 }]}>
          <Image source={require('../../assets/icon.png')} style={{ width: 32, height: 32, borderRadius: 16 }} />
        </View>
        <Text style={[styles.wordmark, styles.wordmarkInline]}>AFROBACK</Text>
      </View>
    );
  }

  const { logo, word, tagline } = BRAND_SIZES[size];
  const ring = logo + Math.round(logo * 0.12);
  return (
    <View style={styles.brand} accessible accessibilityLabel={`AFROBACK, ${t('brand.tagline')}`}>
      <View style={{ width: ring, height: ring, alignItems: 'center', justifyContent: 'center' }}>
        {animated && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                width: ring * 1.7,
                height: ring * 1.7,
                borderRadius: ring * 0.85,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.8] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) }],
              },
            ]}
          />
        )}
        <View
          style={[
            styles.logoRing,
            { width: ring, height: ring, borderRadius: ring / 2, borderWidth: size === 'xl' ? 2.5 : 1.5 },
          ]}
        >
          {/* Logo actuel en médaillon : la version dorée sur fond transparent de la
              maquette n'a pas encore été fournie (cdc-onboarding.md, section 7). */}
          <Image
            source={require('../../assets/icon.png')}
            style={{ width: logo, height: logo, borderRadius: logo / 2 }}
          />
        </View>
      </View>
      {animated ? (
        // Lettre par lettre (splash) : l'espacement passe en marge, chaque lettre étant un élément séparé.
        <AnimatedLetters
          text="AFROBACK"
          delay={250}
          style={[styles.wordmark, styles.wordmarkStrong, { fontSize: word, marginHorizontal: word * 0.04, marginTop: word * 0.45 }]}
        />
      ) : (
        <Text style={[styles.wordmark, { fontSize: word, letterSpacing: word * 0.12, marginTop: word * 0.45 }]}>
          AFROBACK
        </Text>
      )}
      <Text style={[styles.tagline, { fontSize: tagline, letterSpacing: tagline * 0.06 }]}>{t('brand.tagline')}</Text>
    </View>
  );
}

/**
 * Bouton du parcours d'entrée : style premium partagé avec le reste de l'app
 * (`PremiumButton`, src/components/Buttons.tsx — refonte du 2026-09-29).
 * `outline` = variante verre sombre. Icône : flèche par défaut.
 */
export function PillButton({
  label,
  onPress,
  variant = 'gold',
  disabled = false,
  loading = false,
  icon,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: 'gold' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName | null;
  accessibilityHint?: string;
}) {
  return (
    <PremiumButton
      label={label}
      onPress={onPress}
      variant={variant === 'gold' ? 'gold' : 'glass'}
      icon={icon === undefined ? (variant === 'gold' ? 'arrowRight' : null) : icon}
      disabled={disabled}
      loading={loading}
      shimmer={variant === 'gold'}
      accessibilityHint={accessibilityHint}
    />
  );
}

/**
 * Frise géométrique (losanges et triangles) en bronze, dessinée pour
 * AFROBACK — pas la copie d'un motif existant. Toujours en bordure, jamais
 * sous du texte.
 */
export function MotifFrieze({ width = 240, height = 18, opacity = 0.55 }: { width?: number; height?: number; opacity?: number }) {
  const unit = height * 1.6;
  const count = Math.ceil(width / unit);
  const d = useMemo(() => {
    let path = '';
    for (let i = 0; i < count; i++) {
      const x = i * unit;
      const mid = x + unit / 2;
      // losange central
      path += `M${mid} 1 L${mid + height / 2.4} ${height / 2} L${mid} ${height - 1} L${mid - height / 2.4} ${height / 2} Z `;
      // triangles de liaison, haut et bas
      path += `M${x} 1 L${x + unit / 5} 1 L${x} ${height / 3} Z M${x} ${height - 1} L${x + unit / 5} ${height - 1} L${x} ${(height * 2) / 3} Z `;
    }
    return path;
  }, [count, unit, height]);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ opacity }} pointerEvents="none">
      <Path d={d} stroke="#B98343" strokeWidth={1.1} fill="none" />
    </Svg>
  );
}

interface Particle {
  x: number;
  y: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
}

/**
 * Particules dorées qui montent lentement — animations natives légères
 * (`Animated`, pilote natif), remplacent la scène three.js de l'ancienne
 * maquette (retirée : lourde, jamais testée sur un vrai téléphone). Rien
 * n'est rendu si "Réduire les animations" est activé.
 */
export function GoldParticles({ count = 18, style }: { count?: number; style?: StyleProp<ViewStyle> }) {
  const reduceMotion = useReduceMotion();
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: pseudoRandom(i * 3.1) * 100,
        y: 35 + pseudoRandom(i * 7.7) * 60,
        size: 2 + pseudoRandom(i * 1.3) * 3,
        drift: (pseudoRandom(i * 5.9) - 0.5) * 30,
        duration: 3800 + pseudoRandom(i * 2.2) * 3200,
        delay: pseudoRandom(i * 4.4) * 2500,
      })),
    [count]
  );
  if (reduceMotion) return null;
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      {particles.map((p, i) => (
        <FloatingParticle key={i} p={p} />
      ))}
    </View>
  );
}

function FloatingParticle({ p }: { p: Particle }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(t, { toValue: 1, duration: p.duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [t, p]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${p.x}%`,
        top: `${p.y}%`,
        width: p.size,
        height: p.size,
        borderRadius: p.size / 2,
        backgroundColor: '#F7D98B',
        shadowColor: '#F0C36B',
        shadowOpacity: 0.9,
        shadowRadius: 4,
        opacity: t.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 0.9, 0.6, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) },
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
        ],
      }}
    />
  );
}

/** Déterministe (pas de Math.random) : mêmes positions à chaque rendu, pas de saut visuel. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const styles = StyleSheet.create({
  bgWrap: {
    flex: 1,
    backgroundColor: ONBOARDING_BG,
    overflow: 'hidden',
  },
  imageBox: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  brand: {
    alignItems: 'center',
  },
  logoRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(240,195,107,.65)',
    backgroundColor: 'rgba(240,195,107,.12)',
    shadowColor: '#F0C36B',
    shadowOpacity: 0.5,
    shadowRadius: 18,
  },
  brandInline: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
  },
  // Ombre plus marquée : le nom doré reste lisible sur le ciel doré du splash.
  wordmarkStrong: {
    textShadowColor: 'rgba(0,0,0,.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 18,
  },
  wordmarkInline: {
    fontSize: 18,
    letterSpacing: 2.4,
  },
  halo: {
    position: 'absolute',
    backgroundColor: 'rgba(240,195,107,.28)',
    shadowColor: '#F0C36B',
    shadowOpacity: 0.9,
    shadowRadius: 40,
  },
  wordmark: {
    fontFamily: typography.displayExtraBold,
    color: colors.accentGoldBright,
    textShadowColor: 'rgba(0,0,0,.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  tagline: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12.5,
    color: colors.textQuote,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
