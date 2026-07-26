# Prompt pour Claude Design — Module Découverte du patrimoine AFROBACK (web + mobile)

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.
>
> Ce script détaille **uniquement le pilier « Découverte »** (module 4) du script produit complet (`prompt-claude-design-produit.md`), qui ne le décrivait jusqu'ici qu'en 4 lignes (carte interactive, catalogue par catégorie, fiche détail, teaser visite virtuelle). Garde la même identité visuelle que les autres prompts AFROBACK (noir profond `#0F0B08`, dégradé or/bronze `#F0C36B` → `#8B5A2B`, terracotta `#A0522D`/`#8B3A2F`, motifs bogolan/kente/wax en filigrane, typographie display + sans-serif).

---

Conçois le module complet **Découverte du patrimoine** d'AFROBACK, en version web responsive ET app mobile. Ce module est le cœur culturel et pédagogique de la plateforme : il ne se limite pas à une carte et une visite virtuelle, il doit permettre à un utilisateur de vraiment **découvrir et comprendre** les peuples, les traditions, les mythes, la gastronomie et les objets sacrés du continent, avec la même profondeur narrative que le pilier Histoires & Héros.

## Rappel du contexte produit

AFROBACK a 5 piliers (voir script produit complet), dont Découverte. Ce module cohabite avec Histoires & Héros (récits de figures historiques) sans le dupliquer : Découverte parle des **peuples, cultures et pratiques**, Histoires & Héros parle des **individus**. Les deux se renvoient l'un à l'autre via des liens croisés (une fiche peuple peut pointer vers les héros qui en sont issus, et inversement).

## Les 7 catégories du module

Le module s'organise en 7 catégories, chacune avec son propre type de fiche détail (voir plus bas), mais partageant les mêmes composants de navigation et de filtre :

1. **Peuples & cultures** — présentation des groupes ethniques et culturels : organisation sociale, langues, valeurs, symboles identitaires
2. **Traditions & rites** — cérémonies, rites de passage, fêtes traditionnelles, et leur rôle social
3. **Mythes & légendes** — récits fondateurs, contes, figures mythologiques, épopées
4. **Gastronomie** — plats emblématiques par région/peuple, avec recette pas-à-pas
5. **Objets sacrés** — masques, statuettes, instruments rituels, regalia royaux
6. **Artisanat & savoir-faire** — techniques et matériaux (déjà présent dans le script produit complet, repris et détaillé ici)
7. **Villages & lieux** — patrimoine architectural et géographique (déjà présent, repris ici)

*(Exemples de contenu à utiliser dans la maquette, incarnés et crédibles, pas du lorem ipsum — à considérer comme des suggestions de travail à valider, pas des contenus validés pour publication : peuples Wolof, Ashanti, Zoulou, Peul, Bamoun, Baka ; traditions comme les rites de passage Poro/Sande en Afrique de l'Ouest, la cérémonie du Ngondo au Cameroun ; mythes comme l'épopée de Sundiata Keita, les contes d'Anansi l'araignée, les mythes de création dogons ; plats comme le ndolé, le jollof rice, l'injera, le thieboudienne, l'eru ; objets sacrés comme les masques dogons, les statuettes fétiches, les trônes royaux bamoun.)*

## Écrans à concevoir

### 1. Écran d'entrée du module (hub Découverte)

- **Carte interactive du continent** : navigation par pays/région, points cliquables qui ouvrent un aperçu du contenu disponible pour cette zone (toutes catégories confondues)
- **Bandeau des 7 catégories** : une carte/icône par catégorie (icône distincte mais dans la palette AFROBACK), donnant accès au catalogue filtré de cette catégorie
- **Fil « à la une »** : mélange de contenus des différentes catégories (une tradition, une recette, un objet sacré, un mythe), pour donner envie d'explorer sans se limiter à une seule catégorie
- **Barre de recherche/filtre globale** : par pays, peuple, catégorie, thème

### 2. Catalogue par catégorie

Un même gabarit de catalogue, réutilisé pour les 7 catégories avec un jeu de filtres adapté :

- Grille (web) / liste ou carrousel (mobile) de vignettes : image, titre, peuple/région d'origine, badge catégorie
- Filtres : région, peuple, thème (et pour Gastronomie spécifiquement : type de plat, occasion — quotidien/fête/cérémoniel)

### 3. Fiches détail (une variante par catégorie)

**3.1 Fiche Peuple / culture**
- Portrait du peuple (photo ou illustration), carte de localisation
- Langue(s) parlée(s), organisation sociale, valeurs et symboles identitaires
- Traditions associées (cartes-liens vers les fiches Traditions & rites de ce peuple)
- Figures notables issues de ce peuple (lien croisé vers le pilier Histoires & Héros)

