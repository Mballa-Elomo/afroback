import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { getOwnBuyerOrders } from '../../../src/data/marketplaceRepository';
import type { MarketplaceOrder, MarketplaceOrderStatut } from '../../../src/data/marketplaceTypes';
import { formatFcfa } from '../../../src/data/marketplaceDisplay';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

const STATUT_LABEL: Record<MarketplaceOrderStatut, string> = {
  en_attente_paiement: 'En attente de paiement',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};

const STATUT_COLOR: Record<MarketplaceOrderStatut, string> = {
  en_attente_paiement: colors.terracottaTextAlt,
  expediee: colors.accentGold,
  livree: '#8fbf8f',
  annulee: colors.textMuted,
};

/** Mes commandes (acheteur) — écran ajouté pour que "Suivre ma commande" (checkout) ait une vraie destination fonctionnelle, non prévu explicitement dans l'extrait de maquette fourni. */
export default function MyOrdersScreen() {
  const router = useRouter();
  const [state, setState] = useState<{ status: 'loading' | 'error' | 'ready'; orders: MarketplaceOrder[] }>({
    status: 'loading',
    orders: [],
  });

  useEffect(() => {
    let alive = true;
    getOwnBuyerOrders()
      .then((orders) => alive && setState({ status: 'ready', orders }))
      .catch(() => alive && setState({ status: 'error', orders: [] }));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Mes commandes</Text>
        </View>

        {state.status === 'loading' && <LoadingState />}
        {state.status === 'error' && <ErrorState />}
        {state.status === 'ready' && state.orders.length === 0 && (
          <Text style={styles.empty}>Tu n'as pas encore passé de commande.</Text>
        )}
        {state.status === 'ready' && (
          <View style={styles.list}>
            {state.orders.map((o) => (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardDate}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</Text>
                  <View style={{ flex: 1 }} />
                  <View style={[styles.badge, { borderColor: STATUT_COLOR[o.statut] }]}>
                    <Text style={[styles.badgeLabel, { color: STATUT_COLOR[o.statut] }]}>{STATUT_LABEL[o.statut]}</Text>
                  </View>
                </View>
                {o.items.map((it) => (
                  <Text key={it.product_id} style={styles.itemLine}>
                    {it.quantite} × {it.nom}
                  </Text>
                ))}
                <Text style={styles.total}>{formatFcfa(o.montant_total_fcfa)}</Text>
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
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radii.badge,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
  },
  itemLine: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textBodyAlt,
    marginBottom: 2,
  },
  total: {
    fontFamily: typography.mono,
    fontSize: 13,
    color: colors.accentGold,
    marginTop: 6,
  },
});
