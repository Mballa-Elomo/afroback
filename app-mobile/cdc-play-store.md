# AFROBACK — Publication sur Google Play : suppression de compte et version Play Store

> Cahier des charges rédigé le 2026-10-08 à la demande de Yannick (« j'aimerais envoyer AFROBACK sur le Play Store »). App créée dans la Play Console du compte personnel « dy_Dice » (compte d'un ami, Yannick invité), identifiant `com.afroback.mobile`. Option A validée par Yannick : pas d'achat d'abonnement dans la version Play Store.

## 1. Pourquoi ce chantier

Deux exigences de Google Play bloquent la publication :

1. **Suppression de compte obligatoire.** Toute app où l'on crée un compte doit permettre de le supprimer depuis l'app ET depuis une page web (adresse demandée dans le formulaire « Sécurité des données »). AFROBACK ne le permettait pas.
2. **Règles de paiement.** Un contenu numérique (abonnements Racines et Héritage) vendu dans une app Android doit passer par le système de paiement de Google. Le Cameroun ne fait pas partie des pays où un autre moyen est autorisé. Les dons au développeur sont aussi interdits hors système Google, sauf pour une association caritative enregistrée. Les objets physiques (Marché) peuvent être payés en Mobile Money.

## 2. Lot 1 : suppression de compte

### Parcours
- **App** : Profil → Sécurité → « Supprimer mon compte ». Écran d'explication (ce qui est supprimé, ce qui est conservé, abonnement en cours perdu), saisie du mot de passe, puis confirmation finale. Après suppression : déconnexion et retour à l'écran d'accueil.
- **Web** : page publique `https://afroback-web.vercel.app/supprimer-mon-compte` (adresse à donner à Google). Elle explique la démarche ; si la personne est connectée, elle peut supprimer son compte directement (même confirmation par mot de passe), sinon un bouton l'envoie se connecter.

### Ce qui est supprimé
Compte (email, téléphone, mot de passe, vérification en 2 étapes), profil Communauté avec ses posts, commentaires et « j'aime », profils enfants et leur progression, boutique, produits et avis du Marché, commandes, abonnement, progression des quiz, appareils de confiance, photos envoyées (stockage `user-uploads`).

### Ce qui est conservé (anonymisé)
- **Les paiements** (table `paiements`) : montant, date, statut, référence. Le lien vers le compte est effacé ; plus rien ne permet de retrouver la personne. Raison : obligation de conserver les pièces comptables.
- **Le journal de sécurité** (`security_events`) : un événement « compte supprimé » sans email ni téléphone.

### Sécurité
- La suppression passe par une fonction serveur (`delete_my_account`) qui ne peut supprimer **que le compte connecté**.
- Mot de passe revérifié juste avant (une session laissée ouverte sur un téléphone prêté ne suffit pas).
- Irréversible, annoncé clairement à l'utilisateur.

### Limite honnête
Les commandes du Marché sont supprimées avec le compte, y compris côté vendeur. À revoir si le Marché prend de l'ampleur (conserver une trace anonymisée pour le vendeur).

## 3. Lot 2 : version Play Store (« consommation seule »)

Activée uniquement dans la version compilée pour Google Play (variable `EXPO_PUBLIC_DISTRIBUTION=play`). Expo Go, l'app web et le site ne changent pas.

| Élément | Version Play Store |
|---|---|
| Choix du forfait à l'inscription | Sauté : compte Découverte (gratuit) directement |
| Écran Abonnements | Montre le forfait actuel, sa date de fin et la résiliation. Plus de prix, plus de bouton de paiement |
| Fenêtre « Réservé aux abonnés » | Explique que le contenu est réservé aux abonnés, sans bouton d'achat |
| Bandeau « Débloque tous les récits », bandeau de renouvellement | Masqués |
| Dons (accueil, profil) | Masqués |
| Contenu débloqué | Inchangé : un compte abonné via le site retrouve tout son contenu dans l'app |
| Marché (objets physiques) | Inchangé, Mobile Money conservé |

**Aucune mention du site pour s'abonner** dans l'app (Google l'autorise seulement si rien ne s'achète dans l'app, or le Marché s'y achète).

**Conséquence assumée** : dans la version Play Store, on s'abonne sur le site web uniquement. Communication du site hors de l'app (réseaux sociaux, WhatsApp, emails) : autorisée par Google.

## 4. Décisions

| # | Question | Choix appliqué |
|---|---|---|
| D1 | Abonnements dans l'app Android | Option A validée par Yannick : pas d'achat dans l'app, abonnement sur le site |
| D2 | Paiements à la suppression du compte | Conservés anonymisés (comptabilité) |
| D3 | Dons dans la version Play Store | Masqués (interdits hors système Google pour une structure non caritative) |

