import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { useI18n } from '../i18n';

export function LoadingState({ message }: { message?: string }) {
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accentGold} />
      <Text style={styles.message}>{message ?? t('states.loading')}</Text>
    </View>
  );
}

export function ErrorState({
  message,
}: {
  message?: string;
}) {
  const { t } = useI18n();
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>{t('states.errorTitle')}</Text>
      <Text style={styles.message}>{message ?? t('states.error')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  message: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMutedAlt,
    textAlign: 'center',
  },
  errorTitle: {
    fontFamily: typography.displaySemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
