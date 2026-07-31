import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '../../src/components/LoadingState';
import { HeroPlaceholder } from '../../src/components/HeroVisual';
import { useHero } from '../../src/data/useHeroesData';
import { colors, radii, spacing, typography } from '../../src/theme/tokens';

/**
 * "Histoire du jour" côté enfant — traitement volontairement simplifié
 * (décision du chef de projet, voir mobile-app/README.md, "Module
 * Parent/Enfant") : ne renvoie PAS vers le récit intégral du griot ni vers
 * les lecteurs audio/vidéo. Les 9 récits réels contiennent des passages
 * historiquement intenses (violence coloniale, exécutions, empoisonnement,
 * traite négrière pour Reine Nzinga) qui ne sont pas rédigés pour un jeune
 * public — aucune version adaptée aux enfants n'existe à ce jour. Cet écran
 * affiche donc seulement le nom, l'époque/la région et le résumé déjà
 * curaté (`resume_catalogue`, le même texte que la vignette du catalogue
 * adulte), sans lien vers le contenu complet.
 */
export default function HistoireEnfantScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const herosState = useHero(slug);

  if (herosState.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState />
      </SafeAreaView>
    );
  }
  if (herosState.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ErrorState />
      </SafeAreaView>
    );
  }
  const heros = herosState.data;
  if (!heros) return <Redirect href="/enfant/accueil" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.back}>‹ Retour</Text>
        </Pressable>

        <HeroPlaceholder style={styles.portrait} radius={22} imageUrl={heros.image_carte_catalogue} />

        <Text style={styles.eraTag}>
          {heros.epoque.split(/[,(]/)[0].trim().toUpperCase()} · {heros.region.toUpperCase()}
        </Text>
        <Text style={styles.name}>{heros.nom_affiche}</Text>
        <Text style={styles.resume}>{heros.resume_catalogue}</Text>

        <View style={styles.note}>
          <Text style={styles.noteText}>Demande à un parent de te raconter l'histoire complète !</Text>
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
  scroll: {
    padding: 18,
    paddingBottom: 60,
  },
  back: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.accentGold,
    marginBottom: 16,
  },
  portrait: {
    width: '100%',
    height: 220,
    marginBottom: 18,
  },
  eraTag: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.terracottaTextAlt,
    marginBottom: 8,
  },
  name: {
    fontFamily: typography.display,
    fontSize: 26,
    color: colors.textHeading,
    marginBottom: 12,
  },
  resume: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textBody,
  },
  note: {
    marginTop: 22,
    backgroundColor: colors.surfaceCard,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.borderHairline,
    padding: 14,
  },
  noteText: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMutedAlt,
    textAlign: 'center',
  },
});
