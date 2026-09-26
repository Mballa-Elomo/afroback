-- MFA maison (TOTP, RFC 6238) — remplace le module MFA natif de Supabase
-- Auth, dont la génération de QR code échoue à 100% côté serveur (bug
-- confirmé le 2026-09-25, "Error generating QR Code", hors de notre
-- contrôle). Décision du 2026-09-26 (voir app-mobile/cdc-mfa-inscription.md) :
-- reconstruire le standard ouvert nous-mêmes plutôt que d'attendre un
-- correctif Supabase ou payer un service tiers (Twilio Verify, Auth0).
--
-- Principe : même algorithme que Google Authenticator/Authy (HMAC-SHA1 sur
-- un compteur de temps par pas de 30s), calculé et vérifié entièrement en
-- PL/pgSQL via pgcrypto (déjà activé au Lot 2). Le QR code est généré côté
-- app (react-native-qrcode-svg), plus par le serveur — élimine la source du
-- bug Supabase.
--
-- À exécuter par Yannick dans le SQL Editor du dashboard Supabase, APRÈS
-- schema-security-auth.sql et schema-integrite-contenu.sql (dépend de
-- pgcrypto et de la table app_secrets, créés par ces scripts). Idempotent.

create extension if not exists pgcrypto;

insert into public.app_secrets (key, value)
values ('totp_encryption_key', encode(gen_random_bytes(32), 'hex'))
on conflict (key) do nothing;

create table if not exists public.user_totp_factors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  secret_encrypted bytea not null,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  verified_at timestamptz
);
alter table public.user_totp_factors enable row level security;
-- Aucune policy : accessible uniquement via les fonctions SECURITY DEFINER
-- ci-dessous (même principe que login_attempts/app_secrets, Lot 1/2).

create table if not exists public.mfa_attempts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  failed_count integer not null default 0,
  locked_until timestamptz,
  last_attempt_at timestamptz not null default now()
);
alter table public.mfa_attempts enable row level security;
-- Même principe : verrouillage après 5 échecs / fenêtre de 10 min, verrou
-- 15 min — un code à 6 chiffres n'a que 1 000 000 de combinaisons, la
-- brute force reste théoriquement possible sans cette protection.

-- ============================================================
-- Fonctions internes (préfixées _, jamais exposées directement à l'API)
-- ============================================================

-- Encodage base32 (alphabet RFC 4648) : nécessaire pour l'URI otpauth:// et
-- la saisie manuelle — Postgres n'a pas de fonction native équivalente.
create or replace function public._base32_encode(data bytea)
returns text
language plpgsql
immutable
as $$
declare
  alphabet text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  result text := '';
  bits integer := 0;
  buffer integer := 0;
  i integer;
begin
  for i in 0..length(data) - 1 loop
    buffer := (buffer << 8) | get_byte(data, i);
    bits := bits + 8;
    while bits >= 5 loop
      result := result || substr(alphabet, ((buffer >> (bits - 5)) & 31) + 1, 1);
      bits := bits - 5;
      buffer := buffer & ((1 << bits) - 1);
    end loop;
  end loop;
  if bits > 0 then
    result := result || substr(alphabet, ((buffer << (5 - bits)) & 31) + 1, 1);
  end if;
  return result;
end;
$$;

-- Calcule le code TOTP à 6 chiffres pour un pas de temps donné (RFC 4226
-- "dynamic truncation" appliqué à un HMAC-SHA1, RFC 6238 pour la dérivation
-- du compteur depuis le temps).
create or replace function public._totp_generate(p_secret bytea, p_time_step bigint)
returns text
language plpgsql
immutable
as $$
declare
  counter_bytes bytea := '\x0000000000000000'::bytea;
  hmac_result bytea;
  offset_val integer;
  code integer;
  i integer;
begin
  for i in 0..7 loop
    -- Cast explicite en integer : p_time_step est bigint, set_byte() n'accepte
    -- pas bigint pour son 3e argument (bug réel rencontré au premier test,
    -- 2026-09-26 : "function set_byte(bytea, integer, bigint) does not exist").
    counter_bytes := set_byte(counter_bytes, 7 - i, (((p_time_step >> (i * 8)) & 255))::integer);
  end loop;

  hmac_result := hmac(counter_bytes, p_secret, 'sha1');
  offset_val := get_byte(hmac_result, length(hmac_result) - 1) & 15;

  code := ((get_byte(hmac_result, offset_val) & 127) << 24)
        | (get_byte(hmac_result, offset_val + 1) << 16)
        | (get_byte(hmac_result, offset_val + 2) << 8)
        | get_byte(hmac_result, offset_val + 3);

  return lpad((code % 1000000)::text, 6, '0');
end;
$$;

-- Vérifie un code contre le pas de temps actuel ET les pas voisins (±30s
-- par défaut) — tolère un léger décalage d'horloge entre le téléphone de
-- l'utilisateur et le serveur, pratique standard de toute implémentation
-- TOTP sérieuse (Google Authenticator fait de même).
create or replace function public._totp_verify(p_secret bytea, p_code text, p_window integer default 1)
returns boolean
language plpgsql
as $$
declare
  current_step bigint := floor(extract(epoch from now()) / 30);
  i integer;
begin
  for i in -p_window..p_window loop
    if public._totp_generate(p_secret, current_step + i) = p_code then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

-- ============================================================
-- Fonctions publiques (appelées par l'app via supabase.rpc(...))
-- ============================================================

-- Démarre (ou redémarre) l'activation : génère un nouveau secret, le
-- chiffre et le stocke non-vérifié. Retourne le secret en base32 et l'URI
-- otpauth:// pour le QR code — la SEULE fois où le secret en clair quitte
-- la base, jamais récupérable après coup (comme tout gestionnaire TOTP
-- sérieux).
create or replace function public.mfa_totp_enroll()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_secret bytea;
  v_encryption_key text;
  v_phone text;
  v_secret_b32 text;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'non_authentifie');
  end if;

  select value into v_encryption_key from public.app_secrets where key = 'totp_encryption_key';
  select phone into v_phone from auth.users where id = v_user_id;

  v_secret := gen_random_bytes(20);
  v_secret_b32 := public._base32_encode(v_secret);

  insert into public.user_totp_factors (user_id, secret_encrypted, verified, created_at, verified_at)
  values (v_user_id, pgp_sym_encrypt_bytea(v_secret, v_encryption_key), false, now(), null)
  on conflict (user_id) do update
    set secret_encrypted = excluded.secret_encrypted,
        verified = false,
        created_at = now(),
        verified_at = null;

  return jsonb_build_object(
    'ok', true,
    'secret_base32', v_secret_b32,
    'otpauth_uri', 'otpauth://totp/AFROBACK:' || coalesce(v_phone, 'compte')
      || '?secret=' || v_secret_b32 || '&issuer=AFROBACK&digits=6&period=30'
  );
end;
$$;

grant execute on function public.mfa_totp_enroll() to authenticated;

-- Confirme l'activation (premier code saisi après le QR/la saisie
-- manuelle) : passe le facteur en attente à `verified = true`.
create or replace function public.mfa_totp_confirm(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_encryption_key text;
  v_secret_encrypted bytea;
  v_secret bytea;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'non_authentifie');
  end if;

  select value into v_encryption_key from public.app_secrets where key = 'totp_encryption_key';
  select secret_encrypted into v_secret_encrypted from public.user_totp_factors where user_id = v_user_id;

  if v_secret_encrypted is null then
    return jsonb_build_object('ok', false, 'error', 'aucun_facteur_en_attente');
  end if;

  v_secret := pgp_sym_decrypt_bytea(v_secret_encrypted, v_encryption_key);

  if not public._totp_verify(v_secret, p_code, 1) then
    return jsonb_build_object('ok', false, 'error', 'code_incorrect');
  end if;

  update public.user_totp_factors set verified = true, verified_at = now() where user_id = v_user_id;
  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.mfa_totp_confirm(text) to authenticated;

