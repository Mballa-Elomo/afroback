-- AFROBACK Mobile — schéma Postgres pour le pilier Marketplace
-- Généré le 2026-07-31.
--
-- Décisions appliquées ici (cadrées par Yannick, 2026-07-31, Option A —
-- infrastructure complète, états vides honnêtes) :
--   - Aucune donnée de vendeur/produit inventée : ce fichier ne contient QUE
--     le schéma, comme schema-communaute.sql. Catalogue vide au démarrage.
--   - Identité vendeur PUBLIQUE (contrairement au pseudonymat de
--     community_profiles) : un vendeur est un compte commercial, il a
--     besoin d'être identifiable (nom de boutique, région, artisanat).
--   - Paiement Mobile Money non intégré : une commande est créée avec le
--     statut 'en_attente_paiement', jamais un faux statut "payée".
--   - Aucun taux de commission ni palier d'abonnement vendeur codé en dur :
--     ce n'est pas une donnée cosmétique comme une couleur, c'est une
--     décision de modèle économique que Yannick n'a pas encore prise (voir
--     "Points bloquants" dans context/AFROBACK.md, séquencement du modèle
--     économique). Le schéma reste donc volontairement sans colonnes de
--     commission/palier ; l'UI vendeur traite cette zone comme
--     "pas encore configurée", pas comme "gratuite" ou avec un taux inventé.
--
-- Une commande "checkout" peut contenir des produits de plusieurs vendeurs :
-- pour que chaque vendeur ne voie que ses propres commandes (RLS simple,
-- pratique courante en marketplace multi-vendeurs), le panier est éclaté en
-- UNE ligne `marketplace_orders` PAR VENDEUR au moment du paiement, chacune
-- avec son propre sous-total et ses propres articles (jsonb, snapshot des
-- prix au moment de l'achat — un produit modifié/supprimé après coup
-- n'altère jamais une commande déjà passée).

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Vendeurs
-- ============================================================

create table if not exists public.marketplace_vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nom_boutique text not null check (char_length(nom_boutique) between 2 and 60),
  region text not null,
  artisanat text not null check (char_length(artisanat) between 2 and 60),
  bio text check (char_length(bio) <= 500),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.marketplace_vendors enable row level security;

drop policy if exists "Own vendor full read" on public.marketplace_vendors;
create policy "Own vendor full read" on public.marketplace_vendors
  for select
  using (user_id = auth.uid());

drop policy if exists "Create own vendor" on public.marketplace_vendors;
create policy "Create own vendor" on public.marketplace_vendors
  for insert
  with check (user_id = auth.uid());

drop policy if exists "Update own vendor" on public.marketplace_vendors;
create policy "Update own vendor" on public.marketplace_vendors
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke update on public.marketplace_vendors from authenticated;
grant update (nom_boutique, region, artisanat, bio, avatar_url) on public.marketplace_vendors to authenticated;

-- Vue publique : identité du vendeur volontairement identifiable (à la
-- différence de community_profiles_public), mais user_id reste caché — pas
-- de raison d'exposer l'id de compte brut même pour un profil public.
create or replace view public.marketplace_vendors_public as
  select id, nom_boutique, region, artisanat, bio, avatar_url, created_at
  from public.marketplace_vendors
  where is_active;

grant select on public.marketplace_vendors_public to anon, authenticated;

-- ============================================================
-- 2. Produits
-- ============================================================

create table if not exists public.marketplace_products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.marketplace_vendors(id) on delete cascade,
  nom text not null check (char_length(nom) between 2 and 80),
  description text check (char_length(description) <= 2000),
  categorie text not null default 'autre'
    check (categorie in ('sculpture', 'bijoux', 'textile', 'poterie', 'peinture', 'instrument', 'autre')),
  prix_fcfa integer not null check (prix_fcfa > 0),
  stock integer not null default 0 check (stock >= 0),
  statut text not null default 'en_ligne' check (statut in ('en_ligne', 'rupture')),
  image_url text,
  vues integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_products enable row level security;

-- Le statut suit le stock automatiquement (pas de bouton "en rupture"
-- manuel qui pourrait se désynchroniser du stock réel) — même logique de
-- trigger que le filtre automatique communautaire : une donnée dérivée est
-- calculée côté base, pas laissée à la discrétion de l'app cliente.
create or replace function public.marketplace_sync_product_statut()
returns trigger
language plpgsql
as $$
begin
  NEW.statut := case when NEW.stock <= 0 then 'rupture' else 'en_ligne' end;
  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists trg_marketplace_products_statut on public.marketplace_products;
create trigger trg_marketplace_products_statut
  before insert or update on public.marketplace_products
  for each row execute function public.marketplace_sync_product_statut();

-- Lecture publique des produits d'un vendeur actif, ou de ses propres
-- produits même si sa boutique est désactivée (pour qu'il continue à les
-- gérer depuis son espace vendeur).
--
-- BUG corrigé le 2026-07-31 (produit ajouté invisible dans /marche) : la
-- première version de cette policy faisait `select id from
-- public.marketplace_vendors where is_active` — une sous-requête sur la
-- TABLE de base, qui est elle-même protégée par RLS (seule policy :
-- `user_id = auth.uid()`). Résultat : cette sous-requête ne renvoyait
-- JAMAIS aucune ligne pour qui que ce soit d'autre que le vendeur
-- lui-même (vérifié : `select ... from marketplace_vendors` en anon
-- renvoie `[]`), donc la clause "produit d'un vendeur actif" ne
-- fonctionnait pour personne — seul le second membre de la clause OU
-- (ses propres produits) permettait de voir quoi que ce soit, et
-- seulement au vendeur connecté sur son propre compte. Corrigé en
-- interrogeant la VUE `marketplace_vendors_public` : une vue s'exécute
-- avec les droits de son propriétaire (qui contourne la RLS de la table
-- de base), exactement le même mécanisme qui permet déjà à cette vue
-- d'être lisible publiquement.
drop policy if exists "Read products public or own" on public.marketplace_products;
create policy "Read products public or own" on public.marketplace_products
  for select
  using (
    vendor_id in (select id from public.marketplace_vendors_public)
    or vendor_id in (select id from public.marketplace_vendors where user_id = auth.uid())
  );

drop policy if exists "Vendor manages own products" on public.marketplace_products;
create policy "Vendor manages own products" on public.marketplace_products
  for all
  using (vendor_id in (select id from public.marketplace_vendors where user_id = auth.uid()))
  with check (vendor_id in (select id from public.marketplace_vendors where user_id = auth.uid()));

-- ============================================================
-- 3. Commandes (une ligne par vendeur, voir note en tête de fichier)
-- ============================================================

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid not null references public.marketplace_vendors(id) on delete cascade,
  items jsonb not null, -- [{ product_id, nom, prix_unitaire_fcfa, quantite }]
  montant_total_fcfa integer not null check (montant_total_fcfa > 0),
  livraison_nom_complet text not null,
  livraison_adresse text not null,
  livraison_ville text not null,
  livraison_telephone text not null,
  methode_paiement text not null check (methode_paiement in ('mtn_momo', 'orange_money')),
  -- Pas de statut "payee" : le paiement Mobile Money n'est pas intégré, une
  -- commande ne peut donc jamais passer automatiquement par ce statut.
  -- 'expediee'/'livree' restent gérables manuellement par le vendeur
  -- (pratique courante au Cameroun : confirmation de paiement par téléphone
  -- ou paiement à la livraison), sans jamais prétendre qu'un paiement en
  -- ligne a eu lieu.
  statut text not null default 'en_attente_paiement'
    check (statut in ('en_attente_paiement', 'expediee', 'livree', 'annulee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_orders enable row level security;

create or replace function public.marketplace_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists trg_marketplace_orders_updated_at on public.marketplace_orders;
create trigger trg_marketplace_orders_updated_at
  before update on public.marketplace_orders
  for each row execute function public.marketplace_set_updated_at();

-- L'acheteur voit ses propres commandes (toutes ses infos de livraison
-- incluses, c'est le sien) ; le vendeur voit les commandes qui le concernent
-- mais uniquement via une vue publique-vendeur qui masque les coordonnées
-- complètes de livraison au-delà de ce qui lui est nécessaire pour expédier
-- (nom, ville, téléphone restent visibles — nécessaires à l'expédition —
-- l'adresse complète aussi, mais jamais buyer_user_id brut).
drop policy if exists "Buyer reads own orders" on public.marketplace_orders;
create policy "Buyer reads own orders" on public.marketplace_orders
  for select
  using (buyer_user_id = auth.uid());

drop policy if exists "Vendor reads own orders" on public.marketplace_orders;
create policy "Vendor reads own orders" on public.marketplace_orders
  for select
  using (vendor_id in (select id from public.marketplace_vendors where user_id = auth.uid()));

drop policy if exists "Buyer creates own order" on public.marketplace_orders;
create policy "Buyer creates own order" on public.marketplace_orders
  for insert
  with check (buyer_user_id = auth.uid());

-- Le vendeur peut uniquement faire évoluer le statut (ex. "marquer comme
-- expédiée"), jamais réécrire les articles ou le montant d'une commande déjà
-- passée.
revoke update on public.marketplace_orders from authenticated;
grant update (statut) on public.marketplace_orders to authenticated;

drop policy if exists "Vendor updates order statut" on public.marketplace_orders;
create policy "Vendor updates order statut" on public.marketplace_orders
  for update
  using (vendor_id in (select id from public.marketplace_vendors where user_id = auth.uid()))
  with check (vendor_id in (select id from public.marketplace_vendors where user_id = auth.uid()));

-- ============================================================
-- 4. Avis produit
-- ============================================================

create table if not exists public.marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.marketplace_products(id) on delete cascade,
  buyer_user_id uuid not null references auth.users(id) on delete cascade,
  auteur_nom text not null check (char_length(auteur_nom) between 2 and 40),
  note integer not null check (note between 1 and 5),
  commentaire text not null check (char_length(commentaire) between 1 and 1000),
  image_url text,
  reponse_vendeur text check (char_length(reponse_vendeur) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.marketplace_reviews enable row level security;

-- Vue publique : jamais buyer_user_id, tout le reste (y compris le nom
-- choisi par l'acheteur pour l'avis) est public par nature d'un avis produit.
create or replace view public.marketplace_reviews_public as
  select id, product_id, auteur_nom, note, commentaire, image_url, reponse_vendeur, created_at
  from public.marketplace_reviews;

grant select on public.marketplace_reviews_public to anon, authenticated;

drop policy if exists "Own review full read" on public.marketplace_reviews;
create policy "Own review full read" on public.marketplace_reviews
  for select
  using (buyer_user_id = auth.uid());

drop policy if exists "Create own review" on public.marketplace_reviews;
create policy "Create own review" on public.marketplace_reviews
  for insert
  with check (buyer_user_id = auth.uid());

-- Seul le vendeur du produit concerné peut répondre (reponse_vendeur),
-- jamais modifier la note ni le commentaire de l'acheteur.
revoke update on public.marketplace_reviews from authenticated;
grant update (reponse_vendeur) on public.marketplace_reviews to authenticated;

drop policy if exists "Vendor replies to review" on public.marketplace_reviews;
create policy "Vendor replies to review" on public.marketplace_reviews
  for update
  using (
    product_id in (
      select p.id from public.marketplace_products p
      join public.marketplace_vendors v on v.id = p.vendor_id
      where v.user_id = auth.uid()
    )
  )
  with check (
    product_id in (
      select p.id from public.marketplace_products p
      join public.marketplace_vendors v on v.id = p.vendor_id
      where v.user_id = auth.uid()
    )
  );
