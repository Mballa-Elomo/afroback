import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../theme/tokens';
import { useReduceMotion } from '../onboarding/useReduceMotion';
import { Icon, type IconName } from './Icons';

/**
 * Boutons de l'app — refonte du 2026-09-29 (Yannick : boutons jugés
 * "basiques", demande de boutons modernes avec icônes).
 *
 * Bouton principal (`PremiumButton`, et `GoldButton` qui s'appuie dessus) :
 * dégradé or avec reflet lumineux en haut (volume), halo doré diffus,
 * pastille ronde sombre à droite portant une icône (flèche par défaut),
 * reflet qui traverse le bouton toutes les quelques secondes, léger
 * enfoncement au toucher avec l'icône qui glisse. Variante `glass` : verre
 * sombre, fin contour doré, icône à gauche. Tout mouvement est coupé si
 * "Réduire les animations" est actif.
 */

const USE_NATIVE = Platform.OS !== 'web';

export function PremiumButton({
  label,
  onPress,
  icon = 'arrowRight',
  variant = 'gold',
  size = 'lg',
  disabled = false,
  loading = false,
  shimmer = true,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  /** `null` : pas d'icône. */
  icon?: IconName | null;
  variant?: 'gold' | 'glass';
  size?: 'md' | 'lg';
  disabled?: boolean;
  /** Remplace l'icône par un indicateur de chargement. */
  loading?: boolean;
  /** Reflet qui traverse le bouton (bouton principal d'un écran uniquement). */
  shimmer?: boolean;
  accessibilityHint?: string;
}) {
  const reduceMotion = useReduceMotion();
  const press = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const [width, setWidth] = useState(0);
  const height = size === 'lg' ? 56 : 46;
  const gold = variant === 'gold';
  const showShimmer = gold && shimmer && !disabled && !reduceMotion && width > 0;

  useEffect(() => {
    if (!showShimmer) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(sweep, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: USE_NATIVE }),
        Animated.timing(sweep, { toValue: 0, duration: 0, useNativeDriver: USE_NATIVE }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [showShimmer, sweep]);

  const animatePress = (to: number) =>
    Animated.spring(press, { toValue: to, useNativeDriver: USE_NATIVE, speed: 40, bounciness: 4 }).start();

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const iconColor = gold ? colors.accentGoldPale : colors.accentGoldPale;
  const iconSize = size === 'lg' ? 18 : 16;

  const iconNode = loading ? (
    <ActivityIndicator size="small" color={colors.accentGoldPale} />
  ) : icon ? (
    <Animated.View style={{ transform: [{ translateX: press.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) }] }}>
      <Icon name={icon} size={iconSize} color={iconColor} />
    </Animated.View>
  ) : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      onPressIn={() => animatePress(1)}
      onPressOut={() => animatePress(0)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      <Animated.View
        onLayout={onLayout}
        style={[
          gold ? styles.goldGlow : null,
          (disabled || loading) && styles.dimmed,
          { borderRadius: height / 2, transform: [{ scale: press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }) }] },
        ]}
      >
        {gold ? (
          <LinearGradient
            colors={['#FBE3A4', '#F0C36B', '#C8913F']}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.surface, { height, borderRadius: height / 2 }]}
          >
            {/* Reflet lumineux sur la moitié haute : donne du volume. */}
            <LinearGradient
              colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
              style={[styles.sheen, { height: height / 2, borderTopLeftRadius: height / 2, borderTopRightRadius: height / 2 }]}
              pointerEvents="none"
            />
            {showShimmer && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmer,
                  {
                    height: height * 2,
                    transform: [
                      { translateX: sweep.interpolate({ inputRange: [0, 1], outputRange: [-80, width + 40] }) },
                      { rotate: '20deg' },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            )}
            {icon || loading ? <View style={{ width: height - 12 }} /> : null}
            <Text style={[styles.goldLabel, size === 'md' && styles.labelMd]} numberOfLines={1}>
              {label}
            </Text>
            {icon || loading ? (
              <View style={[styles.iconDisc, { width: height - 12, height: height - 12, borderRadius: (height - 12) / 2 }]}>
                {iconNode}
              </View>
            ) : null}
          </LinearGradient>
        ) : (
          <View style={[styles.surface, styles.glass, { height, borderRadius: height / 2 }]}>
            {iconNode ? <View style={styles.glassIcon}>{iconNode}</View> : null}
            <Text style={[styles.glassLabel, size === 'md' && styles.labelMd]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

/**
 * Bouton doré historique de l'app (mêmes props qu'avant), désormais rendu
 * avec le style premium, en taille compacte et sans reflet animé (il apparaît
 * souvent plusieurs fois par écran). `icon` optionnel.
 */
export function GoldButton({
  label,
  onPress,
  muted = false,
  disabled = false,
  icon = null,
}: {
  label: string;
  onPress: () => void;
  /** État "média à produire" : bouton visible mais visuellement atténué, jamais retiré. */
  muted?: boolean;
  /** Bloque l'appui — utilisé pour empêcher une double soumission (ex. pendant un enregistrement réseau). */
  disabled?: boolean;
  icon?: IconName | null;
}) {
  if (muted) {
    return (
      <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}>
        <View style={[styles.surface, styles.muted]}>
          <Text style={[styles.glassLabel, styles.labelMd, styles.mutedLabel]}>{label}</Text>
        </View>
      </Pressable>
    );
  }
  return <PremiumButton label={label} onPress={onPress} disabled={disabled} icon={icon} size="md" shimmer={false} />;
}

/** Bouton secondaire terre cuite (ex. "▶ Écouter" sur la fiche héros) — pastille arrondie, contour fin. */
export function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.outline, pressed && styles.outlinePressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.outlineLabel}>{label}</Text>
    </Pressable>
  );
}

/** Bouton secondaire "verre" (bordure or, fond sombre translucide) — ex. "Retour à la fiche" en fin de lecture. */
export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <PremiumButton label={label} onPress={onPress} variant="glass" icon={null} size="md" />;
}

/** Lien texte avec chevron (ex. "Passer"), sans soulignement. */
export function TextLinkButton({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={14}
      style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text style={styles.linkLabel}>{label}</Text>
      <Icon name="chevronRight" size={14} color={colors.textBodyAlt} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  goldGlow: {
    shadowColor: '#F0C36B',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  dimmed: {
    opacity: 0.55,
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 6,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  shimmer: {
    position: 'absolute',
    top: -30,
    left: 0,
    width: 46,
  },
  goldLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.bodyExtraBold,
    fontSize: 16,
    letterSpacing: 0.3,
    color: colors.ctaTextOnGold,
    paddingHorizontal: 8,
  },
  labelMd: {
    fontSize: 14,
  },
  iconDisc: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,17,9,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,236,190,0.35)',
  },
  glass: {
    borderWidth: 1.2,
    borderColor: 'rgba(240,195,107,0.5)',
    backgroundColor: 'rgba(24,17,11,0.72)',
    paddingHorizontal: 20,
    gap: 10,
  },
  glassIcon: {
    marginLeft: -4,
  },
  glassLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.accentGoldPale,
    textAlign: 'center',
  },
  muted: {
    height: 46,
    borderRadius: 23,
    backgroundColor: '#3a332b',
    paddingHorizontal: 18,
  },
  mutedLabel: {
    color: colors.textMuted,
  },
  outline: {
    minHeight: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.terracotta,
    backgroundColor: colors.terracottaBg,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinePressed: {
    backgroundColor: colors.terracottaBgStrong,
  },
  outlineLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.terracottaText,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  linkLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.textBodyAlt,
  },
});
