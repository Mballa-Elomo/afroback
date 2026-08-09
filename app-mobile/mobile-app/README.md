# AFROBACK Mobile — app native (Expo / React Native)

Application mobile AFROBACK, pilier **Histoires & Héros** (Phase 1). Construite le 2026-07-29 à partir des specs de `app-mobile/` (dossier parent) : `specs-phase1-histoires-heros.md`, `data-model-heros.md`, `design-system-mobile.md`.

## Ce qui est fait

- Projet **Expo (SDK 57) + TypeScript + Expo Router**, thème sombre uniquement.
- **Backend réel : Supabase (Postgres)**, projet `afroback` (ref `ygkyapryramhaskfbrrt`). Table `heros` créée et peuplée avec les 9 héros, lecture publique via row level security. Voir `supabase/seed.sql`.
- **UI refaite le 2026-07-29 pour être fidèle à la vraie maquette Claude Design** (`AFROBACK Mobile.dc.html`, projet `a6ac90b2-…`, lu directement via l'outil de design). La première version avait été construite par un agent sans accès à la maquette, qui avait inventé sa propre charte — corrigé : couleurs, typographies (Cinzel/Manrope/Space Mono), grille catalogue 2 colonnes avec tuiles image + badges, en-tête immersif de la fiche héros, lecteur avec lettrine et popover de réglages, lecteur audio avec portrait et forme d'onde, lecteur vidéo 16:9 — tout est recalé sur les styles inline exacts du prototype (`src/theme/tokens.ts`). Simplification assumée : le motif `repeating-linear-gradient` (rayures diagonales) de la maquette pour les images manquantes est approximé par un dégradé diagonal deux tons (React Native n'a pas d'équivalent direct sans dépendance supplémentaire) ; les libellés entre crochets du prototype (ex. `[ portrait · Nom ]`) sont des annotations de maquette, pas du texte produit, donc pas repris.
- 4 écrans de la Phase 1, avec les **vraies données** des 9 héros déjà écrits par le griot, chargées en direct depuis Supabase :
  - `app/index.tsx` — Catalogue héros (recherche, filtres thème/région)
  - `app/(tabs)/accueil/heros/[slug]/index.tsx` — Fiche héros (frise, citations avec statut d'attestation, légendes, héros liés, sources)
  - `app/(tabs)/accueil/heros/[slug]/recit.tsx` — Lecteur de récit **paginé par chapitre** (4 chapitres, FR/EN, taille de texte) — voir "Corrections de test (2026-07-31)"
  - `app/(tabs)/accueil/heros/[slug]/audio.tsx` et `.../video.tsx` — Lecteurs plein écran ; `video.tsx` affiche un vrai documentaire dès que `video_url` existe, sinon un **diaporama animé du storyboard** (`src/components/StoryboardSlideshow.tsx`) — 96 planches réelles (voix off, cadrage, transitions) par héros, jamais un texte inventé, plutôt qu'un simple "bientôt disponible"
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
4. **Vérification mécanique** (`scripts/verify-seed-sql.mjs`) : compare, pour chaque héros, le nombre de colonnes déclarées au nombre de valeurs fournies, et vérifie l'équilibre des guillemets/parenthèses sur tout le fichier — **à lancer systématiquement avant de coller quoi que ce soit dans le SQL Editor** (voir "Corrections de test (2026-07-31)", point 2bis : un vrai bug de ce type est passé inaperçu une fois).
5. **Exécution manuelle** : copier `supabase/seed.sql` dans le SQL Editor du dashboard Supabase et l'exécuter (⚠️ le script fait un `truncate table` avant de réinsérer — il régénère l'intégralité de la table, pas un ajout incrémental).

```bash
node scripts/build-heroes-data.mjs
node scripts/export-heroes-json.mjs ./heroes-export.tmp.json
node scripts/generate-supabase-seed.mjs ./heroes-export.tmp.json supabase/seed.sql
rm heroes-export.tmp.json
node scripts/verify-seed-sql.mjs
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

## Corrections de test (2026-07-31)

> 4 retours de Yannick après test réel sur téléphone, traités dans l'ordre de priorité donné.

**1. Bug — produit vendeur invisible dans `/marche` (cause réelle trouvée, pas de patch à l'aveugle).**
Vérifié empiriquement via l'API REST Supabase (clé anon) : `marketplace_products` était vide côté public alors qu'un produit existait bien. Cause : la policy RLS `"Read products public or own"` sur `marketplace_products` filtrait les vendeurs actifs via une sous-requête sur la table `marketplace_vendors` — table elle-même protégée par RLS (une seule policy, `user_id = auth.uid()`), donc cette sous-requête ne retournait jamais rien pour personne d'autre que le propriétaire de la boutique. Corrigé dans `supabase/schema-marketplace.sql` : la sous-requête cible maintenant `marketplace_vendors_public` (la vue, qui contourne RLS car exécutée avec les droits de son propriétaire). **⚠️ Yannick doit réexécuter `supabase/schema-marketplace.sql` dans le SQL Editor Supabase** pour que le correctif prenne effet (script idempotent, sans danger à rejouer).

**2. Contenu — lecteur de récit paginé par chapitre.**
`recit.tsx` affichait tout le récit en un seul scroll continu. Remplacé par une pagination à 4 chapitres (précédent/suivant, points de progression), calée sur les **vrais chapitres du storyboard vidéo** (mêmes titres) plutôt qu'une coupe arbitraire à volume de mots égal : chaque frontière de chapitre a été déterminée par lecture réelle des 9 récits, confrontée au titre et à la première planche de chaque chapitre du storyboard (voir `CHAPITRE_ANCHORS` dans `scripts/build-heroes-data.mjs`, avec le raisonnement documenté par héros). Nouveau champ généré `recit_chapitres_fr` / `recit_chapitres_en` (`{numero, titre, texte}[]`), ajouté à `heroes.generated.json`, au type `Heros` (`src/data/types.ts`) et à la table Supabase `heros` (2 nouvelles colonnes jsonb). **⚠️ Yannick doit réexécuter `supabase/seed.sql`** pour peupler ces colonnes (le script `truncate` + réinsère les 9 héros, sans danger). Mythologie n'a **pas** reçu le même traitement : ce pilier n'a aucun lecteur construit dans l'app (juste une bannière "bientôt disponible" sur l'écran Histoires & Héros) malgré le contenu déjà prêt côté griot (5 mythes + storyboards) — construire tout un pilier n'était pas dans le périmètre de ce correctif, à cadrer séparément.

**3. Navigation — barre d'onglets visible partout (annule une décision précédente).**
Cause confirmée : `app/heros/[slug]/*` (fiche, récit, audio, vidéo) étaient enregistrés comme `Stack.Screen` au niveau racine (`app/_layout.tsx`), en dehors du groupe `(tabs)` — ce qui masque nécessairement la barre. Déplacés dans `app/(tabs)/accueil/heros/[slug]/*`, nichés dans la pile de l'onglet Accueil (`accueil/_layout.tsx`), même pattern que `histoires-heros.tsx`. Tous les liens internes (`accueil/index.tsx`, `histoires-heros.tsx`, `RelatedHeroes.tsx`, et les écrans déplacés eux-mêmes) mis à jour vers `/accueil/heros/...`. Exception assumée : les lecteurs plein écran audio et vidéo masquent volontairement la barre (immersion), via une liste `ROUTES_SANS_BARRE` dans `src/components/BottomTabBar.tsx` (basée sur `getFocusedRouteNameFromRoute`) — la fiche héros et le récit, eux, la gardent visible. Audit fait sur les 3 autres piliers (Découverte, Communauté, Marché) : déjà tous correctement nichés dans `(tabs)`, aucune correction nécessaire là.

**2bis. Bug supplémentaire trouvé par Yannick à l'exécution du seed régénéré, corrigé.**
`supabase/seed.sql` régénéré pour le point 2 plantait dès le premier `insert` (`INSERT has more target columns than expressions`) : la liste de colonnes déclarait 31 champs mais le tuple de valeurs n'en fournissait que 27, `image_carte_catalogue`, `narration_audio_fr_url`, `narration_audio_en_url` et `video_url` manquant purement et simplement dans le tableau `values` de `scripts/generate-supabase-seed.mjs` — un bug préexistant (pas introduit par l'ajout des colonnes de chapitres, qui étaient elles correctement alignées), révélé seulement quand Yannick a tenté d'exécuter le script. Corrigé, puis vérifié **mécaniquement**, pas à l'œil : `scripts/verify-seed-sql.mjs` (nouveau, conservé dans le repo comme garde-fou permanent) tokenize chaque `insert` (conscient des guillemets SQL échappés `''`, de la profondeur des parenthèses/crochets `ARRAY[...]`) et confirme pour les 9 héros que le nombre de colonnes déclarées égale exactement le nombre de valeurs fournies, plus un contrôle d'équilibre global des guillemets/parenthèses sur tout le fichier. Validé en plus par un vrai parseur SQL indépendant (`node-sql-parser`, dialecte `postgresql`, installé temporairement hors du projet pour ce contrôle ponctuel) : les 9 `insert into public.heros (...)` parsent sans erreur.

```bash
node scripts/verify-seed-sql.mjs   # à relancer après toute régénération de supabase/seed.sql
```

**4. Ergonomie — bouton retour trop haut, cohérence globale.**
Cherché toutes les occurrences du bouton retour circulaire (‹) positionné en `absolute` au-dessus d'un en-tête qui bleed sous la status bar/encoche (`edges={['bottom']}` sans `'top'`) : `HeroHeader.tsx` (fiche héros), `marche/[id].tsx` (fiche produit), `marche/artisan/[id].tsx` (profil artisan), `decouverte/[slug].tsx` (fiche Découverte). Corrigé en calculant la position via `useSafeAreaInsets()` (`top: insets.top + 8`) plutôt qu'un `top: 12` fixe qui ne tenait pas compte de l'encoche. Un 5ᵉ cas différent trouvé : `communaute/post/[id].tsx` avait un en-tête en flux normal (pas de bleed d'image) mais `edges={['bottom']}` seul, sans raison d'immersion — simplement passé à `edges={['top', 'bottom']}`.

## Module Parent/Enfant (2026-07-31)

> Demande de Yannick, cadrage préalable fait avec le chef de projet avant transmission. Mécanique confirmée façon Netflix : **un seul compte** (téléphone + mot de passe existant), **plusieurs profils dedans** — un profil adulte + des profils enfants ajoutés depuis l'app. L'enfant ne se connecte jamais lui-même : pas de mot de passe séparé, pas de ligne `auth.users` dédiée, `auth.uid()` reste tout du long celui du parent — le changement de profil est un état purement côté app (`ActiveProfileProvider`), jamais une session Supabase distincte.

- **Pas de tarification par enfant en V1** (décision explicite de Yannick) : l'ajout d'un profil enfant est gratuit et sans friction de paiement, comme les commissions Marketplace laissées "pas encore configurées". L'écran d'ajout (`app/profils/ajouter.tsx`) reprend le formulaire de la maquette (`ONBOARDING · PROFILS ENFANTS`) mais **sans** le compteur "Enfants rattachés" ni le bouton "Continuer vers les forfaits" qui suivait dans la maquette.
- **Backend Supabase** : `supabase/schema-parent-enfant.sql` (à exécuter par Yannick dans le SQL Editor) — 3 tables, toutes scopées `parent_user_id = auth.uid()` :
  - `child_profiles` (prénom, âge, couleur d'avatar parmi 4 fixes — pas de photo uploadée pour un enfant, `langues_actives`, `decouverte_activee`, `limite_ecran_minutes`).
  - `parent_settings` (code PIN à 4 chiffres, voir plus bas).
  - `child_sessions` (suivi réel du temps passé, voir plus bas).
- **Couche de données** : `src/data/parentEnfantTypes.ts` + `parentEnfantRepository.ts` (lecture + écriture, pas de cache — données mutables propres à chaque parent, même choix que `communityRepository.ts`).

### ⚠️ Deux décisions provisoires, PAR DÉFAUT du chef de projet — Yannick n'a pas explicitement tranché ces deux points, à valider ou changer

1. **Code PIN à 4 chiffres** (`src/profils/PinGate.tsx`) — la maquette ne prévoit AUCUNE protection pour revenir au profil adulte ou entrer dans l'Espace Parent depuis un profil enfant. Choix par défaut : un code à 4 chiffres, défini par le parent au premier besoin (pas d'étape d'onboarding dédiée — `PinGate` bascule automatiquement en mode "créer un code" si `parent_settings.pin_code` est encore `null`), demandé uniquement pour (a) revenir au profil adulte depuis un profil enfant (bouton ↩ de l'accueil enfant), (b) entrer dans l'Espace Parent (depuis le sélecteur ou l'onglet Profil). **Jamais** demandé pour choisir un profil enfant depuis le sélecteur "Qui est-ce ?", ni pour aller de l'adulte vers le sélecteur ("Changer de profil"). Stocké en clair côté Supabase (RLS scopée au parent) : c'est un verrou anti-enfant local, pas un secret de sécurité informatique — voir le commentaire dans `schema-parent-enfant.sql`.
2. **Limite d'écran quotidienne — V1 informative seulement.** La maquette montre juste un réglage ("Limite d'écran quotidienne : Xh") dans l'Espace Parent, sans mécanisme d'application. Choix par défaut : le temps passé par session enfant est **réellement suivi** (table `child_sessions`, démarré/arrêté par `ActiveProfileProvider` à l'entrée/sortie du mode enfant) et affiché au parent (donnée réelle), la limite est réglable (stepper +/- 15 min dans l'Espace Parent), mais **l'app ne se verrouille jamais automatiquement** à la limite atteinte — cohérent avec le principe "jamais un mécanisme qui a l'air fonctionnel sans l'être" déjà appliqué ailleurs dans l'app, mais aussi pas de vrai blocage forcé faute de l'avoir jugé prioritaire pour cette V1.

### Navigation — sélecteur inséré sans casser le parcours existant

`ActiveProfileProvider` (`src/profils/ActiveProfileProvider.tsx`) décide de l'état `checking` / `selecting` / `adult` / `child` juste après authentification + onboarding terminés. **Règle clé : si le parent n'a AUCUN profil enfant, le statut passe directement à `adult` sans jamais montrer le sélecteur** — comportement strictement identique à avant ce chantier tant qu'aucun enfant n'est ajouté (Yannick, qui teste en direct, n'a rien vu changer tant qu'il n'ajoute pas de profil). `app/_layout.tsx` (Stack.Protected) et `app/index.tsx` ont été mis à jour pour router sur ce statut. En cas d'échec réseau ou si `schema-parent-enfant.sql` n'a pas encore été exécuté (table absente), le provider échoue silencieusement vers `adult` plutôt que de bloquer l'app.

- `app/profils/selection.tsx` — "Qui est-ce ?" (grille adulte + enfants + "+ ajouter"), fidèle à la maquette.
- `app/profils/ajouter.tsx` — ajout de profil enfant, répétable (reste accessible que ce soit depuis le sélecteur ou l'Espace Parent).
- `app/profils/parent.tsx` — Espace Parent (liste des enfants, stats réelles, réglages).
- `app/enfant/accueil.tsx`, `app/enfant/histoire.tsx`, `app/enfant/carnet/index.tsx`, `app/enfant/carnet/[slug].tsx` — mode enfant plein écran, tab bar masquée (même exception que les lecteurs audio/vidéo, voir "Corrections de test (2026-07-31)" point 3).
- Exception assumée à la règle "tab bar visible partout" (point 3 des corrections de test) : tout le groupe `profils/*` et `enfant/*` reste **hors** de `(tabs)`, sans barre du bas — traité comme les écrans d'onboarding et les lecteurs plein écran (mode/sécurité, pas de la navigation de contenu ordinaire). `app/(tabs)/profil.tsx` reçoit deux nouvelles entrées ("Espace Parent", PIN-gated ; "Changer de profil", visible seulement si au moins un enfant existe) comme point d'entrée depuis les onglets normaux.

### Contenu de l'accueil enfant — traitement honnête carte par carte

La maquette (`KID HOME`) montrait un "Jeu du jour", "Apprendre l'ewondo" et une carte "Histoire : Mansa Moussa". **Mansa Moussa ne fait pas partie des 9 héros réels du catalogue** (Reine Nzinga, Martin Paul Samba, Rudolf Douala Manga Bell, Sultan Njoya, Ruben Um Nyobè, Charles Atangana, Félix Moumié, Ernest Ouandié, Manu Dibango) — c'est un contenu de maquette, jamais construit tel quel.

- **"Jeu du jour" et "Apprendre une langue"** : aucun jeu ni leçon réel n'existe (le pilier langues camerounaises est bloqué, traductions insuffisantes — voir `context/AFROBACK.md`). État honnête "bientôt disponible" (`Alert.alert`), jamais un jeu/leçon simulé.
- **"Histoire du jour"** (`app/enfant/histoire.tsx`) : pioche un **vrai héros** du catalogue, choix déterministe par jour de l'année (`src/profils/heroDuJour.ts`, tourne chaque jour, pas de tirage aléatoire). Traitement **volontairement simplifié**, décision éditoriale du chef de projet : n'ouvre **pas** le récit intégral du griot ni les lecteurs audio/vidéo adultes. Les 9 récits réels contiennent des passages historiquement intenses (exécutions, empoisonnement, violence coloniale, traite négrière pour Reine Nzinga) qui ne sont rédigés pour aucun public enfant à ce jour — aucune version adaptée n'existe. L'écran enfant affiche donc seulement portrait, époque/région et le résumé déjà curaté (`resume_catalogue`, le même texte que la vignette du catalogue adulte), avec une invitation à lire l'histoire complète avec un parent plutôt qu'un lien direct. **Si Yannick veut une vraie version adaptée aux enfants des 9 récits, c'est un chantier de contenu à part (probablement via l'agent griot), pas fait ici.**
- **"Carnet d'explorateur"** (`app/enfant/carnet/`) : vrai contenu, les 10 fiches Découverte déjà en base, réutilise directement `DecouverteItemRow`/`FaitsList`/`SourcesList` — ce contenu (villages, coutumes, objets, rôles traditionnels génériques) est déjà neutre et adapté à un jeune public, contrairement aux récits de héros. Visible seulement si le parent a laissé "Découverte activée" sur ce profil (réglage Espace Parent, réel).
- **Écran "KID LESSON / SESSION END" de la maquette non construit** : il affichait un faux résultat de leçon ("Bravo, tu as appris 6 nouveaux mots aujourd'hui", étoiles, badges) alors qu'aucune leçon réelle n'existe derrière — l'aurait construit tel quel aurait été un mécanisme qui a l'air fonctionnel sans l'être. Le retour au sélecteur se fait directement depuis l'accueil enfant (bouton ↩, protégé par PIN), sans écran de célébration intermédiaire.

### Limite connue — sessions non closes si l'app est tuée brutalement

`child_sessions` est ouverte à l'entrée en mode enfant et close (avec la durée calculée côté client) à la sortie via le bouton retour. Si l'app est fermée brutalement (kill du process) pendant une session enfant, cette session reste "ouverte" (`ended_at`/`duree_secondes` restent `null`) et n'est simplement pas comptée dans les stats du jour de l'Espace Parent — pas de tâche de fond pour la fiabiliser en V1, documenté comme simplification assumée plutôt que corrigé silencieusement.

## Module Don (2026-08-05)

> Yannick a fait maquetter ce module puis, lors du cadrage, tranché pour une version **volontairement simplifiée** par rapport à `prompt-claude-design-don.md` (11 écrans) et même par rapport aux 3 écrans réellement présents dans la maquette (`design-reference-don.dc.excerpt.html`). Détail des 2 décisions structurantes (le don comme 4ᵉ levier économique, périmètre) dans `context/AFROBACK.md`.

- **Une seule cause générique "Soutenir AFROBACK"**, pas de liste de causes par héros/histoire. Conséquence directe : pas de Hub à choisir parmi plusieurs cartes (écran 2 de la maquette, retiré), pas de filtre par catégorie. Les deux points d'entrée (bannière accueil, menu Profil → "Faire un don") mènent **directement** à l'écran mission (`app/don/index.tsx`).
- **Retiré par rapport à la maquette, sur demande explicite de Yannick** : le compteur "montant collecté / donateurs / causes financées" (Yannick : *"AFROBACK est un vrai projet"*, pas de chiffre affiché tant qu'il n'est pas réel) et la section "derniers donateurs" (aucun donateur réel à ce jour, une liste vide aurait été un état à gérer pour rien vu qu'il n'y a qu'une seule cause).
- **Flux réel** : `app/don/index.tsx` (mission, sans compteur ni donateurs) → `app/don/montant.tsx` (montant prédéfini/libre, ponctuel ou mensuel, anonyme ou non, mode de paiement Mobile Money, récapitulatif, confirmation). Même règle que le checkout Marketplace : **jamais un faux succès de paiement** — le don est enregistré (`statut = 'en_attente_paiement'`), le bouton dit "Confirmer mon don" (pas "Payer"), l'écran de remerciement explique que Yannick contactera le donateur pour le règlement.
- **Backend** : `supabase/schema-don.sql` — une seule table `dons` (pas de table `dons_causes` séparée, une colonne `cause` texte à valeur constante pour l'instant : ne pas sur-construire pour une seule cause). RLS : le donateur ne voit/crée que ses propres dons ; aucune policy update/delete (un don enregistré n'est modifiable par personne depuis l'app). **Pas encore exécuté par Yannick.**
- **Volontairement absent, questions ouvertes non résolues par ce chantier** (voir `context/AFROBACK.md`) : reçu fiscal (statut juridique d'AFROBACK non tranché), objectif chiffré par cause (plus de jauge puisqu'il n'y a plus de compteur), politique de gestion de l'argent collecté.
- **Écrans non construits** (absents de la maquette réelle, voir extrait) : mode de paiement séparé, récap avant validation en écran dédié, "Mes dons" dans le Profil, reçu téléchargeable, widget compteur réutilisable, suivi admin des causes.

## Module École des Héros (2026-08-05)

> Yannick a validé d'étendre l'architecture à plusieurs/tous les héros plutôt que de rester sur un pilote à 1 seul héros (Sultan Njoya), comme recommandé initialement par le chef de projet. Règle inchangée : **aucun contenu inventé**. Détail du cadrage dans `context/AFROBACK.md` et `app-mobile/data-model-ecole-heros.md`.

- **Remplace la carte "Jeu du jour"** de l'accueil enfant (`app/enfant/accueil.tsx`), qui était un état "bientôt disponible" sans rien derrière. "Apprendre une langue" reste "bientôt disponible" (pilier langues toujours bloqué, ne pas confondre les deux chantiers).
- **6 écrans**, fidèles dans l'esprit à `design-reference-ecole-heros.dc.excerpt.html` (la maquette réelle n'a que 6 des 11 écrans du prompt de cadrage — pas d'écran explicatif de première visite, pas d'ajouts Espace Parent) :
  - `app/enfant/ecole/index.tsx` — carte du niveau (sentier de héros + grand quiz de fin de niveau)
  - `app/enfant/ecole/lecon/[id].tsx` — fiche leçon, 4 formats (Lire/Écouter/Regarder/BD)
  - `app/enfant/ecole/quiz/[leconId].tsx` — quiz (leçon **et** fin de niveau, `leconId="final"` + query param `niveau` pour le second cas)
  - `app/enfant/ecole/resultat.tsx` — résultat de quiz (score, étoiles, revoir/continuer)
  - `app/enfant/ecole/niveau-suivant.tsx` — passage de niveau (silhouettes non révélées, comme la maquette)
  - `app/enfant/ecole/collection.tsx` — tous les héros du module, débloqués ou non
- **Backend** : `supabase/schema-ecole-heros.sql` — 7 tables (`ecole_niveaux`, `ecole_lecons`, `ecole_quiz_questions`, `ecole_quiz_niveau`, `enfant_ecole_progression`, `enfant_lecon_resultats`, `enfant_quiz_niveau_resultats`). **Structure insérée mais aucun contenu** : les 4 niveaux (noms/tranches d'âge, repris du prompt de design de Yannick) et le rattachement de chacun des 9 héros réels à un niveau (mapping proposé par Yannick dans ce même prompt) sont peuplés, mais `texte_adapte`, `narration_audio_url`, `video_url`, `bd_planches` restent NULL/vides sur les 9 lignes, et aucune question de quiz n'existe. **Pas encore exécuté par Yannick.**
- **Conséquence honnête et attendue tant qu'aucun contenu réel n'est produit** : la fiche leçon affiche un état "pas encore prêt" sur chaque format (jamais le récit adulte réutilisé tel quel), le quiz affiche "Quiz pas encore prêt" tant qu'aucune question n'existe pour la leçon, et la progression reste bloquée au premier héros du niveau puisqu'aucun quiz ne peut être réussi. Ce n'est pas un bug : c'est la structure du pilier, prête à s'activer leçon par leçon dès qu'un vrai contenu est produit (texte réécrit, narration dédiée enfant, vidéo adaptée, BD dessinée — voir `data-model-ecole-heros.md` pour l'ampleur du chantier de contenu, largement plus lourd que le code lui-même).
- **Seuil de réussite du quiz : 60 % de bonnes réponses.** Choix par défaut du chef de projet (`PASS_RATIO` dans `app/enfant/ecole/quiz/[leconId].tsx`), pas une décision produit tranchée par Yannick — trivial à ajuster.
- **Un héros peut apparaître à plusieurs niveaux** (ex. Sultan Njoya niveau 1 *et* niveau 2, "approfondi" comme le prévoit le prompt de Yannick) : chaque couple (héros, niveau) est une leçon distincte ; l'écran Collection regroupe par héros (débloqué dès qu'une de ses leçons est terminée).

## Pilier Mythologie (2026-08-05)

> 5 récits mythologiques déjà écrits par l'agent griot (`Récits africains/mythe-*.md`), jamais branchés à l'app jusqu'ici. Détail complet du modèle de données dans `app-mobile/data-model-mythologie.md`.

- **Vérification faite avant de coder** : Yannick pensait avoir "déjà mis les histoires et les images". Les 5 récits texte existent bien, mais **aucune image ni narration audio n'a été retrouvée** pour ce pilier (recherché dans `app-mobile/` et `context/import/`) — `image_url`/`narration_audio_url` restent `null` pour les 5 mythes, état "bientôt disponible" comme partout ailleurs sur ce projet quand un média manque.
- **Pipeline de données plus simple que celui des héros** : un seul script mécanique (`scripts/build-mythologie-data.mjs`) extrait les champs de la fiche structurée de chaque `.md` et découpe le récit en 4 chapitres, avec des titres repris verbatim des vrais storyboards (`## Chapitre N/4 — ...`) et un regroupement de paragraphes fixé à la main par mythe (`MYTHES_CONFIG`, comme `CHAPITRE_ANCHORS` pour les héros) — 5 éléments seulement, pas besoin d'une couche curatée séparée. `scripts/generate-mythologie-seed.mjs` génère `supabase/schema-mythologie.sql`.
- **Backend** : table unique `mythes` (pas de table séparée par chapitre/source), RLS lecture publique comme `heros`/`decouverte_items`. Pas de `recit_chapitres_en` (aucune traduction n'existe) ni de champ "citations" (les 5 fiches indiquent explicitement qu'aucune citation individuelle attribuable n'existe pour ces récits collectifs). **Pas encore exécuté par Yannick.**
- **2 écrans**, nichés dans la pile de l'onglet Accueil comme les héros (`app/(tabs)/accueil/mythologie/`) : liste groupée par zone avec recherche (`index.tsx`), détail 3 onglets Lire/Écouter/BD (`[slug].tsx`).
  - **BD (`openBd`)** : aucun composant de lecteur BD identifié dans la maquette complète (`design-reference-mythologie.dc.excerpt.html` le signale explicitement) — traité en "bientôt disponible", même situation que le format BD de l'École des Héros.
  - **Écouter** : vrai lecteur `expo-audio` déjà câblé (même pattern que le lecteur audio héros), affiche "bientôt disponible" tant qu'aucune narration n'existe.
  - **Sources** affichées uniquement en fin de lecture et uniquement si le mythe en a — jamais une source inventée.
- **Points d'entrée câblés** : nouvelle bannière "Découvrir la mythologie africaine" sur l'accueil adulte (sur le modèle de la bannière Don déjà existante), et la bannière "Mythologie africaine" déjà présente dans le catalogue Histoires & Héros (menait à un "bientôt disponible" depuis le 2026-07-30) rebranchée vers le vrai écran.

## Rafraîchissement automatique depuis le back-office (2026-08-06)

> Demande de Yannick après test du Lot 1 du back-office : que l'app se mette à jour toute seule sur son téléphone quand il fait une action côté back-office (ex. dépublier un héros, le mettre à la une), sans fermer/rouvrir l'app ni tirer pour rafraîchir.

- **Décision : refetch au focus d'écran (`useFocusEffect`), pas d'abonnement Supabase Realtime.** Un outil à un seul éditeur (Yannick, back-office) qui modifie rarement le catalogue ne justifie pas la complexité d'un canal websocket (connexion/reconnexion, nettoyage à la fermeture d'écran, activation de la réplication Realtime côté Supabase pour un gain réel limité). `useFocusEffect` est déjà le pattern utilisé ailleurs dans l'app (ex. progression de lecture sur l'accueil).
- **Implémenté dans la couche de données existante**, aucun nouvel écran :
  - `src/data/heroesRepository.ts` — nouvelle fonction `refreshHeroes()` : fait un vrai aller-retour Supabase (ignore le cache mémoire) et remet à jour le cache. `getHeroes()` reste inchangée (sert au tout premier chargement, cache-aware).
  - `src/data/useHeroesData.ts` — `useHeroesList()` réécrit : à chaque focus de l'écran, appelle `getHeroes()` au tout premier chargement puis `refreshHeroes()` à chaque focus suivant. Pattern **stale-while-revalidate** : le premier chargement affiche un état de chargement, les rafraîchissements suivants se font en silence derrière les données déjà affichées (jamais de flash), et un échec de rafraîchissement en arrière-plan (réseau coupé pile au moment du focus) ne remplace jamais un catalogue déjà affiché par un écran d'erreur — seul un tout premier chargement raté affiche une erreur.
  - `useHero(slug)` et `useRelatedHeroes()` **non touchés** (fiche détail d'un héros précis, hors périmètre de cette demande).
- **Effet concret** : le catalogue héros (`histoires-heros.tsx`) et l'accueil (héros du jour / pour toi, `accueil/index.tsx`) se mettent à jour dès que Yannick revient sur l'écran (retour d'un autre onglet, réouverture de l'app) — 6 écrans consomment `useHeroesList()` au total, tous concernés automatiquement puisque c'est le même hook partagé.
- **Limite assumée et documentée** (commentaire en tête de `useHeroesList` dans le code) : si Yannick reste les yeux rivés sur un écran sans jamais changer d'onglet ni rouvrir l'app, un changement fait entre-temps dans le back-office n'apparaît pas tout seul avant le prochain focus. Acceptable pour un outil interne à faible fréquence d'édition ; à reconsidérer (option Realtime) seulement si ça devient gênant en usage réel.
- **Vérifié** : `npx tsc --noEmit` propre, `npx expo-doctor` (18/18), `npx expo export --platform ios` et `--platform android` propres. Pas de nouvelle route ajoutée donc pas de régénération des types de routing nécessaire.

## Statistiques d'engagement réelles (2026-08-06)

> Demande de Yannick : de vraies statistiques de lecture/écoute/visionnage, exactement ce que la règle "jamais un faux chiffre" excluait jusqu'ici (le panneau "ENGAGEMENT GLOBAL" de la maquette back-office n'avait jamais été construit faute de vraie donnée). Maintenant que Yannick veut le vrai chiffre plutôt qu'aucun chiffre, les deux bouts sont construits : l'app mobile enregistre, le back-office affiche (voir `backoffice/README.md`).

- **Déclencheur retenu : ouverture de l'écran, pas un seuil arbitraire.** Compter dès l'arrivée sur l'écran est le choix le plus simple et le plus honnête à assumer : un seuil (ex. "après 30 secondes" ou "après le premier chapitre") aurait fallu l'inventer sans donnée pour le justifier, ce qui contredit l'esprit du projet autant qu'un chiffre gonflé. Un événement par ouverture d'écran, jamais plus (voir la garde `engagementLoggedRef` dans chaque écran, qui empêche un double comptage si le composant se re-rend).
- **Mais jamais compté sur un état "bientôt disponible".** Ouvrir l'écran ne suffit pas : `audio.tsx` ne compte une écoute que si une vraie narration existe (`narration_audio_fr_url`/`_en_url`), sinon l'écran ne montre qu'une forme d'onde décorative et un bandeau "en cours de production" — compter ça serait aussi malhonnête qu'un chiffre inventé. Même logique pour `video.tsx` : compté dès qu'il y a un vrai documentaire (unique ou par chapitre) **ou** le diaporama animé du storyboard (contenu réel, pas un texte inventé — voir plus haut), mais jamais sur le placeholder statique "DOCUMENTAIRE BIENTÔT DISPONIBLE" sans aucun storyboard derrière. `recit.tsx` n'a pas cette garde : un récit existe pour les 9 héros, pas d'état vide possible.
- **Backend** : `supabase/schema-engagement.sql` (nouveau) — table `hero_engagement` (une ligne par héros, 3 compteurs : `lectures_recit`, `ecoutes_audio`, `visionnages_video`) et fonction `increment_hero_engagement(hero_id, event)` en écriture atomique (`SECURITY DEFINER`, upsert), appelable par le rôle `anon` sans policy RLS d'écriture directe sur la table. Choisi plutôt que le pattern "select puis update" déjà utilisé pour `marketplace_products.vues` : ici 3 compteurs partagent la même ligne par héros, un simple select+update aurait pu perdre un incrément en cas d'écritures concurrentes sur deux compteurs différents du même héros. **Anonyme par construction** : total cumulé par héros, pas de tracking par utilisateur individuel (aucun compte n'est requis pour lire un héros dans l'app aujourd'hui) — pas de RGPD à gérer en plus. **Exécuté par Yannick, confirmé le 2026-08-06.**
- **Couche de données** : `src/data/engagementRepository.ts` (`recordHeroEngagement(heroId, event)`) — appelle la fonction RPC, best-effort (erreur avalée silencieusement, comme `logActivity` côté back-office) : une stat manquée ne doit jamais interrompre une lecture/écoute/visionnage en cours.
- **3 écrans instrumentés** : `recit.tsx`, `audio.tsx`, `video.tsx` (`app/(tabs)/accueil/heros/[slug]/`), chacun avec un `useEffect` gaté par un ref (`engagementLoggedRef`) pour ne déclencher qu'un seul événement par montage d'écran.
- **Vérifié** : `npx tsc --noEmit` propre, `npx expo-doctor` (18/18), `npx expo export --platform ios` et `--platform android` propres.

## Statistiques d'engagement détaillées par média (2026-08-06, après-midi)

> Yannick veut plus fin que le total agrégé du matin : le nombre d'écoutes de l'Audio FR séparé de l'Audio EN, et pour la vidéo, un compteur par chapitre **et** par langue — pour savoir quel chapitre est le plus regardé, quel audio le plus écouté.

- **Récit : pas de changement.** Vérifié dans `recit.tsx` avant de coder quoi que ce soit : le choix FR/EN y est un réglage d'affichage après l'ouverture de l'écran (popover de réglages), pas un événement déclenché avec une langue précise au moment du montage — `lectures_recit` reste un seul compteur par héros, comme ce matin.
- **Audio : distinction FR/EN, déplacée dans `AudioPlayerBlock`.** L'ancien effet du parent (`LecteurAudioScreen`, event générique `'audio'`) est retiré ; `AudioPlayerBlock` (qui connaît la vraie langue jouée) enregistre maintenant l'événement lui-même. Point important trouvé en relisant le code avant de brancher l'événement : le réglage `lang` du bouton FR/EN ne reflète pas toujours le fichier réellement joué (si une seule langue existe, le lecteur bascule dessus automatiquement même si `lang` affiche encore 'fr' par défaut) — un `actualLang` est recalculé avec exactement la même logique de repli que `uri`, pour ne jamais compter la mauvaise langue. Un événement par langue réellement chargée pendant la visite (`loggedLangsRef`, une `Set`) : basculer FR→EN pendant la même visite compte les deux, comme deux écoutes distinctes de deux fichiers différents, mais jamais deux fois la même langue.
- **Vidéo : chapitre + langue, uniquement pour les chapitres réellement produits.** `VideoChapitrePlayerArea` (le lecteur d'un chapitre réellement tourné, dans `video.tsx`) enregistre un événement détaillé par `(chapitre, langue réellement jouée)` — même calcul d'`actualLang` que pour l'audio. **Ce détail ne concerne PAS** le documentaire unique legacy (`hasLegacyVideo`, pas de notion de chapitre/langue dans ce modèle) ni le diaporama de storyboard (pas de piste audio séparée par langue) : ces deux cas continuent d'alimenter uniquement le total agrégé `visionnages_video` (event générique `'video'`, inchangé depuis ce matin). Le composant reste monté d'un chapitre à l'autre (`chapterIdx` change juste la prop, pas de remontage), donc le garde-fou est une `Set` de clés `"numero-langue"`, pas un simple booléen — sinon changer de chapitre après en avoir déjà vu un autre ne relogerait plus jamais rien.
- **Backend** : `supabase/schema-engagement-detail.sql` (nouveau, **dépend de `schema-engagement.sql`**) — ajoute `ecoutes_audio_fr`/`ecoutes_audio_en` à `hero_engagement`, crée `hero_video_chapter_engagement` (clé `hero_id, chapitre_numero, langue`, cardinalité variable plutôt que des colonnes fixes — cohérent avec la façon dont `video_chapitres` est déjà modélisé en jsonb côté `heros`). Deux nouvelles fonctions atomiques `increment_audio_engagement`/`increment_video_chapter_engagement`, même pattern que ce matin (`SECURITY DEFINER`, upsert, écriture anonyme). **Relation avec les totaux** : `ecoutes_audio = ecoutes_audio_fr + ecoutes_audio_en` toujours (un seul chemin d'enregistrement possible) ; `visionnages_video` n'est PAS la somme des lignes de détail (l'agrégat compte aussi le documentaire unique et le storyboard, qui n'ont pas de ligne de détail) — différence attendue, pas un bug de calcul, documentée dans le fichier SQL. **Exécuté par Yannick, confirmé le 2026-08-06**, après `schema-engagement.sql` (ordre respecté).
- **Couche de données** : `src/data/engagementRepository.ts` — `EngagementEvent` réduit à `'recit' | 'video'` (`'audio'` retiré : plus aucun appel générique pour l'audio, pour qu'aucun futur code ne reparte par erreur sur l'ancien chemin non détaillé). Nouvelles fonctions `recordAudioEngagement(heroId, langue)` et `recordVideoChapterEngagement(heroId, chapitre, langue)`, même best-effort (erreur avalée silencieusement) que `recordHeroEngagement`.
- **Vérifié** : `npx tsc --noEmit` propre, `npx expo-doctor` (18/18), `npx expo export --platform ios` et `--platform android` propres.

## Martin Paul Samba converti au système `video_chapitres` (2026-08-06)

> Yannick voulait retirer le slot "Vidéo (documentaire unique)" du back-office. Vérification faite avant toute suppression : Martin Paul Samba était le seul héros encore rattaché à `video_url` (`video_chapitres` vide). Le coordinateur a confirmé côté Storage que ce fichier (183 Mo, jamais uploadé avec succès — voir "Ce qui n'est PAS fait" et `context/AFROBACK.md`, point bloquant depuis le 2026-07-29) répond en 404, et qu'aucun fichier vidéo source n'existe pour Samba dans le dossier local de Yannick. **Décision de Yannick : convertir Samba au système chapitres.**

- **`src/data/heroes.media.ts`** : `video_url` de Martin Paul Samba retiré — un lien mort (404 confirmé) est pire qu'un champ vide honnête. Pas de `video_chapitres` ajouté à la place, faute de vraie vidéo à brancher pour l'instant : conversion purement structurelle. Samba rejoint le groupe des héros sans vidéo produite (Charles Atangana, Ernest Ouandié, Manu Dibango, Sultan Njoya, Félix Moumié) — l'app retombe naturellement sur le diaporama animé du storyboard (`StoryboardSlideshow`, contenu réel, jamais un texte inventé), pas sur un lien cassé.
- **Pipeline régénéré** : `build-heroes-data.mjs` → `export-heroes-json.mjs` → `generate-supabase-seed.mjs` → `verify-seed-sql.mjs`, tous propres (9/9 héros, colonnes/valeurs équilibrées). `supabase/seed.sql` mis à jour : `video_url` de Samba passe de l'URL morte à `null`, `statut_video` de `'pret'` à `'storyboard_pret'` (reflète honnêtement l'absence de vidéo réelle). **⚠️ Yannick doit réexécuter `supabase/seed.sql`** pour que ce retrait prenne effet en base (script idempotent, comme d'habitude — truncate puis réinsertion des 9 héros).
- **Production réelle de la vidéo de Samba** : toujours un point bloquant séparé et ouvert (183 Mo, limite du plan Supabase gratuit ~50 Mo — upgrade de plan / compression / diaporama animé comme solution durable, aucune option tranchée). Ce chantier retire juste le lien mort en attendant, ne résout pas la production.
- **Back-office** : le slot "Vidéo (documentaire unique)" est retiré de la fiche héros (voir `backoffice/README.md`) — Samba étant converti, plus aucun héros ne dépend de `video_url` via l'UI back-office.
- **Vérifié** : `npx tsc --noEmit` propre, `npx expo-doctor` (18/18), `npx expo export --platform ios` et `--platform android` propres.

## Comment la maquette a été lue (DesignSync indisponible dans cette session)

`DesignSync` n'a jamais été accessible dans les sessions ayant construit ces six chantiers (Découverte, Communauté, Marketplace, Don, École des Héros, Mythologie), malgré plusieurs tentatives et un déblocage confirmé côté compte Yannick. Pour ne pas bloquer indéfiniment sur cet écart d'outillage, Yannick a lu lui-même les sections concernées de `AFROBACK Mobile.dc.html` dans une session où l'outil fonctionnait, et en a extrait le markup + styles inline + bindings d'origine, **verbatim, sans reformulation**, dans des fichiers de référence lisibles directement :
- `app-mobile/design-reference-decouverte.dc.excerpt.html`
- `app-mobile/design-reference-communaute.dc.excerpt.html`
- `app-mobile/design-reference-marketplace.dc.excerpt.html`
- `app-mobile/design-reference-don.dc.excerpt.html`
- `app-mobile/design-reference-ecole-heros.dc.excerpt.html`
- `app-mobile/design-reference-mythologie.dc.excerpt.html`

Toutes les couleurs, polices et espacements utilisés dans les écrans ci-dessus viennent de ces extraits (recoupés avec `src/theme/tokens.ts`, complété le 2026-07-30 avec les tokens manquants : `surfaceCard`, `surfaceCardDeep`, `inputBg`, `overlayCaption`, `placeholderLabel`, `reportColor` — aucun nouveau token n'a été nécessaire pour Marketplace), pas d'une lecture directe de l'outil par cette session.

## Ce qui n'est PAS fait (à charge du pôle dev Madou Consulting)

- **Pas de vrai lecteur audio/vidéo** : aucun média n'est produit pour les 9 héros (voir `app-mobile/production-media/`). Les écrans `audio.tsx` / `video.tsx` sont prêts à recevoir `expo-av`/`expo-video` le jour où le média existe (voir le commentaire en tête de chaque fichier). Le champ `image_carte_catalogue` est vide pour les 9 héros (aucun visuel produit à ce jour).
- **Pas de build natif ni de publication sur les stores** (App Store / Google Play) — nécessite un Mac pour iOS, des comptes développeur payants, et n'est pas faisable depuis ce workspace Claude Code.
- **Pas de cache offline** : l'app doit interroger Supabase à chaque ouverture pour l'instant.
- **Pas de vrai paiement Mobile Money** (agrégateur type CamPay non choisi/intégré) : ni pour le checkout Marketplace, ni pour le module Don, **pas de commission/abonnement vendeur configuré** — hors Phase 1, voir `context/AFROBACK.md` pour la feuille de route complète. Les 5 piliers de contenu ont désormais tous une UI réelle (Histoires & Héros, Découverte, Communauté, Marché) ou un catalogue fonctionnel vide (Marché).
- **Aucun contenu réel pour le module École des Héros** : la structure (4 niveaux, 9 héros rattachés) est en base, mais aucune leçon (texte adapté, narration enfant, vidéo, BD) ni aucune question de quiz n'existe à ce jour — c'est un chantier de production de contenu à part entière, voir `app-mobile/data-model-ecole-heros.md`.
- **Images du pilier Mythologie retrouvées le 2026-08-05** dans le dossier local "AFROBACK CONTENT/Photos" de Yannick (fichiers nommés d'après le titre du mythe) : copiées et renommées par slug dans un sous-dossier `mythologie-renamed`, référencées dans `scripts/build-mythologie-data.mjs` (`MYTHES_MEDIA`) et `supabase/schema-mythologie.sql` (`image_url`), sur le modèle de `HEROES_MEDIA`/`DECOUVERTE_MEDIA`. **Pas encore uploadées côté Supabase Storage** (upload manuel par Yannick, comme héros/découverte) : les URLs générées ne répondront qu'une fois l'upload fait dans `heroes-media/images/mythologie/`. Toujours aucune narration audio retrouvée (`narration_audio_url` reste `null`), et pas de lecteur BD (aucun composant identifié dans la maquette).

## Structure

```
app/                        écrans (Expo Router, routing par fichiers)
  (tabs)/accueil/heros/[slug]/   fiche héros, récit paginé, audio, vidéo (pile interne, tab bar visible sauf audio/vidéo)
  (tabs)/accueil/mythologie/     pilier Mythologie — liste par zone, détail 3 onglets Lire/Écouter/BD (pile interne, tab bar visible)
  (tabs)/decouverte/         liste, fiche détail, hub pays (pile interne, tab bar visible)
  profils/                   sélecteur "Qui est-ce ?", ajout de profil enfant, Espace Parent (module Parent/Enfant, hors (tabs), pas de tab bar)
  enfant/                    accueil enfant, histoire du jour, carnet d'explorateur (mode enfant plein écran, hors (tabs))
  enfant/ecole/              module École des Héros — carte du niveau, leçon 4 formats, quiz, résultat, passage de niveau, collection
  don/                       module Don — mission, montant/paiement/confirmation (hors (tabs), pas de tab bar)
  (tabs)/communaute/         fil, détail de post, création, profil membre, signalement, charte
  (tabs)/marche/             catalogue, fiche produit, profil artisan, panier, checkout, commandes, espace vendeur
src/
  components/                composants partagés (HeroCard, TimelineList, FactVsLegendCallout, DecouverteItemRow, FaitsList, PostCard, CreateProfileForm, ProductCard, AddToCartToast, PhotoPicker, AvatarPicker...)
  marketplace/                CartProvider, CreateVendorForm, VendorProductEditorModal (scopés au pilier Marketplace)
  data/
    types.ts                 types miroir du schéma Postgres (supabase/seed.sql)
    supabaseClient.ts         client Supabase (lecture seule, clé anon)
    heroesRepository.ts       fonctions de lecture consommées par l'UI (getHeroes, getHeroBySlug, refreshHeroes...)
    useHeroesData.ts           hooks React (chargement/erreur) autour du repository — useHeroesList() se rafraîchit au focus d'écran (voir "Rafraîchissement automatique depuis le back-office")
    heroes.generated.json     auto-extrait par scripts/build-heroes-data.mjs — sert à générer le seed SQL, pas consommé par l'app à l'exécution
    heroes.curated.ts         champs éditoriaux — à éditer à la main
    decouverte.generated.json  auto-extrait par scripts/build-decouverte-data.mjs — pilier Découverte
    decouverteTypes.ts / decouverteRepository.ts / useDecouverteData.ts / decouverteDisplay.ts   couche de données Découverte (lecture seule)
    communityTypes.ts / communityRepository.ts / useCommunityData.ts / relativeTime.ts           couche de données Communauté (lecture + écriture UGC)
    marketplaceTypes.ts / marketplaceRepository.ts / useMarketplaceData.ts / marketplaceDisplay.ts   couche de données Marketplace (catalogue vide, lecture + écriture)
    uploadImage.ts             helper d'upload générique (bucket user-uploads), utilisé par Communauté et Marketplace
    parentEnfantTypes.ts / parentEnfantRepository.ts   couche de données module Parent/Enfant (profils enfants, réglages PIN, sessions)
    donTypes.ts / donRepository.ts                     couche de données module Don (une seule cause générique, écriture seule côté app)
    ecoleTypes.ts / ecoleRepository.ts                 couche de données module École des Héros (contenu éditorial + progression par enfant)
    mythologie.generated.json  auto-extrait par scripts/build-mythologie-data.mjs — pilier Mythologie (5 mythes)
    mythologieTypes.ts / mythologieRepository.ts / useMythologieData.ts   couche de données Mythologie (lecture seule)
    engagementRepository.ts    enregistre les événements réels de lecture/écoute/visionnage (écriture seule, best-effort), consommé par recit.tsx/audio.tsx/video.tsx — alimente "ENGAGEMENT GLOBAL" côté back-office
  profils/
    ActiveProfileProvider.tsx  état "quel profil est actif" (adulte/enfant), module Parent/Enfant
    PinGate.tsx                modale code PIN (création si aucun code, vérification sinon)
    enfantPalette.ts / heroDuJour.ts   couleurs d'avatar enfant, choix du héros du jour (jamais inventé)
  theme/
    tokens.ts                 couleurs, typographie, spacing (design-system-mobile.md + design-reference-*.dc.excerpt.html)
    useAppFonts.ts             chargement Cinzel/Barlow
scripts/
  build-heroes-data.mjs        régénère heroes.generated.json depuis les récits du griot
  export-heroes-json.mjs       exporte le dataset fusionné (généré + curaté) en JSON
  generate-supabase-seed.mjs   génère supabase/seed.sql à partir de cet export
  build-decouverte-data.mjs    régénère decouverte.generated.json depuis livrables/.../Découverte/*.md
  generate-decouverte-seed.mjs génère supabase/seed-decouverte.sql à partir de decouverte.generated.json
  build-mythologie-data.mjs    régénère mythologie.generated.json depuis livrables/.../Récits africains/mythe-*.md + leurs storyboards
  generate-mythologie-seed.mjs génère supabase/schema-mythologie.sql à partir de mythologie.generated.json
supabase/
  seed.sql                     schéma + seed complet, exécuté dans Supabase (héros) — ⚠️ à réexécuter (2026-08-06, video_url de Martin Paul Samba retiré — lien mort)
  seed-decouverte.sql          schéma + seed du pilier Découverte, exécuté par Yannick le 2026-07-30
  schema-communaute.sql        schéma du pilier Communauté (pas de seed, contenu UGC), exécuté par Yannick le 2026-07-30
  schema-marketplace.sql       schéma du pilier Marketplace (pas de seed, catalogue vide) — ⚠️ à réexécuter (2026-07-31, correctif RLS visibilité produits)
  schema-storage-user-uploads.sql   bucket Storage `user-uploads` + policies (photos post/produit, avatars) — à exécuter par Yannick dans le SQL Editor Supabase
  schema-parent-enfant.sql     schéma du module Parent/Enfant (child_profiles, parent_settings, child_sessions) — à exécuter par Yannick dans le SQL Editor Supabase
  schema-don.sql                schéma du module Don (table dons, une seule cause générique), exécuté par Yannick le 2026-08-05
  schema-ecole-heros.sql        schéma du module École des Héros (7 tables + structure niveaux/leçons sans contenu), exécuté par Yannick le 2026-08-05
  schema-mythologie.sql         schéma + seed du pilier Mythologie (5 mythes) — à exécuter par Yannick dans le SQL Editor Supabase
  schema-engagement.sql         table hero_engagement + fonction increment_hero_engagement (compteurs réels lecture/écoute/visionnage), lu par le back-office — à exécuter par Yannick dans le SQL Editor Supabase
  schema-engagement-detail.sql  détail FR/EN (hero_engagement) + table hero_video_chapter_engagement (chapitre × langue) — dépend de schema-engagement.sql, à exécuter après lui
  migration-video-chapitres-multilangue.sql  heros.video_chapitres passe du FR/EN fixe à une map "videos" multi-langues arbitraire ; relâche la contrainte de langue de hero_video_chapter_engagement — idempotent, à exécuter par Yannick dans le SQL Editor Supabase (2026-08-09)
```
