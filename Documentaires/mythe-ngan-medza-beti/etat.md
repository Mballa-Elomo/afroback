# État de la chaîne : documentaire vivant « Ngan Medza, le serpent de la traversée »

Slug : `mythe-ngan-medza-beti` · Source : `Mythologie/Cameroun/Centre/mythe-ngan-medza-beti/` (v2 du 2026-10-15, fr.md + en.md + recherche.md)
Pilote de la chaîne `/afroback_documentaire`.

| Étape | Statut |
|---|---|
| 1. Récit écrit (griot) | Terminé (v2, FR + EN) |
| 2. Récit dit (narrateur) | **Terminé le 2026-10-18, en attente de validation de Yannick** |
| 3. Storyboard (`afroback-storyboard`, mode documentaire) | À faire, après validation du texte et dépôt des voix |
| 4. Prompts images 16:9 | À faire |
| 5. Prompts vidéo Grok | À faire |
| 6. Montage (`afroback-monteur-documentaire`) | À faire |

## Étape 2 : récit dit

- `narration-fr.md` : 2 355 mots, durée visée 15 min (environ 15 min 10 s avec les silences)
- `narration-en.md` : 2 353 mots, même découpage, même durée visée
- Base de calcul : 2,6 mots/s respirations comprises, plus 2 s par `[long silence]` (3 par langue). 8 `[pause]` par langue.

| Séq. | Titre FR / EN | Mots FR / EN | Durée estimée |
|---|---|---|---|
| S01 | Le fleuve qui sépare les cousins / The river that divides cousins | 258 / 249 | 1 min 40 |
| S02 | Le peuple sans roi / The people without a king | 294 / 291 | 1 min 55 |
| S03 | Pourquoi ils partirent / Why they left | 295 / 284 | 1 min 55 |
| S04 | Le pont vivant / The living bridge | 305 / 330 | 2 min |
| S05 | La nuit où le pont se rompit / The night the bridge broke | 231 / 228 | 1 min 30 |
| S06 | Mille bouches, mille serpents / A thousand mouths, a thousand serpents | 337 / 356 | 2 min 15 |
| S07 | Ce que dit le serpent / What the serpent says | 333 / 328 | 2 min 10 |
| S08 | La Sanaga aujourd'hui / The Sanaga today | 302 / 287 | 1 min 55 |

