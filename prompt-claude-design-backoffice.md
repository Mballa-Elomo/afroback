# Prompt pour Claude Design — Back-office d'administration AFROBACK

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.
>
> ⚠️ Ceci n'est PAS l'app grand public (`AFROBACK Mobile.dc.html`) ni le site vitrine (`prompt-claude-design.md`). Ce script décrit un **outil interne réservé à Yannick et à son équipe** : le back-office qui permet d'administrer AFROBACK dans son intégralité, contenu comme business, sans jamais toucher au SQL ni au code.
>
> Version 2026-08-05, qui remplace une première version du 2026-07-30 : à l'époque, seuls Histoires & Héros et le socle produit existaient. Depuis, Découverte, Communauté, Marketplace, module Parent/Enfant, Don, École des Héros et Mythologie ont été construits — ce script couvre désormais tous les piliers réels du produit, cadré par un brainstorming des 4 pôles du projet (Contenu & éditorial, Produit & tech, Marketing & communauté, Business model & partenariats).

---

Conçois la maquette complète d'un **back-office d'administration** pour **AFROBACK**, une plateforme panafricaine qui rassemble histoires de héros africains, découverte du patrimoine, mythologie, un module gamifié pour enfants (École des Héros), une communauté, un marketplace de produits authentiques, des dons et l'apprentissage des langues camerounaises. Le slogan est **« Retour aux origines »**.

## Ce que cet outil est — et n'est pas

**Ce n'est pas un outil qui invente ou réécrit un récit à la place du processus éditorial.** Les récits de héros, les fiches Découverte et les mythes sont produits par une recherche de sources fiables, avec une séparation stricte entre fait historique et légende. Ce travail de recherche et de rédaction continue de se faire en amont. Le back-office **saisit, structure, publie et corrige** ce contenu déjà écrit — il ne le génère pas depuis rien.

**C'est un outil de saisie structurée, de pilotage de production et d'administration** qui remplace un travail aujourd'hui entièrement manuel : Yannick édite des fichiers de code, régénère des scripts SQL et les colle à la main dans le SQL Editor Supabase pour publier le moindre contenu ; il uploade des médias directement dans le dashboard Supabase Storage puis modifie un fichier de code pour brancher chaque URL. Ce script décrit l'outil qui supprime entièrement cette étape technique.

**Principe non négociable, à respecter dans toute la maquette** : le back-office n'affiche jamais un chiffre, un statut ou un contenu qui ne correspond pas à une donnée réelle. Pas de compteur de dons gonflé, pas de case "traduit" cochée avant validation humaine, pas de commission ou de revenu affiché tant qu'ils ne sont pas configurés ou réels. Même discipline que le reste du produit (jamais un faux succès de paiement, jamais un bouton mort).

## Identité visuelle (cohérente avec le site vitrine et l'app produit)

- **Logo** : silhouette d'une femme africaine de profil fusionnée avec la carte du continent, remplie de motifs tribaux, sur un halo doré, fond noir profond
- **Couleurs** :
  - Noir profond / charbon (`#0F0B08`) comme base des fonds
  - Dégradé or / bronze (`#F0C36B` → `#8B5A2B`) pour les accents, CTA, éléments actifs
  - Terracotta / rouille (`#A0522D`, `#8B3A2F`) en couleur secondaire chaude, utile pour les états d'alerte/attention
  - Vert et rouge sobres (pas criards, dans la même famille de saturation que le reste de la palette) pour les statuts positifs/négatifs (publié/dépublié, actif/suspendu, validé/rejeté)
- **Typographie** : la police display à fort caractère reste réservée aux titres de section ; l'essentiel de l'interface (tableaux, formulaires, filtres) utilise la police sans-serif très lisible, en priorisant la densité d'information et le confort de lecture sur de longues sessions de travail
- **Ton** : premium et habité sur les écrans de mise en avant, mais **résolument sobre et fonctionnel** sur les écrans de gestion (tableaux, formulaires) — un outil de travail quotidien, pas une vitrine

## Plateforme

**Application web uniquement**, pensée desktop en priorité (tableaux denses, formulaires, actions en masse), tolérance raisonnable en tablette. Pas de version mobile.

