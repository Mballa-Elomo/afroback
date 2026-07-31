# Specs fonctionnelles — Phase 3 "Communauté" (app mobile AFROBACK)

> Rédigé par le chef de projet AFROBACK le 2026-07-30, destiné au pôle dev de Madou Consulting. Couvre les 6 écrans du pilier Communauté repérés dans la maquette `AFROBACK Mobile.dc.html` : fil, détail de post, création de post, profil membre, signalement, charte. S'appuie sur `data-model-communaute.md` (modèle de données, décisions de modération/pseudonymat/séquencement) et `supabase/schema-communaute.sql` (schéma réel).
>
> Périmètre : specs fonctionnelles et UX, pas d'implémentation ni de layout pixel-perfect. `DesignSync` indisponible dans cette session (revérifié) : le layout exact, les couleurs et la typographie de ces écrans restent à lire sur la maquette avant tout code UI (voir `context/AFROBACK.md`, règle déjà appliquée au pilier Découverte). Ce document ne doit donc pas servir de base à un design "best effort" : il décrit le comportement, pas l'apparence.

---

## 0. Contexte produit

Communauté est le 3e pilier de contenu du produit, et le premier à reposer sur du **contenu généré par les utilisateurs** plutôt que sur du contenu éditorial produit par AFROBACK. Décisions déjà validées (2026-07-30, voir `data-model-communaute.md` §4) :
- **Modération** : post-modération + signalement (publication immédiate, filtre auto basique à l'insertion, revue manuelle de Yannick sur signalement).
- **Identité** : pseudonymat structuré (pseudo demandé à la création, jamais le numéro de téléphone).
- **Accès** : ouvert à tous les comptes dès le lancement, y compris le forfait gratuit, indépendamment du séquencement du modèle économique.

**Prérequis avant le premier accès à un écran Communauté** : un compte qui n'a pas encore de `community_profiles` doit être invité à créer son profil (choisir un pseudo, avatar optionnel) avant de pouvoir publier — mais peut consulter le fil en lecture seule sans profil (voir écran 1).

---

## 1. Écran "Fil"

**Objectif** : donner un aperçu vivant de la communauté, inciter à s'y engager (lire, réagir, publier) sans donner l'impression d'un flux modéré au compte-goutte.

**Contenu et layout**
- Liste de posts publiés (`community_posts` où `statut = 'publie'`, plus les posts de l'utilisateur connecté quel que soit leur statut — voir note ci-dessous), scroll vertical, tri anté-chronologique par défaut.
- Chaque carte de post : pseudo + avatar de l'auteur (via `community_profiles_public`, jamais une donnée d'identité réelle), texte du post (tronqué si long, "lire la suite" → écran détail), image si présente, horodatage relatif ("il y a 2h"), nombre de commentaires, bouton signalement discret (icône, pas un texte alarmant en pleine carte).
- Bouton flottant ou en en-tête "Publier" → écran "Création de post".
- Pas de système de réaction type "like" en V1 (non spécifié dans la maquette à ce stade de l'inventaire, et ça ajoute une table/complexité de plus) — à confirmer si la maquette en montre un une fois `DesignSync` disponible.

**État "post masqué automatiquement" (`statut = masque_filtre_auto`)**
- N'apparaît dans le fil de personne d'autre que son auteur. Sur son propre fil/profil, l'auteur voit son post avec un message clair ("Ce post a été masqué automatiquement, il ne respecte peut-être pas la charte communautaire") plutôt qu'un post qui semble avoir disparu silencieusement — cohérent avec la règle déjà actée sur AFROBACK de ne jamais laisser un utilisateur face à un comportement inexpliqué.

**Accès sans profil communautaire**
- Un compte sans `community_profiles` peut consulter le fil (lecture publique via RLS), mais toute tentative de publier/commenter/signaler déclenche l'invite de création de profil (pseudo + avatar), pas un blocage muet.

**États**
- Vide (communauté qui démarre, aucun post) : message éditorial engageant ("Sois parmi les premiers à partager") plutôt qu'un écran vide non assumé.
- Chargement : skeleton cards, cohérent avec le pattern déjà utilisé sur le catalogue héros.
- Hors-ligne : au minimum les posts déjà chargés en cache de session, pas de publication possible hors-ligne (pas de file d'attente offline en V1).

---

## 2. Écran "Détail de post"

**Objectif** : lire un post en entier, ses commentaires, et pouvoir réagir.

**Contenu et layout**
- Post complet (texte intégral, image), auteur, horodatage.
- Liste des commentaires (`community_comments` où `statut = 'publie'`, plus les siens), tri chronologique (du plus ancien au plus récent, logique de conversation).
- Zone de saisie de commentaire en bas d'écran, avec le même filtre auto que les posts (transparent pour l'utilisateur : soit ça passe, soit il voit le message "masqué automatiquement").
- Bouton signalement sur le post ET sur chaque commentaire individuellement (le signalement cible un `target_type` précis, `post` ou `commentaire`).
- Tap sur le pseudo/avatar d'un auteur → écran "Profil membre".

**Cas limite** : post supprimé/masqué par signalement pendant que quelqu'un le consulte (course de concurrence) → message clair ("Ce post n'est plus disponible") plutôt qu'une erreur technique brute.

---

## 3. Écran "Création de post"

**Objectif** : publier simplement, sans friction, tout en rappelant la charte au bon moment (pas juste dans un lien perdu en bas de page).

**Contenu et layout**
- Zone de texte (limite 500 caractères, compteur visible), ajout d'image optionnel.
- Rappel court et non culpabilisant de la charte au-dessus du champ (ex. "Reste bienveillant, tu représentes une communauté qui célèbre nos cultures") plutôt qu'un pavé de règles à chaque publication — la charte complète reste accessible via son propre écran.
- Bouton "Publier", désactivé tant que le champ est vide.
- **Si le compte n'a pas encore de `community_profiles`** : l'écran s'ouvre par la création de profil (pseudo obligatoire, avatar optionnel) avant de pouvoir continuer vers la rédaction du post — un seul flux, pas un aller-retour entre deux écrans séparés.

**Retour après publication**
- Si le post passe le filtre auto : retour au fil, post visible en tête, confirmation discrète (pas de pop-up intrusif).
- Si le post est bloqué par le filtre auto : message clair avant même de considérer la publication "faite" — l'auteur sait immédiatement que son post est masqué, pas de fausse impression de succès.

---

## 4. Écran "Profil membre"

**Objectif** : voir le profil public d'un membre (soi-même ou un autre), ses posts.

**Contenu et layout**
- Pseudo, avatar, bio (`community_profiles_public`).
- Liste de ses posts publiés (pas ses posts masqués, sauf si c'est son propre profil consulté par lui-même).
- **Aucune information permettant de remonter à l'identité réelle** (pas de numéro de téléphone, pas de nom légal) — cohérent avec la décision de pseudonymat structuré.
- Si c'est son propre profil : accès à l'édition (pseudo, avatar, bio) et un indicateur clair si le compte est banni (`is_banned`, lu depuis sa propre ligne complète, pas la vue publique).
- Bouton signalement sur le profil (cible `target_type = 'profil'`), pour signaler un comportement global plutôt qu'un post précis (harcèlement répété, usurpation de pseudo...).

---

## 5. Écran "Signalement"

**Objectif** : signaler rapidement sans que ça devienne un formulaire dissuasif, tout en captant assez d'info pour que Yannick puisse trancher vite.

**Contenu et layout**
- Contexte du signalement affiché (aperçu du post/commentaire/profil concerné, pour confirmation visuelle avant envoi).
- Choix du motif parmi la liste fixe (`contenu_inapproprie`, `harcelement`, `desinformation`, `spam`, `autre`), boutons ou liste à sélection unique plutôt qu'un champ libre en premier (accélère le tri côté modération).
- Champ de description libre optionnel (utile surtout pour "autre" ou pour préciser un cas ambigu).
- Bouton "Envoyer le signalement", confirmation immédiate ("Merci, notre équipe va l'examiner") — **pas de retour ultérieur automatique sur le statut du signalement** (décision du schéma : pas de lecture possible des signalements par le signalant lui-même en V1, voir `data-model-communaute.md` §6). Le message de confirmation doit donc être honnête sur ce point, sans promettre un suivi qui n'existe pas encore.

---

## 6. Écran "Charte"

**Objectif** : rendre la charte lisible et consultable à tout moment, pas juste imposée une fois à l'inscription.

**Contenu et layout**
- Texte complet de la charte communautaire (brouillon dans `data-model-communaute.md` §5, à valider par Yannick avant intégration définitive — pas encore un contenu final).
- Accessible depuis : le rappel court sur l'écran de création de post (lien "voir la charte complète"), le profil/paramètres, et idéalement présentée une première fois de façon plus appuyée à la toute première visite du pilier Communauté (pattern déjà vu pour les CGU/confidentialité dans la maquette).
- Contenu statique (pas de table dédiée, versionné dans le code) — voir justification dans `data-model-communaute.md` §2.

---

## 7. Dépendances et points ouverts à anticiper

- **Filtre automatique livré vide** (`community_banned_terms`) : tant que Yannick n'a pas alimenté cette table (ou fait évoluer vers l'option C, une vraie API de modération), le filtre ne bloque rien à l'insertion — la protection réelle au lancement repose entièrement sur le signalement + la revue manuelle. À ne pas présenter comme une modération automatique robuste tant que ce n'est pas fait.
- **Pas de back-office de modération dédié pour l'instant** : Yannick traite les signalements via le dashboard Supabase (Table Editor/SQL Editor) au lancement. Le back-office d'administration AFROBACK évoqué dans `context/AFROBACK.md` pourrait à terme inclure un écran de modération dédié — pas scopé ni priorisé à ce jour.
- **Pas de notifications push** (nouveau commentaire, signalement traité...) en V1 — hors périmètre de ce document, à évaluer séparément.
- **Fidélité maquette** : ce document décrit le comportement attendu, pas le layout exact. Le code UI ne doit démarrer qu'après lecture de la maquette via `DesignSync`.
