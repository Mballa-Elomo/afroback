# Guide : paiement GeniusPay (prestataire retenu)

> Pour Yannick. **Tes clés GeniusPay ne passent jamais par Jarvis** : tu les colles uniquement dans Supabase.
>
> État au 2026-09-29 : **tout est en place** (script SQL, fonction `geniuspay`, clés live, webhook Production). Ce guide sert de mémo si tu dois refaire l'installation.

## Installation (déjà faite)

1. **SQL** : `mobile-app/supabase/schema-paiement-geniuspay.sql` exécuté dans le SQL Editor.
2. **Fonction** : Edge Functions → fonction `geniuspay` = contenu de `mobile-app/supabase/functions/geniuspay/index.ts`, **"Verify JWT" désactivé**.
3. **Secrets** (Edge Functions → Secrets) :

| Nom | Valeur |
|---|---|
| `GENIUSPAY_API_KEY` | `pk_live_…` (ou `pk_sandbox_…` pour tester) |
| `GENIUSPAY_API_SECRET` | `sk_live_…` (ou `sk_sandbox_…`) |
| `GENIUSPAY_WEBHOOK_SECRET` | `whsec_…` du webhook (facultatif) |

4. **Webhook** (tableau de bord GeniusPay → Webhooks) : URL `https://ygkyapryramhaskfbrrt.supabase.co/functions/v1/geniuspay`, environnement identique aux clés (Production pour `pk_live_`), événements `payment.success`, `payment.failed`, `payment.cancelled`, `payment.expired`.

## Bon à savoir

- Devise envoyée : **XOF** (GeniusPay refuse XAF ; même valeur, 1 500 XOF = 1 500 FCFA).
- Les moyens de paiement affichés (carte, Orange, MTN…) dépendent de ce qui est **activé sur ton compte GeniusPay** (Intégrations), pas de l'app.
- Un paiement resté "en attente" est revérifié automatiquement à chaque ouverture de l'écran Abonnements.

## Si Orange / MTN ne reçoit pas la demande

1. Valide manuellement : **#150*50#** (Orange) ou ***126#** (MTN).
2. Vérifie le numéro saisi sur la page GeniusPay (ton numéro Mobile Money, avec 237).
3. Regarde la transaction dans le tableau de bord GeniusPay (statut, message d'erreur).
4. Ticket au support GeniusPay avec la référence `MTX-…` de la transaction.

## Solutions de repli

Les fonctions `cinetpay` et `campay` sont prêtes dans le dépôt (guides `guide-paiement-cinetpay.md` et `guide-paiement-campay.md`). Changer de prestataire = déployer la fonction + une ligne dans `src/payments/paiement.ts`.
