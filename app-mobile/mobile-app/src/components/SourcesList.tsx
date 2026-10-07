import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { SectionTitle } from './SectionTitle';
import { Icon } from './Icons';
import { useI18n } from '../i18n';

export function SourcesList({ sources, bare = false }: { sources: string[]; /** Sans titre ni marge (dans une section repliable). */ bare?: boolean }) {
  const { t } = useI18n();
  if (sources.length === 0) return null;
  return (
    <View style={bare ? undefined : styles.container}>
      {!bare && <SectionTitle title={t('content.sources')} />}
      {sources.map((s, i) => (
        <View key={i} style={styles.card}>
          <View style={{ marginTop: 2 }}>
            <Icon name="book" size={13} color={colors.accentGoldSoft} />
          </View>
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
