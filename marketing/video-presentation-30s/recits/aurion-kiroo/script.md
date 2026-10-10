# Démo prospection · Kiro'o Games · « Le jour du couronnement » : AURION (30 s)

> Rédigé le 2026-10-05. **Statut : livré le 2026-10-05 en version 59 s (v1), voir etat.md. Le découpage final 59 s est dans `src/prospects/AurionKiroo.tsx`.**
> Cas particulier : ce n'est pas un récit AFROBACK. Vidéo promo verticale du jeu **Aurion : L'Héritage des Kori-Odan** (Kiro'o Games, Yaoundé), façon conte de griot, comme démo de prospection (même famille que les démos Boussard, Dawnice, MonsterQuad).
> Aucun fait au-delà des sources ci-dessous. Images : celles fournies par Yannick (`C:\Users\Yannico\Downloads\ORION\`), illustrations officielles du jeu et du comic, propriété de Kiro'o Games.

## Sources des faits

| Fait utilisé | Source |
|---|---|
| Enzo Kori-Odan, prince de Zama. Juste avant son couronnement (et son mariage avec Erine Evou de Soma), il est renversé et exilé de son palais par un coup d'État mené par son beau-frère (le frère d'Erine) | Wikipédia EN, « Aurion: Legacy of the Kori-Odan » |
| Le couple part dans d'autres nations chercher des alliés contre l'usurpateur | Wikipédia EN |
| Enzo invoque l'Aurion, une énergie ancienne, des pouvoirs ancestraux | Wikipédia EN ; aurionthegame.com (« une énergie appelée L'Aurion ne réagit qu'à ceux qui cherchent des réponses, en les connectant à leurs ancêtres ») |
| Planète Aurioma | aurionthegame.com |
| Kiro'o Games, studio de Yaoundé (Cameroun) ; éditeur Steam : Plug In Digital | aurionthegame.com, Wikipédia |
| Plateformes : PC (Steam, sortie 14/04/2016), Xbox One et Xbox Series X\|S (22/05/2024), Kiroo Shop | Wikipédia, Xbox Store, aurionthegame.com |
| Titre FR : « Aurion : L'Héritage des Kori-Odan » | aurionthegame.com, affiche fournie |

**Point de vigilance** : le site officiel actuel nomme le couple **Enkwo et Ewineh Kori-Odan** (couronnés le jour de leur mariage), alors que le jeu de 2016 (Wikipédia) dit **Enzo et Erine**. Le script suit la version du jeu (Enzo/Erine, coup d'État avant le couronnement). À valider par Yannick.

---

## 0. Fiche technique

| Élément | Choix |
|---|---|
| Durée | 30 s, 9:16, 1080 × 1920, 30 i/s |
| Angle | **« Le jour du couronnement »** : le griot raconte la seule journée qui fait basculer la vie d'Enzo (couronne → trahison → exil → Aurion → reconquête), puis invite à jouer. Différent des vidéos AFROBACK (pas de carte, pas de fiche app) |
| Ton | Conte épique, braises, rouge et or. Plus « action » que Ngan Medza : coupes plus sèches à partir de la trahison (10,9 s) |
| Palette | Noir `#0A0706` · rouge Aurion `#C8281E` · or `#F0C36B` · braise `#FF7A2A` · violet aura `#7A3FB8` (scène Aurion uniquement) |
| Typo | Cinzel (mots qui percutent) · Manrope (sous-titres karaoké) |
| Images | A = couronnement (`1_QKFk…webp`, 720×1019) · B = duo dans les flammes (`0_AOb0…jpg`, 764×1080) · C = couverture comic Vol. 02 (`71PEf…jpg`, 700×1000) · D = Enzo en armure, escalier (`capture-decran-2016…avif`, 1215×812) · E = capture 3D du couple face au paysage (`images (3).jfif`, 500×301, très basse définition) · F = saut, aura violette, créature aux yeux rouges (`images (4).jfif`, 554×554) · G = icône chibi à la dague (`images (2).jfif`, 447×447) · Logo (`logo (1).png`, 187×80, trop petit) |
| Mention honnêteté | Dès 0,3 s, en bas : « Univers du jeu Aurion · Kiro'o Games ». En fin : « Illustrations © Kiro'o Games » |

## 1. Musique et voix

- Musique : `BG Music\Baobab Oath (1).mp3` à partir de **52,0 s** (2 fenêtres calmes à -23/-22 dB RMS, puis la pleine entrée à 56,0 s, soit **4,0 s dans la vidéo**, juste avant que la tension monte ; le niveau reste stable vers -14 dB ensuite). Volume 0,30, baisse sous la voix (script de mixage).
- Voix : griot ElevenLabs habituelle, 10 répliques, 68 mots (voir `voix-off.md`).
- Effets sonores : aucun obligatoire. Option : `SFX\aurion-kiroo\fissure.mp3`, environ 1 s, craquement sec de pierre ou de métal suivi d'un impact grave, posé à 10,6 s (fissure de la couronne).

---

## 2. Script scène par scène

### Scène 1 · « Écoute. » (0,0 à 1,6 s) · accroche
- **Cadrage** : noir, un rai de lumière vertical s'ouvre au centre (celui de l'image A).
- **Animation** : l'image A apparaît dans le rai (fondu 0,3 s), plan serré sur la **couronne** (pierre rouge centrale). Braises (`Embers`) qui montent, `Grain`.
- **Texte** : « **ÉCOUTE.** » (Cinzel 150, or, `PunchWord`) à 0,3 s. En bas (au-dessus de 380 px) : « Univers du jeu Aurion · Kiro'o Games ».
- **Voix** : 1.
- **Transition** : la couronne descend d'un cran (Ken Burns vers le bas) → scène 2 sans coupe.

### Scène 2 · Le jour du couronnement (1,6 à 4,8 s)
- **Cadrage** : image A, la caméra descend lentement des mains à la couronne puis au visage dans la lumière (zoom 1,25 → 1,1).
- **Animation** : lumière qui pulse dans le rai, poussière dorée (`Particles`).
- **Texte** : « **LE JOUR DU COURONNEMENT** » (Cinzel 90, ivoire, `LetterDrop`) à 2,0 s ; « Zama » petit, or, à 3,4 s.
- **Voix** : 2.
- **Transition** : flash orangé doux (pas blanc) → B.

### Scène 3 · Enzo et Erine (4,8 à 7,8 s)
- **Cadrage** : image B (duo dans les flammes). Plan 3A (4,8 à 6,3 s) : gros plan sur le visage de l'homme à droite. Plan 3B (6,3 à 7,8 s) : panoramique vers la femme à gauche.
- **Animation** : `Embers` denses + `Flame` en bas du cadre, légère parallaxe (image à 1,15, braises devant à vitesse double).
- **Texte** : « **ENZO KORI-ODAN** » (Cinzel 100, or) à 4,9 s ; « **ERINE** » (Cinzel 100, rouge braise) à 6,4 s, chaque nom posé près du personnage.
- **Voix** : 3.
- **Transition** : coupe sur le temps → A.

### Scène 4 · Quelques instants avant (7,8 à 10,9 s)
- **Cadrage** : retour sur A, très gros plan sur les mains qui tiennent la couronne, ralenti (zoom très lent).
- **Animation** : le son et l'image « retiennent leur souffle » : désaturation progressive, vignette qui se resserre (`Vig`). À 10,6 s, une **fissure** (tracé SVG dorée puis rouge) traverse la couronne en diagonale.
- **Texte** : sous-titre karaoké « Mais, quelques instants avant le couronnement… ».
- **Voix** : 4.
- **Transition** : `Shake` sur la fissure, écran rouge sombre (une seule fois, pas de flash blanc).

### Scène 5 · Trahison (10,9 à 13,9 s)
- **Cadrage** : image A teintée rouge, la couronne **bascule** (rotation 8°, glisse hors cadre vers le bas, zoom 1,3 pour éviter les coins noirs).
- **Animation** : `Shake`, braises qui s'éteignent.
- **Texte** : « **TRAHISON.** » (Cinzel 160, rouge `#C8281E`, `PunchWord`) à 11,0 s ; karaoké « Le frère d'Erine s'empare du trône. »
- **Voix** : 5.
- **Transition** : coupe sèche → D.

### Scène 6 · Chassé de son palais (13,9 à 16,7 s)
- **Cadrage** : image D (Enzo en armure, escalier derrière). Plan cadré sur le visage puis panoramique vers l'escalier à gauche (impression qu'il quitte le palais). L'image est en paysage : on la cadre à 2,4× en hauteur, on ne montre qu'une bande verticale (visage → escalier).
- **Animation** : `Fog` qui traverse, tons refroidis.
- **Texte** : « **CHASSÉ** » (Cinzel 140, ivoire) à 14,3 s ; « de son propre palais » (Manrope) dessous.
- **Voix** : 6.
- **Transition** : la brume devient violette → F.

