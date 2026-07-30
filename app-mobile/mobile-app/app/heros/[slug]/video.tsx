import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { GhostButton, OutlineButton } from '../../../src/components/Buttons';
import { HeroPlaceholder } from '../../../src/components/HeroVisual';
import { StoryboardSlideshow } from '../../../src/components/StoryboardSlideshow';
import { useHero, useRelatedHeroes } from '../../../src/data/useHeroesData';
import { colors, spacing, typography } from '../../../src/theme/tokens';

/**
 * Lecteur vidéo plein écran. Dès qu'une URL de documentaire existe
 * (video_url, ex. Martin Paul Samba), un vrai lecteur (expo-video,
 * contrôles natifs) prend le relais. Tant qu'aucun documentaire n'est
 * produit, la zone vidéo affiche le diaporama animé du storyboard
 * (`StoryboardSlideshow`) plutôt qu'un état "bientôt disponible" vide :
 * les 96 planches et leur voix off existent déjà pour les 9 héros, ça
 * donne quelque chose de réel à voir en attendant le vrai tournage/montage.
 */
export default function LecteurVideoScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const herosState = useHero(slug);
  const heros = herosState.status === 'ready' ? herosState.data : undefined;
  const related = useRelatedHeroes(heros);

  if (herosState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (herosState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  if (!heros) return <Redirect href="/accueil" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.topBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {heros.nom_affiche}
          </Text>
          <Text style={styles.topSub}>
            {heros.video_url ? 'DOCUMENTAIRE' : 'APERÇU STORYBOARD'} · {heros.region.toUpperCase()}
          </Text>
        </View>
        <View style={styles.topBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {heros.video_url ? (
          <VideoPlayerArea uri={heros.video_url} />
        ) : heros.chapitres_storyboard.some((c) => c.planches.length > 0) ? (
          <StoryboardSlideshow chapitres={heros.chapitres_storyboard} />
        ) : (
          <View style={styles.videoArea}>
            <View style={styles.playCircle}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.videoLabel}>DOCUMENTAIRE BIENTÔT DISPONIBLE</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{heros.nom_affiche} — l'histoire en vidéo</Text>
          <Text style={styles.meta}>
            DOCUMENTAIRE · {heros.region} · {heros.annee_naissance_indicative ?? heros.epoque}
          </Text>

          {!heros.video_url && (
            <View style={styles.missingBanner}>
              <Text style={styles.missingText}>
                🎬 Le documentaire n'est pas encore tourné — voici le storyboard complet en avant-goût, planche par
                planche.
              </Text>
            </View>
          )}

          <Text style={styles.blurb}>{heros.resume_catalogue}</Text>

          <View style={styles.actions}>
            <View style={styles.actionsHalf}>
              <GhostButton label="Lire l'histoire" onPress={() => router.push(`/heros/${heros.slug}/recit`)} />
            </View>
            <View style={styles.actionsHalf}>
              <OutlineButton label="▶ Écouter" onPress={() => router.push(`/heros/${heros.slug}/audio`)} />
            </View>
          </View>

          {related.length > 0 && (
            <View style={styles.related}>
              <Text style={styles.relatedLabel}>AUTRES VIDÉOS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
                {related.map((h) => (
                  <Pressable key={h.slug} style={styles.relatedItem} onPress={() => router.replace(`/heros/${h.slug}/video`)}>
                    <HeroPlaceholder style={styles.relatedVisual} radius={12} imageUrl={h.image_carte_catalogue}>
                      <Text style={styles.relatedPlay}>▶</Text>
                    </HeroPlaceholder>
                    <Text style={styles.relatedName} numberOfLines={2}>
                      {h.nom_affiche}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Lecteur vidéo réel (expo-video, contrôles natifs) une fois qu'une URL de documentaire existe pour ce héros. */
function VideoPlayerArea({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      style={styles.videoArea}
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      nativeControls
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundVideo,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 10,
  },
  topBtn: {
    width: 32,
  },
  closeIcon: {
    fontSize: 20,
    color: '#fff',
  },
  topCenter: {
    flex: 1,
  },
  topTitle: {
    fontFamily: typography.displaySemiBold,
    fontSize: 15,
    color: '#fff',
  },
  topSub: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  videoArea: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.placeholderStripeDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  playCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(240,195,107,0.16)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: colors.accentGold,
  },
  videoLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  body: {
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: typography.displaySemiBold,
    fontSize: 20,
    lineHeight: 23,
    color: colors.textHeading,
  },
  meta: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 14,
  },
  missingBanner: {
    backgroundColor: colors.terracottaBg,
    borderWidth: 1,
    borderColor: colors.terracottaBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  missingText: {
    fontFamily: typography.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.terracottaText,
  },
  blurb: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 21,
    color: colors.textBodyAlt,
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.xl,
  },
  actionsHalf: {
    flex: 1,
  },
  related: {},
  relatedLabel: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 12,
  },
  relatedRow: {
    gap: 12,
    paddingBottom: 4,
  },
  relatedItem: {
    width: 150,
  },
  relatedVisual: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedPlay: {
    fontSize: 20,
    color: '#fff',
  },
  relatedName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 6,
  },
});
