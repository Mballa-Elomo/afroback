# État · Vidéo récit « Ruben Um Nyobè » (héros, Cameroun)

- **Phase** : livrée le 2026-10-01 (v1), en attente du retour de Yannick à l'oreille.
- Vidéo : `livrables/sites-web/afroback/marketing/2026-10-01_AFROBACK-ruben-um-nyobe-30s_v1.mp4` (30 s, 1080 × 1920, 30 i/s, -14,2 LUFS)
- Récit source : `livrables/sites-web/afroback/Héros/Cameroun/ruben-um-nyobe/fr.md`
- Script : `script.md` (statut mis à jour) · Voix off : `voix-off.md`
- Voix : `C:\Users\Yannico\Music\Afroback Stories Audio\Voix Ruben Um Nyobe\1.mp3` à `10.mp3` (durées cohérentes ; la 3 est lente : 3,2 s pour 6 mots, à cause des pauses après les virgules)
- Départs réels des répliques (décalés pour éviter les chevauchements) : 0,15 · 1,95 · 5,0 · 8,35 · 11,55 · 14,7 · 16,9 · 19,4 · 22,45 · 26,2 s
- Musique : `BG Music\Legends by the Fire.mp3`, à partir de 57,5 s · Effets sonores : aucun
- Mixage : `config-audio.json` → `public/audio/mix-ruben-um-nyobe.wav` + `timing.json`
- Images : `public/heros/ruben-um-nyobe.jpg`, `public/img/capture-app-ruben-um-nyobe.png` (fiche en mode invité : ce récit est réservé aux abonnés, il n'y a donc pas de bouton « Lire / Écouter » visible ; l'anneau qui pulse entoure le titre, buttonY 376)
- Composition : `src/recits/RubenUmNyobe.tsx` + accessoires dessinés `src/recits/ruben-props.tsx` (id `AfrobackRecitRubenUmNyobe30s`, déclarée dans `src/Root.tsx`)
- Contrôle qualité : planches contact toutes les 0,5 s vérifiées sur 3 rendus. Corrections : « UPC » qui s'affichait en bande dorée (passé en texte SVG), nom doré qui devenait une bande en scène 9, tampon « INTERDIT » / « DISSOUTE » qui débordait, « UPC » estompé sous le tampon pour que « DISSOUTE » se lise, texture du béton, titres ONU déplacés sous le micro, sous-titre qui doublonnait « À l'ONU », « HÉROS NATIONAL » qui touchait le bord, nom qui se superposait à « SANS NOM » pendant les fissures.
