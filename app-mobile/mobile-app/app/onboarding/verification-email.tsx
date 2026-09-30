import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { BrandMark, MotifFrieze, ONBOARDING_BG, PillButton } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';
import { Icon } from '../../src/components/Icons';

/**
 * Écran 7b — confirmation de l'email par code à 6 chiffres (absent de la
 * maquette, nécessaire à la confirmation d'email validée le 2026-09-29).
 * Un code plutôt qu'un lien : les liens qui rouvrent l'app sont peu fiables
 * dans Expo Go et sur web.
 *
 * Côté Supabase, le modèle d'email "Confirm signup" doit contenir
 * `{{ .Token }}` pour que le code soit réellement envoyé (Module 2 :
 * fournisseur SMTP + modèle aux couleurs AFROBACK). Une fois le code
 * validé, la session s'ouvre et Stack.Protected enchaîne seul.
 */
const CODE_LENGTH = 6;
const RESEND_DELAY_S = 60;
const MAX_FAILURES = 5;
const LOCK_MS = 5 * 60 * 1000;

export default function VerificationEmailScreen() {
  const router = useRouter();
  const { email, resent } = useLocalSearchParams<{ email: string; resent?: string }>();
  const { verifySignupCode, resendSignupCode } = useAuth();
  const { t } = useI18n();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(resent === '1' ? t('verify.resentAuto') : null);
  // 5 codes faux d'affilée → pause de 5 min (confort : la vraie limite est côté serveur Supabase).
  const [failures, setFailures] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [cooldown, setCooldown] = useState(RESEND_DELAY_S);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= lockedUntil) {
        setLockedUntil(null);
        setFailures(0);
        setError(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);
  const lockRemaining = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const lockLabel = `${Math.floor(lockRemaining / 60)} min ${String(lockRemaining % 60).padStart(2, '0')} s`;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (value = code) => {
    if (loading || value.length !== CODE_LENGTH || !email || lockedUntil) return;
    setLoading(true);
    setError(null);
    const { error: err } = await verifySignupCode({ email, code: value });
    setLoading(false);
    if (err) {
      const next = failures + 1;
      setFailures(next);
      setCode('');
      if (next >= MAX_FAILURES) {
        setLockedUntil(Date.now() + LOCK_MS);
        setNow(Date.now());
        setError(null);
      } else {
        setError(err);
        inputRef.current?.focus();
      }
    }
    // Succès : session ouverte, Stack.Protected passe à la suite du parcours.
  };

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
    if (digits.length === CODE_LENGTH) submit(digits);
  };

  const resend = async () => {
    if (cooldown > 0 || !email) return;
    setInfo(null);
    setError(null);
    const { error: err } = await resendSignupCode(email);
    if (err) setError(err);
    else {
      setInfo(t('verify.resent'));
      setCooldown(RESEND_DELAY_S);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.frieze}>
        <MotifFrieze width={150} height={16} opacity={0.4} />
      </View>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={14}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
          </Pressable>

          <BrandMark layout="inline" />
          <Text style={styles.title} accessibilityRole="header">
            {t('verify.title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('verify.sentTo')}{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <Pressable onPress={() => inputRef.current?.focus()} style={styles.boxes} accessible={false}>
            {Array.from({ length: CODE_LENGTH }, (_, i) => {
              const filled = i < code.length;
              const active = i === code.length && !loading;
              return (
                <View key={i} style={[styles.box, active && styles.boxActive, !!error && styles.boxError]}>
                  <Text style={styles.digit}>{filled ? code[i] : ''}</Text>
                </View>
              );
            })}
          </Pressable>
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={onChange}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={CODE_LENGTH}
            autoFocus
            style={styles.hiddenInput}
            accessibilityLabel={t('verify.codeA11y')}
          />

          {!!lockedUntil && <Text style={styles.error}>{t('verify.locked', { time: lockLabel })}</Text>}
          {!!error && <Text style={styles.error}>{error}</Text>}
          {!!info && <Text style={styles.info}>{info}</Text>}

          <View style={styles.cta}>
            <PillButton
              label={t('verify.submit')}
              icon="check"
              onPress={() => submit()}
              loading={loading}
              disabled={code.length !== CODE_LENGTH || !!lockedUntil}
            />
          </View>

          <Pressable onPress={resend} disabled={cooldown > 0} style={styles.resend} hitSlop={8} accessibilityRole="button">
            <Text style={[styles.resendText, cooldown > 0 && styles.resendDisabled]}>
              {cooldown > 0 ? t('verify.resendIn', { s: cooldown }) : t('verify.resend')}
            </Text>
          </Pressable>

          <Text style={styles.hint}>{t('verify.spamHint')}</Text>

          <Pressable onPress={() => router.back()} style={styles.change} hitSlop={8} accessibilityRole="button">
            <Text style={styles.changeText}>{t('verify.changeEmail')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  frieze: { position: 'absolute', bottom: 18, right: -20, transform: [{ rotate: '-8deg' }] },
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  back: { width: 44, height: 44, justifyContent: 'center', marginLeft: -6 },
  backIcon: { fontSize: 30, color: colors.accentGold },
  title: { fontFamily: typography.display, fontSize: 26, color: colors.textHeading, marginTop: 10 },
  subtitle: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textBody, marginTop: 8 },
  email: { fontFamily: typography.bodySemiBold, color: colors.accentGoldPale },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
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
  error: { fontFamily: typography.body, fontSize: 13, color: colors.terracottaText, marginTop: 14 },
  info: { fontFamily: typography.body, fontSize: 13, color: colors.textQuote, marginTop: 14 },
  cta: { marginTop: 26 },
  resend: { alignItems: 'center', paddingVertical: 14 },
  resendText: {
    fontFamily: typography.bodySemiBold,
    fontSize: 14,
    color: colors.accentGoldPale,
    textDecorationLine: 'underline',
  },
  resendDisabled: { color: colors.textMuted, textDecorationLine: 'none' },
  change: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  changeText: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.textBodyAlt },
  hint: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMutedAlt, textAlign: 'center' },
});
