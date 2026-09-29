# Cahier des charges : Accès gratuit et contenus réservés aux abonnés

> Rédigé le 2026-09-29. **Lot A développé le même jour.** Décisions : D3 et D5 validées par Yannick, D4 tranchée par Jarvis à sa demande (Racines et Héritage débloquent tout ; Héritage = -10 % Marché, badge premium, avant-première), D1/D2/D6/D7 non répondues → recommandations appliquées. **Reste à faire par Yannick : exécuter `mobile-app/supabase/schema-acces-abonnement.sql`** : tant que ce n'est pas fait, l'app fonctionne comme avant, sans aucun cadenas.

## 1. La règle demandée par Yannick

Un compte **gratuit** (forfait Découverte) a accès à :

| Pilier | Gratuit | Réservé aux abonnés (cadenas) |
|---|---|---|
| **Histoires & Héros** | Reine Nzinga uniquement (`reine-nzinga`) | Les 8 autres héros |
| **Mythologie** | Ngan Medza uniquement (`mythe-ngan-medza-beti`) | Les 4 autres mythes |
| **Découverte (Explorer le Cameroun)** | Palais royal de Foumban (`palais-royal-foumban`) et Ebolowa (`ebolowa`) | Les 8 autres contenus |
| **Marché** | Parcourir le catalogue | Interagir (voir D3) |
| **Communauté** | Lire | Publier, commenter, signaler |
| **Soutenir AFROBACK (don)** | Oui | — |

Contenus vérifiés en base le 2026-09-29 : 9 héros, 5 mythes, 10 contenus Découverte, les 4 contenus gratuits existent.

## 2. Ce que voit la personne (compte gratuit)

- **Catalogues complets et visibles** : tous les héros, mythes et contenus restent affichés (titre, image, résumé), pour donner envie. Les contenus réservés ont un **badge cadenas doré** sur leur carte et une image légèrement assombrie. Les contenus gratuits ont un badge **"Gratuit"**.
- **Toucher un contenu réservé** ouvre une fenêtre élégante : "Ce récit fait partie de l'abonnement", un rappel de ce que débloque l'abonnement, puis **"Voir les abonnements"** (vers l'écran des forfaits) et "Plus tard". Même principe que la fenêtre "Crée ton compte" du mode invité.
- **La fiche d'un contenu réservé** montre l'en-tête (image, titre, époque) et les premières lignes du récit, puis un fondu vers la fenêtre d'abonnement. Cet avant-goût convertit mieux qu'un mur fermé.
- **Marché et Communauté** : les boutons d'action ("Publier", "Commenter", etc.) sont visibles mais ouvrent la fenêtre d'abonnement.
- **Profil** : un encart "Forfait Découverte · Passer à Racines" en haut.
- **Accueil** : un bandeau discret "Débloque tous les récits" pour les comptes gratuits.

## 3. Sécurité : pourquoi un simple cadenas à l'écran ne suffit pas

Aujourd'hui, **tout le contenu est lisible sans compte via l'API Supabase** (vérifié le 2026-09-29 : lecture publique des tables `heros`, `mythes`, `decouverte_items`). Un cadenas affiché seulement dans l'app se contourne en quelques minutes par quelqu'un qui interroge l'API directement avec la clé publique (présente dans l'app). Pour que l'abonnement ait une vraie valeur, la règle doit être **appliquée par le serveur** :

1. **Nouvelle table `subscriptions`** (utilisateur, forfait, statut, date de fin, origine : paiement / offert / test). **Modifiable uniquement par le serveur** (back-office, paiement Mobile Money du Module 4), jamais par l'app. Le forfait stocké aujourd'hui dans le compte (`user_metadata.forfait`) est modifiable par l'utilisateur lui-même : il ne peut donc pas servir de preuve d'abonnement.
2. **Colonnes "catalogue" en lecture publique** (titre, image, résumé, époque…), **colonnes "contenu" protégées** (récit complet, chapitres, narrations audio, vidéos, texte Découverte), servies par une fonction serveur qui vérifie "contenu gratuit OU abonnement actif".
3. **Liste des contenus gratuits** dans une table `contenus_gratuits` (type + slug), modifiable depuis le back-office : Yannick pourra changer le contenu offert (ex. "héros du mois") sans toucher au code.
4. **Limite honnête** : les fichiers audio et vidéo sont dans un espace de stockage public. Leurs adresses ne seront plus données qu'aux ayants droit, mais quelqu'un qui connaît une adresse peut encore l'ouvrir. La protection complète (espace privé + liens temporaires signés) est un chantier séparé, recommandé avant le lancement public.

## 4. Découpage proposé

- **Lot A (maintenant)** : table `subscriptions`, table `contenus_gratuits`, protection serveur des contenus, cadenas et fenêtre d'abonnement dans l'app, textes des forfaits mis à jour, back-office : bouton "Offrir un abonnement" (pour les testeurs et partenaires).
- **Lot B (Module 4)** : paiement Mobile Money réel qui crée l'abonnement automatiquement, renouvellement, résiliation, écran "Mon abonnement".
- **Lot C (avant lancement)** : médias en espace privé avec liens temporaires.

## 5. Impacts sur l'existant

- **Mode invité (sans compte)** : doit voir au plus autant qu'un compte gratuit (voir D1).
- **Écran des forfaits** : les descriptions actuelles ("Héros en accès limité · Découverte complète…") ne correspondent plus. À réécrire : Découverte = 1 héros, 1 mythe, 2 lieux, lecture Communauté, catalogue Marché, don.
- **Paiement simulé** : aujourd'hui, "payer" Racines ne débloquerait rien de réel (voir D5).
- **Espace enfant (École des Héros, histoires enfant)** : non couvert par la demande (voir D6).

## 6. Décisions à prendre par Yannick

| # | Question | Recommandation de Jarvis |
|---|---|---|
| **D1** | **Mode invité (sans compte)** : peut-il lire les 4 contenus gratuits, ou seulement voir les catalogues ? | Voir les catalogues + lire les 4 contenus gratuits. C'est le meilleur hameçon ; le compte est demandé pour tout le reste. |
| **D2** | **Reine Nzinga et Ngan Medza en gratuit** : récit texte seulement, ou aussi l'audio et la vidéo ? | L'expérience complète (texte, audio, vidéo) : c'est la vitrine qui doit donner envie de s'abonner. |
| **D3** | **Marché, compte gratuit** : bloquer aussi l'**achat** ? | **Non, laisser acheter tout le monde.** Bloquer l'achat fait perdre des ventes aux artisans et la commission à AFROBACK. Réserver aux abonnés : **vendre**, **laisser un avis**. |
| **D4** | **Racines ou Héritage** : qu'est-ce qui les différencie, maintenant que tout abonnement débloque tous les contenus ? | Les deux débloquent tout le contenu. Héritage garde ses avantages déjà affichés (-10 % au Marché, badge premium, accès prioritaire aux nouveautés), sans promettre de "contenus exclusifs" qui n'existent pas encore. |
| **D5** | **Tant que le paiement Mobile Money n'est pas réel** : comment tester un compte abonné ? | Abonnements **offerts** depuis le back-office (bouton "Offrir un abonnement", avec une date de fin). Le paiement simulé de l'app ne débloque plus rien et l'indique clairement. |
| **D6** | **Espace enfant** : même règle (1 histoire gratuite) ou accès libre pour les enfants ? | Même règle que le compte parent : un enfant accède à ce à quoi son parent a droit. |
| **D7** | **Contenu gratuit changeable** depuis le back-office (ex. un "héros du mois" offert) ? | Oui : la liste `contenus_gratuits` le permet sans code. |
