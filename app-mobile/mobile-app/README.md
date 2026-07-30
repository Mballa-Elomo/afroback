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

## Ce qui n'est PAS fait (à charge du pôle dev Madou Consulting)

- **Pas de vrai lecteur audio/vidéo** : aucun média n'est produit pour les 9 héros (voir `app-mobile/production-media/`). Les écrans `audio.tsx` / `video.tsx` sont prêts à recevoir `expo-av`/`expo-video` le jour où le média existe (voir le commentaire en tête de chaque fichier). Le champ `image_carte_catalogue` est vide pour les 9 héros (aucun visuel produit à ce jour).
- **Pas de build natif ni de publication sur les stores** (App Store / Google Play) — nécessite un Mac pour iOS, des comptes développeur payants, et n'est pas faisable depuis ce workspace Claude Code.
- **Pas de cache offline** : l'app doit interroger Supabase à chaque ouverture pour l'instant.
- **Pas de comptes utilisateurs, marketplace, communauté, abonnements, mode enfant, espace vendeur** — hors Phase 1, voir `context/AFROBACK.md` pour la feuille de route complète.

## Structure

```
app/                        écrans (Expo Router, routing par fichiers)
src/
  components/                composants partagés (HeroCard, TimelineList, FactVsLegendCallout...)
  data/
    types.ts                 types miroir du schéma Postgres (supabase/seed.sql)
    supabaseClient.ts         client Supabase (lecture seule, clé anon)
    heroesRepository.ts       fonctions de lecture consommées par l'UI (getHeroes, getHeroBySlug...)
    useHeroesData.ts           hooks React (chargement/erreur) autour du repository
    heroes.generated.json     auto-extrait par scripts/build-heroes-data.mjs — sert à générer le seed SQL, pas consommé par l'app à l'exécution
    heroes.curated.ts         champs éditoriaux — à éditer à la main
  theme/
    tokens.ts                 couleurs, typographie, spacing (design-system-mobile.md)
    useAppFonts.ts             chargement Cinzel/Barlow
scripts/
  build-heroes-data.mjs        régénère heroes.generated.json depuis les récits du griot
  export-heroes-json.mjs       exporte le dataset fusionné (généré + curaté) en JSON
  generate-supabase-seed.mjs   génère supabase/seed.sql à partir de cet export
supabase/
  seed.sql                     schéma + seed complet à exécuter dans le SQL Editor Supabase
```
