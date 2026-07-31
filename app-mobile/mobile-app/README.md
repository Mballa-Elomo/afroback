# AFROBACK Mobile — app native (Expo / React Native)

Application mobile AFROBACK, pilier **Histoires & Héros** (Phase 1). Construite le 2026-07-29 à partir des specs de `app-mobile/` (dossier parent) : `specs-phase1-histoires-heros.md`, `data-model-heros.md`, `design-system-mobile.md`.

## Ce qui est fait

- Projet **Expo (SDK 57) + TypeScript + Expo Router**, thème sombre uniquement.
- **Backend réel : Supabase (Postgres)**, projet `afroback` (ref `ygkyapryramhaskfbrrt`). Table `heros` créée et peuplée avec les 9 héros, lecture publique via row level security. Voir `supabase/seed.sql`.
- **UI refaite le 2026-07-29 pour être fidèle à la vraie maquette Claude Design** (`AFROBACK Mobile.dc.html`, projet `a6ac90b2-…`, lu directement via l'outil de design). La première version avait été construite par un agent sans accès à la maquette, qui avait inventé sa propre charte — corrigé : couleurs, typographies (Cinzel/Manrope/Space Mono), grille catalogue 2 colonnes avec tuiles image + badges, en-tête immersif de la fiche héros, lecteur avec lettrine et popover de réglages, lecteur audio avec portrait et forme d'onde, lecteur vidéo 16:9 — tout est recalé sur les styles inline exacts du prototype (`src/theme/tokens.ts`). Simplification assumée : le motif `repeating-linear-gradient` (rayures diagonales) de la maquette pour les images manquantes est approximé par un dégradé diagonal deux tons (React Native n'a pas d'équivalent direct sans dépendance supplémentaire) ; les libellés entre crochets du prototype (ex. `[ portrait · Nom ]`) sont des annotations de maquette, pas du texte produit, donc pas repris.
- 4 écrans de la Phase 1, avec les **vraies données** des 9 héros déjà écrits par le griot, chargées en direct depuis Supabase :
  - `app/index.tsx` — Catalogue héros (recherche, filtres thème/région)
  - `app/heros/[slug]/index.tsx` — Fiche héros (frise, citations avec statut d'attestation, légendes, héros liés, sources)
  - `app/heros/[slug]/recit.tsx` — Lecteur de récit intégral (FR/EN, barre de progression, taille de texte)
  - `app/heros/[slug]/audio.tsx` et `.../video.tsx` — Lecteurs plein écran ; `video.tsx` affiche un vrai documentaire dès que `video_url` existe, sinon un **diaporama animé du storyboard** (`src/components/StoryboardSlideshow.tsx`) — 96 planches réelles (voix off, cadrage, transitions) par héros, jamais un texte inventé, plutôt qu'un simple "bientôt disponible"
- Séparation stricte fait/légende respectée dans l'UI (`FactVsLegendCallout.tsx`) — jamais une légende présentée comme un fait.
- États de chargement/erreur soignés (`LoadingState.tsx`) plutôt qu'un écran blanc en cas de coupure réseau.

## Comment lancer l'app (test sur téléphone, sans Mac/Xcode/Android Studio)

```bash
cd livrables/sites-web/afroback/app-mobile/mobile-app
npm install          # si pas déjà fait
npx expo start
```

Un QR code s'affiche dans le terminal. Installe l'app **Expo Go** (App Store / Google Play) sur ton téléphone et scanne-le : l'app se charge directement, sans build natif ni compte développeur. Il faut une connexion internet (l'app interroge Supabase à chaque ouverture, pas de cache offline en Phase 1).

**Le projet cible Expo SDK 54, pas la dernière version (57).** C'est volontaire : depuis mai 2026, l'app Expo Go publiée sur l'App Store / Google Play est [bloquée au SDK 54](https://expo.dev/changelog/expo-go-and-app-store-may-2026), les SDK 55+ n'étant testables que via un dev build personnalisé (`eas go`, compte développeur payant requis) — hors périmètre de ce workspace. Voir `AGENTS.md` pour le détail. Ne pas remonter le SDK sans revérifier ce point.

Alternative sans téléphone : `npx expo start --web` ouvre l'app dans le navigateur (rendu approximatif via React Native Web, utile pour vérifier vite, pas pour valider le rendu mobile final).

## Backend Supabase

- **Projet** : `afroback` (dashboard supabase.com), Postgres réel derrière.
- **Connexion côté app** : `.env` à la racine du projet (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`). La clé utilisée est la clé **publishable/anon**, faite pour être embarquée dans une app cliente (lecture seule, sécurisée par row level security) — ce n'est pas un secret à protéger comme un mot de passe.
- **Écriture** : aucune écriture ne passe par l'app (RLS n'autorise que la lecture pour le rôle `anon`). Les mises à jour de contenu passent par `supabase/seed.sql`, exécuté à la main dans le SQL Editor du dashboard Supabase.
- **Client** : `src/data/supabaseClient.ts`. Toute la logique de lecture est dans `src/data/heroesRepository.ts` (`getHeroes()`, `getHeroBySlug()`, `getRelatedHeroes()`) — c'est le seul fichier à toucher si la stratégie de données évolue (cache offline, pagination, etc.).

## Comment mettre à jour les données héros (nouveau récit ou récit modifié)

Les données ne s'éditent **jamais directement en base**. Le pipeline complet :

1. **Auto-extrait** (`scripts/build-heroes-data.mjs`, mécanique et fiable) : texte intégral du récit FR/EN, frise chronologique, sources, héros liés, chapitres du storyboard **avec le détail des 24 planches par chapitre** (texte à l'écran, voix off, cadrage, décor, ambiance, durée, transition — alimente `StoryboardSlideshow`) — lu directement dans `../../Récits africains/` et `../../Récits africains storyboards/`. Régénère `src/data/heroes.generated.json`.
2. **Curaté à la main** (`src/data/heroes.curated.ts`) : résumé catalogue, thème, citations avec leur statut d'attestation, légendes, avertissement de lecture. Volontairement **pas auto-extrait** : ces champs demandent un jugement éditorial (ex. distinguer une citation attestée d'une citation rapportée), qu'un parseur générique risquerait de mal classer. À éditer à la main pour un nouveau héros.
3. **Génération du SQL** (`scripts/generate-supabase-seed.mjs`) : fusionne les deux sources et produit `supabase/seed.sql`.
4. **Exécution manuelle** : copier `supabase/seed.sql` dans le SQL Editor du dashboard Supabase et l'exécuter (⚠️ le script fait un `truncate table` avant de réinsérer — il régénère l'intégralité de la table, pas un ajout incrémental).

```bash
node scripts/build-heroes-data.mjs
node scripts/export-heroes-json.mjs ./heroes-export.tmp.json
node scripts/generate-supabase-seed.mjs ./heroes-export.tmp.json supabase/seed.sql
rm heroes-export.tmp.json
```

## Pilier Découverte — contenu, backend et UI construits (2026-07-30)

> Périmètre validé par Yannick le 2026-07-30 (Cameroun uniquement, régions Bamoun/Foumban, Sawa/Douala, Bulu/Beti). UI codée le 2026-07-30 après que Yannick a débloqué la lecture de la maquette (voir "Comment la maquette a été lue" ci-dessous). Voir `data-model-decouverte.md` et `context/AFROBACK.md`.

- **Contenu produit** par l'agent `afroback-decouverte` : 10 fiches (village/coutume/objet/personnage) dans `livrables/sites-web/afroback/Découverte/[région]/[slug].md`, sourcées et croisées, chaque affirmation sensible étiquetée `atteste`/`tradition_orale`/`debattu`.
- **Backend Supabase** : `decouverte_items` + `decouverte_pays`, seed exécuté par Yannick, vérifié en direct via l'API REST.
- **Couche de données** : `src/data/decouverteTypes.ts`, `decouverteRepository.ts` (lecture seule), `useDecouverteData.ts` (hooks), `decouverteDisplay.ts` (libellés/icônes par type).
- **3 écrans, imbriqués dans la pile de l'onglet Découverte** (`app/(tabs)/decouverte/`, barre de navigation toujours visible, même pattern que `accueil/_layout.tsx`) :
  - `index.tsx` — liste, recherche, navigation par catégorie (village/coutume/objet/personnage), lien vers le hub pays.
  - `[slug].tsx` — fiche détail, un seul composant à 2 variantes d'en-tête (immersif pour village/objet, sobre pour coutume/personnage) plutôt que les 4 gabarits distincts de la maquette (VILLAGE/COUTUME/PERSON/FACT DETAIL) — le contenu réel a la même forme pour les 4 types, contrairement à ce que la maquette anticipait (galerie photo, carrousel de rois...) pour un contenu plus riche non produit.
  - `pays/[slug].tsx` — hub pays, simplifié à un seul pays (Cameroun), groupé par type.
- **Simplifications assumées** (documentées explicitement, pas de best-effort silencieux) :
  - La carte Afrique interactive (iframe `afroback-africa-map.html`) est remplacée par un vrai lien "Explorer le Cameroun" vers le hub pays.
  - La visite virtuelle des musées 360° garde l'état "bientôt disponible" que la maquette elle-même prévoyait déjà pour ce cas (aucun contenu produit).
  - Le hub pays n'a pas de section "Héros & histoire" ni "Mythologie" : les héros n'ont pas de champ `pays` dans leur modèle de données actuel, et il n'existe aucune donnée structurée pour la mythologie (seulement des récits texte hors base) — les construire aurait demandé de fabriquer une navigation vers du contenu non modélisé plutôt que d'étendre honnêtement ce qui existe.
  - Les affirmations `statut_fait_legende` (atteste/tradition_orale/debattu) sont affichées en liste non cliquable avec une étiquette de statut, plutôt que le carrousel photo cliquable "FACT DETAIL" de la maquette — aucune donnée de galerie n'a été produite pour ce contenu, un bouton qui ouvrirait un sous-écran vide aurait été un bouton mort.

## Pilier Communauté — schéma, backend et UI construits (2026-07-30)

> 3 décisions structurantes validées par Yannick le 2026-07-30 (modération, pseudonymat, séquencement) — voir `data-model-communaute.md` §4 et `specs-phase3-communaute.md`.

- **Contenu = UGC, pas éditorial** : `supabase/schema-communaute.sql` ne contient que le schéma (tables, vue, trigger, RLS), exécuté par Yannick, vérifié en direct via l'API REST.
- **Modération : post-modération + signalement.** Filtre automatique par table de termes bloqués (`community_banned_terms`, **livrée volontairement vide** — dresser une liste de termes haineux n'est pas un travail fait depuis ce workspace sans supervision éditoriale humaine directe ; tant qu'elle est vide, seuls le signalement et la revue manuelle de Yannick protègent réellement la communauté) déclenché par un trigger `before insert`, puis signalement + revue manuelle via le dashboard Supabase.
- **Pseudonymat structuré** : toute lecture publique passe par la vue `community_profiles_public`, jamais `user_id`.
- **Couche de données** : `src/data/communityTypes.ts`, `communityRepository.ts` (lecture + écriture UGC : profil, posts, commentaires, signalements — pas de cache, contenu dynamique), `useCommunityData.ts` (hooks fil + profil), `relativeTime.ts`.
- **6 écrans, imbriqués dans la pile de l'onglet Communauté** (`app/(tabs)/communaute/`, barre de navigation toujours visible) : `index.tsx` (fil), `post/[id].tsx` (détail + commentaires), `create.tsx` (création de post), `profil/[id].tsx` (profil membre public), `signaler.tsx` (signalement), `charte.tsx` (charte, contenu statique).
- **Création de profil intégrée au flux** : `src/components/CreateProfileForm.tsx` s'affiche avant toute publication/commentaire/signalement si le compte n'a pas encore de profil communautaire (pseudo + bio optionnelle) — un seul flux, pas d'aller-retour entre deux écrans.
- **Simplifications assumées** (documentées explicitement) :
  - **Pas de compteur ♥ (likes)** : aucun système de réaction dans le modèle de données V1 — mieux vaut l'omettre que d'afficher un faux "♥ 0". Le tri "Populaire" du fil utilise le nombre de commentaires comme proxy honnête d'engagement.
  - **Pas de badges de rôle** (ex. "GRIOT", "MODÉRATEUR" dans la maquette) ni de "pillarLabel" (post lié à un contenu Héros/Découverte) : aucune colonne dédiée dans le schéma, non fabriqués.
  - ~~Ajout de photo à un post non branché~~ **Résolu le 2026-07-31** : voir "Upload de photos" ci-dessous. L'avatar de profil est également branché (`CreateProfileForm.tsx` via `AvatarPicker`).
  - **Section "Lier un contenu" omise** de l'écran de création (aucune colonne de liaison post↔contenu dans le schéma actuel).
  - **Pas de bouton "Suivre"** dans le profil membre (aucun système d'abonnement entre membres) ; les 3 statistiques de gamification de la maquette (série de jours, récits lus, badges) sont remplacées par un seul indicateur réel : le nombre de posts publiés.
  - **Espace exclusif abonnés** (bouton ✦ du fil) affiche un "bientôt disponible" honnête — le pilier Abonnement n'est pas encore activé (paiement Mobile Money non intégré).

## Pilier Marketplace — infrastructure complète, catalogue vide (2026-07-31)

> Périmètre cadré par Yannick avant transmission au chef de projet : **Option A — infrastructure complète, états vides honnêtes**. Voir `data-model-marketplace.md` pour le détail des décisions. Contrairement à Découverte/Communauté, aucun vendeur ni produit n'est préchargé — ce serait inventer du contenu commercial.

- **Backend Supabase** : `marketplace_vendors` (+ vue publique `marketplace_vendors_public`), `marketplace_products` (statut `en_ligne`/`rupture` **synchronisé automatiquement par trigger sur le stock**), `marketplace_orders` (une ligne par vendeur, voir `data-model-marketplace.md` §2), `marketplace_reviews` (+ vue publique). **Aucune colonne de commission ni de palier d'abonnement vendeur** : ce n'est pas une donnée cosmétique, c'est une décision de modèle économique que Yannick n'a pas encore prise (voir `context/AFROBACK.md`, "Points bloquants").
- **Identité vendeur publique** (nom de boutique, région, artisanat), à la différence du pseudonymat de `community_profiles` — une boutique a besoin d'être identifiable.
- **Checkout honnête : jamais un faux succès de paiement.** Le paiement Mobile Money n'est pas intégré. La commande est réellement enregistrée (`statut = 'en_attente_paiement'`), mais le bouton dit "Enregistrer la commande" (pas "Payer maintenant") et l'écran de confirmation dit "Commande enregistrée" (pas "Commande confirmée ✅") avec une explication claire : le vendeur contacte l'acheteur pour finaliser le paiement et la livraison.
- **Panier en état local** (`src/marketplace/CartProvider.tsx`), pas en base : étape éphémère avant checkout, scopé au layout de l'onglet Marché pour ne toucher à aucun fichier partagé par les autres piliers déjà testés sur téléphone.
- **Couche de données** : `src/data/marketplaceTypes.ts`, `marketplaceRepository.ts`, `useMarketplaceData.ts`, `marketplaceDisplay.ts`.
- **7 écrans, imbriqués dans la pile de l'onglet Marché** (`app/(tabs)/marche/`) : `index.tsx` (catalogue, recherche, catégories), `[id].tsx` (fiche produit, avis, produits similaires, ajouter au panier), `artisan/[id].tsx` (profil artisan), `cart.tsx` (panier), `checkout.tsx` (commande), `commandes.tsx` (mes commandes acheteur — ajout non prévu explicitement dans l'extrait de maquette mais nécessaire pour que "Suivre ma commande" mène quelque part), `vendeur.tsx` (espace vendeur complet : tableau de bord/produits/commandes/avis/revenus, sous-navigation par chips comme dans la maquette, pas des routes séparées).
- **Un vendeur peut réellement s'inscrire et ajouter un produit** via `VendorProductEditorModal` (modal "VENDOR PRODUCT EDITOR" de la maquette) — fonctionnel de bout en bout, c'est ce qui permettra au premier vrai artisan de tester.
- **Simplifications assumées** (documentées explicitement) :
  - Pas de galerie photo multi-image (un seul `image_url` en base) — les points de pagination de la maquette, qui supposaient plusieurs photos, sont omis.
  - Pas de bouton "favori" (aucune table de liste de souhaits — un cœur qui ne persiste pas serait un faux favori).
  - Pas de badge de vérification vendeur (aucun processus de vérification à ce jour).
  - Pas de lien "Découvrir l'artisanat" depuis le profil artisan (contenu culturel non lié aux vendeurs dans le modèle de données).
  - ~~Ajout de photo (produit et éditeur vendeur) non branché~~ **Résolu le 2026-07-31** : voir "Upload de photos" ci-dessous. L'avatar de boutique est également branché (`CreateVendorForm.tsx` via `AvatarPicker`).
  - Frais de livraison affichés "à définir avec le vendeur" plutôt qu'un montant inventé (aucune grille tarifaire de transport définie).
  - Onglet "Revenus" de l'espace vendeur : affiche les commandes réelles enregistrées, jamais des revenus/versements fictifs. Onglet "Paliers" : état honnête "bientôt disponible", aucun taux de commission ni prix d'abonnement inventé.

## Upload de photos (2026-07-31)

> Yannick a testé l'app sur son téléphone et demandé que l'ajout de photo soit réellement fonctionnel, pas juste "bientôt disponible". Branché pour les 4 points de contact concernés.

- **Dépendance** : `expo-image-picker` (`npx expo install expo-image-picker`, compatible SDK 54). `expo-file-system` n'a **pas** été nécessaire : le picker renvoie directement l'image en base64 (`base64: true`), pas besoin de relire le fichier depuis le disque.
- **Bucket Supabase Storage `user-uploads`** (`supabase/schema-storage-user-uploads.sql`, **à exécuter par Yannick dans le SQL Editor** comme les autres scripts `schema-*.sql`), distinct de `heroes-media` : ce dernier est du contenu éditorial contrôlé (upload manuel par Yannick), `user-uploads` est écrit directement par n'importe quel utilisateur authentifié. RLS : lecture publique, écriture restreinte à son propre dossier (`{auth.uid()}/...`), via la fonction `storage.foldername()`.
- **Helper réutilisable** : `src/data/uploadImage.ts` (`pickAndUploadImage(folder, options)`) — demande la permission, ouvre la pellicule, upload vers `user-uploads/{uid}/{folder}/...`, retourne l'URL publique. Utilisé par 4 points de contact, tous désormais réellement fonctionnels :
  - Photo de post (Communauté, `create.tsx`)
  - Avatar de profil (Communauté, `CreateProfileForm.tsx`)
  - Photo de produit (Marketplace, `VendorProductEditorModal.tsx`)
  - Avatar de boutique (Marketplace, `CreateVendorForm.tsx`)
- **Composants UI partagés** : `src/components/PhotoPicker.tsx` (rectangulaire, avec aperçu + bouton retirer/changer, pour post/produit) et `src/components/AvatarPicker.tsx` (circulaire, cadrage carré forcé, pour profil/boutique).
- **Permissions natives** : `app.json` déclare le plugin `expo-image-picker` avec un message `photosPermission` (Info.plist iOS) — **sans effet réel tant que l'app tourne dans Expo Go** (Expo Go est un binaire pré-compilé, ses propres chaînes de permission génériques s'appliquent, pas celles du projet ; les nôtres ne prendront effet qu'au moment d'un vrai build natif). L'accès à la pellicule via Expo Go a néanmoins déjà été vérifié comme un cas standard, largement supporté.
- **Hors scope, laissé en l'état** : l'avatar du compte principal (onglet Profil, `app/(tabs)/profil.tsx`) n'a pas de champ `avatar_url` dans son modèle de données actuel (`user_metadata` Supabase Auth) — non touché pour ne pas modifier un fichier partagé par tous les piliers sans nécessité. Les photos jointes à un avis produit/commentaire (`image_url` existe dans `marketplace_reviews`) n'ont pas non plus d'UI d'upload — non demandé, à faire si besoin sur le même modèle.

## Comment la maquette a été lue (DesignSync indisponible dans cette session)

`DesignSync` n'a jamais été accessible dans les sessions ayant construit ces trois piliers, malgré plusieurs tentatives et un déblocage confirmé côté compte Yannick. Pour ne pas bloquer indéfiniment sur cet écart d'outillage, Yannick a lu lui-même les sections concernées de `AFROBACK Mobile.dc.html` dans une session où l'outil fonctionnait, et en a extrait le markup + styles inline + bindings d'origine, **verbatim, sans reformulation**, dans trois fichiers de référence lisibles directement :
- `app-mobile/design-reference-decouverte.dc.excerpt.html`
- `app-mobile/design-reference-communaute.dc.excerpt.html`
- `app-mobile/design-reference-marketplace.dc.excerpt.html`

Toutes les couleurs, polices et espacements utilisés dans les écrans ci-dessus viennent de ces extraits (recoupés avec `src/theme/tokens.ts`, complété le 2026-07-30 avec les tokens manquants : `surfaceCard`, `surfaceCardDeep`, `inputBg`, `overlayCaption`, `placeholderLabel`, `reportColor` — aucun nouveau token n'a été nécessaire pour Marketplace), pas d'une lecture directe de l'outil par cette session.

## Ce qui n'est PAS fait (à charge du pôle dev Madou Consulting)

- **Pas de vrai lecteur audio/vidéo** : aucun média n'est produit pour les 9 héros (voir `app-mobile/production-media/`). Les écrans `audio.tsx` / `video.tsx` sont prêts à recevoir `expo-av`/`expo-video` le jour où le média existe (voir le commentaire en tête de chaque fichier). Le champ `image_carte_catalogue` est vide pour les 9 héros (aucun visuel produit à ce jour).
- **Pas de build natif ni de publication sur les stores** (App Store / Google Play) — nécessite un Mac pour iOS, des comptes développeur payants, et n'est pas faisable depuis ce workspace Claude Code.
- **Pas de cache offline** : l'app doit interroger Supabase à chaque ouverture pour l'instant.
- **Pas de vrai paiement Mobile Money** (agrégateur type CamPay non choisi/intégré), **pas de mode enfant, pas de commission/abonnement vendeur configuré** — hors Phase 1, voir `context/AFROBACK.md` pour la feuille de route complète. Les 5 piliers ont désormais tous une UI réelle (Histoires & Héros, Découverte, Communauté, Marché) ou un catalogue fonctionnel vide (Marché).

## Structure

```
app/                        écrans (Expo Router, routing par fichiers)
  (tabs)/decouverte/         liste, fiche détail, hub pays (pile interne, tab bar visible)
  (tabs)/communaute/         fil, détail de post, création, profil membre, signalement, charte
  (tabs)/marche/             catalogue, fiche produit, profil artisan, panier, checkout, commandes, espace vendeur
src/
  components/                composants partagés (HeroCard, TimelineList, FactVsLegendCallout, DecouverteItemRow, FaitsList, PostCard, CreateProfileForm, ProductCard, AddToCartToast, PhotoPicker, AvatarPicker...)
  marketplace/                CartProvider, CreateVendorForm, VendorProductEditorModal (scopés au pilier Marketplace)
  data/
    types.ts                 types miroir du schéma Postgres (supabase/seed.sql)
    supabaseClient.ts         client Supabase (lecture seule, clé anon)
    heroesRepository.ts       fonctions de lecture consommées par l'UI (getHeroes, getHeroBySlug...)
    useHeroesData.ts           hooks React (chargement/erreur) autour du repository
    heroes.generated.json     auto-extrait par scripts/build-heroes-data.mjs — sert à générer le seed SQL, pas consommé par l'app à l'exécution
    heroes.curated.ts         champs éditoriaux — à éditer à la main
    decouverte.generated.json  auto-extrait par scripts/build-decouverte-data.mjs — pilier Découverte
    decouverteTypes.ts / decouverteRepository.ts / useDecouverteData.ts / decouverteDisplay.ts   couche de données Découverte (lecture seule)
    communityTypes.ts / communityRepository.ts / useCommunityData.ts / relativeTime.ts           couche de données Communauté (lecture + écriture UGC)
    marketplaceTypes.ts / marketplaceRepository.ts / useMarketplaceData.ts / marketplaceDisplay.ts   couche de données Marketplace (catalogue vide, lecture + écriture)
    uploadImage.ts             helper d'upload générique (bucket user-uploads), utilisé par Communauté et Marketplace
  theme/
    tokens.ts                 couleurs, typographie, spacing (design-system-mobile.md + design-reference-*.dc.excerpt.html)
    useAppFonts.ts             chargement Cinzel/Barlow
scripts/
  build-heroes-data.mjs        régénère heroes.generated.json depuis les récits du griot
  export-heroes-json.mjs       exporte le dataset fusionné (généré + curaté) en JSON
  generate-supabase-seed.mjs   génère supabase/seed.sql à partir de cet export
  build-decouverte-data.mjs    régénère decouverte.generated.json depuis livrables/.../Découverte/*.md
  generate-decouverte-seed.mjs génère supabase/seed-decouverte.sql à partir de decouverte.generated.json
supabase/
  seed.sql                     schéma + seed complet, exécuté dans Supabase (héros)
  seed-decouverte.sql          schéma + seed du pilier Découverte, exécuté par Yannick le 2026-07-30
  schema-communaute.sql        schéma du pilier Communauté (pas de seed, contenu UGC), exécuté par Yannick le 2026-07-30
  schema-marketplace.sql       schéma du pilier Marketplace (pas de seed, catalogue vide) — à exécuter par Yannick dans le SQL Editor Supabase
  schema-storage-user-uploads.sql   bucket Storage `user-uploads` + policies (photos post/produit, avatars) — à exécuter par Yannick dans le SQL Editor Supabase
```
