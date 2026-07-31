import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldButton } from '../../../src/components/Buttons';
import { placeOrder } from '../../../src/data/marketplaceRepository';
import type { MarketplaceOrderItem, MarketplacePaymentMethod } from '../../../src/data/marketplaceTypes';
import { formatFcfa } from '../../../src/data/marketplaceDisplay';
import { useCart } from '../../../src/marketplace/CartProvider';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

const PAYMENT_METHODS: { id: MarketplacePaymentMethod; icon: string; name: string; sub: string }[] = [
  { id: 'mtn_momo', icon: '📱', name: 'MTN Mobile Money', sub: 'Confirmation par le vendeur' },
  { id: 'orange_money', icon: '📱', name: 'Orange Money', sub: 'Confirmation par le vendeur' },
];

/**
 * Checkout — fidèle à design-reference-marketplace.dc.excerpt.html (section
 * CHECKOUT), avec une déviation assumée et volontaire (décision de Yannick,
 * 2026-07-31) : aucun agrégateur Mobile Money n'est intégré à AFROBACK à ce
 * jour, donc **aucun paiement réel n'est traité ici**. La commande est bien
 * enregistrée en base (statut `en_attente_paiement`), mais le bouton et
 * l'écran de confirmation ne prétendent jamais qu'un paiement a réussi —
 * contrairement au "✅ Commande confirmée !" de la maquette d'origine.
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const cart = useCart();
  const [nomComplet, setNomComplet] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [telephone, setTelephone] = useState('');
  const [methode, setMethode] = useState<MarketplacePaymentMethod>('mtn_momo');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const [placedTotal, setPlacedTotal] = useState(0);

  const submit = async () => {
    if (placing) return;
    if (!nomComplet.trim() || !adresse.trim() || !ville.trim() || !telephone.trim()) {
      setError('Tous les champs de livraison sont obligatoires.');
      return;
    }
    if (cart.items.length === 0) return;
    setError(null);
    setPlacing(true);

    const itemsByVendor = new Map<string, MarketplaceOrderItem[]>();
    for (const it of cart.items) {
      const list = itemsByVendor.get(it.vendorId) ?? [];
      list.push({ product_id: it.productId, nom: it.nom, prix_unitaire_fcfa: it.prixUnitaireFcfa, quantite: it.quantite });
      itemsByVendor.set(it.vendorId, list);
    }

    const { orders, error: apiError } = await placeOrder({
      itemsByVendor,
      livraison: { nomComplet: nomComplet.trim(), adresse: adresse.trim(), ville: ville.trim(), telephone: telephone.trim() },
      methodePaiement: methode,
    });
    setPlacing(false);
    if (apiError || orders.length === 0) {
      setError(apiError ?? "Impossible d'enregistrer la commande pour le moment.");
      return;
    }
    setPlacedTotal(cart.subtotal);
    cart.clear();
    setPlaced(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Commande</Text>
        </View>

        {placed ? (
          <View style={styles.confirmed}>
            <Text style={styles.confirmedIcon}>📦</Text>
            <Text style={styles.confirmedTitle}>Commande enregistrée</Text>
            <Text style={styles.confirmedSub}>
              Le paiement Mobile Money n'est pas encore intégré sur AFROBACK. Le ou les vendeurs te contacteront au{' '}
              {telephone} pour finaliser le paiement ({formatFcfa(placedTotal)}) et organiser la livraison.
            </Text>
            <GoldButton label="Suivre mes commandes" onPress={() => router.replace('/marche/commandes')} />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>LIVRAISON</Text>
            <View style={styles.form}>
              <TextInput
                value={nomComplet}
                onChangeText={setNomComplet}
                placeholder="Nom complet"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <TextInput
                value={adresse}
                onChangeText={setAdresse}
                placeholder="Adresse"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <TextInput
                value={ville}
                onChangeText={setVille}
                placeholder="Ville"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
              <TextInput
                value={telephone}
                onChangeText={setTelephone}
                placeholder="Téléphone"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <Text style={styles.sectionTitle}>PAIEMENT</Text>
            <View style={styles.methods}>
              {PAYMENT_METHODS.map((m) => {
                const active = methode === m.id;
                return (
                  <Pressable key={m.id} onPress={() => setMethode(m.id)} style={[styles.method, active && styles.methodActive]}>
                    <Text style={styles.methodIcon}>{m.icon}</Text>
                    <View style={styles.methodBody}>
                      <Text style={styles.methodName}>{m.name}</Text>
                      <Text style={styles.methodSub}>{m.sub}</Text>
                    </View>
                    <View style={[styles.radio, active && styles.radioActive]} />
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.notice}>
              <Text style={styles.noticeIcon}>ℹ</Text>
              <Text style={styles.noticeText}>
                Le paiement en ligne n'est pas encore actif sur AFROBACK. Ta commande sera enregistrée, et le vendeur te
                contactera directement pour convenir du paiement et de la livraison.
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatFcfa(cart.subtotal)}</Text>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <GoldButton
              label={placing ? 'Enregistrement...' : 'Enregistrer la commande'}
              onPress={submit}
              disabled={placing}
            />
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
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 12,
  },
  form: {
    gap: 10,
    marginBottom: 22,
  },
  input: {
    fontFamily: typography.body,
    fontSize: 13.5,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.textPrimary,
  },
  methods: {
    gap: 10,
    marginBottom: 22,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  methodActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.cardBg,
  },
  methodIcon: {
    fontSize: 18,
  },
  methodBody: {
    flex: 1,
  },
  methodName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  methodSub: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  radioActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.accentGold,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    padding: 13,
    marginBottom: 18,
  },
  noticeIcon: {
    color: colors.accentGoldSoft,
    fontSize: 13,
  },
  noticeText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textMuted,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
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
  error: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.terracottaText,
    marginBottom: 14,
  },
  confirmed: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 10,
    gap: 8,
  },
  confirmedIcon: {
    fontSize: 48,
  },
  confirmedTitle: {
    fontFamily: typography.display,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textHeading,
    marginTop: 8,
  },
  confirmedSub: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMutedAlt,
    textAlign: 'center',
    marginBottom: 20,
  },
});
