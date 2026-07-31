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
 * Héros du jour : tourne chaque jour (jour de l'année modulo nombre de
 * héros), pas un choix arbitraire figé. Priorité aux héros qui ont une
 * vraie photo produite — tant que seule une minorité en a, mieux vaut
 * toujours montrer une image plutôt qu'un dégradé sur cette carte mise en
 * avant. Retombe sur l'ensemble des héros si aucun n'a encore de photo.
 */
function pickFeatured(heroes: Heros[]): Heros | undefined {
  if (heroes.length === 0) return undefined;
  const withImage = heroes.filter((h) => h.image_carte_catalogue);
  const pool = withImage.length > 0 ? withImage : heroes;
  const start = Date.UTC(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start) / 86400000);
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
