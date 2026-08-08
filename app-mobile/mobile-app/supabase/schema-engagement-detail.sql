-- Extension du schéma d'engagement (schema-engagement.sql, 2026-08-06 matin)
-- pour descendre au niveau du média précis, demande de Yannick le 2026-08-06
-- (après-midi) : savoir quel audio (FR ou EN) est le plus écouté, et quel
-- chapitre vidéo est le plus regardé, dans quelle langue.
--
-- ⚠️ DÉPEND de schema-engagement.sql : ce fichier suppose que la table
-- `public.hero_engagement` existe déjà (colonnes `lectures_recit`,
-- `ecoutes_audio`, `visionnages_video`). Si `schema-engagement.sql` n'a pas
-- encore été exécuté, exécute-le D'ABORD, puis celui-ci. Les deux sont
-- idempotents (sûrs à rejouer), donc si tu as un doute sur ce qui a déjà
-- tourné, il n'y a pas de risque à relancer les deux dans l'ordre.
--
-- Ce qui NE change PAS : `lectures_recit` reste un seul compteur par héros —
-- vérifié dans recit.tsx, il n'y a pas de notion de "quelle langue était
-- affichée au moment de l'ouverture" qui ait du sens à isoler (le choix
-- FR/EN est un réglage d'affichage après coup, pas un événement déclenché).
--
-- Ce qui change : l'audio distingue FR/EN (2 colonnes ajoutées à
-- hero_engagement) ; la vidéo par chapitre × langue a sa propre table
-- (cardinalité variable, jusqu'à 4 chapitres × 2 langues mais rarement tous
-- remplis — cohérent avec la façon dont `video_chapitres` est déjà modélisé
-- en jsonb côté `heros`, plutôt qu'un jeu de colonnes fixes).
--
-- Relation avec les totaux agrégés existants (Dashboard, liste, panneau
-- ENGAGEMENT GLOBAL de la fiche héros) : `ecoutes_audio` reste la somme
-- exacte de `ecoutes_audio_fr` + `ecoutes_audio_en` (un seul chemin
-- d'enregistrement possible pour l'audio, donc toujours cohérent).
-- `visionnages_video`, en revanche, N'EST PAS la somme des lignes de
-- `hero_video_chapter_engagement` : l'agrégat compte TOUT visionnage de
-- contenu vidéo réel (documentaire unique, diaporama de storyboard, ou
-- chapitre produit), alors que le détail par chapitre × langue ne concerne
-- QUE les chapitres réellement produits (`video_chapitres`) — un héros qui
-- n'a que le diaporama storyboard incrémente l'agrégat sans jamais
-- alimenter la table de détail. Différence attendue, pas un bug de calcul.

alter table public.hero_engagement
  add column if not exists ecoutes_audio_fr integer not null default 0,
  add column if not exists ecoutes_audio_en integer not null default 0;

create table if not exists public.hero_video_chapter_engagement (
  hero_id uuid not null references public.heros(id) on delete cascade,
  chapitre_numero integer not null,
  langue text not null check (langue in ('fr', 'en')),
  visionnages integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (hero_id, chapitre_numero, langue)
);

alter table public.hero_video_chapter_engagement enable row level security;
-- Même principe que hero_engagement : aucune policy, écriture exclusivement
-- via la fonction SECURITY DEFINER ci-dessous, lecture exclusivement via le
-- back-office (clé service_role, contourne RLS).

-- Remplace l'ancien usage générique de increment_hero_engagement() pour
-- l'audio : incrémente à la fois le compteur de la langue précise ET le
-- total agrégé (ecoutes_audio), dans le même upsert atomique — les deux
-- restent donc garantis synchronisés (fr + en = total), sans dépendre de
-- deux appels séparés côté app.
create or replace function public.increment_audio_engagement(p_hero_id uuid, p_langue text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_langue not in ('fr', 'en') then
    raise exception 'langue invalide: %', p_langue;
  end if;

  insert into public.hero_engagement (hero_id, ecoutes_audio, ecoutes_audio_fr, ecoutes_audio_en)
  values (
    p_hero_id,
    1,
    case when p_langue = 'fr' then 1 else 0 end,
    case when p_langue = 'en' then 1 else 0 end
  )
  on conflict (hero_id) do update set
    ecoutes_audio = hero_engagement.ecoutes_audio + 1,
    ecoutes_audio_fr = hero_engagement.ecoutes_audio_fr + case when p_langue = 'fr' then 1 else 0 end,
    ecoutes_audio_en = hero_engagement.ecoutes_audio_en + case when p_langue = 'en' then 1 else 0 end,
    updated_at = now();
end;
$$;

-- Détail par chapitre × langue — n'alimente PAS le total agrégé
-- `visionnages_video` (déjà incrémenté séparément par
-- increment_hero_engagement(hero_id, 'video'), appelé par l'app pour TOUT
-- contenu vidéo réel montré, chapitre produit ou non — voir le commentaire
-- en tête de fichier).
create or replace function public.increment_video_chapter_engagement(p_hero_id uuid, p_chapitre integer, p_langue text)
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

  insert into public.hero_video_chapter_engagement (hero_id, chapitre_numero, langue, visionnages)
  values (p_hero_id, p_chapitre, p_langue, 1)
  on conflict (hero_id, chapitre_numero, langue) do update set
    visionnages = hero_video_chapter_engagement.visionnages + 1,
    updated_at = now();
end;
$$;

grant execute on function public.increment_audio_engagement(uuid, text) to anon, authenticated;
grant execute on function public.increment_video_chapter_engagement(uuid, integer, text) to anon, authenticated;
