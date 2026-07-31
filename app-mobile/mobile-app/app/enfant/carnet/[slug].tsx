import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '../../../src/components/LoadingState';
import { HeroPlaceholder } from '../../../src/components/HeroVisual';
import { FaitsList } from '../../../src/components/FaitsList';
import { SourcesList } from '../../../src/components/SourcesList';
import { DECOUVERTE_TYPE_LABEL } from '../../../src/data/decouverteDisplay';
import { useDecouverteItem } from '../../../src/data/useDecouverteData';
import { colors, spacing, typography } from '../../../src/theme/tokens';

/** Fiche détail du Carnet d'explorateur (enfant) — mêmes composants que la fiche Découverte adulte, chrome simplifié. */
export default function CarnetItemEnfantScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const itemState = useDecouverteItem(slug);

  if (itemState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }
  if (itemState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }
  const item = itemState.data;
  if (!item) return <Redirect href="/enfant/carnet" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Retour</Text>
        </Pressable>

        <HeroPlaceholder style={styles.visual} radius={20} imageUrl={item.image_url} />

        <Text style={styles.meta}>
          {DECOUVERTE_TYPE_LABEL[item.type].toUpperCase()} · {item.region_ethnie}
        </Text>
        <Text style={styles.title}>{item.titre}</Text>
        <Text style={styles.blurb}>{item.resume_liste}</Text>

        <FaitsList faits={item.statut_fait_legende} />
        <SourcesList sources={item.sources} />
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
    padding: spacing.md + 2,
    paddingBottom: 50,
  },
  back: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.accentGold,
    marginBottom: 14,
  },
  visual: {
    width: '100%',
    height: 180,
    marginBottom: 16,
  },
  meta: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.terracottaTextAlt,
    marginBottom: 6,
  },
  title: {
    fontFamily: typography.displaySemiBold,
    fontSize: 21,
    color: colors.textHeading,
    marginBottom: 8,
  },
  blurb: {
    fontFamily: typography.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textBody,
    marginBottom: 20,
  },
});
