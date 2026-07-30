import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export function LoadingState({ message = 'Le récit se prépare...' }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accentGold} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

export function ErrorState({
  message = "Impossible de charger ce contenu pour l'instant. Vérifie ta connexion et réessaie.",
}: {
  message?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Un souci de connexion</Text>
      <Text style={styles.message}>{message}</Text>
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
