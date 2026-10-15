# AFROBACK — Back-office : module Paiements & revenus (spécification)

> Rédigé le 2026-10-15 à la demande de Yannick (« on continue avec le back-office », choix : Paiements & revenus).
> Même exigence que les modules Paramètres et Utilisateurs : chaque chiffre est réel, chaque bouton a un effet réel, rien n'est inventé.

---

## 1. Objectifs

1. **Savoir combien AFROBACK encaisse vraiment** : chiffre d'affaires, abonnements payants actifs, revenu mensuel récurrent, dons.
2. **Voir chaque transaction Mobile Money** (réussie, échouée, en attente, annulée) et comprendre un échec sans ouvrir Supabase ni Campay.
3. **Régler un litige en 1 minute** : « j'ai payé mais je n'ai pas accès » → revérifier auprès de Campay, et si besoin offrir l'accès.
4. **Ne jamais confondre test et argent réel** : les paiements du mode démo de Campay sont séparés et signalés.

## 2. Constat au 2026-10-15 (données réelles)

- 13 paiements, **tous en mode démo** (`environnement = demo`) : aucun argent réel n'a encore transité. Le secret `CAMPAY_ENV` de la fonction `campay` est toujours sur `demo`.
- 4 réussis, 7 échoués, 2 restés « en attente » depuis le 30/09.
- 2 abonnements payants actifs (Racines), issus de paiements démo.

## 3. Écran : `/paiements` (menu « Paiements & revenus »)

Bandeau permanent **« Mode démo »** (orange) tant que le dernier paiement enregistré est en démo : « Les paiements actuels sont des tests Campay : aucun argent réel. Passez le secret CAMPAY_ENV à live pour encaisser. »

Sélecteur **Réel / Démo / Tout** en haut : par défaut « Réel » ; s'il n'existe aucun paiement réel, l'écran bascule seul sur « Démo » et le dit.

### 3.1 Onglet Aperçu
- Chiffres clés : encaissé ce mois · mois précédent (évolution en %) · total encaissé · revenu mensuel récurrent estimé (abonnements payants actifs : mensuel = prix payé, annuel = prix / 12) · abonnés payants actifs · taux de réussite des paiements (30 j) · panier moyen.
- Graphique : encaissements par jour sur 30 jours.
- Répartitions : par opérateur (MTN / Orange), par type (abonnements / dons), par forfait (Racines / Héritage, mensuel / annuel).
- Points d'attention : paiements en attente depuis plus de 30 minutes, échecs répétés d'un même compte (3 et plus en 24 h), abonnements payants qui se terminent dans les 7 jours.

### 3.2 Onglet Transactions
- Tableau : date, compte (lien vers la fiche Utilisateur, ou « compte supprimé »), type et forfait, montant, opérateur, numéro masqué, statut, référence.
- Recherche : e-mail, référence, numéro masqué. Filtres : statut, type, opérateur, période (7 j, 30 j, 90 j, tout). Export CSV (journalisé).
- **Fiche d'une transaction** (panneau latéral) : tous les champs, chronologie (créé, confirmé), abonnement crédité s'il existe, et actions :
  - **Revérifier auprès de Campay** : la fonction `campay` relit le vrai statut chez Campay (jamais celui donné par le back-office) et crédite l'abonnement si le paiement est réussi.
  - **Offrir l'accès correspondant** (si le paiement est réussi chez l'opérateur mais rien n'a été crédité) : même forfait, 30 ou 365 jours selon la période, via `offrir_abonnement`, note « Litige paiement <référence> ».
  - Aucune action ne modifie un montant ni ne marque un paiement « réussi » à la main.

### 3.3 Onglet Abonnements (remplace l'ancien écran Abonnements)
- Liste des abonnements : compte, forfait, origine (paiement, offert, test), début, fin, résilié le, statut (actif, résilié mais actif jusqu'à la fin, terminé, retiré).
- Filtres : actifs, payants, offerts, résiliés, se terminant sous 7 jours.
- Actions existantes conservées : offrir un abonnement, retirer un abonnement, contenus gratuits.

### 3.4 Onglet Dons
- Total des dons, nombre de donateurs, don moyen, liste (date, donateur ou « Anonyme » si le donateur l'a demandé, montant, statut).

## 4. Règles

- Lecture et actions côté serveur uniquement (clé service_role), administrateur revérifié à chaque action.
- Le statut d'un paiement ne change que par la fonction `campay` (qui interroge Campay). Le back-office ne peut que demander une revérification.
- Chaque action (revérification, offre liée à un litige, export) est inscrite au journal d'activité.
- Les montants affichés sont ceux enregistrés (FCFA) ; les frais Campay ne sont pas déduits (non communiqués par Campay à ce jour).
- Un don marqué « anonyme » par le donateur n'affiche pas son identité dans la liste des dons (la fiche transaction la montre, pour le support).

## 5. Architecture

- `lib/paiements.ts` : lecture et calculs (aperçu, transactions, abonnements, dons).
- `app/(admin)/paiements/page.tsx` + `PaiementsModule.tsx` + `actions.ts` + `paiements.module.css`.
- `/abonnements` redirige vers `/paiements?onglet=abonnements` ; menu : « Paiements & revenus » et « Dons » (onglet Dons) activés.
- Aucune modification de base ni de la fonction `campay` nécessaire.

## 6. Limites

- Tant que Campay est en démo, tous les chiffres « réels » sont à zéro.
- Pas de remboursement depuis le back-office : Campay ne propose pas d'API de remboursement dans l'intégration actuelle ; un remboursement se fait depuis le tableau de bord Campay.

## 7. Critères d'acceptation

1. Les totaux de l'aperçu correspondent à la somme des paiements réussis de la période et de l'environnement choisis.
2. Le bandeau démo s'affiche aujourd'hui, et disparaît quand un paiement live est enregistré.
3. « Revérifier » sur un paiement en attente met à jour son statut selon Campay.
4. L'ancien écran Abonnements est entièrement disponible dans l'onglet Abonnements.

---

## 8. État d'implémentation (2026-10-15)

- Développé et en ligne : `/paiements` (Aperçu, Transactions, Abonnements, Dons), fiche transaction avec « Revérifier auprès de Campay » et « Offrir l'accès correspondant » (réservé aux paiements réussis ou en attente, non crédités), export CSV journalisé, bandeau démo, sélecteur Réel / Démo / Tout.
- `/abonnements` redirige vers l'onglet Abonnements ; menu « Paiements & revenus » et « Dons » activés.
- Rendu vérifié sur les vraies données (13 paiements démo). La revérification Campay n'a pas été déclenchée pendant les tests (elle peut créditer un abonnement) : à essayer par Yannick sur un paiement en attente.
