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
import { GhostButton } from '../../../src/components/Buttons';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { useHero } from '../../../src/data/useHeroesData';
import { saveReadingProgress } from '../../../src/data/readingProgress';
import { colors, spacing, typography } from '../../../src/theme/tokens';

type Langue = 'fr' | 'en';
type TailleTexte = 'S' | 'M' | 'L';

const WORDS_PER_MINUTE = 180;

export default function LecteurDeRecitScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const herosState = useHero(slug);
  const heros = herosState.status === 'ready' ? herosState.data : undefined;
  const [langue, setLangue] = useState<Langue>('fr');
  const [taille, setTaille] = useState<TailleTexte>('M');
  const [progress, setProgress] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    // Sauvegarde à la sortie de l'écran (retour, fermeture), en plus du
    // scroll actif géré par onScroll ci-dessous — pas de flush récupérable
    // autrement, contrairement au web il n'y a pas de beforeunload fiable en RN.
    return () => {
      if (heros) saveReadingProgress(heros.slug, progressRef.current);
    };
  }, [heros]);

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

  if (!heros) return <Redirect href="/accueil" />;

  const hasEn = Boolean(heros.recit_en_texte);
  const texte = langue === 'en' && heros.recit_en_texte ? heros.recit_en_texte : heros.recit_fr_texte;
  const minutes = Math.max(1, Math.round(texte.split(/\s+/).length / WORDS_PER_MINUTE));
  const dropCap = texte.charAt(0);
  const rest = texte.slice(1);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    setProgress(scrollable > 0 ? Math.min(1, Math.max(0, contentOffset.y / scrollable)) : 0);
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
              {Math.round(progress * 100)}% · {minutes} min
            </Text>
          </View>
          <Pressable onPress={() => setSettingsOpen((v) => !v)} hitSlop={10} style={styles.headerBtn}>
            <Text style={styles.headerAa}>Aa</Text>
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
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
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        onMomentumScrollEnd={() => saveReadingProgress(heros.slug, progressRef.current)}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eraTag}>
          {heros.epoque.split(/[,(]/)[0].trim().toUpperCase()} · {heros.region.toUpperCase()}
        </Text>
        <Text style={styles.name}>{heros.nom_affiche}</Text>

        <Text style={[styles.body, { fontSize: bodySize, lineHeight: bodyLineHeight }]}>
          <Text style={styles.dropCap}>{dropCap}</Text>
          {rest}
        </Text>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerStar}>✦</Text>
          <View style={styles.dividerLine} />
        </View>
        <Text style={styles.endLabel}>Fin du récit · {minutes} min</Text>

        <GhostButton label="Retour à la fiche" onPress={() => router.back()} />
      </ScrollView>
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
    paddingBottom: 60,
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
});
