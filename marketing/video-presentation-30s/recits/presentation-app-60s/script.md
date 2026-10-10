# AFROBACK · Présentation de l'app (60 s) · « Tu connais… ? »

> **À NE PUBLIER QU'UNE FOIS L'APP EN LIGNE SUR LES DEUX STORES (App Store ET Google Play).** La fin affiche les badges officiels « Télécharger dans l'App Store » et « Disponible sur Google Play » : décision de Yannick du 2026-10-03, vidéo prévue pour le jour de la publication. Exception assumée à la règle habituelle « jamais Disponible sur… tant que ce n'est pas vrai ». Règle permanente de Yannick : les badges des stores figurent toujours dans ses vidéos de promo d'app.
>
> Rédigé le 2026-10-03. **Statut : validé par Yannick, produit le 2026-10-03** (`marketing/2026-10-03_AFROBACK-presentation-app-60s_v1.mp4`). Écarts au montage (départs réels des voix, Communauté, audio, enfants) : voir `etat.md`.
> Dossier : `recits/presentation-app-60s/` · Composition prévue : `AfrobackPresentation60s` (`src/recits/Presentation60s.tsx`).
> Différent des deux présentations 30 s existantes (`marketing/2026-09-30_script-motion-design-presentation-app-30s.md`, MP4 v1/v2) : pas de rafale de visages, pas de « zoom à travers le téléphone » en chaîne, pas de LIS / ÉCOUTE / REGARDE en rafale, pas d'abonnement ni de Mobile Money, pas de Marché. Ici, une **question choc**, puis le **manque**, puis AFROBACK comme réponse.

---

## Angle (une seule idée forte) : « le livre aux pages blanches »

On ouvre sur un **manuel d'histoire générique** (gris, froid, désaturé, sans titre réel). Il connaît Napoléon, Louis XIV, l'alphabet latin. Quand on tourne la page vers nos héros, la page est **blanche**. AFROBACK arrive et **remplit les pages blanches d'or** : chaque pilier de l'app est une page dorée qui devient un écran du téléphone. À la fin, le livre se referme et devient le téléphone.

Fil graphique : **gris (ce qu'on t'a raconté) contre or (ce qu'on ne t'a pas raconté)**. Toute la première partie joue sur ce contraste, la seconde est entièrement chaude.

---

## 0. Fiche technique

| Élément | Choix |
|---|---|
| Durée | **60 s exactement** (1800 images) |
| Format | **9:16 vertical, 1080 × 1920**, 30 i/s |
| Structure d'énergie | 0-20 s : tension (questions, manque) · **20 s : relance 1, le drop sur le logo** · 20-40 s : tour des piliers, rythme vif · **40 s : relance 2, « Tout est là »** · 40-52 s : communauté, enfants, gratuit · **52-60 s : promo finale (8 s)** |
| Rythme | Changement visuel **au moins toutes les 2 s** (souvent toutes les 1 à 1,5 s) |
| Zones sûres | Rien d'important dans les 250 px du haut et les 380 px du bas (zone utile y = 250 à 1540) |
| Lisible sans le son | Chaque phrase de la voix a son équivalent à l'écran (titre en gros ou sous-titre karaoké) |
| Palette | Gris « manuel » `#8C8A86` / papier gris `#D9D6CF` / encre grise `#4A4844` (partie 1 seulement) · noir chaud `#0B0906` · or `#F0C36B` · or pâle `#F7D98B` · ivoire `#FFF4E0` · terracotta `#E3A277` |
| Typographies | **Cinzel** (questions, noms, mots qui percutent) · **Manrope** (phrases, sous-titres) · pour le manuel gris : Manrope 500, gris, sobre |
| Images | Portraits AFROBACK `public/heros/` (Um Nyobè, Nzinga, Njoya, Manu Dibango) · illustrations `public/img/` (Ngan Medza, géants Sao, Nchare Yen, palais de Foumban, Nguon, trône Mandu Yenu, Ebolowa) · **vraies captures de l'app** (liste en §4) dans un téléphone (`src/phone.tsx`) |
| Épilepsie | Aucun flash blanc plein. Les « éclats » sont dorés, partiels, jamais répétés plus de 2 fois par seconde |

---

## 1. Musique et voix off