### Scène 7 · L'Aurion (16,7 à 19,7 s)
- **Cadrage** : image F (saut, aura violette), zoom avant rapide 1,0 → 1,35 centré sur le personnage, les yeux rouges de la créature restent en haut à droite.
- **Animation** : halo or qui pulse autour du personnage, `Particles` dorées qui montent en spirale, `Diamonds` en éclats. Le logo AURION intégré à l'image (bas droite) est masqué par le zoom pour ne pas faire doublon.
- **Texte** : « **L'AURION** » (Cinzel 150, or lumineux) à 17,3 s ; « la force des ancêtres » (Manrope, ivoire) à 18,5 s.
- **Voix** : 7.
- **Transition** : éclat doré qui balaye l'écran (wipe) → C.

### Scène 8 · Chercher des alliés (19,7 à 23,6 s)
- **Plan 8A (19,7 à 21,9 s)** : image C (comic Vol. 02), recadrée sans le bandeau « Volume 02 ». Panoramique du bas (Erine, lame en avant) vers le haut (Enzo en saut). Lignes de vitesse du comic accentuées par un léger zoom.
- **Plan 8B (21,9 à 23,6 s)** : image E (capture 3D du couple face au paysage) en **bande cinéma** au centre (1080 × 650, fond flou de la même image derrière), car elle est en 500 × 301. Lent travelling latéral.
- **Texte** : karaoké « Avec Erine, il part chercher des alliés dans d'autres nations. » ; « **D'AUTRES NATIONS** » (Cinzel 80) au-dessus de la bande à 22,3 s.
- **Voix** : 8.
- **Transition** : fondu au noir rapide.

