import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { useWizardState } from '../../src/onboarding/WizardState';
import {
  BrandMark,
  IllustratedBackground,
  ONBOARDING_ILLUSTRATIONS,
  PillButton,
} from '../../src/onboarding/ui';
import { AnimatedTitleBlock } from '../../src/onboarding/AnimatedText';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';

/**
 * Écran 10 — "Bienvenue dans AfroBack !" (maquette de Yannick, 2026-09-29) :
 * porte ouverte sur la forêt, plusieurs générations en marche. Atteint depuis
 * plan.tsx (forfait Découverte) ou payment.tsx (Racines/Héritage, paiement
 * encore simulé jusqu'au Module 4). "Explorer AfroBack" persiste les choix de
 * l'assistant (Supabase Auth, user_metadata) via completeOnboarding :
 * Stack.Protected bascule alors seul vers l'accueil.
 */
export default function WelcomeStepScreen() {
  const { completeOnboarding } = useAuth();
  const { usages, forfait } = useWizardState();
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const { error: err } = await completeOnboarding({
      // Langue réellement choisie (écran 1), plus le sélecteur de l'ancien assistant.
      langueInterface: lang,
      usages,
      // Le paiement Mobile Money n'existe pas encore (Module 4) : le compte démarre
      // toujours en Découverte. Les droits d'abonné ne viennent que du serveur
      // (table `subscriptions`), jamais de ce choix.
      forfait: 'decouverte',
      billing: undefined,
      paymentStatus: 'none',
      forfaitSouhaite: forfait === 'decouverte' ? null : forfait,
    });
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <IllustratedBackground source={ONBOARDING_ILLUSTRATIONS.bienvenue} fadeFrom={0.48}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <BrandMark size="sm" />
        </View>

        <View style={styles.bottom}>
          <AnimatedTitleBlock
            line1={t('welcome.line1')}
            line2={t('welcome.line2')}
            body={t('welcome.body')}
            align="center"
            size={34}
            delay={250}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.cta}>
            <PillButton label={t('welcome.explore')} icon="compass" onPress={onFinish} loading={loading} />
          </View>
        </View>
      </SafeAreaView>
    </IllustratedBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 26 },
  top: { paddingTop: 18 },
  bottom: { paddingBottom: 18 },
  text: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textBody,
    textAlign: 'center',
    marginTop: 12,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.terracottaText,
    textAlign: 'center',
    marginTop: 12,
  },
  cta: { marginTop: 26 },
});
