import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { colors } from '../../src/theme/tokens';

/**
 * Barre d'onglets racine de l'app (une fois connecté et l'assistant
 * post-inscription terminé) — 5 onglets fidèles à la maquette.
 * Mise à jour 2026-07-31 : les 5 onglets ont désormais un vrai contenu
 * construit sur les données Supabase (Accueil, Découverte, Marché,
 * Communauté, Profil). "Marché" a un catalogue vide au lancement (aucun
 * vendeur/produit réel à ce jour) mais une infrastructure complète — voir
 * context/AFROBACK.md et app-mobile/data-model-marketplace.md.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
      <Tabs.Screen name="accueil" />
      <Tabs.Screen name="decouverte" />
      <Tabs.Screen name="marche" />
      <Tabs.Screen name="communaute" />
      <Tabs.Screen name="profil" />
    </Tabs>
  );
}
