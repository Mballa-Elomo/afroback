import { StyleSheet, Text, View } from 'react-native';
import type { FriseEvenement } from '../data/types';
import { colors, spacing, typography } from '../theme/tokens';
import { SectionTitle } from './SectionTitle';

export function TimelineList({ evenements }: { evenements: FriseEvenement[] }) {
  if (evenements.length === 0) return null;
  return (
    <View style={styles.container}>
      <SectionTitle title="Frise chronologique" />
      {evenements.map((e, i) => (
        <View key={`${e.date}-${i}`} style={styles.row}>
          <View style={styles.markerColumn}>
            <View style={styles.dot} />
            {i < evenements.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.content}>
            <Text style={styles.date}>{e.date}</Text>
            <Text style={styles.evenement}>{e.evenement}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  markerColumn: {
    width: 11,
    alignItems: 'center',
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.accentGoldBright,
    marginTop: 4,
    shadowColor: colors.accentGoldBright,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(139, 90, 43, 0.5)',
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 18,
  },
  date: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.accentGold,
  },
  evenement: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textBodyAlt,
    marginTop: 2,
  },
});
