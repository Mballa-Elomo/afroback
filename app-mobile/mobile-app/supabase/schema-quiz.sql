-- =====================================================================
-- AFROBACK — Quiz de fin de contenu + progression du lecteur
-- Cahier des charges : app-mobile/cdc-quiz-progression.md (validé le 2026-10-07)
-- À exécuter dans le SQL Editor de Supabase, APRÈS schema-acces-abonnement.sql
-- (utilise acces_contenu). Idempotent : peut être relancé sans risque.
--
-- Principe : les questions et les bonnes réponses ne sont JAMAIS lisibles
-- directement par l'app ou le site. Tout passe par des fonctions serveur :
--   - get_quiz             : les questions, SANS la bonne réponse ;
--   - verifier_reponse_quiz: correction d'une question (après le choix) ;
--   - terminer_quiz        : score RECALCULÉ côté serveur + enregistrement ;
--   - ma_progression       : points, niveau, meilleurs scores ;
--   - etat_quiz            : la fiche sait s'il existe un quiz et mon meilleur score.
-- Barème (D2, D3, D5) : points d'un contenu = meilleur score / nb questions × 100
-- (5/5 = 100) ; seul le meilleur score compte ; « maîtrisé » = 80 % ou plus.
-- Les questions sont insérées par un script séparé (dossier quiz/, agent afroback-quiz).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  type_contenu text not null check (type_contenu in ('heros', 'mythe')),
  slug text not null,
  ordre integer not null check (ordre between 1 and 10),
  question_fr text not null,
  question_en text,
  choix_fr jsonb not null check (jsonb_typeof(choix_fr) = 'array' and jsonb_array_length(choix_fr) between 2 and 5),
  choix_en jsonb check (choix_en is null or jsonb_typeof(choix_en) = 'array'),
  bonne_reponse integer not null check (bonne_reponse >= 0),
  explication_fr text not null,
  explication_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type_contenu, slug, ordre)
);
alter table public.quiz_questions enable row level security;
-- Aucune policy : ni l'app ni le site ne lisent cette table directement.
revoke all on public.quiz_questions from anon, authenticated;

create table if not exists public.quiz_tentatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type_contenu text not null check (type_contenu in ('heros', 'mythe')),
  slug text not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  reponses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists quiz_tentatives_user_idx on public.quiz_tentatives (user_id, type_contenu, slug);
alter table public.quiz_tentatives enable row level security;
drop policy if exists "Read own quiz attempts" on public.quiz_tentatives;
create policy "Read own quiz attempts" on public.quiz_tentatives
  for select using (user_id = auth.uid());
-- Écriture uniquement via terminer_quiz (score recalculé côté serveur).
revoke insert, update, delete on public.quiz_tentatives from anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Outils internes
-- ---------------------------------------------------------------------

