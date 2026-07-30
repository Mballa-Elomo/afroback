import { useCallback } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
import { WizardStateProvider } from '../src/onboarding/WizardState';
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
          <RootNavigator />
        </WizardStateProvider>
      </AuthProvider>
    </View>
  );
}

/**
 * Grille d'accès à 3 états : sans session → onboarding (splash 3D, connexion,
 * inscription) ; session mais assistant post-inscription pas terminé →
 * langue/usage/forfait/bienvenue ; session + assistant terminé → le reste de
 * l'app (catalogue héros et écrans liés). `Stack.Protected` bascule seul
 * d'un groupe à l'autre selon `session` et `onboardingComplete`, sans
 * redirection manuelle à écrire dans chaque écran.
 */
function RootNavigator() {
  const { session, onboardingComplete } = useAuth();

  // session === undefined tant que la lecture de la session locale (AsyncStorage) n'est pas terminée.
  if (session === undefined) return null;

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
      <Stack.Protected guard={!!session && onboardingComplete}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="heros/[slug]/index" />
        <Stack.Screen name="heros/[slug]/recit" />
        <Stack.Screen name="heros/[slug]/audio" />
        <Stack.Screen name="heros/[slug]/video" />
      </Stack.Protected>
    </Stack>
  );
}
