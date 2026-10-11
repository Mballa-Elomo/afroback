-- =====================================================================
-- AFROBACK — Module Utilisateurs du back-office (2026-10-10)
-- Cahier des charges : backoffice/cdc-module-utilisateurs.md (§ 6).
--
-- À exécuter dans le SQL Editor du dashboard Supabase. Idempotent.
-- Tout ici est réservé au back-office (clé service_role) : ni l'app ni le
-- site ne peuvent lire les notes ou appeler ces fonctions.
-- =====================================================================

-- 1. Note interne sur un compte (visible des seuls administrateurs).
create table if not exists public.admin_notes_utilisateurs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note text not null check (char_length(note) <= 2000),
  auteur text not null,
  modifie_le timestamptz not null default now()
);
alter table public.admin_notes_utilisateurs enable row level security;
-- Aucune policy : lecture et écriture uniquement par service_role.
revoke all on public.admin_notes_utilisateurs from anon, authenticated;

-- 2. Déconnecter un compte de partout : supprime ses sessions et jetons de
-- rafraîchissement. Un jeton d'accès déjà délivré reste valable jusqu'à son
-- expiration (1 h maximum), limite de Supabase.
create or replace function public.admin_revoquer_sessions(p_user uuid)
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_nb integer;
begin
  delete from auth.refresh_tokens where user_id = p_user::text;
  delete from auth.sessions where user_id = p_user;
  get diagnostics v_nb = row_count;
  return v_nb;
end;
$$;
revoke all on function public.admin_revoquer_sessions(uuid) from public, anon, authenticated;
grant execute on function public.admin_revoquer_sessions(uuid) to service_role;
