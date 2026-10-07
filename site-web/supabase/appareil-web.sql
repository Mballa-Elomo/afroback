-- =====================================================================
-- AFROBACK · Site web : « 1 téléphone + 1 navigateur » (décision D2,
-- cdc-site-web-afroback.md, validée le 2026-10-02)
--
-- À exécuter UNE fois dans Supabase > SQL Editor, après
-- app-mobile/mobile-app/supabase/schema-appareil-unique.sql (déjà en place).
--
-- Principe : le site web a SA PROPRE place d'« appareil actif », à côté de
-- celle de l'application. Se connecter au site ne déconnecte donc plus le
-- téléphone, et inversement. Les fonctions utilisées par l'application
-- (ouvrir_session_appareil, etat_appareil, valider_appareil) ne sont PAS
-- modifiées : l'application se comporte exactement comme avant.
--
-- Mêmes protections que l'app pour le site : un navigateur inconnu doit
-- prouver l'identité (code email ou code de vérification en 2 étapes), un
-- seul navigateur actif à la fois, confiance retirée après 90 jours ou au
-- changement de mot de passe (revoquer_autres_appareils, inchangée).
-- Les identifiants d'appareil du site commencent par « web ».
-- =====================================================================

create table if not exists public.appareil_actif_web (
  user_id uuid primary key references auth.users(id) on delete cascade,
  device_id text not null,
  actif_depuis timestamptz not null default now()
);
alter table public.appareil_actif_web enable row level security;
drop policy if exists "Read own active web device" on public.appareil_actif_web;
create policy "Read own active web device" on public.appareil_actif_web for select using (user_id = auth.uid());
revoke insert, update, delete on public.appareil_actif_web from anon, authenticated;

-- Rend le navigateur de confiance ET actif (place « site web »).
create or replace function public._activer_appareil_web(p_device_id text, p_nom text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nouveau boolean;
  v_ancien text;
  v_avait_autres boolean;
begin
  if p_device_id not like 'web%' then
    return jsonb_build_object('etat', 'a_verifier', 'erreur', 'identifiant_invalide');
  end if;
  select not exists (select 1 from public.appareils where user_id = auth.uid() and device_id = p_device_id) into v_nouveau;
  select exists (select 1 from public.appareils where user_id = auth.uid() and device_id <> p_device_id) into v_avait_autres;
  insert into public.appareils (user_id, device_id, nom, valide_le, derniere_activite)
  values (auth.uid(), p_device_id, left(p_nom, 80), now(), now())
  on conflict (user_id, device_id) do update
    set derniere_activite = now(), nom = coalesce(excluded.nom, public.appareils.nom);
  select device_id into v_ancien from public.appareil_actif_web where user_id = auth.uid();
  insert into public.appareil_actif_web (user_id, device_id, actif_depuis) values (auth.uid(), p_device_id, now())
  on conflict (user_id) do update set device_id = excluded.device_id, actif_depuis = now();
  return jsonb_build_object(
    'etat', 'actif',
    'nouveau', v_nouveau,
    'alerte', v_nouveau and v_avait_autres,
    'autre_appareil_deconnecte', v_ancien is not null and v_ancien <> p_device_id
  );
end;
$$;

-- Juste après une connexion sur le site (mot de passe ou code).
create or replace function public.ouvrir_session_web(p_device_id text, p_nom text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  if public._appareil_de_confiance(p_device_id) or public._preuve_code_email_recente() then
    return public._activer_appareil_web(p_device_id, p_nom);
  end if;
  return jsonb_build_object('etat', 'a_verifier');
end;
$$;
grant execute on function public.ouvrir_session_web(text, text) to authenticated;

-- À l'ouverture du site et toutes les 60 s : ce navigateur est-il toujours l'actif ?
create or replace function public.etat_appareil_web(p_device_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actif text;
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  select device_id into v_actif from public.appareil_actif_web where user_id = auth.uid();
  if v_actif is not null and v_actif <> p_device_id then
    return jsonb_build_object('etat', 'remplace');
  end if;
  if v_actif = p_device_id and public._appareil_de_confiance(p_device_id) then
    update public.appareils set derniere_activite = now() where user_id = auth.uid() and device_id = p_device_id;
    return jsonb_build_object('etat', 'actif');
  end if;
  if v_actif is null and public._preuve_code_email_recente() then
    return public._activer_appareil_web(p_device_id, null);
  end if;
  return jsonb_build_object('etat', 'a_verifier');
end;
$$;
grant execute on function public.etat_appareil_web(text) to authenticated;

-- Écran « Nouveau navigateur détecté » : code email ou code de vérification en 2 étapes.
create or replace function public.valider_appareil_web(p_device_id text, p_nom text, p_code_totp text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_totp jsonb;
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  if p_code_totp is not null then
    v_totp := public.mfa_totp_verify_challenge(p_code_totp);
    if coalesce((v_totp ->> 'ok')::boolean, false) then
      return public._activer_appareil_web(p_device_id, p_nom);
    end if;
    return jsonb_build_object('etat', 'a_verifier', 'erreur', coalesce(v_totp ->> 'error', 'code_incorrect'));
  end if;
  if public._preuve_code_email_recente() then
    return public._activer_appareil_web(p_device_id, p_nom);
  end if;
  return jsonb_build_object('etat', 'a_verifier', 'erreur', 'preuve_absente');
end;
$$;
grant execute on function public.valider_appareil_web(text, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- Correctif de sécurité (trouvé le 2026-10-02) : les fonctions internes
-- qui rendent un appareil « de confiance » ne doivent PAS être appelables
-- directement par un utilisateur (sinon on pourrait sauter le code email).
-- Elles restent utilisées en interne par les fonctions publiques
-- (security definer) : l'application et le site fonctionnent à l'identique.
-- ---------------------------------------------------------------------
revoke execute on function public._activer_appareil(text, text) from public, anon, authenticated;
revoke execute on function public._activer_appareil_web(text, text) from public, anon, authenticated;

-- Contrôle : doit renvoyer 4 lignes.
select proname from pg_proc where proname in ('_activer_appareil_web', 'ouvrir_session_web', 'etat_appareil_web', 'valider_appareil_web');
