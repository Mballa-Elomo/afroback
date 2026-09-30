import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { FeedItem } from '../data/useCommunityData';
import { relativeTime } from '../data/relativeTime';
import { colors, typography } from '../theme/tokens';
import { ProfileAvatar } from './ProfileAvatar';
import { Icon } from './Icons';

/**
 * Carte de post du fil (refonte moderne du 2026-09-30). Pas de compteur de
 * "j'aime" (aucun système de likes dans le modèle de données V1, mieux vaut
 * l'omettre que d'afficher un faux 0). Le partage est une vraie action
 * native (`Share.share`).
 */
export function PostCard({
  post,
  onPress,
  onOpenAuthor,
}: {
  post: FeedItem;
  onPress: () => void;
  onOpenAuthor: () => void;
}) {
  const share = () => {
    Share.share({ message: post.contenu_texte }).catch(() => {});
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Pressable onPress={onOpenAuthor} hitSlop={6} accessibilityRole="button" accessibilityLabel={post.author?.pseudo ?? 'Membre'}>
          <ProfileAvatar value={post.author?.avatar_url} size={42} name={post.author?.pseudo} />
        </Pressable>
        <View style={styles.headerBody}>
          <Pressable onPress={onOpenAuthor} hitSlop={4}>
            <Text style={styles.author} numberOfLines={1}>
              {post.author?.pseudo ?? 'Membre supprimé'}
            </Text>
          </Pressable>
          <Text style={styles.time}>{relativeTime(post.created_at)}</Text>
        </View>
      </View>

      <Pressable onPress={onPress}>
        <Text style={styles.text} numberOfLines={6}>
          {post.contenu_texte}
        </Text>
        {post.image_url && (
          <Image source={{ uri: post.image_url }} style={styles.photo} contentFit="cover" transition={200} cachePolicy="memory-disk" />
        )}
      </Pressable>

      <View style={styles.footerRow}>
        <Pressable onPress={onPress} style={styles.footerBtn} accessibilityRole="button" accessibilityLabel="Commentaires">
          <Icon name="chat" size={16} color={colors.accentGoldPale} />
          <Text style={styles.footerLabel}>{post.commentCount}</Text>
        </Pressable>
        <Pressable onPress={share} style={styles.footerBtn} accessibilityRole="button" accessibilityLabel="Partager">
          <Icon name="share" size={16} color={colors.accentGoldPale} />
          <Text style={styles.footerLabel}>Partager</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26,19,13,.95)',
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    borderRadius: 22,
    padding: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  headerBody: { flex: 1, minWidth: 0 },
  author: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.textPrimary },
  time: { fontFamily: typography.body, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  text: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textBody },
  photo: {
    height: 210,
    borderRadius: 16,
    marginTop: 12,
    backgroundColor: colors.placeholderStripeDark,
  },
  footerRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(240,195,107,.08)',
  },
  footerLabel: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.accentGoldPale },
});
