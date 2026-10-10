import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../src/auth/AuthProvider';
import { HeroPlaceholder } from '../../../src/components/HeroVisual';
import { Icon, type IconName } from '../../../src/components/Icons';
import { ProfileAvatar } from '../../../src/components/ProfileAvatar';
import { useOwnProfile } from '../../../src/profile/ownProfile';
import { ErrorState } from '../../../src/components/LoadingState';
import { useHeroesList } from '../../../src/data/useHeroesData';
import { useMythesGroupedByZone } from '../../../src/data/useMythologieData';
import { useDecouverteItems } from '../../../src/data/useDecouverteData';
import { DECOUVERTE_TYPE_LABEL } from '../../../src/data/decouverteDisplay';
import { getReadingProgress, type ReadingProgress } from '../../../src/data/readingProgress';
import type { Heros } from '../../../src/data/types';
import { colors, typography } from '../../../src/theme/tokens';
import { GuestBanner, useRequireAccount } from '../../../src/auth/AccountWall';
import { AccessBadge, UpgradeBanner } from '../../../src/access/Access';
import { RenewBanner } from '../../../src/payments/RenewBanner';
import { Bone, PressableScale, RailSection, SkeletonScreen } from '../../../src/ui/modern';
import i18n, { useI18n } from '../../../src/i18n';
import { useModules, usePaymentPolicy } from '../../../src/settings/SettingsProvider';

const GOLD = colors.accentGoldBright;

/** Salutation selon l'heure réelle de l'appareil. */
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return i18n.t('home.morning');
  if (h < 18) return i18n.t('home.afternoon');
  return i18n.t('home.evening');
}

/** Court extrait tiré du vrai contenu (première phrase du sous-titre du récit), jamais inventé pour l'occasion. */
function firstSentence(text: string, maxLen = 110): string {
  const period = text.indexOf('.');
  return period > 0 && period < maxLen ? text.slice(0, period + 1) : text.slice(0, maxLen).trim() + '…';
}

/**
 * Héros du jour : priorité à ce qui a été mis "à la une" depuis le
 * back-office (`a_la_une`) ; sinon rotation quotidienne, priorité aux héros
 * qui ont une vraie photo.
 */
function pickFeatured(heroes: Heros[]): Heros | undefined {
  if (heroes.length === 0) return undefined;
  const start = Date.UTC(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start) / 86400000);
  const featured = heroes.filter((h) => h.a_la_une);
  if (featured.length > 0) return featured[dayOfYear % featured.length];
  const withImage = heroes.filter((h) => h.image_carte_catalogue);
  const pool = withImage.length > 0 ? withImage : heroes;
  return pool[dayOfYear % pool.length];
}

const PILLARS: { icon: IconName; label: string; href: string }[] = [
  { icon: 'crown', label: 'home.heroes', href: '/accueil/histoires-heros' },
  { icon: 'book', label: 'home.myths', href: '/accueil/mythologie' },
  { icon: 'compass', label: 'home.discovery', href: '/decouverte' },
  { icon: 'store', label: 'home.market', href: '/marche' },
];

/**
 * Accueil (refonte moderne du 2026-09-30, demande de Yannick) : en-tête avec
 * photo de profil, recherche, raccourcis vers les 4 piliers, grande carte
 * "Histoire du jour", reprise de lecture, puis trois carrousels (héros,
 * mythes, Découverte) et deux cartes Marché / Soutenir. Squelette de
 * chargement au lieu d'une roue. Corrige aussi une boucle de rechargement :
 * la progression de lecture était relue à chaque affichage (useFocusEffect
 * sans useCallback), ce qui relançait l'affichage en continu.
 */
