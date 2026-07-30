import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroCard } from '../../../src/components/HeroCard';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { useHeroesList } from '../../../src/data/useHeroesData';
import { ERA_FILTERS, eraCategory, type EraCategory } from '../../../src/data/eraCategory';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

/**
 * Catalogue "Histoires & Héros" — fidèle à la maquette (bannière Mythologie,
 * filtres par époque). Vit dans la pile de l'onglet Accueil (pas un écran
 * séparé hors des onglets) pour que la barre de navigation basse reste
 * visible ici, exactement comme le montre la maquette.
 */
export default function HistoiresHerosScreen() {
  const router = useRouter();
  const heroesState = useHeroesList();
  const heroes = heroesState.status === 'ready' ? heroesState.data : [];

  const [eraFilter, setEraFilter] = useState<EraCategory | 'tous'>('tous');

  const filtered = useMemo(
    () => (eraFilter === 'tous' ? heroes : heroes.filter((h) => eraCategory(h.epoque) === eraFilter)),
    [heroes, eraFilter]
  );

  const openMythologie = () =>
    Alert.alert(
      'Bientôt disponible',
      "Le pilier Mythologie africaine (mythes par peuple, lecture/écoute/BD) n'est pas encore construit."
    );

  if (heroesState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Le catalogue des héros se prépare..." />
      </SafeAreaView>
    );
  }
  if (heroesState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Histoires & Héros</Text>
      </View>

      <Pressable style={styles.mythBanner} onPress={openMythologie}>
        <Text style={styles.mythIcon}>📖</Text>
        <View style={styles.mythBody}>
          <Text style={styles.mythTitle}>Mythologie africaine</Text>
          <Text style={styles.mythSubtitle}>Les mythes par peuple — lire, écouter, BD</Text>
        </View>
        <Text style={styles.mythChevron}>›</Text>
      </Pressable>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={ERA_FILTERS}
        keyExtractor={(f) => f.id}
        contentContainerStyle={styles.filterChips}
        style={styles.filterRow}
        renderItem={({ item }) => {
          const active = eraFilter === item.id;
          return (
            <Pressable onPress={() => setEraFilter(item.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyBody}>Aucune histoire dans cette catégorie pour l'instant.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(h) => h.slug}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <HeroCard heros={item} onPress={() => router.push(`/heros/${item.slug}`)} />
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md + 2,
    paddingTop: 6,
    paddingBottom: 16,
  },
  back: {
    width: 24,
  },
  backIcon: {
    fontSize: 22,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 17,
    letterSpacing: 0.5,
    color: colors.textHeading,
  },
  mythBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: spacing.md + 2,
    marginBottom: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentGold,
    backgroundColor: colors.placeholderStripeDark,
    padding: 15,
  },
  mythIcon: {
    fontSize: 20,
  },
  mythBody: {
    flex: 1,
  },
  mythTitle: {
    fontFamily: typography.display,
    fontSize: 14.5,
    color: colors.textHeading,
  },
  mythSubtitle: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  mythChevron: {
    fontSize: 20,
    color: colors.accentGold,
  },
  filterRow: {
    flexGrow: 0,
    marginBottom: 8,
  },
  filterChips: {
    gap: 8,
    paddingHorizontal: spacing.md + 2,
  },
  chip: {
    borderRadius: radii.badge,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  chipLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    color: colors.textBody,
  },
  chipLabelActive: {
    color: colors.ctaTextOnGold,
  },
  row: {
    gap: 14,
    paddingHorizontal: spacing.md + 2,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 40,
    gap: 20,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 30,
  },
  emptyBody: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
