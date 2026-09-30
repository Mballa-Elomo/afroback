# Cahier des charges : « J'aime » sur les contenus + compteurs de vues, écoutes et lectures

> Rédigé le 2026-09-30. **Validé (recommandations D1 à D3) et développé le même jour**, vérifié (typage, `expo-doctor` 18/18) et publié. **Actif après exécution de `supabase/schema-jaime-compteurs.sql`** (d'ici là, la ligne de statistiques reste vide et « J'aime » ne répond pas). Livré : `src/stats/` (API + `ContentActions`), badges sur les cartes (`LikeBadge`), intégration fiches héros / mythe / Découverte.

## 1. Ce que veut Yannick

Comme sur YouTube : pouvoir **aimer un contenu** (héros, mythe, fiche Découverte) et **voir ses statistiques publiques** (nombre de lectures, d'écoutes, de vues).

## 2. Ce qui existe déjà (vérifié)

Les compteurs sont **déjà enregistrés en base depuis août 2026** : lectures de récit, écoutes audio (par langue), visionnages vidéo (par chapitre et langue) pour les héros, les mythes et la Découverte (tables `hero_engagement`, `mythe_engagement`, `decouverte_engagement` et leurs détails). Ils ne sont visibles que dans le back-office : l'app ne peut pas encore les lire. Les « J'aime » n'existent pas.

## 3. Ce que voit l'internaute

**Sous le titre de chaque fiche** (héros, mythe, Découverte), une ligne façon YouTube :

> 12,4 k lectures · 3,1 k écoutes · 845 vues

Nombres abrégés (1 200 → 1,2 k ; 1 500 000 → 1,5 M). Une statistique à zéro n'est pas affichée (pas de « 0 vue »).

**Juste en dessous, une rangée d'actions en pastilles** (comme sous une vidéo YouTube) :

- **👍 J'aime · 248** : toucher = aimer / ne plus aimer, doré quand on aime, animation légère. Mise à jour instantanée.
- **💬 Commentaires · 24** : fait défiler jusqu'aux commentaires.
- **↗ Partager** : partage natif (lien du contenu).

**Sur les cartes** (accueil, listes) : un petit « 👍 248 » discret sur les contenus aimés au moins une fois.

**Invité** : voit les compteurs ; toucher « J'aime » ouvre « Crée ton compte ».

## 4. Fonctionnement technique

- Nouvelle table `content_likes` (type de contenu, slug, compte) : un seul J'aime par personne et par contenu.
- Une fonction serveur `stats_contenu(type, slug)` renvoie **d'un coup** : lectures, écoutes, vues, J'aime, « ai-je aimé » ; une autre `stats_contenus(type, slugs[])` pour les listes (une seule requête pour toute une liste, pas une par carte).
- `aimer_contenu(type, slug, aime)` : réservé aux comptes connectés, contrôlé côté serveur.
- Les compteurs actuels continuent d'être alimentés comme aujourd'hui (aucun changement).
- **Honnêteté des chiffres** : une "vue" = une ouverture comptée par l'app (règle déjà en place). Pas de dédoublonnage par personne à ce stade : les chiffres peuvent être légèrement gonflés par quelqu'un qui revient plusieurs fois (même limite que les compteurs actuels, à connaître).

## 5. Découpage

1. Serveur : table des J'aime + 3 fonctions + lecture publique des compteurs.
2. App : ligne de statistiques + rangée J'aime / Commentaires / Partager sur les 3 types de fiches.
3. Cartes : petit compteur de J'aime.

## 6. Décisions à valider

| # | Question | Recommandation |
|---|---|---|
| D1 | Qui peut aimer ? | **Tous les comptes** (même gratuits), comme pour les commentaires. Invités : lecture seule. |
| D2 | Contenu réservé : peut-on l'aimer sans y avoir accès ? | **Non** : on aime ce qu'on a lu/écouté. Les compteurs restent visibles par tous. |
| D3 | Afficher les chiffres publiquement dès maintenant, même s'ils sont petits au lancement ? | **Oui, mais masquer les compteurs à zéro** (évite "0 vue" sur un contenu neuf). |
