-- =====================================================================
-- AFROBACK — École des Héros, étape 1 (Lire + Quiz) : structure
-- Cahier des charges : app-mobile/cdc-ecole-heros-contenu.md (2026-10-07)
-- À exécuter dans le SQL Editor de Supabase APRÈS schema-ecole-heros.sql,
-- et AVANT le script de contenu (livrables/sites-web/afroback/ecole/).
-- Idempotent : peut être relancé sans risque.
-- =====================================================================

-- 1. Version anglaise + explication ------------------------------------
alter table public.ecole_lecons add column if not exists texte_adapte_en text;

alter table public.ecole_quiz_questions add column if not exists question_en text;
alter table public.ecole_quiz_questions add column if not exists choix_en jsonb;
alter table public.ecole_quiz_questions add column if not exists explication text;
alter table public.ecole_quiz_questions add column if not exists explication_en text;

alter table public.ecole_quiz_niveau add column if not exists question_en text;
alter table public.ecole_quiz_niveau add column if not exists choix_en jsonb;
alter table public.ecole_quiz_niveau add column if not exists explication text;
alter table public.ecole_quiz_niveau add column if not exists explication_en text;

-- Un ordre par question : permet au script de contenu d'être rejoué sans doublon.
create unique index if not exists ecole_quiz_questions_lecon_ordre on public.ecole_quiz_questions (lecon_id, ordre);
create unique index if not exists ecole_quiz_niveau_niveau_ordre on public.ecole_quiz_niveau (niveau, ordre);

-- 2. Nouveau découpage (décision de Yannick : héros publiés uniquement) --
-- Les leçons de Manu Dibango et Rudolf Douala Manga Bell (dépubliés, sans
-- aucun contenu) sont retirées ; elles reviendront à leur publication.
delete from public.ecole_lecons l
 using public.heros h
 where h.id = l.heros_id and h.slug in ('manu-dibango', 'rudolf-douala-manga-bell');

insert into public.ecole_lecons (heros_id, niveau, ordre_dans_niveau)
select h.id, v.niveau, v.ordre
from (values
  ('sultan-njoya', 1, 1),
  ('reine-nzinga', 1, 2),
  ('reine-nzinga', 2, 1),
  ('sultan-njoya', 2, 2),
  ('martin-paul-samba', 2, 3),
  ('martin-paul-samba', 3, 1),
  ('charles-atangana', 3, 2),
  ('ruben-um-nyobe', 3, 3),
  ('ruben-um-nyobe', 4, 1),
  ('felix-moumie', 4, 2),
  ('ernest-ouandie', 4, 3)
) as v(slug, niveau, ordre)
join public.heros h on h.slug = v.slug
on conflict (heros_id, niveau) do update set ordre_dans_niveau = excluded.ordre_dans_niveau, updated_at = now();

-- 3. Contrôle : 11 leçons attendues ---------------------------------------
select l.niveau, l.ordre_dans_niveau, h.slug
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
 order by l.niveau, l.ordre_dans_niveau;
