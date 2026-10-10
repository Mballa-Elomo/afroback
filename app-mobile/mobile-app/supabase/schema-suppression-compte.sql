-- AFROBACK — Suppression de compte par l'utilisateur (exigence Google Play).
-- Cahier des charges : app-mobile/cdc-play-store.md (lot 1). 2026-10-08.
--
-- À exécuter dans le SQL Editor du dashboard Supabase. Idempotent.
--
-- Toutes les tables liées au compte sont déjà en `on delete cascade` vers
-- auth.users : supprimer la ligne de auth.users supprime profil, posts,
-- commentaires, profils enfants, boutique, commandes, abonnement, quiz,
-- appareils, facteurs 2FA. Seule exception voulue : les paiements, conservés
-- anonymisés pour la comptabilité (le lien vers le compte passe à null).
-- Les photos du stockage `user-uploads` sont effacées par l'app avant l'appel
-- (la policy "Users delete own files" l'autorise), Supabase interdisant de
-- supprimer des fichiers du stockage directement en SQL.

-- 1. Paiements : conservés, anonymisés à la suppression du compte.
do $$
begin
  if to_regclass('public.paiements') is not null then
    alter table public.paiements alter column user_id drop not null;
    alter table public.paiements drop constraint if exists paiements_user_id_fkey;
    alter table public.paiements
      add constraint paiements_user_id_fkey foreign key (user_id) references auth.users(id) on delete set null;
  end if;
end $$;

-- 2. Suppression du compte connecté, et de lui seul.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_phone text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select phone into v_phone from auth.users where id = v_uid;

  -- Tentatives de connexion liées au téléphone (données personnelles).
  if v_phone is not null and to_regclass('public.login_attempts') is not null then
    delete from public.login_attempts where phone = v_phone or phone = '+' || v_phone;
  end if;

  -- Trace de sécurité, sans email ni téléphone.
  if to_regclass('public.security_events') is not null then
    insert into public.security_events (event_type, phone, detail)
    values ('account_deleted', null, jsonb_build_object('user_id_prefix', left(v_uid::text, 8)));
  end if;

  -- Cascade sur toutes les tables liées ; paiements anonymisés (étape 1).
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
