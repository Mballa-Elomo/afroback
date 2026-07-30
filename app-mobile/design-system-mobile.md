# Charte / design system mobile — AFROBACK

> Document Phase 0, rédigé par le chef de projet AFROBACK le 2026-07-29. Destiné au pôle dev de Madou Consulting pour le développement React Native. Dérive de l'identité de marque déjà validée du site web (`livrables/sites-web/afroback/site/index.html`, `livrables/sites-web/afroback/prompt-claude-design.md`), adaptée aux contraintes et idiomes mobiles. **N'a pas pu être vérifié contre le prototype exact `AFROBACK Mobile.dc.html`** (outil DesignSync indisponible dans les sessions ayant produit ce document) : ce qui suit reconstruit une charte cohérente avec la marque et l'inventaire d'écrans déjà constaté, ce n'est pas une extraction pixel-perfect du prototype Claude Design. À vérifier/ajuster dès qu'une session avec accès à DesignSync peut comparer.

---

## 1. Fondations visuelles (héritées du site web, à conserver telles quelles)

### Couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Fond principal | `#0F0B08` (noir profond/charbon) | Fond d'écran par défaut, app en dark mode natif (pas de mode clair prévu, cohérent avec l'immersion voulue) |
| Texte principal | `#E8DCC6` / `#F3E4C4` (ivoire chaud) | Texte courant sur fond sombre |
| Accent or — clair | `#F0C36B` | Highlights, icônes actives, liens |
| Accent or — dégradé CTA | `#F7D98C → #E0A94E → #C07C34` | Boutons principaux, CTA |
| Accent bronze foncé | `#8B5A2B` | Dégradés, ombres dorées |
| Terracotta | `#A0522D`, `#8B3A2F` | Accents secondaires, badges thématiques (ex. tag "Résistance") |
| Texte atténué / kicker | `#C98A5E`, `#B7A585` | Labels, métadonnées, texte secondaire |
| Rehauts vifs (rouge, bleu, jaune safran) | à utiliser avec parcimonie | Détails ponctuels inspirés des textiles africains, jamais en masse — proscrit sur les CTA principaux pour ne pas diluer l'or comme couleur d'action |

Contraste : texte principal sur fond `#0F0B08` largement conforme WCAG AA. Vérifier systématiquement le contraste des textes secondaires (`#C98A5E` sur noir ≈ 5.2:1, correct pour texte ≥ 14px, à éviter en dessous de 12px).

### Typographie

- **Titres / display** : `Cinzel` (serif gravé, évoque l'héritage). Utilisé pour : nom du héros en fiche, titres de section, tab bar labels actifs si besoin d'emphase.
- **Texte courant** : `Barlow` (sans-serif lisible). Utilisé pour : corps de récit, descriptions, boutons, labels UI.
- Échelle suggérée (mobile, base 16px) : H1 28-32px (Cinzel), H2 22-24px (Cinzel), body 15-16px (Barlow), caption/label 12-13px (Barlow, letter-spacing large comme sur le site).
- Le récit du griot est un texte long (plusieurs milliers de mots) : prévoir un mode lecture confortable — interligne 1.5-1.6, largeur de colonne contrainte, option taille de texte (accessibilité), fond légèrement moins contrasté que le noir pur pour limiter la fatigue en lecture longue si besoin (à tester).

### Logo et identité

- Logo : silhouette femme africaine + carte du continent + motifs tribaux, halo doré, fond noir (`context/import/afroback logo.png`).
- Motifs bogolan/kente/wax en filigrane : utilisables comme séparateurs de section ou fonds de carte discrets, jamais comme décor plaqué. Sur mobile, à réserver aux écrans à fort impact émotionnel (splash, fiche héros) plutôt qu'à l'UI utilitaire (listes, formulaires) pour ne pas nuire à la lisibilité sur petit écran.

---

## 2. Adaptation aux idiomes mobiles natifs

Le site web est immersif (parallaxe, 3D, animations riches). Sur l'app mobile native, ces effets doivent être **réinterprétés, pas copiés à l'identique** :

- Parallaxe/3D lourds : à éviter en usage général (coût batterie/perf sur devices d'entrée de gamme, courants sur le marché camerounais visé). Réserver un effet signature (ex. légère profondeur/particules dorées) au splash/onboarding uniquement, avec repli statique si l'appareil est faible ou si l'utilisateur a activé "réduire les animations" (respecter le réglage système iOS/Android).
- Cartes (catalogue héros) : composant `HeroCard` réutilisable — image/illustration (à produire, cf. modèle de données `image_carte_catalogue`), nom (Cinzel), sous-titre court (Barlow), badge thème (terracotta), indicateur statut média (icône audio/vidéo disponible ou "bientôt").
- Navigation : tab bar basse (cohérent avec l'inventaire du prototype "AFROBACK Mobile" qui prévoit une tab bar adulte et une tab bar enfant séparées) — fond `#0F0B08`, icône/label actif en or `#F0C36B`, inactif en `#B7A585`.
- Boutons : primaire = dégradé or (`#F7D98C → #E0A94E → #C07C34`), texte `#160f08` (quasi-noir) pour le contraste, coins arrondis ~11px comme sur le site. Secondaire = contour or fin, fond transparent.
- États de chargement/vide : à concevoir dans le même esprit chaleureux (pas de spinner générique gris) — micro-interaction dorée simple, message éditorial plutôt que technique (ex. "Le récit se prépare..." plutôt que "Loading...").

---

## 3. Composants prioritaires pour la Phase 1 (Histoires & Héros)

1. **`HeroCard`** (carte catalogue) — voir ci-dessus.
2. **`HeroBadgeTheme`** — badge thème (Résistance / Politique / Art / Science...), couleur terracotta, texte court.
3. **`HeroHeader`** (fiche héros) — nom, sous-titre, époque, région, éventuel bandeau `avertissement_lecture` (cf. cas Charles Atangana dans le modèle de données) en évidence avant le récit, pas noyé dans le texte.
4. **`TimelineList`** — frise chronologique, liste verticale d'événements datés (source : champ `frise_chronologique`).
5. **`LegendBadge` / `FactVsLegendCallout`** — composant obligatoire pour signaler visuellement qu'un passage relève de la légende/tradition orale et non du fait attesté (reprend la logique déjà actée par l'agent griot : ne jamais présenter une légende comme un fait). Doit être visuellement distinct (ex. bordure pointillée, icône dédiée) et cohérent sur toute l'app.
6. **`AudioPlayerBar`** — lecteur audio de la narration (mini-player persistant + plein écran), avec état "pas encore disponible" géré proprement (cf. `statut_narration_audio = a_produire` pour les 9 héros actuels) plutôt qu'un bouton mort.
7. **`VideoPlayerFullscreen`** — lecteur vidéo plein écran, avec le même traitement d'état "storyboard prêt, vidéo à produire" pour les 9 héros actuels.
8. **`SourcesList`** — liste des sources en fin de fiche, format sobre et discret (ce n'est pas le focus émotionnel de l'écran mais la crédibilité du produit en dépend).

---

## 4. Ce qui reste ouvert / à trancher avec le pôle dev

- Confirmation finale de la charte contre le prototype Claude Design exact (`AFROBACK Mobile.dc.html`) dès qu'une relecture complète est possible.
- Choix de la librairie de composants React Native (ex. React Native Paper, Tamagui, ou composants custom) — pas tranché ici, dépend des préférences du pôle dev.
- Stratégie d'icônes (set custom illustré vs. librairie type Phosphor/Lucide adaptée à la palette).
