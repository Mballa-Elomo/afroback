# Prompt pour Claude Design — Module « École des Héros » (Parent/Enfant, AFROBACK Mobile)

> À copier-coller directement dans Claude Design, dans le projet existant **« AFROBACK Mobile Prototype »** (`AFROBACK Mobile.dc.html`), pas dans un nouveau projet — ce module doit rester dans le même fichier de maquette que le reste de l'app. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) si le projet ne l'a pas déjà en référence.
>
> Garde strictement l'identité visuelle enfant déjà établie dans `AFROBACK Mobile.dc.html` et dans `prompt-claude-design-parent-enfant.md` : fond noir profond `#0F0B08` (dégradé radial vers `#1c130b`), accent or `#E9BE77`/`#F0C36B`, dégradé CTA `#F0C36B` → `#8B5A2B`, terracotta `#A0522D`/`#8B3A2F`, typographie Cinzel (titres) + Manrope (corps) + Space Mono (labels/dates), palette enfant plus chaude/vive (dégradés terracotta/bleu/violet/or des avatars existants). App mobile uniquement, cadre « phone frame ».

---

Conçois le module complet **École des Héros**, à l'intérieur du mode enfant d'AFROBACK Mobile. C'est un parcours d'apprentissage gamifié construit sur le vrai catalogue de héros africains d'AFROBACK, organisé par niveau scolaire, avec quatre formats de contenu par leçon (texte, audio, vidéo, bande dessinée) et un système de quiz qui conditionne le passage au niveau suivant. L'objectif explicite de Yannick : aider les enfants à mieux assimiler leurs cours d'histoire/éducation civique en retrouvant, sous une forme vivante et multi-format, les figures qu'ils croisent à l'école.

## Rappel du contexte produit

- AFROBACK est une plateforme de promotion de la culture africaine. Le module Parent/Enfant repose sur un principe à la Netflix (un seul compte, plusieurs profils enfants, pas de mot de passe séparé) — voir `prompt-claude-design-parent-enfant.md` pour tout ce qui concerne les profils, le code PIN parent et les trois tranches d'âge déjà actées (3-5, 6-8, 9-11 ans).
- **École des Héros s'ajoute à l'accueil enfant existant**, il ne le remplace pas. Sur l'accueil enfant actuel (déjà conçu), la carte « Jeu du jour » est aujourd'hui un état « bientôt disponible » sans aucun contenu réel derrière : **remplace cette carte par l'entrée vers École des Héros**, qui devient le premier vrai mécanisme gamifié de l'app. La carte « Apprendre une langue » reste séparée et continue d'afficher « bientôt disponible » (pilier langues camerounaises non prêt) — ne pas confondre les deux.
- **Deux axes de personnalisation coexistent, pas un seul** : la tranche d'âge (3-5/6-8/9-11 ans) gouverne déjà la densité visuelle générale du mode enfant. Le **niveau scolaire** est un nouvel axe, orienté contenu et progression, propre à ce module. Les deux se recoupent largement (voir proposition de mapping ci-dessous) mais ne sont pas identiques : l'âge dit « comment afficher », le niveau scolaire dit « quoi débloquer et dans quel ordre ».
- **Contrainte de contenu critique, déjà actée ailleurs dans le projet** : les récits héros complets destinés aux adultes contiennent des passages historiquement intenses (exécutions, empoisonnement, traite négrière) jugés non adaptés à un jeune public. École des Héros ne doit **jamais** afficher le récit adulte tel quel : chaque leçon s'appuie sur une réécriture dédiée, dont le degré de nuance augmente avec le niveau (voir plus bas).

## Niveaux scolaires (proposition à valider, voir notes pour Yannick)

Plutôt qu'un niveau par classe (trop de contenu à produire, douze paliers serait ingérable), quatre paliers regroupés, calés sur le système scolaire camerounais et alignés avec les tranches d'âge déjà actées :

| Niveau | Classes correspondantes | Tranche d'âge | Ton du contenu |
|---|---|---|---|
| **Niveau 1 — Les Premiers Récits** | Maternelle / SIL-CP | 3-5 ans | Quasi aucun texte, portrait + un fait marquant, tout en audio/image, ton conte |
| **Niveau 2 — Petits Explorateurs** | CE1-CE2 | 6-8 ans | Phrases courtes et illustrées, un fait historique + un trait de caractère |
| **Niveau 3 — Grands Explorateurs** | CM1-CM2 (prépare le CEP) | 9-11 ans | Texte complet mais simplifié, plusieurs faits, premières nuances (« ce n'était pas facile, il a dû se battre ») |
| **Niveau 4 — Héritiers de l'Histoire** | Collège 6e-3e | au-delà de 11 ans, profil « grand enfant » | Contenu le plus proche du récit adulte, nuances assumées mais sans détail graphique (« il a été exécuté » plutôt qu'une description) |

## Contenu d'exemple à utiliser (mapping héros → niveau, à illustrer dans la maquette)

