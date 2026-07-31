import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateVendorForm } from '../../../src/marketplace/CreateVendorForm';
import { VendorProductEditorModal } from '../../../src/marketplace/VendorProductEditorModal';
import { LoadingState } from '../../../src/components/LoadingState';
import { HeroPlaceholder } from '../../../src/components/HeroVisual';
import { useOwnVendor } from '../../../src/data/useMarketplaceData';
import {
  getOwnVendorProducts,
  getVendorOrders,
  getVendorReviews,
  markOrderShipped,
  replyToReview,
} from '../../../src/data/marketplaceRepository';
import { formatFcfa, MARKETPLACE_CATEGORIE_LABEL } from '../../../src/data/marketplaceDisplay';
import type { MarketplaceOrder, MarketplaceOrderStatut, MarketplaceProduct } from '../../../src/data/marketplaceTypes';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

type VendorTab = 'dash' | 'products' | 'orders' | 'reviews' | 'revenue' | 'plans';

const ORDER_STATUT_LABEL: Record<MarketplaceOrderStatut, string> = {
  en_attente_paiement: 'En attente',
  expediee: 'Expédiée',
  livree: 'Livrée',
  annulee: 'Annulée',
};

/**
 * Espace vendeur — fidèle à design-reference-marketplace.dc.excerpt.html
 * (section VENDOR SPACE). Sous-navigation par chips (pas des routes
 * expo-router séparées) : c'est ainsi que la maquette la modélise (état
 * local, pas une pile de navigation).
 *
 * Traitement honnête assumé pour l'onglet Revenus/Paliers : aucun taux de
 * commission ni palier d'abonnement n'est inventé — Yannick n'a pas encore
 * tranché le modèle économique du Marketplace (voir context/AFROBACK.md,
 * "Points bloquants"). Cette section affiche les commandes réelles
 * enregistrées, jamais des revenus/versements fictifs.
 */
