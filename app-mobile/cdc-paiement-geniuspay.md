# Cahier des charges : Paiement Mobile Money via GeniusPay (Module 4, lot B)

> Rédigé le 2026-09-29. **Développé le même jour** (Yannick : "je veux juste intégrer le paiement", recommandations D1 à D4 retenues) : étapes 1 et 2 du découpage (abonnements + dons), vérifiées (typage, `expo-doctor` 18/18, export web) et publiées sur le lien de test. Les rappels de renouvellement et la page paiements du back-office (étape 3) restent à faire. **Actif après les étapes de `guide-paiement-geniuspay.md`** (script SQL, fonction `geniuspay`, clés dans Supabase). Non testé avec un vrai paiement.
> Suite de `cdc-acces-gratuit-abonnement.md` : le lot A a posé la table `subscriptions` (écriture serveur seulement) ; ce lot la remplit par un vrai paiement.

## 1. Ce que veut Yannick

Encaisser de vrais paiements Mobile Money (MTN MoMo, Orange Money Cameroun) dans l'app AFROBACK via **GeniusPay**, et que le paiement **débloque l'abonnement automatiquement**, sans action manuelle.

## 2. LinkPay ou API : pourquoi l'API

| | LinkPay (liens de paiement du tableau de bord) | API Marchand (checkout) |
|---|---|---|
| Devise | **FCFA XOF uniquement** (Afrique de l'Ouest) | **XAF accepté** (Cameroun) |
| Savoir **qui** a payé | Non : le lien ne transporte pas l'identifiant du compte AFROBACK | Oui : `metadata` (compte, forfait) renvoyé tel quel dans la confirmation |
| Débloquer l'abonnement tout seul | Non, rapprochement manuel | Oui, via le webhook |
| Usage conseillé | Ventes ponctuelles hors app (WhatsApp, Facebook) | **Paiements dans l'app** |

LinkPay reste utile en dehors de l'app (ex. vendre une formation Madou Consulting par WhatsApp), mais pas pour les abonnements.

## 3. Ce que voit la personne

1. Écran **Forfaits** (existant) : Racines 1 500 FCFA/mois ou Héritage 3 000 FCFA/mois, mensuel ou annuel.
2. **Payer** : l'app ouvre la **page de paiement sécurisée GeniusPay** (dans le navigateur intégré). La personne choisit MTN ou Orange, saisit son numéro, valide sur son téléphone (code USSD / notification de l'opérateur).
3. Retour automatique dans l'app, écran **"Paiement en cours de confirmation…"** (quelques secondes), puis **"Bienvenue dans Racines !"** : tout est débloqué.
4. Échec ou annulation : message clair ("Paiement non abouti, aucun montant débité") + "Réessayer".
5. Écran **Mon abonnement** (existant) : forfait, date de fin, historique des paiements, bouton "Renouveler".
6. **Don** (écrans `don/` existants) : même page de paiement, montant libre (minimum 200 FCFA), merci + reçu par email.

## 4. Fonctionnement technique

```
App ──(1) "je veux Racines mensuel"──▶ Edge Function creer-paiement ──▶ API GeniusPay
                                        (clé secrète, prix calculé côté serveur)
App ◀──(2) checkout_url ───────────────┘
Client paie sur la page GeniusPay
GeniusPay ──(3) webhook payment.success──▶ Edge Function webhook-geniuspay
                                           vérifie la signature HMAC
                                           + revérifie le statut auprès de GeniusPay
                                           → crée/prolonge l'abonnement
App ──(4) relit mon_abonnement() ──▶ débloqué
```

