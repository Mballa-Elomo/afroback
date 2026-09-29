import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { Icon } from '../../src/components/Icons';
import { supabase } from '../../src/data/supabaseClient';
import { useI18n } from '../../src/i18n';
import { BrandMark, ONBOARDING_BG, PillButton } from '../../src/onboarding/ui';
import { maskEmail } from '../../src/security/device';
import { colors, typography } from '../../src/theme/tokens';

/**
 * "Nouvel appareil détecté" (cdc-appareil-unique.md). Seul écran accessible
 * tant que l'appareil n'est pas validé (grille d'accès de app/_layout.tsx).
 *
 * Preuve : code envoyé à l'email du compte, ou code de l'application
 * d'authentification si la vérification en 2 étapes est activée (vérifié
 * côté serveur). Une fois validé, cet appareil devient l'actif et les autres
 * sont déconnectés ; un email d'alerte part au titulaire.
 */
const CODE_LENGTH = 6;
const RESEND_DELAY_S = 60;
const MAX_FAILURES = 5;
const LOCK_MS = 5 * 60 * 1000;

export default function NouvelAppareilScreen() {
  const { t } = useI18n();
  const { session, mfaStatus, requestDeviceCode, verifyDeviceWithEmailCode, verifyDeviceWithTotp } = useAuth();
  const email = session?.user?.email ?? null;
  const hasTotp = mfaStatus === 'challenge_required' || mfaStatus === 'satisfied';

  const [mode, setMode] = useState<'email' | 'totp'>(hasTotp ? 'totp' : 'email');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [failures, setFailures] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const inputRef = useRef<TextInput>(null);

  const send = async () => {
    if (!email || sending) return;
    setSending(true);
    setError(null);
    const res = await requestDeviceCode();
    setSending(false);
    if (res.error) setError(res.error);
    else {
      setSent(true);
      setCooldown(RESEND_DELAY_S);
    }
  };

  // Mode email : le code part tout seul à l'arrivée sur l'écran.
  useEffect(() => {
    if (mode === 'email' && email && !sent) send();
    setCode('');
    setTimeout(() => inputRef.current?.focus(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= lockedUntil) {
        setLockedUntil(null);
        setFailures(0);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const lockRemaining = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const lockLabel = `${Math.floor(lockRemaining / 60)} min ${String(lockRemaining % 60).padStart(2, '0')} s`;

  const submit = async (value = code) => {
    if (loading || lockedUntil) return;
    if (value.length !== CODE_LENGTH) return setError(t('device.codeFormat'));
    setLoading(true);
    setError(null);
    const res = mode === 'email' ? await verifyDeviceWithEmailCode(value) : await verifyDeviceWithTotp(value);
    setLoading(false);
    if (res.error) {
      const next = failures + 1;
      setFailures(next);
      setCode('');
      if (next >= MAX_FAILURES || ('locked' in res && res.locked)) {
        setLockedUntil(Date.now() + LOCK_MS);
        setNow(Date.now());
        setError(null);
      } else {
        setError(res.error);
        inputRef.current?.focus();
      }
    }
    // Succès : l'appareil est actif, la grille d'accès ouvre l'app d'elle-même.
  };

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
    if (digits.length === CODE_LENGTH) submit(digits);
  };

  const noWayToVerify = mode === 'email' && !email;

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <BrandMark layout="inline" />
          </View>
          <View style={styles.shield}>
            <Icon name="shield" size={30} color={colors.accentGoldBright} strokeWidth={1.8} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {t('device.title')}
          </Text>
          <Text style={styles.subtitle}>{t('device.subtitle')}</Text>

          {noWayToVerify ? (
            <Text style={styles.error}>{t('device.noEmail')}</Text>
          ) : (
            <>
              <Text style={styles.info}>
                {mode === 'totp'
                  ? t('device.totpSubtitle')
                  : sending && !sent
                    ? t('device.sending')
                    : t('device.sentTo', { email: maskEmail(email ?? '') })}
              </Text>

              <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxes} accessible={false}>
                {Array.from({ length: CODE_LENGTH }, (_, i) => (
                  <View key={i} style={[styles.box, i === code.length && !loading && styles.boxActive, !!error && styles.boxError]}>
                    <Text style={styles.digit}>{code[i] ?? ''}</Text>
                  </View>
                ))}
              </Pressable>
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={onChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={CODE_LENGTH}
                style={styles.hiddenInput}
                accessibilityLabel={t('verify.codeA11y')}
              />

              {!!lockedUntil && <Text style={styles.error}>{t('device.locked', { time: lockLabel })}</Text>}
              {!!error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.cta}>
                <PillButton
                  label={t('device.validate')}
                  icon="check"
                  onPress={() => submit()}
                  loading={loading}
                  disabled={code.length !== CODE_LENGTH || !!lockedUntil}
                />
              </View>
              <Text style={styles.note}>{t('device.oneDevice')}</Text>

              {mode === 'email' && (
                <Pressable onPress={send} disabled={cooldown > 0 || sending} style={styles.link} hitSlop={8} accessibilityRole="button">
                  <Text style={[styles.linkText, (cooldown > 0 || sending) && styles.linkDisabled]}>
                    {cooldown > 0 ? t('device.resendIn', { s: cooldown }) : t('device.resend')}
                  </Text>
                </Pressable>
              )}
              {hasTotp && !!email && (
                <Pressable onPress={() => setMode(mode === 'totp' ? 'email' : 'totp')} style={styles.link} hitSlop={8} accessibilityRole="button">
                  <Text style={styles.linkSecondary}>{mode === 'totp' ? t('device.useEmail') : t('device.useTotp')}</Text>
                </Pressable>
              )}
            </>
          )}

          {/* Déconnexion de CET appareil seulement : un intrus qui appuie ici ne doit pas déconnecter le vrai titulaire. */}
          <Pressable onPress={() => supabase.auth.signOut({ scope: 'local' })} style={styles.link} hitSlop={8} accessibilityRole="button">
            <Text style={styles.linkDanger}>{t('device.notMe')}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  logo: { marginBottom: 26 },
  shield: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,195,107,.1)',
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.45)',
  },
  title: { fontFamily: typography.display, fontSize: 26, lineHeight: 32, color: colors.textHeading, textAlign: 'center', marginTop: 16 },
  subtitle: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textBody, textAlign: 'center', marginTop: 8 },
  info: { fontFamily: typography.bodySemiBold, fontSize: 14.5, lineHeight: 21, color: colors.textPrimary, textAlign: 'center', marginTop: 22 },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 },
  box: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.16)',
    backgroundColor: 'rgba(26,19,13,.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: 'rgba(240,195,107,.8)' },
  boxError: { borderColor: colors.terracotta },
  digit: { fontFamily: typography.monoBold, fontSize: 22, color: colors.textHeading },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  error: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.terracottaText, marginTop: 14, textAlign: 'center' },
  cta: { marginTop: 24 },
  note: { fontFamily: typography.body, fontSize: 12.5, lineHeight: 18, color: colors.textMutedAlt, textAlign: 'center', marginTop: 12 },
  link: { alignItems: 'center', paddingVertical: 10 },
  linkText: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.accentGoldPale, textDecorationLine: 'underline' },
  linkDisabled: { color: colors.textMuted, textDecorationLine: 'none' },
  linkSecondary: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.textBodyAlt },
  linkDanger: { fontFamily: typography.body, fontSize: 13.5, color: colors.terracottaText, marginTop: 8 },
});
