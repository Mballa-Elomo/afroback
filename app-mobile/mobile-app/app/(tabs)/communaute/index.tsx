import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostCard } from '../../../src/components/PostCard';
import { ErrorState } from '../../../src/components/LoadingState';
import { Icon } from '../../../src/components/Icons';
import { useFeedPosts } from '../../../src/data/useCommunityData';
import { colors, typography } from '../../../src/theme/tokens';
import { useAccess } from '../../../src/access/Access';
import { Bone, FilterChips, ScreenHeader, SkeletonScreen } from '../../../src/ui/modern';
import { useI18n } from '../../../src/i18n';

type Sort = 'recent' | 'popular';
const SORTS: { id: Sort; label: string }[] = [
  { id: 'recent', label: 'community.recent' },
  { id: 'popular', label: 'community.popular' },
];

/**
 * Fil communautaire (refonte moderne du 2026-09-30). "Populaire" trie par
 * nombre de commentaires (proxy honnête faute de système de likes) ;
 * l'"Espace exclusif" reste "bientôt disponible". Publier : réservé aux
 * abonnés (règle d'accès du 2026-09-29).
 */
export default function CommunauteScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { requireSubscription } = useAccess();
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

  const openExclusive = () => Alert.alert(t('community.soon'), t('community.exclusiveSoon'));

  if (feedState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={t('community.title')}
          subtitle={t('community.subtitle')}
          right={
            <Pressable onPress={openExclusive} style={styles.exclusive} accessibilityRole="button">
              <Icon name="crown" size={15} color={colors.accentGoldBright} />
              <Text style={styles.exclusiveText}>{t('community.exclusive')}</Text>
            </Pressable>
          }
        />
        <FilterChips options={SORTS.map((s) => ({ ...s, label: t(s.label) }))} value={sort} onChange={setSort} />

        <View style={styles.list}>
          {feedState.status === 'loading' ? (
            <SkeletonScreen>
              {[0, 1, 2].map((i) => (
                <Bone key={i} style={{ height: 170, borderRadius: 22, marginBottom: 14 }} />
              ))}
            </SkeletonScreen>
          ) : (
            <>
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
                  <View style={styles.emptyIcon}>
                    <Icon name="chat" size={30} color={colors.accentGoldBright} />
                  </View>
                  <Text style={styles.emptyTitle}>{t('community.calm')}</Text>
                  <Text style={styles.emptyText}>{t('community.calmText')}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => requireSubscription(() => router.push('/communaute/create'), 'publish')}
        accessibilityRole="button"
        accessibilityLabel={t('community.post')}
      >
        <Icon name="plus" size={20} color={colors.ctaTextOnGold} strokeWidth={2.6} />
        <Text style={styles.fabText}>{t('community.post')}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0906' },
  scroll: { paddingBottom: 110 },
  exclusive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
    backgroundColor: 'rgba(240,195,107,.08)',
  },
  exclusiveText: { fontFamily: typography.bodyBold, fontSize: 12.5, color: colors.accentGoldPale },
  list: { gap: 14, paddingHorizontal: 18, marginTop: 16 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, gap: 10 },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.10)',
  },
  emptyTitle: { fontFamily: typography.display, fontSize: 19, color: colors.textHeading },
  emptyText: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.textMuted, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentGoldBright,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.ctaTextOnGold },
});
