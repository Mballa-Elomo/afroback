# AFROBACK Mobile — Phase 0 + début Phase 1 (dossier de lancement pour le pôle dev)

> Dossier créé le 2026-07-29 par le chef de projet AFROBACK. Destiné au pôle dev de Madou Consulting, qui porte le développement de l'app React Native (décision de Yannick du 2026-07-29). Voir `context/AFROBACK.md` pour l'historique complet des décisions et le plan technique de lancement (stack, infra, budget, phasage).
>
> **Mise à jour 2026-07-29** : un vrai projet Expo/TypeScript existe maintenant dans `mobile-app/`, avec les 4 écrans de la Phase 1 branchés sur les vraies données des 9 héros, testable sur téléphone via Expo Go (voir `mobile-app/README.md`). Ce n'est pas une maquette : c'est du code de départ réel pour le pôle dev, pas encore branché sur Supabase ni sur de vrais médias.

## Contenu de ce dossier

| Fichier / dossier | Contenu |
|---|---|
| `mobile-app/` | **Le projet Expo/TypeScript réel**, Phase 1 codée (catalogue héros, fiche héros, lecteur de récit, lecteurs audio/vidéo). Voir `mobile-app/README.md` pour lancer l'app et comprendre ce qui reste à faire. |
| `data-model-heros.md` | Schéma de données (table `heros` + tables liées) et dataset peuplé des 9 héros déjà couverts par le contenu éditorial (griot + storyboard) |
| `design-system-mobile.md` | Charte visuelle mobile (couleurs, typographie, composants) dérivée de l'identité de marque déjà validée du site web |
| `specs-phase1-histoires-heros.md` | Specs fonctionnelles des 4 écrans prioritaires : catalogue héros, fiche héros, lecteur de récit, lecteur audio/vidéo |
| `production-media/` | Briefs de production média (script de narration audio + résumé producteur vidéo) pour les 7 héros sans média, ajoutés le 2026-07-29 |

## État des médias par héros (corrigé le 2026-07-29)

Premier constat de ce dossier ("aucun média n'existe") était **inexact**. Vérification faite via `DesignSync` sur le projet claude.ai/design "AFROBACK Mobile Prototype" (`a6ac90b2-d70d-4065-aa96-7c9c5757759a`) :

- **2 héros ont déjà des médias produits, mais pas encore importés dans ce repo** :
  - Martin Paul Samba : narration `assets/narration/martin-paul-samba.mp3`, vidéo `assets/video/martin-paul-samba.mp4`
  - Reine Nzinga : narration FR `assets/narration/reine-nzinga-fr.mp3`, narration EN `assets/narration/reine-nzinga-en.mp3` (pas de vidéo trouvée)
  - Ces fichiers existent dans le projet Claude Design, pas dans ce repo Git. **Seul Yannick peut les récupérer** (accès UI claude.ai/design), aucun outil de ce workspace ne le permet. Tâche assignée dans `context/AFROBACK.md`.
- **7 héros n'ont aucun média produit** : Charles Atangana, Ernest Ouandié, Félix Moumié, Manu Dibango, Ruben Um Nyobè, Rudolf Douala Manga Bell, Sultan Njoya. Briefs de production dans `production-media/`.
- **Aucun visuel de carte catalogue** n'existe pour aucun des 9 héros (inchangé).

## Ce que ce dossier n'est pas (mise à jour 2026-07-29)

- **Ce n'est plus vrai que "aucun code n'a été écrit"** : `mobile-app/` contient un vrai projet Expo/TypeScript, testable sur téléphone via Expo Go, sans Xcode ni Android Studio (voir `mobile-app/README.md`). Ce qui reste hors périmètre de ce workspace : le **build natif** (compilation .ipa/.apk) et la **publication sur les stores**, qui nécessitent un Mac (pour iOS), des comptes développeur payants, et l'outillage natif complet — à la charge du pôle dev Madou Consulting.
- **Pas une extraction pixel-perfect du prototype Claude Design** `AFROBACK Mobile.dc.html` : l'outil d'accès à ce prototype (`DesignSync`) n'était disponible dans aucune des sessions ayant produit ce dossier après l'inventaire initial. La charte et les specs ci-dessus sont construites à partir de l'identité de marque déjà validée (site web) et de l'inventaire d'écrans déjà constaté, pas d'une relecture pixel du prototype. Recommandation : dès qu'une session avec accès à `DesignSync` est possible, comparer et ajuster.

## Décision : pas de prototype web/PWA de démonstration pour l'instant

Le plan technique du 2026-07-29 laissait cette option ouverte ("éventuellement un prototype web/PWA cliquable"). Choix du chef de projet : **ne pas le construire à ce stade**, pour deux raisons :
1. Le prototype Claude Design `AFROBACK Mobile.dc.html` (simulateur "phone frame" HTML/JS, ~50 écrans) remplit déjà ce rôle de démonstration cliquable — en reconstruire un depuis ce workspace serait redondant tant que ce prototype existe et reste accessible via claude.ai/design.
2. Le contenu du prototype n'a pas pu être relu intégralement dans les sessions récentes (`DesignSync` indisponible) : reconstruire une démo à partir d'un inventaire partiel risquerait de produire quelque chose de moins fidèle que l'original, pour un coût de travail équivalent.

Si le pôle dev a besoin d'un support visuel cliquable pour cadrer le développement, la meilleure source est l'accès direct au projet claude.ai/design "AFROBACK Mobile Prototype" (projectId `a6ac90b2-d70d-4065-aa96-7c9c5757759a`), pas une reconstruction. À réévaluer si cet accès s'avère impossible à obtenir pour le pôle dev.

## Prochaine étape

Transmission de ce dossier au pôle dev de Madou Consulting pour chiffrage et démarrage du développement (setup React Native/Expo + Supabase, cf. plan technique dans `context/AFROBACK.md`).
