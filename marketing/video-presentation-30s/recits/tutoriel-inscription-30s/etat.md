# État · Tutoriel « How to sign up for AFROBACK » (30 s) · VERSION ANGLAISE

- **Phase** : **livrée le 2026-10-06 (v1, anglais)**, en attente du retour de Yannick à l'oreille. MP4 : `livrables/sites-web/afroback/marketing/2026-10-06_AFROBACK-tutoriel-inscription-30s-en_v1.mp4`.
- **À NE PUBLIER QU'UNE FOIS L'APP EN LIGNE SUR LES DEUX STORES.**
- Langue : anglais partout (voix, titres, étiquettes, sous-titres), app capturée en **English**, badges officiels **anglais** à télécharger en phase 2 (Apple « Download on the App Store » → `public/badges/app-store-en.svg` ; Google « GET IT ON Google Play » → `public/badges/google-play-en.png`), non modifiés, mentions légales en anglais. Les badges FR existants restent pour les vidéos françaises.
- Angle : « le chemin des 5 pas dorés » (barre de progression en 5 médaillons, téléphone avec vraies captures, doigt doré, loupe).
- Script : `script.md` · Voix off : `voix-off.md` (10 répliques, 59 mots, 2,5 mots/s max par créneau)
- Voix attendues : `C:\Users\Yannico\Music\Afroback Stories Audio\Voix Inscription 30s EN\1.mp3` à `10.mp3`
- Départs prévus (inchangés) : 0,15 · 2,4 · 5,6 · 8,2 · 11,3 · 14,75 · 17,9 · 20,5 · 23,6 · 26,0 s
- Musique (inchangée) : `BG Music\Baobab Oath.mp3`, de 110,0 à 140,0 s du fichier. Relances à 3,75 / 9,25 / 14,75 / 20,5 s, creux 24,5 → 25,9 s, attaque à 26,0 s.
- Effets sonores à fournir : aucun (tocs de toucher synthétisés en phase 2, facultatifs).
- Données fictives : Awa · awa@example.com · Cameroon +237 6 00 00 00 00 · mot de passe `Baobab#2026` masqué (jauge « Strong ») · code 482915 · username awa.roots
- Composition prévue : `src/recits/TutorielInscription30s.tsx`, id `AfrobackTutorielInscription30s` (900 images), à déclarer dans `src/Root.tsx`.
- Vidéo finale prévue : `livrables/sites-web/afroback/marketing/AAAA-MM-JJ_AFROBACK-tutoriel-inscription-30s-en_v1.mp4`

## Parcours réel vérifié en English (2026-10-06)
Logo + menu langue (Français → **English**) → « Get started » → carrousel (« Skip » possible) → transition → « Welcome to your journey » → « Create your account » (first name, email, country + phone, password + jauge, case 18+ et conditions) → « Check your inbox » (code 6 chiffres) → « Your profile » (username obligatoire, photo/avatar facultatif) → « How will you experience AfroBack? » → « Your account is ready! » → « Protect your account » (facultatif) → « Choose your plan » → « Welcome to AfroBack! » → accueil.

