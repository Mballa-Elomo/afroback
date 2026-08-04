# Prompt pour Claude Design — Module Don / Soutien AFROBACK (web + mobile)

> À copier-coller directement dans Claude Design. Upload aussi le logo AFROBACK (`context/import/afroback logo.png`) en complément de ce prompt.
>
> Ce script détaille un **nouveau module** ("Faire un don") qui n'existe pas encore dans le script produit complet (`prompt-claude-design-produit.md`) ni dans le prototype "AFROBACK Mobile" déjà maquetté. Garde la même identité visuelle que les autres prompts AFROBACK (noir profond `#0F0B08`, dégradé or/bronze `#F0C36B` → `#8B5A2B`, terracotta `#A0522D`/`#8B3A2F`, motifs bogolan/kente/wax en filigrane, typographie display + sans-serif).

---

Conçois le module complet **Faire un don** d'AFROBACK, en version web responsive ET app mobile. C'est l'espace où un utilisateur (public local ou diaspora) peut soutenir financièrement la plateforme, avec la même exigence de transparence et d'incarnation que le reste du produit : chaque don a une destination concrète et lisible, ce n'est jamais un simple bouton "Donner" anonyme sans contexte.

## Rappel du contexte produit

- Le modèle économique déjà acté pour AFROBACK combine **abonnement, marketplace et sponsors** (voir `prompt-claude-design-onboarding.md` et `prompt-claude-design-marketplace.md`). **Le don est un levier complémentaire, distinct des sponsors** : les sponsors sont des marques/institutions qui financent en amont via un partenariat commercial ; le don s'adresse au grand public et à la diaspora, avec des montants libres et souvent modestes, dans une logique de contribution citoyenne plutôt que de partenariat.
- **Le don finance en priorité la production de contenu du pilier Histoires & Héros** : narration audio, tournage vidéo, traduction. C'est un fait de production réel et daté (pas une fiction pour la maquette) : à ce jour, sur 9 héros au catalogue, seuls 3 ont une narration audio complète et 2 une vidéo, les autres restent au stade "storyboard prêt, à produire". Le don peut aussi financer le fonctionnement général de la plateforme ou l'apprentissage des langues camerounaises (ewondo, douala, bassa, bamiléké — pilier encore non ouvert faute de contenu).
- **Paiement Mobile Money en priorité** (Orange Money, MTN MoMo), carte bancaire en option secondaire pour la diaspora — cohérent avec le reste du produit.
- Le don doit rester une action simple et rapide (2-3 écrans maximum jusqu'à la confirmation), pas un tunnel aussi lourd que le checkout Marketplace : c'est un geste de soutien, pas un achat.

## Contenu d'exemple à utiliser

Pas de lorem ipsum, des causes crédibles et incarnées, construites sur les vrais héros et vrais besoins du catalogue AFROBACK :

- **Financer la narration audio d'un héros** : ex. "Donne une voix à Sultan Njoya" (inventeur de l'écriture bamoun) ou "Donne une voix à Ernest Ouandié" — héros dont le récit est déjà écrit mais pas encore narré.
- **Financer le tournage vidéo d'un héros** : ex. "Filme l'histoire de Manu Dibango" ou "Filme l'histoire de Charles Atangana" — storyboard déjà prêt (96 planches), tournage à financer.
- **Financer la traduction de l'app** : "Fais entendre AFROBACK en ewondo, douala, bassa et bamiléké" — les 4 langues camerounaises de l'interface sont aujourd'hui vides.
- **Cause générale** : "Soutenir AFROBACK" — fonctionnement de la plateforme, hébergement, production de contenu à venir, sans destination unique.

---

## Côté donateur

### 1. Points d'entrée du module

- Bandeau/carte "Soutenir AFROBACK" sur l'écran d'accueil (rotation avec les autres mises en avant)
- Entrée dédiée dans le menu Profil ("Faire un don")
- Bandeau contextuel sur la fiche d'un héros dont le statut est "à produire" (audio) ou "storyboard prêt" (vidéo) : "Ce récit n'a pas encore de voix — aide à le financer" avec CTA direct vers la cause correspondante
- Bandeau similaire sur l'écran "bientôt disponible" du pilier Langues

