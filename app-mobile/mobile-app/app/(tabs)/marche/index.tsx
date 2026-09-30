import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductCard } from '../../../src/components/ProductCard';
import { ErrorState } from '../../../src/components/LoadingState';
import { Icon } from '../../../src/components/Icons';
import { useMarketplaceProducts } from '../../../src/data/useMarketplaceData';
import { getProductRatingSummaries } from '../../../src/data/marketplaceRepository';
import { MARKETPLACE_CATEGORIE_LABEL } from '../../../src/data/marketplaceDisplay';
import type { MarketplaceCategorie } from '../../../src/data/marketplaceTypes';
import { useCart } from '../../../src/marketplace/CartProvider';
import { colors, typography } from '../../../src/theme/tokens';
import { useRequireAccount } from '../../../src/auth/AccountWall';
import { useAccess } from '../../../src/access/Access';
import { Bone, FilterChips, PressableScale, ScreenHeader, SkeletonScreen } from '../../../src/ui/modern';

type Filtre = MarketplaceCategorie | 'tous';

/**
 * Catalogue Marché (refonte moderne du 2026-09-30). Catalogue vide au
 * lancement, conforme à la décision du 2026-07-31 : aucun produit ni vendeur
 * fictif, état vide honnête avec invitation à ouvrir sa boutique.
 */
export default function MarketScreen() {
  const router = useRouter();
  const requireAccount = useRequireAccount();
  const { requireSubscription } = useAccess();
  const [productsState, refresh] = useMarketplaceProducts();
  const products = productsState.status === 'ready' ? productsState.data : [];
  const cart = useCart();
  const [ratings, setRatings] = useState<Map<string, { moyenne: number; total: number }>>(new Map());
  const [query, setQuery] = useState('');
  const [filtre, setFiltre] = useState<Filtre>('tous');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (products.length === 0) return;
    getProductRatingSummaries(products.map((p) => p.id)).then(setRatings);
  }, [products]);

  const options = useMemo(() => {
    const present = new Set(products.map((p) => p.categorie));
    return [
      { id: 'tous' as Filtre, label: 'Tous' },
      ...(Object.keys(MARKETPLACE_CATEGORIE_LABEL) as MarketplaceCategorie[])
        .filter((c) => present.has(c))
        .map((c) => ({ id: c as Filtre, label: MARKETPLACE_CATEGORIE_LABEL[c] })),
    ];
  }, [products]);

  const hasQuery = query.trim().length > 0;
  const filtered = useMemo(() => {
    let list = products;
    if (filtre !== 'tous') list = list.filter((p) => p.categorie === filtre);
    if (hasQuery) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.nom.toLowerCase().includes(q) || (p.vendor?.nom_boutique ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [products, filtre, hasQuery, query]);

  const openVendor = () => requireSubscription(() => router.push('/marche/vendeur'), 'vendor');

  if (productsState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Marché"
          subtitle="Artisanat authentique, en direct des artisans"
          right={
            <Pressable
              onPress={() => requireAccount(() => router.push('/marche/cart'), 'cart')}
              style={styles.cartBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Panier, ${cart.count} article${cart.count > 1 ? 's' : ''}`}
            >
              <Icon name="cart" size={20} color={colors.accentGoldPale} />
              {cart.count > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cart.count}</Text>
                </View>
              )}
            </Pressable>
          }
        />

        <View style={styles.pad}>
          <PressableScale onPress={openVendor} accessibilityLabel="Espace vendeur">
            <LinearGradient colors={['#3B2A12', '#1A130B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.vendor}>
              <View style={styles.vendorIcon}>
                <Icon name="store" size={22} color={colors.accentGoldBright} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vendorTitle}>Espace vendeur</Text>
                <Text style={styles.vendorSub}>Vends tes créations sur AFROBACK</Text>
              </View>
              <Icon name="chevronRight" size={18} color={colors.accentGold} />
            </LinearGradient>
          </PressableScale>

          <View style={styles.search}>
            <Icon name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Un produit, un artisan…"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
            />
            {hasQuery && (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Effacer">
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
          {productsState.status === 'loading' ? (
            <SkeletonScreen>
              <View style={styles.grid}>
                {[0, 1, 2, 3].map((i) => (
                  <Bone key={i} style={styles.boneCard} />
                ))}
              </View>
            </SkeletonScreen>
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Icon name="store" size={30} color={colors.accentGoldBright} />
              </View>
              <Text style={styles.emptyTitle}>{products.length === 0 ? 'Le marché ouvre bientôt' : 'Aucun résultat'}</Text>
              <Text style={styles.emptyText}>
                {products.length === 0
                  ? 'Aucun produit pour l’instant. Sois le premier artisan à ouvrir sa boutique sur AFROBACK.'
                  : 'Aucun produit ne correspond à ta recherche.'}
              </Text>
              {products.length === 0 && (
                <Pressable style={styles.emptyCta} onPress={openVendor} accessibilityRole="button">
                  <Icon name="plus" size={16} color={colors.ctaTextOnGold} strokeWidth={2.6} />
                  <Text style={styles.emptyCtaText}>Devenir vendeur</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={[styles.grid, { marginTop: 16 }]}>
              {filtered.map((product) => (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard
                    product={product}
                    averageRating={ratings.get(product.id)?.moyenne ?? null}
                    onPress={() => router.push(`/marche/${product.id}`)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0906' },
  scroll: { paddingBottom: 40 },
  pad: { paddingHorizontal: 18 },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,19,13,.95)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.28)',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentGoldBright,
  },
  cartBadgeText: { fontFamily: typography.bodyBold, fontSize: 11, color: colors.ctaTextOnGold },
  vendor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
  },
  vendorIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  vendorTitle: { fontFamily: typography.display, fontSize: 16, color: colors.textHeading },
  vendorSub: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  gridItem: { width: '47.5%' },
  boneCard: { width: '47.5%', height: 240, borderRadius: 20, marginTop: 16 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16, gap: 10 },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.10)',
  },
  emptyTitle: { fontFamily: typography.display, fontSize: 19, color: colors.textHeading },
  emptyText: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: 'center' },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.accentGoldBright,
  },
  emptyCtaText: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.ctaTextOnGold },
});
