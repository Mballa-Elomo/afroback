# Prompt pour Claude Design — Produit réel AFROBACK (maquette complète, web + mobile)

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.
>
> ⚠️ Ceci n'est PAS le site vitrine one-page déjà construit (`livrables/sites-web/afroback/site/index.html`, prompt d'origine dans `prompt-claude-design.md`). Ce script décrit **le vrai produit AFROBACK** : la plateforme complète avec comptes, contenus, marketplace, communauté, abonnement et apprentissage des langues, en version web ET mobile.

---

Conçois la maquette complète et fonctionnelle du produit **AFROBACK**, une plateforme panafricaine qui rassemble histoires de héros africains, découverte du patrimoine du continent, marketplace de produits authentiques, communauté et abonnement, et apprentissage des langues camerounaises. Le slogan est **« Retour aux origines »**.

Ce n'est plus une page de lancement à faire rêver : c'est **l'application réelle que les utilisateurs vont utiliser au quotidien**, une fois connectés. Elle doit donc être pensée comme un vrai produit : navigation claire, hiérarchie de l'information, écrans d'état (vide, chargement, erreur), pas seulement une expérience narrative en scroll.

**AFROBACK n'a pas un seul type d'utilisateur.** La maquette doit refléter 4 profils différents avec des besoins et des interfaces distinctes : le grand public (adultes), les enfants (apprentissage adapté à leur âge), les parents (supervision des profils enfants) et les vendeurs/artisans (qui alimentent la Marketplace). Voir la section dédiée ci-dessous.

## Identité visuelle (à respecter, cohérente avec le site vitrine existant)

- **Logo** : silhouette d'une femme africaine de profil fusionnée avec la carte du continent, remplie de motifs tribaux (losanges, cercles concentriques, textiles), sur un halo doré façon soleil, fond noir profond
- **Couleurs** :
  - Noir profond / charbon (`#0F0B08`) comme base des fonds, pour la profondeur
  - Dégradé or / bronze (`#F0C36B` → `#8B5A2B`) pour les accents lumineux, titres, CTA, éléments actifs de navigation
  - Terracotta / rouille (`#A0522D`, `#8B3A2F`) en couleur secondaire chaude
  - Rehauts ponctuels de couleurs vives (rouge, bleu, jaune safran) inspirés des textiles africains, utilisés avec parcimonie (badges, icônes de catégories)
- **Typographie** : police display à fort caractère pour les titres (empattements marqués, style gravé/sculpté), police sans-serif très lisible pour le texte courant et les interfaces (formulaires, listes, boutons)
- **Motifs** : textures bogolan/mudcloth, kente, wax, motifs géométriques tribaux en filigrane, utilisés comme séparateurs, fonds de carte ou détails d'interface — jamais comme décor plaqué
- **Ton** : premium, chaleureux, habité, entre afrofuturisme et héritage ancestral. Contrairement au site vitrine, l'interface produit peut être visuellement plus sobre sur les écrans à forte densité d'information (listes, formulaires, paiement), tout en gardant l'identité de marque sur les écrans d'accueil, de contenu et de célébration (fiches héros, fiches produit)

## Plateformes à livrer

Deux formats, avec une cohérence visuelle totale (même palette, même typographie, mêmes composants) mais des patterns de navigation adaptés à chacun :

- **Web app responsive** : navigation principale en header (logo + liens + recherche + compte) avec une barre latérale secondaire sur les pages à filtres (Découverte, Marketplace). Pensé pour desktop et tablette, mais doit rester utilisable sur mobile en repli (menu burger, colonnes empilées)
- **App mobile (iOS/Android)** : navigation par **tab bar en bas** avec 5 onglets (Accueil, Découverte, Marketplace, Communauté, Profil), gestes tactiles natifs (swipe entre onglets de fiche produit/héros, pull-to-refresh sur les fils), écrans plein écran pour la lecture immersive des histoires

Pour chaque écran listé ci-dessous, produis la version web ET la version mobile, en gardant la même structure d'information mais en adaptant la disposition (grille large sur web, liste/carte unique sur mobile).

## Périmètre fonctionnel : les 5 piliers + compte, en vraie maquette

Contrairement au site vitrine où 3 des 5 piliers sont marqués « bientôt disponible », **ici tous les piliers doivent être maquettés comme s'ils étaient réels et fonctionnels**. L'objectif est d'avoir la vision complète du produit final à présenter à un développeur ou un investisseur, même si le développement réel se fera par étapes.

Utilise du contenu d'exemple crédible et incarné, pas du lorem ipsum : par exemple des figures comme la Reine Nzinga, Thomas Sankara, Yaa Asantewaa, Mansa Moussa, Miriam Makeba, Nelson Mandela pour les héros ; le palais royal de Bafut, le tissage du kente au Ghana, les rites dogons, l'art bamoun pour la Découverte ; masques, tissus wax, bijoux en bronze, sculptures sur bois pour la Marketplace.

