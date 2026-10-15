# AFROBACK — Back-office : module Quiz (spécification)

> Rédigé le 2026-10-15 à la demande de Yannick (« je préfère finaliser le back-office »).
> But : relire, corriger et compléter tous les quiz sans passer par SQL, et voir quelles questions posent problème.

---

## 1. Périmètre

| Quiz | Table | Volume au 2026-10-15 |
|---|---|---|
| Fin de contenu (héros, mythes) | `quiz_questions` | 60 questions, 12 contenus (7 héros, 5 mythes) ; 2 héros sans quiz (Rudolf Douala Manga Bell, Manu Dibango) |
| École des Héros, fin de leçon | `ecole_quiz_questions` | 48 questions |
| École des Héros, fin de niveau | `ecole_quiz_niveau` | 28 questions |

Les questions continuent d'être rédigées par les agents (`/afroback_quiz`, `/afroback_pedagogue`) ; le module sert à relire, corriger, compléter et suivre.

## 2. Écran `/quiz`

### 2.1 Onglet Fin de contenu
- Liste des héros et mythes : nombre de questions, traduction anglaise complète ou non, tentatives, score moyen. Les contenus **sans quiz** sont signalés (« à rédiger avec /afroback_quiz »).
- Clic sur un contenu : ses questions dans l'ordre.

### 2.2 Onglet École des Héros
- Par niveau (1 à 4) : les leçons (héros) avec leurs questions, puis le quiz de fin de niveau.

### 2.3 Éditeur d'une question (les deux onglets)
- Question FR et EN, 2 à 5 choix FR et EN, **bonne réponse** (case à cocher sur le choix), explication FR et EN.
- Ajouter une question, supprimer (confirmation), monter / descendre dans l'ordre.
- Aperçu « comme dans l'app » (FR ou EN).
- Contrôles avant enregistrement : question et choix non vides, bonne réponse désignée, autant de choix EN que de choix FR (ou aucun), 10 questions maximum par contenu (limite de la base).

### 2.4 Statistiques (fin de contenu)
- Par contenu : tentatives, score moyen, part de joueurs à 80 % ou plus (« maîtrisé »).
- Par question : **taux de bonnes réponses** (à partir des réponses enregistrées). Une question sous 30 % ou au-dessus de 98 % est signalée : peut-être mal posée, ou trop facile.

## 3. Règles

- Lecture et écriture côté serveur (clé service_role), administrateur revérifié, chaque modification journalisée.
- Modifier une question ne change pas les scores déjà obtenus ; le score est recalculé côté serveur pour les prochaines tentatives (aucune bonne réponse n'est envoyée à l'app avant le choix du joueur).
- Supprimer la dernière question d'un contenu retire son quiz de l'app et du site.

## 4. Point de sécurité constaté (hors module)

Les questions de l'École des Héros sont lisibles avec leur bonne réponse par n'importe quel visiteur (règle de lecture publique). Enjeu faible (quiz pour enfants, sans points ni classement), mais un enfant habile pourrait lire les réponses. À corriger plus tard sur le modèle des quiz de fin de contenu (correction côté serveur), ce qui demande de modifier l'app et le site.

## 5. Architecture

- `lib/quiz.ts` (lecture, statistiques), `app/(admin)/quiz/` (page, `QuizModule.tsx`, `actions.ts`, CSS).
- Menu : entrée « Quiz » dans le groupe Contenu.
- Aucune modification de base nécessaire.

## 6. Critères d'acceptation

1. Corriger une bonne réponse dans le back-office change la correction dans l'app et le site à la tentative suivante.
2. Ajouter une question à un contenu la fait apparaître dans son quiz.
3. Les taux de réussite par question correspondent aux réponses enregistrées.

---

## 7. État d'implémentation (2026-10-15)

- Développé et en ligne : `/quiz` (Fin de contenu, École des Héros), éditeur FR/EN, ajout, suppression, réordonnancement, taux de réussite par question, aperçu FR/EN, contenus publiés sans quiz signalés. Entrée « Quiz » dans le menu Contenu.
- Compilation vérifiée. Rendu non contrôlé visuellement (disque de l'ordinateur plein ce jour-là) : à vérifier par Yannick.
