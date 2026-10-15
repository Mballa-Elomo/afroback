# AFROBACK — Back-office : module Marketplace (spécification)

> Rédigé le 2026-10-15 à la demande de Yannick (choix : Marketplace).
> But : contrôler qui vend quoi sur le Marché AFROBACK avant de l'ouvrir au public.

---

## 1. Constat (base et app au 2026-10-15)

- Tables : `marketplace_vendors`, `marketplace_products`, `marketplace_orders`, `marketplace_reviews`. Aucune donnée.
- **Aucune validation** : un membre crée sa boutique, elle est visible aussitôt (`is_active` vrai par défaut), ses produits aussi. (Le vendeur ne peut déjà pas modifier `is_active` : la base limite ses modifications aux champs de présentation.)
- **Aucun paiement des commandes** : l'app enregistre la commande « en attente de paiement » sans encaisser (Campay n'est branché que pour les abonnements et les dons). Le reversement aux artisans et la commission AFROBACK ne sont pas définis.

Conséquence : tant que le paiement des commandes n'existe pas, le Marché doit rester **désactivé pour le public** (Paramètres → Modules → Marché), ou présenté comme une vitrine sans achat.

## 2. Base de données : `schema-marketplace-moderation.sql`

1. Boutiques : nouvelle colonne `statut_validation` (en attente, validée, refusée, suspendue), motif et date. **Une boutique n'est visible du public que si elle est validée** (et active). Les boutiques futures démarrent « en attente ».
2. Le vendeur continue de ne modifier que ses champs de présentation ; même règle ajoutée pour les produits (jamais le masquage décidé par l'administrateur).
3. Produits : colonne `masque_admin` (+ motif). Un produit masqué disparaît du public ; le vendeur le voit encore dans sa boutique.
4. Avis : colonne `masque_admin`. Un avis masqué disparaît du public.

## 3. Écran `/marketplace`

### 3.1 Aperçu
- Boutiques (en attente, validées, suspendues), produits en ligne, commandes par statut, montant total commandé, avis.
- Bandeau permanent : « Paiement des commandes non branché : aucune commande n'est encaissée. »

### 3.2 Boutiques
- Liste : nom, artisan (lien fiche Utilisateur), région, artisanat, produits, commandes, statut.
- Actions : **Valider**, **Refuser** (motif), **Suspendre** (motif, masque boutique et produits), **Réactiver**.
- Fiche boutique : présentation, produits, commandes, avis.

### 3.3 Produits
- Tous les produits : photo, nom, boutique, catégorie, prix, stock, statut (en ligne, rupture, masqué), vues.
- Actions : **Masquer** (motif) / **Réafficher**.

### 3.4 Commandes
- Toutes les commandes : date, acheteur, boutique, articles, montant, ville, statut.
- Actions : **Annuler** (litige). Les coordonnées de livraison ne s'affichent que dans le détail d'une commande.

### 3.5 Avis
- Avis : note, commentaire, produit, auteur, réponse du vendeur. Action : **Masquer** / **Réafficher**.

## 4. Règles

- Lecture et actions côté serveur (clé service_role), administrateur revérifié, journal d'activité.
- Aucune suppression de données : la modération change des statuts.

## 5. Hors périmètre (décisions business à prendre)

- Paiement des commandes (Campay), commission AFROBACK, reversement aux artisans, frais de livraison, retours et litiges.
- Adaptation de l'app : afficher à l'artisan « boutique en attente de validation » (sans cela, il voit sa boutique normalement mais le public ne la voit pas).

## 6. Critères d'acceptation

1. Une nouvelle boutique n'apparaît pas dans le Marché public avant validation.
2. Un vendeur ne peut pas se valider lui-même (refus de la base).
3. Un produit ou un avis masqué disparaît du Marché public.

---

## 7. État d'implémentation (2026-10-15)

- Développé et en ligne : `/marketplace` (Aperçu, Boutiques, Produits, Commandes, Avis), validation / refus / suspension des boutiques, masquage des produits et des avis, annulation de commande, badge des boutiques en attente dans le menu, bandeaux « paiement non branché » et « script non exécuté ».
- Script `schema-marketplace-moderation.sql` livré (validation des boutiques, masquage produits et avis, création de boutique limitée aux champs de présentation), à exécuter par Yannick.
- Compilation et lecture des données vérifiées ; aucune boutique en base, donc actions et rendu non essayés en conditions réelles.
