# Guide : activer le paiement Campay (10 minutes)

> Pour Yannick. **Ton jeton Campay ne passe jamais par Jarvis** : tu le colles uniquement dans Supabase.
>
> Le script SQL des paiements est **déjà installé** : rien à refaire côté base. Les anciennes fonctions `geniuspay` et `cinetpay` peuvent rester dans Supabase, elles ne sont plus utilisées.

## Étape 1 : créer ton application Campay (mode test)

1. Inscris-toi sur **https://demo.campay.net** (environnement de test, aucun vrai argent).
2. Crée une **application** (ex. "AFROBACK").
3. Dans l'application, section **APP KEYS** : copie le **jeton d'accès permanent** ("permanent access token").
4. Dans les réglages de l'application, **Callback URL** :
   `https://ygkyapryramhaskfbrrt.supabase.co/functions/v1/campay` (méthode GET ou POST, les deux marchent).

## Étape 2 : la fonction serveur

1. Supabase → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Nom : `campay` (exactement).
3. Remplace le code proposé par le contenu de `mobile-app/supabase/functions/campay/index.ts` → **Deploy**.
4. Ouvre la fonction `campay` → réglages → **désactive "Verify JWT"** → enregistre.

## Étape 3 : les secrets (dans Supabase, pas ailleurs)

Supabase → **Edge Functions** → **Secrets** → ajoute :

| Nom | Valeur |
|---|---|
| `CAMPAY_TOKEN` | le jeton permanent de l'étape 1 |
| `CAMPAY_ENV` | `demo` |
| `CAMPAY_MONTANT_TEST` | `10` (précaution : l'environnement de test de Campay accepte mal les gros montants ; on envoie 10 FCFA au lieu de 1 500, l'abonnement débloqué reste le vrai) |

## Étape 4 : tester

1. Ouvre https://afroback-test.vercel.app, connecte-toi.
2. Abonnements → **Choisir Racines** → la page Campay s'ouvre → saisis ton numéro MTN ou Orange → valide sur ton téléphone (code USSD : *126# pour MTN, #150*50# pour Orange si la demande n'apparaît pas).
3. Retour dans l'app : "Paiement en cours…" puis **"Bienvenue dans Racines !"**.
4. Si un message d'erreur apparaît, envoie-le tel quel à Jarvis.

## Passer en réel

1. Crée ton compte et ton application sur **https://www.campay.net** (compte réel, vérification d'identité).
2. Même Callback URL que ci-dessus.
3. Dans Supabase → Secrets : `CAMPAY_TOKEN` = le jeton **réel**, `CAMPAY_ENV` = `live`, et **supprime** `CAMPAY_MONTANT_TEST`.
4. Fais un vrai don de 200 FCFA avec ton propre numéro.
