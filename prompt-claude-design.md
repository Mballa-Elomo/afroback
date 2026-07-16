# Prompt pour Claude Design — Site web AFROBACK

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.

---

Crée un site web one-page immersif et haut de gamme pour **AFROBACK**, une plateforme de promotion de la culture africaine : histoires de héros africains, éducation aux cultures et valeurs du continent, découverte de ses richesses. Le slogan d'AFROBACK est **« Retour aux origines »** : le site entier doit donner l'impression de rentrer chez soi, en Afrique, pas juste de visiter un site vitrine.

## L'exigence centrale : l'immersion

Ce n'est pas un site "corporate" comme un cabinet de conseil. C'est un site qui doit transporter émotionnellement le visiteur. Concrètement :
- Une **profondeur visuelle en 3D/parallaxe** : plusieurs couches qui bougent à des vitesses différentes au scroll, pour donner une sensation d'espace et de mouvement, pas un empilement plat de sections
- Une **pièce centrale visuelle forte dans le hero** : une carte du continent africain qui a du volume, de la texture, presque vivante (légère rotation lente, respiration, particules de lumière), pas une image statique
- Une **ambiance chaleureuse, dorée, presque au coucher de soleil** : lumière chaude, pas un site froid et minimaliste
- Des **motifs et textures africaines authentiques en filigrane** (inspirés de tissus type bogolan/mudcloth, kente, wax, motifs géométriques tribaux) utilisés avec goût comme éléments de fond, séparateurs de section ou détails, jamais comme un simple décor plaqué
- Le visiteur doit sentir, dès les 3 premières secondes, qu'il entre dans un lieu chargé de sens, pas sur un site de plus

## Identité visuelle (à respecter, cohérente avec le logo)

- **Logo** : silhouette d'une femme africaine de profil fusionnée avec la carte du continent, remplie de motifs tribaux (losanges, cercles concentriques, textiles), sur un halo doré façon soleil, fond noir profond
- **Couleurs** :
  - Noir profond / charbon (proche de `#0F0B08`) comme base, pour la profondeur et le contraste
  - Dégradé or / bronze (de `#F0C36B` à `#8B5A2B` environ) pour les accents lumineux, titres, CTA
  - Terracotta / rouille (`#A0522D`, `#8B3A2F`) en couleur secondaire chaude, pour la richesse des textures
  - Rehauts ponctuels de couleurs vives (rouge, bleu, jaune safran) inspirés des textiles africains, utilisés avec parcimonie sur des détails, pas en masse
- **Typographie** : une police display à fort caractère pour les titres (empattements marqués ou style gravé/sculpté, qui évoque l'héritage et la noblesse), une police sans-serif très lisible pour le texte courant
- **Ton visuel** : premium, chaleureux, habité, entre afrofuturisme et héritage ancestral, jamais folklorique ou cliché touristique

## Langues

Site en 6 langues : **français, anglais, ewondo, douala, bassa et bamiléké**. Sélecteur de langue visible dans le header, avec les 6 options clairement identifiables (codes courts type FR / EN / EWO / DUA / BAS / BAM, ou drapeaux/symboles adaptés pour les langues sans code ISO standard).

Ce choix n'est pas cosmétique : au-delà de toucher le public local et la diaspora à l'international, faire vivre ces langues camerounaises sur le site est une façon concrète de servir la mission d'AFROBACK (transmission et préservation des cultures africaines), pas juste une fonctionnalité de confort.

## Structure du site (one-page avec ancres)

1. **Header** : logo, navigation, sélecteur des 6 langues (français, anglais, ewondo, douala, bassa, bamiléké), CTA "Rejoindre la communauté" toujours visible
2. **Hero immersif** : la carte du continent en pièce centrale animée (légère rotation, profondeur, particules lumineuses dorées flottantes évoquant la poussière du désert ou des lucioles au crépuscule), le slogan "Retour aux origines" en très grand, une accroche courte sur la mission d'AFROBACK, CTA principal vers l'inscription/liste d'attente
3. **Notre mission** : pourquoi AFROBACK existe, la conviction que la culture africaine mérite d'être racontée, célébrée et transmise, avec la même profondeur narrative que le hero (parallaxe, apparition progressive)
4. **Les piliers d'AFROBACK** (présentés comme des univers à explorer, pas des simples cartes produit) :
   - **Histoires & Héros** : récits de figures et héros africains, passé et présent, contenus éducatifs sur les cultures et valeurs du continent
   - **Découverte** : exploration des villages africains, des traditions, des outils et objets sacrés, un pilier centré sur le patrimoine matériel et immatériel du continent (artisanat, rites, savoir-faire ancestraux)
   - **Marketplace** (à venir) : découverte et achat de produits authentiques venus d'Afrique, artisanat, mode, objets porteurs de sens
   - **Communauté & Abonnement** (à venir) : accès aux histoires, contenus exclusifs et à une communauté panafricaine active
   - **Apprentissage des langues** (à venir) : un futur module pour apprendre l'ewondo, le douala, le bassa et le bamiléké, présenté comme un moyen concret de renouer avec ses racines linguistiques
   Pour les piliers "à venir", assume clairement qu'ils ne sont pas encore actifs (mention discrète "bientôt disponible") sans casser l'immersion
5. **Un avant-goût du continent** : c'est la vitrine visuelle du pilier Découverte. Une section galerie/scroll immersif qui donne à voir la richesse et la diversité de l'Afrique : villages, scènes de vie traditionnelle, outils et objets sacrés, motifs et symboles, pensée comme un voyage visuel plus que comme une simple grille d'images. Ajoute une mention discrète "bientôt disponible" pour une future **visite virtuelle des musées africains**, présentée comme une extension naturelle de ce pilier (sans la construire maintenant, juste teaser l'ambition)
6. **Rejoindre l'aventure** : section d'inscription à la liste d'attente / communauté, avec un message qui donne envie d'appartenir à quelque chose dès le premier jour, formulaire simple (email, prénom)
7. **Footer** : logo, réseaux sociaux, liens rapides, mention légale minimale

## Exigences techniques et UX

- Toutes les animations et effets de profondeur doivent rester fluides sur mobile, avec un repli sobre (moins d'effets, pas de dégradation de lisibilité) sur les appareils moins puissants et pour les utilisateurs ayant activé "réduire les animations"
- Le site doit rester rapide à charger malgré la richesse visuelle : privilégier des effets CSS/canvas légers plutôt que des assets 3D lourds
- Contraste texte/fond toujours suffisant, même sur les zones sombres et dorées
- Le CTA d'inscription doit rester visible et engageant à chaque section, sans casser l'immersion narrative

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- Le logo est dans `context/import/afroback logo.png`, à uploader dans Claude Design en complément de ce prompt
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le mets en place dans `livrables/sites-web/afroback/`, comme pour Madou Consulting
- **Point important sur les traductions** : ni moi ni Claude Design n'avons de garantie de maîtrise native de l'ewondo, du douala, du bassa ou du bamiléké. Le premier jet de traduction de l'interface dans ces 4 langues devra être relu par un locuteur natif avant toute mise en ligne publique. Vu que la mission d'AFROBACK est justement la valorisation authentique de ces cultures, une erreur de traduction visible ferait plus de mal que de bien à la crédibilité du projet
