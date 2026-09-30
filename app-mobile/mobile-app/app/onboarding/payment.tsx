import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StepHeader } from '../../src/onboarding/StepHeader';
import { useWizardState } from '../../src/onboarding/WizardState';
import { formatPlanPrice, PLAN_NAMES, type PaidPlan } from '../../src/onboarding/pricing';
import { PremiumButton, TextLinkButton } from '../../src/components/Buttons';
import { startPayment } from '../../src/payments/paiement';
import { MobileMoneyBadges, paymentErrorMessage } from '../../src/payments/MobileMoneyBadges';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';

/**
 * Étape 4/5 (suite de plan.tsx) : récapitulatif puis paiement Mobile Money
 * réel via Campay (cdc-paiement-geniuspay.md). Le choix MTN / Orange se
 * fait sur la page sécurisée de Campay (décision D3). Le forfait n'est
 * débloqué que par le serveur, une fois le paiement confirmé par Campay
 * (écran paiement/retour). "Continuer avec Découverte" reste possible.
 */
export default function PaymentStepScreen() {
  const router = useRouter();
  const { forfait, billing } = useWizardState();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cet écran n'est atteint que depuis plan.tsx pour Racines/Héritage.
  const plan = (forfait === 'decouverte' ? 'racines' : forfait) as PaidPlan;
  const planLabel = PLAN_NAMES[plan];
  const total = formatPlanPrice(plan, billing);

  const pay = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const { paiementId, error: err } = await startPayment({ type: 'abonnement', plan, periode: billing });
    if (err || !paiementId) {
      setLoading(false);
      setError(paymentErrorMessage(t, err));
      return;
    }
    // Sur web, la page part vers Campay : rien d'autre à faire ici.
    if (Platform.OS !== 'web') {
      setLoading(false);
      router.push({ pathname: '/paiement/retour', params: { id: paiementId } });
    }
  };

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <StepHeader step={2} onBack={() => router.back()} />

          <Text style={styles.title}>{t('payment.title')}</Text>
          <Text style={styles.subtitle}>{t('payment.subtitle')}</Text>

          <View style={styles.recap}>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>{t('payment.planLine', { plan: planLabel })}</Text>
              <Text style={styles.recapValue}>{total}</Text>
            </View>
            <View style={[styles.recapRow, styles.recapTotalRow]}>
              <Text style={styles.recapTotalLabel}>{t('payment.total')}</Text>
              <Text style={styles.recapTotalValue}>{total}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>{t('payment.methods')}</Text>
          <MobileMoneyBadges />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.cta}>
            <PremiumButton label={t('payment.pay', { amount: total })} icon="lock" onPress={pay} loading={loading} />
          </View>
          <Text style={styles.disclaimer}>{t('payment.disclaimer')}</Text>

          <View style={styles.freeLink}>
            <TextLinkButton label={t('payment.continueFree')} onPress={() => router.push('/onboarding/welcome')} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 26, paddingTop: 14, paddingBottom: 40 },
  title: { fontFamily: typography.display, fontSize: 25, color: colors.textHeading },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 16,
  },
  recap: {
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  recapLabel: { fontFamily: typography.body, fontSize: 13.5, color: colors.textBodyAlt },
  recapValue: { fontFamily: typography.mono, fontSize: 13.5, color: colors.accentGold },
  recapTotalRow: { borderTopWidth: 1, borderTopColor: colors.borderStrong, marginTop: 6, paddingTop: 12 },
  recapTotalLabel: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary },
  recapTotalValue: { fontFamily: typography.monoBold, fontSize: 15, color: colors.textHeading },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 12,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.terracottaText,
    textAlign: 'center',
    marginTop: 16,
  },
  cta: { marginTop: 24 },
  disclaimer: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  freeLink: { alignItems: 'center', marginTop: 18 },
});
