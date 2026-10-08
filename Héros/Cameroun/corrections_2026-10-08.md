# Corrections factuelles des récits UPC (2026-10-08)

Héros concernés : Ruben Um Nyobè, Félix-Roland Moumié, Ernest Ouandié.
Incohérences signalées par les agents traduction FR/EN, quiz et pédagogue. Principe : on ne réécrit pas les récits, on remplace uniquement les passages fautifs, dans le même style.

Fichiers corrigés :
- `Héros/Cameroun/ruben-um-nyobe/fr.md` et `en.md`
- `Héros/Cameroun/felix-moumie/fr.md` et `en.md`
- `Héros/Cameroun/ernest-ouandie/fr.md` et `en.md`
- Base : `app-mobile/mobile-app/supabase/correction-recits-upc_2026-10-08.sql` (74 remplacements exacts, FR et EN, non exécuté)

---

## 1. Date de mort de Félix-Roland Moumié

- **Avant** : 3 novembre 1960 (récits de Moumié et d'Um Nyobè), 4 novembre 1960 (récit, frise et héros liés d'Ouandié).
- **Corrigé** : **3 novembre 1960** partout. Seul le récit d'Ouandié change (récit FR/EN, frise FR/EN, « héros liés » des fichiers).
- **Sources** :
  - Wikipédia FR, « Félix-Roland Moumié » (décès constaté le 3 novembre à 19 h 10) : https://fr.wikipedia.org/wiki/F%C3%A9lix-Roland_Moumi%C3%A9
  - Wikipedia EN, « Félix-Roland Moumié » (3 November 1960, aged 35) : https://en.wikipedia.org/wiki/F%C3%A9lix-Roland_Moumi%C3%A9
  - allAfrica (fr), récit de l'empoisonnement, « décède le 3 novembre 1960 » : https://fr.allafrica.com/stories/202511040208.html
  - camer.be, « 3 novembre 1960 : Félix Moumié meurt empoisonné à Genève » : https://www.camer.be/77500/35:32/le-saviez-vous
- **Certitude** : élevée. Aucune source consultée ne donne le 4 novembre.

## 2. Âge de Moumié à sa mort

- **Avant** : « qu'on le tue à quarante ans » / « get him killed at forty ».
- **Corrigé** : « à trente-cinq ans » / « at thirty-five ». Né le 1er novembre 1925 et mort le 3 novembre 1960, il venait d'avoir 35 ans deux jours plus tôt (pas 34 : les deux dates possibles tombent après son anniversaire).
- **Sources** : celles du point 1 (Wikipedia EN indique explicitement « aged 35 »).
- **Certitude** : élevée.

## 3. Naissance d'Um Nyobè (anachronisme)

- **Avant** : en 1913, le pays « vient tout juste de changer de maître colonial, l'Allemagne ayant cédé la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale » (la guerre n'a commencé qu'en 1914).
- **Corrigé** : « dans un pays qu'on appelle encore Kamerun, colonie allemande depuis 1884, et qui changera bientôt de maître colonial, l'Allemagne devant céder la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale ». Même logique en anglais (« a German colony since 1884, one that would soon change colonial masters, Germany having to cede its place… »).
- **Sources** :
  - Wikipédia FR, « Ruben Um Nyobè » (né le 10 avril 1913, Cameroun alors sous domination allemande) : https://fr.wikipedia.org/wiki/Ruben_Um_Nyob%C3%A8
  - Wikipedia EN, « French Cameroon » / « Kamerun » (protectorat allemand en juillet 1884, partage franco-britannique en 1916, mandats de la SDN en 1919-1922) : https://en.wikipedia.org/wiki/French_Cameroon
- **Certitude** : élevée.

## 4. Sous-titre d'Um Nyobè (« Fondateur »)

- **Avant** : « Fondateur et secrétaire général de l'Union des Populations du Cameroun (UPC)… » (FR, EN fichier, EN base).
- **Corrigé** : « Secrétaire général et principal dirigeant de l'Union des Populations du Cameroun (UPC), figure centrale… » / « Secretary general and principal leader of the Union of the Peoples of Cameroon (UPC)… ».
  Aligné aussi dans les « héros liés » de Moumié (« fondateur historique » devient « secrétaire général dès novembre 1948 ») et d'Ouandié (point 5).
- **Sources** :
  - Wikipédia FR et EN, « Ruben Um Nyobè » : absent lors de la création du 10 avril 1948, porté à la tête du parti comme secrétaire général en novembre 1948 après le retrait de Léopold Moumé Etia : https://fr.wikipedia.org/wiki/Ruben_Um_Nyob%C3%A8 , https://en.wikipedia.org/wiki/Ruben_Um_Nyob%C3%A8
- **Certitude** : élevée sur les faits. Note : une partie de la presse (ex. JusticeInfo) écrit encore qu'il « crée » l'UPC en 1948 ; c'est un raccourci courant, pas la chronologie établie.

## 5. Fondation de l'UPC dans le récit d'Ouandié

