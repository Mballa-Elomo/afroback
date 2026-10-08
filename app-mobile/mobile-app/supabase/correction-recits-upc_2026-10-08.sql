-- =====================================================================
-- AFROBACK · Correction factuelle des récits UPC (2026-10-08)
-- Héros concernés : ruben-um-nyobe, felix-moumie, ernest-ouandie
--
-- Agent griot, à la demande de Jarvis (incohérences signalées par les
-- agents traduction, quiz et pédagogue). Détail, sources et degré de
-- certitude : livrables/sites-web/afroback/Héros/Cameroun/corrections_2026-10-08.md
--
-- PRINCIPE : uniquement des REMPLACEMENTS EXACTS de passages, jamais de
-- réécriture d'un champ entier. Colonnes FR et EN : récit en chapitres
-- (jsonb), texte complet (recit_fr_texte / recit_en_texte), frises, sous-titres.
-- Si un « ancien » texte n'est pas trouvé, replace() ne fait rien (aucun
-- risque d'écraser) : la requête de contrôle en fin de script le montre.
--
-- Vérifié avant livraison (Python) : chaque ancien texte existe exactement
-- une fois dans le champ visé (export du 2026-10-07 + scripts de traduction
-- lot 1, 2 et 3 ; « Union of the Populations of Cameroon » apparaît plusieurs
-- fois, toutes remplacées).
--
-- PRÉREQUIS : exécuter après traduction-en-lot1/2/3 (les colonnes _en sont
-- corrigées dans leur version issue de ces scripts, ex. titre anglais du
-- chapitre 2 de Moumié).
-- Le trigger d'intégrité (trg_heros_integrity) recalcule automatiquement
-- contenu_hash / contenu_signature quand recit_fr_texte change : c'est
-- attendu, la modification sera tracée dans content_integrity_log.
--
-- À exécuter par Yannick dans Supabase > SQL Editor. Rejouable sans risque
-- (au deuxième passage, les anciens textes n'existent plus).
-- =====================================================================

begin;

-- ernest-ouandie · recit_chapitres_fr
update public.heros set recit_chapitres_fr = (replace(replace(replace(replace(replace(replace(recit_chapitres_fr::text,
    $a$Moumié agonise à Genève et meurt le 4 novembre 1960.$a$,
    $a$Moumié agonise à Genève et meurt le 3 novembre 1960.$a$)  /* point 1 */,
    $a$fondé quelques mois plus tôt par Ruben Um Nyobè et ses compagnons, et qui ose$a$,
    $a$fondé en avril 1948 à Douala par un groupe de syndicalistes, dont Ruben Um Nyobè devient le secrétaire général en novembre, et qui ose$a$)  /* point 5 */,
    $a$Ruben Um Nyobè, le fondateur, le père du parti, est tué par les forces françaises$a$,
    $a$Ruben Um Nyobè, le secrétaire général, le père du parti, est tué par une patrouille de l'armée française$a$)  /* point 5 */,
    $a$Deux dirigeants fondateurs assassinés en deux ans$a$,
    $a$Deux dirigeants historiques assassinés en deux ans$a$)  /* point 5 */,
    $a$Le 16 juin 1964, à son tour, Abel Kingué$a$,
    $a$Le 16 avril 1964, à son tour, Abel Kingué$a$)  /* point 8 */,
    $a$que l'Assemblée nationale camerounaise vote, le 27 juin, sa reconnaissance comme héros national, formalisée par la loi n° 91/022 du 16 décembre 1991.$a$,
    $a$que la loi n° 91/022 du 16 décembre 1991, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement ; il est depuis honoré comme héros national.$a$)  /* point 9 */)::jsonb
where slug = 'ernest-ouandie';

-- ernest-ouandie · recit_fr_texte
update public.heros set recit_fr_texte = replace(replace(replace(replace(replace(replace(recit_fr_texte,
    $a$Moumié agonise à Genève et meurt le 4 novembre 1960.$a$,
    $a$Moumié agonise à Genève et meurt le 3 novembre 1960.$a$)  /* point 1 */,
    $a$fondé quelques mois plus tôt par Ruben Um Nyobè et ses compagnons, et qui ose$a$,
    $a$fondé en avril 1948 à Douala par un groupe de syndicalistes, dont Ruben Um Nyobè devient le secrétaire général en novembre, et qui ose$a$)  /* point 5 */,
    $a$Ruben Um Nyobè, le fondateur, le père du parti, est tué par les forces françaises$a$,
    $a$Ruben Um Nyobè, le secrétaire général, le père du parti, est tué par une patrouille de l'armée française$a$)  /* point 5 */,
    $a$Deux dirigeants fondateurs assassinés en deux ans$a$,
    $a$Deux dirigeants historiques assassinés en deux ans$a$)  /* point 5 */,
    $a$Le 16 juin 1964, à son tour, Abel Kingué$a$,
    $a$Le 16 avril 1964, à son tour, Abel Kingué$a$)  /* point 8 */,
    $a$que l'Assemblée nationale camerounaise vote, le 27 juin, sa reconnaissance comme héros national, formalisée par la loi n° 91/022 du 16 décembre 1991.$a$,
    $a$que la loi n° 91/022 du 16 décembre 1991, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement ; il est depuis honoré comme héros national.$a$)  /* point 9 */
where slug = 'ernest-ouandie';

-- ernest-ouandie · recit_chapitres_en
update public.heros set recit_chapitres_en = (replace(replace(replace(replace(replace(replace(recit_chapitres_en::text,
    $a$dies in agony in Geneva on 4 November 1960.$a$,
    $a$dies in agony in Geneva on 3 November 1960.$a$)  /* point 1 */,
    $a$founded a few months earlier by Ruben Um Nyobè and his companions, and daring$a$,
    $a$founded in April 1948 in Douala by a group of trade unionists, with Ruben Um Nyobè becoming its secretary general that November, and daring$a$)  /* point 5 */,
    $a$Ruben Um Nyobè, the founder, the party's father figure, is killed by French forces$a$,
    $a$Ruben Um Nyobè, the secretary general, the party's father figure, is killed by a French army patrol$a$)  /* point 5 */,
    $a$Two founding leaders assassinated within two years$a$,
    $a$Two historic leaders assassinated within two years$a$)  /* point 5 */,
    $a$On 16 June 1964, in turn, Abel Kingué$a$,
    $a$On 16 April 1964, in turn, Abel Kingué$a$)  /* point 8 */,
    $a$that the Cameroonian National Assembly votes, on 27 June, to recognize him as a national hero, formalized by Law No. 91/022 of 16 December 1991.$a$,
    $a$that Law No. 91/022 of 16 December 1991, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitates him; he has been honored ever since as a national hero.$a$)  /* point 9 */)::jsonb
where slug = 'ernest-ouandie';

-- ernest-ouandie · recit_en_texte
update public.heros set recit_en_texte = replace(replace(replace(replace(replace(replace(recit_en_texte,
    $a$dies in agony in Geneva on 4 November 1960.$a$,
    $a$dies in agony in Geneva on 3 November 1960.$a$)  /* point 1 */,
    $a$founded a few months earlier by Ruben Um Nyobè and his companions, and daring$a$,
    $a$founded in April 1948 in Douala by a group of trade unionists, with Ruben Um Nyobè becoming its secretary general that November, and daring$a$)  /* point 5 */,
    $a$Ruben Um Nyobè, the founder, the party's father figure, is killed by French forces$a$,
    $a$Ruben Um Nyobè, the secretary general, the party's father figure, is killed by a French army patrol$a$)  /* point 5 */,
    $a$Two founding leaders assassinated within two years$a$,
    $a$Two historic leaders assassinated within two years$a$)  /* point 5 */,
    $a$On 16 June 1964, in turn, Abel Kingué$a$,
    $a$On 16 April 1964, in turn, Abel Kingué$a$)  /* point 8 */,
    $a$that the Cameroonian National Assembly votes, on 27 June, to recognize him as a national hero, formalized by Law No. 91/022 of 16 December 1991.$a$,
    $a$that Law No. 91/022 of 16 December 1991, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitates him; he has been honored ever since as a national hero.$a$)  /* point 9 */
where slug = 'ernest-ouandie';

-- ernest-ouandie · frise_chronologique
update public.heros set frise_chronologique = (replace(replace(replace(frise_chronologique::text,
    $a$(mort le 4 novembre 1960)$a$,
    $a$(mort le 3 novembre 1960)$a$)  /* point 1 */,
    $a$(16 juin 1964)$a$,
    $a$(16 avril 1964)$a$)  /* point 8 */,
    $a$réhabilité et déclaré héros national par la loi n° 91/022 (après le vote de l'Assemblée nationale camerounaise du 27 juin 1991)$a$,
    $a$réhabilité par la loi n° 91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya ; honoré depuis comme héros national$a$)  /* point 9 */)::jsonb
where slug = 'ernest-ouandie';

-- ernest-ouandie · frise_chronologique_en
update public.heros set frise_chronologique_en = (replace(replace(replace(frise_chronologique_en::text,
    $a$(died 4 November 1960)$a$,
    $a$(died 3 November 1960)$a$)  /* point 1 */,
    $a$(16 June 1964)$a$,
    $a$(16 April 1964)$a$)  /* point 8 */,
    $a$rehabilitated and declared a national hero by law no. 91/022 (after the vote of the Cameroonian National Assembly on 27 June 1991)$a$,
    $a$rehabilitated by law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya; honored ever since as a national hero$a$)  /* point 9 */)::jsonb
where slug = 'ernest-ouandie';

-- felix-moumie · recit_chapitres_fr
update public.heros set recit_chapitres_fr = (replace(replace(replace(replace(replace(replace(recit_chapitres_fr::text,
    $a$qu'on le tue à quarante ans,$a$,
    $a$qu'on le tue à trente-cinq ans,$a$)  /* point 2 */,
    $a$avant d'être tué en pleine clandestinité par les forces franco-camerounaises.$a$,
    $a$avant d'être tué en pleine clandestinité par une patrouille de l'armée française.$a$)  /* point 6 */,
    $a$est tué par les forces franco-camerounaises dans le maquis de la Sanaga-Maritime$a$,
    $a$est tué par une patrouille de l'armée française dans le maquis de la Sanaga-Maritime$a$)  /* point 6 */,
    $a$revient au pays comme médecin colonial et rejoint l'hôpital de Lolodorf, près de Kribi. C'est là, dans cette petite ville du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$,
    $a$revient au pays comme médecin colonial, affecté dans le sud, à Lolodorf selon certaines sources, à Kribi selon d'autres. C'est à Kribi, petite ville côtière du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$)  /* point 7 */,
    $a$pour que l'Assemblée nationale du Cameroun proclame Félix-Roland Moumié héros national.$a$,
    $a$pour que la loi n° 91/022, adoptée par l'Assemblée nationale du Cameroun et promulguée par le président Paul Biya, réhabilite Félix-Roland Moumié, honoré depuis comme héros national.$a$)  /* point 9 */,
    $a$"L'ascension, le sang de New-Bell, la fuite"$a$,
    $a$"L'ascension, de Dschang à la présidence de l'UPC"$a$)  /* point 10 */)::jsonb
where slug = 'felix-moumie';

-- felix-moumie · recit_fr_texte
update public.heros set recit_fr_texte = replace(replace(replace(replace(replace(recit_fr_texte,
    $a$qu'on le tue à quarante ans,$a$,
    $a$qu'on le tue à trente-cinq ans,$a$)  /* point 2 */,
    $a$avant d'être tué en pleine clandestinité par les forces franco-camerounaises.$a$,
    $a$avant d'être tué en pleine clandestinité par une patrouille de l'armée française.$a$)  /* point 6 */,
    $a$est tué par les forces franco-camerounaises dans le maquis de la Sanaga-Maritime$a$,
    $a$est tué par une patrouille de l'armée française dans le maquis de la Sanaga-Maritime$a$)  /* point 6 */,
    $a$revient au pays comme médecin colonial et rejoint l'hôpital de Lolodorf, près de Kribi. C'est là, dans cette petite ville du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$,
    $a$revient au pays comme médecin colonial, affecté dans le sud, à Lolodorf selon certaines sources, à Kribi selon d'autres. C'est à Kribi, petite ville côtière du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$)  /* point 7 */,
    $a$pour que l'Assemblée nationale du Cameroun proclame Félix-Roland Moumié héros national.$a$,
    $a$pour que la loi n° 91/022, adoptée par l'Assemblée nationale du Cameroun et promulguée par le président Paul Biya, réhabilite Félix-Roland Moumié, honoré depuis comme héros national.$a$)  /* point 9 */
where slug = 'felix-moumie';

-- felix-moumie · recit_chapitres_en
update public.heros set recit_chapitres_en = (replace(replace(replace(replace(replace(replace(recit_chapitres_en::text,
    $a$get him killed at forty,$a$,
    $a$get him killed at thirty-five,$a$)  /* point 2 */,
    $a$before being killed while underground by Franco-Cameroonian forces.$a$,
    $a$before being killed while underground by a French army patrol.$a$)  /* point 6 */,
    $a$is killed by Franco-Cameroonian forces in the Sanaga-Maritime maquis$a$,
    $a$is killed by a French army patrol in the Sanaga-Maritime maquis$a$)  /* point 6 */,
    $a$returns home as a colonial physician and joins the hospital of Lolodorf, near Kribi. It is there, in this small southern town, that his life turns: he meets Ruben Um Nyobè.$a$,
    $a$returns home as a colonial physician, posted to the south, to Lolodorf according to some sources, to Kribi according to others. It is in Kribi, a small southern coastal town, that his life turns: he meets Ruben Um Nyobè there.$a$)  /* point 7 */,
    $a$for Cameroon's National Assembly to proclaim Félix-Roland Moumié a national hero.$a$,
    $a$for law no. 91/022, passed by Cameroon's National Assembly and promulgated by President Paul Biya, to rehabilitate Félix-Roland Moumié, honored ever since as a national hero.$a$)  /* point 9 */,
    $a$"The rise, the blood of New-Bell, the flight"$a$,
    $a$"The rise, from Dschang to the UPC presidency"$a$)  /* point 10 */)::jsonb
where slug = 'felix-moumie';

-- felix-moumie · recit_en_texte
update public.heros set recit_en_texte = replace(replace(replace(replace(replace(recit_en_texte,
    $a$get him killed at forty,$a$,
    $a$get him killed at thirty-five,$a$)  /* point 2 */,
    $a$before being killed while underground by Franco-Cameroonian forces.$a$,
    $a$before being killed while underground by a French army patrol.$a$)  /* point 6 */,
    $a$is killed by Franco-Cameroonian forces in the Sanaga-Maritime maquis$a$,
    $a$is killed by a French army patrol in the Sanaga-Maritime maquis$a$)  /* point 6 */,
    $a$returns home as a colonial physician and joins the hospital of Lolodorf, near Kribi. It is there, in this small southern town, that his life turns: he meets Ruben Um Nyobè.$a$,
    $a$returns home as a colonial physician, posted to the south, to Lolodorf according to some sources, to Kribi according to others. It is in Kribi, a small southern coastal town, that his life turns: he meets Ruben Um Nyobè there.$a$)  /* point 7 */,
    $a$for Cameroon's National Assembly to proclaim Félix-Roland Moumié a national hero.$a$,
    $a$for law no. 91/022, passed by Cameroon's National Assembly and promulgated by President Paul Biya, to rehabilitate Félix-Roland Moumié, honored ever since as a national hero.$a$)  /* point 9 */
where slug = 'felix-moumie';

-- ruben-um-nyobe · recit_chapitres_fr
update public.heros set recit_chapitres_fr = (replace(replace(replace(recit_chapitres_fr::text,
    $a$dans un pays qu'on appelle encore Kamerun et qui vient tout juste de changer de maître colonial, l'Allemagne ayant cédé la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$,
    $a$dans un pays qu'on appelle encore Kamerun, colonie allemande depuis 1884, et qui changera bientôt de maître colonial, l'Allemagne devant céder la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$)  /* point 3 */,
    $a$le 27 juin, l'Assemblée nationale camerounaise le proclame héros national, et le 16 décembre, la loi n°91/022 lève officiellement l'interdiction pesant sur sa mémoire,$a$,
    $a$le 16 décembre, la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement et lève l'interdiction pesant sur sa mémoire,$a$)  /* point 9 */,
    $a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». En 2007$a$,
    $a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». Il est depuis honoré comme héros national. En 2007$a$)  /* point 9 */)::jsonb
where slug = 'ruben-um-nyobe';

-- ruben-um-nyobe · recit_fr_texte
update public.heros set recit_fr_texte = replace(replace(replace(recit_fr_texte,
    $a$dans un pays qu'on appelle encore Kamerun et qui vient tout juste de changer de maître colonial, l'Allemagne ayant cédé la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$,
    $a$dans un pays qu'on appelle encore Kamerun, colonie allemande depuis 1884, et qui changera bientôt de maître colonial, l'Allemagne devant céder la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$)  /* point 3 */,
    $a$le 27 juin, l'Assemblée nationale camerounaise le proclame héros national, et le 16 décembre, la loi n°91/022 lève officiellement l'interdiction pesant sur sa mémoire,$a$,
    $a$le 16 décembre, la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement et lève l'interdiction pesant sur sa mémoire,$a$)  /* point 9 */,
    $a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». En 2007$a$,
    $a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». Il est depuis honoré comme héros national. En 2007$a$)  /* point 9 */
where slug = 'ruben-um-nyobe';

-- ruben-um-nyobe · recit_chapitres_en
update public.heros set recit_chapitres_en = (replace(replace(replace(replace(recit_chapitres_en::text,
    $a$in a country still called Kamerun, one that had just changed colonial masters, Germany having ceded its place to France and Britain at the end of the First World War,$a$,
    $a$in a country still called Kamerun, a German colony since 1884, one that would soon change colonial masters, Germany having to cede its place to France and Britain at the end of the First World War,$a$)  /* point 3 */,
    $a$on 27 June, the Cameroonian National Assembly proclaimed him a national hero, and on 16 December, law no. 91/022 officially lifted the ban on his memory,$a$,
    $a$on 16 December, law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitated him and lifted the ban on his memory,$a$)  /* point 9 */,
    $a$or the building of the country.\" In 2007$a$,
    $a$or the building of the country.\" He has been honored ever since as a national hero. In 2007$a$)  /* point 9 */,
    $a$Union of the Populations of Cameroon$a$,
    $a$Union of the Peoples of Cameroon$a$)  /* point 11 */)::jsonb
where slug = 'ruben-um-nyobe';

-- ruben-um-nyobe · recit_en_texte
update public.heros set recit_en_texte = replace(replace(replace(replace(recit_en_texte,
    $a$in a country still called Kamerun, one that had just changed colonial masters, Germany having ceded its place to France and Britain at the end of the First World War,$a$,
    $a$in a country still called Kamerun, a German colony since 1884, one that would soon change colonial masters, Germany having to cede its place to France and Britain at the end of the First World War,$a$)  /* point 3 */,
    $a$on 27 June, the Cameroonian National Assembly proclaimed him a national hero, and on 16 December, law no. 91/022 officially lifted the ban on his memory,$a$,
    $a$on 16 December, law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitated him and lifted the ban on his memory,$a$)  /* point 9 */,
    $a$or the building of the country." In 2007$a$,
    $a$or the building of the country." He has been honored ever since as a national hero. In 2007$a$)  /* point 9 */,
    $a$Union of the Populations of Cameroon$a$,
    $a$Union of the Peoples of Cameroon$a$)  /* point 11 */
where slug = 'ruben-um-nyobe';

-- ruben-um-nyobe · sous_titre
update public.heros set sous_titre = replace(sous_titre,
    $a$Fondateur et secrétaire général de l'Union des Populations du Cameroun (UPC)$a$,
    $a$Secrétaire général et principal dirigeant de l'Union des Populations du Cameroun (UPC)$a$)  /* point 4 */
where slug = 'ruben-um-nyobe';

-- ruben-um-nyobe · sous_titre_en
update public.heros set sous_titre_en = replace(sous_titre_en,
    $a$Founder and secretary general of the Union of the Peoples of Cameroon (UPC)$a$,
    $a$Secretary general and principal leader of the Union of the Peoples of Cameroon (UPC)$a$)  /* point 4 */
where slug = 'ruben-um-nyobe';

-- felix-moumie · frise_chronologique
update public.heros set frise_chronologique = (replace(frise_chronologique::text,
    $a$médecin colonial à Lolodorf, rencontre Ruben Um Nyobè à Kribi$a$,
    $a$médecin colonial dans le sud (Lolodorf ou Kribi selon les sources), rencontre Ruben Um Nyobè à Kribi$a$)  /* point 7 */)::jsonb
where slug = 'felix-moumie';

-- felix-moumie · frise_chronologique_en
update public.heros set frise_chronologique_en = (replace(frise_chronologique_en::text,
    $a$colonial doctor in Lolodorf, met Ruben Um Nyobè in Kribi$a$,
    $a$colonial doctor in the south (Lolodorf or Kribi depending on the source), met Ruben Um Nyobè in Kribi$a$)  /* point 7 */)::jsonb
where slug = 'felix-moumie';

-- ruben-um-nyobe · frise_chronologique
update public.heros set frise_chronologique = (replace(replace(frise_chronologique::text,
    $a$"27 juin puis 16 décembre 1991"$a$,
    $a$"16 décembre 1991"$a$)  /* point 9 */,
    $a$proclamé héros national par l'Assemblée nationale camerounaise, puis réhabilité par la loi n°91/022 mettant fin à l'interdiction de mentionner son nom$a$,
    $a$réhabilité par la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, qui met fin à l'interdiction de mentionner son nom ; honoré depuis comme héros national$a$)  /* point 9 */)::jsonb
where slug = 'ruben-um-nyobe';

-- ruben-um-nyobe · frise_chronologique_en
update public.heros set frise_chronologique_en = (replace(replace(frise_chronologique_en::text,
    $a$"27 June then 16 December 1991"$a$,
    $a$"16 December 1991"$a$)  /* point 9 */,
    $a$proclaimed a national hero by the Cameroonian National Assembly, then rehabilitated by law no. 91/022, ending the ban on mentioning his name$a$,
    $a$rehabilitated by law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, ending the ban on mentioning his name; honored ever since as a national hero$a$)  /* point 9 */)::jsonb
where slug = 'ruben-um-nyobe';

commit;

-- =====================================================================
-- CONTRÔLE (à lancer après le commit) : « ancien_present » doit être false
-- partout, « nouveau_present » true partout.
-- =====================================================================
select 1 as point, 'ernest-ouandie' as slug, 'recit_chapitres_fr' as colonne, left($a$Moumié agonise à Genève et meurt le 3 novembre 1960.$a$, 60) as extrait_nouveau,
  position($a$Moumié agonise à Genève et meurt le 4 novembre 1960.$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$Moumié agonise à Genève et meurt le 3 novembre 1960.$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 1 as point, 'ernest-ouandie' as slug, 'recit_fr_texte' as colonne, left($a$Moumié agonise à Genève et meurt le 3 novembre 1960.$a$, 60) as extrait_nouveau,
  position($a$Moumié agonise à Genève et meurt le 4 novembre 1960.$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$Moumié agonise à Genève et meurt le 3 novembre 1960.$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 1 as point, 'ernest-ouandie' as slug, 'recit_chapitres_en' as colonne, left($a$dies in agony in Geneva on 3 November 1960.$a$, 60) as extrait_nouveau,
  position($a$dies in agony in Geneva on 4 November 1960.$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$dies in agony in Geneva on 3 November 1960.$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 1 as point, 'ernest-ouandie' as slug, 'recit_en_texte' as colonne, left($a$dies in agony in Geneva on 3 November 1960.$a$, 60) as extrait_nouveau,
  position($a$dies in agony in Geneva on 4 November 1960.$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$dies in agony in Geneva on 3 November 1960.$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 1 as point, 'ernest-ouandie' as slug, 'frise_chronologique' as colonne, left($a$(mort le 3 novembre 1960)$a$, 60) as extrait_nouveau,
  position($a$(mort le 4 novembre 1960)$a$ in frise_chronologique::text) > 0 as ancien_present,
  position($a$(mort le 3 novembre 1960)$a$ in frise_chronologique::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 1 as point, 'ernest-ouandie' as slug, 'frise_chronologique_en' as colonne, left($a$(died 3 November 1960)$a$, 60) as extrait_nouveau,
  position($a$(died 4 November 1960)$a$ in frise_chronologique_en::text) > 0 as ancien_present,
  position($a$(died 3 November 1960)$a$ in frise_chronologique_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 2 as point, 'felix-moumie' as slug, 'recit_chapitres_fr' as colonne, left($a$qu'on le tue à trente-cinq ans,$a$, 60) as extrait_nouveau,
  position($a$qu'on le tue à quarante ans,$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$qu'on le tue à trente-cinq ans,$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 2 as point, 'felix-moumie' as slug, 'recit_fr_texte' as colonne, left($a$qu'on le tue à trente-cinq ans,$a$, 60) as extrait_nouveau,
  position($a$qu'on le tue à quarante ans,$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$qu'on le tue à trente-cinq ans,$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 2 as point, 'felix-moumie' as slug, 'recit_chapitres_en' as colonne, left($a$get him killed at thirty-five,$a$, 60) as extrait_nouveau,
  position($a$get him killed at forty,$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$get him killed at thirty-five,$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 2 as point, 'felix-moumie' as slug, 'recit_en_texte' as colonne, left($a$get him killed at thirty-five,$a$, 60) as extrait_nouveau,
  position($a$get him killed at forty,$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$get him killed at thirty-five,$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 3 as point, 'ruben-um-nyobe' as slug, 'recit_chapitres_fr' as colonne, left($a$dans un pays qu'on appelle encore Kamerun, colonie allemande depuis 1884, et qui changera bientôt de maître colonial, l'Allemagne devant céder la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$, 60) as extrait_nouveau,
  position($a$dans un pays qu'on appelle encore Kamerun et qui vient tout juste de changer de maître colonial, l'Allemagne ayant cédé la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$dans un pays qu'on appelle encore Kamerun, colonie allemande depuis 1884, et qui changera bientôt de maître colonial, l'Allemagne devant céder la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 3 as point, 'ruben-um-nyobe' as slug, 'recit_fr_texte' as colonne, left($a$dans un pays qu'on appelle encore Kamerun, colonie allemande depuis 1884, et qui changera bientôt de maître colonial, l'Allemagne devant céder la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$, 60) as extrait_nouveau,
  position($a$dans un pays qu'on appelle encore Kamerun et qui vient tout juste de changer de maître colonial, l'Allemagne ayant cédé la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$dans un pays qu'on appelle encore Kamerun, colonie allemande depuis 1884, et qui changera bientôt de maître colonial, l'Allemagne devant céder la place à la France et à l'Angleterre au sortir de la Première Guerre mondiale,$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 3 as point, 'ruben-um-nyobe' as slug, 'recit_chapitres_en' as colonne, left($a$in a country still called Kamerun, a German colony since 1884, one that would soon change colonial masters, Germany having to cede its place to France and Britain at the end of the First World War,$a$, 60) as extrait_nouveau,
  position($a$in a country still called Kamerun, one that had just changed colonial masters, Germany having ceded its place to France and Britain at the end of the First World War,$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$in a country still called Kamerun, a German colony since 1884, one that would soon change colonial masters, Germany having to cede its place to France and Britain at the end of the First World War,$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 3 as point, 'ruben-um-nyobe' as slug, 'recit_en_texte' as colonne, left($a$in a country still called Kamerun, a German colony since 1884, one that would soon change colonial masters, Germany having to cede its place to France and Britain at the end of the First World War,$a$, 60) as extrait_nouveau,
  position($a$in a country still called Kamerun, one that had just changed colonial masters, Germany having ceded its place to France and Britain at the end of the First World War,$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$in a country still called Kamerun, a German colony since 1884, one that would soon change colonial masters, Germany having to cede its place to France and Britain at the end of the First World War,$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 4 as point, 'ruben-um-nyobe' as slug, 'sous_titre' as colonne, left($a$Secrétaire général et principal dirigeant de l'Union des Populations du Cameroun (UPC)$a$, 60) as extrait_nouveau,
  position($a$Fondateur et secrétaire général de l'Union des Populations du Cameroun (UPC)$a$ in coalesce(sous_titre, '')) > 0 as ancien_present,
  position($a$Secrétaire général et principal dirigeant de l'Union des Populations du Cameroun (UPC)$a$ in coalesce(sous_titre, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 4 as point, 'ruben-um-nyobe' as slug, 'sous_titre_en' as colonne, left($a$Secretary general and principal leader of the Union of the Peoples of Cameroon (UPC)$a$, 60) as extrait_nouveau,
  position($a$Founder and secretary general of the Union of the Peoples of Cameroon (UPC)$a$ in coalesce(sous_titre_en, '')) > 0 as ancien_present,
  position($a$Secretary general and principal leader of the Union of the Peoples of Cameroon (UPC)$a$ in coalesce(sous_titre_en, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_chapitres_fr' as colonne, left($a$fondé en avril 1948 à Douala par un groupe de syndicalistes, dont Ruben Um Nyobè devient le secrétaire général en novembre, et qui ose$a$, 60) as extrait_nouveau,
  position($a$fondé quelques mois plus tôt par Ruben Um Nyobè et ses compagnons, et qui ose$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$fondé en avril 1948 à Douala par un groupe de syndicalistes, dont Ruben Um Nyobè devient le secrétaire général en novembre, et qui ose$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_fr_texte' as colonne, left($a$fondé en avril 1948 à Douala par un groupe de syndicalistes, dont Ruben Um Nyobè devient le secrétaire général en novembre, et qui ose$a$, 60) as extrait_nouveau,
  position($a$fondé quelques mois plus tôt par Ruben Um Nyobè et ses compagnons, et qui ose$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$fondé en avril 1948 à Douala par un groupe de syndicalistes, dont Ruben Um Nyobè devient le secrétaire général en novembre, et qui ose$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_chapitres_en' as colonne, left($a$founded in April 1948 in Douala by a group of trade unionists, with Ruben Um Nyobè becoming its secretary general that November, and daring$a$, 60) as extrait_nouveau,
  position($a$founded a few months earlier by Ruben Um Nyobè and his companions, and daring$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$founded in April 1948 in Douala by a group of trade unionists, with Ruben Um Nyobè becoming its secretary general that November, and daring$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_en_texte' as colonne, left($a$founded in April 1948 in Douala by a group of trade unionists, with Ruben Um Nyobè becoming its secretary general that November, and daring$a$, 60) as extrait_nouveau,
  position($a$founded a few months earlier by Ruben Um Nyobè and his companions, and daring$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$founded in April 1948 in Douala by a group of trade unionists, with Ruben Um Nyobè becoming its secretary general that November, and daring$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_chapitres_fr' as colonne, left($a$Ruben Um Nyobè, le secrétaire général, le père du parti, est tué par une patrouille de l'armée française$a$, 60) as extrait_nouveau,
  position($a$Ruben Um Nyobè, le fondateur, le père du parti, est tué par les forces françaises$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$Ruben Um Nyobè, le secrétaire général, le père du parti, est tué par une patrouille de l'armée française$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_fr_texte' as colonne, left($a$Ruben Um Nyobè, le secrétaire général, le père du parti, est tué par une patrouille de l'armée française$a$, 60) as extrait_nouveau,
  position($a$Ruben Um Nyobè, le fondateur, le père du parti, est tué par les forces françaises$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$Ruben Um Nyobè, le secrétaire général, le père du parti, est tué par une patrouille de l'armée française$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_chapitres_en' as colonne, left($a$Ruben Um Nyobè, the secretary general, the party's father figure, is killed by a French army patrol$a$, 60) as extrait_nouveau,
  position($a$Ruben Um Nyobè, the founder, the party's father figure, is killed by French forces$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$Ruben Um Nyobè, the secretary general, the party's father figure, is killed by a French army patrol$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_en_texte' as colonne, left($a$Ruben Um Nyobè, the secretary general, the party's father figure, is killed by a French army patrol$a$, 60) as extrait_nouveau,
  position($a$Ruben Um Nyobè, the founder, the party's father figure, is killed by French forces$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$Ruben Um Nyobè, the secretary general, the party's father figure, is killed by a French army patrol$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_chapitres_fr' as colonne, left($a$Deux dirigeants historiques assassinés en deux ans$a$, 60) as extrait_nouveau,
  position($a$Deux dirigeants fondateurs assassinés en deux ans$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$Deux dirigeants historiques assassinés en deux ans$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_fr_texte' as colonne, left($a$Deux dirigeants historiques assassinés en deux ans$a$, 60) as extrait_nouveau,
  position($a$Deux dirigeants fondateurs assassinés en deux ans$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$Deux dirigeants historiques assassinés en deux ans$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_chapitres_en' as colonne, left($a$Two historic leaders assassinated within two years$a$, 60) as extrait_nouveau,
  position($a$Two founding leaders assassinated within two years$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$Two historic leaders assassinated within two years$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 5 as point, 'ernest-ouandie' as slug, 'recit_en_texte' as colonne, left($a$Two historic leaders assassinated within two years$a$, 60) as extrait_nouveau,
  position($a$Two founding leaders assassinated within two years$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$Two historic leaders assassinated within two years$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 6 as point, 'felix-moumie' as slug, 'recit_chapitres_fr' as colonne, left($a$avant d'être tué en pleine clandestinité par une patrouille de l'armée française.$a$, 60) as extrait_nouveau,
  position($a$avant d'être tué en pleine clandestinité par les forces franco-camerounaises.$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$avant d'être tué en pleine clandestinité par une patrouille de l'armée française.$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 6 as point, 'felix-moumie' as slug, 'recit_fr_texte' as colonne, left($a$avant d'être tué en pleine clandestinité par une patrouille de l'armée française.$a$, 60) as extrait_nouveau,
  position($a$avant d'être tué en pleine clandestinité par les forces franco-camerounaises.$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$avant d'être tué en pleine clandestinité par une patrouille de l'armée française.$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 6 as point, 'felix-moumie' as slug, 'recit_chapitres_en' as colonne, left($a$before being killed while underground by a French army patrol.$a$, 60) as extrait_nouveau,
  position($a$before being killed while underground by Franco-Cameroonian forces.$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$before being killed while underground by a French army patrol.$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 6 as point, 'felix-moumie' as slug, 'recit_en_texte' as colonne, left($a$before being killed while underground by a French army patrol.$a$, 60) as extrait_nouveau,
  position($a$before being killed while underground by Franco-Cameroonian forces.$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$before being killed while underground by a French army patrol.$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 6 as point, 'felix-moumie' as slug, 'recit_chapitres_fr' as colonne, left($a$est tué par une patrouille de l'armée française dans le maquis de la Sanaga-Maritime$a$, 60) as extrait_nouveau,
  position($a$est tué par les forces franco-camerounaises dans le maquis de la Sanaga-Maritime$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$est tué par une patrouille de l'armée française dans le maquis de la Sanaga-Maritime$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 6 as point, 'felix-moumie' as slug, 'recit_fr_texte' as colonne, left($a$est tué par une patrouille de l'armée française dans le maquis de la Sanaga-Maritime$a$, 60) as extrait_nouveau,
  position($a$est tué par les forces franco-camerounaises dans le maquis de la Sanaga-Maritime$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$est tué par une patrouille de l'armée française dans le maquis de la Sanaga-Maritime$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 6 as point, 'felix-moumie' as slug, 'recit_chapitres_en' as colonne, left($a$is killed by a French army patrol in the Sanaga-Maritime maquis$a$, 60) as extrait_nouveau,
  position($a$is killed by Franco-Cameroonian forces in the Sanaga-Maritime maquis$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$is killed by a French army patrol in the Sanaga-Maritime maquis$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 6 as point, 'felix-moumie' as slug, 'recit_en_texte' as colonne, left($a$is killed by a French army patrol in the Sanaga-Maritime maquis$a$, 60) as extrait_nouveau,
  position($a$is killed by Franco-Cameroonian forces in the Sanaga-Maritime maquis$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$is killed by a French army patrol in the Sanaga-Maritime maquis$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 7 as point, 'felix-moumie' as slug, 'recit_chapitres_fr' as colonne, left($a$revient au pays comme médecin colonial, affecté dans le sud, à Lolodorf selon certaines sources, à Kribi selon d'autres. C'est à Kribi, petite ville côtière du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$, 60) as extrait_nouveau,
  position($a$revient au pays comme médecin colonial et rejoint l'hôpital de Lolodorf, près de Kribi. C'est là, dans cette petite ville du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$revient au pays comme médecin colonial, affecté dans le sud, à Lolodorf selon certaines sources, à Kribi selon d'autres. C'est à Kribi, petite ville côtière du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 7 as point, 'felix-moumie' as slug, 'recit_fr_texte' as colonne, left($a$revient au pays comme médecin colonial, affecté dans le sud, à Lolodorf selon certaines sources, à Kribi selon d'autres. C'est à Kribi, petite ville côtière du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$, 60) as extrait_nouveau,
  position($a$revient au pays comme médecin colonial et rejoint l'hôpital de Lolodorf, près de Kribi. C'est là, dans cette petite ville du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$revient au pays comme médecin colonial, affecté dans le sud, à Lolodorf selon certaines sources, à Kribi selon d'autres. C'est à Kribi, petite ville côtière du sud, que sa vie bascule : il y rencontre Ruben Um Nyobè.$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 7 as point, 'felix-moumie' as slug, 'recit_chapitres_en' as colonne, left($a$returns home as a colonial physician, posted to the south, to Lolodorf according to some sources, to Kribi according to others. It is in Kribi, a small southern coastal town, that his life turns: he meets Ruben Um Nyobè there.$a$, 60) as extrait_nouveau,
  position($a$returns home as a colonial physician and joins the hospital of Lolodorf, near Kribi. It is there, in this small southern town, that his life turns: he meets Ruben Um Nyobè.$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$returns home as a colonial physician, posted to the south, to Lolodorf according to some sources, to Kribi according to others. It is in Kribi, a small southern coastal town, that his life turns: he meets Ruben Um Nyobè there.$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 7 as point, 'felix-moumie' as slug, 'recit_en_texte' as colonne, left($a$returns home as a colonial physician, posted to the south, to Lolodorf according to some sources, to Kribi according to others. It is in Kribi, a small southern coastal town, that his life turns: he meets Ruben Um Nyobè there.$a$, 60) as extrait_nouveau,
  position($a$returns home as a colonial physician and joins the hospital of Lolodorf, near Kribi. It is there, in this small southern town, that his life turns: he meets Ruben Um Nyobè.$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$returns home as a colonial physician, posted to the south, to Lolodorf according to some sources, to Kribi according to others. It is in Kribi, a small southern coastal town, that his life turns: he meets Ruben Um Nyobè there.$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 7 as point, 'felix-moumie' as slug, 'frise_chronologique' as colonne, left($a$médecin colonial dans le sud (Lolodorf ou Kribi selon les sources), rencontre Ruben Um Nyobè à Kribi$a$, 60) as extrait_nouveau,
  position($a$médecin colonial à Lolodorf, rencontre Ruben Um Nyobè à Kribi$a$ in frise_chronologique::text) > 0 as ancien_present,
  position($a$médecin colonial dans le sud (Lolodorf ou Kribi selon les sources), rencontre Ruben Um Nyobè à Kribi$a$ in frise_chronologique::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 7 as point, 'felix-moumie' as slug, 'frise_chronologique_en' as colonne, left($a$colonial doctor in the south (Lolodorf or Kribi depending on the source), met Ruben Um Nyobè in Kribi$a$, 60) as extrait_nouveau,
  position($a$colonial doctor in Lolodorf, met Ruben Um Nyobè in Kribi$a$ in frise_chronologique_en::text) > 0 as ancien_present,
  position($a$colonial doctor in the south (Lolodorf or Kribi depending on the source), met Ruben Um Nyobè in Kribi$a$ in frise_chronologique_en::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 8 as point, 'ernest-ouandie' as slug, 'recit_chapitres_fr' as colonne, left($a$Le 16 avril 1964, à son tour, Abel Kingué$a$, 60) as extrait_nouveau,
  position($a$Le 16 juin 1964, à son tour, Abel Kingué$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$Le 16 avril 1964, à son tour, Abel Kingué$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 8 as point, 'ernest-ouandie' as slug, 'recit_fr_texte' as colonne, left($a$Le 16 avril 1964, à son tour, Abel Kingué$a$, 60) as extrait_nouveau,
  position($a$Le 16 juin 1964, à son tour, Abel Kingué$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$Le 16 avril 1964, à son tour, Abel Kingué$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 8 as point, 'ernest-ouandie' as slug, 'recit_chapitres_en' as colonne, left($a$On 16 April 1964, in turn, Abel Kingué$a$, 60) as extrait_nouveau,
  position($a$On 16 June 1964, in turn, Abel Kingué$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$On 16 April 1964, in turn, Abel Kingué$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 8 as point, 'ernest-ouandie' as slug, 'recit_en_texte' as colonne, left($a$On 16 April 1964, in turn, Abel Kingué$a$, 60) as extrait_nouveau,
  position($a$On 16 June 1964, in turn, Abel Kingué$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$On 16 April 1964, in turn, Abel Kingué$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 8 as point, 'ernest-ouandie' as slug, 'frise_chronologique' as colonne, left($a$(16 avril 1964)$a$, 60) as extrait_nouveau,
  position($a$(16 juin 1964)$a$ in frise_chronologique::text) > 0 as ancien_present,
  position($a$(16 avril 1964)$a$ in frise_chronologique::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 8 as point, 'ernest-ouandie' as slug, 'frise_chronologique_en' as colonne, left($a$(16 April 1964)$a$, 60) as extrait_nouveau,
  position($a$(16 June 1964)$a$ in frise_chronologique_en::text) > 0 as ancien_present,
  position($a$(16 April 1964)$a$ in frise_chronologique_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'recit_chapitres_fr' as colonne, left($a$le 16 décembre, la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement et lève l'interdiction pesant sur sa mémoire,$a$, 60) as extrait_nouveau,
  position($a$le 27 juin, l'Assemblée nationale camerounaise le proclame héros national, et le 16 décembre, la loi n°91/022 lève officiellement l'interdiction pesant sur sa mémoire,$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$le 16 décembre, la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement et lève l'interdiction pesant sur sa mémoire,$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'recit_fr_texte' as colonne, left($a$le 16 décembre, la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement et lève l'interdiction pesant sur sa mémoire,$a$, 60) as extrait_nouveau,
  position($a$le 27 juin, l'Assemblée nationale camerounaise le proclame héros national, et le 16 décembre, la loi n°91/022 lève officiellement l'interdiction pesant sur sa mémoire,$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$le 16 décembre, la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement et lève l'interdiction pesant sur sa mémoire,$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'recit_chapitres_fr' as colonne, left($a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». Il est depuis honoré comme héros national. En 2007$a$, 60) as extrait_nouveau,
  position($a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». En 2007$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». Il est depuis honoré comme héros national. En 2007$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'recit_fr_texte' as colonne, left($a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». Il est depuis honoré comme héros national. En 2007$a$, 60) as extrait_nouveau,
  position($a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». En 2007$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$« œuvré pour la naissance du sentiment national, l'indépendance ou la construction du pays ». Il est depuis honoré comme héros national. En 2007$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'recit_chapitres_en' as colonne, left($a$on 16 December, law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitated him and lifted the ban on his memory,$a$, 60) as extrait_nouveau,
  position($a$on 27 June, the Cameroonian National Assembly proclaimed him a national hero, and on 16 December, law no. 91/022 officially lifted the ban on his memory,$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$on 16 December, law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitated him and lifted the ban on his memory,$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'recit_en_texte' as colonne, left($a$on 16 December, law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitated him and lifted the ban on his memory,$a$, 60) as extrait_nouveau,
  position($a$on 27 June, the Cameroonian National Assembly proclaimed him a national hero, and on 16 December, law no. 91/022 officially lifted the ban on his memory,$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$on 16 December, law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitated him and lifted the ban on his memory,$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'recit_chapitres_en' as colonne, left($a$or the building of the country.\" He has been honored ever since as a national hero. In 2007$a$, 60) as extrait_nouveau,
  position($a$or the building of the country.\" In 2007$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$or the building of the country.\" He has been honored ever since as a national hero. In 2007$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'recit_en_texte' as colonne, left($a$or the building of the country." He has been honored ever since as a national hero. In 2007$a$, 60) as extrait_nouveau,
  position($a$or the building of the country." In 2007$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$or the building of the country." He has been honored ever since as a national hero. In 2007$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'frise_chronologique' as colonne, left($a$"16 décembre 1991"$a$, 60) as extrait_nouveau,
  position($a$"27 juin puis 16 décembre 1991"$a$ in frise_chronologique::text) > 0 as ancien_present,
  position($a$"16 décembre 1991"$a$ in frise_chronologique::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'frise_chronologique' as colonne, left($a$réhabilité par la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, qui met fin à l'interdiction de mentionner son nom ; honoré depuis comme héros national$a$, 60) as extrait_nouveau,
  position($a$proclamé héros national par l'Assemblée nationale camerounaise, puis réhabilité par la loi n°91/022 mettant fin à l'interdiction de mentionner son nom$a$ in frise_chronologique::text) > 0 as ancien_present,
  position($a$réhabilité par la loi n°91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, qui met fin à l'interdiction de mentionner son nom ; honoré depuis comme héros national$a$ in frise_chronologique::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'frise_chronologique_en' as colonne, left($a$"16 December 1991"$a$, 60) as extrait_nouveau,
  position($a$"27 June then 16 December 1991"$a$ in frise_chronologique_en::text) > 0 as ancien_present,
  position($a$"16 December 1991"$a$ in frise_chronologique_en::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'ruben-um-nyobe' as slug, 'frise_chronologique_en' as colonne, left($a$rehabilitated by law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, ending the ban on mentioning his name; honored ever since as a national hero$a$, 60) as extrait_nouveau,
  position($a$proclaimed a national hero by the Cameroonian National Assembly, then rehabilitated by law no. 91/022, ending the ban on mentioning his name$a$ in frise_chronologique_en::text) > 0 as ancien_present,
  position($a$rehabilitated by law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, ending the ban on mentioning his name; honored ever since as a national hero$a$ in frise_chronologique_en::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 9 as point, 'felix-moumie' as slug, 'recit_chapitres_fr' as colonne, left($a$pour que la loi n° 91/022, adoptée par l'Assemblée nationale du Cameroun et promulguée par le président Paul Biya, réhabilite Félix-Roland Moumié, honoré depuis comme héros national.$a$, 60) as extrait_nouveau,
  position($a$pour que l'Assemblée nationale du Cameroun proclame Félix-Roland Moumié héros national.$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$pour que la loi n° 91/022, adoptée par l'Assemblée nationale du Cameroun et promulguée par le président Paul Biya, réhabilite Félix-Roland Moumié, honoré depuis comme héros national.$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 9 as point, 'felix-moumie' as slug, 'recit_fr_texte' as colonne, left($a$pour que la loi n° 91/022, adoptée par l'Assemblée nationale du Cameroun et promulguée par le président Paul Biya, réhabilite Félix-Roland Moumié, honoré depuis comme héros national.$a$, 60) as extrait_nouveau,
  position($a$pour que l'Assemblée nationale du Cameroun proclame Félix-Roland Moumié héros national.$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$pour que la loi n° 91/022, adoptée par l'Assemblée nationale du Cameroun et promulguée par le président Paul Biya, réhabilite Félix-Roland Moumié, honoré depuis comme héros national.$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 9 as point, 'felix-moumie' as slug, 'recit_chapitres_en' as colonne, left($a$for law no. 91/022, passed by Cameroon's National Assembly and promulgated by President Paul Biya, to rehabilitate Félix-Roland Moumié, honored ever since as a national hero.$a$, 60) as extrait_nouveau,
  position($a$for Cameroon's National Assembly to proclaim Félix-Roland Moumié a national hero.$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$for law no. 91/022, passed by Cameroon's National Assembly and promulgated by President Paul Biya, to rehabilitate Félix-Roland Moumié, honored ever since as a national hero.$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 9 as point, 'felix-moumie' as slug, 'recit_en_texte' as colonne, left($a$for law no. 91/022, passed by Cameroon's National Assembly and promulgated by President Paul Biya, to rehabilitate Félix-Roland Moumié, honored ever since as a national hero.$a$, 60) as extrait_nouveau,
  position($a$for Cameroon's National Assembly to proclaim Félix-Roland Moumié a national hero.$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$for law no. 91/022, passed by Cameroon's National Assembly and promulgated by President Paul Biya, to rehabilitate Félix-Roland Moumié, honored ever since as a national hero.$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 9 as point, 'ernest-ouandie' as slug, 'recit_chapitres_fr' as colonne, left($a$que la loi n° 91/022 du 16 décembre 1991, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement ; il est depuis honoré comme héros national.$a$, 60) as extrait_nouveau,
  position($a$que l'Assemblée nationale camerounaise vote, le 27 juin, sa reconnaissance comme héros national, formalisée par la loi n° 91/022 du 16 décembre 1991.$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$que la loi n° 91/022 du 16 décembre 1991, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement ; il est depuis honoré comme héros national.$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 9 as point, 'ernest-ouandie' as slug, 'recit_fr_texte' as colonne, left($a$que la loi n° 91/022 du 16 décembre 1991, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement ; il est depuis honoré comme héros national.$a$, 60) as extrait_nouveau,
  position($a$que l'Assemblée nationale camerounaise vote, le 27 juin, sa reconnaissance comme héros national, formalisée par la loi n° 91/022 du 16 décembre 1991.$a$ in coalesce(recit_fr_texte, '')) > 0 as ancien_present,
  position($a$que la loi n° 91/022 du 16 décembre 1991, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya, le réhabilite officiellement ; il est depuis honoré comme héros national.$a$ in coalesce(recit_fr_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 9 as point, 'ernest-ouandie' as slug, 'recit_chapitres_en' as colonne, left($a$that Law No. 91/022 of 16 December 1991, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitates him; he has been honored ever since as a national hero.$a$, 60) as extrait_nouveau,
  position($a$that the Cameroonian National Assembly votes, on 27 June, to recognize him as a national hero, formalized by Law No. 91/022 of 16 December 1991.$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$that Law No. 91/022 of 16 December 1991, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitates him; he has been honored ever since as a national hero.$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 9 as point, 'ernest-ouandie' as slug, 'recit_en_texte' as colonne, left($a$that Law No. 91/022 of 16 December 1991, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitates him; he has been honored ever since as a national hero.$a$, 60) as extrait_nouveau,
  position($a$that the Cameroonian National Assembly votes, on 27 June, to recognize him as a national hero, formalized by Law No. 91/022 of 16 December 1991.$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$that Law No. 91/022 of 16 December 1991, passed by the Cameroonian National Assembly and promulgated by President Paul Biya, officially rehabilitates him; he has been honored ever since as a national hero.$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 9 as point, 'ernest-ouandie' as slug, 'frise_chronologique' as colonne, left($a$réhabilité par la loi n° 91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya ; honoré depuis comme héros national$a$, 60) as extrait_nouveau,
  position($a$réhabilité et déclaré héros national par la loi n° 91/022 (après le vote de l'Assemblée nationale camerounaise du 27 juin 1991)$a$ in frise_chronologique::text) > 0 as ancien_present,
  position($a$réhabilité par la loi n° 91/022, adoptée par l'Assemblée nationale camerounaise et promulguée par le président Paul Biya ; honoré depuis comme héros national$a$ in frise_chronologique::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 9 as point, 'ernest-ouandie' as slug, 'frise_chronologique_en' as colonne, left($a$rehabilitated by law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya; honored ever since as a national hero$a$, 60) as extrait_nouveau,
  position($a$rehabilitated and declared a national hero by law no. 91/022 (after the vote of the Cameroonian National Assembly on 27 June 1991)$a$ in frise_chronologique_en::text) > 0 as ancien_present,
  position($a$rehabilitated by law no. 91/022, passed by the Cameroonian National Assembly and promulgated by President Paul Biya; honored ever since as a national hero$a$ in frise_chronologique_en::text) > 0 as nouveau_present
from public.heros where slug = 'ernest-ouandie'
union all
select 10 as point, 'felix-moumie' as slug, 'recit_chapitres_fr' as colonne, left($a$"L'ascension, de Dschang à la présidence de l'UPC"$a$, 60) as extrait_nouveau,
  position($a$"L'ascension, le sang de New-Bell, la fuite"$a$ in recit_chapitres_fr::text) > 0 as ancien_present,
  position($a$"L'ascension, de Dschang à la présidence de l'UPC"$a$ in recit_chapitres_fr::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 10 as point, 'felix-moumie' as slug, 'recit_chapitres_en' as colonne, left($a$"The rise, from Dschang to the UPC presidency"$a$, 60) as extrait_nouveau,
  position($a$"The rise, the blood of New-Bell, the flight"$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$"The rise, from Dschang to the UPC presidency"$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'felix-moumie'
union all
select 11 as point, 'ruben-um-nyobe' as slug, 'recit_chapitres_en' as colonne, left($a$Union of the Peoples of Cameroon$a$, 60) as extrait_nouveau,
  position($a$Union of the Populations of Cameroon$a$ in recit_chapitres_en::text) > 0 as ancien_present,
  position($a$Union of the Peoples of Cameroon$a$ in recit_chapitres_en::text) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
union all
select 11 as point, 'ruben-um-nyobe' as slug, 'recit_en_texte' as colonne, left($a$Union of the Peoples of Cameroon$a$, 60) as extrait_nouveau,
  position($a$Union of the Populations of Cameroon$a$ in coalesce(recit_en_texte, '')) > 0 as ancien_present,
  position($a$Union of the Peoples of Cameroon$a$ in coalesce(recit_en_texte, '')) > 0 as nouveau_present
from public.heros where slug = 'ruben-um-nyobe'
order by 1, 2, 3;
