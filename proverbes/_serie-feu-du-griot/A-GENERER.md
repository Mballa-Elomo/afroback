# « Le Feu du Griot » · images et voix à générer

> 2026-10-10. Format validé par Yannick : griot récurrent en ouverture, carte d'Afrique dorée (codée par Jarvis), Reels de 30 à 35 s avec voix off.
> Les prompts sont en anglais (meilleurs résultats). Même style partout : **cinematic painterly realism, warm golden firelight, rich detail, no text, no watermark.**

## Règles pour toutes les images

- **Format vertical** (9:16 ou 2:3), la plus grande résolution possible.
- Les images marquées **PNG transparent** : demande explicitement « transparent background » (ChatGPT le fait). Si l'outil ne sait pas, un fond **vert uni** (#00FF00) fera l'affaire, je le retire.
- Aucun texte, aucun logo dans l'image.

---

## A. Une seule fois pour toute la série : le griot

Dossier : `proverbes/_serie-feu-du-griot/griot/`

| Fichier | Contenu | Prompt |
|---|---|---|
| `griot-fond.png` | Le décor, sans personne | Vertical 9:16 cinematic painting, night in a West African village, a large campfire in the lower center with sparks rising, round thatched huts and baobab trees in the background under a deep blue starry sky, warm orange firelight on the ground, no people, painterly realism, highly detailed, no text |
| `griot-personnage.png` | **PNG transparent** : le griot seul | Full-body portrait of an elderly West African griot sitting cross-legged on a woven mat, holding a kora, wearing an embroidered indigo and gold boubou and a cap, kind and wise face, mouth slightly open as if starting a story, warm firelight from the lower right, painterly realism, isolated on a transparent background, PNG |
| `griot-premier-plan.png` | **PNG transparent** : éléments devant | Silhouettes of dry savanna grass and a few large leaves at the bottom of the frame, dark against firelight, isolated on a transparent background, PNG |

---

## B. Pour le proverbe 01 (Peul : « La patience peut cuire une pierre »)

Dossier : `proverbes/01-peul-patience/images/`

| Fichier | Contenu | Prompt |
|---|---|---|
| `scene-fond.png` | Le décor du proverbe | Vertical 9:16 cinematic painting, Fouta Djalon highlands in Guinea at sunset, Fulani village with round thatched huts and clay jars, misty green hills, golden sky with a low sun, empty red-earth ground in the lower half, no people, painterly realism, no text |
| `scene-sujet.png` | **PNG transparent** : le sujet | A large dark stone cooking in a round clay pot set on three hearth stones over a wood fire, steam rising from the pot, warm sunset light, painterly realism, isolated on a transparent background, PNG |
| `scene-premier-plan.png` | **PNG transparent** | Tall dry golden grass and a few clay jars in silhouette at the bottom edge, isolated on a transparent background, PNG |
| `aujourdhui.png` | L'image du message (la vie d'aujourd'hui) | Vertical 9:16 cinematic painting, a young West African woman entrepreneur working late at night at a small wooden table in her tailoring workshop, sewing machine and notebook, warm lamp light on her determined face, city lights of Conakry through the window, painterly realism, no text |

---

## C. Les voix (ElevenLabs, voix griot habituelle)

Une réplique par fichier, en **.mp3**.

**Une seule fois pour la série** → `proverbes/_serie-feu-du-griot/voix/`

| Fichier | Texte |
|---|---|
| `fr-ecoute.mp3` | Écoute… |
| `fr-fin.mp3` | AFROBACK. Sagesse d'Afrique. |
| `en-ecoute.mp3` | Listen… |
| `en-fin.mp3` | AFROBACK. African wisdom. |

**Pour le proverbe 01** → `proverbes/01-peul-patience/voix/`

| Fichier | Texte |
|---|---|
| `fr-1.mp3` | Les Peuls disent… |
| `fr-2.mp3` | La patience peut cuire une pierre. |
| `fr-3.mp3` | Avec du temps et de la constance, même ce qui paraît impossible finit par céder. |
| `fr-4.mp3` | Ton projet avance moins vite que tu ne voudrais ? Garde le feu allumé. Un peu chaque jour. Les pierres finissent par cuire. |
| `en-1.mp3` | The Fulani say… |
| `en-2.mp3` | Patience can cook a stone. |
| `en-3.mp3` | With time and steady effort, even what seems impossible eventually gives way. |
| `en-4.mp3` | Is your project moving slower than you hoped? Keep the fire burning. A little every day. Stones do cook in the end. |

Intention : voix posée de conteur. « Écoute… » chuchoté et intime ; le proverbe dit lentement, avec poids ; le message avec chaleur et énergie montante.
