# AFROBACK · Tutoriel (30 s) · « How to sign up for AFROBACK » · VERSION ANGLAISE

> **À NE PUBLIER QU'UNE FOIS L'APP EN LIGNE SUR LES DEUX STORES (App Store ET Google Play).** La fin affiche les badges officiels anglais « Download on the App Store » et « GET IT ON Google Play » (règle permanente de Yannick : badges dans toutes ses vidéos de promo d'app).
>
> Rédigé le 2026-10-06, **passé entièrement en anglais le même jour à la demande de Yannick** (voix off, titres, sous-titres, app capturée en English, badges anglais). **Statut : produit le 2026-10-06 (v1) : `marketing/2026-10-06_AFROBACK-tutoriel-inscription-30s-en_v1.mp4`. Écarts au montage (départs réels, loupe remplacée par zoom, captures de Yannick) : voir `etat.md`.**
> Public : Afrique anglophone (Cameroun anglophone, Nigeria, Ghana) et diaspora. Anglais simple, phrases courtes, « you ».
> Dossier : `recits/tutoriel-inscription-30s/` · Composition prévue : `AfrobackTutorielInscription30s` (`src/recits/TutorielInscription30s.tsx`, 900 images).
> Différent des vidéos existantes : ni l'annonce d'un récit ni une présentation des piliers. Ici, **un vrai mode d'emploi**, écran réel par écran réel.

---

## Parcours réel vérifié (code + app en ligne en English, 2026-10-06)

Vérifié dans `app-mobile/mobile-app/app/onboarding/*.tsx`, `app/_layout.tsx`, `src/i18n/en.ts`, et en direct sur https://afroback-test.vercel.app avec la langue « English » choisie (navigateur sans interface, aucun compte créé, aucun formulaire envoyé). Tout le parcours d'entrée est traduit dans l'app.

| # | Écran réel (fichier) | Ce qu'on y fait | Textes exacts à l'écran (English) |
|---|---|---|---|
| a | Écran du logo (`onboarding/index.tsx`) | Menu de langue en haut à droite (Français / English), on choisit **English**, puis le bouton | « Choose your language », « Get started », « Back to our roots » |
| b | Carrousel de 3 écrans | Facultatif : « Skip › » | « Discover where you come from », « Listen to the stories passed down through generations », « Listen. Discover. Pass it on. » |
| c | Transition 1 s | Aucun geste | logo + particules |
| d | « Welcome to your journey » (`bienvenue.tsx`) | « Create my account » (aussi : « Already have an account? Log in », « Explore without an account ») | « Create your account to begin your adventure. » |
| e | « Create your account » (`signup.tsx`) | **First name, Email address, Country (Cameroon +237 par défaut) + Phone number, Password** (jauge Weak / Fair / Strong), **case obligatoire**, bouton | « At least 8 characters, with a letter and a number », « I am 18 or older and I accept the terms of use and the privacy policy. », « Create my account ». Pas de Google ni d'Apple |
| f | « Check your inbox » (`verification-email.tsx`) | Code à 6 chiffres reçu par e-mail, « Confirm » | « We sent a 6-digit code to … », « Remember to check your spam folder. » |
| g | « Your profile » (`profil.tsx`) | « Add a photo » ou « Or pick an avatar » (facultatif), **Username obligatoire** | « Choose how the community will see you. Your email stays private. » |
| h | « How will you experience AfroBack? » (`usage.tsx`) | Cartes à cocher | « Discover my roots », « Create profiles for my children », « Sell my creations » |
| i | « Your account is ready! » (`compte-cree.tsx`) | Coche dorée, « Continue » | « Welcome to the great AfroBack family. » |
| j | « Protect your account » (`mfa-proposal.tsx`) | Facultatif : « Enable now » ou « Later » | |
| k | « Choose your plan » (`plan.tsx`) | « Start for free » ou un forfait payant | |
| l | « Welcome to AfroBack! » (`welcome.tsx`) | « Explore AfroBack » → accueil | « Your journey back to your roots starts now. » |

Remarques : la langue se choisit dans le menu de l'écran du logo (plus d'écran séparé). Le téléphone est obligatoire depuis le 2026-09-29. Le choix « English » est mémorisé par l'app (après rechargement, l'écran « Check your inbox » reste en anglais, vérifié). Les écrans redessinés de `src/phone.tsx` (ancien parcours, en français) **ne sont pas utilisés**.

## Angle (une seule idée forte) : « le chemin des 5 pas dorés »