export default function AccueilScreen() {
  const pay = usePaymentPolicy();
  const modules = useModules();
  const { t } = useI18n();
  const router = useRouter();
  const { session } = useAuth();
  const requireAccount = useRequireAccount();
  const heroesState = useHeroesList();
  const mythesState = useMythesGroupedByZone();
  const decouverteState = useDecouverteItems();
  const heroes = heroesState.status === 'ready' ? heroesState.data : [];
  const [reading, setReading] = useState<ReadingProgress | null>(null);
  const ownProfile = useOwnProfile();
  const prenom = (session?.user?.user_metadata?.prenom as string | undefined) ?? '';

  // Relu au retour sur l'onglet (une lecture vient peut-être de se terminer), une seule fois par retour.
  useFocusEffect(
    useCallback(() => {
      getReadingProgress().then(setReading);
    }, [])
  );

  const featured = useMemo(() => pickFeatured(heroes), [heroes]);
  const reprendreHero = useMemo(() => (reading ? heroes.find((h) => h.slug === reading.slug) : undefined), [heroes, reading]);
  const pourToi = useMemo(() => {
    const rest = heroes.filter((h) => h.slug !== featured?.slug);
    return [...rest.filter((h) => h.image_carte_catalogue), ...rest.filter((h) => !h.image_carte_catalogue)].slice(0, 10);
  }, [heroes, featured]);
  const mythes = useMemo(() => (mythesState.status === 'ready' ? mythesState.data.flatMap((g) => g.items) : []), [mythesState]);
  const decouvertes = useMemo(() => (decouverteState.status === 'ready' ? decouverteState.data.slice(0, 10) : []), [decouverteState]);

  if (heroesState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* En-tête (salutation + photo), tout en haut, au-dessus des bandeaux (demande de Yannick). */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {prenom || t('home.guest')} 👋🏾
            </Text>
          </View>
          <Pressable
            onPress={() => requireAccount(() => router.push('/profil'), 'profile')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('home.profile')}
          >
            <View style={styles.avatarRing}>
              {session ? (
                <ProfileAvatar value={ownProfile?.avatar ?? null} size={42} name={ownProfile?.pseudo || prenom} />
              ) : (
                <View style={styles.guestAvatar}>
                  <Icon name="userPlus" size={20} color={GOLD} />
                </View>
              )}
            </View>
          </Pressable>
        </View>

        <GuestBanner />
        <UpgradeBanner />
        <RenewBanner style={{ marginHorizontal: 16, marginTop: 8 }} />

        {/* Recherche */}
        <Pressable style={styles.search} onPress={() => router.push('/recherche')} accessibilityRole="search">
          <Icon name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>{t('home.search')}</Text>
        </Pressable>

        {/* Piliers */}
        <View style={styles.pillars}>
          {PILLARS.filter((p) => p.href !== '/marche' || modules.marche).map((p) => (
            <PressableScale key={p.label} onPress={() => router.push(p.href as never)} style={styles.pillar} accessibilityLabel={t(p.label)}>
              <View style={styles.pillarIcon}>
                <Icon name={p.icon} size={22} color={GOLD} />
              </View>
              <Text style={styles.pillarLabel}>{t(p.label)}</Text>
            </PressableScale>
          ))}
        </View>

        {heroesState.status === 'loading' ? (
          <HomeSkeleton />
        ) : (
          <>
            {/* Histoire du jour */}
            {featured && (
              <View>
                <View style={styles.dayHeader}>
                  <Text style={styles.sectionTitle}>{t('home.storyOfDay')}</Text>
                  <Text style={styles.dayDate}>
                    {new Date().toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Text>
                </View>
                <PressableScale onPress={() => router.push(`/accueil/heros/${featured.slug}`)} accessibilityLabel={featured.nom_affiche}>
                  <HeroPlaceholder style={styles.featured} radius={26} imageUrl={featured.image_carte_catalogue}>
                    <LinearGradient
                      colors={['rgba(8,6,4,0)', 'rgba(8,6,4,0.35)', 'rgba(8,6,4,0.95)']}
                      locations={[0.25, 0.55, 1]}
                      style={StyleSheet.absoluteFill}
                    />
                    <AccessBadge type="heros" slug={featured.slug} style={{ top: 14, right: 14 }} />
                    <View style={styles.featuredContent}>
                      {!!featured.theme[0] && (
                        <View style={styles.chip}>
                          <Text style={styles.chipText}>{t(`heroTheme.${featured.theme[0]}`, { defaultValue: featured.theme[0] })}</Text>
                        </View>
                      )}
                      <Text style={styles.featuredTitle}>{featured.nom_affiche}</Text>
                      <Text style={styles.featuredBlurb} numberOfLines={2}>
                        {firstSentence(featured.sous_titre)}
                      </Text>
                      <View style={styles.readBtn}>
                        <Text style={styles.readBtnText}>{t('content.readStory')}</Text>
                        <Icon name="arrowRight" size={16} color={colors.ctaTextOnGold} strokeWidth={2.4} />
                      </View>
                    </View>
                  </HeroPlaceholder>
                </PressableScale>
              </View>
            )}

            {/* Reprendre */}
            {reprendreHero && reading && (
              <PressableScale onPress={() => router.push(`/accueil/heros/${reprendreHero.slug}/recit`)} style={styles.resume}>
                <HeroPlaceholder style={styles.resumeThumb} radius={14} imageUrl={reprendreHero.image_carte_catalogue} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resumeLabel}>REPRENDRE · {Math.round(reading.progress * 100)} %</Text>
                  <Text style={styles.resumeName} numberOfLines={1}>
                    {reprendreHero.nom_affiche}
                  </Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${reading.progress * 100}%` }]} />
                  </View>
                </View>
                <View style={styles.playBtn}>
                  <Icon name="play" size={16} color={colors.ctaTextOnGold} />
                </View>
              </PressableScale>
            )}

            {/* Héros */}
            {pourToi.length > 0 && (
              <RailSection title={t('home.heroesRail')} actionLabel={t('content.seeAll')} onAction={() => router.push('/accueil/histoires-heros')}>
                {pourToi.map((h) => (
                  <PressableScale key={h.slug} onPress={() => router.push(`/accueil/heros/${h.slug}`)} accessibilityLabel={h.nom_affiche}>
                    <HeroPlaceholder style={styles.heroCard} radius={20} imageUrl={h.image_carte_catalogue} fallbackIcon="crown">
                      <LinearGradient colors={['rgba(8,6,4,0)', 'rgba(8,6,4,0.9)']} locations={[0.45, 1]} style={StyleSheet.absoluteFill} />
                      <AccessBadge type="heros" slug={h.slug} style={{ top: 8, right: 8 }} />
                      <View style={styles.cardText}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {h.nom_affiche}
                        </Text>
                        {!!h.epoque && (
                          <Text style={styles.cardMeta} numberOfLines={1}>
                            {h.epoque}
                          </Text>
                        )}
                      </View>
                    </HeroPlaceholder>
                  </PressableScale>
                ))}
              </RailSection>
            )}

            {/* Mythes */}
            {mythes.length > 0 && (
              <RailSection title={t('home.mythsRail')} actionLabel={t('content.seeAll')} onAction={() => router.push('/accueil/mythologie')}>
                {mythes.map((m) => (
                  <PressableScale key={m.slug} onPress={() => router.push(`/accueil/mythologie/${m.slug}`)} accessibilityLabel={m.titre}>
                    <HeroPlaceholder style={styles.wideCard} radius={20} imageUrl={m.image_url} fallbackIcon="book">
                      <LinearGradient colors={['rgba(8,6,4,0.1)', 'rgba(8,6,4,0.92)']} locations={[0.2, 1]} style={StyleSheet.absoluteFill} />
                      <AccessBadge type="mythe" slug={m.slug} style={{ top: 8, right: 8 }} />
                      <View style={styles.cardText}>
                        <Text style={styles.cardKicker} numberOfLines={1}>
                          {m.peuple.split(/[(,]/)[0].trim().toUpperCase()}
                        </Text>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {m.titre}
                        </Text>
                      </View>
                    </HeroPlaceholder>
                  </PressableScale>
                ))}
              </RailSection>
            )}

            {/* Découverte */}
            {decouvertes.length > 0 && (
              <RailSection title={t('home.discoverRail')} actionLabel={t('content.seeAll')} onAction={() => router.push('/decouverte')}>
                {decouvertes.map((it) => (
                  <PressableScale key={it.slug} onPress={() => router.push(`/decouverte/${it.slug}`)} accessibilityLabel={it.titre}>
                    <HeroPlaceholder style={styles.squareCard} radius={20} imageUrl={it.image_url} fallbackIcon="compass">
                      <LinearGradient colors={['rgba(8,6,4,0)', 'rgba(8,6,4,0.9)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
                      <AccessBadge type="decouverte" slug={it.slug} style={{ top: 8, right: 8 }} />
                      <View style={styles.cardText}>
                        <Text style={styles.cardKicker} numberOfLines={1}>
                          {t(`decouverteType.${it.type}`).toUpperCase()}
                        </Text>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {it.titre}
                        </Text>
                      </View>
                    </HeroPlaceholder>
                  </PressableScale>
                ))}
              </RailSection>
            )}

            {/* Marché & Soutenir */}
            <View style={styles.duo}>
              {modules.marche && (
              <PressableScale onPress={() => router.push('/marche')} wrapperStyle={{ flex: 1 }} accessibilityLabel={t('home.market')}>
                <LinearGradient colors={['#3B2A12', '#1A130B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.duoCard}>
                  <View style={styles.duoIcon}>
                    <Icon name="store" size={22} color={GOLD} />
                  </View>
                  <Text style={styles.duoTitle}>{t('home.market')}</Text>
                  <Text style={styles.duoSub}>{t('home.marketSub')}</Text>
                </LinearGradient>
              </PressableScale>
              )}
              {/* Dons masqués dans la version Play Store (storePolicy.ts). */}
              {pay.dons && (
                <PressableScale onPress={() => requireAccount(() => router.push('/don'), 'don')} wrapperStyle={{ flex: 1 }} accessibilityLabel={t('home.supportA11y')}>
                  <LinearGradient colors={['#4A2317', '#1A0F0B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.duoCard}>
                    <View style={[styles.duoIcon, { backgroundColor: 'rgba(227,162,119,.15)' }]}>
                      <Icon name="heart" size={22} color={colors.terracottaText} />
                    </View>
                    <Text style={styles.duoTitle}>{t('home.support')}</Text>
                    <Text style={styles.duoSub}>{t('home.supportSub')}</Text>
                  </LinearGradient>
                </PressableScale>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeSkeleton() {
  return (
    <SkeletonScreen>
      <Bone style={{ height: 22, width: 160, marginTop: 28, marginBottom: 12, borderRadius: 8 }} />
      <Bone style={{ height: 380, borderRadius: 26 }} />
      <Bone style={{ height: 22, width: 190, marginTop: 28, marginBottom: 12, borderRadius: 8 }} />
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Bone style={{ width: 150, height: 210, borderRadius: 20 }} />
        <Bone style={{ width: 150, height: 210, borderRadius: 20 }} />
        <Bone style={{ width: 150, height: 210, borderRadius: 20 }} />
      </View>
    </SkeletonScreen>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0906' },
  scroll: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6, marginBottom: 18 },
  greeting: { fontFamily: typography.body, fontSize: 14, color: colors.textMuted },
  name: { fontFamily: typography.display, fontSize: 26, color: colors.textHeading, marginTop: 2 },
  avatarRing: { padding: 2.5, borderRadius: 999, borderWidth: 2, borderColor: GOLD },
  guestAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.12)',
    backgroundColor: 'rgba(26,19,13,.95)',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  searchPlaceholder: { fontFamily: typography.body, fontSize: 14.5, color: colors.textMuted },
  pillars: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  pillar: { alignItems: 'center', gap: 8, width: 76 },
  pillarIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.10)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.22)',
  },
  pillarLabel: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.textPrimary },
  dayHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontFamily: typography.display, fontSize: 19, color: colors.textHeading },
  dayDate: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted },
  featured: { height: 400, borderWidth: 1, borderColor: 'rgba(240,195,107,.25)' },
  featuredContent: { position: 'absolute', left: 20, right: 20, bottom: 20 },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(240,195,107,.18)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
    marginBottom: 10,
  },
  chipText: { fontFamily: typography.bodyBold, fontSize: 11, color: colors.accentGoldPale, letterSpacing: 0.5 },
  featuredTitle: { fontFamily: typography.display, fontSize: 30, lineHeight: 34, color: '#FFF4E0' },
  featuredBlurb: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 21, color: 'rgba(255,244,224,.82)', marginTop: 6 },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: GOLD,
  },
  readBtnText: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.ctaTextOnGold },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  resumeThumb: { width: 58, height: 58 },
  resumeLabel: { fontFamily: typography.mono, fontSize: 10, letterSpacing: 1, color: colors.accentGoldSoft },
  resumeName: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary, marginTop: 3 },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(237,227,212,.1)', marginTop: 8, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2, backgroundColor: GOLD },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  heroCard: { width: 150, height: 210, borderWidth: 0 },
  wideCard: { width: 250, height: 160, borderWidth: 0 },
  squareCard: { width: 170, height: 170, borderWidth: 0 },
  cardText: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  cardKicker: { fontFamily: typography.mono, fontSize: 9.5, letterSpacing: 1, color: colors.accentGoldPale, marginBottom: 3 },
  cardTitle: { fontFamily: typography.bodyBold, fontSize: 15, lineHeight: 19, color: '#FFF4E0' },
  cardMeta: { fontFamily: typography.body, fontSize: 11.5, color: 'rgba(255,244,224,.7)', marginTop: 3 },
  duo: { flexDirection: 'row', gap: 12, marginTop: 30 },
  duoCard: {
    borderRadius: 22,
    padding: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.18)',
  },
  duoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.12)',
  },
  duoTitle: { fontFamily: typography.display, fontSize: 18, color: colors.textHeading, marginTop: 14 },
  duoSub: { fontFamily: typography.body, fontSize: 12.5, lineHeight: 18, color: colors.textMuted, marginTop: 4 },
});
