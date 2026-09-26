# Cahier des charges — MFA intégrée à l'inscription

> Rédigé le 2026-09-26. **Développé le même jour** (Yannick a validé les recommandations telles quelles). Voir `context/AFROBACK.md` pour le détail de la livraison.

## 1. Constat actuel

Le MFA (TOTP) existe déjà dans l'app (`app/profil/mfa.tsx`, lot cybersécurité du 2026-09-25) mais **en option, activable seulement après coup, depuis Profil → Sécurité**. Un compte peut être créé et utilisé indéfiniment sans jamais passer par le MFA. C'est ce que Yannick juge "pas complet".

**Décision du 2026-09-26 qui change la donne** : l'implémentation actuelle utilise le module MFA propriétaire de Supabase Auth, qui échoue à 100% côté serveur (`"Error generating QR Code"`, bug confirmé hors de notre contrôle). Plutôt que d'attendre un correctif Supabase, **on construit notre propre TOTP** (l'algorithme est un standard ouvert, RFC 6238 — pas une boîte noire propriétaire), stocké dans notre propre table Postgres (toujours hébergée chez Supabase, juste plus dans son module Auth/MFA cassé). **Ça lève complètement le blocage** : plus besoin d'attendre de ticket support, le chantier peut être développé et testé immédiatement. Détail technique en section 6.

## 2. Comment font les apps à succès

Il n'existe pas un seul standard — le choix dépend du niveau de risque de l'app :

| Approche | Exemples | Quand |
|---|---|---|
| **MFA obligatoire dès l'inscription** | Apps bancaires, crypto (Binance, Revolut) | Risque financier direct, quitte à perdre des inscriptions |
| **MFA fortement suggéré juste après l'inscription, jamais forcé** | Instagram, GitHub, Discord | Compromis : le compte existe et fonctionne sans MFA, mais un écran dédié le propose activement à la fin de l'inscription (pas caché dans un sous-menu) |
| **MFA optionnel, découvert seul dans les réglages** | La plupart des apps grand public | Ce qu'AFROBACK a aujourd'hui |

**Aucune grande app grand public (hors finance) n'impose le MFA obligatoire dès l'inscription** — le coût en abandon d'inscription est jugé trop élevé face au bénéfice pour un compte qui ne détient ni argent ni données ultra-sensibles. AFROBACK n'est pas une app financière (le paiement Mobile Money n'est même pas encore intégré).

## 3. Recommandation

**Option B (fortement suggéré, jamais forcé)** — un nouvel écran juste après l'inscription ("Protège ton compte") propose d'activer le MFA immédiatement, avec deux boutons de poids égal : "Activer maintenant" (ouvre le flux déjà existant `app/profil/mfa.tsx`) et "Plus tard" (continue vers l'assistant post-inscription normal). Rien n'est bloqué si l'utilisateur choisit "Plus tard" — mais contrairement à aujourd'hui, l'écran de gestion Sécurité reste accessible et un rappel discret (bandeau, pas un blocage) peut apparaître plus tard dans Profil tant que le MFA n'est pas activé.

**Pourquoi pas l'Option A (obligatoire)** : ça bloquerait 100% des inscriptions tant que le bug Supabase n'est pas résolu (aucun utilisateur ne pourrait créer de compte du tout), et ça ajoute une friction forte pour un risque encore faible (pas de paiement réel en jeu). **Mais c'est la décision de Yannick, pas la mienne** — si tu veux vraiment l'obligatoire, je le construis, en sachant que l'app sera inutilisable tant que Supabase n'a pas réglé son bug.

## 4. Spec fonctionnelle (Option B)

### Écran nouveau : "Protège ton compte" (`app/onboarding/mfa-proposal.tsx`)
- Positionné juste après `signup`, avant l'assistant langue/usage/forfait (ou juste après le "welcome" — à trancher, voir décisions ouvertes).
- Contenu : icône bouclier, titre "Protège ton compte", texte explicatif court (2FA = code temporaire en plus du mot de passe), deux boutons :
  - **"Activer maintenant"** → ouvre le flux MFA existant (`app/profil/mfa.tsx`, réutilisé tel quel) → au succès, revient sur ce même écran avec un état "✅ Activée", bouton devient "Continuer"
  - **"Plus tard"** → continue directement, aucune pénalité

### Rappel discret (si "Plus tard" choisi)
- Un bandeau non intrusif sur l'écran Profil ("Sécurise ton compte avec la vérification en 2 étapes →"), tant que le MFA n'est pas activé — jamais une pop-up bloquante, jamais répété plus d'une fois par session.

### Ce qui ne change pas
- Le MFA reste géré au même endroit (`app/profil/mfa.tsx`), désactivable à tout moment.
- La porte de connexion (`app/onboarding/mfa-challenge.tsx`) reste identique.

## 5. Spec fonctionnelle (suite) — infrastructure réutilisée telle quelle

- **Nouveau fichier** : `app/onboarding/mfa-proposal.tsx`.
- **Modif** : `app/_layout.tsx` (RootNavigator) — insérer ce nouvel écran dans le groupe protégé `!onboardingComplete`, juste après `signup`.
- `user_metadata` peut stocker un flag `mfa_proposal_seen: true` pour ne montrer le bandeau qu'une fois par session (pas de persistance stricte nécessaire, un simple state local suffit aussi).

## 6. Spec technique — TOTP maison (remplace le module MFA Supabase)

**Principe** : même standard que Google Authenticator/Authy (RFC 6238 — TOTP dérivé de HOTP/RFC 4226, HMAC-SHA1 sur un compteur de temps par pas de 30 secondes), mais calculé et vérifié entièrement par nous, jamais par le module MFA de Supabase.

### Nouvelle table
```
public.user_totp_factors
  user_id           uuid primary key references auth.users(id) on delete cascade
  secret_encrypted  bytea not null        -- secret brut (20 octets aléatoires), chiffré avec pgp_sym_encrypt
  verified          boolean not null default false   -- passe à true seulement après le premier code correct
  created_at        timestamptz not null default now()
  verified_at       timestamptz
```
RLS activée, **aucune policy** (même principe que `login_attempts`/`app_secrets` du Lot 1/2 cybersécurité) : uniquement accessible via les fonctions `SECURITY DEFINER` ci-dessous, jamais en lecture/écriture directe depuis l'app.

### Fonctions Postgres (`SECURITY DEFINER`, pattern déjà établi sur ce projet)
1. **`mfa_totp_enroll()`** — appelée par l'utilisateur connecté (`auth.uid()`, jamais un ID passé par le client). Génère 20 octets aléatoires (`gen_random_bytes`), les chiffre et les stocke (`verified = false`), retourne le secret encodé en base32 (nécessaire pour le QR/la saisie manuelle) **une seule fois** — jamais récupérable après coup, comme n'importe quel gestionnaire TOTP sérieux.
2. **`mfa_totp_confirm(p_code text)`** — vérifie le code à 6 chiffres fourni contre le secret en attente ; si correct, passe `verified = true`. Si un facteur déjà vérifié existe, le remplace (permet de réinitialiser).
3. **`mfa_totp_verify_login(p_phone text, p_code text)`** — utilisée à la connexion, avant qu'une session ne soit ouverte : retrouve le facteur vérifié via le téléphone, vérifie le code.
4. **`mfa_totp_is_enabled(p_phone text)`** — utilisée à la connexion pour savoir s'il faut même afficher l'écran de vérification.
5. **`mfa_totp_disable()`** — supprime le facteur de l'utilisateur connecté.

### Génération/vérification du code
- Fenêtre de tolérance : vérifier le pas de temps actuel **et** le précédent/suivant (±30s), pour absorber un léger décalage d'horloge entre le téléphone et le serveur — pratique standard de toutes les apps TOTP.
- **QR code affiché côté app**, pas généré par le serveur (c'était la source du bug Supabase) : URI standard `otpauth://totp/AFROBACK:{téléphone}?secret={base32}&issuer=AFROBACK&digits=6&period=30`, rendu en QR par une petite bibliothèque JS pure (`react-native-qrcode-svg`, pas de dépendance native).

### Protection anti-brute-force spécifique au MFA (nouveau, à ne pas oublier)
Un code à 6 chiffres n'a que 1 000 000 de combinaisons — sans limite de tentatives, un code pourrait être deviné dans sa fenêtre de validité (30s). **Réutilise le même mécanisme que le Lot 1** (`schema-security-auth.sql`, verrouillage après N échecs) mais appliqué spécifiquement aux tentatives de code MFA, pas seulement au mot de passe — un compteur distinct, mêmes principes.

## 7. Décisions ouvertes à valider par Yannick

1. **Confirmer l'Option B** (suggéré, pas obligatoire) ?
2. **Position exacte de l'écran** : juste après l'inscription, ou après tout l'assistant post-inscription (juste avant l'accueil) ?
3. **Le bandeau de rappel** : fréquence acceptable (une fois par session ? une fois pour toutes tant que non activé ?).
4. **Confirmer l'abandon du module MFA natif de Supabase Auth** au profit de cette implémentation maison — c'est un vrai changement d'architecture (nouvelle table + 5 fonctions à construire et tester), en échange de lever complètement le blocage actuel.
