# État · Poème « Bonne nuit » (format nouveau : poème de motivation, pas une annonce de récit)

- **Phase** : 2 (production) en cours, démarrée le 2026-10-07. Texte et voix déjà validés par Yannick (pas de phase 1).
- Voix : fichier unique `C:\Users\Yannico\Music\Afroback Stories Audio\Voix Bonne nuit\ElevenLabs_2026-10-07T21_53_19_Paul K — Deep French Narrator_...mp3`, 50,83 s (parole 0,00 → 50,34 s), -19,5 LUFS brut.
- Transcription mot à mot (faster-whisper small, local) : `whisper-mots-voix-brute.json`. La voix dit exactement le texte du poème (aucun écart de mots).
- Choix de montage : la voix est plus courte que prévu (50,8 s au lieu de 59). On la découpe aux 5 respirations (fins de strophe + avant « Bonne nuit ») et on ajoute 0,7 s / 0,4 s de silence pour laisser respirer, + 1 s d'intro. Fin AFROBACK 55 → 59 s. Total 59 s (1770 images).
- Musique : `BG Music\Baobab Oath (1).mp3` depuis 0 s (48 premières secondes = nappe grave très douce, peu percussive ; s'éclaire vers 50 s = montée naturelle sur la fin). Création Suno de Yannick.
- Fin : pas de badges stores (app pas encore publiée, et ce n'est pas une promo d'app) : logo + accueil de l'app dans le téléphone + afroback.app.
- Code prévu : `src/poemes/BonneNuit.tsx`, id `AfrobackPoemeBonneNuit59s`.

## Avancement
- Mixage fait : `public/audio/mix-poeme-bonne-nuit.wav` (script `recits/poeme-bonne-nuit/mix-poeme.py`, config `config-audio.json`), -14,3 LUFS. Minutage des mots recalé : `timing.json` + `src/poemes/bonne-nuit-mots.ts` (132 mots, alignés 1 pour 1 avec le texte du poème).
- Composition écrite : `src/poemes/BonneNuit.tsx`, déclarée dans `src/Root.tsx` (id `AfrobackPoemeBonneNuit59s`), tsc propre.
- Rendu de contrôle basse définition regardé (planches toutes les 0,5 s). Corrigé : texte sur la lune (lune déplacée, textes descendus), bande noire sur l'illustration à 47 s, soleil visible sous la carte, en-tête de fin sur la lune.
- Prochaine étape : rendu final `../2026-10-07_AFROBACK-poeme-bonne-nuit-59s_v1.mp4` puis contrôle.
- Fins de cartes raccourcies (plus aucune superposition de deux strophes), re-rendu, transitions recontrôlées.
- **Phase : livrée le 2026-10-08 (v1)** : `livrables/sites-web/afroback/marketing/2026-10-07_AFROBACK-poeme-bonne-nuit-59s_v1.mp4` (59,0 s, 1080 × 1920, 30 i/s, vidéo + audio, -14,3 LUFS). En attente du retour de Yannick (oreille + œil).
