import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { BrandMark, ONBOARDING_BG, PillButton } from '../../src/onboarding/ui';
import { colors, spacing, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';
import { useMfaPolicy } from '../../src/settings/SettingsProvider';

/**
 * Écran "Protège ton compte" — proposé activement juste après l'inscription
 * (jamais obligatoire), conformément à `app-mobile/cdc-mfa-inscription.md`
 * (Option B : fortement suggéré, jamais forcé). Positionné en premier dans
 * le groupe protégé `!onboardingComplete` de `app/_layout.tsx`.
 *
 * Depuis le 2026-09-29 (cdc-onboarding.md, D5) : atteint après "Ton compte
 * est créé !", mène au choix du forfait. L'écran de langue est retiré du
 * parcours tant que l'app n'est pas traduite (c'était un faux choix).
 */
export default function MfaProposalScreen() {
  const router = useRouter();
  const { mfaStatus } = useAuth();
  const { t } = useI18n();
  const [checkedOnce, setCheckedOnce] = useState(false);

  // Re-vérifie l'état MFA à chaque retour sur cet écran (ex. après être allé
  // activer le MFA sur /profil/mfa puis être revenu en arrière).
  useFocusEffect(
    useCallback(() => {
      setCheckedOnce(true);
    }, [])
  );

  const activated = checkedOnce && mfaStatus === 'satisfied';

  const mfa = useMfaPolicy();
  const goNext = () => router.replace('/onboarding/plan');
  const activateNow = () => router.push('/profil/mfa');

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.logo}>
            <BrandMark layout="inline" />
          </View>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🛡️</Text>
          </View>

          <Text style={styles.title}>{t('mfaProposal.title')}</Text>
          <Text style={styles.text}>{t('mfaProposal.text')}</Text>

          {activated && <Text style={styles.activatedBadge}>{t('mfaProposal.activated')}</Text>}

          <View style={styles.spacer} />

          <View style={styles.bottom}>
            {activated ? (
              <PillButton label={t('common.continue')} onPress={goNext} />
            ) : (
              <>
                <PillButton label={t('mfaProposal.activateNow')} icon="shield" onPress={activateNow} />
                {!mfa.obligatoire && (
                  <>
                    <View style={{ height: 12 }} />
                    <PillButton label={t('mfaProposal.later')} variant="outline" onPress={goNext} />
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: ONBOARDING_BG },
  safe: { flex: 1 },
  logo: { marginBottom: 34 },
  content: { flex: 1, paddingHorizontal: spacing.md + 10, paddingTop: 40, paddingBottom: 30, alignItems: 'center' },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.placeholderStripeDark,
    borderWidth: 1,
    borderColor: 'rgba(240,195,107,.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  icon: { fontSize: 34 },
  title: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.textHeading,
    textAlign: 'center',
  },
  text: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
  activatedBadge: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 20,
  },
  spacer: { flex: 1 },
  bottom: { width: '100%' },
});
