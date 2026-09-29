# Cahier des charges : Onboarding et création de compte (Module 1), v3

> **Développé le 2026-09-29** (feu vert de Yannick, case "18 ans ou plus" tranchée : oui). Détail de la livraison dans `mobile-app/README.md`, section "Onboarding et création de compte".
>
> **v3 du 2026-09-29**, version finale soumise pour feu vert. Elle remplace les v1 et v2 du même jour. La référence visuelle est la maquette de Yannick (planche de 10 écrans + brief "Retour aux origines", résumé en section 10), qui **remplace** l'onboarding 3D de `AFROBACK Mobile.dc.html`. Toutes les décisions sont tranchées (section 9). **Rien n'est développé** : le code démarre au feu vert de Yannick.

---

## 1. Constat de départ (vérifié dans le code)

`mobile-app/app/onboarding/index.tsx` :
- les 3 étapes ont le même visuel ;
- pas de swipe ;
- l'intro réapparaît à chaque déconnexion ;
- "Passer" mène à la connexion au lieu d'un vrai choix ;
- "Réduire les animations" n'est pas respecté ;
- rien ne prend le relais si la 3D échoue ;
- les textes sont écrits en dur.

L'inscription (`signup.tsx`) demande prénom, pays, téléphone et mot de passe, **sans email**. Le choix de la langue (`language.tsx`) ne traduit rien.

---

## 2. Le parcours cible

```
1 Splash (2 s max)
   ↓ première fois sur cet appareil           ↓ intro déjà vue
2 Les racines ─┐                               │
3 Les histoires├─ "Passer" ──────────────┐     │
4 Écoute...   ─┘                         │     │
   ↓ "Commencer l'aventure"              │     │
5 Transition (1 s)                       │     │
   ↓                                     ↓     ↓
6 Bienvenue dans ton voyage ◄────────────┴─────┘
   ├─ "Créer mon compte"  → 7 Création → 7b Code email → 8 Je suis… → 9 Compte créé
   │                         → Protège ton compte (MFA, existant) → Choisis ton forfait (Module 4)
   │                         → 10 Bienvenue dans AfroBack → accueil de l'app
   ├─ "Se connecter"       → connexion
   └─ "Explorer sans compte" → mode invité (section 4)
```

---

## 3. Spec écran par écran

