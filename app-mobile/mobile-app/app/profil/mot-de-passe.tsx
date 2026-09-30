import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { PremiumButton } from '../../src/components/Buttons';
import { useI18n } from '../../src/i18n';
import { FormField } from '../../src/onboarding/FormField';
import { PasswordStrength, meetsPasswordRule } from '../../src/onboarding/PasswordStrength';
import { BrandMark } from '../../src/onboarding/ui';
import { colors, typography } from '../../src/theme/tokens';
import { Icon } from '../../src/components/Icons';

/**
 * "Changer mon mot de passe" (cdc-edition-profil.md, décision du
 * 2026-09-30) : mot de passe actuel redemandé (revérifié sans toucher à la
 * session de l'app), même règle qu'à l'inscription pour le nouveau, puis
 * déconnexion des autres appareils (règle D3 de cdc-appareil-unique.md).
 */
export default function ChangerMotDePasseScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [nextError, setNextError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    setError(null);
    const nextOk = meetsPasswordRule(next);
    const same = next === confirm;
    setCurrentError(current ? null : t('changePassword.wrongCurrent'));
    setNextError(nextOk ? null : t('changePassword.rule'));
    setConfirmError(same ? null : t('changePassword.mismatch'));
    if (!current || !nextOk || !same) return;
    setSaving(true);
    const res = await changePassword({ current, next });
    setSaving(false);
    if (res.wrongCurrent) {
      setCurrentError(res.error);
      return;
    }
    if (res.error) {
      setError(res.error);
      return;
    }
    Alert.alert(t('changePassword.done'));
    router.back();
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
            {t('changePassword.title')}
          </Text>
          <Text style={styles.subtitle}>{t('changePassword.subtitle')}</Text>

          <View style={styles.field}>
            <FormField
              icon="lock"
              secure
              placeholder={t('changePassword.current')}
              value={current}
              onChangeText={(v) => {
                setCurrent(v);
                if (currentError) setCurrentError(null);
              }}
              autoCapitalize="none"
              autoComplete="current-password"
              error={currentError}
            />
          </View>
          <View style={styles.field}>
            <FormField
              icon="lock"
              secure
              placeholder={t('changePassword.next')}
              value={next}
              onChangeText={(v) => {
                setNext(v);
                if (nextError) setNextError(null);
              }}
              autoCapitalize="none"
              autoComplete="new-password"
              hint={t('changePassword.rule')}
              error={nextError}
            />
            {!!next && <PasswordStrength password={next} />}
          </View>
          <View style={styles.field}>
            <FormField
              icon="lock"
              secure
              placeholder={t('changePassword.confirm')}
              value={confirm}
              onChangeText={(v) => {
                setConfirm(v);
                if (confirmError) setConfirmError(null);
              }}
              autoCapitalize="none"
              autoComplete="new-password"
              error={confirmError}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.cta}>
            <PremiumButton label={t('changePassword.submit')} icon="lock" onPress={submit} loading={saving} />
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
  backIcon: { fontSize: 30, color: colors.accentGold },
  scroll: { paddingHorizontal: 22, paddingTop: 10, paddingBottom: 40 },
  title: { fontFamily: typography.display, fontSize: 28, color: colors.textHeading, marginTop: 8 },
  subtitle: { fontFamily: typography.body, fontSize: 14.5, lineHeight: 21, color: colors.textBody, marginTop: 6, marginBottom: 8 },
  field: { marginTop: 16 },
  error: { fontFamily: typography.body, fontSize: 13, color: colors.terracottaText, marginTop: 16, textAlign: 'center' },
  cta: { marginTop: 26 },
});
