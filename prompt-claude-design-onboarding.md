# Prompt pour Claude Design — Onboarding & tarification AFROBACK (web + mobile)

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.
>
> Ce script détaille **uniquement le parcours d'onboarding et les écrans de tarification** du produit AFROBACK. Il remplace et détaille la section « Onboarding & compte » (module 1) du script produit complet (`prompt-claude-design-produit.md`), en y ajoutant toute la logique de tarification par profil demandée par Yannick. Garde la même identité visuelle que les deux autres prompts AFROBACK (noir profond `#0F0B08`, dégradé or/bronze `#F0C36B` → `#8B5A2B`, terracotta `#A0522D`/`#8B3A2F`, motifs bogolan/kente/wax en filigrane, typographie display + sans-serif).

---

Conçois le parcours complet d'onboarding de **AFROBACK**, de l'ouverture de l'app jusqu'à l'arrivée sur l'accueil, en version web responsive ET app mobile. Ce parcours doit gérer un point clé : **la tarification n'est pas unique, elle dépend du profil et de l'usage de la personne** (grand public, parent avec un ou plusieurs enfants rattachés, vendeur/artisan).

## Rappel du contexte produit

AFROBACK a 4 profils (voir script produit complet) : grand public, enfant (profil rattaché, jamais géré ici), parent, vendeur. **Un même utilisateur peut cumuler plusieurs rôles** : par exemple un parent de 2 enfants qui est aussi vendeur sur la Marketplace. L'onboarding doit donc être pensé comme un parcours à embranchements, pas une suite linéaire unique.

## Déroulé du parcours

### 1. Démarrage
- Splash / logo animé (mobile)
- Carrousel d'introduction (2-3 écrans présentant les piliers)
- Choix de la langue d'interface (FR/EN + 4 langues camerounaises marquées « traduction en cours »)
- Inscription (email, prénom, mot de passe, ou réseau social) / Connexion / mot de passe oublié

