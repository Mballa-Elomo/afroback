-- =====================================================================
-- AFROBACK — Vérification des nouveaux appareils et appareil unique
-- Cahier des charges : app-mobile/cdc-appareil-unique.md (2026-09-29)
-- À exécuter dans le SQL Editor de Supabase. Idempotent.
--
-- Règles :
--   - un compte = UN appareil actif ; valider un nouvel appareil
--     déconnecte l'autre (qui le découvre via etat_appareil = 'remplace') ;
--   - un appareil inconnu doit prouver l'identité : code email (connexion
--     "otp" constatée par le serveur dans le jeton) ou code de vérification
--     en 2 étapes vérifié ICI, côté serveur. L'app ne peut pas se déclarer
--     de confiance toute seule ;
--   - confiance perdue après 90 jours sans utilisation, et pour tous les
--     autres appareils quand le mot de passe est changé ;
--   - D1 : les sessions ouvertes AVANT la mise en service sont reconnues
--     automatiquement une fois.
--
-- Limite (voir cahier des charges, §5) : protège l'usage de l'app, pas un
-- appel direct à l'API avec un mot de passe volé.
-- =====================================================================

create table if not exists public.appareils (
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null check (char_length(device_id) between 32 and 64),
  nom text,
  valide_le timestamptz not null default now(),
  derniere_activite timestamptz not null default now(),
  primary key (user_id, device_id)
);
alter table public.appareils enable row level security;
drop policy if exists "Read own devices" on public.appareils;
create policy "Read own devices" on public.appareils for select using (user_id = auth.uid());
revoke insert, update, delete on public.appareils from anon, authenticated;

create table if not exists public.appareil_actif (
  user_id uuid primary key references auth.users(id) on delete cascade,
  device_id text not null,
  actif_depuis timestamptz not null default now()
);
alter table public.appareil_actif enable row level security;
drop policy if exists "Read own active device" on public.appareil_actif;
create policy "Read own active device" on public.appareil_actif for select using (user_id = auth.uid());
revoke insert, update, delete on public.appareil_actif from anon, authenticated;

-- Date de mise en service (D1) : posée une seule fois, à la première exécution.
create table if not exists public.appareil_config (
  id boolean primary key default true check (id),
  mise_en_service timestamptz not null default now()
);
insert into public.appareil_config (id) values (true) on conflict do nothing;
alter table public.appareil_config enable row level security;

-- ---------------------------------------------------------------------
-- Aides internes
-- ---------------------------------------------------------------------

-- Identité prouvée à l'instant par un code email (inscription, nouvel
-- appareil) ou une réinitialisation de mot de passe : Supabase l'inscrit
-- dans le jeton (claim "amr").
create or replace function public._preuve_code_email_recente()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) as a
    where a ->> 'method' in ('otp', 'recovery', 'magiclink')
      and to_timestamp((a ->> 'timestamp')::bigint) > now() - interval '10 minutes'
  );
$$;

-- Session ouverte avant la mise en service (D1).
create or replace function public._session_anterieure_mise_en_service()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.sessions s, public.appareil_config c
    where s.id = nullif(auth.jwt() ->> 'session_id', '')::uuid
      and s.created_at < c.mise_en_service
  );
$$;

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
      and derniere_activite > now() - interval '90 days'
  );
$$;

-- Rend l'appareil de confiance ET actif. Renvoie true si c'est un
-- changement (nouvel appareil ou prise de relais sur un autre) : l'app
-- déconnecte alors les autres sessions et envoie l'email d'alerte si nouveau.
create or replace function public._activer_appareil(p_device_id text, p_nom text)
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
  select not exists (select 1 from public.appareils where user_id = auth.uid() and device_id = p_device_id) into v_nouveau;
  -- Alerte email seulement si le compte avait déjà un autre appareil (pas pour le tout premier, ex. à l'inscription).
  select exists (select 1 from public.appareils where user_id = auth.uid() and device_id <> p_device_id) into v_avait_autres;
  insert into public.appareils (user_id, device_id, nom, valide_le, derniere_activite)
  values (auth.uid(), p_device_id, left(p_nom, 80), now(), now())
  on conflict (user_id, device_id) do update
    set derniere_activite = now(), nom = coalesce(excluded.nom, public.appareils.nom);
  select device_id into v_ancien from public.appareil_actif where user_id = auth.uid();
  insert into public.appareil_actif (user_id, device_id, actif_depuis) values (auth.uid(), p_device_id, now())
  on conflict (user_id) do update set device_id = excluded.device_id, actif_depuis = now();
  return jsonb_build_object(
    'etat', 'actif',
    'nouveau', v_nouveau,
    'alerte', v_nouveau and v_avait_autres,
    'autre_appareil_deconnecte', v_ancien is not null and v_ancien <> p_device_id
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Fonctions appelées par l'app
-- ---------------------------------------------------------------------

-- Juste après une connexion (mot de passe, code) sur cet appareil.
create or replace function public.ouvrir_session_appareil(p_device_id text, p_nom text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then return jsonb_build_object('etat', 'non_connecte'); end if;
  if public._appareil_de_confiance(p_device_id)
     or public._preuve_code_email_recente()
     or public._session_anterieure_mise_en_service() then
    return public._activer_appareil(p_device_id, p_nom);
  end if;
  return jsonb_build_object('etat', 'a_verifier');
end;
$$;
grant execute on function public.ouvrir_session_appareil(text, text) to authenticated;

-- À l'ouverture de l'app, au retour dessus et toutes les 60 s. Ne prend
-- jamais la main sur un autre appareil : se contente de dire si celui-ci
-- est toujours l'actif.
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
  select device_id into v_actif from public.appareil_actif where user_id = auth.uid();

  if v_actif is not null and v_actif <> p_device_id then
    return jsonb_build_object('etat', 'remplace');
  end if;
  if v_actif = p_device_id and public._appareil_de_confiance(p_device_id) then
    update public.appareils set derniere_activite = now() where user_id = auth.uid() and device_id = p_device_id;
    return jsonb_build_object('etat', 'actif');
  end if;
  -- Aucun appareil actif enregistré : session d'avant la mise en service
  -- (D1) ou session tout juste prouvée par un code email → reconnue.
  if v_actif is null and (public._session_anterieure_mise_en_service() or public._preuve_code_email_recente()) then
    return public._activer_appareil(p_device_id, p_nom);
  end if;
  return jsonb_build_object('etat', 'a_verifier');
end;
$$;
grant execute on function public.etat_appareil(text, text) to authenticated;

-- Écran "Nouvel appareil détecté" : après le code email (le jeton porte
-- alors la preuve "otp") ou avec le code de vérification en 2 étapes,
-- vérifié ici côté serveur.
create or replace function public.valider_appareil(p_device_id text, p_nom text, p_code_totp text default null)
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
      return public._activer_appareil(p_device_id, p_nom);
    end if;
    return jsonb_build_object('etat', 'a_verifier', 'erreur', coalesce(v_totp ->> 'error', 'code_incorrect'));
  end if;
  if public._preuve_code_email_recente() then
    return public._activer_appareil(p_device_id, p_nom);
  end if;
  return jsonb_build_object('etat', 'a_verifier', 'erreur', 'preuve_absente');
end;
$$;
grant execute on function public.valider_appareil(text, text, text) to authenticated;

-- Mot de passe changé : seul l'appareil courant garde la confiance.
create or replace function public.revoquer_autres_appareils(p_device_id text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.appareils where user_id = auth.uid() and device_id <> p_device_id;
$$;
grant execute on function public.revoquer_autres_appareils(text) to authenticated;
