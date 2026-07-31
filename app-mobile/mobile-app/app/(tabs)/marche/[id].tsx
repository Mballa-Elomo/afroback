import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddToCartToast } from '../../../src/components/AddToCartToast';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { SectionTitle } from '../../../src/components/SectionTitle';
import { HeroPlaceholder } from '../../../src/components/HeroVisual';
import { GoldButton } from '../../../src/components/Buttons';
import { useMarketplaceProduct } from '../../../src/data/useMarketplaceData';
import {
  createReview,
  getProductReviews,
  getProductsByVendor,
  getProductRatingSummaries,
  incrementProductViews,
} from '../../../src/data/marketplaceRepository';
import type { MarketplaceProduct, MarketplaceReviewPublic } from '../../../src/data/marketplaceTypes';
import { formatFcfa } from '../../../src/data/marketplaceDisplay';
import { useCart } from '../../../src/marketplace/CartProvider';
import { useAuth } from '../../../src/auth/AuthProvider';
import { colors, spacing, typography } from '../../../src/theme/tokens';

/**
 * Fiche produit — fidèle à design-reference-marketplace.dc.excerpt.html
 * (section PRODUCT DETAIL). Simplifications assumées (voir
 * mobile-app/README.md) : pas de galerie photo swipeable (un seul
 * `image_url` en base, les points de pagination de la maquette supposaient
 * plusieurs photos) ; pas de bouton "favori" (aucune table de liste de
 * souhaits, un cœur qui ne persiste pas serait un faux favori).
 */
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const productState = useMarketplaceProduct(id);
  const product = productState.status === 'ready' ? productState.data : undefined;
  const cart = useCart();

  const [reviews, setReviews] = useState<MarketplaceReviewPublic[]>([]);
  const [rating, setRating] = useState<{ moyenne: number; total: number } | null>(null);
  const [similar, setSimilar] = useState<MarketplaceProduct[]>([]);
  const [toast, setToast] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState(5);
  const [reviewAuteur, setReviewAuteur] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [sendingReview, setSendingReview] = useState(false);

  const loadExtras = () => {
    if (!id) return;
    getProductReviews(id).then(setReviews);
    getProductRatingSummaries([id]).then((m) => setRating(m.get(id) ?? null));
  };

  useEffect(() => {
    loadExtras();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Une vue par visite d'écran, pas par re-render : compteur affiché tel
    // quel dans l'espace vendeur (voir vendeur.tsx), jamais câblé jusqu'ici.
    if (id) incrementProductViews(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!product) return;
    getProductsByVendor(product.vendor_id, product.id).then((list) => setSimilar(list.slice(0, 8)));
  }, [product]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const addToCart = () => {
    if (!product || product.statut !== 'en_ligne') return;
    cart.addItem(product);
    setToast(true);
  };

  const sendReview = async () => {
    if (sendingReview) return;
    if (!id || reviewText.trim().length === 0 || reviewAuteur.trim().length < 2) return;
    setSendingReview(true);
    const { error } = await createReview({
      productId: id,
      auteurNom: reviewAuteur.trim(),
      note: reviewNote,
      commentaire: reviewText.trim(),
    });
    setSendingReview(false);
    if (!error) {
      setReviewOpen(false);
      setReviewText('');
      loadExtras();
    }
  };

  if (productState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }
  if (productState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }
  if (!product) return <Redirect href="/marche" />;

  const inStock = product.statut === 'en_ligne';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: insets.top + 8 }]} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={styles.name}>{product.nom}</Text>
              <Text style={styles.origin}>{product.vendor?.region ?? '—'}</Text>
            </View>
            <Text style={styles.price}>{formatFcfa(product.prix_fcfa)}</Text>
          </View>

          <View style={styles.metaRow}>
            {rating && rating.total > 0 ? (
              <Text style={styles.ratingText}>
                ★ {rating.moyenne.toFixed(1)} <Text style={styles.ratingSub}>· {rating.total} avis</Text>
              </Text>
            ) : (
              <Text style={styles.ratingSub}>Aucun avis pour l'instant</Text>
            )}
            <View style={{ flex: 1 }} />
            <Text style={inStock ? styles.stockOk : styles.stockOut}>
              ● {inStock ? `${product.stock} en stock` : 'Épuisé'}
            </Text>
          </View>

          {product.vendor && (
            <Pressable style={styles.artisanRow} onPress={() => router.push(`/marche/artisan/${product.vendor!.id}`)}>
              <HeroPlaceholder style={styles.artisanAvatar} radius={23} imageUrl={product.vendor.avatar_url} />
              <View style={styles.artisanBody}>
                <Text style={styles.artisanEyebrow}>ARTISAN</Text>
                <Text style={styles.artisanName}>{product.vendor.nom_boutique}</Text>
                <Text style={styles.artisanRegion}>{product.vendor.region}</Text>
              </View>
              <Text style={styles.artisanChevron}>›</Text>
            </Pressable>
          )}

          <SectionTitle title="L'histoire de l'objet" />
          <Text style={styles.description}>{product.description ?? 'Aucune description fournie pour ce produit.'}</Text>

          <View style={styles.reviewsHeader}>
            <SectionTitle title="Avis" />
            {session && (
              <Pressable onPress={() => setReviewOpen((v) => !v)}>
                <Text style={styles.addReviewLink}>{reviewOpen ? 'Annuler' : '+ Laisser un avis'}</Text>
              </Pressable>
            )}
          </View>

          {reviewOpen && (
            <View style={styles.reviewForm}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Pressable key={n} onPress={() => setReviewNote(n)} hitSlop={4}>
                    <Text style={[styles.starPick, n <= reviewNote && styles.starPickActive]}>★</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput
                value={reviewAuteur}
                onChangeText={setReviewAuteur}
                placeholder="Ton nom (affiché avec l'avis)"
                placeholderTextColor={colors.textMuted}
                style={styles.reviewInput}
                maxLength={40}
              />
              <TextInput
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Ton avis sur ce produit..."
                placeholderTextColor={colors.textMuted}
                style={[styles.reviewInput, styles.reviewTextarea]}
                multiline
                maxLength={1000}
              />
              <GoldButton
                label={sendingReview ? 'Envoi...' : 'Publier mon avis'}
                onPress={sendReview}
                disabled={sendingReview}
              />
            </View>
          )}

          <View style={styles.reviewsList}>
            {reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewCardHeader}>
                  <Text style={styles.reviewAuthor}>{r.auteur_nom}</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.reviewStars}>{'★'.repeat(r.note)}</Text>
                </View>
                <Text style={styles.reviewText}>{r.commentaire}</Text>
                {r.reponse_vendeur && (
                  <View style={styles.vendorReply}>
                    <Text style={styles.vendorReplyLabel}>Réponse du vendeur</Text>
                    <Text style={styles.vendorReplyText}>{r.reponse_vendeur}</Text>
                  </View>
                )}
              </View>
            ))}
            {reviews.length === 0 && <Text style={styles.noReviews}>Sois le premier à donner ton avis.</Text>}
          </View>

          {similar.length > 0 && (
            <>
              <SectionTitle title="Du même artisan" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarRow}>
                {similar.map((p) => (
                  <Pressable key={p.id} style={styles.similarItem} onPress={() => router.push(`/marche/${p.id}`)}>
                    <HeroPlaceholder style={styles.similarVisual} radius={14} imageUrl={p.image_url} />
                    <Text style={styles.similarName} numberOfLines={2}>
                      {p.nom}
                    </Text>
                    <Text style={styles.similarPrice}>{formatFcfa(p.prix_fcfa)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {inStock ? (
          <GoldButton label="Ajouter au panier" onPress={addToCart} />
        ) : (
          <View style={styles.soldOutBtn}>
            <Text style={styles.soldOutBtnLabel}>Épuisé</Text>
          </View>
        )}
      </View>

      {toast && <AddToCartToast message={`${product.nom} ajouté au panier`} onViewCart={() => router.push('/marche/cart')} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    height: 300,
    overflow: 'hidden',
    backgroundColor: colors.placeholderStripeDark,
  },
  headerPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.placeholderStripeDark,
  },
  backBtn: {
    // `top` par défaut, écrasé à l'usage par `insets.top + 8` (retour de test
    // Yannick du 2026-07-31 : trop proche de l'encoche/status bar sans ça,
    // car ce header bleed sous la zone sûre — edges=['bottom'] au-dessus).
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
    padding: spacing.md + 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleCol: {
    flex: 1,
  },
  name: {
    fontFamily: typography.display,
    fontSize: 21,
    fontWeight: '600',
    color: colors.textHeading,
    lineHeight: 24,
  },
  origin: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  price: {
    fontFamily: typography.mono,
    fontSize: 16,
    color: colors.accentGold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  ratingText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.accentGoldSoft,
  },
  ratingSub: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  stockOk: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: '#8fbf8f',
  },
  stockOut: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.terracottaTextAlt,
  },
  artisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  artisanAvatar: {
    width: 46,
    height: 46,
  },
  artisanBody: {
    flex: 1,
    minWidth: 0,
  },
  artisanEyebrow: {
    fontFamily: typography.mono,
    fontSize: 8.5,
    letterSpacing: 1,
    color: colors.terracottaTextAlt,
  },
  artisanName: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  artisanRegion: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  artisanChevron: {
    fontSize: 18,
    color: colors.accentGold,
  },
  description: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 24,
    color: colors.textBody,
    marginBottom: 22,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addReviewLink: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    color: colors.accentGold,
    marginBottom: 12,
  },
  reviewForm: {
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  starPick: {
    fontSize: 22,
    color: colors.borderStrong,
  },
  starPickActive: {
    color: colors.accentGold,
  },
  reviewInput: {
    fontFamily: typography.body,
    fontSize: 13,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    padding: 12,
    color: colors.textPrimary,
  },
  reviewTextarea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  reviewsList: {
    gap: 10,
    marginBottom: 24,
  },
  reviewCard: {
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    padding: 13,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
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
  reviewText: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textBodyAlt,
  },
  vendorReply: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  vendorReplyLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.accentGoldSoft,
    marginBottom: 3,
  },
  vendorReplyText: {
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textBodyAlt,
  },
  noReviews: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  similarRow: {
    gap: 12,
  },
  similarItem: {
    width: 110,
  },
  similarVisual: {
    height: 110,
  },
  similarName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11.5,
    lineHeight: 14,
    color: colors.textPrimary,
    marginTop: 6,
  },
  similarPrice: {
    fontFamily: typography.mono,
    fontSize: 10.5,
    color: colors.accentGold,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  soldOutBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    backgroundColor: colors.surfaceCard,
    paddingVertical: 14,
    alignItems: 'center',
  },
  soldOutBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.textMuted,
  },
});
