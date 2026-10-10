/**
 * Version Google Play (cdc-play-store.md, lot 2, option A validée par Yannick
 * le 2026-10-08) : Google impose son propre système de paiement pour un
 * contenu numérique vendu dans une app Android, et interdit les dons hors de
 * ce système pour une structure non caritative. La version compilée pour le
 * Play Store est donc « consommation seule » : aucun achat d'abonnement,
 * aucun don, aucune mention d'un autre moyen de payer. Un compte abonné via
 * le site retrouve tout son contenu. Le Marché (objets physiques) garde
 * Mobile Money, autorisé par Google.
 *
 * Activée par EXPO_PUBLIC_DISTRIBUTION=play (profil `production` d'eas.json).
 * Expo Go, la version web et le site ne changent pas.
 *
 * ⚠️ Expo grave la valeur dans le code au moment de l'export et la garde en
 * cache : après un export avec la variable, refaire l'export suivant avec
 * `--clear` (sinon la version web perd aussi les paiements). Les builds EAS
 * partent d'un cache propre.
 */
export const PLAY_STORE_BUILD = process.env.EXPO_PUBLIC_DISTRIBUTION === 'play';

/** Achat d'abonnement et dons possibles dans cette version de l'app. */
export const IN_APP_DIGITAL_PAYMENTS = !PLAY_STORE_BUILD;
