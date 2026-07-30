import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, radii, spacing } from '../theme/tokens';

export function HeroBadgeTheme({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.badge,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    backgroundColor: 'rgba(160, 82, 45, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(160, 82, 45, 0.5)',
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.terracotta,
  },
});
