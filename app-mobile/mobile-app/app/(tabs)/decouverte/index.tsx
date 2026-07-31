import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DecouverteItemRow } from '../../../src/components/DecouverteItemRow';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { useDecouverteItems, useDecouvertePays } from '../../../src/data/useDecouverteData';
import { DECOUVERTE_TYPE_ICON, DECOUVERTE_TYPE_LABEL } from '../../../src/data/decouverteDisplay';
import type { DecouverteType } from '../../../src/data/decouverteTypes';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

/**
 * Liste "Découverte" — fidèle à design-reference-decouverte.dc.excerpt.html
 * (section DISCOVERY), avec deux simplifications assumées (voir
 * mobile-app/README.md) : la carte Afrique interactive (iframe) est
 * remplacée par un vrai lien "Explorer le Cameroun" vers le hub pays (un
 * seul pays en base), et la visite virtuelle des musées 360° garde son état
 * "bientôt disponible" déjà prévu par la maquette elle-même (pas de contenu
 * produit).
 */
export default function DecouverteScreen() {
  const router = useRouter();
  const itemsState = useDecouverteItems();
  const paysState = useDecouvertePays();
  const items = itemsState.status === 'ready' ? itemsState.data : [];
  const pays = paysState.status === 'ready' ? paysState.data : [];

  const [query, setQuery] = useState('');
  const categories = useMemo(() => {
    const present = new Set(items.map((it) => it.type));
    return (['village', 'coutume', 'objet', 'personnage', 'fait'] as DecouverteType[]).filter((t) => present.has(t));
  }, [items]);
  const [catIndex, setCatIndex] = useState(0);
  const activeCategory = categories[catIndex] ?? categories[0];

  const hasQuery = query.trim().length > 0;
  const filtered = useMemo(() => {
    if (hasQuery) {
      const q = query.trim().toLowerCase();
      return items.filter(
        (it) =>
          it.titre.toLowerCase().includes(q) ||
          it.resume_liste.toLowerCase().includes(q) ||
          it.region_ethnie.toLowerCase().includes(q)
      );
    }
    if (!activeCategory) return items;
    return items.filter((it) => it.type === activeCategory);
  }, [items, hasQuery, query, activeCategory]);

  const openMuseum = () =>
    Alert.alert('Bientôt disponible', "La visite virtuelle des musées en 360° n'est pas encore construite.");

  if (itemsState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="La Découverte se prépare..." />
      </SafeAreaView>
    );
  }
  if (itemsState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Découverte</Text>

        {pays[0] && (
          <Pressable style={styles.countryBanner} onPress={() => router.push(`/decouverte/pays/${pays[0].slug}`)}>
            <Text style={styles.countryIcon}>🗺️</Text>
            <View style={styles.countryBody}>
              <Text style={styles.countryTitle}>Explorer {pays[0].nom}</Text>
              <Text style={styles.countrySubtitle}>Tout le patrimoine du pays, réuni au même endroit</Text>
            </View>
            <Text style={styles.countryChevron}>›</Text>
          </Pressable>
        )}

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher dans la Découverte…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {hasQuery && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Text style={styles.searchClear}>✕</Text>
            </Pressable>
          )}
        </View>

        {hasQuery ? (
          <View style={styles.resultsRow}>
            <Text style={styles.resultsLabel}>RÉSULTATS</Text>
            <Text style={styles.resultsCount}>{filtered.length} trouvé(s)</Text>
          </View>
        ) : (
          categories.length > 0 && (
            <>
              <View style={styles.catBrowser}>
                <Pressable
                  onPress={() => setCatIndex((i) => (i - 1 + categories.length) % categories.length)}
                  style={styles.catArrow}
                >
                  <Text style={styles.catArrowLabel}>‹</Text>
                </Pressable>
                <View style={styles.catCard}>
                  <Text style={styles.catIcon}>{DECOUVERTE_TYPE_ICON[activeCategory]}</Text>
                  <Text style={styles.catName}>{DECOUVERTE_TYPE_LABEL[activeCategory]}</Text>
                  <Text style={styles.catPos}>
                    CATÉGORIE {catIndex + 1}/{categories.length} · {filtered.length} CONTENU(S)
                  </Text>
                </View>
                <Pressable onPress={() => setCatIndex((i) => (i + 1) % categories.length)} style={styles.catArrow}>
                  <Text style={styles.catArrowLabel}>›</Text>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                {categories.map((c, i) => {
                  const active = i === catIndex;
                  return (
                    <Pressable key={c} onPress={() => setCatIndex(i)} style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                        {DECOUVERTE_TYPE_ICON[c]} {DECOUVERTE_TYPE_LABEL[c]}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable style={styles.museumBanner} onPress={openMuseum}>
                <View style={styles.museumBadge}>
                  <Text style={styles.museumBadgeLabel}>BIENTÔT DISPONIBLE</Text>
                </View>
                <Text style={styles.museumTitle}>Visite virtuelle des musées · 360°</Text>
                <Text style={styles.museumSubtitle}>
                  Parcourez les collections avec points d'intérêt cliquables vers les objets sacrés. →
                </Text>
              </Pressable>
            </>
          )
        )}

        <View style={styles.list}>
          {filtered.map((item) => (
            <DecouverteItemRow key={item.slug} item={item} onPress={() => router.push(`/decouverte/${item.slug}`)} />
          ))}
          {filtered.length === 0 && (
            <Text style={styles.empty}>
              {hasQuery ? `Aucun contenu ne correspond à « ${query} ».` : 'Aucun contenu dans cette catégorie pour l’instant.'}
            </Text>
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
  scroll: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 6,
    paddingBottom: 40,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 19,
    fontWeight: '600',
    color: colors.textHeading,
    marginBottom: 14,
  },
  countryBanner: {
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
  countryIcon: {
    fontSize: 22,
  },
  countryBody: {
    flex: 1,
  },
  countryTitle: {
    fontFamily: typography.displaySemiBold,
    fontSize: 14,
    color: colors.textHeading,
  },
  countrySubtitle: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  countryChevron: {
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
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultsLabel: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
  },
  resultsCount: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  catBrowser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  catArrow: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catArrowLabel: {
    color: colors.accentGold,
    fontSize: 18,
  },
  catCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  catIcon: {
    fontSize: 22,
    lineHeight: 22,
  },
  catName: {
    fontFamily: typography.displaySemiBold,
    fontSize: 14,
    color: colors.textHeading,
    marginTop: 4,
  },
  catPos: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginTop: 3,
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 20,
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
  museumBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 16,
    marginBottom: 20,
  },
  museumBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.badge,
    backgroundColor: colors.accentGoldBright,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 8,
  },
  museumBadgeLabel: {
    fontFamily: typography.monoBold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: colors.ctaTextOnGold,
  },
  museumTitle: {
    fontFamily: typography.displaySemiBold,
    fontSize: 17,
    color: colors.textHeading,
  },
  museumSubtitle: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textBodyAlt,
    marginTop: 4,
  },
  list: {
    gap: 12,
  },
  empty: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 30,
  },
});
