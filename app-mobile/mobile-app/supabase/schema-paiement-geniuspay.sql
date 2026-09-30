-- =====================================================================
-- AFROBACK — Paiements Mobile Money via GeniusPay (Module 4, lot B)
-- Cahier des charges : app-mobile/cdc-paiement-geniuspay.md (2026-09-29)
-- À exécuter dans le SQL Editor de Supabase, APRÈS schema-acces-abonnement.sql.
-- Idempotent (sans risque à relancer).
--
-- Règles :
--   - une ligne `paiements` est créée par la fonction serveur "geniuspay"
--     (clé service_role) AVANT l'envoi vers GeniusPay ; l'app ne peut ni en
--     créer ni en modifier (lecture de ses propres paiements seulement) ;
--   - le montant est fixé par le serveur, jamais par l'app ;
--   - crediter_paiement() n'est appelée qu'après confirmation du statut
--     directement auprès de GeniusPay ; un même paiement ne crédite qu'une
--     fois, même si la confirmation arrive plusieurs fois.
-- =====================================================================

create table if not exists public.paiements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('abonnement', 'don')),
  plan text check (plan in ('racines', 'heritage')),
  periode text check (periode in ('monthly', 'yearly')),
  montant_fcfa integer not null check (montant_fcfa >= 200),
  anonyme boolean not null default false,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'reussi', 'echoue', 'annule', 'expire', 'rembourse')),
  reference text unique,           -- référence GeniusPay (MTX-…)
  checkout_url text,
  frais_fcfa integer,
  moyen text,                      -- opérateur utilisé, si GeniusPay le renvoie
  environnement text,              -- sandbox / live
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_at timestamptz not null default now(),
  confirme_le timestamptz,
  check (type <> 'abonnement' or (plan is not null and periode is not null))
);
create index if not exists paiements_user_idx on public.paiements (user_id, created_at desc);

alter table public.paiements enable row level security;
drop policy if exists "Read own payments" on public.paiements;
create policy "Read own payments" on public.paiements for select using (user_id = auth.uid());
revoke insert, update, delete on public.paiements from anon, authenticated;

-- Paiement confirmé par GeniusPay : marque la ligne "reussi" et, pour un
-- abonnement, ajoute 1 mois ou 12 mois APRÈS la fin de l'abonnement en cours
-- (les jours restants sont conservés). Réservé au serveur.
create or replace function public.crediter_paiement(
  p_paiement_id uuid,
  p_frais integer default null,
  p_moyen text default null,
  p_environnement text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_p public.paiements;
  v_debut timestamptz;
  v_fin timestamptz;
  v_sub uuid;
begin
  -- Verrou de ligne + condition sur le statut : deux confirmations simultanées ne créditent qu'une fois.
  update public.paiements
     set statut = 'reussi', confirme_le = now(),
         frais_fcfa = coalesce(p_frais, frais_fcfa),
         moyen = coalesce(p_moyen, moyen),
         environnement = coalesce(p_environnement, environnement)
   where id = p_paiement_id and statut <> 'reussi'
  returning * into v_p;

  if v_p.id is null then
    return jsonb_build_object('ok', true, 'deja_credite', true);
  end if;

  if v_p.type = 'abonnement' then
    select greatest(now(), coalesce(max(ends_at), now())) into v_debut
      from public.subscriptions
     where user_id = v_p.user_id and status = 'active' and plan = v_p.plan and ends_at is not null;
    v_fin := v_debut + case when v_p.periode = 'yearly' then interval '12 months' else interval '1 month' end;
    insert into public.subscriptions (user_id, plan, status, source, starts_at, ends_at, note)
    values (v_p.user_id, v_p.plan, 'active', 'paiement', v_debut, v_fin, 'GeniusPay ' || coalesce(v_p.reference, v_p.id::text))
    returning id into v_sub;
    update public.paiements set subscription_id = v_sub where id = v_p.id;
    return jsonb_build_object('ok', true, 'ends_at', v_fin);
  end if;

  return jsonb_build_object('ok', true);
end;
$$;
revoke execute on function public.crediter_paiement(uuid, integer, text, text) from public, anon, authenticated;
grant execute on function public.crediter_paiement(uuid, integer, text, text) to service_role;

-- Le forfait "à venir" (payé d'avance) compte aussi comme actif dès sa date de début :
-- has_active_subscription() et mon_abonnement() filtrent déjà sur starts_at <= now().
-- mon_abonnement() renvoie la date de fin la plus lointaine du forfait en cours,
-- pour afficher "jusqu'au …" en tenant compte d'un renouvellement anticipé.
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
              'source', s.source)
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
