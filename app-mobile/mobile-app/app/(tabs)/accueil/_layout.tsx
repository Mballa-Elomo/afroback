import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/tokens';

/**
 * Pile interne de l'onglet Accueil : Accueil → Histoires & Héros reste
 * navigable "en avant" (bouton retour) tout en gardant la barre d'onglets
 * visible et l'onglet "Accueil" actif, fidèle à la maquette (le catalogue
 * Histoires & Héros y affiche la barre du bas).
 */
export default function AccueilStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="histoires-heros" />
    </Stack>
  );
}
