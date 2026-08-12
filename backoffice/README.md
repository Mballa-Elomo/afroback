# AFROBACK — Back-office (lot 1)

Outil interne d'administration d'AFROBACK. **Next.js 16 (App Router) + TypeScript**, choix validé par Yannick le 2026-08-05 (voir `context/AFROBACK.md`) — raison technique de fond, pas une préférence : les écritures d'administration passent par la clé Supabase `service_role`, qui doit rester côté serveur, jamais exposée au navigateur. Next.js exécute nativement ce code serveur (Server Actions) ; une SPA (React + Vite) aurait exigé une couche API séparée pour faire la même chose.

Construit à partir du cahier des charges (`../prompt-claude-design-backoffice.md`) et de la maquette Claude Design (`../design-reference-admin-backoffice.dc.excerpt.html`).

**Piège évité** : la maquette référence `afroback-data.js`, le jeu de données **fictif** du prototype mobile (Mansa Moussa, Nelson Mandela, "14 218 utilisateurs", "22,1 M FCFA" de revenu...). Rien de ce fichier n'a été repris. Toutes les données de ce projet viennent des vraies tables Supabase (`heros`, et à terme les autres piliers) via la clé `service_role`.

## Bug corrigé — upload audio réel cassait la page héros (2026-08-06)

Yannick a testé un vrai upload MP3 (`MediaUploadSlot`, panneau Audio FR/EN) : `TimeoutError: signal timed out` côté navigateur, puis `Unexpected end of form` (busboy, le parseur multipart interne de Next.js pour les Server Actions — voir `node_modules/next/dist/compiled/busboy`) au rendu suivant. Les deux erreurs à la suite décrivaient la même requête : la connexion d'upload a été coupée avant que le fichier soit entièrement reçu.

### v1 (insuffisante) — retirer `proxy.ts` du chemin critique

Première hypothèse : `proxy.ts` s'exécutait sur **toute** requête non-statique, y compris la requête POST multipart d'un upload, et faisait un aller-retour réseau vers Supabase Auth (`getUser()`) avant de laisser passer la requête — un délai qui pouvait faire expirer la connexion d'upload. Corrigé dans `lib/supabase/middleware.ts` (les requêtes de Server Action, détectées via l'en-tête `next-action`, sautent cet aller-retour). **Ce correctif était légitime et reste en place** (il retire un aller-retour réseau réellement inutile pour ces requêtes), mais **Yannick a retesté après redémarrage propre du serveur et l'upload échouait encore exactement pareil** — donc pas la cause principale, ou pas la seule.

### v2 (la vraie cause) — le chemin Server Action multipart lui-même, immature dans cette version de Next.js

Indice clé fourni par le message d'erreur précis affiché : c'était celui du `catch` **côté client** (`"Échec de l'upload (connexion interrompue). Réessaie."`), jamais celui du `catch` **côté serveur** de `uploadMedia()` (qui aurait affiché `"Échec de l'upload : <message précis>"`). Ça veut dire que l'échec avait lieu **au niveau transport, avant même que le code de l'action ait pu s'exécuter ou répondre** — donc pas un bug dans notre logique métier (Supabase Storage, base de données), mais dans le mécanisme même de transfert du fichier vers l'action.

En lisant le code source réel de Next.js (`node_modules/next/dist/server/app-render/action-handler.js`, comme demandé — pas de suppositions) : le chemin qui décode un upload multipart envoyé à une Server Action passe par `busboy` + `decodeReplyFromBusboy` (react-server-dom-turbopack, puisque Turbopack est le bundler utilisé ici) + un `stream.pipeline()`, orchestrés via `Promise.all(...)`. Ce chemin de code porte encore un commentaire `// TODO-APP: Add streaming support` dans la branche voisine (runtime edge) de ce même fichier — signe que cette zone est reconnue comme jeune/en construction par l'équipe Next.js elle-même. Turbopack en dev n'est le bundler par défaut que depuis la v16.0.0 (voir tableau "Version Changes" dans `node_modules/next/dist/docs/01-app/03-api-reference/08-turbopack.md`) : la combinaison "upload de fichier via Server Action, en dev, avec Turbopack" a eu très peu de temps pour être durcie en conditions réelles.

**Corrigé pour de vrai** : le transfert du fichier lui-même ne passe plus par une Server Action. Il passe maintenant par un **Route Handler** classique (`app/api/heros/[slug]/media/route.ts`, `.../chapter-video/route.ts`), qui utilise `request.formData()` — l'implémentation standard de la Fetch API pour parser un `multipart/form-data`, un chemin de code beaucoup plus ancien et éprouvé que le mécanisme spécifique aux Server Actions. La logique métier (upload Storage, mise à jour `heros`, journal d'activité) a été extraite dans `lib/uploadMedia.ts`, appelée par les deux Route Handlers. Les composants clients (`MediaUploadSlot`, `GenericMediaUpload`, `ChapterVideoGrid`) appellent maintenant `fetch('/api/heros/.../media', { method: 'POST', body: formData })` au lieu d'invoquer une Server Action. Les Server Actions qui ne transportent jamais de fichier (`saveMetadata`, `removeMedia`, `removeChapterVideo`, `updateChapterTitle`) restent des Server Actions classiques — elles n'étaient pas en cause.

