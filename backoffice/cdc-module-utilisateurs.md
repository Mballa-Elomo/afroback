# AFROBACK — Back-office : module Utilisateurs (spécification complète)

> Rédigé le 2026-10-10 à la demande de Yannick : « développe le module Utilisateurs. Rédige le cahier des charges complet puis passe au développement. »
> Même exigence que le module Paramètres (`cdc-module-parametres.md`) : ergonomique, moderne, chaque bouton a un effet réel.

---

## 1. Objectifs

1. **Voir tous les comptes AFROBACK** (app et site partagent les mêmes comptes) et retrouver n'importe qui en quelques secondes : e-mail, téléphone, prénom.
2. **Comprendre un compte d'un coup d'œil** : forfait, sécurité (2 étapes, appareils), famille (profils enfants), communauté, paiements, dernière activité.
3. **Agir sans développeur** sur les demandes du quotidien : « je n'arrive plus à me connecter », « j'ai changé de téléphone », « offrez-lui un mois », « ce membre harcèle les autres », « supprimez mon compte ».
4. **Ne jamais exposer de secret** et **tout tracer** : chaque action est inscrite au journal d'activité (qui, quoi, quand).
5. **Impossible de casser par erreur** : les actions graves demandent une confirmation, la suppression demande de retaper l'e-mail, un administrateur ne peut ni se suspendre ni se supprimer.

---

## 2. Sources de données (existantes, rien n'est dupliqué)

