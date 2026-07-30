# Prompt pour Claude Design — Back-office d'administration AFROBACK

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.
>
> ⚠️ Ceci n'est PAS l'app grand public (`prompt-claude-design-produit.md`) ni le site vitrine (`prompt-claude-design.md`). Ce script décrit un **outil interne réservé à Yannick et à son équipe** : le back-office qui permet d'administrer AFROBACK une fois le contenu déjà créé.

---

Conçois la maquette complète d'un **back-office d'administration** pour **AFROBACK**, une plateforme panafricaine qui rassemble histoires de héros africains, découverte du patrimoine du continent, marketplace de produits authentiques, communauté, abonnement et apprentissage des langues camerounaises. Le slogan est **« Retour aux origines »**.

## Ce que cet outil est — et n'est pas

**Ce n'est pas un outil de création de contenu.** Les récits de héros sont écrits par un processus éditorial séparé (recherche de sources fiables, séparation stricte entre fait historique et légende, écriture façon griot) : ce travail continue de se faire en amont, hors de cet outil. Le back-office n'écrit jamais un récit à la place de ce processus.

**C'est un outil d'administration et de pilotage** de ce qui existe déjà : mettre en avant une histoire, activer ou désactiver un audio ou une vidéo une fois produits, gérer les statuts de publication, superviser les utilisateurs, modérer la communauté, suivre le catalogue Marketplace, les abonnements et les partenariats sponsors. Pense-le comme la salle de contrôle d'AFROBACK, pas comme son atelier d'écriture.

## Identité visuelle (cohérente avec le site vitrine et l'app produit)

- **Logo** : silhouette d'une femme africaine de profil fusionnée avec la carte du continent, remplie de motifs tribaux, sur un halo doré, fond noir profond
- **Couleurs** :
  - Noir profond / charbon (`#0F0B08`) comme base des fonds
  - Dégradé or / bronze (`#F0C36B` → `#8B5A2B`) pour les accents, CTA, éléments actifs
  - Terracotta / rouille (`#A0522D`, `#8B3A2F`) en couleur secondaire chaude, utile pour les états d'alerte/attention
  - Vert et rouge sobres (pas criards, dans la même famille de saturation que le reste de la palette) pour les statuts positifs/négatifs (publié/dépublié, actif/suspendu) — un back-office a besoin de codes couleur de statut clairs
- **Typographie** : la police display à fort caractère reste réservée aux titres de section ; l'essentiel de l'interface (tableaux, formulaires, filtres) doit utiliser la police sans-serif très lisible, en priorisant la densité d'information et le confort de lecture sur de longues sessions de travail
- **Ton** : toujours premium et habité dans les grands titres et les écrans de mise en avant de contenu, mais **résolument sobre et fonctionnel** sur les écrans de gestion (tableaux, formulaires, listes) — c'est un outil de travail quotidien, pas une vitrine à faire rêver. Pense interface de gestion type CMS professionnel, avec l'identité AFROBACK en toile de fond plutôt qu'au premier plan

## Plateforme

**Application web uniquement**, pensée desktop en priorité (tableaux de données, formulaires denses, actions en masse), avec une tolérance raisonnable en tablette. Pas de version mobile à prévoir : ce n'est pas un usage nomade.

Navigation : sidebar fixe à gauche (logo réduit + sections principales), zone de contenu principale avec fil d'ariane, barre supérieure avec recherche globale, notifications internes et menu compte administrateur.

## Périmètre fonctionnel

### 1. Tableau de bord (accueil du back-office)

- Vue d'ensemble chiffrée : nombre de héros publiés, statut de production (combien ont un récit/storyboard/audio/vidéo prêts vs en attente), nombre d'utilisateurs inscrits (total + nouveaux sur 7/30 jours), répartition par forfait (Découverte/Racines/Héritage)
- Alertes visuelles sur ce qui demande une action : contenus signalés en attente de modération, médias en attente de validation, erreurs d'upload
- Raccourcis vers les actions fréquentes (mettre en avant une histoire, voir les derniers utilisateurs inscrits)

### 2. Gestion des Histoires & Héros

Le cœur de l'outil. Une **liste/tableau des héros** avec, par ligne :
- Portrait miniature (ou état "aucune photo" visuellement distinct), nom, époque, région, thème
- Statuts de contenu en colonnes ou badges compacts : récit FR ✓/✗, récit EN ✓/✗, storyboard ✓/✗, audio FR ✓/✗, audio EN ✓/✗, vidéo ✓/✗, photo ✓/✗
- Statut de publication (publié / brouillon / dépublié)
- Indicateur "à la une" (mis en avant sur l'accueil de l'app grand public)

