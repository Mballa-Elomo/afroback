# Modèle de données — Pilier Histoires & Héros (app mobile AFROBACK)

> Document produit pour la Phase 0 du développement de l'app mobile native (React Native). Sert de base au pôle dev de Madou Consulting pour l'écran "catalogue héros", la "fiche héros", le "lecteur de récit" et le "lecteur audio/vidéo".
>
> Sources : 9 récits du griot AFROBACK (`livrables/sites-web/afroback/Héros/[Pays]/[nom-du-héros]/`) et leurs storyboards vidéo associés (`livrables/sites-web/afroback/Récits africains storyboards/`). Aucune information n'est inventée au-delà de ce qui est lu dans ces fichiers.

---

## 1. Schéma de données (table `heros`, Postgres/Supabase)

| Champ | Type | Description | Obligatoire |
|---|---|---|---|
| `id` | `uuid` (PK, `default gen_random_uuid()`) | Identifiant unique interne | Oui |
| `slug` | `text` (unique) | Identifiant lisible utilisé dans les URLs/routes et pour retrouver les fichiers sources (ex. `reine-nzinga`) | Oui |
| `nom_affiche` | `text` | Nom court affiché sur la carte catalogue et le header de la fiche (ex. "Reine Nzinga") | Oui |
| `nom_complet` | `text` | Nom complet / nom de naissance tel qu'indiqué dans la fiche structurée du griot (ex. "Nzinga Mbandi (Njinga a Mbande)") | Oui |
| `sous_titre` | `text` | Sous-titre descriptif court, repris du H1/intro du récit (ex. "Reine de Ndongo et de Matamba (actuel Angola), XVIIe siècle") | Oui |
| `epoque` | `text` | Période historique, reprise du champ **Époque** de la fiche structurée | Oui |
| `region` | `text` | Région géographique, reprise du champ **Région** | Oui |
| `theme` | `text` ou `text[]` | Thème(s) principal(aux) (résistance, politique, science, art...), un héros peut en avoir plusieurs | Oui |
| `resume_catalogue` | `text` | Résumé de 2-3 phrases pour la carte du catalogue héros (à rédiger éditorialement, pas un copier-coller du récit long) | Oui |
| `annee_naissance_indicative` | `text` | Année ou période de naissance, texte libre car plusieurs héros ont des dates incertaines/débattues dans les sources (ex. "v. 1583", "12 décembre 1933") | Optionnel |
| `annee_mort_indicative` | `text` | Idem pour le décès, `null` non applicable si figure encore vivante (aucun cas ici) | Optionnel |
| `recit_fr_texte` | `text` (ou clé de stockage objet si fichier long) | Texte intégral du récit narré par le griot, version française, section "Le récit du griot" | Oui |
| `recit_fr_fichier_source` | `text` | Chemin du fichier source FR (ex. `livrables/sites-web/afroback/Héros/Angola/reine-nzinga/fr.md`) | Oui |
| `recit_en_texte` | `text` | Texte intégral du récit, version anglaise | Oui (si dispo) |
| `recit_en_fichier_source` | `text` | Chemin du fichier source EN | Oui (si dispo) |
| `frise_chronologique` | `jsonb` | Tableau d'objets `{date, evenement}` repris de la section "Frise chronologique" de la fiche structurée | Oui |
| `citations` | `jsonb` | Tableau d'objets `{texte, statut_attestation, source}` — `statut_attestation` ∈ {`attestee`, `rapportee_par_tiers`, `non_authentifiee`} pour distinguer une citation vérifiée (source primaire datée) d'une parole simplement rapportée | Optionnel (peut être vide si aucune citation authentifiée, cf. Ruben Um Nyobè, Félix Moumié) |
| `sources` | `jsonb` | Liste des sources utilisées par le griot (bibliographie), reprise telle quelle de la section "Sources utilisées" | Oui |
| `legendes_associees` | `jsonb` | Tableau d'objets `{titre, description, statut}` où `statut` est toujours `legende` (jamais présenté comme fait) — reprend la section "Légendes associées" | Optionnel |
| `heros_lies` | `text[]` (ou table de liaison `heros_heros_lies`) | Slugs des autres héros du catalogue mentionnés comme liés | Optionnel |
| `chapitres_storyboard` | `jsonb` | Tableau de 4 objets `{numero: 1-4, titre_chapitre, fichier_source, nb_planches, statut}` — un par chapitre de storyboard | Oui (si storyboard existant) |
| `statut_recit_texte` | `enum` (`pret`, `brouillon`, `a_produire`) | Statut de production du texte du récit | Oui — `pret` pour les 9 héros actuels |
| `statut_narration_audio` | `enum` (`pret`, `en_cours`, `a_produire`) | Statut de production de la narration audio (lecteur audio) | Oui — `a_produire` pour les 9 héros actuels |
| `statut_video` | `enum` (`pret`, `en_cours`, `storyboard_pret`, `a_produire`) | Statut de production de la vidéo (lecteur vidéo) | Oui — `storyboard_pret` pour les 9 héros actuels |
| `image_carte_catalogue` | `text` (URL/clé de stockage) | Visuel utilisé sur la carte du catalogue héros | Optionnel (aucun visuel produit à ce jour, cf. incohérences) |
| `avertissement_lecture` | `text` | Champ optionnel pour les récits à figure ambivalente (ex. Charles Atangana), reprend l'"Avertissement de lecture" du storyboard s'il existe | Optionnel |
| `ordre_affichage` | `integer` | Ordre manuel d'affichage dans le catalogue (indépendant de la date de création) | Optionnel |
| `created_at` / `updated_at` | `timestamptz` | Horodatage standard | Oui |

