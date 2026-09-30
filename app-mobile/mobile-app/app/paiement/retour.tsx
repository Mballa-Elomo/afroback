import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { useAccess } from '../../src/access/Access';
import { PremiumButton } from '../../src/components/Buttons';
import { Icon } from '../../src/components/Icons';
import { BrandMark } from '../../src/onboarding/ui';
import {
  checkPayment,
  clearPendingPayment,
  closePaymentBrowser,
  pendingPaymentId,
  type PaymentStatus,
} from '../../src/payments/paiement';
import { PLAN_NAMES } from '../../src/onboarding/pricing';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';

const POLL_MS = 4000;
const MAX_WAIT_MS = 4 * 60 * 1000;

type View_ = 'attente' | 'reussi' | 'echec' | 'trop_long' | 'introuvable';

/**
 * Écran "Paiement en cours de confirmation" (cdc-paiement-geniuspay.md, §3).
 * Ouvert juste après l'ouverture de la page Campay (téléphone) ou au
 * retour de Campay (web, /paiement/retour?id=…). Redemande le statut au
 * serveur toutes les 4 s, et immédiatement quand la personne revient dans
 * l'app ; le serveur, lui, le relit chez Campay avant de débloquer.
 */
export default function PaiementRetourScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { onboardingComplete } = useAuth();
  const { refresh } = useAccess();
  const params = useLocalSearchParams<{ id?: string; echec?: string }>();
  const [paiementId, setPaiementId] = useState<string | null>(typeof params.id === 'string' ? params.id : null);
  const [state, setState] = useState<View_>('attente');
  const [diag, setDiag] = useState<string | null>(null);
  const [info, setInfo] = useState<{ type: 'abonnement' | 'don'; plan: string | null; montant: number } | null>(null);
  const startedAt = useRef(Date.now());
  const busy = useRef(false);

  useEffect(() => {
    if (paiementId) return;
    pendingPaymentId().then((id) => (id ? setPaiementId(id) : setState('introuvable')));
  }, [paiementId]);

  const check = useCallback(async () => {
    if (!paiementId || busy.current) return;
    busy.current = true;
    const { data, error } = await checkPayment(paiementId);
    busy.current = false;
    if (error === 'introuvable') return setState('introuvable');
    if (!data) return;
    setDiag(data.diag ?? null);
    setInfo({ type: data.type, plan: data.plan, montant: data.montant });
    const s: PaymentStatus = data.statut;
    if (s === 'reussi') {
      setState('reussi');
      closePaymentBrowser();
      clearPendingPayment();
      refresh();
    } else if (s === 'echoue' || s === 'annule' || s === 'expire' || s === 'rembourse') {
      setState('echec');
      closePaymentBrowser();
      clearPendingPayment();
    } else if (Date.now() - startedAt.current > MAX_WAIT_MS) {
      setState('trop_long');
    }
  }, [paiementId, refresh]);

  useEffect(() => {
    if (!paiementId || (state !== 'attente')) return;
    check();
    const timer = setInterval(check, POLL_MS);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [paiementId, state, check]);

  const retry = () => {
    startedAt.current = Date.now();
    setState('attente');
  };

  const continuer = () => {
    if (!onboardingComplete) router.replace('/onboarding/welcome');
    else router.replace(info?.type === 'don' ? '/accueil' : '/abonnement');
  };

  const choisirAutre = () => {
    if (!onboardingComplete) router.replace('/onboarding/plan');
    else if (info?.type === 'don') router.replace('/don/montant');
    else router.replace('/abonnement');
  };

  const planName = info?.plan ? PLAN_NAMES[info.plan as keyof typeof PLAN_NAMES] : '';
  const amount = info ? info.montant.toLocaleString('fr-FR') : '';

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <BrandMark layout="inline" />
        </View>

        <View style={styles.center}>
          {state === 'attente' && (
            <>
              <ActivityIndicator size="large" color={colors.accentGoldBright} />
              <Text style={styles.title} accessibilityRole="header">
                {t('paiement.waitingTitle')}
              </Text>
              <Text style={styles.text}>{t('paiement.waitingText')}</Text>
            </>
          )}

          {state === 'reussi' && (
            <>
              <View style={styles.badge}>
                <Icon name={info?.type === 'don' ? 'heart' : 'check'} size={34} color={colors.ctaTextOnGold} />
              </View>
              <Text style={styles.title} accessibilityRole="header">
                {info?.type === 'don' ? t('paiement.donTitle') : t('paiement.successTitle', { plan: planName })}
              </Text>
              <Text style={styles.text}>
                {info?.type === 'don' ? t('paiement.donText', { amount }) : t('paiement.successText')}
              </Text>
            </>
          )}

          {state === 'echec' && (
            <>
              <Text style={styles.bigIcon}>✕</Text>
              <Text style={styles.title} accessibilityRole="header">
                {t('paiement.failedTitle')}
              </Text>
              <Text style={styles.text}>{t('paiement.failedText')}</Text>
              {!!diag && <Text style={styles.diag}>{diag}</Text>}
            </>
          )}

          {state === 'trop_long' && (
            <>
              <Text style={styles.bigIcon}>⏳</Text>
              <Text style={styles.title} accessibilityRole="header">
                {t('paiement.slowTitle')}
              </Text>
              <Text style={styles.text}>{t('paiement.slowText')}</Text>
              {!!diag && <Text style={styles.diag}>{diag}</Text>}
            </>
          )}

          {state === 'introuvable' && (
            <>
              <Text style={styles.title} accessibilityRole="header">
                {t('paiement.notFoundTitle')}
              </Text>
              <Text style={styles.text}>{t('paiement.notFoundText')}</Text>
            </>
          )}
        </View>

        <View style={styles.actions}>
          {state === 'reussi' && <PremiumButton label={t('paiement.continue')} icon="arrowRight" onPress={continuer} />}
          {state === 'echec' && (
            <>
              <PremiumButton label={t('paiement.retry')} icon="arrowRight" onPress={choisirAutre} />
              <PremiumButton label={t('paiement.later')} variant="glass" onPress={continuer} />
            </>
          )}
          {state === 'trop_long' && (
            <>
              <PremiumButton label={t('paiement.checkAgain')} icon="arrowRight" onPress={retry} />
              <PremiumButton label={t('paiement.later')} variant="glass" onPress={continuer} />
            </>
          )}
          {state === 'attente' && <PremiumButton label={t('paiement.later')} variant="glass" onPress={continuer} />}
          {state === 'introuvable' && <PremiumButton label={t('paiement.continue')} icon="arrowRight" onPress={continuer} />}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0B0906' },
  safe: { flex: 1, paddingHorizontal: 26 },
  top: { paddingTop: 14, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  badge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accentGoldBright,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigIcon: { fontSize: 44, color: colors.accentGoldBright },
  title: { fontFamily: typography.display, fontSize: 26, color: colors.textHeading, textAlign: 'center', marginTop: 6 },
  text: { fontFamily: typography.body, fontSize: 15.5, lineHeight: 23, color: colors.textBody, textAlign: 'center' },
  diag: { fontFamily: typography.mono, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  actions: { gap: 12, paddingBottom: 18 },
});
