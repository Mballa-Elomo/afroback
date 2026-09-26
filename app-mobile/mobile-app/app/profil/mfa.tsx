import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../src/auth/AuthProvider';
import { supabase } from '../../src/data/supabaseClient';
import { GoldButton, GhostButton } from '../../src/components/Buttons';
import { colors, spacing, typography } from '../../src/theme/tokens';

/**
 * Activation/désactivation de la vérification en 2 étapes (MFA/TOTP).
 * Réécrit le 2026-09-26 pour utiliser le TOTP maison (voir
 * `supabase/schema-totp-custom.sql` et la note en tête d'`AuthProvider.tsx`)
 * plutôt que le module MFA natif de Supabase (bug serveur confirmé,
 * "Error generating QR Code"). Le QR code est maintenant généré et rendu
 * entièrement côté app (`react-native-qrcode-svg`), plus par le serveur.
 */

type EnrollState = {
  otpauthUri: string;
  secretBase32: string;
};

export default function MfaSetupScreen() {
  const router = useRouter();
  const { refreshMfaStatus, confirmMfaChallengePassed } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    const { data } = await supabase.rpc('mfa_totp_status');
    setEnabled(!!data?.enabled);
    setLoading(false);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const startEnroll = async () => {
    setError(null);
    setBusy(true);
    const { data, error: rpcError } = await supabase.rpc('mfa_totp_enroll');
    setBusy(false);
    if (rpcError || !data?.ok) {
      setError(rpcError?.message ?? "Impossible de démarrer la configuration. Réessaie.");
      return;
    }
    setEnroll({ otpauthUri: data.otpauth_uri, secretBase32: data.secret_base32 });
  };

  const confirmEnroll = async () => {
    if (!enroll) return;
    if (!/^\d{6}$/.test(code)) {
      setError('Entre le code à 6 chiffres affiché dans ton application d’authentification.');
      return;
    }
    setError(null);
    setBusy(true);
    const { data, error: rpcError } = await supabase.rpc('mfa_totp_confirm', { p_code: code });
    setBusy(false);
    if (rpcError || !data?.ok) {
      setError('Code incorrect. Vérifie l’heure de ton téléphone et réessaie.');
      return;
    }
    setEnroll(null);
    setCode('');
    // Le code qu'on vient de vérifier ici satisfait déjà le défi MFA de
    // cette session — éviter de redemander immédiatement le même code sur
    // l'écran de connexion juste après (voir AuthProvider.tsx).
    confirmMfaChallengePassed();
    await loadStatus();
    Alert.alert('Activée', 'La vérification en 2 étapes est maintenant active sur ton compte.');
  };

  const cancelEnroll = () => {
    // Un facteur non confirmé sera simplement écrasé par la prochaine
    // tentative d'activation (mfa_totp_enroll fait un upsert) — rien à
    // nettoyer explicitement côté serveur.
    setEnroll(null);
    setCode('');
    setError(null);
  };

  const disableMfa = () => {
    Alert.alert(
      'Désactiver la vérification en 2 étapes ?',
      'Ton compte sera de nouveau protégé par le mot de passe seul.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Désactiver',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const { error: rpcError } = await supabase.rpc('mfa_totp_disable');
            setBusy(false);
            if (rpcError) {
              Alert.alert('Erreur', "La désactivation n'a pas fonctionné. Réessaie.");
              return;
            }
            await refreshMfaStatus();
            await loadStatus();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Vérification en 2 étapes</Text>
          <Text style={styles.subtitle}>
            Protège ton compte avec un code temporaire généré par une application d’authentification (Google
            Authenticator, Authy…), en plus de ton mot de passe.
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.accentGold} style={{ marginTop: 30 }} />
          ) : enroll ? (
            <View style={styles.card}>
              <Text style={styles.step}>1. Scanne ce code avec ton application d’authentification</Text>
              <View style={styles.qrWrap}>
                <QRCode value={enroll.otpauthUri} size={200} />
              </View>
              <Text style={styles.step}>Ou saisis ce code manuellement :</Text>
              <Text style={styles.secret} selectable>
                {enroll.secretBase32}
              </Text>
              <Text style={styles.step}>2. Entre le code à 6 chiffres affiché</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.input}
              />
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.ctaGroup}>
                <GoldButton label={busy ? 'Vérification...' : 'Confirmer'} onPress={confirmEnroll} disabled={busy} />
                <View style={{ height: 10 }} />
                <GhostButton label="Annuler" onPress={cancelEnroll} />
              </View>
            </View>
          ) : enabled ? (
            <View style={styles.card}>
              <Text style={styles.statusOn}>✅ Activée</Text>
              <Text style={styles.statusDetail}>
                Une application d’authentification est requise à chaque connexion, en plus de ton mot de passe.
              </Text>
              <View style={{ height: 18 }} />
              <GhostButton label={busy ? 'Désactivation...' : 'Désactiver'} onPress={disableMfa} />
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.statusOff}>Non activée</Text>
              <Text style={styles.statusDetail}>
                Recommandé si tu utilises AFROBACK comme institution culturelle ou contributeur — ça protège ton
                compte même si ton mot de passe est un jour deviné ou volé.
              </Text>
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={{ height: 18 }} />
              <GoldButton label={busy ? 'Préparation...' : 'Activer'} onPress={startEnroll} disabled={busy} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md + 2, paddingTop: 14, paddingBottom: 40 },
  back: { marginBottom: 10 },
  backIcon: { fontSize: 22, color: colors.accentGold },
  title: { fontFamily: typography.display, fontSize: 22, color: colors.textHeading, marginBottom: 8 },
  subtitle: { fontFamily: typography.body, fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  card: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.placeholderStripeDark,
    padding: 18,
  },
  step: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.textPrimary, marginTop: 14, marginBottom: 10 },
  qrWrap: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, alignSelf: 'center' },
  secret: {
    fontFamily: typography.mono,
    fontSize: 13,
    color: colors.accentGold,
    letterSpacing: 1,
    textAlign: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderHairline,
  },
  input: {
    fontFamily: typography.mono,
    fontSize: 20,
    letterSpacing: 6,
    textAlign: 'center',
    padding: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.2)',
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  ctaGroup: { marginTop: 18 },
  statusOn: { fontFamily: typography.bodySemiBold, fontSize: 16, color: colors.textPrimary },
  statusOff: { fontFamily: typography.bodySemiBold, fontSize: 16, color: colors.textMuted },
  statusDetail: { fontFamily: typography.body, fontSize: 12.5, color: colors.textMuted, marginTop: 8, lineHeight: 18 },
  error: { fontFamily: typography.body, fontSize: 12.5, color: colors.terracottaText, marginTop: 10 },
});
