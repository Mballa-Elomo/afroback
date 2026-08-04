# Prompt pour Claude Design — Module Parent/Enfant AFROBACK Mobile

> À copier-coller directement dans Claude Design, dans le projet existant **« AFROBACK Mobile Prototype »** (`AFROBACK Mobile.dc.html`), pas dans un nouveau projet — ce module doit rester dans le même fichier de maquette que le reste de l'app pour garder la cohérence visuelle. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) si le projet ne l'a pas déjà en référence.
>
> Garde strictement l'identité visuelle déjà établie dans `AFROBACK Mobile.dc.html` : fond noir profond `#0F0B08` (dégradé radial vers `#1c130b`), accent or `#E9BE77`/`#F0C36B`, dégradé CTA `#F0C36B` → `#8B5A2B`, terracotta `#A0522D`/`#8B3A2F`, typographie Cinzel (titres, serif) + Manrope (corps, sans-serif) + Space Mono (labels/dates), rayons de coin généreux (14-20px), cartes sur fond `#1A130D` avec bordure `rgba(240,195,107,.14)`. C'est une app mobile uniquement (pas de version web pour ce module).

---

Conçois le module complet **Parent/Enfant** d'AFROBACK Mobile : la gestion multi-profils au sein d'un même compte, l'espace de contrôle parental, et l'expérience enfant elle-même. Ce module existe déjà partiellement dans la maquette actuelle (onboarding « profils enfants », sélecteur de profil, Espace Parent, Accueil enfant) mais a été pensé à l'origine pour un enfant unique et générique — l'objectif de cette passe est de le compléter et de l'affiner à partir de ce qu'on a appris en développement réel.

## Rappel du contexte produit

AFROBACK est une plateforme de promotion de la culture africaine, 5 piliers (Histoires & Héros, Découverte, Communauté, Marketplace, Apprentissage des langues). Le compte utilisateur se connecte par téléphone + mot de passe. Le module Parent/Enfant repose sur un principe simple, à la Netflix : **un seul compte, plusieurs profils**. Le parent est le seul à s'authentifier ; les profils enfants n'ont ni mot de passe ni connexion séparée, ce sont des identités rattachées au compte du parent, choisies depuis un sélecteur au démarrage de l'app.

**Décision déjà actée, à respecter strictement dans cette maquette : aucune tarification par enfant.** L'ajout d'un profil enfant est gratuit et sans écran de paiement — ne pas concevoir d'écran « forfait famille » avec compteur de prix par enfant, ce sujet est traité séparément plus tard. Si l'écran de choix de forfait déjà existant dans la maquette (Découverte / Racines / Héritage) doit apparaître dans le parcours, garde-le identique à sa version actuelle, sans variante « par enfant ».

## Ce qui existe déjà, et ce qu'il faut ajouter ou affiner

### 1. Ajout d'un profil enfant (déjà existant, à conserver)

Écran répétable pendant l'onboarding et depuis l'Espace Parent : prénom, âge, avatar (choix parmi des pastilles de couleur dégradée existantes : terracotta `#C25E2E→#8B3A2F`, bleu `#3E6B8B→#274a63`, violet `#5B4B8A→#3A2E63`, or `#D9A441→#B06A1E`), langues camerounaises à activer (Ewondo/Douala/Bassa/Bamiléké). Retire uniquement l'étape suivante de tarification par enfant.

### 2. Code parent (nouveau — n'existe pas encore dans la maquette)

Deux écrans à concevoir proprement, jusqu'ici improvisés en code sans vraie maquette :

- **Création du code parent** : à la première utilisation, le parent choisit un code à 4 chiffres, saisi puis confirmé une seconde fois. Pavé numérique ou champ à 4 cases séparées (à toi de choisir ce qui est le plus cohérent avec le reste de l'app), validation automatique dès le 4e chiffre entré (pas de bouton « valider » qui pourrait se retrouver caché par le clavier).
- **Saisie du code parent** : demandé uniquement pour (a) revenir au profil adulte depuis un profil enfant, (b) entrer dans l'Espace Parent — jamais pour choisir un profil enfant depuis le sélecteur. Même logique de validation automatique. Prévoir un état d'erreur (« Code incorrect ») avec le champ qui se vide et se refocus.

### 3. Sélecteur de profil « Qui est-ce ? » (déjà existant, à conserver)

Grille des profils (adulte + enfants), plus une tuile « Ajouter un profil enfant », plus un lien discret vers l'Espace Parent (qui doit maintenant passer par l'écran de code, voir point 2).

### 4. Espace Parent (déjà existant, à enrichir)

Déjà présent : liste des enfants avec temps d'écran du jour, progression en langue, badges, réglage de limite d'écran quotidienne, interrupteur d'activation du pilier Découverte. À ajouter :

