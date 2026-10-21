-- =====================================================================
-- AFROBACK — « À la une » unique sur tout le catalogue (2026-10-17)
-- Un seul contenu à la une à la fois, héros, mythe OU fiche Découverte.
-- Il apparaît dans « Histoire du jour » (app) et en tête de l'accueil (site).
-- Le back-office applique déjà cette règle ; ce déclencheur la garantit aussi
-- en base (modification directe dans Supabase, script SQL…) : mettre un
-- contenu à la une retire la une de tous les autres.
-- À exécuter dans Supabase > SQL Editor. Idempotent.
-- =====================================================================

create or replace function public.a_la_une_unique()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.a_la_une is true and (tg_op = 'INSERT' or old.a_la_une is distinct from true) then
    update public.heros set a_la_une = false where a_la_une and (tg_table_name <> 'heros' or id <> new.id);
    update public.mythes set a_la_une = false where a_la_une and (tg_table_name <> 'mythes' or id <> new.id);
    update public.decouverte_items set a_la_une = false where a_la_une and (tg_table_name <> 'decouverte_items' or id <> new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_heros_a_la_une_unique on public.heros;
create trigger trg_heros_a_la_une_unique before insert or update of a_la_une on public.heros
  for each row execute function public.a_la_une_unique();

drop trigger if exists trg_mythes_a_la_une_unique on public.mythes;
create trigger trg_mythes_a_la_une_unique before insert or update of a_la_une on public.mythes
  for each row execute function public.a_la_une_unique();

drop trigger if exists trg_decouverte_a_la_une_unique on public.decouverte_items;
create trigger trg_decouverte_a_la_une_unique before insert or update of a_la_une on public.decouverte_items
  for each row execute function public.a_la_une_unique();

-- Contrôle : au plus 1 ligne.
select 'heros' as type, slug from public.heros where a_la_une
union all select 'mythe', slug from public.mythes where a_la_une
union all select 'decouverte', slug from public.decouverte_items where a_la_une;
