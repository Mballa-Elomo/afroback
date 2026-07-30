# Expo SDK pinned to 54 — pas la dernière version, volontairement

Ce projet cible **Expo SDK 54**, alors que 57 est la dernière version stable publiée sur npm. C'est délibéré, pas un oubli : depuis mai 2026, l'app **Expo Go publiée sur l'App Store / Google Play est bloquée au SDK 54** (voir https://expo.dev/changelog/expo-go-and-app-store-may-2026). Les SDK 55+ ne sont testables que via `eas go` (build de dev personnalisé, nécessite un compte développeur payant) ou un dev build compilé — hors périmètre de ce workspace.

Tant que ce blocage n'est pas levé côté Expo, **ne pas remonter le SDK au-delà de 54** sans revalider que l'app Expo Go grand public le supporte, sous peine de reproduire l'erreur "Project is incompatible with this version of Expo Go" rencontrée le 2026-07-29.

Avant d'écrire du code, lire la doc versionnée exacte : https://docs.expo.dev/versions/v54.0.0/

Piège rencontré lors du downgrade 57→54 : `expo-status-bar` déclaré dans `app.json > plugins` fait planter `expo config` (Node refuse de "type-strip" le `.ts` source du package sous `node_modules`, erreur `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`). Ce n'est pas un vrai config plugin natif — retiré de `plugins`, le composant `<StatusBar>` continue de fonctionner normalement.
