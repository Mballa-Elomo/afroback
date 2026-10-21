# Brief de montage · Teaser Ngan Medza (mode teaser, pour `afroback-video`)

> Écrit le 2026-10-17 par `afroback-teaser`. **Ce brief fait foi pour le minutage** : les temps de `script-fr.md` (version 30 s) sont remplacés par ceux ci-dessous. Les intentions de plan, les textes et les points de vigilance de `script-fr.md` restent valables.
> À lire aussi : `script-fr.md` (cadrages, vigilance), `visuels.md` (inventaire, exclusions), `voix-off-fr.md`, `etat.md`.

## 1. Ordre de production imposé

1. **FR paysage 16:9 (1920 × 1080)** → livré à Yannick pour validation, **STOP**.
2. Après validation : **FR vertical 9:16**, puis **EN paysage** et **EN vertical** (mêmes plans, voix EN, textes EN de `script-en.md`, minutage recalé sur les vraies durées EN).

Compositions (une seule composition paramétrée `src/teasers/NganMedza.tsx`, props `lang` et `format`) :
`AfrobackTeaserNganMedzaFrPaysage`, `AfrobackTeaserNganMedzaFrVertical`, `AfrobackTeaserNganMedzaEnPaysage`, `AfrobackTeaserNganMedzaEnVertical`. 30 i/s. **Durée FR : 41,5 s (1245 images)** ; durée EN à fixer sur les voix EN (< 45 s).

Sorties :
`livrables/sites-web/afroback/teasers/mythe-ngan-medza-beti/mythe-ngan-medza-beti_teaser_fr_16x9_v1.mp4` (puis `_fr_9x16_v1`, `_en_16x9_v1`, `_en_9x16_v1`).

## 2. Fichiers

