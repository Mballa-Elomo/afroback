import type { Citation, LegendeAssociee } from './types';

/**
 * Champs éditoriaux qui demandent un jugement humain (résumé, thème,
 * citations avec leur statut d'attestation, légendes, avertissement de
 * lecture...) : maintenus à la main ici, après lecture attentive de chaque
 * récit du griot et de son storyboard. Voir scripts/build-heroes-data.mjs
 * pour ce qui est extrait mécaniquement (texte intégral, frise, sources,
 * héros liés, chapitres).
 *
 * Statuts média (2026-07-29) : les 9 héros ont un statut "à produire" pour
 * l'audio et "storyboard prêt" pour la vidéo dans CE repo. Deux héros
 * (martin-paul-samba, reine-nzinga) ont déjà une narration/vidéo de démo
 * produite côté projet claude.ai/design, mais pas encore importée ici — voir
 * app-mobile/README.md. Une fois importée, mettre à jour statut_narration_audio
 * / statut_video pour ces deux slugs.
 */

export interface HeroCuratedFields {
  slug: string;
  nom_affiche: string;
  nom_complet: string;
  sous_titre: string;
  epoque: string;
  region: string;
  theme: string[];
  resume_catalogue: string;
  annee_naissance_indicative?: string;
  annee_mort_indicative?: string;
  citations: Citation[];
  legendes_associees: LegendeAssociee[];
  avertissement_lecture?: string;
  ordre_affichage: number;
}

