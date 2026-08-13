-- AFROBACK — extension du pilier Mythologie : publication, mise en avant,
-- récit EN, vidéo par chapitre × langue, audio EN, engagement réel. Généré
-- le 2026-08-12, à exécuter dans le SQL Editor du dashboard Supabase, après
-- schema-mythologie.sql (déjà exécuté).
--
-- Objectif : amener le back-office Mythologie à parité avec Héros (demande
-- de Yannick) — mêmes mécanismes que heros/hero_engagement/
-- hero_video_chapter_engagement, réutilisés à l'identique puisque la
-- mythologie a la même forme qu'un récit de héros (4 chapitres, FR/EN,
-- audio, vidéo par chapitre).

alter table public.mythes
  add column if not exists statut_publication text not null default 'publie'
    check (statut_publication in ('publie', 'depublie'));

alter table public.mythes
  add column if not exists a_la_une boolean not null default false;

-- Récit anglais : structure identique à `recit_chapitres_fr` (jsonb,
-- tableau de {numero, titre, texte}), vide pour l'instant — aucun mythe n'a
-- de version anglaise à ce jour, pas de contenu inventé pour remplir.
alter table public.mythes
  add column if not exists recit_chapitres_en jsonb not null default '[]'::jsonb;

-- Narration existante (`narration_audio_url`) traitée comme la version FR ;
-- nouvelle colonne pour l'EN, même paire que `heros.narration_audio_fr_url`/
-- `narration_audio_en_url` (colonnes fixes, pas jsonb, cohérent avec heros).
alter table public.mythes
  add column if not exists narration_audio_url_en text;

-- Vidéo par chapitre × langue : même forme que `heros.video_chapitres`
-- (tableau de {numero, titre_chapitre, videos: {langue: url}}).
alter table public.mythes
  add column if not exists video_chapitres jsonb not null default '[]'::jsonb;

create table if not exists public.mythe_engagement (
  mythe_id uuid primary key references public.mythes(id) on delete cascade,
  lectures_recit integer not null default 0,
  ecoutes_audio integer not null default 0,
  ecoutes_audio_fr integer not null default 0,
  ecoutes_audio_en integer not null default 0,
  visionnages_video integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.mythe_engagement enable row level security;
-- Aucune policy : même principe que hero_engagement — écriture uniquement
-- via les fonctions SECURITY DEFINER ci-dessous, lecture uniquement via le
-- back-office (clé service_role).

create table if not exists public.mythe_video_chapter_engagement (
  mythe_id uuid not null references public.mythes(id) on delete cascade,
  chapitre_numero integer not null,
  langue text not null check (langue in ('fr', 'en')),
  visionnages integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (mythe_id, chapitre_numero, langue)
);

alter table public.mythe_video_chapter_engagement enable row level security;

create or replace function public.increment_mythe_engagement(p_mythe_id uuid, p_event text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event not in ('recit', 'video') then
    raise exception 'type d''evenement invalide: %', p_event;
  end if;

  insert into public.mythe_engagement (mythe_id, lectures_recit, visionnages_video)
  values (
    p_mythe_id,
    case when p_event = 'recit' then 1 else 0 end,
    case when p_event = 'video' then 1 else 0 end
  )
  on conflict (mythe_id) do update set
    lectures_recit = mythe_engagement.lectures_recit + case when p_event = 'recit' then 1 else 0 end,
    visionnages_video = mythe_engagement.visionnages_video + case when p_event = 'video' then 1 else 0 end,
    updated_at = now();
end;
$$;

create or replace function public.increment_mythe_audio_engagement(p_mythe_id uuid, p_langue text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_langue not in ('fr', 'en') then
    raise exception 'langue invalide: %', p_langue;
  end if;

  insert into public.mythe_engagement (mythe_id, ecoutes_audio, ecoutes_audio_fr, ecoutes_audio_en)
  values (
    p_mythe_id,
    1,
    case when p_langue = 'fr' then 1 else 0 end,
    case when p_langue = 'en' then 1 else 0 end
  )
  on conflict (mythe_id) do update set
    ecoutes_audio = mythe_engagement.ecoutes_audio + 1,
    ecoutes_audio_fr = mythe_engagement.ecoutes_audio_fr + case when p_langue = 'fr' then 1 else 0 end,
    ecoutes_audio_en = mythe_engagement.ecoutes_audio_en + case when p_langue = 'en' then 1 else 0 end,
    updated_at = now();
end;
$$;

create or replace function public.increment_mythe_video_chapter_engagement(p_mythe_id uuid, p_chapitre integer, p_langue text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_langue not in ('fr', 'en') then
    raise exception 'langue invalide: %', p_langue;
  end if;
  if p_chapitre is null or p_chapitre < 1 then
    raise exception 'numero de chapitre invalide: %', p_chapitre;
  end if;

  insert into public.mythe_video_chapter_engagement (mythe_id, chapitre_numero, langue, visionnages)
  values (p_mythe_id, p_chapitre, p_langue, 1)
  on conflict (mythe_id, chapitre_numero, langue) do update set
    visionnages = mythe_video_chapter_engagement.visionnages + 1,
    updated_at = now();
end;
$$;

grant execute on function public.increment_mythe_engagement(uuid, text) to anon, authenticated;
grant execute on function public.increment_mythe_audio_engagement(uuid, text) to anon, authenticated;
grant execute on function public.increment_mythe_video_chapter_engagement(uuid, integer, text) to anon, authenticated;