**Table de liaison recommandée** : `heros_heros_lies (heros_id uuid, heros_lie_id uuid)` plutôt qu'un simple `text[]`, pour garder l'intégrité référentielle si de nouveaux héros sont ajoutés plus tard et permettre une navigation "héros liés" cliquable dans l'app.

**Table associée recommandée** : `heros_chapitres (id uuid, heros_id uuid FK, numero int, titre text, fichier_source text, nb_planches int, statut text)` — normaliser `chapitres_storyboard` dans une vraie table plutôt qu'un `jsonb` si le lecteur vidéo a besoin d'interroger/filtrer les chapitres indépendamment (ex. suivre la progression de visionnage chapitre par chapitre).

---

## 2. Dataset peuplé — 9 héros

### 1. Reine Nzinga (Njinga a Mbande)

| Champ | Valeur |
|---|---|
| `slug` | `reine-nzinga` |
| `nom_complet` | Nzinga Mbandi (Njinga a Mbande) |
| `sous_titre` | Reine de Ndongo et de Matamba (actuel Angola), XVIIe siècle |
| `epoque` | Précolonial, règne de 1624 à 1663 |
| `region` | Afrique centrale (royaumes de Ndongo et Matamba, actuel Angola) |
| `theme` | Résistance / politique |
| `resume_catalogue` | Née vers 1583 dans le royaume de Ndongo, Njinga devient reine en 1624 et résiste pendant près de quarante ans à la colonisation portugaise, alliant diplomatie, guerre et ruse. Une figure de résistance ambivalente : elle a aussi participé activement à la traite négrière pour financer ses guerres. Elle meurt en 1663 sans avoir perdu sa couronne. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) |
| Fichiers sources | `Héros/Angola/reine-nzinga/fr.md`, `en.md` ; `Récits africains storyboards/reine-nzinga/chapitre-1.md` à `chapitre-4.md` |

### 2. Martin Paul Samba (Mebenga m'Ebono)

