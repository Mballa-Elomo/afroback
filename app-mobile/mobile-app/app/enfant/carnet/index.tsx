import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { DecouverteItemRow } from '../../../src/components/DecouverteItemRow';
import { useDecouverteItems } from '../../../src/data/useDecouverteData';
import { colors, spacing, typography } from '../../../src/theme/tokens';
import { useI18n } from '../../../src/i18n';

/**
 * Carnet d'explorateur (enfant) — vrai contenu Découverte (les 10 fiches
 * déjà en base), pas une nouveauté fabriquée pour ce module. Réutilise
 * directement `DecouverteItemRow`, sans présentation spécifique enfant :
 * le contenu (villages, coutumes, objets, rôles traditionnels génériques)
 * est déjà neutre et adapté à un jeune public, contrairement aux récits
 * du pilier Histoires & Héros (voir enfant/histoire.tsx).
 */
export default function CarnetExplorateurScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const itemsState = useDecouverteItems();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>{t('kids.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('notebook.title')}</Text>
        <Text style={styles.subtitle}>{t('notebook.subtitle')}</Text>
      </View>

      {itemsState.status === 'loading' && <LoadingState />}
      {itemsState.status === 'error' && <ErrorState />}
      {itemsState.status === 'ready' && (
        <FlatList
          data={itemsState.data}
          keyExtractor={(it) => it.slug}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <DecouverteItemRow item={item} onPress={() => router.push({ pathname: '/enfant/carnet/[slug]', params: { slug: item.slug } })} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 10,
    paddingBottom: 14,
  },
  back: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.accentGold,
    marginBottom: 10,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.textHeading,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMutedAlt,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: spacing.md + 2,
    paddingBottom: 40,
  },
});