| Quoi | Chemin |
|---|---|
| Voix FR (renumérotées 1 à 9, prêtes pour le mixeur) | `PROJET/teasers/mythe-ngan-medza-beti/voix-fr/1.mp3` à `9.mp3` (copies ; originaux dans `C:\Users\Yannico\Desktop\AFROBACK CONTENT\Teasers\mythe-ngan-medza-beti\fr\`, où 8.mp3 et 9.mp3 sont l'ancienne fin à ignorer) |
| Config de mixage FR (prête) | `PROJET/teasers/mythe-ngan-medza-beti/config-audio-fr.json` → `python scripts/mix-voix-musique.py teasers/mythe-ngan-medza-beti/config-audio-fr.json` (sortie `public/audio/teaser-mythe-ngan-medza-beti-fr.wav`, `timing-fr.json`) |
| Musique | `C:\Users\Yannico\Music\Afroback Stories Audio\BG Music\Legends by the Fire.mp3`, depuis 0 s, volume 0,30, ducking sous la voix (déjà dans la config) |
| Vidéo source (SRC) | `C:\Users\Yannico\Desktop\AFROBACK CONTENT\Audio Afroback\Mythologie\Ngan Medza\ngan medza.mp4` (1986 × 1080, 30 i/s, logo AFROBACK incrusté en haut à droite) |
| IMG-1 « le tronc » | `C:\Users\Yannico\Desktop\AFROBACK CONTENT\Teasers\mythe-ngan-medza-beti\Le peuple face au tronc mythique.png` (1672 × 941) |
| IMG-2 « la loi » | `...\Teasers\mythe-ngan-medza-beti\Marcheur au bâton sur tronc humide.png` (1672 × 940) |
| IMG-3 « la procession » | `...\Teasers\mythe-ngan-medza-beti\Procession au coucher du soleil tropical.png` (1672 × 941) |
| Fond de la carte de fin | `C:\Users\Yannico\Desktop\AFROBACK CONTENT\Photos\mythologie-renamed\mythe-ngan-medza-beti.jpg` (1024 × 1024) |
| Logo | `PROJET/public/img/afroback-logo.png` |

Copie les médias utiles dans `PROJET/public/teasers/mythe-ngan-medza-beti/` (noms simples : `src.mp4` ou extraits découpés, `img-1.png`, `img-2.png`, `img-3.png`, `fin.jpg`). **Pas de vidéos générées** (vid-01 à vid-03 n'existent pas) : les 3 images sont animées au montage (`Illu` : push-in ou panoramique lents, + `Fog`, reflets d'eau `Water` en surimpression légère, `Embers` discrets), sans silhouettes ni dessins codés.

**Filigrane SRC en 16:9** : chaque extrait SRC est affiché avec la fenêtre source x = 90 à 1885, y = 70 à 1080 (1795 × 1010) agrandie à 1920 × 1080, pour faire sortir le logo du cadre. Vérifie sur la planche contact qu'aucun logo ne subsiste.

## 3. Voix FR (temps absolus dans la vidéo)

| N° | Départ | Fin de parole | Texte |
|---|---|---|---|
| 1 | 0,30 | 2,25 | Écoute, enfant de la forêt. |
| 2 | 2,85 | 6,56 | Devant eux, le Yom. Sans pont. Sans gué. |
| 3 | 7,15 | 10,89 | Avec eux, les vieillards, les enfants, tout un peuple. |
| 4 | 11,50 | 15,01 | Alors ils appelèrent. Et quelque chose répondit. |
| 5 | 15,70 | 20,28 | Un tronc surgit de l'eau, d'une rive à l'autre. Ce n'était pas un tronc. |
| 6 | 20,95 | 24,18 | Une loi : rien qui pique, rien qui blesse. |
| 7 | 24,85 | 29,16 | Famille après famille, ils passèrent. Puis vint la nuit… |
| 8 | 30,10 | 33,34 | Cette nuit-là, un peuple fut changé à jamais. |
| 9 | 34,20 | 40,20 | Ngan Medza, la légende que les anciens refusent d'oublier, écoute-la attentivement. |

Respirations de 0,6 à 0,8 s entre répliques, 0,9 s de silence tendu après « Puis vint la nuit ». Aucune voix accélérée. Après mixage, recale les textes sur `timing-fr.json` si le mixeur décale un départ.

## 4. Plans et minutage FR (41,5 s)

| Plan | Temps | Image (extrait SRC en mm:ss,s) | Mouvement / effets | Texte à l'écran (FR) |
|---|---|---|---|---|
| 1A | 0,0 à 2,6 | SRC 2:27,0 à 2:29,6 · fleuve sous la lune, ondes | fondu du noir à 0,2 s, push-in lent, `Fog` | **ÉCOUTE.** à 0,3 · mention basse « Légende de tradition orale beti · Cameroun » de 0,3 à 7,0 |
| 1B | 2,6 à 4,6 | SRC 2:34,0 à 2:36,0 · foule inquiète sur la rive | coupe franche, léger travelling | **LE YOM** à 4,0 (+ petite mention terracotta « la Sanaga ») |
| 1C | 4,6 à 7,0 | SRC 2:30,0 à 2:32,4 · l'eau noire qui s'agite | push-in | « Sans pont. Sans gué. » à 5,0 |
| 2A | 7,0 à 9,0 | SRC 2:00,5 à 2:02,5 · la marche au coucher du soleil, paniers sur la tête | fondu au noir rapide (6 images) en entrée | (aucun) |
| 2B | 9,0 à 11,3 | SRC 2:17,0 à 2:19,3 · procession de torches dans la forêt | travelling latéral lent | **TOUT UN PEUPLE** à 10,0 |
| 3A | 11,3 à 13,4 | SRC 2:38,0 à 2:40,1 · l'ancien lève les bras au bord du fleuve | push-in lent | « Ils appelèrent… » à 11,5 |
| 3B | 13,4 à 14,6 | SRC 2:46,0 à 2:47,0 · cercles sur l'eau noire, lune | aucun | **QUELQUE CHOSE RÉPONDIT.** à 13,5 |
| 3C | 14,6 à 15,7 | SRC 2:47,0 à 2:48,1 · la foule saisie | fondu enchaîné 8 images vers 4A | (titre précédent maintenu jusqu'à 15,2) |
| 4A | 15,7 à 18,6 | **IMG-1** · le peuple face au tronc | push-in lent depuis le plan large, brume qui dérive, scintillement d'eau | **UN TRONC.** à 15,9 · « d'une rive à l'autre » à 17,4 |
| 4B | 18,6 à 21,0 | SRC 2:52,0 à 2:54,4 · tête du serpent qui affleure, œil doré | push-in vers l'œil, musique en retrait 0,5 s | **CE N'ÉTAIT PAS UN TRONC.** à 19,0 (`SinkLetters`) |
| 5 | 21,0 à 24,6 | **IMG-2** · lance tenue par le bout arrondi, pointe levée | lente remontée de la hampe vers la pointe (tilt simulé), reflet doré qui glisse sur le fer | **UNE LOI** à 21,0 · « Rien qui pique. Rien qui blesse. » à 22,1 |
| 6A | 24,6 à 27,6 | **IMG-3** · familles en file sur le tronc au coucher du soleil | panoramique latéral lent gauche → droite, étalonnage qui glisse de l'or vers le bleu | karaoké « Famille après famille… » à 24,85 |
| 6B | 27,6 à 29,0 | SRC 2:56,0 à 2:57,4 · la traversée continue de nuit, femme à la torche | aucun | **PUIS VINT LA NUIT.** à 27,8 |
| 6C | 29,0 à 30,6 | SRC 3:05,0 à 3:06,6 · porteur de torche en fin de file | étalonnage plus sombre, flamme qui vacille, musique qui retient son souffle | (titre précédent maintenu jusqu'à 29,8) |
| 7 | 30,6 à 34,0 | SRC 4:20,6 à 4:22,9 · un ancien raconte devant le feu, enfants autour (ralenti 0,68) | push-in lent, `Embers` | « Que s'est-il passé cette nuit-là ? » à 31,0 (Cinzel, or) |
| 8 | 34,0 à 41,5 | Fond `fin.jpg` très assombri et flouté, lent zoom, `Fog` + `Embers` | éléments qui apparaissent l'un après l'autre (changement visuel régulier sur 7,5 s) ; fondu au noir de 40,8 à 41,5 | **NGAN MEDZA** à 34,2 (grand, or) · « La légende que les anciens refusent d'oublier » à 35,7 · logo AFROBACK discret à 36,8 · bouton or **Écoute-la** à 38,8 (pulsation douce, pas de clic) · petite mention « Légende de tradition orale beti » |

Pas de capture d'app, pas de badge de store, pas d'adresse web. Pas de flash blanc.

## 5. Exclusions dans SRC (rappel)

Ne prends **jamais** : 1:16 à 2:15 (cavaliers, villages en feu), 2:48,5 à 2:51,9 (serpent qui jaillit de l'eau), 3:12 à 4:00 (lance plantée, sang, flamme sur les écailles, serpent cornu, chute, noyade), 4:23 à 4:27 (serpent dressé), 4:44 à 4:56 et 5:20 à 5:34 (chute, noyade), les plans de l'ancien aux cheveux blancs de l'ancienne version (Nanga, 0:36, 3:48 à 3:55). Si tu veux remplacer un extrait, choisis-le avant 2:48 (hors cavaliers) ou dans 2:52 à 3:08, et signale-le.

## 6. Préparation des versions suivantes (ne pas faire avant validation)

- **Vertical 9:16** : les fenêtres SRC de `script-fr.md` restent valables (centres x indiqués). Les 3 images sont en 16:9 (1672 px de large) : une fenêtre 9:16 n'y fait que 529 px de large (agrandissement × 2). Pour 4A, 5 et 6A, compose en vertical avec l'image recadrée sur le sujet (tronc et foule au centre ; hampe de la lance au centre ; 2 ou 3 marcheurs) **sur un fond flouté de la même image**, ou utilise `galeries/images/mythe-ngan-medza-beti/02.jpg` (4:5) pour 6A. Signale si le rendu est trop doux : Yannick pourra générer des versions 9:16.
- **EN** : voix EN pas encore générée. Elle reprend les 2 ajouts de Yannick : réplique 1 « Listen, child of the forest. » et réplique 9 « Ngan Medza, the legend the elders refuse to forget. Listen closely. » (voir `voix-off-en.md`). Dépôt prévu : `C:\Users\Yannico\Desktop\AFROBACK CONTENT\Teasers\mythe-ngan-medza-beti\en\1.mp3` à `9.mp3`. Écris alors `config-audio-en.json` avec les mêmes respirations et recale les plans sur les vraies durées. Carte de fin EN : NGAN MEDZA · « The legend the elders refuse to forget » · bouton **Listen**.

## 7. Contrôle qualité attendu

Planche contact (une image toutes les 0,5 s), `ffprobe` (41,5 s, vidéo + audio), loudness autour de -14 LUFS. Vérifie : aucun logo SRC visible, aucun plan du dénouement, textes sans faute et dans le cadre, titres jamais masqués par un sous-titre, enchaînement de style sans rupture entre SRC et les 3 images (étalonnage commun or et nuit bleue si besoin). Mets à jour `etat.md` après livraison.