export default function VendorSpaceScreen() {
  const router = useRouter();
  const [vendorState, refreshVendor] = useOwnVendor();
  const [tab, setTab] = useState<VendorTab>('dash');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [reviews, setReviews] = useState<Awaited<ReturnType<typeof getVendorReviews>>>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const vendor = vendorState.status === 'ready' ? vendorState.data : undefined;

  const loadVendorData = useCallback(() => {
    if (!vendor) return;
    setLoadingData(true);
    Promise.all([getOwnVendorProducts(vendor.id), getVendorOrders(vendor.id), getVendorReviews(vendor.id)]).then(
      ([p, o, r]) => {
        setProducts(p);
        setOrders(o);
        setReviews(r);
        setLoadingData(false);
      }
    );
  }, [vendor]);

  useFocusEffect(
    useCallback(() => {
      loadVendorData();
    }, [loadVendorData])
  );

  const stats = useMemo(() => {
    const now = new Date();
    const salesThisMonth = orders
      .filter((o) => {
        const d = new Date(o.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, o) => s + o.montant_total_fcfa, 0);
    const pending = orders.filter((o) => o.statut === 'en_attente_paiement');
    const pendingTotal = pending.reduce((s, o) => s + o.montant_total_fcfa, 0);
    const toShip = pending.length;
    const online = products.filter((p) => p.statut === 'en_ligne').length;
    const outOfStock = products.filter((p) => p.statut === 'rupture').length;

    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const count = orders.filter((o) => new Date(o.created_at).toDateString() === day.toDateString()).length;
      days.push({ label: day.toLocaleDateString('fr-FR', { weekday: 'short' }), count });
    }
    const maxCount = Math.max(1, ...days.map((d) => d.count));

    return { salesThisMonth, pendingTotal, pendingCount: pending.length, toShip, online, outOfStock, days, maxCount };
  }, [orders, products]);

  const totalRegistered = useMemo(() => orders.reduce((s, o) => s + o.montant_total_fcfa, 0), [orders]);

  if (vendorState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (vendorState.status === 'ready' && !vendor) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <Text style={styles.title}>Espace vendeur</Text>
          </View>
          <CreateVendorForm onCreated={refreshVendor} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!vendor) return null;

  const markShipped = async (orderId: string) => {
    await markOrderShipped(orderId);
    loadVendorData();
  };

  const submitReply = async (reviewId: string) => {
    const text = (replyDrafts[reviewId] ?? '').trim();
    if (!text) return;
    await replyToReview(reviewId, text);
    setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
    loadVendorData();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Espace vendeur</Text>
          <View style={{ flex: 1 }} />
          <View style={styles.shopBadge}>
            <Text style={styles.shopBadgeLabel}>{vendor.nom_boutique.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {vendor.region} · {vendor.artisanat}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {(
            [
              ['dash', 'Tableau de bord'],
              ['products', 'Produits'],
              ['orders', 'Commandes'],
              ['reviews', 'Avis'],
              ['revenue', 'Revenus'],
            ] as [VendorTab, string][]
          ).map(([id, label]) => (
            <Pressable key={id} onPress={() => setTab(id)} style={[styles.tabChip, tab === id && styles.tabChipActive]}>
              <Text style={[styles.tabChipLabel, tab === id && styles.tabChipLabelActive]}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {loadingData ? (
          <LoadingState />
        ) : (
          <>
            {tab === 'dash' && (
              <View>
                <View style={styles.statsGrid}>
                  <View style={styles.statCardHighlight}>
                    <Text style={styles.statCardLabel}>COMMANDES CE MOIS</Text>
                    <Text style={styles.statCardValue}>{formatFcfa(stats.salesThisMonth)}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>EN ATTENTE</Text>
                    <Text style={styles.statCardValue}>{formatFcfa(stats.pendingTotal)}</Text>
                    <Text style={styles.statCardSub}>{stats.pendingCount} commande(s)</Text>
                  </View>
                </View>

                <View style={styles.sparkCard}>
                  <Text style={styles.sparkLabel}>COMMANDES · 7 DERNIERS JOURS</Text>
                  <View style={styles.sparkRow}>
                    {stats.days.map((d, i) => (
                      <View key={i} style={styles.sparkBarWrap}>
                        <View style={[styles.sparkBar, { height: Math.max(4, (d.count / stats.maxCount) * 60) }]} />
                        <Text style={styles.sparkDayLabel}>{d.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.miniStatsRow}>
                  <Pressable style={styles.miniStat} onPress={() => setTab('orders')}>
                    <Text style={styles.miniStatValue}>{stats.toShip}</Text>
                    <Text style={styles.miniStatLabel}>À expédier</Text>
                  </Pressable>
                  <Pressable style={styles.miniStat} onPress={() => setTab('products')}>
                    <Text style={styles.miniStatValue}>{stats.online}</Text>
                    <Text style={styles.miniStatLabel}>En ligne</Text>
                  </Pressable>
                  <Pressable style={styles.miniStat} onPress={() => setTab('products')}>
                    <Text style={[styles.miniStatValue, styles.miniStatValueWarn]}>{stats.outOfStock}</Text>
                    <Text style={styles.miniStatLabel}>Rupture</Text>
                  </Pressable>
                </View>

                <Text style={styles.sectionTitle}>COMMANDES RÉCENTES</Text>
                <View style={styles.list}>
                  {orders.slice(0, 5).map((o) => (
                    <View key={o.id} style={styles.orderRow}>
                      <View style={styles.orderRowThumb} />
                      <View style={styles.orderRowBody}>
                        <Text style={styles.orderRowItem} numberOfLines={1}>
                          {o.items.map((it) => it.nom).join(', ')}
                        </Text>
                        <Text style={styles.orderRowMeta}>{o.livraison_nom_complet}</Text>
                      </View>
                      <Text style={styles.orderRowStatut}>{ORDER_STATUT_LABEL[o.statut]}</Text>
                    </View>
                  ))}
                  {orders.length === 0 && <Text style={styles.empty}>Aucune commande pour l'instant.</Text>}
                </View>
              </View>
            )}

            {tab === 'products' && (
              <View>
                <View style={styles.list}>
                  {products.map((p) => (
                    <View key={p.id} style={styles.productRow}>
                      <HeroPlaceholder style={styles.productThumb} radius={10} imageUrl={p.image_url} />
                      <View style={styles.productBody}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {p.nom}
                        </Text>
                        <Text style={styles.productPrice}>{formatFcfa(p.prix_fcfa)}</Text>
                        <Text style={styles.productMeta}>
                          {p.stock} en stock · {p.vues} vue(s) · {MARKETPLACE_CATEGORIE_LABEL[p.categorie]}
                        </Text>
                      </View>
                      <View style={styles.productActions}>
                        <View style={[styles.statusPill, p.statut === 'rupture' && styles.statusPillWarn]}>
                          <Text style={[styles.statusPillLabel, p.statut === 'rupture' && styles.statusPillLabelWarn]}>
                            {p.statut === 'en_ligne' ? 'EN LIGNE' : 'RUPTURE'}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => {
                            setEditingProduct(p);
                            setEditorOpen(true);
                          }}
                        >
                          <Text style={styles.editLink}>Modifier</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                  {products.length === 0 && <Text style={styles.empty}>Aucun produit pour l'instant.</Text>}
                </View>
                <Pressable
                  style={styles.addProductBtn}
                  onPress={() => {
                    setEditingProduct(null);
                    setEditorOpen(true);
                  }}
                >
                  <Text style={styles.addProductBtnLabel}>+ Ajouter un produit</Text>
                </Pressable>
              </View>
            )}

            {tab === 'orders' && (
              <View style={styles.list}>
                {orders.map((o) => (
                  <View key={o.id} style={styles.orderCard}>
                    <View style={styles.orderCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderCardItem} numberOfLines={1}>
                          {o.items.map((it) => `${it.quantite}× ${it.nom}`).join(', ')}
                        </Text>
                        <Text style={styles.orderCardMeta}>
                          {o.livraison_nom_complet} · {o.livraison_ville} · {new Date(o.created_at).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                      <Text style={styles.orderCardStatut}>{ORDER_STATUT_LABEL[o.statut]}</Text>
                    </View>
                    <View style={styles.orderCardFooter}>
                      <Text style={styles.orderCardAmount}>{formatFcfa(o.montant_total_fcfa)}</Text>
                      {o.statut === 'en_attente_paiement' && (
                        <Pressable style={styles.shipBtn} onPress={() => markShipped(o.id)}>
                          <Text style={styles.shipBtnLabel}>Marquer comme expédiée</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
                {orders.length === 0 && <Text style={styles.empty}>Aucune commande pour l'instant.</Text>}
              </View>
            )}

            {tab === 'reviews' && (
              <View style={styles.list}>
                {reviews.map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <Text style={styles.reviewAuthor}>{r.auteur_nom}</Text>
                      <View style={{ flex: 1 }} />
                      <Text style={styles.reviewStars}>{'★'.repeat(r.note)}</Text>
                    </View>
                    <Text style={styles.reviewProduct}>{r.productNom}</Text>
                    <Text style={styles.reviewText}>{r.commentaire}</Text>
                    {r.reponse_vendeur ? (
                      <View style={styles.vendorReply}>
                        <Text style={styles.vendorReplyLabel}>Ta réponse</Text>
                        <Text style={styles.vendorReplyText}>{r.reponse_vendeur}</Text>
                      </View>
                    ) : (
                      <View style={styles.replyForm}>
                        <TextInput
                          value={replyDrafts[r.id] ?? ''}
                          onChangeText={(t) => setReplyDrafts((prev) => ({ ...prev, [r.id]: t }))}
                          placeholder="Répondre à cet avis..."
                          placeholderTextColor={colors.textMuted}
                          style={styles.replyInput}
                        />
                        <Pressable onPress={() => submitReply(r.id)}>
                          <Text style={styles.replySend}>↩ Répondre</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                ))}
                {reviews.length === 0 && <Text style={styles.empty}>Aucun avis pour l'instant.</Text>}
              </View>
            )}

            {tab === 'revenue' && (
              <View>
                <View style={styles.revenueHero}>
                  <Text style={styles.sparkLabel}>COMMANDES ENREGISTRÉES (TOTAL)</Text>
                  <Text style={styles.revenueValue}>{formatFcfa(totalRegistered)}</Text>
                </View>
                <View style={styles.commissionCard}>
                  <Text style={styles.commissionNote}>
                    Le paiement en ligne (Mobile Money) et le modèle de commission AFROBACK ne sont pas encore activés.
                    Les montants ci-dessus reflètent les commandes enregistrées, pas des revenus réellement versés.
                  </Text>
                  <Pressable style={styles.changePlanBtn} onPress={() => setTab('plans')}>
                    <Text style={styles.changePlanBtnLabel}>Voir les paliers vendeur</Text>
                  </Pressable>
                </View>
                <Text style={styles.sectionTitle}>COMMANDES</Text>
                <View style={styles.list}>
                  {orders.map((o) => (
                    <View key={o.id} style={styles.payoutRow}>
                      <View>
                        <Text style={styles.payoutAmount}>{formatFcfa(o.montant_total_fcfa)}</Text>
                        <Text style={styles.payoutDate}>{new Date(o.created_at).toLocaleDateString('fr-FR')}</Text>
                      </View>
                      <Text style={styles.orderRowStatut}>{ORDER_STATUT_LABEL[o.statut]}</Text>
                    </View>
                  ))}
                  {orders.length === 0 && <Text style={styles.empty}>Aucune commande pour l'instant.</Text>}
                </View>
              </View>
            )}

            {tab === 'plans' && (
              <View>
                <Text style={styles.sectionTitle}>PALIERS VENDEUR</Text>
                <View style={styles.plansEmpty}>
                  <Text style={styles.plansEmptyIcon}>📊</Text>
                  <Text style={styles.plansEmptyTitle}>Bientôt disponible</Text>
                  <Text style={styles.plansEmptyText}>
                    AFROBACK n'a pas encore défini de paliers d'abonnement ni de taux de commission vendeur. Tant que
                    ce n'est pas décidé, aucun taux ni prix n'est affiché ici — plutôt qu'un chiffre inventé.
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <VendorProductEditorModal
        visible={editorOpen}
        vendorId={vendor.id}
        product={editingProduct}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          setEditorOpen(false);
          loadVendorData();
        }}
      />
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
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
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
  shopBadge: {
    borderRadius: radii.badge,
    backgroundColor: colors.accentGoldBright,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  shopBadgeLabel: {
    fontFamily: typography.monoBold,
    fontSize: 8.5,
    letterSpacing: 0.5,
    color: colors.ctaTextOnGold,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
    marginBottom: 16,
  },
  tabsRow: {
    gap: 8,
    paddingBottom: 18,
  },
  tabChip: {
    borderRadius: radii.badge,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  tabChipActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  tabChipLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11.5,
    color: colors.textBody,
  },
  tabChipLabelActive: {
    color: colors.ctaTextOnGold,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statCardHighlight: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 15,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    backgroundColor: colors.surfaceCard,
    padding: 15,
  },
  statCardLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.6,
    color: colors.terracottaTextAlt,
  },
  statCardValue: {
    fontFamily: typography.display,
    fontSize: 17,
    color: colors.textHeading,
    marginTop: 6,
  },
  statCardSub: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  sparkCard: {
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sparkLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.6,
    color: colors.terracottaTextAlt,
    marginBottom: 12,
  },
  sparkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 70,
  },
  sparkBarWrap: {
    flex: 1,
    alignItems: 'center',
  },
  sparkBar: {
    width: '100%',
    borderRadius: 3,
    backgroundColor: colors.accentGoldBright,
  },
  sparkDayLabel: {
    fontFamily: typography.mono,
    fontSize: 7.5,
    color: colors.textMuted,
    marginTop: 4,
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    paddingVertical: 12,
  },
  miniStatValue: {
    fontFamily: typography.display,
    fontSize: 19,
    color: colors.accentGold,
  },
  miniStatValueWarn: {
    color: colors.reportColor,
  },
  miniStatLabel: {
    fontFamily: typography.body,
    fontSize: 9.5,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 12,
  },
  list: {
    gap: 10,
  },
  empty: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
    paddingVertical: 10,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 12,
  },
  orderRowThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.placeholderStripeDark,
  },
  orderRowBody: {
    flex: 1,
    minWidth: 0,
  },
  orderRowItem: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  orderRowMeta: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  orderRowStatut: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.accentGoldSoft,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 12,
  },
  productThumb: {
    width: 52,
    height: 52,
    flexShrink: 0,
  },
  productBody: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  productPrice: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.accentGold,
    marginTop: 2,
  },
  productMeta: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  productActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusPill: {
    borderRadius: 5,
    backgroundColor: 'rgba(143,191,143,0.16)',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusPillWarn: {
    backgroundColor: 'rgba(176,106,74,0.18)',
  },
  statusPillLabel: {
    fontFamily: typography.mono,
    fontSize: 8,
    color: '#8fbf8f',
  },
  statusPillLabelWarn: {
    color: colors.reportColor,
  },
  editLink: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.accentGold,
  },
  addProductBtn: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardBg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addProductBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13.5,
    color: colors.accentGold,
  },
  orderCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 14,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  orderCardItem: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  orderCardMeta: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  orderCardStatut: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.accentGoldSoft,
  },
  orderCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  orderCardAmount: {
    fontFamily: typography.mono,
    fontSize: 13,
    color: colors.accentGold,
  },
  shipBtn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  shipBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 11,
    color: colors.accentGold,
  },
  reviewCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 14,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reviewAuthor: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  reviewStars: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.accentGoldSoft,
  },
  reviewProduct: {
    fontFamily: typography.mono,
    fontSize: 8,
    color: colors.terracottaTextAlt,
    marginBottom: 6,
  },
  reviewText: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textBodyAlt,
    marginBottom: 10,
  },
  vendorReply: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  vendorReplyLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    color: colors.accentGoldSoft,
    marginBottom: 3,
  },
  vendorReplyText: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textBodyAlt,
  },
  replyForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: colors.textPrimary,
  },
  replySend: {
    fontFamily: typography.bodyBold,
    fontSize: 11,
    color: colors.accentGold,
  },
  revenueHero: {
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  revenueValue: {
    fontFamily: typography.display,
    fontSize: 26,
    color: colors.textHeading,
    marginTop: 6,
  },
  commissionCard: {
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 15,
    marginBottom: 18,
  },
  commissionNote: {
    fontFamily: typography.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textMuted,
  },
  changePlanBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardBg,
    borderRadius: 11,
    paddingVertical: 11,
    alignItems: 'center',
  },
  changePlanBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 12.5,
    color: colors.accentGold,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  payoutAmount: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  payoutDate: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  plansEmpty: {
    alignItems: 'center',
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 16,
    padding: 26,
    gap: 8,
  },
  plansEmptyIcon: {
    fontSize: 28,
    opacity: 0.6,
  },
  plansEmptyTitle: {
    fontFamily: typography.displaySemiBold,
    fontSize: 15,
    color: colors.textHeading,
  },
  plansEmptyText: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
