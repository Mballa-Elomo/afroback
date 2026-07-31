import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateProfileForm } from '../../../../src/components/CreateProfileForm';
import { ErrorState, LoadingState } from '../../../../src/components/LoadingState';
import { HeroPlaceholder } from '../../../../src/components/HeroVisual';
import { createComment, getPostWithComments } from '../../../../src/data/communityRepository';
import { useOwnProfile } from '../../../../src/data/useCommunityData';
import { relativeTime } from '../../../../src/data/relativeTime';
import type { CommunityCommentWithAuthor, CommunityPostWithAuthor } from '../../../../src/data/communityTypes';
import { colors, radii, spacing, typography } from '../../../../src/theme/tokens';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notfound' }
  | { status: 'ready'; post: CommunityPostWithAuthor; comments: CommunityCommentWithAuthor[] };

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [ownProfileState, refreshOwnProfile] = useOwnProfile();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setState({ status: 'loading' });
    getPostWithComments(id)
      .then(({ post, comments }) => {
        if (!post) setState({ status: 'notfound' });
        else setState({ status: 'ready', post, comments });
      })
      .catch(() => setState({ status: 'error' }));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const share = () => {
    if (state.status !== 'ready') return;
    // Pas de lien public à ajouter pour l'instant : l'app n'est pas encore sur
    // les stores, et la diffusion du site one-page reste une décision ouverte
    // (voir context/AFROBACK.md). La signature évite un partage anonyme en
    // attendant qu'un vrai lien existe.
    const message = `${state.post.contenu_texte}\n\n— partagé depuis AFROBACK`;
    Share.share({ message }).catch(() => {});
  };

  const sendComment = async () => {
    if (state.status !== 'ready' || ownProfileState.status !== 'ready' || !ownProfileState.data) return;
    if (draft.trim().length === 0) return;
    setSending(true);
    const { error } = await createComment({
      authorProfileId: ownProfileState.data.id,
      postId: state.post.id,
      contenuTexte: draft.trim(),
    });
    setSending(false);
    if (!error) {
      setDraft('');
      load();
    }
  };

  if (state.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }
  if (state.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }
  if (state.status === 'notfound') return <Redirect href="/communaute" />;

  const { post, comments } = state;

  // edges inclut désormais 'top' (retour de test Yannick du 2026-07-31) :
  // ce header n'a pas d'image en fond, `edges={['bottom']}` seul laissait le
  // bouton retour ‹ trop proche de l'encoche/status bar, sans raison d'immersion.
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/communaute/signaler',
                params: { targetType: 'post', targetId: post.id, label: post.contenu_texte.slice(0, 80) },
              })
            }
          >
            <Text style={styles.reportLabel}>⚑ Signaler</Text>
          </Pressable>
        </View>

        <View style={styles.authorRow}>
          <Pressable onPress={() => post.author && router.push(`/communaute/profil/${post.author.id}`)}>
            {post.author?.avatar_url ? (
              <Image source={{ uri: post.author.avatar_url }} style={styles.avatar} />
            ) : (
              <HeroPlaceholder style={styles.avatar} radius={22} />
            )}
          </Pressable>
          <View>
            <Text style={styles.authorName}>{post.author?.pseudo ?? 'Membre supprimé'}</Text>
            <Text style={styles.time}>{relativeTime(post.created_at)}</Text>
          </View>
        </View>

        <Text style={styles.text}>{post.contenu_texte}</Text>
        {post.image_url && <Image source={{ uri: post.image_url }} style={styles.photo} resizeMode="cover" />}

        <View style={styles.statsRow}>
          <Text style={styles.statLabel}>💬 {comments.length}</Text>
          <Pressable onPress={share}>
            <Text style={styles.statLabel}>↗ Partager</Text>
          </Pressable>
        </View>

        <Text style={styles.commentsLabel}>COMMENTAIRES</Text>
        <View style={styles.commentsList}>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              {c.author?.avatar_url ? (
                <Image source={{ uri: c.author.avatar_url }} style={styles.commentAvatar} />
              ) : (
                <HeroPlaceholder style={styles.commentAvatar} radius={16} />
              )}
              <View style={styles.commentBubble}>
                <Text style={styles.commentAuthor}>{c.author?.pseudo ?? 'Membre supprimé'}</Text>
                <Text style={styles.commentText}>{c.contenu_texte}</Text>
              </View>
            </View>
          ))}
          {comments.length === 0 && <Text style={styles.noComments}>Aucun commentaire pour l'instant.</Text>}
        </View>

        {ownProfileState.status === 'ready' && !ownProfileState.data ? (
          <CreateProfileForm onCreated={refreshOwnProfile} />
        ) : (
          <View style={styles.commentInputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor={colors.textMuted}
              style={styles.commentInput}
              maxLength={500}
            />
            <Pressable onPress={sendComment} style={styles.sendBtn} disabled={sending}>
              <Text style={styles.sendLabel}>{sending ? '...' : 'Envoyer'}</Text>
            </Pressable>
          </View>
        )}
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
    marginBottom: 16,
  },
  backIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  headerTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textHeading,
  },
  reportLabel: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.reportColor,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  authorName: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  time: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  text: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textBody,
    marginBottom: 14,
  },
  photo: {
    height: 200,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    marginBottom: 14,
    backgroundColor: colors.placeholderStripeDark,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderHairline,
    marginBottom: 18,
  },
  statLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textBodyAlt,
  },
  commentsLabel: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 12,
  },
  commentsList: {
    gap: 12,
    marginBottom: 18,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  commentAuthor: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  commentText: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textBodyAlt,
  },
  noComments: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
  },
  sendBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.accentGoldBright,
  },
  sendLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.ctaTextOnGold,
  },
});