### Scène 9 · Son trône (23,6 à 25,6 s)
- **Cadrage** : image B, très gros plan sur l'œil d'Enzo (le reflet rouge), zoom avant.
- **Animation** : `Embers` qui repartent, la flamme du bas remonte.
- **Texte** : « **SON TRÔNE.** » (Cinzel 150, or, `PunchWord`) à 24,4 s. Pas de sous-titre (déjà affiché).
- **Voix** : 9.
- **Transition** : dézoom continu vers l'image B entière → fin.

### Scène 10 · Carte de fin (25,6 à 30,0 s)
- **Cadrage** : image B entière, assombrie à 40 % en fond ; le titre de l'affiche (AURION + « L'Héritage des Kori-Odan ») sert de logo (recadré depuis B, plus net que `logo (1).png`).
- **Animation** : titre qui se pose (`popScale`), lueur rouge du joyau, braises.
- **Texte** (tout entre 250 px et 1540 px) :
  - « **À TOI DE VIVRE LA LÉGENDE** » (Cinzel 64) à 25,8 s
  - logo AURION · « L'Héritage des Kori-Odan » à 26,6 s
  - « **aurionthegame.com** » (Manrope 600, or) à 27,4 s
  - « PC (Steam) · Xbox One · Xbox Series X|S » à 27,8 s
  - « Kiro'o Games · Yaoundé, Cameroun » à 28,2 s
  - « Illustrations © Kiro'o Games » (petit, 50 % d'opacité)
- Option (à valider) : l'icône chibi G en coin arrondi, façon icône d'application, à côté de « Kiro'o Games ».
- **Voix** : 10.
- **Pas** de logo AFROBACK, **pas** d'afroback.app.