### 2. Hub Don (accueil du module)

- Message de mission court et incarné (pas un pitch commercial : pourquoi soutenir AFROBACK, ce que ça change concrètement)
- Compteur global simple : montant total collecté depuis le lancement, nombre de donateurs, nombre de causes financées à 100 % (composant volontairement sobre, pas un chiffre inventé à afficher tel quel en développement réel — voir notes)
- Liste des causes actives (voir écran 3), triée par mise en avant éditoriale puis par urgence/avancement
- CTA "Don libre" pour soutenir sans choisir de cause précise (redirige vers la cause générale "Soutenir AFROBACK")

### 3. Liste des causes

- Carte par cause : visuel (portrait du héros concerné si applicable, ou visuel générique pour une cause transverse comme les langues), titre, description courte (1-2 lignes), jauge de progression si un objectif chiffré existe, sinon simple compteur "X FCFA collectés"
- Filtre simple : Histoires & Héros / Langues / Plateforme

### 4. Détail d'une cause

- Visuel large en tête (portrait du héros, ou illustration pour une cause transverse)
- Titre, description longue : pourquoi ce financement est nécessaire, ce qu'il permet concrètement (ex. "Ce don finance l'enregistrement studio de la narration audio en français et en anglais de l'histoire d'Ernest Ouandié")
- Jauge de progression (montant collecté / objectif) si un objectif existe, sinon compteur simple sans barre
- Liste des derniers donateurs (prénom ou pseudo, montant optionnel, respect du choix d'anonymat fait à l'écran 5) — état vide honnête si personne n'a encore donné pour cette cause ("Sois le premier à soutenir cette histoire")
- CTA "Faire un don pour cette cause"

### 5. Écran de don (montant)

- Montants prédéfinis en gros boutons (ex. 500 / 1 000 / 2 000 / 5 000 FCFA) + champ montant libre
- Choix du type : don ponctuel (par défaut) ou don récurrent mensuel (bascule visuelle claire du montant en "/mois")
- Choix "Faire un don anonyme" (case à cocher) vs afficher mon prénom/pseudo dans la liste des donateurs
- Rappel discret de la cause choisie en tête d'écran (visuel + titre), pour ne jamais perdre le fil du don en cours

### 6. Choix du mode de paiement

- Mobile Money en premier (Orange Money, MTN MoMo), carte bancaire en option secondaire — même pattern visuel que le tunnel de paiement Marketplace
- Écran sobre et rassurant, moins d'ornementation décorative que les écrans de contenu

### 7. Récapitulatif avant validation

- Cause, montant, type (ponctuel/récurrent), mode de paiement, statut anonyme ou non — tout visible avant de valider, pas de paiement en un clic sans récap

### 8. Confirmation / remerciement

- Message de remerciement chaleureux et personnalisé selon la cause soutenue (ex. "Merci, tu viens d'aider à donner une voix à Sultan Njoya")
- Rappel du montant et de la cause
- CTA secondaires : partager sur les réseaux sociaux, découvrir une autre cause, retour à l'accueil

### 9. État d'erreur

- Paiement refusé / échoué, avec message clair et bouton "Réessayer" — cohérent avec les états d'erreur du checkout Marketplace

### 10. Mes dons (dans le Profil)

