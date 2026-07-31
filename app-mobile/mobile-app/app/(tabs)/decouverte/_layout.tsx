import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/tokens';

/**
 * Pile interne de l'onglet Découverte : liste → fiche détail → hub pays,
 * même pattern que app/(tabs)/accueil/_layout.tsx pour garder la barre
 * d'onglets visible tout au long de la navigation (fidèle à la maquette,
 * lue via design-reference-decouverte.dc.excerpt.html le 2026-07-30).
 */
export default function DecouverteStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[slug]" />
      <Stack.Screen name="pays/[slug]" />
    </Stack>
  );
}