## 5. À faire par Yannick
1. Exécuter `supabase/schema-suppression-compte.sql` dans le SQL Editor Supabase.
2. Donner l'adresse `https://afroback-web.vercel.app/supprimer-mon-compte` dans Play Console (Contenu de l'application → Sécurité des données → suppression du compte).

## 6. Critères d'acceptation
- [ ] Un compte de test supprimé depuis l'app disparaît de Supabase (Authentication), ses posts et son profil aussi ; ses paiements restent, sans lien au compte.
- [ ] Même chose depuis la page web.
- [ ] Mauvais mot de passe : rien n'est supprimé.
- [ ] Version Play Store : aucun prix ni bouton de paiement d'abonnement, aucun don ; le Marché fonctionne ; un compte abonné voit tout le contenu.
- [ ] Expo Go, app web, site : paiements inchangés.

## Sources
- [Google Play : exigences de suppression de compte](https://support.google.com/googleplay/android-developer/answer/13327111)
- [Google Play : règles de paiement](https://support.google.com/googleplay/android-developer/answer/10281818)

## 7. État d'implémentation (2026-10-08)

| Élément | État |
|---|---|
| SQL `schema-suppression-compte.sql` | Écrit, **à exécuter par Yannick** (sans lui, la suppression affiche une erreur propre) |
| App : écran Profil → Sécurité → Supprimer mon compte (`app/profil/supprimer-compte.tsx`, `deleteAccount` dans `AuthProvider`) | Fait, typage OK |
| Site : page publique `/supprimer-mon-compte` + tuile dans « Mon compte » | **En ligne**, vérifiée (affichage invité) |
| Version Play Store (`src/payments/storePolicy.ts`, `EXPO_PUBLIC_DISTRIBUTION=play` dans le profil `production` d'eas.json, format AAB) | Fait. Testé par export web : dons absents en mode Play Store, présents en version normale ; Marché présent dans les deux |
| App web de test | Republiée en version normale (paiements inchangés) |

**Pièges notés** :
- Expo garde la variable en cache entre deux exports : toujours `--clear` après un export en mode Play Store.
- Avant tout `eas update` sur le canal `production`, créer la variable `EXPO_PUBLIC_DISTRIBUTION=play` dans l'environnement `production` d'EAS ; sinon une mise à jour à distance réactiverait les paiements dans l'app Play Store.

**Non testé en réel** : une vraie suppression de compte (nécessite le SQL), la version Play Store sur un téléphone (nécessite le build).

### Suite du 2026-10-08
- **Builds de production** : versionCode 3 (premier essai, gardé en réserve) puis versionCode 4, sans les permissions micro et « affichage par-dessus les autres apps » (`app.json` : `blockedPermissions`, plugin `expo-audio` sans enregistrement) et avec les textes juridiques à jour. **Remplacé par le versionCode 5** (voir ci-dessous).
- **`.easignore`** complété (cache `.expo/`, `dist/`, site, marketing, candidatures…) : l'archive envoyée à EAS passe de 272 à 139 Mo, et l'erreur d'envoi sur `.expo/web/cache` disparaît.
- **Politique de confidentialité publiée sur le site** (elle ne l'était pas : page « bientôt disponible ») : https://afroback-web.vercel.app/legal/confidentialite, mêmes textes que l'app (`site-web/web/src/lib/legal-documents.ts`, copie à garder identique). Textes mis à jour : paiement Mobile Money via Campay, suppression de compte en libre-service, identifiant d'appareil, Campay cité comme prestataire. `LEGAL_VERSION = provisoire-2026-10-08`.
- **Compte de démonstration pour l'examen Google** : `supabase/schema-compte-revue-store.sql` (liste de comptes dispensés de la vérification d'appareil et de la règle « un appareil à la fois », modifiable seulement depuis le dashboard). Côté serveur uniquement : fonctionne avec les builds déjà faits.
- **Fiche Play Store et réponses aux formulaires** : `marketing/play-store/fiche-play-store.md`, visuels dans le même dossier.
- **versionCode 5** : l'inspection du fichier du versionCode 4 a montré d'autres permissions à risque chez Google : galerie photo (`READ_MEDIA_IMAGES`, stockage), caméra, lecture en arrière-plan (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`, qui impose un formulaire avec vidéo). Toutes retirées (`blockedPermissions`, `expo-video` sans lecture en arrière-plan ni image dans l'image, `expo-image-picker` sans caméra ni micro). Sur Android, le choix de photo passe par le sélecteur du système, sans permission (`src/data/uploadImage.ts`). **Le fichier à envoyer est le versionCode 5.**
- **À tester sur un vrai téléphone Android** : choisir une photo (avatar, publication) fonctionne sans demande de permission.

