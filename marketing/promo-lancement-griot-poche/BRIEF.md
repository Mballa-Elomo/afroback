---
workflow: general-video   # pièce sur mesure (théâtre d'ombres), storyboard déjà validé, pas de capture d'URL
format: 1080x1920
duration: 30s
audio: voice          # voix griot ElevenLabs + musique + bruitages
loop: false
theme: "079 Shadow Puppet Theatre"   # + moment de silence emprunté à 101 (validé 2026-10-10)
---

# AFROBACK · Promo de lancement « Le griot dans ta poche »

> Rédigé le 2026-10-10 avec `/saas-motion-video` (étape 1). **Statut : à valider par Yannick.**

**Message unique :** Le griot qui racontait l'histoire au village tient maintenant dans ta poche.

**Public et diffusion :** jeunes adultes et parents camerounais et de la diaspora, sur TikTok, Reels, Facebook et statut WhatsApp. Vertical 9:16, 30 s. Son activé en priorité (voix griot), mais un texte minimal à l'écran pour que le message passe aussi sans le son.

**Source de vérité :** `marketing/play-store/fiche-play-store.md` et l'app elle-même (version web `https://afroback-test.vercel.app`, captures existantes). Aucune affirmation, aucun chiffre ni nom de contenu en dehors de ces sources.

**Moment de preuve :** un récit qui se lance dans l'app et la narration façon griot qui démarre. C'est la fonctionnalité qui porte le message : on n'écoute plus le griot au village, on l'écoute dans l'app.

**Ce que la vidéo n'est pas :** pas un tour des fonctionnalités (les présentations 30 s et 60 s existent déjà). On ne montre que ce qui prouve le message : écouter un récit. Les autres piliers (Mythes, Découverte, École des Héros) apparaissent au plus en un clin d'œil.

**Récit choisi :** Reine Nzinga (validé par Yannick le 2026-10-10). Narration audio présente dans l'app (bouton « Écouter · Narration audio » de sa fiche).

**Composants** (étape 2, notes /8 : à jour · calme · dans la charte · montre la preuve)
| Composant | Rôle | Note | Réel ou imaginaire | Traitement |
|---|---|---|---|---|
| Lecteur de narration de Nzinga (`app/(tabs)/accueil/heros/[slug]/audio.tsx`) | **Preuve** | 8 | Réel | Reconstruit en HTML avec les vraies couleurs : dégradé brun, portrait avec halo et pastille ♪, « Reine Nzinga », « Narration audio · Afrique centrale », bouton lecture, chapitres. La barre de progression est remplacée par l'onde sonore de l'app (`Waveform`), qui existe déjà dans ce même écran. |
| Fiche de Nzinga (`capture-app-reine-nzinga.jpg`) | Appui | 6 | Réel, simplifié | Portrait, étiquettes « Précolonial · Résistance », titre, bouton **Écouter**. On retire les compteurs (lectures, écoutes, likes) : chiffres faibles et changeants. |
| Lecture du récit, chapitre 1 (`capture-app-p60-recit-1.png`) | Appui | 7 | Réel | La lettrine **« Écoute. »**, premier mot du récit, sert de pont entre le griot et l'app. |
| Griot au coin du feu (`img/histoires.jpg`) | Ouverture | – | Réel (illustration AFROBACK) | Plan d'ouverture, le « village ». |
| Logo AFROBACK | Marque | – | Réel, fichier officiel | `video-presentation-30s/public/img/afroback-logo.png` |
| Badges App Store + Google Play | Marque | – | Réels, fichiers officiels | `video-presentation-30s/public/badges/app-store-fr.svg`, `google-play-fr.png` |

Aucun composant imaginaire : l'interface réelle est propre et montre directement la preuve.

**Fin de vidéo :** logo + badges officiels. **Aucune adresse web** : le domaine `afroback.app` n'est pas encore acheté et Yannick ne veut pas d'adresse Vercel.

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
