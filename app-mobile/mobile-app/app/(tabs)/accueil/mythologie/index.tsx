import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorState, LoadingState } from '../../../../src/components/LoadingState';
import { useMythesGroupedByZone } from '../../../../src/data/useMythologieData';
import type { Mythe } from '../../../../src/data/mythologieTypes';
import { colors, spacing, typography } from '../../../../src/theme/tokens';

/**
 * Liste Mythologie, groupée par zone — fidèle à
 * design-reference-mythologie.dc.excerpt.html (MYTHOLOGIE). 5 mythes réels
 * (livrables/sites-web/afroback/Récits africains/mythe-*.md). Vraie photo
 * si `image_url` existe (retrouvées le 2026-08-05, voir HeroHeader pour le
 * même pattern), sinon vignette "ILLUSTRATION" en placeholder comme un
 * héros sans photo produite.
 */
export default function MythologieListScreen() {
  const router = useRouter();
  const groupsState = useMythesGroupedByZone();
  const [query, setQuery] = useState('');

  const groups = groupsState.status === 'ready' ? groupsState.data : [];

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        zone: g.zone,
        items: g.items.filter(
          (m) =>
            m.titre.toLowerCase().includes(q) ||
            m.peuple.toLowerCase().includes(q) ||
            m.theme.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const noResults = query.trim().length > 0 && filteredGroups.length === 0;

  if (groupsState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Les mythes se préparent..." />
      </SafeAreaView>
    );
  }
  if (groupsState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Mythologie africaine</Text>
        </View>
        <Text style={styles.intro}>
          Mythes fondateurs et légendes toujours vivantes, transmis par la tradition orale des peuples du Cameroun.
        </Text>

        <View style={styles.search}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un peuple, un dieu, un mythe…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Text style={styles.searchClear}>✕</Text>
            </Pressable>
          )}
        </View>

        {noResults && <Text style={styles.noResults}>Aucun mythe ne correspond à « {query} ».</Text>}

        {filteredGroups.map((g) => (
          <View key={g.zone} style={styles.group}>
            <Text style={styles.zoneLabel}>{g.zone.toUpperCase()}</Text>
            <View style={styles.cards}>
              {g.items.map((m) => (
                <MytheCard key={m.slug} mythe={m} onPress={() => router.push(`/accueil/mythologie/${m.slug}`)} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function MytheCard({ mythe, onPress }: { mythe: Mythe; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.cover}>
        {mythe.image_url ? (
          <Image source={{ uri: mythe.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={['rgba(15,11,8,0)', 'rgba(15,11,8,0.9)']}
          locations={[0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        {!mythe.image_url && <Text style={styles.coverLabel}>ILLUSTRATION</Text>}
        <View style={[styles.coverDot, { backgroundColor: mythe.couleur }]} />
        <Text style={styles.coverPeuple}>{mythe.peuple.split(/[,(]/)[0].trim().toUpperCase()}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{mythe.titre}</Text>
        <Text style={styles.cardSummary} numberOfLines={2}>
          {mythe.sous_titre}
        </Text>
        <View style={styles.pills}>
          <Text style={styles.pill}>Lire</Text>
          <Text style={[styles.pill, styles.pillListen]}>▶ Écouter</Text>
          <Text style={styles.pill}>📖 BD</Text>
        </View>
      </View>
    </Pressable>
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
  intro: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textMutedAlt,
    marginBottom: 14,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 20,
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
  noResults: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 30,
  },
  group: {
    marginBottom: 24,
  },
  zoneLabel: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 12,
  },
  cards: {
    gap: 14,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  cover: {
    height: 120,
    overflow: 'hidden',
    backgroundColor: colors.placeholderStripeDark,
    justifyContent: 'flex-end',
    padding: 12,
  },
  coverLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontFamily: typography.mono,
    fontSize: 8,
    color: colors.placeholderLabel,
  },
  coverDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  coverPeuple: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.terracottaTextAlt,
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    fontFamily: typography.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textHeading,
    lineHeight: 19,
  },
  cardSummary: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  pill: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.accentGold,
    overflow: 'hidden',
  },
  pillListen: {
    backgroundColor: colors.terracottaBg,
    borderColor: colors.terracotta,
    color: colors.terracottaText,
  },
});
