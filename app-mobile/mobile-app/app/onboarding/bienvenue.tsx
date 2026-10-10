import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthProvider';
import { markIntroSeen } from '../../src/onboarding/introSeen';
import {
  BrandMark,
  IllustratedBackground,
  ONBOARDING_ILLUSTRATIONS,
  PillButton,
} from '../../src/onboarding/ui';
import { AnimatedTitleBlock } from '../../src/onboarding/AnimatedText';
import { colors, typography } from '../../src/theme/tokens';
import { useI18n } from '../../src/i18n';
import { SessionEndedNotice } from '../../src/security/SessionEndedNotice';
import { useSettings } from '../../src/settings/SettingsProvider';

/**
 * Écran 6 — "Bienvenue dans ton voyage" (maquette de Yannick, 2026-09-29).
 * Point d'entrée de toute personne sans session : après le carrousel, après
 * "Passer", et directement après le splash si l'intro a déjà été vue sur cet
 * appareil (ex. après une déconnexion). Y arriver marque l'intro comme vue.
 *
 * "Explorer sans compte" (décision D6, absent de la maquette) : lien discret
 * sous les deux actions principales, voir cdc-onboarding.md section 4.
 */
export default function BienvenueScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { enterGuestMode, isGuest } = useAuth();
  const { settings } = useSettings();

  useEffect(() => {
    markIntroSeen();
  }, []);

  // La route /accueil n'est autorisée qu'une fois le mode invité réellement
  // actif (garde Stack.Protected de app/_layout.tsx) : on navigue après coup.
  useEffect(() => {
    if (isGuest) router.replace('/accueil');
  }, [isGuest, router]);

  return (
    <IllustratedBackground source={ONBOARDING_ILLUSTRATIONS.voyage} fadeFrom={0.44}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <BrandMark size="sm" />
        </View>

        <View style={styles.bottom}>
          <SessionEndedNotice />
          <AnimatedTitleBlock
            line1={t('bienvenue.line1')}
            line2={t('bienvenue.line2')}
            body={t('bienvenue.body')}
            align="center"
            size={33}
            delay={200}
          />

          <View style={styles.cta}>
            <PillButton label={t('bienvenue.createAccount')} icon="userPlus" onPress={() => router.push('/onboarding/signup')} />
          </View>

          <Pressable
            onPress={() => router.push('/onboarding/login')}
            style={styles.link}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${t('bienvenue.haveAccount')} ${t('bienvenue.login')}`}
          >
            <Text style={styles.linkText}>
              {t('bienvenue.haveAccount')} <Text style={styles.linkStrong}>{t('bienvenue.login')}</Text>
            </Text>
          </Pressable>

          {settings.general.mode_invite && (
          <Pressable
            onPress={enterGuestMode}
            style={styles.guest}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityHint={t('bienvenue.guestHint')}
          >
            <Text style={styles.guestText}>{t('bienvenue.guest')}</Text>
          </Pressable>
          )}
        </View>
      </SafeAreaView>
    </IllustratedBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 26,
  },
  top: {
    paddingTop: 18,
  },
  bottom: {
    paddingBottom: 18,
  },
  cta: {
    marginTop: 26,
  },
  link: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  linkText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textBodyAlt,
  },
  linkStrong: {
    fontFamily: typography.bodySemiBold,
    color: colors.accentGoldPale,
    textDecorationLine: 'underline',
  },
  guest: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMutedAlt,
  },
});
