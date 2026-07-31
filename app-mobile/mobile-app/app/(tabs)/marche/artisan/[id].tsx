import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeroPlaceholder } from '../../../../src/components/HeroVisual';
import { ProductCard } from '../../../../src/components/ProductCard';
import { SectionTitle } from '../../../../src/components/SectionTitle';
import { ErrorState, LoadingState } from '../../../../src/components/LoadingState';
import { getProductRatingSummaries, getProductsByVendor, getVendorPublicById } from '../../../../src/data/marketplaceRepository';
import type { MarketplaceProduct, MarketplaceVendorPublic } from '../../../../src/data/marketplaceTypes';
import { colors, spacing, typography } from '../../../../src/theme/tokens';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notfound' }
  | { status: 'ready'; vendor: MarketplaceVendorPublic; products: MarketplaceProduct[] };

/**
 * Profil artisan — fidèle à design-reference-marketplace.dc.excerpt.html
 * (section ARTISAN PROFILE). Simplification assumée : pas de badge de
 * vérification (aucun processus de vérification vendeur à ce jour) ni de
 * lien "Découvrir l'artisanat" (contenu culturel non lié aux vendeurs dans
 * le modèle de données) — voir mobile-app/README.md.
 */
export default function ArtisanProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [ratings, setRatings] = useState<Map<string, { moyenne: number; total: number }>>(new Map());

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setState({ status: 'loading' });
    Promise.all([getVendorPublicById(id), getProductsByVendor(id)])
      .then(([vendor, products]) => {
        if (!alive) return;
        if (!vendor) setState({ status: 'notfound' });
        else setState({ status: 'ready', vendor, products });
        getProductRatingSummaries(products.map((p) => p.id)).then((m) => alive && setRatings(m));
      })
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [id]);

  if (state.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }
  if (state.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }
  if (state.status === 'notfound') return <Redirect href="/marche" />;

  const { vendor, products } = state;
  const allRatings = products.map((p) => ratings.get(p.id)).filter((r): r is { moyenne: number; total: number } => Boolean(r));
  const avgRating =
    allRatings.length > 0 ? allRatings.reduce((s, r) => s + r.moyenne * r.total, 0) / allRatings.reduce((s, r) => s + r.total, 0) : null;
  const reviewCount = allRatings.reduce((s, r) => s + r.total, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 8 }]} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        </View>
        <View style={styles.body}>
          {vendor.avatar_url ? (
            <Image source={{ uri: vendor.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <Text style={styles.name}>{vendor.nom_boutique}</Text>
          <Text style={styles.meta}>
            📍 {vendor.region} · {vendor.artisanat}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{avgRating !== null ? avgRating.toFixed(1) : '—'}</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{reviewCount}</Text>
              <Text style={styles.statLabel}>Avis</Text>
            </View>
            <View style={styles.statTile}>
              <Text style={styles.statValue}>{products.length}</Text>
              <Text style={styles.statLabel}>Produits</Text>
            </View>
          </View>

          {vendor.bio && <Text style={styles.bio}>{vendor.bio}</Text>}

          <SectionTitle title="Produits" />
          {products.length === 0 ? (
            <Text style={styles.empty}>Aucun produit en ligne pour l'instant.</Text>
          ) : (
            <View style={styles.grid}>
              {products.map((p) => (
                <View key={p.id} style={styles.gridItem}>
                  <ProductCard
                    product={{ ...p, vendor }}
                    averageRating={ratings.get(p.id)?.moyenne ?? null}
                    onPress={() => router.push(`/marche/${p.id}`)}
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
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  banner: {
    height: 180,
    backgroundColor: colors.placeholderStripeDark,
  },
  backBtn: {
    // `top` par défaut, écrasé à l'usage par `insets.top + 8` (retour de test
    // Yannick du 2026-07-31, cohérence globale avec les autres fiches).
    position: 'absolute',
    top: 12,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: colors.accentGold,
    marginTop: -2,
  },
  body: {
    paddingHorizontal: spacing.md + 2,
    marginTop: -46,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.borderStrong,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.placeholderStripeDark,
  },
  name: {
    fontFamily: typography.display,
    fontSize: 22,
    fontWeight: '600',
    color: colors.textHeading,
    marginTop: 12,
  },
  meta: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 18,
  },
  statTile: {},
  statValue: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.accentGold,
  },
  statLabel: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.textMuted,
  },
  bio: {
    fontFamily: typography.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textBody,
    marginBottom: 22,
  },
  empty: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
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
});
