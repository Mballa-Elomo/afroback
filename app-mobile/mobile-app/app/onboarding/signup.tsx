import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { GoldButton } from '../../src/components/Buttons';
import { COUNTRIES, CountryPicker, type Country } from '../../src/components/CountryPicker';
import { colors, typography } from '../../src/theme/tokens';

/**
 * Inscription — Prénom, Pays, Téléphone, Mot de passe (décision de Yannick
 * du 2026-07-30 : authentification uniquement par téléphone + mot de passe,
 * plus d'email ni de Google/Facebook). La maquette d'origine prévoyait
 * d'autres étapes après l'inscription (langue d'interface, usage, profils
 * enfants, forfaits...) qui appartiennent aux phases suivantes du produit,
 * pas à ce chantier.
 */
export default function SignupScreen() {
  const router = useRouter();
  const { signUpWithPhone } = useAuth();
  const [prenom, setPrenom] = useState('');
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!prenom || !phoneLocal || !password) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!accepted) {
      setError("Tu dois accepter les conditions d'utilisation pour continuer.");
      return;
    }
    setError(null);
    setLoading(true);
    const phone = country.dialCode + phoneLocal.replace(/\D/g, '').replace(/^0+/, '');
    const { error: authError } = await signUpWithPhone({ phone, password, prenom: prenom.trim(), pays: country.name });
    setLoading(false);
    if (authError) setError(authError);
    // Si succès : le AuthProvider met à jour la session, Stack.Protected redirige automatiquement.
  };

  const showLegalDoc = (docName: string) =>
    Alert.alert('Bientôt disponible', `${docName} n'est pas encore publiée dans l'app.`);

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.replace('/onboarding')} hitSlop={10} style={styles.back}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={styles.logoDot} />
            <Text style={styles.title}>Crée ton compte</Text>
            <Text style={styles.subtitle}>C'est toujours un adulte qui crée le compte principal.</Text>
          </View>

          <View style={styles.form}>
            <Field label="PRÉNOM">
              <TextInput
                value={prenom}
                onChangeText={setPrenom}
                placeholder="Yannick"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </Field>
            <Field label="PAYS">
              <CountryPicker value={country} onChange={setCountry} />
            </Field>
            <Field label="TÉLÉPHONE">
              <View style={styles.phoneRow}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixLabel}>{country.dialCode}</Text>
                </View>
                <TextInput
                  value={phoneLocal}
                  onChangeText={setPhoneLocal}
                  placeholder="690 00 00 00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  style={[styles.input, styles.phoneInput]}
                />
              </View>
            </Field>
            <Field label="MOT DE PASSE">
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="8 caractères minimum"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[styles.input, styles.inputPassword]}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eye} hitSlop={8}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </Pressable>
              </View>
            </Field>
            <Pressable onPress={() => setAccepted((v) => !v)} style={styles.terms}>
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                J'accepte les{' '}
                <Text style={styles.termsLink} onPress={() => showLegalDoc('Les conditions d’utilisation')}>
                  conditions d'utilisation
                </Text>{' '}
                et la{' '}
                <Text style={styles.termsLink} onPress={() => showLegalDoc('La politique de confidentialité')}>
                  politique de confidentialité
                </Text>{' '}
                d'AFROBACK.
              </Text>
            </Pressable>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.cta}>
            <GoldButton label={loading ? 'Création...' : 'Créer mon compte'} onPress={onSubmit} />
          </View>
          <Pressable onPress={() => router.replace('/onboarding/login')} style={styles.switch}>
            <Text style={styles.switchLabel}>
              J'ai déjà un compte · <Text style={styles.switchLink}>Se connecter</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.backgroundPlayerTo,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 26,
    paddingTop: 14,
    paddingBottom: 40,
  },
  back: {
    marginBottom: 6,
  },
  backIcon: {
    fontSize: 22,
    color: colors.accentGold,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoDot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
  },
  title: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.textHeading,
    marginTop: 14,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  field: {},
  fieldLabel: {
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    fontFamily: typography.body,
    fontSize: 14,
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.2)',
    backgroundColor: colors.placeholderStripeDark,
    color: colors.textPrimary,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  phonePrefix: {
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.2)',
    backgroundColor: colors.placeholderStripeDark,
  },
  phonePrefixLabel: {
    fontFamily: typography.mono,
    fontSize: 14,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputPassword: {
    paddingRight: 44,
  },
  eye: {
    position: 'absolute',
    right: 14,
  },
  eyeIcon: {
    fontSize: 15,
  },
  terms: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.accentGold,
  },
  checkboxTick: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.ctaTextOnGold,
  },
  termsText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.textMuted,
  },
  termsLink: {
    color: colors.accentGold,
    fontFamily: typography.bodyBold,
    textDecorationLine: 'underline',
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.terracottaText,
    marginTop: 14,
  },
  cta: {
    marginTop: 20,
  },
  switch: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchLabel: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  switchLink: {
    color: colors.accentGold,
    fontFamily: typography.bodySemiBold,
  },
});
