import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ErrorState, LoadingState } from '../../../../src/components/LoadingState';
import { useMythe } from '../../../../src/data/useMythologieData';
import type { Mythe } from '../../../../src/data/mythologieTypes';
import { colors, spacing, typography } from '../../../../src/theme/tokens';

type Onglet = 'lire' | 'ecouter';

/**
 * Détail d'un mythe — fidèle à design-reference-mythologie.dc.excerpt.html
 * (MYTHE DÉTAIL), avec deux écarts assumés et documentés :
 * - **Bouton BD** : la maquette prévoit un `openBd`, mais aucun composant de
 *   lecteur BD n'existe ailleurs dans le fichier maquette (même constat que
 *   le format BD de l'École des Héros) — traité en "bientôt disponible"
 *   (Alert), jamais un lecteur inventé.
 * - **Onglet Écouter** : aucune narration n'a été produite pour aucun des 5
 *   mythes (vérifié) — même état "bientôt disponible" que le lecteur audio
 *   héros tant qu'aucun média n'existe, vrai lecteur `expo-audio` dès qu'une
 *   URL existera.
 * Les sources ne s'affichent qu'en fin de lecture (dernier chapitre), comme
 * dans la maquette (`readerIsLast`), et seulement si le mythe en a
 * (`mytheHasSources`) — jamais une source inventée si la liste est vide.
 */
