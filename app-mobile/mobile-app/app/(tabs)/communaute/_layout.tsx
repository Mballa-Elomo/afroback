import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/tokens';

/**
 * Pile interne de l'onglet Communauté : fil → détail de post → créer un
 * post → profil membre → signalement → charte, même pattern que
 * app/(tabs)/accueil/_layout.tsx pour garder la barre d'onglets visible
 * (fidèle à la maquette, lue via design-reference-communaute.dc.excerpt.html
 * le 2026-07-30).
 */
export default function CommunauteStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="create" />
      <Stack.Screen name="profil/[id]" />
      <Stack.Screen name="signaler" />
      <Stack.Screen name="charte" />
    </Stack>
  );
}