- **Clés GeniusPay uniquement côté serveur** (secrets Supabase `GENIUSPAY_API_KEY`, `GENIUSPAY_API_SECRET`, `GENIUSPAY_WEBHOOK_SECRET`). Jamais dans l'app, jamais transmises à Jarvis : Yannick les colle lui-même dans Supabase.
- **Le prix est calculé par le serveur** à partir du forfait demandé : l'app ne peut pas envoyer "Racines pour 1 FCFA".
- **Devise envoyée explicitement : XOF.** L'API refuse XAF (« validation.in », constaté au premier test le 2026-09-29) ; XOF et XAF ont la même valeur (655,957 pour 1 euro), le montant est donc identique. (Piège connu de l'API : une autre devise est convertie sans prévenir.)
- **Nouvelle table `paiements`** : référence GeniusPay, compte, type (abonnement/don), forfait, période, montant, frais, statut, dates. Lecture par le titulaire seulement, écriture serveur seulement.
- **Abonnement** : un paiement réussi ajoute 1 mois (ou 12) à la date de fin ; s'il reste des jours, ils sont conservés. Un même paiement ne peut créditer qu'une fois (la référence est unique), même si GeniusPay envoie le webhook deux fois.
- **Sans renouvellement automatique** dans ce lot : rappel dans l'app et par email 3 jours avant la fin, bouton "Renouveler".
- **Back-office** : page Abonnements enrichie de la liste des paiements (montant, frais, statut) et du total encaissé du mois.
- **Environnement de test (sandbox)** d'abord, avec les clés `pk_sandbox_…`, puis bascule en réel en changeant seulement les secrets.

## 5. Frais à connaître

GeniusPay annonce **1 % + 100 FCFA par transaction** : sur 1 500 FCFA, environ 115 FCFA de frais (7,7 %) ; sur 3 000 FCFA, environ 130 FCFA (4,3 %) ; sur l'annuel Racines (14 940 FCFA), environ 250 FCFA (1,7 %). **L'annuel est bien plus rentable pour toi** : à mettre en avant.

## 6. Prérequis (côté Yannick, avant le développement)

