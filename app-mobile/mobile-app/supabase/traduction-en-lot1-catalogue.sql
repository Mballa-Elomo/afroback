-- =====================================================================
-- AFROBACK · Traductions anglaises, lot 1 : catalogue public (2026-10-07)
--
-- À exécuter APRÈS schema-i18n-contenu-en.sql. Ne touche que les colonnes
-- « _en » : le français reste intact. Rejouable sans risque (mêmes valeurs).
--
-- Traduction : Claude, à partir du texte français publié en base le
-- 2026-10-07, sans ajout ni suppression de fait. Légendes toujours
-- présentées comme légendes. BROUILLON à faire relire par un anglophone
-- avant de mettre la version anglaise en avant.
-- Noms propres conservés tels quels ; « Bamoun » rendu par « Bamum »
-- (forme anglaise usuelle), « Sultan Njoya » inchangé, « Reine » → « Queen ».
-- =====================================================================

update public.heros set
  nom_affiche_en = $t$Queen Nzinga$t$,
  sous_titre_en = $t$Queen of Ndongo and Matamba (present-day Angola), 17th century$t$,
  epoque_en = $t$Precolonial, reigned 1624 to 1663$t$,
  region_en = $t$Central Africa (kingdoms of Ndongo and Matamba, present-day Angola)$t$,
  resume_catalogue_en = $t$Born around 1583 in the kingdom of Ndongo, Njinga became queen in 1624 and resisted Portuguese colonisation for nearly forty years, combining diplomacy, war and cunning. An ambivalent figure of resistance: she also took an active part in the slave trade to fund her wars. She died in 1663 without ever losing her crown.$t$
where slug = $t$reine-nzinga$t$;

update public.heros set
  nom_affiche_en = $t$Martin Paul Samba$t$,
  sous_titre_en = $t$Bulu chief and resister against German colonisation, southern Cameroon, late 19th to early 20th century$t$,
  epoque_en = $t$Colonial (German Kamerun, 1884-1916)$t$,
  region_en = $t$Central Africa (southern Cameroon, Bulu country, Ebolowa region)$t$,
  resume_catalogue_en = $t$Trained as an officer by the German colonial army, which he served for eight years, Samba turned against it after seeing the brutality of the colonial regime up close. He secretly prepared an armed uprising with Rudolf Duala Manga Bell, but the letter he sent to the French was intercepted. He was executed on 8 August 1914 in Ebolowa.$t$
where slug = $t$martin-paul-samba$t$;

update public.heros set
  nom_affiche_en = $t$Rudolf Douala Manga Bell$t$,
  sous_titre_en = $t$King of the Bell clan among the Duala, resister against German colonial expropriation, executed in Douala in 1914$t$,
  epoque_en = $t$Colonial (German Kamerun, 1884-1916)$t$,
  region_en = $t$Central Africa (Douala, present-day Cameroonian coast)$t$,
  resume_catalogue_en = $t$A king educated by the German empire itself, Manga Bell rose up against the segregationist “Gross Duala” project that threatened to drive his people from the banks of the Wouri. Deposed and then charged with high treason, he was hanged on 8 August 1914 in Douala, only seven weeks before Allied troops took the city.$t$
where slug = $t$rudolf-douala-manga-bell$t$;

update public.heros set
  nom_affiche_en = $t$Sultan Njoya$t$,
  sous_titre_en = $t$Seventeenth king (mfon) of the Bamum kingdom, unifier and inventor of the Shümom script, western Cameroon$t$,
  epoque_en = $t$Colonial (Bamum kingdom under German Kamerun then French Cameroon, reigned c. 1886/1887-1931, died in exile in 1933)$t$,
  region_en = $t$Central Africa (Bamum kingdom, western present-day Cameroon, capital Foumban)$t$,
  resume_catalogue_en = $t$A diplomat king who stayed on good terms with the German administration, Njoya invented, between 1896 and 1918, a script of his people's own, Shümom, and opened schools to teach it. French colonisation eventually dispossessed him: his printing press was destroyed before it was ever used, and he died in exile in Yaoundé in 1933.$t$
where slug = $t$sultan-njoya$t$;

