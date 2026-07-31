import { useCallback } from 'react';
import { View } from 'react-native';
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayoutRootView}>
      <StatusBar style="light" />
      <AuthProvider>
        <WizardStateProvider>
          <ActiveProfileProvider>
            <RootNavigator />
          </ActiveProfileProvider>
        </WizardStateProvider>
      </AuthProvider>
    </View>
  );
}

/**
 * Grille d'accès : sans session → onboarding (splash 3D, connexion,
 * inscription) ; session mais assistant post-inscription pas terminé →
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
  const { session, onboardingComplete } = useAuth();
  const { state: profileState } = useActiveProfile();

  // session === undefined tant que la lecture de la session locale (AsyncStorage) n'est pas terminée.
  if (session === undefined) return null;
  // profileState.status === 'checking' tant que la liste des profils enfants n'a pas été chargée
  // (voir ActiveProfileProvider) — évite un flash d'écran vide entre les deux.
  if (!!session && onboardingComplete && profileState.status === 'checking') return null;

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
      <Stack.Protected guard={!!session && !onboardingComplete}>
        <Stack.Screen name="onboarding/language" />
        <Stack.Screen name="onboarding/usage" />
        <Stack.Screen name="onboarding/plan" />
        <Stack.Screen name="onboarding/payment" />
        <Stack.Screen name="onboarding/welcome" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && onboardingComplete && profileState.status === 'selecting'}>
        <Stack.Screen name="profils/selection" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && onboardingComplete && profileState.status === 'child'}>
        <Stack.Screen name="enfant/accueil" />
        <Stack.Screen name="enfant/histoire" />
        <Stack.Screen name="enfant/carnet/index" />
        <Stack.Screen name="enfant/carnet/[slug]" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && onboardingComplete && profileState.status === 'adult'}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && onboardingComplete}>
        <Stack.Screen name="profils/ajouter" />
        <Stack.Screen name="profils/parent" />
      </Stack.Protected>
    </Stack>
  );
}