export const HEROES_CURATED: HeroCuratedFields[] = [
  {
    slug: 'reine-nzinga',
    nom_affiche: 'Reine Nzinga',
    nom_complet: 'Nzinga Mbandi (Njinga a Mbande)',
    sous_titre: 'Reine de Ndongo et de Matamba (actuel Angola), XVIIe siècle',
    epoque: 'Précolonial, règne de 1624 à 1663',
    region: 'Afrique centrale (royaumes de Ndongo et Matamba, actuel Angola)',
    theme: ['Résistance', 'Politique'],
    resume_catalogue:
      "Née vers 1583 dans le royaume de Ndongo, Njinga devient reine en 1624 et résiste pendant près de quarante ans à la colonisation portugaise, alliant diplomatie, guerre et ruse. Une figure de résistance ambivalente : elle a aussi participé activement à la traite négrière pour financer ses guerres. Elle meurt en 1663 sans avoir perdu sa couronne.",
    annee_naissance_indicative: 'v. 1583',
    annee_mort_indicative: '17 décembre 1663',
    citations: [],
    legendes_associees: [
      {
        titre: 'L’anecdote du « trône humain »',
        description:
          "Lors de la négociation de 1621-1622 à Luanda, Njinga aurait fait s'agenouiller une servante pour s'asseoir sur son dos et négocier à hauteur du gouverneur portugais, faute de siège prévu pour elle. Épisode largement repris dans la mémoire populaire, mais issu de récits recueillis a posteriori (chroniqueur Cadornega, missionnaires capucins, mémoire orale collectée dans les années 1650), pas d'un témoignage oculaire daté de l'époque des faits.",
        statut: 'legende',
      },
      {
        titre: 'Les pratiques imbangala (rites de sang, anthropophagie rituelle)',
        description:
          "Les sources s'accordent sur des rites d'initiation imbangala (serment de sang) suivis par Njinga vers 1629-1631. Les accusations d'anthropophagie qui lui sont personnellement attribuées par certains chroniqueurs européens de l'époque sont jugées par les historiens actuels peu étayées factuellement, relevant davantage d'un regard hostile et sensationnaliste que de faits vérifiés.",
        statut: 'legende',
      },
    ],
    ordre_affichage: 1,
  },
  {
    slug: 'martin-paul-samba',
    nom_affiche: 'Martin Paul Samba',
    nom_complet: "Martin Paul Samba (né Mebenga m'Ebono)",
    sous_titre:
      'Chef bulu et résistant à la colonisation allemande, sud du Cameroun, fin XIXe - début XXe siècle',
    epoque: 'Colonial (Kamerun allemand, 1884-1916)',
    region: "Afrique centrale (sud du Cameroun, pays bulu, région d'Ebolowa)",
    theme: ['Résistance'],
    resume_catalogue:
      "Formé comme officier par l'armée coloniale allemande qu'il sert pendant huit ans, Samba se retourne contre elle après avoir vu de près la brutalité du régime colonial. Il prépare en secret un soulèvement armé avec Rudolf Duala Manga Bell, mais la lettre qu'il envoie aux Français est interceptée. Il est exécuté le 8 août 1914 à Ebolowa.",
    annee_naissance_indicative: 'v. 1874-1875',
    annee_mort_indicative: '8 août 1914',
    citations: [],
    legendes_associees: [
      {
        titre: 'Le mouchoir blanc et la phrase de défi face au peloton',
        description:
          "Le geste du mouchoir blanc agité face au peloton d'exécution, le refus du bandeau sur les yeux, et la phrase « Je n'ai pas peur de la mort, tuez-moi mais vous n'aurez jamais le Cameroun » sont rapportés par de nombreuses sources camerounaises comme un récit transmis dans la mémoire populaire d'Ebolowa, jamais adossé à un témoignage daté et signé de l'époque des faits.",
        statut: 'legende',
      },
      {
        titre: '« Martin Paul Samba, au-delà de la légende »',
        description:
          'Un documentaire camerounais consacré à sa vie porte lui-même ce titre, signe que la construction de sa mémoire collective au Cameroun dépasse volontiers les faits strictement documentés.',
        statut: 'legende',
      },
    ],
    ordre_affichage: 2,
  },
  {
    slug: 'rudolf-douala-manga-bell',
    nom_affiche: 'Rudolf Douala Manga Bell',
    nom_complet: 'Rudolf Douala Manga Bell',
    sous_titre:
      "Roi du clan Bell chez les Douala, résistant à l'expropriation coloniale allemande, exécuté à Douala en 1914",
    epoque: 'Colonial (Kamerun allemand, 1884-1916)',
    region: 'Afrique centrale (Douala, littoral camerounais actuel)',
    theme: ['Résistance'],
    resume_catalogue:
      "Roi formé par l'empire allemand lui-même, Manga Bell se dresse contre le projet ségrégationniste « Gross Duala » qui menace de chasser son peuple des rives du Wouri. Destitué puis inculpé de haute trahison, il est pendu le 8 août 1914 à Douala, sept semaines seulement avant que les troupes alliées ne prennent la ville.",
    annee_naissance_indicative: 'v. 1873',
    annee_mort_indicative: '8 août 1914',
    citations: [],
    legendes_associees: [
      {
        titre: "La malédiction contre l'Allemagne",
        description:
          "Une phrase de malédiction contre les Allemands (« Vous pendez du sang innocent... que les Allemands ne remettent plus jamais les pieds sur cette terre ») circule sur un site associatif sans aucune source primaire citée.",
        statut: 'legende',
      },
      {
        titre: '« Restez unis et solidaires »',
        description:
          'Ces derniers mots proviennent d’une pièce de théâtre camerounaise, *Ngum a Jemea ou la foi inébranlable de Rudolph Duala Manga Bell* de David Mbanga (œuvre inscrite au programme scolaire camerounais) : une dramatisation littéraire, pas un témoignage historique.',
        statut: 'legende',
      },
      {
        titre: 'Une conversion au christianisme à Aalen',
        description:
          "Mentionnée par une seule source parmi celles consultées ; rapportée avec cette réserve.",
        statut: 'legende',
      },
    ],
    ordre_affichage: 3,
  },
  {
    slug: 'sultan-njoya',
    nom_affiche: 'Sultan Njoya',
    nom_complet: 'Sultan Njoya (Ibrahim Njoya)',
    sous_titre:
      "Dix-septième roi (mfon) du royaume Bamoun, unificateur et inventeur de l'écriture Shümom, ouest du Cameroun",
    epoque:
      'Colonial (royaume Bamoun sous Kamerun allemand puis Cameroun français, règne v. 1886/1887-1931, mort en exil en 1933)',
    region: 'Afrique centrale (royaume Bamoun, ouest du Cameroun actuel, capitale Foumban)',
    theme: ['Science', 'Art', 'Politique'],
    resume_catalogue:
      "Roi diplomate resté en bons termes avec l'administration allemande, Njoya invente entre 1896 et 1918 une écriture propre à son peuple, le Shümom, et ouvre des écoles pour l'enseigner. La colonisation française finit par le déposséder : sa presse d'imprimerie est détruite avant usage et il meurt en exil à Yaoundé en 1933.",
    annee_naissance_indicative: 'v. 1860 (sources hésitantes, autre estimation v. 1876)',
    annee_mort_indicative: '30 mai 1933',
    citations: [
      {
        texte:
          'Si vous dessinez beaucoup de choses différentes et que vous leur donnez un nom, je ferai un livre qui parle sans être entendu.',
        statut_attestation: 'rapportee_par_tiers',
        source:
          "Parole attribuée à Njoya au lancement du projet d'écriture, relayée par des travaux historiques sur la genèse du script bamoun ; associée au récit du songe fondateur, pas un document d'archive daté au sens strict.",
      },
    ],
    legendes_associees: [
      {
        titre: "Le songe fondateur de l'écriture bamoun",
        description:
          "L'origine du projet d'écriture est présentée, y compris par Njoya lui-même, comme née d'un rêve prophétique : un maître lui serait apparu en songe pour lui montrer comment dessiner une main sur une planchette de bois, l'effacer, puis boire l'eau ayant servi à la laver. Un motif de légitimation spirituelle fréquent dans les traditions royales africaines, à raconter comme le récit que Njoya a lui-même transmis, pas comme une preuve historique du mécanisme réel.",
        statut: 'legende',
      },
    ],
    ordre_affichage: 4,
  },
  {
    slug: 'ruben-um-nyobe',
    nom_affiche: 'Ruben Um Nyobè',
    nom_complet: 'Ruben Um Nyobè (surnommé Mpodol)',
    sous_titre:
      "Fondateur et secrétaire général de l'Union des Populations du Cameroun (UPC), figure centrale de la lutte pour l'indépendance et la réunification du Cameroun",
    epoque: 'Colonial (Cameroun sous tutelle française, 1913-1958)',
    region: "Afrique centrale (Cameroun, pays bassa, région d'Éséka et de Boumnyébel)",
    theme: ['Résistance', 'Politique'],
    resume_catalogue:
      "Fils de paysans devenu greffier puis syndicaliste, Um Nyobè porte le combat pour l'indépendance camerounaise jusqu'à la tribune de l'ONU en 1952. Après l'interdiction de l'UPC en 1955, il entre en clandestinité et tient trois ans dans le maquis bassa avant d'être tué par l'armée française le 13 septembre 1958. La France ne reconnaîtra sa responsabilité qu'en 2025.",
    annee_naissance_indicative: '10 avril 1913',
    annee_mort_indicative: '13 septembre 1958',
    citations: [
      {
        texte:
          "Nous demandons l'unification immédiate de notre pays et la fixation d'un délai pour l'indépendance",
        statut_attestation: 'attestee',
        source:
          "Discours du 17 décembre 1952 devant la Quatrième Commission de l'ONU, texte publié en 1984 dans *Le Problème national camerounais*.",
      },
    ],
    legendes_associees: [],
    ordre_affichage: 5,
  },
  {
    slug: 'charles-atangana',
    nom_affiche: 'Charles Atangana',
    nom_complet: 'Charles Atangana (né Ntsama, dit Karl)',
    sous_titre:
      'Chef supérieur des Ewondo et des Bane, figure centrale et controversée du Cameroun sous administrations allemande puis française',
    epoque: 'Colonial (Kamerun allemand puis Cameroun sous mandat français, v. 1880-1943)',
    region: 'Afrique centrale (Cameroun, région de Yaoundé, peuples ewondo et bane)',
    theme: ['Politique'],
    resume_catalogue:
      "Contrairement à Samba ou Manga Bell, Atangana bâtit sa fortune et son pouvoir en se rendant indispensable aux administrations coloniales allemande puis française, jusqu'à dénoncer un complot de son propre peuple en 1907. Bâtisseur de routes, d'écoles et de la ville de Yaoundé, mais aussi accumulateur de richesse contestée par les siens, sa mémoire reste débattue au Cameroun.",
    annee_naissance_indicative: 'v. 1880-1883 (sources hésitantes, entre 1876 et 1885)',
    annee_mort_indicative: '1er septembre 1943',
    citations: [
      {
        texte:
          'Pour oser approcher les Allemands, il faut abandonner les traits qui leur déplaisent, devenir leur ami, puis être valorisé par eux.',
        statut_attestation: 'attestee',
        source:
          "Rapportée par l'historien Frederick Quinn (« Charles Atangana of Yaounde », The Journal of African History, 1980).",
      },
      {
        texte:
          'Nous travaillons toujours et c’est Atangana qui reçoit l’argent. Pour tout ce que nous avons envoyé aux Européens, poules et œufs, par l’intermédiaire d’Atangana, nous n’avons rien reçu.',
        statut_attestation: 'attestee',
        source:
          'Plainte déposée par des chefs bane en 1924, archives coloniales françaises, citée par Frederick Quinn.',
      },
    ],
    legendes_associees: [
      {
        titre: 'Les fortunes personnelles précisément chiffrées',
        description:
          "Certains récits populaires évoquent des fortunes personnelles extrêmement précises (surfaces exactes de plantations, nombre de têtes de bétail) qui proviennent de témoignages oraux rapportés bien après les faits, jugés « probablement exagérés » par l'historiographie elle-même : des ordres de grandeur symboliques plutôt que des données comptables exactes.",
        statut: 'legende',
      },
      {
        titre: "L'ascendance royale ewondo inventée (1929)",
        description:
          "L'affirmation d'Atangana lui-même, en 1929, d'une ascendance royale ewondo remontant à des origines fictives doit être traitée comme un récit d'auto-légitimation qu'il a construit, non comme un fait généalogique établi : les sources s'accordent sur le caractère modeste de sa naissance réelle.",
        statut: 'legende',
      },
    ],
    avertissement_lecture:
      "Charles Atangana n'est pas un résistant. C'est une figure ambiguë : un chef qui a bâti pouvoir et fortune en servant deux administrations coloniales successives, tout en modernisant sa région. Ce récit ne tranche jamais vers « collaborateur » ni vers « bâtisseur pragmatique » : il montre les faits, dans les deux sens, et laisse le lecteur juger. Les zones d'ombre (dénonciation d'un complot de son propre peuple en 1907, exode forcé de milliers de personnes en 1916, enrichissement personnel, ascendance royale inventée en 1929) restent visibles, jamais lissées.",
    ordre_affichage: 6,
  },
  {
    slug: 'felix-moumie',
    nom_affiche: 'Félix-Roland Moumié',
    nom_complet: 'Félix-Roland Moumié',
    sous_titre:
      "Médecin et président de l'Union des populations du Cameroun (UPC), assassiné par empoisonnement au thallium à Genève en 1960",
    epoque: 'Colonial / indépendances (1925-1960)',
    region:
      'Afrique centrale (Cameroun ; exil au Cameroun britannique, Ghana, Guinée ; assassiné à Genève, Suisse)',
    theme: ['Résistance', 'Politique'],
    resume_catalogue:
      "Médecin formé par le système colonial, Moumié rejoint l'UPC en 1948 et en devient le chef en exil après la mort d'Um Nyobè en 1958. Le 15 octobre 1960 à Genève, il est empoisonné au thallium par un agent présumé des services secrets français ; il meurt le 3 novembre 1960. Le Cameroun ne le proclame héros national qu'en 1991.",
    annee_naissance_indicative: '1er novembre 1925',
    annee_mort_indicative: '3 novembre 1960',
    citations: [],
    legendes_associees: [],
    ordre_affichage: 7,
  },
  {
    slug: 'ernest-ouandie',
    nom_affiche: 'Ernest Ouandié',
    nom_complet: 'Ernest Ouandié',
    sous_titre:
      "Instituteur devenu dernier dirigeant historique de l'UPC, chef du maquis contre la France et le régime d'Ahmadou Ahidjo, exécuté publiquement à Bafoussam en 1971",
    epoque: 'Colonial puis indépendances (1924-1971)',
    region: 'Afrique centrale (ouest du Cameroun, pays bamiléké ; exécuté à Bafoussam)',
    theme: ['Résistance', 'Politique'],
    resume_catalogue:
      "Instituteur formé par l'école coloniale, Ouandié devient en 1961 le dernier des grands dirigeants historiques de l'UPC encore vivant et rentre clandestinement diriger le maquis. Capturé en 1970 après une décennie de traque, il est exécuté publiquement à Bafoussam devant 40 000 personnes le 15 janvier 1971. Réhabilité héros national en 1991.",
    annee_naissance_indicative: '1924',
    annee_mort_indicative: '15 janvier 1971',
    citations: [],
    legendes_associees: [
      {
        titre: "Les derniers mots face au peloton d'exécution",
        description:
          "Trois versions différentes circulent (l'annonce que d'autres poursuivraient le combat, un appel à l'histoire pour juger, un message à sa femme et ses enfants), sans qu'aucune ne soit adossée à un témoignage daté et signé de l'époque des faits. Elles relèvent de la mémoire populaire construite après coup.",
        statut: 'legende',
      },
      {
        titre: 'Les détails de sa vie familiale',
        description:
          "Le nom exact du village natal, les noms des parents et de la fratrie, le prénom et l'origine de son épouse, le nombre et les noms de ses enfants varient sensiblement d'une source à l'autre. Faute de source académique les recoupant clairement, ces détails restent incertains.",
        statut: 'legende',
      },
      {
        titre: 'Un interrogatoire de plusieurs mois',
        description:
          "Un récit d'interrogatoire avec mauvais traitements, rapporté notamment par un compagnon de détention, Albert Mukong, s'inscrit dans un contexte de répression bien documenté, mais les détails précis reposent sur un témoignage individuel plutôt que sur une source croisée indépendamment.",
        statut: 'legende',
      },
    ],
    ordre_affichage: 8,
  },
  {
    slug: 'manu-dibango',
    nom_affiche: 'Manu Dibango',
    nom_complet: 'Manu Dibango (né Emmanuel N’Djoké Dibango)',
    sous_titre:
      'Saxophoniste, chanteur et compositeur camerounais, figure musicale majeure du XXe et du début du XXIe siècle, auteur de « Soul Makossa »',
    epoque: 'Contemporain (1933-2020)',
    region: 'Afrique centrale (Cameroun), rayonnement international depuis la France',
    theme: ['Art'],
    resume_catalogue:
      'Parti étudier en France à quinze ans avec trois kilos de café dans son sac, Dibango devient musicien de studio avant de composer, presque par hasard, « Soul Makossa » en 1972, l’un des tout premiers tubes disco mondiaux. Chevalier de la Légion d’honneur, Artiste de la paix de l’UNESCO, il meurt du Covid-19 en 2020.',
    annee_naissance_indicative: '12 décembre 1933',
    annee_mort_indicative: '24 mars 2020',
    citations: [
      {
        texte:
          'Je suis Camerounais d’origine, mais je ne me prétends pas musicien Camerounais... Je suis musicien d’origine camerounaise.',
        statut_attestation: 'attestee',
        source: 'Interview, Le Jazzophone, 28 avril 2016.',
      },
      {
        texte: 'Je ne suis qu’un simple musicien, commençons par là et arrêtons cela à ça.',
        statut_attestation: 'attestee',
        source: 'Interview, Le Jazzophone, 28 avril 2016.',
      },
      {
        texte:
          'Le Jazz c’est une combinaison. On lui a enlevé les pieds, il ne reste plus que la tête.',
        statut_attestation: 'attestee',
        source: 'Interview, Le Jazzophone, 28 avril 2016.',
      },
    ],
    legendes_associees: [],
    ordre_affichage: 9,
  },
];
