import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import type { FeedItem } from '../data/useCommunityData';
import { relativeTime } from '../data/relativeTime';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { HeroPlaceholder } from './HeroVisual';

/**
 * Carte de post du fil — fidèle à design-reference-communaute.dc.excerpt.html
 * (section COMMUNITY), avec deux simplifications assumées documentées dans
 * mobile-app/README.md : pas de compteur ♥ (aucun système de likes dans le
 * modèle de données V1, mieux vaut l'omettre que d'afficher un faux 0), pas
 * de badges de rôle ni de "pillarLabel" (contenu lié) faute de colonnes
 * dédiées. Le partage (↗) est une vraie action native (`Share.share`), pas
 * un bouton décoratif.
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
        <Pressable onPress={onOpenAuthor} hitSlop={6}>
          {post.author?.avatar_url ? (
            <Image source={{ uri: post.author.avatar_url }} style={styles.avatar} />
          ) : (
            <HeroPlaceholder style={styles.avatar} radius={19} />
          )}
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
      </Pressable>

      {post.image_url && <Image source={{ uri: post.image_url }} style={styles.photo} resizeMode="cover" />}

      <View style={styles.footerRow}>
        <Pressable onPress={onPress} style={styles.footerItem}>
          <Text style={styles.footerLabel}>💬 {post.commentCount}</Text>
        </Pressable>
        <Pressable onPress={share} style={styles.footerItem}>
          <Text style={styles.footerLabel}>↗ Partager</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  headerBody: {
    flex: 1,
    minWidth: 0,
  },
  author: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  time: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.textMuted,
  },
  text: {
    fontFamily: typography.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textBody,
    marginBottom: 12,
  },
  photo: {
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    marginBottom: 12,
    backgroundColor: colors.placeholderStripeDark,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 20,
  },
  footerItem: {},
  footerLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
