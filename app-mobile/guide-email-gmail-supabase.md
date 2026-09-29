# Guide : envoyer les emails AFROBACK depuis afroback3d@gmail.com

> Pour Yannick. Environ 15 minutes. **Ne communique jamais le mot de passe d'application à personne, Jarvis compris** : il se saisit directement dans Supabase.

## Étape 1 : activer la validation en 2 étapes sur le compte Google

1. Connecte-toi à **afroback3d@gmail.com** sur un navigateur.
2. Va sur **https://myaccount.google.com/security**.
3. Dans "Comment vous connecter à Google", active la **Validation en deux étapes** et suis les instructions (un code par SMS suffit).

Google l'exige : sans elle, l'étape 2 est impossible.

## Étape 2 : créer un mot de passe d'application

1. Va sur **https://myaccount.google.com/apppasswords**.
2. Nom de l'application : `Supabase AFROBACK`, puis **Créer**.
3. Google affiche un mot de passe de **16 lettres** (ex. `abcd efgh ijkl mnop`). **Garde cette fenêtre ouverte** : il ne sera plus jamais affiché. Tu le colles à l'étape 3, sans les espaces.

## Étape 3 : brancher Gmail dans Supabase

Dans le tableau de bord Supabase du projet AFROBACK : **Authentication → Emails → SMTP Settings** (selon la version : **Project Settings → Authentication → SMTP Settings**). Active **Enable Custom SMTP** et remplis :

| Champ | Valeur |
|---|---|
| Sender email | `afroback3d@gmail.com` |
| Sender name | `AFROBACK` |
| Host | `smtp.gmail.com` |
| Port | `465` |
| Username | `afroback3d@gmail.com` |
| Password | le mot de passe d'application de l'étape 2 (16 lettres, sans espaces) |
| Minimum interval between emails | `60` secondes (valeur par défaut, à laisser) |

Enregistre.

## Étape 4 : coller le modèle d'email

1. **Authentication → Emails → Templates → Confirm signup**.
2. Champ **Subject** : `AFROBACK · Ton code de confirmation / Your confirmation code`
3. Dans le corps (onglet **Source**), remplace tout par **le contenu** (le code HTML, pas le chemin) du fichier `mobile-app/supabase/email-templates/confirm-signup.html` : ouvre le fichier, Ctrl+A, Ctrl+C, puis dans Supabase Ctrl+A, Ctrl+V. Vérifie avec l'onglet **Preview** : une carte noire avec AFROBACK en doré.
4. Enregistre.

Le modèle s'adapte tout seul : français ou anglais selon la langue choisie sur l'écran 1 de l'app.

## Étape 4 bis : modèle "mot de passe oublié"

1. **Authentication → Emails → Templates → Reset Password**.
2. Champ **Subject** : `AFROBACK · Réinitialise ton mot de passe / Reset your password`
3. Onglet **Source** : Ctrl+A puis colle le contenu du fichier `mobile-app/supabase/email-templates/reset-password.html` (même principe que l'étape 4).
4. Enregistre. Sans ce modèle, l'email ne contient qu'un lien et l'écran "Mot de passe oublié" de l'app ne peut pas fonctionner.

## Étape 5 : code valable 15 minutes

Menu de gauche de **Authentication**, section **CONFIGURATION** → **Sign In / Providers** → clique sur **Email** dans la liste :
- **Email OTP Expiration** : `900` (secondes, soit 15 minutes)
- **Email OTP Length** : `6`
- **Confirm email** : doit rester **activé**

Enregistre.

## Étape 6 : vérifier le plafond d'envoi

**Authentication → Rate Limits** : "Rate limit for sending emails". Mets **100** par heure, ce qui laisse de la marge pour les tests et le lancement, tout en restant sous le plafond quotidien de Gmail (environ 500 par jour).

## Étape 7 : tester

1. Ouvre https://afroback-test.vercel.app en navigation privée.
2. Crée un compte avec **une autre adresse que afroback3d@gmail.com** (ta propre adresse, par exemple).
3. Tu dois recevoir en moins d'une minute l'email noir et or avec le code à 6 chiffres.
4. Si rien n'arrive au bout de 2 minutes : regarde les courriers indésirables, puis vérifie les étapes 2 et 3 (erreur fréquente : les espaces laissés dans le mot de passe d'application).

## Plus tard (avant le lancement public)

Passer à un nom de domaine à toi (ex. `bonjour@afroback.com`) donnera une image plus professionnelle et fera sauter la limite Gmail. Seuls les réglages de l'étape 3 changent, l'app n'est pas touchée.

## Scripts SQL à exécuter (SQL Editor de Supabase)

| Script | Rôle |
|---|---|
| `mobile-app/supabase/schema-acces-abonnement.sql` | Contenus gratuits / réservés aux abonnés |
| `mobile-app/supabase/schema-telephone-inscription.sql` | Numéro de téléphone saisi à l'inscription = identifiant de connexion |

Les deux sont sans risque à relancer.

