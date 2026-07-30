import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth/AuthProvider';

/**
 * Point d'entrée réel de l'app (route "/"). Aucun écran de contenu ici :
 * ce fichier existait avant (catalogue héros), supprimé lors de l'ajout des
 * onglets sans le remplacer — hors "/" ne correspondait plus à aucun écran
 * ("Unmatched Route" au démarrage). Sert uniquement à rediriger vers le bon
 * groupe protégé selon l'état d'authentification.
 */
export default function Index() {
  const { session, onboardingComplete } = useAuth();

  if (session === undefined) return null;
  if (!session) return <Redirect href="/onboarding" />;
  if (!onboardingComplete) return <Redirect href="/onboarding/language" />;
  return <Redirect href="/accueil" />;
}
