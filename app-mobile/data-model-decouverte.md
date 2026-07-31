# Modèle de données — Pilier Découverte (app mobile AFROBACK)

> **Statut : validé par Yannick le 2026-07-30** (périmètre de contenu ; le volet UI reste bloqué séparément, voir section 4.1). Rédigé par le chef de projet en préparation du développement du pilier Découverte (2e pilier de contenu après Histoires & Héros, décision de Yannick notée dans `context/AFROBACK.md`, "Prochaines étapes" #3).
>
> Ce document couvre la **structure de données** et le **périmètre de contenu confirmé**. Le codage des écrans reste hors périmètre tant que `DesignSync` n'est pas accessible (voir 4.1) — seuls le contenu éditorial et le backend Supabase avancent pour l'instant.

---

## 1. Ce que dit déjà `context/AFROBACK.md` sur ce pilier

Deux descriptions coexistent, pas encore réconciliées :

- **Description du pilier (site vitrine et arbitrage produit)** : "villages, traditions, artisanat, objets sacrés".
- **Inventaire de la maquette `AFROBACK Mobile.dc.html`** (lu lors d'une session antérieure, non revérifié ici) : "Découverte (liste + détail) → fiche fait / coutume / personnage / village → hub pays".

Les deux se recoupent mais ne sont pas identiques : "artisanat" et "objets sacrés" côté site correspondent à `objet` ci-dessous ; "personnage" côté maquette a posé une question de périmètre, **tranchée par Yannick le 2026-07-30** (voir 4.2) : traité comme rôle traditionnel générique, pas comme individu nommé.

**Modèle retenu** : 4 types de fiche pour le premier lot, qui couvrent les deux descriptions sans les opposer :

| Type | Recouvre |
|---|---|
| `village` | Villages, lieux, capitales historiques, sites |
| `coutume` | Traditions, rites, cérémonies, savoirs oraux |
| `objet` | Artisanat, objets sacrés, instruments, tenues |
| `personnage` | **Rôles/figures traditionnelles génériques** (ex. "le griot", "le chef traditionnel/fon", "la reine-mère") — jamais un individu historique nommé, qui reste le terrain d'Histoires & Héros |

Un 5e type `fait` reste réservé au schéma (faits culturels ponctuels ne rentrant dans aucune des 4 cases ci-dessus) mais n'est pas utilisé dans le premier lot.

---

## 2. Schéma de données proposé (Postgres/Supabase)

### Table `decouverte_items`

| Champ | Type | Description | Obligatoire |
|---|---|---|---|
| `id` | `uuid` (PK, `default gen_random_uuid()`) | Identifiant unique | Oui |
| `slug` | `text` (unique) | Identifiant lisible (ex. `chefferie-bandjoun`, `masque-ekang`) | Oui |
| `type` | `enum` (`village`, `coutume`, `objet`, `personnage`, `fait`) | Type de fiche, détermine le gabarit d'affichage. `personnage` = rôle traditionnel générique uniquement (jamais un individu nommé) | Oui |
| `pays` | `text` | Pays (ex. "Cameroun") — clé de regroupement pour le "hub pays" de la maquette | Oui |
| `region_ethnie` | `text` | Région ou groupe ethnique (ex. "Royaume Bamoun, Ouest Cameroun") — cohérent avec le champ `region` déjà utilisé sur la table `heros` | Oui |
| `titre` | `text` | Titre affiché (ex. "Palais royal de Foumban") | Oui |
| `sous_titre` | `text` | Sous-titre court descriptif | Oui |
| `resume_liste` | `text` | 2-3 phrases pour la carte dans la liste Découverte | Oui |
| `contenu_fr_texte` | `text` | Texte intégral de la fiche détail, FR | Oui |
| `contenu_en_texte` | `text` | Texte intégral, EN | Optionnel (comme pour `heros`, EN peut arriver après FR) |
| `statut_fait_legende` | `jsonb` | Tableau `{affirmation, statut}` où `statut` ∈ {`atteste`, `tradition_orale`, `debattu`} — **transpose la règle déjà appliquée aux héros** (jamais un fait culturel/religieux présenté comme certain s'il relève de la tradition orale ou reste débattu chez les historiens/ethnologues) | Oui dès qu'une affirmation sensible est faite |
| `image_url` | `text` | Visuel principal | Optionnel (aucun visuel produit à ce jour) |
| `sources` | `jsonb` | Bibliographie (mêmes standards que le griot : encyclopédies, ethnologues, archives, musées) | Oui |
| `heros_lies` | `text[]` | Slugs de la table `heros` en lien thématique (ex. la fiche "Royaume Bamoun" liée au héros `sultan-njoya`) — **pont explicite entre les deux piliers** | Optionnel |
| `items_lies` | `text[]` | Slugs d'autres items Découverte liés | Optionnel |
| `statut_contenu` | `enum` (`pret`, `brouillon`, `a_produire`) | Statut de production éditoriale | Oui |
| `ordre_affichage` | `integer` | Ordre manuel dans la liste/le hub pays | Optionnel |
| `created_at` / `updated_at` | `timestamptz` | Horodatage standard | Oui |

### Table `decouverte_pays` (pour le "hub pays" de la maquette)

| Champ | Type | Description |
|---|---|---|
| `id` | `uuid` (PK) | Identifiant |
| `slug` | `text` (unique) | Ex. `cameroun` |
| `nom` | `text` | Nom affiché |
| `resume` | `text` | Texte d'intro du hub pays |
| `drapeau_emoji_ou_url` | `text` | Visuel léger pour le sélecteur pays |
| `ordre_affichage` | `integer` | Ordre d'affichage si plusieurs pays |

Le hub pays interroge simplement `decouverte_items` filtré par `pays`, regroupé par `type` — pas besoin de dupliquer les items dans la table pays.

**Cohérence avec le pipeline existant** : même logique à deux niveaux que pour les héros (`scripts/build-heroes-data.mjs` + `heroes.curated.ts`) — un futur `decouverte.curated.ts` porterait les champs à jugement éditorial (résumé, statut fait/légende, choix des liens croisés), généré en seed SQL via un script `generate-supabase-seed.mjs` étendu ou dédié.

---

## 3. Types TypeScript proposés (miroir du schéma)

```ts
export type DecouverteType = 'village' | 'coutume' | 'objet' | 'personnage' | 'fait';
export type StatutFactuel = 'atteste' | 'tradition_orale' | 'debattu';

export interface AffirmationStatuee {
  affirmation: string;
  statut: StatutFactuel;
}

export interface DecouverteItem {
  id: string;
  slug: string;
  type: DecouverteType;
  pays: string;
  region_ethnie: string;
  titre: string;
  sous_titre: string;
  resume_liste: string;
  contenu_fr_texte: string;
  contenu_en_texte?: string | null;
  statut_fait_legende: AffirmationStatuee[];
  image_url?: string | null;
  sources: string[];
  heros_lies: string[];
  items_lies: string[];
  statut_contenu: 'pret' | 'brouillon' | 'a_produire';
  ordre_affichage: number;
}

export interface DecouvertePays {
  id: string;
  slug: string;
  nom: string;
  resume: string;
  ordre_affichage: number;
}
```

---

## 4. Décisions

### 4.1 Blocage technique : fidélité à la maquette — toujours ouvert

L'outil `DesignSync` (utilisé lors de sessions précédentes pour lire `AFROBACK Mobile.dc.html` et refaire l'UI Histoires & Héros fidèlement) **n'est pas disponible dans cette session**. C'est le même type d'indisponibilité déjà rencontré et documenté dans `context/AFROBACK.md` ("Nouveau prototype produit", note du 2026-07-29).

**Décision de Yannick, 2026-07-30 : Option A retenue** — on attend une session où `DesignSync` est accessible avant de coder le moindre écran RN du pilier Découverte. Aucun best-effort. Le contenu éditorial et le schéma/seed Supabase avancent en attendant (ils ne dépendent pas de la maquette).

### 4.2 Périmètre du contenu V1 — validé par Yannick le 2026-07-30, sans ajustement

- **Pays/culture** : Cameroun uniquement, cohérent avec les 9 héros déjà couverts (tous camerounais) et le contenu mythologique déjà produit (mythes Bassa, Sawa, Beti, Bamoun, Kotoko — voir `Récits africains storyboards/mythe-*`).
- **Régions du premier lot**, pour créer des ponts explicites avec Histoires & Héros (`heros_lies`) :
  - Royaume Bamoun / Foumban (déjà couvert par Sultan Njoya + mythe Nchare Yen)
  - Peuple Sawa / Douala (déjà couvert par Rudolf Douala Manga Bell + mythe Miengu)
  - Pays Bulu/Beti (déjà couvert par Martin Paul Samba, Charles Atangana + mythe Ngan Medza)
- **Volume du premier lot** : ~8 à 12 items (2 par type × 2-3 régions), types village/coutume/objet/personnage.
- **`personnage`** : validé comme rôle traditionnel générique (ex. "le griot", "le chef/fon", "la reine-mère"), jamais un individu historique nommé — pas de doublon avec Histoires & Héros.
- **Sources** : même standard que l'agent griot — encyclopédies, ouvrages ethnographiques/anthropologiques, archives, musées (ex. Musée national du Cameroun) — jamais d'invention, séparation systématique attesté/tradition orale/débattu (champ `statut_fait_legende`).

### 4.3 Suite

Sous-agent **`afroback-decouverte`** créé le 2026-07-30 (`.claude/agents/afroback-decouverte.md`, commande `/afroback_decouverte`), sur le modèle d'`afroback-griot`. Production du premier lot lancée le même jour (voir `livrables/sites-web/afroback/Découverte/` pour les fiches produites).

---

*Prochaine étape : générer `decouverte.curated.ts` + le seed Supabase à partir du contenu produit, sur le modèle du pipeline `heroes.curated.ts` → `generate-supabase-seed.mjs`.*