update public.heros set
  nom_affiche_en = $t$Ruben Um Nyobè$t$,
  sous_titre_en = $t$Founder and secretary general of the Union of the Peoples of Cameroon (UPC), central figure of the struggle for Cameroon's independence and reunification$t$,
  epoque_en = $t$Colonial (Cameroon under French trusteeship, 1913-1958)$t$,
  region_en = $t$Central Africa (Cameroon, Bassa country, Éséka and Boumnyébel area)$t$,
  resume_catalogue_en = $t$The son of farmers who became a court clerk and then a trade unionist, Um Nyobè carried the fight for Cameroonian independence all the way to the UN rostrum in 1952. After the UPC was banned in 1955, he went underground and held out for three years in the Bassa maquis before being killed by the French army on 13 September 1958. France only acknowledged its responsibility in 2025.$t$
where slug = $t$ruben-um-nyobe$t$;

update public.heros set
  nom_affiche_en = $t$Charles Atangana$t$,
  sous_titre_en = $t$Paramount chief of the Ewondo and the Bane, a central and controversial figure of Cameroon under German and then French administration$t$,
  epoque_en = $t$Colonial (German Kamerun then Cameroon under French mandate, c. 1880-1943)$t$,
  region_en = $t$Central Africa (Cameroon, Yaoundé region, Ewondo and Bane peoples)$t$,
  resume_catalogue_en = $t$Unlike Samba or Manga Bell, Atangana built his fortune and power by making himself indispensable to the German and then French colonial administrations, going as far as denouncing a plot by his own people in 1907. Builder of roads, schools and the city of Yaoundé, but also an accumulator of wealth contested by his own people, he remains a debated memory in Cameroon.$t$,
  avertissement_lecture_en = $t$Charles Atangana is not a resister. He is an ambiguous figure: a chief who built power and wealth by serving two successive colonial administrations, while modernising his region. This story never settles on “collaborator” or “pragmatic builder”: it shows the facts, both ways, and lets the reader judge. The grey areas (denouncing a plot by his own people in 1907, the forced exodus of thousands of people in 1916, personal enrichment, a royal ancestry invented in 1929) remain visible, never smoothed over.$t$
where slug = $t$charles-atangana$t$;

update public.heros set
  nom_affiche_en = $t$Félix-Roland Moumié$t$,
  sous_titre_en = $t$Doctor and president of the Union of the Peoples of Cameroon (UPC), assassinated by thallium poisoning in Geneva in 1960$t$,
  epoque_en = $t$Colonial / independence era (1925-1960)$t$,
  region_en = $t$Central Africa (Cameroon; exile in British Cameroons, Ghana, Guinea; assassinated in Geneva, Switzerland)$t$,
  resume_catalogue_en = $t$A doctor trained by the colonial system, Moumié joined the UPC in 1948 and became its leader in exile after Um Nyobè's death in 1958. On 15 October 1960 in Geneva, he was poisoned with thallium by an alleged agent of the French secret services; he died on 3 November 1960. Cameroon only proclaimed him a national hero in 1991.$t$
where slug = $t$felix-moumie$t$;

update public.heros set
  nom_affiche_en = $t$Ernest Ouandié$t$,
  sous_titre_en = $t$Schoolteacher who became the last historic leader of the UPC, head of the maquis against France and Ahmadou Ahidjo's regime, publicly executed in Bafoussam in 1971$t$,
  epoque_en = $t$Colonial then independence era (1924-1971)$t$,
  region_en = $t$Central Africa (western Cameroon, Bamileke country; executed in Bafoussam)$t$,
  resume_catalogue_en = $t$A schoolteacher trained by the colonial school, Ouandié became in 1961 the last of the great historic UPC leaders still alive and returned in secret to lead the maquis. Captured in 1970 after a decade on the run, he was publicly executed in Bafoussam in front of 40,000 people on 15 January 1971. Rehabilitated as a national hero in 1991.$t$
where slug = $t$ernest-ouandie$t$;

update public.heros set
  nom_affiche_en = $t$Manu Dibango$t$,
  sous_titre_en = $t$Cameroonian saxophonist, singer and composer, a major musical figure of the 20th and early 21st centuries, author of “Soul Makossa”$t$,
  epoque_en = $t$Contemporary (1933-2020)$t$,
  region_en = $t$Central Africa (Cameroon), with an international career based in France$t$,
  resume_catalogue_en = $t$Sent to study in France at fifteen with three kilos of coffee in his bag, Dibango became a studio musician before composing, almost by chance, “Soul Makossa” in 1972, one of the very first worldwide disco hits. Knight of the Legion of Honour and UNESCO Artist for Peace, he died of Covid-19 in 2020.$t$
