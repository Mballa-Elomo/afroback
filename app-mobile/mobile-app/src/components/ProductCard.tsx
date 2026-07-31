import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { MarketplaceProductWithVendor } from '../data/marketplaceTypes';
import { formatFcfa } from '../data/marketplaceDisplay';
import { colors, radii, typography } from '../theme/tokens';

/**
 * Tuile produit de la grille catalogue — fidèle à
 * design-reference-marketplace.dc.excerpt.html (section MARKET). Pas de
 * note moyenne affichée tant qu'un produit n'a aucun avis (jamais une
 * fausse étoile "0 ★" ou une note inventée) — voir mobile-app/README.md.
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
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <View style={styles.visual}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderLabel}>[ produit ]</Text>
          </View>
        )}
        {isNew && !soldOut && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeLabel}>NOUVEAU</Text>
          </View>
        )}
        {soldOut && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutLabel}>ÉPUISÉ</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.nom}
      </Text>
      <Text style={styles.origin} numberOfLines={1}>
        {product.vendor?.region ?? '—'}
      </Text>
      <View style={styles.footerRow}>
        <Text style={styles.price}>{formatFcfa(product.prix_fcfa)}</Text>
        {averageRating !== null && <Text style={styles.rating}>★ {averageRating.toFixed(1)}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  visual: {
    height: 150,
    borderRadius: radii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.placeholderStripeDark,
    padding: 9,
  },
  placeholderLabel: {
    fontFamily: typography.mono,
    fontSize: 8,
    color: colors.textMuted,
  },
  newBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    backgroundColor: colors.accentGoldBright,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  newBadgeLabel: {
    fontFamily: typography.monoBold,
    fontSize: 8,
    color: colors.ctaTextOnGold,
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,11,8,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutLabel: {
    fontFamily: typography.monoBold,
    fontSize: 10,
    color: colors.terracottaText,
  },
  name: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    lineHeight: 15,
    color: colors.textPrimary,
    marginTop: 8,
  },
  origin: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.accentGold,
  },
  rating: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.accentGoldSoft,
  },
});
