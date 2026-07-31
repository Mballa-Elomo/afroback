# Modèle de données — Pilier Communauté & Abonnement (volet Communauté) (app mobile AFROBACK)

> **Statut : validé par Yannick le 2026-07-30**, en suivant les trois recommandations du chef de projet (voir section 4). Rédigé en préparation du développement du pilier Communauté, 3e pilier à construire après Histoires & Héros et Découverte.
>
> Ce document couvre le schéma de données et les specs fonctionnelles. Le schéma Postgres réel est dans `supabase/schema-communaute.sql` (pas de "seed" au sens contenu : c'est de l'UGC, pas du contenu éditorial). Les specs d'écran sont dans `specs-phase3-communaute.md`, même dossier.

---

## 1. Ce que dit déjà `context/AFROBACK.md` sur ce pilier

- Le pilier est nommé **"Communauté & Abonnement"** dans les 5 piliers déjà arbitrés (site vitrine), actuellement "bientôt disponible" partout.
- Inventaire de la maquette `AFROBACK Mobile.dc.html` (lu lors d'une session antérieure, non revérifié dans cette session — `DesignSync` toujours indisponible, voir section 4.1) : **"Communauté (fil + détail de post / création de post / profil membre / signalement / charte)"**.
- Ce pilier est plus sensible que Histoires & Héros ou Découverte : ces deux-là sont du **contenu éditorial contrôlé** (produit par les agents griot/découverte, jamais par un utilisateur). Communauté introduit du **contenu généré par les utilisateurs** (UGC) : posts, commentaires, signalements — donc un vrai sujet de modération, de sécurité et de vie privée, qui n'existait pas jusqu'ici sur AFROBACK.

---

## 2. Schéma de données proposé (Postgres/Supabase)

### Table `community_profiles`

Profil public affiché dans la communauté, distinct du compte d'authentification (`auth.users`, déjà en place pour téléphone + mot de passe).

| Champ | Type | Description | Obligatoire |
|---|---|---|---|
| `id` | `uuid` (PK) | Identifiant du profil | Oui |
| `user_id` | `uuid` (FK → `auth.users`, unique) | Lien vers le compte réel, jamais exposé publiquement | Oui |
| `pseudo` | `text` (unique) | Nom affiché publiquement, demandé explicitement à la création du profil ("choisis ton pseudo AFROBACK") — **pseudonymat structuré, décision validée le 2026-07-30 (4.3, option B)** | Oui |
| `avatar_url` | `text` | Avatar (upload utilisateur ou choix parmi un set proposé par AFROBACK) | Optionnel |
| `bio` | `text` | Courte présentation, limitée en longueur | Optionnel |
| `is_banned` | `boolean` | Compte banni de la communauté (contenu passé conservé mais masqué du public, pas supprimé, pour garder la trace en cas de récidive) | Oui, défaut `false` |
| `ban_reason` | `text` | Motif du bannissement, pour trace interne | Optionnel |
| `created_at` | `timestamptz` | | Oui |

**Note de confidentialité (RLS)** : `user_id` ne doit jamais être lisible par un autre membre que le propriétaire du profil, même s'il ne contient pas directement le numéro de téléphone — c'est la clé qui permettrait de relier un profil communautaire à un compte d'authentification précis. La lecture publique passe par une **vue** `community_profiles_public` qui n'expose que `id, pseudo, avatar_url, bio, created_at` (jamais `user_id`, `is_banned`, `ban_reason`) ; voir le SQL en section 6.

### Table `community_posts`

| Champ | Type | Description | Obligatoire |
|---|---|---|---|
| `id` | `uuid` (PK) | | Oui |
| `author_id` | `uuid` (FK → `community_profiles`) | | Oui |
| `contenu_texte` | `text` | Corps du post, longueur maximale à définir (ex. 500 caractères) | Oui |
| `image_url` | `text` | Image jointe optionnelle | Optionnel |
| `statut` | `enum` (`publie`, `masque_filtre_auto`, `masque_signalement`, `supprime`) | Fixé automatiquement par un trigger à l'insertion (filtre de mots-clés) puis mis à jour manuellement par la modération — **post-modération + signalement, décision validée le 2026-07-30 (4.2, option B)**, flux détaillé en section 3 | Oui, défaut `publie` |
| `nb_signalements` | `integer` | Compteur dénormalisé, pour prioriser la file de modération | Oui, défaut 0 |
| `created_at` / `updated_at` | `timestamptz` | | Oui |

### Table `community_comments`

Même structure que `community_posts`, avec `post_id` (FK) en plus. Pas de commentaires imbriqués (pas de réponse à un commentaire) pour la V1, pour rester simple à modérer et à afficher.

### Table `community_reports`

| Champ | Type | Description | Obligatoire |
|---|---|---|---|
| `id` | `uuid` (PK) | | Oui |
| `target_type` | `enum` (`post`, `commentaire`, `profil`) | | Oui |
| `target_id` | `uuid` | ID du post/commentaire/profil signalé | Oui |
| `reporter_id` | `uuid` (FK → `community_profiles`) | Qui signale — jamais visible par l'auteur signalé | Oui |
| `motif` | `enum` (`contenu_inapproprie`, `harcelement`, `desinformation`, `spam`, `autre`) | Reprend les motifs classiques des chartes communautaires | Oui |
| `description` | `text` | Détail libre du signalant | Optionnel |
| `statut` | `enum` (`en_attente`, `traite_action`, `traite_rejete`) | | Oui, défaut `en_attente` |
| `traite_par` | `text` | Trace de qui a tranché (Yannick au démarrage) | Optionnel |
| `created_at` / `resolved_at` | `timestamptz` | | Oui / Optionnel |

### Charte communautaire

Pas de table dédiée pour la V1 : la charte est un **contenu statique versionné dans le code** (comme les écrans CGU/confidentialité déjà prévus dans la maquette), pas une donnée éditable en base. Plus simple, et une charte ne doit pas changer souvent sans que les membres en soient informés explicitement. Un brouillon de charte est proposé en section 5, à valider par Yannick.

---

## 3. Flux de modération recommandé (à valider, voir décision 4.2)

Recommandation du chef de projet, détaillée pour que Yannick puisse trancher en connaissance de cause :

1. **Publication immédiate** (pas de pré-validation manuelle) : un post/commentaire passe d'abord par un **filtre automatique basique** (liste de mots interdits — insultes graves, incitation à la haine, spam évident). S'il matche, il est bloqué avant publication (`statut = masque_filtre_auto`) et l'auteur voit un message clair plutôt qu'un post qui disparaît silencieusement.
2. **Le reste est publié immédiatement**, visible par tous.
3. **Modération a posteriori sur signalement** : tout membre peut signaler un post/commentaire/profil (écran "signalement" déjà prévu dans la maquette). Le signalement va dans `community_reports`, `statut = en_attente`.
4. **Yannick traite la file de signalements manuellement** (seul modérateur au démarrage, cohérent avec son statut de solo entrepreneur) : il peut masquer/supprimer le contenu, bannir l'auteur en cas de récidive, ou rejeter le signalement si infondé.

**Pourquoi cette option plutôt que d'autres** : une pré-modération manuelle systématique (tout post attend validation de Yannick avant d'apparaître) casserait l'expérience "communauté vivante" et n'est pas tenable dès que le volume dépasse quelques posts par jour — un fil qui met des heures à afficher un post perd tout son intérêt social. À l'inverse, aucune modération du tout expose AFROBACK à du contenu toxique non maîtrisé. Le filtre automatique + signalement + revue manuelle est le compromis standard des communautés qui démarrent avec une seule personne côté modération.

