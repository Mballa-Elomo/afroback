import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { useRequireAccount } from '../auth/AccountWall';
import { useAccess } from '../access/Access';
import { Icon } from '../components/Icons';
import type { ContentType } from '../data/contentAccess';
import { listComments } from '../comments/commentsApi';
import { colors, typography } from '../theme/tokens';
import { getContentStats, likeContent, plural, compactNumber, type ContentStats } from './contentStats';

const GOLD = colors.accentGoldBright;
const SITE = 'https://afroback-test.vercel.app';
const PATH: Record<ContentType, string> = { heros: '/accueil/heros/', mythe: '/accueil/mythologie/', decouverte: '/decouverte/' };

/**
 * Sous le titre d'une fiche (cdc-jaime-compteurs.md) : ligne de statistiques
 * façon YouTube ("12,4 k lectures · 3,1 k écoutes · 845 vues", compteurs à
 * zéro masqués) puis rangée d'actions en pastilles : J'aime, Commentaires,
 * Partager.
 */
export function ContentActions({
  type,
  slug,
  title,
  onOpenComments,
}: {
  type: ContentType;
  slug: string;
  title: string;
  /** Fait défiler jusqu'aux commentaires. */
  onOpenComments?: () => void;
}) {
  const { session } = useAuth();
  const requireAccount = useRequireAccount();
  const { requireSubscription } = useAccess();
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [comments, setComments] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const pop = useRef(new Animated.Value(1)).current;

  const load = useCallback(async () => {
    const [s, c] = await Promise.all([getContentStats(type, slug), listComments(type, slug, 'recents', 0)]);
    if (s) setStats(s);
    if (c.data) setComments(c.data.total);
  }, [type, slug]);

  useEffect(() => {
    load();
  }, [load, session?.user?.id]);

  const toggleLike = async () => {
    if (!session) return requireAccount(undefined, 'like');
    if (stats && stats.peut_aimer === false) return requireSubscription(() => {}, type);
    if (!stats || busy) return;
    const like = !stats.aime;
    setBusy(true);
    setStats({ ...stats, aime: like, likes: Math.max(0, stats.likes + (like ? 1 : -1)) });
    if (like) {
      Animated.sequence([
        Animated.spring(pop, { toValue: 1.3, useNativeDriver: Platform.OS !== 'web', speed: 60, bounciness: 12 }),
        Animated.spring(pop, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 40 }),
      ]).start();
    }
    const res = await likeContent(type, slug, like);
    setBusy(false);
    if (res.likes !== undefined) setStats((s) => (s ? { ...s, aime: like, likes: res.likes! } : s));
    else setStats((s) => (s ? { ...s, aime: !like, likes: Math.max(0, s.likes + (like ? -1 : 1)) } : s));
  };

  const share = () => {
    const url = `${SITE}${PATH[type]}${slug}`;
    Share.share({ message: `${title} sur AFROBACK : ${url}`, url, title }).catch(() => {});
  };

  const parts: string[] = [];
  if (stats?.lectures) parts.push(plural(stats.lectures, 'lecture', 'lectures'));
  if (stats?.ecoutes) parts.push(plural(stats.ecoutes, 'écoute', 'écoutes'));
  if (stats?.vues) parts.push(plural(stats.vues, 'vue', 'vues'));

  return (
    <View style={styles.wrap}>
      {parts.length > 0 && <Text style={styles.stats}>{parts.join('  ·  ')}</Text>}
      <View style={styles.row}>
        <Pressable
          onPress={toggleLike}
          style={[styles.pill, stats?.aime && styles.pillOn]}
          accessibilityRole="button"
          accessibilityState={{ selected: !!stats?.aime }}
          accessibilityLabel={stats?.aime ? "Je n'aime plus" : "J'aime"}
        >
          <Animated.View style={{ transform: [{ scale: pop }] }}>
            <Icon name="thumbUp" size={17} color={stats?.aime ? colors.ctaTextOnGold : colors.textPrimary} strokeWidth={stats?.aime ? 2.4 : 1.9} />
          </Animated.View>
          <Text style={[styles.pillText, stats?.aime && styles.pillTextOn]}>
            {stats && stats.likes > 0 ? compactNumber(stats.likes) : "J'aime"}
          </Text>
        </Pressable>
        {!!onOpenComments && (
          <Pressable onPress={onOpenComments} style={styles.pill} accessibilityRole="button">
            <Icon name="chat" size={17} color={colors.textPrimary} strokeWidth={1.9} />
            <Text style={styles.pillText}>{comments ? compactNumber(comments) : 'Commenter'}</Text>
          </Pressable>
        )}
        <Pressable onPress={share} style={styles.pill} accessibilityRole="button">
          <Icon name="share" size={17} color={colors.textPrimary} strokeWidth={1.9} />
          <Text style={styles.pillText}>Partager</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  stats: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.textMuted, marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(237,227,212,.09)',
  },
  pillOn: { backgroundColor: GOLD },
  pillText: { fontFamily: typography.bodySemiBold, fontSize: 13.5, color: colors.textPrimary },
  pillTextOn: { color: colors.ctaTextOnGold },
});
