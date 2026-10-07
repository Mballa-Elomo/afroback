# Rapport traduction FR → EN, AFROBACK, 2026-10-07 (premier passage)

Agent : afroback-traduction-fr-en. Toutes les traductions livrées sont des **brouillons à faire relire par un anglophone**. Rien n'a été modifié dans le code, rien n'a été exécuté en base.

## Fichiers livrés

| Fichier | Contenu |
|---|---|
| `2026-10-07_traduction-en-contenu.sql` | 28 titres de chapitres des récits des 7 héros publiés (`recit_chapitres_en[].titre`) |
| `2026-10-07_traduction-en-interface.json` | 37 entrées : 34 app, 3 site |

## 1. Ce qui a été vérifié

- **App** : 164 fichiers `.ts`/`.tsx` de `app/` et `src/` (hors `src/i18n/`), y compris onboarding, abonnement, paiement, profil, `src/access`, `src/auth`, `src/onboarding`. Comparaison clé par clé de `fr.ts` et `en.ts`.
- **Site** : tout `site-web/web/src/`. Un texte est compté comme traduit s'il passe par `tr`/`pick`/`tc`/`t`, par une paire `[fr, en]`, ou par un champ `en`/`...En`.
- **Contenu public** : lu via l'API REST Supabase (clé publique) : héros, mythes, fiches Découverte, pays, niveaux.
- **Contenu détaillé** : comparaison de l'export `context/import/Supabase Snippet Untitled query.csv` (27 lignes) avec le lot 2. Vérification de l'état réel sur les 4 contenus gratuits lisibles sans compte (Reine Nzinga, Ngan Medza, Ebolowa, Palais royal de Foumban) et sur les aperçus des contenus verrouillés.

## 2. Ce qui est déjà traduit

- **Interface app** : 922 clés, identiques dans `fr.ts` et `en.ts`. Aucune clé manquante. Les 36 valeurs identiques dans les deux langues sont normales (pays, « Total », « Village », noms de forfaits).
- **Interface site** : quasiment complète. Il reste 3 oublis (voir JSON).
- **Lot 1 (catalogue public)** : **exécuté**. Les 9 héros (dont 2 dépubliés), les 5 mythes, les 10 fiches Découverte (y compris `pays_en`), le pays Cameroun et les 4 niveaux ont toutes leurs colonnes `_en`. Les valeurs en base sont identiques au script.
- **Récits des héros** : les 7 héros publiés ont bien 4 chapitres dans `recit_chapitres_en` (numéros 1 à 4, même nombre de paragraphes que le français). Les aperçus anglais des héros verrouillés sont remplis.
- **Lot 2 (contenu détaillé)** : **complet par rapport à l'export**. On y trouve le même nombre d'éléments dans les frises (6 ou 8), les citations, les légendes et les faits Découverte (6 à 10), les mêmes statuts dans le même ordre, le même nombre de paragraphes pour les 10 textes Découverte et 4 chapitres pour chacun des 5 mythes. Aucun champ, élément ou chapitre ne manque.

## 3. Ce qui manquait (et ce qui est livré)

1. **Titres des chapitres des héros** : dans `recit_chapitres_en`, le texte est en anglais mais les **28 titres sont restés en français** (7 héros × 4). Ils s'affichent en français sur le site, dans le lecteur et dans les titres des vidéos par chapitre. **Livré** : SQL qui remplace seulement la clé `titre`, chapitre par chapitre.
2. **Oublis d'interface de l'app** (34 entrées) :
   - la note sous les sources d'un mythe ;
   - « X en stock » et « Épuisé » sur la fiche produit, « EN LIGNE » et « RUPTURE » dans l'espace vendeur ;
   - le texte de secours « Héros » dans une leçon ;
   - les 4 filtres d'époque du catalogue des héros ;
   - les types Découverte affichés sans `t()` (carnet enfant, `DecouverteItemRow`, recherche) : les clés `decouverteType.*` existent déjà ;
   - le thème du héros affiché brut (« Résistance », « Politique ») sur l'accueil et dans l'en-tête du héros ;
   - les messages d'erreur qui arrivent à l'écran : session absente, accès photo refusé, image illisible, échec d'envoi, profil enfant, code PIN ;
   - les noms d'appareil utilisés dans l'e-mail d'alerte de connexion.
3. **Oublis d'interface du site** (3) : `lib/market.ts:115` « Connecte-toi pour commander. », et le nom d'appareil (« Navigateur », « Site web ») dans `lib/auth.tsx`.

## 4. Bugs relevés (code à corriger par Jarvis, rien n'a été modifié)

- **App, filtres d'époque des héros en anglais** : `eraCategory()` (`src/data/eraCategory.ts`) lit `epoque` après la traduction et cherche « précolonial » et « indépendance ». En anglais, ces deux classements échouent :
  - Reine Nzinga (« Precolonial… ») est rangée en Colonial ;
  - Moumié et Ouandié (« independence era ») sont aussi rangés en Colonial ;
  - les filtres Précolonial et Indépendances restent donc vides.
  Solution proposée : classer sur l'époque française (en la gardant avant `localize`) ou accepter aussi les mots anglais.
