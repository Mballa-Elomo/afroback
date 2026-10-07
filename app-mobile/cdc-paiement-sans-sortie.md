# Cahier des charges : abonnement payé sans quitter l'app ni le site, annulation et résiliation

> Rédigé le 2026-10-07. **Validé par Yannick le 2026-10-07** (il a confié les décisions à Jarvis : recommandations D1 à D6 retenues). Développé le même jour (app : `src/payments/PaymentSheet.tsx`, `RenewBanner.tsx`, écrans Abonnement, inscription, dons ; site : `components/PaymentSheet.tsx`, `SubscriptionControls.tsx`, pages abonnement, don, compte, accueil ; serveur : actions `demander` / `annuler` de la fonction `campay`, `supabase/schema-paiement-sans-sortie.sql` testé sur une base locale). **Mise en service dans cet ordre : 1) script SQL, 2) fonction `campay` mise à jour dans Supabase, 3) republication de l'app et du site.** Paiement réel à tester par Yannick avec son téléphone.

## 1. Ce que veut Yannick

- Payer son abonnement (et ses dons) par Mobile Money via Campay **sans jamais sortir de l'application ni du site**.
- Pouvoir **annuler** : abandonner un paiement en cours, et **résilier** son abonnement.

Choix déjà faits par Yannick (2026-10-07) :
- **« Annuler » couvre les deux** : abandonner un paiement en cours ET résilier l'abonnement.
- **Résiliation sans remboursement** : l'abonnement reste actif jusqu'à la date de fin payée, puis s'arrête (comme Netflix ou Spotify).
- **Renouvellement : rappel + renouveler en 1 toucher** (pas d'envoi automatique de demande de paiement).

## 2. Ce qui existe aujourd'hui (vérifié dans le code)

- Fonction serveur Supabase `campay` (`mobile-app/supabase/functions/campay/index.ts`) : elle demande à Campay un **lien de paiement** (`/get_payment_link/`), puis l'app ouvre la **page Campay dans un navigateur** (app) ou **quitte le site** pour la page Campay (web). C'est la cause du problème.
- Le crédit de l'abonnement est déjà sûr : le statut est toujours relu chez Campay (`/transaction/{reference}/`) avant de créditer (`crediter_paiement`), et un rattrapage revérifie les paiements restés en attente. **Tout cela est conservé.**
- Aucune résiliation n'existe : l'abonnement n'a pas de bouton « Résilier ».

## 3. La solution : la demande de paiement directe de Campay

Campay propose une **demande de paiement directe** (`POST /collect/`) : le serveur envoie la demande au numéro MTN ou Orange de la personne, et c'est **son téléphone** qui lui demande de valider (avec son code secret Mobile Money). Aucune page externe : tout se passe dans AFROBACK.

La réponse de Campay donne l'opérateur et un code de secours à composer si la notification n'apparaît pas : `*126#` (MTN) ou `#150*50#` (Orange).

## 4. Ce que voit la personne

### 4.1 Payer (app et site, même parcours)

1. **Écran Abonnement** : elle choisit son forfait (Racines / Héritage) et la durée (1 mois / 12 mois), comme aujourd'hui.
2. **Feuille « Paiement Mobile Money »** qui s'ouvre par-dessus l'écran :
   - récapitulatif : « Héritage · 1 mois · 3 000 FCFA » ;
   - **numéro Mobile Money pré-rempli** avec le téléphone du compte, modifiable (format camerounais : 6XX XX XX XX) ;
   - le logo MTN ou Orange s'affiche tout seul selon le numéro saisi ;
   - bouton **« Payer 3 000 FCFA »**.
3. **Écran d'attente « Valide le paiement sur ton téléphone »** :
   - animation de téléphone, numéro masqué (« 6•• •• •• 45 · MTN ») ;
   - consigne : « Une demande de paiement vient d'être envoyée. Saisis ton code secret Mobile Money pour valider. » ;
   - « Rien reçu ? Compose **\*126#** » (ou **#150\*50#** pour Orange) ;
   - compte à rebours de 3 minutes ;
   - boutons **« Annuler »** et **« Changer de numéro »**.
4. **Paiement validé** → écran de succès sur place : « Bienvenue dans Héritage ! Actif jusqu'au 7 novembre 2026 », bouton « Commencer ». L'abonnement est actif immédiatement.
5. **Refusé, solde insuffisant ou délai dépassé** → message clair (« Paiement non validé. Vérifie ton solde puis réessaie. ») avec **« Réessayer »** et **« Changer de numéro »**.

### 4.2 Annuler un paiement en cours

- « Annuler » sur l'écran d'attente : le paiement est marqué **annulé**, on revient à l'écran Abonnement.
- **Limite honnête** : Campay ne permet pas de retirer une demande déjà arrivée sur le téléphone. Si la personne la valide quand même après avoir annulé, **le paiement est crédité normalement** : elle ne perd jamais son argent. Le message le précise.

### 4.3 Résilier l'abonnement

- Sur l'écran Abonnement et dans le Profil (ligne « Mon abonnement ») : bouton **« Résilier mon abonnement »**.
- Confirmation : « Ton abonnement Héritage reste actif jusqu'au 7 novembre 2026. Ensuite, tu repasseras en Découverte (gratuit). Aucun remboursement pour la période en cours. » → **« Confirmer la résiliation »** / « Garder mon abonnement ».
- Après résiliation : « Héritage · Résilié · actif jusqu'au 7 novembre 2026 » et un bouton **« Reprendre mon abonnement »** (annule la résiliation, sans payer, tant que la date de fin n'est pas passée).

