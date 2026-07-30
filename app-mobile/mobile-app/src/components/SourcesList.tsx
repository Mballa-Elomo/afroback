import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { SectionTitle } from './SectionTitle';

export function SourcesList({ sources }: { sources: string[] }) {
  if (sources.length === 0) return null;
  return (
    <View style={styles.container}>
      <SectionTitle title="Sources" />
      {sources.map((s, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.icon}>📚</Text>
          <Text style={styles.item}>{s}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#150e09',
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  icon: {
    fontSize: 11,
    marginTop: 1,
  },
  item: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textSource,
  },
});
