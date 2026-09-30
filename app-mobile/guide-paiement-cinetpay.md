# Guide : activer le paiement CinetPay (10 minutes)

> Pour Yannick. **Tes clés CinetPay ne passent jamais par Jarvis** : tu les colles uniquement dans Supabase.
>
> Le script SQL des paiements est **déjà installé** : rien à refaire côté base. Les fonctions `geniuspay` et `campay` peuvent rester dans Supabase, elles ne sont pas utilisées.

## Étape 1 : récupérer tes identifiants API CinetPay

Dans ton espace marchand CinetPay, rubrique intégration / API, note :
- la **clé API** : commence par `sk_test_` (test) ou `sk_live_` (réel) ;
- le **mot de passe API**.

Commence par les identifiants **de test** (`sk_test_`).

## Étape 2 : la fonction serveur

1. Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Nom : `cinetpay` (exactement).
3. Remplace le code proposé par le contenu de `mobile-app/supabase/functions/cinetpay/index.ts` → **Deploy**.
4. Ouvre la fonction `cinetpay` → réglages → **désactive "Verify JWT"** → enregistre. Indispensable : CinetPay doit pouvoir prévenir AFROBACK après chaque paiement.

## Étape 3 : les clés (dans Supabase, pas ailleurs)

Supabase → **Edge Functions** → **Secrets** → ajoute :

| Nom | Valeur |
|---|---|
| `CINETPAY_API_KEY` | ta clé `sk_test_…` |
| `CINETPAY_API_PASSWORD` | ton mot de passe API |

La fonction choisit seule le serveur de test ou le serveur réel selon le début de la clé. L'adresse de notification est envoyée automatiquement à CinetPay avec chaque paiement : rien à configurer côté CinetPay.

## Étape 4 : tester

1. Ouvre https://afroback-test.vercel.app, connecte-toi.
2. Abonnements → **Choisir Racines** → la page CinetPay s'ouvre → paie avec MTN ou Orange.
3. Retour dans l'app : "Paiement en cours…" puis **"Bienvenue dans Racines !"**.
4. Si un message d'erreur apparaît, envoie-le tel quel à Jarvis : il contient la réponse de CinetPay.

## Passer en réel

Remplace les deux secrets par tes identifiants **live** (`sk_live_…` et son mot de passe). Fais d'abord un vrai don de 200 FCFA avec ton propre numéro.

## Bon à savoir

- Montants : CinetPay exige un **multiple de 5** (les forfaits le sont déjà ; l'app le vérifie pour les dons).
- Devise : **XAF** par défaut. Si CinetPay refuse la devise, ajoute le secret `CINETPAY_CURRENCY` = `XOF` (même valeur).
