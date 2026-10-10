# AFROBACK — Back-office : module Paramètres (spécification complète)

> Rédigé le 2026-10-10 à la demande de Yannick : « développe complètement le module Paramètres : on doit paramétrer toute l'application (moyens de paiement, sécurité, double authentification, blocage de la capture…). Le back-office doit être ergonomique et moderne. »
> Remplace et complète la V1 du même jour (`cdc-parametres-administration.md`), déjà en ligne : la table `app_settings` et les réglages V1 sont conservés, rien n'est cassé.

---

## 1. Objectifs

1. **Tout piloter sans développeur ni nouvelle version** : modules, paiements, sécurité, accès, maintenance.
2. **Chaque interrupteur a un effet réel**, vérifié dans le code. Aucun réglage décoratif.
3. **Sécurité appliquée côté serveur** chaque fois que c'est possible (paiements, connexion, appareils). Quand une règle ne peut l'être qu'à l'écran, c'est écrit noir sur blanc (§ 6).
4. **Une interface moderne et ergonomique**, pensée pour un administrateur non technique : on comprend l'effet de chaque réglage avant de cliquer, on ne peut pas casser l'app par erreur.

---

## 2. Catalogue des réglages

Légende « Appliqué » : **Serveur** = vérifié par la base ou la fonction de paiement (impossible à contourner) · **App/Site** = appliqué par l'interface.

### 2.1 Général
| Réglage | Défaut | Effet | Appliqué |
|---|---|---|---|
| Mode maintenance | Non | Le site et l'app affichent un message plein écran à la place du contenu. Le back-office reste accessible | App/Site |
| Message de maintenance | (vide) | Texte affiché pendant la maintenance (obligatoire si maintenance activée) | App/Site |
| Inscriptions ouvertes | Oui | Fermées : plus de création de compte, les comptes existants se connectent normalement | App/Site |
| Exploration sans compte (mode invité) | Oui | Affiche ou masque « Explorer sans compte » dans l'app | App |

### 2.2 Modules (fonctionnalités)
| Réglage | Défaut | Effet |
|---|---|---|
| Communauté | Oui | Onglet, menu et pages Communauté ; coupé : remplacés par « Module momentanément indisponible » |
| Marché | Oui | Onglet, menu, raccourcis et pages Marché |
| Espace enfant & École des Héros | Oui | Sélecteur « Qui regarde ? », Espace Parent, École ; coupé : tout le monde arrive sur l'accueil adulte |
| Quiz de fin de contenu | Oui | Tuiles et pages Quiz |
| Commentaires | Oui | Zones de commentaires sous les contenus |