**3.2 Fiche Tradition / rite**
- Récit contextuel : origine et sens de la tradition
- Déroulement de la cérémonie/du rite, étape par étape
- Galerie photo/vidéo
- Période ou occasion (fête annuelle, rite de passage, événement de vie)
- Peuple(s) concerné(s) (lien-croisé vers la fiche Peuple)

**3.3 Fiche Mythe / légende**
- Traitée en **mode lecture immersive**, comme les fiches du pilier Histoires & Héros : plein écran, typographie soignée, mode sombre par défaut, option d'écoute audio (narration)
- Récit long, personnages du mythe, morale/enseignement transmis
- Origine géographique et peuple associé

**3.4 Fiche Recette / gastronomie**
- Photo du plat en haute qualité, nom local + traduction française
- Région/peuple d'origine, histoire ou occasion du plat (repas quotidien, plat de fête, plat cérémoniel)
- Liste d'ingrédients
- Étapes de préparation numérotées, avec un visuel par étape
- Temps de préparation et de cuisson, niveau de difficulté
- Variante vidéo pas-à-pas en option (lecteur intégré)
- Plats similaires en suggestion

**3.5 Fiche Objet sacré**
- Photo/illustration en haute qualité (prévoir une variante rotation à 360° pour les objets exposés en Visite virtuelle)
- Nom local, matériaux, peuple/région d'origine
- Signification et usage rituel, contexte historique
- Si l'objet est exposé dans un musée du module Visite virtuelle : lien direct vers cette expérience

**3.6 Fiche Artisanat & savoir-faire**
- Technique et matériaux utilisés, étapes de fabrication
- Artisan associé : lien vers sa fiche et, si applicable, ses produits en vente sur la Marketplace

**3.7 Fiche Village / lieu**
- Galerie photo/vidéo, récit contextuel, localisation sur la carte, patrimoine architectural, contenus liés

### 4. Visite virtuelle des musées

- **Écran d'accueil du module** : liste des musées/expositions disponibles, avec carte de localisation
- **Écran de visite immersive** : aperçu panoramique/360° de la salle, avec points d'intérêt cliquables qui ouvrent la fiche Objet sacré correspondante
- Ce module reste marqué avec le badge « Bientôt disponible » cohérent avec le site vitrine tant que la vraie techno 360° n'est pas développée, mais l'écran doit être conçu comme s'il était pleinement fonctionnel (même logique que le reste du script produit complet)

### 5. Version enfant du module (« carnet d'explorateur »)

Cohérent avec le module Espace Enfant du script produit complet — reformulation ludique, pas juste un allègement :

- Mêmes 7 catégories mais renommées simplement (ex. « Les objets magiques » pour Objets sacrés, « Les histoires extraordinaires » pour Mythes & légendes, « Je cuisine avec mes parents » pour Gastronomie)
- Recettes en version enfant : étapes ultra simplifiées et illustrées, sans niveau de difficulté ni mesures précises, pensées pour être suivies avec un parent
- Carte simplifiée et illustrée avec pastilles à explorer, plutôt que la carte interactive complète de la version adulte

## Composants transverses spécifiques à ce module

- Badge de catégorie (7 déclinaisons visuelles distinctes, dans la palette AFROBACK)
- Carte « recette » avec repère visuel du temps de préparation
- Widget « peuple associé », réutilisable sur les fiches Traditions, Mythes et Objets sacrés pour naviguer vers la fiche Peuple correspondante
- Badge « Bientôt disponible », identique à celui utilisé ailleurs sur le produit, pour le module Visite virtuelle

## Exigences transverses

- Chaque écran doit avoir une variante web (grille large, panneau de filtres latéral) et une variante mobile (liste/carrousel, filtres en modale ou en feuille remontante)
- Cohérence stricte des composants avec le reste du produit (cartes de contenu, boutons, badges) telle que définie dans le script produit complet
- Contenu d'exemple incarné et crédible sur chaque écran, pas de texte générique

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- **Ce script remplace la section « 4. Découverte » de `prompt-claude-design-produit.md`**, qui ne faisait que 4 lignes. Je peux mettre à jour ce fichier pour qu'il pointe vers celui-ci (même logique que ce qui a été fait pour la tarification dans `prompt-claude-design-onboarding.md`) — dis-moi si tu veux que je le fasse maintenant.
- **Sensibilité culturelle à garder en tête, plus que sur les autres modules** : ce module touche à des rites, objets sacrés et mythes de peuples réels. Les exemples de contenu ci-dessus sont des suggestions de travail pour rendre la maquette crédible, **pas des contenus validés pour publication**. Avant tout contenu réel et public (texte, description de rite, recette présentée comme authentique), il faudra une vraie source ou relecture (ethnographe, membre de la communauté concernée, source académique), exactement comme pour les traductions ewondo/douala/bassa/bamiléké déjà identifiées comme un chantier à part (`context/AFROBACK.md`) : le risque ici n'est pas seulement linguistique mais aussi de mal représenter ou caricaturer une pratique sacrée.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté des autres prompts.
