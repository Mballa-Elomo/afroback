# Paul Biya : changements de code à prévoir (rien n'a été modifié)

Préparé le 2026-10-08. Ce fichier décrit les changements. Aucun fichier de l'app, du site ou des scripts n'a été touché.

## En résumé

**Aucun changement de code n'est obligatoire pour que Paul Biya s'affiche.** L'app mobile et le site lisent les héros directement dans Supabase (`public.heros`). Il n'existe aucune liste de héros codée en dur côté écran. Vérifications faites :

| Point | Résultat |
|---|---|
| Thème `Politique` | Déjà traduit : `heroTheme.Politique` dans `src/i18n/fr.ts` / `en.ts` (app), `THEME_EN` dans `site-web/web/src/lib/catalogue.ts` (site). |
| Filtre d'époque (app) | `eraCategory()` lit `epoque_fr` (bug du 2026-10-07 corrigé). « Contemporain (…) » est classé dans « Indépendances », en français comme en anglais. |
| Libellé court d'époque | `shortEra()` coupe à la parenthèse : la carte affiche « Contemporain » / « Contemporary ». |
| Avertissement de lecture (app) | Affiché par `WarningBanner`, y compris pour un non-abonné, car `avertissement_lecture` fait partie des colonnes publiques du catalogue. |
| Image | URL complète en base (`image_carte_catalogue`), aucun mapping de code nécessaire. |
| Héros liés | Les 5 slugs (`ruben-um-nyobe`, `felix-moumie`, `ernest-ouandie`, `charles-atangana`, `martin-paul-samba`) existent déjà en base. |

Trois changements restent **recommandés** (1 et 2), ou **facultatifs** (3).

---

## 1. Recommandé : site, l'avertissement de lecture est invisible pour un non-abonné

**Problème.** Sur le site, `ContentView.tsx` lit l'avertissement dans le détail complet (`d`). Pour un contenu réservé, le détail renvoyé par `get_heros_detail` ne contient que l'aperçu. Résultat : un visiteur sans abonnement voit la fiche et l'aperçu du récit de Paul Biya **sans** l'avertissement « figure vivante et en exercice ». Paul Biya n'est pas un contenu gratuit, ce cas concerne donc la majorité des visiteurs.

**Changement proposé** (projet `site-web/web/`) :

1. `src/lib/catalogue.ts`
   - ajouter `avertissement_lecture` à la fin de `HEROS_COLS` ;
   - ajouter `,avertissement_lecture_en` à `HEROS_EN`.
   Les deux colonnes sont déjà lisibles publiquement (`schema-acces-abonnement.sql` et `traduction-en-lot3-titres-chapitres.sql`). Si la colonne anglaise n'était pas encore ouverte, `withEn()` retombe déjà sur les colonnes françaises.
2. `src/lib/types.ts`
   - `HerosCard` : ajouter `avertissement_lecture?: string | null;`
   - `Tile` : ajouter `warning?: string;`
3. `src/lib/catalogue.ts`, fonction `heroTile()` : ajouter
   `warning: loc<string>(r, 'avertissement_lecture', lang) || undefined,`
4. `src/components/ContentView.tsx`, ligne de l'avertissement :
   `const avertissement = str(loc(d, 'avertissement_lecture', lang)) || tile.warning || '';`

Effet de bord : Charles Atangana (seul autre héros avec un avertissement) en profite aussi.

## 2. Recommandé : « Histoire du jour » sur l'accueil (app et site)

**Constat.** Quand aucun héros n'est « à la une », l'accueil de l'app (`app/(tabs)/accueil/index.tsx`, `pickFeatured`) et du site (`src/lib/catalogue.ts`, `pickFeatured`) font tourner chaque jour un héros, en priorité ceux qui ont une image. Une fois publié, Paul Biya sera donc mis en avant certains jours comme « Histoire du jour », avec son portrait en grand.

**C'est une décision éditoriale, pas un bug.** Deux options :
- **(a) Ne rien changer.** Il apparaîtra dans la rotation comme les autres.
- **(b) L'exclure de la rotation automatique**, sans le retirer du catalogue. Dans les deux fonctions `pickFeatured`, filtrer le pool de rotation (pas la liste « à la une ») :
  `const pool = (withImage.length > 0 ? withImage : heroes).filter((h) => !h.avertissement_lecture);`
  Côté app, `avertissement_lecture` est déjà chargé. Côté site, cela suppose le changement 1 (colonne ajoutée à `HEROS_COLS`). Atangana serait exclu aussi : à trancher.