Appliqué : App/Site (les données restent protégées par les règles d'accès existantes ; couper un module le retire de la vue, il ne supprime rien).

### 2.3 Paiements
| Réglage | Défaut | Effet | Appliqué |
|---|---|---|---|
| Paiements activés (interrupteur général) | Oui | Coupe tous les paiements Mobile Money | Serveur + App/Site |
| MTN Mobile Money · Orange Money | Oui · Oui | Opérateurs acceptés | Serveur + App/Site |
| Abonnements payants sur le site · dans l'app | Oui · Oui | Où l'on peut acheter un forfait | Serveur + App/Site |
| Dons | Oui | Bouton « Soutenir » et paiement des dons | Serveur + App/Site |
| Prix mensuel Racines · Héritage | 1 500 · 3 000 FCFA | Prix affichés **et** demandés (calculés par le serveur) | Serveur |
| Réduction de l'abonnement annuel | 17 % | Prix annuel = mensuel × 12 × (1 − réduction) | Serveur |

**Garde-fou permanent** : la version Google Play n'achète jamais d'abonnement ni de don (règle Google), quoi qu'indiquent les Paramètres.
**Hors périmètre** : le mode démo/réel de Campay et sa clé restent des secrets serveur (Supabase → Edge Functions → Secrets), jamais affichés dans une page web.

### 2.4 Sécurité
**Vérification en 2 étapes (codes Google Authenticator / Authy)**
| Réglage | Défaut | Effet | Appliqué |
|---|---|---|---|
| Disponible | Oui | Coupé : l'option disparaît du profil et de l'inscription. Les comptes qui l'ont déjà activée continuent de devoir saisir leur code (on ne retire jamais une protection en silence) | App/Site |
| Proposée à l'inscription | Oui | Écran « Protège ton compte » après l'inscription | App |
| Obligatoire pour tous | Non | Tout compte sans vérification en 2 étapes doit l'activer avant d'accéder au contenu (app et site) | App/Site |

**Appareils et sessions**
| Réglage | Défaut | Effet | Appliqué |
|---|---|---|---|
| Vérification des nouveaux appareils | Oui | Code par e-mail à la connexion depuis un appareil inconnu | Serveur |
| Un seul appareil connecté à la fois | Oui | Un téléphone + un navigateur ; une nouvelle connexion déconnecte l'ancienne | Serveur |
| Durée de confiance d'un appareil | 90 jours | Au-delà, l'appareil doit être revérifié | Serveur |
| E-mail d'alerte à chaque nouvelle connexion | Oui | Prévient le titulaire du compte | Serveur |

**Connexion (anti-intrusion)**
| Réglage | Défaut | Bornes |
|---|---|---|
| Blocage après N mots de passe faux | 5 | 3 à 20 |
| … sur une durée de | 10 min | 1 à 120 |
| Durée du blocage | 15 min | 1 à 1 440 |
Appliqué : Serveur.

**Protection du contenu**
| Réglage | Défaut | Effet | Appliqué |
|---|---|---|---|
| Anti-capture dans l'app | Oui | Captures et enregistrements bloqués (Android, iOS 13+) | App (système du téléphone) |
| Anti-copie sur le web | Oui | Sélection, copier, clic droit, impression bloqués | Site/App web |
| Voile « Contenu protégé » | Oui | Page floutée quand la fenêtre perd le focus | Site/App web |

### 2.5 Journal
- **Activité d'administration** : qui a changé quoi et quand (déjà alimenté depuis le lot 1), avec recherche.
- **Événements de sécurité** : connexions échouées, comptes bloqués, comptes supprimés (table `security_events`), 100 derniers, filtrables par type.

---

## 3. Interface (ergonomie et design)

### 3.1 Structure
- **Barre latérale du module** (à gauche, fixe) : Vue d'ensemble · Général · Modules · Paiements · Sécurité · Journal, chacune avec une icône et un compteur de points d'attention.
- **Recherche** en haut : taper « capture » ou « orange » amène directement au bon réglage.
- **Vue d'ensemble** : tableau de bord en tuiles (état des paiements, maintenance, modules actifs, niveau de sécurité, dernière modification), avec les alertes importantes (maintenance active, paiements coupés, vérification d'appareil désactivée…).
- **Pages de section** : réglages regroupés en cartes thématiques ; chaque ligne = libellé clair, une phrase d'explication, un badge « Serveur » ou « App/Site », et le contrôle à droite.

### 3.2 Comportement
- **Interrupteurs** modernes (pas de cases à cocher), champs numériques avec unité, zone de texte avec compteur de caractères.
- **Barre d'enregistrement collante** en bas dès qu'un réglage change : « N modifications non enregistrées · Annuler · Enregistrer ». Rien n'est enregistré sans clic.
- **Confirmation obligatoire** pour les changements sensibles, avec l'explication de l'impact : couper les paiements, activer la maintenance, désactiver la vérification d'appareil ou l'appareil unique, rendre la vérification en 2 étapes obligatoire, couper l'anti-capture, modifier un prix.
- **Réinitialiser la section** aux valeurs par défaut (avec confirmation).
- **Valeur modifiée** signalée par un point doré tant qu'elle n'est pas enregistrée ; « modifié par rapport au défaut » indiqué discrètement.
- Messages de succès/erreur en notification (toast) ; erreurs de saisie affichées sous le champ.
- **Accessibilité** : contrôles au clavier, focus visible, interrupteurs annoncés comme tels (`role="switch"`), contrastes du thème sombre AFROBACK.
- Fonctionne sur écran d'ordinateur et de tablette (la barre latérale passe au-dessus en dessous de 900 px).

### 3.3 Identité visuelle
Thème sombre AFROBACK existant (noir brun, or, terracotta), typographie Cinzel pour les titres, Manrope pour le texte. Cartes avec bordure fine dorée, coins arrondis 18 px, survol et focus animés (150 ms). La refonte complète des autres écrans du back-office suivra le même système (voir § 8).

---

## 4. Architecture technique

