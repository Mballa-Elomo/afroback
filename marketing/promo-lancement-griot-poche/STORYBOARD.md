# Storyboard · AFROBACK « Le griot dans ta poche »

Thème : 079 Théâtre d'ombres (+ silence emprunté à 101) · Format : 1080 × 1920 · Durée : 30 s · Son : voix griot + musique + bruitages

> Rédigé le 2026-10-10 avec `/saas-motion-video` (étape 4). **Statut : v2 livrée le 2026-10-10** → `marketing/2026-10-10_AFROBACK-lancement-griot-poche-30s_v2.mp4`. Yannick a jugé la v1 (dessins, ombres) « visuellement indigeste » : la v2 garde exactement le même son (voix, musique, bruitages) et remplace tous les plans par de vraies séquences AFROBACK (dossier `Desktop/AFROBACK CONTENT` : Reine Nzinga chap. 1 et 2, Ngan Medza, Ruben Um Nyobè), une coupe par phrase, recadrées en vertical (liste et minutages : `assets/clips/sources.txt`). Ancienne composition : `archive/index-v1-dessins.html`.
> Ancien statut : v1 livrée le 2026-10-10 → `marketing/2026-10-10_AFROBACK-lancement-griot-poche-30s_v1.mp4` (1080 × 1920, 30 s, −14 LUFS). Bruitages Mixkit dans `audio/sfx/`. **À ne diffuser qu'après la publication réelle sur les stores.**
>
> **Mise à jour 2026-10-10 · fusion avec le style de la série `/afroback_video`** (choix de Yannick) : nuit `#0A0F14`/`#111A24` + or `#F0C36B`, motif losanges, grain, braises, titres Cinzel Black en lettres qui tombent, sous-titres karaoké (3 mots, mot courant en or). Plan 1 = vraie illustration AFROBACK `histoires.jpg` filmée en caméra lente (au lieu des ombres découpées). Plan 6 = les ombres grandissent puis le vrai portrait de Nzinga en surgit, avec « REINE NZINGA ». Plan 7 = fin de série (logo, mot-symbole AFROBACK, accroche, badges) au lieu de l'aube.
> **Temps réels calés sur les voix :** plan 4 = 12,1 à 14,3 s ; le lecteur (plan 5) arrive à 14,15 s sur « dans ta poche » ; le portrait s'illumine à 15,1 s sur « La Reine Nzinga ».

## Message et ton
- **Phrase :** Je veux dire « le griot qui racontait l'histoire au village tient maintenant dans ta poche » sur un ton **chaleureux, puis mystérieux, puis fier**, pour que le spectateur ressente **la nostalgie du feu, puis la joie de le retrouver**.
- **Arc de ton :** warm → mysterious → bold → warm → celebratory
- accent: gold
- **Couleur d'accent :** or `#F0C36B` (une seule). Ambre du feu au début, froid au milieu, noir au silence, or de la braise, aube à la fin.
- **Motif :** la **lumière du feu**. Elle éclaire le griot (plan 1), meurt (plan 2), renaît en braise (plan 3), devient l'écran du téléphone (plans 4-5), puis réunit à nouveau les auditeurs (plan 6). Trois apparitions, toujours la même idée : la transmission.

## Registre (ledger)

| # | start | dur | beat | tone | entrance | transition_out | ease | direction | palette | camera | components | new_component | sfx | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0:00 | 5.5 | hook | warm | stepped-pose-in | parallax-slide | sine.inOut | left | amber+ink | multiplane-drift | griot-silhouette+fire+listeners | | fire-crackle | griot en silhouette découpée, gestes en poses saccadées 12 i/s ; motif: feu (1/3) |
| 2 | 0:05.5 | 3.5 | hook | mysterious | parallax-drift-in | beat-cut-hold | power2.inOut | right | dusk+ink | slow-truck | youth-silhouette+city+dying-fire | | city-hum | les auditeurs s'éloignent chacun de son côté, le feu faiblit |
| 3 | 0:09 | 2.5 | reveal | mysterious | ember-rise | push-through | power2.in | up | ink+gold | locked | ember+youth-hand | braise-ecran | silence-then-chime | surprise: le feu s'éteint, noir et silence 0,5 s, puis une braise monte et se pose dans la main, où elle s'ouvre en écran de téléphone |
| 4 | 0:11.5 | 3.5 | proof | bold | drop-cap-ink | cursor-carry | power2.out | in | brown+gold | push-in | recit-lettrine+fiche-nzinga+ecouter-button | | page-tap | la lettrine « Écoute. » du récit, puis la fiche de Nzinga ; le doigt touche « Écouter » |
| 5 | 0:15 | 5 | proof | warm | waveform-light-sweep | dolly-out-reveal | power3.inOut | center | brown+gold | macro-then-pull | audio-player+waveform+portrait | | voice-swell | le vrai lecteur de narration ; l'onde s'allume au rythme de la voix ; motif: feu (2/3), l'écran éclaire le visage |
| 6 | 0:20 | 4 | proof | celebratory | shadow-grow | graphic-match-color | steps(12) | radial | amber+gold | rise | phone-fire+listeners-circle+nzinga-shadow | ombres-du-recit | drum-hit | surprise: les auditeurs revenus autour du téléphone ; leurs ombres projetées deviennent la Reine Nzinga couronnée ; motif: feu (3/3) |
| 7 | 0:24 | 6 | cta | warm | dawn-tint-reveal | hold | expo.out | down | dawn+ink | locked | logo+tagline+store-badges | | final-chord | aube, logo officiel, « Le griot dans ta poche. », badges App Store et Google Play, aucune adresse web |

