-- Lot 1 cybersécurité (2026-09-25) : protection contre le brute force sur la
-- connexion (téléphone + mot de passe), et journal de sécurité réutilisé
-- ensuite par le Lot 4 (surveillance/VAPT).
--
-- LIMITE HONNÊTE À GARDER POUR LA SOUTENANCE : cette protection est
-- appliquée côté application, dans `AuthProvider.signInWithPhone` — elle
-- bloque un brute force fait *à travers l'app*, la cible réaliste (l'app
-- mobile est le seul client officiel). Un attaquant qui appellerait
-- directement l'API Supabase Auth avec la clé anon publique (embarquée dans
-- l'app, donc jamais secrète) contournerait ce verrou applicatif : la
-- protection réellement infranchissable viendrait soit du rate limiting
-- natif de Supabase Auth sur son endpoint `/token` (déjà actif par défaut,
-- pas construit ici), soit d'un Auth Hook serveur (nécessite un plan
-- Supabase payant ou une Edge Function dédiée) — non construit, budget à 0.
-- Ne jamais présenter cette limite comme résolue devant le jury : c'est
-- exactement le genre de nuance qui distingue une vraie analyse de
-- cybersécurité d'une démo cosmétique.
--
-- À exécuter par Yannick dans le SQL Editor du dashboard Supabase, comme les
-- autres scripts schema-*.sql. Idempotent (safe à rejouer).

create table if not exists public.login_attempts (
  phone text primary key,
  failed_count integer not null default 0,
  locked_until timestamptz,
  last_attempt_at timestamptz not null default now()
);

alter table public.login_attempts enable row level security;
-- Aucune policy : ni l'app mobile (clé anon) ni personne d'autre que le
-- back-office (clé service_role, contourne RLS) ne lit/écrit cette table
-- directement. Uniquement via les 2 fonctions SECURITY DEFINER ci-dessous.

-- Journal de sécurité, réutilisé par le Lot 4 (dashboard admin + VAPT).
-- `event_type` volontairement large (pas seulement les échecs de connexion)
-- pour servir aussi à d'autres événements sensibles à journaliser plus tard
-- (ex. activation/désactivation MFA, accès admin refusé).
create table if not exists public.security_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  phone text,
  detail jsonb,
  created_at timestamptz not null default now()
);

alter table public.security_events enable row level security;
-- Même principe : écriture uniquement via `log_security_event` ci-dessous,
-- lecture réservée au back-office (clé service_role, contourne RLS).

create or replace function public.log_security_event(p_event_type text, p_phone text, p_detail jsonb default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.security_events (event_type, phone, detail)
  values (p_event_type, p_phone, p_detail);
end;
$$;

grant execute on function public.log_security_event(text, text, jsonb) to anon, authenticated;

-- Seuils : 5 échecs sur une fenêtre glissante de 10 minutes → verrouillage
-- de 15 minutes. Choisis pour rester utilisables par un vrai utilisateur qui
-- se trompe (pas un seuil punitif), tout en freinant un script automatisé.
create or replace function public.check_login_lockout(p_phone text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
begin
  select * into rec from public.login_attempts where phone = p_phone;
  if rec is null or rec.locked_until is null or rec.locked_until <= now() then
    return jsonb_build_object('locked', false);
  end if;
  return jsonb_build_object('locked', true, 'locked_until', rec.locked_until);
end;
$$;

grant execute on function public.check_login_lockout(text) to anon, authenticated;

create or replace function public.record_login_attempt(p_phone text, p_success boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_attempts constant integer := 5;
  v_lockout_minutes constant integer := 15;
  v_window_minutes constant integer := 10;
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
          -- Fenêtre glissante : une tentative trop ancienne repart de 1 plutôt que de s'accumuler indéfiniment.
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