- **Table `app_settings`** (V1, conservée) : une ligne JSON par section. Écriture **uniquement** par le serveur du back-office (clé service), après contrôle des bornes, avec journalisation de chaque changement (avant → après).
- **`_parametres()`** (serveur) : valeurs effectives = défauts + valeurs enregistrées, section par section.
- **`parametres_publics()`** : sous-ensemble lisible par le site et l'app (jamais les règles internes de sécurité).
- **Fonctions serveur pilotées** : `record_login_attempt` (anti-intrusion), `_appareil_de_confiance` (durée de confiance), `ouvrir_session_appareil`, `etat_appareil` et leurs versions web (vérification, appareil unique, alerte), fonction de paiement `campay` (activation, opérateurs, prix, dons).
- **Site et app** : lecture au démarrage et au retour sur l'app/l'onglet. Si la lecture échoue : valeurs par défaut (= comportement d'avant).
- **Back-office** : page `/parametres?section=…`, composants client pour l'édition, actions serveur protégées par `requireAdmin()`.

---

## 5. Décisions

| # | Question | Choix appliqué |
|---|---|---|
| D1 | Couper la 2FA retire-t-elle la protection aux comptes qui l'ont ? | Non : elle n'est plus proposée, mais les comptes protégés le restent |
| D2 | 2FA obligatoire : quand ? | À la prochaine ouverture de l'app ou du site, avant tout contenu ; l'inscription en cours la rend non contournable |
| D3 | Couper un module supprime-t-il des données ? | Non, il le masque seulement |
| D4 | Prix modifiables | Oui, entre 100 et 100 000 FCFA, avec confirmation |
| D5 | Secrets (clé Campay, SMTP) | Jamais dans le back-office |
| D6 | Version Google Play | Toujours sans achat, non modifiable |

---

## 6. Limites honnêtes
- Les **modules**, la **2FA obligatoire**, l'**anti-capture** et les **protections web** sont appliqués par l'interface : un développeur qui appellerait directement l'API garde l'accès aux données déjà autorisées par les règles d'accès (qui, elles, ne changent pas).
- Les changements atteignent l'app **à la prochaine ouverture ou au retour sur l'app**, pas à la seconde près.
- Expo Go et la version Play Store reçoivent le nouveau code à la prochaine mise à jour / au prochain build.

## 7. Critères d'acceptation
- [ ] Chaque réglage modifié dans le back-office change réellement le comportement du site et/ou de l'app (test manuel réglage par réglage).
- [ ] Rien n'est enregistré sans clic sur « Enregistrer » ; les changements sensibles demandent une confirmation.
- [ ] Le journal montre chaque changement (avant → après, auteur, date).
- [ ] Valeurs par défaut = comportement actuel.
- [ ] Un utilisateur non administrateur ne peut ni lire la table ni modifier un réglage (vérifié via l'API).

## 8. Suite proposée
Appliquer le même système visuel au reste du back-office (tableau de bord, menu, listes), puis construire les écrans manquants : Utilisateurs → Dons → Marketplace → Communauté → Sponsors.

## 9. À faire par Yannick
1. Exécuter `app-mobile/mobile-app/supabase/schema-parametres-v2.sql`.
2. Redéployer la fonction `campay` si ce n'est pas déjà fait.

## 10. État d'implémentation (2026-10-10)

| Élément | État |
|---|---|
| SQL `schema-parametres-v2.sql` (nouvelles sections, durée de confiance, alerte, lecture publique étendue) | Écrit, **à exécuter par Yannick** |
| Back-office : module refait (vue d'ensemble, 4 sections, recherche, barre d'enregistrement, confirmations, réinitialisation, journal administration + sécurité) | **En ligne** ; rendu vérifié en local (captures), aucune erreur |
| App : modules (onglets, raccourcis, pages, quiz, commentaires, espace enfant), mode invité, 2FA disponible / proposée / obligatoire | Fait ; app web **en ligne**, Expo Go / Play Store à la prochaine mise à jour |
| Site : modules (menu, pages, quiz, commentaires, espace enfant), 2FA obligatoire (redirection vers « Sécurité ») | **En ligne** |
| Tests | Typage des 3 projets, `expo-doctor` 18/18, build site et back-office, app web testée en local avec les valeurs par défaut (comportement inchangé) |

**Non testé en réel** : l'effet de chaque réglage une fois modifié (nécessite le SQL V2 puis un test réglage par réglage, § 7).
