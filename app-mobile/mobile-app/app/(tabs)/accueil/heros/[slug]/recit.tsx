import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GhostButton } from '../../../../../src/components/Buttons';
import { ErrorState, LoadingState } from '../../../../../src/components/LoadingState';
import { useHero } from '../../../../../src/data/useHeroesData';
import { saveReadingProgress } from '../../../../../src/data/readingProgress';
import type { RecitChapitre } from '../../../../../src/data/types';
import { colors, spacing, typography } from '../../../../../src/theme/tokens';

type Langue = 'fr' | 'en';
type TailleTexte = 'S' | 'M' | 'L';

const WORDS_PER_MINUTE = 180;
const NB_CHAPITRES = 4;

/**
 * Lecteur paginé par chapitre — remplace l'ancien scroll continu unique
 * (retour de test Yannick du 2026-07-31). Les 4 chapitres viennent de
 * `recit_chapitres_fr` / `recit_chapitres_en`, calés sur les vrais chapitres
 * du storyboard vidéo (mêmes titres), pas une coupe arbitraire du texte —
 * voir `CHAPITRE_ANCHORS` dans `scripts/build-heroes-data.mjs`. La barre de
 * progression reste globale sur les 4 chapitres (chapitre courant + avancée
 * du scroll dans ce chapitre), pour que `saveReadingProgress` continue de
 * représenter une progression 0-1 sur tout le récit, comme avant.
 */