**Actions disponibles depuis la liste ou une fiche détail par héros** :
- **Mettre en avant / retirer de la une** — contrôle manuel de ce qui apparaît en tête de l'accueil grand public, plutôt qu'une rotation automatique
- **Activer / désactiver l'audio** disponible pour ce héros (sans supprimer le fichier — le retirer temporairement de la circulation, par exemple le temps de corriger un problème de qualité)
- **Activer / désactiver la vidéo** disponible, même logique
- **Publier / dépublier** un héros entier (le retirer complètement du catalogue visible sans supprimer ses données)
- **Uploader ou remplacer un média** (photo de carte catalogue, fichier audio FR/EN, fichier vidéo) — remplace le processus actuel entièrement manuel (upload en ligne de commande)
- **Modifier les métadonnées éditoriales** qui ne relèvent pas du récit lui-même : thème(s), région, ordre d'affichage dans le catalogue, avertissement de lecture pour les figures ambivalentes
- **Consulter le récit en lecture seule** (FR et EN), la fiche structurée (frise chronologique, citations avec leur statut d'attestation, légendes, sources) — pour vérifier avant de publier, jamais pour réécrire depuis cet outil
- **Voir le storyboard** (96 planches, 4 chapitres) en lecture seule, avec le statut de chaque chapitre

Prévoir un état visuel clair et no-nonsense pour "contenu incomplet" (ex. héros sans aucun média) afin qu'un administrateur voie immédiatement qui a besoin de production.

### 3. Gestion des utilisateurs

- Liste des comptes utilisateurs : prénom, pays, numéro de téléphone (partiellement masqué par défaut, révélable), date d'inscription, forfait actif, dernière connexion
- Recherche et filtres (par pays, par forfait, par date d'inscription)
- Fiche détail utilisateur : informations du profil, historique d'activité (héros consultés/lus), forfait et historique de changement de forfait
- Actions de modération : suspendre un compte, le réactiver, forcer une déconnexion, supprimer un compte (avec confirmation forte — action irréversible)
- Rôles internes : distinction claire entre comptes utilisateurs normaux et comptes administrateurs du back-office (avec, à terme, plusieurs niveaux possibles — ex. administrateur complet vs modérateur de contenu uniquement)

### 4. Communauté (modération)

Ce pilier n'est pas encore actif côté app grand public, mais maquette-le comme fonctionnel pour anticiper : fil des publications, file d'attente de signalements à traiter (contenu, utilisateur, raison, action possible : ignorer/avertir/supprimer/bannir), gestion des membres, charte communautaire éditable.

### 5. Marketplace (supervision)

Idem, pilier pas encore actif mais à maquetter : liste des vendeurs/artisans avec statut (en attente de validation, actif, suspendu), liste des produits avec modération possible (retirer un produit non conforme), aperçu des commandes et litiges en cours, pas un outil de gestion de stock complet — une supervision, pas une comptabilité.

### 6. Abonnements & revenus

- Vue d'ensemble des trois leviers économiques d'AFROBACK : abonnement, marketplace, sponsors
- **Abonnements** : répartition des utilisateurs par palier (Découverte/Racines/Héritage), revenu récurrent estimé, gestion des paliers eux-mêmes (nom, prix, contenu inclus — modifiable sans redéploiement de l'app)
- **Sponsors/partenariats** : liste des partenariats en cours ou en discussion (nom du partenaire, statut, contrepartie, dates), avec la possibilité d'associer un sponsor à un contenu spécifique (ex. bannière sur une fiche héros, mention "en partenariat avec")
- **Marketplace** : commission perçue, volume de transactions (une fois ce pilier actif)

### 7. Paramètres du back-office

- Gestion des comptes administrateurs et de leurs rôles/permissions
- Paramètres généraux de l'app grand public pilotables à distance (ex. activer/désactiver un pilier entier comme Découverte quand il sera prêt, messages d'annonce globaux)
- Journal d'activité (qui a fait quelle action de gestion, et quand) — traçabilité indispensable dès que plusieurs personnes ont accès à l'outil

## Composants transverses à concevoir une fois, réutilisés partout

- Tableau de données dense avec tri, filtres, recherche, pagination, sélection multiple pour actions groupées
- Toggle on/off clair (pour activer/désactiver audio, vidéo, publication) avec état de confirmation visible immédiatement
- Fiche détail en panneau latéral (drawer) ou page dédiée, cohérente d'une section à l'autre (héros, utilisateur, vendeur...)
- Badge de statut coloré (publié/brouillon, actif/suspendu, en attente/validé/rejeté)
- Zone d'upload de fichier (image/audio/vidéo) avec aperçu et barre de progression
- Modales de confirmation pour toute action destructrice ou difficilement réversible (dépublier, suspendre, supprimer)
- États vides et de chargement, cohérents avec le reste de l'écosystème AFROBACK

## Exigences techniques et UX

- Priorité absolue à la lisibilité et à la rapidité d'action sur les tableaux de données : c'est un outil utilisé au quotidien, pas une vitrine
- Contraste toujours suffisant, y compris pour les badges de statut sur fond sombre
- Aucune action destructrice ou difficile à annuler sans confirmation explicite
- Design pensé pour un usage par une seule personne au départ (Yannick), mais qui n'exclut pas d'ajouter d'autres administrateurs plus tard (rôles, journal d'activité)

## Livrable attendu

Un prototype de maquette cliquable (ou une série d'écrans organisés par section) couvrant : tableau de bord, gestion des héros (liste + fiche détail avec toutes les actions listées), gestion des utilisateurs (liste + fiche détail), communauté (modération), marketplace (supervision), abonnements & sponsors, paramètres. Contenu d'exemple crédible (les vrais héros déjà couverts par AFROBACK : Reine Nzinga, Martin Paul Samba, Rudolf Douala Manga Bell, Sultan Njoya, Ruben Um Nyobè, Charles Atangana, Félix Moumié, Ernest Ouandié, Manu Dibango), pas de lorem ipsum.

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- Comme pour le prompt produit, ce script est volumineux. Si Claude Design peine à tout produire d'un coup, découpe en 2-3 envois : (1) Tableau de bord + Gestion des héros (le cœur de l'outil), (2) Utilisateurs + Communauté + Marketplace, (3) Abonnements & sponsors + Paramètres.
- Ce brief part du principe que les récits/storyboards continuent d'être produits par le pipeline éditorial actuel (agents griot/storyboard) — le back-office les administre, il ne les écrit pas. Si un jour tu veux que la création de contenu se fasse aussi depuis cet outil, ce sera un chantier séparé et une extension du scope actuel.
- Point technique déjà noté dans `context/AFROBACK.md` : le champ "mettre en avant" (à la une) n'existe pas encore dans la base de données actuelle (aujourd'hui, le héros du jour tourne automatiquement) — son introduction fera partie du développement du back-office, pas seulement de son design.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté du reste.
