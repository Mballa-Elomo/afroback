import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LecteurVideo } from '../../../../src/video/LecteurVideo';
import { ErrorState, LoadingState } from '../../../../src/components/LoadingState';
import { useMythe } from '../../../../src/data/useMythologieData';
import { recordMytheAudioEngagement, recordMytheEngagement, recordMytheVideoChapterEngagement } from '../../../../src/data/engagementRepository';
import type { Mythe, VideoChapitre } from '../../../../src/data/mythologieTypes';
import { colors, spacing, typography } from '../../../../src/theme/tokens';
import { useRequireAccount } from '../../../../src/auth/AccountWall';
import { LockedDetailScreen } from '../../../../src/access/Access';
import { currentLanguage, useI18n } from '../../../../src/i18n';
import { QuizEndCard, QuizTile } from '../../../../src/quiz/QuizUI';
import { Icon, type IconName } from '../../../../src/components/Icons';
import { BackButton } from '../../../../src/ui/modern';
import { CommentsSection } from '../../../../src/comments/CommentsSection';
import { ContentActions } from '../../../../src/stats/ContentActions';
import { FinVideoSponsor, PresenteParSponsor } from '../../../../src/sponsors/Sponsor';

type Onglet = 'lire' | 'ecouter' | 'regarder';
type Langue = 'fr' | 'en';

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
  const requireAccount = useRequireAccount();
  const mytheState = useMythe(slug);
  const { lang, t } = useI18n();
  const mythe = mytheState.status === 'ready' ? mytheState.data : undefined;
  const [onglet, setOnglet] = useState<Onglet>('lire');
  const [chapitreIdx, setChapitreIdx] = useState(0);
  const [langue, setLangue] = useState<Langue>(currentLanguage());
  const recitLoggedRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const bodyY = useRef(0);
  const commentsY = useRef(0);

  // Engagement réel (lecture du récit) : une fois par ouverture de ce mythe
  // — même principe que recordHeroEngagement('recit') côté héros (recit.tsx),
  // aucune garde de "contenu réel disponible" nécessaire (recit_chapitres_fr
  // n'est jamais vide pour un mythe seedé). Pas de distinction par langue
  // pour cet événement (voir engagementRepository.ts).
  useEffect(() => {
    if (!mythe || recitLoggedRef.current === mythe.id) return;
    recitLoggedRef.current = mythe.id;
    recordMytheEngagement(mythe.id, 'recit');
  }, [mythe]);

  if (mytheState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message={t('myth.loading')} />
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

  if (mythe.acces?.verrouille) {
    return (
      <LockedDetailScreen
        title={mythe.titre}
        subtitle={mythe.sous_titre}
        imageUrl={mythe.image_url}
        apercu={(lang === 'en' && mythe.acces.apercu_en ? mythe.acces.apercu_en : mythe.acces.apercu_fr)}
        reason="mythe"
        footer={<CommentsSection type="mythe" slug={mythe.slug} />}
      />
    );
  }

  const hasEnglishRecit = mythe.recit_chapitres_en.length > 0;
  const chapitres = langue === 'en' && hasEnglishRecit ? mythe.recit_chapitres_en : mythe.recit_chapitres_fr;
  const chapitreActuel = chapitres[chapitreIdx];
  const estDernier = chapitreIdx === chapitres.length - 1;
  const estPremier = chapitreIdx === 0;

  const openBd = () =>
    Alert.alert(t('content.soon'), t('myth.comicSoon'));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cover}>
          {mythe.image_url ? (
            <Image source={{ uri: mythe.image_url }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} cachePolicy="memory-disk" />
          ) : (
            <LinearGradient
              colors={[colors.placeholderStripeLight, colors.placeholderStripeDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={['rgba(11,9,6,0.45)', 'rgba(11,9,6,0)', 'rgba(11,9,6,0.55)', '#0B0906']}
            locations={[0, 0.25, 0.65, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.backButton}>
            <BackButton onPress={() => router.back()} floating />
          </View>
          <View style={styles.coverContent}>
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>{mythe.peuple.split(/[,(]/)[0].trim().toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{mythe.titre}</Text>
          </View>
        </View>

        <View style={styles.body} onLayout={(e) => (bodyY.current = e.nativeEvent.layout.y)}>
          <ContentActions
            type="mythe"
            slug={mythe.slug}
            title={mythe.titre}
            description={mythe.sous_titre}
            onOpenComments={() => scrollRef.current?.scrollTo({ y: bodyY.current + commentsY.current - 12, animated: true })}
          />
          <PresenteParSponsor type="mythe" slug={mythe.slug} style={{ marginBottom: 14 }} />
          <QuizTile type="mythe" slug={mythe.slug} style={{ marginBottom: 14 }} />
          <View style={styles.tabs}>
            <Tab icon="book" label={t('content.read')} active={onglet === 'lire'} onPress={() => setOnglet('lire')} />
            <Tab icon="play" label={t('content.listen')} active={onglet === 'ecouter'} onPress={() => requireAccount(() => setOnglet('ecouter'), 'audio')} />
            <Tab icon="sparkle" label={t('content.watch')} active={onglet === 'regarder'} onPress={() => requireAccount(() => setOnglet('regarder'), 'video')} />
          </View>

          {onglet === 'lire' && chapitreActuel && (
            <>
              <View style={styles.readerHeader}>
                <Text style={styles.readerPageNum}>{t('myth.chapter', { n: chapitreActuel.numero, total: chapitres.length })}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {hasEnglishRecit && (
                    <View style={styles.langToggle}>
                      <Pressable onPress={() => setLangue('fr')} style={[styles.langBtn, langue === 'fr' && styles.langBtnActive]}>
                        <Text style={[styles.langLabel, langue === 'fr' && styles.langLabelActive]}>FR</Text>
                      </Pressable>
                      <Pressable onPress={() => setLangue('en')} style={[styles.langBtn, langue === 'en' && styles.langBtnActive]}>
                        <Text style={[styles.langLabel, langue === 'en' && styles.langLabelActive]}>EN</Text>
                      </Pressable>
                    </View>
                  )}
                  <Text style={styles.readerPos}>
                    {chapitreIdx + 1} / {chapitres.length}
                  </Text>
                </View>
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
                    <Text style={styles.pagerBtnGhostLabel}>{t('content.prevChapter')}</Text>
                  </Pressable>
                )}
                {!estDernier && (
                  <Pressable onPress={() => setChapitreIdx((i) => i + 1)} style={styles.pagerBtnGold}>
                    <Text style={styles.pagerBtnGoldLabel}>{t('content.nextChapter')}</Text>
                  </Pressable>
                )}
              </View>

              {estDernier && (
                <>
                  <QuizEndCard type="mythe" slug={mythe.slug} style={{ marginBottom: 16 }} />
                  <Pressable onPress={openBd} style={styles.reReadCard}>
                    <Icon name="book" size={22} color={colors.accentGoldBright} />
                    <View style={styles.reReadBody}>
                      <Text style={styles.reReadTitle}>{t('myth.comic')}</Text>
                      <Text style={styles.reReadSub}>{t('myth.comicSub')}</Text>
                    </View>
                    <Icon name="chevronRight" size={16} color={colors.accentGold} strokeWidth={2.2} />
                  </Pressable>

                  {mythe.sources.length > 0 && (
                    <>
                      <Text style={styles.sourcesLabel}>{t('content.sources')}</Text>
                      <View style={styles.sources}>
                        {mythe.sources.map((src, i) => (
                          <View key={i} style={styles.sourceRow}>
                            <Text style={styles.sourceBullet}>·</Text>
                            <Text style={styles.sourceText}>{src}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.sourcesNote}>
                        {t('myth.sourcesNote')}
                      </Text>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {onglet === 'ecouter' && <EcouterTab mythe={mythe} />}
          {onglet === 'regarder' && <RegarderTab mythe={mythe} />}
          <View onLayout={(e) => (commentsY.current = e.nativeEvent.layout.y)}>
            <CommentsSection type="mythe" slug={mythe.slug} />
          </View>
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
  const { t } = useI18n();
  if (!mythe.narration_audio_url && !mythe.narration_audio_url_en) {
    return (
      <View style={styles.audioCenter}>
        <View style={styles.audioPlaceholder}>
          <Text style={styles.audioPlaceholderIcon}>🎧</Text>
        </View>
        <Text style={styles.audioMissingText}>
          {t('myth.audioMissing')}
        </Text>
      </View>
    );
  }
  return <RealAudioPlayer mythe={mythe} />;
}

/** Vrai lecteur (expo-audio), bascule FR/EN quand les deux narrations existent — même principe que AudioPlayerBlock côté héros (audio.tsx). */
function RealAudioPlayer({ mythe }: { mythe: Mythe }) {
  const { t } = useI18n();
  const hasBoth = Boolean(mythe.narration_audio_url && mythe.narration_audio_url_en);
  const [lang, setLang] = useState<'fr' | 'en'>(currentLanguage());
  const actualLang: 'fr' | 'en' = lang === 'fr' ? (mythe.narration_audio_url ? 'fr' : 'en') : mythe.narration_audio_url_en ? 'en' : 'fr';
  const uri = (lang === 'fr' ? mythe.narration_audio_url : mythe.narration_audio_url_en) ?? mythe.narration_audio_url ?? mythe.narration_audio_url_en ?? '';

  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const loggedLangsRef = useRef(new Set<'fr' | 'en'>());
  // Fin de l'écoute atteinte une fois : la carte du quiz reste affichée ensuite.
  const [reachedEnd, setReachedEnd] = useState(false);
  useEffect(() => {
    if (!reachedEnd && (status.didJustFinish || progress >= 0.95)) setReachedEnd(true);
  }, [progress, status.didJustFinish, reachedEnd]);

  useEffect(() => {
    player.replace(uri);
  }, [uri]);

  useEffect(() => {
    if (loggedLangsRef.current.has(actualLang)) return;
    loggedLangsRef.current.add(actualLang);
    recordMytheAudioEngagement(mythe.id, actualLang);
  }, [actualLang, mythe.id]);

  return (
    <View style={styles.audioCenter}>
      <View style={styles.audioPlaceholder}>
        <Text style={styles.audioPlaceholderIcon}>🎧</Text>
      </View>
      <Text style={styles.audioTitle}>{t('myth.narration')}</Text>
      <Text style={styles.audioSub}>Voix pré-enregistrée · {mythe.peuple.split(/[,(]/)[0].trim()}</Text>
      {hasBoth && (
        <View style={[styles.langToggle, { marginBottom: 14 }]}>
          <Pressable onPress={() => setLang('fr')} style={[styles.langBtn, lang === 'fr' && styles.langBtnActive]}>
            <Text style={[styles.langLabel, lang === 'fr' && styles.langLabelActive]}>FR</Text>
          </Pressable>
          <Pressable onPress={() => setLang('en')} style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}>
            <Text style={[styles.langLabel, lang === 'en' && styles.langLabelActive]}>EN</Text>
          </Pressable>
        </View>
      )}
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
      {reachedEnd && <QuizEndCard type="mythe" slug={mythe.slug} style={{ alignSelf: 'stretch', marginTop: 18 }} />}
    </View>
  );
}

/**
 * Onglet Regarder : un mythe a UNE seule vidéo (décision de Yannick le
 * 2026-10-12), en français et/ou en anglais, sans découpage en chapitres.
 * En base, elle reste rangée comme premier élément de `video_chapitres`
 * (même format que les héros, statistiques de visionnage inchangées).
 */
function RegarderTab({ mythe }: { mythe: Mythe }) {
  const { t, lang: langueApp } = useI18n();
  const entree = mythe.video_chapitres.find((c) => Object.keys(c.videos ?? {}).length > 0);
  const videos = entree?.videos ?? {};
  const codes = Object.keys(videos).sort((a, b) => (a === langueApp ? -1 : b === langueApp ? 1 : 0));
  const [lang, setLang] = useState<string>(codes[0] ?? '');
  const actualLang = videos[lang] ? lang : (codes[0] ?? '');
  const uri = videos[actualLang] ?? '';
  const loggedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!actualLang || !entree) return;
    if (loggedRef.current.has(actualLang)) return;
    loggedRef.current.add(actualLang);
    recordMytheVideoChapterEngagement(mythe.id, entree.numero, actualLang);
  }, [mythe.id, entree, actualLang]);

  return (
    <View>
      {uri ? (
        <>
          <LecteurVideo key={uri} uri={uri} style={styles.mytheVideoArea} />
          <FinVideoSponsor type="mythe" slug={mythe.slug} style={{ marginTop: 12 }} />
          {codes.length > 1 && (
            <View style={[styles.langToggle, { justifyContent: 'center', marginTop: 10 }]}>
              {codes.map((code) => (
                <Pressable key={code} onPress={() => setLang(code)} style={[styles.langBtn, actualLang === code && styles.langBtnActive]}>
                  <Text style={[styles.langLabel, actualLang === code && styles.langLabelActive]}>{code.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.audioCenter}>
          <View style={styles.audioPlaceholder}>
            <Icon name="sparkle" size={34} color={colors.accentGoldSoft} />
          </View>
          <Text style={styles.audioMissingText}>
            {t('myth.noVideo')} {t('myth.meanwhile')}
          </Text>
        </View>
      )}
    </View>
  );
}

/** Onglet en pastille (Lire / Écouter / Regarder), icône + libellé, doré quand actif. */
function Tab({ icon, label, active, onPress }: { icon: IconName; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Icon name={icon} size={15} color={active ? colors.ctaTextOnGold : colors.accentGoldPale} strokeWidth={2.2} />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B0906',
  },
  scroll: {
    paddingBottom: 40,
  },
  langToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  langBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  langBtnActive: {
    backgroundColor: colors.accentGoldSoft,
    borderColor: colors.accentGoldSoft,
  },
  langLabel: {
    fontFamily: typography.monoBold,
    fontSize: 10.5,
    letterSpacing: 0.6,
    color: colors.textMuted,
  },
  langLabelActive: {
    color: colors.ctaTextOnGold,
  },
  mytheVideoArea: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.placeholderStripeDark,
  },
  videoChapterTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  videoChapterTab: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  videoChapterTabActive: {
    borderColor: colors.accentGold,
    backgroundColor: 'rgba(240,195,107,0.12)',
  },
  videoChapterTabLabel: {
    fontFamily: typography.monoBold,
    fontSize: 11,
    color: colors.textMuted,
  },
  videoChapterTabLabelActive: {
    color: colors.accentGold,
  },
  cover: {
    height: 380,
    overflow: 'hidden',
    backgroundColor: colors.placeholderStripeDark,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
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
    borderColor: 'rgba(240,195,107,.4)',
    backgroundColor: 'rgba(8,6,4,.55)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  tagLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.accentGoldPale,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 30,
    lineHeight: 34,
    color: '#FFF4E0',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.14)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  tabActive: {
    backgroundColor: colors.accentGoldBright,
    borderColor: colors.accentGoldBright,
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
    color: colors.ctaTextOnGold,
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
