import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

/**
 * Bandeau d'avertissement générique (style terracotta). Titre par défaut
 * "Avertissement de lecture" pour son usage d'origine (ex. Charles Atangana,
 * figure ambivalente — exigence de fond posée par
 * specs-phase1-histoires-heros.md, pas un détail cosmétique), mais
 * paramétrable via `title` pour les autres notices importantes (ex. mode
 * démonstration du paiement sur payment.tsx) — évite d'afficher "Avertissement
 * de lecture" hors de son contexte éditorial.
 */
export function WarningBanner({ text, title = 'Avertissement de lecture' }: { text: string; title?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠</Text>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.terracottaBgStrong,
    borderWidth: 1,
    borderColor: colors.terracottaBorder,
    borderRadius: radii.cardSmall,
    padding: spacing.sm + 3,
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 16,
    color: colors.terracottaText,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: typography.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.terracottaText,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textBody,
  },
});
