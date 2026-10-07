import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../src/components/Icons';
import { LoadingState } from '../../src/components/LoadingState';
import { FilterChips, ScreenHeader } from '../../src/ui/modern';
import { withAccount } from '../../src/auth/AccountWall';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';
import { pickLang, quizHref, useProgression, type ProgressionLigne, type QuizContentType } from '../../src/quiz/quizApi';
import { LevelBar, useNextLevelText } from '../../src/quiz/QuizUI';

const BG = '#0B0906';
const GOLD = colors.accentGoldBright;

/**
 * Ma progression (cdc-quiz-progression.md §4.4) : niveau, points, barre vers
 * le niveau suivant, 3 chiffres clés, puis la liste des quiz (Héros / Mythes)
 * avec le meilleur score de chacun et un accès direct pour faire ou refaire.
 */
function ProgressionScreen() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const { data, loading } = useProgression();
  const nextLevelText = useNextLevelText();
  const [tab, setTab] = useState<QuizContentType>('heros');

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  const lignes = (data?.resultats ?? []).filter((r) => r.type === tab);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={t('quizAdult.progressTitle')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!data ? (
          <Text style={styles.empty}>{t('quizAdult.unavailableText')}</Text>
        ) : (
          <>
            <LinearGradient colors={['#3A2410', '#1C130B', '#120D08']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
              <View style={styles.heroIcon}>
                <Icon name="trophy" size={30} color={GOLD} />
              </View>
              <Text style={styles.level}>{t(`quizAdult.levels.${data.niveau.code}`)}</Text>
              <Text style={styles.points}>{t('quizAdult.progressPoints', { n: data.points })}</Text>
              <View style={styles.barWrap}>
                <LevelBar points={data.points} niveau={data.niveau} height={10} />
              </View>
              <Text style={styles.next}>{nextLevelText(data.points, data.niveau)}</Text>
            </LinearGradient>

            <View style={styles.stats}>
              <Stat value={`${data.quiz_faits}`} label={t('quizAdult.statDone')} />
              <Stat value={`${data.maitrises}/${data.quiz_total}`} label={t('quizAdult.statMastered')} />
              <Stat value={data.moyenne != null ? `${data.moyenne} %` : '—'} label={t('quizAdult.statAverage')} />
            </View>

            {data.quiz_faits === 0 && <Text style={styles.hint}>{t('quizAdult.progressEmpty')}</Text>}

            <Text style={styles.sectionTitle}>{t('quizAdult.myQuizzes')}</Text>
            <FilterChips
              options={[
                { id: 'heros' as const, label: `${t('quizAdult.tabHeroes')} · ${(data.resultats ?? []).filter((r) => r.type === 'heros').length}` },
                { id: 'mythe' as const, label: `${t('quizAdult.tabMyths')} · ${(data.resultats ?? []).filter((r) => r.type === 'mythe').length}` },
              ]}
              value={tab}
              onChange={setTab}
            />
            <View style={styles.list}>
              {lignes.length === 0 ? (
                <Text style={styles.empty}>{t('quizAdult.emptyList')}</Text>
              ) : (
                lignes.map((l) => (
                  <QuizRow key={`${l.type}:${l.slug}`} ligne={l} lang={lang} onPress={() => router.push(quizHref(l.type, l.slug))} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuizRow({ ligne, lang, onPress }: { ligne: ProgressionLigne; lang: string; onPress: () => void }) {
  const { t } = useI18n();
  const done = ligne.meilleur_score != null && ligne.total != null;
  const mastered = done && ligne.meilleur_score! / ligne.total! >= 0.8;
  const title = pickLang(lang, ligne.titre_fr ?? ligne.slug, ligne.titre_en);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]} accessibilityRole="button">
      {ligne.image ? (
        <Image source={{ uri: ligne.image }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]}>
          <Icon name={ligne.type === 'heros' ? 'user' : 'sparkle'} size={18} color={colors.textMuted} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.rowMeta}>
          {done ? (
            <Text style={[styles.rowScore, mastered && { color: '#7FB77E' }]}>
              {t('quizAdult.best', { s: ligne.meilleur_score, t: ligne.total })}
              {mastered ? ` · ${t('quizAdult.mastered')}` : ''}
            </Text>
          ) : (
            <Text style={styles.rowTodo}>{t('quizAdult.toDiscover')}</Text>
          )}
        </View>
      </View>
      <View style={[styles.rowBtn, !done && styles.rowBtnPrimary]}>
        <Text style={[styles.rowBtnText, !done && styles.rowBtnTextPrimary]}>{done ? t('quizAdult.redoQuiz') : t('quizAdult.doQuiz')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 18, paddingBottom: 36 },
  hero: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.28)',
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,9,6,.45)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
  },
  level: { fontFamily: typography.display, fontSize: 24, color: colors.textHeading, marginTop: 12, textAlign: 'center' },
  points: { fontFamily: typography.bodyBold, fontSize: 15, color: GOLD, marginTop: 4 },
  barWrap: { alignSelf: 'stretch', marginTop: 14 },
  next: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.accentGoldPale, marginTop: 8 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  statValue: { fontFamily: typography.display, fontSize: 19, color: colors.textHeading },
  statLabel: { fontFamily: typography.body, fontSize: 11.5, color: colors.textMuted, marginTop: 3, textAlign: 'center' },
  hint: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody, marginTop: 14, textAlign: 'center' },
  sectionTitle: {
    fontFamily: typography.mono,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 26,
    marginBottom: 4,
    marginLeft: 6,
  },
  list: { gap: 10, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.10)',
    backgroundColor: 'rgba(26,19,13,.95)',
  },
  thumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.placeholderStripeLight },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.textPrimary },
  rowMeta: { flexDirection: 'row', marginTop: 3 },
  rowScore: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.textBody },
  rowTodo: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted },
  rowBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong },
  rowBtnPrimary: { backgroundColor: GOLD, borderColor: GOLD },
  rowBtnText: { fontFamily: typography.bodyBold, fontSize: 12, color: colors.accentGoldPale },
  rowBtnTextPrimary: { color: colors.ctaTextOnGold },
  empty: { fontFamily: typography.body, fontSize: 13.5, color: colors.textMuted, textAlign: 'center', marginTop: 20 },
});

export default withAccount(ProgressionScreen, 'quiz');
