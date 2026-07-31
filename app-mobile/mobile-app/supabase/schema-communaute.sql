-- AFROBACK Mobile — schéma Postgres pour le pilier Communauté
-- Généré le 2026-07-30 à partir de
-- livrables/sites-web/afroback/app-mobile/data-model-communaute.md
--
-- Décisions appliquées ici (validées par Yannick le 2026-07-30) :
--   4.2 Modération  : post-modération + signalement (filtre auto à l'insertion, revue manuelle ensuite)
--   4.3 Identité     : pseudonymat structuré (vue publique qui n'expose jamais user_id)
--   4.4 Séquencement : aucun lien avec le forfait — accessible à tous les comptes
--
-- Contrairement à seed.sql / seed-decouverte.sql, ce fichier ne contient PAS
-- de données de contenu à charger : Communauté est du contenu généré par les
-- utilisateurs (UGC), pas du contenu éditorial. Il n'y a donc que le schéma,
-- les triggers et les policies RLS, pas d'insert.

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Profils communautaires
-- ============================================================

create table if not exists public.community_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  pseudo text not null unique check (char_length(pseudo) between 2 and 30),
  avatar_url text,
  bio text check (char_length(bio) <= 200),
  is_banned boolean not null default false,
  ban_reason text,
  created_at timestamptz not null default now()
);

alter table public.community_profiles enable row level security;

-- Un membre peut lire sa propre ligne complète (y compris user_id/is_banned,
-- utile pour que l'app sache si son propre compte est banni).
drop policy if exists "Own profile full read" on public.community_profiles;
create policy "Own profile full read" on public.community_profiles
  for select
  using (user_id = auth.uid());

-- Un membre crée son propre profil (un seul, contrainte unique sur user_id).
drop policy if exists "Create own profile" on public.community_profiles;
create policy "Create own profile" on public.community_profiles
  for insert
  with check (user_id = auth.uid());

-- Un membre peut mettre à jour sa ligne, mais seules certaines colonnes lui
-- sont réellement accessibles en écriture (voir grant column-level plus bas) :
-- is_banned/ban_reason restent hors de portée de l'app, réservés à service_role.
drop policy if exists "Update own profile" on public.community_profiles;
create policy "Update own profile" on public.community_profiles
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke update on public.community_profiles from authenticated;
grant update (pseudo, avatar_url, bio) on public.community_profiles to authenticated;

-- Vue publique : c'est la SEULE façon dont le fil/profil membre/post doivent
-- lire un profil. N'expose jamais user_id, is_banned, ban_reason. Les profils
-- bannis sont exclus (leurs posts passés s'afficheront avec un auteur non
-- résolu côté app plutôt que de révéler qui a été banni).
-- Note technique : une vue s'exécute par défaut avec les droits de son
-- propriétaire (ici le rôle qui exécute ce script, typiquement `postgres`,
-- qui contourne la RLS), pas avec ceux du rôle qui l'interroge. C'est ce qui
-- permet à `anon`/`authenticated` de lire cette vue sans policy RLS
-- supplémentaire sur `community_profiles` elle-même.
create or replace view public.community_profiles_public as
  select id, pseudo, avatar_url, bio, created_at
  from public.community_profiles
  where not is_banned;

grant select on public.community_profiles_public to anon, authenticated;

-- ============================================================
-- 2. Filtre automatique (modération, décision 4.2) — infrastructure commune
-- ============================================================

-- Liste de termes bloqués, éditable sans redéployer de code (simple insert).
-- Volontairement livrée VIDE : dresser une liste de termes haineux/insultants
-- n'est pas un travail à faire depuis ce workspace sans supervision éditoriale
-- humaine directe. Tant que cette table est vide, le filtre automatique ne
-- bloque rien — le signalement + la revue manuelle de Yannick restent la
-- seule protection réelle au lancement. Voir data-model-communaute.md §4.2
-- (option C, modération renforcée par API dédiée) comme évolution possible.
create table if not exists public.community_banned_terms (
  term text primary key
);

alter table public.community_banned_terms enable row level security;
-- Aucune policy publique : lecture/écriture réservées à service_role
-- (dashboard Supabase ou futur back-office).

create or replace function public.community_apply_auto_filter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.community_banned_terms bt
    where NEW.contenu_texte ilike '%' || bt.term || '%'
  ) then
    NEW.statut := 'masque_filtre_auto';
  end if;
  return NEW;
end;
$$;

create or replace function public.community_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

-- ============================================================
-- 3. Posts
-- ============================================================

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.community_profiles(id) on delete cascade,
  contenu_texte text not null check (char_length(contenu_texte) between 1 and 500),
  image_url text,
  statut text not null default 'publie'
    check (statut in ('publie', 'masque_filtre_auto', 'masque_signalement', 'supprime')),
  nb_signalements integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;

drop trigger if exists trg_community_posts_auto_filter on public.community_posts;
create trigger trg_community_posts_auto_filter
  before insert on public.community_posts
  for each row execute function public.community_apply_auto_filter();

drop trigger if exists trg_community_posts_updated_at on public.community_posts;
create trigger trg_community_posts_updated_at
  before update on public.community_posts
  for each row execute function public.community_set_updated_at();

-- Lecture publique : posts publiés, OU ses propres posts quel que soit le
-- statut (pour que l'auteur comprenne pourquoi un post a été masqué).
drop policy if exists "Read published or own posts" on public.community_posts;
create policy "Read published or own posts" on public.community_posts
  for select
  using (
    statut = 'publie'
    or author_id in (select id from public.community_profiles where user_id = auth.uid())
  );

drop policy if exists "Create own posts" on public.community_posts;
create policy "Create own posts" on public.community_posts
  for insert
  with check (author_id in (select id from public.community_profiles where user_id = auth.uid()));

-- Pas d'update/delete direct par l'app : les changements de statut passent
-- par la modération (service_role), pas de policy update/delete pour
-- anon/authenticated ici.

-- ============================================================
-- 4. Commentaires
-- ============================================================

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.community_profiles(id) on delete cascade,
  contenu_texte text not null check (char_length(contenu_texte) between 1 and 500),
  statut text not null default 'publie'
    check (statut in ('publie', 'masque_filtre_auto', 'masque_signalement', 'supprime')),
  nb_signalements integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.community_comments enable row level security;

drop trigger if exists trg_community_comments_auto_filter on public.community_comments;
create trigger trg_community_comments_auto_filter
  before insert on public.community_comments
  for each row execute function public.community_apply_auto_filter();

drop trigger if exists trg_community_comments_updated_at on public.community_comments;
create trigger trg_community_comments_updated_at
  before update on public.community_comments
  for each row execute function public.community_set_updated_at();

drop policy if exists "Read published or own comments" on public.community_comments;
create policy "Read published or own comments" on public.community_comments
  for select
  using (
    statut = 'publie'
    or author_id in (select id from public.community_profiles where user_id = auth.uid())
  );

drop policy if exists "Create own comments" on public.community_comments;
create policy "Create own comments" on public.community_comments
  for insert
  with check (author_id in (select id from public.community_profiles where user_id = auth.uid()));

-- ============================================================
-- 5. Signalements
-- ============================================================

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'commentaire', 'profil')),
  target_id uuid not null,
  reporter_id uuid not null references public.community_profiles(id) on delete cascade,
  motif text not null
    check (motif in ('contenu_inapproprie', 'harcelement', 'desinformation', 'spam', 'autre')),
  description text,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'traite_action', 'traite_rejete')),
  traite_par text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.community_reports enable row level security;

-- Aucune lecture publique, même pas pour le signalant : les signalements ne
-- sont visibles que par service_role (Yannick via le dashboard Supabase, ou
-- un futur back-office). Seule l'écriture de son propre signalement est
-- ouverte.
drop policy if exists "Create own report" on public.community_reports;
create policy "Create own report" on public.community_reports
  for insert
  with check (reporter_id in (select id from public.community_profiles where user_id = auth.uid()));

-- Incrémente nb_signalements sur la cible quand un signalement est créé,
-- pour prioriser la file de modération sans recompter à chaque lecture.
create or replace function public.community_increment_report_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.target_type = 'post' then
    update public.community_posts set nb_signalements = nb_signalements + 1 where id = NEW.target_id;
  elsif NEW.target_type = 'commentaire' then
    update public.community_comments set nb_signalements = nb_signalements + 1 where id = NEW.target_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_community_reports_increment on public.community_reports;
create trigger trg_community_reports_increment
  after insert on public.community_reports
  for each row execute function public.community_increment_report_count();
