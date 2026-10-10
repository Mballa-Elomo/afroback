import { useEffect, useRef, useState } from 'react';
import { usePaymentPolicy } from '../settings/SettingsProvider';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthProvider';
import { useAccess } from '../access/Access';
import { Icon } from '../components/Icons';
import { GoldButton } from '../components/Buttons';
import { colors, typography } from '../theme/tokens';
import { currentLanguage, useI18n } from '../i18n';
import {
  cancelPayment,
  checkPayment,
  detectOperator,
  formatLocal,
  isValidMobileMoney,
  localDigits,
  requestPayment,
  type DirectPayment,
  type Operator,
  type PaymentRequest,
} from './paiement';

const GOLD = colors.accentGoldBright;
const GREEN = '#7FB77E';
const WAIT_SECONDS = 180; // D2 : 3 minutes avant de proposer « Réessayer »
const POLL_MS = 3000;

type Phase = 'form' | 'sending' | 'waiting' | 'success' | 'failed' | 'timeout';

const OPERATOR_STYLE: Record<Operator, { bg: string; fg: string; label: string }> = {
  MTN: { bg: '#FFCC00', fg: '#1a1109', label: 'MTN MoMo' },
  ORANGE: { bg: '#FF6600', fg: '#ffffff', label: 'Orange Money' },
};

/** Numéro Mobile Money du compte, pour pré-remplir (D1). */
function accountPhone(session: ReturnType<typeof useAuth>['session']): string {
  const meta = (session?.user?.user_metadata ?? {}) as Record<string, unknown>;
  const raw = (typeof meta.telephone === 'string' && meta.telephone) || session?.user?.phone || '';
  const local = localDigits(String(raw));
  return isValidMobileMoney(local) ? local : '';
}

function errorText(t: (k: string, o?: Record<string, unknown>) => string, raw?: string): string {
  const [code, detail] = (raw ?? '').split('|');
  const key =
    {
      numero_invalide: 'momo.errors.number',
      trop_de_demandes: 'momo.errors.tooMany',
      non_configure: 'paiement.errors.notConfigured',
      montant_invalide: 'paiement.errors.amount',
      non_authentifie: 'paiement.errors.session',
      reseau: 'paiement.errors.network',
      passerelle: 'momo.errors.gateway',
      paiements_desactives: 'paiement.errors.disabled',
      dons_desactives: 'paiement.errors.disabled',
      abonnements_desactives: 'paiement.errors.disabled',
      operateur_indisponible: 'paiement.errors.operator',
    }[code] ?? 'paiement.errors.generic';
  return detail && code === 'passerelle' ? `${t(key)} (${detail})` : t(key);
}

/**
 * Paiement Mobile Money sans quitter l'app (cdc-paiement-sans-sortie.md) :
 * 1. numéro MTN / Orange (pré-rempli, modifiable, opérateur détecté) ;
 * 2. la demande part sur le téléphone, l'app attend la validation sur place
 *    (vérification toutes les 3 s, 3 min maximum), avec Annuler et Changer
 *    de numéro ;
 * 3. succès ou échec affichés ici même. Seul le serveur crédite.
 */