- **App, page pays de Découverte en anglais** : `app/(tabs)/decouverte/pays/[slug].tsx:34` compare `it.pays` (« Cameroun », jamais traduit) à `pays.nom` (traduit en « Cameroon »). En anglais, la page du pays n'affiche aucune fiche. Solution proposée : comparer sur le slug ou sur le nom français.
- **Site, e-mail d'alerte de connexion** : `lib/auth.tsx:150` envoie `langue: 'fr'` en dur. Les visiteurs anglophones reçoivent l'e-mail en français. Solution : `clientLang()`.
- **App, avertissement de lecture d'un héros verrouillé** : `HEROS_EN_COLUMNS` ne contient pas `avertissement_lecture_en`, et cette colonne n'est pas lisible publiquement. Un non-abonné qui ouvre Charles Atangana en anglais voit donc l'avertissement en français. Le détail des abonnés est correct. Solution : ajouter la colonne aux droits de lecture publics et à `HEROS_EN_COLUMNS`.
- **Site** : `avertissement_lecture` n'est affiché nulle part, ni en français ni en anglais. C'est un manque éditorial pour Charles Atangana, pas un problème de traduction.

## 5. Points sans colonne `_en` : solutions proposées (non appliquées)

- **Titres des chapitres vidéo (`video_chapitres[].titre_chapitre`)** :
  - seule Reine Nzinga a un chapitre vidéo (chapitre 1) ;
  - le site prend déjà le titre anglais dans `recit_chapitres_en` à numéro égal, ce qui sera correct une fois le SQL du jour exécuté ;
  - l'app n'affiche pas ce titre (onglet vidéo : numéro seulement) ;
  - **proposition** : garder ce principe partout (titre anglais = `recit_chapitres_en[numero].titre`), sans nouvelle colonne.
- **Storyboards (`chapitres_storyboard`), le plus gros manque** :
  - l'app affiche le titre du chapitre dans la liste audio et dans le diaporama, puis pour chaque planche `texte_ecran`, `voix_off`, `decor` et `ambiance_lumiere`, tout en français : 7 héros × 96 planches, soit environ 2 700 textes ;
  - les titres de storyboard sont identiques aux titres des récits pour les 7 héros (vérifié dans `heroes.generated.json`) ;
  - **proposition** : (a) tout de suite, en anglais, prendre le titre dans `recit_chapitres_en` à numéro égal et masquer les textes des planches (ou afficher un bandeau « storyboard in French ») ; (b) plus tard, créer une colonne `chapitres_storyboard_en` et la remplir avec un lot dédié, à partir de `Récits africains storyboards/`.
- **École des Héros** : les leçons et les quiz sont vides en base aujourd'hui. Il faudra prévoir `texte_adapte_en`, `question_en` et `choix_en` avant d'y mettre du contenu.
- **Sources (bibliographies)** : elles restent en français. C'est acceptable, car ce sont des références. À trancher par Yannick.

## 6. Incohérences dans le français (traduites telles quelles, non corrigées)

- **Date de mort de Félix Moumié** : **3 novembre 1960** dans les fiches Moumié et Um Nyobè, mais **4 novembre 1960** dans la fiche Ernest Ouandié (frise et récit). À trancher par le griot.
- **Le Ngondo, faits** : 2 statuts sont du texte libre au lieu d'une clé technique, par exemple `atteste (pour l'existence du rituel, tel que décrit par l'UNESCO) / tradition_orale (…)`. L'app les affiche bruts. Le lot 2 les a traduits en anglais, ce qui est conforme à la règle. Il serait plus propre de remettre une clé et de déplacer la précision dans l'affirmation.
- **Récits anglais des héros (existants)** : l'orthographe est américaine (colonizer, honor, recognize, colorless…) alors que la règle est l'anglais britannique. À harmoniser lors de la relecture. Les terminaisons en -ize sont tolérables, mais pas « honor » ni « color ».

## 7. Hors périmètre ou non bloquant

- **Code mort contenant du français**, sans effet à l'écran :
  - `heroes.curated.ts`, `heroes.media.ts`, `donRepository.ts` ;
  - `ATTESTATION_LABEL`, `STATUT_FACTUEL_LABEL` ;
  - le titre par défaut de `RelatedHeroes` ;
  - les titres de `USAGE_OPTIONS`, remplacés par `t()`.
- **Messages techniques non affichés tels quels** : les « Impossible de charger… » levés par les repositories (l'écran affiche le message générique `states.error`), `site/lib/supabase.ts`, le `diag` renvoyé par la fonction de paiement et `rpcError.message` (MFA).

## 8. Ce qui reste à faire

1. **Yannick** : exécuter `traduction-en-lot2-contenu.sql`. Il n'est **pas encore exécuté** : la frise anglaise de Reine Nzinga est vide, ainsi que le récit anglais de Ngan Medza et les textes anglais d'Ebolowa et de Foumban. Exécuter ensuite `2026-10-07_traduction-en-contenu.sql`, puis vérifier avec les requêtes de contrôle.
2. **Jarvis** :
   - intégrer les 37 entrées du JSON ;
   - corriger les 4 bugs de la section 4 ;
   - appliquer la solution (a) pour les storyboards.
3. **Plus tard** : lot storyboards (`chapitres_storyboard_en`), colonnes `_en` de l'École des Héros, relecture anglophone complète (dont l'orthographe britannique des récits), décision sur la date de mort de Moumié.
