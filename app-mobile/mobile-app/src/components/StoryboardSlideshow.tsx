import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ChapitreStoryboard } from '../data/types';
import { colors, typography } from '../theme/tokens';

const FALLBACK_DUREE_MS = 3500;

/**
 * Diaporama animé du storyboard — tient lieu de "vidéo" tant qu'aucun
 * documentaire n'est produit pour un héros (voir video.tsx). Aucune image
 * n'existe pour les planches (seul le texte du storyboard est produit à ce
 * jour) : le fond reste le même substitut visuel diagonal que partout
 * ailleurs dans l'app pour un média manquant (voir HeroPlaceholder), et le
 * contenu réel affiché est la vraie voix off écrite par l'agent
 * afroback-storyboard, planche par planche, au rythme des durées
 * suggérées — jamais un texte inventé pour l'occasion.
 *
 * Le style de transition (cut / fondu / fondu au noir...) est repris tel
 * quel du champ `transition` de la planche qu'on quitte, plutôt qu'une
 * même animation générique partout.
 */
export function StoryboardSlideshow({ chapitres }: { chapitres: ChapitreStoryboard[] }) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [plancheIdx, setPlancheIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const blackOpacity = useRef(new Animated.Value(0)).current;
  const segmentProgress = useRef(new Animated.Value(0)).current;
  const segmentElapsedRef = useRef(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chapitre = chapitres[chapterIdx];
  const planches = chapitre?.planches ?? [];
  const planche = planches[plancheIdx];
  const isLastPlancheOfChapter = plancheIdx === planches.length - 1;
  const isLastChapter = chapterIdx === chapitres.length - 1;

  const dureeMs = (planche?.duree_secondes ?? FALLBACK_DUREE_MS / 1000) * 1000;

  const goTo = (nextChapter: number, nextPlanche: number, transitionHint: string | null) => {
    const clearedTimer = advanceTimer.current;
    if (clearedTimer) clearTimeout(clearedTimer);

    const style = (transitionHint ?? '').toLowerCase();
    const isCut = style.includes('cut') || style === '';
    const isToBlack = style.includes('noir');

    const applySwap = () => {
      setChapterIdx(nextChapter);
      setPlancheIdx(nextPlanche);
      segmentProgress.setValue(0);
      segmentElapsedRef.current = 0;
    };

    if (isCut) {
      applySwap();
      return;
    }
    if (isToBlack) {
      Animated.timing(blackOpacity, { toValue: 1, duration: 260, useNativeDriver: true }).start(() => {
        applySwap();
        Animated.timing(blackOpacity, { toValue: 0, duration: 260, useNativeDriver: true }).start();
      });
      return;
    }
    Animated.timing(contentOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      applySwap();
      Animated.timing(contentOpacity, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    });
  };

  const goNext = () => {
    if (!isLastPlancheOfChapter) {
      goTo(chapterIdx, plancheIdx + 1, planche?.transition ?? null);
    } else if (!isLastChapter) {
      goTo(chapterIdx + 1, 0, planche?.transition ?? null);
    } else {
      setIsPlaying(false); // fin du storyboard
    }
  };

  const goPrev = () => {
    if (plancheIdx > 0) {
      goTo(chapterIdx, plancheIdx - 1, 'cut');
    } else if (chapterIdx > 0) {
      const prevChapter = chapitres[chapterIdx - 1];
      goTo(chapterIdx - 1, (prevChapter?.planches.length ?? 1) - 1, 'cut');
    }
  };

  const jumpToChapter = (idx: number) => {
    setIsPlaying(false);
    goTo(idx, 0, 'cut');
  };

  // Anime la barre de progression de la planche courante et programme l'avance auto.
  useEffect(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (!isPlaying) return;

    const remainingMs = dureeMs * (1 - segmentElapsedRef.current);
    Animated.timing(segmentProgress, {
      toValue: 1,
      duration: remainingMs,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) segmentElapsedRef.current = 1;
    });

    advanceTimer.current = setTimeout(goNext, remainingMs);
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, chapterIdx, plancheIdx]);

  const togglePlay = () => {
    if (isPlaying) {
      segmentProgress.stopAnimation((value) => {
        segmentElapsedRef.current = value;
      });
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const isDirection = planche?.voix_off?.trim().startsWith('(') ?? false;

  const cadrageLabel = useMemo(() => planche?.cadrage?.toUpperCase() ?? '', [planche]);

  if (!chapitre || !planche) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.segments}>
        {planches.map((p, i) => (
          <View key={p.numero} style={styles.segmentTrack}>
            {i < plancheIdx && <View style={styles.segmentFillDone} />}
            {i === plancheIdx && (
              <Animated.View
                style={[
                  styles.segmentFillDone,
                  {
                    width: segmentProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      <Animated.View style={[styles.stage, { opacity: contentOpacity }]}>
        <LinearGradient
          colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topRow}>
          <Text style={styles.chapterLabel} numberOfLines={1}>
            CHAP. {chapitre.numero}/{chapitres.length} · {chapitre.titre_chapitre.toUpperCase()}
          </Text>
          {!!cadrageLabel && (
            <View style={styles.cadrageChip}>
              <Text style={styles.cadrageChipLabel}>{cadrageLabel}</Text>
            </View>
          )}
        </View>

        {!isPlaying && (
          <Pressable onPress={togglePlay} style={styles.centerPlay} hitSlop={12}>
            <Text style={styles.centerPlayIcon}>▶</Text>
          </Pressable>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(15,11,8,0.55)', 'rgba(15,11,8,0.92)']}
          style={styles.bottomScrim}
        >
          {planche.texte_ecran && <Text style={styles.texteEcran}>{planche.texte_ecran}</Text>}
          {planche.voix_off && (
            <Text style={[styles.voixOff, isDirection && styles.voixOffDirection]} numberOfLines={4}>
              {planche.voix_off}
            </Text>
          )}
          {(planche.decor || planche.ambiance_lumiere) && (
            <Text style={styles.meta} numberOfLines={1}>
              {[planche.decor, planche.ambiance_lumiere].filter(Boolean).join(' · ')}
            </Text>
          )}
        </LinearGradient>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.blackOverlay, { opacity: blackOpacity }]} />

      <View style={styles.controls}>
        <Pressable onPress={goPrev} style={styles.ctrlBtn} hitSlop={8}>
          <Text style={styles.ctrlIcon}>⏮</Text>
        </Pressable>
        <Pressable onPress={togglePlay} style={styles.ctrlBtnMain} hitSlop={8}>
          <Text style={styles.ctrlIconMain}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable onPress={goNext} style={styles.ctrlBtn} hitSlop={8}>
          <Text style={styles.ctrlIcon}>⏭</Text>
        </Pressable>
      </View>

      <View style={styles.chapterChips}>
        {chapitres.map((c, i) => (
          <Pressable
            key={c.numero}
            onPress={() => jumpToChapter(i)}
            style={[styles.chapterChip, i === chapterIdx && styles.chapterChipActive]}
          >
            <Text style={[styles.chapterChipLabel, i === chapterIdx && styles.chapterChipLabelActive]}>
              CH. {c.numero}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    backgroundColor: colors.backgroundVideo,
  },
  segments: {
    flexDirection: 'row',
    gap: 3,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
  },
  segmentTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  segmentFillDone: {
    height: '100%',
    backgroundColor: colors.accentGoldBright,
  },
  stage: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  topRow: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chapterLabel: {
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 8.5,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.7)',
  },
  cadrageChip: {
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,0.4)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cadrageChipLabel: {
    fontFamily: typography.mono,
    fontSize: 7.5,
    letterSpacing: 0.5,
    color: colors.accentGold,
  },
  centerPlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlayIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    textAlign: 'center',
    lineHeight: 56,
    fontSize: 20,
    color: colors.accentGold,
    overflow: 'hidden',
  },
  bottomScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 14,
    gap: 6,
  },
  texteEcran: {
    fontFamily: typography.displaySemiBold,
    fontSize: 13,
    color: colors.accentGoldPale,
  },
  voixOff: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
  },
  voixOffDirection: {
    fontFamily: typography.body,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.6)',
  },
  meta: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.5)',
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  ctrlBtn: {
    padding: 6,
  },
  ctrlIcon: {
    fontSize: 16,
    color: colors.textBodyAlt,
  },
  ctrlBtnMain: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlIconMain: {
    fontSize: 18,
    color: colors.accentGold,
  },
  chapterChips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  chapterChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterChipActive: {
    borderColor: colors.accentGold,
    backgroundColor: colors.cardBg,
  },
  chapterChipLabel: {
    fontFamily: typography.monoBold,
    fontSize: 10,
    color: colors.textMuted,
  },
  chapterChipLabelActive: {
    color: colors.accentGold,
  },
});