**Musique** : `BG Music\Legends by the Fire.mp3` (version sans « (1) »), lue **à partir de 8,4 s du fichier**, sur 60 s (8,4 → 68,4 s du fichier). Mesure ffmpeg (RMS par demi-seconde) :
- de 8,4 à 28,0 s du fichier (**0 à 19,6 s de la vidéo**) : niveau moyen et retenu (-17 à -23 dB), parfait sous les questions et le manque ;
- à **28,5 s du fichier** (**20,1 s de la vidéo**) : **montée franche** (-17 → -13 dB, puis -12 à -13 dB tenus) : elle tombe pile sur le drop du logo AFROBACK (relance 1), sans effet ajouté ;
- de 52 à 60 s de la vidéo (60,4 à 68,4 s du fichier) : section pleine (-13 à -16 dB), fondu de sortie de 1,4 s géré par le mixage.
- Relance 2 (40 s) : la musique n'a pas de rupture naturelle à cet endroit. En phase 2, ajout d'un **creux de musique de 0,5 s** (39,3 → 39,8 s, volume à 15 %) puis retour plein à 39,8 s sur « Tout est là » : petite évolution rétrocompatible du script de mixage (champ optionnel), pas d'effet sonore à fournir.
- Pas besoin de boucle ni d'enchaînement : les 4 pistes de `BG Music` durent toutes plus de 3 min 55 (Baobab Oath 4 min 20 / 4 min 27, Legends by the Fire 3 min 56 / 5 min 21).
- Limite honnête : la vidéo Ruben Um Nyobè démarre sa musique à 57,5 s de ce même fichier. Les 10 dernières secondes de cette présentation (49 à 60 s) reprennent donc le passage qui ouvre la vidéo Ruben. Alternative si Yannick préfère à l'oreille : `Baobab Oath.mp3` (jamais utilisée), mais elle a un silence complet de 8 à 12,9 s et sa montée ne tombe pas à 20 s sans couper la piste.

**Voix off** : la voix griot ElevenLabs habituelle, **18 répliques, 134 mots**, chaque créneau à **2,7 mots/s ou moins** (leçon Nzinga). Légèrement sous la fourchette 140-160 mots, volontairement : l'accroche doit claquer en 2 s, les listes (« nos héros, nos légendes… ») demandent des pauses, et la fin doit laisser respirer les badges. Détail réplique par réplique dans `voix-off.md`.

> Tu connais Napoléon ?
> Mais tu connais Ruben Um Nyobè ?
> Louis Quatorze ? Mais la reine Nzinga ?
> L'alphabet latin ? Mais l'écriture du roi Njoya ?
> On nous a raconté l'histoire des autres.
> Nos héros, nos légendes, nos traditions ? Silence.
> Um Nyobè : un nom interdit, plus de trente ans.
> Alors voici AFROBACK. Le retour aux origines.
> Nos héros africains, racontés comme le ferait un griot.
> Lis leur histoire, chapitre après chapitre. Ou écoute-la.
> Entre dans nos mythes : le serpent Ngan Medza, les géants Sao…
> Découvre nos villages, nos palais, nos rites et nos objets sacrés.
> Tout est là. Dans ta poche.
> Rejoins la communauté : aime, commente, partage avec les tiens.
> Et transmets-les à tes enfants, dans leur propre espace.
> Commencer ne te coûte rien.
> Télécharge AFROBACK. Disponible sur l'App Store et Google Play.
> Nos histoires t'attendent. Rejoins-nous sur AFROBACK.

**Effets sonores** : **aucun à fournir.** La musique porte le drop à 20 s ; le creux de 40 s se fait au mixage ; les impacts de texte sont visuels (secousse, `PunchWord`).

---

## 2. Tableau temps → scène