export default function MytheDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const mytheState = useMythe(slug);
  const mythe = mytheState.status === 'ready' ? mytheState.data : undefined;
  const [onglet, setOnglet] = useState<Onglet>('lire');
  const [chapitreIdx, setChapitreIdx] = useState(0);

  if (mytheState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Le mythe se prépare..." />
      </SafeAreaView>
    );
  }
  if (mytheState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }
  if (!mythe) return <Redirect href="/accueil/mythologie" />;

  const chapitres = mythe.recit_chapitres_fr;
  const chapitreActuel = chapitres[chapitreIdx];
  const estDernier = chapitreIdx === chapitres.length - 1;
  const estPremier = chapitreIdx === 0;

  const openBd = () =>
    Alert.alert('Bientôt disponible', "La bande dessinée de ce mythe n'est pas encore prête.");

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          {mythe.image_url ? (
            <Image source={{ uri: mythe.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={['rgba(15,11,8,0.15)', 'rgba(15,11,8,0.1)', colors.background]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <View style={styles.coverContent}>
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>{mythe.peuple.split(/[,(]/)[0].trim().toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{mythe.titre}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.tabs}>
            <Pressable onPress={() => setOnglet('lire')} style={[styles.tab, onglet === 'lire' && styles.tabActive]}>
              <Text style={[styles.tabLabel, onglet === 'lire' && styles.tabLabelActive]}>Lire</Text>
            </Pressable>
            <Pressable onPress={() => setOnglet('ecouter')} style={[styles.tab, onglet === 'ecouter' && styles.tabActive]}>
              <Text style={[styles.tabLabel, onglet === 'ecouter' && styles.tabLabelActive]}>▶ Écouter</Text>
            </Pressable>
            <Pressable onPress={openBd} style={styles.tabBd}>
              <Text style={styles.tabLabel}>📖</Text>
            </Pressable>
          </View>

          {onglet === 'lire' && chapitreActuel && (
            <>
              <View style={styles.readerHeader}>
                <Text style={styles.readerPageNum}>CHAPITRE {chapitreActuel.numero}/{chapitres.length}</Text>
                <Text style={styles.readerPos}>
                  {chapitreIdx + 1} / {chapitres.length}
                </Text>
              </View>
              <Text style={styles.chapitreTitre}>{chapitreActuel.titre}</Text>
              {chapitreActuel.texte.split('\n\n').map((para, i) => (
                <Text key={i} style={styles.paragraph}>
                  {para}
                </Text>
              ))}

              <View style={styles.pager}>
                {!estPremier && (
                  <Pressable onPress={() => setChapitreIdx((i) => i - 1)} style={styles.pagerBtnGhost}>
                    <Text style={styles.pagerBtnGhostLabel}>‹ Chapitre précédent</Text>
                  </Pressable>
                )}
                {!estDernier && (
                  <Pressable onPress={() => setChapitreIdx((i) => i + 1)} style={styles.pagerBtnGold}>
                    <Text style={styles.pagerBtnGoldLabel}>Chapitre suivant ›</Text>
                  </Pressable>
                )}
              </View>

              {estDernier && (
                <>
                  <Pressable onPress={openBd} style={styles.reReadCard}>
                    <Text style={styles.reReadIcon}>📖</Text>
                    <View style={styles.reReadBody}>
                      <Text style={styles.reReadTitle}>Revivre en BD</Text>
                      <Text style={styles.reReadSub}>Le mythe en images</Text>
                    </View>
                    <Text style={styles.reReadChevron}>›</Text>
                  </Pressable>

                  {mythe.sources.length > 0 && (
                    <>
                      <Text style={styles.sourcesLabel}>SOURCES</Text>
                      <View style={styles.sources}>
                        {mythe.sources.map((src, i) => (
                          <View key={i} style={styles.sourceRow}>
                            <Text style={styles.sourceBullet}>·</Text>
                            <Text style={styles.sourceText}>{src}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.sourcesNote}>
                        Récit établi d'après ces sources ; traditions orales à faire valider par des spécialistes.
                      </Text>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {onglet === 'ecouter' && <EcouterTab mythe={mythe} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function EcouterTab({ mythe }: { mythe: Mythe }) {
  if (!mythe.narration_audio_url) {
    return (
      <View style={styles.audioCenter}>
        <View style={styles.audioPlaceholder}>
          <Text style={styles.audioPlaceholderIcon}>🎧</Text>
        </View>
        <Text style={styles.audioMissingText}>
          La narration audio de ce mythe est en cours de production. En attendant, tu peux lire le récit du griot.
        </Text>
      </View>
    );
  }
  return <RealAudioPlayer uri={mythe.narration_audio_url} peuple={mythe.peuple} />;
}

/** Vrai lecteur (expo-audio), prêt dès qu'une narration existera pour un mythe. */
function RealAudioPlayer({ uri, peuple }: { uri: string; peuple: string }) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={styles.audioCenter}>
      <View style={styles.audioPlaceholder}>
        <Text style={styles.audioPlaceholderIcon}>🎧</Text>
      </View>
      <Text style={styles.audioTitle}>Narration AFROBACK</Text>
      <Text style={styles.audioSub}>Voix pré-enregistrée · {peuple.split(/[,(]/)[0].trim()}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(1, Math.max(0, progress)) * 100}%` }]} />
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.timeLabel}>{formatTime(status.currentTime)}</Text>
        <Text style={styles.timeLabel}>{formatTime(status.duration)}</Text>
      </View>
      <Pressable onPress={() => (status.playing ? player.pause() : player.play())} style={styles.playButton}>
        <Text style={styles.playButtonIcon}>{status.playing ? '⏸' : '▶'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  cover: {
    height: 230,
    overflow: 'hidden',
    backgroundColor: colors.placeholderStripeDark,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  backIcon: {
    fontSize: 18,
    color: colors.accentGold,
  },
  coverContent: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    right: 18,
  },
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.terracottaTextAlt,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  tagLabel: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.terracottaTextAlt,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 23,
    fontWeight: '700',
    color: colors.textHeading,
  },
  body: {
    paddingHorizontal: spacing.md + 2,
    paddingTop: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.cardBg,
    borderColor: colors.accentGold,
  },
  tabBd: {
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
  },
  tabLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  tabLabelActive: {
    color: colors.accentGold,
  },
  readerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  readerPageNum: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.accentGoldSoft,
  },
  readerPos: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  chapitreTitre: {
    fontFamily: typography.display,
    fontSize: 19,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 24,
    marginBottom: 16,
  },
  paragraph: {
    fontFamily: typography.body,
    fontSize: 15.5,
    lineHeight: 26,
    color: colors.textBody,
    marginBottom: 17,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  pagerBtnGhost: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
  },
  pagerBtnGhostLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13.5,
    color: colors.accentGold,
  },
  pagerBtnGold: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
  },
  pagerBtnGoldLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13.5,
    color: colors.ctaTextOnGold,
  },
  reReadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  reReadIcon: {
    fontSize: 26,
  },
  reReadBody: {
    flex: 1,
  },
  reReadTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 13.5,
    color: colors.textHeading,
  },
  reReadSub: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  reReadChevron: {
    fontSize: 18,
    color: colors.accentGold,
  },
  sourcesLabel: {
    fontFamily: typography.display,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginTop: 26,
    marginBottom: 12,
  },
  sources: {
    gap: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  sourceBullet: {
    color: colors.accentGoldSoft,
    fontSize: 13,
  },
  sourceText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textMutedAlt,
  },
  sourcesNote: {
    fontFamily: typography.body,
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.placeholderLabel,
    marginTop: 14,
    lineHeight: 16,
  },
  audioCenter: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  audioPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.placeholderStripeLight,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  audioPlaceholderIcon: {
    fontSize: 44,
  },
  audioTitle: {
    fontFamily: typography.display,
    fontSize: 17,
    color: colors.textHeading,
    marginBottom: 6,
  },
  audioSub: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 22,
  },
  audioMissingText: {
    fontFamily: typography.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textMutedAlt,
    textAlign: 'center',
    maxWidth: 280,
  },
  progressTrack: {
    width: '100%',
    maxWidth: 280,
    height: 5,
    borderRadius: 9,
    backgroundColor: colors.placeholderStripeDark,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentGold,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
    marginBottom: 20,
  },
  timeLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    color: colors.textMuted,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonIcon: {
    fontSize: 24,
    color: colors.ctaTextOnGold,
  },
});
