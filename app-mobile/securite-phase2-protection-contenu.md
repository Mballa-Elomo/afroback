# AFROBACK — Sécurité, phase 2 : durcissement, anti-copie et anti-capture

> Cahier des charges rédigé le 2026-10-08 à la demande de Yannick : « sécuriser le patrimoine africain et sécuriser le contenu, pour qu'on ne puisse pas le voler ». Couvre l'application mobile (iOS, Android, version web de test `afroback-test.vercel.app`) et le site web (`afroback-web.vercel.app`). Fait suite à `securite-lot1-iam.md` (comptes) et `securite-lot2-integrite.md` (empreinte, signature, filigrane des photos).

## 1. Objectif

1. **Durcir** l'app et le site contre les attaques web classiques (injection de script, intégration du site dans une page pirate, fuite d'informations techniques).
2. **Empêcher la capture** (capture d'écran, enregistrement vidéo de l'écran) du contenu.
3. **Empêcher la copie** du texte (sélection, copier-coller, clic droit, glisser, impression).

## 2. Ce qui est possible, et ce qui ne l'est pas (à lire avant tout)

Principe du projet : ne jamais présenter une protection cosmétique comme réelle.

| Plateforme | Capture d'écran / enregistrement | Copie du texte |
|---|---|---|
| **App Android** (Google Play, Expo Go) | **Bloqué pour de vrai** par le système (`FLAG_SECURE`) : la capture est refusée ou noire, l'enregistrement montre un écran noir, l'aperçu dans les applications récentes est masqué. | **Bloqué** : aucun texte de l'app n'est sélectionnable. |
| **App iPhone** (App Store, Expo Go) | **Bloqué pour de vrai sur iOS 13 et plus** : capture et enregistrement donnent une image vide. Aperçu flouté dans le sélecteur d'applications. | **Bloqué** : aucun texte sélectionnable. |
| **Site web et app web, sur ordinateur** (Windows, Mac) | **Impossible à bloquer totalement.** Aucun navigateur ne laisse un site interdire la touche Impr. écran, l'outil Capture d'écran de Windows ou un logiciel d'enregistrement. On applique des **freins et de la dissuasion** (voir 4.3). | **Bloqué** dans la page (sélection, copier, clic droit, glisser, impression). Contournable par un développeur avec les outils du navigateur. |
| **Site web et app web, sur téléphone** (Chrome, Safari) | **Impossible à bloquer.** Le navigateur ne donne aucun moyen d'interdire la capture du téléphone. Dissuasion uniquement. | **Bloqué** (appui long, menu Copier, loupe de sélection). |
| **Partout** | Personne ne peut empêcher quelqu'un de **photographier l'écran avec un autre téléphone**. Seul le filigrane nominatif (4.4) permet de remonter à la fuite. | — |

**Conséquence pratique** : la vraie protection anti-capture, c'est l'app installée. Le web reste plus exposé, c'est un fait technique, pas un manque d'effort. Le filigrane nominatif rend toute fuite traçable jusqu'au compte qui l'a faite, ce qui est la meilleure défense restante sur le web.

## 3. Lot A : durcissement de sécurité (site + app web)

Constat du 2026-10-08 (en-têtes réellement renvoyés par les deux sites) : seul HSTS est présent.

| Mesure | Contre quoi | Où |
|---|---|---|
| **Content-Security-Policy** : scripts uniquement depuis le site lui-même, connexions uniquement vers le site et Supabase, aucun plugin (`object-src 'none'`), `base-uri` et `form-action` verrouillés | Injection de script (XSS) qui volerait la session ou le contenu | site (`next.config.ts`), app web (`vercel.json`) |
| **`frame-ancestors 'none'` + `X-Frame-Options: DENY`** | Un site pirate qui affiche AFROBACK dans un cadre pour le revendre ou piéger les clics (clickjacking) | les deux |
| **`X-Content-Type-Options: nosniff`** | Un fichier déguisé interprété comme du script | les deux |
| **`Referrer-Policy: strict-origin-when-cross-origin`** | Fuite des adresses internes vers des sites tiers (liens de sources) | les deux |
| **`Permissions-Policy`** : caméra, micro, géolocalisation, USB, etc. désactivés | Abus des fonctions du navigateur par un script injecté | les deux |
| **`Cross-Origin-Opener-Policy: same-origin`** | Isolation de la fenêtre contre les pages ouvertes depuis AFROBACK | les deux |
| **Suppression de `X-Powered-By: Next.js`** | Révèle la technologie utilisée aux attaquants | site |
| **Lecteurs audio/vidéo sans bouton « Télécharger »** (`controlsList="nodownload"`, pas d'image dans l'image, clic droit bloqué) | Téléchargement direct d'un audio ou d'une vidéo en un clic | site + app web |
| **Audit des dépendances** (`npm audit`) | Failles connues dans les bibliothèques | les deux |

