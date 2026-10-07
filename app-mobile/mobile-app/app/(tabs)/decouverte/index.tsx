import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorState } from '../../../src/components/LoadingState';
import { HeroPlaceholder } from '../../../src/components/HeroVisual';
import { Icon } from '../../../src/components/Icons';
import { useDecouverteItems, useDecouvertePays } from '../../../src/data/useDecouverteData';
import { DECOUVERTE_TYPE_LABEL } from '../../../src/data/decouverteDisplay';
import type { DecouverteItem, DecouverteType } from '../../../src/data/decouverteTypes';
import { colors, typography } from '../../../src/theme/tokens';
import { AccessBadge } from '../../../src/access/Access';
import { Bone, FilterChips, LikeBadge, PressableScale, ScreenHeader, SkeletonScreen } from '../../../src/ui/modern';
import { useLikeCounts } from '../../../src/stats/contentStats';
import { useI18n } from '../../../src/i18n';

type Filtre = DecouverteType | 'tous';
const ORDER: DecouverteType[] = ['village', 'coutume', 'objet', 'personnage', 'fait'];

/**
 * "Découverte" (refonte moderne du 2026-09-30) : en-tête, grande carte
 * "Explorer le Cameroun" (hub pays), recherche, filtres par catégorie en
 * pastilles, grille de cartes photo. La visite virtuelle des musées garde
 * son état "bientôt disponible" (aucun contenu produit).
 */
