# Cahier des charges : contenu de l'École des Héros, étape 1 (Lire + Quiz)

> Rédigé et validé le 2026-10-07 (décisions de Yannick ci-dessous). Les écrans de l'École existent déjà (app et site, 2026-08-05 et lot 6 du site) mais n'avaient aucun contenu.

## 1. Décisions de Yannick (2026-10-07)

- **Lancement par étapes** : étape 1 = **Lire + Quiz** sur les **4 niveaux** ; puis Écouter (narration ElevenLabs), Regarder (petites vidéos animées), BD (planches illustrées).
- **Héros dépubliés remplacés** par des héros publiés (Manu Dibango et Rudolf Douala Manga Bell reviendront quand ils seront publiés).
- **Niveau 1 (3-5 ans)** : quiz **lu par le parent** (questions très simples, 2 réponses avec emoji), sans développement audio.

## 2. Découpage des leçons

| Niveau | Âge | Leçons (dans l'ordre) |
|---|---|---|
| 1 · Les Premiers Récits | 3-5 ans | Sultan Njoya, Reine Nzinga |
| 2 · Petits Explorateurs | 6-8 ans | Reine Nzinga, Sultan Njoya, Martin Paul Samba |
| 3 · Grands Explorateurs | 9-11 ans | Martin Paul Samba, Charles Atangana, Ruben Um Nyobè |
| 4 · Héritiers de l'Histoire | 12 ans et plus | Ruben Um Nyobè, Félix Moumié, Ernest Ouandié |

11 leçons. Un même héros à deux niveaux = deux textes différents (plus de détails et de nuances au niveau supérieur).

## 3. Contenu produit par leçon (FR + EN)

| Niveau | Texte « Lire » | Quiz de leçon | Grand quiz de niveau |
|---|---|---|---|
| 1 | 4 à 6 phrases façon conte, à lire par le parent | 3 questions, 2 réponses avec emoji | 4 questions |
| 2 | 120 à 180 mots, phrases courtes | 4 questions, 3 réponses | 6 questions |
| 3 | 250 à 350 mots, premières nuances | 5 questions, 3 réponses | 8 questions |
| 4 | 400 à 550 mots, nuances assumées, aucun détail graphique | 5 questions, 4 réponses | 10 questions |

Chaque question a une petite **explication** (« Le savais-tu ? »), affichée après la réponse.

## 4. Règles de rédaction (agent `afroback-pedagogue`)

- **Rien d'inventé** : tout vient du récit du griot (base, export `context/import/`, ou `Héros/…/fr.md`).
- **Légendes = légendes** : « On raconte que… », jamais présentées comme des faits.
- **Aucune violence détaillée**, à aucun niveau : niveaux 1-2 n'évoquent pas la mort violente ; niveau 3 au plus « il a été tué par les colons » ; niveau 4 « il a été exécuté » sans description.
- **Valeurs** : courage, intelligence, transmission, fierté des origines ; jamais de haine ni de caricature.
- Anglais britannique, mêmes règles que l'agent de traduction. Brouillon à relire par Yannick (FR) et un anglophone (EN).

## 5. Technique

- Script `supabase/schema-ecole-contenu.sql` : colonnes `_en` (texte, questions, choix), colonnes `explication` / `explication_en` sur les deux tables de quiz, nouveau découpage des leçons.
- Script de contenu livré par l'agent : `livrables/sites-web/afroback/ecole/ecole-contenu_{date}.sql` + fichier de relecture.
- App et site : affichage de la version anglaise selon la langue, explication après chaque réponse, mention « À faire avec un parent » sur le quiz du niveau 1.
