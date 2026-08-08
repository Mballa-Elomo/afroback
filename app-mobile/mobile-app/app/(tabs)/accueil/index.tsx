import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../src/auth/AuthProvider';
import { HeroPlaceholder, TagBadge } from '../../../src/components/HeroVisual';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { useHeroesList } from '../../../src/data/useHeroesData';
import { getReadingProgress, type ReadingProgress } from '../../../src/data/readingProgress';
import type { Heros } from '../../../src/data/types';
import { colors, spacing, typography } from '../../../src/theme/tokens';

/** Salutation selon l'heure réelle de l'appareil — pas figée sur "Bonsoir" comme dans la capture de la maquette. */
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

/** Court extrait tiré du vrai contenu (première phrase du sous-titre du récit), jamais inventé pour l'occasion. */
function firstSentence(text: string, maxLen = 90): string {
  const period = text.indexOf('.');
  const cut = period > 0 && period < maxLen ? text.slice(0, period + 1) : text.slice(0, maxLen).trim() + '…';
  return cut;
}

/**
 * Héros du jour : priorité à ce qui a été mis "à la une" depuis le
 * back-office (`a_la_une`, ajouté le 2026-08-05 — voir
 * backoffice/supabase/schema-admin-heros.sql) ; s'il y en a plusieurs, la
 * même rotation quotidienne s'applique entre eux. Tant qu'aucun héros n'est
 * mis à la une (valeur par défaut, comportement inchangé), retombe sur la
 * rotation automatique parmi tous les héros — priorité à ceux qui ont une
 * vraie photo produite, retombe sur l'ensemble sinon.
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

export default function AccueilScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const heroesState = useHeroesList();
  const heroes = heroesState.status === 'ready' ? heroesState.data : [];
  const [reading, setReading] = useState<ReadingProgress | null>(null);

  const prenom = ((session?.user?.user_metadata?.prenom as string | undefined) ?? '').toUpperCase();

  // Rechargé à chaque retour sur l'onglet (pas juste au montage) pour refléter une lecture qui vient de se terminer.
  useFocusEffect(() => {
    getReadingProgress().then(setReading);
  });

  const featured = useMemo(() => pickFeatured(heroes), [heroes]);
  const reprendreHero = useMemo(
    () => (reading ? heroes.find((h) => h.slug === reading.slug) : undefined),
    [heroes, reading]
  );
  // Héros avec une vraie photo en premier (meilleur rendu visuel du carrousel), reste ensuite dans l'ordre du catalogue.
  const pourToi = useMemo(() => {
    const rest = heroes.filter((h) => h.slug !== featured?.slug);
    const withImage = rest.filter((h) => h.image_carte_catalogue);
    const withoutImage = rest.filter((h) => !h.image_carte_catalogue);
    return [...withImage, ...withoutImage].slice(0, 8);
  }, [heroes, featured]);

  if (heroesState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Ton accueil se prépare..." />
      </SafeAreaView>
    );
  }
  if (heroesState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name}>{prenom || 'TOI'}</Text>
          </View>
          <Pressable onPress={() => router.push('/profil')} hitSlop={8}>
            <HeroPlaceholder style={styles.avatar} radius={22} />
          </Pressable>
        </View>

        <Pressable style={styles.search} onPress={() => router.push('/accueil/histoires-heros')}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Rechercher un héros, un lieu, un objet...</Text>
        </Pressable>

        <Pressable style={styles.donBanner} onPress={() => router.push('/don')}>
          <Text style={styles.donIcon}>🙏</Text>
          <View style={styles.donBody}>
            <Text style={styles.donTitle}>Soutenir AFROBACK</Text>
            <Text style={styles.donSub}>Aide à financer les prochains récits, audios et vidéos</Text>
          </View>
          <Text style={styles.donChevron}>›</Text>
        </Pressable>

        <Pressable style={styles.mythBanner} onPress={() => router.push('/accueil/mythologie')}>
          <Text style={styles.mythIcon}>📖</Text>
          <View style={styles.mythBody}>
            <Text style={styles.mythTitle}>Découvrir la mythologie africaine</Text>
            <Text style={styles.mythSub}>5 mythes fondateurs, par peuple — lire, écouter, BD</Text>
          </View>
          <Text style={styles.mythChevron}>›</Text>
        </Pressable>

        {featured && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HISTOIRE DU JOUR</Text>
            <Pressable onPress={() => router.push(`/accueil/heros/${featured.slug}`)}>
              <HeroPlaceholder style={styles.featuredCard} radius={20} imageUrl={featured.image_carte_catalogue}>
                <LinearGradient
                  colors={['transparent', 'rgba(10,7,4,0.55)', 'rgba(8,6,4,0.92)']}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.featuredContent}>
                  {featured.theme[0] && <TagBadge label={featured.theme[0].toUpperCase()} />}
                  <Text style={styles.featuredTitle}>{featured.nom_affiche}</Text>
                  <Text style={styles.featuredBlurb} numberOfLines={2}>
                    {firstSentence(featured.sous_titre)}
                  </Text>
                </View>
              </HeroPlaceholder>
            </Pressable>
          </View>
        )}

        {reprendreHero && reading && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>REPRENDRE</Text>
              <Text style={styles.sectionPercent}>{Math.round(reading.progress * 100)} %</Text>
            </View>
            <Pressable
              style={styles.resumeCard}
              onPress={() => router.push(`/accueil/heros/${reprendreHero.slug}/recit`)}
            >
              <HeroPlaceholder style={styles.resumeThumb} radius={12} imageUrl={reprendreHero.image_carte_catalogue} />
              <View style={styles.resumeBody}>
                <Text style={styles.resumeName} numberOfLines={1}>
                  {reprendreHero.nom_affiche}
                </Text>
                <Text style={styles.resumeSub} numberOfLines={1}>
                  {reprendreHero.sous_titre}
                </Text>
                <View style={styles.resumeTrack}>
                  <View style={[styles.resumeFill, { width: `${reading.progress * 100}%` }]} />
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {pourToi.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>POUR TOI</Text>
              <Pressable onPress={() => router.push('/accueil/histoires-heros')}>
                <Text style={styles.seeAll}>Tout voir →</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pourToiRow}>
              {pourToi.map((h) => (
                <Pressable key={h.slug} style={styles.pourToiItem} onPress={() => router.push(`/accueil/heros/${h.slug}`)}>
                  <HeroPlaceholder style={styles.pourToiThumb} radius={14} imageUrl={h.image_carte_catalogue} />
                  <Text style={styles.pourToiName} numberOfLines={2}>
                    {h.nom_affiche}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
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
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  greeting: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  name: {
    fontFamily: typography.displayExtraBold,
    fontSize: 19,
    letterSpacing: 1,
    color: colors.textPrimary,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 26,
  },
  searchIcon: {
    fontSize: 13,
    opacity: 0.7,
  },
  searchPlaceholder: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  donBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.terracottaBorder,
    backgroundColor: colors.terracottaBg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 26,
  },
  donIcon: {
    fontSize: 20,
  },
  donBody: {
    flex: 1,
  },
  donTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  donSub: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  donChevron: {
    fontSize: 18,
    color: colors.terracottaTextAlt,
  },
  mythBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentGold,
    backgroundColor: colors.placeholderStripeDark,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 26,
  },
  mythIcon: {
    fontSize: 20,
  },
  mythBody: {
    flex: 1,
  },
  mythTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  mythSub: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  mythChevron: {
    fontSize: 18,
    color: colors.accentGold,
  },
  section: {
    marginBottom: 26,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 10.5,
    letterSpacing: 1.8,
    color: colors.accentGoldSoft,
    marginBottom: 12,
  },
  sectionPercent: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  seeAll: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    color: colors.accentGold,
  },
  featuredCard: {
    height: 230,
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 18,
    gap: 8,
  },
  featuredTitle: {
    fontFamily: typography.displayExtraBold,
    fontSize: 24,
    color: colors.textHeading,
  },
  featuredBlurb: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textBodyAlt,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 12,
  },
  resumeThumb: {
    width: 48,
    height: 48,
  },
  resumeBody: {
    flex: 1,
    gap: 4,
  },
  resumeName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  resumeSub: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  resumeTrack: {
    height: 3,
    borderRadius: 6,
    backgroundColor: colors.placeholderStripeLight,
    overflow: 'hidden',
    marginTop: 4,
  },
  resumeFill: {
    height: '100%',
    backgroundColor: colors.accentGold,
  },
  pourToiRow: {
    gap: 14,
    paddingRight: 8,
  },
  pourToiItem: {
    width: 120,
  },
  pourToiThumb: {
    height: 110,
  },
  pourToiName: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 8,
  },
});
