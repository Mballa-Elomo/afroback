# Cahier des charges · Site web AFROBACK (version web, style Netflix)

> Rédigé le 2026-10-02 à la demande de Yannick : « un site web qui ressemble beaucoup à Netflix, avec les fonctionnalités de l'application ; une version web d'AFROBACK, sans venir modifier le code de l'application ».
> Référence fonctionnelle et visuelle : l'application en ligne https://afroback-test.vercel.app (version du 2026-10-01).
> **Statut : validé par Yannick le 2026-10-02 avec les recommandations D1 à D6.** Lots 0 et 1 livrés le 2026-10-02 : projet `site-web/web/` (Next.js 16, Tailwind, Supabase partagé en lecture), publié sur https://afroback-web.vercel.app (projet Vercel séparé `afroback-web`).

---

## 1. Principe directeur

| Règle | Conséquence |
|---|---|
| **Le code de l'application n'est jamais modifié** | Le site est un **projet séparé**, dans `livrables/sites-web/afroback/site-web/`. Aucun fichier de `app-mobile/mobile-app/` n'est touché. |
| **Une seule base de données** | Le site se branche sur **le même Supabase** que l'app : mêmes comptes, mêmes héros, mythes, Découverte, abonnements, commentaires, J'aime, commandes. Un abonné de l'app est abonné sur le site, et inversement. |
| **Mêmes règles de sécurité** | Le site utilise uniquement la clé publique (comme l'app). Le contenu réservé reste protégé **côté serveur** par les fonctions existantes (`get_heros_detail`, `get_mythe_detail`, `get_decouverte_detail`) : le site ne peut rien contourner. |
| **Même identité AFROBACK** | Noir profond, or, terracotta, Cinzel + Manrope, médaillon. On prend la **mécanique** de Netflix, pas ses couleurs. |

## 2. Ce qu'on prend à Netflix

| Élément Netflix | Version AFROBACK |
|---|---|
| **Grande bannière d'accueil** (billboard) en plein écran, titre, résumé, boutons | « À la une » : le héros mis en avant (champ `a_la_une` du back-office, sinon rotation quotidienne), portrait en grand, dégradé noir à gauche, boutons **Lire**, **Écouter**, **Plus d'infos**. Si le héros a une vidéo, **extrait muet en boucle** après 3 s (option D3). |
| **Rangées horizontales** par catégorie | « Continuer la lecture », « Héros du Cameroun », « Résistance », « Mythes fondateurs », « Découverte · villages et traditions », « Gratuits », « Les plus aimés » (vrais chiffres `stats_contenus`, jamais inventés). Flèches au survol, défilement fluide. |
| **Carte qui s'agrandit au survol** | La carte grossit, montre l'image, le titre, l'époque, le badge Gratuit / cadenas, et les boutons **Lire · J'aime · Plus d'infos**. |
| **Fenêtre « Plus d'infos »** par-dessus la page | Fiche complète en fenêtre : grand visuel, résumé, compteurs (lectures, écoutes, vues), J'aime, partage, **les 4 chapitres présentés comme des épisodes** (titre, durée, lecture vidéo ou audio), frise, sources, citations, légendes, commentaires. Chaque fiche a aussi sa **propre adresse** (partageable, indexable). |
| **« Qui regarde ? »** | Sélection du profil : parent ou enfants (profils famille déjà existants dans l'app). Un profil enfant ouvre l'**espace enfant** (équivalent Netflix Kids). |
| **Barre du haut transparente** qui devient opaque au défilement | Médaillon + AFROBACK, Accueil · Héros · Mythes · Découverte · Marché · Communauté, recherche (loupe qui s'ouvre), FR/EN, profil. |
| **Lecteur plein écran** | Vidéo par chapitre (passage au chapitre suivant automatique, comme l'épisode suivant), lecteur audio, mode lecture du récit en colonne confortable. |
| **Page de recherche en grille** | Résultats instantanés (héros, mythes, Découverte), sans accents, en grille de cartes. |

## 3. Fonctionnalités (parité avec l'application)

Toutes les fonctionnalités de l'app sont reprises, en version web.

| Module | Fonctionnalités |
|---|---|
| **Visiteur (invité)** | Navigation et lecture des contenus gratuits ; aperçu des contenus réservés avec cadenas ; invitation à créer un compte pour les actions réservées (comme l'app). |
| **Compte** | Inscription (email, téléphone, mot de passe, conditions), code de confirmation email, connexion par email ou téléphone, mot de passe oublié, blocage après tentatives répétées, **vérification des nouveaux appareils**, **double authentification (TOTP)**, email d'alerte de connexion, déconnexion. |
| **Profil** | Photo ou avatar, pseudo (vérification de disponibilité), prénom, pays, centres d'intérêt, changement de mot de passe, langue FR/EN, forfait en cours. |
| **Profils famille** | « Qui regarde ? », ajout de profils enfants, espace parent. |
| **Héros** | Catalogue, fiche, récit en 4 chapitres, lecteur audio, lecteur vidéo par chapitre, frise chronologique, sources, citations, légendes, aperçu verrouillé. |
| **Mythologie** | Catalogue par zone, fiche, récit, audio, vidéo. |
| **Découverte** | Villages, coutumes, objets, personnages ; filtres ; pages pays. |
| **Recherche** | Globale (héros, mythes, Découverte). |
| **Interactions** | J'aime, compteurs de vues / écoutes / lectures, **commentaires façon Facebook** (réponses, J'aime, modifier, supprimer, signaler), partage avec lien court et aperçu (déjà en place). |
| **Abonnement** | Forfaits (Racines, Héritage), mensuel / annuel, **paiement Mobile Money Campay** (MTN, Orange), déblocage automatique. |
| **Don** | Montant libre, paiement Campay. |
| **Communauté** | Fil, publication (texte, image), commentaires, profil membre, charte, signalement. |
| **Marché** | Catalogue, fiche produit, profil artisan, panier, commande, mes commandes, avis, espace vendeur. |
| **Espace enfant** | Accueil enfant, histoires, carnet, école (niveaux, leçons, quiz, résultats, collection). |
| **Légal** | Conditions d'utilisation, confidentialité. |

## 4. Choix techniques

| Élément | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js (React) + TypeScript** | Standard du web en React, pages rapides, rendu côté serveur pour Google et les aperçus de partage. |
| Style | **Tailwind CSS** + composants maison | Rapide à coder, responsive natif, design AFROBACK fidèle. |
| Animations | Framer Motion | Cartes qui s'agrandissent, fenêtres, transitions façon Netflix. |
| Données | `@supabase/supabase-js` + `@supabase/ssr` | Même Supabase, sessions sécurisées sur le web. |
| Vidéo / audio | Lecteur HTML5 sur mesure | Chapitres, reprise, compteurs d'engagement. |
| Hébergement | **Nouveau projet Vercel**, séparé de celui de l'app | Publications indépendantes : publier le site ne touche jamais l'app. |
| Langues | FR / EN (mêmes textes que l'app, copiés dans le site) | |

Responsive : le site s'adapte au téléphone, à la tablette et à l'ordinateur (de 360 à 1 920 px), mais il est **pensé d'abord pour l'ordinateur et la télévision connectée**, l'app restant l'expérience principale sur téléphone.

## 5. Plan du site (adresses)

| Adresse | Page |
|---|---|
| `/` | Accueil Netflix (bannière + rangées) |
| `/heros`, `/heros/[slug]` | Catalogue et fiche héros (la fiche s'ouvre aussi en fenêtre depuis l'accueil) |
| `/heros/[slug]/lire`, `/ecouter`, `/regarder` | Récit, audio, vidéo |
| `/mythes`, `/mythes/[slug]` (+ lire, écouter, regarder) | Mythologie |
| `/decouverte`, `/decouverte/[slug]`, `/decouverte/pays/[slug]` | Découverte |
| `/recherche` | Recherche |
| `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/verification`, `/nouvel-appareil`, `/double-authentification` | Compte |
| `/profils` | « Qui regarde ? » |
| `/compte`, `/compte/profil`, `/compte/mot-de-passe`, `/compte/securite` | Réglages |
| `/abonnement`, `/paiement/retour`, `/don` | Argent |
| `/communaute`, `/communaute/post/[id]`, `/communaute/membre/[id]` | Communauté |
| `/marche`, `/marche/produit/[id]`, `/marche/artisan/[id]`, `/marche/panier`, `/marche/commande`, `/marche/mes-commandes`, `/marche/vendeur` | Marché |
| `/enfant/...` | Espace enfant |
| `/legal/cgu`, `/legal/confidentialite` | Légal |

## 6. Ce qui doit être réglé hors du code de l'app (backend partagé)

Le code de l'app n'est pas touché, mais 4 réglages **côté serveur ou tableau de bord** seront nécessaires. Chacun sera présenté à Yannick avant d'être fait.

| # | Réglage | Pourquoi |
|---|---|---|
| B1 | **Fonction de paiement `campay`** : ajouter l'adresse du site à la liste des adresses de retour autorisées | Aujourd'hui, seul afroback-test.vercel.app est accepté après un paiement. Modification d'une ligne dans la fonction serveur (pas dans l'app), sans effet sur l'app. |
| B2 | **Supabase Auth** : ajouter l'adresse du site aux adresses de redirection (tableau de bord) | Pour que les emails de confirmation et de mot de passe oublié ramènent sur le site. |
| B3 | **Politique « un seul appareil »** | Aujourd'hui, une connexion ailleurs déconnecte l'autre appareil. Se connecter au site déconnecterait donc le téléphone (voir décision D2). |
| B4 | **Nom de domaine** | Adresse du site (voir décision D1). |

## 7. Découpage en lots

Chaque lot est publié sur une adresse de test et **montré à Yannick** avant le suivant.

| Lot | Contenu | Résultat |
|---|---|---|
| **0 · Socle** | Projet Next.js, design system AFROBACK (couleurs, typos, boutons, cartes), connexion Supabase en lecture, barre du haut, pied de page, publication Vercel séparée | Un squelette en ligne |
| **1 · Catalogue Netflix** | Accueil (bannière + rangées), cartes au survol, fenêtre « Plus d'infos », pages Héros / Mythes / Découverte, recherche, mode invité, cadenas abonné | Le site **ressemble à Netflix** et se visite |
| **2 · Lecture et interactions** | Récit, lecteur audio, lecteur vidéo par chapitre, compteurs, J'aime, commentaires, partage | On consomme les contenus |
| **3 · Compte et profils** | Inscription, connexion, vérification d'appareil, double authentification, profil, langue, « Qui regarde ? » | On se connecte avec son compte de l'app |
| **4 · Abonnement et don** | Forfaits, paiement Campay, retour de paiement, déblocage (avec B1) | Le site encaisse |
| **5 · Communauté et Marché** | Fil, publications, profils ; catalogue, panier, commande, espace vendeur | Parité sociale et commerciale |
| **6 · Espace enfant** | Accueil enfant, histoires, carnet, école, quiz | Parité complète |
| **7 · Finitions et lancement** | Responsive (360 à 1 920 px), référencement Google, performances, accessibilité, domaine | Site public |

## 8. Décisions à prendre par Yannick

| # | Question | Ma recommandation |
|---|---|---|
| D1 | Adresse du site | Phase de test : un nouveau projet Vercel (ex. `afroback-web.vercel.app`). Lancement : **www.afroback.app** (le site), l'app gardant sa propre adresse. |
| D2 | Un seul appareil : le site compte-t-il comme un appareil ? | **Autoriser 1 téléphone + 1 navigateur** en même temps : sinon, ouvrir le site déconnecte le téléphone, ce qui sera mal vécu. Demande un petit réglage serveur (B3), à valider. |
| D3 | Extrait vidéo muet automatique dans la bannière et au survol des cartes | **Oui dans la bannière**, non au survol (plus léger pour les connexions camerounaises). |
| D4 | Ajouts « Netflix » qui n'existent pas dans l'app : **« Ma liste »** (garder un contenu pour plus tard) | **Plus tard** : c'est une nouvelle fonctionnalité (nouvelle table), à ajouter ensuite au site et à l'app ensemble. |
| D5 | Pages indexées par Google (fiches publiques avec aperçu) | **Oui** pour les fiches (titre, résumé, image) ; le contenu réservé reste protégé. |
| D6 | Ordre des lots | **0 et 1 d'abord** (le rendu Netflix visible très vite), puis 2 et 3. |

## 9. Hors périmètre

- Toute modification du code de l'application mobile.
- Applications natives iOS / Android.
- Nouveau contenu (récits, vidéos) : le site affiche ce qui existe déjà.
- Nouvelles fonctionnalités absentes de l'app (sauf décision contraire en D4).

## 10. Critères d'acceptation

- L'application (https://afroback-test.vercel.app et téléphones) **fonctionne exactement comme avant** à chaque étape.
- Un compte créé dans l'app se connecte sur le site, avec le même forfait, et inversement.
- Un contenu réservé reste inaccessible sur le site sans abonnement (vérifié côté serveur).
- Rendu vérifié à 360, 768, 1 024, 1 440 et 1 920 px.
- Aucun chiffre inventé : les compteurs et classements viennent des vraies données.
