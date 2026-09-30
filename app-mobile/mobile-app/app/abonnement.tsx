import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccess } from '../src/access/Access';
import { currentLanguage, useI18n } from '../src/i18n';
import { formatPlanPrice, type Billing, type PaidPlan } from '../src/onboarding/pricing';
import { PremiumButton } from '../src/components/Buttons';
import { startPayment, syncPendingPayments } from '../src/payments/paiement';
import { MobileMoneyBadges, paymentErrorMessage } from '../src/payments/MobileMoneyBadges';
import { BrandMark } from '../src/onboarding/ui';
import { colors, typography } from '../src/theme/tokens';

/**
 * Écran "Abonnements" (cdc-acces-gratuit-abonnement.md, lot A), ouvert
 * depuis la fenêtre "Réservé aux abonnés", le bandeau de l'accueil ou le
 * profil. Montre le forfait actuel (source serveur `mon_abonnement()`) et
 * les trois forfaits.
 *
 * Paiement Mobile Money réel via Campay (cdc-paiement-geniuspay.md) :
 * mensuel ou annuel, "Renouveler" sur le forfait en cours (les jours
 * restants sont conservés côté serveur).
 */
export default function AbonnementScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { subscription, refresh } = useAccess();
  const [billing, setBilling] = useState<Billing>('monthly');
  const [paying, setPaying] = useState<PaidPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Diagnostic d'un paiement resté en attente (mise en service Campay).
  const [pendingDiag, setPendingDiag] = useState<string | null>(null);

  const pay = async (plan: PaidPlan) => {
    if (paying) return;
    setPaying(plan);
    setError(null);
    const { paiementId, error: err } = await startPayment({ type: 'abonnement', plan, periode: billing });
    if (err || !paiementId) {
      setPaying(null);
      setError(paymentErrorMessage(t, err));
      return;
    }
    if (Platform.OS !== 'web') {
      setPaying(null);
      router.push({ pathname: '/paiement/retour', params: { id: paiementId } });
    }
  };

  // Un abonnement offert entre-temps depuis le back-office apparaît au retour sur l'écran ;
  // un paiement resté en attente (retour de Campay interrompu) est revérifié et crédité.
  useFocusEffect(
    useCallback(() => {
      refresh();
      syncPendingPayments().then(({ credite, diag }) => {
        if (credite > 0) refresh();
        setPendingDiag(credite > 0 ? null : diag);
      });
    }, [refresh])
  );

  const current = subscription?.plan ?? 'decouverte';
  const endLabel = subscription
    ? subscription.ends_at
      ? t('abonnement.until', {
          date: new Date(subscription.ends_at).toLocaleDateString(currentLanguage() === 'en' ? 'en-GB' : 'fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        })
      : t('abonnement.noEnd')
    : null;

  const plans = [
    { id: 'decouverte' as const, name: 'Découverte', price: t('abonnement.freePrice'), desc: t('abonnement.decouverteDesc') },
    { id: 'racines' as const, name: 'Racines', price: formatPlanPrice('racines', billing), desc: t('abonnement.racinesDesc') },
    {
      id: 'heritage' as const,
      name: 'Héritage',
      price: formatPlanPrice('heritage', billing),
      desc: t('abonnement.heritageDesc'),
      recommended: true,
    },
  ];

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} hitSlop={14} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.back')}>
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <BrandMark layout="inline" />
            <View style={styles.back} />
          </View>

          <Text style={styles.title} accessibilityRole="header">
            {t('abonnement.title')}
          </Text>
          <Text style={styles.subtitle}>{t('abonnement.subtitle')}</Text>

          <View style={styles.currentCard}>
            <Text style={styles.currentLabel}>{t('abonnement.current')}</Text>
            <Text style={styles.currentValue}>
              {subscription ? (subscription.plan === 'heritage' ? 'Héritage' : 'Racines') : t('abonnement.free')}
            </Text>
            {!!endLabel && (
              <Text style={styles.currentMeta}>
                {endLabel}
                {subscription?.source === 'offert' ? ` · ${t('abonnement.offered')}` : ''}
              </Text>
            )}
          </View>

          <View style={styles.toggle}>
            {(['monthly', 'yearly'] as const).map((b) => (
              <Pressable
                key={b}
                onPress={() => setBilling(b)}
                style={[styles.togglePill, billing === b && styles.togglePillActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: billing === b }}
              >
                <Text style={[styles.toggleLabel, billing === b && styles.toggleLabelActive]}>
                  {t(b === 'monthly' ? 'plan.monthly' : 'plan.yearly')}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.plans}>
            {plans.map((p) => {
              const isCurrent = p.id === current;
              return (
                <View key={p.id} style={[styles.plan, p.recommended && styles.planRecommended, isCurrent && styles.planCurrent]}>
                  {(p.recommended || isCurrent) && (
                    <View style={[styles.flag, isCurrent && styles.flagCurrent]}>
                      <Text style={[styles.flagText, isCurrent && styles.flagTextCurrent]}>{isCurrent ? t('abonnement.subscribedBadge') : t('abonnement.recommended')}</Text>
                    </View>
                  )}
                  <View style={styles.planHead}>
                    <Text style={styles.planName}>{p.name}</Text>
                    <Text style={styles.planPrice}>{p.price}</Text>
                  </View>
                  <Text style={styles.planDesc}>{p.desc}</Text>
                  {p.id !== 'decouverte' && (
                    <View style={styles.planCta}>
                      <PremiumButton
                        label={isCurrent ? t('abonnement.renew') : t('plan.choose', { plan: p.name })}
                        variant={p.recommended || isCurrent ? 'gold' : 'glass'}
                        icon="lock"
                        loading={paying === p.id}
                        disabled={!!paying && paying !== p.id}
                        onPress={() => pay(p.id as PaidPlan)}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}
          {!!pendingDiag && <Text style={styles.diag}>{t('abonnement.pendingCheck', { diag: pendingDiag })}</Text>}

          <Text style={styles.sectionLabel}>{t('payment.methods')}</Text>
          <MobileMoneyBadges />
          <Text style={styles.disclaimer}>{t('abonnement.payNote')}</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0B0906' },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { fontSize: 30, color: colors.accentGold },
  title: { fontFamily: typography.display, fontSize: 30, color: colors.textHeading, marginTop: 18 },
  subtitle: { fontFamily: typography.body, fontSize: 15, color: colors.textBody, marginTop: 6 },
  currentCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(240,195,107,.08)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
  },
  currentLabel: {
    fontFamily: typography.mono,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  currentValue: { fontFamily: typography.display, fontSize: 20, color: colors.accentGoldPale, marginTop: 4 },
  currentMeta: { fontFamily: typography.body, fontSize: 13, color: colors.textBodyAlt, marginTop: 2 },
  plans: { gap: 14, marginTop: 22 },
  plan: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.14)',
    backgroundColor: 'rgba(26,19,13,.9)',
  },
  planRecommended: { borderColor: 'rgba(240,195,107,.55)' },
  planCurrent: { borderColor: colors.accentGoldBright, backgroundColor: 'rgba(240,195,107,.07)' },
  flag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(240,195,107,.18)',
    marginBottom: 8,
  },
  flagCurrent: { backgroundColor: colors.accentGoldBright },
  flagTextCurrent: { color: colors.ctaTextOnGold },
  flagText: { fontFamily: typography.bodyBold, fontSize: 10.5, letterSpacing: 0.6, color: colors.textHeading },
  planHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 },
  planName: { fontFamily: typography.display, fontSize: 20, color: colors.textHeading },
  planPrice: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.accentGoldPale },
  planDesc: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody, marginTop: 8 },
  planCta: { marginTop: 14 },
  diag: { fontFamily: typography.mono, fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 14 },
  toggle: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.14)',
    backgroundColor: 'rgba(26,19,13,.9)',
  },
  togglePill: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  togglePillActive: { backgroundColor: colors.accentGoldBright },
  toggleLabel: { fontFamily: typography.bodySemiBold, fontSize: 13.5, color: colors.textBodyAlt },
  toggleLabelActive: { color: colors.ctaTextOnGold },
  error: { fontFamily: typography.body, fontSize: 13.5, color: colors.terracottaText, textAlign: 'center', marginTop: 16 },
  sectionLabel: {
    fontFamily: typography.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
    marginTop: 24,
    marginBottom: 10,
  },
  disclaimer: { fontFamily: typography.body, fontSize: 12, lineHeight: 18, color: colors.textMuted, textAlign: 'center', marginTop: 12 },
});
