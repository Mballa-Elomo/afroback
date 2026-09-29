import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import { colors, typography } from '../theme/tokens';
import { useReduceMotion } from './useReduceMotion';

/**
 * Texte animé de l'onboarding (demande de Yannick du 2026-09-29 : "je veux
 * vraiment que le texte ait une animation dynamique"). Chaque mot apparaît
 * l'un après l'autre (fondu + glissement vers le haut), comme une parole
 * qu'on déroule — l'esprit du griot. La ligne dorée des titres arrive en
 * dernier avec un léger zoom et un halo doré.
 *
 * - `active` : l'animation se rejoue chaque fois qu'il repasse à true (ex.
 *   écran du carrousel qui redevient visible) ; à false, le texte est
 *   remis à zéro pour pouvoir être rejoué.
 * - "Réduire les animations" : texte affiché d'un coup, sans mouvement.
 * - Lecteur d'écran : le bloc est lu d'une traite (`accessibilityLabel`),
 *   jamais mot par mot.
 */

const USE_NATIVE = Platform.OS !== 'web';

interface AnimatedWordsProps {
  text: string;
  style: StyleProp<TextStyle>;
  active?: boolean;
  /** Délai avant le premier mot (ms). */
  delay?: number;
  /** Écart entre deux mots (ms). */
  stagger?: number;
  duration?: number;
  /** Distance de glissement vertical (px). */
  rise?: number;
  /** Zoom de départ (1 = aucun). */
  fromScale?: number;
  align?: 'left' | 'center';
  /** Espace entre les mots (px). */
  gap?: number;
  accessibilityRole?: 'header' | 'text';
}

export function AnimatedWords({
  text,
  style,
  active = true,
  delay = 0,
  stagger = 60,
  duration = 520,
  rise = 16,
  fromScale = 1,
  align = 'left',
  gap = 6,
  accessibilityRole = 'text',
}: AnimatedWordsProps) {
  const reduceMotion = useReduceMotion();
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const values = useRef<Animated.Value[]>([]);
  if (values.current.length !== words.length) {
    values.current = words.map(() => new Animated.Value(0));
  }

  useEffect(() => {
    const vals = values.current;
    if (reduceMotion) {
      vals.forEach((v) => v.setValue(active ? 1 : 0));
      return;
    }
    if (!active) {
      vals.forEach((v) => v.setValue(0));
      return;
    }
    vals.forEach((v) => v.setValue(0));
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.stagger(
        stagger,
        vals.map((v) =>
          Animated.timing(v, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: USE_NATIVE })
        )
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [active, reduceMotion, delay, stagger, duration, words]);

  return (
    <View
      style={[styles.row, { justifyContent: align === 'center' ? 'center' : 'flex-start', columnGap: gap }]}
      accessible
      accessibilityRole={accessibilityRole}
      accessibilityLabel={text}
    >
      {words.map((w, i) => {
        const v = values.current[i];
        return (
          <Animated.Text
            key={`${w}-${i}`}
            importantForAccessibility="no"
            style={[
              style,
              {
                opacity: v,
                transform: [
                  { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] }) },
                  { scale: v.interpolate({ inputRange: [0, 1], outputRange: [fromScale, 1] }) },
                ],
              },
            ]}
          >
            {w}
          </Animated.Text>
        );
      })}
    </View>
  );
}

/** Durée totale (ms) d'un AnimatedWords, pour enchaîner le bloc suivant. */
export function wordsDuration(text: string, stagger = 60, duration = 520): number {
  const n = text.split(/\s+/).filter(Boolean).length;
  return Math.max(0, n - 1) * stagger + duration;
}

/**
 * Titre deux lignes animé (1re ligne blanc cassé, 2e ligne or avec zoom et
 * halo), suivi optionnellement d'un paragraphe animé plus vite.
 */
export function AnimatedTitleBlock({
  line1,
  line2,
  body,
  active = true,
  align = 'left',
  size = 32,
  delay = 0,
  bodyStyle,
}: {
  line1: string;
  line2: string;
  body?: string;
  active?: boolean;
  align?: 'left' | 'center';
  size?: number;
  delay?: number;
  bodyStyle?: StyleProp<TextStyle>;
}) {
  const lineHeight = Math.round(size * 1.18);
  const titleStagger = 70;
  const line2Delay = delay + wordsDuration(line1, titleStagger, 520) - 260;
  const bodyDelay = line2Delay + wordsDuration(line2, titleStagger, 600) - 250;
  return (
    <View>
      <View accessible accessibilityRole="header" accessibilityLabel={`${line1} ${line2}`}>
        <AnimatedWords
          text={line1}
          active={active}
          delay={delay}
          stagger={titleStagger}
          align={align}
          gap={size * 0.26}
          style={[styles.title, { fontSize: size, lineHeight }]}
        />
        <AnimatedWords
          text={line2}
          active={active}
          delay={line2Delay}
          stagger={titleStagger}
          duration={600}
          fromScale={0.86}
          rise={10}
          align={align}
          gap={size * 0.26}
          style={[styles.title, styles.titleGold, { fontSize: size, lineHeight }]}
        />
      </View>
      {!!body && (
        <View style={styles.bodyWrap}>
          <AnimatedWords
            text={body}
            active={active}
            delay={bodyDelay}
            stagger={22}
            duration={420}
            rise={8}
            align={align}
            gap={4}
            style={[styles.body, align === 'center' && { textAlign: 'center' }, bodyStyle]}
          />
        </View>
      )}
    </View>
  );
}

/** "AFROBACK" lettre par lettre, pour le splash. */
export function AnimatedLetters({
  text,
  style,
  delay = 0,
  stagger = 70,
}: {
  text: string;
  style: StyleProp<TextStyle>;
  delay?: number;
  stagger?: number;
}) {
  const reduceMotion = useReduceMotion();
  const letters = useMemo(() => text.split(''), [text]);
  const values = useRef(letters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (reduceMotion) {
      values.forEach((v) => v.setValue(1));
      return;
    }
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.stagger(
        stagger,
        values.map((v) =>
          Animated.timing(v, { toValue: 1, duration: 480, easing: Easing.out(Easing.back(1.6)), useNativeDriver: USE_NATIVE })
        )
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [values, reduceMotion, delay, stagger]);

  return (
    <View style={styles.letters} accessible accessibilityLabel={text}>
      {letters.map((l, i) => (
        <Animated.Text
          key={i}
          importantForAccessibility="no"
          style={[
            style,
            {
              opacity: values[i],
              transform: [
                { translateY: values[i].interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                { scale: values[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
              ],
            },
          ]}
        >
          {l}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  letters: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.display,
    color: colors.textHeading,
    textShadowColor: 'rgba(0,0,0,.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 14,
  },
  titleGold: {
    color: colors.accentGoldBright,
    textShadowColor: 'rgba(240,195,107,.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  bodyWrap: {
    marginTop: 14,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.textBody,
    textShadowColor: 'rgba(0,0,0,.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
