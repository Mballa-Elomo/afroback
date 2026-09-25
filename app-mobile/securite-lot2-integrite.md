# AFROBACK — Cybersécurité, Lot 2 : Intégrité & protection du contenu culturel

> Document de présentation/soutenance, produit le 2026-09-25. Décrit ce qui existe **réellement** dans le code à cette date. Voir `context/AFROBACK.md` pour le journal de décisions complet et `securite-lot1-iam.md` pour le Lot 1.

## Pourquoi ce lot

Le patrimoine culturel numérisé par AFROBACK (récits, fiches Découverte, mythes) est la vraie valeur du projet. Ce lot répond à une question distincte de l'authentification : **comment prouver qu'un contenu n'a pas été altéré, et qu'il vient bien de l'AFROBACK officiel ?**

## 2.1 Empreinte SHA-256

- **Mécanisme** : à chaque écriture (insertion ou modification) d'une fiche héros, Découverte ou mythologie, un **trigger Postgres** recalcule automatiquement une empreinte SHA-256 du contenu canonique (le texte du récit) et la stocke dans la colonne `contenu_hash`.
- **Pourquoi un trigger plutôt que du code applicatif** : ça s'applique quel que soit le chemin d'écriture (back-office, pipeline de seed SQL, futur outil) — le contenu ne peut pas être modifié sans que l'empreinte se recalcule.
- **Vérification à la demande** : fonction `verify_content_integrity(table, id)`, exposée dans le back-office (bouton « Vérifier l'intégrité » sur les 3 fiches). Elle recalcule l'empreinte à partir du contenu **actuel** et la compare à celle stockée.
- **Journal d'intégrité** : table `content_integrity_log`, écriture exclusive (append-only) — trace chaque changement réel de contenu (ancien hash → nouveau hash, horodaté), jamais modifiable après coup.

## 2.2 "Signature" du contenu (HMAC)

- **Mécanisme** : en plus du hash, une signature **HMAC-SHA256** est calculée avec une clé secrète connue uniquement du serveur (jamais exposée à l'API, jamais lue par le code applicatif du back-office).
- **⚠️ Limite honnête, à assumer devant le jury** : ce n'est **pas une signature numérique asymétrique** (paire clé publique/privée façon PGP/PKI). Le terme exact est **code d'authentification de message (HMAC)**, pas "signature numérique" au sens cryptographique complet. Une vraie infrastructure à clés publiques est hors de portée du temps disponible pour ce projet. Différence concrète : avec HMAC, quiconque compromettrait la base de données (ex. vol des identifiants `service_role`) pourrait en théorie falsifier à la fois le contenu et sa signature — une vraie signature asymétrique protégerait même dans ce scénario, la clé privée n'ayant pas besoin d'être stockée au même endroit que le contenu signé. **Présenter cette nuance est plus solide académiquement qu'une fausse promesse.**

## 2.3 Watermarking des images

- **Mécanisme** : chaque photo uploadée depuis le back-office (héros, Découverte, Mythologie) reçoit un filigrane discret "AFROBACK" (bandeau semi-transparent, coin inférieur droit), appliqué côté serveur avant l'envoi vers le stockage — jamais après coup, jamais côté client (contournable).
- **Bibliothèque** : `jimp` (pure JavaScript, pas de dépendance native comme `sharp`) — choix délibéré pour rester portable en environnement serverless (Vercel).
- **⚠️ Limite honnête** : `jimp` ne sait pas décoder/encoder le format **WEBP**. Les 3 pipelines d'upload acceptent pourtant `.webp` — dans ce cas précis, le fichier est uploadé **tel quel, sans filigrane**, plutôt que de planter ou de le refuser. Le code le signale explicitement (`watermarked: false` dans le retour de `applyWatermark()`), jamais silencieusement.

## Vulnérabilité réelle trouvée et corrigée en route (2026-09-25)

En installant `jimp`, l'audit de dépendances (`npm audit`) a révélé une **vulnérabilité critique préexistante dans le back-office**, sans rapport avec ce lot : Next.js 16.3.0 (version utilisée avant ce chantier) contient une faille d'exécution de code à distance non authentifiée sur serveurs Windows ([GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36)), plus une seconde RCE liée à l'optimisation d'images AVIF. **Corrigée immédiatement** : mise à jour vers Next.js 16.3.6. `npm audit` confirme **0 vulnérabilité** après correction.

**Bon exemple pour la soutenance** : une dépendance ajoutée pour une fonctionnalité (watermarking) a permis de découvrir et corriger une faille critique préexistante et sans rapport — exactement le genre de découverte qu'un audit de sécurité réel produit.

---

## Vérifications techniques (2026-09-25)

- Mobile : `tsc --noEmit`, `expo-doctor` (18/18) — non impactés par ce lot (uniquement back-office).
- Back-office : `tsc --noEmit`, `npx next build` propres après chaque étape. `npm audit` : 0 vulnérabilité.
- Logique de watermarking testée isolément (image de test générée, filigrane appliqué, buffer de sortie valide) avant intégration.

**Reste à exécuter par Yannick** : `mobile-app/supabase/schema-integrite-contenu.sql` dans le SQL Editor Supabase (dépend de `seed.sql`/`seed-decouverte.sql`/`schema-mythologie.sql`, déjà exécutés).

**Non testé en conditions réelles à ce stade** : un vrai upload de photo depuis le back-office (watermark visible), et le bouton « Vérifier l'intégrité » sur une vraie fiche.
