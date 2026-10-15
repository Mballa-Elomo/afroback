-- =====================================================================
-- AFROBACK — Modération du Marché (2026-10-15)
-- Cahier des charges : backoffice/cdc-module-marketplace.md (§ 2).
-- À exécuter APRÈS schema-marketplace.sql. Idempotent.
--
-- 1. Boutiques : validation par l'administrateur avant d'être visibles.
-- 2. Produits et avis : masquage par l'administrateur.
-- Le vendeur garde la main sur sa présentation, jamais sur ces décisions.
-- =====================================================================

-- 1. Boutiques -----------------------------------------------------------
alter table public.marketplace_vendors add column if not exists statut_validation text not null default 'en_attente';
alter table public.marketplace_vendors drop constraint if exists marketplace_vendors_statut_validation_check;
alter table public.marketplace_vendors add constraint marketplace_vendors_statut_validation_check
  check (statut_validation in ('en_attente', 'valide', 'refuse', 'suspendu'));
alter table public.marketplace_vendors add column if not exists motif_validation text;
alter table public.marketplace_vendors add column if not exists valide_le timestamptz;

-- Vue publique : seules les boutiques actives ET validées sont visibles
-- (les produits publics en dépendent via la policy existante).
create or replace view public.marketplace_vendors_public as
  select id, nom_boutique, region, artisanat, bio, avatar_url, created_at
  from public.marketplace_vendors
  where is_active and statut_validation = 'valide';
grant select on public.marketplace_vendors_public to anon, authenticated;

-- Le vendeur ne modifie que sa présentation (déjà le cas, réaffirmé ici).
revoke update on public.marketplace_vendors from authenticated;
grant update (nom_boutique, region, artisanat, bio, avatar_url) on public.marketplace_vendors to authenticated;
-- À la création, mêmes champs uniquement : impossible de se déclarer « validé ».
revoke insert on public.marketplace_vendors from authenticated;
grant insert (user_id, nom_boutique, region, artisanat, bio, avatar_url) on public.marketplace_vendors to authenticated;

-- 2. Produits ------------------------------------------------------------
alter table public.marketplace_products add column if not exists masque_admin boolean not null default false;
alter table public.marketplace_products add column if not exists motif_masquage text;

drop policy if exists "Read products public or own" on public.marketplace_products;
create policy "Read products public or own" on public.marketplace_products
  for select
  using (
    (vendor_id in (select id from public.marketplace_vendors_public) and not masque_admin)
    or vendor_id in (select id from public.marketplace_vendors where user_id = auth.uid())
  );

-- Le vendeur gère ses produits, sans pouvoir lever un masquage.
revoke update on public.marketplace_products from authenticated;
grant update (nom, description, categorie, prix_fcfa, stock, statut, image_url, vues, updated_at) on public.marketplace_products to authenticated;

-- 3. Avis ----------------------------------------------------------------
alter table public.marketplace_reviews add column if not exists masque_admin boolean not null default false;

create or replace view public.marketplace_reviews_public as
  select id, product_id, auteur_nom, note, commentaire, image_url, reponse_vendeur, created_at
  from public.marketplace_reviews
  where not masque_admin;
grant select on public.marketplace_reviews_public to anon, authenticated;
