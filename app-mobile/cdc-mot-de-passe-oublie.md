# Cahier des charges — Mot de passe oublié

> Rédigé le 2026-09-26, avant tout développement. À valider par Yannick avant de passer aux devs.

## 1. Constat actuel

Le lien "Mot de passe oublié ?" sur l'écran de connexion (`app/onboarding/login.tsx`) affiche seulement une alerte "Bientôt disponible". Rien n'est implémenté.

## 2. Le vrai problème à résoudre d'abord

AFROBACK authentifie uniquement par **téléphone + mot de passe**, sans email (décision du 2026-07-30, pour éviter le coût d'un fournisseur SMS). **Ce choix rend la réinitialisation de mot de passe structurellement difficile** : pour prouver qu'on est le propriétaire du compte sans taper son mot de passe (puisqu'on l'a oublié), il faut un second canal de vérification — et on n'en a aucun aujourd'hui.

## 3. Comment font les apps à succès

| Méthode | Exemples | Coût | Fonctionne avec notre modèle actuel ? |
|---|---|---|---|
| **Lien de réinitialisation par email** | Presque toutes les apps grand public (Instagram, Netflix...) | Gratuit (email transactionnel) | ❌ Pas d'email collecté aujourd'hui |
| **Code par SMS** | WhatsApp, la plupart des apps "téléphone uniquement" | Payant par SMS envoyé | ❌ Coût déjà écarté deux fois sur ce projet (auth + ceci) |
| **Code via l'app d'authentification (TOTP)** | Rare seul, généralement en complément | Gratuit | ⚠️ Seulement si le MFA est déjà activé sur le compte — inutile pour les 90%+ de comptes qui ne l'auront pas activé |
| **Vérification manuelle par un humain (support)** | Petites apps, apps B2B | Gratuit mais lent, ne passe pas à l'échelle | ✅ Fonctionne toujours, mais mauvaise expérience et charge de travail pour Yannick |

**Aucune app à succès grand public ne repose uniquement sur "contacter le support"** — c'est un filet de sécurité, pas un mécanisme principal.

## 4. Recommandation

Il faut trancher une vraie question de fond avant de coder quoi que ce soit :

### Option A (recommandée) — Ajouter un email optionnel, uniquement pour la récupération
- À l'inscription (ou proposé après coup, comme le MFA), un champ **email facultatif** : "Pour pouvoir récupérer ton compte si tu perds ton mot de passe". Jamais utilisé pour se connecter (le téléphone reste l'identifiant), jamais obligatoire.
- Si un email existe : "Mot de passe oublié" envoie un vrai lien de réinitialisation (Supabase Auth le fait nativement, `resetPasswordForEmail`, gratuit — pas de fournisseur SMS payant).
- Si aucun email n'a été renseigné : message honnête "Aucun moyen de récupération enregistré, contacte le support" (option C en filet de sécurité).
- **Avantage** : gratuit, standard, ne revient pas sur la décision "téléphone uniquement pour se connecter au quotidien" — l'email est un filet de sécurité, pas une méthode de connexion.
- **Inconvénient** : un utilisateur qui n'a jamais renseigné d'email reste bloqué s'il oublie son mot de passe — acceptable si présenté clairement comme son choix ("tu n'as pas ajouté d'email de récupération").

### Option B — Réinitialisation via TOTP (si MFA activé)
- Utilisable seulement en complément de l'Option A, jamais seule (ne couvre pas les comptes sans MFA).

### Option C — Support manuel uniquement (filet de sécurité, pas une solution complète)
- Déjà nécessaire quel que soit le choix, pour les comptes sans email ni MFA.

**Recommandation : Option A, avec Option C en filet de sécurité pour les comptes sans email.**

## 5. Spec fonctionnelle (Option A)

### Nouveau champ email (facultatif)
- Ajouté au profil (voir aussi `cdc-edition-profil.md`, qui couvre l'édition du profil en général) — proposé une fois après l'inscription ou à tout moment depuis Profil.
- Stocké dans `auth.users.email` (Supabase Auth le supporte nativement même en mode téléphone principal — un compte peut avoir téléphone ET email, l'un des deux sert d'identifiant de connexion, l'autre reste "secondaire").

### Écran "Mot de passe oublié" (`app/onboarding/mot-de-passe-oublie.tsx`)
1. Demande le numéro de téléphone (pour retrouver le compte)
2. Si un email est associé à ce compte : "Un lien de réinitialisation a été envoyé à t***@exemple.com" (email masqué pour ne pas le révéler entièrement à quelqu'un qui ne le connaîtrait pas)
3. Si aucun email n'est associé : "Aucun moyen de récupération enregistré pour ce compte. Contacte-nous : [contact support]"
4. Le lien reçu par email ouvre une page de réinitialisation (deep link vers l'app, ou une page web simple si le deep link est complexe à mettre en place dans les délais)

### Sécurité
- Ne jamais révéler si un numéro de téléphone existe ou non dans la base (message identique que le compte existe ou pas, pour éviter l'énumération de comptes) — même principe que les bonnes pratiques déjà appliquées ailleurs sur ce projet (jamais de faux succès, mais ici l'inverse : jamais confirmer/infirmer l'existence d'un compte).

## 6. Spec technique

- **Aucune nouvelle table** — utilise `auth.users.email` natif de Supabase Auth.
- **Fonctions Supabase Auth déjà existantes, jamais utilisées** : `supabase.auth.resetPasswordForEmail(email, { redirectTo })`, `supabase.auth.updateUser({ password })` après clic sur le lien.
- **Deep link à configurer** : `app.json` a déjà un `scheme: "afroback"` — le lien de réinitialisation peut rediriger vers `afroback://reset-password?token=...`, à router vers un nouvel écran `app/onboarding/nouveau-mot-de-passe.tsx`.
- **Email transactionnel** : Supabase envoie l'email via son propre service par défaut (gratuit, limité en volume sur le plan gratuit — à surveiller si le volume grossit, mais largement suffisant pour l'usage actuel).

## 7. Décisions ouvertes à valider par Yannick

1. **Confirmer l'Option A** (email facultatif de récupération) — c'est un changement de philosophie (le projet évitait email/SMS jusqu'ici pour l'auth quotidienne ; ici l'email n'est qu'un filet de sécurité, pas un identifiant de connexion, mais à valider explicitement).
2. **Contact support à afficher** pour les comptes sans email (numéro WhatsApp Madou Consulting ? email ? à préciser).
3. **Où proposer l'ajout d'email** : à l'inscription (risque d'ajouter encore une étape) ou seulement depuis Profil après coup (plus discret, mais moins de comptes auront un email enregistré) ?