### 2. Écran « Comment allez-vous utiliser AFROBACK ? »
Étape clé, juste après l'inscription. Choix **à cases multiples** (pas un choix exclusif), avec un visuel dédié par option :
- **« Découvrir, apprendre et faire vivre mes racines »** (coché par défaut, correspond à l'usage grand public)
- **« Créer des profils pour mes enfants »** → déclenche l'étape 3
- **« Vendre mes créations sur la Marketplace »** → déclenche l'étape 5
- Lien discret « Je ne sais pas encore, j'explore d'abord » qui saute directement à l'accueil en forfait gratuit, sans forcer de choix

### 3. Si « enfants » coché : ajout des profils enfants
- Écran répétable : prénom, âge, avatar, langues d'apprentissage à activer par enfant
- Bouton « Ajouter un autre enfant »
- Compteur visible en permanence : « X enfant(s) ajouté(s) », car ce nombre va directement influencer le prix affiché à l'étape suivante
- Bouton « Continuer » vers le choix de forfait, même avec un seul enfant

### 4. Forfait grand public / famille
Table de comparaison à 3 formules, avec bascule **mensuel / annuel** (l'annuel affiche un pourcentage d'économie par rapport au mensuel) :

| | **Découverte** (gratuit) | **Racines** | **Héritage** |
|---|---|---|---|
| Histoires & Héros | Accès limité (sélection du moment) | Accès complet | Accès complet + contenus exclusifs |
| Découverte du patrimoine | Accès complet | Accès complet | Accès complet + avant-première Visite virtuelle des musées |
| Apprentissage des langues | 1 langue au choix | Les 4 langues camerounaises | Les 4 langues + suivi de progression avancé |
| Réductions Marketplace | — | 5% | 10% |
| Communauté | Lecture seule | Publication + badge membre | Publication + badge premium + accès prioritaire aux nouveautés |
| Profils enfants inclus | 1 profil | Selon palier (voir tableau prix) | Selon palier (voir tableau prix) |

**Le prix de Racines et Héritage varie par palier selon le nombre d'enfants rattachés au compte**, affiché dynamiquement en fonction de ce qui a été saisi à l'étape 3 (ou modifiable directement depuis cet écran via un sélecteur « Nombre d'enfants ») :

| Enfants rattachés | Racines / mois | Racines / an | Héritage / mois | Héritage / an |
|---|---|---|---|---|
| 0-1 enfant | 1 500 FCFA | 15 000 FCFA | 3 000 FCFA | 30 000 FCFA |
| 2-3 enfants | 2 500 FCFA | 25 000 FCFA | 5 000 FCFA | 50 000 FCFA |
| 4 enfants et + | 3 500 FCFA | 35 000 FCFA | 7 000 FCFA | 70 000 FCFA |

*(Montants d'exemple, à considérer comme des placeholders réalistes pour la maquette — voir notes en bas de page.)*

Affiche clairement au-dessus du tableau de prix une phrase du type « Tarif calculé pour **[X] enfant(s)** rattaché(s) » avec un lien pour modifier ce nombre sans revenir en arrière.

Le forfait **Découverte** reste toujours à 0 FCFA quel que soit le nombre d'enfants : c'est le palier gratuit sans limite liée au nombre d'enfants, seulement aux fonctionnalités.

### 5. Si « vendeur » coché : forfait vendeur
Écran de tarification séparé (un abonnement vendeur est indépendant de l'abonnement grand public/famille — un utilisateur peut avoir les deux en parallèle) :

| | **Gratuit** | **Standard** | **Premium** |
|---|---|---|---|
| Articles en ligne | 2 articles maximum | Illimités | Illimités |
| Commission sur chaque vente | 30% | 5% | 3% |
| Mise en avant dans le catalogue | — | — | Incluse (rotation prioritaire) |
| Accès aux outils de publicité interne | — | — | Inclus |
| Badge vendeur | — | Vendeur vérifié | Vendeur premium |
| Prix | 0 FCFA | 2 000 FCFA/mois ou 20 000 FCFA/an | 5 000 FCFA/mois ou 50 000 FCFA/an |

Sous le tableau, une phrase courte qui justifie l'écart de commission auprès du vendeur : plus le forfait est élevé, plus AFROBACK prend une commission faible sur chaque vente, en échange d'un abonnement fixe. Ajoute un petit simulateur texte simple du type « Avec X ventes/mois à Y FCFA en moyenne, le forfait Standard devient rentable dès Z ventes » pour aider le vendeur à choisir (calcul illustratif, pas besoin d'un vrai moteur de calcul dans la maquette).

### 6. Paiement
- Récapitulatif des forfaits choisis (grand public/famille et/ou vendeur, s'ils ont été sélectionnés), avec le total si les deux sont payants
- Choix du moyen de paiement : **Mobile Money en premier** (Orange Money, MTN MoMo — cohérent avec le marché camerounais), puis carte bancaire en option secondaire
- Écran de confirmation de paiement, avec état d'erreur (paiement refusé) prévu
- Si seul le forfait gratuit a été choisi partout, cet écran est sauté entièrement

### 7. Bienvenue
- Écran de confirmation final avant l'arrivée sur l'app : résumé de ce qui a été configuré (forfait, enfants ajoutés, statut vendeur activé), avec les bons boutons de suite selon le parcours (« Aller à l'accueil », ou « Compléter mon profil vendeur » si vendeur a été choisi, cf. module Espace Vendeur du script produit complet)

## Exigences transverses

- Chaque écran de tarification doit avoir une variante web (tableau comparatif large, 3 colonnes côte à côte) et une variante mobile (cartes empilées ou carrousel swipable, une formule à la fois avec pastilles de navigation)
- Le changement du toggle mensuel/annuel et du sélecteur de nombre d'enfants doit être présenté comme si le prix se recalculait en direct (pas de rechargement d'écran)
- Garder la possibilité de tout passer en revue et modifier avant paiement (pas de paiement en un clic sans récapitulatif)
- Cohérence des composants avec le reste du produit (boutons, badges, cartes) telle que définie dans le script produit complet

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- **Tous les montants (FCFA) et les bornes de paliers enfants (0-1 / 2-3 / 4+) sont des placeholders réalistes pour que la maquette soit crédible**, pas des prix validés. Le modèle économique d'AFROBACK n'est toujours pas figé (`context/AFROBACK.md`) : à retravailler avec de vrais chiffres avant tout lancement.
- **Différenciation Racines/Héritage** : j'ai proposé une répartition des fonctionnalités raisonnable (réductions Marketplace, badge, accès prioritaire) faute de détail de ta part sur ce point précis — à ajuster librement, ce n'est qu'une base de travail pour Claude Design.
- **Commission vendeur Premium (3%)** : tu n'avais précisé que Gratuit (30%) et Standard (5%) ; j'ai proposé 3% pour Premium par cohérence (plus cher = commission encore plus basse), à valider ou remplacer.
- **Correction de cohérence avec le script produit complet** : j'ai mis à jour `prompt-claude-design-produit.md` (modules 6 et 11) pour qu'il pointe vers ce script détaillé au lieu de décrire une tarification à 2 paliers (l'ancienne version avait « Racines » comme palier gratuit — ce nom est repris ici mais comme palier payant intermédiaire, avec « Découverte » comme nouveau nom du palier gratuit).
- Une fois le rendu obtenu, dis-le-moi : je le récupère et le range dans `livrables/sites-web/afroback/`.