### 4.4 Renouveler

- **Bandeau dans l'app et sur le site, 3 jours avant la fin** (accueil et profil) : « Ton abonnement Héritage se termine le 7 novembre · **Renouveler** ». Pas de bandeau si l'abonnement a été résilié.
- « Renouveler » ouvre directement la feuille de paiement (numéro déjà rempli) : **un toucher pour payer**. Les jours restants sont conservés (règle actuelle).

### 4.5 Dons

Même parcours de paiement sans sortie pour les dons (app et site), pour que tout AFROBACK paie de la même façon.

## 5. Fonctionnement technique

### 5.1 Fonction serveur `campay` (nouvelles actions)

- `demander` : vérifie le numéro (format 2376XXXXXXXX, opérateur MTN ou Orange), **calcule le montant côté serveur** (jamais celui envoyé par l'app), enregistre le paiement, appelle Campay `POST /collect/` (`amount`, `currency: XAF`, `from`, `description`, `external_reference` = identifiant du paiement AFROBACK), renvoie l'identifiant, l'opérateur et le code USSD.
- `verifier` (existe déjà) : relit le statut chez Campay et crédite si réussi. Appelée toutes les 3 secondes par l'écran d'attente.
- `annuler` : marque le paiement en attente comme annulé (le rattrapage le créditera quand même s'il est validé plus tard).
- **Protection** : une seule demande en attente à la fois par compte ; 5 demandes maximum par heure ; le numéro de téléphone n'est stocké que masqué dans les journaux.
- La notification Campay (callback) et le rattrapage existants sont conservés tels quels.

### 5.2 Base de données (un script SQL, à exécuter par Yannick)

- `subscriptions` : nouvelle colonne `resilie_le` (date de résiliation). L'accès reste calculé comme aujourd'hui (actif jusqu'à `ends_at`) : la résiliation ne coupe rien avant la date de fin.
- Fonctions `resilier_abonnement()` et `reprendre_abonnement()` (pour la personne connectée, sur son propre abonnement uniquement).
- `mon_abonnement()` renvoie en plus `resilie_le`, pour l'affichage et le bandeau de renouvellement.
- `paiements` : colonnes `telephone_masque` et `operateur` (affichage de l'historique).

### 5.3 App mobile et site

- Nouveau composant **feuille de paiement + écran d'attente**, partagé par l'abonnement, l'onboarding (choix du forfait) et les dons.
- L'ouverture du navigateur Campay est **supprimée** (app) et la redirection vers Campay aussi (site).
- Bouton Résilier / Reprendre, bandeau de renouvellement, textes FR/EN.

## 6. Ce qu'il faut savoir avant de lancer

- **Environnement de test Campay (demo)** : les montants sont plafonnés (le réglage `CAMPAY_MONTANT_TEST` existant reste utilisé) et il faut un **vrai numéro MTN ou Orange** pour valider la demande. Je ne peux pas tester la validation à ta place : le test final se fait avec ton téléphone.
- **Rien à changer côté Campay** : la même clé et le même callback servent.
- Si la notification ne s'affiche pas sur certains téléphones, le code USSD de secours permet toujours de payer.

## 7. Découpage

1. Serveur : nouvelles actions de la fonction `campay` + script SQL (résiliation, colonnes).
2. App : feuille de paiement, écran d'attente, résiliation, bandeau de renouvellement, dons, onboarding.
3. Site : les mêmes éléments, même design.
4. Contrôles : typage et build des deux projets, tests des cas d'erreur sur l'environnement demo ; **test réel de paiement par Yannick** avec son téléphone ; redéploiement.

## 8. Décisions à valider

| # | Question | Recommandation |
|---|---|---|
| D1 | Numéro pré-rempli avec le téléphone du compte, modifiable à chaque paiement ? | **Oui.** |
| D2 | Délai d'attente de la validation avant de proposer « Réessayer » | **3 minutes.** |
| D3 | Paiement annulé puis validé quand même sur le téléphone | **Crédité normalement** (la personne ne perd jamais son argent). |
| D4 | « Reprendre mon abonnement » après une résiliation, sans repayer, tant que la date de fin n'est pas passée | **Oui.** |
| D5 | Appliquer le même parcours aux dons et au choix du forfait de l'inscription | **Oui**, une seule façon de payer dans tout AFROBACK. |
| D6 | Rappel de renouvellement : bandeau dans l'app et sur le site 3 jours avant (pas d'email ni de SMS pour l'instant) | **Oui.** L'email de rappel pourra être ajouté plus tard. |
