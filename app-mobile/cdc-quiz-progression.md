# Cahier des charges : quiz de fin de contenu + progression du lecteur

> Rédigé le 2026-10-07. **Validé par Yannick le 2026-10-07 (recommandations D1 à D6 retenues telles quelles) et développé le même jour.** Serveur testé sur une base PostgreSQL locale (droits, triche, barème, 12 quiz joués de bout en bout) ; app (`tsc`, export web) et site (`tsc`, `next build`) vérifiés. **Actif après exécution, dans l'ordre, de `supabase/schema-quiz.sql` puis de `livrables/sites-web/afroback/quiz/quiz-questions_2026-10-07.sql`** (questions à relire avant). D'ici là, tuile et carte restent cachées. Livré : app `src/quiz/`, `app/quiz/[type]/[slug].tsx`, `app/profil/progression.tsx` ; site `src/lib/quiz.ts`, `src/components/quiz.tsx`, `QuizPlayer.tsx`, pages `/heros|/mythes/[slug]/quiz`, `/compte/progression`. Écart assumé : sur la fiche de l'app, la tuile Quiz est pleine largeur sous Écouter / Regarder (plus lisible qu'une 3e tuile étroite) ; sur la vidéo de l'app, la carte du quiz est placée sous le lecteur.

## 1. Ce que veut Yannick

Après avoir **lu, écouté ou regardé** un contenu, la personne répond à un **questionnaire de 5 questions** sur l'histoire, obtient une **note**, et retrouve dans son profil **son évolution** (ce qu'elle a appris, sa progression). Réservé aux personnes **qui ont un compte**. Intégration simple à trouver et à utiliser.

Choix déjà faits par Yannick (2026-10-07) :
- Contenus : **Héros + Mythes** (7 héros publiés + 5 mythes = 12 quiz). Découverte plus tard.
- Questions : **rédigées par un agent à partir du récit, relues par Yannick**, stockées en base (FR + EN). Aucune IA appelée pendant l'utilisation : zéro coût par quiz, zéro risque d'erreur historique non relue.
- Progression : **points + niveaux + pourcentage du catalogue maîtrisé + liste des quiz**.
- Plateformes : **app mobile ET site web en même temps** (même base Supabase, même progression sur les deux).

## 2. Ce qui existe déjà (vérifié)

- Un quiz existe dans **l'espace enfant** (École des Héros, `app/enfant/ecole/quiz/[leconId].tsx`) : une question par écran, réponse corrigée tout de suite, score à la fin. **Aucune question n'a jamais été rédigée**, il reste vide. Il n'est pas touché par ce chantier, mais son principe d'écran est repris pour cohérence.
- Le mécanisme « réservé aux comptes » existe (`useRequireAccount`, `withAccount`) : il est réutilisé tel quel.
- La règle d'accès au contenu payant existe côté serveur (`acces_contenu(type, slug)`) : elle est réutilisée pour le quiz.

## 3. Principe : un seul quiz par contenu

Le quiz porte sur **l'histoire**, pas sur le format. Que la personne ait lu le récit, écouté l'audio ou regardé la vidéo, elle répond aux **mêmes 5 questions**. Un seul score par contenu, pas trois.

## 4. Ce que voit l'utilisateur

### 4.1 Où trouver le quiz (3 points d'entrée)

1. **À la fin du contenu** (le moment naturel) : à la fin du 4e chapitre du récit, à la fin de l'audio, à la fin de la dernière vidéo, une carte dorée apparaît :
   > 🏆 **Teste ce que tu as retenu** · 5 questions · 1 min
   > [ Faire le quiz ]
2. **Sur la fiche du héros / du mythe** : une 3e tuile à côté de « Écouter » et « Regarder » : **« Quiz »**, avec en sous-titre « 5 questions » ou, si déjà fait, **« Meilleur score 4/5 »**.
3. **Dans le profil** : la liste « Mes quiz » (section 4.4) permet de refaire un quiz.

### 4.2 L'écran du quiz