export default function DecouverteScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const itemsState = useDecouverteItems();
  const paysState = useDecouvertePays();
  const items = itemsState.status === 'ready' ? itemsState.data : [];
  const pays = paysState.status === 'ready' ? paysState.data : [];
  const [query, setQuery] = useState('');
  const [filtre, setFiltre] = useState<Filtre>('tous');
  const likes = useLikeCounts('decouverte', items.map((it) => it.slug));

  const options = useMemo(() => {
    const present = new Set(items.map((it) => it.type));
    return [
      { id: 'tous' as Filtre, label: t('discovery.all') },
      ...ORDER.filter((t) => present.has(t)).map((ty) => ({ id: ty as Filtre, label: t(`decouverteType.${ty}`) })),
    ];
  }, [items, t]);

  const hasQuery = query.trim().length > 0;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filtre !== 'tous' && it.type !== filtre) return false;
      if (!q) return true;
      return it.titre.toLowerCase().includes(q) || it.resume_liste.toLowerCase().includes(q) || it.region_ethnie.toLowerCase().includes(q);
    });
  }, [items, query, filtre]);

  const openMuseum = () => Alert.alert(t('content.soon'), t('discovery.museumSoon'));

  if (itemsState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader title={t('discovery.title')} subtitle={t('discovery.subtitle')} />

        <View style={styles.pad}>
          {pays[0] && (
            <PressableScale onPress={() => router.push(`/decouverte/pays/${pays[0].slug}`)} accessibilityLabel={t('discovery.explore', { pays: pays[0].nom })}>
              <LinearGradient colors={['#2F5A3A', '#1B2A18', '#120D08']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.country}>
                <View style={styles.countryIcon}>
                  <Icon name="mapPin" size={24} color={colors.accentGoldBright} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.countryKicker}>{t('discovery.exploreCountry')}</Text>
                  <Text style={styles.countryTitle}>{pays[0].nom}</Text>
                  <Text style={styles.countrySub}>{t('discovery.countrySub')}</Text>
                </View>
                <Icon name="chevronRight" size={18} color={colors.accentGold} />
              </LinearGradient>
            </PressableScale>
          )}

          <View style={styles.search}>
            <Icon name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('discovery.search')}
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
            />
            {hasQuery && (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel={t('content.clear')}>
                <Text style={styles.clear}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {options.length > 1 && (
          <View style={{ marginTop: 14 }}>
            <FilterChips options={options} value={filtre} onChange={setFiltre} />
          </View>
        )}

        <View style={styles.pad}>
          {itemsState.status === 'loading' ? (
            <SkeletonScreen>
              <View style={styles.grid}>
                {[0, 1, 2, 3].map((i) => (
                  <Bone key={i} style={styles.boneCard} />
                ))}
              </View>
            </SkeletonScreen>
          ) : (
            <>
              <Text style={styles.count}>
                {filtered.length} contenu{filtered.length > 1 ? 's' : ''}
              </Text>
              <View style={styles.grid}>
                {filtered.map((item) => (
                  <ItemCard key={item.slug} item={item} likes={likes.get(item.slug)} onPress={() => router.push(`/decouverte/${item.slug}`)} />
                ))}
              </View>
              {filtered.length === 0 && (
                <Text style={styles.empty}>
                  {hasQuery ? t('discovery.noMatch', { q: query }) : t('discovery.emptyCat')}
                </Text>
              )}

              <Pressable style={styles.museum} onPress={openMuseum} accessibilityRole="button">
                <View style={styles.museumIcon}>
                  <Icon name="sparkle" size={20} color={colors.accentGoldBright} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.museumTitle}>{t('discovery.museum')}</Text>
                  <Text style={styles.museumSub}>{t('content.soon')}</Text>
                </View>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ItemCard({ item, onPress, likes }: { item: DecouverteItem; onPress: () => void; likes?: number }) {
  const { t } = useI18n();
  return (
    <PressableScale onPress={onPress} wrapperStyle={styles.cardWrap} accessibilityLabel={item.titre}>
      <HeroPlaceholder style={styles.card} radius={20} imageUrl={item.image_url} fallbackIcon="compass">
        <LinearGradient colors={['rgba(8,6,4,0)', 'rgba(8,6,4,0.92)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
        <AccessBadge type="decouverte" slug={item.slug} style={{ top: 8, right: 8 }} />
        <LikeBadge count={likes} />
        <View style={[styles.cardText, !!likes && { right: 56 }]}>
          <Text style={styles.cardKicker} numberOfLines={1}>
            {t(`decouverteType.${item.type}`).toUpperCase()}
          </Text>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.titre}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {item.region_ethnie}
          </Text>
        </View>
      </HeroPlaceholder>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0906' },
  scroll: { paddingBottom: 40 },
  pad: { paddingHorizontal: 18 },
  country: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
  },
  countryIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.14)',
  },
  countryKicker: { fontFamily: typography.mono, fontSize: 10, letterSpacing: 1.2, color: colors.accentGoldSoft },
  countryTitle: { fontFamily: typography.display, fontSize: 19, color: colors.textHeading, marginTop: 2 },
  countrySub: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.12)',
    backgroundColor: 'rgba(26,19,13,.95)',
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, fontFamily: typography.body, fontSize: 14.5, color: colors.textPrimary, paddingVertical: 14 },
  clear: { fontSize: 14, color: colors.textMuted },
  count: { fontFamily: typography.mono, fontSize: 11, letterSpacing: 1, color: colors.textMuted, marginTop: 16, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  cardWrap: { width: '47.5%' },
  card: { height: 210, borderWidth: 0 },
  boneCard: { width: '47.5%', height: 210, borderRadius: 20 },
  cardText: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  cardKicker: { fontFamily: typography.mono, fontSize: 9.5, letterSpacing: 1, color: colors.accentGoldPale, marginBottom: 3 },
  cardTitle: { fontFamily: typography.bodyBold, fontSize: 15, lineHeight: 19, color: '#FFF4E0' },
  cardMeta: { fontFamily: typography.body, fontSize: 11.5, color: 'rgba(255,244,224,.7)', marginTop: 3 },
  empty: { fontFamily: typography.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 20 },
  museum: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(240,195,107,.3)',
  },
  museumIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.10)',
  },
  museumTitle: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  museumSub: { fontFamily: typography.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