## 4. Lot B : anti-capture

### 4.1 App native (Android, iOS)
- Protection **globale, sur tous les écrans**, active dès le lancement (bibliothèque officielle `expo-screen-capture`, incluse dans Expo Go : aucun nouveau build nécessaire pour la tester).
- iOS : aperçu flouté dans le sélecteur d'applications.

### 4.2 Pourquoi global plutôt qu'écran par écran
Le contenu (récits, fiches, photos, vidéos, École des Héros) est présent presque partout. Protéger écran par écran laisserait des oublis. Effet de bord accepté : un utilisateur ne peut plus faire de capture de son propre profil ou d'un post de la Communauté.

### 4.3 Web (site + app web) : freins et dissuasion
- **Flou immédiat** de toute la page quand la fenêtre perd le focus ou passe en arrière-plan (ouverture d'un outil de capture, d'un enregistreur, changement d'onglet, sélecteur d'applications du téléphone), avec le message « Contenu protégé ». La page redevient nette au retour.
- **Touche Impr. écran** (Windows) : le presse-papiers est immédiatement remplacé par un message de protection, et la page se floute brièvement.
- **Impression** (Ctrl+P, menu Imprimer, « Enregistrer en PDF ») : la page imprimée est vide, avec le seul message « Contenu protégé par AFROBACK ».
- **Limite honnête** : l'outil Capture d'écran de Windows (Win+Maj+S) fige l'écran avant que la page ne puisse réagir ; une capture faite sur téléphone ne prévient jamais la page. Ces freins arrêtent les gestes rapides, pas un voleur déterminé. C'est le rôle du filigrane.

### 4.4 Filigrane nominatif (web + app) — RETIRÉ le 2026-10-08

> Livré puis retiré partout (site et app) à la demande de Yannick, qui ne l'aimait pas visuellement. Conséquence assumée : une capture faite sur le web ne permet plus de remonter au compte d'origine. Sur l'app installée, les captures restent bloquées par le système.

