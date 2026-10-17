-- =====================================================================
-- AFROBACK — Galerie d'images d'un récit (2026-10-15)
-- Affichée à côté du texte dans le lecteur du site (colonne de droite).
-- À exécuter dans le SQL Editor de Supabase. Idempotent.
--
-- Une galerie par récit (héros, mythe, Découverte), pas par chapitre.
-- nature = 'archive' (photo, objet, document réel, crédit obligatoire)
--        | 'illustration' (image créée pour AFROBACK, jamais présentée
--          comme une archive : même séparation fait / légende que les récits).
-- Le site et l'app ne lisent que les images publiées ; l'écriture se fait
-- par le back-office (clé de service) ou le SQL Editor.
-- =====================================================================

create table if not exists public.galerie_images (
  id uuid primary key default gen_random_uuid(),
  type_contenu text not null check (type_contenu in ('heros', 'mythe', 'decouverte')),
  slug text not null,
  ordre integer not null default 1,
  nature text not null check (nature in ('archive', 'illustration')),
  url text not null check (url ~* '^https://'),
  legende_fr text not null check (char_length(legende_fr) between 3 and 300),
  legende_en text check (char_length(legende_en) <= 300),
  credit text check (char_length(credit) <= 200),
  source_url text check (source_url is null or source_url ~* '^https?://'),
  publie boolean not null default true,
  created_at timestamptz not null default now(),
  check (nature = 'illustration' or credit is not null)
);

create index if not exists galerie_images_contenu_idx
  on public.galerie_images (type_contenu, slug, ordre);

alter table public.galerie_images enable row level security;
revoke all on public.galerie_images from anon, authenticated;
grant select on public.galerie_images to anon, authenticated;

drop policy if exists "Galerie publique" on public.galerie_images;
create policy "Galerie publique" on public.galerie_images
  for select to anon, authenticated
  using (publie);