Mettre Paul Biya « à la une » depuis le back-office (`a_la_une = true`) reste possible dans tous les cas.

## 3. Facultatif : pipeline de génération du seed (`app-mobile/mobile-app/scripts/`)

**Constat.** Le pipeline décrit dans le README de l'app (`build-heroes-data.mjs` → `heroes.curated.ts` / `heroes.media.ts` → `generate-supabase-seed.mjs` → `seed.sql`) n'a plus été utilisé depuis août. Il ne connaît que les 9 héros d'origine (`KNOWN_SLUGS`). Depuis, le contenu en base évolue par scripts SQL ciblés (traductions lot 1 à 3, corrections du 2026-10-08). Le rapport de traduction du 2026-10-07 classe d'ailleurs `heroes.curated.ts` et `heroes.media.ts` comme code mort.

**Pas nécessaire pour Paul Biya.** Le SQL livré est autonome. Une régénération future de `seed.sql` ne supprimerait pas Paul Biya, car le seed fait des upserts sur le slug, sans `truncate`. Attention : l'étape 5 du README parle encore d'un `truncate`, ce n'est plus vrai.

**Si tu veux garder le pipeline complet**, voici le changement exact :

1. `scripts/build-heroes-data.mjs`
   - `KNOWN_SLUGS` : ajouter
     `{ slug: 'paul-biya', pays: 'Cameroun', names: ['Paul Biya', 'Biya'] },`
   - `CHAPITRE_ANCHORS` : ajouter
     ```js
     'paul-biya': {
       fr: ['Et cela ne dure pas. En 1983', 'Les présidentielles suivantes donnent', 'Et nous voici dans le présent'],
       en: ['And it does not last. In 1983', 'The following presidential elections give', 'And here we are in the present'],
     },
     ```
   - **Séparateur des titres** : le storyboard de Paul Biya écrit `## Chapitre 1/4 : Titre` et `### Planche 1/24 : Titre` (deux-points), alors que le script n'accepte que le tiret (`[—-]`). Remplacer `[—-]` par `[—:-]` dans `parseChapitre` (regex du titre) et dans `parsePlanches` (regex de découpe). Sinon le build échoue sur « Titre de chapitre introuvable ».
   - **Sources** : `extractBulletBlock` s'arrête à la première ligne qui n'est pas une puce. Les sources de Paul Biya sont regroupées sous 3 sous-titres (« Sources officielles… », « Encyclopédies… », « Presse internationale… »). Le script n'en récupérerait que 3 sur 17. Il faut ignorer les lignes de sous-titre dans ce bloc, ou ne pas passer par le script pour les sources.
   - **Titres anglais** : le script reprend les titres français du storyboard dans `recit_chapitres_en`. Pour Paul Biya, le SQL livré met des titres anglais. À reporter à la main si le pipeline est relancé.
2. `src/data/heroes.curated.ts` : ajouter une entrée `paul-biya` reprenant exactement les valeurs du SQL livré (`resume_catalogue`, `theme: ['Politique']`, `citations` avec leur statut, `legendes_associees: []`, `avertissement_lecture`, `ordre_affichage: 10`, etc.).
3. `src/data/heroes.media.ts` : ajouter
   `'paul-biya': { image_carte_catalogue: \`${STORAGE_BASE}/images/paul-biya.jpg\` },`
   (sans audio ni vidéo pour l'instant).

## Hors code, à garder en tête

- **Liens retour** : les fiches Um Nyobè, Moumié, Ouandié, Atangana et Samba ne pointent pas vers Paul Biya (`heros_lies`). Le SQL livré ne les modifie pas. Ajouter ces liens est un choix éditorial. Si tu le veux, une ligne SQL par héros suffit :
  `update public.heros set heros_lies = array_append(heros_lies, 'paul-biya') where slug = 'ruben-um-nyobe' and not ('paul-biya' = any(heros_lies));`
- **Contenus liés** : quiz (`/afroback_quiz`), contrôle FR/EN (`/afroback_traduction_FR_EN`) et éventuelle leçon de l'École des Héros (`/afroback_pedagogue`) restent à produire après la publication.