- Un accès pour changer/réinitialiser le code parent
- Un indicateur clair que la limite d'écran est **informative** pour l'instant (le temps est suivi et affiché, l'app ne se verrouille pas automatiquement) — pas la peine d'inventer un écran de blocage qui n'existe pas encore, juste refléter honnêtement l'état actuel

### 5. Accueil enfant, décliné par tranche d'âge (nouveau — l'existant ne prévoyait qu'un seul écran générique)

C'est le point le plus important de cette passe. Un enfant de 3 ans et un enfant de 11 ans n'ont pas le même rapport à la lecture ni la même attention : conçois **trois variantes de l'accueil enfant**, sélectionnées automatiquement selon l'âge renseigné dans le profil (pas de choix manuel par l'enfant) :

- **3-5 ans** : quasiment aucun texte à l'écran, grandes zones tactiles, tout doit pouvoir se comprendre à l'image seule (icônes, couleurs, pictogrammes), en vue d'une narration audio pour accompagner chaque contenu plutôt que du texte à lire. Rythme très simple : une carte principale mise en avant, deux-trois choix maximum visibles à la fois.
- **6-8 ans** : phrases courtes et illustrées, un peu plus de choix à l'écran, toujours très visuel mais l'enfant peut commencer à lire seul des mots simples.
- **9-11 ans** : plus proche de l'accueil adulte dans sa densité d'information, peut afficher un vrai texte à lire, une mise en page qui ressemble davantage à celle des piliers adultes tout en gardant une identité « enfant » clairement reconnaissable (palette plus vive, ton plus ludique).

Pour chacune des trois versions, garde la même structure de contenu que l'écran actuel (une histoire du jour, un accès au carnet d'explorateur, un état « bientôt disponible » pour le jeu du jour et l'apprentissage de langue) mais adapte la densité, la taille des éléments et la présence de texte selon la tranche.

### 6. Histoire du jour, adaptée par tranche d'âge (nouveau)

Le contenu réel derrière cet écran est un vrai récit de héros africain du catalogue (jamais un contenu inventé), mais reformulé pour un jeune public : retire les détails les plus durs (violence explicite, sujets adultes), garde toujours la distinction entre ce qui est historiquement attesté et ce qui relève de la légende, avec un langage adapté à l'enfant plutôt qu'un avertissement académique. Conçois la mise en forme pour les trois tranches d'âge : très illustré et audio pour les 3-5 ans, texte court illustré pour les 6-8 ans, texte plus complet mais toujours simplifié pour les 9-11 ans.

### 7. Carnet d'explorateur (déjà existant comme concept, jamais vraiment conçu)

Version enfant du pilier Découverte : mêmes contenus réels (villages, traditions, objets), présentés de façon plus ludique — un peu comme un carnet qu'on remplit au fil des découvertes plutôt qu'un catalogue classique. Là aussi, une déclinaison par tranche d'âge est bienvenue mais moins critique que pour l'accueil et l'histoire du jour.

### 8. Fin de session enfant (déjà existant, à conserver)

Écran de fin (temps passé, mots appris, etc. — uniquement des données réelles suivies, jamais des chiffres inventés), avec le bouton « Rendre l'écran à un adulte » qui renvoie vers la saisie du code parent plutôt que directement au sélecteur.

## Exigences transverses

- Toujours dans le cadre « phone frame » déjà utilisé dans le reste de la maquette
- Cohérence stricte des composants avec le reste du produit (cartes, boutons, badges, dégradés) telle qu'établie dans `AFROBACK Mobile.dc.html`
- Palette enfant plus chaude/vive que l'espace adulte (déjà amorcé avec les dégradés terracotta/bleu/violet/or existants), mais qui reste reconnaissable comme faisant partie d'AFROBACK, pas un univers graphique totalement à part
- Aucun contenu inventé présenté comme réel (pas de faux jeu, pas de fausse leçon de langue, pas de statistique enfant fictive) — utilise le badge « Bientôt disponible » déjà existant ailleurs dans le produit partout où le vrai contenu n'existe pas encore
- Contenu d'exemple incarné et crédible (vrais prénoms d'enfants, vrai héros du catalogue existant comme Reine Nzinga ou Sultan Njoya plutôt qu'un nom inventé), pas de texte générique

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- **Ce module a déjà été codé et testé** avant cette maquette (sélecteur de profil, Espace Parent, code PIN improvisé, accueil enfant unique). L'objectif ici n'est pas de reconcevoir le produit depuis zéro, c'est de combler les trous laissés par un développement qui a dû avancer sans maquette complète — surtout les écrans de code PIN et les 3 déclinaisons d'accueil enfant par âge, qui n'existaient pas du tout avant. Une fois la maquette obtenue, le plus efficace sera probablement de lancer `/afroback_design_qa` pour comparer ce qui est codé à ce que Claude Design aura produit, plutôt que de tout recoder sans vérifier les écarts.
- **Les tranches d'âge (3-5, 6-8, 9-11) sont une proposition issue de notre brainstorming**, pas encore un choix formalisé nulle part ailleurs dans le projet — si tu changes d'avis sur ce découpage après avoir vu le rendu, dis-le-moi, ça se répercute sur `context/AFROBACK.md`.
- **Point de vigilance déjà connu** : la tranche 3-5 ans dépend de narration audio réelle, qui n'existe pas encore pour la majorité des héros (6 sur 9 sans média). La maquette peut la prévoir (c'est son rôle), mais le contenu réel ne suivra que quand la production audio avancera.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté des autres prompts.
