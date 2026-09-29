# Cahier des charges : Vérification des nouveaux appareils et appareil unique

> Rédigé le 2026-09-29. **Code écrit le même jour** (D1 et D2 validés par Yannick ; D3 remplacé par deux règles : confiance expirée après 90 jours sans utilisation, et retirée à tous les autres appareils quand le mot de passe change). Vérifié (typage, `expo-doctor` 18/18, export web/iOS/Android) et publié sur le lien de test. **Actif seulement après exécution de `supabase/schema-appareil-unique.sql`** ; d'ici là l'app se comporte comme avant (vérifié). Non testé en réel : demande deux appareils et un vrai compte.
>
> Ajustement pendant le développement : l'email d'alerte ne part pas pour le tout premier appareil d'un compte (inscription), seulement quand le compte avait déjà un autre appareil.
>
> Choix de Yannick : **un seul appareil connecté à la fois** ; preuve par **code email** (ou le code de vérification en 2 étapes si elle est activée) ; **email d'alerte** à chaque nouvelle connexion validée.

## 1. Ce que veut Yannick

1. Se connecter depuis un appareil ou un navigateur jamais vu **ne suffit pas avec le mot de passe** : il faut prouver que c'est bien le titulaire du compte.
2. Une fois la preuve apportée, **l'autre appareil est déconnecté**. Un compte = un appareil actif.

## 2. Ce que voit la personne

**Sur son appareil habituel** : rien ne change.

**Sur un nouvel appareil** :
1. Connexion (email ou téléphone + mot de passe), comme aujourd'hui.
2. Écran **"Nouvel appareil détecté"** : "Pour protéger ton compte, confirme que c'est bien toi. Nous avons envoyé un code à y•••••k@gmail.com." (adresse partiellement masquée), 6 cases pour le code, "Renvoyer le code" (après 60 s), "Ce n'est pas moi / Annuler" (déconnexion).
   - Si la **vérification en 2 étapes** est activée : c'est son code qui sert de preuve, pas d'email.
3. Code validé → l'appareil devient **l'appareil actif** et reste mémorisé ("de confiance") : pas de code la prochaine fois sur cet appareil.
4. **Email d'alerte** au titulaire : "Nouvelle connexion à ton compte AFROBACK depuis Chrome sur Windows, le 29 septembre 2026 à 14 h 32. Ce n'était pas toi ? Change ton mot de passe tout de suite." (noir et or, FR/EN).

**Sur l'ancien appareil** : dans la minute (et immédiatement à la prochaine ouverture ou au retour sur l'app), déconnexion avec le message **"Ton compte a été connecté sur un autre appareil. Si ce n'était pas toi, change ton mot de passe."**, puis retour à l'écran de connexion.

**Revenir sur un appareil déjà de confiance** alors qu'un autre est actif : pas de code (appareil connu), il redevient l'appareil actif et l'autre est déconnecté.

## 3. Cas particuliers

| Cas | Comportement |
|---|---|
| Données du navigateur vidées / app réinstallée | L'appareil n'est plus reconnu : code redemandé (normal) |
| Ancien compte créé avec un téléphone seul (sans email) | Code de vérification en 2 étapes si activée ; sinon message "écris à afroback3d@gmail.com" |
| Profils enfants | Aucun changement : ils vivent sur l'appareil du parent |
| Mode invité | Non concerné (pas de compte) |
| Mise en service | Les appareils déjà connectés au moment de la mise en ligne sont reconnus automatiquement une fois (pas de code imposé à ceux qui sont déjà connectés) |
| Back-office | Non concerné (connexion administrateur séparée) |
| 5 codes faux | Pause de 5 minutes, comme ailleurs dans l'app |

## 4. Fonctionnement technique

- **Identité de l'appareil** : un identifiant aléatoire créé à la première ouverture et gardé sur l'appareil, plus un nom lisible ("iPhone", "Chrome sur Windows"…) pour l'email d'alerte.
- **Côté serveur** (nouveau script SQL, à exécuter par Yannick) :
  - table `appareils` : appareils de confiance de chaque compte (nom, date de validation, dernière activité) ;
  - table `appareil_actif` : l'appareil actif de chaque compte ;
  - fonction `etat_appareil(id)` : `actif`, `a_verifier` (inconnu) ou `remplace` (un autre appareil est devenu actif) ;
  - fonction `valider_appareil(id, nom)` : **n'accepte que si le serveur constate qu'un code vient réellement d'être validé** (code email vérifié par Supabase, ou code de vérification en 2 étapes validé il y a moins de 5 minutes). L'app ne peut pas "se déclarer" de confiance toute seule.
- **Code email** : envoyé par Supabase (modèle d'email "Magic Link" à coller, même style noir et or, avec le code). Aucun compte n'est créé par cet envoi.
- **Déconnexion de l'autre appareil** : dès la validation, les sessions des autres appareils sont révoquées côté Supabase ; l'ancien appareil vérifie son état à l'ouverture, au retour sur l'app et toutes les 60 secondes, et se déconnecte en voyant `remplace`.
- **Email d'alerte** : petite fonction serveur Supabase (Edge Function) qui envoie l'email via le compte Gmail d'AFROBACK. Yannick devra la créer dans le tableau de bord Supabase (code fourni prêt à coller) et y enregistrer le mot de passe d'application Gmail (il ne transite jamais par Jarvis).

## 5. Limite à connaître

Cette barrière protège l'**utilisation de l'app**. Quelqu'un qui aurait volé le mot de passe et qui interrogerait directement le serveur, sans passer par l'app, obtiendrait une session. C'est la même limite que la vérification en 2 étapes actuelle. Fermer complètement cette porte demanderait de conditionner chaque règle d'accès de la base à l'appareil vérifié : chantier plus lourd, possible plus tard si nécessaire.

## 6. Découpage

1. Script SQL + écran "Nouvel appareil détecté" + déconnexion de l'autre appareil (le cœur).
2. Email d'alerte (fonction serveur + modèle).
3. Plus tard (non inclus) : écran "Mes appareils" dans le profil (voir et déconnecter à distance).

## 7. Décisions à valider

| # | Question | Recommandation |
|---|---|---|
| D1 | Appareils déjà connectés au moment de la mise en ligne : reconnus automatiquement une fois, ou code demandé à tout le monde ? | Reconnus automatiquement (ils ont déjà prouvé leur identité à la connexion). |
| D2 | Délai de déconnexion de l'ancien appareil : vérification toutes les 60 s + à chaque retour sur l'app, suffisant ? | Oui. Une déconnexion instantanée (canal temps réel) est possible mais plus lourde, sans gain réel pour l'usage. |
| D3 | Écran "Mes appareils" dans le profil : maintenant ou plus tard ? | Plus tard. |
