import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroPlaceholder } from '../../../src/components/HeroVisual';
import { GoldButton, GhostButton } from '../../../src/components/Buttons';
import { useCart } from '../../../src/marketplace/CartProvider';
import { formatFcfa } from '../../../src/data/marketplaceDisplay';
import { colors, spacing, typography } from '../../../src/theme/tokens';

/** Panier — fidèle à design-reference-marketplace.dc.excerpt.html (section CART). Livraison à 0 FCFA tant qu'aucune grille de frais de port n'est définie (aucun frais inventé). */
export default function CartScreen() {
  const router = useRouter();
  const cart = useCart();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Panier</Text>
        </View>

        {cart.items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Ton panier est vide.</Text>
            <GhostButton label="Parcourir le marché" onPress={() => router.replace('/marche')} />
          </View>
        ) : (
          <>
            <View style={styles.list}>
              {cart.items.map((it) => (
                <View key={it.productId} style={styles.item}>
                  <HeroPlaceholder style={styles.itemVisual} radius={12} imageUrl={it.imageUrl} />
                  <View style={styles.itemBody}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {it.nom}
                    </Text>
                    <Text style={styles.itemPrice}>{formatFcfa(it.prixUnitaireFcfa)}</Text>
                  </View>
                  <View style={styles.qtyRow}>
                    <Pressable onPress={() => cart.decrement(it.productId)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnLabel}>−</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{it.quantite}</Text>
                    <Pressable onPress={() => cart.increment(it.productId)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnLabel}>+</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sous-total</Text>
                <Text style={styles.summaryValue}>{formatFcfa(cart.subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Livraison</Text>
                <Text style={styles.summaryValue}>À définir avec le vendeur</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatFcfa(cart.subtotal)}</Text>
              </View>
            </View>

            <GoldButton label="Passer commande" onPress={() => router.push('/marche/checkout')} />
          </>
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
    marginBottom: 18,
  },
  backIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 19,
    fontWeight: '600',
    color: colors.textHeading,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 14,
  },
  emptyIcon: {
    fontSize: 44,
    opacity: 0.4,
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  list: {
    gap: 12,
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },
  itemVisual: {
    width: 56,
    height: 56,
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    lineHeight: 16,
    color: colors.textPrimary,
  },
  itemPrice: {
    fontFamily: typography.mono,
    fontSize: 12,
    color: colors.accentGold,
    marginTop: 3,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnLabel: {
    color: colors.accentGold,
    fontSize: 15,
  },
  qtyValue: {
    fontFamily: typography.mono,
    fontSize: 13,
    color: colors.textPrimary,
    minWidth: 16,
    textAlign: 'center',
  },
  summary: {
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textBodyAlt,
  },
  summaryValue: {
    fontFamily: typography.mono,
    fontSize: 12.5,
    color: colors.textBodyAlt,
  },
  totalRow: {
    paddingTop: 8,
    marginBottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  totalLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.textHeading,
  },
  totalValue: {
    fontFamily: typography.mono,
    fontSize: 15,
    color: colors.accentGold,
  },
});
