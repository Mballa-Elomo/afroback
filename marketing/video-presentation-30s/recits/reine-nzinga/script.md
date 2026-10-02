# AFROBACK · Vidéo 3 · « Celle qu'on ne plie pas » : Reine Nzinga (30 s)

> Rédigé le 2026-10-01. Troisième vidéo de la série AFROBACK (1 : présentation de l'app ; 2 : mythe Ngan Medza, conte nocturne).
> Source : `Héros/Angola/reine-nzinga/fr.md` (récit du griot + fiche structurée). **Aucun fait ajouté** au-delà de ce récit.
> **Statut : validé par Yannick, produit le 2026-10-01** (`marketing/2026-10-01_AFROBACK-reine-nzinga-30s_v1.mp4`, composition `AfrobackRecitReineNzinga30s`, `src/recits/ReineNzinga.tsx`).
> **Écarts au montage** : les temps réels suivent les voix (voir `config-audio.json` / `timing.json`) : S1 0-2,4 · S2 2,4-4,2 · S3 4,2-7,4 · S4 7,4-11,4 · S5 11,4-15,75 · S6 15,75-19,1 · S7 19,1-22,35 · S8 22,35-26 · S9 26-30 s. Jalon Matamba affiché « 1631 · MATAMBA » (reine déposée en 1631 selon la fiche). Fiche app capturée : `public/img/capture-app-reine-nzinga.jpg`, bouton « Lire le récit » (buttonY 566).

**Angle (une seule idée forte) : le verbe « plier ».** Son nom évoque « tordre, enrouler » ; toute la vidéo montre une femme que personne n'arrive à plier, puis un **face-à-face diplomatique** (la légende du tapis, signalée comme légende), un **compteur d'années** de résistance, et une fin honnête : « pas une statue lisse ». Différent des deux premières vidéos : pas de nuit ni de torche (Ngan Medza), pas de rafale de visages (présentation) ; ici lumière de couchant, or et velours rouge, typographie qui se tord et se redresse.

---

## 0. Fiche technique

| Élément | Choix |
|---|---|
| Durée | **30 s** |
| Format | **9:16 vertical, 1080 × 1920**, 30 i/s |
| Ton | **Épique et grave, solaire** : couchant doré, regard frontal, face-à-face. Changement visuel au moins **toutes les 2 s** |
| Palette | Noir profond `#0B0806` · or `#F0C36B` · terracotta `#C2583A` · velours rouge `#6E1F24` (le drapé du portrait) · ivoire `#F3E9D8` · ocre ciel `#D8913E` |
| Typographies | **Cinzel** (mots qui percutent) · **Manrope** (sous-titres, mentions) |
| Visuel principal | Le portrait AFROBACK `public/heros/reine-nzinga.jpg` (couronne dorée à plume rouge, collier de perles, drapé blanc et velours, acacias au couchant, motifs géométriques à gauche), exploré avec `Illu` (macro sur la couronne, regard, dézoom), + **scènes graphiques en traits dorés** (fil qui se tord, carte de la côte, silhouettes du face-à-face, compteur d'années) |
| Fil graphique | Un **fil d'or** qui se tord au début (le nom « Njinga ») et réapparaît : il devient la côte sur la carte, puis la **ligne des regards** du face-à-face, puis la frise du compteur |
| Honnêteté | (1) La scène du tapis et de la servante est étiquetée à l'écran **« Légende · récit recueilli des décennies plus tard »**, et la voix dit « On raconte… dit-on ». (2) La fin dit **« Pas une statue lisse »** et écrit à l'écran qu'elle **a aussi pris part à la traite**, comme le récit l'affirme. (3) Le portrait est une illustration AFROBACK, jamais présentée comme un portrait d'époque |

---

## 1. Musique et voix off

**Musique** : `BG Music\Baobab Oath.mp3` (la version **sans** « (1) », Ngan Medza utilisait l'autre), lue **à partir de 14,0 s**. Mesure ffmpeg (RMS par seconde) : ce fichier a une coupure vers le silence entre 9 et 13 s puis repart franchement à 14 s ; de 14 à 44 s le niveau reste soutenu (-13 à -21 dB), avec une montée vers 38 à 41 s du fichier, soit **24 à 27 s de la vidéo**, juste sous « Pas une statue lisse » et l'arrivée de la fin. Titre « serment » cohérent avec une reine de serments et de traités. Musique baissée sous la voix au mixage (comme Ngan Medza).
Alternative si Yannick préfère à l'oreille : `Legends by the Fire.mp3` à partir de 7 s (montée nette à 31 s du fichier, soit 24 s de la vidéo), mais son titre évoque plus le conte au coin du feu, déjà traité avec Ngan Medza.

**Voix off** : la voix griot ElevenLabs habituelle, 9 répliques, environ 77 mots (détail et minutage dans `voix-off.md`).

> Njinga. Son nom évoque : tordre.
> Elle, jamais on ne la pliera.
> Elle vient négocier la paix chez les Portugais, à Luanda.
> On raconte : pour eux, des sièges. Pour elle, un simple tapis.
> Elle s'assit, dit-on, sur le dos d'une servante. D'égale à égal.
> Elle obtient la paix. Puis elle devient reine.
> Plus de quarante ans, par les armes et par la ruse.
> Pas une statue lisse. Une reine, avec ses ombres.
> Écoute toute son histoire sur AFROBACK.

**Effets sonores** : aucun à fournir. La musique suffit ; d'éventuels petits accents (frappe sur « REINE ») seront tirés de la musique au montage.

---

## 2. Script scène par scène

### Scène 1 · Le nom qui se tord (0,0 à 3,0 s) · ACCROCHE
- **Plan 1A (0,0 à 1,5 s)** : écran noir. À 0,1 s, un **fil d'or** lumineux entre par la gauche et **s'enroule sur lui-même** en spirale au centre (torsion visible, brins qui se tressent), quelques paillettes dorées s'en échappent (`Embers` en or, pas en flamme).
- **Plan 1B (1,5 à 3,0 s)** : la spirale se **déroule** et ses brins deviennent les lettres **« NJINGA »** (Cinzel 170 pt, or, légère torsion des lettres qui se redressent une à une, `LetterDrop`). Sous le nom, en italique : « *tordre, enrouler* » (Manrope 40 pt, ivoire) qui s'écrit à 2,1 s, sur « tordre ».
- **Mention fixe** (dès 0,6 s, Manrope 30 pt, ivoire 70 %, y ≈ 1430) : « Reine de Ndongo et de Matamba · Angola · XVIIe siècle ».
- **Voix off** : « Njinga. Son nom évoque : tordre. » (réplique 1, départ 0,2 s)
- **Son** : la musique démarre directement en plein (départ à 14 s du fichier, attaque franche), pas de silence d'introduction.
- **Transition** : le mot NJINGA se **redresse d'un coup** (les lettres tordues deviennent parfaitement droites, `popScale`) et la caméra fonce à travers la lettre « I » → portrait.

### Scène 2 · Jamais pliée (3,0 à 5,6 s)
- **Plan 2A (3,0 à 4,3 s)** : `Illu` en **macro sur la couronne** (zoom 3,2, centré sur les pierres rouges et la plume), panoramique lent vers le bas ; reflets dorés qui glissent sur le métal (balayage lumineux).
- **Plan 2B (4,3 à 5,6 s)** : la caméra **descend jusqu'au regard** (zoom 2,2 sur les yeux) ; poussière d'or en suspension.
- **Texte animé** : « **JAMAIS** » (Cinzel 150 pt, or) percute à 3,6 s, puis « **PLIÉE.** » à 4,3 s, avec une légère secousse (`Shake`).
- **Voix off** : « Elle, jamais on ne la pliera. » (réplique 2, départ 3,0 s)
- **Transition** : le regard sort du cadre par la gauche (panoramique), le fond devient la carte.

### Scène 3 · Luanda, 1621 (5,6 à 9,5 s)
- **Plan 3A (5,6 à 7,5 s)** : **carte stylisée en traits dorés** sur fond noir chaud : la côte atlantique de l'actuel Angola, le **fleuve Kwanza** qui serpente vers l'intérieur, deux noms seulement : « NDONGO » (intérieur) et « LUANDA » (côte). Le fil d'or de la scène 1 trace un **chemin en pointillés** de Ndongo vers Luanda.
- **Plan 3B (7,5 à 9,5 s)** : zoom caméra sur Luanda ; **silhouettes de navires** (voiles carrées, traits ivoire) qui oscillent sur l'océan, une silhouette de **fort** sur la côte.
- **Texte animé** : « **LUANDA · 1621** » (Cinzel 120 pt, ivoire, `PunchWord`) à 6,6 s ; « négocier la paix avec les Portugais » (Manrope 42 pt) glisse dessous à 7,8 s.
- **Voix off** : « Elle vient négocier la paix chez les Portugais, à Luanda. » (réplique 3, départ 5,6 s)
- **Fidélité** : date et lieu du récit (« En 1621, Njinga se rend à Luanda… pour rencontrer le gouverneur »). Pas de nom du gouverneur à l'écran (inutile en 30 s).
- **Transition** : le fort se rapproche, ses murs deviennent les **murs d'une salle** (fondu de traits).

### Scène 4 · La salle : des sièges, un tapis (9,5 à 13,1 s) · LÉGENDE
- **Étiquette permanente pendant les scènes 4 et 5** (y ≈ 330, sous la zone sûre du haut ; Manrope 30 pt majuscules espacées, or sur pastille noire translucide) : « **LÉGENDE · récit recueilli des décennies plus tard** ».
- **Plan 4A (9,5 à 11,3 s)** : vue de profil, style **théâtre d'ombres doré** : à droite, **trois silhouettes assises sur de hauts sièges** (le gouverneur et ses officiers, traits or sur fond terracotta sombre). La caméra glisse de bas en haut le long des sièges.
- **Plan 4B (11,3 à 13,1 s)** : à gauche, **un tapis seul au sol** (rectangle à motifs géométriques, rappel des motifs du portrait), éclairé par une douche de lumière ; vide au-dessus.
- **Texte animé** : « **POUR EUX : DES SIÈGES.** » (Cinzel 80 pt, ivoire) à 10,4 s en haut de la salle ; « **POUR ELLE : UN TAPIS.** » (Cinzel 80 pt, or) à 11,8 s, près du tapis.
- **Voix off** : « On raconte : pour eux, des sièges. Pour elle, un simple tapis. » (réplique 4, départ 9,5 s)
- **Transition** : une silhouette entre par la gauche dans la lumière du tapis.

### Scène 5 · D'égale à égal (13,1 à 17,3 s) · LÉGENDE
- **Plan 5A (13,1 à 14,8 s)** : la **silhouette d'une servante** s'agenouille près du tapis (mouvement lent, digne, traits or, aucun détail de visage) ; la silhouette de **Njinga**, couronne reconnaissable, s'assoit sur son dos, buste très droit.
- **Plan 5B (14,8 à 16,3 s)** : un **fil d'or horizontal** part de ses yeux et rejoint ceux du gouverneur : **même hauteur**. Les deux extrémités brillent. La caméra se recentre sur cette ligne.
- **Plan 5C (16,3 à 17,3 s)** : la ligne d'or devient la **ligne du regard du portrait** : raccord sur `Illu` zoom 2,4 sur les yeux de l'illustration.
- **Texte animé** : « **D'ÉGALE À ÉGAL** » (Cinzel 120 pt, or) percute à 15,6 s, posé sur la ligne d'or.
- **Voix off** : « Elle s'assit, dit-on, sur le dos d'une servante. D'égale à égal. » (réplique 5, départ 13,1 s)
- **Fidélité** : le récit présente cette scène comme tradition, pas comme fait ; d'où « On raconte », « dit-on » et l'étiquette. La servante n'est jamais tournée en ridicule.
- **Transition** : dézoom sur le portrait.

### Scène 6 · La paix, puis la couronne (17,3 à 20,2 s)
- **Plan 6A (17,3 à 18,7 s)** : portrait en plan taille (`Illu` zoom 1,3), lumière du couchant qui monte ; « **LA PAIX · 1622** » (Cinzel 90 pt, ivoire) à 17,6 s.
- **Plan 6B (18,7 à 20,2 s)** : **zoom avant rapide** sur la couronne, **reflet lumineux** qui la traverse ; « **REINE · 1624** » (Cinzel 150 pt, or) percute à 19,0 s avec secousse et gerbe de paillettes d'or.
- **Voix off** : « Elle obtient la paix. Puis elle devient reine. » (réplique 6, départ 17,3 s)
- **Fidélité** : accord de paix attesté (retour en 1622), accession au trône en 1624.
- **Transition** : la couronne s'éteint dans le noir, des chiffres dorés surgissent.

### Scène 7 · Le compteur (20,2 à 23,6 s)
- **Plan 7A (20,2 à 21,9 s)** : grand **compteur d'années** (Cinzel 200 pt, or) qui défile de **1624** vers **1663**, sur une frise horizontale (le fil d'or). Le portrait en fond, très assombri, avec des `Diamonds` (motifs géométriques) qui dérivent. Le compteur **se fige** brièvement sur deux jalons tamponnés en terracotta : « **1626 · GUERRE** » puis « **1635 · MATAMBA** ».
- **Plan 7B (21,9 à 23,6 s)** : jalon « **1656 · TRAITÉ DE PAIX** », puis le compteur s'arrête sur **1663** ; sous-titre écrit : « Matamba garde sa souveraineté ».
- **Texte karaoké** (Manrope) : « par les armes et par la ruse ».
- **Voix off** : « Plus de quarante ans, par les armes et par la ruse. » (réplique 7, départ 20,2 s)
- **Fidélité** : guerre déclarée en 1626, conquête de Matamba entre 1631 et 1635, traité de 1656 où elle garde Matamba, mort en 1663 ; « plus de quarante ans » reprend la formule du récit.
- **Transition** : le chiffre 1663 se dissout en poussière d'or qui révèle le visage.

### Scène 8 · Pas une statue lisse (23,6 à 26,6 s)
- **Plan 8A (23,6 à 25,0 s)** : portrait plein cadre (`Illu` zoom 1,6 sur le visage) ; une **lumière rasante balaie le visage de droite à gauche** et laisse **la moitié du visage dans l'ombre** (dégradé noir, `Vig` renforcé). « **PAS UNE STATUE LISSE.** » (Cinzel 92 pt, ivoire) à 23,9 s.
- **Plan 8B (25,0 à 26,6 s)** : légère rotation de caméra (2°, sans coins noirs) ; texte en deux lignes (Manrope 40 pt, ivoire, fond sombre) : « Résistante et diplomate… » (25,0 s) puis « **elle a aussi pris part à la traite.** » (25,6 s, en terracotta clair).
- **Voix off** : « Pas une statue lisse. Une reine, avec ses ombres. » (réplique 8, départ 23,6 s)
- **Fidélité** : reprend le récit (« Pas une statue lisse », « a participé activement au commerce des êtres humains »). Rien de plus en 30 s : le détail et les nuances des historiens sont dans l'app.
- **Transition** : la moitié dans l'ombre envahit l'écran, le téléphone monte du noir.

### Scène 9 · Son histoire entière sur AFROBACK (26,6 à 30,0 s)
- **Animation** : `OutroApp` : le téléphone monte du bas avec la **vraie fiche « Reine Nzinga » de l'app** (capture à faire en phase 2), le bouton « Écouter » / « Lire le récit » pulse ; puis le **médaillon AFROBACK** et **afroback.app**.
- **Texte animé** : « **ÉCOUTE** » + « **SON HISTOIRE ENTIÈRE** » (26,8 s), puis « AFROBACK » + « afroback.app » (28,3 s).
- **Voix off** : « Écoute toute son histoire sur AFROBACK. » (réplique 9, départ 26,7 s)
- **Son** : la montée musicale se pose, dernière frappe vers 29,5 s.
- **Fin** : image figée sur le logo et l'adresse. Aucune mention App Store / Google Play.

---

## 3. Points de vigilance

- **Légende du tapis** : toujours étiquetée et racontée au conditionnel / « on raconte » ; jamais présentée comme un fait au même titre qu'une date.
- **Figure ambivalente** : la traite est nommée à l'écran (scène 8) et la voix dit « avec ses ombres ». Pas d'héroïsation sans ombre, pas d'insistance gratuite non plus.
- **Pas de citation** attribuée à Njinga (le récit dit qu'aucune n'est authentifiée).
- **Pas de rites imbangala ni d'anthropophagie** dans la vidéo : sujet à charge selon le récit, impossible à nuancer en 2 s.
- Le portrait est une **création AFROBACK**, pas un portrait d'époque.
- Zones sûres : rien d'important au-dessus de y = 250 ni sous y = 1540. Pas de flash blanc plein (reflets en or, localisés).
