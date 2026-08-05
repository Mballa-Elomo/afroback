import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useActiveProfile } from '../../../../src/profils/ActiveProfileProvider';
import {
  advanceNiveau,
  getQuizNiveauQuestions,
  getQuizQuestions,
  upsertLeconResultat,
  upsertQuizNiveauResultat,
} from '../../../../src/data/ecoleRepository';
import type { EcoleQuizNiveauQuestion, EcoleQuizQuestion } from '../../../../src/data/ecoleTypes';
import { LoadingState } from '../../../../src/components/LoadingState';
import { colors, typography } from '../../../../src/theme/tokens';

/**
 * Seuil de réussite : 60 % de bonnes réponses. Choix par défaut du chef de
 * projet (pas une décision produit tranchée par Yannick) — facile à ajuster
 * ici sans toucher au schéma ni aux données.
 */
const PASS_RATIO = 0.6;

type Question = { question: string; choix: string[]; reponseCorrecteIndex: number };

/**
 * Quiz — fidèle dans l'esprit à design-reference-ecole-heros.dc.excerpt.html
 * (ÉCOLE — QUIZ). Gère les deux cas : quiz de leçon (`leconId` = un vrai id)
 * et grand quiz de fin de niveau (`leconId` = "final", niveau passé en
 * query param). Comme aucune question n'est encore rédigée pour aucun héros
 * à ce jour (voir schema-ecole-heros.sql), affiche un état honnête "quiz pas
 * encore disponible" plutôt qu'un quiz vide qui semble cassé.
 */
export default function EcoleQuizScreen() {
  const router = useRouter();
  const { leconId, niveau: niveauParam } = useLocalSearchParams<{ leconId: string; niveau?: string }>();
  const { state } = useActiveProfile();
  const isFinal = leconId === 'final';
  const niveau = Number(niveauParam ?? 1);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'asking' | 'feedback'>('asking');
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const fetcher = isFinal ? getQuizNiveauQuestions(niveau) : getQuizQuestions(leconId);
    fetcher.then((rows) => {
      if (!alive) return;
      const mapped = (rows as (EcoleQuizQuestion | EcoleQuizNiveauQuestion)[]).map((q) => ({
        question: q.question,
        choix: q.choix,
        reponseCorrecteIndex: q.reponse_correcte_index,
      }));
      setQuestions(mapped);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [isFinal, niveau, leconId]);

  if (state.status !== 'child') return <Redirect href="/profils/selection" />;
  const childId = state.profil.id;

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message="Le quiz se prépare..." />
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.soonWrap}>
          <Text style={styles.soonIcon}>📝</Text>
          <Text style={styles.soonTitle}>Quiz pas encore prêt</Text>
          <Text style={styles.soonText}>Reviens un peu plus tard, ce quiz n'est pas encore disponible !</Text>
          <Pressable onPress={() => router.back()} style={styles.soonBtn}>
            <Text style={styles.soonBtnLabel}>Retour</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const total = questions.length;
  const current = questions[index];
  const isLast = index === total - 1;

  const pick = (choiceIndex: number) => {
    if (phase !== 'asking') return;
    setSelected(choiceIndex);
    setPhase('feedback');
    if (choiceIndex === current.reponseCorrecteIndex) setCorrectCount((c) => c + 1);
  };

  const next = async () => {
    if (!isLast) {
      setIndex((i) => i + 1);
      setSelected(null);
      setPhase('asking');
      return;
    }
    // Dernière question répondue : `correctCount` a déjà été mis à jour dans
    // `pick()` avant que ce rendu (phase 'feedback') ne soit atteint.
    const finalCorrect = correctCount;
    const reussi = finalCorrect / total >= PASS_RATIO;
    setSaving(true);
    if (isFinal) {
      await upsertQuizNiveauResultat({ childId, niveau, score: finalCorrect, reussi });
      if (reussi) {
        const dejaAuMax = niveau >= 4;
        if (!dejaAuMax) await advanceNiveau(childId, niveau + 1);
        setSaving(false);
        router.replace({
          pathname: '/enfant/ecole/niveau-suivant',
          params: { niveau: String(dejaAuMax ? niveau : niveau + 1), complete: dejaAuMax ? '1' : '0' },
        });
        return;
      }
    } else {
      await upsertLeconResultat({ childId, leconId, score: finalCorrect, reussi });
    }
    setSaving(false);
    router.replace({
      pathname: '/enfant/ecole/resultat',
      params: {
        score: String(finalCorrect),
        total: String(total),
        reussi: reussi ? '1' : '0',
        mode: isFinal ? 'final' : 'lecon',
        leconId: isFinal ? '' : leconId,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((index + 1) / total) * 100}%` }]} />
          </View>
          <Text style={styles.position}>
            {index + 1}/{total}
          </Text>
        </View>

        {phase === 'asking' && (
          <>
            <Text style={styles.question}>{current.question}</Text>
            <View style={styles.choices}>
              {current.choix.map((label, i) => (
                <Pressable key={i} onPress={() => pick(i)} style={styles.choice}>
                  <Text style={styles.choiceLabel}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {phase === 'feedback' && selected !== null && (
          <View style={styles.feedback}>
            <Text style={styles.feedbackIcon}>{selected === current.reponseCorrecteIndex ? '🎉' : '💡'}</Text>
            <Text style={styles.feedbackTitle}>
              {selected === current.reponseCorrecteIndex ? 'Bravo !' : 'Presque !'}
            </Text>
            <Text style={styles.feedbackText}>
              {selected === current.reponseCorrecteIndex
                ? 'Bonne réponse !'
                : `La bonne réponse était : ${current.choix[current.reponseCorrecteIndex]}`}
            </Text>
            <Pressable onPress={next} disabled={saving} style={styles.continueBtn}>
              <Text style={styles.continueLabel}>{saving ? 'Un instant...' : isLast ? 'Voir mon score' : 'Continuer'}</Text>
            </Pressable>
          </View>
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
    padding: 18,
    paddingTop: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 26,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.accentGold,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 9,
    backgroundColor: colors.placeholderStripeLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.terracotta,
  },
  position: {
    fontFamily: typography.mono,
    fontSize: 11,
    color: colors.terracottaTextAlt,
  },
  question: {
    fontFamily: typography.display,
    fontSize: 22,
    fontWeight: '600',
    color: colors.textHeading,
    lineHeight: 30,
    marginBottom: 28,
  },
  choices: {
    gap: 12,
  },
  choice: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choiceLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackIcon: {
    fontSize: 70,
  },
  feedbackTitle: {
    fontFamily: typography.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textHeading,
    marginTop: 14,
    marginBottom: 8,
  },
  feedbackText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textMutedAlt,
    textAlign: 'center',
    maxWidth: 270,
    lineHeight: 21,
    marginBottom: 26,
  },
  continueBtn: {
    backgroundColor: colors.terracotta,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  continueLabel: {
    fontFamily: typography.bodyExtraBold,
    fontSize: 15,
    color: '#fff',
  },
  soonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 6,
  },
  soonIcon: {
    fontSize: 44,
    opacity: 0.6,
  },
  soonTitle: {
    fontFamily: typography.display,
    fontSize: 18,
    color: colors.textHeading,
    marginTop: 8,
  },
  soonText: {
    fontFamily: typography.body,
    fontSize: 13.5,
    color: colors.textMutedAlt,
    textAlign: 'center',
    marginBottom: 20,
  },
  soonBtn: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 30,
  },
  soonBtnLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.accentGold,
  },
});
