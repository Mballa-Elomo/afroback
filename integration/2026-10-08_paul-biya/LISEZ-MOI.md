# Intégrer Paul Biya dans AFROBACK (app + site)

Dossier : `livrables/sites-web/afroback/integration/2026-10-08_paul-biya/`

| Fichier | Rôle |
|---|---|
| `paul-biya.jpg` | Image de la carte. Même format que les autres héros : JPEG carré 1024 × 1024, environ 310 Ko, tiré de `portrait-paul-biya.png`. |
| `paul-biya_insertion.sql` | Création du héros (rejouable). |
| `changements-code.md` | Petits changements de code conseillés (rien n'a été modifié). |

Le héros est créé **dépublié**, donc invisible dans l'app et sur le site. La fiche du griot demande en effet ta relecture avant toute publication. Tu le publies à l'étape (d).

---

## (a) Déposer l'image

1. Supabase > **Storage** > bucket **`heroes-media`** > dossier **`images`**.
2. **Upload file** > choisir `paul-biya.jpg`. Le nom doit rester exactement `paul-biya.jpg`.
3. Vérifier que l'adresse s'ouvre dans le navigateur :
   https://ygkyapryramhaskfbrrt.supabase.co/storage/v1/object/public/heroes-media/images/paul-biya.jpg

## (b) Lancer le SQL

1. Supabase > **SQL Editor** > **New query**.
2. Coller **tout** le contenu de `paul-biya_insertion.sql` (le fichier est long, environ 160 Ko), puis **Run**.
3. Le script se termine par une requête de contrôle qui affiche une ligne (voir étape c).

Tu peux relancer le script sans risque : il met le héros à jour sans en créer un deuxième. Il ne touche jamais à la publication, à la mise à la une ni à l'ordre d'affichage.

## (c) Requête de contrôle

```sql
select slug, statut_publication, ordre_affichage,
  jsonb_array_length(recit_chapitres_fr) as chapitres_fr,
  jsonb_array_length(recit_chapitres_en) as chapitres_en,
  jsonb_array_length(frise_chronologique) as frise,
  jsonb_array_length(frise_chronologique_en) as frise_en,
  jsonb_array_length(citations) as citations,
  cardinality(sources) as sources,
  (select sum((c->>'nb_planches')::int) from jsonb_array_elements(chapitres_storyboard) c) as planches,
  contenu_hash is not null as integrite_ok,
  image_carte_catalogue
from public.heros
where slug = 'paul-biya';
```

Résultat attendu : **1 ligne** avec `depublie`, `10`, `4`, `4`, `13`, `13`, `2`, `17`, `96`, `true`, et l'adresse de l'image.

Vérifie aussi que l'ordre 10 est libre :

```sql
select slug, ordre_affichage from public.heros order by ordre_affichage;
```

## (d) Publier, après ta relecture

Relis la fiche (récit, avertissement, citations). Puis, dans le SQL Editor :

```sql
update public.heros set statut_publication = 'publie', updated_at = now() where slug = 'paul-biya';
```

Tu peux aussi le faire depuis le back-office (Héros > Publier). Le héros apparaît dans l'app au prochain rafraîchissement du catalogue, et sur le site en 2 minutes au plus.

Pour le retirer : la même requête avec `'depublie'`.

## Après publication

- Demander à Jarvis le quiz (`/afroback_quiz`) et le contrôle anglais (`/afroback_traduction_FR_EN`).
- Voir `changements-code.md` : sur le site, l'avertissement de lecture n'apparaît pas aux non-abonnés tant que le changement n° 1 n'est pas fait.
- Les faits de 2026 sont arrêtés au 8 octobre 2026. Ils devront être mis à jour (vice-président, législatives du 20 décembre 2026).