- Historique des dons effectués : cause, montant, date, statut (ponctuel/récurrent actif)
- Montant total donné depuis la création du compte
- Badge simple "Soutien AFROBACK" affiché sur le profil communauté après un premier don (cohérent avec le pseudonymat déjà en place côté Communauté — le badge n'expose jamais le montant donné publiquement)
- Action "Gérer mes dons récurrents" (modifier le montant, mettre en pause, annuler)

### 11. Reçu de don

- Écran récapitulatif simple et partageable après un don (cause, montant, date) — **pas présenté comme une attestation fiscale déductible** tant que le statut juridique d'AFROBACK (association, entreprise) n'est pas tranché (voir notes)

---

## Côté transparence (léger, pas un back-office complet)

### 12. Widget "compteur global"

- Composant réutilisable pour la page mission / l'accueil : montant total collecté, nombre de donateurs, nombre de causes financées à 100 % — même composant que celui du Hub Don (écran 2), pensé pour être intégré ailleurs dans le produit

### 13. Suivi des causes (vue simplifiée, pas un vrai back-office)

- Écran (accessible seulement à l'administrateur AFROBACK, pas au grand public) listant chaque cause avec son montant collecté, son objectif, son statut (active / atteinte / clôturée)
- Volontairement minimal : ce n'est pas le back-office d'administration complet évoqué ailleurs dans le projet (non scopé à ce jour), juste de quoi savoir où en est chaque cause pour la tenir à jour honnêtement

---

## Composants transverses spécifiques à ce module

- Carte de cause (avec variante "objectif atteint" et variante "sans objectif chiffré")
- Jauge de progression (montant collecté / objectif)
- Sélecteur de montant (boutons prédéfinis + champ libre), réutilisé identique sur mobile et web
- Badge "Soutien AFROBACK" (profil Communauté)
- Bandeau CTA "Soutenir cette histoire", réutilisable sur la fiche héros et l'écran "bientôt disponible" des langues
- Compteur global (montant total / donateurs / causes financées)
- Modales de confirmation (validation du don, mise en pause d'un don récurrent)
- États vides, de chargement et d'erreur, cohérents avec les composants transverses du script produit complet

## Exigences transversales

- Chaque écran en variante web (colonnes, jauges plus larges) et mobile (écrans empilés, boutons de montant en grille 2×2)
- Paiement toujours traité sur des écrans sobres et rassurants, cohérence avec le tunnel de paiement Marketplace
- Le don ne doit jamais donner l'impression d'un paiement déjà réussi tant qu'il ne l'est pas réellement (même principe que "jamais un faux succès de paiement" déjà retenu pour le Marketplace)
- Contenu d'exemple incarné (vrais héros, vrais besoins de production) plutôt que du texte générique

---

## Notes pour Yannick (pas à inclure dans le prompt Claude Design)

- **Ce module n'est pas dans le modèle économique déjà validé** (abonnement + marketplace + sponsors, décision du 2026-07-30). Ce script propose un 4ᵉ levier construit sur un vrai besoin réel du produit (financer la narration/vidéo des 6 héros sans média), mais c'est une hypothèse de ma part, pas une décision actée — à valider avant tout développement réel.
- **Statut juridique non tranché** : AFROBACK n'est aujourd'hui ni une association ni une structure habilitée à délivrer un reçu fiscal déductible. J'ai volontairement nommé l'écran 11 "reçu de don" (récapitulatif) et non "attestation fiscale" pour ne rien promettre de faux — à trancher si tu veux un jour proposer une déductibilité, ce qui suppose une structure légale dédiée (association loi 1901 équivalent camerounais, fondation, etc.).
- **Dons récurrents en Mobile Money** : contrairement à une carte bancaire, un prélèvement mensuel automatique via Orange Money/MTN MoMo n'est pas toujours natif selon l'agrégateur retenu (CamPay ou autre, jamais choisi à ce jour pour le Marketplace non plus). Je maintiens l'option "don récurrent" dans la maquette parce que c'est un vrai besoin de fidélisation, mais sa faisabilité technique réelle dépendra de l'agrégateur Mobile Money finalement choisi.
- **Aucun montant d'objectif par cause n'est défini** : les jauges de progression de ce script sont une hypothèse visuelle. Les vrais objectifs chiffrés (combien coûte réellement une narration audio, un tournage vidéo) restent à établir avant que ces écrans affichent des chiffres réels.
- **Qui gère l'argent collecté** : aucune politique définie sur le compte qui reçoit les fonds, la fréquence de reversement vers les besoins identifiés (studio d'enregistrement, tournage), ni la traçabilité vis-à-vis des donateurs. C'est une vraie question business/juridique, pas seulement un sujet de design.
- Une fois le rendu obtenu, dis-le-moi : je le récupère et je le range dans `livrables/sites-web/afroback/`, à côté des autres prompts.
