# AFROBACK — Back-office : module Communauté (modération)

> Rédigé le 2026-10-15 à la demande de Yannick (« on passe à Communauté »).
> Objectif : pouvoir ouvrir la Communauté au public en restant conforme aux règles de Google Play sur les contenus publiés par les utilisateurs, et protéger les membres.

---

## 1. Objectifs

1. **Traiter un signalement en 10 secondes** : voir le contenu signalé, son auteur et les motifs, puis masquer, supprimer, rejeter ou bannir.
2. **Garder la main sur tout le fil** : chaque publication et chaque commentaire, quel que soit son statut.
3. **Protéger même quand personne ne regarde** : masquage automatique après plusieurs signalements, filtre de mots interdits fiable.
4. **Tout tracer** : qui a modéré quoi, quand et pourquoi.

## 2. Existant (base de données)

- `community_profiles` (pseudo, bio, avatar, banni + motif), `community_posts` et `community_comments` (texte ≤ 500 caractères, image pour les posts, statut : publié / masqué par le filtre / masqué après signalement / supprimé, compteur de signalements), `community_reports` (cible, motif, description, statut, traité par), `community_banned_terms`.
- Volume au 2026-10-15 : 14 profils, 0 publication, 0 signalement.
- Limites constatées :
  - aucun masquage automatique : un contenu signalé reste visible jusqu'à une action humaine ;
  - le filtre cherche le mot interdit n'importe où dans le texte (« con » bloquerait « conte », « Cameroun ») ;
  - un même membre peut signaler plusieurs fois le même contenu (le compteur s'emballe) ;
  - pas de blocage d'un membre par un autre dans l'app (voir § 7).

## 3. Écran `/communaute`

### 3.1 Onglet À modérer (par défaut)
- File des contenus signalés en attente, du plus signalé au moins signalé : extrait du texte et image, auteur (pseudo, lien vers sa fiche Utilisateur), nombre de signaleurs, motifs (inapproprié, harcèlement, désinformation, spam, autre) et descriptions, date.
- Actions sur chaque élément :
  - **Masquer** : le contenu disparaît du fil public (réversible) ; signalements → « traités avec action ».
  - **Supprimer** : statut « supprimé » (définitif pour le public, gardé pour l'historique) ; signalements traités.
  - **Rejeter** : le contenu reste ou redevient visible ; signalements → « rejetés ».
  - **Bannir l'auteur** (motif obligatoire) : profil banni, ses publications disparaissent du fil, contenu masqué, signalements traités.
- Signalements de **profils** : même file, actions Rejeter / Bannir.
- Compteur dans le menu : nombre de contenus en attente.

### 3.2 Onglet Publications
- Tous les posts : filtres par statut (publiés, masqués par le filtre, masqués après signalements, supprimés), recherche (texte, pseudo), tri récent / plus signalés.
- Chaque post : texte, image, auteur, date, nombre de commentaires et de signalements ; dépliage des commentaires.
- Actions : Masquer, Republier, Supprimer, sur le post et sur chaque commentaire.

### 3.3 Onglet Membres
- Profils : pseudo, compte (lien fiche Utilisateur), publications, commentaires, signalements reçus, statut.
- Actions : Bannir (motif) / Lever le bannissement.

### 3.4 Onglet Mots interdits
- Liste éditable (ajout, retrait), recherche.
- **Tester une phrase** : indique si elle serait bloquée, et par quel mot.
- Règle : un mot interdit ne bloque que le mot entier (« con » ne bloque plus « conte »). Les contenus bloqués arrivent en « masqués par le filtre » et restent visibles ici pour vérifier les faux positifs (Republier).

### 3.5 Onglet Réglages
- **Masquage automatique** après N signaleurs différents : 3 par défaut, 0 = désactivé.
- Statistiques : publications et commentaires (7 j, 30 j), signalements en attente, membres actifs, bannis, délai moyen de traitement.

## 4. Base de données : `schema-communaute-moderation.sql`

1. Un même membre ne compte qu'une fois par contenu signalé (comptage des signaleurs différents).
2. Masquage automatique : dès que le nombre de signaleurs différents atteint le seuil (`app_settings.communaute.seuil_masquage`, 3 par défaut), un contenu publié passe en « masqué après signalement ».
3. Filtre de mots interdits au mot entier, insensible à la casse.

## 5. Règles

- Toutes les actions passent par le serveur du back-office (clé service_role), avec revérification de l'administrateur.
- Chaque action est journalisée (`admin_activity_log`) et les signalements gardent `traite_par` (e-mail de l'admin) et `resolved_at`.
- Un contenu n'est jamais effacé de la base par la modération (statut « supprimé ») : l'historique reste disponible en cas de litige. La suppression réelle n'a lieu qu'avec la suppression du compte (cascade).
- Les commentaires sous les contenus (héros, mythes) restent dans le module Commentaires existant.

## 6. Architecture

- `lib/communaute.ts` (lecture, assemblage), `app/(admin)/communaute/` (page, `CommunauteModule.tsx`, `actions.ts`, CSS).
- Menu « Communauté » activé, avec le nombre de contenus à modérer.

## 7. Hors back-office, à prévoir dans l'app et le site (recommandé avant l'ouverture publique)

- **Bloquer un membre** (ne plus voir ses publications) : attendu par Google Play pour les apps avec contenus publiés par les utilisateurs, obligatoire sur l'App Store.
- Lien vers les règles de la communauté depuis l'écran de publication.

## 8. Critères d'acceptation

1. Un contenu signalé par 3 comptes différents disparaît seul du fil public et apparaît dans « À modérer ».
2. Masquer, Supprimer, Rejeter, Bannir changent réellement ce que voient l'app et le site.
3. « con » en mot interdit bloque « espèce de con » mais pas « un conte bamoun ».
4. Chaque action apparaît dans le journal d'activité.

---

## 9. État d'implémentation (2026-10-15)

- Développé et en ligne : `/communaute` (À modérer, Publications, Membres, Mots interdits, Réglages), compteur des signalements en attente dans le menu, journalisation de chaque décision.
- Script `schema-communaute-moderation.sql` livré, à exécuter par Yannick (masquage automatique, signaleurs comptés une fois, filtre au mot entier).
- Rendu vérifié sur les vraies données (14 membres, aucune publication). Les actions de modération n'ont pas pu être essayées faute de contenu.
- Liste de mots interdits vide : le filtre ne bloque rien tant qu'elle n'est pas remplie.
- Reste hors back-office : blocage d'un membre par un autre dans l'app et le site (§ 7).