### Profils utilisateurs à prévoir

Le compte AFROBACK repose sur un **compte principal (adulte)** qui peut ensuite héberger un ou plusieurs **profils enfants rattachés**, sur le même principe que les profils Netflix : un seul compte, plusieurs profils, chacun avec sa propre interface.

- **Grand public (profil adulte par défaut)** : accès complet aux 5 piliers, tel que décrit dans les modules ci-dessous
- **Enfant (profil rattaché à un compte parent)** : ne se connecte pas de façon autonome avec son propre email/mot de passe ; il est sélectionné depuis l'écran de choix de profil du compte parent, comme un profil enfant Netflix. Interface simplifiée et sécurisée, décrite dans le module dédié « Espace Enfant »
- **Parent** : c'est le titulaire du compte principal dès qu'il a créé au moins un profil enfant. Il gère les profils enfants, leur progression et leurs restrictions depuis un espace dédié, décrit dans le module « Espace Parent »
- **Vendeur / artisan** : un utilisateur du grand public peut activer un « espace vendeur » en plus de son usage normal de l'app (comme un compte Etsy/Vinted), pour proposer ses produits sur la Marketplace. Décrit dans le module « Espace Vendeur »

### 1. Onboarding & compte

- **Écran de démarrage / splash** (mobile) : logo animé, accroche de mission
- **Carrousel d'introduction** (2-3 écrans) : présente les piliers d'AFROBACK avant inscription
- **Choix de la langue d'interface** (FR/EN, avec les 4 langues camerounaises visibles mais marquées « traduction en cours »)
- **Inscription** (email, prénom, mot de passe, ou connexion via réseau social) — c'est toujours un adulte qui crée le compte principal
- **Connexion**
- **Mot de passe oublié / réinitialisation**
- **Sélection des centres d'intérêt** (post-inscription) : cocher les piliers/thèmes préférés pour personnaliser le fil d'accueil
- **Écran de sélection de profil** (après connexion, si au moins un profil enfant existe) : mosaïque d'avatars façon Netflix (profil adulte + profils enfants), avec une action « Ajouter un profil enfant »
- **Création d'un profil enfant** (depuis le compte parent) : prénom, âge, avatar, langues d'apprentissage à activer (ewondo, douala, bassa, bamiléké), rien ne demande d'email ou de mot de passe propre à l'enfant

### 2. Accueil (dashboard personnalisé)

- Fil d'accueil qui mélange : histoire du jour mise en avant, suggestions basées sur les centres d'intérêt, reprise de lecture en cours, nouveautés Marketplace, activité de la communauté, progression du module langues
- Barre de recherche globale accessible en haut

### 3. Histoires & Héros

- **Catalogue** : grille/liste filtrable par époque (précolonial, colonial, indépendances, contemporain), région (Afrique de l'Ouest, du Nord, de l'Est, Centrale, Australe), thème (résistance, art, science, politique, sport)
- **Fiche héros/histoire** : portrait ou illustration, biographie/récit en format long, frise chronologique des événements clés, citations marquantes, contenus liés (autres héros de la même époque/région)
- **Mode lecture immersive** : plein écran, typographie soignée, mode sombre par défaut, indicateur de progression de lecture, option d'écoute audio (narration)

### 4. Découverte

- **Carte interactive du continent** : navigation par pays/région pour explorer les 7 catégories du module (peuples & cultures, traditions & rites, mythes & légendes, gastronomie, objets sacrés, artisanat & savoir-faire, villages & lieux)
- **Catalogue par catégorie**, avec une fiche détail dédiée à chaque type de contenu (une fiche peuple, une fiche tradition, une fiche mythe en mode lecture immersive, une fiche recette pas-à-pas, une fiche objet sacré, une fiche artisanat, une fiche village)
- **Module Visite virtuelle des musées** : expérience immersive à 360° avec points d'intérêt cliquables vers les fiches Objets sacrés, marquée « Bientôt disponible » tant que la techno n'est pas développée mais déjà intégrée dans la navigation de Découverte

Détail complet de ce module (les 7 catégories, chaque type de fiche, la version enfant) dans `prompt-claude-design-decouverte.md`.

### 5. Marketplace

