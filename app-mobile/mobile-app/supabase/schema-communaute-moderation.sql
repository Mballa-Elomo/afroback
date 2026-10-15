-- =====================================================================
-- AFROBACK — Modération de la Communauté (2026-10-15)
-- Cahier des charges : backoffice/cdc-module-communaute.md (§ 4).
-- À exécuter APRÈS schema-communaute.sql et schema-parametres.sql.
-- Idempotent : peut être relancé sans risque.
--
-- 1. Un membre ne compte qu'une fois par contenu signalé.
-- 2. Masquage automatique dès N signaleurs différents (réglage
--    app_settings → communaute → seuil_masquage, 3 par défaut, 0 = jamais).
-- 3. Mots interdits : on bloque le MOT ENTIER (« con » ne bloque plus
--    « conte » ni « Cameroun »), sans tenir compte des majuscules.
-- =====================================================================

-- Mot interdit trouvé dans un texte (ou null). Les caractères spéciaux du
-- mot sont neutralisés pour qu'il soit cherché tel quel.
create or replace function public._terme_interdit(p_texte text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select bt.term
  from public.community_banned_terms bt
  where coalesce(p_texte, '') ~* (
    '(^|[^[:alnum:]_])'
    || regexp_replace(bt.term, '([\\.^$|?*+()\[\]{}-])', '\\\1', 'g')
    || '($|[^[:alnum:]_])'
  )
  limit 1;
$$;
revoke all on function public._terme_interdit(text) from public, anon, authenticated;

-- Test depuis le back-office (« Tester une phrase »).
create or replace function public.admin_tester_terme(p_texte text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public._terme_interdit(p_texte);
$$;
revoke all on function public.admin_tester_terme(text) from public, anon, authenticated;
grant execute on function public.admin_tester_terme(text) to service_role;

-- Filtre automatique (publications et commentaires), au mot entier.
create or replace function public.community_apply_auto_filter()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public._terme_interdit(NEW.contenu_texte) is not null then
    NEW.statut := 'masque_filtre_auto';
  end if;
  return NEW;
end;
$$;

-- Signalement : compteur = nombre de signaleurs DIFFÉRENTS, et masquage
-- automatique au-delà du seuil (seulement pour un contenu encore publié).
create or replace function public.community_increment_report_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nb integer;
  v_seuil integer := coalesce(public._reglage_int('communaute', 'seuil_masquage', 3), 3);
begin
  select count(distinct reporter_id) into v_nb
  from public.community_reports
  where target_type = NEW.target_type and target_id = NEW.target_id
    and statut <> 'traite_rejete';

  if NEW.target_type = 'post' then
    update public.community_posts
       set nb_signalements = v_nb,
           statut = case when v_seuil > 0 and v_nb >= v_seuil and statut = 'publie' then 'masque_signalement' else statut end
     where id = NEW.target_id;
  elsif NEW.target_type = 'commentaire' then
    update public.community_comments
       set nb_signalements = v_nb,
           statut = case when v_seuil > 0 and v_nb >= v_seuil and statut = 'publie' then 'masque_signalement' else statut end
     where id = NEW.target_id;
  end if;
  return NEW;
end;
$$;

-- Réglage par défaut (sans écraser une valeur déjà choisie).
update public.app_settings
   set data = jsonb_set(coalesce(data, '{}'::jsonb), '{communaute}',
                        jsonb_build_object('seuil_masquage', 3) || coalesce(data -> 'communaute', '{}'::jsonb))
 where id = 1;
