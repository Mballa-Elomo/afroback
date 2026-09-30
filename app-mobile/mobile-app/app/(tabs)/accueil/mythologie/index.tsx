import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ErrorState } from '../../../../src/components/LoadingState';
import { HeroPlaceholder } from '../../../../src/components/HeroVisual';
import { Icon } from '../../../../src/components/Icons';
import { useMythesGroupedByZone } from '../../../../src/data/useMythologieData';
import type { Mythe } from '../../../../src/data/mythologieTypes';
import { colors, typography } from '../../../../src/theme/tokens';
import { AccessBadge } from '../../../../src/access/Access';
import { Bone, LikeBadge, PressableScale, ScreenHeader, SkeletonScreen } from '../../../../src/ui/modern';
import { useLikeCounts } from '../../../../src/stats/contentStats';

/**
 * Liste Mythologie, groupée par zone (refonte moderne du 2026-09-30) :
 * en-tête, recherche, grandes cartes photo avec peuple, titre, résumé et les
 * formats disponibles. Filigrane quand l'illustration n'est pas encore en ligne.
 */
export default function MythologieListScreen() {
  const router = useRouter();
  const groupsState = useMythesGroupedByZone();
  const [query, setQuery] = useState('');
  const groups = groupsState.status === 'ready' ? groupsState.data : [];
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const likes = useLikeCounts('mythe', groups.flatMap((g) => g.items.map((m) => m.slug)));

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        zone: g.zone,
        items: g.items.filter(
          (m) => m.titre.toLowerCase().includes(q) || m.peuple.toLowerCase().includes(q) || m.theme.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  if (groupsState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenHeader
          title="Mythologie africaine"
          subtitle={total > 0 ? `${total} mythes fondateurs, racontés par les peuples` : undefined}
          onBack={() => router.back()}
        />

        <View style={styles.pad}>
          <View style={styles.search}>
            <Icon name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Un peuple, un dieu, un mythe…"
              placeholderTextColor={colors.textMuted}
              style={[styles.searchInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Effacer">
                <Text style={styles.clear}>✕</Text>
              </Pressable>
            )}
          </View>

          {groupsState.status === 'loading' ? (
            <SkeletonScreen>
              <Bone style={{ height: 300, borderRadius: 24, marginTop: 20 }} />
              <Bone style={{ height: 300, borderRadius: 24, marginTop: 16 }} />
            </SkeletonScreen>
          ) : query.trim().length > 0 && filteredGroups.length === 0 ? (
            <Text style={styles.noResults}>Aucun mythe ne correspond à « {query} ».</Text>
          ) : (
            filteredGroups.map((g) => (
              <View key={g.zone}>
                <Text style={styles.zone}>{g.zone}</Text>
                <View style={{ gap: 16 }}>
                  {g.items.map((m) => (
                    <MytheCard key={m.slug} mythe={m} likes={likes.get(m.slug)} onPress={() => router.push(`/accueil/mythologie/${m.slug}`)} />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MytheCard({ mythe, onPress, likes }: { mythe: Mythe; onPress: () => void; likes?: number }) {
  return (
    <PressableScale onPress={onPress} style={styles.card} accessibilityLabel={mythe.titre}>
      <HeroPlaceholder style={styles.cover} radius={0} imageUrl={mythe.image_url} fallbackIcon="book">
        <LinearGradient colors={['rgba(8,6,4,0)', 'rgba(8,6,4,0.85)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
        <AccessBadge type="mythe" slug={mythe.slug} style={{ top: 12, right: 12 }} />
        <LikeBadge count={likes} />
        <View style={styles.peuple}>
          <View style={[styles.dot, { backgroundColor: mythe.couleur }]} />
          <Text style={styles.peupleText} numberOfLines={1}>
            {capitalize(mythe.peuple.split(/[,(]/)[0].trim())}
          </Text>
        </View>
      </HeroPlaceholder>
      <View style={styles.body}>
        <Text style={styles.title}>{mythe.titre}</Text>
        <Text style={styles.summary} numberOfLines={2}>
          {mythe.sous_titre}
        </Text>
        <View style={styles.formats}>
          <Format icon="book" label="Lire" />
          <Format icon="play" label="Écouter" />
          <Format icon="sparkle" label="Regarder" />
        </View>
      </View>
    </PressableScale>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Format({ icon, label }: { icon: 'book' | 'play' | 'sparkle'; label: string }) {
  return (
    <View style={styles.format}>
      <Icon name={icon} size={13} color={colors.accentGoldPale} strokeWidth={2.2} />
      <Text style={styles.formatText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0906' },
  scroll: { paddingBottom: 40 },
  pad: { paddingHorizontal: 18 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.12)',
    backgroundColor: 'rgba(26,19,13,.95)',
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, fontFamily: typography.body, fontSize: 14.5, color: colors.textPrimary, paddingVertical: 14 },
  clear: { fontSize: 14, color: colors.textMuted },
  noResults: { fontFamily: typography.body, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 30 },
  zone: { fontFamily: typography.display, fontSize: 19, color: colors.textHeading, marginTop: 26, marginBottom: 12 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  cover: { height: 190, borderWidth: 0 },
  peuple: {
    position: 'absolute',
    left: 14,
    bottom: 12,
    right: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  peupleText: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.accentGoldPale },
  body: { padding: 16 },
  title: { fontFamily: typography.display, fontSize: 19, lineHeight: 24, color: colors.textHeading },
  summary: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody, marginTop: 6 },
  formats: { flexDirection: 'row', gap: 8, marginTop: 12 },
  format: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(240,195,107,.10)',
  },
  formatText: { fontFamily: typography.bodySemiBold, fontSize: 11.5, color: colors.accentGoldPale },
});