| Temps (s) | Scène | Voix (n°) |
|---|---|---|
| 0,0 → 2,0 | 1 · Accroche : « TU CONNAIS NAPOLÉON ? » sur le manuel gris | 1 |
| 2,0 → 4,2 | 2 · « MAIS TU CONNAIS… RUBEN UM NYOBÈ ? » : la page grise se déchire, portrait doré | 2 |
| 4,2 → 9,9 | 3 · Deux autres questions : Louis XIV / Nzinga (3A), alphabet latin / Njoya (3B) | 3, 4 |
| 9,9 → 12,6 | 4 · « L'histoire des autres » : le manuel feuillette ses pages grises | 5 |
| 12,6 → 16,4 | 5 · « Nos héros. Nos légendes. Nos traditions. » puis pages blanches : « SILENCE. » | 6 |
| 16,4 → 20,1 | 6 · Le nom interdit : le portrait d'Um Nyobè s'efface dans le blanc, puis noir | 7 |
| 20,1 → 23,4 | 7 · **RELANCE 1 · DROP** : le logo AFROBACK remplit les pages d'or, « Retour aux origines » | 8 |
| 23,4 → 26,8 | 8 · Pilier Héros : téléphone, catalogue, fiche | 9 |
| 26,8 → 30,6 | 9 · Lis / Écoute : lecteur par chapitre, lecteur audio | 10 |
| 30,6 → 34,9 | 10 · Mythes : liste puis Ngan Medza et les géants Sao plein écran | 11 |
| 34,9 → 39,8 | 11 · Découverte : liste puis Ebolowa, palais de Foumban, Nguon, trône Mandu Yenu | 12 |
| 39,8 → 42,2 | 12 · **RELANCE 2** : « TOUT EST LÀ. » : les pages dorées convergent dans le téléphone | 13 |
| 42,2 → 45,6 | 13 · Communauté : fil réel, cœur, commentaire, partage | 14 |
| 45,6 → 49,6 | 14 · Espace enfants : « Qui est-ce ? » puis accueil enfant | 15 |
| 49,6 → 52,0 | 15 · « GRATUIT POUR COMMENCER » | 16 |
| 52,0 → 60,0 | 16 · **Promo finale (8 s)** : « TÉLÉCHARGE AFROBACK », badges App Store + Google Play, logo, afroback.app | 17, 18 |

---

## 3. Script scène par scène