| Donnée | Source |
|---|---|
| Identité, e-mail, téléphone, dates (inscription, dernière connexion, e-mail confirmé), suspension | `auth.users` (API d'administration Supabase, clé service_role) |
| Prénom, pays, langue, centres d'intérêt, consentement (date + version) | `auth.users.user_metadata` (saisis par l'utilisateur) |
| Motif de suspension | `auth.users.app_metadata.suspension` (non modifiable par l'utilisateur) |
| Forfait et historique | `subscriptions` |
| Paiements et dons | `paiements` |
| Vérification en 2 étapes | `user_totp_factors` (seulement « activée oui/non », jamais le secret) |
| Appareils de confiance, appareil actif | `appareils`, `appareil_actif` |
| Blocage de connexion (trop d'essais) | `login_attempts` (par téléphone), `mfa_attempts` |
| Événements de sécurité | `security_events` (identifiant de connexion) |
| Profils enfants | `child_profiles` (le code PIN parent n'est **jamais** affiché) |
| Communauté | `community_profiles` (pseudo, bannissement), `community_posts` |
| Marché | `marketplace_vendors` |
| Quiz | `quiz_tentatives` |
| Compte de démonstration Google Play | `comptes_revue_store` |
| Administrateurs | `admin_users` |
| **Nouveau** : note interne sur un compte | `admin_notes_utilisateurs` (§ 6) |

Statut calculé d'un compte : **Suspendu** (suspension en cours) › **Non confirmé** (e-mail jamais confirmé) › **Actif**.
Forfait calculé : abonnement actif le plus élevé (Héritage › Racines), sinon **Découverte** (gratuit).

---

## 3. Écran 1 : la liste des utilisateurs (`/utilisateurs`)

### 3.1 Chiffres clés (en haut)
- Comptes au total · nouveaux sur 7 jours · actifs sur 30 jours (connexion ou activité d'appareil).
- Abonnés : Racines / Héritage (et part des comptes abonnés).
- Vérification en 2 étapes activée (nombre et %).
- Points d'attention : comptes suspendus, comptes non confirmés.
- Petit graphique : inscriptions par semaine sur les 12 dernières semaines.

### 3.2 Recherche, filtres, tri
- **Recherche instantanée** : e-mail, téléphone (avec ou sans indicatif), prénom, pseudo communauté, identifiant.
- **Filtres** (pastilles cumulables) : statut (actif, non confirmé, suspendu), forfait (Découverte, Racines, Héritage), 2 étapes (activée / non), profils enfants (oui / non), compte de démonstration store, administrateurs.
- **Tri** : inscription (récent / ancien), dernière connexion, prénom.
- **Pagination** : 25 comptes par page.
- **Export CSV** de la sélection filtrée (e-mail, téléphone, prénom, pays, forfait, statut, dates). Utile pour une campagne ; l'export est journalisé.

### 3.3 Chaque ligne
Avatar à initiale, prénom + e-mail, téléphone, forfait (pastille couleur), statut, 2 étapes (cadenas), nombre d'enfants, inscription, dernière connexion relative (« il y a 3 h »). Étiquettes **Admin** et **Démo store** quand c'est le cas. Clic : fiche du compte.

---

## 4. Écran 2 : la fiche d'un compte (`/utilisateurs/[id]`)

En-tête : avatar, prénom, e-mail, téléphone, statut, forfait, étiquettes, et les actions rapides (Offrir un abonnement, Réinitialiser le mot de passe, Suspendre / Réactiver, menu « Plus »).
Si le compte est suspendu : bandeau rouge avec le motif, la date et la fin de la suspension.

Onglets :

| Onglet | Contenu | Actions |
|---|---|---|
| **Profil** | Prénom, e-mail (confirmé ou non), téléphone, pays, langue, centres d'intérêt, date et version du consentement aux conditions, inscription, dernière connexion, identifiant | Modifier prénom / téléphone / pays / langue · Confirmer l'e-mail manuellement · Note interne (visible des seuls admins) |
| **Abonnement & paiements** | Forfait actuel et date de fin, historique des abonnements (origine : offert / paiement / test), paiements (montant, statut, opérateur, date), dons | Offrir un abonnement (Racines / Héritage, 7, 30, 90, 365 jours ou sans fin, note) · Retirer un abonnement actif |
| **Sécurité** | 2 étapes activée ou non, appareils de confiance (nom, validé le, dernière activité, appareil actif), blocage en cours, derniers événements de sécurité (connexions réussies, échecs, blocages) | Envoyer l'e-mail de réinitialisation du mot de passe · Désactiver la vérification en 2 étapes (téléphone perdu) · Oublier les appareils (le prochain appareil redemandera un code e-mail) · Débloquer la connexion · Déconnecter de partout · Compte de démonstration store (oui / non) |
| **Famille** | Profils enfants (prénom, âge, couleur, Découverte activée, limite d'écran indicative), code parent défini oui/non | Lecture seule (le parent gère ses enfants dans l'app) |
| **Communauté & activité** | Pseudo, bannissement, nombre de publications, boutique Marché, quiz réalisés (nombre, score moyen) | Bannir de la communauté (motif obligatoire) / lever le bannissement |
| **Journal** | Toutes les actions d'administration faites sur ce compte | — |

**Zone sensible** (en bas de la fiche, rouge) : **Supprimer définitivement le compte**. Confirmation en retapant l'e-mail. Même effet que la suppression faite par l'utilisateur dans l'app : toutes les données liées disparaissent (cascade), les photos du stockage sont effacées, les paiements sont conservés anonymisés pour la comptabilité.

---

## 5. Règles des actions

| Action | Effet réel | Confirmation |
|---|---|---|
| Suspendre | Bannissement Supabase (durée : 24 h, 7 j, 30 j ou jusqu'à réactivation) + déconnexion de toutes les sessions. La personne ne peut plus se connecter ; l'app et le site affichent « Ce compte est suspendu ». Motif obligatoire, conservé dans `app_metadata` | Oui |
| Réactiver | Lève le bannissement, efface le motif | Non |
| Déconnecter de partout | Supprime les sessions et jetons de rafraîchissement : chaque appareil est renvoyé à la connexion au plus tard à l'expiration du jeton en cours (1 h) | Oui |
| Désactiver la 2e étape | Supprime le facteur et les essais ; la personne pourra la réactiver depuis son profil (si elle est obligatoire, l'app la lui redemandera) | Oui |
| Oublier les appareils | Vide les appareils de confiance et l'appareil actif ; la prochaine connexion redemande le code e-mail | Oui |
| Débloquer la connexion | Efface le compteur d'échecs (mot de passe et code 2 étapes) | Non |
| Réinitialisation du mot de passe | Envoie l'e-mail habituel de Supabase ; l'admin ne voit ni ne choisit jamais le mot de passe | Non |
| Confirmer l'e-mail | Marque l'e-mail confirmé (personne qui ne reçoit pas le code) | Oui |
| Modifier le profil | Prénom (1 à 40 caractères), téléphone (unique, 8 à 15 chiffres), pays, langue (fr / en) | Non |
| Offrir / retirer un abonnement | Même mécanisme que l'écran Abonnements (`offrir_abonnement`) | Retrait : oui |
| Bannir de la communauté | `is_banned` + motif ; ses publications disparaissent du fil public | Oui |
| Démo store | Ajoute / retire de `comptes_revue_store` (exemption de vérification d'appareil pour les testeurs Google) | Non |
| Supprimer le compte | Voir § 4 | Retaper l'e-mail |
| Export CSV | Fichier téléchargé, action journalisée | Non |

**Garde-fous**
- Un compte présent dans `admin_users` ne peut être ni suspendu, ni supprimé, ni déconnecté de partout depuis ce module, et un administrateur ne peut pas agir ainsi sur son propre compte.
- Toutes les actions passent par le serveur du back-office (clé service_role), revérifient l'administrateur et revalident les données, quoi qu'ait envoyé le navigateur.
- Jamais affichés : mot de passe, secret 2 étapes, code PIN parent, jetons.
- Chaque action réussie est écrite dans `admin_activity_log` avec l'e-mail du compte concerné.

---

## 6. Base de données : `schema-utilisateurs-admin.sql`

Script idempotent, à exécuter une fois dans le SQL Editor :
1. Table `admin_notes_utilisateurs` (user_id → auth.users en cascade, note ≤ 2 000 caractères, auteur, date). RLS activée, aucune policy : lisible uniquement par le back-office.
2. Fonction `admin_revoquer_sessions(uuid)` : supprime les sessions et jetons de rafraîchissement du compte. Exécutable seulement par `service_role`.

Sans ce script, le module fonctionne ; seules la note interne et la déconnexion de partout affichent « exécutez le script ».

---

## 7. Côté app et site (petits ajouts)

- Message clair à la connexion d'un compte suspendu : « Ce compte est suspendu. Contacte le support AFROBACK. » (FR / EN), au lieu du message technique de Supabase (`User is banned`).

---

## 8. Interface

- Même identité que le module Paramètres : thème sombre AFROBACK, cartes arrondies, or et terracotta, titres Cinzel.
- Liste : tableau aéré, lignes cliquables, survol doré, pastilles de forfait colorées (Découverte gris, Racines or, Héritage terracotta).
- Fiche : en-tête carte avec avatar, onglets, actions en boutons ; confirmations dans une fenêtre modale ; résultat dans un message temporaire (toast).
- Lisible en largeur réduite (tableau qui masque les colonnes secondaires).

---

## 9. Architecture technique

- `lib/utilisateurs.ts` : chargement et assemblage côté serveur (liste complète paginée de `auth.users`, puis jointure en mémoire avec les tables ci-dessus), calcul du statut et du forfait.
- `app/(admin)/utilisateurs/page.tsx` (serveur) + `UtilisateursListe.tsx` (client : recherche, filtres, tri, pagination, export).
- `app/(admin)/utilisateurs/[id]/page.tsx` (serveur) + `FicheUtilisateur.tsx` (client : onglets, actions, modales).
- `app/(admin)/utilisateurs/actions.ts` : actions serveur (une par ligne du § 5).
- `utilisateurs.module.css`.
- Menu : entrée « Utilisateurs » activée.

**Limite de volume** : la liste charge tous les comptes en une fois (rapide jusqu'à quelques milliers). Au-delà de ~5 000 comptes, passer à une recherche paginée côté base (vue SQL dédiée). Signalé, pas nécessaire aujourd'hui.

---

## 10. Limites honnêtes

- Déconnecter de partout ou suspendre coupe le rafraîchissement de session immédiatement, mais un jeton déjà délivré reste valable jusqu'à son expiration (1 h maximum). C'est le fonctionnement de Supabase.
- Les événements de sécurité sont enregistrés par identifiant de connexion (téléphone ou e-mail) : un échec saisi avec une faute de frappe ne remonte pas sur la fiche.
- Les fichiers du stockage sont effacés à la suppression ; une adresse de fichier copiée avant reste inaccessible ensuite (fichier supprimé).

---

## 11. Critères d'acceptation

1. Retrouver un compte par e-mail, téléphone (avec ou sans +237) ou prénom en moins de 2 secondes.
2. Les chiffres clés correspondent aux données (total = nombre de comptes, abonnés = abonnements actifs).
3. Suspendre un compte de test : la connexion dans l'app échoue avec le message « compte suspendu » ; réactiver : la connexion refonctionne.
4. Désactiver la 2e étape d'un compte de test : la connexion ne demande plus le code.
5. Oublier les appareils : la connexion suivante redemande le code e-mail.
6. Offrir un abonnement depuis la fiche : le forfait change dans la liste et dans l'app.
7. Supprimer un compte de test : il disparaît de la liste, ses paiements restent (anonymes).
8. Chaque action apparaît dans l'onglet Journal de la fiche et dans Paramètres → Journal.
9. Impossible de suspendre ou supprimer un administrateur.

---

## 12. À faire par Yannick

1. Exécuter `app-mobile/mobile-app/supabase/schema-utilisateurs-admin.sql` dans le SQL Editor de Supabase.
2. Tester les critères du § 11 sur un compte de test, pas sur un vrai utilisateur.

---

## 13. État d'implémentation (2026-10-10)

- Développé et en ligne sur le back-office : liste (chiffres clés, graphique, recherche, filtres, tri, pagination, export CSV journalisé) et fiche (6 onglets, toutes les actions du § 5, garde-fous, confirmations, journal).
- Lecture testée sur les vraies données (8 comptes, chargement en 1,7 s). Rendu contrôlé sur données fictives.
- Message « compte suspendu » ajouté dans l'app (prochaine version) et le site (prochain déploiement).
- Constat : le compte de démonstration Google (`googleR`) n'a **aucun abonnement** en base, d'où le forfait Découverte. À offrir depuis sa fiche.
- Reste à faire par Yannick : exécuter `schema-utilisateurs-admin.sql` (note interne, déconnexion de partout) puis dérouler les tests du § 11 sur un compte de test.
