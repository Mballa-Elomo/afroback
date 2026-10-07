import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../components/Icons';
import { PressableScale } from '../ui/modern';
import { useRequireAccount } from '../auth/AccountWall';
import { useAuth } from '../auth/AuthProvider';
import { colors, typography } from '../theme/tokens';
import { useI18n } from '../i18n';
import { quizHref, useProgression, useQuizEtat, type QuizContentType, type QuizNiveau } from './quizApi';

const GOLD = colors.accentGoldBright;

/** Ouvre le quiz, ou la fenêtre "Crée ton compte" pour un invité. */
function useOpenQuiz(type: QuizContentType, slug: string) {
  const router = useRouter();
  const requireAccount = useRequireAccount();
  return () => requireAccount(() => router.push(quizHref(type, slug)), 'quiz');
}

/**
 * Tuile "Quiz" des fiches héros et mythe (sous Écouter / Regarder). Pleine
 * largeur pour que le meilleur score reste lisible. Cachée tant qu'aucun
 * quiz n'existe pour ce contenu.
 */
export function QuizTile({ type, slug, style }: { type: QuizContentType; slug: string; style?: StyleProp<ViewStyle> }) {
  const { t } = useI18n();
  const etat = useQuizEtat(type, slug);
  const open = useOpenQuiz(type, slug);
  if (!etat?.disponible) return null;
  const done = etat.meilleur_score != null;
  const hint = done
    ? t('quizAdult.tileBest', { s: etat.meilleur_score, t: etat.nb_questions })
    : t('quizAdult.tileHint', { n: etat.nb_questions });
  return (
    <PressableScale onPress={open} wrapperStyle={style} style={styles.tile} accessibilityLabel={`${t('quizAdult.tileLabel')}, ${hint}`}>
      <View style={styles.tileIcon}>
        <Icon name="trophy" size={18} color={GOLD} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tileLabel}>{t('quizAdult.tileLabel')}</Text>
        <Text style={styles.tileHint}>{hint}</Text>
      </View>
      {done && etat.meilleur_score === etat.nb_questions && <Text style={styles.tileStar}>★</Text>}
      <Icon name="chevronRight" size={16} color={colors.textMuted} />
    </PressableScale>
  );
}