### Ce qui a été laissé de côté (reste dans le récit écrit)
- Presque tous les noms de chercheurs et de publications : restent Laburthe-Tolra et les deux conteurs, Pierre Mebe et Elisabeth Belomo. Trop de noms savants cassent l'écoute.
- Le détail chronologique (1805, 1829, 1842, Vute, Gbaya, Seignobos, citation de Dugast), les lieux Nditam, Bokaga, Ntitan, Ngok Lituba, la liste complète des enfants de Nanga et des clans mvog : on garde l'argument (la date de dan Fodio ne colle pas) et une image par idée.
- Des variantes secondaires : le livre bulu d'Ondoua Engutu, l'objection « Il n'y avait pas de roi » d'un informateur d'Oyem, le bwiti, l'aide des Pygmées, l'hypothèse des très basses eaux (non vérifiée), le bâton ngékémbé, l'ambivalence des « serpents-totems » à Yaoundé.
- Les détails datés de la mémoire actuelle (Hatier 1984, Timma 2009, festival de juillet 2023 et édition 2026) et la graphie « Ngan Medja » du festival : on dit « un festival porte le nom du serpent », pour ne pas faire entendre deux graphies.
- Aucune information ajoutée. Les paroles entre guillemets sont des citations du récit (Pierre Mebe, Laburthe-Tolra, chant d'Odzamboga), annoncées comme telles.

## Indications ElevenLabs (pour Yannick)

1. Voix griot AFROBACK habituelle (celle de la vidéo Ngan Medza du 2026-10-01), mêmes réglages. Pour l'anglais, la même voix si elle tient l'anglais, sinon sa version anglaise habituelle.
2. Générer **séquence par séquence** (S01 à S08, 8 générations par langue), en copiant seulement le texte sous chaque titre `## Sxx`, jamais le titre ni l'en-tête.
3. Marqueurs : `[pause]` = respiration d'environ 0,8 s, `[long silence]` = 2 s. Selon le modèle : les remplacer par `<break time="0.8s" />` et `<break time="2s" />` (modèles qui acceptent les balises), ou les retirer et poser le blanc au montage audio. Ils ne doivent jamais être lus.
4. Environ 1,5 s de silence entre deux séquences à l'assemblage.
5. Assembler en **un seul fichier par langue**, traité, puis déposer :
   - `C:\Users\Yannico\Music\Afroback Stories Audio\Documentaires\mythe-ngan-medza-beti\fr.mp3`
   - `C:\Users\Yannico\Music\Afroback Stories Audio\Documentaires\mythe-ngan-medza-beti\en.mp3`
6. Si un nom est mal prononcé, utiliser un alias du dictionnaire de prononciation ElevenLabs plutôt que de modifier le texte : le monteur transcrit l'audio et le cale sur ce texte.

## Notes de prononciation (jamais dans le texte dit)

Graphie phonétique à la française, à poser en alias si la voix bute.

| Mot | Prononciation conseillée | Piège fréquent |
|---|---|---|
| Ngan Medza | « ngane mèd-za », le *ng* attaqué d'un seul souffle | « eune-gane », « mé-dza » |
| Beti | « bé-ti » | EN : dire « BAY-tee », pas « BET-ee » |
| Ewondo | « é-won-do » | |
| Bënë | « beu-neu » (ë = e muet tenu) | « bé-né » |
| Nnë Bodo | « n-neu bo-do », n prolongé | |
| Owono Kode | « o-wo-no ko-dé » | |
| mvog, mvom, Mvele | « m'vog », « m'vom », « m'vé-lé », m sans voyelle devant | « emm-vog » |
| Mbam | « m'bam » | |
| Yom | « yom », o ouvert | EN : « yum » |
| Batchenga | « ba-tchèn-ga » | |
| Ebebda | « é-bèb-da » | |
| bilabi | « bi-la-bi » | |
| Zamba | « zam-ba » | |
| Kolo Beti | « ko-lo bé-ti » | |
| Aso Abanda | « a-so a-ban-da » | |
| Manguissa | « man-gui-sa », gu dur | « man-ji-sa » |
| Odzamboga | « o-dzam-bo-ga » | |
| adzap | « a-dzap » | |
| Osellé Bevouhou | « o-sé-lé bé-vou-hou » | |
| Afiri Kara | « a-fi-ri ka-ra » | |
| Oyem, Bitam | « o-yèm », « bi-tam » | |
| Ebolowa | « é-bo-lo-wa » | |
| Nyong | « nyong » | |
| Baare-Tchamba | « ba-ré tcham-ba » | |
| Laburthe-Tolra | « la-burt to-lra » | EN : garder la prononciation française |
| Sanaga | FR « sa-na-ga » ; EN « sa-NAH-ga » | |
| Ousman / Usman dan Fodio | « ous-mane dane fo-dio » | |
| Elisabeth Belomo, Pierre Mebe | « bé-lo-mo », « mé-bé » | EN : « MEH-beh », pas « meeb » |

## Ambiance musicale et sonore par séquence (traitement audio de Yannick)

Fil rouge : l'eau du fleuve. Elle ouvre, revient à chaque bord de rive, et ferme le documentaire. Musique sobre et premium, jamais folklorique : cordes pincées type mvet, flûte, tambour à fente très lointain, nappes graves. Voix toujours devant, musique environ 18 à 22 dB sous la voix.

| Séq. | Musique | Sons |
|---|---|---|
| S01 | Ouverture presque nue, une note grave tenue ; un motif de cordes pincées entre sur « Ngan Medza », après le long silence | Grondement continu du fleuve, oiseaux du soir, feu qui crépite sur « assis près du feu » |
| S02 | Plus chaleureuse, cordes et percussions légères, rythme de village | Village lointain, battements de mains et danse discrets sur le bilabi ; vent dans les hautes herbes, souffle de forge, une flûte |
| S03 | Tension qui monte, percussions sourdes | Galop lointain sur les cavaliers, vent sec ; retour au calme sur Nnë Bodo, flûte seule |
| S04 | Mystère, nappe lente ; la musique respire sur « Un pont vivant » | Pas dans la forêt, grondement qui grandit jusqu'à « Le Yom » ; eau qui bouillonne quand le tronc surgit ; pas sur le bois, murmures de foule |
| S05 | Musique presque coupée ; un seul coup grave sur « l'interdit fut brisé » ; silence total au long silence | Torches qui crépitent, impact sourd, eau qui se soulève, cris étouffés, puis le fleuve seul |
| S06 | Plus ouverte, lumineuse sur l'arc-en-ciel ; changement de couleur au passage chez les Fang | Coup de bâton sur l'eau, scintillement doux ; forêt dense ; chant de femmes très lointain, sans paroles reconnaissables, sur « Lorsque nous revenions d'Odzamboga » |
| S07 | Méditative, la plus intime, pulsation lente | Feu de veillée, nuit de forêt, insectes ; quasi silence sur « Ne pas blesser ce qui te porte » |
| S08 | Montée lente, thème principal en entier, qui s'éteint sur le long silence | Circulation légère sur le pont d'Ebebda, fête lointaine, puis le fleuve seul au soleil du soir ; les deux dernières phrases sur le fleuve seul |
