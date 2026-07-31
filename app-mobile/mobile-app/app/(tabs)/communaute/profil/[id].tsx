import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroPlaceholder } from '../../../../src/components/HeroVisual';
import { ErrorState, LoadingState } from '../../../../src/components/LoadingState';
import { getPostsByAuthor, getPublicProfileById } from '../../../../src/data/communityRepository';
import type { CommunityPost, CommunityProfilePublic } from '../../../../src/data/communityTypes';
import { colors, spacing, typography } from '../../../../src/theme/tokens';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'notfound' }
  | { status: 'ready'; profile: CommunityProfilePublic; posts: CommunityPost[] };

/**
 * Profil membre — fidèle à design-reference-communaute.dc.excerpt.html
 * (section MEMBER PROFILE), avec deux simplifications assumées documentées
 * dans mobile-app/README.md : pas de bouton "Suivre" (aucun système
 * d'abonnement entre membres dans le schéma), et un seul indicateur réel —
 * le nombre de posts publiés — remplace les 3 statistiques de gamification
 * de la maquette (série de jours, récits lus, badges), qui n'existent pas
 * dans le modèle de données.
 */
export default function MemberProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setState({ status: 'loading' });
    Promise.all([getPublicProfileById(id), getPostsByAuthor(id)])
      .then(([profile, posts]) => {
        if (!alive) return;
        if (!profile) setState({ status: 'notfound' });
        else setState({ status: 'ready', profile, posts });
      })
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [id]);

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

  const { profile, posts } = state;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>

        <View style={styles.header}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <HeroPlaceholder style={styles.avatar} radius={40} />
          )}
          <Text style={styles.pseudo}>{profile.pseudo}</Text>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        </View>

        <View style={styles.statTile}>
          <Text style={styles.statValue}>{posts.length}</Text>
          <Text style={styles.statLabel}>Post{posts.length > 1 ? 's' : ''} publié{posts.length > 1 ? 's' : ''}</Text>
        </View>

        <Text style={styles.sectionTitle}>PUBLICATIONS RÉCENTES</Text>
        <View style={styles.list}>
          {posts.map((p) => (
            <Pressable key={p.id} style={styles.postCard} onPress={() => router.push(`/communaute/post/${p.id}`)}>
              <Text style={styles.postText} numberOfLines={3}>
                {p.contenu_texte}
              </Text>
            </Pressable>
          ))}
          {posts.length === 0 && <Text style={styles.empty}>Ce membre n'a encore rien publié.</Text>}
        </View>
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
  back: {
    marginBottom: 8,
  },
  backIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    marginBottom: 12,
  },
  pseudo: {
    fontFamily: typography.display,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textHeading,
  },
  bio: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textBodyAlt,
    marginTop: 10,
    maxWidth: 260,
    textAlign: 'center',
    lineHeight: 19,
  },
  statTile: {
    alignSelf: 'center',
    minWidth: 140,
    backgroundColor: colors.surfaceCardDeep,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 22,
  },
  statValue: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.accentGold,
  },
  statLabel: {
    fontFamily: typography.body,
    fontSize: 9.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 12,
  },
  list: {
    gap: 12,
  },
  postCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },
  postText: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textBody,
  },
  empty: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
