# AFROBACK — Back-office : onglet Paramètres et administration globale

> Cahier des charges rédigé le 2026-10-10 à la demande de Yannick : « l'administration n'est pas complète ; les paiements, les niveaux de sécurité… doivent pouvoir être réglés depuis l'administration ». Suite de `prompt-claude-design-backoffice.md` (lot 3 jamais construit).

## 1. Constat

- Le back-office (https://afroback-backoffice.vercel.app) gère le contenu (héros, Découverte, mythes, École, médias, traduction), les commentaires et les abonnements offerts. **Six écrans prévus n'ont jamais été construits** (grisés « LOT 3 » dans le menu) : Communauté, Marketplace, Dons, Sponsors, Utilisateurs, **Paramètres**.
- Tous les réglages sont aujourd'hui **écrits en dur dans le code** : prix des forfaits (1 500 / 3 000 FCFA, -17 % à l'année, dans l'app, le site ET la fonction de paiement), opérateurs MTN/Orange, seuils anti-intrusion (5 essais / 10 min → 15 min de blocage), vérification des nouveaux appareils, anti-capture… Changer quoi que ce soit demande un développeur et une nouvelle version.
- **Paiements signalés « en panne » par Yannick** (app et site). Vérifié le 2026-10-10 : la fonction serveur `campay` répond et le code n'a pas changé. Pistes à confirmer avec Yannick :
  1. la **version Play Store** n'a volontairement aucun paiement d'abonnement ni don (règle Google, `cdc-play-store.md`) : si le test a été fait sur l'app installée depuis Google Play, c'est normal ;
  2. la fonction `campay` tourne en mode **démo** tant que le secret `CAMPAY_ENV=live` n'est pas posé dans Supabase (aucun vrai argent débité) ;
  3. un problème côté compte Campay (jeton expiré, solde, opérateur).
  → Il faut le **message d'erreur exact** affiché, et sur quelle plateforme (site, app web, Expo Go, Play Store).

## 2. Objectif de ce chantier (V1)

Un onglet **Paramètres** dans le back-office qui pilote, sans nouvelle version de l'app :

### 2.1 Paiements
| Réglage | Effet |
|---|---|
| Paiements Mobile Money activés (interrupteur général) | Coupe/rallume tous les paiements (abonnements, dons) sur le site et l'app |
| MTN Mobile Money · Orange Money | Opérateurs acceptés |
| Abonnements payants sur le site · dans l'app (hors Play Store) | Où l'on peut acheter un forfait |
| Dons | Affiche ou masque le bouton Soutenir |
| Prix mensuel Racines · Héritage (FCFA) · réduction annuelle (%) | Prix affichés ET prix réellement demandés (calculés côté serveur) |

**Garde-fou** : la version Play Store reste sans achat d'abonnement ni don, quoi qu'indiquent les Paramètres (sinon Google retire l'app).

### 2.2 Sécurité
| Réglage | Effet |
|---|---|
| Anti-capture dans l'app (iOS/Android) | Bloque captures et enregistrements d'écran |
| Protection web (anti-copie, impression bloquée) | Site et app web |
| Voile quand la fenêtre perd le focus | Site et app web |
| Vérification des nouveaux appareils | Code par e-mail à la connexion depuis un appareil inconnu |
| Un seul appareil connecté à la fois | Déconnecte l'ancien appareil |
| Blocage anti-intrusion : nombre d'essais · fenêtre (min) · durée du blocage (min) | Appliqué côté serveur |
| Proposer la vérification en 2 étapes à l'inscription | Écran « Protège ton compte » |

### 2.3 Général
| Réglage | Effet |
|---|---|
| Inscriptions ouvertes | Si fermées : la création de compte affiche un message, les comptes existants continuent |
| Mode maintenance + message | Le site et l'app affichent le message à la place du contenu (le back-office reste accessible) |

### 2.4 Journal d'activité
Les 50 dernières actions d'administration (déjà enregistrées depuis le lot 1, jamais affichées), dont chaque changement de paramètre (qui, quoi, quand).

## 3. Architecture

- **Table `app_settings`** (une seule ligne, JSON) : RLS sans policy, écriture uniquement par le serveur du back-office (clé service). Chaque modification est journalisée.
- **Lecture publique filtrée** : fonction `parametres_publics()` (site et app), qui ne renvoie que ce que les clients ont besoin de savoir.
- **Application côté serveur, pas seulement à l'écran** : seuils anti-intrusion (`check_login_lockout`), vérification d'appareil (`ouvrir_session_appareil`, `etat_appareil` et versions web), prix et activation des paiements (fonction `campay`). Une option désactivée dans les Paramètres l'est donc vraiment, même pour quelqu'un qui contournerait l'interface.
- **Valeurs par défaut = comportement actuel** : tant que le script n'est pas exécuté ou si la lecture échoue, rien ne change.

## 4. Décisions

| # | Question | Choix appliqué |
|---|---|---|
| D1 | Les prix sont-ils modifiables ? | Oui, avec contrôle (entre 100 et 100 000 FCFA, réduction 0-50 %) |
| D2 | Play Store | Toujours sans achat, non modifiable depuis les Paramètres |
| D3 | Qui peut modifier ? | Tout compte de `admin_users` (rôle unique aujourd'hui) |
| D4 | Ordre des écrans suivants du lot 3 | Proposé : Utilisateurs → Dons → Marketplace → Communauté → Sponsors (à valider) |

## 5. Fichiers
- SQL : `app-mobile/mobile-app/supabase/schema-parametres.sql`
- Back-office : `app/(admin)/parametres/` (page, formulaire, actions), `lib/navItems.ts`
- App : `src/settings/SettingsProvider.tsx` + écrans paiement, dons, anti-capture, inscription, maintenance
- Site : `src/lib/settings.tsx` + mêmes points
- Fonction de paiement : `supabase/functions/campay/index.ts` (à redéployer)

## 6. À faire par Yannick
1. Exécuter `schema-parametres.sql` dans le SQL Editor Supabase.
2. Redéployer la fonction `campay` (instructions en fin de livraison).
3. Donner le message exact de l'erreur de paiement et la plateforme concernée.

## 7. État d'implémentation (2026-10-10)

| Élément | État |
|---|---|
| SQL `schema-parametres.sql` (table, lecture publique, anti-intrusion et appareils réglables) | Écrit, **à exécuter par Yannick** |
| Back-office : onglet **Paramètres** (3 sections + journal d'activité), entrée de menu activée | **En ligne** (https://afroback-backoffice.vercel.app/parametres) |
| App : `SettingsProvider` (lecture au démarrage et au retour sur l'app), paiements/dons/opérateurs/prix, anti-capture, protections web, maintenance, inscriptions, proposition 2FA | Fait, app web **en ligne** ; Expo Go et Play Store à la prochaine mise à jour |
| Site : mêmes réglages (`src/lib/settings.tsx`) | **En ligne** |
| Fonction `campay` : prix, interrupteurs et opérateurs appliqués côté serveur | Code fait, **à redéployer** |
| Tests | Typage des 3 projets, build site et back-office, app web testée en local (aucune erreur, comportement inchangé avec les valeurs par défaut) |

Tant que le SQL n'est pas exécuté, le site et l'app gardent le comportement d'avant, et l'onglet Paramètres affiche la consigne d'installation.
