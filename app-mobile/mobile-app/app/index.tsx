import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';
import { useActiveProfile } from '../src/profils/ActiveProfileProvider';
import { BootScreen } from '../src/components/BootScreen';
import { useSettings } from '../src/settings/SettingsProvider';

/**
 * Point d'entrée réel de l'app (route "/"). Aucun écran de contenu ici :
 * ce fichier existait avant (catalogue héros), supprimé lors de l'ajout des
 * onglets sans le remplacer — hors "/" ne correspondait plus à aucun écran
 * ("Unmatched Route" au démarrage). Sert uniquement à rediriger vers le bon
 * groupe protégé selon l'état d'authentification puis, depuis le
 * 2026-07-31, selon le profil actif (module Parent/Enfant — voir
 * ActiveProfileProvider) : sélecteur de profil, mode enfant, ou accueil
 * adulte comme avant.
 */
export default function Index() {
  const { session, onboardingComplete, isGuest, mfaStatus, deviceStatus } = useAuth();
  const { state: profileState } = useActiveProfile();
  const { settings } = useSettings();

  if (session === undefined) return <BootScreen />;
  if (!session) return <Redirect href={isGuest ? '/accueil' : '/onboarding'} />;
  // Appareil inconnu (cdc-appareil-unique.md) : prouver l'identité d'abord.
  if (deviceStatus === 'unknown') return <BootScreen />;
  if (deviceStatus === 'a_verifier') return <Redirect href="/onboarding/nouvel-appareil" />;
  // Vérification en 2 étapes : tant que le code n'est pas saisi, seul l'écran
  // de code est accessible — rediriger ailleurs donnait un écran noir
  // (constaté le 2026-09-29 après un changement de mot de passe).
  if (mfaStatus === 'unknown') return <BootScreen />;
  if (mfaStatus === 'challenge_required') return <Redirect href="/onboarding/mfa-challenge" />;
  if (!onboardingComplete) return <Redirect href="/onboarding/profil" />;
  // Vérification en 2 étapes rendue obligatoire dans le back-office : l'activer avant tout contenu.
  if (settings.securite.mfa_obligatoire && mfaStatus === 'not_enrolled') return <Redirect href="/profil/mfa" />;
  // Espace enfant coupé dans le back-office : accueil adulte pour tous.
  if (!settings.modules.espace_enfant) return <Redirect href="/accueil" />;
  if (profileState.status === 'checking') return <BootScreen />;
  if (profileState.status === 'selecting') return <Redirect href="/profils/selection" />;
  if (profileState.status === 'child') return <Redirect href="/enfant/accueil" />;
  return <Redirect href="/accueil" />;
}
