-- =====================================================================
-- AFROBACK — "J'aime" sur les contenus + compteurs publics (façon YouTube)
-- Cahier des charges : app-mobile/cdc-jaime-compteurs.md (2026-09-30)
-- À exécuter dans le SQL Editor de Supabase, APRÈS schema-engagement*.sql,
-- schema-mythologie-extended.sql, schema-decouverte-extended.sql et
-- schema-acces-abonnement.sql. Idempotent (sans risque à relancer).
--
-- Décisions de Yannick : tous les comptes aiment (D1) ; pas de J'aime sur un
-- contenu réservé sans y avoir accès (D2) ; compteurs publics, l'app masque
-- ceux qui sont à zéro (D3).
-- Les compteurs de lectures / écoutes / vues existent déjà (août 2026) et
-- continuent d'être alimentés comme avant : on ne fait que les exposer.
-- =====================================================================

create table if not exists public.content_likes (
  content_type text not null check (content_type in ('heros', 'mythe', 'decouverte')),
  content_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (content_type, content_slug, user_id)
);
create index if not exists content_likes_content_idx on public.content_likes (content_type, content_slug);
alter table public.content_likes enable row level security;
revoke all on public.content_likes from anon, authenticated;

-- Compteurs d'un contenu (lectures, écoutes, vues, J'aime, "ai-je aimé").
create or replace function public._stats_un(p_type text, p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_lectures integer := 0;
  v_ecoutes integer := 0;
  v_vues integer := 0;
begin
  if p_type = 'heros' then
    select coalesce(e.lectures_recit, 0), coalesce(e.ecoutes_audio, 0),
           greatest(coalesce(e.visionnages_video, 0),
                    coalesce((select sum(c.visionnages) from public.hero_video_chapter_engagement c where c.hero_id = h.id), 0))
      into v_lectures, v_ecoutes, v_vues
      from public.heros h left join public.hero_engagement e on e.hero_id = h.id
     where h.slug = p_slug;
  elsif p_type = 'mythe' then
    select coalesce(e.lectures_recit, 0), coalesce(e.ecoutes_audio, 0),
           greatest(coalesce(e.visionnages_video, 0),
                    coalesce((select sum(c.visionnages) from public.mythe_video_chapter_engagement c where c.mythe_id = m.id), 0))
      into v_lectures, v_ecoutes, v_vues
      from public.mythes m left join public.mythe_engagement e on e.mythe_id = m.id
     where m.slug = p_slug;
  elsif p_type = 'decouverte' then
    select coalesce(e.consultations, 0), 0, coalesce(e.visionnages_video, 0)
      into v_lectures, v_ecoutes, v_vues
      from public.decouverte_items d left join public.decouverte_engagement e on e.item_id = d.id
     where d.slug = p_slug;
  end if;

  return jsonb_build_object(
    'slug', p_slug,
    'lectures', coalesce(v_lectures, 0),
    'ecoutes', coalesce(v_ecoutes, 0),
    'vues', coalesce(v_vues, 0),
    'likes', (select count(*) from public.content_likes l where l.content_type = p_type and l.content_slug = p_slug),
    'aime', auth.uid() is not null and exists (
      select 1 from public.content_likes l where l.content_type = p_type and l.content_slug = p_slug and l.user_id = auth.uid()
    )
  );
end;
$$;

-- Fiche d'un contenu (invités compris).
create or replace function public.stats_contenu(p_type text, p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public._stats_un(p_type, p_slug)
      || jsonb_build_object('peut_aimer', auth.uid() is not null and public.acces_contenu(p_type, p_slug));
$$;
grant execute on function public.stats_contenu(text, text) to anon, authenticated;

-- Listes (accueil, catalogues) : une seule requête pour toute la liste. Plafonné à 100 contenus.
create or replace function public.stats_contenus(p_type text, p_slugs text[])
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(public._stats_un(p_type, s)), '[]'::jsonb)
  from (select distinct unnest(p_slugs[1:100]) as s) x;
$$;
grant execute on function public.stats_contenus(text, text[]) to anon, authenticated;

-- J'aime / je n'aime plus. Réservé aux comptes qui ont accès au contenu.
create or replace function public.aimer_contenu(p_type text, p_slug text, p_aime boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'error', 'non_connecte'); end if;
  if p_type not in ('heros', 'mythe', 'decouverte') then return jsonb_build_object('ok', false, 'error', 'type'); end if;
  if not public.acces_contenu(p_type, p_slug) then return jsonb_build_object('ok', false, 'error', 'acces'); end if;
  if p_aime then
    insert into public.content_likes (content_type, content_slug, user_id) values (p_type, p_slug, auth.uid())
    on conflict do nothing;
  else
    delete from public.content_likes where content_type = p_type and content_slug = p_slug and user_id = auth.uid();
  end if;
  return jsonb_build_object(
    'ok', true,
    'aime', p_aime,
    'likes', (select count(*) from public.content_likes where content_type = p_type and content_slug = p_slug)
  );
end;
$$;
revoke execute on function public.aimer_contenu(text, text, boolean) from public, anon;
grant execute on function public.aimer_contenu(text, text, boolean) to authenticated;