where slug = $t$manu-dibango$t$;

update public.mythes set
  titre_en = $t$The Miengu, water spirits of the Sawa people$t$,
  sous_titre_en = $t$A legend and living tradition of the coastal peoples of Cameroon (Duala, Bakweri, Malimba, Subu, Bakoko, Oroko), still practised today.$t$,
  peuple_en = $t$Sawa peoples of the Cameroonian coast (Duala, Bakweri, Malimba, Subu, Bakoko, Oroko)$t$,
  region_en = $t$Littoral and South-West Cameroon (Wouri estuary, Atlantic coast)$t$,
  zone_en = $t$Littoral$t$,
  epoque_en = $t$precolonial; an ancient belief whose exact origin cannot be dated; the cult is documented as established by the 19th century despite missionary opposition; still alive today$t$,
  theme_en = $t$nature spirit / genie, initiation, healing$t$
where slug = $t$mythe-miengu-esprits-eau-sawa$t$;

update public.mythes set
  titre_en = $t$Nchare Yen, the rigged race that founded a kingdom$t$,
  sous_titre_en = $t$Founding legend of the Bamum kingdom, Bamum people, West Cameroon, late 14th century.$t$,
  peuple_en = $t$Bamum (Bamoun), of Tikar origin$t$,
  region_en = $t$West Cameroon (Grassfields, Foumban area)$t$,
  zone_en = $t$West (Grassfields)$t$,
  epoque_en = $t$precolonial, late 14th and early 15th century (reign traditionally dated 1394 to 1418, sometimes 1384 depending on the sources)$t$,
  theme_en = $t$founding figure / royal legend$t$
where slug = $t$mythe-nchare-yen-bamoun$t$;

update public.mythes set
  titre_en = $t$Ngan Medza, the serpent that carried a people on its back$t$,
  sous_titre_en = $t$Migration and founding legend of the Beti-Fang people (Ewondo, Eton, Bulu, Bene, Mvele, Manguissa, Ntumu), Sanaga river, Central Cameroon.$t$,
  peuple_en = $t$Beti-Fang (Ewondo, Eton, Bulu, Bene, Mvele, Manguissa, Ntumu, and by extension the Fang of Gabon and Equatorial Guinea)$t$,
  region_en = $t$Central Cameroon, Sanaga river (migration from the Adamawa region towards the south)$t$,
  zone_en = $t$Centre$t$,
  epoque_en = $t$precolonial, migration generally placed between the 18th and 19th centuries$t$,
  theme_en = $t$migration legend / founding figure / protective animal spirit$t$
where slug = $t$mythe-ngan-medza-beti$t$;

