import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { FormField, GoldCheckbox } from '../../src/onboarding/FormField';
import { BrandMark, MotifFrieze, ONBOARDING_BG, PillButton } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';
import { PasswordStrength, meetsPasswordRule } from '../../src/onboarding/PasswordStrength';
import { COUNTRIES, CountryPicker, type Country } from '../../src/components/CountryPicker';
import { Icon } from '../../src/components/Icons';

/**
 * Écran 7 — "Crée ton compte", identique à la maquette de Yannick du
 * 2026-09-29 (décision D2) : prénom, email, mot de passe. Pas de Google ni
 * d'Apple (décision D3). Un enfant ne crée jamais de compte (D1) : la case
 * obligatoire confirme la majorité, sans ajouter de champ date de naissance.
 *
 * Si Supabase exige la confirmation de l'email (réglage actuel), l'écran
 * `verification-email` prend le relais pour saisir le code reçu. Sinon, la
 * session s'ouvre et Stack.Protected enchaîne seul sur la suite du parcours.
 */
type Errors = Partial<Record<'prenom' | 'email' | 'phone' | 'password' | 'accepted' | 'form', string>>;

export default function SignupScreen() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const { t } = useI18n();
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  // Téléphone : second identifiant de connexion (demande de Yannick du 2026-09-29).
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [emailExists, setEmailExists] = useState(false);

  // Numéro complet au format international : indicatif du pays + numéro sans le 0 initial.
  const fullPhone = () => country.dialCode + phoneLocal.replace(/\D/g, '').replace(/^0+/, '');

  const validate = (): Errors => {
    const e: Errors = {};
    if (!prenom.trim()) e.prenom = t('signup.errors.firstName');
    if (!email.trim()) e.email = t('signup.errors.emailEmpty');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = t('signup.errors.emailInvalid');
    if (!/^\+[1-9]\d{7,14}$/.test(fullPhone())) e.phone = t('signup.errors.phone');
    if (!meetsPasswordRule(password)) e.password = t('signup.errors.passwordShort');
    if (!accepted) e.accepted = t('signup.errors.consent');
    return e;
  };

  const onSubmit = async () => {
    if (loading) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    setEmailExists(false);
    const res = await signUpWithEmail({ email, password, prenom: prenom.trim(), telephone: fullPhone() });
    setLoading(false);
    if (res.error) {
      setErrors(res.phoneTaken ? { phone: res.error } : { form: res.error });
      setEmailExists(!!res.emailExists);
      return;
    }
    if (res.needsVerification) {
      router.push({ pathname: '/onboarding/verification-email', params: { email: email.trim().toLowerCase() } });
    }
    // Sinon : session ouverte, Stack.Protected enchaîne automatiquement.
  };

  const openLegal = (doc: 'cgu' | 'confidentialite') => router.push({ pathname: '/legal/[doc]', params: { doc } });

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
            <Text style={styles.title} accessibilityRole="header">
              {t('signup.title')}
            </Text>
            <Text style={styles.subtitle}>{t('signup.subtitle')}</Text>

            <View style={styles.form}>
              <FormField
                icon="user"
                placeholder={t('signup.firstName')}
                value={prenom}
                onChangeText={setPrenom}
                autoComplete="given-name"
                textContentType="givenName"
                autoCapitalize="words"
                returnKeyType="next"
                error={errors.prenom}
              />
              <FormField
                icon="mail"
                placeholder={t('signup.email')}
                value={email}
                onChangeText={setEmail}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                error={errors.email}
              />
              <View style={styles.phoneGroup}>
                <CountryPicker value={country} onChange={setCountry} />
                <FormField
                  icon="phone"
                  placeholder={t('signup.phone')}
                  accessibilityLabel={t('signup.phone')}
                  value={phoneLocal}
                  onChangeText={setPhoneLocal}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                  leading={<Text style={styles.dial}>{country.dialCode}</Text>}
                  error={errors.phone}
                />
              </View>
              <FormField
                icon="lock"
                placeholder={t('signup.password')}
                accessibilityLabel={t('signup.passwordA11y')}
                hint={t('signup.passwordHint')}
                value={password}
                onChangeText={setPassword}
                secure
                autoComplete="new-password"
                textContentType="newPassword"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
                error={errors.password}
              />
              <PasswordStrength password={password} />

              <GoldCheckbox checked={accepted} onToggle={() => setAccepted((v) => !v)} error={errors.accepted}>
                <Text style={styles.termsText}>
                  {t('signup.consentStart')}{' '}
                  <Text style={styles.termsLink} onPress={() => openLegal('cgu')}>
                    {t('signup.terms')}
                  </Text>{' '}
                  {t('signup.and')}{' '}
                  <Text style={styles.termsLink} onPress={() => openLegal('confidentialite')}>
                    {t('signup.privacy')}
                  </Text>
                  .
                </Text>
              </GoldCheckbox>
            </View>

            {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}
            {emailExists && (
              <Pressable
                onPress={() => router.replace({ pathname: '/onboarding/login', params: { email: email.trim().toLowerCase() } })}
                style={styles.existsLink}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.switchLink}>{t('signup.emailExistsLink')} ›</Text>
              </Pressable>
            )}

            <View style={styles.cta}>
              <PillButton label={t('signup.submit')} icon="userPlus" onPress={onSubmit} loading={loading} />
            </View>

            <Text style={styles.childNote}>
              {t('signup.childNote')}
            </Text>

            <Pressable
              onPress={() => router.replace('/onboarding/login')}
              style={styles.switch}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.switchLabel}>
                {t('signup.haveAccount')} <Text style={styles.switchLink}>{t('signup.login')}</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: ONBOARDING_BG,
  },
  frieze: {
    position: 'absolute',
    bottom: 18,
    right: -20,
    transform: [{ rotate: '-8deg' }],
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 36,
  },
  back: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginLeft: -6,
  },
  backIcon: {
    fontSize: 30,
    color: colors.accentGold,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.textHeading,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.textBody,
    marginTop: 6,
  },
  form: {
    gap: 14,
    marginTop: 28,
  },
  termsText: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textBody,
  },
  termsLink: {
    color: colors.accentGoldPale,
    fontFamily: typography.bodySemiBold,
    textDecorationLine: 'underline',
  },
  formError: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.terracottaText,
    marginTop: 16,
  },
  phoneGroup: {
    gap: 10,
  },
  dial: {
    fontFamily: typography.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  existsLink: {
    marginTop: 8,
    paddingVertical: 4,
  },
  cta: {
    marginTop: 24,
  },
  childNote: {
    fontFamily: typography.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textMutedAlt,
    textAlign: 'center',
    marginTop: 14,
  },
  switch: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textBodyAlt,
  },
  switchLink: {
    color: colors.accentGoldPale,
    fontFamily: typography.bodySemiBold,
    textDecorationLine: 'underline',
  },
});
