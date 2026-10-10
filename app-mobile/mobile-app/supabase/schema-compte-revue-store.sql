-- AFROBACK — Compte de démonstration pour l'examen des stores (Google Play).
-- Cahier des charges : app-mobile/cdc-play-store.md. 2026-10-08.
--
-- Problème : les examinateurs de Google se connectent avec un compte de
-- démonstration depuis leurs propres appareils. La vérification "Nouvel
-- appareil" (schema-appareil-unique.sql) leur demanderait un code envoyé par
-- email, qu'ils ne peuvent pas lire, et la règle "un appareil à la fois"
-- déconnecterait un examinateur dès qu'un autre se connecte.
--
-- Solution : une liste de comptes dispensés de ces deux règles. Elle n'est
-- modifiable que depuis le dashboard Supabase (RLS activée sans aucune
-- policy) : aucun utilisateur ne peut s'y ajouter. N'y mettre QUE le compte
-- de démonstration créé pour l'examen, jamais un vrai compte.
--
-- À exécuter APRÈS schema-appareil-unique.sql. Idempotent. Redéfinit
-- ouvrir_session_appareil et etat_appareil à l'identique, avec une sortie
-- anticipée pour ces comptes ; rien ne change pour les autres.

create table if not exists public.comptes_revue_store (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text,
  cree_le timestamptz not null default now()
);
alter table public.comptes_revue_store enable row level security;

create or replace function public._compte_revue_store()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.comptes_revue_store where user_id = auth.uid());
$$;
revoke all on function public._compte_revue_store() from public, anon, authenticated;

create or replace function public.ouvrir_session_appareil(p_device_id text, p_nom text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  -- Compte de démonstration des stores : jamais de vérification ni de remplacement.
  if public._compte_revue_store() then
    return jsonb_build_object('etat', 'actif', 'nouveau', false, 'alerte', false, 'autre_appareil_deconnecte', false);
  end if;
  if public._appareil_de_confiance(p_device_id)
     or public._preuve_code_email_recente()
     or public._session_anterieure_mise_en_service() then
    return public._activer_appareil(p_device_id, p_nom);
  end if;
  return jsonb_build_object('etat', 'a_verifier');
end;
$$;
grant execute on function public.ouvrir_session_appareil(text, text) to authenticated;

create or replace function public.etat_appareil(p_device_id text, p_nom text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actif text;
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  if public._compte_revue_store() then
    return jsonb_build_object('etat', 'actif', 'nouveau', false, 'alerte', false, 'autre_appareil_deconnecte', false);
  end if;
  select device_id into v_actif from public.appareil_actif where user_id = auth.uid();

  if v_actif is not null and v_actif <> p_device_id then
    return jsonb_build_object('etat', 'remplace');
  end if;
  if v_actif = p_device_id and public._appareil_de_confiance(p_device_id) then
    update public.appareils set derniere_activite = now() where user_id = auth.uid() and device_id = p_device_id;
    return jsonb_build_object('etat', 'actif');
  end if;
  if v_actif is null and (public._session_anterieure_mise_en_service() or public._preuve_code_email_recente()) then
    return public._activer_appareil(p_device_id, p_nom);
  end if;
  return jsonb_build_object('etat', 'a_verifier');
end;
$$;
grant execute on function public.etat_appareil(text, text) to authenticated;

-- Ajout du compte de démonstration (une fois le compte créé dans l'app) :
-- insert into public.comptes_revue_store (user_id, note)
-- select id, 'Examen Google Play' from auth.users where email = 'ADRESSE_DU_COMPTE_DEMO'
-- on conflict do nothing;