## Captures (test en English fait le 2026-10-06, aucun compte créé, aucun formulaire envoyé)
- OK sans compte : logo (FR puis EN), menu langue ouvert, carrousel, Welcome to your journey, formulaire vide et rempli, « Check your inbox » via `/onboarding/verification-email?email=awa%40example.com` (langue English mémorisée après rechargement).
- `scripts/capture-app.mjs` : ajout prévu d'options `noguest`, `goto`, `type` et choix de « English » au début (rétrocompatible). Pour 6 chiffres : bloquer la requête de vérification.
- NON capturables sans compte confirmé : Your profile, usage, Your account is ready!, Protect your account, Choose your plan, Welcome to AfroBack! Captures facultatives de Yannick (app en English) dans `C:\Users\Yannico\Music\Afroback Stories Audio\Captures Inscription\`, noms libres. Sinon : repli graphique en anglais hors téléphone, jamais de faux écran.
- Ne pas utiliser les écrans redessinés de `src/phone.tsx` (ancien parcours, en français).

## Phase 2 (démarrée le 2026-10-06, « go » de Yannick)
- Voix : 10/10 dans `Voix Inscription 30s EN\` (tri et transcription Whisper faits par le coordinateur ; voix ElevenLabs « Alex - Business Book Narrator », choix de Yannick, PAS la voix griot). Durées après coupe des silences : 1,56 · 3,57 · 2,42 · 3,02 · 2,68 · 2,77 · 3,37 · 2,22 · 2,20 · 2,79 s (26,6 s de voix).
- Départs réels (recalés, les répliques anglaises sont plus longues que prévu) : 0,15 · 1,85 · 5,55 · 8,1 · 11,25 · 14,1 · 17,0 · 20,5 · 22,9 · 26,0 s. Mixage OK : `public/audio/mix-tutoriel-inscription-30s-en.wav`, `timing.json` écrit.
- Captures app (moi, English, 2026-10-06, aucun compte créé, rien envoyé) : `public/img/capture-app-insc-en-01` à `15` (logo FR, menu langue, logo EN, carrousel, Welcome to your journey, formulaire vide puis Awa / awa@example.com / 6 00 00 00 00 / mot de passe Strong / case cochée, code 0 à 6 chiffres ; la requête de vérification du 6ᵉ chiffre est retenue dans le navigateur, jamais envoyée).
- `scripts/capture-app.mjs` : options ajoutées `noguest`, `goto`, `type`, `tick`, `digits`, `blockverify`, `rect` (rétrocompatible).
- Captures de Yannick (10) identifiées : 213655 = « New device detected » (connexion, pas inscription, e-mail partiellement masqué) → NON utilisée ; 213911 = Your profile (photo et pseudo réels « Mballa » → FLOUTÉS) ; 213929 = usage ; 214014 = Your account is ready! ; 214039 = Protect your account ; 214101 = Choose your plan (seule la carte gratuite « Start for free » est gardée, aucun prix) ; 214115 = Payment → NON utilisée (prix, hors parcours gratuit) ; 214329 = accueil du compte réel (nom « Mballa Elomo », interface en français) → NON utilisée ; 214344 = profil avec e-mail réel → NON utilisée ; 214358 = Découverte (français) → NON utilisée. Pas de capture de « Welcome to AfroBack! / Explore AfroBack » : remplacée par l'illustration réelle de l'app (`img/bienvenue.jpg`) + étiquette.
- Préparation : `recits/tutoriel-inscription-30s/preparer-captures-yannick.py` → `public/img/capture-app-insc-en-y-*.png` (originaux non modifiés).
- Badges anglais officiels téléchargés, non modifiés : `public/badges/app-store-en.svg` (tools.applemediaservices.com, « Download_on_the_App_Store_Badge_US-UK_RGB_blk ») et `public/badges/google-play-en.png` (play.google.com/intl/en_us/badges, `en_badge_web_generic.png`, « GET IT ON Google Play » ; zone visible 41 → 209 px sur 250).
- Composition : `src/recits/TutorielInscription30s.tsx` (id `AfrobackTutorielInscription30s`, déclarée dans `src/Root.tsx`), `npx tsc --noEmit` propre.
- Écarts au script : pas de « loupe » séparée, remplacée par une caméra qui s'approche du champ en cours (plus lisible) ; pas de sous-titres karaoké (chaque réplique a déjà son équivalent écrit en gros) ; pas de sons de toucher (la musique suffit) ; scène 8 = titre « Welcome to the great AfroBack family » sur l'illustration de l'app + 3 lignes (boutons « Enable now / Later », carte gratuite « Start for free », « Tap “Explore AfroBack” » en texte, pas d'écran faute de capture).
- **Vidéo livrée** : `marketing/2026-10-06_AFROBACK-tutoriel-inscription-30s-en_v1.mp4` (30,0 s, 1080 × 1920, vidéo + audio, -14,1 LUFS).
- Contrôle qualité (planches toutes les 0,5 s + images clés, 3 rendus) : corrigés : textes de fin qui apparaissaient sans animation (temps absolus), enveloppe qui masquait « Check your inbox », mention de floutage qui chevauchait le bouton Continue, écran « How will you experience AfroBack? » trop petit (zoom ajouté).
