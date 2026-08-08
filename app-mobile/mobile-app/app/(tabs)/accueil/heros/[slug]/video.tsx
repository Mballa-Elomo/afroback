import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { ErrorState, LoadingState } from '../../../../../src/components/LoadingState';
import { GhostButton, OutlineButton } from '../../../../../src/components/Buttons';
import { HeroPlaceholder } from '../../../../../src/components/HeroVisual';
import { StoryboardSlideshow } from '../../../../../src/components/StoryboardSlideshow';
import { useHero, useRelatedHeroes } from '../../../../../src/data/useHeroesData';
import { recordHeroEngagement, recordVideoChapterEngagement } from '../../../../../src/data/engagementRepository';
import { colors, spacing, typography } from '../../../../../src/theme/tokens';
import type { Heros } from '../../../../../src/data/types';

/**
 * Lecteur vidéo plein écran. Dès qu'une URL de documentaire existe
 * (video_url, ex. Martin Paul Samba), un vrai lecteur (expo-video,
 * contrôles natifs) prend le relais. Tant qu'aucun documentaire n'est
 * produit, la zone vidéo affiche le diaporama animé du storyboard
 * (`StoryboardSlideshow`) plutôt qu'un état "bientôt disponible" vide :
 * les 96 planches et leur voix off existent déjà pour les 9 héros, ça
 * donne quelque chose de réel à voir en attendant le vrai tournage/montage.
 * Écran nesté dans l'onglet Accueil (voir accueil/_layout.tsx) : la barre
 * d'onglets basse est volontairement masquée ici via BottomTabBar (lecteur
 * plein écran immersif).
 */