**Diagnostic auxiliaire ajouté, pas activé par défaut** : `npm run dev:webpack` (`next dev --webpack`, flag officiel documenté pour désactiver Turbopack — voir `node_modules/next/dist/docs/.../08-turbopack.md`) reste disponible si jamais un problème similaire réapparaît ailleurs et qu'il faut isoler "est-ce Turbopack" — non nécessaire pour ce bug précis puisque la vraie cause (le chemin Server Action multipart) est maintenant contournée entièrement, indépendamment du bundler.

**Corrigé en parallèle, indépendamment de la cause exacte** (un outil d'administration ne doit jamais planter une page entière pour un upload raté) :
- `describeError()` dans `lib/uploadMedia.ts` : toute exception pendant un upload (réseau, timeout...) devient un message `{ error }` propre plutôt qu'un throw non intercepté.
- Tous les composants qui déclenchent une action depuis un `startTransition` (`MediaUploadSlot`, `ChapterVideoGrid`, `GenericMediaUpload`, `ConfirmModal`, `FeaturedStar`, `HeroTopActions`) attrapent maintenant l'échec et affichent un message dans l'UI au lieu de laisser l'exception remonter.
- `app/(admin)/error.tsx` ajouté comme filet de sécurité final (écran de récupération avec bouton "Réessayer" plutôt que l'overlay de crash brut de Next.js).

**Non vérifié par un vrai lancement** (toujours pas de clé `service_role` ici, et le serveur de dev de Yannick tournait sur le port 3000 pendant cette session — `.next/` non touché pour ne pas corrompre son cache) : `npx tsc --noEmit` propre après ce correctif. **Yannick doit redémarrer `npm run dev`** puis retester l'upload audio.

## Lenteur corrigée — `getUser()` → `getClaims()` (2026-08-06)

Yannick a trouvé le back-office lent et fourni un log réel : `GET /heros/ruben-um-nyobe 200 in 4.4s (next.js: 943ms, proxy.ts: 2.1s, application-code: 1336ms)`. Diagnostic fait avant de toucher au code (pas de correctif à l'aveugle) :

- **Cause : un double aller-retour réseau vers Supabase Auth, à chaque navigation de page.** `proxy.ts` → `updateSession()` (`lib/supabase/middleware.ts`) appelait `supabase.auth.getUser()` (2,1s dans le log). Puis `app/(admin)/layout.tsx`, qui enveloppe toutes les pages admin, appelle `requireAdmin()` (`lib/auth.ts`) qui faisait un **deuxième** `getUser()` — ce deuxième appel est caché dans le chiffre `application-code: 1336ms` du log, avec le vrai temps de requête de données. `getUser()` envoie systématiquement une requête au serveur Supabase Auth pour revalider le jeton, quel que soit son état.
- **Pourquoi il y a deux vérifications et pas une seule à supprimer** : ce n'est pas une redondance accidentelle. Le commentaire déjà présent dans `lib/auth.ts` avant ce correctif l'explique — un Server Component ne doit pas faire confiance uniquement au middleware pour l'authentification, une classe de faille connue de Next.js (CVE-2025-29927, "middleware bypass") permet dans certains cas de contourner le middleware. La double vérification reste donc en place ; seule la méthode de vérification a changé.
- **Solution vérifiée avant d'être appliquée** : lu la doc embarquée `node_modules/@supabase/ssr/docs/design.md` et le code source `node_modules/@supabase/auth-js/dist/module/GoTrueClient.js` — le SDK recommande explicitement `getClaims()` plutôt que `getUser()` ("Prefer this method over getUser() which always sends a request to the Auth server for each JWT"). `getClaims()` ne fait un aller-retour réseau à chaque appel QUE si le projet Supabase signe ses JWT avec un secret symétrique (legacy) ; avec une clé asymétrique (ECC/RSA), la vérification se fait localement via WebCrypto. **Vérifié concrètement pour ce projet** en interrogeant l'endpoint public `https://ygkyapryramhaskfbrrt.supabase.co/auth/v1/.well-known/jwks.json` (pas besoin de clé, endpoint public) : signature en **ES256 (asymétrique)** — donc `getClaims()` fait bien de la vérification locale ici, pas un `getUser()` déguisé. La clé publique est mise en cache 10 minutes, **au niveau du process Node** (`GLOBAL_JWKS` dans `GoTrueClient.js`, partagé par tous les clients créés dans le même environnement) — donc partagée par toutes les requêtes suivantes tant que `npm run dev` tourne, pas juste par une seule requête.
- **Compromis sécurité réel, présenté à Yannick et validé par lui le 2026-08-06 avant d'appliquer le changement** : `getUser()` détecte une révocation de session (déconnexion forcée, bannissement, suppression de compte) immédiatement, parce qu'il revérifie en direct auprès du serveur. `getClaims()` vérifie seulement que le JWT est authentique et pas expiré, localement — une révocation ne prendrait effet qu'à l'expiration naturelle du jeton d'accès (1h par défaut chez Supabase, réglable dans les paramètres Auth du dashboard). Jugé acceptable pour un outil interne à un seul utilisateur.
- **Appliqué** : `lib/supabase/middleware.ts` (`updateSession`) et `lib/auth.ts` (`requireAdmin`) remplacent `getUser()` par `getClaims()`. Même architecture à double vérification conservée. `npx tsc --noEmit` propre.
- **Gain attendu, pas encore mesuré par un vrai lancement** (mêmes limites que pour le bug d'upload ci-dessus, pas de clé `service_role` ici) : les 2,1s de `proxy.ts` et l'essentiel du chiffre `application-code` devraient tomber à quelques ms chacun — un chargement de page qui prenait 4,4s devrait avoisiner 1 à 1,5s (le temps réel de rendu Next.js + la requête de données, qui ne peut pas être compressé davantage par ce correctif). **Yannick doit redémarrer `npm run dev`** puis comparer le temps de chargement réel.

## Statistiques d'engagement réelles (2026-08-06)

Yannick a demandé de vraies statistiques (lectures du récit, écoutes de la narration, visionnages vidéo) — exactement ce que la règle "jamais un chiffre fabriqué" excluait jusqu'ici : le panneau "ENGAGEMENT GLOBAL" de la maquette (fiche héros) n'avait jamais été construit faute de vraie donnée, et le compteur de vues Marketplace était le seul tracking réel de tout le projet. Les deux bouts sont construits : l'app mobile enregistre l'événement, le back-office l'affiche.

- **Table** : `hero_engagement` (`mobile-app/supabase/schema-engagement.sql`, propriété de l'app mobile puisque c'est elle qui écrit — pas une migration back-office comme `schema-admin-heros.sql`) — une ligne par héros, 3 compteurs cumulés (`lectures_recit`, `ecoutes_audio`, `visionnages_video`), incrémentés de façon atomique par la fonction SQL `increment_hero_engagement(hero_id, event)` appelée par l'app mobile (clé anon, via RPC). Anonyme par construction : pas de tracking par utilisateur individuel. **Exécuté par Yannick, confirmé le 2026-08-06.**
- **Fiche héros** (`app/(admin)/heros/[slug]/page.tsx`) : panneau "ENGAGEMENT GLOBAL" ajouté, fidèle à la position de la maquette (juste après la grille vidéo par chapitre) — 3 cartes au lieu des 4 de la maquette, la 4ᵉ ("likes") n'étant pas reconstruite puisqu'aucun système de réaction n'existe dans le modèle de données de ce projet (décision déjà prise et documentée côté Communauté, appliquée ici à l'identique plutôt que d'inventer un chiffre).
- **Tableau de bord** (`app/(admin)/page.tsx`) : nouveau panneau "ENGAGEMENT GLOBAL — TOUS HÉROS CONFONDUS", somme des 3 compteurs sur tous les héros. Ajouté à mon jugement (pas explicitement redemandé) : un dashboard de pilotage sans aucune vue d'ensemble d'une donnée que Yannick vient de demander explicitement semblait une omission plus qu'une simplification. Affiché en 3 chiffres séparés (lectures / écoutes / visionnages), jamais sommés en un seul total — additionner des lectures et des visionnages en un seul nombre n'aurait pas de sens clair.
- **Un héros sans événement affiche 0 réel** (pas un espace vide qui a l'air cassé, pas un tiret) — cohérent avec le reste du projet.
- **Liste des héros** (`app/(admin)/heros/page.tsx`, ajouté le 2026-08-06 sur demande de Yannick) : nouvelle colonne ENGAGEMENT, 3 indicateurs compacts par ligne (📖 lectures · 🎧 écoutes · 👁 visionnages), pas le panneau complet de la fiche détail. `getEngagementByHero()` (`lib/data/engagement.ts`) charge **tous** les héros en une seule requête groupée (`Map<hero_id, HeroEngagement>`), jamais une requête par héros dans une boucle — voir "Lenteur — deuxième passe" plus bas pour le contexte de cette vigilance.
- **Vérifié** : `npx tsc --noEmit` propre. Pas de `next build` (serveur de dev de Yannick toujours actif sur le port 3000).

## Statistiques d'engagement détaillées par média (2026-08-06, après-midi)

Yannick veut plus fin que le total agrégé du matin : l'audio FR séparé de l'EN, la vidéo par chapitre **et** par langue (les 8 cases de la grille) — pour savoir quel chapitre est le plus regardé, quel audio le plus écouté. Détail complet du schéma et de l'instrumentation côté app dans `mobile-app/README.md` ("Statistiques d'engagement détaillées par média").

- **Migration séparée, avec dépendance à respecter** : `mobile-app/supabase/schema-engagement-detail.sql` (nouveau) **dépend de `schema-engagement.sql`** (celui du matin) — la table `hero_engagement` doit déjà exister. Les deux sont idempotents. **Les deux scripts sont exécutés, confirmé par Yannick le 2026-08-06**, dans le bon ordre.
- **Isolation délibérée des requêtes, pour ne jamais faire régresser ce qui marche déjà** : `getAudioEngagementDetail()` et `getVideoChapterEngagement()` (`lib/data/engagement.ts`) sont des requêtes **séparées** de `getHeroEngagement()`/`getTotalEngagement()`/`getEngagementByHero()` — jamais fusionnées dans un même `select()`. Raison concrète : si `schema-engagement-detail.sql` n'a pas encore tourné, une requête qui demanderait les nouvelles colonnes/table en même temps que les 3 compteurs déjà fonctionnels échouerait **en bloc**, faisant régresser à 0 le panneau ENGAGEMENT GLOBAL déjà en place depuis ce matin. En les isolant, seul le détail fin dégrade silencieusement vers 0/absent ; les totaux agrégés restent intacts quoi qu'il arrive.
- **Fiche héros** : chaque `MediaUploadSlot` Audio FR / Audio EN affiche maintenant son propre compteur d'écoutes réelles (nouvelle prop `engagementCount`, absente — pas `0` — pour les slots photo/vidéo qui n'ont pas de détail pertinent). Chaque case de `ChapterVideoGrid` (chapitre × langue) affiche son nombre de visionnages réel à la place du simple "MP4" une fois la vidéo en ligne. `Map` construite côté client (`ChapterVideoGrid.tsx`) à partir d'un tableau brut passé en prop — une `Map` n'est pas sérialisable à travers la frontière Server/Client Component de Next.js, donc jamais passée telle quelle.
- **Totaux existants inchangés** : Dashboard et liste des héros continuent d'afficher les 3 totaux agrégés (lectures/écoutes/visionnages) — ce chantier ajoute un niveau de détail, ne remplace rien.
- **Relation entre les nouveaux détails et les totaux déjà affichés** (à comprendre pour ne pas s'étonner d'un écart) : `ecoutes_audio_fr + ecoutes_audio_en` égale toujours `ecoutes_audio` (un seul chemin d'écriture possible côté app). En revanche, la somme des lignes de `hero_video_chapter_engagement` pour un héros **n'égale pas** `visionnages_video` : l'agrégat compte aussi le documentaire unique (legacy, sans notion de chapitre) et le diaporama storyboard (sans notion de langue), qui n'ont pas de ligne de détail. Différence attendue, pas un bug.
- **Vérifié** : `npx tsc --noEmit` propre. Pas de `next build` (serveur de dev de Yannick toujours actif).

## Panneau "Vidéo (documentaire unique)" — retiré (2026-08-06)

Yannick voulait retirer ce slot du panneau MÉDIAS (le mode chapitres est la vraie façon de gérer la vidéo maintenant). **Vérification faite d'abord** : `video_url` était-il encore réellement utilisé par un héros sans `video_chapitres` ?

- **Oui, un seul cas : Martin Paul Samba.** Mais le coordinateur a confirmé côté Storage que ce fichier (183 Mo, jamais uploadé avec succès — point bloquant connu depuis le 2026-07-29, voir `context/AFROBACK.md`) répond en 404, et qu'aucun fichier vidéo source n'existe pour Samba dans le dossier local de Yannick. **Décision de Yannick : convertir Samba au système `video_chapitres`** (conversion structurelle, pas de vraie vidéo à brancher pour l'instant — détail complet dans `mobile-app/README.md`, "Martin Paul Samba converti au système video_chapitres").
- **Fait** : `video_url` retiré de `mobile-app/src/data/heroes.media.ts` pour Samba, `supabase/seed.sql` régénéré (`video_url` → `null`, `statut_video` → `storyboard_pret`). Samba n'était le seul cas — plus aucun héros ne dépend de `video_url` via l'UI.
- **`MediaUploadSlot kind="video"` retiré de `app/(admin)/heros/[slug]/page.tsx`**, avec le paragraphe explicatif associé ("Deux modèles s'excluent..."), devenu obsolète. La colonne `video_url` et le `MediaSlot` `'video'` (`lib/uploadMedia.ts`, Route Handler d'upload) restent en base et dans le code — pas retirés, juste plus exposés dans cette UI — au cas où un futur héros ait un jour un documentaire unique non découpé en chapitres.
- **Vérifié** : `npx tsc --noEmit` propre.

## Lenteur — deuxième passe : `TimeoutError` et sur-lecture de données (2026-08-06)

Yannick a retesté après le correctif `getClaims()` : `proxy.ts` est bien redescendu bas la plupart du temps (20-30ms), mais une nouvelle erreur est apparue côté navigateur (`TimeoutError: signal timed out`) sur des pages qui restaient lentes (`GET /` à 5,5s, `POST /heros` — `toggleFeatured` — entre 1,7 et 2,5s).

**Recherche faite avant de corriger quoi que ce soit** (pas de patch à l'aveugle) :
- **Aucun `AbortSignal`/timeout explicite** trouvé dans le code de ce projet (composants clients, actions, routes), ni dans le bundle client de Next.js (`node_modules/next/dist/client/`), ni dans `@supabase/auth-js`/`@supabase/postgrest-js` — recherché explicitement (`AbortSignal.timeout`, `signal timed out`) dans les trois. Aucun client Supabase côté navigateur non plus (`grep` sur `createBrowserClient` : aucun résultat, toutes les lectures/écritures passent par le serveur).
- **`@supabase/postgrest-js` ne relance (retry) que sur le code 520** (erreurs Cloudflare) pour les méthodes idempotentes (`node_modules/@supabase/postgrest-js/src/PostgrestBuilder.ts`, fonction `shouldRetry`) — une erreur "table absente" (`hero_engagement` pas encore créée à ce stade du test) revient en une seule requête, sans retry ni ralentissement caché. Confirmé : rien à corriger côté dégradation de `getHeroEngagement()`/`getTotalEngagement()`.
- **Conclusion, cohérente avec le raisonnement déjà fait pour ce retour** : pas un timeout codé en dur qu'on aurait ajouté, mais un abandon du navigateur (ou de la couche de transport RSC de Next.js) face à une réponse trop lente — un symptôme de la lenteur réelle, pas une cause séparée. La vraie action est de réduire cette lenteur, pas de chercher un `AbortSignal` qui n'existe pas.

**Cause principale trouvée en lisant le code, pas devinée** : sur-lecture de données (`select('*')`) à plusieurs endroits qui n'avaient besoin que d'un sous-ensemble minuscule des colonnes :
- `getHeroesAdmin()` (liste + Tableau de bord) faisait `select('*')` sur les 9 héros — y compris le texte intégral des récits FR/EN, leur découpage par chapitre (`recit_chapitres_fr`/`_en`, un doublon quasi complet du texte intégral) et le storyboard complet (`chapitres_storyboard`, 96 planches avec voix off/cadrage par héros) — pour au final n'afficher qu'un nom, une région, des pastilles "présent/absent" et 3 barres de progression. **Corrigé** : nouveau type `HerosListItem` (`lib/data/heros.ts`), `select()` explicite qui exclut `recit_chapitres_fr`, `recit_chapitres_en` et `avertissement_lecture` (aucun des deux n'est utilisé par la liste ni le Tableau de bord — vérifié par recherche dans les deux fichiers avant de les exclure). `heroHasMedia()`/`heroIsComplete()` retypés sur `HerosListItem` ; la fiche détail (`getHeroBySlugAdmin`, qui a réellement besoin du texte intégral) n'est pas touchée et continue de fonctionner à l'identique (`HerosAdmin` reste un sur-ensemble compatible).
- `toggleFeatured`/`togglePublication`/`archiveHero` (`app/(admin)/heros/actions.ts`) appelaient `getHeroBySlugAdmin(slug)` — le même `select('*')` complet — juste pour lire un booléen avant de l'inverser. **Corrigé** : nouvelle fonction `getHeroToggleFields(slug)` (`lib/data/heros.ts`), 3 colonnes seulement (`nom_affiche, statut_publication, a_la_une`).
- **Tableau de bord** (`app/(admin)/page.tsx`) : 4 lectures indépendantes (héros, utilisateurs, signalements, engagement total) s'enchaînaient en séquence (`await` un par un) alors qu'aucune ne dépend du résultat d'une autre. **Corrigé** : `Promise.all(...)`, le temps total passe de la somme des 4 appels à leur maximum.
- **Liste des héros** : même correctif, `Promise.all([getHeroesAdmin(), getEngagementByHero()])`.
- **Non corrigé, identifié et documenté plutôt que caché** : `getHeroesAdmin()` doit encore transférer `recit_fr_texte`/`recit_en_texte` (texte intégral) et `chapitres_storyboard` (storyboard complet, planches incluses) pour les 9 héros, parce que `heroHasMedia()` a besoin de savoir si ces champs sont non-vides — et PostgREST ne permet pas de demander "est-ce que cette colonne est non-vide" sans la rapatrier, à moins de créer une vue ou une colonne calculée côté base (migration SQL, hors périmètre de cette passe). Piste réelle pour une prochaine passe si la liste reste lente après ce correctif : une vue Postgres `heros_liste` exposant des booléens `has_recit_fr`/`has_storyboard`/... calculés côté serveur plutôt que le contenu lui-même.
- **`app/(admin)/heros/[slug]/actions.ts`** (upload/suppression de médias) : chaque action enchaîne déjà plusieurs appels Supabase par nécessité causale (il faut lire avant d'écrire, écrire avant de journaliser) — pas de parallélisation possible sans changer l'ordre logique. Non touché.

**Vérifié** : `npx tsc --noEmit` propre après l'ensemble de ces changements. **Pas mesuré par un vrai lancement** (pas de clé `service_role` ici) : les gains attendus sont réels et vérifiables dans le code (moins de colonnes transférées, moins d'allers-retours séquentiels), mais seul un retest de Yannick confirmera si le `TimeoutError` a disparu.

## Ce qui est fait (lot 1)

- **Connexion** (`app/login/`) : email + mot de passe via Supabase Auth, **distinct** du compte téléphone de l'app mobile. Un seul rôle existe (`admin_complet`) — pas de système de rôles multiples tant que Yannick n'a pas tranché "qui d'autre aura accès" (question ouverte dans le cahier des charges).
- **Double vérification d'accès** (`lib/auth.ts`) : avoir un compte Supabase Auth valide ne suffit pas. Il faut en plus que l'email figure dans la table `admin_users` — sinon écran "Accès refusé" (jamais une boucle de redirection, jamais un accès silencieux).
- **Tableau de bord** (`app/(admin)/page.tsx`) : KPIs réels (héros publiés/total, utilisateurs réels via l'API admin Supabase, abonnés payants par forfait, signalements en attente), état de production des héros (barres réelles par type de média), répartition par forfait réelle, alertes réelles (héros incomplets → lien fonctionnel ; signalements → lien désactivé, écran Communauté prévu au lot 3, jamais un lien mort qui prétend mener quelque part).
- **Histoires & Héros** (`app/(admin)/heros/`) : liste (filtres Tous/Incomplets/À la une, recherche), fiche détail (métadonnées éditoriales éditables, photo, contenu par langue — audio/vidéo/récit — via un sélecteur de langue, mise à la une, publier/dépublier, "Dépublier & archiver" avec confirmation).
- **Contenu par langue** (`components/HeroLanguageContent.tsx`, ajouté le 2026-08-09, remplace les panneaux séparés MÉDIAS-audio/VIDÉOS/RÉCITS de la fiche héros) : un sélecteur de langue (onglets, piloté par `lib/langues.ts` — LANGUES_VIDEO) au-dessus de 3 sections qui affichent toutes le contenu de la langue active — audio (upload réel), vidéo des 4 chapitres (upload réel par chapitre), récit (panneau latéral `RecitDrawer.tsx`, lecture par défaut, bouton "Modifier" pour éditer, confirmation si fermeture avec modifications non enregistrées). But : éviter d'avoir à chercher la bonne colonne FR/EN dans 3 sections séparées — un choix de langue, tout le contenu de cette langue au même endroit. L'audio (`narration_audio_fr_url`/`_en_url`) et le récit (`recit_fr_texte`/`recit_en_texte`) restent des colonnes FR/EN fixes en base : un onglet de langue au-delà de FR/EN (si `LANGUES_VIDEO` s'étend un jour) affiche la vidéo normalement mais indique que l'audio/le récit n'ont pas encore de colonne dédiée, plutôt que de planter ou inventer une valeur. Corrige uniquement la version publiée en base, jamais les fichiers sources du pipeline éditorial (`Héros/*/fr.md` et `en.md`), qui restent la source de création via les agents griot/storyboard.
- **Vidéo par chapitre, multi-langues** (`components/ChapterVideoGrid.tsx`, ajouté le 2026-08-06, étendu au multi-langues et remonté sous `HeroLanguageContent.tsx` le 2026-08-09) : liste des 4 chapitres pour la langue active (passée en prop par `HeroLanguageContent`), upload/retrait réel par chapitre (même bucket `heroes-media`, même garde-fou de confirmation), titre de chapitre éditable, écriture dans `heros.video_chapitres` (jsonb — `videos: { code langue: URL }`, pas des colonnes FR/EN fixes, voir `mobile-app/supabase/migration-video-chapitres-multilangue.sql`).
- **Statistiques d'engagement réelles** (voir "Statistiques d'engagement réelles" plus bas) — plus une simplification assumée depuis le 2026-08-06 : le panneau "ENGAGEMENT GLOBAL" de la maquette (fiche héros) et un panneau équivalent sur le Tableau de bord affichent maintenant de vraies lectures/écoutes/visionnages, pas des chiffres fabriqués. Toujours aucun compteur "likes" (aucun système de réaction dans le modèle de données du projet).
- **Bibliothèque médias** (`app/(admin)/media/`) : upload générique (choix du héros + du type de média), **liste réelle** des fichiers du bucket Supabase Storage `heroes-media` (pas une liste statique).
- **Sidebar fidèle aux 15 écrans du cahier des charges** : les sections non construites (Découverte, Mythologie, École des Héros, Traduction = lot 2 ; Communauté, Marketplace, Dons, Abonnements, Sponsors, Utilisateurs, Paramètres = lot 3) restent visibles pour la vue d'ensemble, mais **non cliquables** — étiquette "LOT 2"/"LOT 3", jamais un lien mort.
- **Garde-fou sur les actions destructives** (demande explicite de Yannick) : toute action difficile à revenir en arrière (dépublier & archiver un héros, retirer un média déjà en ligne) passe par `components/ConfirmModal.tsx` — confirmation explicite dans l'UI elle-même, jamais juste le clic initial.
- **Journal d'activité** : chaque action d'administration (mise à la une, publication, upload, retrait, archivage) est enregistrée dans `admin_activity_log` dès maintenant, même si l'écran Paramètres qui l'affichera n'est prévu qu'au lot 3 — pas la peine d'attendre pour commencer à tracer.

## Simplifications assumées (à documenter, pas à cacher)

- **"Disponibilité" fusionnée avec "présence du média"** : la maquette distingue un panneau "Médias & disponibilité" (activer/désactiver sans supprimer) d'un panneau "Uploader/remplacer". Ce lot 1 ne modélise pas d'état "temporairement désactivé mais fichier conservé" séparé de l'URL elle-même — retirer un média vide le champ URL (le fichier reste dans Storage, mais il faut ré-uploader pour le réactiver). Documenté dans le composant `MediaUploadSlot.tsx`.
- ~~Statistiques d'engagement (vues, likes, taux de complétion) toujours absentes, volontairement~~ **Résolu le 2026-08-06** : voir "Statistiques d'engagement réelles" plus bas. Le compteur "likes" reste absent (aucun système de réaction dans le modèle de données du projet, décision déjà prise côté Communauté).
- **Les deux modèles vidéo (champ unique `video_url` vs `video_chapitres`) s'excluent côté app mobile**, jamais les deux à la fois (voir `app/(tabs)/accueil/heros/[slug]/video.tsx` : `hasLegacyVideo = video_url && !hasChapterVideos`). Le back-office n'empêche pas de remplir les deux en même temps (aucune donnée corrompue si ça arrive, l'app ignore simplement `video_url` dès qu'un chapitre existe), mais ne le fait jamais automatiquement à la place de l'admin — les deux panneaux restent indépendants et c'est signalé dans l'UI de la fiche héros.
- **"Rattaché à" (bibliothèque médias) calculé par correspondance d'URL**, pas un vrai champ de metadata dédié — un fichier orphelin apparaît "Non rattaché". Pas de nouvelle table pour ce seul usage en lot 1.
- **Recherche globale de la topbar réduite aux héros** (seul contenu réellement cherchable en lot 1) plutôt qu'un champ décoratif qui ne ferait rien.
- **Aucun "vendeurs en attente de validation" sur le tableau de bord** : la maquette le montre, mais le schéma Marketplace actuel n'a pas de statut "en attente" pour un vendeur (`is_active` seulement, actif dès l'inscription) — pas de chiffre inventé pour une notion qui n'existe pas encore dans les données réelles.

## Mise en service (à faire par Yannick, pas automatisable depuis ce workspace)

1. **Exécuter `supabase/schema-admin-heros.sql`** dans le SQL Editor du dashboard Supabase (projet `ygkyapryramhaskfbrrt`, le même que l'app mobile) — ajoute les colonnes `statut_publication`/`a_la_une` sur `heros`, crée `admin_users` et `admin_activity_log`.
2. **Authentication > Providers** : vérifier que "Email" est activé (devrait l'être par défaut, coexiste sans conflit avec "Phone" déjà activé pour l'app mobile).
3. **Authentication > Users > Add user** : créer ton compte email + mot de passe.
4. Revenir dans le SQL Editor et exécuter (en remplaçant l'email) :
   ```sql
   insert into public.admin_users (email, nom, role)
   values ('TON_EMAIL_ICI', 'Yannick', 'admin_complet');
   ```
5. **Copier `.env.local.example` en `.env.local`** et remplir les 3 valeurs (URL du projet, clé `anon`, clé `service_role` — Project Settings > API du dashboard Supabase). `.env.local` n'est jamais commité (voir `.gitignore`).
6. `npm install` puis `npm run dev`, ouvrir `http://localhost:3000`.
7. **Exécuter `mobile-app/supabase/schema-engagement.sql`** (table `hero_engagement` + fonction d'incrément) — sans ça, le panneau "ENGAGEMENT GLOBAL" affiche 0 partout (dégradation silencieuse, pas un crash), et l'app mobile n'enregistre aucun événement.
8. **Puis `mobile-app/supabase/schema-engagement-detail.sql`** (dans cet ordre : dépend du script précédent) — sans ça, le détail FR/EN sous les slots audio et le détail par chapitre × langue sur la grille vidéo affichent 0 partout (dégradation silencieuse, les totaux agrégés du point 7 restent corrects quoi qu'il arrive).

**Non fait depuis ce workspace** : ni la création du compte Supabase Auth, ni le remplissage de `.env.local` (nécessite la clé `service_role`, un secret que ce workspace n'a jamais eu et ne doit pas avoir) — donc **ce projet n'a été vérifié que par build/typecheck** (`npx next build`, compile proprement, aucune erreur TypeScript), **pas par un vrai lancement avec de vraies données**. À tester par Yannick avant de considérer le lot 1 réellement fini.

## Déploiement (pas fait, à décider)

Aucun hébergement choisi. Vercel serait cohérent avec Next.js et l'écosystème déjà utilisé sur le projet, mais reste une décision à prendre avec le pôle dev de Madou Consulting le moment venu — voir "Notes pour Yannick" dans `../prompt-claude-design-backoffice.md`.

## Structure

```
app/
  login/                 Connexion (page + Server Action)
  logout/route.ts        Déconnexion (Route Handler)
  api/heros/[slug]/
    media/route.ts          Route Handler — upload réel photo/audio/vidéo (POST)
    chapter-video/route.ts  Route Handler — upload réel vidéo de chapitre (POST)
  (admin)/                Groupe protégé (auth vérifiée dans layout.tsx)
    layout.tsx             Sidebar + Topbar + vérification admin_users
    page.tsx                Tableau de bord
    error.tsx               Filet de sécurité final (voir "Bug corrigé")
    heros/
      page.tsx               Liste des héros
      actions.ts              toggleFeatured / togglePublication / archiveHero
      [slug]/
        page.tsx                Fiche détail
        actions.ts               saveMetadata / saveRecit / removeMedia / removeChapterVideo /
                                  updateChapterTitle (payloads courts, jamais un fichier)
    media/page.tsx           Bibliothèque médias
components/               Sidebar, Topbar, ConfirmModal, RecitDrawer, HeroLanguageContent, Toggle,
                           StatusBadge, FeaturedStar, MediaUploadSlot, ChapterVideoGrid,
                           MetadataForm, GenericMediaUpload, HeroDetailActions
lib/
  supabase/server.ts       Client service_role (admin) + client session (anon+cookies)
  supabase/middleware.ts    Rafraîchissement de session, utilisé par proxy.ts
  auth.ts                   requireAdmin() — double vérification session + admin_users
  activityLog.ts            logActivity() best-effort
  uploadMedia.ts             Logique d'upload partagée par les 2 Route Handlers (voir "Bug corrigé")
  theme.ts                  Design tokens (repris de la maquette)
  navItems.ts               Structure de la sidebar (15 écrans, enabled par lot)
  data/heros.ts              Lecture heros (type miroir dupliqué de l'app mobile) — HerosAdmin (fiche détail, select complet) / HerosListItem (liste + Dashboard, select allégé) / getHeroToggleFields (actions de bascule, 3 colonnes)
  data/overview.ts           Utilisateurs (API admin) + signalements en attente
  data/media.ts               Listage réel du bucket Storage
  data/engagement.ts          Lecture hero_engagement (getHeroEngagement, getTotalEngagement, getEngagementByHero — une requête groupée, pas de boucle) + détail par média (getAudioEngagementDetail, getVideoChapterEngagement — requêtes séparées, voir "Statistiques d'engagement détaillées par média")
proxy.ts                   Ex-middleware.ts (convention Next.js 16) — protège les routes
supabase/schema-admin-heros.sql   Migration lot 1 (voir "Mise en service")
../app-mobile/mobile-app/supabase/schema-engagement.sql   Table hero_engagement, écrite par l'app mobile, lue ici — voir "Mise en service"
../app-mobile/mobile-app/supabase/schema-engagement-detail.sql   Détail FR/EN + hero_video_chapter_engagement, dépend du script précédent — voir "Mise en service"
```

## Lots suivants (proposition, voir `../prompt-claude-design-backoffice.md`)

- **Lot 2** : Découverte, Mythologie, École des Héros (vue matricielle), Traduction.
- **Lot 3** : Communauté (modération), Marketplace, Dons, Abonnements, Sponsors, Utilisateurs, Paramètres (rôles multiples, feature flags, journal d'activité affiché).
