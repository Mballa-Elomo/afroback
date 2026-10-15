-- =====================================================================
-- AFROBACK — Journal des visionnages vidéo par compte (2026-10-11)
-- Sert à repérer un usage anormal (lien partagé, compte prêté) depuis la
-- fiche de l'utilisateur dans le back-office. Les compteurs agrégés
-- existants (engagement) ne changent pas.
--
-- À exécuter dans le SQL Editor de Supabase. Idempotent.
-- =====================================================================

create table if not exists public.visionnages_comptes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type_contenu text not null check (type_contenu in ('heros', 'mythe', 'decouverte', 'ecole')),
  contenu_id text not null check (char_length(contenu_id) between 1 and 80),
  chapitre integer check (chapitre is null or chapitre between 0 and 99),
  langue text check (langue is null or char_length(langue) <= 8),
  plateforme text not null default 'app' check (plateforme in ('app', 'site', 'web')),
  created_at timestamptz not null default now()
);
create index if not exists visionnages_comptes_user_idx on public.visionnages_comptes (user_id, created_at desc);

alter table public.visionnages_comptes enable row level security;
-- Aucune policy : écriture uniquement par la fonction ci-dessous, lecture
-- uniquement par le back-office (clé service_role).
revoke all on public.visionnages_comptes from anon, authenticated;

-- Enregistre un visionnage pour le compte connecté. Un même chapitre dans la
-- même langue n'est compté qu'une fois par tranche de 30 minutes (évite
-- qu'un aller-retour dans l'app gonfle le journal).
create or replace function public.journaliser_visionnage(
  p_type text,
  p_contenu_id text,
  p_chapitre integer default null,
  p_langue text default null,
  p_plateforme text default 'app'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return;
  end if;
  if p_type not in ('heros', 'mythe', 'decouverte', 'ecole') or p_plateforme not in ('app', 'site', 'web') then
    return;
  end if;
  if exists (
    select 1 from public.visionnages_comptes
    where user_id = v_uid
      and type_contenu = p_type
      and contenu_id = left(p_contenu_id, 80)
      and chapitre is not distinct from p_chapitre
      and langue is not distinct from p_langue
      and created_at > now() - interval '30 minutes'
  ) then
    return;
  end if;
  insert into public.visionnages_comptes (user_id, type_contenu, contenu_id, chapitre, langue, plateforme)
  values (v_uid, p_type, left(p_contenu_id, 80), p_chapitre, left(p_langue, 8), p_plateforme);
end;
$$;
revoke all on function public.journaliser_visionnage(text, text, integer, text, text) from public, anon;
grant execute on function public.journaliser_visionnage(text, text, integer, text, text) to authenticated;