/** Carte dorée de fin de contenu (fin du récit, de l'audio, de la vidéo). */
export function QuizEndCard({ type, slug, style }: { type: QuizContentType; slug: string; style?: StyleProp<ViewStyle> }) {
  const { t } = useI18n();
  const etat = useQuizEtat(type, slug);
  const open = useOpenQuiz(type, slug);
  if (!etat?.disponible) return null;
  const done = etat.meilleur_score != null;
  return (
    <LinearGradient
      colors={['rgba(240,195,107,.20)', 'rgba(139,90,43,.14)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.endCard, style]}
    >
      <View style={styles.endHead}>
        <View style={styles.endIcon}>
          <Icon name="trophy" size={22} color={GOLD} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.endTitle}>{t('quizAdult.endTitle')}</Text>
          <Text style={styles.endMeta}>{t('quizAdult.endMeta', { n: etat.nb_questions })}</Text>
        </View>
      </View>
      <Pressable onPress={open} style={({ pressed }) => [styles.endBtn, pressed && { opacity: 0.85 }]} accessibilityRole="button">
        <Text style={styles.endBtnLabel}>
          {done ? t('quizAdult.endCtaRetry', { s: etat.meilleur_score, t: etat.nb_questions }) : t('quizAdult.endCta')}
        </Text>
      </Pressable>
    </LinearGradient>
  );
}

/** Barre de niveau : avancée entre le seuil du niveau actuel et le suivant. */
export function LevelBar({ points, niveau, height = 8 }: { points: number; niveau: QuizNiveau; height?: number }) {
  const raw =
    niveau.suivant_seuil == null ? 1 : Math.min(1, Math.max(0, (points - niveau.seuil) / (niveau.suivant_seuil - niveau.seuil)));
  // Au tout début d'un niveau, un petit départ doré plutôt qu'une barre vide qui semble cassée.
  const ratio = Math.max(raw, 0.04);
  return (
    <View style={[styles.barTrack, { height, borderRadius: height / 2 }]}>
      <LinearGradient
        colors={[...colors.ctaGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${Math.round(ratio * 100)}%`, height: '100%', borderRadius: height / 2 }}
      />
    </View>
  );
}

/** "encore 60 pts pour Griot" ou "Niveau maximum atteint". */
export function useNextLevelText() {
  const { t } = useI18n();
  return (points: number, niveau: QuizNiveau) =>
    niveau.suivant_code && niveau.suivant_seuil != null
      ? t('quizAdult.progressToNext', { n: niveau.suivant_seuil - points, name: t(`quizAdult.levels.${niveau.suivant_code}`) })
      : t('quizAdult.progressMax');
}

/** Carte "Ma progression" de l'écran Profil, ouvre l'écran complet. */
export function ProgressCard({ style }: { style?: StyleProp<ViewStyle> }) {
  const router = useRouter();
  const { t } = useI18n();
  const { isGuest } = useAuth();
  const { data } = useProgression(!isGuest);
  const nextText = useNextLevelText();
  if (!data) return null;
  return (
    <PressableScale onPress={() => router.push('/profil/progression')} wrapperStyle={style} style={styles.progress} accessibilityLabel={t('quizAdult.progressTitle')}>
      <View style={styles.progressHead}>
        <View style={styles.tileIcon}>
          <Icon name="trophy" size={18} color={GOLD} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.progressKicker}>{t('quizAdult.progressTitle')}</Text>
          <Text style={styles.progressLevel}>
            {t(`quizAdult.levels.${data.niveau.code}`)} · <Text style={styles.progressPts}>{t('quizAdult.progressPoints', { n: data.points })}</Text>
          </Text>
        </View>
        <Icon name="chevronRight" size={16} color={colors.textMuted} />
      </View>
      <LevelBar points={data.points} niveau={data.niveau} />
      <Text style={styles.progressNext}>{nextText(data.points, data.niveau)}</Text>
      <Text style={styles.progressSummary}>
        {data.quiz_faits === 0
          ? t('quizAdult.progressEmpty')
          : t(data.quiz_faits === 1 ? 'quizAdult.progressSummaryOne' : 'quizAdult.progressSummary', {
              m: data.maitrises,
              t: data.quiz_total,
              f: data.quiz_faits,
            })}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(240,195,107,.07)',
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.14)',
  },
  tileLabel: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.textPrimary },
  tileHint: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMutedAlt, marginTop: 1 },
  tileStar: { fontSize: 16, color: GOLD },
  endCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
    padding: 16,
    gap: 14,
  },
  endHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  endIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,9,6,.45)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.35)',
  },
  endTitle: { fontFamily: typography.display, fontSize: 17, color: colors.textHeading },
  endMeta: { fontFamily: typography.mono, fontSize: 11, color: colors.accentGoldPale, marginTop: 3, letterSpacing: 0.4 },
  endBtn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  endBtnLabel: { fontFamily: typography.bodyExtraBold, fontSize: 14.5, color: colors.ctaTextOnGold },
  barTrack: { width: '100%', backgroundColor: 'rgba(237,227,212,.10)', overflow: 'hidden' },
  progress: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.28)',
    backgroundColor: 'rgba(26,19,13,.95)',
    padding: 16,
    gap: 10,
  },
  progressHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressKicker: { fontFamily: typography.mono, fontSize: 10.5, letterSpacing: 1.1, textTransform: 'uppercase', color: colors.textMuted },
  progressLevel: { fontFamily: typography.display, fontSize: 17, color: colors.textHeading, marginTop: 2 },
  progressPts: { fontFamily: typography.bodyBold, fontSize: 14, color: GOLD },
  progressNext: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.accentGoldPale },
  progressSummary: { fontFamily: typography.body, fontSize: 13, color: colors.textBody, lineHeight: 19 },
});
