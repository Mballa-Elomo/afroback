# Modèle de données — Pilier Mythologie (app mobile AFROBACK)

> Rédigé le 2026-08-05. Construit à partir des 5 récits mythologiques déjà écrits par l'agent griot (`livrables/sites-web/afroback/Mythologie/[nom-du-mythe]/fr.md`) et de leurs storyboards (`Récits africains storyboards/mythe-*/`), jamais branchés à l'app jusqu'ici. Périmètre : Cameroun uniquement, comme le pilier Découverte.

---

## 1. Vérification faite avant de coder quoi que ce soit

Yannick pensait avoir "déjà mis les histoires et les images". Les 5 récits texte existent bel et bien (voir liste ci-dessous), **mais aucune image n'a été retrouvée** pour la mythologie : recherche faite dans tout `livrables/sites-web/afroback/app-mobile/` et `context/import/`, rien de spécifique à ce pilier. Conclusion : **aucune image n'est utilisée** dans cette V1 (`image_url` reste `null` pour les 5 mythes), la liste et le détail affichent un placeholder "ILLUSTRATION" comme un héros sans photo produite — même règle que partout ailleurs sur ce projet, jamais une URL inventée. Idem pour la narration audio : aucun fichier trouvé, `narration_audio_url` reste `null`.

Les 5 mythes couverts :
- `mythe-miengu-esprits-eau-sawa.md` — Les Miengu, esprits des eaux (peuples Sawa, littoral)
- `mythe-nchare-yen-bamoun.md` — Nchare Yen, fondateur du royaume Bamoun (Ouest, Grassfields)
- `mythe-ngan-medza-beti.md` — Ngan Medza, le serpent de la traversée de la Sanaga (Beti-Fang, Centre)
- `mythe-ngog-lituba-bassa.md` — Ngog Lituba, le rocher percé (Bassa/Bakoko/Bati, Littoral)
- `mythe-sao-geants-kotoko.md` — Les Sao, peuple de géants (Kotoko, Extrême-Nord)

Chacun a un storyboard complet (4 chapitres, plan de tournage détaillé) dans `Récits africains storyboards/[slug]/` — jamais des images réelles, seulement la matière première déjà utilisée ailleurs pour construire les diaporamas de storyboard des héros.

---

## 2. Pipeline de données — plus simple que celui des héros, volontairement

Contrairement au pipeline héros (extraction mécanique + fichier curaté séparé, pensé pour 9 récits longs appelés à grossir), ce pilier ne compte que **5 éléments à ce jour**. Un seul script mécanique suffit :

- **`scripts/build-mythologie-data.mjs`** extrait mécaniquement les champs de la "Fiche structurée" de chaque `.md` (peuple, région, époque, type de contenu, thème, sources) et découpe le "Récit du griot" en 4 chapitres. Les **titres de chapitres** viennent verbatim des vrais fichiers storyboard (`## Chapitre N/4 — ...`). Le **regroupement des paragraphes** sous chaque chapitre est un jugement éditorial fixé à la main dans `MYTHES_CONFIG` (comme `CHAPITRE_ANCHORS` pour les héros), vérifié un par un contre le texte source — pas un découpage mécanique à volume égal. À généraliser si ce pilier grossit un jour.
- **`scripts/generate-mythologie-seed.mjs`** génère `supabase/schema-mythologie.sql` (schéma + seed) à partir du JSON produit.
- La **zone d'affichage** (regroupement de la liste : Littoral, Ouest/Grassfields, Centre, Extrême-Nord) est aussi fixée à la main dans cette config, dérivée directement du champ "Région" de chaque fiche.

```bash
node scripts/build-mythologie-data.mjs
node scripts/generate-mythologie-seed.mjs
node scripts/verify-seed-sql.mjs supabase/schema-mythologie.sql   # vérifie l'équilibre parenthèses/guillemets (le comptage colonnes/valeurs est vérifié manuellement, la table `mythes` n'est pas encore branchée dans ce script partagé — voir sa limite ci-dessous)
```

