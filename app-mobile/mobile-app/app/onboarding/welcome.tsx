import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { GoldButton } from '../../src/components/Buttons';
import { useWizardState } from '../../src/onboarding/WizardState';
import { formatPlanPrice, PLAN_NAMES, type PaidPlan } from '../../src/onboarding/pricing';
import { colors, typography } from '../../src/theme/tokens';

/**
 * Écran final de l'assistant post-inscription — fidèle à la maquette
 * "BIENVENUE". Atteint depuis plan.tsx (forfait Découverte, gratuit) ou
 * depuis payment.tsx (Racines/Héritage, paiement simulé — voir sa note en
 * tête de fichier). Au clic sur "Aller à l'accueil", les choix de
 * l'assistant sont persistés (Supabase Auth, user_metadata) via
 * completeOnboarding : Stack.Protected bascule alors automatiquement vers
 * le catalogue héros, pas besoin de navigation manuelle.
 */
export default function WelcomeStepScreen() {
  const { session, completeOnboarding } = useAuth();
  const { langueInterface, usages, forfait, billing } = useWizardState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prenom = (session?.user?.user_metadata?.prenom as string | undefined) ?? 'toi';

  const forfaitSummary =
    forfait === 'decouverte' ? `${PLAN_NAMES.decouverte} (gratuit)` : formatPlanPrice(forfait as PaidPlan, billing);

  const onFinish = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await completeOnboarding({
      langueInterface,
      usages,
      forfait,
      billing: forfait === 'decouverte' ? undefined : billing,
      paymentStatus: forfait === 'decouverte' ? 'none' : 'simulated',
    });
    setLoading(false);
    if (err) setError(err);
    // Si succès : onboardingComplete passe à true, Stack.Protected redirige seul vers le catalogue.
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.glowBlob} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logoGlow} />
            <Image source={require('../../assets/icon.png')} style={styles.logo} />
          </View>

          <Text style={styles.title}>Bienvenue,{'\n'}{prenom} !</Text>
          <Text style={styles.subtitle}>Ton compte AFROBACK est prêt. Le voyage vers tes origines commence.</Text>

          <View style={styles.summary}>
            <SummaryRow icon="✨" label="FORFAIT" value={forfaitSummary} />
            <SummaryRow icon="🧒" label="PROFILS" value="Aucun profil enfant" />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.cta}>
            <GoldButton label={loading ? '...' : 'Aller à l’accueil'} onPress={onFinish} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <View>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.backgroundPlayerTo,
  },
  glowBlob: {
    position: 'absolute',
    left: '50%',
    top: -140,
    marginLeft: -190,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(210,120,45,.18)',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(240,195,107,.3)',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textHeading,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.textQuote,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 30,
    maxWidth: 280,
  },
  summary: {
    width: '100%',
    gap: 10,
    marginBottom: 34,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.18)',
    backgroundColor: 'rgba(0,0,0,.18)',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  summaryIcon: {
    fontSize: 18,
  },
  summaryLabel: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  summaryValue: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 2,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.terracottaText,
    textAlign: 'center',
    marginBottom: 14,
  },
  cta: {
    width: '100%',
  },
});
