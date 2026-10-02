# État · Vidéo récit « Charles Atangana » (héros, Cameroun)

- **Phase** : livrée le 2026-10-02 (v1), en attente du retour de Yannick à l'oreille.
- Vidéo : `livrables/sites-web/afroback/marketing/2026-10-02_AFROBACK-charles-atangana-30s_v1.mp4` (30 s, 1080 × 1920, 30 i/s, vidéo + audio, -14,4 LUFS)
- Récit source : `livrables/sites-web/afroback/Héros/Cameroun/charles-atangana/fr.md`
- Angle : « La balance ». Script : `script.md` (statut et écarts à jour) · Voix off : `voix-off.md`
- Correction de fidélité validée avec Yannick : réplique 1 « Il a servi deux puissances coloniales. », accroche « AU SERVICE DE DEUX PUISSANCES COLONIALES », aucune médaille dans la balance.
- Voix : `C:\Users\Yannico\Music\Afroback Stories Audio\Voix Charles Atangana\1.mp3` à `10.mp3`. Durées sans silences : 1,97 · 2,30 · 2,03 · 1,62 · 2,93 · 1,90 · 1,41 · 1,52 · 2,39 · 5,65 s. Aucun signe de fichier inversé.
- Départs réels : 0,2 · 2,4 · 4,9 · 7,4 · 9,9 · 13,2 · 15,7 · 18,0 · 20,5 · 23,3 s (la 10 avancée de 24,2 à 23,3 car trop longue)
- Musique : `BG Music\Baobab Oath (1).mp3` à partir de 124,0 s · Effets sonores : aucun
- Mixage : `config-audio.json` → `public/audio/mix-charles-atangana.wav` + `timing.json`
- Images : `public/heros/charles-atangana.jpg`, `public/img/capture-app-charles-atangana.png` (fiche réservée aux abonnés en invité, buttonY 376 = titre)
- Composition : `src/recits/CharlesAtangana.tsx` + `src/recits/atangana-props.tsx` (id `AfrobackRecitCharlesAtangana30s`, déclarée dans `src/Root.tsx`)
- Contrôle qualité : planches contact toutes les 0,5 s sur 4 rendus. Corrections : reflet en disque blanc sur le col retiré ; ouverture refaite en plan large lumineux (luminance image 0 : 66 → 81/255) avec texte net dès l'image 0 ; balance qui tombait à travers le titre ; transition grise vers l'ardoise remplacée par une plongée chaude ; craie trop pâle ; bandeaux qui passaient sur 2 lignes ; bande noire au glissement pièces → tente ; mention « évocation » qui chevauchait un bandeau ; pierres qui traversaient le titre ; empreintes trop denses et étirées ; étiquettes « COLLABORATEUR ? » coupées ; fondu au noir qui masquait « COMPRENDRE » (fin prolongée, outro à 26,6 s).
