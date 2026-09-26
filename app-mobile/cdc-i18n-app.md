# Cahier des charges — Traduction effective de l'application mobile

> Rédigé le 2026-09-26, avant tout développement. À valider par Yannick avant de passer aux devs.

## 1. Constat actuel (vérifié dans le code, pas supposé)

- **Aucun système de traduction n'existe dans l'app mobile.** Recherché explicitement (`i18n`, `react-intl`, `useTranslation`) : zéro résultat. Chaque écran contient du texte français écrit en dur directement dans le JSX (ex. `"Numéro de téléphone invalide"`, `"Compte créé..."`, etc.), sur les ~50 écrans du projet.
- **Le choix de langue existe mais ne sert à rien** : l'assistant post-inscription propose FR/EN (`app/onboarding/language.tsx`), le choix est bien sauvegardé (`user_metadata.langue_interface`), et l'écran Profil **affiche** ce choix ("Français"/"English") — mais **aucun texte de l'app ne change réellement** selon ce choix. C'est cosmétique, pas fonctionnel. C'est très probablement ce que Yannick constate.
- **Différent du système de traduction du site web** (`site/index.html`, objet `DICT.fr/.en/.ewo/.dua/.bas/.bam`) : ce chantier concerne l'app mobile, un projet séparé avec son propre code.
- **Contenu déjà connu comme non prêt pour 4 langues** : les traductions ewondo/douala/bassa/bamiléké sont très incomplètes (voir historique du projet, agent `afroback-traducteur-ewondo`) — même une fois le système technique construit, il n'y aura pas de contenu réel à afficher pour ces 4 langues avant longtemps.

## 2. Comment font les apps à succès

Les apps qui gèrent plusieurs langues sérieusement (Duolingo, Airbnb, Spotify) suivent toutes le même schéma, jamais du texte en dur :
1. **Une bibliothèque de traduction dédiée** (pas un système fait maison), qui gère : clé → texte, interpolation de variables (`"Bonjour {{prenom}}"`), pluriel, langue de repli si une clé manque.
2. **Chaque texte affiché passe par une fonction de traduction** (`t('cle')`), jamais écrit en dur.
3. **Détection de la langue de l'appareil au premier lancement**, avec possibilité de la changer manuellement ensuite (ce qu'AFROBACK a déjà commencé à faire avec le choix explicite — bonne base).
4. **Livraison progressive** : les nouvelles langues arrivent une par une, jamais toutes en même temps — une langue avec 60% de traductions et 40% de repli en français est acceptable et courant, tant que ce n'est jamais un texte manquant/vide affiché à l'utilisateur.

## 3. Recommandation

**Bibliothèque : `i18next` + `react-i18next`** — le standard du marché pour React/React Native, gratuit, maintenu, pas de service tiers payant.
- Alternative plus légère envisageable : un système de dictionnaire fait maison, façon `DICT` du site web, pour rester cohérent avec l'existant. **Non recommandé ici** : le site web a ~40 clés, l'app mobile en aura des centaines (50 écrans) — une vraie bibliothèque avec outillage (détection des clés manquantes, interpolation, pluriel) évite des bugs et un travail de maintenance bien plus lourd qu'un objet JS fait main.

**Scope réaliste** :
- **Phase 1 (infrastructure + FR/EN complet)** : construire tout le système technique, extraire TOUS les textes actuellement en dur vers des fichiers de traduction, FR et EN tous les deux à 100%.
- **Phase 2 (langues camerounaises), séparée et non incluse dans ce chantier** : ewondo/douala/bassa/bamiléger, bloquée par le manque de contenu déjà documenté (voir agent traducteur). Le système technique de la Phase 1 les supportera nativement dès qu'il y aura du contenu — pas de nouveau chantier technique nécessaire, juste des clés à remplir.

## 4. Spec fonctionnelle

- Le sélecteur de langue existant (`app/onboarding/language.tsx`, et un futur écran équivalent dans Profil pour changer après coup) pilote réellement l'affichage — plus cosmétique.
- **Changement de langue immédiat**, sans redémarrage de l'app.
- Si une clé manque dans la langue choisie : repli automatique et silencieux vers le français (jamais une clé technique brute du genre `error.invalid_phone` affichée à l'utilisateur).
- Ajout d'un vrai écran "Langue" accessible depuis Profil (aujourd'hui, la langue n'est modifiable qu'une fois, à l'inscription).

## 5. Spec technique

- **Dépendances à ajouter** : `i18next`, `react-i18next`, `expo-localization` (détection de la langue de l'appareil au tout premier lancement, avant que l'utilisateur ne choisisse explicitement).
- **Structure de fichiers** : `src/i18n/fr.json`, `src/i18n/en.json` (puis `ewo.json`/`dua.json`/`bas.json`/`bam.json` en Phase 2), organisés par écran/domaine (`auth.*`, `profil.*`, `heros.*`, etc.) pour rester lisibles à 300+ clés.
- **Travail de fond, le plus long** : remplacer manuellement chaque texte en dur des ~50 écrans par un appel `t('cle.correspondante')` — un travail mécanique mais volumineux, écran par écran, pas automatisable de façon fiable (il faut relire chaque texte pour lui donner une clé cohérente).
- **Persistance du choix** : déjà fait (`user_metadata.langue_interface`), juste à relier réellement au changement de langue d'`i18next` au démarrage de l'app et à chaque modification.

## 6. Décisions ouvertes à valider par Yannick

1. **Confirmer le scope Phase 1 = FR/EN uniquement**, les 4 langues camerounaises restant un chantier de contenu séparé (déjà en cours via l'agent traducteur) ?
2. **Faut-il un écran "Changer de langue" dans Profil dès cette phase**, ou seulement corriger que le choix initial de l'inscription fonctionne réellement (moins de travail, mais un utilisateur ne pourrait jamais changer d'avis après coup) ?
3. **Ampleur assumée** : extraire ~50 écrans est un travail long. Veux-tu un découpage en plusieurs livraisons (ex. d'abord les écrans d'authentification et Profil, puis le reste), ou tout d'un bloc avant de considérer le chantier fini ?
