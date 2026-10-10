# État · Démo Kiro'o Games « Aurion, le jour du couronnement »

- **Phase** : LIVRÉE le 2026-10-05 (v1, 59 s) : `livrables/candidatures/freelance-creatif/kiroo-games/2026-10-05_KirooGames-Aurion_reel-59s_v1.mp4`.
- Script : `script.md` (10 scènes, sources des faits incluses) · Voix off : `voix-off.md`
- Voix attendues : `C:\Users\Yannico\Music\Afroback Stories Audio\Voix Aurion\1.mp3` à `10.mp3`
- Musique : `BG Music\Baobab Oath (1).mp3`, offset 52,0 s (entrée pleine à 56 s = 4 s dans la vidéo), volume 0,30. Offset jamais utilisé dans les vidéos précédentes (8 et 124).
- Effets sonores : aucun (option : `SFX\aurion-kiroo\fissure.mp3`, voir script).
- Images source : `C:\Users\Yannico\Downloads\ORION\` (A couronnement webp, B duo flammes jpg, C comic Vol. 02 jpg, D Enzo armure avif, E 3D couple jfif 500×301, F saut aura jfif, G chibi jfif, logo png 187×80). En phase 2 : les convertir en jpg/png dans `public/img/aurion/` (ffmpeg, avif/jfif/webp).
- Composition prévue : `src/recits/AurionKiroo.tsx`, id `AfrobackRecitAurionKiroo30s`.
- Sortie prévue : le dossier de candidature Kiro'o (`livrables/candidatures/freelance-creatif/kiroo-games/2026-10-XX_KirooGames-Aurion_reel-30s_v1.mp4`) plutôt que `afroback/marketing/` : à confirmer par Yannick.

## Points ouverts (à trancher par Yannick avant la phase 2)
1. Noms : jeu 2016 = Enzo / Erine ; site officiel actuel = Enkwo / Ewineh. Script en Enzo/Erine.
2. Carte de fin sans AFROBACK (choix de la démo).
3. Image G (chibi) : identité du personnage incertaine (dreadlocks, joyau rouge : ressemble à Enzo). Usage seulement optionnel en fin, sans nom.
4. Basses définitions : E (500×301) et logo (187×80). Demander des fichiers HD si possible.
5. Droits : démo de prospection privée, illustrations © Kiro'o Games, aucune diffusion publique sans accord du studio.

## Phase 2 · production (démarrée le 2026-10-05)
Décisions de Yannick (2026-10-05) : tout validé par défaut (Enzo/Erine, carte de fin sans AFROBACK, sortie dans `livrables/candidatures/freelance-creatif/kiroo-games/`). **Nouvelle durée : 59 s.** Voix et images dans `C:\Users\Yannico\Downloads\ORION\` (voix : sous-dossier `Voix off\1.mp3` à `10.mp3`).
- [x] Audios reçus : 10 fichiers, durées après coupe des silences 0,43 / 2,93 / 2,72 / 2,16 / 2,54 / 2,17 / 2,91 / 3,32 / 1,21 / 2,28 s (cohérent avec les 10 répliques, ordre plausible).
- [x] Images converties dans `public/img/aurion/` (a-couronnement, b-duo-flammes, c-comic, d-enzo-armure, e-couple-3d, f-saut-aura, g-chibi, logo).
- [x] Musique : Baobab Oath (1), offset 121,3 s (silence total du morceau à 27,0 à 28,7 s vidéo, gros impact à 30,75 s = « l'Aurion » ; relance de phrase à 10,75 / 15,25 (fissure) / 46,75 s (fin)).
- [x] Mixage : `config-audio.json` → `public/audio/mix-aurion-kiroo-59s.wav` (-14,5 LUFS). Lit de musique pré-découpé avec enveloppe de volume + effets sonores synthétisés (impact, whoosh, fissure, montée) dans `audio-src/`.
- [x] Composition : `src/prospects/AurionKiroo.tsx`, id `ProspectKirooAurionReel59s` (déclarée dans Root.tsx, sans toucher aux autres lignes).
- [x] Aperçu 1 rendu + planches contact regardées, corrections passe 1 appliquées (voile haut sur le logo anglais de A, rouge Trahison, L'EXIL, bande E agrandie, textes déplacés).
- [x] Aperçu 2 contrôlé, dernières corrections (voiles, montage).
- [ ] Détourage rembg (vraie parallaxe par couches) : ABANDONNÉ, téléchargement du modèle coupé (réseau lent). Code prêt : déposer `b-duo-flammes-detoure.png`, `c-comic-detoure.png`, `d-enzo-armure-detoure.png` dans `public/img/aurion/` et passer `USE_CUTOUTS = true`.
- [x] Transcription locale (faster-whisper small) : 10 répliques conformes ; la 5 ne transcrit pas « Trahison ! » (0,46 s de son présent avant « Le frère ») : à vérifier à l'oreille.
- [x] Rendu final v1 : 59,0 s, 1080×1920, 1770 images, audio -14,6 LUFS, planches contact regardées.

## v2 · 30 s (demande de Yannick, 2026-10-05) · LIVRÉE
- Fichier : `livrables/candidatures/freelance-creatif/kiroo-games/2026-10-05_KirooGames-Aurion_reel-30s_v2.mp4` (30,0 s, 1080×1920, 900 images, -14,3 LUFS). La v1 59 s reste intacte.
- Composition `ProspectKirooAurionReel30s` (`AurionKiroo30` dans `src/prospects/AurionKiroo.tsx`) : mêmes scènes que la 59 s, fenêtres resserrées (`SCENES30`, champ `skip`), carte de fin courte (`S10` paramétrée, valeurs 59 s par défaut inchangées).
- Audio : `config-audio-30s.json` → `public/audio/mix-aurion-kiroo-30s.wav` ; musique `audio-src/musique-aurion-30s.wav` = Baobab Oath (1) depuis 134,95 s (gros impact à 17,1 s sur « l'Aurion », silence du morceau 13,3 à 15,05 s sous « Enzo est chassé »).
- Coupé par rapport à la 59 s : montage rapide 0,5 s, plan escalier + « L'EXIL », silence noir 27 à 28,7 s (les yeux rouges), recul sur le duo Enzo/Erine, début sombre de l'accroche, diaporama de fin.
- Planches contact toutes les 0,5 s regardées : RAS bloquant.