### Écran 1 : Splash
- Illustration `context/1..png` plein écran, logo doré + "Retour aux origines" en apparition progressive (fondu + léger zoom), particules dorées, fine barre dorée en bas.
- **2 s au maximum, 1,2 s au minimum** (le temps de l'animation du logo). Jamais d'attente artificielle au-delà.
- Suite : écran 2 si c'est la première fois sur cet appareil, écran 6 si l'intro a déjà été vue, l'app directement si une session est ouverte.

### Écrans 2, 3, 4 : Onboarding
| | Écran 2 | Écran 3 | Écran 4 |
|---|---|---|---|
| Illustration | `2.png` | `3.png` | `4.png` |
| Titre (2e ligne en or) | Découvre d'où / **tu viens** | Écoute les histoires / **qui traversent les générations** | Écoute. Découvre. / **Transmets.** |
| Texte | Explore les histoires, les peuples, les traditions et les savoirs qui ont façonné l'Afrique. | Mythes, légendes, personnages et récits transmis de génération en génération prennent vie dans une expérience immersive. | Héros, villages, mythes et traditions à explorer, puis à partager avec ta famille et ta communauté. |
| Bouton | Continuer | Continuer | **Commencer l'aventure** |

- Le texte de l'écran 4 est adapté (D4) : la maquette disait "Apprends. Joue." et promettait des jeux qui n'existent pas encore. **L'illustration est gardée.** À revoir quand l'École des Héros aura du contenu.
- Swipe horizontal et bouton. "Passer" en bas à gauche, qui mène à l'écran 6. Trois indicateurs, le point actif en or.
- Illustration en haut, dégradé vers le noir sous le texte pour la lisibilité. Légère parallaxe pendant le swipe, texte en fondu.

### Écran 5 : Transition
Fond noir, logo, traînée de particules dorées. Dure 1 s, sans interaction, puis fondu vers l'écran 6.

### Écran 6 : Bienvenue dans ton voyage
- Illustration `6.png`, logo en haut. Titre "Bienvenue dans / **ton voyage**", sous-titre "Crée ton compte pour commencer ton aventure."
- **Créer mon compte** (bouton or), "Déjà un compte ? **Se connecter**", et **Explorer sans compte** (lien discret, D6).
- C'est aussi l'écran d'arrivée après une déconnexion.

### Écran 7 : Création de compte (identique à la maquette, D2)
- Champs : **Prénom**, **Adresse e-mail**, **Mot de passe** (avec l'œil pour l'afficher). Case obligatoire : "J'accepte les conditions d'utilisation et la politique de confidentialité".
- Bouton **Créer mon compte**, puis "Tu as déjà un compte ? Se connecter".
- **Pas de Google ni d'Apple** (D3) : la ligne "ou continuer avec" et les deux boutons sont retirés.
- Règles : email valide, mot de passe de 8 caractères minimum. Les messages d'erreur s'affichent sous le champ concerné, en français clair ("Cet email est déjà utilisé. Se connecter ?").

### Écran 7b : Code de confirmation (Module 2)
Absent de la maquette, mais nécessaire à la confirmation d'email validée ce matin. Même style que l'écran 7 : "Vérifie ta boîte mail", 6 cases pour le code, "Renvoyer le code" (disponible après 60 s). **Son fonctionnement (envoi réel de l'email) est spécifié et développé dans le Module 2.** Dans le Module 1, seul l'écran est prêt.

### Écran 8 : Je suis… (logique existante, D1)
- **Un enfant ne crée jamais de compte, et il n'y a pas de rôle Enseignant.** L'écran garde le **style** de la maquette (cartes illustrées, bordure dorée à la sélection), mais avec le **contenu de l'écran existant `usage.tsx`** :
  - **Découvrir, apprendre et faire vivre mes racines** (toujours actif)
  - **Créer des profils pour mes enfants** (espace enfant sécurisé)
  - **Vendre mes créations sur la Marketplace**
- Plusieurs choix possibles, comme aujourd'hui. Mêmes conséquences qu'aujourd'hui sur la suite (profils enfants, espace vendeur).
- Titre adapté : "Comment vas-tu vivre AfroBack ?". Les 3 portraits manquent encore (voir section 7) : une icône dorée les remplace en attendant.

### Écran 9 : Compte créé
Cercle doré avec la coche qui se trace, halo lumineux, "Ton compte est créé !", "Bienvenue dans la grande famille AfroBack.", frise de motifs, bouton **Continuer**.

### Après l'écran 9 (écrans existants, restylés)
1. **Protège ton compte** (MFA, `mfa-proposal.tsx`) : écran existant, restylé aux couleurs de la maquette.
2. **Choisis ton forfait** (`plan.tsx` / `payment.tsx`) : restylé seulement. Le paiement réel relève du **Module 4**.
3. L'écran **Langue de l'interface** est retiré du parcours tant que l'app n'est pas traduite (c'était un faux choix). Il reviendra avec le chantier de traduction.

### Écran 10 : Bienvenue dans AfroBack !
Illustration `10.png` (porte ouverte, plusieurs générations). "Bienvenue dans / **AfroBack !**", "Ton voyage vers les origines commence maintenant.", bouton **Explorer AfroBack**, qui mène à l'accueil. Remplace `welcome.tsx`.

---

## 4. Mode invité "Explorer sans compte" (D6)

**Principe** : on découvre librement, et le compte est demandé au moment où l'on veut agir.

| Accessible sans compte | Demande un compte |
|---|---|
| Accueil, catalogue et lecture des récits des Héros | Écouter les narrations audio et regarder les vidéos |
| Découverte et Mythologie (lecture) | Publier, commenter ou signaler dans la Communauté |
| Parcourir la Marketplace | Acheter, créer une boutique |
| Lire la Communauté | Profils enfants, Espace Parent, Don, Profil |

> **Proposition à valider** : c'est un choix business. L'audio et la vidéo sont le contenu le plus coûteux à produire, et le plus incitatif pour pousser à l'inscription. Tout cela reste réglable facilement plus tard.

- Quand un invité touche une action réservée, une fenêtre en bas de l'écran s'ouvre : "Crée ton compte pour continuer", avec **Créer mon compte** et **Se connecter**. Après l'inscription, l'utilisateur revient là où il était, si c'est techniquement simple. Sinon, il arrive sur l'accueil.
- Un bandeau discret en haut de l'accueil : "Tu explores en invité · Créer mon compte".
- **Technique** : le mode invité est un état local de l'app (aucun compte créé côté serveur). Il s'appuie sur la lecture publique **déjà en place** côté Supabase pour les contenus éditoriaux. Pour la Communauté et la Marketplace, la lecture sans compte doit être vérifiée table par table avant le développement. Si une table exige un compte, elle bascule dans la colonne "Demande un compte" au lieu d'ouvrir un accès.
- **Aucune donnée n'est enregistrée pour un invité** (ni progression ni favoris) : on ne stocke rien sans compte.

---

## 5. Exigences transversales

### 5.1 Mémoire "intro déjà vue"
Un indicateur est enregistré sur l'appareil (AsyncStorage) quand l'écran 6 est atteint. Il ne contient aucune donnée personnelle.

### 5.2 Accessibilité
- "Réduire les animations" : pas de particules ni de parallaxe, fondus simples.
- Lecteur d'écran : "Étape X sur 3" + titre + texte, boutons libellés, courte description de chaque illustration.
- Contraste WCAG AA : le texte est toujours posé sur la zone assombrie.
- Zones tactiles d'au moins 48 points. "Passer" garde son apparence, mais sa zone tactile est agrandie.

### 5.3 Performance
- Les 6 illustrations sont converties en WebP (moins de 250 Ko chacune au lieu de 2,3 à 2,6 Mo). Les originaux dans `context/` ne sont pas touchés.
- Particules en animations natives légères. **three.js et expo-gl sont supprimés** (ils ne servent qu'à l'onboarding, vérifié) : l'app s'allège d'environ 1 Mo, et le risque d'une 3D jamais testée sur un vrai téléphone disparaît.
- Les 6 photos de héros de `assets/onboarding/` (inutilisées) sont retirées de l'app. Elles restent dans `AFROBACK CONTENT/Photos`.
- Illustrations préchargées pendant le splash.

### 5.4 Écrans
375 x 812, 390 x 844, 430 x 932 et tablette, avec respect des zones de sécurité. Contenu centré sur tablette et sur web (cadre de 480 px déjà en place). Les illustrations sont recadrées, jamais déformées.

### 5.5 Style (D7)
Les couleurs, boutons, champs, cartes et motifs suivent la maquette. **Les titres restent en Cinzel**, la police du reste de l'app, pour garder une app cohérente. Les deux lignes des titres (blanc + or) sont conservées.

### 5.6 Textes
Tous les textes sont regroupés dans un fichier de contenu unique, prêt pour une traduction future.

---

## 6. Spec technique

| Fichier | Action |
|---|---|
| `app/onboarding/index.tsx` | Réécrit : splash, puis carrousel ou redirection |
| `app/onboarding/transition.tsx` | Nouveau (écran 5) |
| `app/onboarding/bienvenue.tsx` | Nouveau (écran 6) |
| `app/onboarding/signup.tsx` | Refait (écran 7) : prénom, email, mot de passe |
| `app/onboarding/verification-email.tsx` | Nouveau (écran 7b), interface seule, branchée dans le Module 2 |
| `app/onboarding/usage.tsx` | Restylé (écran 8) |
| `app/onboarding/compte-cree.tsx` | Nouveau (écran 9) |
| `app/onboarding/mfa-proposal.tsx`, `plan.tsx`, `payment.tsx` | Restylés |
| `app/onboarding/welcome.tsx` | Refait (écran 10) |
| `app/onboarding/language.tsx` | Retiré du parcours (fichier conservé pour le chantier de traduction) |
| `app/onboarding/login.tsx` | Restylé. Accepte **email ou téléphone** (les comptes existants créés par téléphone doivent pouvoir continuer à se connecter) |
| `app/_layout.tsx` | Nouvelles routes, nouvel ordre, nouveau groupe "invité" |
| `src/auth/AuthProvider.tsx` | Inscription par email, état invité |
| `src/components/AccountWall.tsx` | Nouveau : fenêtre "Crée ton compte pour continuer" |
| `src/onboarding/intro/*` | Carrousel (`FlatList` en mode page), particules, contenu |
| `src/components/OnboardingScene3D.tsx`, dépendances `three` / `expo-gl` | Supprimés |
| `assets/onboarding/` | 6 illustrations WebP à la place des photos de héros |

**Aucune nouvelle dépendance.**

### Lien avec le Module 2
Le Module 1 construit l'inscription par email **côté interface** et utilise Supabase Auth en inscription email + mot de passe. Tant que le Module 2 n'a pas branché le fournisseur d'email (Resend sur ton domaine) et l'écran de code, **la confirmation d'email est désactivée côté Supabase** pour que l'inscription fonctionne en test. Elle sera activée dans le Module 2. C'est une étape volontaire et temporaire, pas un oubli.

### Vérifications avant de clôturer
1. `tsc --noEmit`, `expo-doctor`, `expo export` iOS + Android + web propres.
2. Republication du canal de test pour un essai sur **vrai téléphone**.
3. Checklist de test remise à Yannick : splash, swipe, Passer, mémoire après déconnexion, inscription email, connexion email et téléphone, mode invité et fenêtre de compte, "Réduire les animations", tailles d'écran.
4. Contrôle de fidélité à la maquette par l'agent `afroback-design-qa`.

---

## 7. Fichiers

**Reçus le 2026-09-29** (dans `context/`), vérifiés : aucun texte incrusté, style homogène.

| Fichier | Écran | Taille |
|---|---|---|
| `context/1..png` | 1 Splash | 852 x 1846 |
| `context/2.png` | 2 Les racines | 940 x 1672 |
| `context/3.png` | 3 Les histoires | 941 x 1672 |
| `context/4.png` | 4 Écoute. Découvre. | 941 x 1672 |
| `context/6.png` | 6 Bienvenue dans ton voyage | 940 x 1672 |
| `context/10.png` | 10 Bienvenue dans AfroBack | 941 x 1672 |

Définition suffisante (légèrement douce sur les grands iPhone, sans que ce soit bloquant). Format 9:16, recadré sur les côtés sur les écrans plus allongés, le sujet reste centré.

**Encore manquant, non bloquant** : 3 portraits pour l'écran 8 (une icône dorée en attendant) et le logo doré sur fond transparent (le logo actuel en attendant).

---

## 8. Hors périmètre
- Envoi réel de l'email de confirmation (Module 2).
- Mot de passe oublié (Module 3). Le lien "Mot de passe oublié ?" de la connexion garde son message "bientôt disponible" jusque-là.
- Paiement réel (Module 4).
- Traduction de l'app.

---

## 9. Décisions (toutes tranchées le 2026-09-29)

| # | Sujet | Décision de Yannick |
|---|---|---|
| D1 | Enfant / Enseignant | Un enfant ne crée jamais son compte. On garde la logique existante (adulte + profils enfants), sans compte Enseignant |
| D2 | Champs d'inscription | Identiques à la maquette : prénom, email, mot de passe |
| D3 | Google / Apple | Non, pas besoin |
| D4 | Écran 4 | Texte adapté pour ne rien promettre qui n'existe pas encore |
| D5 | Ordre après l'inscription | Validé (section 2) |
| D6 | Explorer sans compte | Ajouté (section 4) |
| D7 | Police | Cinzel gardée pour les titres |
| D8 | CGU et confidentialité | Pas d'avis de Yannick. Voir ci-dessous |

### Conséquences de D2, à connaître (pas à retrancher)
D2 remplace la liste de champs validée ce matin (nom, téléphone, date de naissance, ville). Concrètement :
- **Connexion** : les nouveaux comptes se connectent par email. Les comptes existants créés par téléphone continuent de se connecter par téléphone. L'écran de connexion accepte les deux.
- **Âge** : sans date de naissance, on ne peut plus vérifier les 18 ans. Proposition sans champ supplémentaire : la case devient "J'ai 18 ans ou plus et j'accepte les conditions d'utilisation et la politique de confidentialité". **À valider**, c'est la seule modification du texte de la maquette.
- **Téléphone** : il sera demandé au moment du paiement Mobile Money (Module 4), où il est de toute façon nécessaire.

### D8 : ma proposition
Les CGU et la politique de confidentialité **ne bloquent pas le Module 1**, qui reste en test. Elles deviennent **obligatoires avant d'ouvrir l'inscription au public**, puisqu'on collecte des emails et des données sur les enfants (loi camerounaise de 2024 sur les données personnelles). Je propose de rédiger un premier brouillon après le Module 2, à faire relire par un juriste avant le lancement. D'ici là, les liens de la case ouvrent une page "Document en cours de rédaction".

---

## 10. Brief de direction artistique fourni par Yannick (résumé)

Onboarding → création de compte pour AFROBACK, "Retour aux origines". Identité africaine premium, immersive et contemporaine : forêt tropicale d'Afrique centrale, terre rouge, bronze, bois, motifs géométriques subtils, lumière dorée. Palette : noir profond, vert forêt, bronze, terre cuite, or chaud, beige sable. Illustrations cinématographiques semi-réalistes, sans clichés ni esthétique safari, cartoon ou scolaire. Micro-interactions élégantes qui ne ralentissent jamais l'utilisateur. Mobile portrait 390 x 844 en priorité, adapté du 375 x 812 à la tablette. Objectif émotionnel : curiosité, puis émotion, puis envie d'explorer.
