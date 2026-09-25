import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { useAuth } from '../../src/auth/AuthProvider';
import { supabase } from '../../src/data/supabaseClient';
import { GoldButton, GhostButton } from '../../src/components/Buttons';
import { colors, spacing, typography } from '../../src/theme/tokens';

/**
 * Activation/désactivation de la vérification en 2 étapes (MFA/TOTP), lot
 * cybersécurité du 2026-09-25. Écran atteint depuis Profil, jamais imposé —
 * l'utilisateur choisit de l'activer. Voir AuthProvider.tsx pour le détail
 * du choix TOTP (pas SMS) et le fonctionnement de la porte de connexion.
 */

type FactorSummary = { id: string; friendlyName: string | null; status: string };

type EnrollState = {
  factorId: string;
  qrSvg: string | null;
  secret: string;
};

export default function MfaSetupScreen() {
  const router = useRouter();
  const { refreshMfaStatus } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verifiedFactor, setVerifiedFactor] = useState<FactorSummary | null>(null);
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFactors = async () => {
    setLoading(true);
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    if (!listError && data) {
      const totp = data.totp.find((f) => f.status === 'verified');
      setVerifiedFactor(totp ? { id: totp.id, friendlyName: totp.friendly_name ?? null, status: totp.status } : null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const startEnroll = async () => {
    setError(null);
    setBusy(true);
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      setBusy(false);
      if (enrollError || !data) {
        setError(describeMfaError(enrollError));
        return;
      }
      setEnroll({ factorId: data.id, qrSvg: extractSvgXml(data.totp.qr_code), secret: data.totp.secret });
    } catch (e) {
      setBusy(false);
      setError(describeMfaError(e));
    }
  };

  const confirmEnroll = async () => {
    if (!enroll) return;
    if (!/^\d{6}$/.test(code)) {
      setError('Entre le code à 6 chiffres affiché dans ton application d’authentification.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: enroll.factorId,
        code,
      });
      setBusy(false);
      if (verifyError) {
        setError('Code incorrect. Vérifie l’heure de ton téléphone et réessaie.');
        return;
      }
      setEnroll(null);
      setCode('');
      await refreshMfaStatus();
      await loadFactors();
      Alert.alert('Activée', 'La vérification en 2 étapes est maintenant active sur ton compte.');
    } catch (e) {
      setBusy(false);
      setError(describeMfaError(e instanceof Error ? e.message : String(e)));
    }
  };

  const cancelEnroll = async () => {
    // Un facteur "unverified" laissé en base gênerait une future tentative — on le retire proprement.
    if (enroll) {
      await supabase.auth.mfa.unenroll({ factorId: enroll.factorId }).catch(() => {});
    }
    setEnroll(null);
    setCode('');
    setError(null);
  };

  const disableMfa = () => {
    if (!verifiedFactor) return;
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
            try {
              const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
              setBusy(false);
              if (unenrollError) {
                Alert.alert('Erreur', "La désactivation n'a pas fonctionné. Réessaie.");
                return;
              }
              await refreshMfaStatus();
              await loadFactors();
            } catch {
              setBusy(false);
              Alert.alert('Erreur', "La désactivation n'a pas fonctionné. Réessaie.");
            }
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
              {enroll.qrSvg ? (
                <View style={styles.qrWrap}>
                  <SvgXml xml={enroll.qrSvg} width={200} height={200} />
                </View>
              ) : (
                <Text style={styles.error}>QR code indisponible — utilise la saisie manuelle ci-dessous.</Text>
              )}
              <Text style={styles.step}>Ou saisis ce code manuellement :</Text>
              <Text style={styles.secret} selectable>
                {enroll.secret}
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
          ) : verifiedFactor ? (
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

/**
 * Le SDK peut renvoyer un message d'erreur inexploitable tel quel (ex. le
 * corps JSON brut sérialisé, littéralement "{}") — bug rencontré au premier
 * test réel (2026-09-25), TOTP pourtant déjà activé côté dashboard Supabase
 * (piste écartée). Construit un diagnostic aussi précis que possible
 * (statut HTTP, code d'erreur, nom) plutôt que de deviner à l'aveugle —
 * temporaire, à retirer une fois la vraie cause identifiée.
 */
function describeMfaError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { message?: string; status?: number; code?: string; name?: string };
    const parts = [
      e.message?.trim() && e.message.trim() !== '{}' ? e.message.trim() : null,
      e.status ? `statut HTTP ${e.status}` : null,
      e.code ? `code "${e.code}"` : null,
      e.name ? `(${e.name})` : null,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(' — ');
    try {
      const raw = JSON.stringify(err);
      if (raw && raw !== '{}') return `Erreur inattendue : ${raw}`;
    } catch {
      // ignore
    }
  }
  return 'Erreur inattendue, sans détail exploitable renvoyé par le serveur. Réessaie, ou vérifie ta connexion réseau.';
}

/** Le SDK renvoie le QR code en data URI SVG (`data:image/svg+xml;utf-8,<svg>...`). */
function extractSvgXml(qrCode: string): string | null {
  const match = qrCode.match(/^data:image\/svg\+xml;utf-8,(.+)$/s);
  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }
  if (qrCode.trim().startsWith('<svg')) return qrCode;
  return null;
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