**Limite connue** : `verify-seed-sql.mjs` cible spécifiquement `insert into public.heros` (regex en dur) — il ne détecte aucun insert sur `public.mythes`. Le fichier généré a été vérifié manuellement (5 inserts, colonnes/valeurs comptées une par une, parenthèses/guillemets équilibrés confirmés par le même script en mode "équilibre global"). Si ce script est généralisé un jour pour couvrir toutes les tables du projet, le mentionner ici.

---

## 3. Schéma de données (Postgres/Supabase, voir `supabase/schema-mythologie.sql`)

### `mythes`
Une seule table (pas de table séparée par chapitre/source, comme `decouverte_items`) : `slug`, `titre`, `sous_titre`, `peuple`, `region`, `zone` (regroupement d'affichage), `epoque`, `type_contenu`, `theme`, `recit_chapitres_fr` (jsonb, même structure que `heros.recit_chapitres_fr` : `{ numero, titre, texte }`), `sources` (text[]), `couleur` (pastille décorative de la liste, cyclique, pas un jugement de contenu), `image_url` (`null`), `narration_audio_url` (`null`), `ordre_affichage`, `fichier_source`.

Pas de version anglaise (`recit_chapitres_en`) : aucune traduction n'existe pour ces récits, contrairement à certains héros — pas ajoutée pour ne pas laisser un champ vide qui laisserait croire à une fonctionnalité bilingue prévue.

Pas de champ "citations" (contrairement à `heros.citations`) : les 5 fiches indiquent explicitement qu'aucune citation individuelle attribuable n'a été trouvée pour ces mythes (récits collectifs de tradition orale) — inutile de modéliser un champ qui resterait vide partout.

### RLS
Lecture publique (`select` pour `anon`), écriture réservée à `service_role` — même pattern que `heros`/`decouverte_items`.

---

## 4. Écrans (voir `app-mobile/design-reference-mythologie.dc.excerpt.html`)

2 écrans dans la maquette réelle, tous deux nichés dans la pile de l'onglet Accueil (`app/(tabs)/accueil/mythologie/`, comme `heros/[slug]/`) pour garder la barre d'onglets visible :

- **Liste** (`index.tsx`) : groupée par zone, barre de recherche (titre/peuple/thème, filtrage client), carte par mythe (placeholder illustration, pastille couleur, peuple, titre, résumé, 3 pastilles Lire/Écouter/BD).
- **Détail** (`[slug].tsx`) : cover placeholder, tag peuple, titre, 3 onglets Lire/Écouter/BD.
  - **Lire** : lecteur paginé par chapitre (titre + paragraphes), même principe que le lecteur de récit héros mais simplifié (pas de bascule FR/EN, pas de réglage de taille de texte — pas de besoin identifié à ce stade). Sources affichées uniquement sur le dernier chapitre, et uniquement si `sources.length > 0` (`mytheHasSources` dans la maquette) — jamais une source inventée.
  - **Écouter** : état "bientôt disponible" (aucune narration produite), vrai lecteur `expo-audio` déjà câblé et prêt à s'activer dès qu'une URL existera — même pattern que le lecteur audio héros.
  - **BD** (`openBd`) : **aucun composant de lecteur BD identifié dans la maquette complète** (ni dans l'excerpt, ni retrouvé par ailleurs) — traité en "bientôt disponible" (Alert), jamais un lecteur inventé. Même situation que le format BD de l'École des Héros.

---

## 5. Points d'entrée câblés

- Bannière "Découvrir la mythologie africaine" sur l'écran d'accueil adulte (`app/(tabs)/accueil/index.tsx`), sur le modèle de la bannière Don déjà existante.
- Bannière "Mythologie africaine" déjà présente dans le catalogue Histoires & Héros (`app/(tabs)/accueil/histoires-heros.tsx`) — menait à un "bientôt disponible" depuis le 2026-07-30, rebranchée vers `/accueil/mythologie`.
