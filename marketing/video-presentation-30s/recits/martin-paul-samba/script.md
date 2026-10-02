# AFROBACK · Vidéo 5 · « Changer de camp » : Martin Paul Samba (30 s)

> Rédigé le 2026-10-01. Cinquième vidéo de la série AFROBACK (1 : présentation de l'app ; 2 : mythe Ngan Medza, conte nocturne ; 3 : Reine Nzinga, fil d'or et théâtre d'ombres ; 4 : Ruben Um Nyobè, le nom interdit).
> Source : `Héros/Cameroun/martin-paul-samba/fr.md` (récit du griot + fiche structurée). **Aucun fait ajouté** au-delà de ce récit.
> **Statut : validé par Yannick, produit le 2026-10-01** (`marketing/2026-10-01_AFROBACK-martin-paul-samba-30s_v1.mp4`, composition `AfrobackRecitMartinPaulSamba30s`, `src/recits/MartinPaulSamba.tsx` + accessoires `src/recits/samba-props.tsx`).
> **Écarts au montage** : les temps suivent les voix réelles (la 4 dure 4,4 s) : S1-S2 0-4,45 · S3-S4 4,45-11,1 · S5 11,1-13,75 · S6 13,75-16,5 · S7 16,5-18,95 · S8 18,95-23,0 · S9 23,0-25,9 · S10 25,9-30 s. Le pivot « RETOURNÉ » se fait à 3,1-3,7 s ; la reprise musicale de 4,75 s tombe sur l'apparition de « MEBENGA M'EBONO ». Cadets à casque à pointe. Fin : « IL A CHOISI LES SIENS » sur la statue, puis « SON HISTOIRE ENTIÈRE » au-dessus du téléphone (fiche réservée aux abonnés, l'anneau entoure le titre). Sous-titres karaoké seulement sur les répliques 5, 6 et la fin de la 8.

**Angle (une seule idée forte) : les deux côtés.** Le récit dit lui-même : « il a porté l'uniforme de ceux qui soumettaient son propre continent », puis « a fini par retourner tout ce qu'il avait appris contre elle ». Toute la vidéo est construite sur **une frontière visible dans l'image** : une **couture de lumière verticale** sépare un côté **froid** (acier, bleu de Prusse, gris : l'empire, l'uniforme) d'un côté **chaud** (ocre, terre rouge, or : les siens). Au début, Samba est du côté froid ; la couture balaie l'écran, recule, revient, et à la fin l'image entière est chaude et dorée. Deux procédés neufs portent ce fil :
1. **La typographie qui pivote** : les mots clés sont des « cartes » qui tournent sur elles-mêmes (rotation 3D sur l'axe vertical), face acier d'un côté, face or de l'autre (« MEBENGA M'EBONO » pivote et devient « MARTIN-PAUL SAMBA »).
2. **Les boutons de l'uniforme** : les deux boutons de métal de la tunique du portrait sont l'objet fil rouge (macro d'ouverture, puis ils **sautent** quand il quitte l'armée en 1902).

Différent des quatre premières vidéos : pas de nuit à la torche, de fleuve ni de serpent (Ngan Medza) ; pas de fil d'or, de carte, de théâtre d'ombres ni de compteur d'années (Nzinga) ; pas de papier censuré, de tampon, de bureau de documents, de machine à écrire ni de béton (Um Nyobè). Ici : **température de couleur comme récit, écran partagé (diptyque), typographie en rotation, métal, tissu, lanterne, mouchoir blanc**.

---

## 0. Fiche technique

| Élément | Choix |
|---|---|
| Durée | **30 s** |
| Format | **9:16 vertical, 1080 × 1920**, 30 i/s |
| Ton | **Grave, digne, honnête puis fier**. Pas d'héroïsation lisse (le récit insiste : « la vérité entière, celle qui ne flatte personne »). Aucune violence montrée. Changement visuel au moins **toutes les 2 s** |
| Palette froide (l'empire) | acier `#AEB8C2` · bleu de Prusse `#1C2A3A` · gris ardoise `#3B434C` · blanc froid `#DDE3E8` |
| Palette chaude (les siens) | noir profond `#0B0806` · or `#F0C36B` · terracotta `#C2583A` · ocre `#D8913E` · terre rouge `#8A3B22` · ivoire `#F3E9D8` |
| Étalonnage du portrait | côté froid : `filter: grayscale(.85) brightness(.85)` + calque bleu de Prusse en `mix-blend-mode: color` (≈ 55 %) ; côté chaud : couleurs d'origine (halo doré), légère chaleur ajoutée. La couture = un `clipPath` vertical animé entre les deux versions |
| Typographies | **Cinzel** (noms, titres, citation) · **Manrope** (mentions, sous-titres). Aucune police supplémentaire |
| Visuel principal | Le portrait AFROBACK `public/heros/martin-paul-samba.jpg` (homme moustachu au regard grave, **tunique sombre à col montant fermée par deux boutons de métal** à environ x 500, y 800 et x 500, y 930 dans l'image 1024 × 1024, chemise blanche, **halo d'anneaux et de rayons dorés** derrière la tête), exploré avec `Illu` |
| Personnes | **Jamais de figurine en bâtons.** Les rares humains sont des **silhouettes pleines et détaillées** (casquettes, cols, ceinturons, plis, fusils dessinés avec leurs pièces, charges portées avec volume), à contre-jour, avec un liseré de lumière. Sinon : le portrait seul |
| Objets | dessinés avec volume, ombres, textures et lumière : bouton bombé à reflets, drap de laine, cases bulu à murs de terre et toits végétaux, lanternes à verre et anse, enveloppe à cachet de cire, gant à coutures, mouchoir blanc à plis translucides, statue en contre-jour |
| Honnêteté | (1) Le service colonial n'est **pas caché** : scène 5 entière, avec « La vérité entière » et « contre d'autres communautés camerounaises ». (2) La scène du mouchoir et du bandeau est étiquetée **« LÉGENDE · transmise à Ebolowa, de bouche à oreille »**, la voix dit « La légende dit », la phrase légendaire est suivie de « selon la légende · aucune archive ne la garantit mot pour mot ». (3) Aucun peloton, aucune arme pointée, aucun corps : l'exécution est dite par une **lanterne qui s'éteint** et une date. (4) Décors et silhouettes = **évocations graphiques AFROBACK** (mention à l'écran scènes 3 à 7) ; le portrait est une illustration AFROBACK |

---

## 1. Musique et voix off

**Musique** : `BG Music\Legends by the Fire (1).mp3` (la seule piste encore inutilisée), lue **à partir de 109,25 s** du fichier (durée totale 5 min 21). Mesure ffmpeg (RMS par quart de seconde, fichier en 48 kHz) :
- à **109,25 s**, attaque franche (-13 dB) : la vidéo démarre en plein élan, sans l'introduction calme (0 à 7,5 s du fichier, très basse) ;
- de **112,25 à 113,75 s** (soit **3,0 à 4,5 s de la vidéo**), la musique **se creuse** (-20 à -25 dB) puis **repart à 114,0 s (4,75 s vidéo)** : le creux tombe sous « Puis il s'est retourné contre eux » et la reprise sur la **fin du pivot** de la typographie ;
- creux bref à 123,0 s puis attaque à **123,25 s (14,0 s vidéo)** : les **boutons de l'uniforme sautent** sur ce coup ;
- creux de **131,25 à 132,25 s (22,0 à 23,0 s vidéo)** : silence relatif sous la **lanterne qui s'éteint** (8 août 1914) ; reprise franche à **132,5 s (23,25 s vidéo)** : le **mouchoir blanc** se lève sur la légende ;
- creux à 137,0 s puis attaque à **137,25 s (28,0 s vidéo)** : apparition du logo.
Titre cohérent avec un récit de griot raconté à la veillée. Départ différent des vidéos précédentes (Ngan Medza : Baobab Oath (1) à 8 s ; Nzinga : Baobab Oath à 14 s ; Um Nyobè : Legends by the Fire à 57,5 s). Baissée sous la voix au mixage (volume 0,3), montée d'entrée de 0,15 s pour éviter un clic, sortie en fondu sur les 0,6 dernières secondes.
Alternative si Yannick préfère à l'oreille : la même piste à partir de 9,25 s (après l'introduction), plus régulière mais sans les creux calés.

**Voix off** : la voix griot ElevenLabs habituelle, **10 répliques, 69 mots**, toutes à 2,6 mots/s ou moins par créneau ; aucune date dite à voix haute (détail dans `voix-off.md`).

> Il a porté l'uniforme allemand.
> Puis il s'est retourné contre eux.
> Né Mebenga m'Ebono, en pays bulu.
> Envoyé en Allemagne, il revient officier : Martin-Paul Samba.
> Huit ans, il accompagne les expéditions allemandes.
> À Ebolowa, il voit souffrir les siens.
> Devenu chef, il prépare un soulèvement.
> Une lettre est interceptée. Une semaine après, on l'exécute.
> La légende dit qu'il refusa le bandeau.
> Il a choisi les siens. Son histoire, sur AFROBACK.

**Effets sonores** : **aucun à fournir.** Les quatre temps forts (pivot à 4,75 s, boutons à 14,0 s, lanterne à 22,0 s, mouchoir à 23,25 s) tombent sur des creux et des attaques mesurés de la musique.

---

## 2. Script scène par scène

### Scène 1 · L'uniforme (0,0 à 2,3 s) · ACCROCHE
- **Plan 1A (0,0 à 0,8 s)** : dès la première image, **macro sur le bouton du haut de la tunique** (`Illu` zoom 6, centré x 500, y 800 de l'image source), étalonné **froid** (acier, bleu de Prusse). Surimpression dessinée : un **reflet métallique** blanc froid glisse en diagonale sur le dôme du bouton (balayage 0,5 s), le drap de laine autour garde sa texture (grain, fibres). Léger `Shake` d'entrée sur l'attaque de la musique.
- **Plan 1B (0,8 à 2,3 s)** : **dézoom rapide** (6 → 1,35, courbe `ramp` douce en fin) qui remonte du bouton au col, puis au visage : le portrait entier apparaît, **tout entier côté froid** (halo doré éteint en gris acier). Texte à 1,0 s, y ≈ 1230 : « **L'UNIFORME** » / « **ALLEMAND** » (Cinzel 128 pt, blanc froid `#DDE3E8`, `PunchWord`, ombre portée sombre). Mention à 1,3 s, y ≈ 1420 (Manrope 40 pt, acier) : « Kamerun · colonie allemande ».
- **Voix off** : « Il a porté l'uniforme allemand. » (réplique 1, départ 0,2 s)
- **Son** : la musique part en plein (attaque à 109,25 s du fichier).
- **Transition (2,1 à 2,3 s)** : sur le bord droit de l'image, une **couture de lumière** verticale s'allume (trait or et terracotta de 6 px, halo diffus de 40 px, quelques étincelles qui en tombent).

### Scène 2 · Le retournement (2,3 à 4,75 s)
- **Plan 2A (2,3 à 3,6 s)** : la couture **avance lentement de droite à gauche** sur le portrait (x de 1080 à 620). Derrière elle, le portrait **reprend ses couleurs d'origine** : le halo doré se rallume, la peau se réchauffe ; devant, il reste froid. Le visage est donc **coupé en deux températures**, la couture passe juste à droite du nez à 3,6 s. Lent zoom avant (1,35 → 1,5) sur le regard. Le texte « L'UNIFORME ALLEMAND » glisse vers le haut et s'efface (2,4 à 2,7 s).
- **Plan 2B (3,6 à 4,75 s)** : la couture **accélère** et balaie tout l'écran jusqu'au bord gauche (4,4 s) : tout est chaud, rayons dorés du halo animés (rotation lente des anneaux en surimpression). Texte, y ≈ 1200 à 1420 : « **PUIS IL S'EST** » (Cinzel 84 pt) / « **RETOURNÉ** » (Cinzel 150 pt) : le bloc est une **carte typographique** qui apparaît face acier à 3,0 s puis **pivote sur l'axe vertical** (rotateY 0 → 180°, perspective 1200 px, 0,6 s) pour montrer sa **face or** pile à **4,75 s** (reprise de la musique), `Embers` dorés qui s'échappent des bords au moment du pivot.
- **Voix off** : « Puis il s'est retourné contre eux. » (réplique 2, départ 2,3 s)
- **Son** : creux de la musique de 3,0 à 4,5 s, reprise à 4,75 s sur le pivot.
- **Transition** : la caméra **plonge dans le « O »** de RETOURNÉ (zoom 1 → 8 en 0,25 s), qui s'ouvre sur la lumière du matin → village.

### Scène 3 · Mebenga m'Ebono, pays bulu (4,75 à 7,3 s)
- **Plan 3A (4,75 à 6,0 s)** : **village bulu à l'aube**, côté chaud, en **4 couches de parallaxe** :
  - fond : collines boisées, silhouettes de grands fromagers, brume dorée (`Fog`) ;
  - milieu : **rangée de cases rectangulaires** à murs de terre ocre (texture crépie, fissures fines), **toits végétaux** à pans (stries de raphia, débord qui projette une ombre nette sur le mur), portes sombres ; une **fumée** monte lentement d'un toit ;
  - premier plan : **chemin de terre rouge** qui fuit vers le centre, herbes hautes et palmes de palmier qui bougent ;
  - lumière : rais dorés rasants depuis la gauche, poussière en suspension.
  La caméra avance doucement sur le chemin (zoom 1 → 1,12).
- **Plan 3B (6,0 à 7,3 s)** : le nom s'inscrit au centre, y ≈ 1000 : « **MEBENGA** » / « **M'EBONO** » (Cinzel 132 pt, or, `LetterDrop` lettre par lettre, sans rebond), posé sur une **carte typographique** (même objet que scène 2, face or visible). Dessous (Manrope 44 pt, ivoire, y ≈ 1260) : « son nom de naissance » ; puis (Manrope 38 pt, ocre, y ≈ 1340) : « pays bulu · près d'Ebolowa · v. 1874-1875 ».
- **Mention fixe** (scènes 3 à 7, y ≈ 1500, Manrope 30 pt, ivoire 75 %, sur dégradé sombre) : « Décors et silhouettes : évocations graphiques AFROBACK ».
- **Voix off** : « Né Mebenga m'Ebono, en pays bulu. » (réplique 3, départ 4,7 s)
- **Fidélité** : naissance « v. 1874-1875 » (la fiche dit que les sources hésitent : on écrit les deux années). Orphelinat et passage par Kribi volontairement omis (trop pour 30 s, détaillés dans l'app).
- **Transition** : la couture de lumière **revient**, cette fois de gauche à droite, et le village repasse au froid derrière elle.

### Scène 4 · L'Allemagne en fait Martin-Paul Samba (7,3 à 10,6 s)
- **Plan 4A (7,3 à 8,6 s)** : la carte « MEBENGA M'EBONO » **pivote** (rotateY 0 → 180°, 0,7 s) et montre sa **face acier** : « **MARTIN-PAUL** » / « **SAMBA** » (Cinzel 128 pt, blanc froid, gravure en léger relief). Pendant le pivot, le village derrière se **désature et bleuit** jusqu'à disparaître dans une brume grise. Dessous (Manrope 44 pt, acier) : « **1891** · formé soldat en Allemagne » ; puis : « baptisé d'un nom nouveau ».
- **Plan 4B (8,6 à 10,6 s)** : **cour d'une académie militaire prussienne**, évoquée, sous un ciel gris : façade néoclassique en 3 plans (colonnes cannelées avec ombres, fronton, hautes fenêtres à petits carreaux faiblement éclairées), **pavés mouillés** qui reflètent la façade. Au premier plan, une **rangée de cadets en silhouettes pleines** marche au pas de gauche à droite (parallaxe, 7 à 9 silhouettes) : casquette rigide à visière, tunique ajustée, ceinturon, fusil à l'épaule avec bretelle et crosse dessinées, bottes, jambes qui alternent en rythme. **Une silhouette au centre** porte un fin **liseré de lumière chaude** sur le profil : c'est lui, seul point chaud de l'image. Texte à 9,3 s, y ≈ 1250 (Cinzel 92 pt, blanc froid) : « **1894 · OFFICIER** » ; dessous (Manrope 42 pt) : « il rentre au Kamerun ».
- **Voix off** : « Envoyé en Allemagne, il revient officier : Martin-Paul Samba. » (réplique 4, départ 7,3 s)
- **Fidélité** : 1891 formation militaire et baptême en Allemagne ; 1894 retour, gradé officier. Kurt von Morgan non nommé (place). Les cadets sont une évocation, pas une reconstitution d'uniforme précis.
- **Transition** : les silhouettes sortent du cadre à droite ; la dernière laisse une **traînée d'ombre** qui recouvre l'écran → crête au crépuscule.

### Scène 5 · La vérité entière (10,6 à 13,3 s)
- **Plan 5A (10,6 à 11,9 s)** : en haut, y ≈ 330 (Cinzel 60 pt, terracotta, petites capitales espacées) : « **LA VÉRITÉ ENTIÈRE** ». Image : **une crête au crépuscule froid** (ciel acier strié de nuages bas, dernière lueur rouge sombre à l'horizon), herbes hautes au premier plan qui ondulent. Sur la crête, de droite à gauche, une **longue colonne en silhouettes pleines** (casques coloniaux, fusils à l'épaule, sacs, quelques porteurs chargés), petite dans le cadre, détaillée en contre-jour. Lent panoramique latéral.
- **Plan 5B (11,9 à 13,3 s)** : au centre, y ≈ 1000 : « **1894 – 1902** » (Cinzel 120 pt, blanc froid) ; dessous (Manrope 46 pt, ivoire) : « **au service des expéditions** » / « **de Hans Dominik** » ; puis (Manrope 44 pt, terracotta, souligné d'un trait qui se dessine) : « contre d'autres communautés camerounaises ».
- **Voix off** : « Huit ans, il accompagne les expéditions allemandes. » (réplique 5, départ 10,6 s)
- **Fidélité** : « Pendant huit ans, il accompagne les expéditions militaires du redouté Hans Dominik… contre d'autres communautés camerounaises. » Dit sans détour, sans images de combat.
- **Transition** : retour brutal en **macro sur la tunique** (coupe franche).

### Scène 6 · Les boutons sautent, les siens (13,3 à 15,8 s)
- **Plan 6A (13,3 à 14,4 s)** : `Illu` zoom 3,2 sur les **deux boutons** de la tunique (x 500, y 860), froid. Surimpression : deux **boutons dessinés** (dôme métallique, ombre portée, reflet) posés exactement sur ceux de l'illustration. À **14,0 s** (attaque de la musique), ils **sautent** l'un après l'autre (0,1 s d'écart) : rotation, flou de mouvement, chute hors champ avec rebond, petit `Shake`. Au même instant, la **couture de lumière** traverse l'écran de gauche à droite : tout repasse au chaud. Texte, y ≈ 1250 : « **1902** » (Cinzel 120 pt, or) / « **IL QUITTE L'ARMÉE** » (Cinzel 76 pt, ivoire).
- **Plan 6B (14,4 à 15,8 s)** : **Ebolowa, sous un soleil dur de midi** (ocre brûlé, ombres courtes) : route de terre rouge, cases, un grand arbre. Une **file de porteurs** en silhouettes pleines, hommes et femmes, **charges lourdes** (ballots, paniers, caisses dessinés en volume) sur la tête et le dos, dos courbés, avance lentement de droite à gauche. Texte (y ≈ 1180) : « **TRAVAIL FORCÉ** » (Cinzel 100 pt, terracotta, `PunchWord`) ; dessous (Manrope 44 pt, ivoire, sur bandeau sombre) : « châtiments · réquisitions ».
- **Voix off** : « À Ebolowa, il voit souffrir les siens. » (réplique 6, départ 13,3 s)
- **Fidélité** : 1902, il quitte l'armée et s'installe à Ebolowa ; « travail forcé, châtiments corporels, réquisitions brutales ». Aucun coup montré : la fatigue des corps suffit.
- **Transition** : le soleil tombe en **coucher accéléré** (0,3 s) ; une **lanterne** s'allume au premier plan → nuit.

### Scène 7 · Deux chefs, deux villes, un secret (15,8 à 18,3 s)
- **Plan 7A (15,8 à 16,9 s)** : **écran partagé** par la couture de lumière, devenue un fil or immobile au centre (x 540). **À gauche, EBOLOWA** : nuit en forêt, une case dont la porte laisse passer la lueur d'une **lanterne** (verre bombé, monture de métal, anse, flamme `Flame` réduite), feuillages au premier plan. **À droite, DOUALA** : nuit sur la côte, eau sombre qui ondule (`Water`), **pirogues** effilées tirées sur la rive, palétuviers, une seconde **lanterne** sur une véranda. Les deux flammes **battent au même rythme**. Texte en haut, y ≈ 330 (Cinzel 64 pt, or) : « **1910 · CHEF BULU** ». Étiquettes (Cinzel 52 pt, ivoire), y ≈ 1130 : « EBOLOWA » à gauche, « DOUALA » à droite.
- **Plan 7B (16,9 à 18,3 s)** : un **fin trait de lumière** relie les deux lanternes en passant par la couture (la liaison secrète). Au centre, y ≈ 860 : « **UN SOULÈVEMENT** » / « **SE PRÉPARE** » (Cinzel 96 pt, or, sur halo sombre). Sous les étiquettes (Manrope 40 pt, ivoire) : à gauche « Samba », à droite « Rudolf Duala Manga Bell » (2 lignes si besoin) ; puis, centré (Manrope 38 pt, ocre) : « en secret · armes cherchées chez les Français et les Britanniques ».
- **Voix off** : « Devenu chef, il prépare un soulèvement. » (réplique 7, départ 15,8 s)
- **Fidélité** : chef en 1910 ; contact secret avec Rudolf Duala Manga Bell ; armes côté français, appui côté britannique. **Charles Atangana**, Madola et Edande Mbita non nommés (place).
- **Transition** : la caméra glisse vers la lanterne de gauche ; une **enveloppe** sort de la lueur.

### Scène 8 · La lettre, puis la lanterne (18,3 à 23,1 s)
- **Plan 8A (18,3 à 19,6 s)** : **une enveloppe** (papier épais crème, pli en pointe, **cachet de cire terracotta** sans motif inventé, ombres douces) traverse l'écran en descendant, éclairée par la lanterne, comme portée vers le sud. Texte (y ≈ 1200, Manrope 46 pt, ivoire) : « Été 1914 · une lettre » / « aux forces françaises de Brazzaville ». Aucun texte lisible sur l'enveloppe.
- **Plan 8B (19,6 à 20,6 s)** : une **main gantée** en silhouette pleine, froide (gant à coutures et boutons de poignet, manchette d'uniforme), entre par le haut et **se referme sur l'enveloppe**. L'image **bascule au froid** derrière la couture qui revient. Texte (Cinzel 110 pt, blanc froid, `Shake` léger) : « **INTERCEPTÉE** ».
- **Plan 8C (20,6 à 21,6 s)** : sur fond bleu de Prusse sombre : « **1er AOÛT 1914** » (Cinzel 96 pt, blanc froid) ; dessous (Manrope 44 pt) : « arrêté · inculpé de haute trahison ».
- **Plan 8D (21,6 à 23,1 s)** : **la lanterne d'Ebolowa** en gros plan (scène 7). À **22,0 s**, sur le creux de la musique, sa flamme **vacille et s'éteint** ; un **filet de fumée** monte du verre, la lueur dans le verre décroît lentement. La date s'écrit lettre par lettre (`LetterDrop` lent, sans rebond), y ≈ 1150 : « **8 AOÛT 1914** » (Cinzel 110 pt, ivoire) ; dessous (Manrope 42 pt, ivoire 85 %) : « Ebolowa · exécuté par un peloton allemand ».
- **Voix off** : « Une lettre est interceptée. Une semaine après, on l'exécute. » (réplique 8, départ 18,3 s)
- **Sous-titre karaoké** : la seconde phrase (« Une semaine après, on l'exécute. »), y ≈ 1430.
- **Fidélité** : lettre aux forces françaises de Brazzaville, interceptée ; arrêté le 1er août 1914, inculpé de haute trahison ; exécuté le 8 août 1914 à Ebolowa par un peloton d'exécution allemand. **Aucun peloton, aucune arme, aucun corps montré.** L'exécution de Duala Manga Bell le même jour à Douala n'est pas évoquée, pour ne pas mélanger deux affaires que le récit tient à distinguer.
- **Transition** : la fumée de la lanterne **s'élève et blanchit** jusqu'à devenir un tissu.

### Scène 9 · La légende du mouchoir blanc (23,1 à 26,4 s)
- **Plan 9A (23,1 à 24,8 s)** : sur la reprise de la musique (23,25 s), un **mouchoir blanc** monte du bas et **flotte dans le vent** au centre de l'écran, grand (≈ 600 px) : tissu dessiné avec plis, ombres douces, bords translucides où passe la lumière, ourlet visible ; fond de **ciel d'aube doré** (dégradé or et ocre, poussière lumineuse). Étiquette en haut, y ≈ 320 : « **LÉGENDE** » (Cinzel 64 pt, or, dans un cartouche à double filet) ; dessous (Manrope 38 pt, ivoire) : « transmise à Ebolowa, de bouche à oreille ». Texte, y ≈ 1250 : « **SANS BANDEAU.** » (Cinzel 110 pt, ivoire).
- **Plan 9B (24,8 à 26,4 s)** : le mouchoir **balaie l'écran** comme un rideau et révèle **le portrait entièrement chaud** (`Illu` zoom 1,4 → 1,55 sur le regard, halo doré vif, anneaux qui tournent). Citation (Cinzel 62 pt, italique simulée par `skewX(-8deg)`, ivoire, 3 lignes, largeur 900 px, y ≈ 1120 à 1330) : « … tuez-moi, mais vous n'aurez jamais le Cameroun. » ; dessous (Manrope 34 pt, ivoire 85 %, sur bandeau sombre) : « selon la légende · aucune archive ne la garantit mot pour mot ».
- **Voix off** : « La légende dit qu'il refusa le bandeau. » (réplique 9, départ 23,1 s)
- **Fidélité** : refus du bandeau, mouchoir blanc, phrase « Je n'ai pas peur de la mort, tuez-moi mais vous n'aurez jamais le Cameroun » : tous **légende de tradition orale** selon la fiche. La phrase est **citée partiellement** (points de suspension, sans altérer les mots) et **toujours étiquetée légende**.
- **Transition** : dézoom ; le portrait se fond dans un ciel du soir au-dessus d'une colline.

### Scène 10 · Il a choisi les siens (26,4 à 30,0 s)
- **Plan 10A (26,4 à 27,4 s)** : **une colline au crépuscule** au-dessus des lumières d'une ville ; au sommet, une **statue sur son socle**, en **contre-jour franc** (silhouette pleine, bord doré), halo or derrière la tête (écho du halo AFROBACK). Mention (Manrope 30 pt, ivoire 75 %) : « Ebolowa · sa statue veille sur la ville (évocation) ». Texte, y ≈ 520 à 700 : « **IL A CHOISI** » / « **LES SIENS** » (Cinzel 96 pt, or) : reste affiché au-dessus du téléphone en 10B.
- **Plan 10B (27,4 à 30,0 s)** : variante de `OutroApp` (comme Um Nyobè) avec la **vraie fiche « Martin Paul Samba » de l'app** (capture à faire en phase 2). **Cette fiche est réservée aux abonnés en mode invité** (vérifié le 2026-10-01 : mention « Réservé aux abonnés ») : pas de bouton « Écouter » mis en avant, l'anneau qui pulse entoure le titre. `line1` « SON HISTOIRE », `line2` « ENTIÈRE » ; à **28,0 s** (attaque de la musique), **médaillon AFROBACK** puis **afroback.app**.
- **Voix off** : « Il a choisi les siens. Son histoire, sur AFROBACK. » (réplique 10, départ 26,4 s)
- **Fin** : image figée sur le logo et l'adresse. Aucune mention App Store / Google Play, aucune promesse d'écoute gratuite.

---

## 3. Sous-titres karaoké (`SUBS`)

Seulement là où la phrase n'est pas déjà écrite en gros : répliques **4** (« Envoyé en Allemagne, il revient officier »), **5**, **6**, **7**, **8** (seconde phrase) et **10** (seconde phrase). Position y ≈ 1430, jamais sur un titre ; déplacée à y ≈ 1460 quand la mention « évocations graphiques » est affichée (la mention monte alors à y ≈ 1520, au-dessus de la limite des 380 px du bas). Les répliques 1, 2, 3 et 9 sont déjà portées par les grands textes.

## 4. Points de vigilance (à vérifier sur les planches contact en phase 2)

- **Pas de figurine en bâtons** : cadets, colonne, porteurs, main gantée, statue = silhouettes pleines, détaillées, avec liseré de lumière. Si une silhouette paraît pauvre, on la retire plutôt que de la garder.
- **Pas de trou visuel** : chaque transition est un raccord (couture, pivot, plongée dans le « O », traînée d'ombre, coupe sur la tunique, coucher accéléré, enveloppe sortie de la lueur, fumée qui devient tissu, rideau de mouchoir).
- **Couture de lumière** : jamais de bande noire de chaque côté ; les deux versions du portrait sont parfaitement superposées (même `Illu`, même cadrage).
- **Pivots 3D** : les cartes typographiques ne doivent jamais être lues à l'envers (la face arrière est un second calque déjà retourné, `backface-visibility: hidden`).
- **Texte** : jamais sous 36 pt sauf les mentions (30 à 34 pt, toujours sur fond contrasté). Rien d'important au-dessus de y = 250 ni sous y = 1540.
- **Épilepsie** : aucun flash blanc ; la couture est une ligne lumineuse, pas un éclair plein écran.
- **Sujet sensible** : aucune violence ; le service colonial est dit clairement, sans le réduire ni le dramatiser ; la légende est toujours étiquetée.
- **Statue** : en contre-jour seulement (pas de détails inventés), étiquetée « évocation ». Si Yannick le souhaite, on pourra la redessiner d'après une photo du monument en phase 2.
