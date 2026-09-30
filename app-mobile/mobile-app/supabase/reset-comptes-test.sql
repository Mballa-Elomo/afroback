-- =====================================================================
-- AFROBACK — Remise à zéro des comptes de TEST (2026-09-29)
--
-- Supprime TOUS les comptes de l'app, SAUF les administrateurs du
-- back-office (emails présents dans public.admin_users).
-- Avec chaque compte partent automatiquement (on delete cascade) :
--   abonnements, paiements, appareils, profils enfants, code parent,
--   vérification en 2 étapes, profil et publications Communauté,
--   boutique / commandes du Marché, dons.
-- Vide aussi les compteurs anti-force brute et le journal de sécurité.
-- NE touche PAS au contenu (héros, mythes, Découverte) ni aux statistiques.
--
-- IRRÉVERSIBLE. À utiliser uniquement pendant la phase de test.
-- Mode d'emploi (SQL Editor de Supabase) :
--   1. Exécute d'abord la PARTIE 1 seule (aperçu, ne supprime rien).
--   2. Si la liste est bonne, exécute la PARTIE 2.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PARTIE 1 — APERÇU : comptes qui seront supprimés (rien n'est effacé)
-- ---------------------------------------------------------------------
select u.email, u.phone, u.created_at,
       (select count(*) from public.subscriptions s where s.user_id = u.id) as abonnements,
       (select count(*) from public.paiements p where p.user_id = u.id)     as paiements
from auth.users u
where lower(coalesce(u.email, '')) not in (select lower(email) from public.admin_users)
order by u.created_at;

-- Comptes CONSERVÉS (administrateurs du back-office) :
select u.email, 'conservé (admin back-office)' as statut
from auth.users u
where lower(coalesce(u.email, '')) in (select lower(email) from public.admin_users);


-- ---------------------------------------------------------------------
-- PARTIE 2 — SUPPRESSION (sélectionne ce bloc seul, puis Run)
-- ---------------------------------------------------------------------
begin;

delete from auth.users u
where lower(coalesce(u.email, '')) not in (select lower(email) from public.admin_users);

-- Compteurs anti-force brute et journal de sécurité (liés aux anciens tests).
delete from public.login_attempts;
delete from public.security_events;

commit;

-- Vérification : doit n'afficher que les administrateurs.
select email, created_at from auth.users order by created_at;
