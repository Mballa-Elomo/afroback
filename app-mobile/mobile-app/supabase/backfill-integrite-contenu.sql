-- Lot 2 cybersécurité — rattrapage à exécuter UNE SEULE FOIS juste après
-- schema-integrite-contenu.sql. Le trigger `compute_content_integrity()` ne
-- s'applique qu'aux écritures FUTURES (insert/update) — les héros, fiches
-- Découverte et mythes déjà en base avant cette migration ont `contenu_hash`
-- à NULL tant qu'ils ne sont pas réécrits au moins une fois.
--
-- Ce script force une réécriture triviale (auto-affectation de `id`, ne
-- change aucune valeur réelle) pour que le trigger BEFORE UPDATE se déclenche
-- sur chaque ligne existante et calcule son empreinte initiale. Idempotent :
-- rejouable sans risque (le hash recalculé sera identique si le contenu n'a
-- pas changé entre-temps).

update public.heros set id = id;
update public.decouverte_items set id = id;
update public.mythes set id = id;
