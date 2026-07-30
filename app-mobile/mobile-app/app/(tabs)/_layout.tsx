import { Tabs } from 'expo-router';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { colors } from '../../src/theme/tokens';

/**
 * Barre d'onglets racine de l'app (une fois connecté et l'assistant
 * post-inscription terminé) — 5 onglets fidèles à la maquette. Seul
 * "Accueil" a un vrai contenu construit sur les données ; Découverte,
 * Marché et Commu. affichent un état "bientôt disponible" honnête (ces
 * piliers du produit n'ont aucun contenu produit à ce jour, voir
 * context/AFROBACK.md). "Profil" affiche les vraies infos du compte.
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
