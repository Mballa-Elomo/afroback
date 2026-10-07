import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Icon } from '../../../src/components/Icons';
import { LoadingState } from '../../../src/components/LoadingState';
import { GoldButton } from '../../../src/components/Buttons';
import { colors, typography } from '../../../src/theme/tokens';
import { useI18n } from '../../../src/i18n';
import { useHero } from '../../../src/data/useHeroesData';
import { useMythe } from '../../../src/data/useMythologieData';
import {
  checkAnswer,
  finishQuiz,
  loadQuiz,
  pickLang,
  type QuizContentType,
  type QuizCorrection,
  type QuizQuestion,
  type QuizResultat,
} from '../../../src/quiz/quizApi';
import { LevelBar, useNextLevelText } from '../../../src/quiz/QuizUI';

const BG = '#0B0906';
const GOLD = colors.accentGoldBright;
const GREEN = '#7FB77E';

type Phase = 'loading' | 'error' | 'blocked' | 'asking' | 'answered' | 'saving' | 'result' | 'review';
type Blocked = 'compte_requis' | 'verrouille' | 'indisponible';

interface Reponse {
  question: QuizQuestion;
  choix: number; // index dans le tableau d'origine
  correction: QuizCorrection;
}

/** Ordre d'affichage des réponses, mélangé à chaque tentative (indices du tableau d'origine). */
function shuffledOrder(n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Titre et image du contenu, pour rappeler de quelle histoire parle le quiz. */
function useContentInfo(type: QuizContentType | null, slug: string | undefined) {
  const hero = useHero(type === 'heros' ? slug : undefined);
  const mythe = useMythe(type === 'mythe' ? slug : undefined);
  if (type === 'heros' && hero.status === 'ready' && hero.data) return { title: hero.data.nom_affiche, image: hero.data.image_carte_catalogue };
  if (type === 'mythe' && mythe.status === 'ready' && mythe.data) return { title: mythe.data.titre, image: mythe.data.image_url };
  return { title: '', image: null as string | null };
}

/**
 * Quiz de fin de contenu (cdc-quiz-progression.md §4.2 et §4.3). Même mise
 * en page que le quiz du site (src/components/QuizPlayer.tsx du site web),
 * demande de Yannick du 2026-10-07 : rappel de l'histoire en tête, une
 * question par écran, correction immédiate avec explication, résultat avec
 * points et niveau. Le score est celui recalculé par le serveur.
 */
export default function QuizScreen() {
  const { type, slug } = useLocalSearchParams<{ type: string; slug: string }>();
  const router = useRouter();
  const { t, lang } = useI18n();
  const nextLevelText = useNextLevelText();
  const contentType = type === 'heros' || type === 'mythe' ? (type as QuizContentType) : null;
  const info = useContentInfo(contentType, slug);

  const [phase, setPhase] = useState<Phase>('loading');
  const [blocked, setBlocked] = useState<Blocked>('indisponible');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [orders, setOrders] = useState<number[][]>([]);
  const [index, setIndex] = useState(0);
  const [checking, setChecking] = useState(false);
  const [reponses, setReponses] = useState<Reponse[]>([]);
  const [resultat, setResultat] = useState<QuizResultat | null>(null);

  const start = useCallback(async () => {
    if (!contentType || !slug) return;
    setPhase('loading');
    setIndex(0);
    setReponses([]);
    setResultat(null);
    try {
      const res = await loadQuiz(contentType, slug);
      if (res.statut !== 'ok' || res.questions.length === 0) {
        setBlocked(res.statut === 'ok' ? 'indisponible' : res.statut);
        setPhase('blocked');
        return;
      }
      setQuestions(res.questions);
      setOrders(res.questions.map((q) => shuffledOrder(q.choix_fr.length)));
      setPhase('asking');
    } catch {
      setPhase('error');
    }
  }, [contentType, slug]);

  useEffect(() => {
    start();
  }, [start]);

  const total = questions.length;
  const current = questions[index];
  const currentReponse = reponses[index];
  const isLast = index === total - 1;
  const choixAffiches = useMemo(() => (current ? pickLang(lang, current.choix_fr, current.choix_en) : []), [current, lang]);

  if (!contentType || !slug) return <Redirect href="/accueil" />;

  const goToStory = () => (router.canGoBack() ? router.back() : router.replace(contentType === 'heros' ? `/accueil/heros/${slug}` : `/accueil/mythologie/${slug}`));

  const pick = async (choixOrigine: number) => {
    if (phase !== 'asking' || checking || !current) return;
    setChecking(true);
    try {
      const correction = await checkAnswer(current.id, choixOrigine);
      setReponses((r) => [...r.slice(0, index), { question: current, choix: choixOrigine, correction }]);
      setPhase('answered');
    } catch {
      setPhase('error');
    } finally {
      setChecking(false);
    }
  };

  const next = async () => {
    if (!isLast) {
      setIndex((i) => i + 1);
      setPhase('asking');
      return;
    }
    setPhase('saving');
    try {
      const res = await finishQuiz(
        contentType,
        slug,
        reponses.map((r) => ({ question_id: r.question.id, choix: r.choix }))
      );
      setResultat(res);
      setPhase('result');
    } catch {
      setPhase('error');
    }
  };

  const kicker = (
    <View style={styles.kickerRow}>
      {info.image ? <Image source={{ uri: info.image }} style={styles.kickerImg} contentFit="cover" /> : null}
      <Text style={styles.kicker} numberOfLines={1}>
        {t('quizAdult.kicker')}
        {info.title ? ` · ${info.title.toUpperCase()}` : ''}
      </Text>
    </View>
  );

  // ------------------------------------------------------------------ états
  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <LoadingState message={t('quizAdult.loading')} />
      </SafeAreaView>
    );
  }

  if (phase === 'error' || phase === 'blocked') {
    const isLocked = phase === 'blocked' && blocked === 'verrouille';
    const title =
      phase === 'error' ? t('quizAdult.errorTitle') : isLocked ? t('paywall.title') : blocked === 'compte_requis' ? t('wall.title') : t('quizAdult.unavailableTitle');
    const text =
      phase === 'error'
        ? t('quizAdult.errorText')
        : isLocked
          ? t('paywall.reasons.quiz')
          : blocked === 'compte_requis'
            ? t('wall.reasons.quiz')
            : t('quizAdult.unavailableText');
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <View style={styles.trophy}>
            <Icon name={isLocked ? 'lock' : 'trophy'} size={30} color={GOLD} />
          </View>
          <Text style={styles.centerTitle}>{title}</Text>
          <Text style={styles.centerText}>{text}</Text>
          <View style={styles.actions}>
            {phase === 'error' && <GoldButton label={t('quizAdult.retryLoad')} onPress={start} />}
            {isLocked && <GoldButton label={t('paywall.see')} onPress={() => router.replace('/abonnement')} />}
            <TextButton label={t('quizAdult.backToStory')} onPress={goToStory} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------- revoir les réponses
  if (phase === 'review') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => setPhase('result')} hitSlop={10} accessibilityRole="button">
            <Text style={styles.backLink}>‹ {t('quizAdult.backToResult')}</Text>
          </Pressable>
          <Text style={styles.reviewTitle}>{t('quizAdult.reviewTitle')}</Text>
          <View style={styles.review}>
            {reponses.map((r, i) => {
              const choix = pickLang(lang, r.question.choix_fr, r.question.choix_en);
              return (
                <View key={r.question.id} style={styles.reviewItem}>
                  <Text style={styles.reviewQ}>
                    {i + 1}. {pickLang(lang, r.question.question_fr, r.question.question_en)}
                  </Text>
                  <Text style={[styles.reviewLine, { color: r.correction.correct ? GREEN : colors.terracottaText }]}>
                    {r.correction.correct ? '✓' : '✕'} {t('quizAdult.yourAnswer')} : {choix[r.choix]}
                  </Text>
                  {!r.correction.correct && (
                    <Text style={[styles.reviewLine, { color: GREEN }]}>
                      ✓ {t('quizAdult.correctAnswer')} : {choix[r.correction.bonne_reponse]}
                    </Text>
                  )}
                  <Text style={styles.reviewExpl}>{pickLang(lang, r.correction.explication_fr, r.correction.explication_en)}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------------- résultat
  if (phase === 'result' && resultat) {
    const ratio = resultat.total > 0 ? resultat.score / resultat.total : 0;
    const message =
      ratio === 1 ? t('quizAdult.resultPerfect') : ratio >= 0.8 ? t('quizAdult.resultGood') : ratio >= 0.6 ? t('quizAdult.resultMid') : t('quizAdult.resultLow');
    const levelUp = resultat.niveau.rang > resultat.niveau_avant.rang;
    const bestKept = resultat.points_gagnes === 0 && resultat.meilleur_avant != null && resultat.meilleur_avant >= resultat.score;
    const levelName = t(`quizAdult.levels.${resultat.niveau.code}`);
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
          <Pressable onPress={goToStory} hitSlop={10} accessibilityRole="button">
            <Text style={styles.backLink} numberOfLines={1}>
              ‹ {info.title || t('quizAdult.backToStory')}
            </Text>
          </Pressable>

          <View style={styles.resultHead}>
            <View style={styles.trophy}>
              <Icon name="trophy" size={30} color={GOLD} />
            </View>
            <Text style={styles.scoreLabel}>{t('quizAdult.scoreLabel')}</Text>
            <Text style={styles.score}>{t('quizAdult.resultScore', { s: resultat.score, t: resultat.total })}</Text>
            <Text style={styles.resultMessage}>{message}</Text>
          </View>

          <View style={styles.pointsCard}>
            <View style={styles.pointsLine}>
              <Text style={styles.pointsWon}>
                {resultat.points_gagnes > 0
                  ? t(resultat.points_gagnes > 1 ? 'quizAdult.pointsWon' : 'quizAdult.pointWon', { n: resultat.points_gagnes })
                  : t('quizAdult.pointsNone')}
              </Text>
              <Text style={styles.pointsTotal}>{t('quizAdult.pointsTotal', { n: resultat.points, name: levelName })}</Text>
            </View>
            {bestKept && <Text style={styles.bestKept}>{t('quizAdult.bestKept', { s: resultat.meilleur_avant, t: resultat.total })}</Text>}
            <View style={{ marginTop: 14 }}>
              <LevelBar points={resultat.points} niveau={resultat.niveau} height={12} />
            </View>
            <Text style={styles.levelNext}>{nextLevelText(resultat.points, resultat.niveau)}</Text>
            {levelUp && (
              <View style={styles.levelUp}>
                <Text style={styles.levelUpText}>✨ {t('quizAdult.newLevel', { name: levelName })}</Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <GoldButton label={t('quizAdult.review')} onPress={() => setPhase('review')} />
            <OutlinePill label={t('quizAdult.retry')} onPress={start} />
            <TextButton label={t('quizAdult.backToStory')} onPress={goToStory} />
            <Pressable onPress={() => router.push('/profil/progression')} hitSlop={8} accessibilityRole="button" style={{ alignSelf: 'center' }}>
              <Text style={styles.progressLink}>{t('quizAdult.seeProgress')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------- question
  if (!current) return null;
  const answered = phase === 'answered' || phase === 'saving';
  const order = orders[index] ?? choixAffiches.map((_, i) => i);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={goToStory} hitSlop={8} style={styles.close} accessibilityRole="button" accessibilityLabel={t('quizAdult.close')}>
          <Icon name="close" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }]} />
        </View>
        <Text style={styles.position}>{t('quizAdult.position', { n: index + 1, total })}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.questionScroll} showsVerticalScrollIndicator={false}>
        {kicker}
        <Text style={styles.question} accessibilityRole="header">
          {pickLang(lang, current.question_fr, current.question_en)}
        </Text>

        <View style={styles.choices}>
          {order.map((orig) => {
            const label = choixAffiches[orig];
            const isSelected = currentReponse?.choix === orig;
            const isRight = answered && currentReponse?.correction.bonne_reponse === orig;
            const isWrong = answered && isSelected && !currentReponse?.correction.correct;
            return (
              <Pressable
                key={orig}
                onPress={() => pick(orig)}
                disabled={answered || checking}
                style={({ pressed }) => [
                  styles.choice,
                  pressed && !answered && styles.choicePressed,
                  isRight && styles.choiceRight,
                  isWrong && styles.choiceWrong,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: answered, selected: isSelected }}
              >
                <Text style={[styles.choiceLabel, answered && !isRight && !isWrong && styles.choiceLabelDim]}>{label}</Text>
                {isRight && <Text style={[styles.mark, { color: GREEN }]}>✓</Text>}
                {isWrong && <Text style={[styles.mark, { color: colors.terracottaText }]}>✕</Text>}
              </Pressable>
            );
          })}
        </View>

        {answered && currentReponse && (
          <View style={[styles.feedback, currentReponse.correction.correct ? styles.feedbackRight : styles.feedbackWrong]}>
            <Text style={[styles.feedbackTitle, { color: currentReponse.correction.correct ? GREEN : colors.terracottaText }]}>
              {currentReponse.correction.correct ? t('quizAdult.right') : t('quizAdult.wrong')}
            </Text>
            <Text style={styles.feedbackText}>
              {pickLang(lang, currentReponse.correction.explication_fr, currentReponse.correction.explication_en)}
            </Text>
          </View>
        )}
      </ScrollView>

      {answered && (
        <View style={styles.footer}>
          <GoldButton
            label={phase === 'saving' ? t('quizAdult.saving') : isLast ? t('quizAdult.seeScore') : t('quizAdult.next')}
            onPress={next}
            disabled={phase === 'saving'}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function OutlinePill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.outline, pressed && { opacity: 0.7 }]} accessibilityRole="button">
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

function TextButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.textBtn, pressed && { opacity: 0.7 }]} accessibilityRole="button">
      <Text style={styles.textBtnLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  close: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(237,227,212,.08)',
  },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(237,227,212,.10)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: GOLD, borderRadius: 4 },
  position: { fontFamily: typography.display, fontSize: 16, color: GOLD, minWidth: 30, textAlign: 'right' },
  questionScroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  kickerImg: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: colors.borderStrong },
  kicker: { flex: 1, fontFamily: typography.bodyExtraBold, fontSize: 11.5, letterSpacing: 1.6, color: GOLD },
  question: { fontFamily: typography.display, fontSize: 22, lineHeight: 31, color: colors.textHeading, marginBottom: 24 },
  choices: { gap: 12 },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(237,227,212,.14)',
    backgroundColor: 'rgba(30,24,18,.95)',
    minHeight: 58,
  },
  choicePressed: { borderColor: GOLD, backgroundColor: 'rgba(240,195,107,.08)' },
  choiceRight: { borderColor: GREEN, backgroundColor: 'rgba(127,183,126,.12)' },
  choiceWrong: { borderColor: colors.terracottaText, backgroundColor: 'rgba(160,82,45,.16)' },
  choiceLabel: { flex: 1, fontFamily: typography.bodyBold, fontSize: 16, lineHeight: 22, color: colors.textPrimary },
  choiceLabelDim: { color: colors.textMuted },
  mark: { fontFamily: typography.bodyExtraBold, fontSize: 18 },
  feedback: { marginTop: 18, borderRadius: 18, borderWidth: 1, padding: 18, gap: 8 },
  feedbackRight: { borderColor: 'rgba(127,183,126,.4)', backgroundColor: 'rgba(127,183,126,.08)' },
  feedbackWrong: { borderColor: 'rgba(227,162,119,.3)', backgroundColor: 'rgba(160,82,45,.10)' },
  feedbackTitle: { fontFamily: typography.display, fontSize: 18 },
  feedbackText: { fontFamily: typography.bodyMedium, fontSize: 15, lineHeight: 23, color: colors.textPrimary },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderTopWidth: 1, borderTopColor: 'rgba(237,227,212,.07)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 10 },
  trophy: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.15)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
  },
  centerTitle: { fontFamily: typography.display, fontSize: 20, color: colors.textHeading, textAlign: 'center', marginTop: 8 },
  centerText: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 21, color: colors.textBody, textAlign: 'center', maxWidth: 300 },
  page: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  backLink: { fontFamily: typography.bodyBold, fontSize: 14, color: GOLD },
  resultHead: { alignItems: 'center', marginTop: 22 },
  scoreLabel: { fontFamily: typography.bodyExtraBold, fontSize: 12, letterSpacing: 3, color: GOLD, marginTop: 18 },
  score: { fontFamily: typography.displayExtraBold, fontSize: 64, lineHeight: 74, color: GOLD },
  resultMessage: { fontFamily: typography.bodyMedium, fontSize: 17, lineHeight: 25, color: colors.textPrimary, textAlign: 'center', marginTop: 4, maxWidth: 340 },
  pointsCard: { marginTop: 26, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(240,195,107,.25)', backgroundColor: 'rgba(30,24,18,.95)', padding: 20 },
  pointsLine: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  pointsWon: { fontFamily: typography.displayExtraBold, fontSize: 22, color: GOLD },
  pointsTotal: { fontFamily: typography.body, fontSize: 13.5, color: colors.textBody },
  bestKept: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  levelNext: { fontFamily: typography.body, fontSize: 13.5, color: colors.textBody, marginTop: 8 },
  levelUp: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
    backgroundColor: 'rgba(240,195,107,.15)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  levelUpText: { fontFamily: typography.bodyExtraBold, fontSize: 14.5, color: GOLD },
  actions: { alignSelf: 'stretch', gap: 12, marginTop: 26 },
  outline: { borderWidth: 1, borderColor: 'rgba(240,195,107,.4)', borderRadius: 999, paddingVertical: 15, alignItems: 'center' },
  outlineText: { fontFamily: typography.bodyBold, fontSize: 15, color: GOLD },
  textBtn: { paddingVertical: 12, alignItems: 'center' },
  textBtnLabel: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textBody },
  progressLink: { fontFamily: typography.bodySemiBold, fontSize: 13.5, color: GOLD },
  reviewTitle: { fontFamily: typography.display, fontSize: 26, color: colors.textHeading, marginTop: 14, marginBottom: 16 },
  review: { gap: 12 },
  reviewItem: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(237,227,212,.10)', backgroundColor: 'rgba(30,24,18,.95)', padding: 16, gap: 6 },
  reviewQ: { fontFamily: typography.bodyBold, fontSize: 15, lineHeight: 21, color: colors.textPrimary },
  reviewLine: { fontFamily: typography.bodySemiBold, fontSize: 13.5 },
  reviewExpl: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody },
});
