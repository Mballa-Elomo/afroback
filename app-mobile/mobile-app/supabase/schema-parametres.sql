-- AFROBACK — Paramètres globaux pilotés depuis le back-office.
-- Cahier des charges : backoffice/cdc-parametres-administration.md. 2026-10-10.
--
-- À exécuter dans le SQL Editor Supabase, APRÈS schema-security-auth.sql,
-- schema-appareil-unique.sql, site-web/supabase/appareil-web.sql et
-- schema-compte-revue-store.sql. Idempotent.
--
-- - Table `app_settings` (une seule ligne JSON) : RLS sans policy, écrite
--   uniquement par le serveur du back-office (clé service_role).
-- - `parametres_publics()` : ce que le site et l'app ont besoin de lire.
-- - Les règles de sécurité sont appliquées ICI, côté serveur (seuils
--   anti-intrusion, vérification d'appareil, appareil unique), pas seulement
--   à l'écran.
-- - Valeurs par défaut = comportement d'avant : exécuter ce script ne change
--   rien tant qu'aucun réglage n'est modifié.

-- 1. Table ----------------------------------------------------------------
create table if not exists public.app_settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;

insert into public.app_settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- Valeurs par défaut (comportement d'avant les Paramètres).
create or replace function public._parametres_defaut()
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'paiements', jsonb_build_object(
      'actifs', true, 'mtn', true, 'orange', true,
      'abonnements_site', true, 'abonnements_app', true, 'dons', true,
      'prix_racines', 1500, 'prix_heritage', 3000, 'reduction_annuelle_pct', 17
    ),
    'securite', jsonb_build_object(
      'anti_capture_app', true, 'protection_web', true, 'voile_web', true,
      'verification_appareil', true, 'appareil_unique', true,
      'verrou_essais', 5, 'verrou_fenetre_min', 10, 'verrou_duree_min', 15,
      'proposer_2fa', true
    ),
    'general', jsonb_build_object(
      'inscriptions_ouvertes', true, 'maintenance', false, 'message_maintenance', ''
    )
  );
$$;

-- Réglages effectifs : défauts complétés par ce que l'administration a enregistré (section par section).
create or replace function public._parametres()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with d as (select public._parametres_defaut() as v),
       s as (select coalesce((select data from public.app_settings where id = 1), '{}'::jsonb) as v)
  select jsonb_build_object(
    'paiements', (d.v -> 'paiements') || coalesce(s.v -> 'paiements', '{}'::jsonb),
    'securite', (d.v -> 'securite') || coalesce(s.v -> 'securite', '{}'::jsonb),
    'general', (d.v -> 'general') || coalesce(s.v -> 'general', '{}'::jsonb)
  )
  from d, s;
$$;
revoke all on function public._parametres() from public, anon, authenticated;

create or replace function public._reglage_bool(p_section text, p_cle text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((public._parametres() -> p_section ->> p_cle)::boolean, true);
$$;
revoke all on function public._reglage_bool(text, text) from public, anon, authenticated;

create or replace function public._reglage_int(p_section text, p_cle text, p_defaut integer)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((public._parametres() -> p_section ->> p_cle)::integer, p_defaut);
$$;
revoke all on function public._reglage_int(text, text, integer) from public, anon, authenticated;

-- 2. Lecture publique (site et app) ---------------------------------------
create or replace function public.parametres_publics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'paiements', p -> 'paiements',
    'securite', jsonb_build_object(
      'anti_capture_app', p -> 'securite' -> 'anti_capture_app',
      'protection_web', p -> 'securite' -> 'protection_web',
      'voile_web', p -> 'securite' -> 'voile_web',
      'proposer_2fa', p -> 'securite' -> 'proposer_2fa'
    ),
    'general', p -> 'general'
  )
  from (select public._parametres() as p) x;
$$;
grant execute on function public.parametres_publics() to anon, authenticated;

-- 3. Anti-intrusion : seuils réglables -------------------------------------
create or replace function public.record_login_attempt(p_phone text, p_success boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_attempts integer := greatest(public._reglage_int('securite', 'verrou_essais', 5), 1);
  v_lockout_minutes integer := greatest(public._reglage_int('securite', 'verrou_duree_min', 15), 1);
  v_window_minutes integer := greatest(public._reglage_int('securite', 'verrou_fenetre_min', 10), 1);
  v_failed_count integer;
begin
  if p_success then
    delete from public.login_attempts where phone = p_phone;
    perform public.log_security_event('login_success', p_phone, null);
    return;
  end if;

  insert into public.login_attempts (phone, failed_count, last_attempt_at)
  values (p_phone, 1, now())
  on conflict (phone) do update
    set failed_count = case
          when public.login_attempts.last_attempt_at < now() - (v_window_minutes || ' minutes')::interval
            then 1
          else public.login_attempts.failed_count + 1
        end,
        last_attempt_at = now()
  returning failed_count into v_failed_count;

  if v_failed_count >= v_max_attempts then
    update public.login_attempts
      set locked_until = now() + (v_lockout_minutes || ' minutes')::interval
      where phone = p_phone;
    perform public.log_security_event('login_lockout', p_phone, jsonb_build_object('failed_count', v_failed_count));
  else
    perform public.log_security_event('login_failed', p_phone, jsonb_build_object('failed_count', v_failed_count));
  end if;
end;
$$;
grant execute on function public.record_login_attempt(text, boolean) to anon, authenticated;

-- 4. Appareils : vérification et appareil unique réglables -----------------
-- Sans "appareil unique", l'activation ne doit jamais déconnecter les autres
-- appareils : l'app et le site le font quand `nouveau` ou
-- `autre_appareil_deconnecte` sont vrais.
create or replace function public._sans_deconnexion(p_res jsonb)
returns jsonb
language sql
immutable
as $$
  select p_res || jsonb_build_object('nouveau', false, 'autre_appareil_deconnecte', false);
$$;

-- Application mobile
create or replace function public.ouvrir_session_appareil(p_device_id text, p_nom text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_res jsonb;
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  if to_regclass('public.comptes_revue_store') is not null and public._compte_revue_store() then
    return jsonb_build_object('etat', 'actif', 'nouveau', false, 'alerte', false, 'autre_appareil_deconnecte', false);
  end if;
  if not public._reglage_bool('securite', 'verification_appareil')
     or public._appareil_de_confiance(p_device_id)
     or public._preuve_code_email_recente()
     or public._session_anterieure_mise_en_service() then
    v_res := public._activer_appareil(p_device_id, p_nom);
    if not public._reglage_bool('securite', 'appareil_unique') then v_res := public._sans_deconnexion(v_res); end if;
    return v_res;
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
  v_unique boolean := public._reglage_bool('securite', 'appareil_unique');
  v_verif boolean := public._reglage_bool('securite', 'verification_appareil');
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  if to_regclass('public.comptes_revue_store') is not null and public._compte_revue_store() then
    return jsonb_build_object('etat', 'actif', 'nouveau', false, 'alerte', false, 'autre_appareil_deconnecte', false);
  end if;
  select device_id into v_actif from public.appareil_actif where user_id = auth.uid();

  if v_unique and v_actif is not null and v_actif <> p_device_id then
    return jsonb_build_object('etat', 'remplace');
  end if;
  if (v_actif = p_device_id or not v_unique) and public._appareil_de_confiance(p_device_id) then
    update public.appareils set derniere_activite = now() where user_id = auth.uid() and device_id = p_device_id;
    return jsonb_build_object('etat', 'actif');
  end if;
  if not v_verif
     or (v_actif is null and (public._session_anterieure_mise_en_service() or public._preuve_code_email_recente())) then
    return public._sans_deconnexion(public._activer_appareil(p_device_id, p_nom));
  end if;
  return jsonb_build_object('etat', 'a_verifier');
end;
$$;
grant execute on function public.etat_appareil(text, text) to authenticated;

-- Site web (seulement si appareil-web.sql a été exécuté)
do $outer$
begin
  if to_regprocedure('public._activer_appareil_web(text, text)') is null then
    raise notice 'appareil-web.sql pas encore exécuté : fonctions du site non modifiées.';
    return;
  end if;

  execute $f$
  create or replace function public.ouvrir_session_web(p_device_id text, p_nom text)
  returns jsonb
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_res jsonb;
  begin
    if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
    if not public._reglage_bool('securite', 'verification_appareil')
       or public._appareil_de_confiance(p_device_id) or public._preuve_code_email_recente() then
      v_res := public._activer_appareil_web(p_device_id, p_nom);
      if not public._reglage_bool('securite', 'appareil_unique') then v_res := public._sans_deconnexion(v_res); end if;
      return v_res;
    end if;
    return jsonb_build_object('etat', 'a_verifier');
  end;
  $$;
  $f$;

  execute $f$
  create or replace function public.etat_appareil_web(p_device_id text)
  returns jsonb
  language plpgsql
  security definer
  set search_path = public
  as $$
  declare
    v_actif text;
    v_unique boolean := public._reglage_bool('securite', 'appareil_unique');
  begin
    if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
    select device_id into v_actif from public.appareil_actif_web where user_id = auth.uid();
    if v_unique and v_actif is not null and v_actif <> p_device_id then
      return jsonb_build_object('etat', 'remplace');
    end if;
    if (v_actif = p_device_id or not v_unique) and public._appareil_de_confiance(p_device_id) then
      update public.appareils set derniere_activite = now() where user_id = auth.uid() and device_id = p_device_id;
      return jsonb_build_object('etat', 'actif');
    end if;
    if not public._reglage_bool('securite', 'verification_appareil')
       or (v_actif is null and public._preuve_code_email_recente()) then
      return public._sans_deconnexion(public._activer_appareil_web(p_device_id, null));
    end if;
    return jsonb_build_object('etat', 'a_verifier');
  end;
  $$;
  $f$;

  grant execute on function public.ouvrir_session_web(text, text) to authenticated;
  grant execute on function public.etat_appareil_web(text) to authenticated;
end
$outer$;

-- Contrôle : doit afficher les réglages effectifs (valeurs par défaut au premier passage).
select public.parametres_publics();
