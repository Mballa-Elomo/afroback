# Prompt pour Claude Design — Module Marketplace AFROBACK (web + mobile)

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.
>
> Ce script détaille **le pilier Marketplace** (module 5) ET **l'Espace Vendeur/Artisan** (module 11) du script produit complet (`prompt-claude-design-produit.md`), qui ne les décrivaient jusqu'ici qu'en quelques lignes chacun. C'est le module le plus complexe d'AFROBACK : c'est un vrai e-commerce à deux faces (acheteurs et vendeurs), pas juste un catalogue. Garde la même identité visuelle que les autres prompts AFROBACK (noir profond `#0F0B08`, dégradé or/bronze `#F0C36B` → `#8B5A2B`, terracotta `#A0522D`/`#8B3A2F`, motifs bogolan/kente/wax en filigrane, typographie display + sans-serif).

---

Conçois le module complet **Marketplace** d'AFROBACK, en version web responsive ET app mobile. C'est l'espace où les utilisateurs achètent des produits africains authentiques (masques, tissus wax, bijoux, sculptures, objets de décoration) directement auprès d'artisans/vendeurs, avec le même ADN storytelling qu'ailleurs sur AFROBACK : chaque produit raconte une histoire et un artisan, ce n'est jamais une fiche e-commerce anonyme.

## Rappel du contexte produit

- La Marketplace cohabite avec le pilier Découverte (`prompt-claude-design-decouverte.md`) : une fiche produit peut renvoyer vers la fiche Artisanat & savoir-faire ou la fiche Peuple/Village correspondante, pour ancrer le produit dans son contexte culturel
- **Deux profils utilisent ce module** : le grand public en tant qu'acheteur (tout le monde), et le vendeur/artisan qui active un « espace vendeur » en plus de son usage normal de l'app (comme un compte Etsy/Vinted)
- **L'abonnement vendeur est indépendant de l'abonnement grand public/famille** : un utilisateur peut avoir les deux en parallèle (ex. un abonné Racines qui est aussi vendeur Premium)
- **Tarification vendeur déjà définie** (à réutiliser telle quelle, ne pas la redéfinir) : Gratuit (0 FCFA, 2 articles max, commission 30%), Standard (2 000 FCFA/mois ou 20 000 FCFA/an, articles illimités, commission 5%), Premium (5 000 FCFA/mois ou 50 000 FCFA/an, articles illimités, commission 3%, mise en avant catalogue, outils de publicité interne). Détail complet dans `prompt-claude-design-onboarding.md`
- **Paiement Mobile Money en priorité** (Orange Money, MTN MoMo), carte bancaire en option secondaire — cohérent avec le reste du produit

## Contenu d'exemple à utiliser

Produits crédibles et incarnés, pas de lorem ipsum : masques dogons, tissus wax, bijoux en bronze/laiton, sculptures sur bois, paniers tissés, poteries, bijoux en perles, tenues traditionnelles (boubou, kente). Artisans avec un vrai profil : nom, région (ex. artisan tisserand du Ghana pour le kente, sculpteur camerounais pour les statuettes bamoun).

---

## Côté acheteur

### 1. Hub Marketplace (accueil du module)

- Bandeau de catégories (masques & sculptures, tissus & mode, bijoux, décoration & artisanat, autres)
- Mise en avant : nouveautés, tendances, sélection éditoriale (« coups de cœur AFROBACK »)
- Barre de recherche et filtres globaux : catégorie, région d'origine, fourchette de prix, artisan/créateur, note moyenne

### 2. Catalogue produits

- Grille (web) / liste-carte (mobile) : photo, titre, prix, région d'origine, note moyenne, badge vendeur (vérifié/premium) si applicable
- Filtres détaillés : catégorie, région, prix, artisan, disponibilité (en stock / rupture), tri (pertinence, prix croissant/décroissant, nouveautés, meilleures notes)

### 3. Fiche produit

- Galerie photo (plusieurs angles, zoom), et vidéo si le vendeur en a fourni une
- Description, **histoire/origine du produit** (technique, symbolique, contexte culturel — lien vers la fiche Artisanat du module Découverte si elle existe)
- Prix, variantes si applicable (taille, couleur), quantité disponible
- Avis clients : note globale + liste d'avis (texte, note, photo optionnelle du client)
- Produits similaires / du même artisan
- Actions : ajouter aux favoris, ajouter au panier, acheter maintenant

### 4. Fiche artisan/créateur

- Mini-profil : photo, région, savoir-faire, badge vendeur (vérifié/premium)
- Note moyenne et nombre d'avis cumulés
- Ses autres produits en vente
- Lien croisé vers sa fiche Artisanat & savoir-faire dans le module Découverte, si elle existe (cohérence storytelling)

### 5. Panier

- Liste des articles (photo, titre, prix, quantité modifiable, retrait)
- Sous-total, frais de livraison estimés, code promo (champ optionnel)
- Bouton vers le tunnel de paiement

### 6. Tunnel de paiement

- Adresse de livraison (formulaire)
- Choix du mode de paiement : **Mobile Money en premier** (Orange Money, MTN MoMo), carte bancaire en option secondaire
- Récapitulatif complet avant validation (pas de paiement en un clic sans récap)
- Écran de confirmation de commande
- État d'erreur (paiement refusé, stock épuisé entre-temps)

### 7. Suivi de commande

- Historique des commandes (liste avec statut : en préparation, expédiée, livrée, annulée)
- Détail d'une commande : articles, montant, adresse, statut de livraison, contact du vendeur
- Action « Signaler un problème » (voir écran retours ci-dessous)

