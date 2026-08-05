import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoldButton, GhostButton } from '../../../src/components/Buttons';
import { colors, typography } from '../../../src/theme/tokens';

/**
 * Résultat de quiz — fidèle dans l'esprit à
 * design-reference-ecole-heros.dc.excerpt.html (ÉCOLE — QUIZ RESULT). Couvre
 * le quiz de leçon (réussi ou non) et le grand quiz de fin de niveau raté
 * (le grand quiz réussi saute directement à l'écran "niveau-suivant", comme
 * dans la maquette). Ton toujours bienveillant sur un échec, jamais un mur
 * bloquant — l'enfant peut toujours retenter.
 */
export default function EcoleResultatScreen() {
  const router = useRouter();
  const { score, total, reussi, mode, leconId } = useLocalSearchParams<{
    score: string;
    total: string;
    reussi: string;
    mode: string;
    leconId?: string;
  }>();

  const scoreNum = Number(score ?? 0);
  const totalNum = Number(total ?? 1);
  const isReussi = reussi === '1';
  const ratio = totalNum > 0 ? scoreNum / totalNum : 0;
  const stars = ratio >= 1 ? 3 : ratio >= 0.8 ? 2 : ratio > 0 ? 1 : 0;

  const continuer = () => router.replace('/enfant/ecole');
  const revoir = () => {
    if (mode === 'lecon' && leconId) router.replace(`/enfant/ecole/lecon/${leconId}`);
    else router.replace('/enfant/ecole');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.icon}>{isReussi ? '🎉' : '💪'}</Text>
        <Text style={styles.score}>
          {scoreNum} sur {totalNum} !
        </Text>
        <Text style={styles.message}>
          {isReussi
            ? 'Bravo, tu as bien retenu cette histoire !'
            : "Presque ! Regarde encore la leçon et réessaie, tu vas y arriver."}
        </Text>
        <View style={styles.stars}>
          <Text style={styles.star}>{stars >= 1 ? '⭐' : '☆'}</Text>
          <Text style={styles.star}>{stars >= 2 ? '⭐' : '☆'}</Text>
          <Text style={styles.star}>{stars >= 3 ? '⭐' : '☆'}</Text>
        </View>

        {isReussi ? (
          <GoldButton label="Continuer" onPress={continuer} />
        ) : (
          <>
            <GoldButton label="Revoir la leçon" onPress={revoir} />
            <View style={styles.spacer} />
            <GhostButton label="Retour à la carte" onPress={continuer} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  icon: {
    fontSize: 80,
  },
  score: {
    fontFamily: typography.display,
    fontSize: 28,
    fontWeight: '700',
    color: colors.textHeading,
    marginTop: 16,
    marginBottom: 6,
  },
  message: {
    fontFamily: typography.body,
    fontSize: 14.5,
    color: colors.textMutedAlt,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 21,
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  star: {
    fontSize: 40,
  },
  spacer: {
    height: 14,
  },
});
