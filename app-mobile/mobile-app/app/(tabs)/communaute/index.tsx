import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../../src/components/PostCard';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { useFeedPosts } from '../../../src/data/useCommunityData';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

type Sort = 'recent' | 'popular';

/**
 * Fil communautaire — fidèle à design-reference-communaute.dc.excerpt.html
 * (section COMMUNITY). Simplifications assumées documentées dans
 * mobile-app/README.md : pas de catégories/tags de post (aucune colonne
 * dédiée dans le schéma) ; "Populaire" trie par nombre de commentaires
 * (proxy honnête d'engagement, faute de système de likes) ; l'"Espace
 * exclusif" (bouton ✦) affiche un "bientôt disponible" honnête, le pilier
 * Abonnement n'étant pas encore activé.
 */
export default function CommunauteScreen() {
  const router = useRouter();
  const [feedState, refresh] = useFeedPosts();
  const posts = feedState.status === 'ready' ? feedState.data : [];
  const [sort, setSort] = useState<Sort>('recent');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const sorted = useMemo(() => {
    const copy = [...posts];
    if (sort === 'popular') copy.sort((a, b) => b.commentCount - a.commentCount);
    return copy;
  }, [posts, sort]);

  const openExclusive = () =>
    Alert.alert('Bientôt disponible', "L'espace exclusif abonnés n'est pas encore activé sur AFROBACK.");

  if (feedState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Le fil se prépare..." />
      </SafeAreaView>
    );
  }
  if (feedState.status === 'error') {
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
          <Text style={styles.title}>Communauté</Text>
          <Pressable onPress={openExclusive} style={styles.exclusiveBtn}>
            <Text style={styles.exclusiveLabel}>✦ Espace exclusif</Text>
          </Pressable>
        </View>

        <View style={styles.sortRow}>
          <Pressable onPress={() => setSort('recent')}>
            <Text style={[styles.sortLabel, sort === 'recent' && styles.sortLabelActive]}>Récent</Text>
          </Pressable>
          <Pressable onPress={() => setSort('popular')}>
            <Text style={[styles.sortLabel, sort === 'popular' && styles.sortLabelActive]}>Populaire</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {sorted.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPress={() => router.push(`/communaute/post/${post.id}`)}
              onOpenAuthor={() => post.author && router.push(`/communaute/profil/${post.author.id}`)}
            />
          ))}
          {sorted.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Sois parmi les premiers à partager sur AFROBACK.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/communaute/create')}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
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
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 19,
    fontWeight: '600',
    color: colors.textHeading,
  },
  exclusiveBtn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.cardBg,
    borderRadius: radii.badge,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  exclusiveLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 11.5,
    color: colors.accentGold,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  sortLabel: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  sortLabelActive: {
    color: colors.accentGold,
    fontFamily: typography.bodyBold,
  },
  list: {
    gap: 14,
  },
  empty: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabIcon: {
    fontSize: 26,
    fontWeight: '300',
    color: colors.ctaTextOnGold,
    marginTop: -2,
  },
});