update public.mythes set
  titre_en = $t$Ngog Lituba, the pierced rock, origin of the Bassa people$t$,
  sous_titre_en = $t$Founding myth of the Bassa, Bakoko (Elog Mpo'o) and Bati peoples, Sanaga-Maritime region, Cameroon.$t$,
  peuple_en = $t$Bassa, Bakoko (Elog Mpo'o) and Bati$t$,
  region_en = $t$Littoral (Sanaga-Maritime, Nyanon municipality, 80 km from Édéa, on the banks of the Sanaga)$t$,
  zone_en = $t$Littoral$t$,
  epoque_en = $t$precolonial; an origin myth whose exact date is unknown; occupation attested by tradition between the 10th and 13th centuries before migration towards the Wouri$t$,
  theme_en = $t$creation myth / founding figure$t$
where slug = $t$mythe-ngog-lituba-bassa$t$;

update public.mythes set
  titre_en = $t$The Sao, the giant people of Lake Chad$t$,
  sous_titre_en = $t$Founding legend of the Kotoko people, Far North Cameroon, Lake Chad basin.$t$,
  peuple_en = $t$Kotoko (Far North Cameroon), who claim to be direct descendants of the Sao$t$,
  region_en = $t$Far North Cameroon, Lake Chad basin (also south-western Chad and north-eastern Nigeria)$t$,
  zone_en = $t$Far North$t$,
  epoque_en = $t$archaeology dates the Sao civilisation from the 6th century BCE until its destruction in the 16th century; the Kotoko civilisation succeeded it from the 16th century and continues to this day$t$,
  theme_en = $t$founding legend / figures of superhuman power / legitimation of royal power$t$
where slug = $t$mythe-sao-geants-kotoko$t$;

update public.decouverte_items set
  titre_en = $t$The fon, Bamum traditional chief$t$,
  sous_titre_en = $t$Guardian of the social order, a living link between the ancestors and the people$t$,
  region_ethnie_en = $t$Bamum kingdom, West Cameroon$t$,
  resume_liste_en = $t$In the Bamum kingdom, the traditional sovereign, or Mfon, combines military, judicial and diplomatic functions inherited from centuries of tradition. His position, hereditary, is also ritual: the Nguon regularly recalls that his power is never absolute, but accountable to his people.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$fon-chef-traditionnel-bamoun$t$;

update public.decouverte_items set
  titre_en = $t$The Nguon$t$,
  sous_titre_en = $t$The great Bamum assembly where the people judge their king's rule$t$,
  region_ethnie_en = $t$Bamum kingdom, West Cameroon$t$,
  resume_liste_en = $t$Every two years, the Bamum kingdom gathers around the Nguon, a centuries-old series of rituals in which the sovereign publicly answers for his rule before his people. Recognised by UNESCO as intangible cultural heritage of humanity in 2023, the Nguon blends popular judgement, reconciliation and a great collective celebration.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$nguon$t$;

update public.decouverte_items set
  titre_en = $t$Royal palace of Foumban$t$,
  sous_titre_en = $t$Residence of the Bamum kings, living memory of a six-century-old kingdom$t$,
  region_ethnie_en = $t$Bamum kingdom, West Cameroon$t$,
  resume_liste_en = $t$At the heart of Foumban, historic capital of the Bamum kingdom, the royal palace has housed the sovereign's residence for generations. Rebuilt in the early 20th century after several fires, it blends local and European architectural influences, and today hosts a museum tracing six centuries of the dynasty.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$palais-royal-foumban$t$;

update public.decouverte_items set
  titre_en = $t$The Mandu Yenu throne$t$,
  sous_titre_en = $t$The beaded Bamum royal throne, a masterpiece of art and an object of colonial memory$t$,
  region_ethnie_en = $t$Bamum kingdom, West Cameroon$t$,
  resume_liste_en = $t$The Mandu Yenu, “rich in beads”, is one of the most famous thrones of Central Africa: a wooden seat and footrest entirely covered with glass beads and cowries, carved with the symbols of Bamum power. Given in 1908 to the German emperor Wilhelm II, it is now held in Berlin, and its story continues to question the kingdom's colonial memory.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$trone-mandu-yenu$t$;

update public.decouverte_items set
  titre_en = $t$Ebolowa$t$,
  sous_titre_en = $t$The town born of a siege, capital of Bulu country forged in resistance to German colonisation$t$,
  region_ethnie_en = $t$Bulu/Beti country, southern/central Cameroon$t$,
  resume_liste_en = $t$Today the capital of the South region, Ebolowa was born at the turn of the 20th century, between the arrival of an American mission and that of a German military post. In the very early 1900s, the town was the scene of one of the most significant clashes between the Bulu kingdoms and confederations and the German colonial administration.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$ebolowa$t$;

update public.decouverte_items set
  titre_en = $t$The nkukuma, lineage notable$t$,
  sous_titre_en = $t$The man of authority in a society without a king, where status is won more than inherited$t$,
  region_ethnie_en = $t$Bulu/Beti country, southern/central Cameroon$t$,
  resume_liste_en = $t$Unlike the Bamum kingdom and its fon, traditional Beti/Bulu society had no single centralised chief before colonisation. Authority rested with lineage notables, the nkukuma: men who built their influence through redistributed wealth, eloquence and courage, at the scale of a village or a group of villages only.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$nkukuma-notable-lignage$t$;

update public.decouverte_items set
  titre_en = $t$The Sô$t$,
  sous_titre_en = $t$The great male initiation rite that, among the Beti and the Bulu, turned the adolescent into an accomplished man$t$,
  region_ethnie_en = $t$Bulu/Beti country, southern/central Cameroon$t$,
  resume_liste_en = $t$The Sô was the major initiation rite of Beti and Bulu societies, reserved for boys and spread over several months: ordeals, seclusion and teaching passed on by an officiant from outside the lineage. It brought the young man into adulthood and also purged the community of faults it felt it had to atone for collectively. Deeply disrupted by colonisation and evangelisation, it is no longer practised today in its old form.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$rite-initiatique-so$t$;

update public.decouverte_items set
  titre_en = $t$Bonanjo and the Palace of the Bell kings$t$,
  sous_titre_en = $t$The historic cradle of the Duala on the bank of the Wouri, where the city's fate was decided$t$,
  region_ethnie_en = $t$Sawa people, Cameroonian coast (Douala)$t$,
  resume_liste_en = $t$On the left bank of the Wouri river, the Bonanjo district is one of the three historic founding villages of Douala, along with Akwa and Deido. It is home to the Palace of the Bell kings, a royal residence built in 1905 and nicknamed “the Pagoda”, where Rudolf Douala Manga Bell lived and resisted before his execution in 1914.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$bonanjo-palais-des-rois-bell$t$;

update public.decouverte_items set
  titre_en = $t$The Ngondo, the assembly of the river$t$,
  sous_titre_en = $t$The great Sawa festival that consults the spirits of the Wouri to light the way for the coming year$t$,
  region_ethnie_en = $t$Sawa people, Cameroonian coast (Douala)$t$,
  resume_liste_en = $t$Every year, from September to the first Sunday of December, the Sawa people gather in Douala for the Ngondo: traditional wrestling, parades, contests and crafts culminate in a sacred ritual on the Wouri river, where an initiate dives with a vessel entrusted to the jengu spirits and brings back a message for the community. Inscribed on UNESCO's list of the intangible cultural heritage of humanity in December 2024.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$le-ngondo$t$;

update public.decouverte_items set
  titre_en = $t$The Tangué, carved prow of Sawa canoes$t$,
  sous_titre_en = $t$The carved prow ornament that carried a clan's prestige on the great racing canoes of the Wouri$t$,
  region_ethnie_en = $t$Sawa people, Cameroonian coast (Douala)$t$,
  resume_liste_en = $t$Fixed to the front of the huge “myolo” racing canoes of the Wouri river, the tangué is a carved, painted wooden prow laden with animal and symbolic figures. Far more than a simple ornament, it carried the spiritual protection of the crew and displayed the power of the Duala clan that had commissioned it, notably during the customary races still associated with the Ngondo.$t$,
  pays_en = $t$Cameroon$t$
where slug = $t$le-tangue-proue-de-pirogue-sacree$t$;

update public.decouverte_pays set
  nom_en = $t$Cameroon$t$,
  resume_en = $t$The first country covered by AFROBACK's Discovery pillar: villages, traditions, objects and traditional roles of the kingdoms and peoples already met in the History & Heroes pillar (Bamum, Sawa, Bulu/Beti).$t$
where slug = $t$cameroun$t$;

update public.ecole_niveaux set
  nom_en = $t$First Stories$t$,
  tranche_age_en = $t$3-5 years$t$
where niveau = 1;

update public.ecole_niveaux set
  nom_en = $t$Little Explorers$t$,
  tranche_age_en = $t$6-8 years$t$
where niveau = 2;

update public.ecole_niveaux set
  nom_en = $t$Great Explorers$t$,
  tranche_age_en = $t$9-11 years$t$
where niveau = 3;

update public.ecole_niveaux set
  nom_en = $t$Heirs of History$t$,
  tranche_age_en = $t$12 years and over$t$
where niveau = 4;


-- Contrôle : nombre de lignes traduites par table.
select 'heros' t, count(*) from public.heros where resume_catalogue_en is not null
union all select 'mythes', count(*) from public.mythes where titre_en is not null
union all select 'decouverte_items', count(*) from public.decouverte_items where titre_en is not null
union all select 'decouverte_pays', count(*) from public.decouverte_pays where nom_en is not null
union all select 'ecole_niveaux', count(*) from public.ecole_niveaux where nom_en is not null;
