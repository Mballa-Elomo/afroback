import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { COUNTRIES, CountryPicker, type Country } from '../../src/components/CountryPicker';
import { FormField } from '../../src/onboarding/FormField';
import { BrandMark, MotifFrieze, ONBOARDING_BG, PillButton } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';
import { SessionEndedNotice } from '../../src/security/SessionEndedNotice';
import { Icon } from '../../src/components/Icons';

/**
 * Connexion — restylée aux couleurs de la maquette du 2026-09-29.
 * **Email ou téléphone** : les nouveaux comptes (depuis le 2026-09-29) se
 * connectent par email ; les comptes créés avant (téléphone + mot de passe)
 * gardent leur connexion par téléphone. "Mot de passe oublié" reste un
 * message d'attente jusqu'au Module 3 (cdc-onboarding.md, section 8).
 */
type Mode = 'email' | 'phone';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithPhone } = useAuth();
  const { t } = useI18n();
  // Email prérempli quand on arrive depuis l'inscription ("un compte existe déjà").
  const params = useLocalSearchParams<{ email?: string }>();
  const [mode, setMode] = useState<Mode>('email');
  const [email, setEmail] = useState(params.email ?? '');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (loading) return;
    const identifierMissing = mode === 'email' ? !email.trim() : !phoneLocal.trim();
    if (identifierMissing || !password) {
      setError(mode === 'email' ? t('login.errors.emailMissing') : t('login.errors.phoneMissing'));
      return;
    }
    setError(null);
    setLoading(true);
    const res =
      mode === 'email'
        ? await signInWithEmail({ email, password })
        : await signInWithPhone({
            phone: country.dialCode + phoneLocal.replace(/\D/g, '').replace(/^0+/, ''),
            password,
          });
    setLoading(false);
    if ('unconfirmed' in res && res.unconfirmed) {
      router.push({ pathname: '/onboarding/verification-email', params: { email: email.trim().toLowerCase(), resent: '1' } });
      return;
    }
    if (res.error) setError(res.error);
    // Succès : le AuthProvider met à jour la session, Stack.Protected redirige automatiquement.
  };

  const openForgot = () =>
    router.push({ pathname: '/onboarding/mot-de-passe-oublie', params: mode === 'email' && email.trim() ? { email: email.trim() } : {} });

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/onboarding/bienvenue'));

  return (
    <View style={styles.wrap}>
      <View style={styles.frieze}>
        <MotifFrieze width={150} height={16} opacity={0.4} />
      </View>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Pressable onPress={goBack} hitSlop={14} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.back')}>
              <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
            </Pressable>

            <BrandMark layout="inline" />
            <View style={{ marginTop: 16 }}>
              <SessionEndedNotice />
            </View>
            <Text style={styles.title} accessibilityRole="header">
              {t('login.title')}
            </Text>
            <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

            <View style={styles.segment} accessibilityRole="tablist">
              {(['email', 'phone'] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => {
                    setMode(m);
                    setError(null);
                  }}
                  style={[styles.segmentItem, mode === m && styles.segmentItemActive]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: mode === m }}
                >
                  <Text style={[styles.segmentLabel, mode === m && styles.segmentLabelActive]}>
                    {m === 'email' ? t('login.tabEmail') : t('login.tabPhone')}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.form}>
              {mode === 'email' ? (
                <FormField
                  icon="mail"
                  placeholder={t('login.email')}
                  value={email}
                  onChangeText={setEmail}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              ) : (
                <>
                  <CountryPicker value={country} onChange={setCountry} />
                  <FormField
                    icon="phone"
                    placeholder="690 00 00 00"
                    accessibilityLabel={t('login.phoneA11y')}
                    value={phoneLocal}
                    onChangeText={setPhoneLocal}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    leading={<Text style={styles.dial}>{country.dialCode}</Text>}
                  />
                </>
              )}
              <FormField
                icon="lock"
                placeholder={t('login.password')}
                value={password}
                onChangeText={setPassword}
                secure
                autoComplete="current-password"
                textContentType="password"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
              <Pressable onPress={openForgot} style={styles.forgot} hitSlop={10} accessibilityRole="button">
                <Text style={styles.forgotLabel}>{t('login.forgot')}</Text>
              </Pressable>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.cta}>
              <PillButton label={t('login.submit')} icon="login" onPress={onSubmit} loading={loading} />
            </View>

            <Pressable
              onPress={() => router.replace('/onboarding/signup')}
              style={styles.switch}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.switchLabel}>
                {t('login.noAccount')} <Text style={styles.switchLink}>{t('login.createAccount')}</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  frieze: { position: 'absolute', bottom: 18, right: -20, transform: [{ rotate: '-8deg' }] },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 36 },
  back: { width: 44, height: 44, justifyContent: 'center', marginLeft: -6 },
  backIcon: { fontSize: 30, color: colors.accentGold },
  title: { fontFamily: typography.display, fontSize: 28, color: colors.textHeading, marginTop: 10 },
  subtitle: { fontFamily: typography.body, fontSize: 15, color: colors.textBody, marginTop: 6 },
  segment: {
    flexDirection: 'row',
    marginTop: 26,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(237,227,212,.14)',
    backgroundColor: 'rgba(26,19,13,.85)',
  },
  segmentItem: { flex: 1, minHeight: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  segmentItemActive: { backgroundColor: 'rgba(240,195,107,.16)' },
  segmentLabel: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.textMutedAlt },
  segmentLabelActive: { color: colors.accentGoldPale },
  form: { gap: 14, marginTop: 18 },
  dial: { fontFamily: typography.mono, fontSize: 14, color: colors.textPrimary },
  forgot: { alignSelf: 'flex-end', paddingVertical: 4 },
  forgotLabel: { fontFamily: typography.body, fontSize: 13, color: colors.accentGoldPale },
  error: { fontFamily: typography.body, fontSize: 13, lineHeight: 19, color: colors.terracottaText, marginTop: 14 },
  cta: { marginTop: 22 },
  switch: { marginTop: 22, alignItems: 'center', paddingVertical: 8 },
  switchLabel: { fontFamily: typography.body, fontSize: 14, color: colors.textBodyAlt },
  switchLink: { color: colors.accentGoldPale, fontFamily: typography.bodySemiBold, textDecorationLine: 'underline' },
});
