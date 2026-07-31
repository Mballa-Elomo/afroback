import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroHeader } from '../../../../../src/components/HeroHeader';
import { WarningBanner } from '../../../../../src/components/WarningBanner';
import { TimelineList } from '../../../../../src/components/TimelineList';
import { CitationsSection, LegendesSection } from '../../../../../src/components/FactVsLegendCallout';
import { RelatedHeroes } from '../../../../../src/components/RelatedHeroes';
import { SourcesList } from '../../../../../src/components/SourcesList';
import { GoldButton, OutlineButton } from '../../../../../src/components/Buttons';
import { ErrorState, LoadingState } from '../../../../../src/components/LoadingState';
import { useHero, useRelatedHeroes } from '../../../../../src/data/useHeroesData';
import { colors, spacing, typography } from '../../../../../src/theme/tokens';

export default function FicheHerosScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const herosState = useHero(slug);
  const heros = herosState.status === 'ready' ? herosState.data : undefined;
  const related = useRelatedHeroes(heros);

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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroHeader heros={heros} onBack={() => router.back()} />

        <View style={styles.body}>
          {heros.avertissement_lecture && <WarningBanner text={heros.avertissement_lecture} />}

          <View style={styles.actions}>
            <View style={styles.goldFlex}>
              <GoldButton label="Lire le récit" onPress={() => router.push(`/accueil/heros/${heros.slug}/recit`)} />
            </View>
            <OutlineButton
              label={heros.statut_narration_audio === 'pret' ? '▶ Écouter' : '▶ Écouter'}
              onPress={() => router.push(`/accueil/heros/${heros.slug}/audio`)}
            />
            <OutlineButton
              label={heros.statut_video === 'pret' ? '▷ Regarder' : '▷ Regarder'}
              onPress={() => router.push(`/accueil/heros/${heros.slug}/video`)}
            />
          </View>

          <Text style={styles.resume}>{heros.resume_catalogue}</Text>

          <TimelineList evenements={heros.frise_chronologique} />
          <SourcesList sources={heros.sources} />
          <CitationsSection citations={heros.citations} />
          <LegendesSection legendes={heros.legendes_associees} />
          <RelatedHeroes heroes={related} title="De la même époque" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  body: {
    padding: spacing.md + 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md + 4,
  },
  goldFlex: {
    flex: 1,
  },
  resume: {
    fontFamily: typography.body,
    fontSize: 14.5,
    lineHeight: 24,
    color: colors.textBody,
    marginBottom: spacing.lg,
  },
});