### Scène 1 · « Tu connais Napoléon ? » (0,0 à 2,0 s) · ACCROCHE
- **Cadrage** : dès la première image, une **double page de manuel scolaire** gris clair plein cadre, légèrement inclinée (-3°), lumière froide de néon. Lignes de texte factices floues (traits gris, aucun mot lisible : on n'invente pas de manuel réel). En haut de page gauche, un pictogramme au trait gris : un **bicorne** (aucun portrait, aucune image d'archive).
- **Caméra** : dolly-in rapide 1,00 → 1,08 (rampe « expo out »), micro-secousse à 0,15 s.
- **Texte animé** : à 0,15 s, « **TU CONNAIS** » (Cinzel 96 pt, gris encre `#4A4844`) tape sec, puis à 0,6 s « **NAPOLÉON ?** » (Cinzel 140 pt, gris) en `PunchWord` (140 % → 100 % en 4 images). Au centre (y ≈ 820 à 1100). À 1,3 s, une petite **coche grise** « ✓ » se trace à côté du mot (on le connaît tous).
- **Voix off** : « Tu connais Napoléon ? » (réplique 1, départ 0,15 s)
- **Son** : la musique est déjà là (pas d'intro), impact visuel synchronisé sur « Napoléon ».
- **Transition** : à 1,9 s, un **coin de page se soulève** (lueur dorée derrière) → scène 2.

### Scène 2 · « Mais tu connais Ruben Um Nyobè ? » (2,0 à 4,2 s)
- **Plan 2A (2,0 à 2,8 s)** : la page grise **se déchire** en diagonale (bord de papier irrégulier, fibres), derrière : fond noir chaud et **lumière dorée**. « **MAIS TU CONNAIS…** » (Manrope ExtraBold 52 pt, ivoire) glisse en haut (y ≈ 420).
- **Plan 2B (2,8 à 4,2 s)** : le **portrait AFROBACK** `heros/ruben-um-nyobe.jpg` apparaît dans la déchirure (`Illu`, zoom 1,25 → 1,12 sur le regard, halo d'anneaux dorés animés en surimpression). « **RUBEN UM NYOBÈ ?** » (Cinzel 120 pt, or, deux lignes) `LetterDrop` à 3,0 s, reflet lumineux qui le traverse à 3,6 s. Contraste immédiat : tout ce qui est gris disparaît, tout devient or.
- **Voix off** : « Mais tu connais Ruben Um Nyobè ? » (réplique 2, 2,0 s)
- **Transition** : cut sec sur le temps à 4,2 s.

### Scène 3 · Deux autres questions (4,2 à 9,9 s)
Même grammaire répétée deux fois, de plus en plus vite : **moitié haute grise** (ce qu'on connaît), **moitié basse dorée** (ce qu'on ignore).

**Plan 3A (4,2 à 6,8 s) · Louis XIV / Nzinga**
- **Écran partagé horizontal** (ligne de séparation dorée qui se trace de gauche à droite en 0,3 s).
- **Haut (y 300 à 900), gris** : pictogramme au trait d'une **couronne**, « **LOUIS XIV ?** » (Cinzel 90 pt gris) + coche grise à 4,9 s.
- **Bas (y 960 à 1500), or** : portrait `heros/reine-nzinga.jpg` qui glisse depuis le bas (rampe, rebond 4 %), « **LA REINE NZINGA ?** » (Cinzel 96 pt or) en `PunchWord` à 5,6 s ; mention discrète en Manrope 30 pt ivoire 70 % : « Ndongo et Matamba · Angola · XVIIᵉ siècle ».
- **Voix off** : « Louis Quatorze ? Mais la reine Nzinga ? » (réplique 3, 4,3 s)
- **Transition** : à 6,7 s, la moitié grise **se froisse** et s'efface ; la moitié dorée monte.

**Plan 3B (6,8 à 9,9 s) · Alphabet latin / Njoya**
- **Haut, gris** : « **A B C** » géant en gris (Manrope 160 pt), les lettres tombent une à une (`LetterDrop`, 6,8 à 7,4 s), petit libellé « L'ALPHABET LATIN ? » + coche grise à 7,6 s.
- **Bas, or** : portrait `heros/sultan-njoya.jpg` (zoom lent sur le regard), « **L'ÉCRITURE DU ROI NJOYA ?** » (Cinzel 80 pt or, deux lignes) à 8,3 s ; mention Manrope 30 pt : « A ka u ku · inventée par Njoya, de 1896 à 1918 » (récit : syllabaire final baptisé A ka u ku, travail entre 1896 et 1918).
- **Fidélité** : **aucun signe de l'écriture bamoun dessiné** (on ne fabrique pas de faux caractères). Seuls le nom et les dates du récit apparaissent.
- **Voix off** : « L'alphabet latin ? Mais l'écriture du roi Njoya ? » (réplique 4, 6,8 s)
- **Transition** : les trois portraits dorés (Um Nyobè, Nzinga, Njoya) se réduisent en **trois médaillons** qui s'alignent (9,4 à 9,9 s) → scène 4.

### Scène 4 · « On nous a raconté l'histoire des autres » (9,9 à 12,6 s)
- **Cadrage** : retour au **manuel gris** vu de trois quarts, posé sur une table sombre.
- **Animation** : les pages **se feuillettent toutes seules** très vite (une page tous les 0,15 s, flou de mouvement, souffle de papier visuel), toutes grises, pleines de lignes floues et de pictogrammes gris (bicorne, couronne, colonnes antiques, caravelle). Les trois médaillons dorés de la scène 3 **flottent au-dessus**, cherchant une place, sans en trouver.
- **Caméra** : dolly latéral lent de gauche à droite + rotation 2°.
- **Texte animé** : « **L'HISTOIRE DES AUTRES** » (Cinzel 92 pt, gris clair `#D9D6CF`, ombre noire) percute à 10,9 s sur deux lignes ; « On nous a raconté » en Manrope 46 pt au-dessus, glissement à 10,0 s.
- **Voix off** : « On nous a raconté l'histoire des autres. » (réplique 5, 9,9 s)
- **Transition** : le feuilletage **s'arrête net** à 12,5 s sur une double page… blanche.

### Scène 5 · « Nos héros, nos légendes, nos traditions ? Silence. » (12,6 à 16,4 s)
Trois images dorées très brèves, chacune « posée » sur la page blanche puis **aspirée par le blanc** (elles se dissolvent en poussière dorée vers le haut, `Particles`).
- **Plan 5A (12,6 à 13,5 s)** : portrait `heros/manu-dibango.jpg` en petit cadre doré sur la page + « **NOS HÉROS** » (Cinzel 100 pt or).
- **Plan 5B (13,5 à 14,4 s)** : vignette de `img/mythe-ngan-medza-beti.jpg` + « **NOS LÉGENDES** ».
- **Plan 5C (14,4 à 15,3 s)** : vignette de `img/nguon.jpg` + « **NOS TRADITIONS** ».
- **Plan 5D (15,3 à 16,4 s)** : la double page est **entièrement blanche** (blanc cassé, pas de blanc pur plein écran : papier `#EDEAE3`, vignette sombre sur les bords). Au centre, en petit, gris : « **SILENCE.** » (Cinzel 70 pt), qui apparaît à 15,5 s **sans aucun mouvement** (seul plan immobile de la vidéo, 0,9 s, pour que le silence se voie).
- **Voix off** : « Nos héros, nos légendes, nos traditions ? Silence. » (réplique 6, 12,6 s)
- **Son** : la musique est encore retenue à cet endroit (niveau naturellement bas de la piste).

### Scène 6 · Le nom interdit (16,4 à 20,1 s)
Différent de la vidéo Ruben Um Nyobè (pas de barre de censure, pas de tampon « INTERDIT », pas de béton) : ici, **le blanc de la page avale le nom**.
- **Plan 6A (16,4 à 18,4 s)** : sur la page blanche, le portrait d'Um Nyobè revient, puis **se décolore** et s'efface lentement dans le papier (désaturation + opacité, 16,6 → 18,2 s). Son nom « **RUBEN UM NYOBÈ** » en Cinzel 90 pt doré, écrit sous le portrait, **perd ses lettres une à une** (elles deviennent blanches et disparaissent).
- **Plan 6B (18,4 à 19,6 s)** : à la place, en Manrope ExtraBold 48 pt, encre grise : « **Au Cameroun, son nom fut interdit** » puis, en Cinzel 120 pt terracotta : « **PLUS DE 30 ANS** » (18,9 s) ; mention petite : « jusqu'à la loi de 1991 » (récit : interdiction levée par la loi n° 91/022 du 16 décembre 1991).
- **Plan 6C (19,6 à 20,1 s) · break** : tout s'éteint vers le **noir**, il ne reste qu'un **point doré** au centre qui palpite (scale 1 → 1,3).
- **Voix off** : « Um Nyobè : un nom interdit, plus de trente ans. » (réplique 7, 16,4 s)
- **Transition** : le point doré **explose** à 20,1 s, pile sur la montée de la musique.

### Scène 7 · RELANCE 1 · AFROBACK (20,1 à 23,4 s)
- **Plan 7A (20,1 à 21,4 s)** : **onde de choc dorée** circulaire + 40 étincelles (`Particles`, `Diamonds`), le **médaillon AFROBACK** (`img/logo-medaillon.jpg` ou `afroback-logo.png`) jaillit (`popScale` 0 → 1,15 → 1). Secousse d'impact (3 images, 12 px). « **AFROBACK** » (Cinzel 120 pt or) claque lettre par lettre sous le logo (`LetterDrop`, 25 ms de décalage).
- **Plan 7B (21,4 à 23,4 s)** : la caméra recule : le logo est posé au centre de **la double page, qui se remplit d'or** (motifs géométriques africains, losanges et chevrons dorés qui se dessinent du centre vers les bords, 21,4 → 22,6 s). Le blanc du « silence » est vaincu. « **Retour aux origines** » (Manrope ExtraBold 50 pt ivoire) se révèle par masque à 22,0 s.
- **Voix off** : « Alors voici AFROBACK. Le retour aux origines. » (réplique 8, 20,2 s)
- **Transition** : la page dorée de droite **se tourne** vers la caméra et devient l'écran d'un **téléphone** (match cut, 23,2 → 23,4 s).

### Scène 8 · Pilier Héros (23,4 à 26,8 s)
- **Plan 8A (23,4 à 25,0 s)** : téléphone noir mat (ombre dorée) au centre, légère rotation Y 15° → 0°. Écran : **vraie capture du catalogue Héros** (cartes portraits), qui **défile** vers le haut (capture longue ou enregistrement d'écran). Libellé au-dessus du téléphone : « **LES HÉROS** » (Cinzel 80 pt or, y ≈ 330).
- **Plan 8B (25,0 à 26,8 s)** : un doigt (cercle blanc 60 % + onde) touche une carte → **fiche héros** (capture existante `img/capture-app-ruben-um-nyobe.png` ou celle de Reine Nzinga). Push-in de caméra 1,0 → 1,12 sur la fiche.
- **Sous-titre karaoké** (y ≈ 1420) : « Nos héros africains, racontés comme le ferait un griot. »
- **Voix off** : réplique 9 (23,4 s)
- **Transition** : glissement latéral de page (swipe) vers la scène 9.

### Scène 9 · Lis. Écoute. (26,8 à 30,6 s)
- **Plan 9A (26,8 à 28,8 s) · LIS** : écran = **lecteur de récit paginé par chapitre** (récit de la **Reine Nzinga**, en accès libre, donc capturable en invité). Animation : la page « Chapitre 1 » glisse vers la gauche et laisse place au « Chapitre 2 » (deux captures enchaînées). Gros mot à gauche du téléphone : « **LIS.** » (Cinzel 110 pt ivoire, `PunchWord` à 27,0 s).
- **Plan 9B (28,8 à 30,6 s) · ÉCOUTE** : écran = **lecteur audio**. « **ÉCOUTE.** » (Cinzel 110 pt or) à 29,3 s. Onde sonore dorée animée qui sort du téléphone (barres qui suivent l'énergie réelle de la voix au mixage).
  - Le lecteur audio est réservé aux membres en mode invité : **capture à fournir par Yannick** depuis son compte (voir §4). Sinon : fiche héros avec le bouton « Écouter » qui pulse, et l'onde dorée par-dessus.
- **Sous-titre karaoké** : « Lis leur histoire, chapitre après chapitre. Ou écoute-la. »
- **Fidélité** : la narration audio n'existe pas pour tous les héros : la voix dit « ou écoute-la » sans « tous » ; à l'écran, on montre un héros qui a vraiment sa narration (Nzinga ou Um Nyobè).
- **Voix off** : réplique 10 (26,8 s)

### Scène 10 · Mythes (30,6 à 34,9 s)
- **Plan 10A (30,6 à 31,8 s)** : écran = **liste Mythologie** (capture : bouton « Mythes » de l'accueil). « **LES MYTHES** » au-dessus du téléphone.
- **Plan 10B (31,8 à 33,4 s)** : la vignette de Ngan Medza **sort de l'écran** et grandit jusqu'au plein cadre : `Illu` sur `img/mythe-ngan-medza-beti.jpg` (panoramique le long du serpent), `Flame` sur les torches, `Fog`. « **NGAN MEDZA** » (Cinzel 110 pt or) à 32,4 s.
- **Plan 10C (33,4 à 34,9 s)** : cut au temps sur `img/mythe-sao-geants-kotoko.jpg` (`Illu`, contre-plongée, zoom avant) ; « **LES GÉANTS SAO** » à 33,6 s.
- **Mention à l'écran** pendant 10B et 10C (Manrope 28 pt, ivoire 70 %, y ≈ 1480) : « Légendes de tradition orale · illustrations AFROBACK ».
- **Voix off** : « Entre dans nos mythes : le serpent Ngan Medza, les géants Sao… » (réplique 11, 30,6 s)

### Scène 11 · Découverte (34,9 à 39,8 s)
- **Plan 11A (34,9 à 36,1 s)** : retour au téléphone : écran = **liste Découverte** (capture : onglet Découverte). « **LA DÉCOUVERTE** » au-dessus.
- **Plans 11B à 11E (36,1 à 39,8 s)** : **rafale de quatre images plein cadre**, une par mot de la voix, chacune avec son mouvement (`Illu`) et son libellé Cinzel 76 pt or en bas de la zone sûre :
  - 36,1 s · `img/ebolowa.jpg` → « **VILLAGES** »
  - 37,0 s · `img/palais-royal-foumban.jpg` → « **PALAIS** »
  - 37,9 s · `img/nguon.jpg` → « **RITES** »
  - 38,8 s · `img/trone-mandu-yenu.jpg` → « **OBJETS SACRÉS** »
  Chaque cut est un **balayage motif** (frise de losanges dorés en diagonale, 0,2 s).
- **Voix off** : « Découvre nos villages, nos palais, nos rites et nos objets sacrés. » (réplique 12, 34,9 s)
- **Transition** : à 39,3 s, l'image se réduit en **page dorée** ; la musique se creuse (39,3 → 39,8 s).

### Scène 12 · RELANCE 2 · « Tout est là. » (39,8 à 42,2 s)
- **Animation** : à 39,8 s (retour plein de la musique), **les pages dorées de toute la vidéo** (Héros, récit, Mythes, Découverte, logo) jaillissent de tous les côtés en **mosaïque** de 6 tuiles (arrivée décalée de 60 ms, rotation ±6°), puis **convergent dans le téléphone** au centre (41,0 → 41,6 s), qui s'illumine (halo or, onde de choc légère).
- **Texte animé** : « **TOUT EST LÀ.** » (Cinzel 120 pt ivoire) percute à 39,9 s avec secousse ; « Dans ta poche. » (Manrope ExtraBold 50 pt or) à 41,0 s.
- **Voix off** : « Tout est là. Dans ta poche. » (réplique 13, 39,8 s)

### Scène 13 · Communauté (42,2 à 45,6 s)
- **Plan 13A (42,2 à 43,8 s)** : écran = **fil Communauté réel** (capture ; seulement de vrais posts de comptes existants, rien d'inventé). Un **cœur doré** jaillit sur « aime » (42,9 s), un **bulle de commentaire** sur « commente » (43,4 s).
- **Plan 13B (43,8 à 45,6 s)** : bouton Partager → **la carte d'aperçu partagée** (lien court + image) glisse hors du téléphone vers la droite, comme envoyée « aux tiens ».
- **Texte** : « **LA COMMUNAUTÉ** » au-dessus du téléphone (pas de rafale AIME / COMMENTE / PARTAGE en gros, déjà utilisée dans la vidéo 30 s) ; sous-titre karaoké pour la phrase.
- **Voix off** : « Rejoins la communauté : aime, commente, partage avec les tiens. » (réplique 14, 42,2 s)

### Scène 14 · Espace enfants (45,6 à 49,6 s)
- **Plan 14A (45,6 à 47,4 s)** : écran = sélecteur de profils « **Qui est-ce ?** » (profil adulte + profil enfant).
- **Plan 14B (47,4 à 49,6 s)** : écran = **accueil enfant** (histoire du jour). Petites étoiles dorées autour du téléphone. « **TRANSMETS** » (Cinzel 100 pt or) à 46,0 s ; « à tes enfants » (Manrope 46 pt) dessous.
- **Captures à fournir par Yannick** (compte avec un profil enfant, non capturable en invité). À défaut : scène graphique avec `img/transmettre.jpg` (illustration de l'onboarding) et le même texte, sans faux écran.
- **Voix off** : « Et transmets-les à tes enfants, dans leur propre espace. » (réplique 15, 45,6 s)

### Scène 15 · Gratuit pour commencer (49,6 à 52,0 s)
- **Animation** : le téléphone affiche l'écran d'entrée de l'app (`img/splash.jpg` ou capture de l'onboarding « Commencer » / « Explorer sans compte »). Un **ruban doré** traverse l'écran.
- **Texte animé** : « **GRATUIT** » (Cinzel 130 pt or, `PunchWord`) à 49,8 s, « pour commencer » (Manrope ExtraBold 50 pt ivoire) à 50,4 s.
- **Fidélité** : vrai (compte gratuit et mode invité donnent accès à la Reine Nzinga, au mythe de Ngan Medza, au palais royal de Foumban et à Ebolowa, `context/AFROBACK.md`, 2026-09-29). **Aucun prix affiché.**
- **Voix off** : « Commencer ne te coûte rien. » (réplique 16, 49,6 s)

### Scène 16 · PROMO FINALE (52,0 à 60,0 s)
- **Plan 16A (52,0 à 54,2 s) · Appel à l'action** : le téléphone (accueil de l'app) remonte au tiers supérieur (y centre ≈ 700, échelle 0,8). « **TÉLÉCHARGE** » (Cinzel 90 pt ivoire) puis « **AFROBACK** » (Cinzel 120 pt or) percutent sous le téléphone (52,1 s et 52,6 s).
- **Plan 16B (54,2 à 56,0 s) · Badges officiels** : sous le titre (y ≈ 1280 à 1400), les deux **badges officiels côte à côte, même hauteur** (environ 120 px de haut, espace libre autour conforme aux guides) : à gauche « **Télécharger dans l'App Store** » (badge noir officiel Apple, version française), à droite « **DISPONIBLE SUR Google Play** » (badge officiel Google, version française). Apparition par simple **fondu + glissement de 30 px** de chaque badge entier (décalé de 0,15 s), **sans rotation, sans rebond déformant, sans lueur ni recoloration** : les guides Apple et Google interdisent de modifier les badges.
- **Plan 16C (56,0 à 60,0 s) · Signature** : le téléphone se fond dans le **médaillon AFROBACK** (même place), « Retour aux origines » (Manrope 44 pt ivoire) dessous, puis « **afroback.app** » (Manrope ExtraBold 56 pt or) à 56,6 s, au-dessus des badges qui restent affichés. Mentions légales en très petit (Manrope 20 pt, gris clair 60 %, y ≈ 1500) : « Apple, le logo Apple et App Store sont des marques d'Apple Inc. Google Play et le logo Google Play sont des marques de Google LLC. »
- **Image finale tenue** de 57,5 à 60,0 s (pour la capture d'écran par les spectateurs) : seul un léger scintillement d'étincelles autour du logo.
- **Voix off** : « Télécharge AFROBACK. Disponible sur l'App Store et Google Play. » (réplique 17, 52,0 s) · « Nos histoires t'attendent. Rejoins-nous sur AFROBACK. » (réplique 18, 55,6 s)
- **Son** : section pleine de la musique, fondu de sortie sur les 1,4 dernières secondes.

---

## 4. Images et captures à réunir en phase 2

| Besoin | Source |
|---|---|
| Portraits Um Nyobè, Nzinga, Njoya, Manu Dibango | déjà dans `public/heros/` |
| Ngan Medza, géants Sao, Ebolowa, palais de Foumban, Nguon, trône Mandu Yenu, transmettre, splash, logo | déjà dans `public/img/` |
| Catalogue Héros (défilant), fiche héros | `scripts/capture-app.mjs` (accueil → « Héros ») ; fiche Um Nyobè déjà capturée |
| Lecteur de récit Reine Nzinga, chapitres 1 et 2 | `capture-app.mjs` (récit gratuit, accessible en invité) |
| Liste Mythologie, liste Découverte, fil Communauté | `capture-app.mjs` (lecture publique) |
| **Lecteur audio** (en lecture) | **à fournir par Yannick** (capture d'écran depuis son compte : réservé aux membres en invité). Facultatif : solution de repli prévue |
| **Sélecteur « Qui est-ce ? » et accueil enfant** | **à fournir par Yannick** (compte avec un profil enfant). Facultatif : solution de repli prévue |
| Badges officiels | **Apple** : page officielle « App Store Marketing Guidelines » / outil de badges Apple (`developer.apple.com/app-store/marketing/guidelines/`, `tools.applemarketingtools.com`), badge noir « Télécharger dans l'App Store », français, SVG. **Google** : page officielle des badges Google Play (`play.google.com/intl/fr/badges/`), « DISPONIBLE SUR Google Play », français, PNG haute définition. Fichiers téléchargés tels quels, jamais redessinés ; si le téléchargement est impossible depuis ce poste, demander à Yannick de les déposer plutôt que d'imiter |

---

## 5. Points de vigilance

- **Diffusion** : uniquement le jour où l'app est réellement disponible sur les deux stores (sinon, la fin est fausse).
- **Aucun chiffre** : ni nombre d'utilisateurs, ni nombre de récits, ni prix. Le seul nombre est « plus de 30 ans » (récit d'Um Nyobè).
- **Marché non montré** (catalogue vide), **langues non montrées** (pilier pas encore disponible : la voix parle de « héros, légendes, traditions », pas de « langues »), **École des Héros non montrée** (sans contenu).
- Napoléon et Louis XIV : uniquement en texte et pictogrammes génériques, aucun portrait ni image d'archive. Le manuel scolaire est générique (pas de titre ni d'éditeur réels).
- Les portraits et illustrations sont des **créations AFROBACK**, jamais présentés comme des archives (mention à l'écran sur les mythes).
- Aucune écriture bamoun dessinée : on ne fabrique pas de faux caractères.
- Communauté : seulement des posts réels visibles dans l'app au moment de la capture.