## Les sept questions
1. **Message et ton :** la phrase ci-dessus.
2. **Répétitions :** voir l'audit. Seule répétition voulue : le motif du feu, marqué `motif:`.
3. **Sens de chaque transition :**
   - 1 → 2 **parallax-slide** : le village glisse hors du cadre, on voyage dans le temps vers aujourd'hui.
   - 2 → 3 **beat-cut-hold** : le feu s'éteint sur le temps, image figée puis noir, la perte se ressent.
   - 3 → 4 **push-through** : on entre dans l'écran né de la braise, donc dans l'app.
   - 4 → 5 **cursor-carry** : le doigt touche « Écouter », le lecteur s'ouvre, cause et effet à l'écran.
   - 5 → 6 **dolly-out-reveal** : on recule et l'on découvre que le téléphone est devenu le feu du village.
   - 6 → 7 **graphic-match-color** : l'ambre du cercle devient la lumière de l'aube, le jour se lève sur la marque.
4. **Couleurs dans le temps :** ambre chaud → bleu crépuscule désaturé (la dispersion) → noir total → or d'une braise (l'événement couleur) → brun et or de l'app → ambre retrouvé → aube pâle `#F7D98B`.
5. **Composants nouveaux :** `braise-ecran` (la braise qui devient écran) et `ombres-du-recit` (les ombres des auditeurs qui jouent l'histoire).
6. **Surprises :** à 0:09 (silence et noir) et à 0:20 (les ombres deviennent Nzinga), environ 11 s d'écart.
7. **Historique :** premier film enregistré dans le registre. Différent de toutes les vidéos AFROBACK existantes : pas de rafale de visages, pas de tour des fonctionnalités, pas d'afrobeats à 120 BPM.

## Voix off (griot, ElevenLabs) · environ 55 mots

| Plan | Temps | Réplique |
|---|---|---|
| 1 | 0:00 – 5:5 | « Autrefois, au coin du feu, le griot racontait… et tout le village écoutait. » |
| 2 | 0:05,5 – 9 | « Puis le village s'est dispersé. Et les histoires se sont tues. » |
| 3 | 0:09 – 11,5 | *(silence 0,5 s)* … « Écoute. » *(chuchoté)* |
| 4-5 | 0:11,5 – 20 | « Le griot n'est pas parti. Il est là, dans ta poche. La Reine Nzinga, nos héros, nos mythes… racontés comme au coin du feu. » |
| 6-7 | 0:20 – 30 | *(la musique monte, pas de voix sur les ombres)* … « AFROBACK. Le griot, dans ta poche. » |

Fidélité : « racontés comme par un griot » et « narration audio » viennent de la fiche Play Store et de l'app. Aucun chiffre, aucune promesse de gratuité, aucune date de sortie.

## Plans

### Plan 1 · Accroche (0:00 – 5,5 s)
- Visuel : théâtre d'ombres sur fond ambre. Un griot en silhouette découpée, assis, le bras levé ; enfants et adultes autour d'un feu ; un acacia.
- Ce qui bouge en premier : les flammes (découpe animée), puis le bras du griot en 3 poses saccadées.
- Texte à l'écran : aucun.

### Plan 2 · La dispersion (5,5 – 9 s)
- Visuel : les silhouettes partent chacune vers un bord du cadre ; à leur place, une ville en papier découpé et un jeune seul. Le feu au centre faiblit, la teinte passe au crépuscule.
- Texte à l'écran : aucun.

### Plan 3 · Le silence, puis la braise (9 – 11,5 s) · surprise
- Visuel : le feu s'éteint sur le temps fort, image figée 0,5 s, noir. Une seule braise monte, dérive, se pose dans la paume tendue du jeune et s'ouvre en écran de téléphone (composant nouveau `braise-ecran`).
- Texte à l'écran : « Écoute. » (Cinzel, or), au moment du chuchotement.

### Plan 4 · L'app (11,5 – 15 s)
- Visuel : on entre dans l'écran. La lettrine « Écoute. » du récit de Nzinga (vraie page de l'app), puis sa fiche ; le doigt touche « Écouter ».
- Texte à l'écran : uniquement celui de l'app.

### Plan 5 · Preuve : le griot parle (15 – 20 s)
- Visuel : le vrai lecteur de narration de Nzinga ; l'onde sonore s'allume en or au rythme de la voix ; la lumière de l'écran éclaire le visage en silhouette.
- Texte à l'écran : uniquement celui de l'app.

### Plan 6 · Le village revient (20 – 24 s) · surprise
- Visuel : on recule. Le téléphone posé au centre a pris la place du feu ; les silhouettes sont revenues, assises en cercle. Leurs ombres projetées sur le fond grandissent et dessinent la Reine Nzinga couronnée (composant nouveau `ombres-du-recit`).
- Texte à l'écran : aucun.

### Plan 7 · Signature (24 – 30 s)
- Visuel : l'ambre devient aube. Logo AFROBACK officiel, « Le griot dans ta poche. », badges App Store et Google Play.
- Texte à l'écran : « Le griot dans ta poche. »
