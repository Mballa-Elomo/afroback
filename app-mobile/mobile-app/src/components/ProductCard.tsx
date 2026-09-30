import { StyleSheet, Text, View } from 'react-native';
import type { MarketplaceProductWithVendor } from '../data/marketplaceTypes';
import { formatFcfa } from '../data/marketplaceDisplay';
import { colors, typography } from '../theme/tokens';
import { HeroPlaceholder } from './HeroVisual';
import { PressableScale } from '../ui/modern';

/**
 * Tuile produit de la grille catalogue (refonte moderne du 2026-09-30). Pas
 * de note affichée tant qu'un produit n'a aucun avis (jamais une fausse
 * étoile "0 ★" ni une note inventée).
 */
export function ProductCard({
  product,
  averageRating,
  onPress,
}: {
  product: MarketplaceProductWithVendor;
  averageRating: number | null;
  onPress: () => void;
}) {
  const isNew = Date.now() - new Date(product.created_at).getTime() < 14 * 24 * 3600 * 1000;
  const soldOut = product.statut === 'rupture';

  return (
    <PressableScale onPress={onPress} style={styles.card} accessibilityLabel={product.nom}>
      <HeroPlaceholder style={styles.visual} radius={0} imageUrl={product.image_url} fallbackIcon="store">
        {isNew && !soldOut && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>Nouveau</Text>
          </View>
        )}
        {soldOut && (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>Épuisé</Text>
          </View>
        )}
      </HeroPlaceholder>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.nom}
        </Text>
        <Text style={styles.origin} numberOfLines={1}>
          {product.vendor?.nom_boutique ?? product.vendor?.region ?? '—'}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{formatFcfa(product.prix_fcfa)}</Text>
          {averageRating !== null && <Text style={styles.rating}>★ {averageRating.toFixed(1)}</Text>}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  visual: { height: 150, borderWidth: 0 },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.accentGoldBright,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  newBadgeText: { fontFamily: typography.bodyBold, fontSize: 10.5, color: colors.ctaTextOnGold },
  soldOut: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,11,8,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.terracottaText },
  body: { padding: 12 },
  name: { fontFamily: typography.bodySemiBold, fontSize: 14, lineHeight: 18, color: colors.textPrimary },
  origin: { fontFamily: typography.body, fontSize: 11.5, color: colors.textMuted, marginTop: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  price: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.accentGoldBright },
  rating: { fontFamily: typography.body, fontSize: 11.5, color: colors.accentGoldSoft },
});
