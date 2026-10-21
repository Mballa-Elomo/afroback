import { Stack } from 'expo-router';
import { NAVIGATION_FLUIDE } from '../../../src/navigation/fluide';
import { colors } from '../../../src/theme/tokens';
import { ModuleGate } from '../../../src/settings/ModuleOff';

/**
 * Pile interne de l'onglet Communauté : fil → détail de post → créer un
 * post → profil membre → signalement → charte, même pattern que
 * app/(tabs)/accueil/_layout.tsx pour garder la barre d'onglets visible
 * (fidèle à la maquette, lue via design-reference-communaute.dc.excerpt.html
 * le 2026-07-30).
 */
/** Le premier écran de la pile reste toujours dessous (retour possible même après un lien direct). */
export const unstable_settings = { initialRouteName: 'index' };

export default function CommunauteStackLayout() {
  return (
    <ModuleGate module="communaute">
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, ...NAVIGATION_FLUIDE }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="create" />
      <Stack.Screen name="profil/[id]" />
      <Stack.Screen name="signaler" />
      <Stack.Screen name="charte" />
    </Stack>
    </ModuleGate>
  );
}