L'app appelle l'inscription « your journey ». La vidéo le prend au mot : **un chemin vertical de 5 médaillons dorés numérotés** (losange de la frise AFROBACK), qui se dessine dans l'accroche puis reste en haut comme **barre de progression** : à chaque étape, le médaillon suivant s'allume. Au centre, le **téléphone avec les vraies captures en English**, un **doigt lumineux** (cercle doré qui pulse au toucher) et une **loupe dorée** qui agrandit le champ en cours.

Ton : guide chaleureux, anglais simple, rythme net. On retient : 5 steps, and you're in.

---

## 0. Fiche technique

| Élément | Choix |
|---|---|
| Durée | **30 s exactement** (900 images, 30 i/s) |
| Format | **9:16 vertical, 1080 × 1920** |
| Langue | **Anglais partout** : voix, titres, étiquettes, sous-titres, captures de l'app en English, badges anglais |
| Zones sûres | Rien d'important au-dessus de y = 250 ni sous y = 1540. Barre de progression y ≈ 270 à 350 ; titre d'étape y ≈ 380 à 520 ; téléphone y ≈ 560 à 1520 |
| Lisible sans le son | Chaque étape a son titre à l'écran (numéro + verbe d'action) et le geste est montré (doigt + loupe) |
| Rythme | Changement visuel au moins toutes les 2 s |
| Palette | noir chaud `#0B0906` · or `#F0C36B` · or pâle `#F7D98B` · ivoire `#FFF4E0` · terracotta `#E3A277` |
| Typographies | **Cinzel** (numéros, titres d'étape) · **Manrope** (consignes, sous-titres) |
| Téléphone | Cadre `Phone` de `src/phone.tsx` (écran 390 × 844), échelle ≈ 1,13, centré x = 540 |
| Doigt | Cercle doré 64 px + onde au toucher, posé sur les vraies coordonnées des boutons de la capture |
| Loupe | Bulle arrondie bord or 4 px, grossissement ×2,2, posée à côté du téléphone, ne cache jamais le titre |
| Données fictives | First name **Awa** · **awa@example.com** · téléphone **6 00 00 00 00** (+237 affiché par l'app, pays « Cameroon ») · mot de passe masqué (saisi : `Baobab#2026`, jauge « **Strong** », vérifié) · code **4 8 2 9 1 5** · username **awa.roots** |
| Épilepsie | Aucun flash blanc plein. Éclats dorés locaux, 1 par geste |

---

## 1. Musique, voix off, sons

**Musique** (inchangée) : `BG Music\Baobab Oath.mp3` (sans « (1) »), de **110,0 s à 140,0 s du fichier**. Passage jamais utilisé (Nzinga = 14 → 44 s ; la présentation 60 s a pris « Legends by the Fire », non réutilisé). Mesure ffmpeg : niveau régulier (-12 à -17 dB) avec relances naturelles à **3,75 / 9,25 / 14,75 / 20,5 s** de la vidéo (changements d'étape calés dessus), respiration **24,5 → 25,9 s**, **attaque franche à 26,0 s** sur l'écran final.

**Voix off** : voix griot ElevenLabs habituelle, en anglais, ton de **guide chaleureux**. **10 répliques, 59 mots**, chaque créneau à **2,5 mots/s ou moins** (débit anglais d'ElevenLabs différent du français : marge gardée). Minutage identique à la version française. Détail dans `voix-off.md`.

> Join AFROBACK. Follow me.
> One: choose English, tap Get started.
> Two: tap Create my account.
> Three: first name, email, phone number.
> A strong password, then tick the box.
> Four: enter the code from your email.
> Five: pick a username and avatar.
> One last choice… your account is ready!
> Welcome to the AFROBACK family.
> Download AFROBACK. Your journey starts here.

**Effets sonores à fournir : aucun.** Tocs de toucher discrets synthétisés en phase 2 (`scripts/sfx-synthese.py`), facultatifs.

---

## 2. Tableau temps → scène

| Temps (s) | Scène | Voix (n°) |
|---|---|---|
| 0,0 → 2,3 | 1 · **Accroche** : le chemin de 5 médaillons se dessine, « SIGN UP FOR AFROBACK · 5 STEPS », le téléphone arrive | 1 |
| 2,3 → 5,6 | 2 · **Step 1 · Choose English** : menu Français / English → English, puis « Get started » | 2 |
| 5,6 → 8,2 | 3 · **Step 2 · Create your account** : « Skip › », puis « Welcome to your journey » → « Create my account » | 3 |
| 8,2 → 11,3 | 4A · **Step 3 · Fill in the form** : First name, Email, Phone se remplissent | 4 |
| 11,3 → 14,75 | 4B · **Step 3 (suite)** : mot de passe masqué + jauge « Strong », case cochée, « Create my account » | 5 |
| 14,75 → 17,9 | 5 · **Step 4 · Enter the code** : « Check your inbox », chiffres dans les 6 cases | 6 |
| 17,9 → 20,5 | 6 · **Step 5 · Pick a username** : avatar, « awa.roots » | 7 |
| 20,5 → 23,6 | 7 · « How will you experience AfroBack? » puis « Your account is ready! » | 8 |
| 23,6 → 26,0 | 8 · Derniers écrans en éventail (sécurité facultative, « Start for free », « Explore AfroBack ») + illustration de bienvenue | 9 |
| 26,0 → 30,0 | 9 · **Fin** : « DOWNLOAD AFROBACK », badges officiels anglais, logo, afroback.app | 10 |

---

## 3. Script scène par scène

### Scène 1 · Accroche (0,0 → 2,3 s)
- **Cadrage** : fond noir chaud, léger grain (`Grain`), halo or doux au centre.
- **Animation** : dès l'image 1, un **chemin doré** se trace de bas en haut (trait 6 px, courbe en S, de y 1450 à y 520) et allume **5 médaillons** numérotés **1 à 5** (Cinzel), un toutes les 0,12 s (0,05 → 0,6 s), petite étincelle (`Diamonds`) sur chacun.
- **Texte animé** : à 0,2 s « **SIGN UP** » (Cinzel 96 pt, ivoire) `PunchWord`, à 0,5 s « **FOR AFROBACK** » (Cinzel 88 pt, or) en dessous (y ≈ 380 à 560). À 1,0 s, pastille ronde « **5 STEPS** » (Cinzel 52 pt, cercle or) en `popScale`.
- **Transition interne (1,5 → 2,3 s)** : les 5 médaillons remontent et rétrécissent en **barre de progression** (y ≈ 310) ; le titre se réduit ; le **téléphone** monte du bas (rebond 4 %) et s'allume sur l'écran du logo à 2,2 s.
- **Voix off** : « Join AFROBACK. Follow me. » (réplique 1, 0,15 s)
- **Son** : musique dès l'image 1.
- **Transition** : continuité (le téléphone reste en place, seul l'écran change).

### Scène 2 · Step 1 · Choose English (2,3 → 5,6 s)
- **Barre** : médaillon **1** s'allume. **Titre** (y ≈ 400 à 500) : « **1 · CHOOSE ENGLISH** » (Cinzel 64 pt, or).
- **Écran** : capture réelle de l'écran du logo, menu sur « Français » (état par défaut de l'app).
- **Geste** : à 2,7 s le doigt touche le menu en haut à droite → capture réelle du menu ouvert (« CHOOSE YOUR LANGUAGE », Français, English). **Loupe** sur le menu (2,9 → 3,9 s). À **3,75 s** (relance musicale) le doigt touche « **English** » : l'écran passe à la capture réelle en anglais (« Back to our roots », « Get started »). Étiquette Manrope 32 pt : « Language menu · top right ».
- À 4,5 s le doigt touche « **Get started** » (bouton enfoncé 3 %, onde dorée). Consigne sous le titre : « then tap **Get started** ».
- **Voix off** : « One: choose English, tap Get started. » (réplique 2, 2,4 s)
- **Transition** : fondu au noir rapide de l'écran (comme dans l'app) → 5,6 s.

### Scène 3 · Step 2 · Create your account (5,6 → 8,2 s)
- **Barre** : médaillon **2**. **Titre** : « **2 · CREATE YOUR ACCOUNT** » (Cinzel 56 pt).
- **Plan 3A (5,6 → 6,4 s)** : capture réelle du carrousel (« Discover where you come from »). Le doigt touche « **Skip ›** ». Mention Manrope 30 pt ivoire 70 % : « You can skip the intro ».
- **Plan 3B (6,4 → 8,2 s)** : capture réelle « **Welcome to your journey** », zoom lent 1,0 → 1,05. Le doigt touche « **Create my account** » à 7,3 s (onde, loupe sur le bouton).
- **Voix off** : « Two: tap Create my account. » (réplique 3, 5,6 s)
- **Transition** : glissement vers la gauche (navigation de l'app).

### Scène 4A · Step 3 · Fill in the form (8,2 → 11,3 s)
- **Barre** : médaillon **3**. **Titre** : « **3 · FILL IN THE FORM** » (Cinzel 58 pt).
- **Écran** : captures réelles successives de « Create your account », champs saisis pour de vrai dans l'app (aucun texte incrusté par-dessus) : vide → « Awa » (à **9,25 s**, relance musicale) → « awa@example.com » (9,9 s) → « Cameroon +237 » + « 6 00 00 00 00 » (10,6 s).
- **Animation** : micro-fondus de 4 images entre captures (effet de frappe). La **loupe** suit le champ en cours, étiquette Manrope 34 pt : « First name », « Email », « Phone ».
- **Voix off** : « Three: first name, email, phone number. » (réplique 4, 8,2 s)
- **Transition** : la loupe glisse vers « Password ».

### Scène 4B · Step 3 (suite) · Password and box (11,3 → 14,75 s)
- **Écran** : mot de passe masqué + jauge « **Strong** » (11,6 s) ; case cochée (12,9 s).
- **Loupe** : mot de passe + jauge (11,5 → 12,7 s), étiquette « **8+ characters, a letter and a number** » (règle affichée par l'app) ; puis la case (12,8 → 13,8 s), étiquette « **Tick: 18 or older + terms** ».
- À 14,0 s le doigt touche « **Create my account** ».
- **Voix off** : « A strong password, then tick the box. » (réplique 5, 11,3 s)
- **Transition** : à **14,75 s** (relance musicale) glissement vers l'écran suivant.

### Scène 5 · Step 4 · Enter the code (14,75 → 17,9 s)
- **Barre** : médaillon **4**. **Titre** : « **4 · ENTER THE CODE** ».
- **Plan 5A (14,75 → 15,6 s)** : pictogramme dessiné d'**enveloppe dorée** qui s'ouvre (icône graphique, **pas** une fausse boîte mail), étiquette « 6-digit code sent by email ».
- **Plan 5B (15,6 → 17,9 s)** : capture réelle « **Check your inbox** » avec « awa@example.com ». Les chiffres « 4 8 2 9 1 5 » arrivent case par case (15,9 → 17,1 s), loupe sur les 6 cases. Mention Manrope 28 pt : « Check your spam folder too ».
- **Voix off** : « Four: enter the code from your email. » (réplique 6, 14,75 s)
- **Transition** : fondu enchaîné doré 6 images.

### Scène 6 · Step 5 · Pick a username (17,9 → 20,5 s)
- **Barre** : médaillon **5**. **Titre** : « **5 · PICK A USERNAME** ».
- **Écran** : écran réel « **Your profile** » (capture de Yannick en English, ou repli §4). Le doigt touche un avatar (18,5 s), « awa.roots » s'écrit (19,1 s), mention « Available » de l'app, doigt sur « Continue » (20,1 s).
- **Loupe** : sur le username, étiquette « Photo or avatar · optional ».
- **Voix off** : « Five: pick a username and avatar. » (réplique 7, 17,9 s)
- **Transition** : à **20,5 s** les 5 médaillons s'allument tous, éclat doré local.

### Scène 7 · One last choice · Account ready (20,5 → 23,6 s)
- **Plan 7A (20,5 → 21,9 s)** : écran « **How will you experience AfroBack?** » (« Discover my roots », « Create profiles for my children », « Sell my creations »). Le doigt coche « Discover my roots » puis « Continue ». Titre : « **ONE LAST CHOICE** » (Cinzel 58 pt).
- **Plan 7B (21,9 → 23,6 s)** : « **Your account is ready!** » : coche dorée tracée dans son cercle, halo. Le titre devient « **DONE!** » (Cinzel 84 pt, or, `PunchWord`).
- **Voix off** : « One last choice… your account is ready! » (réplique 8, 20,5 s)
- **Transition** : le téléphone recule et pivote (-6°).

### Scène 8 · Welcome to the family (23,6 → 26,0 s)
- **Plan 8A (23,6 → 25,0 s)** : trois écrans en **éventail** (-8° / 0° / +8°), étiquette Manrope 30 pt au-dessus de chacun : « **Security: “Later” is fine** » (Protect your account) · « **Plan: “Start for free”** » (Choose your plan, **cadré sur la carte gratuite seulement : aucun prix affiché**) · « **“Explore AfroBack”** » (Welcome to AfroBack!).
- **Plan 8B (25,0 → 26,0 s)** : illustration réelle de l'écran de bienvenue de l'app (`img/bienvenue.jpg`, asset de l'app) plein cadre, `Illu` zoom 1,05 → 1,12, « **Welcome to the great AfroBack family** » (Cinzel 54 pt, 2 lignes, y ≈ 600 à 800 : texte réel de l'app ; la voix dit la version courte « Welcome to the AFROBACK family »). Creux naturel de la musique.
- **Voix off** : « Welcome to the AFROBACK family. » (réplique 9, 23,6 s)
- **Transition** : à **26,0 s**, sur l'attaque musicale, fondu au noir chaud en 4 images.

### Scène 9 · Fin (26,0 → 30,0 s)
- **Cadrage** : noir chaud, halo or, particules dorées lentes.
- **Texte** : « **DOWNLOAD** » (Cinzel 80 pt, ivoire) puis « **AFROBACK** » (Cinzel 120 pt, or, `LetterDrop`) à 26,1 → 26,8 s (y ≈ 520 à 760). Logo médaillon au-dessus (y ≈ 300 à 480).
- **Badges officiels anglais**, **non modifiés**, même hauteur visible (y ≈ 900 à 1080), fondu + glissement uniquement à 27,2 et 27,35 s :
  - Apple « **Download on the App Store** » (noir, version anglaise US/UK de l'outil officiel toolbox.marketingtools.apple.com) → `public/badges/app-store-en.svg` ;
  - Google « **GET IT ON Google Play** » (version anglaise de play.google.com/intl/en/badges) → `public/badges/google-play-en.png`.
  À télécharger en phase 2 depuis ces sources ; les fichiers FR existants restent pour les vidéos françaises.
- « **afroback.app** » (Manrope 46 pt, or pâle) à 27,8 s ; « **Back to our roots** » (tagline anglaise réelle de l'app, Cinzel 34 pt, ivoire 70 %) à 28,1 s.
- **Mentions légales en anglais** (Manrope 18 pt, ivoire 55 %, y ≈ 1480 à 1530) : « Apple and the Apple logo are trademarks of Apple Inc. App Store is a service mark of Apple Inc. · Google Play and the Google Play logo are trademarks of Google LLC. »
- **Voix off** : « Download AFROBACK. Your journey starts here. » (réplique 10, 26,0 s)
- **Son** : section pleine, fondu de sortie sur la dernière seconde.

---

## 4. Captures (phase 2) et ce qui ne peut pas être capturé

**Atteignables sans compte, vérifié en English le 2026-10-06** (aucun compte créé, aucun formulaire envoyé) : écran du logo (en Français puis en English), menu de langue ouvert, carrousel, « Welcome to your journey », formulaire « Create your account » vide puis rempli champ par champ (Awa / awa@example.com / Cameroon +237 6 00 00 00 00 / mot de passe masqué « Strong » / case cochée), « Check your inbox » via `/onboarding/verification-email?email=awa%40example.com` (langue English conservée après rechargement).
- Saisie du code : jusqu'à 5 chiffres sans appel serveur ; pour 6 chiffres, bloquer la requête de vérification dans le navigateur de capture (sinon arrêt à 5 chiffres).
- `scripts/capture-app.mjs` passe en invité et en Français par défaut : ajout prévu d'options `noguest`, `goto`, `type`, et sélection de « English » au début (rétrocompatible).

**Non capturables sans compte confirmé** : Your profile, How will you experience AfroBack?, Your account is ready!, Protect your account, Choose your plan, Welcome to AfroBack!
1. **Recommandé** : Yannick fait une inscription test **avec l'app en English** et dépose ses captures dans `C:\Users\Yannico\Music\Afroback Stories Audio\Captures Inscription\` (noms libres, je les identifie). Facultatif.
2. **Repli honnête sans captures** : cartes graphiques en anglais hors du téléphone (titres réels des écrans, coche dorée en grand), jamais de faux écran présenté comme réel.
- La boîte mail et l'e-mail reçu ne sont jamais montrés (pictogramme d'enveloppe seulement).

## 5. Fidélité et limites

- Tous les libellés anglais sont copiés de `src/i18n/en.ts` (version en ligne du 2026-10-06). Exception assumée : la voix dit « Welcome to the AFROBACK family » (sans « great ») pour tenir le débit ; l'écran affiche le texte réel complet.
- Aucun chiffre, aucun prix, aucune durée d'inscription affirmée.
- « Explore without an account » reste visible sur la capture mais n'est pas mis en avant.
