# État · Vidéo de présentation AFROBACK (60 s) · « Tu connais… ? »

- **Phase** : livrée le 2026-10-03 (v1), en attente du retour de Yannick à l'oreille. À NE PUBLIER QU'UNE FOIS L'APP EN LIGNE SUR LES DEUX STORES.
- Cas particulier : présentation de l'app (pas un récit), **60 s**, angle « question choc » imposé par Yannick, fin promo de 8 s.
- **À NE PUBLIER QU'UNE FOIS L'APP EN LIGNE SUR LES DEUX STORES.** Fin avec badges officiels « Télécharger dans l'App Store » et « Disponible sur Google Play » : décision de Yannick (2026-10-03), vidéo destinée au jour de la publication. Exception assumée à la règle « jamais Disponible sur… ». Règle permanente de Yannick : les badges des stores figurent toujours dans ses vidéos de promo d'app.
- Badges : fichiers **officiels** à télécharger en phase 2 (Apple : App Store Marketing Guidelines / outil de badges ; Google : play.google.com/intl/fr/badges), versions françaises, jamais redessinés ni animés de façon déformante. Mentions légales Apple et Google en petit à la fin.
- Script : `script.md` · Voix off : `voix-off.md` (18 répliques, 134 mots)
- Voix attendues : `C:\Users\Yannico\Music\Afroback Stories Audio\Voix Presentation 60s\1.mp3` à `18.mp3`
- Départs prévus : 0,15 · 2,0 · 4,3 · 6,8 · 9,9 · 12,6 · 16,4 · 20,2 · 23,4 · 26,8 · 30,6 · 34,9 · 39,8 · 42,2 · 45,6 · 49,6 · 52,0 · 55,6 s
- Musique : `BG Music\Legends by the Fire.mp3`, à partir de 8,4 s (montée naturelle à 28,5 s du fichier = 20,1 s de la vidéo, sous le drop du logo). Pas de boucle nécessaire (toutes les pistes dépassent 3 min 55). Creux de musique 39,3 → 39,8 s à ajouter au mixage (petit ajout rétrocompatible au script `mix-voix-musique.py`).
- Effets sonores : aucun.
- Captures facultatives à demander à Yannick en phase 2 : lecteur audio en lecture (réservé aux membres), sélecteur « Qui est-ce ? » + accueil enfant (compte avec profil enfant). Solutions de repli prévues dans le script.
- Composition prévue : `src/recits/Presentation60s.tsx`, id `AfrobackPresentation60s` (60 s = 1800 images), déclarée dans `src/Root.tsx`.
- Vidéo finale prévue : `livrables/sites-web/afroback/marketing/AAAA-MM-JJ_AFROBACK-presentation-app-60s_v1.mp4`

## Phase 2 (démarrée le 2026-10-03)
- Voix reçues : 18/18. Durées brutes cohérentes (environ 3 mots/s). 10, 15 et 18 ont la même taille (72 526 octets = même durée en débit constant, 3,474 s) mais des contenus différents (empreintes MD5 différentes, enveloppes sonores non corrélées : 0,14 à 0,36) : pas des doublons.
- Durées après coupe des silences : 1,04 · 2,20 · 2,77 · 3,37 · 2,14 · 4,10 · 2,71 · 3,10 · 3,02 · 3,08 · 4,28 · 4,42 · 1,73 · 4,22 · 3,06 · 1,27 · 3,95 · 3,11 s (53,6 s de voix au total).
- Départs réels (recalés pour éviter les chevauchements, drop du logo gardé à 20,1 s) : 0,15 · 1,45 · 3,9 · 6,9 · 10,5 · 12,85 · 17,2 · 20,2 · 23,5 · 26,75 · 30,1 · 34,6 · 39,8 · 41,8 · 46,25 · 49,55 · 51,4 · 55,6 s. La promo commence donc à 51,4 s (8,6 s).
- Mixage OK : `public/audio/mix-presentation-app-60s.wav`, -14,0 LUFS, `timing.json` écrit. Ajout rétrocompatible au script de mixage : champ facultatif `music_dips` (creux 39,3 → 39,8 s).
- Badges officiels téléchargés (versions françaises, non modifiés) : `public/badges/app-store-fr.svg` (outil officiel Apple toolbox.marketingtools.apple.com, « Download_on_the_App_Store_Badge_FR_RGB_blk ») et `public/badges/google-play-fr.png` (play.google.com, `fr_badge_web_generic.png`, « DISPONIBLE SUR Google Play »).
- Captures réelles (mode invité, 2026-10-03) : `public/img/capture-app-p60-*.png` (accueil, catalogue Héros x2, fiche Nzinga, récit Nzinga chapitres 1 et 2, Mythologie, Découverte, Communauté, commentaires réels de la fiche Nzinga) + fiche Ruben déjà présente.
- Écarts au script : le fil Communauté est vide (« Le fil est encore calme ») : la scène 13 montre donc les vrais J'aime / commentaires de la fiche Nzinga, puis le fil vide avec le bouton « Publier » (aucun faux post). Pas de capture du lecteur audio ni de l'Espace enfants (non fournies) : « Écoute » = fiche avec le bouton « Écouter » qui pulse + onde dorée ; « Transmets » = illustration `img/transmettre.jpg` marquée « Illustration AFROBACK ». La promo commence à 51,35 s (8,65 s).
- Badges : même hauteur visible (le PNG Google a une marge transparente intégrée, compensée par la taille d'affichage, fichier non modifié) ; animation par fondu + glissement uniquement.
- Composition : `src/recits/Presentation60s.tsx` (id `AfrobackPresentation60s`, déclarée dans `src/Root.tsx`), `npx tsc --noEmit` propre.
- **Vidéo livrée** : `livrables/sites-web/afroback/marketing/2026-10-03_AFROBACK-presentation-app-60s_v1.mp4` (60,0 s, 1080 × 1920, vidéo + audio, -14,0 LUFS).
- Contrôle qualité : planches contact toutes les 0,5 s sur 3 rendus. Corrections : moitiés basses noires pendant 1 s (portraits Nzinga/Njoya qui arrivaient trop tard), visages couverts par le texte, page du manuel qui chevauchait « L'histoire des autres », bord noir sur l'illustration des géants Sao, vignettes de « Tout est là » qui masquaient le titre, zoom de la scène Communauté qui masquait le titre, reflet blanc parasite sur « TRANSMETS », mention « Illustration AFROBACK » sous le sous-titre, espacement « Retour aux origines » / afroback.app, badge Google plus petit que celui d'Apple.