- **Avant** : UPC « fondé quelques mois plus tôt par Ruben Um Nyobè et ses compagnons » ; « Ruben Um Nyobè, le fondateur, le père du parti » ; « Deux dirigeants fondateurs assassinés en deux ans » ; héros liés « fondateur de l'UPC ».
- **Corrigé** : « fondé en avril 1948 à Douala par un groupe de syndicalistes, dont Ruben Um Nyobè devient le secrétaire général en novembre » ; « le secrétaire général, le père du parti » ; « Deux dirigeants historiques assassinés » ; héros liés « secrétaire général de l'UPC ». Même chose en anglais.
- **Sources** : celles du point 4.
- **Certitude** : élevée.

## 6. Mort d'Um Nyobè : qui a tiré

- **Avant** : « forces franco-camerounaises » (récit de Moumié, 2 passages), « forces françaises » (récit d'Ouandié).
- **Corrigé** : partout « une patrouille de l'armée française » / « a French army patrol ». Le récit d'Um Nyobè (« troupes françaises », « tué par l'armée française ») était déjà cohérent et n'a pas été touché.
- **Sources** :
  - JusticeInfo.net, « Cameroun : Um Nyobè, héros symbole des crimes de la France » : « abattu par une troupe de supplétifs commandée par un officier français » ; le tireur, Abdoulaye, est un soldat tchadien (sara) de la patrouille : https://www.justiceinfo.net/fr/82035-cameroun-um-nyobe-heros-symbole-crimes-france.html
  - Wikipédia FR et EN, « Ruben Um Nyobè » (tué par l'armée française, « a military patrol ») : liens du point 4
- **Certitude** : élevée sur le fond (opération de l'armée française, sous commandement français, avec des soldats africains). La composition exacte de la patrouille n'a pas été ajoutée au texte, pour rester minimal.

## 7. Lieu de la rencontre Moumié et Um Nyobè

- **Avant** : récit « rejoint l'hôpital de Lolodorf, près de Kribi. C'est là, dans cette petite ville du sud, […] qu'il rencontre Um Nyobè » ; frise « médecin colonial à Lolodorf, rencontre Um Nyobè à Kribi ». Contradiction, et Lolodorf est à une centaine de kilomètres de Kribi, pas « près ».
- **Corrigé** : « affecté dans le sud, à Lolodorf selon certaines sources, à Kribi selon d'autres. C'est à Kribi, petite ville côtière du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè. » Frise : « médecin colonial dans le sud (Lolodorf ou Kribi selon les sources), rencontre Ruben Um Nyobè à Kribi ». Même chose en anglais.
- **Sources** :
  - Wikipédia FR, « Félix-Roland Moumié » : affecté à Kribi en 1947, « dans cette ville, il va rencontrer pour la première fois Ruben Um Nyobè »
  - camer.be, « 3 novembre 1960 - 3 novembre 2025 : il y a soixante-cinq ans l'assassinat à Genève du docteur Félix-Roland Moumié » : « 1948 : Um et Moumié se rencontrent à Kribi » : https://www.camer.be/82923/35:32/suisse-3-novembre-1960-3-novembre-2025-il-y-a-soixante-cinq-ans-lassassinat-a-geneve-du-docteur-felix-roland-moumie-switzerland.html
  - Biographie publiée sur loidici.biz (repérée en recherche, page non consultable en direct) : affecté à l'hôpital de Lolodorf, à 110 km de Kribi
- **Certitude** : moyenne-haute pour Kribi comme lieu de rencontre (deux sources concordantes) ; l'affectation (Lolodorf ou Kribi) reste divergente selon les sources, d'où la formulation prudente.

## 8. Mort d'Abel Kingué

- **Avant** : 16 juin 1964 (récit d'Ouandié FR/EN, frises en base FR/EN, fiche EN), 16 avril 1964 (frise et héros liés de `ernest-ouandie/fr.md`, et récit d'Abel Kingué lui-même).
- **Corrigé** : **16 avril 1964** partout.
- **Sources** :
  - Wikipédia FR, « Abel Kingué » : évacué d'Alger vers Le Caire par l'avion d'Ahmed Ben Bella, mort le 16 avril 1964 : https://fr.wikipedia.org/wiki/Abel_Kingu%C3%A9
  - Wikipedia EN, « Abel Kingué » (1924-16 April 1964, Cairo) : https://en.wikipedia.org/wiki/Abel_Kingu%C3%A9
  - camer.be, « Cameroun Retro : 16 avril 1964, décès d'Abel Kingue, militant nationaliste et ancien vice-président de l'UPC » (déjà cité dans `abel-kingue/fr.md`)
- **Certitude** : moyenne-haute. La date du 16 juin circule dans au moins une notice en ligne (elle vient probablement de l'article Wikipédia sur Ouandié), mais les notices consacrées à Kingué lui-même donnent toutes le 16 avril.

## 9. Réhabilitation de 1991

- **Avant** : Um Nyobè et Ouandié : « le 27 juin [1991], l'Assemblée nationale le proclame héros national », puis loi n° 91/022 du 16 décembre ; Moumié : « le 16 décembre 1991, […] l'Assemblée nationale proclame Moumié héros national ».
- **Corrigé**, même formulation dans les trois récits : le 16 décembre 1991, la **loi n° 91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya**, le réhabilite officiellement ; il est **depuis honoré comme héros national**. Frises : la date « 27 juin puis 16 décembre 1991 » devient « 16 décembre 1991 », et « déclaré héros national par la loi… (après le vote du 27 juin 1991) » devient « réhabilité par la loi n° 91/022, adoptée par l'Assemblée nationale et promulguée par le président Paul Biya ; honoré depuis comme héros national ».
- **Sources** :
  - Cameroon Tribune : le président Paul Biya promulgue le 16 décembre 1991 la loi « portant réhabilitation de certaines figures de l'histoire du Cameroun » (Ahidjo, Um Nyobè, Moumié, Ouandié), critères « avoir œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays, le rayonnement de son histoire ou de sa culture » : https://cameroon-tribune.cm/articles/11753/fr/details_2
  - Mémoire « L'Assemblée nationale comme pouvoir constituant dérivé au Cameroun entre 1990 et 2008 » : Assemblée convoquée en session extraordinaire en décembre 1991, textes promulgués le 16 décembre 1991, dont la loi portant réhabilitation : https://www.memoireonline.com/11/13/7925/m_L-assemblee-nationale-comme-pouvoir-constituant-derive-au-Cameroun-entre-1990-et-200827.html
  - JusticeInfo.net (lien du point 6) : « Il a fallu attendre décembre 1991 pour que soit promulguée une première loi portant réhabilitation de grandes figures »
- **Certitude** : élevée pour la loi du 16 décembre 1991. **Le « 27 juin 1991 » n'est pas confirmé** : il n'apparaît que dans des notices secondaires (ex. osidimbea.cm : « proclamé Héros national par l'Assemblée nationale du Cameroun le 27 juin 1991 », https://www.osidimbea.cm/hommes-et-femmes/um-nyobe-ruben/), sans référence à un texte, et il ne colle pas avec l'adoption de la loi en session extraordinaire de décembre. Retiré des récits plutôt qu'affirmé. Note : le texte de loi parle de « réhabilitation » ; « héros national » est l'appellation d'usage, d'où « honoré depuis comme héros national ».

## 10. Titre du chapitre 2 de Moumié

- **Avant** : « L'ascension, le sang de New-Bell, la fuite » / « The rise, the blood of New-Bell, the flight » (New-Bell et la fuite sont racontés au chapitre 3).
- **Corrigé** : « L'ascension, de Dschang à la présidence de l'UPC » / « The rise, from Dschang to the UPC presidency » (le chapitre raconte la vice-présidence au congrès de Dschang en 1950, puis la présidence au congrès d'Éséka en 1952). Découpage inchangé. Ce titre n'existe qu'en base (les fichiers .md n'ont pas de titres de chapitres).
- **Certitude** : sans objet (correction éditoriale).

## 11. Nom anglais de l'UPC

- **Avant** : « Union of the Populations of Cameroon » (récit EN d'Um Nyobè, fichier et base).
- **Corrigé** : « Union of the Peoples of Cameroon » partout (sous-titre, récit, frise du fichier EN ; récit en chapitres et texte complet EN en base). La frise et le sous-titre EN en base utilisaient déjà la bonne forme.

---

## Points de vigilance pour Jarvis / Yannick

1. **Le SQL n'a pas été exécuté.** Le lancer dans Supabase > SQL Editor **après** les lots de traduction 1, 2 et 3 (le titre anglais du chapitre 2 de Moumié n'existe qu'après le lot 3). La requête de contrôle en fin de script doit donner `ancien_present = false` et `nouveau_present = true` sur toutes les lignes.
2. **`recit_fr_texte` / `recit_en_texte` ne figurent pas dans l'export du 2026-10-07.** Leurs remplacements ont été vérifiés sur les fichiers .md (dont ils sont issus) et sur `seed.sql`, où chaque ancien passage est présent. Si une ligne du contrôle reste à `nouveau_present = false` pour ces colonnes, c'est que le texte en base diffère : me le signaler.
3. Le trigger d'intégrité recalculera l'empreinte de `recit_fr_texte` (changement tracé dans `content_integrity_log`). C'est attendu.
4. **Non modifiés, hors périmètre (à décider)** : `seed.sql` contient encore les anciennes versions (y compris des voix off de storyboard), tout comme les storyboards `Récits africains storyboards/` (Moumié : « quarante ans », titre du chapitre 2…) et éventuellement les contenus École des Héros et quiz déjà générés. Les agents storyboard, quiz et pédagogue doivent se réaligner sur ces corrections.
5. **Écart repéré mais non corrigé (pas dans la liste)** : la date du dîner empoisonné de Moumié. Les récits disent le 15 octobre 1960 ; allAfrica et camer.be situent les premiers symptômes dans la nuit du 16 au 17 octobre 1960 (dîner la veille au soir), avec admission en clinique le 17. À vérifier dans une prochaine passe.
