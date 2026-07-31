import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateProfileForm } from '../../../src/components/CreateProfileForm';
import { LoadingState } from '../../../src/components/LoadingState';
import { PhotoPicker } from '../../../src/components/PhotoPicker';
import { createPost } from '../../../src/data/communityRepository';
import { useOwnProfile } from '../../../src/data/useCommunityData';
import { colors, radii, spacing, typography } from '../../../src/theme/tokens';

const MAX_LEN = 500;

/**
 * Création de post — fidèle à design-reference-communaute.dc.excerpt.html
 * (section CREATE POST). L'ajout de photo est réellement branché depuis le
 * 2026-07-31 (bucket `user-uploads`, voir `src/data/uploadImage.ts`) — ce
 * n'était qu'une simplification temporaire, plus une limitation. Seule la
 * section "Lier un contenu" reste omise (aucune colonne de liaison
 * post↔contenu dans le schéma actuel).
 */
export default function CreatePostScreen() {
  const router = useRouter();
  const [ownProfileState, refreshOwnProfile] = useOwnProfile();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const publish = async () => {
    if (ownProfileState.status !== 'ready' || !ownProfileState.data) return;
    if (text.trim().length === 0) return;
    setPublishing(true);
    const { post, error } = await createPost({
      authorProfileId: ownProfileState.data.id,
      contenuTexte: text.trim(),
      imageUrl,
    });
    setPublishing(false);
    if (error || !post) {
      Alert.alert('Un souci est survenu', error ?? 'Impossible de publier ce post pour le moment.');
      return;
    }
    if (post.statut === 'masque_filtre_auto') {
      Alert.alert(
        'Post masqué automatiquement',
        "Ce post ne respecte peut-être pas la charte communautaire et n'est pas visible publiquement. Tu peux le modifier depuis ton profil."
      );
      router.replace('/communaute');
      return;
    }
    router.replace(`/communaute/post/${post.id}`);
  };

  if (ownProfileState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
          <Text style={styles.title}>Créer un post</Text>
          <View style={{ flex: 1 }} />
          {ownProfileState.status === 'ready' && ownProfileState.data && (
            <Pressable onPress={publish} style={styles.publishBtn} disabled={publishing}>
              <Text style={styles.publishLabel}>{publishing ? '...' : 'Publier'}</Text>
            </Pressable>
          )}
        </View>

        {ownProfileState.status === 'ready' && !ownProfileState.data ? (
          <CreateProfileForm onCreated={refreshOwnProfile} />
        ) : (
          <>
            <TextInput
              value={text}
              onChangeText={(t) => setText(t.slice(0, MAX_LEN))}
              placeholder="Partage une histoire, une question, un souvenir..."
              placeholderTextColor={colors.textMuted}
              style={styles.textarea}
              multiline
              maxLength={MAX_LEN}
            />
            <Text style={styles.counter}>
              {text.length}/{MAX_LEN}
            </Text>

            <View style={styles.photoWrap}>
              <PhotoPicker folder="posts" value={imageUrl} onChange={setImageUrl} />
            </View>

            <View style={styles.charterNote}>
              <Text style={styles.charterIcon}>ℹ</Text>
              <Text style={styles.charterText}>
                En publiant, tu acceptes de respecter la{' '}
                <Text style={styles.charterLink} onPress={() => router.push('/communaute/charte')}>
                  charte communautaire
                </Text>
                .
              </Text>
            </View>
          </>
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
    marginBottom: 18,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textHeading,
  },
  publishBtn: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: colors.accentGoldBright,
  },
  publishLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.ctaTextOnGold,
  },
  textarea: {
    minHeight: 120,
    fontFamily: typography.body,
    fontSize: 14.5,
    lineHeight: 22,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 14,
    padding: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  counter: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 14,
  },
  photoWrap: {
    marginBottom: 18,
  },
  charterNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    padding: 14,
  },
  charterIcon: {
    color: colors.accentGoldSoft,
    fontSize: 13,
  },
  charterText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textMuted,
  },
  charterLink: {
    color: colors.accentGold,
    textDecorationLine: 'underline',
  },
});
