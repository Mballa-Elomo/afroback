import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccess } from '../src/access/Access';
import { currentLanguage, useI18n } from '../src/i18n';
import { formatPlanPrice, planPriceFcfa, type Billing, type PaidPlan } from '../src/onboarding/pricing';
import { PremiumButton } from '../src/components/Buttons';
import { setSubscriptionCancelled, syncPendingPayments } from '../src/payments/paiement';
import { MobileMoneyBadges } from '../src/payments/MobileMoneyBadges';
import { PaymentSheet } from '../src/payments/PaymentSheet';
import { BrandMark } from '../src/onboarding/ui';
import { colors, typography } from '../src/theme/tokens';
import { Icon } from '../src/components/Icons';

/**
 * Écran "Abonnements" (cdc-acces-gratuit-abonnement.md, lot A), ouvert
 * depuis la fenêtre "Réservé aux abonnés", le bandeau de l'accueil ou le
 * profil. Montre le forfait actuel (source serveur `mon_abonnement()`) et
 * les trois forfaits.
 *
 * Paiement Mobile Money réel via Campay, SANS QUITTER L'APP
 * (cdc-paiement-sans-sortie.md, 2026-10-07) : la feuille de paiement envoie
 * la demande au numéro MTN / Orange et attend la validation sur place.
 * Mensuel ou annuel, "Renouveler" sur le forfait en cours (les jours restants
 * sont conservés côté serveur). Résilier / reprendre : accès conservé jusqu'à
 * la date de fin, sans remboursement (décision de Yannick).
 * `?renouveler=1` (bandeau de renouvellement) ouvre directement le paiement
 * du forfait en cours.
 */
export default function AbonnementScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { subscription, refresh } = useAccess();
  const [billing, setBilling] = useState<Billing>('monthly');
  const params = useLocalSearchParams<{ renouveler?: string }>();
  const [sheetPlan, setSheetPlan] = useState<PaidPlan | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Diagnostic d'un paiement resté en attente (mise en service Campay).
  const [pendingDiag, setPendingDiag] = useState<string | null>(null);

  const pay = (plan: PaidPlan) => {
    setError(null);
    setSheetPlan(plan);
  };

  // Bandeau « Renouveler » : ouvre directement le paiement du forfait en cours.
  useEffect(() => {
    if (params.renouveler === '1' && subscription?.plan) setSheetPlan(subscription.plan);
  }, [params.renouveler, subscription?.plan]);

  const toggleCancelled = async (cancel: boolean) => {
    setBusy(true);
    setError(null);
    const ok = await setSubscriptionCancelled(cancel);
    if (ok) await refresh();
    else setError(t('abonnement.actionError'));
    setBusy(false);
    setConfirmCancel(false);
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
  const cancelled = !!subscription?.resilie_le;
  const endDate = subscription?.ends_at
    ? new Date(subscription.ends_at).toLocaleDateString(currentLanguage() === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const currentName = subscription?.plan === 'heritage' ? 'Héritage' : 'Racines';
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
              <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
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
                {cancelled ? t('abonnement.cancelled', { date: endDate }) : endLabel}
                {subscription?.source === 'offert' ? ` · ${t('abonnement.offered')}` : ''}
              </Text>
            )}
            {subscription?.resiliable && !cancelled && (
              <Pressable onPress={() => setConfirmCancel(true)} hitSlop={8} style={styles.manageBtn} accessibilityRole="button">
                <Text style={styles.manageText}>{t('abonnement.cancel')}</Text>
              </Pressable>
            )}
            {subscription?.resiliable && cancelled && (
              <Pressable onPress={() => toggleCancelled(false)} disabled={busy} style={[styles.manageBtn, styles.resumeBtn]} accessibilityRole="button">
                <Text style={[styles.manageText, styles.resumeText]}>{t('abonnement.resume')}</Text>
              </Pressable>
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

      <PaymentSheet
        visible={!!sheetPlan}
        request={sheetPlan ? { type: 'abonnement', plan: sheetPlan, periode: billing } : null}
        summary={sheetPlan ? `${sheetPlan === 'heritage' ? 'Héritage' : 'Racines'} · ${t(billing === 'yearly' ? 'abonnement.periodYear' : 'abonnement.periodMonth')}` : ''}
        amount={sheetPlan ? planPriceFcfa(sheetPlan, billing) : 0}
        onClose={() => setSheetPlan(null)}
        onSuccess={() => {
          setSheetPlan(null);
          refresh();
        }}
      />

      {/* Confirmation de résiliation : accès conservé jusqu'à la fin, sans remboursement. */}
      <Modal visible={confirmCancel} transparent animationType="fade" onRequestClose={() => setConfirmCancel(false)}>
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>{t('abonnement.cancelTitle')}</Text>
            <Text style={styles.confirmText}>{t('abonnement.cancelText', { plan: currentName, date: endDate })}</Text>
            <Pressable onPress={() => toggleCancelled(true)} disabled={busy} style={styles.confirmDanger} accessibilityRole="button">
              <Text style={styles.confirmDangerText}>{t('abonnement.cancelConfirm')}</Text>
            </Pressable>
            <PremiumButton label={t('abonnement.cancelKeep')} variant="gold" onPress={() => setConfirmCancel(false)} />
          </View>
        </View>
      </Modal>
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
  manageBtn: { alignSelf: 'flex-start', marginTop: 12, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(227,162,119,.4)' },
  manageText: { fontFamily: typography.bodyBold, fontSize: 13, color: colors.terracottaText },
  resumeBtn: { borderColor: colors.accentGoldBright, backgroundColor: 'rgba(240,195,107,.12)' },
  resumeText: { color: colors.accentGoldBright },
  confirmBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    gap: 14,
    padding: 22,
    borderRadius: 22,
    backgroundColor: '#15100B',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.25)',
  },
  confirmTitle: { fontFamily: typography.display, fontSize: 20, color: colors.textHeading },
  confirmText: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 22, color: colors.textBody },
  confirmDanger: { alignItems: 'center', paddingVertical: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(227,162,119,.45)' },
  confirmDangerText: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.terracottaText },
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