### 8. Avis & notation

- Écran post-réception : notation par étoiles + commentaire texte + photo optionnelle
- Rappel/notification quand une commande livrée n'a pas encore été notée

### 9. Retours & réclamations

- Formulaire de signalement (produit non conforme, non reçu, endommagé), avec upload photo
- Suivi du statut de la réclamation (ouverte, en traitement, résolue)

### 10. Favoris / liste de souhaits

- Grille des produits sauvegardés, avec alerte simple si le produit repasse en rupture/disponible

---

## Côté vendeur / artisan (Espace Vendeur)

Activable depuis le profil adulte grand public (« Devenir vendeur sur AFROBACK »), avec sa propre navigation le temps qu'il est actif (Tableau de bord, Produits, Commandes, Avis, Revenus).

### 11. Écran d'activation

- Présentation du fonctionnement de la Marketplace côté vendeur
- Choix d'un forfait parmi les 3 paliers (Gratuit/Standard/Premium, tarifs rappelés plus haut)
- Formulaire de profil artisan : nom, région, savoir-faire, photo/bio (alimente la fiche artisan vue côté acheteur)
- Coordonnées de paiement (Mobile Money ou compte bancaire pour recevoir les versements)

### 12. Tableau de bord vendeur

- Ventes du mois, commandes en attente, produits en ligne, produits en rupture
- Aperçu simple de performance (ex. graphique des ventes des 30 derniers jours)
- Raccourcis vers les tâches en attente (commande à expédier, avis à traiter)

### 13. Gestion des produits

- Liste de mes produits (statut : en ligne, brouillon, rupture)
- Ajout/édition d'un produit : photos multiples, description, histoire/origine, prix, stock, catégorie, variantes
- Compteur d'articles restants si forfait Gratuit (limite 2 articles), avec incitation claire à upgrader

### 14. Gestion des commandes

- Liste des commandes reçues, filtrable par statut
- Détail d'une commande, action « Marquer comme expédiée » (avec numéro de suivi optionnel)
- Vue des réclamations en cours sur ses commandes

### 15. Avis reçus

- Liste des avis clients sur ses produits, note moyenne globale
- Possibilité de répondre publiquement à un avis

### 16. Revenus & paiements

- Historique des versements, solde en attente
- Détail des commissions prélevées par vente (transparence sur le taux appliqué selon le forfait actif)
- Coordonnées de paiement enregistrées

### 17. Changement de forfait

- Écran d'upgrade/downgrade en cours d'abonnement, avec explication claire de l'impact sur la commission et les limites (ex. passage de Gratuit à Standard : plus de limite d'articles, commission 30% → 5%)

### 18. Outils de publicité interne (réservé au forfait Premium)

- Mise en avant d'un produit dans le catalogue (rotation prioritaire)
- Statistiques simples de vues générées par la mise en avant

---

## Composants transverses spécifiques à ce module

- Carte produit (grille/liste), avec variante « avec badge vendeur » et variante « rupture de stock »
- Système de notation par étoiles, réutilisé sur fiche produit, fiche artisan et écran d'avis
- Badge vendeur (« Vendeur vérifié » / « Vendeur premium »), cohérent avec celui déjà prévu dans le script produit complet
- Badge « Nouveau » / « Rupture de stock » / « Coup de cœur AFROBACK »
- Bandeau de transparence commission (dans le tableau de bord vendeur)
- Modales de confirmation (validation de commande, changement de forfait, suppression d'un produit)
- États vides, de chargement et d'erreur, cohérents avec les composants transverses du script produit complet

## Exigences transverses

- Chaque écran en variante web (grille large, panneau de filtres latéral) et mobile (liste/carte empilée, filtres en feuille remontante)
- Paiement et coordonnées bancaires toujours traités sur des écrans sobres et rassurants (moins d'ornementation que les écrans de contenu, cohérence avec le reste du produit)
- Cohérence stricte des composants avec le reste du produit (boutons, badges, cartes) telle que définie dans le script produit complet
- Contenu d'exemple incarné (vrais types de produits, vrais profils d'artisans) plutôt que du texte générique

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- **Ce script remplace les sections « 5. Marketplace » et « 11. Espace Vendeur / Artisan » de `prompt-claude-design-produit.md`.** Je peux mettre à jour ce fichier pour qu'il pointe vers celui-ci, comme ça a été fait pour Découverte — dis-moi si tu veux que je le fasse maintenant.
- **Trois décisions produit ne sont pas encore tranchées et j'ai dû faire des hypothèses pour que la maquette tienne debout** — à valider avant tout développement réel :
  1. **Livraison** : ce script suppose une livraison classique avec adresse et suivi, sans préciser qui gère la logistique (le vendeur lui-même, ou une solution de livraison intégrée à AFROBACK) ni si la V1 se limite au Cameroun ou s'ouvre à la diaspora à l'international. Ça change beaucoup l'écran de paiement (frais de port, délais, devise).
  2. **Retours/réclamations** : j'ai supposé un système de signalement avec suivi de statut, mais la politique réelle (qui décide, qui rembourse, délai) n'est pas définie.
  3. **Devise** : tout est pensé en FCFA comme le reste du produit ; si tu vises aussi la diaspora à terme, la question d'une devise secondaire (EUR/USD) se posera.
- Comme rappelé dans `context/AFROBACK.md`, **le modèle économique Marketplace n'est pas encore validé** : cette maquette matérialise une hypothèse concrète de fonctionnement, pas un engagement définitif.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté des autres prompts.
