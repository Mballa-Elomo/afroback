import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { GoldButton } from '../../src/components/Buttons';
import { COUNTRIES, CountryPicker, type Country } from '../../src/components/CountryPicker';
import { colors, typography } from '../../src/theme/tokens';

/**
 * Connexion — téléphone + mot de passe uniquement (décision de Yannick du
 * 2026-07-30 : plus d'email ni de Google/Facebook). "Mot de passe oublié"
 * reste non implémenté (pas de flux de réinitialisation par SMS pour
 * l'instant).
 */
export default function LoginScreen() {
  const router = useRouter();
  const { signInWithPhone } = useAuth();
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!phoneLocal || !password) {
      setError('Renseigne ton numéro de téléphone et ton mot de passe.');
      return;
    }
    setError(null);
    setLoading(true);
    const phone = country.dialCode + phoneLocal.replace(/\D/g, '').replace(/^0+/, '');
    const { error: authError } = await signInWithPhone({ phone, password });
    setLoading(false);
    if (authError) setError(authError);
    // Si succès : le AuthProvider met à jour la session, Stack.Protected redirige automatiquement.
  };

  const comingSoon = () =>
    Alert.alert('Bientôt disponible', "La réinitialisation du mot de passe n'est pas encore disponible.");

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.replace('/onboarding')} hitSlop={10} style={styles.back}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View style={styles.header}>
            <View style={styles.logoDot} />
            <Text style={styles.title}>Content de te revoir</Text>
            <Text style={styles.subtitle}>Connecte-toi pour retrouver tes profils.</Text>
          </View>

          <View style={styles.form}>
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
                  placeholder="Ton mot de passe"
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
            <Pressable onPress={comingSoon} style={styles.forgot}>
              <Text style={styles.forgotLabel}>Mot de passe oublié&nbsp;?</Text>
            </Pressable>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.cta}>
            <GoldButton label={loading ? 'Connexion...' : 'Se connecter'} onPress={onSubmit} />
          </View>
          <Pressable onPress={() => router.replace('/onboarding/signup')} style={styles.switch}>
            <Text style={styles.switchLabel}>
              Pas encore de compte&nbsp;? · <Text style={styles.switchLink}>Créer un compte</Text>
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
    marginBottom: 26,
  },
  logoDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.4)',
  },
  title: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.textHeading,
    marginTop: 14,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
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
  forgot: {
    alignSelf: 'flex-end',
  },
  forgotLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.accentGold,
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
