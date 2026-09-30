import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../theme/tokens';
import { BrandMark } from './ui';
import { useI18n } from '../i18n';
import { Icon } from '../components/Icons';

/**
 * En-tête commun des écrans forfait/paiement : retour (optionnel) + "ÉTAPE X / N" + barre de progression.
 * Sans `onBack` : pas de bouton retour (ex. premier écran d'une étape dont les précédentes sont validées).
 */
export function StepHeader({ step, total = 2, onBack }: { step: number; total?: number; onBack?: () => void }) {
  const { t } = useI18n();
  return (
    <>
      <View style={styles.logo}>
        <BrandMark layout="inline" />
      </View>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.back')}>
          <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
        </Pressable>
      ) : (
        <View style={styles.backSpacer} />
      )}
      <View style={styles.row}>
        <Text style={styles.label}>
          {t('steps.label', { step, total })}
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
  logo: {
    marginBottom: 14,
  },
  backSpacer: {
    height: 18,
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