- Sur les écrans de contenu (lire, écouter, regarder, fiches héros, mythes, Découverte, leçons de l'École), un filigrane discret répété en diagonale affiche **l'identité du compte connecté** : email masqué (ex. `y•••k@gmail.com`) + début de l'identifiant du compte.
- Toute capture ou photo qui circule indique donc qui l'a faite. Le back-office permet de retrouver le compte à partir de l'identifiant.
- Pas de filigrane pour un visiteur sans compte (il ne voit que les 4 contenus gratuits, et les vidéos promotionnelles faites en mode invité restent propres).
- Le filigrane ne gêne ni la lecture ni les clics (transparent aux clics, opacité faible).

## 5. Lot C : anti-copie du texte

- **App native** : aucun texte sélectionnable (déjà le comportement par défaut, vérifié). Seule exception conservée : la clé secrète de la vérification en 2 étapes (`profil/mfa`), que l'utilisateur doit pouvoir copier dans son application d'authentification.
- **Web (site + app web)** :
  - sélection de texte désactivée sur toute la page, y compris l'appui long et la loupe sur téléphone ;
  - copier, couper, clic droit, glisser une image ou du texte : bloqués ;
  - raccourcis bloqués : Ctrl/Cmd + C, X, A, S (enregistrer la page), P (imprimer), U (code source) ;
  - **exceptions** : les champs de saisie (connexion, inscription, commentaires, recherche, posts) restent normaux, on peut y copier et coller.
- **Limite honnête** : le texte reste lisible par les outils de développement du navigateur ou en désactivant JavaScript. Bloquer F12 / les outils de développement est volontairement écarté : facile à contourner et ça casse l'accessibilité. La vraie barrière contre l'aspiration massive est côté serveur (le contenu réservé n'est jamais envoyé à un compte non abonné, déjà en place depuis le 2026-09-29).

## 6. Lot D (à valider, non implémenté dans cette phase) : médias privés + liens temporaires

C'est la protection la plus importante qui reste, plus que l'anti-capture : aujourd'hui, les audios et vidéos sont dans un stockage **public** (`heroes-media`). Quiconque récupère une adresse de fichier peut le télécharger pour toujours, sans compte.

Proposition :
1. Passer le stockage audio/vidéo en **privé** (les photos du catalogue restent publiques).
2. Le serveur ne remet qu'un **lien signé valable 1 h** aux comptes qui y ont droit (règle gratuit/abonné déjà en base).
3. Migration coordonnée : script SQL + modification de l'app et du site + mise à jour de l'app (sinon les anciennes versions ne lisent plus les médias).

**Pourquoi séparé** : ça demande une action de Yannick dans le tableau de bord Supabase et une mise en service coordonnée ; une erreur couperait tous les audios et vidéos. À lancer après validation de cette phase.

## 7. Décisions

| # | Question | Choix appliqué (recommandation) | Alternative |
|---|---|---|---|
| D1 | Anti-capture app : global ou seulement sur les écrans de contenu ? | **Global** (aucun oubli possible) | Écrans de contenu seulement (l'utilisateur garde la capture du reste) |
| D2 | Filigrane : qui le voit ? | **Retiré partout** (décision de Yannick, 2026-10-08) | — |
| D3 | Web : flou dès que la fenêtre perd le focus ? | **Oui** (le plus efficace des freins web) | Non (moins gênant quand on clique dans une autre fenêtre) |
| D4 | Médias privés + liens temporaires (lot D) | **À lancer juste après**, avec validation de Yannick | Reporter au lancement public |

## 8. Critères d'acceptation

- [ ] Android : une capture d'écran de l'app est refusée ou noire ; un enregistrement d'écran montre du noir.
- [ ] iPhone : une capture d'écran de l'app est vide ; l'aperçu du sélecteur d'applications est flouté.
- [ ] Web : impossible de sélectionner, copier, faire un clic droit, glisser une image ou imprimer une page de contenu ; les champs de saisie restent utilisables.
- [ ] Web : la page se floute quand la fenêtre perd le focus et redevient nette au retour.
- [ ] Web : Impr. écran remplace le presse-papiers par le message de protection (Chrome/Edge sur Windows).
- [ ] Filigrane visible sur les écrans de contenu quand on est connecté, absent en invité.
- [ ] En-têtes présents sur les deux sites (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) et aucun `X-Powered-By`.
- [ ] Aucune régression : connexion, lecture, écoute, vidéo, paiement Mobile Money, Communauté, Marché, École des Héros fonctionnent.

## 9. Fichiers concernés

- App : `src/security/ContentProtection.tsx` (nouveau), `src/security/Watermark.tsx` (nouveau), `app/_layout.tsx`, écrans de contenu, `web-vercel/vercel.json`, `package.json` (`expo-screen-capture`).
- Site : `src/components/ContentShield.tsx` (nouveau), `src/components/Watermark.tsx` (nouveau), `src/app/layout.tsx`, `src/app/globals.css`, `next.config.ts`, lecteurs (`Reader`, `ListenPlayer`, `WatchPlayer`), leçon de l'École.

## 10. État d'implémentation (2026-10-08)

**Publié le 2026-10-08** sur https://afroback-web.vercel.app et https://afroback-test.vercel.app, puis revérifié en ligne : en-têtes présents, aucune erreur, copie et clic droit bloqués, voile fonctionnel.

| Élément | État | Vérification |
|---|---|---|
| Lot A, en-têtes de sécurité du site | Fait (`next.config.ts`) | Build de production OK ; en-têtes présents sur 7 pages testées ; aucune violation CSP, aucune erreur JavaScript |
| Lot A, en-têtes de l'app web | Fait (`web-vercel/vercel.json`) | Export web servi localement avec ces en-têtes : aucune violation CSP |
| Lot A, lecteurs sans téléchargement | Fait (site : `WatchPlayer`, `ListenPlayer`, leçon École ; app web : automatique sur tout lecteur) | Revue du code |
| Lot A, audit des dépendances | Site : **0 vulnérabilité**. App : 46 alertes, toutes dans l'outillage Expo SDK 54 (préexistantes, pas dans l'app livrée). Correction complète = montée de SDK, bloquée par Expo Go (voir `mobile-app/AGENTS.md`) | `npm audit --omit=dev` |
| Lot B, anti-capture native | Fait (`expo-screen-capture` 8.0, `src/security/ContentProtection.tsx`) | `tsc`, `expo-doctor` 18/18. **À tester sur un vrai téléphone** (impossible à vérifier sur ordinateur) |
| Lot B, voile web (perte de focus, Impr. écran) | Fait (site : `ContentShield.tsx` ; app web : `ContentProtection.tsx`) | Testé : voile affiché quand la fenêtre perd le focus, retiré au retour |
| Lot B, filigrane nominatif | **Retiré** le 2026-10-08 à la demande de Yannick (site + app), republié | — |
| Lot C, anti-copie | Fait (site + app web ; app native déjà non sélectionnable) | Testé : copier et clic droit bloqués, copier dans un champ de saisie toujours possible ; clé secrète 2FA copiable |
| Lot D, médias privés | **Non commencé**, attend la validation de D4 | — |

**Reste à faire par Yannick** :
1. ~~Publication web~~ : faite le 2026-10-08 (Jarvis est autorisé à lancer `npx vercel deploy --prod --yes`, règle dans `.claude/settings.local.json`).
2. Publier la mise à jour de l'app pour Expo Go (`eas update --branch preview`), puis tester une capture sur Android et sur iPhone.
3. Valider ou modifier D1 à D4.
