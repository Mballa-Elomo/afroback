import { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
import { WizardStateProvider } from '../src/onboarding/WizardState';
import { ActiveProfileProvider, useActiveProfile } from '../src/profils/ActiveProfileProvider';
import { useAppFonts } from '../src/theme/useAppFonts';
import { colors } from '../src/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Sur web, l'app (pensée pour un écran de téléphone) s'étirait sur toute
  // la largeur du navigateur — retour de test de Yannick le 2026-09-26
  // ("obligé de dézoomer pour tout voir"). Cadre centré à une largeur de
  // téléphone (max 480px) sur web uniquement ; iOS/Android inchangés (déjà
  // plein écran, comportement natif normal).
  const content = (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <WizardStateProvider>
          <ActiveProfileProvider>
            <RootNavigator />
          </ActiveProfileProvider>
        </WizardStateProvider>
      </AuthProvider>
    </>
  );

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayoutRootView}>
        {content}
      </View>
    );
  }

  return (
    <View style={styles.webOuter} onLayout={onLayoutRootView}>
      <View style={[styles.webFrame, { backgroundColor: colors.background }]}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050302',
  },
  webFrame: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    overflow: 'hidden',
  },
});

/**
 * Grille d'accès : sans session → onboarding (splash 3D, connexion,
 * inscription) ; session mais MFA activée et pas encore vérifiée pour cette
 * connexion → porte de vérification (lot cybersécurité du 2026-09-25,
 * prioritaire sur tout le reste : un compte protégé par 2FA n'accède à rien,
 * pas même à l'assistant post-inscription, tant que le code n'est pas
 * validé) ; session mais assistant post-inscription pas terminé →
 * langue/usage/forfait/bienvenue ; session + assistant terminé → module
 * Parent/Enfant (`ActiveProfileProvider`, ajouté le 2026-07-31) qui décide
 * entre le sélecteur de profil "Qui est-ce ?", le mode enfant plein écran,
 * ou le reste de l'app (5 onglets, comme avant). `Stack.Protected` bascule
 * seul d'un groupe à l'autre, sans redirection manuelle à écrire dans
 * chaque écran. `profils/ajouter` et `profils/parent` restent joignables
 * dès que la session est prête, quel que soit le statut de profil (le
 * sélecteur comme l'Espace Parent y renvoient tous les deux).
 */
function RootNavigator() {
  const { session, onboardingComplete, mfaStatus } = useAuth();
  const { state: profileState } = useActiveProfile();

  // session === undefined tant que la lecture de la session locale (AsyncStorage) n'est pas terminée.
  if (session === undefined) return null;
  // mfaStatus === 'unknown' tant que le niveau d'assurance n'a pas été vérifié auprès de Supabase.
  if (!!session && mfaStatus === 'unknown') return null;
  // profileState.status === 'checking' tant que la liste des profils enfants n'a pas été chargée
  // (voir ActiveProfileProvider) — évite un flash d'écran vide entre les deux.
  if (!!session && onboardingComplete && profileState.status === 'checking') return null;

  // Une fois 'unknown' écarté ci-dessus, seul 'challenge_required' bloque encore l'accès —
  // 'not_enrolled' (pas de 2FA activée) et 'satisfied' (2FA validée) se comportent pareil.
  const mfaOk = !session || mfaStatus !== 'challenge_required';

  return (
    // Chaque écran construit son propre en-tête (retour, titre) pour coller
    // à la maquette — pas d'en-tête natif générique.
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="onboarding/login" />
        <Stack.Screen name="onboarding/signup" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && !mfaOk}>
        <Stack.Screen name="onboarding/mfa-challenge" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && mfaOk && !onboardingComplete}>
        {/* mfa-proposal en premier : "Protège ton compte" s'affiche juste
            après l'inscription, avant tout le reste de l'assistant — voir
            app-mobile/cdc-mfa-inscription.md (Option B, suggéré jamais
            forcé). L'ordre des <Stack.Screen> dans un groupe qui vient de
            devenir actif détermine l'écran affiché par défaut. */}
        <Stack.Screen name="onboarding/mfa-proposal" />
        <Stack.Screen name="onboarding/language" />
        <Stack.Screen name="onboarding/usage" />
        <Stack.Screen name="onboarding/plan" />
        <Stack.Screen name="onboarding/payment" />
        <Stack.Screen name="onboarding/welcome" />
      </Stack.Protected>
      {/* profil/mfa joignable dès que la session est prête, pas seulement
          une fois l'onboarding terminé — mfa-proposal doit pouvoir y
          naviguer avant que `onboardingComplete` ne soit vrai. */}
      <Stack.Protected guard={!!session && mfaOk}>
        <Stack.Screen name="profil/mfa" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && mfaOk && onboardingComplete && profileState.status === 'selecting'}>
        <Stack.Screen name="profils/selection" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && mfaOk && onboardingComplete && profileState.status === 'child'}>
        <Stack.Screen name="enfant/accueil" />
        <Stack.Screen name="enfant/histoire" />
        <Stack.Screen name="enfant/carnet/index" />
        <Stack.Screen name="enfant/carnet/[slug]" />
        <Stack.Screen name="enfant/ecole/index" />
        <Stack.Screen name="enfant/ecole/lecon/[id]" />
        <Stack.Screen name="enfant/ecole/quiz/[leconId]" />
        <Stack.Screen name="enfant/ecole/resultat" />
        <Stack.Screen name="enfant/ecole/niveau-suivant" />
        <Stack.Screen name="enfant/ecole/collection" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && mfaOk && onboardingComplete && profileState.status === 'adult'}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && mfaOk && onboardingComplete}>
        <Stack.Screen name="profils/ajouter" />
        <Stack.Screen name="profils/parent" />
        <Stack.Screen name="don/index" />
        <Stack.Screen name="don/montant" />
      </Stack.Protected>
    </Stack>
  );
}
