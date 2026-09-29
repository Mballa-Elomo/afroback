import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';
import { AccountWallProvider } from '../src/auth/AccountWall';
import { AccessProvider } from '../src/access/Access';
import { WizardStateProvider } from '../src/onboarding/WizardState';
import { ActiveProfileProvider, useActiveProfile } from '../src/profils/ActiveProfileProvider';
import { useAppFonts } from '../src/theme/useAppFonts';
import { colors } from '../src/theme/tokens';
import { loadInitialLanguage } from '../src/i18n';
import { BootScreen } from '../src/components/BootScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();
  // Langue (choix mémorisé ou langue du téléphone) chargée avant le premier écran : pas de flash FR → EN.
  const [langReady, setLangReady] = useState(false);
  useEffect(() => {
    loadInitialLanguage().finally(() => setLangReady(true));
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded || fontError) && langReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, langReady]);

  if ((!fontsLoaded && !fontError) || !langReady) {
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
            <AccountWallProvider>
              <AccessProvider>
                <RootNavigator />
              </AccessProvider>
            </AccountWallProvider>
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
 * Grille d'accès : sans session → onboarding (splash, présentation,
 * "Bienvenue dans ton voyage", connexion, inscription, code email — refonte
 * du 2026-09-29, app-mobile/cdc-onboarding.md) ; session mais MFA activée et pas encore vérifiée pour cette
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
  const { session, onboardingComplete, mfaStatus, isGuest, deviceStatus } = useAuth();
  const { state: profileState } = useActiveProfile();

  // session === undefined tant que la lecture de la session locale (AsyncStorage) n'est pas terminée.
  if (session === undefined) return <BootScreen />;
  // mfaStatus === 'unknown' tant que le niveau d'assurance n'a pas été vérifié auprès de Supabase.
  if (!!session && mfaStatus === 'unknown') return <BootScreen />;
  // Appareil (cdc-appareil-unique.md) : vérification en cours.
  if (!!session && deviceStatus === 'unknown') return <BootScreen />;
  // profileState.status === 'checking' tant que la liste des profils enfants n'a pas été chargée
  // (voir ActiveProfileProvider) — évite un flash d'écran vide entre les deux.
  if (!!session && onboardingComplete && profileState.status === 'checking') return <BootScreen />;

  // Appareil inconnu : seul l'écran "Nouvel appareil détecté" est accessible,
  // avant même la vérification en 2 étapes (son code peut servir de preuve).
  const deviceOk = !session || deviceStatus === 'ok';
  // Une fois 'unknown' écarté ci-dessus, seul 'challenge_required' bloque encore l'accès —
  // 'not_enrolled' (pas de 2FA activée) et 'satisfied' (2FA validée) se comportent pareil.
  const mfaPassed = !session || mfaStatus !== 'challenge_required';
  const mfaOk = deviceOk && mfaPassed;

  return (
    // Chaque écran construit son propre en-tête (retour, titre) pour coller
    // à la maquette — pas d'en-tête natif générique.
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      {/* Conditions et confidentialité : lisibles dans tous les états (inscription, invité, connecté). */}
      <Stack.Screen name="legal/[doc]" />
      {/* Reste accessible en mode invité : la fenêtre "Crée ton compte"
          (AccountWall) y renvoie vers l'inscription ou la connexion. */}
      <Stack.Protected guard={!session}>
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="onboarding/transition" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/bienvenue" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/login" />
        <Stack.Screen name="onboarding/signup" />
        <Stack.Screen name="onboarding/verification-email" />
        <Stack.Screen name="onboarding/mot-de-passe-oublie" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && !deviceOk}>
        <Stack.Screen name="onboarding/nouvel-appareil" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && deviceOk && !mfaPassed}>
        <Stack.Screen name="onboarding/mfa-challenge" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && mfaOk && !onboardingComplete}>
        {/* Ordre du parcours post-inscription (cdc-onboarding.md, D5) :
            "Ton profil" (pseudo + photo/avatar, ajouté le 2026-09-29) → "Je suis…" (usage) → "Ton compte est créé !" → "Protège ton
            compte" (MFA, suggéré jamais forcé) → forfait → paiement →
            "Bienvenue dans AfroBack". L'ordre des <Stack.Screen> dans un
            groupe qui vient de devenir actif détermine l'écran affiché par
            défaut : profil en premier. `language` est hors parcours tant que
            l'app n'est pas traduite (fichier gardé pour ce chantier). */}
        <Stack.Screen name="onboarding/profil" />
        <Stack.Screen name="onboarding/usage" />
        <Stack.Screen name="onboarding/compte-cree" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/mfa-proposal" />
        <Stack.Screen name="onboarding/plan" />
        <Stack.Screen name="onboarding/payment" />
        <Stack.Screen name="onboarding/welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding/language" />
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
      {/* Invité ("Explorer sans compte") : accès aux onglets en lecture, les
          actions réservées passent par AccountWall (cdc-onboarding.md, section 4). */}
      <Stack.Protected
        guard={(!!session && mfaOk && onboardingComplete && profileState.status === 'adult') || isGuest}
      >
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session && mfaOk && onboardingComplete}>
        <Stack.Screen name="profils/ajouter" />
        <Stack.Screen name="profils/parent" />
        <Stack.Screen name="abonnement" />
        <Stack.Screen name="don/index" />
        <Stack.Screen name="don/montant" />
      </Stack.Protected>
    </Stack>
  );
}
