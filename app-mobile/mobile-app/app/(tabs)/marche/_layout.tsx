import { Stack } from 'expo-router';
import { CartProvider } from '../../../src/marketplace/CartProvider';
import { colors } from '../../../src/theme/tokens';

/**
 * Pile interne de l'onglet Marché : catalogue → fiche produit → profil
 * artisan → panier → checkout → mes commandes → espace vendeur, même
 * pattern que app/(tabs)/accueil/_layout.tsx pour garder la barre d'onglets
 * visible. `CartProvider` est scopé ici (pas au layout racine) pour ne pas
 * toucher aux fichiers partagés par les autres piliers déjà en test sur
 * téléphone (Découverte, Communauté).
 */
export default function MarcheStackLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
        <Stack.Screen name="artisan/[id]" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="commandes" />
        <Stack.Screen name="vendeur" />
      </Stack>
    </CartProvider>
  );
}
