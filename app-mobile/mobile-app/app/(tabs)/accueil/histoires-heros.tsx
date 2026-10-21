import { useMemo, useState } from 'react';
import { useRetour } from '../../../src/navigation/retour';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { HeroCard } from '../../../src/components/HeroCard';
import { Icon } from '../../../src/components/Icons';
import { ErrorState } from '../../../src/components/LoadingState';
import { useHeroesList } from '../../../src/data/useHeroesData';
import { ERA_FILTERS, eraCategory, type EraCategory } from '../../../src/data/eraCategory';
import { colors, typography } from '../../../src/theme/tokens';
import { Bone, FilterChips, PressableScale, ScreenHeader, SkeletonScreen } from '../../../src/ui/modern';
import { useLikeCounts } from '../../../src/stats/contentStats';
import { useI18n } from '../../../src/i18n';

/**
 * Catalogue "Histoires & Héros" (refonte moderne du 2026-09-30) : en-tête,
 * carte Mythologie en dégradé, filtres par époque en pastilles, grille de
 * cartes photo. Vit dans la pile de l'onglet Accueil pour garder la barre
 * de navigation basse visible.
 */
export default function HistoiresHerosScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const retour = useRetour();
  const heroesState = useHeroesList();
  const heroes = heroesState.status === 'ready' ? heroesState.data : [];
  const [eraFilter, setEraFilter] = useState<EraCategory | 'tous'>('tous');
  const likes = useLikeCounts('heros', heroes.map((h) => h.slug));

  const filtered = useMemo(
    () => (eraFilter === 'tous' ? heroes : heroes.filter((h) => eraCategory((h as { epoque_fr?: string }).epoque_fr ?? h.epoque) === eraFilter)),
    [heroes, eraFilter]
  );

  if (heroesState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  const header = (
    <View>
      <ScreenHeader
        title={t('heroesList.title')}
        subtitle={heroesState.status === 'ready' ? t('heroesList.count', { n: heroes.length }) : undefined}
        onBack={retour}
      />
      <View style={styles.pad}>
        <PressableScale onPress={() => router.push('/accueil/mythologie')} accessibilityLabel={t('heroesList.myths')}>
          <LinearGradient colors={['#3B2A12', '#1A130B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.myth}>
            <View style={styles.mythIcon}>
              <Icon name="book" size={22} color={colors.accentGoldBright} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mythTitle}>{t('heroesList.myths')}</Text>
              <Text style={styles.mythSub}>{t('heroesList.mythsSub')}</Text>
            </View>
            <Icon name="chevronRight" size={18} color={colors.accentGold} />
          </LinearGradient>
        </PressableScale>
      </View>
      <View style={{ marginTop: 16, marginBottom: 14 }}>
        <FilterChips options={ERA_FILTERS.map((f) => ({ ...f, label: t(f.label) }))} value={eraFilter} onChange={setEraFilter} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {heroesState.status === 'loading' ? (
        <>
          {header}
          <SkeletonScreen>
            <View style={[styles.row, styles.pad]}>
              <Bone style={styles.bone} />
              <Bone style={styles.bone} />
            </View>
            <View style={[styles.row, styles.pad, { marginTop: 14 }]}>
              <Bone style={styles.bone} />
              <Bone style={styles.bone} />
            </View>
          </SkeletonScreen>
        </>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(h) => h.slug}
          numColumns={2}
          ListHeaderComponent={header}
          columnWrapperStyle={[styles.row, styles.pad]}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          renderItem={({ item }) => <HeroCard heros={item} likes={likes.get(item.slug)} onPress={() => router.push(`/accueil/heros/${item.slug}`)} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="compass" size={36} color={colors.accentGoldSoft} />
              <Text style={styles.emptyBody}>{t('heroesList.empty')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0906' },
  pad: { paddingHorizontal: 18 },
  myth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
  },
  mythIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  mythTitle: { fontFamily: typography.display, fontSize: 16, color: colors.textHeading },
  mythSub: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  row: { gap: 14 },
  list: { paddingBottom: 40, gap: 14 },
  bone: { flex: 1, height: 230, borderRadius: 20 },
  empty: { alignItems: 'center', gap: 12, padding: 40 },
  emptyBody: { fontFamily: typography.body, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
