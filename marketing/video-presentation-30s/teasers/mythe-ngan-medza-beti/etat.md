# État · Teaser « Ngan Medza, le serpent de la traversée » (mythe-ngan-medza-beti)

- **Phase** : 2 · brief prêt pour le monteur (2026-10-17). Prochaine étape : `afroback-video` en mode teaser, **FR paysage 16:9 d'abord**, puis STOP pour validation.
- Contenu source : `livrables/sites-web/afroback/Mythologie/Cameroun/Centre/mythe-ngan-medza-beti/fr.md` et `en.md` (v2 du 2026-10-15).
- Question qui accroche : « Un tronc surgit du fleuve pour porter tout un peuple. Ce n'était pas un tronc. Que s'est-il passé cette nuit-là ? »
- Fichiers : `script-fr.md`, `script-en.md`, `voix-off-fr.md`, `voix-off-en.md`, `visuels.md`, **`brief-montage.md`** (fait foi pour le minutage), `config-audio-fr.json`, `voix-fr/` (voix FR renumérotées 1 à 9).
- Durée FR : **41,5 s** (calée sur les vraies durées des voix ; limite < 45 s).
- Fin choisie par Yannick : VO 8 « Cette nuit-là, un peuple fut changé à jamais. » ; VO 9 « Ngan Medza, la légende que les anciens refusent d'oublier, écoute-la attentivement. » ; carte NGAN MEDZA + « La légende que les anciens refusent d'oublier » + bouton « Écoute-la ».
- Musique : `BG Music\Legends by the Fire.mp3`, depuis 0 s. Effets sonores : aucun.

## Vérification des fichiers (2026-10-17)
- Voix FR : `C:\Users\Yannico\Desktop\AFROBACK CONTENT\Teasers\mythe-ngan-medza-beti\fr\` : 11 fichiers présents ; 1 à 7, 10 et 11 retenus ; 8 et 9 (ancienne fin) écartés. Durées cohérentes avec les textes (mots / 3,3). À vérifier à l'oreille par Yannick.
- Images : 3 PNG 16:9 (1672 × 940/941), conformes selon Jarvis. Vidéos vid-01 à vid-03 non générées : images animées au montage.
- Limite : en 9:16, les images 16:9 seront agrandies × 2 (solution fond flouté prévue ; versions 9:16 à générer si le rendu est trop doux).

## À venir
- Voix EN à générer après validation du FR paysage : `...\Teasers\mythe-ngan-medza-beti\en\1.mp3` à `9.mp3` (texte dans `voix-off-en.md`, avec les ajouts « Listen, child of the forest. » et « Listen closely. »).
- Sorties : `livrables/sites-web/afroback/teasers/mythe-ngan-medza-beti/mythe-ngan-medza-beti_teaser_[fr|en]_[16x9|9x16]_v1.mp4`.

## Montage FR paysage (afroback-video, 2026-10-17) · LIVRÉ, en attente de validation de Yannick
- Mixage FR fait : `public/audio/teaser-mythe-ngan-medza-beti-fr.wav`, `timing-fr.json` (aucun chevauchement, -14 LUFS).
- Médias copiés dans `public/teasers/mythe-ngan-medza-beti/` : img-1..3.png, fin.jpg, extraits SRC c1a..c7.mp4 déjà recadrés (fenêtre 1750 × 984 à x = 0, y = 96, agrandie en 1920 × 1080).
- **Correction filigrane** : le logo SRC occupe x ≈ 1791 à 1971, y ≈ 5 à 185 ; la fenêtre du brief (x 90 à 1885, y ≥ 70) le laissait en partie visible. Nouvelle fenêtre ci-dessus.
- **Timecodes corrigés** (contrôlés image par image) : 1A 2:27,6 (2:27,0 = fin de la procession en fondu) ; 1C 2:30,4 ; 2B 2:24,0 au lieu de 2:17,0 (2:17,0 = cavaliers ; 2:18 à 2:23 montre l'ancien aux cheveux blancs dans la procession) ; 3C 2:47,2 à 2:48,45 ; 4B 2:52,6 (2:51,9 à 2:52,3 = flash blanc) ; 6B 2:57,2 (2:56 = encore le serpent) ; 7 : 4:21,0 à 4:22,35 seulement (4:22,5 = serpent qui jaillit), ralenti 0,39 par interpolation (minterpolate) pour couvrir 3,4 s.
- Composition : `src/teasers/NganMedza.tsx` (props lang/format ; seule la version FR paysage est déclarée dans `Root.tsx` : `AfrobackTeaserNganMedzaFrPaysage`, 1245 images).
- **Audio corrigé** : avec la musique à 0,30 la voix n'était que 2 à 3 dB au-dessus de la musique sur les VO 4, 8 et 9. `music_volume` passé à 0,12 → écart voix/musique de 9,7 dB (VO 8) à 20 dB, -14,6 LUFS intégrés, crête -1,5 dBFS. Creux de musique du brief (19,0 s et 29,2 s) non faits : le script ne fait que des coupures franches (risque de « trou » audible).
- Plan 5 : la lance est à x ≈ 0,52 de l'image (et non 0,74) ; caméra recentrée, texte à gauche.
- **Livré** : `livrables/sites-web/afroback/teasers/mythe-ngan-medza-beti/mythe-ngan-medza-beti_teaser_fr_16x9_v1.mp4` (1920 × 1080, 41,5 s, vidéo + audio, -14,6 LUFS). Contrôle planche contact fait (aucun logo SRC, aucun plan du dénouement, textes dans le cadre).
- Prochaine étape après validation : FR vertical 9:16, puis voix EN (à générer par Yannick) → EN paysage et EN vertical.

## FR vertical 9:16 (2026-10-17) · LIVRÉ, en attente de validation
- FR paysage v1 validé par Yannick tel quel.
- Composition `AfrobackTeaserNganMedzaFrVertical` (même fichier, `format: "vertical"`, plans V1A à V8). Images 16:9 : fenêtre 4:5 nette (× 1,43) sur fond flouté ; 6A : galerie `02.jpg` copiée en `public/teasers/mythe-ngan-medza-beti/galerie-02.jpg`. Textes entre y = 600 et 1500, sous-titres à bottom 500.
- 1er rendu vertical contrôlé : corrigés titres trop larges (QUELQUE CHOSE RÉPONDIT, UN TRONC, NGAN MEDZA), question du plan 7 déplacée sous le visage, sous-titres sans coupure de mot (nuit-là), lance du plan 5 décalée à droite du texte, reflets d'eau limités à l'eau (ils traversaient les personnages).
- **Défaut repéré dans le FR paysage v1 déjà validé** : au plan 4A (15,7 à 18,6 s), les reflets d'eau animés (traits fins) passent sur la tête et le corps des personnages. Correction possible en v2 (limiter la zone des reflets), à faire seulement si Yannick le demande.
- Reflets animés retirés du plan 4A vertical (ils passaient sur le tronc).
- **Livré** : `livrables/sites-web/afroback/teasers/mythe-ngan-medza-beti/mythe-ngan-medza-beti_teaser_fr_9x16_v1.mp4` (1080 × 1920, 41,5 s, vidéo + audio, -14,6 LUFS, même mix que le paysage).
- Netteté : images 16:9 agrandies × 1,43 (4A) et × 1,79 (5, pour permettre le mouvement vertical), jugées correctes ; aucune régénération indispensable. Option de confort : versions 9:16 natives de « Marcheur au bâton sur tronc humide » (plan 5).
- Prochaine étape : voix EN à générer par Yannick, puis EN paysage et EN vertical (sans nouvelle validation intermédiaire).