export function PaymentSheet({
  visible,
  request,
  summary,
  amount,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  request: PaymentRequest | null;
  /** Ex. « Héritage · 1 mois » ou « Don à AFROBACK ». */
  summary: string;
  /** Montant affiché, ex. 3000. */
  amount: number;
  onClose: () => void;
  /** Appelé quand la personne touche « Continuer » après un paiement réussi. */
  onSuccess: () => void;
}) {
  const { t } = useI18n();
  const { session } = useAuth();
  const { refresh, subscription } = useAccess();
  const [phase, setPhase] = useState<Phase>('form');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<DirectPayment | null>(null);
  const [remaining, setRemaining] = useState(WAIT_SECONDS);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    pollRef.current = null;
    tickRef.current = null;
  };

  // Ouverture : on repart du formulaire avec le numéro du compte.
  useEffect(() => {
    if (!visible) return;
    setPhase('form');
    setError(null);
    setPayment(null);
    setPhone((p) => p || accountPhone(session));
    return stopTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => stopTimers, []);

  const operator = detectOperator(phone);
  // Opérateurs acceptés, réglés dans le back-office (onglet Paramètres).
  const policy = usePaymentPolicy();
  const operatorOff = (operator === 'MTN' && !policy.mtn) || (operator === 'ORANGE' && !policy.orange);
  const valid = isValidMobileMoney(phone) && !operatorOff;
  const amountLabel = `${amount.toLocaleString(currentLanguage() === 'en' ? 'en-GB' : 'fr-FR')} FCFA`;

  const startWaiting = (p: DirectPayment) => {
    setPayment(p);
    setRemaining(WAIT_SECONDS);
    setPhase('waiting');
    stopTimers();
    tickRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          stopTimers();
          setPhase((ph) => (ph === 'waiting' ? 'timeout' : ph));
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    pollRef.current = setInterval(async () => {
      const { data } = await checkPayment(p.paiement_id);
      if (!data) return;
      if (data.statut === 'reussi') {
        stopTimers();
        await refresh();
        setPhase('success');
      } else if (data.statut === 'echoue' || data.statut === 'expire') {
        stopTimers();
        setPhase('failed');
      }
    }, POLL_MS);
  };

  const pay = async () => {
    if (!request || !valid || phase === 'sending') return;
    setPhase('sending');
    setError(null);
    const { data, error: err } = await requestPayment(request, phone);
    if (err || !data) {
      setPhase('form');
      setError(errorText(t, err));
      return;
    }
    startWaiting(data);
  };

  const abandon = async () => {
    stopTimers();
    if (payment && (phase === 'waiting' || phase === 'timeout')) await cancelPayment(payment.paiement_id);
    setPayment(null);
  };

  const changeNumber = async () => {
    await abandon();
    setPhase('form');
  };

  const close = async () => {
    if (phase === 'success') {
      onSuccess();
      return;
    }
    await abandon();
    onClose();
  };

  const checkAgain = async () => {
    if (!payment) return;
    const { data } = await checkPayment(payment.paiement_id);
    if (data?.statut === 'reussi') {
      await refresh();
      setPhase('success');
    } else if (data?.statut === 'echoue') setPhase('failed');
    else startWaiting(payment);
  };

  const op = payment?.operateur ?? operator;
  const endDate = subscription?.ends_at
    ? new Date(subscription.ends_at).toLocaleDateString(currentLanguage() === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const planName = request?.type === 'abonnement' ? (request.plan === 'heritage' ? 'Héritage' : 'Racines') : '';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={phase === 'form' ? close : undefined} accessibilityLabel={t('common.cancel')} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {(phase === 'form' || phase === 'sending') && (
            <>
              <Text style={styles.kicker}>{t('momo.title')}</Text>
              <View style={styles.summary}>
                <Text style={styles.summaryLabel} numberOfLines={1}>
                  {summary}
                </Text>
                <Text style={styles.summaryAmount}>{amountLabel}</Text>
              </View>

              <Text style={styles.label}>{t('momo.numberLabel')}</Text>
              <View style={[styles.inputRow, !!phone && !valid && localDigits(phone).length === 9 && styles.inputRowError]}>
                <Text style={styles.prefix}>+237</Text>
                <TextInput
                  value={formatLocal(phone)}
                  onChangeText={(v) => {
                    setPhone(localDigits(v));
                    setError(null);
                  }}
                  keyboardType="phone-pad"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="6XX XX XX XX"
                  placeholderTextColor={colors.textMuted}
                  maxLength={12}
                  style={styles.input}
                  accessibilityLabel={t('momo.numberLabel')}
                  editable={phase === 'form'}
                />
                {operator && (
                  <View style={[styles.opBadge, { backgroundColor: OPERATOR_STYLE[operator].bg }]}>
                    <Text style={[styles.opText, { color: OPERATOR_STYLE[operator].fg }]}>{OPERATOR_STYLE[operator].label}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.hint}>
                {operatorOff ? t('momo.errors.operatorOff', { operator: operator === 'MTN' ? 'MTN MoMo' : 'Orange Money' }) : !!phone && !valid && localDigits(phone).length === 9 ? t('momo.errors.number') : t('momo.numberHint')}
              </Text>
              {!!error && <Text style={styles.error}>{error}</Text>}

              <View style={{ marginTop: 18 }}>
                <GoldButton
                  label={phase === 'sending' ? t('momo.sending') : t('momo.pay', { amount: amountLabel })}
                  onPress={pay}
                  disabled={!valid || phase === 'sending'}
                />
              </View>
              <Pressable onPress={close} style={styles.textBtn} accessibilityRole="button">
                <Text style={styles.textBtnLabel}>{t('common.cancel')}</Text>
              </Pressable>
              <Text style={styles.secure}>🔒 {t('momo.secure')}</Text>
            </>
          )}

          {(phase === 'waiting' || phase === 'timeout') && payment && (
            <>
              <View style={styles.phoneIcon}>
                {phase === 'waiting' ? <ActivityIndicator color={GOLD} size="large" /> : <Icon name="phone" size={30} color={GOLD} />}
              </View>
              <Text style={styles.title}>{phase === 'waiting' ? t('momo.waitTitle') : t('momo.timeoutTitle')}</Text>
              <Text style={styles.body}>
                {phase === 'waiting' ? t('momo.waitText', { amount: amountLabel }) : t('momo.timeoutText')}
              </Text>
              <View style={styles.numberChip}>
                {op && <View style={[styles.dot, { backgroundColor: OPERATOR_STYLE[op].bg }]} />}
                <Text style={styles.numberChipText}>
                  {payment.telephone_masque}
                  {op ? ` · ${OPERATOR_STYLE[op].label}` : ''}
                </Text>
              </View>
              <View style={styles.ussd}>
                <Text style={styles.ussdText}>
                  {t('momo.nothing')} <Text style={styles.ussdCode}>{payment.ussd_code}</Text>
                </Text>
              </View>
              {phase === 'waiting' ? (
                <Text style={styles.countdown}>
                  {t('momo.remaining', { time: `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` })}
                </Text>
              ) : (
                <View style={{ marginTop: 16 }}>
                  <GoldButton label={t('paiement.checkAgain')} onPress={checkAgain} />
                </View>
              )}
              <View style={styles.row}>
                <Pressable onPress={changeNumber} style={styles.pill} accessibilityRole="button">
                  <Text style={styles.pillText}>{t('momo.changeNumber')}</Text>
                </Pressable>
                <Pressable onPress={close} style={styles.pill} accessibilityRole="button">
                  <Text style={styles.pillText}>{t('common.cancel')}</Text>
                </Pressable>
              </View>
              <Text style={styles.secure}>{t('momo.cancelNote')}</Text>
            </>
          )}

          {phase === 'success' && (
            <>
              <View style={[styles.phoneIcon, { borderColor: 'rgba(127,183,126,.5)', backgroundColor: 'rgba(127,183,126,.12)' }]}>
                <Icon name="check" size={34} color={GREEN} strokeWidth={2.6} />
              </View>
              <Text style={styles.title}>
                {request?.type === 'don' ? t('paiement.donTitle') : t('paiement.successTitle', { plan: planName })}
              </Text>
              <Text style={styles.body}>
                {request?.type === 'don'
                  ? t('paiement.donText', { amount: amount.toLocaleString('fr-FR') })
                  : endDate
                    ? t('momo.activeUntil', { date: endDate })
                    : t('paiement.successText')}
              </Text>
              <View style={{ marginTop: 18 }}>
                <GoldButton label={t('paiement.continue')} onPress={onSuccess} />
              </View>
            </>
          )}

          {phase === 'failed' && (
            <>
              <View style={[styles.phoneIcon, { borderColor: colors.terracottaBorder, backgroundColor: colors.terracottaBg }]}>
                <Icon name="close" size={30} color={colors.terracottaText} />
              </View>
              <Text style={styles.title}>{t('momo.failedTitle')}</Text>
              <Text style={styles.body}>{t('momo.failedText')}</Text>
              <View style={{ marginTop: 18, gap: 10 }}>
                <GoldButton label={t('paiement.retry')} onPress={pay} />
                <Pressable onPress={() => setPhase('form')} style={styles.textBtn} accessibilityRole="button">
                  <Text style={styles.textBtnLabel}>{t('momo.changeNumber')}</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.65)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#15100B',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.25)',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },
  handle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: 'rgba(237,227,212,.25)', marginBottom: 16 },
  kicker: { fontFamily: typography.bodyExtraBold, fontSize: 11.5, letterSpacing: 1.8, color: GOLD, textTransform: 'uppercase' },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(240,195,107,.08)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.25)',
  },
  summaryLabel: { flex: 1, fontFamily: typography.bodyBold, fontSize: 15, color: colors.textPrimary },
  summaryAmount: { fontFamily: typography.display, fontSize: 18, color: GOLD },
  label: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.textBody, marginTop: 18, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(237,227,212,.16)',
    backgroundColor: 'rgba(30,24,18,.95)',
    paddingHorizontal: 14,
    minHeight: 56,
  },
  inputRowError: { borderColor: colors.terracottaText },
  prefix: { fontFamily: typography.bodyBold, fontSize: 16, color: colors.textMuted },
  input: { flex: 1, fontFamily: typography.bodyBold, fontSize: 18, letterSpacing: 1, color: colors.textPrimary, paddingVertical: 12 },
  opBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  opText: { fontFamily: typography.bodyExtraBold, fontSize: 11 },
  hint: { fontFamily: typography.body, fontSize: 12.5, lineHeight: 18, color: colors.textMuted, marginTop: 6 },
  error: { fontFamily: typography.bodySemiBold, fontSize: 13, lineHeight: 19, color: colors.terracottaText, marginTop: 10 },
  textBtn: { alignItems: 'center', paddingVertical: 12 },
  textBtnLabel: { fontFamily: typography.bodyBold, fontSize: 14.5, color: colors.textBody },
  secure: { fontFamily: typography.body, fontSize: 12, lineHeight: 17, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  phoneIcon: {
    alignSelf: 'center',
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
    backgroundColor: 'rgba(240,195,107,.10)',
    marginTop: 4,
  },
  title: { fontFamily: typography.display, fontSize: 21, lineHeight: 28, color: colors.textHeading, textAlign: 'center', marginTop: 16 },
  body: { fontFamily: typography.bodyMedium, fontSize: 15, lineHeight: 22, color: colors.textBody, textAlign: 'center', marginTop: 8 },
  numberChip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(237,227,212,.06)',
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.12)',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  numberChipText: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.textPrimary },
  ussd: { marginTop: 14, padding: 12, borderRadius: 14, backgroundColor: 'rgba(240,195,107,.06)', borderWidth: 1, borderColor: 'rgba(240,195,107,.18)' },
  ussdText: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody, textAlign: 'center' },
  ussdCode: { fontFamily: typography.bodyExtraBold, color: GOLD },
  countdown: { fontFamily: typography.mono, fontSize: 12, color: colors.accentGoldPale, textAlign: 'center', marginTop: 14 },
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  pill: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(240,195,107,.35)' },
  pillText: { fontFamily: typography.bodyBold, fontSize: 14, color: GOLD },
});
