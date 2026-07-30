import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.title}>{title.toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: spacing.sm + 2,
  },
});
