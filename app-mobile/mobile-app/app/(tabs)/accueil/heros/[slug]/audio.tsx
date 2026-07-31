import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ErrorState, LoadingState } from '../../../../../src/components/LoadingState';
import { GoldButton } from '../../../../../src/components/Buttons';
import { HeroPlaceholder } from '../../../../../src/components/HeroVisual';
import { useHero } from '../../../../../src/data/useHeroesData';
import { colors, spacing, typography } from '../../../../../src/theme/tokens';
import type { Heros } from '../../../../../src/data/types';

/**
 * Lecteur audio plein écran. Quand aucune narration n'est disponible pour
 * un héros (statut_narration_audio = "a_produire"), les contrôles de
 * lecture restent absents plutôt que simulés dans le vide — spec §4
 * "jamais un bouton mort". Dès qu'une URL audio existe (narration_audio_fr_url
 * / narration_audio_en_url), un vrai lecteur (expo-audio) prend le relais.
 * Écran nesté dans l'onglet Accueil (voir accueil/_layout.tsx) : la barre
 * d'onglets basse est volontairement masquée ici via BottomTabBar (lecteur
 * plein écran immersif), à la différence de la fiche héros et du récit qui
 * la gardent visible.
 */
export default function LecteurAudioScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const herosState = useHero(slug);
  const heros = herosState.status === 'ready' ? herosState.data : undefined;

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

  const hasAudio = Boolean(heros.narration_audio_fr_url || heros.narration_audio_en_url);

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.backgroundPlayerFrom, colors.backgroundPlayerVia, colors.backgroundPlayerTo]}
        locations={[0, 0.46, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.topBtn}>
            <Text style={styles.chevronDown}>⌄</Text>
          </Pressable>
          <Text style={styles.topLabel}>NARRATION · HISTOIRE</Text>
          <Pressable onPress={() => router.push(`/accueil/heros/${heros.slug}/recit`)} hitSlop={10} style={styles.topBtn}>
            <Text style={styles.readIcon}>≡</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          <View style={styles.portraitWrap}>
            <View style={styles.portraitGlow} />
            <HeroPlaceholder radius={24} style={styles.portrait} imageUrl={heros.image_carte_catalogue}>
              <View style={styles.noteBadge}>
                <Text style={styles.noteIcon}>♪</Text>
              </View>
            </HeroPlaceholder>
          </View>

          <Text style={styles.name}>{heros.nom_affiche}</Text>
          <Text style={styles.subtitle}>Narration audio · {heros.region}</Text>

          {hasAudio ? (
            <AudioPlayerBlock heros={heros} />
          ) : (
            <>
              <View style={styles.missingBanner}>
                <Text style={styles.missingText}>
                  🎙️ La narration audio de ce récit est en cours de production. En attendant, tu peux lire le récit
                  du griot.
                </Text>
              </View>
              <Waveform />
            </>
          )}

          {heros.chapitres_storyboard.length > 0 && (
            <View style={styles.chapters}>
              <Text style={styles.chaptersLabel}>CHAPITRES</Text>
              {heros.chapitres_storyboard.map((c) => (
                <View key={c.numero} style={styles.chapterRow}>
                  <Text style={styles.chapterIcon}>○</Text>
                  <Text style={styles.chapterTitle} numberOfLines={1}>
                    {c.titre_chapitre}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.cta}>
            <GoldButton label="Lire le récit en attendant" onPress={() => router.replace(`/accueil/heros/${heros.slug}/recit`)} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Lecteur audio réel (expo-audio) une fois qu'une narration existe pour ce héros. Bascule FR/EN quand les deux versions sont disponibles (ex. Reine Nzinga, Ruben Um Nyobè). */
function AudioPlayerBlock({ heros }: { heros: Heros }) {
  const hasBoth = Boolean(heros.narration_audio_fr_url && heros.narration_audio_en_url);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const uri = (lang === 'fr' ? heros.narration_audio_fr_url : heros.narration_audio_en_url)
    ?? heros.narration_audio_fr_url
    ?? heros.narration_audio_en_url
    ?? '';

  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  // Recharge le lecteur quand on bascule FR/EN.
  useEffect(() => {
    player.replace(uri);
  }, [uri]);

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.playerBlock}>
      {hasBoth && (
        <View style={styles.langToggle}>
          <Pressable
            onPress={() => setLang('fr')}
            style={[styles.langPill, lang === 'fr' && styles.langPillActive]}
          >
            <Text style={[styles.langPillLabel, lang === 'fr' && styles.langPillLabelActive]}>FR</Text>
          </Pressable>
          <Pressable
            onPress={() => setLang('en')}
            style={[styles.langPill, lang === 'en' && styles.langPillActive]}
          >
            <Text style={[styles.langPillLabel, lang === 'en' && styles.langPillLabelActive]}>EN</Text>
          </Pressable>
        </View>
      )}

      <Pressable
        onPress={() => (status.playing ? player.pause() : player.play())}
        style={styles.playButton}
      >
        <Text style={styles.playButtonIcon}>{status.playing ? '⏸' : '▶'}</Text>
      </Pressable>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(1, Math.max(0, progress)) * 100}%` }]} />
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>{formatTime(status.currentTime)}</Text>
        <Text style={styles.timeLabel}>{formatTime(status.duration)}</Text>
      </View>
    </View>
  );
}

/** Forme d'onde décorative, statique tant qu'aucun audio n'est branché — évoque le lecteur de la maquette sans simuler une lecture en cours. */
function Waveform() {
  const bars = Array.from({ length: 32 }, (_, i) => 6 + ((i * 37) % 22));
  return (
    <View style={styles.waveform}>
      {bars.map((h, i) => (
        <View key={i} style={[styles.waveBar, { height: h }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.backgroundPlayerTo,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 4,
  },
  topBtn: {
    width: 32,
    alignItems: 'center',
  },
  chevronDown: {
    fontSize: 22,
    color: colors.accentGold,
  },
  readIcon: {
    fontSize: 16,
    color: colors.accentGold,
  },
  topLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1.4,
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  portraitWrap: {
    width: 210,
    height: 210,
    marginTop: 18,
    marginBottom: 22,
  },
  portraitGlow: {
    position: 'absolute',
    top: -14,
    left: -14,
    right: -14,
    bottom: -14,
    borderRadius: 30,
    backgroundColor: 'rgba(240,195,107,0.16)',
  },
  portrait: {
    width: '100%',
    height: '100%',
  },
  noteBadge: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(12,9,6,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIcon: {
    fontSize: 16,
    color: colors.accentGold,
  },
  name: {
    fontFamily: typography.display,
    fontSize: 23,
    color: colors.textHeading,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMutedAlt,
    marginTop: 3,
    marginBottom: 16,
  },
  missingBanner: {
    width: '100%',
    backgroundColor: colors.terracottaBg,
    borderWidth: 1,
    borderColor: colors.terracottaBorder,
    borderRadius: 12,
    padding: 13,
    marginBottom: 20,
  },
  missingText: {
    fontFamily: typography.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.terracottaText,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 36,
    width: '100%',
    marginBottom: 24,
    opacity: 0.45,
  },
  waveBar: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: colors.accentGoldSoft,
  },
  chapters: {
    width: '100%',
    marginBottom: 22,
  },
  chaptersLabel: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 10,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  chapterIcon: {
    fontSize: 10,
    color: colors.textMuted,
  },
  chapterTitle: {
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.textBody,
  },
  cta: {
    width: '100%',
  },
  playerBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  langToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  langPill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  langPillActive: {
    backgroundColor: colors.accentGoldSoft,
    borderColor: colors.accentGoldSoft,
  },
  langPillLabel: {
    fontFamily: typography.monoBold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  langPillLabelActive: {
    color: colors.ctaTextOnGold,
  },
  playButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(240,195,107,0.16)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  playButtonIcon: {
    fontSize: 24,
    color: colors.accentGold,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.placeholderStripeDark,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentGold,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
  },
  timeLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
});
