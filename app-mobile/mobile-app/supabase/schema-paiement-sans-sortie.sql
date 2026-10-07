-- =====================================================================
-- AFROBACK — Paiement sans quitter l'app ni le site, résiliation
-- Cahier des charges : app-mobile/cdc-paiement-sans-sortie.md (validé le 2026-10-07)
-- À exécuter dans le SQL Editor de Supabase, APRÈS schema-acces-abonnement.sql
-- et schema-paiement-geniuspay.sql. Idempotent : peut être relancé sans risque.
--
-- Ce script ne change rien au crédit des paiements (crediter_paiement) ni à
-- l'accès (has_active_subscription) : une résiliation ne coupe rien avant la
-- date de fin payée (décision de Yannick : pas de remboursement, accès
-- jusqu'à la fin).
--
-- Principe de la résiliation : chaque période payée est une ligne de
-- `subscriptions`. Résilier marque les périodes en cours ; un renouvellement
-- crée une nouvelle période non résiliée, ce qui relance l'abonnement de
-- lui-même. « Reprendre » efface la résiliation tant que la fin n'est pas passée.
-- =====================================================================

-- 1. Colonnes ----------------------------------------------------------
alter table public.subscriptions add column if not exists resilie_le timestamptz;

-- Paiement par demande directe (Campay /collect/) : numéro masqué et opérateur, pour l'affichage.
alter table public.paiements add column if not exists telephone_masque text;
alter table public.paiements add column if not exists operateur text;

-- 2. Mon abonnement : + date de résiliation et possibilité de résilier ---
-- "resilie_le" est celui de la période qui se termine le plus tard : si la
-- personne a renouvelé après avoir résilié, la nouvelle période n'est pas
-- résiliée et l'abonnement apparaît de nouveau actif.
create or replace function public.mon_abonnement()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select jsonb_build_object(
              'plan', s.plan,
              'ends_at', case when s.ends_at is null then null else (
                select max(s2.ends_at) from public.subscriptions s2
                 where s2.user_id = s.user_id and s2.plan = s.plan and s2.status = 'active'
              ) end,
              'source', s.source,
              'resilie_le', (
                select s3.resilie_le from public.subscriptions s3
                 where s3.user_id = s.user_id and s3.plan = s.plan and s3.status = 'active'
                 order by s3.ends_at desc nulls first
                 limit 1
              ),
              -- Seuls les abonnements payés se résilient (un abonnement offert n'a rien à arrêter).
              'resiliable', exists (
                select 1 from public.subscriptions s4
                 where s4.user_id = s.user_id and s4.status = 'active' and s4.source = 'paiement'
                   and s4.ends_at > now()
              ))
       from public.subscriptions s
      where s.user_id = auth.uid()
        and s.status = 'active'
        and s.starts_at <= now()
        and (s.ends_at is null or s.ends_at > now())
      order by case s.plan when 'heritage' then 0 else 1 end, s.ends_at desc nulls first
      limit 1),
    'null'::jsonb
  );
$$;
grant execute on function public.mon_abonnement() to anon, authenticated;

-- 3. Résilier / reprendre (personne connectée, ses propres périodes payées) --
create or replace function public.resilier_abonnement()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'non_authentifie');
  end if;
  update public.subscriptions
     set resilie_le = now()
   where user_id = auth.uid() and status = 'active' and source = 'paiement'
     and ends_at > now() and resilie_le is null;
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'periodes', v_n, 'abonnement', public.mon_abonnement());
end;
$$;
revoke execute on function public.resilier_abonnement() from public, anon;
grant execute on function public.resilier_abonnement() to authenticated;

create or replace function public.reprendre_abonnement()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'non_authentifie');
  end if;
  update public.subscriptions
     set resilie_le = null
   where user_id = auth.uid() and status = 'active' and source = 'paiement'
     and ends_at > now() and resilie_le is not null;
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'periodes', v_n, 'abonnement', public.mon_abonnement());
end;
$$;
revoke execute on function public.reprendre_abonnement() from public, anon;
grant execute on function public.reprendre_abonnement() to authenticated;

-- 4. Contrôle -------------------------------------------------------------
select proname from pg_proc
 where pronamespace = 'public'::regnamespace
   and proname in ('mon_abonnement', 'resilier_abonnement', 'reprendre_abonnement')
 order by proname;
