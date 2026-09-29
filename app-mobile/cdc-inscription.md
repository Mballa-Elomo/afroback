# Cahier des charges : Création de compte (Module 2)

> **Développé le 2026-09-29.** Ajout demandé par Yannick en cours de développement : **pseudo + photo de profil ou avatar**, dans une nouvelle étape "Ton profil" juste après la confirmation de l'email (étape 5 bis ci-dessous). **Reste à faire par Yannick** : les réglages Gmail et Supabase du guide `guide-email-gmail-supabase.md`, puis un test réel.

> Validé par Yannick le 2026-09-29 ("le process me convient"). Les trois choix restés ouverts sont tranchés selon la recommandation de Jarvis : code valable 15 minutes, mot de passe de 8 caractères minimum avec au moins une lettre et un chiffre, email de bienvenue reporté à plus tard.
>
> Le Module 1 (`cdc-onboarding.md`) a déjà construit l'interface de l'inscription (prénom, email, mot de passe, case 18 ans et conditions) et l'écran de saisie du code. Le Module 2 rend l'envoi d'email réel et traite les cas limites.

## 1. Parcours

1. Écran du logo : choix de la langue, puis "Commencer".
2. Présentation (3 écrans) ou "Passer".
3. "Bienvenue dans ton voyage", puis "Créer mon compte".
4. "Crée ton compte" : prénom, email, mot de passe avec **indicateur de solidité** (faible / moyen / solide), case "J'ai 18 ans ou plus et j'accepte les conditions…". Erreurs affichées sous chaque champ. Si l'email existe déjà : message et lien direct "Se connecter".
5. "Vérifie ta boîte mail" : code à 6 chiffres, validation automatique au 6e chiffre, "Renvoyer le code" après 60 s, **"Modifier l'adresse"**. Email reçu : logo, "Bonjour {prénom}", code en très grand, "valable 15 minutes", noir et or, **en français ou en anglais selon la langue choisie**.
5 bis. **"Ton profil"** : photo choisie dans la galerie du téléphone (prise de photo directe : possible plus tard) ou choix parmi 8 avatars à motifs géométriques d'inspiration africaine, dessinés pour AFROBACK et sans visage ; **pseudo obligatoire** (2 à 30 caractères, disponibilité vérifiée en direct, sans tenir compte des majuscules). Enregistré dans le profil communautaire existant (`community_profiles`) : la Communauté ne redemande plus de pseudo, et l'email ou le téléphone ne sont jamais publics. Placé après la confirmation, parce que l'envoi d'une photo exige un compte confirmé.
6. "Comment vas-tu vivre AfroBack ?"
7. "Ton compte est créé !"
8. "Protège ton compte" (MFA).
9. "Choisis ton forfait" (paiement réel : Module 4).
10. "Bienvenue dans AfroBack !" puis accueil.

## 2. Cas limites

| Cas | Comportement |
|---|---|
| App fermée avant la saisie du code | À la connexion suivante par email, pas de message d'erreur : un nouveau code part automatiquement et l'écran "Vérifie ta boîte mail" s'ouvre |
| Code faux ou expiré | Message clair + "Renvoyer le code" |
| 5 codes faux d'affilée | Pause de 5 minutes affichée dans l'app. Confort d'utilisation : la vraie protection contre les tentatives en rafale est la limite de Supabase côté serveur |
| Email non reçu | Rappel des courriers indésirables, renvoi possible |
| Faute de frappe dans l'email | "Modifier l'adresse" ramène au formulaire, déjà rempli |

## 3. Preuve du consentement

À l'inscription, enregistrés dans le compte (`user_metadata`) : `consent_at` (date et heure), `consent_version` (version des conditions acceptées), `langue`. Tant que les conditions ne sont pas rédigées, la version vaut `brouillon-2026-09-29`.

## 4. Envoi des emails

- **Expéditeur : `afroback3d@gmail.com`** (choix de Yannick). Resend est écarté : il exige un nom de domaine vérifié, impossible avec une adresse Gmail.
- **Solution retenue** : SMTP de Gmail branché dans Supabase, avec un **mot de passe d'application Google**. Gratuit, environ 500 emails par jour.
- **Limites connues** : le plafond Gmail, et une image moins professionnelle qu'un domaine à soi. À faire évoluer vers un domaine (`@afroback.com`, environ 10 à 15 $ par an) avant le lancement public. La bascule ne touche que les réglages Supabase, pas l'app.
- Modèle d'email bilingue (français ou anglais selon `langue`) fourni prêt à coller : `mobile-app/supabase/email-templates/confirm-signup.html`.
- Réglages Supabase : validité du code à 900 secondes (15 minutes), code à 6 chiffres.
- Guide pas à pas pour Yannick : `guide-email-gmail-supabase.md`.

## 5. Actions de Yannick (le mot de passe ne transite jamais par Jarvis)

1. Activer la validation en 2 étapes sur le compte Google `afroback3d@gmail.com`.
2. Créer un mot de passe d'application Google.
3. Le saisir directement dans Supabase (SMTP personnalisé).
4. Coller le modèle d'email et régler la validité à 15 minutes.

## 6. Hors périmètre

Mot de passe oublié (Module 3), paiement (Module 4), email de bienvenue (plus tard).