Navigation : sidebar fixe à gauche (logo réduit + sections principales, groupées par thème : Contenu / Communauté & business / Utilisateurs / Paramètres), zone de contenu principale avec fil d'ariane, barre supérieure avec recherche globale et menu compte administrateur.

---

## 1. Connexion & rôles

Écran de connexion **distinct de celui de l'app grand public** (email + mot de passe, jamais l'authentification téléphone des utilisateurs mobiles). Trois rôles à prévoir dès la maquette, avec un badge de rôle visible dans le menu compte :
- **Administrateur** : accès complet, y compris gestion des comptes admin et paramètres.
- **Éditeur contenu** : accès à Héros/Découverte/Mythologie/École des Héros/Traduction, pas aux écrans business ni aux comptes admin.
- **Modérateur communauté** : accès uniquement à l'écran Communauté.

Un seul compte (Yannick) existe réellement aujourd'hui, mais la maquette doit montrer cette distinction de rôles dès le départ (voir notes).

## 2. Tableau de bord

Remplace le fichier `context/AFROBACK.md` tenu à jour à la main. **Toujours honnête, jamais un outil qui donne l'illusion d'une traction qu'AFROBACK n'a pas encore** : si Marketplace a un vendeur test et zéro vrai produit, le tableau de bord le dit tel quel, pas habillé.

- **Statut par pilier**, en cartes ou lignes compactes : Histoires & Héros, Découverte, Mythologie, Communauté, Marketplace, École des Héros, Dons, chacun avec un badge (prêt / partiel / bloqué) et un chiffre réel (ex. "3 héros sur 9 avec audio", "0 produit Marketplace", "1 post Communauté")
- **Alertes d'action** : signalements Communauté en attente, médias manquants, traductions non validées
- **Raccourcis** vers les actions fréquentes (ajouter un héros, traiter un signalement)

## 3. Gestion des Héros (Histoires & Héros)

Le cœur du contenu existant. **Liste/tableau des héros** (les 9 réels : Reine Nzinga, Martin Paul Samba, Rudolf Douala Manga Bell, Sultan Njoya, Ruben Um Nyobè, Charles Atangana, Félix Moumié, Ernest Ouandié, Manu Dibango), avec par ligne :
- Portrait miniature (ou état "aucune photo" visuellement distinct — 6 des 9 héros n'ont aucun média aujourd'hui, l'UI doit le montrer immédiatement, pas seulement au clic)
- Nom, époque, région, thème
- Statuts en badges compacts : récit FR ✓/✗, récit EN ✓/✗, storyboard ✓/✗, audio ✓/✗, vidéo ✓/✗, photo ✓/✗
- Statut de publication (publié / brouillon / dépublié), indicateur "à la une"

**Fiche détail par héros**, en formulaire structuré (jamais un champ texte libre unique) :
- Récit FR/EN découpé en 4 chapitres (titre + texte par chapitre)
- Frise chronologique (liste de `{ date, événement }`)
- Citations, chacune avec un **menu déroulant obligatoire** de statut d'attestation (attestée / rapportée par un tiers / non authentifiée) — impossible d'enregistrer une citation sans ce statut
- Légendes associées, clairement séparées visuellement des faits attestés
- Avertissement de lecture : champ dédié et visible dans la liste (pas enfoui dans un onglet), pour les figures ambivalentes comme Charles Atangana
- Sources, héros liés
- Upload média (portrait catalogue, audio FR/EN, vidéo) avec preview immédiate — voir composant transverse "Bibliothèque médias"
- Actions : publier/dépublier, mettre à la une/retirer, activer/désactiver l'audio ou la vidéo indépendamment de leur suppression

## 4. Gestion Découverte

Même logique que Héros, pour les fiches villages/coutumes/objets/rôles traditionnels génériques (jamais un individu nommé). Exemples réels déjà en base : palais royal de Foumban, le Nguon, le trône Mandu Yenu, le fon (Bamoun/Foumban) ; Bonanjo, le Ngondo, le tangué (Sawa/Douala) ; Ebolowa, le rite du Sô, le nkukuma (Bulu/Beti).

- Liste filtrable par type (village/coutume/objet/personnage/fait) et par région/ethnie
- Fiche détail : titre, sous-titre, résumé liste, texte complet, **chaque affirmation sensible avec un statut obligatoire** (atteste / tradition_orale / debattu) en tableau dédié, jamais un texte libre où ce marquage peut être oublié
- Sources, héros liés, autres items Découverte liés
- Upload d'image avec preview

## 5. Gestion Mythologie

5 mythes réels : Les Miengu (peuples Sawa, Littoral), Nchare Yen (Bamoun, Ouest/Grassfields), Ngan Medza (Beti-Fang, Centre), Ngog Lituba (Bassa/Bakoko/Bati, Littoral), Les Sao (Kotoko, Extrême-Nord). Aucun des 5 n'a d'image ni de narration audio à ce jour.

- Liste groupée par zone, mêmes colonnes de statut que Héros (récit ✓, image ✗, audio ✗)
- Fiche détail : peuple, région, zone, époque, type de contenu, thème, récit en 4 chapitres (titre + texte), sources
- Upload média (image, narration)

## 6. École des Héros — pilotage de production

**Le chantier de contenu le plus lourd du projet, à ce jour entièrement vide.** Pour chaque héros rattaché à un niveau (4 niveaux scolaires, 9 héros), il faut un texte réécrit adapté à l'âge, une narration audio dédiée enfant (jamais la narration adulte réutilisée), une vidéo adaptée, et des planches de BD réellement dessinées (aucune n'existe nulle part dans le projet).

