import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { useAccess } from '../../src/access/Access';
import { PremiumButton } from '../../src/components/Buttons';
import { useI18n } from '../../src/i18n';
import { FormField, GoldCheckbox } from '../../src/onboarding/FormField';
import { BrandMark } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { Icon } from '../../src/components/Icons';

/**
 * "Supprimer mon compte" (exigence Google Play, cdc-play-store.md, lot 1) :
 * ce qui est supprimé / conservé, mot de passe revérifié, case "je comprends"
 * puis confirmation en deux temps (pas d'Alert : sans effet sur le web).
 * Une fois le compte supprimé, la session disparaît et la grille d'accès de
 * `_layout.tsx` ramène d'elle-même à l'accueil.
 */
export default function SupprimerCompteScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { deleteAccount } = useAuth();
  const { subscription } = useAccess();
  const [password, setPassword] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const ready = !!password && understood;

  const submit = async () => {
    if (!ready || busy) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await deleteAccount(password);
    setBusy(false);
    if (res.wrongPassword) {
      setConfirming(false);
      setPasswordError(res.error);
      return;
    }
    if (res.error) setError(res.error);
  };

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={14} style={styles.back} accessibilityRole="button" accessibilityLabel={t('common.back')}>
            <Icon name="chevronLeft" size={22} color={colors.accentGold} strokeWidth={2.4} />
          </Pressable>
          <BrandMark layout="inline" />
          <View style={styles.back} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title} accessibilityRole="header">
            {t('deleteAccount.title')}
          </Text>
          <Text style={styles.subtitle}>{t('deleteAccount.subtitle')}</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('deleteAccount.deletedTitle')}</Text>
            <Text style={styles.cardText}>{t('deleteAccount.deleted')}</Text>
            <Text style={[styles.cardTitle, { marginTop: 14 }]}>{t('deleteAccount.keptTitle')}</Text>
            <Text style={styles.cardText}>{t('deleteAccount.kept')}</Text>
            {!!subscription && <Text style={styles.warning}>{t('deleteAccount.subscriptionWarning')}</Text>}
          </View>

          <View style={styles.field}>
            <FormField
              icon="lock"
              secure
              placeholder={t('deleteAccount.password')}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setConfirming(false);
                if (passwordError) setPasswordError(null);
              }}
              autoCapitalize="none"
              autoComplete="current-password"
              error={passwordError}
            />
          </View>
          <View style={styles.field}>
            <GoldCheckbox
              checked={understood}
              onToggle={() => {
                setUnderstood((v) => !v);
                setConfirming(false);
              }}
            >
              <Text style={styles.checkText}>{t('deleteAccount.confirmLabel')}</Text>
            </GoldCheckbox>
          </View>

          {confirming && (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>{t('deleteAccount.confirmTitle')}</Text>
              <Text style={styles.confirmBody}>{t('deleteAccount.confirmBody')}</Text>
            </View>
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            onPress={submit}
            disabled={!ready || busy}
            style={({ pressed }) => [styles.danger, (!ready || busy) && styles.dangerDisabled, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready || busy }}
          >
            <Icon name="trash" size={18} color="#FFF4E0" />
            <Text style={styles.dangerText}>{busy ? '…' : confirming ? t('deleteAccount.confirmYes') : t('deleteAccount.submit')}</Text>
          </Pressable>
          <View style={styles.cancel}>
            <PremiumButton label={t('common.cancel')} variant="glass" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0B0906' },
  safe: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 10 },
  back: { width: 44, height: 44, justifyContent: 'center' },
  scroll: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 40 },
  title: { fontFamily: typography.display, fontSize: 28, color: colors.textHeading, marginTop: 8 },
  subtitle: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 21, color: colors.textBody, marginTop: 6 },
  card: { marginTop: 18, padding: 16, borderRadius: 16, backgroundColor: colors.terracottaBg, borderWidth: 1, borderColor: colors.terracottaBorder },
  cardTitle: { fontFamily: typography.bodyBold, fontSize: 14, color: colors.textHeading },
  cardText: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody, marginTop: 4 },
  warning: { fontFamily: typography.bodyBold, fontSize: 13.5, lineHeight: 20, color: colors.terracottaText, marginTop: 14 },
  field: { marginTop: 18 },
  checkText: { fontFamily: typography.body, fontSize: 14, lineHeight: 20, color: colors.textBody },
  confirmBox: { marginTop: 18, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.terracotta },
  confirmTitle: { fontFamily: typography.bodyBold, fontSize: 15, color: colors.terracottaText },
  confirmBody: { fontFamily: typography.body, fontSize: 13.5, lineHeight: 20, color: colors.textBody, marginTop: 4 },
  error: { fontFamily: typography.body, fontSize: 13, color: colors.terracottaText, marginTop: 16, textAlign: 'center' },
  danger: {
    marginTop: 24,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.terracotta,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dangerDisabled: { opacity: 0.4 },
  dangerText: { fontFamily: typography.bodyBold, fontSize: 15.5, color: '#FFF4E0' },
  cancel: { marginTop: 12 },
});
