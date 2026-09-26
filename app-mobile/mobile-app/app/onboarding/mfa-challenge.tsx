import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { supabase } from '../../src/data/supabaseClient';
import { GoldButton } from '../../src/components/Buttons';
import { colors, spacing, typography } from '../../src/theme/tokens';

/**
 * Porte de vérification MFA, affichée par RootNavigator (app/_layout.tsx)
 * quand une session existe mais que le code TOTP n'a pas encore été validé
 * pour cette session — voir `AuthProvider.tsx` (`mfaStatus`). Réécrit le
 * 2026-09-26 pour utiliser `mfa_totp_verify_challenge` (TOTP maison) au
 * lieu de `supabase.auth.mfa.challengeAndVerify` (module natif cassé).
 */
export default function MfaChallengeScreen() {
  const { confirmMfaChallengePassed, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Entre le code à 6 chiffres affiché dans ton application d’authentification.');
      return;
    }
    setError(null);
    setBusy(true);
    const { data, error: rpcError } = await supabase.rpc('mfa_totp_verify_challenge', { p_code: code });
    setBusy(false);
    if (rpcError || !data?.ok) {
      if (data?.error === 'verrouille') {
        setError('Trop de tentatives échouées. Réessaie dans quelques minutes.');
      } else {
        setError('Code incorrect. Vérifie l’heure de ton téléphone et réessaie.');
      }
      return;
    }
    confirmMfaChallengePassed();
    // Succès : mfaStatus passe à 'satisfied', RootNavigator laisse entrer dans l'app.
  };

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.title}>Vérification en 2 étapes</Text>
          <Text style={styles.subtitle}>
            Entre le code à 6 chiffres affiché dans ton application d’authentification.
          </Text>

          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            style={styles.input}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.cta}>
            <GoldButton label={busy ? 'Vérification...' : 'Valider'} onPress={onSubmit} disabled={busy} />
          </View>

          <Pressable onPress={() => signOut()} style={styles.switch}>
            <Text style={styles.switchLabel}>Perdu ton téléphone d’authentification&nbsp;? · Se déconnecter</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.backgroundPlayerTo },
  safe: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.md + 2 },
  title: { fontFamily: typography.display, fontSize: 24, color: colors.textHeading, textAlign: 'center' },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 28,
    lineHeight: 19,
  },
  input: {
    fontFamily: typography.mono,
    fontSize: 22,
    letterSpacing: 8,
    textAlign: 'center',
    padding: 16,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.2)',
    backgroundColor: colors.placeholderStripeDark,
    color: colors.textPrimary,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.terracottaText,
    textAlign: 'center',
    marginTop: 14,
  },
  cta: { marginTop: 22 },
  switch: { marginTop: 20, alignItems: 'center' },
  switchLabel: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted },
});