- **Vue matricielle** : lignes = les 9 héros, colonnes = les 4 niveaux, chaque case = statut par format (Lire/Écouter/Regarder/BD), avec un code couleur (vide / en cours / prêt). Sans cette vue, impossible de savoir ce qui manque parmi des dizaines de combinaisons.
- **Éditeur de leçon** (héros × niveau) : texte adapté (distinct visuellement du récit adulte, pour ne jamais confondre les deux dans l'UI), upload narration audio enfant, upload vidéo, upload des planches de BD (une par une, avec ordre et texte/bulle associés)
- **Éditeur de quiz** : questions à choix multiples par leçon, et questions du grand quiz de fin de niveau
- **Éditeur des 4 niveaux** : nom, tranche d'âge, ton de contenu (déjà en base, modifiable ici plutôt que par SQL)

## 7. Bibliothèque médias

Composant transverse utilisé par les écrans 3, 4, 5 et 6 (pas un pilier séparé, un composant réutilisé) : zone de dépôt avec preview immédiate, contrôle de format (jpg/png/webp pour l'image, mp3 pour l'audio, mp4 pour la vidéo), barre de progression d'upload, et rattachement direct à la fiche concernée sans passer par une étape de code. Vue liste de tous les médias déjà uploadés (pour repérer un doublon ou un oubli de rattachement).

## 8. Traduction

Suivi des 4 langues camerounaises de l'interface (ewondo, douala, bassa, bamiléké), aujourd'hui vides — un agent traducteur a produit des brouillons par recherche web mais la couverture reste très faible (0 à 4 mots réellement attestés selon la langue).

- Tableau par langue × clé de texte de l'interface, avec un **statut à trois états, jamais deux** : vide / brouillon (non relu) / validé par un locuteur natif. Le back-office n'affiche jamais une coche "traduit" tant que le troisième état n'est pas atteint — un brouillon reste visuellement marqué comme tel, pas comme prêt.
- Champ pour le texte source (FR), le brouillon proposé, et un espace de validation/correction par un relecteur humain
- Impossible d'activer une langue côté app grand public tant que ses clés critiques ne sont pas validées (le bandeau "traduction en cours de relecture" actuel de l'app resterait actif sinon)

## 9. Communauté — modération

Pilier social pseudonyme (posts, commentaires), post-modération + signalement. Aujourd'hui les tables existent (`community_reports`, `community_banned_terms`) mais aucune UI ne permet de les utiliser — chaque signalement dort, la liste de termes interdits est vide.

