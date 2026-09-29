-- =====================================================================
-- AFROBACK — Numéro de téléphone à l'inscription (2026-09-29)
-- À exécuter dans le SQL Editor de Supabase. Idempotent.
--
-- L'inscription se fait par email (code de confirmation) ; Supabase ne sait
-- pas créer un compte avec un email ET un téléphone en une fois. Ce trigger
-- recopie le numéro saisi dans l'app (user_metadata.telephone) dans la
-- colonne `phone` du compte, pour que la connexion "Téléphone + mot de
-- passe" fonctionne aussi pour les nouveaux comptes.
--
-- Pas de vérification par SMS (même choix que depuis le 2026-07-30, pas de
-- fournisseur SMS payant) : le numéro est considéré confirmé. Limite connue
-- et déjà assumée : quelqu'un peut saisir le numéro d'un autre ; il ne prend
-- pas pour autant le contrôle du compte de cette personne, mais bloque ce
-- numéro pour une nouvelle inscription.
-- =====================================================================

create or replace function public.copier_telephone_inscription()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_phone text;
begin
  -- Format de Supabase : chiffres seuls, sans "+" (ex. 237690000000).
  v_phone := regexp_replace(coalesce(new.raw_user_meta_data ->> 'telephone', ''), '[^0-9]', '', 'g');
  if new.phone is null and length(v_phone) between 8 and 15 then
    new.phone := v_phone;
    new.phone_confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_copier_telephone_inscription on auth.users;
create trigger trg_copier_telephone_inscription
  before insert on auth.users
  for each row execute function public.copier_telephone_inscription();

-- Numéro libre ? Appelé par l'app avant l'inscription pour afficher un
-- message clair ("ce numéro est déjà utilisé") plutôt qu'une erreur technique.
create or replace function public.telephone_disponible(p_telephone text)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select not exists (
    select 1 from auth.users
    where phone = regexp_replace(coalesce(p_telephone, ''), '[^0-9]', '', 'g')
  );
$$;
grant execute on function public.telephone_disponible(text) to anon, authenticated;