**Ce que ça implique concrètement pour Yannick** : un post évident (insulte grave, spam) est bloqué automatiquement sans qu'il ait à intervenir. Pour tout le reste, il doit s'attendre à consulter une file de signalements régulièrement (pas nécessairement quotidienne au tout début vu le volume attendu), pas à valider chaque post avant publication.

**Deux autres options existent, présentées pour arbitrage complet en section 4.2.**

---

## 4. Décisions — validées par Yannick le 2026-07-30

### 4.1 Blocage technique : fidélité à la maquette — toujours ouvert

`DesignSync` reste indisponible dans cette session (revérifié une 3e fois). Même règle que pour le pilier Découverte, tranchée par Yannick le 2026-07-30 (Option A) : **aucun écran RN codé pour Communauté tant qu'une session avec `DesignSync` n'est pas disponible.** Seules les specs fonctionnelles (`specs-phase3-communaute.md`) avancent en attendant.

### 4.2 Modération — Option B retenue

**Post-modération + signalement** : publication immédiate, filtre automatique basique (mots-clés) qui bloque les cas évidents à l'insertion, le reste passe par signalement des membres + revue manuelle de Yannick. Flux détaillé en section 3. Option C (modération automatique renforcée par API dédiée) reste une évolution possible si le volume dépasse ce qu'une revue manuelle solo peut absorber — pas nécessaire pour le lancement.

### 4.3 Pseudonymat — Option B retenue

**Pseudonymat structuré** : un pseudo est demandé explicitement à la création du profil, le numéro de téléphone n'est jamais exposé publiquement (déjà vrai techniquement, renforcé par la vue `community_profiles_public`, voir section 6), le compte réel reste traçable en interne pour la modération (bannissement d'un récidiviste).

