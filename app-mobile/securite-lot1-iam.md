# AFROBACK — Cybersécurité, Lot 1 : Authentification & Contrôle d'accès (IAM)

> Document de présentation/soutenance, produit le 2026-09-25. Décrit ce qui existe **réellement** dans le code à cette date — aucune fonctionnalité listée ici n'est aspirationnelle. Voir `context/AFROBACK.md` pour le journal de décisions complet du projet.

## Problématique retenue

> *How can cybersecurity mechanisms be integrated into a digital platform to ensure the secure preservation, authenticity, integrity, and controlled access to African cultural heritage?*

AFROBACK n'est pas seulement une app de contenu culturel : c'est une plateforme qui doit protéger ce contenu et les comptes de ceux qui le créent, le consultent et le vendent (histoires, œuvres, artisanat) contre le vol, la modification, la suppression et l'accès non autorisé.

## Les 4 lots

| Lot | Contenu | Statut |
|---|---|---|
| **1. Authentification & contrôle d'accès (IAM)** | MFA, brute force, RBAC, session | **Ce document** |
| 2. Intégrité & protection du contenu | SHA-256, signature numérique, watermarking | À venir |
| 3. Chiffrement & transport | TLS, chiffrement au repos | À venir |
| 4. Surveillance & VAPT | Logs, dashboard, tests d'intrusion réels | À venir |

---

## 1.1 Authentification

- **Mécanisme** : téléphone + mot de passe (Supabase Auth), décision du 2026-07-30 — pas d'email, pas d'OAuth, pas de SMS OTP (coût récurrent écarté volontairement).
- **Hashing du mot de passe** : jamais géré par le code applicatif — Supabase Auth stocke les mots de passe hashés (bcrypt) côté serveur, aucun mot de passe en clair ne transite ni n'est stocké dans le code d'AFROBACK.
- **Fichier source** : `src/auth/AuthProvider.tsx`.

## 1.2 Authentification à deux facteurs (MFA / 2FA)