-- Statut MFA du compte connecté — utilisé après la connexion pour savoir
-- s'il faut afficher l'écran de vérification, et dans Profil → Sécurité.
create or replace function public.mfa_totp_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_verified boolean;
begin
  if auth.uid() is null then
    return jsonb_build_object('enabled', false);
  end if;
  select verified into v_verified from public.user_totp_factors where user_id = auth.uid();
  return jsonb_build_object('enabled', coalesce(v_verified, false));
end;
$$;

grant execute on function public.mfa_totp_status() to authenticated;

-- Vérifie le code à la connexion (porte de vérification post mot de
-- passe) — inclut la protection anti-brute-force (5 échecs / 10 min,
-- verrou 15 min), même principe que schema-security-auth.sql.
create or replace function public.mfa_totp_verify_challenge(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_encryption_key text;
  v_secret_encrypted bytea;
  v_secret bytea;
  v_lockout record;
  v_max_attempts constant integer := 5;
  v_lockout_minutes constant integer := 15;
  v_window_minutes constant integer := 10;
  v_failed_count integer;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'non_authentifie');
  end if;

  select * into v_lockout from public.mfa_attempts where user_id = v_user_id;
  if v_lockout.locked_until is not null and v_lockout.locked_until > now() then
    return jsonb_build_object('ok', false, 'error', 'verrouille', 'locked_until', v_lockout.locked_until);
  end if;

  select value into v_encryption_key from public.app_secrets where key = 'totp_encryption_key';
  select secret_encrypted into v_secret_encrypted
    from public.user_totp_factors where user_id = v_user_id and verified = true;

  if v_secret_encrypted is null then
    return jsonb_build_object('ok', false, 'error', 'mfa_non_active');
  end if;

  v_secret := pgp_sym_decrypt_bytea(v_secret_encrypted, v_encryption_key);

  if public._totp_verify(v_secret, p_code, 1) then
    delete from public.mfa_attempts where user_id = v_user_id;
    return jsonb_build_object('ok', true);
  end if;

  insert into public.mfa_attempts (user_id, failed_count, last_attempt_at)
  values (v_user_id, 1, now())
  on conflict (user_id) do update
    set failed_count = case
          when public.mfa_attempts.last_attempt_at < now() - (v_window_minutes || ' minutes')::interval then 1
          else public.mfa_attempts.failed_count + 1
        end,
        last_attempt_at = now()
  returning failed_count into v_failed_count;

  if v_failed_count >= v_max_attempts then
    update public.mfa_attempts set locked_until = now() + (v_lockout_minutes || ' minutes')::interval
      where user_id = v_user_id;
    return jsonb_build_object('ok', false, 'error', 'verrouille');
  end if;

  return jsonb_build_object('ok', false, 'error', 'code_incorrect');
end;
$$;

grant execute on function public.mfa_totp_verify_challenge(text) to authenticated;

-- Désactive le MFA du compte connecté.
create or replace function public.mfa_totp_disable()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.user_totp_factors where user_id = auth.uid();
  delete from public.mfa_attempts where user_id = auth.uid();
end;
$$;

grant execute on function public.mfa_totp_disable() to authenticated;
