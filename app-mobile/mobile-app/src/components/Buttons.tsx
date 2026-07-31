import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radii, spacing, typography } from '../theme/tokens';

export function GoldButton({
  label,
  onPress,
  muted = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  /** État "média à produire" : bouton visible mais visuellement atténué, jamais retiré. */
  muted?: boolean;
  /** Bloque l'appui — utilisé pour empêcher une double soumission (ex. pendant un enregistrement réseau). */
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.wrapper, disabled && styles.wrapperDisabled]}>
      <LinearGradient
        colors={muted ? ['#4a4238', '#3a332b'] : [...colors.ctaGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Text style={[styles.label, muted && styles.labelMuted]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.outline}>
      <Text style={styles.outlineLabel}>{label}</Text>
    </Pressable>
  );
}

/** Bouton secondaire "fantôme" (bordure or, fond transparent) — ex. "Retour à la fiche" en fin de lecture. */
export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.ghost}>
      <Text style={styles.ghostLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.button,
    overflow: 'hidden',
  },
  wrapperDisabled: {
    opacity: 0.6,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.ctaTextOnGold,
  },
  labelMuted: {
    color: colors.textMuted,
  },
  outline: {
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.terracotta,
    backgroundColor: colors.terracottaBg,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.terracottaText,
  },
  ghost: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.accentGold,
  },
});