- **File de signalements** : liste triable (date, contenu signalé, raison, gravité), avec actions directes (ignorer / avertir l'auteur / supprimer le contenu / bannir le compte)
- **Gestion des termes interdits** : ajout/suppression de mots pour le filtre automatique, avec une liste de départ suggérée plutôt que de partir de zéro
- **Charte communautaire éditable**, avec historique des versions — aujourd'hui figée en dur dans le code de l'app
- Vue "santé de la communauté" : nombre de signalements ouverts, temps moyen de traitement (une alerte de pilotage, pas une métrique de vanité)

## 10. Marketplace — supervision

Infrastructure complète côté app, catalogue réellement vide (un seul vendeur test, "Yannick", Centre, Sculpture Bamoun, zéro produit ajouté).

- **Validation des vendeurs** : file d'attente, fiche vendeur, statut (en attente / validé / suspendu), motif de refus
- **Modération produits** : retirer un produit non conforme
- **Suivi des commandes** : statuts réels uniquement (`en_attente_paiement`, `expediee`, `livree`, `annulee` — jamais un statut "payée" tant que Mobile Money n'est pas intégré), espace litiges simple
- **Configuration commission/paliers vendeur** : écran prêt et fonctionnel, mais **volontairement vide et sans valeur pré-remplie** tant que Yannick n'a pas tranché cette décision business — l'outil doit exister avant la décision, jamais l'inverse

## 11. Dons

- Liste des dons enregistrés : montant, cause (aujourd'hui une seule, "Soutenir AFROBACK"), type (ponctuel/récurrent), statut réel (`en_attente_paiement`), date, anonyme ou non
- **Aucun total agrégé mis en avant comme un indicateur de réussite** tant que le volume est nul ou non significatif — même discipline que côté app, où le compteur a été volontairement retiré
- Pas de génération de reçu fiscal (statut juridique d'AFROBACK non tranché)

## 12. Abonnements

- Configuration des 3 paliers (Découverte gratuit, Racines, Héritage) : nom, prix, description, contenus/fonctionnalités inclus — modifiable sans toucher au code
- Statut par palier (actif / brouillon), utile pour préparer un forfait avant que le paiement Mobile Money soit intégré
- Historique des changements de prix (qui, quand)
- Répartition réelle des utilisateurs par palier (aujourd'hui, seul le forfait gratuit est fonctionnel)

## 13. Sponsors (mini-CRM)

Levier retenu mais jamais démarché à ce jour (zéro prospect). Outil volontairement simple :
- Pipeline à statuts : prospect → premier contact → discussion → partenariat actif → terminé
- Fiche partenaire : contrepartie offerte, montant si applicable, dates, contact
- Association possible d'un sponsor à un contenu spécifique (ex. bannière sur une fiche héros)

## 14. Utilisateurs

- Liste des comptes grand public : prénom, pays, téléphone (masqué par défaut, révélable), date d'inscription, forfait actif, dernière connexion
- Recherche et filtres, fiche détail avec historique d'activité
- Actions de modération de compte : suspendre, réactiver, forcer une déconnexion, supprimer (confirmation forte, action irréversible)

## 15. Paramètres

- **Comptes administrateurs et rôles** (voir écran 1) : ajouter/retirer un accès, changer un rôle
- **Feature flags par pilier** : activer/désactiver Découverte, Marketplace, Communauté etc. côté app grand public sans redéploiement, avec un message affiché à la place si désactivé
- **Journal d'activité** : qui a fait quelle action (créer/publier/supprimer/modifier une commission...), quand, avant/après — traçabilité dès qu'une deuxième personne a accès à l'outil

---

## Composants transverses à concevoir une fois, réutilisés partout

- Tableau de données dense avec tri, filtres, recherche, pagination, sélection multiple pour actions groupées
- Toggle on/off clair (publication, activation média) avec confirmation visible immédiatement
- Menu déroulant de statut obligatoire (fait/légende, attestation) — jamais un champ texte libre pour une information structurante
- Fiche détail en panneau latéral (drawer) ou page dédiée, cohérente d'une section à l'autre
- Badge de statut coloré (publié/brouillon, actif/suspendu, en attente/validé/rejeté, vide/brouillon/validé pour la traduction)
- Zone d'upload de fichier avec aperçu et barre de progression (voir écran 7)
- Vue matricielle réutilisable (utilisée pour École des Héros, adaptable à d'autres suivis de production futurs)
- Modales de confirmation pour toute action destructrice ou difficilement réversible
- États vides et de chargement, cohérents avec le reste de l'écosystème AFROBACK — un état vide dit honnêtement "rien pour l'instant", jamais un contenu de démonstration

## Exigences transversales

- Priorité absolue à la lisibilité et à la rapidité d'action sur les tableaux de données
- Contraste toujours suffisant, y compris pour les badges de statut sur fond sombre
- Aucune action destructrice sans confirmation explicite
- **Aucun chiffre, statut ou contenu affiché qui ne correspond pas à une donnée réelle** — principe directeur de toute la maquette, à respecter écran par écran (tableau de bord, dons, abonnements, traduction)
- Design pensé pour un usage par une seule personne au départ (Yannick), mais qui anticipe explicitement plusieurs rôles (éditeur contenu, modérateur) sans dire combien de personnes existeront réellement

## Livrable attendu

Un prototype de maquette cliquable (ou une série d'écrans organisés par section) couvrant les 15 écrans ci-dessus. Contenu d'exemple crédible et réel (les 9 héros déjà couverts, les fiches Découverte et mythes déjà cités dans ce script, le vendeur test "Yannick"), jamais de lorem ipsum ni de chiffre inventé.

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

Ce cahier des charges est le résultat d'un brainstorming des 4 pôles du projet. Voici les hypothèses prises et les questions qu'ils ont fait remonter, à trancher avant d'envoyer ce prompt à Claude Design :

- **Périmètre volontairement complet, pas priorisé dans le temps.** Ce script décrit 15 écrans d'un coup parce que c'est ce que tu as demandé ("administrer totalement et minutieusement"), mais c'est plus volumineux que tous les prompts précédents. Comme pour le prompt produit initial, si Claude Design peine à tout produire en un seul envoi, découpe en 2-3 lots. Proposition d'ordre, à valider ou changer : (1) Connexion/rôles + Tableau de bord + Héros + Découverte + Mythologie + Bibliothèque médias (le cœur contenu, le plus urgent vu que c'est ce qui bloque aujourd'hui), (2) École des Héros + Traduction + Communauté, (3) Marketplace + Dons + Abonnements + Sponsors + Utilisateurs + Paramètres.
- **Qui d'autre que toi aura accès à cet outil ?** Le script maquette 3 rôles (administrateur, éditeur contenu, modérateur communauté) sur recommandation du pôle Produit & tech, mais aujourd'hui un seul compte existe réellement (le tien). Si tu restes seul pour longtemps, on peut simplifier à un seul rôle et retirer l'écran de gestion des rôles — dis-le si c'est le cas.
- **Niveau de sécurité attendu non tranché** : 2FA obligatoire ? Restriction par IP ? Le script suppose une authentification email/mot de passe simple (cohérent avec le reste du projet, qui reste volontairement léger tant que le volume ne justifie pas plus), mais c'est une vraie question de sécurité à trancher, pas juste de design.
- **Hébergement du back-office non tranché** : même infrastructure que le reste du projet (Supabase + un hébergement web type Vercel, cohérent avec l'écosystème JS déjà utilisé) ou séparé pour limiter la surface d'exposition — question technique à trancher avec le pôle dev de Madou Consulting au moment du développement, pas seulement du design.
- **Écran 6 (École des Héros) : le back-office permet d'uploader des planches de BD déjà dessinées, il ne fournit pas d'outil de génération ou de commande à un illustrateur.** Si tu veux un jour piloter la commande de planches (brief, suivi de livraison, relecture) depuis cet outil, c'est une extension à cadrer séparément.
- **Écran 10 (Marketplace) et écran 12 (Abonnements)** : les champs de commission/prix sont volontairement vides dans la maquette (aucune valeur pré-remplie) — la décision business elle-même (quel taux, quel prix) reste entièrement la tienne, ce script ne fait que préparer l'outil pour le jour où tu trancheras.
- **Priorité entre les leviers business (abonnement, marketplace, sponsors, dons) si tout ne peut pas être développé d'un coup** : reste ouverte, à trancher au moment du développement (pas seulement du design de la maquette).
- **Statut juridique d'AFROBACK toujours non tranché** : ça limite ce que l'écran Dons peut légitimement afficher ou générer (pas de reçu fiscal) — le script en tient compte, mais la question de fond reste ouverte ailleurs dans le projet (voir `context/AFROBACK.md`).
- Point technique déjà noté depuis la première version de ce script : le champ "mettre en avant" (à la une) n'existe pas encore dans la base de données actuelle (le héros du jour tourne aujourd'hui automatiquement) — son introduction fera partie du développement du back-office, pas seulement de son design. Idem pour les tables `admin_activity_log` et `feature_flags` (écran 15), qui n'existent pas encore.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté du reste.