- **Mécanisme** : TOTP (Time-based One-Time Password), compatible Google Authenticator/Authy — pas de SMS (même raison que ci-dessus).
- **Activation** : optionnelle, à l'initiative de l'utilisateur depuis Profil → « Sécurité (vérification en 2 étapes) » (`app/profil/mfa.tsx`). Flux : QR code (+ secret en saisie manuelle en repli) → code à 6 chiffres → confirmation.
- **Porte de connexion** : `app/onboarding/mfa-challenge.tsx`, câblée en priorité absolue dans la grille de navigation (`app/_layout.tsx`) — un compte avec MFA activée ne peut accéder à **rien** (même pas l'assistant post-inscription) tant que le second facteur n'est pas validé pour la session en cours.
- **Implémentation** : native Supabase Auth (`supabase.auth.mfa`), aucun stockage applicatif du secret — la donnée sensible (secret TOTP) ne transite jamais par une table `public.*` du projet.

## 1.3 Protection contre le brute force

- **Mécanisme** : verrouillage après 5 tentatives échouées sur une fenêtre glissante de 10 minutes, verrou de 15 minutes. Implémenté en base (`supabase/schema-security-auth.sql`), fonctions `check_login_lockout`/`record_login_attempt` (SECURITY DEFINER, seules portes d'accès à la table `login_attempts` — RLS activée sans policy).
- **⚠️ Limite honnête, à assumer devant le jury** : cette protection s'applique à un brute force fait *à travers l'application* — la cible réaliste, puisque c'est le seul client officiel d'AFROBACK. Un attaquant qui appellerait directement l'API Supabase Auth avec la clé publique `anon` (embarquée dans l'app par construction, donc jamais secrète) contournerait ce verrou applicatif spécifique. Une protection véritablement infranchissable viendrait soit du rate limiting natif de Supabase Auth sur son endpoint (déjà actif par défaut, non construit par ce projet), soit d'un Auth Hook serveur (nécessite un plan Supabase payant ou une Edge Function dédiée — hors budget actuel). **Présenter cette nuance est plus solide académiquement que prétendre une protection totale.**

## 1.4 Contrôle d'accès basé sur les rôles (RBAC)

AFROBACK n'a pas une table `roles` centralisée — le contrôle d'accès est porté nativement par les **Row Level Security (RLS) policies** de Postgres/Supabase, une approche reconnue (le contrôle d'accès est appliqué au plus près de la donnée, pas dans une couche applicative contournable). Matrice réelle, vérifiée dans le code au 2026-09-25 :

| Rôle | Portée | Mécanisme d'application | Exemple de policy |
|---|---|---|---|
| **Visiteur** (`anon`, aucun compte) | Lecture seule du contenu éditorial public (héros, Découverte, Mythologie, École des Héros, produits Marketplace, posts Communauté publiés) | RLS `select` ouverte à `anon` | `"Public read access"` sur `heros`, `decouverte_items`, `mythes` |
| **Utilisateur / Contributeur** (`authenticated`, compte téléphone+mdp) | Ce que Visiteur peut + gérer son propre profil/posts/commentaires/signalements Communauté, ses dons, l'upload dans son propre dossier Storage | RLS filtrée sur `auth.uid()` | `"Create own profile"`, `"Update own profile"` sur `community_profiles` ; `"Users upload to own folder"` sur `storage.objects` |
| **Vendeur** (sous-rôle : tout Contributeur qui crée un profil boutique) | Gestion complète de sa propre boutique/produits, lecture/mise à jour de ses commandes | RLS filtrée sur `auth.uid()` côté `marketplace_vendors` | `"Vendor manages own products"`, `"Vendor updates order statut"` |
| **Parent** (sous-rôle : tout Contributeur avec un profil enfant) | Accès complet aux données de ses propres profils enfants (progression École des Héros, réglages, sessions) | RLS filtrée sur `auth.uid()` (parent) | `"Parent full access to own children"` (×3 tables) |
| **Administrateur** (compte back-office, **distinct** de l'auth mobile — email/mdp Supabase Auth + vérification dans `admin_users`) | Accès total en écriture à tout le contenu éditorial et à la modération | Clé `service_role` (contourne RLS nativement, jamais exposée au navigateur — uniquement côté serveur Next.js) | `admin_users`/`admin_activity_log` : RLS activée **sans aucune policy** → accès exclusivement `service_role` |

**Principe du moindre privilège appliqué concrètement** : `anon` ne peut jamais écrire nulle part (uniquement `select` sur du contenu déjà publié) ; un utilisateur connecté ne peut modifier que ses propres lignes (jamais celles d'un autre, vérifié via `auth.uid()` dans chaque policy) ; les tables sensibles à l'administration (`admin_users`, `admin_activity_log`, `login_attempts`, `security_events`) n'ont **aucune** policy pour `anon`/`authenticated` — seule une fonction `SECURITY DEFINER` contrôlée ou la clé `service_role` y accèdent.

**Écart honnête entre l'ambition initiale et l'implémentation réelle** : le brainstorming de départ envisageait aussi un rôle **Institution culturelle** (gestion d'archives propres) et un rôle **Modérateur** distinct de l'Administrateur. Ni l'un ni l'autre n'existe dans le schéma actuel — la modération (signalements Communauté) est aujourd'hui traitée manuellement par l'unique rôle `admin_complet`. Ne pas présenter ces rôles comme construits.

## 1.5 Gestion de session

- Session persistée localement (AsyncStorage), rafraîchissement automatique du jeton (`autoRefreshToken: true`).
- Déconnexion à portée explicitement **globale** (`supabase.auth.signOut({ scope: 'global' })`) : révoque la session sur tous les appareils connectés avec ce compte, pas seulement l'appareil courant.
- Expiration de session : 1h par défaut côté Supabase (jeton d'accès), renouvelé automatiquement tant que le jeton de rafraîchissement est valide.

---

## Vérifications techniques (2026-09-25)

`tsc --noEmit`, `expo-doctor` (18/18), `expo export` iOS+Android+web : tous propres après l'ajout du MFA. Brute force + session management non re-testés en conditions réelles à la date de rédaction (nécessite exécution de `schema-security-auth.sql` par Yannick, puis test réel).

**Reste à exécuter par Yannick** : `supabase/schema-security-auth.sql` dans le SQL Editor du dashboard Supabase (idempotent, safe à rejouer).
