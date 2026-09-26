import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { GoldButton, GhostButton } from '../../src/components/Buttons';
import { colors, spacing, typography } from '../../src/theme/tokens';

/**
 * Écran "Protège ton compte" — proposé activement juste après l'inscription
 * (jamais obligatoire), conformément à `app-mobile/cdc-mfa-inscription.md`
 * (Option B : fortement suggéré, jamais forcé). Positionné en premier dans
 * le groupe protégé `!onboardingComplete` de `app/_layout.tsx`, donc affiché
 * juste après la création de compte, avant le choix de langue.
 */
export default function MfaProposalScreen() {
  const router = useRouter();
  const { mfaStatus } = useAuth();
  const [checkedOnce, setCheckedOnce] = useState(false);

  // Re-vérifie l'état MFA à chaque retour sur cet écran (ex. après être allé
  // activer le MFA sur /profil/mfa puis être revenu en arrière).
  useFocusEffect(
    useCallback(() => {
      setCheckedOnce(true);
    }, [])
  );

  const activated = checkedOnce && mfaStatus === 'satisfied';

  const goNext = () => router.replace('/onboarding/language');
  const activateNow = () => router.push('/profil/mfa');

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🛡️</Text>
          </View>

          <Text style={styles.title}>Protège ton compte</Text>
          <Text style={styles.text}>
            Ajoute une vérification en 2 étapes avec une application d’authentification (Google Authenticator,
            Authy…) — un code temporaire en plus de ton mot de passe, pour que ton compte reste à toi seul même si
            ton mot de passe est un jour deviné ou volé.
          </Text>

          {activated && <Text style={styles.activatedBadge}>✅ Vérification en 2 étapes activée</Text>}

          <View style={styles.spacer} />

          <View style={styles.bottom}>
            {activated ? (
              <GoldButton label="Continuer" onPress={goNext} />
            ) : (
              <>
                <GoldButton label="Activer maintenant" onPress={activateNow} />
                <View style={{ height: 12 }} />
                <GhostButton label="Plus tard" onPress={goNext} />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.backgroundPlayerTo },
  safe: { flex: 1 },
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