export default function LecteurDeRecitScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const herosState = useHero(slug);
  const heros = herosState.status === 'ready' ? herosState.data : undefined;
  const [langue, setLangue] = useState<Langue>('fr');
  const [taille, setTaille] = useState<TailleTexte>('M');
  const [chapitreIdx, setChapitreIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const globalProgressRef = useRef(0);

  const chapitres: RecitChapitre[] | undefined =
    langue === 'en' && heros?.recit_chapitres_en?.length ? heros.recit_chapitres_en : heros?.recit_chapitres_fr;
  const hasEn = Boolean(heros?.recit_chapitres_en?.length);
  const chapitreActuel = chapitres?.[chapitreIdx];

  const globalProgress = (chapitreIdx + scrollProgress) / NB_CHAPITRES;
  globalProgressRef.current = globalProgress;

  useEffect(() => {
    // Sauvegarde à la sortie de l'écran (retour, fermeture), en plus du
    // scroll actif géré par onScroll ci-dessous.
    return () => {
      if (heros) saveReadingProgress(heros.slug, globalProgressRef.current);
    };
  }, [heros]);

  // Remonte en haut et réinitialise la progression de scroll à chaque changement de chapitre.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setScrollProgress(0);
  }, [chapitreIdx, langue]);

  if (herosState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (herosState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  if (!heros || !chapitreActuel) return <Redirect href="/accueil" />;

  const totalMots = (chapitres ?? []).reduce((sum, c) => sum + c.texte.split(/\s+/).length, 0);
  const minutesTotal = Math.max(1, Math.round(totalMots / WORDS_PER_MINUTE));
  const dropCap = chapitreActuel.texte.charAt(0);
  const rest = chapitreActuel.texte.slice(1);
  const estDernierChapitre = chapitreIdx === NB_CHAPITRES - 1;
  const estPremierChapitre = chapitreIdx === 0;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    setScrollProgress(scrollable > 0 ? Math.min(1, Math.max(0, contentOffset.y / scrollable)) : 1);
  };

  const allerAuChapitreSuivant = () => {
    if (!estDernierChapitre) setChapitreIdx((i) => i + 1);
  };
  const allerAuChapitrePrecedent = () => {
    if (!estPremierChapitre) setChapitreIdx((i) => i - 1);
  };

  const bodySize = taille === 'S' ? 14.5 : taille === 'L' ? 18 : 16;
  const bodyLineHeight = taille === 'S' ? 23 : taille === 'L' ? 29 : 26;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerBtn}>
            <Text style={styles.headerIcon}>✕</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {heros.nom_affiche}
            </Text>
            <Text style={styles.headerSub}>
              Chapitre {chapitreIdx + 1}/{NB_CHAPITRES} · {minutesTotal} min au total
            </Text>
          </View>
          <Pressable onPress={() => setSettingsOpen((v) => !v)} hitSlop={10} style={styles.headerBtn}>
            <Text style={styles.headerAa}>Aa</Text>
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${globalProgress * 100}%` }]} />
        </View>
      </View>

      {settingsOpen && (
        <View style={styles.settingsPopover}>
          <Text style={styles.settingsLabel}>TAILLE DU TEXTE</Text>
          <View style={styles.settingsRow}>
            {(['S', 'M', 'L'] as TailleTexte[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTaille(t)}
                style={[styles.sizeBtn, taille === t && styles.sizeBtnActive]}
              >
                <Text style={[styles.sizeBtnLabel, taille === t && styles.sizeBtnLabelActive, { fontSize: t === 'S' ? 13 : t === 'L' ? 18 : 15 }]}>
                  A
                </Text>
              </Pressable>
            ))}
          </View>
          {hasEn && (
            <View style={styles.settingsLang}>
              <Pressable onPress={() => setLangue('fr')} style={[styles.langBtn, langue === 'fr' && styles.langBtnActive]}>
                <Text style={[styles.langLabel, langue === 'fr' && styles.langLabelActive]}>FR</Text>
              </Pressable>
              <Pressable onPress={() => setLangue('en')} style={[styles.langBtn, langue === 'en' && styles.langBtnActive]}>
                <Text style={[styles.langLabel, langue === 'en' && styles.langLabelActive]}>EN</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        onMomentumScrollEnd={() => saveReadingProgress(heros.slug, globalProgressRef.current)}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eraTag}>
          {heros.epoque.split(/[,(]/)[0].trim().toUpperCase()} · {heros.region.toUpperCase()}
        </Text>
        <Text style={styles.name}>{heros.nom_affiche}</Text>
        <Text style={styles.chapitreTitre}>
          Chapitre {chapitreActuel.numero}/{NB_CHAPITRES} — {chapitreActuel.titre}
        </Text>

        <Text style={[styles.body, { fontSize: bodySize, lineHeight: bodyLineHeight }]}>
          <Text style={styles.dropCap}>{dropCap}</Text>
          {rest}
        </Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerStar}>✦</Text>
          <View style={styles.dividerLine} />
        </View>

        {estDernierChapitre ? (
          <>
            <Text style={styles.endLabel}>Fin du récit</Text>
            <GhostButton label="Retour à la fiche" onPress={() => router.back()} />
          </>
        ) : (
          <Text style={styles.endLabel}>Fin du chapitre {chapitreActuel.numero}</Text>
        )}
      </ScrollView>

      <View style={styles.pager}>
        <Pressable
          onPress={allerAuChapitrePrecedent}
          disabled={estPremierChapitre}
          style={[styles.pagerBtn, estPremierChapitre && styles.pagerBtnDisabled]}
        >
          <Text style={[styles.pagerBtnLabel, estPremierChapitre && styles.pagerBtnLabelDisabled]}>‹ Chapitre précédent</Text>
        </Pressable>
        <View style={styles.pagerDots}>
          {(chapitres ?? []).map((c, i) => (
            <View key={c.numero} style={[styles.pagerDot, i === chapitreIdx && styles.pagerDotActive]} />
          ))}
        </View>
        {estDernierChapitre ? (
          <Pressable onPress={() => router.back()} style={styles.pagerBtn}>
            <Text style={styles.pagerBtnLabel}>Terminer ›</Text>
          </Pressable>
        ) : (
          <Pressable onPress={allerAuChapitreSuivant} style={styles.pagerBtn}>
            <Text style={styles.pagerBtnLabel}>Chapitre suivant ›</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.backgroundReader,
  },
  header: {
    backgroundColor: colors.headerScrim,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderHairline,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerBtn: {
    width: 30,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  headerAa: {
    fontSize: 15,
    fontFamily: typography.bodyBold,
    color: colors.accentGold,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.displaySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  headerSub: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.placeholderStripeLight,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.accentGoldBright,
  },
  settingsPopover: {
    position: 'absolute',
    top: 58,
    right: 14,
    zIndex: 20,
    backgroundColor: '#160f0a',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 16,
    padding: 14,
    width: 210,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  settingsLabel: {
    fontFamily: typography.mono,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 10,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sizeBtnActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  sizeBtnLabel: {
    fontFamily: typography.bodySemiBold,
    color: colors.textPrimary,
  },
  sizeBtnLabelActive: {
    color: colors.ctaTextOnGold,
  },
  settingsLang: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
  },
  langBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: 'center',
  },
  langBtnActive: {
    backgroundColor: colors.accentGold,
    borderColor: colors.accentGold,
  },
  langLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  langLabelActive: {
    color: colors.ctaTextOnGold,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 40,
    maxWidth: 640,
    alignSelf: 'center',
    width: '100%',
  },
  eraTag: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.terracottaTextAlt,
    marginBottom: 10,
  },
  name: {
    fontFamily: typography.displayExtraBold,
    fontSize: 32,
    color: colors.textHeading,
    lineHeight: 35,
    marginBottom: 8,
  },
  chapitreTitre: {
    fontFamily: typography.displaySemiBold,
    fontSize: 15,
    color: colors.accentGold,
    marginBottom: 24,
  },
  body: {
    fontFamily: typography.body,
    color: colors.textBody,
  },
  dropCap: {
    fontFamily: typography.displayExtraBold,
    fontSize: 58,
    lineHeight: 52,
    color: colors.accentGold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
    marginBottom: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderStrong,
  },
  dividerStar: {
    fontFamily: typography.display,
    fontSize: 16,
    color: colors.textMuted,
  },
  endLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderHairline,
    backgroundColor: colors.headerScrim,
  },
  pagerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pagerBtnDisabled: {
    opacity: 0.3,
  },
  pagerBtnLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12.5,
    color: colors.accentGold,
  },
  pagerBtnLabelDisabled: {
    color: colors.textMuted,
  },
  pagerDots: {
    flexDirection: 'row',
    gap: 6,
  },
  pagerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
  },
  pagerDotActive: {
    backgroundColor: colors.accentGoldBright,
    width: 16,
  },
});
