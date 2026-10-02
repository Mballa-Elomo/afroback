# AFROBACK · Vidéo 4 · « Le nom interdit » : Ruben Um Nyobè (30 s)

> Rédigé le 2026-10-01. Quatrième vidéo de la série AFROBACK (1 : présentation de l'app ; 2 : mythe Ngan Medza, conte nocturne ; 3 : Reine Nzinga, fil d'or et théâtre d'ombres).
> Source : `Héros/Cameroun/ruben-um-nyobe/fr.md` (récit du griot + fiche structurée). **Aucun fait ajouté** au-delà de ce récit.
> **Statut : validé par Yannick, produit le 2026-10-01** (`marketing/2026-10-01_AFROBACK-ruben-um-nyobe-30s_v1.mp4`, composition `AfrobackRecitRubenUmNyobe30s`, `src/recits/RubenUmNyobe.tsx`).
> **Écarts au montage** : les temps suivent les voix réelles : S1-S2 0-5,0 · S3 5,0-8,35 · S4 8,35-11,55 · S5 11,55-14,7 · S6 14,7-16,9 · S7 16,9-19,4 · S8 19,4-22,45 · S9 22,45-26,2 · S10 26,2-30 s. La fin est une variante de `OutroApp` (« SOUVIENS-TOI / DE CE NOM » au-dessus du téléphone, puis logo, afroback.app et « Écoute son histoire entière »). La fiche de l'app est réservée aux abonnés : en invité, pas de bouton « Écouter », l'anneau qui pulse entoure le titre.

**Angle (une seule idée forte) : le nom qu'on a voulu effacer.** Le récit se termine par « souviens-toi de ce nom qu'on a voulu faire taire pendant trente ans ». Toute la vidéo suit **son nom écrit**, d'abord caché sous une **barre de censure noire** et un tampon « INTERDIT », puis révélé, porté de document en document (registre du greffe, emblème de l'UPC, discours à l'ONU, actes du maquis), **effacé dans le béton** en 1958, et enfin **regravé en or** quand le béton se fissure (1991, 2025).
Différent des trois premières vidéos : pas de nuit à la torche ni de fleuve (Ngan Medza), pas de rafale de visages (présentation), pas de carte dorée, de fil d'or, de théâtre d'ombres ni de compteur d'années (Nzinga). Ici : **papier, encre, tampons, machine à écrire, micro des années 1950, forêt bassa, béton fissuré d'or**. Aucune figurine : le seul être humain montré est le portrait AFROBACK ; tout le reste est raconté par des **objets, des documents et la typographie**.

---

## 0. Fiche technique

| Élément | Choix |
|---|---|
| Durée | **30 s** |
| Format | **9:16 vertical, 1080 × 1920**, 30 i/s |
| Ton | **Grave, digne, tendu puis libérateur**. Jamais sensationnaliste, aucune violence montrée. Changement visuel au moins **toutes les 2 s** |
| Palette | Noir profond `#0B0806` · or `#F0C36B` · terracotta `#C2583A` (tampons) · papier ivoire vieilli `#EADFC8` · encre `#15110D` · vert forêt profond `#0E1A12` · gris béton `#6E6A64` |
| Typographies | **Cinzel** (le nom, les mots qui percutent) · **Manrope** (sous-titres, mentions) · pour la citation de l'ONU : Cinzel en minuscules italiques simulées ou Manrope 600, effet machine à écrire (pas de police externe supplémentaire) |
| Visuel principal | Le portrait AFROBACK `public/heros/ruben-um-nyobe.jpg` (visage souriant et grave, costume sombre, chemise blanche, **halo d'anneaux dorés concentriques** derrière la tête), exploré avec `Illu` (regard, dézoom), avec **anneaux dorés animés en surimpression** qui tournent lentement, calés sur ceux de l'illustration |
| Fil graphique | **Le nom « RUBEN UM NYOBÈ »** et la **barre noire de censure** : cachée (0 s), arrachée (2 s), le nom passe de document en document, est recouvert de béton (20 s), puis le béton **se fissure en veines d'or** et le nom réapparaît gravé (23 s) |
| Personnes | **Aucune silhouette, aucune figurine.** Seul le portrait. Les autres étapes sont des objets dessinés en détail (registre relié, plume, tampon à manche bois, micro à grille, machine à écrire, feuillages) |
| Honnêteté | (1) Les documents à l'écran sont des **évocations graphiques AFROBACK**, jamais des archives : mention à l'écran pendant les scènes 3 à 6. (2) La seule citation est celle du discours du 17 décembre 1952, **la seule authentifiée** par la fiche, reproduite mot pour mot. (3) Aucun bilan chiffré de la guerre (débattu dans le récit), aucune image de violence ni du corps. (4) Le portrait est une illustration AFROBACK |

---

## 1. Musique et voix off

**Musique** : `BG Music\Legends by the Fire.mp3` (encore inutilisée dans la série), lue **à partir de 57,5 s**. Mesure ffmpeg (RMS par quart de seconde, fichier en 48 kHz) :
- à **57,5 s** du fichier, attaque nette (de -21 à -12 dB) : la vidéo démarre sur un coup franc, parfait pour le tampon « INTERDIT » à 0,3 s ;
- de **76,75 à 80,0 s** du fichier (soit **19,25 à 22,5 s de la vidéo**), la musique **se creuse** (-21 à -28 dB) : silence relatif exactement sous la scène du béton « sans nom » ;
- à **80,25 s** du fichier (soit **22,75 s de la vidéo**), **remontée franche** (-12 à -11 dB) : elle tombe sur « Mais son nom revient » et les fissures d'or. Le récit trouve son élan avec la musique, sans effet ajouté.
Titre « Legends by the Fire » : son départ à 57,5 s est en plein développement, sans l'introduction « coin du feu ». Baissée sous la voix au mixage (volume 0,3, comme les vidéos précédentes), légère montée d'entrée de 0,15 s pour éviter un clic.
Alternative si Yannick préfère à l'oreille : `Legends by the Fire (1).mp3`, plus régulière (pas de creux ni de remontée marquée), à partir de 8,0 s.

**Voix off** : la voix griot ElevenLabs habituelle, **10 répliques, 72 mots**, toutes sous 2,7 mots/s par créneau (détail dans `voix-off.md`).

> Ce nom fut longtemps interdit.
> Ruben Um Nyobè. Son peuple l'appelait Mpodol.
> Greffier, syndicaliste, puis chef de l'UPC.
> À l'ONU, il réclame une date pour l'indépendance.
> Son parti est dissous. Lui entre dans la forêt.
> Trois ans, il y tient bon.
> Puis l'armée française le tue.
> On l'enterre sans nom, dans le béton.
> Mais son nom revient. Et la France reconnaît sa responsabilité.
> Souviens-toi de ce nom. Écoute son histoire sur AFROBACK.

**Effets sonores** : **aucun à fournir.** La musique porte les deux temps forts (attaque à 0 s, creux puis remontée à 19 à 23 s). Les tampons et la barre arrachée sont des chocs visuels (secousse), calés sur la musique.

---

## 2. Script scène par scène

### Scène 1 · Le nom caviardé (0,0 à 2,2 s) · ACCROCHE
- **Plan 1A (0,0 à 1,0 s)** : dès la première image, **une feuille de papier ivoire vieilli** remplit l'écran (grain, fibres, bords légèrement brûlés de lumière chaude d'une lampe hors champ). Au centre (y ≈ 900), le nom en Cinzel 130 pt, encre noire, sur deux lignes : « RUBEN UM » / « NYOBÈ ». À 0,0 s, il est **déjà recouvert de deux épaisses barres noires** (caviardage, bords irréguliers comme un feutre). Lent zoom avant (1,0 → 1,06).
- **Plan 1B (0,3 à 2,2 s)** : à 0,3 s (attaque de la musique), un **tampon terracotta « INTERDIT »** s'abat en biais (-8°) sur la feuille : `popScale` de 1,4 à 1, `Shake` court, encre qui bave légèrement sur les bords. À 1,0 s, sous la feuille, ligne en Manrope 46 pt, ivoire sur bandeau noir : « **Au Cameroun · plus de 30 ans** ».
- **Voix off** : « Ce nom fut longtemps interdit. » (réplique 1, départ 0,2 s)
- **Son** : la musique part en plein (attaque à 57,5 s du fichier).
- **Transition (1,9 à 2,2 s)** : la barre noire du haut **se décolle par le coin** comme un ruban adhésif arraché et s'envole vers la droite → scène 2 (aucun fondu au noir).

### Scène 2 · Le nom, le visage : Mpodol (2,2 à 5,0 s)
- **Plan 2A (2,2 à 3,2 s)** : les deux barres s'arrachent l'une après l'autre (2,2 s puis 2,6 s), chaque arrachement laisse s'échapper des **paillettes d'or** (`Embers` en or). Dessous, le nom n'est plus à l'encre : il est **en or** (Cinzel 130 pt, `#F0C36B`, léger relief). Le tampon « INTERDIT » pâlit à 30 %.
- **Plan 2B (3,2 à 5,0 s)** : raccord par l'or : la caméra fonce dans la lettre « O » de NYOBÈ, dont l'anneau devient **un des anneaux dorés du halo** du portrait. `Illu` zoom 2,0 centré sur les yeux, puis dézoom continu jusqu'à 1,35 (visage entier). Surimpression : **3 anneaux dorés fins** qui tournent lentement en sens opposés autour de la tête, calés sur le halo de l'illustration (centre ≈ 520 × 470 dans l'image source).
- **Texte animé** : « **MPODOL** » (Cinzel 150 pt, or, `PunchWord`) à 3,9 s, y ≈ 1250 ; dessous, à 4,3 s : « *celui qui porte la parole des siens* » (Manrope 44 pt italique, ivoire, sur dégradé sombre).
- **Voix off** : « Ruben Um Nyobè. Son peuple l'appelait Mpodol. » (réplique 2, départ 2,2 s)
- **Transition** : un **coup de tampon** hors champ : la caméra se retourne d'un mouvement rapide (whip pan vers le bas, flou de mouvement) → bureau.

### Scène 3 · Trois documents, trois vies (5,0 à 7,7 s)
Rafale de trois objets posés sur un **bureau en bois sombre** éclairé par une lampe chaude, enchaînés en **panoramiques fouettés** (0,9 s chacun). Mention fixe en bas (y ≈ 1500, Manrope 30 pt, ivoire 75 %) : « Documents : évocations graphiques AFROBACK ».
- **Plan 3A (5,0 à 5,9 s) · Le greffe** : un **grand registre relié** ouvert (dos toilé, pages lignées, colonnes, écriture illisible stylisée en traits fins, pas de faux texte lisible), une **plume** qui trace une ligne. Mot : « **GREFFIER** » (Cinzel 120 pt, ivoire) ; sous-ligne Manrope 38 pt : « aux tribunaux coloniaux ».
- **Plan 3B (5,9 à 6,8 s) · Le syndicat** : des **feuillets ronéotypés** empilés, en-tête typographique « **USCC** » (Union des syndicats confédérés du Cameroun), un trombone, un tampon rond. Mot : « **SYNDICALISTE** » (Cinzel 104 pt, ivoire) ; sous-ligne : « secrétaire général · 1947 ».
- **Plan 3C (6,8 à 7,7 s) · L'UPC** : un **emblème typographique** en relief doré « **UPC** » (Cinzel 220 pt) au centre d'un feuillet, sous-titre « Union des Populations du Cameroun » ; ligne Manrope 40 pt : « **secrétaire général · novembre 1948** ». Le feuillet glisse vers le haut et dégage un fond noir chaud strié de lumière.
- **Voix off** : « Greffier, syndicaliste, puis chef de l'UPC. » (réplique 3, départ 5,0 s)
- **Fidélité** : il n'est **jamais présenté comme fondateur** de l'UPC (le récit précise qu'il n'était pas présent le 10 avril 1948 et qu'on l'a porté à sa tête en novembre). « Chef » à la voix = « à la tête du parti comme secrétaire général », le titre exact est écrit à l'écran.
- **Transition** : les stries de lumière du fond deviennent la **grille du micro**.

### Scène 4 · New York, l'ONU (7,7 à 11,0 s)
- **Plan 4A (7,7 à 9,1 s)** : contre-plongée sur un **micro de tribune des années 1950** dessiné en détail (tête ovale à grille, monture chromée, col de cygne, socle), lumière dorée latérale, poussière en suspension. Des **ondes sonores** (arcs dorés fins) partent du micro à chaque mot de la voix. Texte : « **ONU · NEW YORK** » (Cinzel 110 pt, ivoire) à 7,9 s, puis « 17 décembre 1952 » (Manrope 44 pt, or) à 8,3 s.
- **Plan 4B (9,1 à 11,0 s)** : une **feuille tapée à la machine** monte du bas et remplit le cadre (papier ivoire, chariot de machine à écrire visible en haut). La citation **se tape lettre par lettre** (60 pt, encre noire, 5 lignes max, largeur 880 px) :
  « Nous demandons l'unification immédiate de notre pays et la fixation d'**un délai pour l'indépendance**. »
  Les mots « un délai pour l'indépendance » sont **soulignés au crayon terracotta** à 10,4 s. Source sous la feuille (Manrope 30 pt, ivoire 80 %) : « Discours à la 4e Commission de l'ONU, 17 déc. 1952 ».
- **Voix off** : « À l'ONU, il réclame une date pour l'indépendance. » (réplique 4, départ 7,7 s)
- **Fidélité** : citation reproduite **mot pour mot** depuis la fiche (seule citation authentifiée). Aucun « programme-école », aucun chiffre ajouté à la voix.
- **Transition** : la feuille se fige ; un tampon arrive du haut → scène 5.

### Scène 5 · Dissous. La forêt (11,0 à 14,5 s)
- **Plan 5A (11,0 à 12,5 s)** : retour sur l'**emblème « UPC »** de la scène 3 ; à 11,2 s, un **lourd tampon à manche de bois** s'abat : « **DISSOUTE · 13 JUILLET 1955** » (terracotta, Cinzel 70 pt, bordure double), `Shake` fort. À 11,8 s, sous l'emblème, Manrope 40 pt : « Les autres dirigeants partent en exil. »
- **Plan 5B (12,5 à 14,5 s)** : la feuille **se déchire en deux** verticalement et s'écarte comme un rideau de papier : derrière, **la forêt bassa**. Forêt dessinée en **5 couches de parallaxe** (troncs droits avec contreforts, lianes, grandes feuilles découpées, fougères au premier plan), vert profond presque noir, **rais de lumière dorée** qui tombent de la canopée, `Fog` bas. La caméra avance lentement entre les couches. Texte : « **LUI : LA FORÊT.** » (Cinzel 120 pt, or) à 13,2 s.
- **Voix off** : « Son parti est dissous. Lui entre dans la forêt. » (réplique 5, départ 11,0 s)
- **Fidélité** : dissolution par décret du 13 juillet 1955 ; exil des autres dirigeants ; Um Nyobè « ne fuit pas hors du pays », il entre dans le maquis bassa.
- **Transition** : la caméra continue d'avancer, une feuille passe devant l'objectif (volet naturel) → scène 6.

### Scène 6 · Trois ans de maquis (14,5 à 17,1 s)
- **Plan 6A (14,5 à 15,8 s)** : clairière sous la canopée, lumière qui descend. Grand titre : « **3 ANS** » (Cinzel 200 pt, or) à 14,6 s, et dessous « dans la clandestinité » (Manrope 46 pt, ivoire). Les rais de lumière bougent lentement (vent), quelques feuilles tombent.
- **Plan 6B (15,8 à 17,1 s)** : au premier plan, **trois documents** glissent en éventail, posés sur un tapis de feuilles : formulaires vierges stylisés, en-têtes lisibles seulement : « **ACTE DE NAISSANCE** », « **ACTE DE MARIAGE** », « **CARTE D'IDENTITÉ** » (Cinzel 46 pt, encre). Aucun nom, aucun cachet d'État inventé. Ligne Manrope 42 pt : « Il y crée une administration parallèle. »
- **Voix off** : « Trois ans, il y tient bon. » (réplique 6, départ 14,5 s)
- **Fidélité** : « Pendant trois ans, dans la clandestinité, il tient bon. Il crée une administration parallèle : des actes de naissance, des actes de mariage, des cartes d'identité. »
- **Transition** : la lumière dorée **se retire** d'un coup (les rais s'éteignent de haut en bas en 0,3 s), la forêt passe au gris-bleu froid sans jamais devenir noire.

### Scène 7 · 13 septembre 1958 (17,1 à 19,7 s)
- **Plan 7A (17,1 à 18,4 s)** : même forêt, **désaturée, immobile** (les feuilles ne bougent plus), brume froide. Un des trois documents de la scène 6 (l'acte de naissance) **tombe lentement** au sol et s'y pose. Rien d'autre : aucune arme, aucun corps, aucun soldat.
- **Plan 7B (18,4 à 19,7 s)** : la date s'écrit au centre, lettre par lettre (`LetterDrop` lent, sans rebond) : « **13 SEPTEMBRE 1958** » (Cinzel 104 pt, ivoire), puis dessous (Manrope 42 pt, ivoire 85 %) : « près de Boumnyébel · il a 45 ans ».
- **Voix off** : « Puis l'armée française le tue. » (réplique 7, départ 17,1 s)
- **Sous-titre karaoké** : la phrase de la voix, en bas (y ≈ 1430).
- **Fidélité** : « tué par l'armée française », lieu et âge selon la fiche. **Volontairement omis** (dignité, pas de violence graphique) : le corps traîné, mutilé et photographié, les noms des officiers de la traque. Ils restent dans l'app.
- **Transition** : du gris monte depuis le bas de l'écran : le béton.

### Scène 8 · Sans nom, dans le béton (19,7 à 22,6 s)
- **Plan 8A (19,7 à 21,2 s)** : un **bloc de béton** gris envahit le cadre de bas en haut (texture brute : granulats, bulles d'air, coffrage), lumière rasante froide. Au centre, le nom doré de la scène 2 réapparaît **à travers** le béton puis **s'y noie** : les lettres se grisent et s'enfoncent (`SinkLetters` adapté, sans eau).
- **Plan 8B (21,2 à 22,6 s)** : bloc plein cadre, **surface vierge** : pas une lettre. Texte en relief creux, gris clair : « **SANS NOM. SANS ÉPITAPHE.** » (Cinzel 80 pt) à 21,3 s. Mention Manrope 36 pt : « enterré anonymement, 15 septembre 1958 ». La barre noire de censure de la scène 1 **revient** se poser sur la ligne du bas (rappel visuel) à 22,0 s.
- **Voix off** : « On l'enterre sans nom, dans le béton. » (réplique 8, départ 19,7 s)
- **Son** : la musique se creuse naturellement ici (creux mesuré de 19,25 à 22,5 s).
- **Fidélité** : « enterré dans l'anonymat, sans cérémonie, son corps scellé dans un bloc de béton, sans épitaphe ». On montre un bloc, jamais un corps.
- **Transition** : une **fissure d'or** part du centre du bloc à 22,5 s.

### Scène 9 · Le béton se fissure d'or (22,6 à 26,4 s)
- **Plan 9A (22,6 à 23,8 s)** : sur la remontée de la musique (22,75 s), **les fissures se ramifient en veines d'or lumineuses** (façon kintsugi), le béton éclate en plaques qui tombent hors champ ; dessous, le **nom gravé en or** « RUBEN UM NYOBÈ » (Cinzel 130 pt) sur fond noir chaud, avec le portrait qui réapparaît derrière (`Illu` zoom 1,25, `dim` 0,45) et ses anneaux dorés qui se remettent à tourner. La barre noire se **désagrège en poussière d'or**.
- **Plan 9B (23,8 à 25,0 s)** : sous le nom, jalon 1 (Cinzel 84 pt, or) : « **1991 · HÉROS NATIONAL** » ; dessous (Manrope 40 pt, ivoire) : « la loi lève l'interdiction de son nom ».
- **Plan 9C (25,0 à 26,4 s)** : le jalon 1 glisse vers le haut, jalon 2 (Cinzel 84 pt, or) : « **2025** » ; dessous (Manrope 42 pt, ivoire, 2 lignes) : « la France reconnaît sa responsabilité dans sa mort ». Lent zoom avant sur le regard.
- **Voix off** : « Mais son nom revient. Et la France reconnaît sa responsabilité. » (réplique 9, départ 22,6 s)
- **Fidélité** : 27 juin 1991 (héros national) et loi n°91/022 du 16 décembre 1991 (fin de l'interdiction) réunis sous « 1991 » ; 30 juillet 2025, lettre d'Emmanuel Macron à Paul Biya. Pas de nom de président à l'écran (inutile en 30 s, détail dans l'app).
- **Transition** : les veines d'or convergent vers le bas et dessinent le contour du téléphone qui monte.

### Scène 10 · Souviens-toi de ce nom (26,4 à 30,0 s)
- **Plan 10A (26,4 à 27,4 s)** : « **SOUVIENS-TOI DE CE NOM** » (Cinzel 84 pt, or, 2 lignes) au-dessus du téléphone qui monte.
- **Plan 10B (27,4 à 30,0 s)** : `OutroApp` avec la **vraie fiche « Ruben Um Nyobè » de l'app** (capture à faire en phase 2, bouton « Écouter » ou « Lire le récit » qui pulse), `line1` « ÉCOUTE », `line2` « SON HISTOIRE ENTIÈRE » ; puis **médaillon AFROBACK** et **afroback.app**.
- **Voix off** : « Souviens-toi de ce nom. Écoute son histoire sur AFROBACK. » (réplique 10, départ 26,4 s)
- **Fin** : image figée sur le logo et l'adresse. Aucune mention App Store / Google Play.

---

## 3. Sous-titres karaoké (`SUBS`)

Seulement là où la phrase n'est pas déjà écrite en gros : répliques **1** (sous la feuille, à la place de la ligne « Au Cameroun » si chevauchement : on garde alors la ligne), **4**, **7**, **9** (moitié « Et la France… » déjà écrite : karaoké seulement sur « Mais son nom revient. »). Position y ≈ 1430, jamais sur un titre.

## 4. Points de vigilance

- **Pas de figurine, pas de silhouette humaine** : objets et documents dessinés en détail, portrait seul visage.
- **Pas de trou visuel** : aucune scène ne passe par un fond noir ou uni plus de 0,2 s ; chaque transition est un raccord (barre arrachée, lettre « O » → halo, stries → grille du micro, déchirure → forêt, lumière qui se retire, béton qui monte, fissure d'or).
- **Texte** : jamais sous 36 pt sauf les deux mentions de source (30 pt, ivoire 75 à 80 %, toujours sur fond sombre ou papier clair contrasté). Rien d'important au-dessus de y = 250 ni sous y = 1540.
- **Épilepsie** : pas de flash blanc ; les veines d'or s'allument progressivement (0,4 s), localisées.
- **Documents** : tous étiquetés « évocations graphiques AFROBACK » (scènes 3 à 6), aucun faux texte lisible au-delà des en-têtes et de la citation authentifiée.
- **Sujet sensible** : pas de bilan chiffré, pas de corps, pas d'image de soldats ; ton factuel. Le portrait est une création AFROBACK.
