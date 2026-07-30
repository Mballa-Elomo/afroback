import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

/**
 * État "média à produire" — spec §4 : ne jamais masquer le bouton
 * Écouter/Regarder, afficher un état visuellement distinct plutôt qu'un
 * bouton mort. Ton éditorial chaleureux, jamais un message technique.
 */
export function ComingSoonState({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: 'rgba(240, 195, 107, 0.16)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 26,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.displaySemiBold,
    fontSize: 19,
    color: colors.textHeading,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMutedAlt,
    textAlign: 'center',
    maxWidth: 280,
  },
});
