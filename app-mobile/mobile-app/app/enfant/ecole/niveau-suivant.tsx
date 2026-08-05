import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNiveauByNumero } from '../../../src/data/ecoleRepository';
import type { EcoleNiveau } from '../../../src/data/ecoleTypes';
import { GoldButton } from '../../../src/components/Buttons';
import { colors, typography } from '../../../src/theme/tokens';

/**
 * Passage de niveau — fidèle dans l'esprit à
 * design-reference-ecole-heros.dc.excerpt.html (ÉCOLE — LEVEL UP), avec les
 * 3 silhouettes grisées "pas encore révélées" reprises telles quelles de la
 * maquette (générique, pas de vrai héros à annoncer avant que l'enfant
 * n'atteigne réellement l'écran de ce niveau). `complete=1` gère le cas où
 * l'enfant vient de terminer le niveau 4 (dernier niveau) — la maquette ne
 * prévoit pas ce cas, traité honnêtement ici plutôt que de boucler sur
 * "Niveau 4" une seconde fois.
 */
export default function EcoleNiveauSuivantScreen() {
  const router = useRouter();
  const { niveau: niveauParam, complete } = useLocalSearchParams<{ niveau: string; complete?: string }>();
  const niveau = Number(niveauParam ?? 1);
  const isComplete = complete === '1';
  const [niveauInfo, setNiveauInfo] = useState<EcoleNiveau | undefined>();

  useEffect(() => {
    if (isComplete) return;
    getNiveauByNumero(niveau).then(setNiveauInfo);
  }, [niveau, isComplete]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.confetti}>🎊</Text>
        <Text style={styles.kicker}>{isComplete ? 'ÉCOLE DES HÉROS TERMINÉE' : 'NIVEAU TERMINÉ'}</Text>
        {isComplete ? (
          <Text style={styles.title}>Tu as terminé{'\n'}tous les niveaux !</Text>
        ) : (
          <Text style={styles.title}>
            Niveau suivant :{'\n'}
            {niveauInfo?.nom ?? `Niveau ${niveau}`}
          </Text>
        )}

        {!isComplete && (
          <View style={styles.silhouettes}>
            <View style={styles.silhouette}>
              <Text style={styles.silhouetteIcon}>👤</Text>
            </View>
            <View style={styles.silhouette}>
              <Text style={styles.silhouetteIcon}>👤</Text>
            </View>
            <View style={styles.silhouette}>
              <Text style={styles.silhouetteIcon}>👤</Text>
            </View>
          </View>
        )}

        <GoldButton label={isComplete ? "Retour à l'accueil" : 'Continuer'} onPress={() => router.replace(isComplete ? '/enfant/accueil' : '/enfant/ecole')} />
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
  confetti: {
    fontSize: 90,
  },
  kicker: {
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.terracottaTextAlt,
    marginTop: 10,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textHeading,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  silhouettes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  silhouette: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  silhouetteIcon: {
    fontSize: 26,
  },
});
