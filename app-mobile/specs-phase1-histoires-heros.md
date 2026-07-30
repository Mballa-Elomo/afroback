# Specs fonctionnelles — Phase 1 "Histoires & Héros enrichi" (app mobile AFROBACK)

> Document Phase 0, rédigé par le chef de projet AFROBACK le 2026-07-29, destiné au pôle dev de Madou Consulting. Couvre les 4 écrans priorisés pour le premier pilier de l'app native React Native : catalogue héros, fiche héros, lecteur de récit, lecteur audio/vidéo. S'appuie sur `data-model-heros.md` (modèle de données) et `design-system-mobile.md` (charte) du même dossier.
>
> Périmètre : specs fonctionnelles et UX, pas d'implémentation. Aucun code natif n'a été écrit dans ce workspace (hors périmètre d'outillage, cf. `context/AFROBACK.md`).

---

## 0. Contexte produit

Le pilier "Histoires & Héros" est déjà actif en contenu grâce aux agents `afroback-griot` (récits) et `afroback-storyboard` (storyboards vidéo). **9 héros sont couverts aujourd'hui**, tous avec récit FR+EN complet et storyboard 4 chapitres / 96 planches. **Aucun audio ni vidéo n'est encore produit** : le texte est prêt, l'audio et la vidéo sont à produire à partir des storyboards. Les specs ci-dessous doivent donc gérer proprement l'état "contenu texte disponible, média à venir" dès le lancement, pas seulement en cas d'erreur exceptionnelle.

---

## 1. Écran "Catalogue héros"

**Objectif** : donner envie d'explorer, permettre de trouver un héros par affinité (époque, région, thème) plutôt que par recherche exacte uniquement.

**Contenu et layout**
- Liste/grille de `HeroCard` (cf. design system), scroll vertical.
- Chaque carte : visuel (placeholder éditorial tant que `image_carte_catalogue` est vide, cf. section 5), nom affiché, sous-titre court, badge thème, indicateur "récit disponible" + icône discrète pour audio/vidéo si disponibles (grisée/masquée pour les 9 héros actuels tant que non produits).
- Filtres : par thème (résistance, politique, art, science...) et par région, sur la base des champs `theme` / `region` du modèle de données. Pas de filtre par époque en V1 (complexité de tri sur champ texte libre `epoque`, à revoir si le champ est structuré plus tard).
- Recherche texte simple sur `nom_affiche` / `nom_complet`.
- Tri par défaut : `ordre_affichage` (curation éditoriale manuelle) plutôt qu'alphabétique, pour permettre de mettre en avant un héros (ex. actualité, nouveauté).

**États**
- Vide (aucun résultat de filtre) : message éditorial, pas un écran blanc.
- Chargement initial : skeleton cards dans le style de la charte (pas de spinner générique).
- Hors-ligne : cache des héros déjà consultés au minimum (texte), à discuter avec le pôle dev selon la stratégie offline retenue.

**Interaction** : tap sur une carte → écran "Fiche héros".

---

## 2. Écran "Fiche héros"

**Objectif** : présenter le héros, donner accès au récit, à l'audio/vidéo, et poser clairement le cadre fait/légende avant que l'utilisateur ne lise.

**Contenu et layout (ordre suggéré)**
1. `HeroHeader` : nom, sous-titre, badge(s) thème, époque, région.
2. **Bandeau `avertissement_lecture` si présent** (ex. Charles Atangana) — affiché en évidence, avant tout autre contenu, jamais en petit caractère en bas de page. C'est une exigence de fond, pas un détail cosmétique : le griot a explicitly signalé ces cas, l'app doit les respecter.
3. Résumé catalogue (`resume_catalogue`, 2-3 phrases) en intro.
4. Boutons d'accès : "Lire le récit" (→ écran 3), "Écouter" (→ lecteur audio, état "bientôt disponible" pour les 9 héros actuels), "Regarder" (→ lecteur vidéo, même état).
5. `TimelineList` : frise chronologique.
6. Section citations (si `citations` non vide) — afficher le `statut_attestation` de façon visible (ex. label "rapporté par un tiers" à côté d'une citation non authentifiée), jamais présenter une citation douteuse comme parole vérifiée.
7. Section légendes associées (`legendes_associees`) via `LegendBadge`/`FactVsLegendCallout` — toujours étiquetées comme légende, jamais mélangées au fil du récit sans distinction.
8. "Héros liés" : liste de cartes miniatures cliquables vers d'autres fiches (`heros_lies`).
9. `SourcesList` en bas de fiche.
10. Sélecteur de langue du récit (FR/EN) si les deux existent, cohérent avec le sélecteur multilingue déjà présent sur le site web (mais sans les 4 langues camerounaises tant qu'elles ne sont pas traduites, cf. tâche en cours dans `AFROBACK.md`).

**Cas particulier — figure ambivalente (Charles Atangana)** : le produit ne doit ni censurer ni sensationnaliser. Le bandeau d'avertissement + le ton du récit du griot (déjà nuancé) suffisent ; ne pas ajouter de disclaimer supplémentaire non prévu par le contenu source.

---

## 3. Écran "Lecteur de récit"

**Objectif** : lecture longue confortable du texte du griot (plusieurs milliers de mots par héros).

**Contenu et layout**
- Texte intégral (`recit_fr_texte` ou `recit_en_texte` selon la langue choisie), typographie Barlow, colonne de lecture contrainte, interligne généreux (cf. design system section 1).
- Barre de progression de lecture (simple indicateur de scroll), pas de pagination artificielle : le récit est un flux narratif continu, le découper romprait l'effet "conte du griot".
- Option taille de texte (accessibilité).
- Accès rapide, en bas ou en fin de récit, vers "Écouter" et "Regarder" (même contenu, autre format) et vers les héros liés — inciter à continuer l'exploration plutôt que refermer l'app.
- Pas de distinction visuelle fact/légende à l'intérieur du texte du récit lui-même (le récit du griot est écrit comme un tout narratif) : la séparation fait/légende vit dans la fiche structurée (écran 2), pas dans le texte narré. À confirmer avec Yannick si un marquage inline est souhaité plus tard — pas nécessaire pour la Phase 1.

---

## 4. Écran "Lecteur audio / lecteur vidéo plein écran"

**Objectif** : consommer le récit en audio (narration) ou en vidéo (adaptation du storyboard), pour les usages mobilité/passif.

**État actuel du contenu (important)** : pour les 9 héros couverts aujourd'hui, ni l'audio ni la vidéo n'existent — seul le storyboard texte (96 planches) est prêt pour la vidéo. Les specs doivent donc couvrir deux états dès la Phase 1 :

**État "média disponible"**
- Lecteur audio : mini-player persistant (barre basse, cf. `AudioPlayerBar`) + vue plein écran avec visuel du héros, contrôles standards (lecture/pause, -15s/+15s, vitesse de lecture), affichage du texte défilant en option (karaoké-style, optionnel Phase 1+).
- Lecteur vidéo plein écran : contrôles standards, orientation paysage forcée ou libre selon format de production (à trancher avec la production vidéo), chapitrage sur les 4 chapitres du storyboard (permet de reprendre un chapitre précis).

**État "média à produire" (état par défaut à date pour les 9 héros)**
- Ne pas masquer le bouton "Écouter"/"Regarder" : l'afficher avec un état visuellement distinct ("Bientôt disponible") plutôt que de le supprimer — signale au visiteur que le contenu existe et arrive, cohérent avec le traitement déjà choisi pour les piliers Marketplace/Communauté/Langues sur le site web ("bientôt disponible" plutôt que absence totale).
- Option : proposer le storyboard texte (planches + voix off écrite) comme aperçu en attendant la vraie production audio/vidéo, si le pôle dev/Yannick juge que ça a de la valeur produit. Non tranché, à discuter — ce n'est pas un pré-requis Phase 1, juste une option low-cost à évaluer puisque le contenu existe déjà en texte.

---

## 5. Dépendances de production à anticiper (hors specs, mais bloquantes pour un vrai lancement)

Ces specs supposent un contenu qui n'existe pas encore intégralement :
- **Visuels de carte catalogue** (`image_carte_catalogue`) : aucun visuel n'existe pour aucun des 9 héros. À produire (illustration ou génération d'image cohérente avec la bible visuelle de chaque storyboard) avant un lancement public du catalogue.
- **Narration audio** : à produire pour les 9 héros (voix, montage).
- **Vidéo** : à produire à partir des 96 planches de storyboard par héros (animation/génération vidéo IA ou production classique — hors périmètre de ce document).

Ce n'est pas un blocage pour développer l'écran (les états "à produire" sont spécifiés ci-dessus), mais c'est un blocage pour un vrai lancement public du pilier avec tous les héros pleinement exploitables. À faire suivre par les agents `afroback-griot`/`afroback-storyboard` existants ou une nouvelle délégation dédiée à la production média, en parallèle du développement de l'app.

---

## 6. Hors périmètre Phase 1 (volontairement)

- Filtrage par époque précise (nécessite de structurer `epoque` au-delà du texte libre).
- Marquage inline fait/légende dans le texte du récit.
- Mode enfant / leçon enfant sur ce pilier (prévu dans le prototype "AFROBACK Mobile" mais hors Phase 1, cf. `context/AFROBACK.md`).
- Commentaires/réactions communautaires sur une fiche héros (relève du pilier Communauté, phase ultérieure).
