# Cahier des charges : Commentaires façon YouTube + sections repliables

> Rédigé le 2026-09-30. **Validé et développé le même jour** : D1 à D4 selon les recommandations. Vérifié (typage, `expo-doctor` 18/18, build back-office, sections repliables testées en ligne) et publié. **Commentaires actifs après exécution de `supabase/schema-commentaires.sql`** (d'ici là le bloc reste masqué). Non testé avec de vrais comptes.
>
> Livré : `supabase/schema-commentaires.sql`, `src/comments/` (API + composant), `Collapsible` dans `src/ui/modern.tsx`, intégration fiche héros / lecteur vidéo / mythe / Découverte (et écrans verrouillés en lecture), page back-office `/commentaires`.

## 1. Ce que veut Yannick

1. Pouvoir **commenter chaque contenu** (héros, mythe, fiche Découverte), y compris ses vidéos, **exactement comme sur YouTube** : commenter, **répondre** à un commentaire, **aimer** un commentaire.
2. Alléger les fiches : certaines sections **repliées par défaut**, dépliables d'un toucher :
   - Frise chronologique
   - Sources
   - Citations marquantes
   - Légendes associées

## 2. Sections repliables

- Chaque section devient une **carte repliable** : titre + icône + nombre d'éléments (ex. « Frise chronologique · 8 dates ») + flèche qui pivote.
- **Repliées par défaut**, animation d'ouverture douce. Un aperçu discret (ex. première date de la frise) donne envie d'ouvrir.
- Le récit, le bouton « Lire le récit » et les actions Écouter/Regarder restent toujours visibles.
- Appliqué à la fiche héros ; les sections équivalentes des mythes (sources) et de la Découverte (sources, faits à vérifier) suivent la même règle.

## 3. Commentaires : ce que voit l'internaute (modèle YouTube)

**Sous chaque contenu** (fiche héros, fiche mythe, fiche Découverte) et **sous le lecteur vidéo**, un bloc :

1. **Aperçu replié** (comme YouTube mobile) : « Commentaires · 24 » + le commentaire le plus apprécié en une ligne. Un toucher ouvre le fil complet.
2. **Fil complet** :
   - Tri : **Les plus pertinents** (par défaut, j'aime + réponses) / **Les plus récents**.
   - Champ « Ajouter un commentaire… » avec ta photo/avatar.
   - Chaque commentaire : photo/avatar + @pseudo + « il y a 2 h » + texte (« Lire la suite » au-delà de 4 lignes) + **👍 J'aime (compteur)** + **Répondre** + menu ⋯ (Modifier / Supprimer si c'est le mien, Signaler sinon).
   - **Réponses** : un seul niveau d'imbrication comme YouTube. « ▾ 3 réponses » déplie les réponses ; répondre à une réponse mentionne automatiquement @pseudo.
   - Mention « (modifié) » si le texte a été édité ; commentaire supprimé qui a des réponses → « Commentaire supprimé » (les réponses restent).
   - Badge **Auteur/AFROBACK** pour l'équipe (comptes administrateurs).
3. **Invité** : lit les commentaires ; toucher « Ajouter un commentaire » ou « J'aime » ouvre la fenêtre « Crée ton compte ».
4. **Contenu réservé aux abonnés** : les commentaires suivent l'accès au contenu (voir D2).

## 4. Modération et sécurité

- **Filtre automatique** : réutilise la liste de mots interdits de la Communauté (`community_banned_terms`), appliquée côté serveur.
- **Signalement** : réutilise le mécanisme de signalement de la Communauté ; au-delà de 3 signalements, le commentaire est masqué en attendant une décision.
- **Anti-spam** : 10 commentaires maximum par 10 minutes et par compte ; 2 000 caractères maximum.
- **Back-office** : nouvelle page « Commentaires » (derniers commentaires, signalés en premier, supprimer / rétablir).
- Toutes les règles sont côté serveur (RLS + fonctions), pas seulement dans l'app.

## 5. Fonctionnement technique

- **Pseudo et photo** : ceux du profil communautaire déjà créé à l'inscription (aucun nouveau profil).
- Tables : `content_comments` (type de contenu, slug, auteur, parent éventuel, texte, dates, statut) et `content_comment_likes` (un j'aime par personne et par commentaire). Compteurs de j'aime et de réponses tenus à jour par le serveur.
- Un **même fil par contenu** : les commentaires sous la vidéo d'un héros et ceux de sa fiche sont les mêmes (comme une vidéo YouTube = un seul fil).
- Chargement par pages de 20, réponses chargées à la demande : pas de lenteur même avec beaucoup de commentaires.
- **Mise à jour optimiste** : le j'aime et le commentaire publié apparaissent instantanément.

## 6. Hors périmètre (plus tard)

- Notifications (« X a répondu à ton commentaire »).
- Commentaires épinglés par l'équipe, cœur de l'auteur.
- « Je n'aime pas ».

## 7. Découpage

1. Sections repliables (fiche héros, mythe, Découverte).
2. Serveur : tables, règles, filtre, signalement, anti-spam.
3. App : bloc commentaires (aperçu + fil + réponses + j'aime + tri + modifier/supprimer/signaler) sous les fiches et sous le lecteur vidéo.
4. Back-office : page de modération.

## 8. Décisions à valider

| # | Question | Recommandation |
|---|---|---|
| D1 | **Qui peut commenter et aimer ?** | **Tous les comptes, même gratuits** : le commentaire crée l'engagement et donne envie de s'abonner. (La règle "abonnés seulement" reste pour publier dans la Communauté.) |
| D2 | **Contenu réservé** (ex. Sultan Njoya pour un compte gratuit) : commentaires visibles ? | **Lecture visible, écriture réservée à ceux qui ont accès** : voir la discussion donne envie, commenter sans avoir lu n'a pas de sens. |
| D3 | **« Je n'aime pas »** comme YouTube ? | **Non** pour l'instant : seulement 👍, plus bienveillant pour une plateforme culturelle. |
| D4 | **Back-office de modération** dans ce chantier ? | **Oui**, indispensable dès qu'on ouvre les commentaires au public. |
