import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { useI18n } from '../../src/i18n';
import { FormField } from '../../src/onboarding/FormField';
import { PasswordStrength, meetsPasswordRule } from '../../src/onboarding/PasswordStrength';
import { BrandMark, ONBOARDING_BG, PillButton } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { Icon } from '../../src/components/Icons';

/**
 * Mot de passe oublié (Module 3, 2026-09-29) — deux étapes sur un seul écran :
 * 1. l'e-mail du compte → envoi d'un code à 6 chiffres (modèle "Reset
 *    Password" de Supabase, qui doit contenir le code : voir
 *    supabase/email-templates/reset-password.html) ;
 * 2. le code + le nouveau mot de passe (même règle qu'à l'inscription) →
 *    mot de passe changé, la personne est connectée.
 *
 * Réponse volontairement neutre à l'étape 1 ("si un compte existe…") : ne
 * révèle pas qui est inscrit. Comptes créés avec un numéro seulement (avant
 * le 2026-09-29) : pas d'e-mail, donc pas de code possible → contact indiqué.
 */
const CODE_LENGTH = 6;
const RESEND_DELAY_S = 60;
const MAX_FAILURES = 5;
const LOCK_MS = 5 * 60 * 1000;

export default function MotDePasseOublieScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ email?: string }>();
  const { requestPasswordReset, resetPasswordWithCode } = useAuth();

  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [failures, setFailures] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const codeRef = useRef<TextInput>(null);

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

  const sendCode = async () => {
    if (loading) return;
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError(t('signup.errors.emailInvalid'));
      return;
    }
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setStep('reset');
    setCooldown(RESEND_DELAY_S);
    setTimeout(() => codeRef.current?.focus(), 300);
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setError(null);
    const res = await requestPasswordReset(email);
    if (res.error) setError(res.error);
    else setCooldown(RESEND_DELAY_S);
  };

  const submit = async () => {
    if (loading || lockedUntil) return;
    setError(null);
    if (code.length !== CODE_LENGTH) return setError(t('forgot.codeFormat'));
    if (!meetsPasswordRule(password)) return setError(t('signup.errors.passwordShort'));
    if (password !== confirm) return setError(t('forgot.mismatch'));
    setLoading(true);
    const res = await resetPasswordWithCode({ email, code, password });
    setLoading(false);
    if (res.error) {
      const next = failures + 1;
      setFailures(next);
      setCode('');
      if (next >= MAX_FAILURES) {
        setLockedUntil(Date.now() + LOCK_MS);
        setNow(Date.now());
      } else {
        setError(res.error);
      }
      return;
    }
    // Connecté avec le nouveau mot de passe. On repart explicitement de
    // l'aiguillage (app/index.tsx) : cet écran n'est plus accessible une fois
    // connecté, y rester donnait un écran noir.
    Alert.alert(t('forgot.successTitle'), t('forgot.successText'));
    // Léger différé : laisse le temps à la navigation de se remonter après le
    // changement de session ; si elle s'est déjà redirigée seule, rien à faire.
    setTimeout(() => {
      try {
        router.replace('/');
      } catch {
        // Déjà redirigé par la grille d'accès de app/_layout.tsx.
      }
    }, 400);
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/onboarding/login'));

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Pressable onPress={goBack} hitSlop={14} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.back')}>
              <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
            </Pressable>
            <BrandMark layout="inline" />

            {step === 'email' ? (
              <>
                <Text style={styles.title} accessibilityRole="header">
                  {t('forgot.title')}
                </Text>
                <Text style={styles.subtitle}>{t('forgot.subtitle')}</Text>
                <View style={styles.form}>
                  <FormField
                    icon="mail"
                    placeholder={t('forgot.email')}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="send"
                    onSubmitEditing={sendCode}
                  />
                </View>
                {!!error && <Text style={styles.error}>{error}</Text>}
                <View style={styles.cta}>
                  <PillButton label={t('forgot.send')} icon="arrowRight" onPress={sendCode} loading={loading} />
                </View>
                <Text style={styles.note}>{t('forgot.phoneOnly')}</Text>
              </>
            ) : (
              <>
                <Text style={styles.title} accessibilityRole="header">
                  {t('forgot.sentTitle')}
                </Text>
                <Text style={styles.subtitle}>{t('forgot.sentText', { email: email.trim().toLowerCase() })}</Text>

                <Text style={styles.label}>{t('forgot.code')}</Text>
                <Pressable onPress={() => codeRef.current?.focus()} style={styles.boxes} accessible={false}>
                  {Array.from({ length: CODE_LENGTH }, (_, i) => (
                    <View key={i} style={[styles.box, i === code.length && styles.boxActive]}>
                      <Text style={styles.digit}>{code[i] ?? ''}</Text>
                    </View>
                  ))}
                </Pressable>
                <TextInput
                  ref={codeRef}
                  value={code}
                  onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  maxLength={CODE_LENGTH}
                  style={styles.hiddenInput}
                  accessibilityLabel={t('forgot.code')}
                />

                <View style={styles.form}>
                  <FormField
                    icon="lock"
                    placeholder={t('forgot.newPassword')}
                    value={password}
                    onChangeText={setPassword}
                    secure
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    hint={t('signup.passwordHint')}
                  />
                  <PasswordStrength password={password} />
                  <FormField
                    icon="lock"
                    placeholder={t('forgot.confirmPassword')}
                    value={confirm}
                    onChangeText={setConfirm}
                    secure
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="done"
                    onSubmitEditing={submit}
                  />
                </View>

                {!!lockedUntil && <Text style={styles.error}>{t('forgot.locked', { time: lockLabel })}</Text>}
                {!!error && <Text style={styles.error}>{error}</Text>}

                <View style={styles.cta}>
                  <PillButton label={t('forgot.submit')} icon="check" onPress={submit} loading={loading} disabled={!!lockedUntil} />
                </View>

                <Pressable onPress={resend} disabled={cooldown > 0} style={styles.link} hitSlop={8} accessibilityRole="button">
                  <Text style={[styles.linkText, cooldown > 0 && styles.linkDisabled]}>
                    {cooldown > 0 ? t('forgot.resendIn', { s: cooldown }) : t('forgot.resend')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setStep('email');
                    setCode('');
                    setError(null);
                  }}
                  style={styles.link}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Text style={styles.linkSecondary}>{t('forgot.changeEmail')}</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  back: { width: 44, height: 44, justifyContent: 'center', marginLeft: -6 },
  backIcon: { fontSize: 30, color: colors.accentGold },
  title: { fontFamily: typography.display, fontSize: 27, lineHeight: 33, color: colors.textHeading, marginTop: 18 },
  subtitle: { fontFamily: typography.body, fontSize: 15, lineHeight: 22, color: colors.textBody, marginTop: 8 },
  form: { gap: 12, marginTop: 20 },
  label: {
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 24,
  },
  boxes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
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
  digit: { fontFamily: typography.monoBold, fontSize: 22, color: colors.textHeading },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
  error: { fontFamily: typography.body, fontSize: 13, lineHeight: 19, color: colors.terracottaText, marginTop: 14 },
  cta: { marginTop: 22 },
  note: { fontFamily: typography.body, fontSize: 13, lineHeight: 19, color: colors.textMutedAlt, marginTop: 18, textAlign: 'center' },
  link: { alignItems: 'center', paddingVertical: 10 },
  linkText: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.accentGoldPale, textDecorationLine: 'underline' },
  linkDisabled: { color: colors.textMuted, textDecorationLine: 'none' },
  linkSecondary: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.textBodyAlt },
});