1. Compte marchand GeniusPay actif (profil **Startup** suffit au début) et accès aux **clés sandbox**.
2. **Vérifier dans le tableau de bord que MTN et Orange Cameroun (XAF) sont activés** sur ton compte : GeniusPay est une société ivoirienne, le Cameroun passe par leur partenaire PawaPay. C'est le point le plus risqué ; à confirmer avec leur support si ce n'est pas visible.
3. Compte de retrait (où arrive l'argent) configuré.

## 7. Découpage

1. Script SQL `paiements` + Edge Functions `creer-paiement` et `webhook-geniuspay` + écrans Forfaits/Paiement/Confirmation branchés (sandbox).
2. Dons.
3. Rappels de renouvellement + back-office paiements.
4. Bascule en réel après un vrai paiement test de 200 FCFA.
5. Plus tard (non inclus) : Marché (achats entre membres, reversement aux vendeurs = autre chantier), renouvellement automatique (API Abonnements GeniusPay, documentée en XOF seulement à ce jour).

## 8. Limites

- Je ne peux pas tester moi-même un vrai paiement : le test final se fait avec ton téléphone.
- Pas de nom de domaine : la page de retour après paiement sera `afroback-test.vercel.app` pendant les tests.
- Stores Apple/Google : pour une app publiée sur l'App Store, Apple impose en principe son propre système de paiement pour les contenus numériques. Sur Android et sur le web, Mobile Money est possible. À trancher avant la publication sur les stores, pas maintenant.

## 9. Décisions à valider

| # | Question | Recommandation |
|---|---|---|
| D1 | Périmètre de ce lot : abonnements + dons (Marché plus tard) ? | Oui. |
| D2 | Renouvellement : paiement manuel chaque mois avec rappel, ou prélèvement automatique ? | Manuel avec rappel (le prélèvement auto GeniusPay n'est documenté qu'en XOF). |
| D3 | Page de paiement : celle de GeniusPay (le client choisit MTN/Orange là-bas) ou choix de l'opérateur dans l'app ? | Page GeniusPay : plus rapide, plus sûre, rien à maintenir. |
| D4 | Garder l'offre annuelle (−17 %) ? | Oui, et la mettre en avant (frais bien plus faibles). |

## 10. Changement de prestataire : CinetPay (2026-09-29)

Premiers tests réels avec GeniusPay : carte bancaire seulement au départ, puis Orange Money Cameroun activé (`ORANGE_CMR`) mais **aucune demande de confirmation reçue sur le téléphone**. Décision de Yannick : passer à **CinetPay**.

- Nouvelle API CinetPay v1 (2026) : clé API + mot de passe API → jeton ; `sk_test_` → `https://api.cinetpay.net`, `sk_live_` → `https://api.cinetpay.co`. L'ancienne API checkout v2 (`api-checkout.cinetpay.com`) n'existe plus (domaine introuvable).
- Fonction serveur `cinetpay` (remplace `geniuspay`) : mêmes actions (`creer`, `verifier`, `verifier_en_attente`) + notification CinetPay (`notify_url`, identifiée par `merchant_transaction_id` = identifiant du paiement AFROBACK). Statut toujours relu chez CinetPay (`GET /v1/payment/{id}`) avant de créditer.
- Devise XAF par défaut (secret `CINETPAY_CURRENCY` pour la changer), montants multiples de 5.
- Aucun changement de la base (`schema-paiement-geniuspay.sql`) ni des écrans ; module app renommé `src/payments/paiement.ts`.
- Mise en service : `guide-paiement-cinetpay.md`.

## 11. Prestataire final : Campay (2026-09-29)

CinetPay n'encaisse en pratique qu'en Afrique de l'Ouest pour le compte de Yannick : abandonné avant mise en service. Décision : **Campay**, prestataire camerounais (MTN et Orange Cameroun natifs, XAF).

- Fonction serveur `campay` (remplace `geniuspay` et `cinetpay`) : lien de paiement Campay (`/get_payment_link/`, `payment_options: MOMO`), statut relu par `/transaction/{reference}/` (PENDING / SUCCESSFUL / FAILED) avant tout crédit, `external_reference` = identifiant du paiement AFROBACK.
- Authentification par jeton permanent (`CAMPAY_TOKEN`), environnement choisi par `CAMPAY_ENV` (`demo` → demo.campay.net, `live` → www.campay.net).
- En demo, `CAMPAY_MONTANT_TEST` permet d'envoyer un petit montant (l'environnement demo plafonne les montants) ; le crédit reste celui du forfait.
- Callback Campay (GET ou POST) sur la même fonction, statut toujours revérifié auprès de Campay.
- Pas de carte bancaire (Campay = Mobile Money) : la diaspora ne peut pas encore payer. À traiter plus tard si besoin (Campay propose une option carte à activer, ou second prestataire).
- Mise en service : `guide-paiement-campay.md`.

## 12. Retour sur GeniusPay (2026-09-29)

Décision finale de Yannick, le même jour : rester sur **GeniusPay** (le premier intégrateur, déjà en place avec clés live et webhook Production). L'app appelle de nouveau la fonction `geniuspay` ; les fonctions `cinetpay` et `campay` sont conservées dans le dépôt, non utilisées, en solution de repli. Mise en service : `guide-paiement-geniuspay.md` (fait).

Point ouvert : Orange Money Cameroun (`ORANGE_CMR`) est proposé sur la page GeniusPay, mais la demande de confirmation n'est jamais arrivée sur le téléphone de Yannick (référence MTX-3OWDUZ9RV0). À faire : validation manuelle par #150*50#, vérification du numéro saisi, et ticket au support GeniusPay avec la référence.

## 13. Décision finale : Campay (2026-09-29)

Yannick a créé son application Campay (mode test) et retient **Campay** (§11). L'app appelle la fonction `campay` ; `geniuspay` et `cinetpay` restent dans le dépôt en solution de repli. Mise en service : `guide-paiement-campay.md`.
