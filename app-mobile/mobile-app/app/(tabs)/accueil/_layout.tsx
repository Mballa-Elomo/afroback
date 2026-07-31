import { Stack } from 'expo-router';
import { colors } from '../../../src/theme/tokens';

/**
 * Pile interne de l'onglet Accueil : Accueil → Histoires & Héros → fiche
 * héros → récit/audio/vidéo restent navigables "en avant" (bouton retour)
 * tout en gardant la barre d'onglets visible et l'onglet "Accueil" actif
 * (retour de test Yannick du 2026-07-31 : ces écrans vivaient auparavant en
 * dehors de `(tabs)`, ce qui masquait la barre — voir `context/AFROBACK.md`).
 * Exception assumée : le lecteur vidéo (`heros/[slug]/video`) et le lecteur
 * audio (`heros/[slug]/audio`) sont des lecteurs plein écran immersifs — la
 * barre y est masquée par `BottomTabBar` (voir `src/components/BottomTabBar.tsx`).
 */
export default function AccueilStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="histoires-heros" />
      <Stack.Screen name="heros/[slug]/index" />
      <Stack.Screen name="heros/[slug]/recit" />
      <Stack.Screen name="heros/[slug]/audio" />
      <Stack.Screen name="heros/[slug]/video" />
    </Stack>
  );
}
