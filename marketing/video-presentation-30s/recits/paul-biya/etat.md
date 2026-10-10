# État · Vidéo récit « Paul Biya » (héros, Cameroun, mode Mémoire)

- **Phase** : livrée le 2026-10-08 (v1 corrigée, rendue après libération du disque par Yannick), en attente de son retour (oreille + œil). À ne diffuser qu'après relecture et publication du récit dans l'app.
- Vidéo : `livrables/sites-web/afroback/marketing/2026-10-08_AFROBACK-paul-biya-31s_v1.mp4` (31,0 s, 1080 × 1920, 30 i/s, vidéo + audio, -14,2 LUFS)
- Commande de rendu (depuis PROJET) : `npx remotion render AfrobackRecitPaulBiya30s ../2026-10-08_AFROBACK-paul-biya-31s_v1.mp4 --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"`
- Contrôle qualité (planches toutes les 0,5 s, 3 rendus) : les 4 défauts du premier rendu sont corrigés. (1) Titres du haut lisibles grâce à une ombre en haut d'écran ; (2) le bandeau « Récit Mémoire » ne recouvre plus une fiche lisible (fiches du haut assombries derrière lui) ; (3) étiquettes des dossiers espacées, « 1968 · secrétaire général de la présidence » visible ; (4) natte élargie : plus de bord droit visible pendant les dossiers. Objets décalés (dossiers et livre ne se touchent plus), natte assombrie sous les deux lectures et le verdict.
- Contrôle : aucun portrait ni personne réelle ; fin provisoire sans portrait ; fiches calées sur la voix (1984 à 17,4 s « putsch », 2002 Bakassi à 20,45 s, 2014 à 22,07 s « guerres », élections à 22,98 s) ; pas de flash.
- Voix : `C:\Users\Yannico\Music\Afroback Stories Audio\Voix Paul Biya\1.mp3` à `10.mp3` (originaux intacts), préparées par `scripts/preparer-voix.py` (silences de tête et de fin coupés, respirations internes ramenées à 0,2 s, **atempo 1,04** sans changement de hauteur) → `recits/paul-biya/voix-preparees/1.wav` à `10.wav` (voix : 32,1 s → 27,55 s)
- Départs réels : 0,15 · 3,55 · 5,85 · 8,15 · 11,25 · 13,65 · 17,1 · 20,45 · 25,0 · 27,6 s (fin de la dernière réplique : 30,25 s). Durée vidéo : **31 s** (accordée par Yannick).
- Musique : `BG Music\Legends by the Fire.mp3` depuis 0 s, volume 0,3 · Effets sonores : aucun
- Mixage : `config-audio.json` (nouveau champ `voice_ext: "wav"` ajouté au script de mixage, rétrocompatible) → `public/audio/mix-paul-biya.wav` (-14,1 LUFS) + `timing.json`
- Composition : `src/recits/PaulBiya.tsx` + accessoires `src/recits/biya-props.tsx` (id `AfrobackRecitPaulBiya30s`, 31 s, déclarée dans `src/Root.tsx`)
- **Fin isolée** : `src/recits/biya-fin.tsx`. Aujourd'hui `CAPTURE = null` donc une fiche provisoire dessinée au style de l'app s'affiche, sans portrait (Contemporain, Politique, PAUL BIYA, Récit Mémoire). Quand le récit sera publié : capturer la fiche (commande en tête du fichier), mettre `CAPTURE = "img/capture-app-paul-biya.png"` et `RING_Y`, re-rendre.
- Portrait IA fourni par Yannick (`portrait-fourni-yannick.png`) : **non utilisé** (halo doré glorifiant, image réaliste d'une personne vivante), conformément à la consigne.

## v2 « La frise d'or » (motion design, avec portrait) · livrée le 2026-10-08

- **Phase** : v2 livrée, en attente du retour de Yannick. La v1 n'a pas été modifiée.
- Vidéo : `livrables/sites-web/afroback/marketing/2026-10-08_AFROBACK-paul-biya-31s_v2.mp4` (31,0 s, 1080 × 1920, 30 i/s, vidéo + audio, -14,2 LUFS)
- Composition : `src/recits/PaulBiyaV2.tsx` (id `AfrobackRecitPaulBiyaV2`, déclarée dans `src/Root.tsx`). Elle réutilise `biya-props.tsx` (soutane, diplômes, éphéméride) et la fin isolée `biya-fin.tsx` (`OutroBiya portrait warm`).
- Rendu : `npx remotion render AfrobackRecitPaulBiyaV2 ../2026-10-08_AFROBACK-paul-biya-31s_v2.mp4 --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe"`
- Voix et mix inchangés (`public/audio/mix-paul-biya.wav`, `timing.json`).
- Portrait : décision de Yannick, c'est l'image officielle du héros. Copié dans `public/heros/paul-biya.png`. Il est seulement cadré, masqué et zoomé, jamais animé (pas de bouche, pas de visage qui bouge).
- DA : identité du site (encre #070504, or en dégradé brillant, motif losange, grain, cartes « verre » à liseré doré, Cinzel + Manrope). Fil conducteur : une frise dorée de 1933 à 2026 en haut de l'écran, sur laquelle avance un médaillon du portrait. Le portrait est révélé dans un losange (0 à 3,5 s), file dans la frise (5,5 s), revient en arche le 6 novembre 1982, puis dans un losange pour les deux lectures et le verdict. Le reste : typographie cinétique, cartes, escalier, éphéméride, « CONSTITUTION » en interlettrage animé, pile de fiches.
- Images tierces : Wikimedia Commons, recolorées (Afrique, domaine public ; carte de la région du Sud, CC BY-SA 3.0 ; image radar de Bakassi, DLR, CC BY 3.0). Détail et liens dans `credits.md`, crédits verticaux à l'écran.
- Contrôle (planches toutes les 0,5 s, 2 rendus). Corrigé : la révélation était centrée sur la bouche ; l'envol du portrait laissait voir un rectangle ; l'encoche du téléphone cachait la tête sur la fiche de fin ; « CONSTITUTION » sortait du cadre ; vides entre les scènes (11,0 s et 17,0 s) ; la frise affichait des années intermédiaires (1988, 2021…). Restent des recouvrements d'environ 0,2 s pendant que les fiches glissent (19 s, 22 s) : ils sont volontaires.
- Fin : `CAPTURE = null` donc fiche provisoire avec le portrait. À remplacer par la vraie capture une fois le récit publié (voir l'en-tête de `biya-fin.tsx`).
