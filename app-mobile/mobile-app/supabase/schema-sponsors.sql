-- =====================================================================
-- AFROBACK — Sponsors (2026-10-15)
-- Cahier des charges : backoffice/cdc-module-sponsors.md (§ 4).
-- À exécuter dans le SQL Editor de Supabase. Idempotent.
--
-- Le contrat (contact, montant, notes) n'est lisible que par le back-office.
-- L'app et le site ne lisent que sponsors_publics() et n'écrivent que des
-- compteurs anonymes via sponsor_mesure().
-- =====================================================================

-- 1. Sponsors ------------------------------------------------------------
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(nom) between 2 and 80),
  logo_url text,
  site_url text check (site_url is null or site_url ~* '^https?://'),
  description_fr text check (char_length(description_fr) <= 600),
  description_en text check (char_length(description_en) <= 600),
  contact_nom text,
  contact_email text,
  contact_telephone text,
  montant_fcfa integer check (montant_fcfa is null or montant_fcfa >= 0),
  date_debut date,
  date_fin date,
  actif boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (date_fin is null or date_debut is null or date_fin >= date_debut)
);
alter table public.sponsors enable row level security;
revoke all on public.sponsors from anon, authenticated;

-- 2. Emplacements --------------------------------------------------------
create table if not exists public.sponsor_emplacements (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references public.sponsors(id) on delete cascade,
  format text not null check (format in ('banniere_accueil', 'presente_par', 'fin_video', 'page_partenaires')),
  -- Contenu ciblé (« Présenté par » et fin de vidéo) ; null = tous les contenus (fin de vidéo seulement).
  cible_type text check (cible_type is null or cible_type in ('heros', 'mythe', 'decouverte')),
  cible_slug text,
  accroche_fr text check (char_length(accroche_fr) <= 160),
  accroche_en text check (char_length(accroche_en) <= 160),
  actif boolean not null default true,
  created_at timestamptz not null default now(),
  check (format <> 'presente_par' or (cible_type is not null and cible_slug is not null))
);
create index if not exists sponsor_emplacements_sponsor_idx on public.sponsor_emplacements (sponsor_id);
alter table public.sponsor_emplacements enable row level security;
revoke all on public.sponsor_emplacements from anon, authenticated;

-- 3. Statistiques (compteurs par jour, sans donnée personnelle) ----------
create table if not exists public.sponsor_stats (
  emplacement_id uuid not null references public.sponsor_emplacements(id) on delete cascade,
  jour date not null default current_date,
  affichages integer not null default 0,
  clics integer not null default 0,
  primary key (emplacement_id, jour)
);
alter table public.sponsor_stats enable row level security;
revoke all on public.sponsor_stats from anon, authenticated;

-- 4. Lecture publique : emplacements actifs du jour, sans le contrat -----
create or replace function public.sponsors_publics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'emplacement_id', e.id,
    'format', e.format,
    'cible_type', e.cible_type,
    'cible_slug', e.cible_slug,
    'accroche_fr', e.accroche_fr,
    'accroche_en', e.accroche_en,
    'sponsor', jsonb_build_object(
      'id', s.id,
      'nom', s.nom,
      'logo_url', s.logo_url,
      'site_url', s.site_url,
      'description_fr', s.description_fr,
      'description_en', s.description_en
    )
  )), '[]'::jsonb)
  from public.sponsor_emplacements e
  join public.sponsors s on s.id = e.sponsor_id
  where s.actif and e.actif
    and (s.date_debut is null or s.date_debut <= current_date)
    and (s.date_fin is null or s.date_fin >= current_date);
$$;
grant execute on function public.sponsors_publics() to anon, authenticated;

-- 5. Mesure : un affichage ou un clic, agrégé par jour -------------------
create or replace function public.sponsor_mesure(p_emplacement uuid, p_type text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_type not in ('affichage', 'clic') then
    return;
  end if;
  -- Seuls les emplacements réellement en ligne sont comptés.
  if not exists (
    select 1 from public.sponsor_emplacements e join public.sponsors s on s.id = e.sponsor_id
    where e.id = p_emplacement and e.actif and s.actif
      and (s.date_debut is null or s.date_debut <= current_date)
      and (s.date_fin is null or s.date_fin >= current_date)
  ) then
    return;
  end if;
  insert into public.sponsor_stats (emplacement_id, jour, affichages, clics)
  values (p_emplacement, current_date, case when p_type = 'affichage' then 1 else 0 end, case when p_type = 'clic' then 1 else 0 end)
  on conflict (emplacement_id, jour) do update
    set affichages = public.sponsor_stats.affichages + excluded.affichages,
        clics = public.sponsor_stats.clics + excluded.clics;
end;
$$;
grant execute on function public.sponsor_mesure(uuid, text) to anon, authenticated;
