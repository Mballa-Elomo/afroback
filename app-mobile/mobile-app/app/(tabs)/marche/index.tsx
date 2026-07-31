import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../../../src/components/ProductCard';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { useMarketplaceProducts } from '../../../src/data/useMarketplaceData';
import { getProductRatingSummaries } from '../../../src/data/marketplaceRepository';
import { MARKETPLACE_CATEGORIE_LABEL } from '../../../src/data/marketplaceDisplay';
import type { MarketplaceCategorie } from '../../../src/data/marketplaceTypes';
import { useCart } from '../../../src/marketplace/CartProvider';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

/**
 * Catalogue Marché — fidèle à design-reference-marketplace.dc.excerpt.html
 * (section MARKET). Catalogue vide au lancement, conforme à la décision de
 * Yannick du 2026-07-31 (Option A) : aucun produit ni vendeur fictif
 * préchargé, état "Aucun produit pour l'instant" honnête plutôt qu'un faux
 * remplissage.
 */
export default function MarketScreen() {
  const router = useRouter();
  const [productsState, refresh] = useMarketplaceProducts();
  const products = productsState.status === 'ready' ? productsState.data : [];
  const cart = useCart();
  const [ratings, setRatings] = useState<Map<string, { moyenne: number; total: number }>>(new Map());

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (products.length === 0) return;
    getProductRatingSummaries(products.map((p) => p.id)).then(setRatings);
  }, [products]);

  const [query, setQuery] = useState('');
  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.categorie));
    return (Object.keys(MARKETPLACE_CATEGORIE_LABEL) as MarketplaceCategorie[]).filter((c) => present.has(c));
  }, [products]);
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategorie | 'tous'>('tous');

  const hasQuery = query.trim().length > 0;
  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== 'tous') list = list.filter((p) => p.categorie === activeCategory);
    if (hasQuery) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.nom.toLowerCase().includes(q) || (p.vendor?.nom_boutique ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, hasQuery, query]);

  if (productsState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Le marché se prépare..." />
      </SafeAreaView>
    );
  }
  if (productsState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Marché</Text>
          <Pressable onPress={() => router.push('/marche/cart')} style={styles.cartBtn} hitSlop={8}>
            <Text style={styles.cartIcon}>⛾</Text>
            {cart.count > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeLabel}>{cart.count}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Pressable style={styles.vendorBanner} onPress={() => router.push('/marche/vendeur')}>
          <Text style={styles.vendorIcon}>🧑‍🎨</Text>
          <View style={styles.vendorBody}>
            <Text style={styles.vendorTitle}>Espace vendeur</Text>
            <Text style={styles.vendorSubtitle}>Vends tes créations sur AFROBACK</Text>
          </View>
          <Text style={styles.vendorChevron}>›</Text>
        </Pressable>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un produit, un artisan…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {hasQuery && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Text style={styles.searchClear}>✕</Text>
            </Pressable>
          )}
        </View>

        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <Pressable onPress={() => setActiveCategory('tous')} style={[styles.chip, activeCategory === 'tous' && styles.chipActive]}>
              <Text style={[styles.chipLabel, activeCategory === 'tous' && styles.chipLabelActive]}>Tous</Text>
            </Pressable>
            {categories.map((c) => {
              const active = activeCategory === c;
              return (
                <Pressable key={c} onPress={() => setActiveCategory(c)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{MARKETPLACE_CATEGORIE_LABEL[c]}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏺</Text>
            <Text style={styles.emptyText}>
              {products.length === 0
                ? "Aucun produit pour l'instant. Sois le premier vendeur à ouvrir sa boutique sur AFROBACK."
                : `Aucun produit ne correspond à ta recherche.`}
            </Text>
            {products.length === 0 && (
              <Pressable style={styles.emptyCta} onPress={() => router.push('/marche/vendeur')}>
                <Text style={styles.emptyCtaLabel}>Devenir vendeur</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.grid}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 6,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    flex: 1,
    fontFamily: typography.display,
    fontSize: 19,
    fontWeight: '600',
    color: colors.textHeading,
  },
  cartBtn: {
    position: 'relative',
  },
  cartIcon: {
    fontSize: 19,
    color: colors.accentGold,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.terracotta,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 9,
    color: '#fff',
  },
  vendorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
    padding: 14,
    marginBottom: 16,
  },
  vendorIcon: {
    fontSize: 20,
  },
  vendorBody: {
    flex: 1,
  },
  vendorTitle: {
    fontFamily: typography.displaySemiBold,
    fontSize: 14,
    color: colors.textHeading,
  },
  vendorSubtitle: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  vendorChevron: {
    fontSize: 18,
    color: colors.accentGold,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
  },
  searchIcon: {
    color: colors.accentGold,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13.5,
    color: colors.textPrimary,
    padding: 0,
  },
  searchClear: {
    color: colors.textMuted,
    fontSize: 14,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 16,
  },
  chip: {
    borderRadius: radii.badge,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  chipLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11.5,
    color: colors.textBody,
  },
  chipLabelActive: {
    color: colors.ctaTextOnGold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -7,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 7,
    marginBottom: 14,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyCta: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardBg,
    borderRadius: radii.button,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  emptyCtaLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.accentGold,
  },
});
