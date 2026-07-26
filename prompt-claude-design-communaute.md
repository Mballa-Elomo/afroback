# Prompt pour Claude Design — Module Communauté AFROBACK (web + mobile)

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.
>
> Ce script détaille **la partie communautaire** du module 6 (« Communauté & Abonnement ») du script produit complet (`prompt-claude-design-produit.md`), qui ne la décrivait jusqu'ici qu'en 2 lignes. **La partie Abonnement/tarification n'est pas reprise ici** : elle est déjà entièrement détaillée dans `prompt-claude-design-onboarding.md` (3 paliers, bascule mensuel/annuel, prix selon nombre d'enfants) — ne pas la redéfinir différemment. Garde la même identité visuelle que les autres prompts AFROBACK (noir profond `#0F0B08`, dégradé or/bronze `#F0C36B` → `#8B5A2B`, terracotta `#A0522D`/`#8B3A2F`, motifs bogolan/kente/wax en filigrane, typographie display + sans-serif).

---

Conçois le module complet **Communauté** d'AFROBACK, en version web responsive ET app mobile. C'est l'espace où les membres partagent, réagissent et échangent autour des contenus des autres piliers (une histoire découverte, une tradition, un objet trouvé sur la Marketplace, une progression en langue), pas un réseau social générique déconnecté du reste de l'app.

## Rappel du contexte produit

- Le fil communautaire doit pouvoir être alimenté par du contenu lié aux autres piliers : une publication peut référencer une histoire (Histoires & Héros), un contenu de Découverte, ou un produit de la Marketplace
- **Le profil enfant n'a jamais accès à ce module** (rappel du script produit complet, module Espace Enfant) : ce pilier est absent de la navigation enfant, pas seulement masqué derrière un mot de passe
- **L'abonnement premium (Racines/Héritage) débloque des contenus exclusifs et un badge visible dans la Communauté** — la logique de tarification elle-même reste dans `prompt-claude-design-onboarding.md`, ce script ne traite que l'affichage du statut premium côté communauté
- Un compte peut cumuler plusieurs badges (membre premium ET vendeur actif) : les composants de badge doivent pouvoir se combiner sans surcharger l'interface

## Contenu d'exemple à utiliser

Publications crédibles et incarnées, pas de lorem ipsum : un membre qui partage une photo de son plat de ndolé préparé avec la recette du module Découverte, un autre qui commente une histoire sur la Reine Nzinga, un partage de produit Marketplace reçu (masque, tissu wax) avec une photo réelle, une question sur une tradition à un autre membre originaire de la même région.

---

## Écrans à concevoir

### 1. Fil communautaire (hub)

- Fil principal : publications des membres (texte, photo, éventuel lien vers un contenu d'un autre pilier), réactions, nombre de commentaires
- Filtres/onglets : Tout, Histoires & Héros, Découverte, Marketplace, Langues (pour retrouver les publications liées à un pilier précis)
- Tri : récent / populaire
- Action flottante ou bouton visible « Créer une publication »

### 2. Créer une publication

- Champ texte, ajout photo/vidéo (optionnel)
- Option « Lier un contenu » : rattacher la publication à une histoire, un contenu Découverte ou un produit Marketplace consulté récemment (affiche une mini-carte de ce contenu dans la publication)
- Aperçu avant publication
- Rappel discret des règles de la communauté (lien vers la charte, voir écran 8) lors de la toute première publication d'un membre

### 3. Détail d'une publication

- Texte complet, média, contenu lié affiché en mini-carte cliquable
- Barre de réactions
- Liste des commentaires, champ pour ajouter un commentaire
- Action « Signaler » accessible discrètement (voir écran 7)

### 4. Profil d'un membre (public)

- Avatar, bio courte, badges (membre premium, vendeur actif si applicable)
- Ses publications récentes
- Ses badges de réussite issus des autres piliers s'il choisit de les rendre visibles (ex. niveau atteint en langues, nombre d'histoires lues) — à traiter comme des éléments de fierté à afficher, pas des statistiques froides
- Action « Suivre » (pas de messagerie privée en V1, à garder simple)

### 5. Mon profil communautaire (vue personnelle)

- Mes publications, mes commentaires, gestion de la visibilité de mes badges de réussite
- Accès rapide à mes contenus sauvegardés (cohérent avec Profil & paramètres du script produit complet)

### 6. Notifications communauté

- Nouveau commentaire ou réaction sur ma publication, nouvel abonné, réponse à mon commentaire
- Regroupées avec les autres notifications de l'app (cohérent avec le module Profil & paramètres) mais identifiables comme venant de la Communauté

### 7. Signalement & modération (côté utilisateur)

- Formulaire de signalement d'une publication ou d'un commentaire (raison : contenu inapproprié, désinformation culturelle, spam, autre)
- Écran de confirmation (« Merci, notre équipe va l'examiner »)
- Statut simple visible par l'auteur si sa publication est masquée en attente de revue

### 8. Charte de la communauté

- Écran simple et lisible, accessible depuis les paramètres et présenté avant la toute première publication
- Rappel du ton attendu (respect, pas de désinformation culturelle, pas de contenu haineux)

### 9. Espace membre premium

- Mise en avant des contenus exclusifs réservés aux abonnés Racines/Héritage dans le fil (badge « Exclusif » sur ces publications/contenus)
- Section dédiée regroupant ces contenus exclusifs, accessible depuis le hub Communauté

---

## Composants transverses spécifiques à ce module

- Carte de publication (feed), avec variante « contenu lié » (mini-carte d'une histoire/produit/contenu Découverte intégrée)
- Barre de réactions, réutilisable sur publication et commentaire
- Badge « membre premium » et badge « vendeur actif », combinables sur un même profil sans surcharge visuelle
- Badge « Exclusif » pour le contenu premium
- Modale de signalement
- États vides (« Aucune publication pour l'instant, soyez le premier à partager »), de chargement, d'erreur

## Exigences transverses

- Web : feed centré avec sidebar de filtres par pilier ; mobile : feed plein écran, création de publication via bouton flottant
- Cohérence stricte des composants avec le reste du produit (boutons, badges, cartes) telle que définie dans le script produit complet
- Contenu d'exemple incarné plutôt que du texte générique

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- **Ce script détaille la partie communautaire du module 6 de `prompt-claude-design-produit.md`** (la partie Abonnement reste inchangée, déjà pointée vers `prompt-claude-design-onboarding.md`). Je peux mettre à jour le pointeur du module 6 pour qu'il renvoie aussi vers ce fichier — dis-moi si tu veux que je le fasse maintenant.
- **Point déjà signalé dans `prompt-claude-design-produit.md` et qui reste entier ici** : dès qu'une plateforme a des profils enfants ET un fil communautaire ouvert (même si l'enfant n'y a pas accès), la modération et la sécurité des données deviennent un vrai sujet (RGPD, obligations liées aux mineurs). Ce script ne fait que prévoir le bouton de signalement côté utilisateur — **qui modère réellement les signalements, avec quel outil, et sous quel délai n'est pas défini** : c'est une vraie décision produit/opérationnelle à prendre avant un lancement public, pas seulement un écran de maquette.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté des autres prompts.