| Champ | Valeur |
|---|---|
| `slug` | `martin-paul-samba` |
| `nom_complet` | Martin Paul Samba (né Mebenga m'Ebono) |
| `sous_titre` | Chef bulu et résistant à la colonisation allemande, sud du Cameroun, fin XIXe - début XXe siècle |
| `epoque` | Colonial (Kamerun allemand, 1884-1916) |
| `region` | Afrique centrale (sud du Cameroun, pays bulu, région d'Ebolowa) |
| `theme` | Résistance |
| `resume_catalogue` | Formé comme officier par l'armée coloniale allemande qu'il sert pendant huit ans, Samba se retourne contre elle après avoir vu de près la brutalité du régime colonial. Il prépare en secret un soulèvement armé avec Rudolf Duala Manga Bell, mais la lettre qu'il envoie aux Français est interceptée. Il est exécuté le 8 août 1914 à Ebolowa. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) |
| Fichiers sources | `Héros/Cameroun/martin-paul-samba/fr.md`, `en.md` ; `Récits africains storyboards/martin-paul-samba/chapitre-1.md` à `chapitre-4.md` |

### 3. Rudolf Douala Manga Bell

| Champ | Valeur |
|---|---|
| `slug` | `rudolf-douala-manga-bell` |
| `nom_complet` | Rudolf Douala Manga Bell |
| `sous_titre` | Roi du clan Bell chez les Douala, résistant à l'expropriation coloniale allemande, exécuté à Douala en 1914 |
| `epoque` | Colonial (Kamerun allemand, 1884-1916) |
| `region` | Afrique centrale (Douala, littoral camerounais actuel) |
| `theme` | Résistance |
| `resume_catalogue` | Roi formé par l'empire allemand lui-même, Manga Bell se dresse contre le projet ségrégationniste "Gross Duala" qui menace de chasser son peuple des rives du Wouri. Destitué puis inculpé de haute trahison, il est pendu le 8 août 1914 à Douala, sept semaines seulement avant que les troupes alliées ne prennent la ville. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) |
| Fichiers sources | `Héros/Cameroun/rudolf-douala-manga-bell/fr.md`, `en.md` ; `Récits africains storyboards/rudolf-douala-manga-bell/chapitre-1.md` à `chapitre-4.md` |

### 4. Sultan Njoya (Ibrahim Njoya)

| Champ | Valeur |
|---|---|
| `slug` | `sultan-njoya` |
| `nom_complet` | Sultan Njoya (Ibrahim Njoya) |
| `sous_titre` | Dix-septième roi (mfon) du royaume Bamoun, unificateur et inventeur de l'écriture Shümom, ouest du Cameroun |
| `epoque` | Colonial (royaume Bamoun sous Kamerun allemand puis Cameroun français, règne v. 1886/1887-1931, mort en exil en 1933) |
| `region` | Afrique centrale (royaume Bamoun, ouest du Cameroun actuel, capitale Foumban) |
| `theme` | Science (invention d'une écriture) ; également art et politique |
| `resume_catalogue` | Roi diplomate resté en bons termes avec l'administration allemande, Njoya invente entre 1896 et 1918 une écriture propre à son peuple, le Shümom, et ouvre des écoles pour l'enseigner. La colonisation française finit par le déposséder : sa presse d'imprimerie est détruite avant usage et il meurt en exil à Yaoundé en 1933. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) |
| Fichiers sources | `Héros/Cameroun/sultan-njoya/fr.md`, `en.md` ; `Récits africains storyboards/sultan-njoya/chapitre-1.md` à `chapitre-4.md` |

### 5. Ruben Um Nyobè (le Mpodol)

| Champ | Valeur |
|---|---|
| `slug` | `ruben-um-nyobe` |
| `nom_complet` | Ruben Um Nyobè (surnommé Mpodol) |
| `sous_titre` | Fondateur et secrétaire général de l'Union des Populations du Cameroun (UPC), figure centrale de la lutte pour l'indépendance et la réunification du Cameroun |
| `epoque` | Colonial (Cameroun sous tutelle française, 1913-1958) |
| `region` | Afrique centrale (Cameroun, pays bassa, région d'Éséka et de Boumnyébel) |
| `theme` | Résistance / politique |
| `resume_catalogue` | Fils de paysans devenu greffier puis syndicaliste, Um Nyobè porte le combat pour l'indépendance camerounaise jusqu'à la tribune de l'ONU en 1952. Après l'interdiction de l'UPC en 1955, il entre en clandestinité et tient trois ans dans le maquis bassa avant d'être tué par l'armée française le 13 septembre 1958. La France ne reconnaîtra sa responsabilité qu'en 2025. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) |
| Fichiers sources | `Héros/Cameroun/ruben-um-nyobe/fr.md`, `en.md` ; `Récits africains storyboards/ruben-um-nyobe/chapitre-1.md` à `chapitre-4.md` |

### 6. Charles Atangana (Ntsama, dit Karl)

| Champ | Valeur |
|---|---|
| `slug` | `charles-atangana` |
| `nom_complet` | Charles Atangana (né Ntsama, dit Karl) |
| `sous_titre` | Chef supérieur des Ewondo et des Bane, figure centrale et controversée du Cameroun sous administrations allemande puis française |
| `epoque` | Colonial (Kamerun allemand puis Cameroun sous mandat français, v. 1880-1943) |
| `region` | Afrique centrale (Cameroun, région de Yaoundé, peuples ewondo et bane) |
| `theme` | Politique (figure ambivalente : collaboration coloniale, non résistance) |
| `resume_catalogue` | Contrairement à Samba ou Manga Bell, Atangana bâtit sa fortune et son pouvoir en se rendant indispensable aux administrations coloniales allemande puis française, jusqu'à dénoncer un complot de son propre peuple en 1907. Bâtisseur de routes, d'écoles et de la ville de Yaoundé, mais aussi accumulateur de richesse contestée par les siens, sa mémoire reste débattue au Cameroun. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) — ce storyboard comporte en plus un "Avertissement de lecture" explicite en tête de chapitre 1, à reprendre dans l'app comme bandeau contextuel sur la fiche héros |
| Fichiers sources | `Héros/Cameroun/charles-atangana/fr.md`, `en.md` ; `Récits africains storyboards/charles-atangana/chapitre-1.md` à `chapitre-4.md` |

### 7. Félix-Roland Moumié

| Champ | Valeur |
|---|---|
| `slug` | `felix-moumie` |
| `nom_complet` | Félix-Roland Moumié |
| `sous_titre` | Médecin et président de l'Union des populations du Cameroun (UPC), assassiné par empoisonnement au thallium à Genève en 1960 |
| `epoque` | Colonial / indépendances (1925-1960) |
| `region` | Afrique centrale (Cameroun ; exil au Cameroun britannique, Ghana, Guinée ; assassiné à Genève, Suisse) |
| `theme` | Résistance / politique |
| `resume_catalogue` | Médecin formé par le système colonial, Moumié rejoint l'UPC en 1948 et en devient le chef en exil après la mort d'Um Nyobè en 1958. Le 15 octobre 1960 à Genève, il est empoisonné au thallium par un agent présumé des services secrets français ; il meurt le 3 novembre 1960. Le Cameroun ne le proclame héros national qu'en 1991. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) |
| Fichiers sources | `Héros/Cameroun/felix-moumie/fr.md`, `en.md` ; `Récits africains storyboards/felix-moumie/chapitre-1.md` à `chapitre-4.md` |

### 8. Ernest Ouandié

| Champ | Valeur |
|---|---|
| `slug` | `ernest-ouandie` |
| `nom_complet` | Ernest Ouandié |
| `sous_titre` | Instituteur devenu dernier dirigeant historique de l'UPC, chef du maquis contre la France et le régime d'Ahmadou Ahidjo, exécuté publiquement à Bafoussam en 1971 |
| `epoque` | Colonial puis indépendances (1924-1971) |
| `region` | Afrique centrale (ouest du Cameroun, pays bamiléké ; exécuté à Bafoussam) |
| `theme` | Résistance / politique |
| `resume_catalogue` | Instituteur formé par l'école coloniale, Ouandié devient en 1961 le dernier des grands dirigeants historiques de l'UPC encore vivant et rentre clandestinement diriger le maquis. Capturé en 1970 après une décennie de traque, il est exécuté publiquement à Bafoussam devant 40 000 personnes le 15 janvier 1971. Réhabilité héros national en 1991. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) |
| Fichiers sources | `Héros/Cameroun/ernest-ouandie/fr.md`, `en.md` ; `Récits africains storyboards/ernest-ouandie/chapitre-1.md` à `chapitre-4.md` |

### 9. Manu Dibango

| Champ | Valeur |
|---|---|
| `slug` | `manu-dibango` |
| `nom_complet` | Manu Dibango (né Emmanuel N'Djoké Dibango) |
| `sous_titre` | Saxophoniste, chanteur et compositeur camerounais, figure musicale majeure du XXe et du début du XXIe siècle, auteur de "Soul Makossa" |
| `epoque` | Contemporain (1933-2020) |
| `region` | Afrique centrale (Cameroun), rayonnement international depuis la France |
| `theme` | Art (musique) |
| `resume_catalogue` | Parti étudier en France à quinze ans avec trois kilos de café dans son sac, Dibango devient musicien de studio avant de composer, presque par hasard, "Soul Makossa" en 1972, l'un des tout premiers tubes disco mondiaux. Chevalier de la Légion d'honneur, Artiste de la paix de l'UNESCO, il meurt du Covid-19 en 2020. |
| Chapitres storyboard | 4/4 confirmés |
| Statut récit texte | Prêt (FR + EN) |
| Statut narration audio | À produire |
| Statut vidéo | Storyboard prêt (96 planches) |
| Fichiers sources | `Héros/Cameroun/manu-dibango/fr.md`, `en.md` ; `Récits africains storyboards/manu-dibango/chapitre-1.md` à `chapitre-4.md` |

---

## 3. Incohérences et manques constatés

1. **Aucune incohérence structurelle trouvée sur les 9 héros couverts.** Chacun des 9 héros listés possède : un récit FR (`[slug].md`), un récit EN (`[slug]-EN.md`), et un storyboard complet de 4 fichiers chapitres (`chapitre-1.md` à `chapitre-4.md`). Vérification faite par listage de répertoire, pas seulement par lecture partielle.

2. **Aucun contenu audio ni vidéo n'existe à ce jour** pour aucun des 9 héros : seul le texte du récit est "prêt", la narration audio et la vidéo sont encore "à produire" (storyboard prêt à être transformé en vidéo, mais aucun rendu vidéo ni audio n'a été trouvé dans le workspace).

3. **Aucun visuel de carte catalogue (`image_carte_catalogue`) n'existe** dans les livrables consultés : les storyboards décrivent une bible visuelle textuelle (personnage, palette, style) mais aucune image n'a été générée à ce stade. Ce champ devra rester vide/optionnel tant que la production visuelle n'a pas commencé.

4. **Dates de naissance incertaines pour plusieurs héros**, signalées explicitement par le griot lui-même dans les fiches sources (ex. Charles Atangana : sources hésitant entre 1876 et 1885 ; Sultan Njoya : incohérence relevée par le griot lui-même entre v. 1860 et v. 1876 ; Ernest Ouandié : village natal et détails familiaux incertains). Le champ `annee_naissance_indicative` est volontairement en `text` libre (et non `date`) pour porter cette incertitude plutôt que de forcer une fausse précision.

5. **Citations authentifiées inégales selon les héros** : seuls Sultan Njoya, Charles Atangana, Ruben Um Nyobè (1 citation ONU) et Manu Dibango (3 citations d'interview) disposent de citations avec un niveau d'attestation solide. Reine Nzinga, Martin Paul Samba, Rudolf Douala Manga Bell, Félix Moumié et Ernest Ouandié n'ont **aucune** citation authentifiée par une source primaire datée — le champ `citations` sera donc vide ou ne contiendra que des citations au statut `non_authentifiee`/`rapportee_par_tiers` pour ces 5 héros. C'est un fait de recherche documenté par le griot, pas un manque de travail.

6. **Charles Atangana est un cas particulier à traiter avec soin côté UI** : son storyboard chapitre 1 comporte un "Avertissement de lecture" explicite absent des autres récits (figure ambivalente, ni résistant ni héros classique). Le schéma proposé inclut un champ `avertissement_lecture` dédié pour que l'app puisse afficher ce contexte avant le récit, plutôt que de le traiter comme un héros de résistance standard.

7. **Aucune vérification effectuée sur le contenu détaillé des 96 planches par héros** (uniquement la bible visuelle en tête de chapitre 1, comme demandé) : si le pôle dev a besoin d'un niveau de détail par planche dans le modèle de données (ex. pour un lecteur vidéo scène par scène), une passe complémentaire sur les fichiers `chapitre-2.md` à `chapitre-4.md` de chaque héros sera nécessaire — non faite ici pour rester dans le périmètre demandé.

8. **Pas de champ dédié pour la relation historique entre héros dans un graphe visuel** : les "héros liés" sont bien documentés dans chaque fiche source (ex. le réseau Samba/Manga Bell/Njoya/Atangana en 1914, ou le trio Um Nyobè/Moumié/Ouandié à la tête de l'UPC), mais ce modèle ne propose qu'une liste simple (`heros_lies` ou table de liaison). Si le produit veut visualiser ces réseaux (ex. "voir aussi"), la table de liaison suggérée en section 1 suffit pour la Phase 0, une modélisation en graphe plus riche pourrait être envisagée plus tard si le besoin produit le justifie.
