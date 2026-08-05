# Modèle de données — Module « École des Héros » (app mobile AFROBACK, mode enfant)

> Rédigé le 2026-08-05, en préparation du chantier décrit par Yannick dans `prompt-claude-design-ecole-heros.md`. **Ce document couvre uniquement le schéma de données (le "comment"), pas le périmètre de contenu ni le déclenchement du chantier (le "quoi")** : ces deux décisions restent à valider par Yannick, voir `context/AFROBACK.md` §"Points bloquants". Le schéma est volontairement agnostique au nombre de héros/niveaux réellement produits : il fonctionne aussi bien avec 1 leçon (pilote) qu'avec 36 (9 héros × 4 niveaux).

---

## 1. Ce qui distingue ce module des piliers déjà livrés

- **Contenu éditorial entièrement séparé du contenu adulte.** Les récits complets (`heros.recit_*`) contiennent des passages jugés non adaptés à un jeune public (exécutions, empoisonnement, traite négrière) — jamais réutilisés tels quels. Chaque leçon a son propre texte, sa propre narration audio, sa propre vidéo, ses propres planches de BD.
- **Aucun contenu inventé.** Comme Découverte/Communauté/Marketplace avant lui, ce module démarre avec des tables vides : aucune leçon, aucune question de quiz n'est insérée par ce chantier technique. La production éditoriale (texte adapté, narration enfant, vidéo, BD) est un chantier séparé, non lancé à ce jour — voir notes de `prompt-claude-design-ecole-heros.md`.
- **Disponibilité partielle assumée par construction.** Un héros peut avoir un texte mais pas encore d'audio, ou une BD mais pas de vidéo : chaque champ de format est nullable, l'app affiche un état "bientôt disponible" par onglet de format (jamais un lecteur cassé), cohérent avec l'écran 10 du prompt de design.
- **Progression rattachée à `child_profiles`**, la table du module Parent/Enfant déjà livrée (`schema-parent-enfant.sql`) — pas de nouveau système de compte, un enfant progresse dans son profil existant.

---

## 2. Schéma de données (Postgres/Supabase, voir `supabase/schema-ecole-heros.sql`)

### `ecole_niveaux` (table de référence, 4 lignes fixes)
`niveau` (1 à 4, clé primaire), `nom` (ex. "Les Premiers Récits"), `tranche_age`, `ton_contenu` — métadonnées d'affichage pour l'en-tête de la carte du niveau. Lecture publique, comme `heros`/`decouverte_items`. **Les 4 lignes elles-mêmes ne sont pas insérées par ce chantier** (mapping niveaux ↔ classes scolaires proposé dans le prompt de design, pas encore validé par Yannick) — table créée vide, à peupler après validation.

### `ecole_lecons`
Une leçon = un héros à un niveau donné. `heros_id` (référence `heros.id`), `niveau` (1-4), `ordre_dans_niveau` (position sur le sentier de la carte du niveau), puis un champ par format, tous nullable :
- `texte_adapte` (texte réécrit, jamais le récit adulte)
- `narration_audio_url`
- `video_url`
- `bd_planches` (jsonb, tableau de `{ image_url, texte, ordre }` — réutilise la structure narrative des storyboards déjà écrits par l'agent griot, mais avec de vraies images à produire)

Contrainte `unique(heros_id, niveau)` : un héros n'apparaît qu'une fois par niveau. Lecture publique (contenu éditorial), écriture réservée à un futur back-office (hors périmètre, voir `context/AFROBACK.md` §"Back-office d'administration").

### `ecole_quiz_questions`
Questions du quiz de fin de leçon : `lecon_id`, `question`, `choix` (jsonb, tableau de libellés), `reponse_correcte_index`, `ordre`. 3 à 5 par leçon au moment de la production réelle (voir prompt de design, écran 5) — aucune insérée à ce stade.

### `ecole_quiz_niveau`
Questions du quiz récapitulatif de fin de niveau (écran 7 du prompt) : `niveau`, `question`, `choix`, `reponse_correcte_index`, `ordre`. Rattachées à un niveau entier, pas à une leçon précise.

### `enfant_ecole_progression`
Une ligne par enfant : `child_id` (clé primaire, référence `child_profiles.id`), `niveau_actuel` (défaut 1). Mise à jour quand le quiz de fin de niveau est réussi.

### `enfant_lecon_resultats`
Suivi par enfant et par leçon : `child_id`, `lecon_id`, `statut` (`verrouille`/`disponible`/`en_cours`/`termine`), `meilleur_score`, `tentatives`, `dernier_resultat_at`. `unique(child_id, lecon_id)`.

### `enfant_quiz_niveau_resultats`
Résultat du quiz de fin de niveau par enfant : `child_id`, `niveau`, `reussi`, `score`, `date`. `unique(child_id, niveau)`.

---

## 3. RLS

- Tables éditoriales (`ecole_niveaux`, `ecole_lecons`, `ecole_quiz_questions`, `ecole_quiz_niveau`) : lecture publique (`select` pour `anon`), pas d'écriture ouverte — même pattern que `heros`/`decouverte_items`.
- Tables de progression (`enfant_ecole_progression`, `enfant_lecon_resultats`, `enfant_quiz_niveau_resultats`) : accès complet réservé au parent authentifié, via jointure sur `child_profiles.parent_user_id = auth.uid()` — exactement le pattern déjà utilisé pour `child_sessions` dans `schema-parent-enfant.sql`. Comme documenté dans ce fichier, la sous-requête est sans risque ici : aucun accès "public/anon" n'existe sur ces tables.

---

## 4. Ce que ce document ne tranche pas

- **Le mapping héros → niveau** proposé dans `prompt-claude-design-ecole-heros.md` (ex. Niveau 1 = Sultan Njoya + Manu Dibango) est une hypothèse de travail, pas une décision arbitrée — n'affecte pas le schéma, mais conditionne les futures lignes de `ecole_lecons`.
- **Le périmètre pilote** (recommandation : 1-2 héros produits avec les 4 formats avant tout lancement, plutôt que 9 héros × 4 niveaux d'un coup) reste à valider par Yannick.
- **Le déblocage progressif exact** (seuil de score pour débloquer le héros suivant, nombre de questions du quiz de fin de niveau) n'est pas figé dans le schéma — `meilleur_score`/`reussi` suffisent pour que l'app applique la règle choisie côté client, sans migration nécessaire si elle change.
- **Les écrans eux-mêmes** ne sont pas codés : bloqués par l'indisponibilité de `DesignSync` dans cette session (voir `context/AFROBACK.md`), qui empêche d'extraire verbatim la maquette comme pour les 4 piliers précédents.
