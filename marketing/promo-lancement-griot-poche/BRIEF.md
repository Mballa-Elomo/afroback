---
workflow: product-launch-video
format: 1080x1920
duration: 30s
audio: voice          # voix griot ElevenLabs + musique + bruitages
loop: false
theme: "à choisir à l'étape 3"
---

# AFROBACK · Promo de lancement « Le griot dans ta poche »

> Rédigé le 2026-10-10 avec `/saas-motion-video` (étape 1). **Statut : à valider par Yannick.**

**Message unique :** Le griot qui racontait l'histoire au village tient maintenant dans ta poche.

**Public et diffusion :** jeunes adultes et parents camerounais et de la diaspora, sur TikTok, Reels, Facebook et statut WhatsApp. Vertical 9:16, 30 s. Son activé en priorité (voix griot), mais un texte minimal à l'écran pour que le message passe aussi sans le son.

**Source de vérité :** `marketing/play-store/fiche-play-store.md` et l'app elle-même (version web `https://afroback-test.vercel.app`, captures existantes). Aucune affirmation, aucun chiffre ni nom de contenu en dehors de ces sources.

**Moment de preuve :** un récit qui se lance dans l'app et la narration façon griot qui démarre. C'est la fonctionnalité qui porte le message : on n'écoute plus le griot au village, on l'écoute dans l'app.

**Ce que la vidéo n'est pas :** pas un tour des fonctionnalités (les présentations 30 s et 60 s existent déjà). On ne montre que ce qui prouve le message : écouter un récit. Les autres piliers (Mythes, Découverte, École des Héros) apparaissent au plus en un clin d'œil.

**Composants** (inventaire détaillé à l'étape 2)
| Composant | Réel ou imaginaire | Notes |
|---|---|---|
| Écran d'accueil de l'app | Réel | captures existantes `play-store/capture-*.png` |
| Fiche d'un héros ou d'un mythe | Réel | capture à refaire si besoin (héros à choisir) |
| Lecteur de narration (audio griot) | Réel | à capturer dans l'app |
| Logo AFROBACK | Réel, fichier officiel | `video-presentation-30s/public/img/afroback-logo.png` |
| Badges App Store + Google Play | Réels, fichiers officiels | `video-presentation-30s/public/badges/*-fr.*` |

**Marque :** couleurs de l'app (`app-mobile/mobile-app/src/theme/tokens.ts`) : fond `#0F0B08`, or `#F0C36B` / `#E9BE77`, or pâle `#F7D98B`, texte `#EDE3D4`, titres `#F7E7C8`. Polices : Cinzel (titres), Manrope (texte). Pas de noir ni de blanc purs.

**Son :**
- Voix off griot générée par Yannick dans ElevenLabs, à partir d'un texte que Jarvis fournit réplique par réplique (environ 50 à 60 mots pour 30 s).
- Musique choisie dans `BG Music`.
- Bruitages calés sur l'image (tambour, page ou ouverture d'app, etc.) : liste fournie à l'étape 6.

**À faire / à éviter :**
- Ouvrir sur l'émotion (le griot, la transmission), pas sur le logo. La marque arrive au moment fort.
- Fin obligatoire : logo + badges officiels « Télécharger dans l'App Store » et « Disponible sur Google Play », jamais redessinés.
- **Ne diffuser qu'après la publication réelle sur les stores.**
- Aucun chiffre inventé (utilisateurs, nombre de récits), aucun faux témoignage.
- Une légende est présentée comme une légende.
- Ne pas mettre en avant l'abonnement ni les prix : la version Play Store est sans achat.
- Langue : français uniquement.

**Livrable :** `marketing/2026-10-XX_AFROBACK-lancement-griot-poche-30s_v1.mp4`, 1080 × 1920, 30 s, H.264 + AAC. Pas de date limite fixée.