Ne pas traiter les 9 héros comme interchangeables : leur intensité réelle varie beaucoup. Utilise cette répartition indicative pour peupler les exemples de la maquette (portraits et noms réels du catalogue AFROBACK, jamais de héros inventé comme « Mansa Moussa », qui ne fait pas partie du catalogue) :

- **Niveau 1** : Sultan Njoya (le roi qui a rêvé une écriture pour son peuple — ton conte, magique), Manu Dibango (le petit garçon devenu la voix la plus célèbre d'Afrique — joyeux, musical)
- **Niveau 2** : + Reine Nzinga (la reine qui n'a jamais plié devant l'envahisseur — cadrage aventure), Sultan Njoya approfondi
- **Niveau 3** : + Martin Paul Samba, Rudolf Douala Manga Bell, Charles Atangana (les figures littéralement enseignées à l'école camerounaise autour de la colonisation et de la résistance — premières nuances possibles)
- **Niveau 4** : + Ruben Um Nyobè, Ernest Ouandié, Félix Moumié (les récits les plus intenses du catalogue — leur combat et leur mort peuvent être évoqués avec gravité, sans détail graphique)

## Écrans à concevoir

### 1. Point d'entrée depuis l'accueil enfant

Remplace la carte « Jeu du jour » actuelle par une carte « École des Héros », déclinée selon les trois variantes d'âge déjà existantes de l'accueil enfant (très visuelle/audio pour 3-5 ans, illustrée pour 6-8, plus dense pour 9-11). Affiche le niveau actuel de l'enfant et un indicateur de progression simple (ex. « 3 héros sur 4 débloqués »).

### 2. Écran d'explication (première visite uniquement)

Deux à trois cartes façon « comment ça marche » : apprends l'histoire d'un héros dans le format de ton choix, réponds au quiz, débloque le héros suivant, termine le niveau pour passer au suivant. Ton ludique, pictogrammes, pas de texte dense même pour les grands enfants.

### 3. Carte du niveau (hub principal du module)

Vue « chemin »/« carte au trésor » façon parcours de jeu : une suite de médaillons-portraits de héros reliés par un sentier illustré (motifs bogolan/kente en filigrane du sentier), dans l'ordre de progression du niveau. États visuels distincts par médaillon : verrouillé (grisé, cadenas), disponible (doré, pulsation douce), en cours, terminé (étoile/couronne). En tête d'écran : nom du niveau, progression globale, portrait de l'enfant.

### 4. Fiche leçon héros — sélecteur de format

Écran d'un héros donné, dans le niveau en cours. En tête : portrait, nom, une ligne de contexte (époque/région) adaptée au niveau. **Quatre onglets de format, toujours visibles ensemble, pas un choix exclusif** : Lire / Écouter / Regarder / BD. L'enfant peut consulter plusieurs formats avant de tenter le quiz (encourager plutôt que forcer un seul format). Indicateur discret sur chaque onglet si le format n'est pas encore disponible pour ce héros (voir écran 8).

- **Lire** : texte réécrit et adapté au niveau, illustré, mise en page aérée, jamais le récit adulte intégral
- **Écouter** : lecteur audio simple (grosse icône lecture/pause, visualisation ludique plutôt que barre de progression technique), narration dédiée enfant (pas la narration adulte réutilisée telle quelle)
- **Regarder** : lecteur vidéo plein écran, cohérent avec le lecteur vidéo héros déjà existant côté adulte mais avec un habillage plus enfantin (bouton retour rond, pas de détail technique visible)
- **BD** : lecteur de bande dessinée, planche par planche, défilement tactile (tap ou swipe), bulles de dialogue, réutilise la structure narrative des storyboards déjà écrits par l'agent griot (cadrage, action, texte à l'écran) mais avec de vraies illustrations

CTA en bas d'écran : « Je suis prêt pour le quiz ! »

### 5. Quiz de leçon

3 à 5 questions à choix multiples sur le héros qui vient d'être étudié (un fait, un lieu, une qualité), une question à la fois, gros boutons de réponse illustrés. Feedback immédiat après chaque réponse (couleur + petite animation, pas d'attente jusqu'à la fin). Ton toujours bienveillant, jamais culpabilisant sur une mauvaise réponse (« Presque ! La bonne réponse était... »).

### 6. Résultat du quiz de leçon

Score (ex. « 4 sur 5 ! »), médaille ou étoiles selon le score, déblocage du héros suivant sur la carte du niveau si le seuil est atteint. Si le seuil n'est pas atteint : encouragement à revoir un format (« Regarde encore la vidéo et réessaie »), jamais un mur bloquant définitif — un enfant peut toujours retenter.

### 7. Quiz de fin de niveau

Une fois tous les héros du niveau débloqués et réussis, un quiz récapitulatif plus long (mix de questions sur tous les héros du niveau) apparaît sur la carte du niveau comme étape finale du sentier, visuellement distincte (portail doré, coffre, porte à médailles — à toi de choisir un motif cohérent avec l'identité AFROBACK). C'est ce quiz, et lui seul, qui déverrouille le niveau suivant.

### 8. Écran de passage de niveau

Célébration plein écran quand le quiz de fin de niveau est réussi : nom du nouveau niveau débloqué, aperçu des prochains héros (silhouettes dorées, pas encore révélés en détail), animation de type confettis/particules dorées cohérente avec le halo doré de l'identité AFROBACK. Notification discrète prévue côté parent (voir écran 11).

### 9. Ma collection de héros / mes médailles

Écran récapitulatif façon album (cohérent avec le pattern déjà établi du « carnet d'explorateur ») : tous les héros débloqués à ce jour, avec leur médaille de niveau, accessible depuis l'accueil enfant. Permet de revoir une leçon déjà terminée sans avoir à repasser par la carte du niveau en cours.

### 10. État « contenu pas encore disponible »

Pour un format non encore produit pour un héros donné (situation qui sera fréquente au lancement, voir notes) : l'onglet de format concerné reste visible mais affiche un état honnête façon « bientôt disponible » déjà utilisé ailleurs dans le produit, jamais un lecteur vide qui a l'air cassé. Le quiz reste accessible dès qu'au moins un format (texte a minima) est disponible — ne jamais bloquer un enfant qui a lu la leçon juste parce que la vidéo n'existe pas encore.

### 11. Espace Parent — ajouts pour ce module

Dans l'Espace Parent déjà existant, ajoute :
- Réglage du niveau scolaire de l'enfant (le parent peut l'ajuster manuellement, pas seulement une déduction automatique depuis l'âge)
- Vue de progression : niveau actuel, héros débloqués, scores des derniers quiz, dernière activité
- Action « Réinitialiser un quiz » si un enfant veut retenter à zéro

## Composants transverses spécifiques à ce module

- Médaillon-portrait de héros avec ses 4 états (verrouillé/disponible/en cours/terminé)
- Sentier de progression illustré (motif bogolan/kente en filigrane)
- Sélecteur de format à 4 onglets (Lire/Écouter/Regarder/BD), avec état « pas encore disponible » par onglet
- Lecteur BD (planches + bulles), à construire comme nouveau composant — n'existe nulle part ailleurs dans le produit
- Carte de question de quiz (choix multiple, feedback immédiat)
- Badge de médaille/niveau, cohérent avec les badges déjà existants du carnet d'explorateur
- Écran de célébration plein écran (confettis/particules dorées)

## Exigences transverses

- Toujours dans le cadre « phone frame », cohérence stricte avec les composants déjà établis du mode enfant
- Trois déclinaisons de densité par tranche d'âge sur les écrans 1, 3 et 4 (les plus consultés), en reprenant la logique déjà actée dans `prompt-claude-design-parent-enfant.md` — pas la peine de redécliner les écrans de quiz et de célébration, qui peuvent rester à densité unique
- Aucun contenu inventé présenté comme réel : héros réels du catalogue uniquement, jamais de héros fictif, jamais un score ou une progression fictive dans les exemples
- Ton toujours bienveillant et non punitif sur les mauvaises réponses, cohérent avec la philosophie déjà actée du module Parent/Enfant (limite d'écran informative, pas de blocage automatique)

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- **C'est le chantier le plus lourd en production de contenu du projet à ce jour, plus lourd que le design lui-même.** Avant même de coder les écrans, il faut produire, pour chaque héros et chaque niveau : un texte réécrit et adapté, une narration audio dédiée enfant, une vidéo adaptée (ou un format alternatif léger), et des planches de BD réellement dessinées. Sur les 9 héros, seuls 3 ont une narration audio adulte et 2 une vidéo adulte à ce jour — la version enfant, c'est un contenu entièrement séparé à produire, pas une réutilisation.
- **La BD n'existe nulle part dans le projet.** Les storyboards déjà écrits par l'agent griot (`livrables/sites-web/afroback/Récits africains storyboards/`) sont des plans de tournage textuels très détaillés (cadrage, décor, action, voix off) — une excellente base de scénario pour la BD, mais aucune image n'a jamais été dessinée. Il faudra soit un illustrateur (interne/prestataire), soit un outil de génération d'images IA à choisir, pour produire les vraies planches.
- **Recommandation avant tout développement réel : lancer un pilote sur 1 à 2 héros avec les 4 formats vraiment produits** (ex. Sultan Njoya, déjà riche en storytelling et déjà pourvu d'une image catalogue), plutôt que de vouloir couvrir les 9 héros × 4 niveaux d'un coup. Les écrans sont conçus pour supporter une disponibilité partielle (écran 10) précisément pour permettre ce lancement progressif.
- **Le mapping héros → niveau proposé ci-dessus est une hypothèse de travail**, construite sur l'intensité réelle de chaque récit tel qu'il existe aujourd'hui, pas une décision arbitrée. À valider ou ajuster.
- **Aucun backend n'existe encore pour ce module** : il faudra, le moment venu, un schéma dédié (leçons par héros/niveau, questions de quiz, progression par enfant) sur le modèle de `schema-parent-enfant.sql` — hors périmètre de ce prompt de design, à cadrer séparément quand le développement démarrera.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté des autres prompts.