- **Catalogue produits** : grille avec filtres (catégorie, région d'origine, fourchette de prix, artisan/créateur), fiche produit et fiche artisan cohérentes avec l'ADN storytelling d'AFROBACK (pas une fiche e-commerce anonyme)
- **Parcours d'achat complet** : panier, tunnel de paiement (Mobile Money en priorité), suivi de commande, avis & notation, retours/réclamations, favoris

Détail complet de ce module, côté acheteur ET côté vendeur, dans `prompt-claude-design-marketplace.md`.

### 6. Communauté & Abonnement

- **Fil communautaire, profils, signalement/modération, espace membre premium** : détail complet dans `prompt-claude-design-communaute.md`
- **Page des formules d'abonnement** : 3 paliers (« Découverte » gratuit, « Racines » et « Héritage » payants — noms à considérer comme des suggestions modifiables), avec bascule mensuel/annuel et un prix qui varie par palier selon le nombre d'enfants rattachés au compte. Détail complet de cette logique de tarification dans `prompt-claude-design-onboarding.md`
- **Tunnel de paiement abonnement** (choix du palier, moyen de paiement, confirmation)

### 7. Apprentissage des langues

- **Sélection de la langue à apprendre** (ewondo, douala, bassa, bamiléké), avec indication du niveau (débutant/intermédiaire)
- **Écran de leçon** : vocabulaire illustré, prononciation audio, exercices interactifs (association, QCM, répétition)
- **Suivi de progression** : niveau atteint, série de jours consécutifs (streak), badges de réussite

### 8. Profil & paramètres (transverse)

- **Profil utilisateur** : avatar, bio courte, langue préférée, historique d'activité
- **Mes favoris / mes contenus sauvegardés** (histoires, produits, publications)
- **Paramètres** : langue de l'interface, notifications, confidentialité, gestion de l'abonnement, moyens de paiement enregistrés, déconnexion, suppression de compte
- **Notifications** : liste des notifications (nouveau contenu, réponse communauté, statut commande, rappel d'apprentissage)

### 9. Espace Enfant (profil rattaché au parent)

Une fois le profil enfant sélectionné, l'app bascule dans une interface distincte, pas juste une version « allégée » de l'app adulte :

- **Accueil enfant** : gros boutons, mascotte/illustration ludique, mise en avant du jeu du jour, de la leçon de langue en cours, de l'histoire à découvrir — moins de texte, plus d'illustration et d'audio
- **Histoires & Héros (version enfant)** : mêmes héros que la version adulte mais récits reformulés simplement, narration audio par défaut, illustrations plus présentes que le texte
- **Apprentissage des langues (version enfant)** : très gamifié (mascotte, récompenses, animations de réussite), vocabulaire de base illustré, répétition audio, pas de jargon pédagogique visible
- **Découverte (version enfant)** : exploration simplifiée du patrimoine (villages, objets, traditions) façon « carnet d'explorateur », sans carte complexe à manipuler
- **Aucun accès** à la Marketplace, au fil Communauté ni aux paramètres de paiement depuis le profil enfant : ces piliers sont volontairement absents de la navigation enfant, pas seulement masqués derrière un mot de passe
- **Écran de fin de session ludique** : résumé visuel de ce que l'enfant a appris/lu dans la session (étoiles, badges), pensé pour redonner la main au parent naturellement

### 10. Espace Parent (contrôle parental)

Accessible depuis le profil adulte dès qu'un profil enfant existe :

- **Tableau de bord des profils enfants** : liste des enfants rattachés, avec pour chacun un résumé (temps passé, dernière activité, progression langues, contenus consultés)
- **Fiche détail d'un enfant** : historique de lecture/apprentissage, badges obtenus, niveau atteint par langue
- **Réglages de contrôle parental par enfant** : limite de temps d'écran quotidienne, activation/désactivation de piliers accessibles (ex. désactiver Découverte pour un très jeune profil), langues d'apprentissage actives
- **Gestion des profils** : ajouter/modifier/supprimer un profil enfant, changer l'avatar
- **Paiement et abonnement** : reste géré uniquement côté parent, jamais visible ni accessible depuis un profil enfant

### 11. Espace Vendeur / Artisan

Activable depuis le profil adulte grand public (« Devenir vendeur sur AFROBACK »), en plus de son usage normal de l'app : activation du forfait (tarification détaillée dans `prompt-claude-design-onboarding.md`), tableau de bord, gestion des produits et des commandes, avis reçus, revenus & paiements, changement de forfait, outils de publicité (Premium).

Détail complet de ce module dans `prompt-claude-design-marketplace.md`, avec le parcours acheteur.

## Système de navigation

- **Web** : header fixe (logo, recherche, liens vers les 5 piliers, icône notifications, menu compte), sidebar contextuelle sur Découverte/Marketplace pour les filtres. Le menu compte contient le sélecteur de profil (adulte/enfants) et, si activé, un lien vers l'Espace Vendeur
- **Mobile** : tab bar basse à 5 icônes (Accueil, Découverte, Marketplace, Communauté, Profil), le pilier Histoires & Héros est accessible depuis l'Accueil et via une action flottante ou un onglet secondaire à définir selon l'équilibre visuel
- **Profil enfant sélectionné** : la tab bar/le header changent pour une version enfant avec moins d'onglets (Accueil, Histoires, Langues, Découverte — pas de Marketplace ni Communauté), visuellement distincte (plus ronde, plus colorée) pour qu'un parent identifie immédiatement qu'il est dans un profil enfant
- **Espace Vendeur** : accessible comme un mode bascule depuis le profil adulte (bouton « Passer en mode vendeur » dans le menu compte), avec sa propre navigation (Tableau de bord, Produits, Commandes, Revenus) le temps qu'il est actif

## Composants transverses à concevoir une fois, réutilisés partout

- Carte de contenu (histoire, lieu, produit, publication) dans ses variantes grille et liste
- Badge « Bientôt disponible » cohérent avec celui du site vitrine, à utiliser sur le module Visite virtuelle des musées et sur les fonctionnalités non encore actives que Yannick désignera plus tard
- **Sélecteur de profil façon Netflix** (avatars en mosaïque, ajout de profil enfant) et **indicateur visuel de profil actif** (bandeau ou couleur distincte quand on est dans un profil enfant)
- **Badge « Vendeur »** sur les cartes produit/artisan pour signaler un compte vendeur actif
- Boutons primaire (dégradé or), secondaire (contour terracotta), désactivé
- Champs de formulaire (texte, sélection, upload photo) en thème sombre avec bon contraste
- Modales et confirmations (suppression, déconnexion, validation de commande/abonnement, suppression d'un profil enfant)
- États vides (« Aucun favori pour l'instant »), états de chargement (squelettes), états d'erreur (paiement refusé, pas de connexion)
- Sélecteur des 6 langues d'interface, identique dans l'esprit à celui du site vitrine

## Exigences techniques et UX

- Contraste texte/fond toujours suffisant, y compris sur les zones sombres et dorées
- Densité d'information adaptée à l'usage : les écrans de contenu (héros, découverte) peuvent être immersifs et visuels, les écrans transactionnels (paiement, paramètres) doivent être clairs et sobres avant tout
- Cohérence stricte des composants entre web et mobile pour faciliter le développement ultérieur
- Prévoir le mode « traduction en cours de relecture » sur les 4 langues camerounaises dans l'interface produit, pas seulement sur le site vitrine

## Livrable attendu

Un prototype de maquette cliquable (ou une série d'écrans organisés par pilier) couvrant l'ensemble des écrans listés ci-dessus — y compris les 3 modules par profil (Enfant, Parent, Vendeur) — en version web et mobile, avec du contenu d'exemple incarné (vrais noms de héros, vrais types de produits/traditions) plutôt que du texte générique.

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- Ce script est volumineux (11 modules, 2 formats, 4 profils). Si Claude Design peine à tout produire en une seule fois, découpe l'envoi en plusieurs passes, par exemple : (1) Onboarding + sélection de profil + Accueil + Histoires & Héros, (2) Découverte + Marketplace + Espace Vendeur, (3) Communauté & Abonnement + Apprentissage des langues + Profil/paramètres, (4) Espace Enfant + Espace Parent. Le prompt est déjà structuré pour permettre ce découpage sans perdre la cohérence visuelle (identité visuelle et composants transverses restent identiques d'un envoi à l'autre).
- Le modèle économique (marketplace, abonnement, sponsors) n'est **pas encore validé** selon `context/AFROBACK.md` — cette maquette sert justement à matérialiser une hypothèse concrète pour t'aider à décider, ce n'est pas encore un engagement définitif sur le business model.
- Les noms de paliers d'abonnement (« Découverte » gratuit / « Racines » / « Héritage » payants) sont des suggestions de travail, à valider ou renommer librement. Le détail complet de la tarification (prix par palier, variation selon le nombre d'enfants, forfaits vendeur) est dans `prompt-claude-design-onboarding.md`, pas dans ce fichier.
- **Point à ne pas perdre de vue une fois la maquette en main** : dès qu'une plateforme a des enfants ET un fil communautaire ouvert (même si l'enfant n'y a pas accès), la question de la modération et de la sécurité des données des mineurs devient sérieuse (RGPD, obligations spécifiques aux données d'enfants). Ce script choisit une approche prudente par défaut (profil enfant sans accès à la Communauté ni à la Marketplace, aucune donnée de paiement visible côté enfant), mais ce sujet mérite une vraie décision produit/juridique avant un lancement public, pas seulement un choix de maquette.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté du site vitrine existant.
- Comme pour le site vitrine, les 4 langues camerounaises (ewondo, douala, bassa, bamiléké) restent des brouillons de traduction tant qu'un locuteur natif ne les a pas relues : ne pas activer ce contenu publiquement dans le produit final avant relecture.
