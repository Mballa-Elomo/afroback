-- AFROBACK — Module Paramètres, V2 (backoffice/cdc-module-parametres.md). 2026-10-10.
--
-- À exécuter APRÈS schema-parametres.sql (V1). Idempotent. Ajoute :
-- - les réglages Modules (communauté, marché, espace enfant, quiz, commentaires),
--   mode invité, vérification en 2 étapes (disponible / proposée / obligatoire),
--   durée de confiance d'un appareil, e-mail d'alerte de nouvelle connexion ;
-- - leur application côté serveur pour les appareils (durée de confiance,
--   alerte, vérification, appareil unique).
-- Valeurs par défaut = comportement d'avant.

-- 1. Valeurs par défaut complètes ------------------------------------------
create or replace function public._parametres_defaut()
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'general', jsonb_build_object(
      'maintenance', false, 'message_maintenance', '',
      'inscriptions_ouvertes', true, 'mode_invite', true
    ),
    'modules', jsonb_build_object(
      'communaute', true, 'marche', true, 'espace_enfant', true, 'quiz', true, 'commentaires', true
    ),
    'paiements', jsonb_build_object(
      'actifs', true, 'mtn', true, 'orange', true,
      'abonnements_site', true, 'abonnements_app', true, 'dons', true,
      'prix_racines', 1500, 'prix_heritage', 3000, 'reduction_annuelle_pct', 17
    ),
    'securite', jsonb_build_object(
      'mfa_disponible', true, 'proposer_2fa', true, 'mfa_obligatoire', false,
      'verification_appareil', true, 'appareil_unique', true,
      'confiance_jours', 90, 'alerte_connexion', true,
      'verrou_essais', 5, 'verrou_fenetre_min', 10, 'verrou_duree_min', 15,
      'anti_capture_app', true, 'protection_web', true, 'voile_web', true
    )
  );
$$;

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
    'general', (d.v -> 'general') || coalesce(s.v -> 'general', '{}'::jsonb),
    'modules', (d.v -> 'modules') || coalesce(s.v -> 'modules', '{}'::jsonb),
    'paiements', (d.v -> 'paiements') || coalesce(s.v -> 'paiements', '{}'::jsonb),
    'securite', (d.v -> 'securite') || coalesce(s.v -> 'securite', '{}'::jsonb)
  )
  from d, s;
$$;
revoke all on function public._parametres() from public, anon, authenticated;

-- 2. Lecture publique : jamais les règles internes (appareils, anti-intrusion) --
create or replace function public.parametres_publics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'general', p -> 'general',
    'modules', p -> 'modules',
    'paiements', p -> 'paiements',
    'securite', jsonb_build_object(
      'mfa_disponible', p -> 'securite' -> 'mfa_disponible',
      'proposer_2fa', p -> 'securite' -> 'proposer_2fa',
      'mfa_obligatoire', p -> 'securite' -> 'mfa_obligatoire',
      'anti_capture_app', p -> 'securite' -> 'anti_capture_app',
      'protection_web', p -> 'securite' -> 'protection_web',
      'voile_web', p -> 'securite' -> 'voile_web'
    )
  )
  from (select public._parametres() as p) x;
$$;
grant execute on function public.parametres_publics() to anon, authenticated;

-- 3. Durée de confiance d'un appareil (était fixée à 90 jours) --------------
create or replace function public._appareil_de_confiance(p_device_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.appareils
    where user_id = auth.uid()
      and device_id = p_device_id
      and derniere_activite > now() - make_interval(days => greatest(public._reglage_int('securite', 'confiance_jours', 90), 1))
  );
$$;

-- 4. Après activation d'un appareil : appareil unique et alerte e-mail ------
create or replace function public._apres_activation(p_res jsonb)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select p_res
    || case when public._reglage_bool('securite', 'appareil_unique') then '{}'::jsonb
            else jsonb_build_object('nouveau', false, 'autre_appareil_deconnecte', false) end
    || case when public._reglage_bool('securite', 'alerte_connexion') then '{}'::jsonb
            else jsonb_build_object('alerte', false) end;
$$;
revoke all on function public._apres_activation(jsonb) from public, anon, authenticated;

-- Application mobile
create or replace function public.ouvrir_session_appareil(p_device_id text, p_nom text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  if to_regclass('public.comptes_revue_store') is not null and public._compte_revue_store() then
    return jsonb_build_object('etat', 'actif', 'nouveau', false, 'alerte', false, 'autre_appareil_deconnecte', false);
  end if;
  if not public._reglage_bool('securite', 'verification_appareil')
     or public._appareil_de_confiance(p_device_id)
     or public._preuve_code_email_recente()
     or public._session_anterieure_mise_en_service() then
    return public._apres_activation(public._activer_appareil(p_device_id, p_nom));
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
    return public._apres_activation(public._activer_appareil(p_device_id, p_nom));
  end if;
  return jsonb_build_object('etat', 'a_verifier');
end;
$$;
grant execute on function public.etat_appareil(text, text) to authenticated;

-- Site web (si appareil-web.sql est installé)
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
  begin
    if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
    if not public._reglage_bool('securite', 'verification_appareil')
       or public._appareil_de_confiance(p_device_id) or public._preuve_code_email_recente() then
      return public._apres_activation(public._activer_appareil_web(p_device_id, p_nom));
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
      return public._apres_activation(public._activer_appareil_web(p_device_id, null));
    end if;
    return jsonb_build_object('etat', 'a_verifier');
  end;
  $$;
  $f$;

  grant execute on function public.ouvrir_session_web(text, text) to authenticated;
  grant execute on function public.etat_appareil_web(text) to authenticated;
end
$outer$;

-- Contrôle : réglages publics avec les nouvelles sections.
select public.parametres_publics();