export default function LecteurVideoScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const herosState = useHero(slug);
  const heros = herosState.status === 'ready' ? herosState.data : undefined;
  const related = useRelatedHeroes(heros);
  const [chapterIdx, setChapterIdx] = useState(0);
  const engagementLoggedRef = useRef(false);

  useEffect(() => {
    setChapterIdx(0);
  }, [slug]);

  // Engagement réel (voir "ENGAGEMENT GLOBAL" côté back-office) : compté
  // dès qu'il y a du vrai contenu vidéo à voir — documentaire (unique ou par
  // chapitre) OU diaporama animé du storyboard (planches réelles, pas un
  // texte inventé, voir le commentaire en tête de fichier) — jamais quand
  // l'écran n'affiche que le placeholder statique "DOCUMENTAIRE BIENTÔT
  // DISPONIBLE" sans aucun storyboard derrière.
  useEffect(() => {
    if (engagementLoggedRef.current || !heros) return;
    const hasRealVideoContent =
      Boolean(heros.video_url) ||
      (heros.video_chapitres ?? []).length > 0 ||
      heros.chapitres_storyboard.some((c) => c.planches.length > 0);
    if (!hasRealVideoContent) return;
    engagementLoggedRef.current = true;
    recordHeroEngagement(heros.id, 'video');
  }, [heros]);

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

  // Deux modèles coexistent : `video_url` (documentaire complet, un seul
  // fichier — ex. Martin Paul Samba) et `video_chapitres` (documentaire
  // tourné chapitre par chapitre, aligné sur les 4 chapitres du récit/
  // storyboard — ex. Reine Nzinga, chapitre 1 seul tourné à ce jour). Un
  // héros n'a jamais les deux à la fois.
  const videoChapitres = heros.video_chapitres ?? [];
  const hasChapterVideos = videoChapitres.length > 0;
  const storyboardChapitres = heros.chapitres_storyboard;
  const safeChapterIdx = Math.min(chapterIdx, Math.max(storyboardChapitres.length - 1, 0));
  const selectedStoryboard = storyboardChapitres[safeChapterIdx] as (typeof storyboardChapitres)[number] | undefined;
  const selectedVideoChapitre = hasChapterVideos
    ? videoChapitres.find((c) => c.numero === selectedStoryboard?.numero)
    : undefined;
  const hasLegacyVideo = Boolean(heros.video_url) && !hasChapterVideos;
  const showingRealVideo = hasLegacyVideo || Boolean(selectedVideoChapitre);

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
            {showingRealVideo ? 'DOCUMENTAIRE' : 'APERÇU STORYBOARD'}
            {hasChapterVideos ? ` · CHAP. ${selectedStoryboard?.numero ?? 1}/${storyboardChapitres.length}` : ''}
            {' · '}
            {heros.region.toUpperCase()}
          </Text>
        </View>
        <View style={styles.topBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {hasLegacyVideo ? (
          <VideoPlayerArea uri={heros.video_url as string} />
        ) : selectedVideoChapitre ? (
          <VideoChapitrePlayerArea heroId={heros.id} chapitre={selectedVideoChapitre} />
        ) : selectedStoryboard && selectedStoryboard.planches.length > 0 ? (
          <StoryboardSlideshow chapitres={[selectedStoryboard]} />
        ) : (
          <View style={styles.videoArea}>
            <View style={styles.playCircle}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.videoLabel}>DOCUMENTAIRE BIENTÔT DISPONIBLE</Text>
          </View>
        )}

        {hasChapterVideos && storyboardChapitres.length > 1 && (
          <View style={styles.chapterTabs}>
            {storyboardChapitres.map((c, i) => {
              const tourne = videoChapitres.some((vc) => vc.numero === c.numero);
              return (
                <Pressable
                  key={c.numero}
                  onPress={() => setChapterIdx(i)}
                  style={[styles.chapterTab, i === safeChapterIdx && styles.chapterTabActive]}
                >
                  <Text style={[styles.chapterTabLabel, i === safeChapterIdx && styles.chapterTabLabelActive]}>
                    {tourne ? '▶' : '○'} {c.numero}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{heros.nom_affiche} — l'histoire en vidéo</Text>
          <Text style={styles.meta}>
            DOCUMENTAIRE · {heros.region} · {heros.annee_naissance_indicative ?? heros.epoque}
          </Text>

          {!showingRealVideo && (
            <View style={styles.missingBanner}>
              <Text style={styles.missingText}>
                {hasChapterVideos
                  ? `🎬 Ce chapitre n'est pas encore tourné — voici son storyboard en avant-goût, planche par planche. ${videoChapitres.length}/${storyboardChapitres.length} chapitre${videoChapitres.length > 1 ? 's' : ''} déjà tourné${videoChapitres.length > 1 ? 's' : ''}.`
                  : "🎬 Le documentaire n'est pas encore tourné — voici le storyboard complet en avant-goût, planche par planche."}
              </Text>
            </View>
          )}

          <Text style={styles.blurb}>{heros.resume_catalogue}</Text>

          <View style={styles.actions}>
            <View style={styles.actionsHalf}>
              <GhostButton label="Lire l'histoire" onPress={() => router.push(`/accueil/heros/${heros.slug}/recit`)} />
            </View>
            <View style={styles.actionsHalf}>
              <OutlineButton label="▶ Écouter" onPress={() => router.push(`/accueil/heros/${heros.slug}/audio`)} />
            </View>
          </View>

          {related.length > 0 && (
            <View style={styles.related}>
              <Text style={styles.relatedLabel}>AUTRES VIDÉOS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedRow}>
                {related.map((h) => (
                  <Pressable key={h.slug} style={styles.relatedItem} onPress={() => router.replace(`/accueil/heros/${h.slug}/video`)}>
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

/**
 * Lecteur d'un chapitre vidéo réellement tourné, avec bascule FR/EN quand
 * les deux pistes existent (même bande, langue de narration différente —
 * voir `AudioPlayerBlock` dans audio.tsx pour le même principe). `key={uri}`
 * force le remontage de `VideoPlayerArea` au changement de langue : `useVideoPlayer`
 * ne recharge pas sa source tout seul si l'URL change en prop.
 *
 * Engagement détaillé par chapitre × langue (demande de Yannick le
 * 2026-08-06) : même composant qui reste monté d'un chapitre à l'autre
 * (`chapterIdx` change juste la prop `chapitre`, pas de remontage), donc le
 * garde-fou "déjà loggé" est une Set de clés `numero-langue` plutôt qu'un
 * simple booléen — sinon changer de chapitre après avoir déjà écouté le
 * chapitre précédent en FR ne relogerait jamais rien.
 */
function VideoChapitrePlayerArea({ heroId, chapitre }: { heroId: string; chapitre: Heros['video_chapitres'][number] }) {
  const hasBoth = Boolean(chapitre.video_url_fr && chapitre.video_url_en);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  // Même repli qu'AudioPlayerBlock (audio.tsx) : la langue réellement jouée
  // peut différer du réglage `lang` si une seule des deux pistes existe pour
  // ce chapitre précis.
  const actualLang: 'fr' | 'en' =
    lang === 'fr'
      ? chapitre.video_url_fr
        ? 'fr'
        : 'en'
      : chapitre.video_url_en
        ? 'en'
        : 'fr';
  const uri = (lang === 'fr' ? chapitre.video_url_fr : chapitre.video_url_en)
    ?? chapitre.video_url_fr
    ?? chapitre.video_url_en
    ?? '';
  const loggedKeysRef = useRef(new Set<string>());

  useEffect(() => {
    setLang('fr');
  }, [chapitre.numero]);

  useEffect(() => {
    const key = `${chapitre.numero}-${actualLang}`;
    if (loggedKeysRef.current.has(key)) return;
    loggedKeysRef.current.add(key);
    recordVideoChapterEngagement(heroId, chapitre.numero, actualLang);
  }, [heroId, chapitre.numero, actualLang]);

  return (
    <View>
      <VideoPlayerArea key={uri} uri={uri} />
      {hasBoth && (
        <View style={styles.videoLangToggle}>
          <Pressable onPress={() => setLang('fr')} style={[styles.videoLangPill, lang === 'fr' && styles.videoLangPillActive]}>
            <Text style={[styles.videoLangLabel, lang === 'fr' && styles.videoLangLabelActive]}>FR</Text>
          </Pressable>
          <Pressable onPress={() => setLang('en')} style={[styles.videoLangPill, lang === 'en' && styles.videoLangPillActive]}>
            <Text style={[styles.videoLangLabel, lang === 'en' && styles.videoLangLabelActive]}>EN</Text>
          </Pressable>
        </View>
      )}
    </View>
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
  videoLangToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: colors.backgroundVideo,
  },
  videoLangPill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  videoLangPillActive: {
    backgroundColor: colors.accentGoldSoft,
    borderColor: colors.accentGoldSoft,
  },
  videoLangLabel: {
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.6)',
  },
  videoLangLabelActive: {
    color: colors.ctaTextOnGold,
  },
  chapterTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 14,
    paddingHorizontal: 20,
  },
  chapterTab: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chapterTabActive: {
    borderColor: colors.accentGold,
    backgroundColor: 'rgba(240,195,107,0.12)',
  },
  chapterTabLabel: {
    fontFamily: typography.monoBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  chapterTabLabelActive: {
    color: colors.accentGold,
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
