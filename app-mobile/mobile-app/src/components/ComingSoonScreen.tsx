import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme/tokens';

/** Écran honnête pour un pilier du produit pas encore construit (Découverte, Marché, Communauté — voir context/AFROBACK.md), plutôt qu'un onglet vide ou un faux contenu. */
export function ComingSoonScreen({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: 12,
  },
  icon: {
    fontSize: 34,
    marginBottom: 6,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.textHeading,
    textAlign: 'center',
  },
  body: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
