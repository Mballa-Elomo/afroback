# Modèle de données — Pilier Marketplace (app mobile AFROBACK)

> Rédigé le 2026-07-31. Périmètre cadré par Yannick avant transmission au chef de projet : **Option A — infrastructure complète, états vides honnêtes**. Contrairement à Découverte (contenu culturel produit par un agent dédié) et Communauté (UGC réelle), Marketplace n'a aucun vendeur ni produit réel à ce jour — rien n'est inventé, le catalogue est vide au lancement.

---

## 1. Ce qui distingue ce pilier des deux précédents

- **Aucune donnée pré-remplie.** Pas d'artisan ni de produit fictif : ce serait inventer du contenu commercial, jamais fait sur ce projet.
- **Identité vendeur publique**, contrairement au pseudonymat de `community_profiles` : un vendeur est une vitrine commerciale (nom de boutique, région, artisanat), pas un membre anonyme.
- **Paiement Mobile Money non intégré.** Une commande est créée avec le statut `en_attente_paiement`, jamais un faux statut "payée" — voir §4.
- **Aucun taux de commission ni palier d'abonnement vendeur codé en dur.** Ce n'est pas une donnée cosmétique : c'est une décision de modèle économique que Yannick n'a pas encore prise (voir `context/AFROBACK.md`, "Points bloquants" — séquencement du modèle économique). Le schéma ne contient donc aucune colonne de commission/palier ; l'espace vendeur affiche "pas encore configuré" plutôt qu'un chiffre inventé.

---

## 2. Schéma de données (Postgres/Supabase, voir `supabase/schema-marketplace.sql`)

### `marketplace_vendors`
Profil vendeur : `nom_boutique`, `region`, `artisanat`, `bio`, `avatar_url`, `is_active`. Vue publique `marketplace_vendors_public` (masque `user_id`, pas `nom_boutique` — l'identité commerciale reste publique par nature).

### `marketplace_products`
`vendor_id`, `nom`, `description`, `categorie` (enum de départ : sculpture/bijoux/textile/poterie/peinture/instrument/autre — taxonomie technique, pas une décision commerciale), `prix_fcfa`, `stock`, `statut` (`en_ligne`/`rupture`, **synchronisé automatiquement par trigger sur le stock**, jamais un bouton manuel qui pourrait se désynchroniser), `image_url`, `vues` (compteur réel).

### `marketplace_orders`
**Une ligne par vendeur**, pas une commande multi-vendeurs unique : si le panier contient des produits de plusieurs boutiques, le checkout éclate la commande en plusieurs lignes au moment du paiement, chacune avec son propre sous-total et ses propres articles (`items` jsonb, snapshot des prix au moment de l'achat). Simplifie la RLS (un vendeur ne voit que ses propres commandes) et correspond à la pratique courante d'un marketplace multi-vendeurs (chaque boutique expédie indépendamment).

`statut` : `en_attente_paiement` (état par défaut et quasi permanent tant que Mobile Money n'est pas intégré) → `expediee` → `livree`, ou `annulee`. Pas de statut "payée" : rien dans le système ne peut honnêtement affirmer qu'un paiement a eu lieu.

### `marketplace_reviews`
Avis produit : `auteur_nom` (choisi par l'acheteur à la publication de l'avis, pas un pseudonymat structuré comme Communauté — un avis produit est public par nature), `note`, `commentaire`, `image_url` optionnelle, `reponse_vendeur` (le vendeur peut répondre, jamais modifier la note/le commentaire de l'acheteur). Vue publique `marketplace_reviews_public` masque `buyer_user_id`.

---

## 3. Le panier n'est pas en base

Le panier (ajout/retrait d'articles avant checkout) est un **état local à l'appareil** (`src/marketplace/CartProvider.tsx`, React Context), pas une table Supabase : c'est une étape éphémère, aucun besoin de synchronisation entre appareils pour la V1. Il est vidé après un checkout réussi (commande enregistrée), jamais après un paiement (puisqu'aucun paiement réel n'a lieu).

---

## 4. Checkout : jamais un faux succès de paiement

Décision de Yannick, tranchée à l'avance et transmise au chef de projet : le bouton "Payer" ne doit **pas** créer une fausse commande "payée". Traitement retenu par le chef de projet (parmi les options laissées ouvertes) :

- La commande est réellement créée en base (`statut = 'en_attente_paiement'`), pas un simple message "bientôt disponible" qui n'enregistrerait rien.
- Le bouton est relibellé **"Enregistrer la commande"** plutôt que "Payer maintenant" — ne jamais promettre ce qui n'est pas fait.
- L'écran de confirmation ne dit jamais "Commande confirmée ✅" (implique un paiement réussi) mais **"Commande enregistrée"**, avec une explication honnête : le paiement Mobile Money n'est pas intégré, le vendeur contactera l'acheteur pour finaliser le paiement et la livraison — cohérent avec une pratique courante au Cameroun (paiement à la livraison ou confirmation par téléphone).
- Le vendeur peut tout de même marquer une commande "expédiée" depuis son espace : ça reste honnête, un vendeur peut gérer l'expédition indépendamment du système de paiement en ligne (paiement cash/Mobile Money confirmé hors app).

---

## 5. Écrans livrés (`app/(tabs)/marche/`)

Catalogue (`index.tsx`), fiche produit (`[id].tsx`), profil artisan (`artisan/[id].tsx`), panier (`cart.tsx`), checkout (`checkout.tsx`), mes commandes acheteur (`commandes.tsx`, ajout non prévu explicitement dans l'extrait de maquette mais nécessaire pour que "Suivre ma commande" mène quelque part), espace vendeur (`vendeur.tsx`, un seul écran avec sous-navigation par chips : tableau de bord/produits/commandes/avis/revenus/paliers, fidèle à la maquette qui modélise cette navigation en état local plutôt qu'en piles de routes séparées).

Composants dédiés : `ProductCard`, `AddToCartToast`, `CreateVendorForm`, `VendorProductEditorModal` (modal bottom-sheet de création/édition produit — champ description et sélecteur de catégorie ajoutés par rapport à l'extrait de maquette, nécessaires pour qu'un vrai produit soit exploitable).

Voir `mobile-app/README.md` pour le détail des simplifications assumées (pas de galerie photo multi-image, pas de bouton favori, pas de badge de vérification vendeur, pas d'upload de photo produit).
