import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroHeader } from '../../../../../src/components/HeroHeader';
import { WarningBanner } from '../../../../../src/components/WarningBanner';
import { TimelineList } from '../../../../../src/components/TimelineList';
import { CitationsSection, LegendesSection } from '../../../../../src/components/FactVsLegendCallout';
import { RelatedHeroes } from '../../../../../src/components/RelatedHeroes';
import { SourcesList } from '../../../../../src/components/SourcesList';
import { PremiumButton } from '../../../../../src/components/Buttons';
import { ActionTile, Collapsible } from '../../../../../src/ui/modern';
import { CommentsSection } from '../../../../../src/comments/CommentsSection';
import { ContentActions } from '../../../../../src/stats/ContentActions';
import { ErrorState, LoadingState } from '../../../../../src/components/LoadingState';
import { useHero, useRelatedHeroes } from '../../../../../src/data/useHeroesData';
import { colors, spacing, typography } from '../../../../../src/theme/tokens';
import { useRequireAccount } from '../../../../../src/auth/AccountWall';
import { LockedContent } from '../../../../../src/access/Access';
import { useI18n } from '../../../../../src/i18n';

export default function FicheHerosScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { lang, t } = useI18n();
  const requireAccount = useRequireAccount();
  const herosState = useHero(slug);
  const heros = herosState.status === 'ready' ? herosState.data : undefined;
  const related = useRelatedHeroes(heros);
  const scrollRef = useRef<ScrollView>(null);
  const commentsY = useRef(0);
  const bodyY = useRef(0);

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
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroHeader heros={heros} onBack={() => router.back()} />

        <View style={styles.body} onLayout={(e) => (bodyY.current = e.nativeEvent.layout.y)}>
          <ContentActions
            type="heros"
            slug={heros.slug}
            title={heros.nom_affiche}
            description={heros.sous_titre}
            onOpenComments={() => scrollRef.current?.scrollTo({ y: bodyY.current + commentsY.current - 12, animated: true })}
          />
          {heros.avertissement_lecture && <WarningBanner text={heros.avertissement_lecture} />}

          {heros.acces?.verrouille ? (
            <>
              <Text style={styles.resume}>{heros.resume_catalogue}</Text>
              <LockedContent apercu={(lang === 'en' && heros.acces.apercu_en ? heros.acces.apercu_en : heros.acces.apercu_fr)} reason="heros" style={{ marginTop: 18 }} />
            </>
          ) : (
            <>
              <PremiumButton label={t('content.readStory')} icon="book" onPress={() => router.push(`/accueil/heros/${heros.slug}/recit`)} />
              <View style={styles.actions}>
                <ActionTile
                  icon="play"
                  label={t('content.listen')}
                  hint={heros.statut_narration_audio === 'pret' ? t('hero.narration') : t('hero.soon')}
                  onPress={() => requireAccount(() => router.push(`/accueil/heros/${heros.slug}/audio`), 'audio')}
                />
                <ActionTile
                  icon="sparkle"
                  label={t('content.watch')}
                  hint={heros.statut_video === 'pret' ? t('hero.video') : t('hero.storyboard')}
                  onPress={() => requireAccount(() => router.push(`/accueil/heros/${heros.slug}/video`), 'video')}
                />
              </View>

              <Text style={styles.resume}>{heros.resume_catalogue}</Text>

              {/* Sections secondaires repliées par défaut (cdc-commentaires.md §2). */}
              {heros.frise_chronologique.length > 0 && (
                <Collapsible
                  icon="compass"
                  title={t('hero.timeline')}
                  count={t('hero.dates', { n: heros.frise_chronologique.length })}
                  preview={`${heros.frise_chronologique[0].date} · ${heros.frise_chronologique[0].evenement}`}
                >
                  <TimelineList evenements={heros.frise_chronologique} bare />
                </Collapsible>
              )}
              {heros.citations.length > 0 && (
                <Collapsible icon="chat" title={t('hero.quotes')} count={`${heros.citations.length}`} preview={`« ${heros.citations[0].texte} »`}>
                  <CitationsSection citations={heros.citations} bare />
                </Collapsible>
              )}
              {heros.legendes_associees.length > 0 && (
                <Collapsible icon="sparkle" title={t('hero.legends')} count={`${heros.legendes_associees.length}`} preview={heros.legendes_associees[0].titre}>
                  <LegendesSection legendes={heros.legendes_associees} bare />
                </Collapsible>
              )}
              {heros.sources.length > 0 && (
                <Collapsible icon="book" title={t('content.sources')} count={`${heros.sources.length}`} preview={heros.sources[0]}>
                  <SourcesList sources={heros.sources} bare />
                </Collapsible>
              )}
            </>
          )}

          <View onLayout={(e) => (commentsY.current = e.nativeEvent.layout.y)}>
            <CommentsSection type="heros" slug={heros.slug} />
          </View>
          <RelatedHeroes heroes={related} title={t('hero.sameEra')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0B0906',
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
    marginTop: 12,
    marginBottom: spacing.lg,
  },
  resume: {
    fontFamily: typography.body,
    fontSize: 15.5,
    lineHeight: 25,
    color: colors.textBody,
    marginBottom: spacing.lg,
  },
});