- En haut : ✕ pour quitter, barre de progression, « 2/5 ».
- La question en grand, 3 ou 4 réponses en gros boutons faciles à toucher (ordre des réponses mélangé à chaque tentative).
- Après un toucher : la bonne réponse passe en vert, la mauvaise en terracotta, et **une phrase d'explication** tirée du récit s'affiche (« Njoya a créé l'écriture shümom vers 1896… »). On apprend même en se trompant. Bouton « Question suivante ».
- Aucun chronomètre (on reste dans la découverte, pas l'examen).

### 4.3 L'écran de résultat

- Grand score **4/5** + message bienveillant selon le score (5/5 « Tu es un vrai gardien de la mémoire », 0-2 « Le griot a encore des choses à te raconter »).
- **Points gagnés** : « +20 points » et la barre de niveau qui avance (animation).
- Si changement de niveau : « Nouveau niveau : Conteur ».
- Boutons : **« Revoir mes réponses »** (récapitulatif des 5 questions avec explications), **« Refaire le quiz »**, **« Retour à l'histoire »**.

### 4.4 La progression dans le profil

- **Sur l'écran Profil**, juste sous la carte d'identité, une carte **« Ma progression »** :
  > Niveau **Conteur** · 340 pts
  > ▓▓▓▓▓▓░░░░ encore 60 pts pour **Griot**
  > 🏆 5 histoires maîtrisées sur 12 · 8 quiz faits
  
  Touchée, elle ouvre l'écran complet.
- **Écran « Ma progression »** :
  - En tête : niveau, points, barre vers le niveau suivant.
  - 3 chiffres : quiz faits, histoires maîtrisées (4/5 ou plus), moyenne des scores.
  - Liste **« Mes quiz »** en 2 onglets **Héros / Mythes** : chaque contenu avec son image, son meilleur score (ou « À découvrir » s'il n'a pas encore été fait), et un bouton pour faire ou refaire le quiz.
- Sur le **site web** : même contenu dans « Mon compte » > « Ma progression », et le même bloc résumé sur la page compte.

### 4.5 Barème et niveaux

- **Points** = meilleur score de chaque quiz × 20 (5/5 = 100 points). Seul le **meilleur score compte** : refaire un quiz déjà réussi ne rapporte rien de plus, refaire un quiz raté permet de gagner la différence. Impossible de « farmer » des points.
- Maximum aujourd'hui : 12 quiz × 100 = 1 200 points (le plafond monte quand le catalogue grandit).
- **Niveaux** (seuils en points) :

| Niveau | À partir de |
|---|---|
| Apprenti | 0 |
| Curieux | 100 |
| Conteur | 300 |
| Griot | 600 |
| Gardien de la mémoire | 1 000 |

- Une histoire est **« maîtrisée »** quand son meilleur score est de 4/5 ou 5/5.

### 4.6 Qui peut faire le quiz

- **Invité** : la tuile et la carte sont visibles, mais un toucher ouvre la fenêtre « Crée ton compte pour tester tes connaissances ».
- **Compte gratuit** : quiz des contenus gratuits. Sur un contenu réservé aux abonnés, le quiz est verrouillé comme le contenu lui-même (les questions dévoileraient l'histoire).
- **Abonné** : tous les quiz.
- **Profils enfants** : non concernés, ils ont leur propre École des Héros.

## 5. Fonctionnement technique

### 5.1 Base de données (un script SQL, à exécuter par Yannick)

- `quiz_questions` : type de contenu (`heros` / `mythe`), slug, ordre, question FR/EN, réponses FR/EN, index de la bonne réponse, explication FR/EN. **Non lisible directement** par l'app.
- `quiz_tentatives` : compte, type, slug, score, date. Chacun ne voit que les siennes.
- Fonctions serveur :
  - `get_quiz(type, slug)` : renvoie les 5 questions **sans la bonne réponse**, seulement si la personne est connectée et a accès au contenu (`acces_contenu`).
  - `verifier_reponse_quiz(question_id, choix)` : renvoie juste / faux, l'index de la bonne réponse et l'explication.
  - `terminer_quiz(type, slug, reponses[])` : **recalcule le score côté serveur** (l'app ne peut pas tricher en envoyant un faux score), enregistre la tentative, renvoie score, points gagnés, ancien et nouveau niveau.
  - `ma_progression()` : niveau, points, compteurs, et meilleur score de chaque contenu, en un seul appel.
  - `etat_quiz(type, slug)` : y a-t-il un quiz pour ce contenu, et mon meilleur score (pour n'afficher la tuile que là où il existe).
- Barème et seuils de niveau calculés **côté serveur** : app et site affichent exactement la même chose.

### 5.2 App mobile (Expo)

- `src/quiz/` : accès aux données + composants (carte de fin de contenu, tuile, carte de progression).
- Écrans : `app/quiz/[type]/[slug].tsx` (quiz), `app/quiz/resultat.tsx`, `app/profil/progression.tsx`.
- Intégrations : fiche héros, fiche mythe, fin du récit, fin de l'audio, fin de la vidéo, profil.
- Textes d'interface en FR et EN (`src/i18n/fr.ts` / `en.ts`).

### 5.3 Site web (Next.js)

- Mêmes fonctions serveur. Page `/heros/[slug]/quiz` et `/mythes/[slug]/quiz`, page `/compte/progression`, bouton sur les fiches et en fin de lecteur, bloc résumé sur la page compte. FR/EN.

### 5.4 Contenu des questions (agents)

- **Nouvel agent `afroback-quiz`** (commande `/afroback_quiz`) : lit le récit du griot (`Héros/…/fr.md`, `Mythologie/…`) et rédige 5 questions par contenu :
  - uniquement sur des faits **présents dans le récit**, rien d'inventé ;
  - une légende est posée comme une légende (« Selon la tradition, … ») ;
  - 1 question facile, 3 moyennes, 1 plus difficile ; des mauvaises réponses plausibles mais clairement fausses ;
  - une explication d'une phrase par question, tirée du récit.
- Livraison : un fichier de relecture lisible pour Yannick + un SQL d'insertion.
- **Agent `afroback-traduction-fr-en`** : contrôle et complète la version anglaise des questions.
- Comme pour la traduction, cet agent est **lancé automatiquement après chaque nouveau héros ou mythe**.

## 6. Découpage et ordre de livraison

1. **Serveur** : script SQL (tables + 5 fonctions).
2. **Contenu** : 12 quiz rédigés par l'agent (FR), traduits (EN), **relus par Yannick**, SQL d'insertion.
3. **App mobile** : écrans quiz / résultat / progression + intégrations, FR/EN.
4. **Site web** : mêmes écrans + intégrations, FR/EN.
5. **Contrôles** : typage et build des deux projets, test d'un parcours complet (invité, compte gratuit, abonné), puis redéploiement après ton feu vert.

Les étapes 1 et 2 peuvent avancer pendant que l'app est développée. Le quiz s'affiche « pas encore disponible » tant que les questions ne sont pas en base, jamais un écran vide.

## 7. Ce qui n'est pas dans ce chantier

- Quiz Découverte (prévu plus tard, même mécanique).
- Classement entre utilisateurs, badges, série de jours.
- Quiz de l'École des Héros (espace enfant).

## 8. Décisions à valider

| # | Question | Recommandation |
|---|---|---|
| D1 | Correction après chaque question, ou seulement à la fin ? | **Après chaque question**, avec l'explication : on apprend en jouant. |
| D2 | Refaire un quiz : illimité ? | **Oui, illimité**, seul le meilleur score compte pour les points. |
| D3 | Barème et noms des niveaux (section 4.5) | **Tels que proposés** : Apprenti, Curieux, Conteur, Griot, Gardien de la mémoire. |
| D4 | Compte gratuit sur un contenu payant | **Quiz verrouillé** comme le contenu. |
| D5 | « Maîtrisée » = combien de bonnes réponses ? | **4/5 ou plus.** |
| D6 | Créer l'agent `afroback-quiz` + commande `/afroback_quiz`, lancé automatiquement après chaque nouveau contenu | **Oui**, sur le modèle de l'agent de traduction. |
