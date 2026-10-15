# AFROBACK — Sponsors (spécification)

> Rédigé le 2026-10-15 à la demande de Yannick (« go pour sponsors »).
> Décisions de Yannick : 4 formats (bannière d'accueil, « Présenté par » un contenu, page Partenaires, fin de vidéo) ; **jamais de sponsor dans l'espace enfant** ; facturation au **forfait sur une durée** (payé hors de l'app) ; mesure des **affichages et des clics**.

---

## 1. Objectifs

1. Gérer les sponsors comme des contrats : qui, combien, du quand au quand, où il apparaît.
2. Afficher automatiquement les sponsors actifs dans l'app et sur le site, et les retirer seuls à la fin du contrat.
3. Fournir à chaque sponsor un bilan chiffré (affichages, clics, taux de clic) pour justifier le renouvellement.

## 2. Formats (emplacements)

| Format | Où | Contenu affiché |
|---|---|---|
| Bannière d'accueil | Accueil de l'app et du site | Logo, accroche (FR/EN), bouton vers le site du sponsor |
| « Présenté par » | Fiche d'un héros, d'un mythe ou d'un lieu Découverte choisi | « Cette histoire vous est offerte par » + logo + lien |
| Fin de vidéo | Après la vidéo d'un contenu choisi (ou de tous) | Carte « Avec le soutien de » + logo, quelques secondes |
| Page Partenaires | Page dédiée de l'app et du site | Logo, présentation (FR/EN), lien, pour tous les sponsors actifs |

Règles d'affichage :
- un emplacement n'apparaît que si le sponsor est **actif** et que la date du jour est **dans son contrat** ;
- plusieurs bannières actives : rotation (une au hasard à chaque ouverture) ;
- **jamais** dans l'espace enfant ni l'École des Héros (le code de l'espace enfant n'appelle pas les sponsors) ;
- tout lien sortant est signalé « Sponsorisé ».

## 3. Back-office `/sponsors` (étape 1)

### 3.1 Liste
- Sponsors : logo, nom, période, montant, statut calculé (brouillon, programmé, en cours, terminé, suspendu), affichages et clics du contrat.
- Chiffres clés : sponsors en cours, montant des contrats en cours, contrats qui se terminent sous 15 jours.

### 3.2 Fiche sponsor
- Identité publique : nom, logo (envoi d'image), site web, présentation FR/EN.
- Contrat (privé, jamais envoyé à l'app) : contact (nom, e-mail, téléphone), montant en FCFA, date de début, date de fin, notes.
- Emplacements : ajouter / modifier / désactiver ; pour chacun, format, contenu ciblé (pour « Présenté par » et Fin de vidéo), accroche FR/EN.
- Statistiques : affichages et clics par jour (30 derniers jours) et par emplacement, taux de clic ; **export CSV** pour envoyer le bilan au sponsor.
- Actions : Activer, Suspendre, Supprimer (seulement un brouillon sans statistiques).

## 4. Base de données : `schema-sponsors.sql` (étape 1)

- `sponsors` : identité publique + contrat privé (lecture réservée au back-office).
- `sponsor_emplacements` : format, contenu ciblé, accroche FR/EN, actif.
- `sponsor_stats` : par emplacement et par jour, nombre d'affichages et de clics.
- `sponsors_publics()` : la seule lecture ouverte à l'app et au site ; ne renvoie que les emplacements actifs du jour, **sans** contact, montant ni notes.
- `sponsor_mesure(emplacement, type)` : enregistre un affichage ou un clic (agrégé par jour, sans donnée personnelle).

## 5. Affichage dans l'app et le site (étape 2)

- Composants : bannière d'accueil, encart « Présenté par » sur les fiches, carte de fin de vidéo, page Partenaires.
- Mesure : un affichage compté quand l'encart est réellement visible, un clic à l'ouverture du lien.
- L'app téléphone nécessite une nouvelle version pour afficher les sponsors (le site et l'app web sont mis à jour immédiatement).

## 6. Règles

- Lecture et écriture côté back-office avec la clé service_role, administrateur revérifié, journal d'activité.
- Le montant et les contacts d'un sponsor ne quittent jamais le back-office.
- Les statistiques ne contiennent aucune donnée personnelle (compteurs par jour).

## 7. Critères d'acceptation

1. Un sponsor activé avec une bannière du 1er au 31 apparaît sur l'accueil pendant cette période seulement.
2. `sponsors_publics()` ne renvoie jamais montant, contact ni notes.
3. Aucun sponsor dans l'espace enfant.
4. Le bilan exporté correspond aux affichages et clics enregistrés.

---

## 8. État d'implémentation (2026-10-15)

- Étape 1 faite et en ligne : `schema-sponsors.sql` (à exécuter par Yannick), module `/sponsors` (liste, chiffres clés, création, fiche avec présentation publique, contrat privé, logo, emplacements des 4 formats, activation avec contrôles : dates, logo et au moins un emplacement requis, bilan sur 30 jours et export CSV).
- Étape 2 (affichage dans l'app et le site, mesure des affichages et des clics) : à faire.
- Étape 2 faite (2026-10-15) : site et app web en ligne (bannière d'accueil sous la rangée « Gratuit sur AFROBACK », « Présenté par » sous les actions de la fiche, carte de fin de vidéo, page `/partenaires` liée dans le pied de page du site et le profil de l'app). Mesure des affichages et clics vérifiée en ligne. App téléphone : dans la prochaine version.
- Sponsor de test « Partenaire Test AFROBACK » (ex « Orange Cameroun (TEST) », renommé pour ne pas afficher de faux partenariat) actif pour les tests : à suspendre puis supprimer (ses statistiques de test empêchent la suppression depuis le back-office ; Jarvis peut le supprimer en base).
