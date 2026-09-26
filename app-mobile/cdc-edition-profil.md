# Cahier des charges — Édition du profil (photo, informations)

> Rédigé le 2026-09-26, avant tout développement. À valider par Yannick avant de passer aux devs.

## 1. Constat actuel (vérifié dans le code)

`app/(tabs)/profil.tsx` est **entièrement en lecture seule** : affiche prénom, pays, forfait, langue, usages — aucun bouton "Modifier" nulle part. Pas de photo de profil réelle (l'avatar affiché est un placeholder générique `HeroPlaceholder`, pas une vraie image uploadée par l'utilisateur).

**Ce qui existe déjà et sera réutilisé** (pas à reconstruire) :
- `src/components/AvatarPicker.tsx` — sélecteur d'avatar circulaire avec upload réel, déjà utilisé pour le profil Communauté et la boutique Marketplace.
- `src/data/uploadImage.ts` — pipeline d'upload générique vers le bucket Supabase Storage `user-uploads`.
- `src/components/CountryPicker.tsx` — déjà utilisé à l'inscription/connexion pour choisir le pays.
- L'écran de choix d'usages de l'onboarding (`app/onboarding/usage.tsx`) — la même UI peut servir à l'édition après coup.

## 2. Comment font les apps à succès

Le standard (Instagram, LinkedIn, etc.) : un écran "Modifier le profil" séparé de l'écran "Profil" (qui reste principalement un écran d'affichage/vitrine), atteint via un bouton explicite. La photo se modifie en tapant directement dessus (pas un bouton séparé). Les champs texte s'éditent en place ou via un formulaire dédié — les deux se valent, le formulaire dédié est plus simple à valider (un seul bouton "Enregistrer" pour tout) et plus cohérent avec le reste de l'app (WizardState/formulaires déjà utilisés à l'inscription).

## 3. Recommandation

Un nouvel écran **`app/profil/modifier.tsx`**, atteint par un bouton "Modifier le profil" en haut de l'écran Profil actuel. Formulaire complet avec un seul bouton "Enregistrer" (pas d'édition en place champ par champ), cohérent avec le reste de l'app.

## 4. Spec fonctionnelle

### Écran Profil (modifications)
- Ajout d'un vrai avatar (photo uploadée) en haut, avec le prénom en dessous — remplace le `HeroPlaceholder` générique quand une photo existe.
- Bouton "Modifier le profil" (icône crayon ou texte), à côté ou sous le nom.

### Nouvel écran "Modifier le profil" (`app/profil/modifier.tsx`)
Champs éditables :
1. **Photo de profil** — `AvatarPicker` réutilisé tel quel, nouveau dossier de stockage dédié (`avatars-compte`, distinct des avatars Communauté/Marketplace qui restent liés à leurs propres profils publics).
2. **Prénom** — champ texte simple.
3. **Pays** — `CountryPicker` réutilisé tel quel.
4. **Usages** — réutilise la logique multi-select de l'onboarding.
5. **Langue de l'interface** — redirige vers l'écran dédié du chantier i18n (`cdc-i18n-app.md`), pas dupliqué ici.

Hors scope de cet écran (mais mentionné pour trancher) :
- **Changer le mot de passe** (utilisateur déjà connecté, différent du "mot de passe oublié") — mécanisme simple et sans risque (`supabase.auth.updateUser({ password })`), je recommande de l'ajouter dans un sous-écran "Sécurité" à côté du MFA déjà existant (`app/profil/mfa.tsx`), plutôt que dans "Modifier le profil" — cohérent avec le fait que MFA y est déjà.
- **Changer le numéro de téléphone** — plus complexe (c'est l'identifiant de connexion, changer demande de re-vérifier la propriété du nouveau numéro). Recommandation : **hors scope pour l'instant**, à cadrer séparément si Yannick en a besoin — pas mentionné dans sa demande initiale.

### Validation et messages d'erreur
- Prénom obligatoire (ne peut pas être vidé).
- Message de confirmation clair après enregistrement ("Profil mis à jour"), retour automatique à l'écran Profil.

## 5. Spec technique

- **Aucune nouvelle table** — tout passe par `user_metadata` (déjà le cas pour prénom/pays/usages) et un nouveau champ `avatar_url` dans ce même `user_metadata`.
- **`uploadImage.ts`** : ajouter `'avatars-compte'` à `UploadFolder`, avec son propre sous-dossier dans le bucket `user-uploads` (même bucket, RLS déjà en place — chaque utilisateur écrit uniquement dans son propre dossier, voir `schema-storage-user-uploads.sql`).
- **Mise à jour** : `supabase.auth.updateUser({ data: { ...} })`, même mécanisme déjà utilisé par `completeOnboarding()` dans `AuthProvider.tsx` — pas de nouvelle fonction d'auth à écrire, juste un nouvel écran qui appelle ce qui existe déjà.
- **Changement de mot de passe** (si Yannick valide de l'inclure) : `supabase.auth.updateUser({ password: nouveauMotDePasse })`, avec confirmation du mot de passe actuel avant d'autoriser le changement (redemander le mot de passe actuel, pratique standard de sécurité) — pas un champ à ajouter à `modifier.tsx`, un sous-écran séparé dans Sécurité.

## 6. Décisions ouvertes à valider par Yannick

1. **Confirmer le découpage** : un écran "Modifier le profil" (infos + photo) séparé d'un écran "Sécurité" (déjà là pour le MFA, à qui on ajoute le changement de mot de passe) ?
2. **Changement de mot de passe** : à inclure dans ce chantier, ou à traiter plus tard avec `cdc-mot-de-passe-oublie.md` (les deux touchent au mot de passe, pourraient être développés ensemble) ?
3. **Changement de numéro de téléphone** : confirmé hors scope, ou à ajouter à la liste des 4 chantiers ?
