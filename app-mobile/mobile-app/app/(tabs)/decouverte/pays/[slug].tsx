import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DecouverteItemRow } from '../../../../src/components/DecouverteItemRow';
import { SectionTitle } from '../../../../src/components/SectionTitle';
import { ErrorState, LoadingState } from '../../../../src/components/LoadingState';
import { useDecouverteItems, useDecouvertePays } from '../../../../src/data/useDecouverteData';
import { DECOUVERTE_TYPE_LABEL } from '../../../../src/data/decouverteDisplay';
import type { DecouverteType } from '../../../../src/data/decouverteTypes';
import { colors, spacing, typography } from '../../../../src/theme/tokens';

/**
 * Hub pays — fidèle à design-reference-decouverte.dc.excerpt.html (section
 * COUNTRY HUB), simplifié : un seul pays existe en base (Cameroun) donc pas
 * de sélecteur de pays. Les sections "Héros & histoire" et "Mythologie" de
 * la maquette ne sont pas construites : les héros n'ont pas de champ `pays`
 * dans leur modèle de données actuel, et il n'existe aucune donnée
 * structurée pour la mythologie (seulement des récits texte hors base) —
 * les fabriquer aurait demandé d'inventer une navigation vers du contenu
 * non modélisé. Seule la section "Culture & patrimoine", groupée par type,
 * reflète des données réelles. Voir mobile-app/README.md.
 */
export default function CountryHubScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const paysState = useDecouvertePays();
  const itemsState = useDecouverteItems();

  const pays = paysState.status === 'ready' ? paysState.data.find((p) => p.slug === slug) : undefined;
  const items = itemsState.status === 'ready' ? itemsState.data.filter((it) => it.pays === pays?.nom) : [];

  const grouped = useMemo(() => {
    const order: DecouverteType[] = ['village', 'coutume', 'objet', 'personnage', 'fait'];
    return order
      .map((type) => ({ type, items: items.filter((it) => it.type === type) }))
      .filter((g) => g.items.length > 0);
  }, [items]);

  if (itemsState.status === 'loading' || paysState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }
  if (itemsState.status === 'error' || paysState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }
  if (paysState.status === 'ready' && !pays) return <Redirect href="/decouverte" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.headerBody}>
            <Text style={styles.eyebrow}>EXPLORER LE PAYS</Text>
            <Text style={styles.title}>{pays?.nom}</Text>
          </View>
        </View>
        {pays?.resume && <Text style={styles.intro}>{pays.resume}</Text>}

        {grouped.map((group) => (
          <View key={group.type} style={styles.section}>
            <SectionTitle title={DECOUVERTE_TYPE_LABEL[group.type] + 's'} />
            <View style={styles.list}>
              {group.items.map((item) => (
                <DecouverteItemRow key={item.slug} item={item} onPress={() => router.push(`/decouverte/${item.slug}`)} />
              ))}
            </View>
          </View>
        ))}

        {grouped.length === 0 && <Text style={styles.empty}>Contenu à venir pour {pays?.nom}.</Text>}
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
    marginBottom: 6,
  },
  back: {},
  backIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  headerBody: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1.4,
    color: colors.terracottaTextAlt,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 27,
  },
  intro: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMutedAlt,
    marginBottom: 22,
    paddingLeft: 2,
  },
  section: {
    marginBottom: 24,
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
