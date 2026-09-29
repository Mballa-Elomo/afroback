import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccess } from '../src/access/Access';
import { Icon } from '../src/components/Icons';
import { currentLanguage, useI18n } from '../src/i18n';
import { formatPlanPrice } from '../src/onboarding/pricing';
import { BrandMark } from '../src/onboarding/ui';
import { colors, typography } from '../src/theme/tokens';

/**
 * Écran "Abonnements" (cdc-acces-gratuit-abonnement.md, lot A), ouvert
 * depuis la fenêtre "Réservé aux abonnés", le bandeau de l'accueil ou le
 * profil. Montre le forfait actuel (source serveur `mon_abonnement()`) et
 * les trois forfaits.
 *
 * Honnête sur l'état réel : le paiement Mobile Money n'existe pas encore
 * (Module 4). Aucun bouton "Payer" factice : un encart l'explique et
 * indique comment obtenir un accès offert (décision D5 du 2026-09-29).
 */
export default function AbonnementScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { subscription, refresh } = useAccess();

  // Un abonnement offert entre-temps depuis le back-office apparaît au retour sur l'écran.
  useFocusEffect(
    useCallback(() => {
      refresh();
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
    { id: 'racines' as const, name: 'Racines', price: formatPlanPrice('racines', 'monthly'), desc: t('abonnement.racinesDesc') },
    {
      id: 'heritage' as const,
      name: 'Héritage',
      price: formatPlanPrice('heritage', 'monthly'),
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
                </View>
              );
            })}
          </View>

          <View style={styles.soon}>
            <Icon name="sparkle" size={20} color={colors.accentGoldBright} />
            <View style={{ flex: 1 }}>
              <Text style={styles.soonTitle}>{t('abonnement.soonTitle')}</Text>
              <Text style={styles.soonText}>{t('abonnement.soonText')}</Text>
            </View>
          </View>
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
  soon: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
    backgroundColor: 'rgba(240,195,107,.06)',
  },
  soonTitle: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.textPrimary },
  soonText: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody, marginTop: 4 },
});