### 4.4 Séquencement avec le modèle économique — indépendant

Communauté **s'ouvre à tous les comptes dès le départ**, y compris le forfait gratuit Découverte, sans attendre le séquencement d'activation abonnement/marketplace/sponsors (toujours en points bloquants côté modèle économique, mais ça ne bloque plus ce pilier).

---

## 5. Brouillon de charte communautaire (à valider, pas encore un contenu définitif)

> Registre cohérent avec le reste d'AFROBACK : chaleureux, digne, jamais moralisateur. Ce texte est un premier jet à ajuster par Yannick, pas une version finale.

**Bienvenue dans la communauté AFROBACK**

AFROBACK est un espace pour célébrer, apprendre et transmettre la richesse des cultures africaines. Ici, chaque histoire partagée, chaque question posée, chaque souvenir raconté nourrit une mémoire collective. Pour que cet espace reste digne de ce qu'il célèbre, quelques règles simples :

1. **Respecte les personnes et les cultures.** Les désaccords existent, les insultes n'ont pas leur place. On ne se moque pas d'une tradition, d'une langue ou d'une origine.
2. **Partage avec honnêteté.** Ne présente pas une rumeur ou une opinion comme un fait établi. Si tu n'es pas sûr, dis-le.
3. **Pas de haine, pas de harcèlement.** Contenu raciste, sexiste, homophobe ou tout appel à la violence : suppression immédiate et bannissement possible.
4. **Pas de spam ni de publicité non sollicitée.** Ce n'est pas une vitrine commerciale.
5. **Protège ta vie privée et celle des autres.** Ne partage pas d'informations personnelles (numéro, adresse) sans consentement.
6. **Signale plutôt que de réagir seul.** Un contenu qui te semble poser problème ? Utilise le bouton de signalement, l'équipe AFROBACK (Yannick, au démarrage) le traite.

*Le non-respect de cette charte peut entraîner le masquage d'un contenu ou, en cas de récidive ou de gravité, un bannissement de la communauté.*

---

## 6. Notes techniques sur le SQL réel (`supabase/schema-communaute.sql`)

Le fichier SQL applique les décisions ci-dessus concrètement :

- **Vue publique `community_profiles_public`** : seule vue interrogée par l'app pour afficher un profil (fil, détail de post, profil membre). N'expose jamais `user_id`, `is_banned`, `ban_reason`. Un profil banni disparaît de cette vue (filtre `where not is_banned`), donc ses posts passés restent visibles avec un auteur non résolu plutôt que de casser l'affichage — comportement à confirmer avec le pôle dev à l'implémentation UI.
- **Filtre automatique = trigger `before insert`** sur `community_posts` et `community_comments`, pas une vérification côté app : une regex sur une liste de mots interdits (fournie en placeholder, à enrichir) positionne `statut = 'masque_filtre_auto'` si ça matche, `'publie'` sinon. Choix délibéré : un trigger ne peut pas être contourné en appelant l'API Supabase directement, contrairement à une validation uniquement côté client.
- **RLS `community_posts`/`community_comments`** : lecture publique limitée aux lignes `statut = 'publie'`, plus les lignes de l'auteur connecté quel que soit leur statut (pour qu'il comprenne pourquoi son post a été masqué). Écriture (insert) limitée à son propre `author_id`. Pas d'update/delete direct par l'app : les changements de statut passent par la modération (dashboard Supabase / futur back-office avec `service_role`, qui bypass RLS).
- **RLS `community_reports`** : aucune lecture publique, même pas pour l'auteur du signalement (pour ne pas exposer les signalements des autres, et parce que le signalant n'a pas besoin de suivre le traitement en V1). Insertion ouverte à tout membre connecté sur son propre `reporter_id`. Lecture/traitement réservés à `service_role` — c'est-à-dire Yannick via le dashboard Supabase (Table Editor / SQL Editor) au démarrage, remplaçable par un vrai écran back-office plus tard (voir section back-office dans `context/AFROBACK.md`).
- **`community_profiles`** : insertion limitée à son propre `user_id` (un membre crée un seul profil, contrainte unique). Update limité à ses propres colonnes non sensibles (`pseudo`, `avatar_url`, `bio`) par le propriétaire ; `is_banned`/`ban_reason` non modifiables par l'app, réservés à `service_role`.

---

*Prochaine étape : coder l'UI (fil, détail de post, création de post, profil membre, signalement, charte) dès qu'une session avec `DesignSync` est disponible pour lire fidèlement la maquette. En attendant, les specs fonctionnelles sont dans `specs-phase3-communaute.md`.*