-- Le contenu est-il publié ?
create or replace function public._quiz_contenu_publie(p_type text, p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case p_type
    when 'heros' then exists (select 1 from public.heros where slug = p_slug and coalesce(statut_publication, 'publie') <> 'depublie')
    when 'mythe' then exists (select 1 from public.mythes where slug = p_slug and coalesce(statut_publication, 'publie') <> 'depublie')
    else false
  end;
$$;

-- Niveau atteint pour un total de points (D3).
create or replace function public._quiz_niveau(p_points integer)
returns jsonb
language sql
immutable
as $$
  with paliers(rang, code, seuil) as (
    values (1, 'apprenti', 0), (2, 'curieux', 100), (3, 'conteur', 300), (4, 'griot', 600), (5, 'gardien', 1000)
  ),
  actuel as (
    select * from paliers where seuil <= greatest(p_points, 0) order by seuil desc limit 1
  )
  select jsonb_build_object(
    'rang', a.rang,
    'code', a.code,
    'seuil', a.seuil,
    'suivant_code', s.code,
    'suivant_seuil', s.seuil
  )
  from actuel a
  left join paliers s on s.rang = a.rang + 1;
$$;

-- Meilleurs scores de la personne connectée (un par contenu).
create or replace function public._quiz_meilleurs(p_user uuid)
returns table (type_contenu text, slug text, meilleur integer, total integer, tentatives integer, derniere_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select t.type_contenu, t.slug,
         max(t.score)::integer as meilleur,
         max(t.total)::integer as total,
         count(*)::integer as tentatives,
         max(t.created_at) as derniere_at
    from public.quiz_tentatives t
   where t.user_id = p_user
   group by t.type_contenu, t.slug;
$$;

-- Total de points (meilleur score de chaque contenu publié, ramené sur 100).
create or replace function public._quiz_points(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(round(m.meilleur::numeric / m.total * 100)), 0)::integer
    from public._quiz_meilleurs(p_user) m
   where public._quiz_contenu_publie(m.type_contenu, m.slug);
$$;

-- Outils internes : jamais appelables depuis l'app ou le site
-- (_quiz_meilleurs/_quiz_points prennent un identifiant de compte en paramètre).
revoke execute on function public._quiz_contenu_publie(text, text) from public, anon, authenticated;
revoke execute on function public._quiz_meilleurs(uuid) from public, anon, authenticated;
revoke execute on function public._quiz_points(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Fonctions publiques
-- ---------------------------------------------------------------------

-- Fiche d'un contenu : y a-t-il un quiz, et mon meilleur score (invités compris).
create or replace function public.etat_quiz(p_type text, p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'disponible', public._quiz_contenu_publie(p_type, p_slug)
                  and exists (select 1 from public.quiz_questions q where q.type_contenu = p_type and q.slug = p_slug),
    'nb_questions', (select count(*) from public.quiz_questions q where q.type_contenu = p_type and q.slug = p_slug),
    'meilleur_score', (select max(t.score) from public.quiz_tentatives t
                        where auth.uid() is not null and t.user_id = auth.uid() and t.type_contenu = p_type and t.slug = p_slug),
    'tentatives', (select count(*) from public.quiz_tentatives t
                    where auth.uid() is not null and t.user_id = auth.uid() and t.type_contenu = p_type and t.slug = p_slug)
  );
$$;
grant execute on function public.etat_quiz(text, text) to anon, authenticated;

-- Questions d'un quiz, sans la bonne réponse.
-- statut : 'ok' | 'compte_requis' | 'verrouille' | 'indisponible'
create or replace function public.get_quiz(p_type text, p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public._quiz_contenu_publie(p_type, p_slug)
     or not exists (select 1 from public.quiz_questions where type_contenu = p_type and slug = p_slug) then
    return jsonb_build_object('statut', 'indisponible');
  end if;
  if auth.uid() is null then
    return jsonb_build_object('statut', 'compte_requis');
  end if;
  if not public.acces_contenu(p_type, p_slug) then
    return jsonb_build_object('statut', 'verrouille');
  end if;
  return jsonb_build_object(
    'statut', 'ok',
    'questions', (
      select jsonb_agg(jsonb_build_object(
               'id', q.id,
               'ordre', q.ordre,
               'question_fr', q.question_fr,
               'question_en', q.question_en,
               'choix_fr', q.choix_fr,
               'choix_en', q.choix_en
             ) order by q.ordre)
        from public.quiz_questions q
       where q.type_contenu = p_type and q.slug = p_slug
    ),
    'meilleur_score', (select max(score) from public.quiz_tentatives
                        where user_id = auth.uid() and type_contenu = p_type and slug = p_slug)
  );
end;
$$;
grant execute on function public.get_quiz(text, text) to authenticated, anon;

-- Correction d'une question (D1 : après chaque question).
create or replace function public.verifier_reponse_quiz(p_question_id uuid, p_choix integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  q public.quiz_questions;
begin
  if auth.uid() is null then
    raise exception 'compte_requis';
  end if;
  select * into q from public.quiz_questions where id = p_question_id;
  if not found then
    raise exception 'question_inconnue';
  end if;
  if not public.acces_contenu(q.type_contenu, q.slug) then
    raise exception 'verrouille';
  end if;
  return jsonb_build_object(
    'correct', p_choix = q.bonne_reponse,
    'bonne_reponse', q.bonne_reponse,
    'explication_fr', q.explication_fr,
    'explication_en', q.explication_en
  );
end;
$$;
grant execute on function public.verifier_reponse_quiz(uuid, integer) to authenticated;

-- Fin du quiz : score recalculé côté serveur, tentative enregistrée.
-- p_reponses : [{"question_id": "...", "choix": 2}, ...]
create or replace function public.terminer_quiz(p_type text, p_slug text, p_reponses jsonb)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_total integer;
  v_score integer;
  v_meilleur_avant integer;
  v_points_avant integer;
  v_points_apres integer;
begin
  if v_user is null then
    raise exception 'compte_requis';
  end if;
  if not public._quiz_contenu_publie(p_type, p_slug) then
    raise exception 'indisponible';
  end if;
  if not public.acces_contenu(p_type, p_slug) then
    raise exception 'verrouille';
  end if;

  select count(*) into v_total from public.quiz_questions where type_contenu = p_type and slug = p_slug;
  if v_total = 0 then
    raise exception 'indisponible';
  end if;

  -- Une seule réponse comptée par question (la première envoyée).
  select count(*) into v_score
    from public.quiz_questions q
    join lateral (
      select (r->>'choix')::integer as choix
        from jsonb_array_elements(coalesce(p_reponses, '[]'::jsonb)) r
       where r->>'question_id' = q.id::text
       limit 1
    ) rep on true
   where q.type_contenu = p_type and q.slug = p_slug
     and rep.choix = q.bonne_reponse;

  select max(score) into v_meilleur_avant from public.quiz_tentatives
   where user_id = v_user and type_contenu = p_type and slug = p_slug;
  v_points_avant := public._quiz_points(v_user);

  insert into public.quiz_tentatives (user_id, type_contenu, slug, score, total, reponses)
  values (v_user, p_type, p_slug, v_score, v_total, coalesce(p_reponses, '[]'::jsonb));

  v_points_apres := public._quiz_points(v_user);

  return jsonb_build_object(
    'score', v_score,
    'total', v_total,
    'meilleur_avant', v_meilleur_avant,
    'meilleur', greatest(v_score, coalesce(v_meilleur_avant, 0)),
    'points_gagnes', v_points_apres - v_points_avant,
    'points', v_points_apres,
    'niveau_avant', public._quiz_niveau(v_points_avant),
    'niveau', public._quiz_niveau(v_points_apres)
  );
end;
$$;
grant execute on function public.terminer_quiz(text, text, jsonb) to authenticated;

-- Progression complète de la personne connectée (profil, écran « Ma progression »).
create or replace function public.ma_progression()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_points integer;
begin
  if v_user is null then
    return null;
  end if;
  v_points := public._quiz_points(v_user);

  return (
    with dispo as (
      select distinct q.type_contenu, q.slug
        from public.quiz_questions q
       where public._quiz_contenu_publie(q.type_contenu, q.slug)
    ),
    lignes as (
      select d.type_contenu, d.slug,
             case d.type_contenu
               when 'heros' then (select jsonb_build_object('fr', h.nom_affiche, 'en', h.nom_affiche_en, 'image', h.image_carte_catalogue, 'ordre', h.ordre_affichage)
                                    from public.heros h where h.slug = d.slug)
               else (select jsonb_build_object('fr', my.titre, 'en', my.titre_en, 'image', my.image_url, 'ordre', my.ordre_affichage)
                       from public.mythes my where my.slug = d.slug)
             end as info,
             m.meilleur, m.total, m.tentatives, m.derniere_at
        from dispo d
        left join public._quiz_meilleurs(v_user) m on m.type_contenu = d.type_contenu and m.slug = d.slug
    )
    select jsonb_build_object(
      'points', v_points,
      'niveau', public._quiz_niveau(v_points),
      'quiz_total', (select count(*) from lignes),
      'quiz_faits', (select count(*) from lignes where meilleur is not null),
      'maitrises', (select count(*) from lignes where meilleur is not null and meilleur::numeric / total >= 0.8),
      'moyenne', (select round(avg(meilleur::numeric / total * 100)) from lignes where meilleur is not null),
      'resultats', coalesce((
        select jsonb_agg(jsonb_build_object(
                 'type', l.type_contenu,
                 'slug', l.slug,
                 'titre_fr', l.info->>'fr',
                 'titre_en', l.info->>'en',
                 'image', l.info->>'image',
                 'meilleur_score', l.meilleur,
                 'total', l.total,
                 'tentatives', coalesce(l.tentatives, 0),
                 'derniere_at', l.derniere_at
               ) order by l.type_contenu, (l.info->>'ordre')::integer nulls last, l.slug)
          from lignes l
      ), '[]'::jsonb)
    )
  );
end;
$$;
grant execute on function public.ma_progression() to authenticated;

-- ---------------------------------------------------------------------
-- 4. Contrôle : doit renvoyer les 5 fonctions publiques
-- ---------------------------------------------------------------------
select proname from pg_proc
 where pronamespace = 'public'::regnamespace
   and proname in ('etat_quiz', 'get_quiz', 'verifier_reponse_quiz', 'terminer_quiz', 'ma_progression')
 order by proname;
