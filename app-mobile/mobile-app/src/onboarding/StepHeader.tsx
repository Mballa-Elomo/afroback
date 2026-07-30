import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../theme/tokens';

/** En-tête commun des écrans de l'assistant post-inscription : retour + "ÉTAPE X / 5" + barre de progression. */
export function StepHeader({ step, total = 5, onBack }: { step: number; total?: number; onBack: () => void }) {
  return (
    <>
      <Pressable onPress={onBack} hitSlop={10} style={styles.back}>
        <Text style={styles.backIcon}>‹</Text>
      </Pressable>
      <View style={styles.row}>
        <Text style={styles.label}>
          ÉTAPE {step} / {total}
        </Text>
        <View style={styles.track}>
          <LinearGradient
            colors={[...colors.ctaGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${(step / total) * 100}%` }]}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  back: {
    marginBottom: 6,
  },
  backIcon: {
    fontSize: 22,
    color: colors.accentGold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 22,
  },
  label: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 9,
    backgroundColor: colors.placeholderStripeLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9,
  },
});
