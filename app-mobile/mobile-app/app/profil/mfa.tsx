import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../src/auth/AuthProvider';
import { supabase } from '../../src/data/supabaseClient';
import { GoldButton, GhostButton } from '../../src/components/Buttons';
import { colors, spacing, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';
import { Icon } from '../../src/components/Icons';
import { useMfaPolicy } from '../../src/settings/SettingsProvider';

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
  const { refreshMfaStatus, confirmMfaChallengePassed, mfaStatus } = useAuth();
  const mfa = useMfaPolicy();
  // Obligatoire (back-office) et pas encore activée : pas de retour possible, l'activer d'abord.
  const forced = mfa.obligatoire && mfaStatus === 'not_enrolled';
  const { t } = useI18n();
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
      setError(rpcError?.message ?? t('mfa.errors.start'));
      return;
    }
    setEnroll({ otpauthUri: data.otpauth_uri, secretBase32: data.secret_base32 });
  };

  const confirmEnroll = async () => {
    if (!enroll) return;
    if (!/^\d{6}$/.test(code)) {
      setError(t('mfa.errors.codeFormat'));
      return;
    }
    setError(null);
    setBusy(true);
    const { data, error: rpcError } = await supabase.rpc('mfa_totp_confirm', { p_code: code });
    setBusy(false);
    if (rpcError || !data?.ok) {
      setError(t('mfa.errors.codeWrong'));
      return;
    }
    setEnroll(null);
    setCode('');
    // Le code qu'on vient de vérifier ici satisfait déjà le défi MFA de
    // cette session — éviter de redemander immédiatement le même code sur
    // l'écran de connexion juste après (voir AuthProvider.tsx).
    confirmMfaChallengePassed();
    await loadStatus();
    if (forced) {
      await refreshMfaStatus();
      router.replace('/');
      return;
    }
    Alert.alert(t('mfa.activatedTitle'), t('mfa.activatedBody'));
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
      t('mfa.disableTitle'),
      t('mfa.disableBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('mfa.disable'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const { error: rpcError } = await supabase.rpc('mfa_totp_disable');
            setBusy(false);
            if (rpcError) {
              Alert.alert(t('common.error'), t('mfa.errors.disableFailed'));
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
          {!forced && (
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.back}>
              <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
            </Pressable>
          )}

          <Text style={styles.title}>{t('mfa.title')}</Text>
          <Text style={styles.subtitle}>{forced ? t('mfa.required') : t('mfa.subtitle')}</Text>

          {loading ? (
            <ActivityIndicator color={colors.accentGold} style={{ marginTop: 30 }} />
          ) : enroll ? (
            <View style={styles.card}>
              <Text style={styles.step}>{t('mfa.step1')}</Text>
              <View style={styles.qrWrap}>
                <QRCode value={enroll.otpauthUri} size={200} />
              </View>
              <Text style={styles.step}>{t('mfa.manual')}</Text>
              {/* data-allow-copy (web) : exception à l'anti-copie, la clé doit pouvoir être copiée dans l'application d'authentification. */}
              <Text style={styles.secret} selectable {...({ dataSet: { allowCopy: '' } } as object)}>
                {enroll.secretBase32}
              </Text>
              <Text style={styles.step}>{t('mfa.step2')}</Text>
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
                <GoldButton label={busy ? t('mfa.verifying') : t('mfa.confirm')} onPress={confirmEnroll} disabled={busy} />
                <View style={{ height: 10 }} />
                <GhostButton label={t('common.cancel')} onPress={cancelEnroll} />
              </View>
            </View>
          ) : enabled ? (
            <View style={styles.card}>
              <Text style={styles.statusOn}>{t('mfa.statusOn')}</Text>
              <Text style={styles.statusDetail}>{t('mfa.statusOnDetail')}</Text>
              <View style={{ height: 18 }} />
              {!mfa.obligatoire && <GhostButton label={busy ? t('mfa.disabling') : t('mfa.disable')} onPress={disableMfa} />}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.statusOff}>{t('mfa.statusOff')}</Text>
              <Text style={styles.statusDetail}>{t('mfa.statusOffDetail')}</Text>
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={{ height: 18 }} />
              <GoldButton label={busy ? t('mfa.preparing') : t('mfa.activate')} onPress={startEnroll} disabled={busy} />
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
