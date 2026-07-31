-- AFROBACK Mobile — bucket Supabase Storage pour le contenu généré par les
-- utilisateurs (photos de post Communauté, photos de produit et avatars
-- boutique Marketplace, avatars de profil Communauté).
-- Généré le 2026-07-31.
--
-- Distinct de `heroes-media` (contenu éditorial contrôlé, uploadé
-- manuellement par Yannick) : ici, l'upload se fait directement depuis
-- l'app par n'importe quel utilisateur authentifié, donc les policies
-- restreignent l'écriture au dossier de l'utilisateur lui-même
-- (`{auth.uid()}/...`), avec lecture publique (les images doivent
-- s'afficher pour tout le monde : fil, catalogue, etc.).
--
-- À exécuter dans le SQL Editor du dashboard Supabase, comme les autres
-- fichiers schema-*.sql de ce dossier.

insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', true)
on conflict (id) do update set public = true;

-- Lecture publique de tout le contenu du bucket (nécessaire pour que les
-- photos de post/produit/avatar s'affichent chez les autres utilisateurs).
drop policy if exists "Public read user-uploads" on storage.objects;
create policy "Public read user-uploads" on storage.objects
  for select
  using (bucket_id = 'user-uploads');

-- Écriture réservée à son propre dossier : le chemin d'un fichier doit
-- commencer par l'id du compte connecté (ex. `{uid}/posts/xxx.jpg`).
-- `storage.foldername(name)` découpe le chemin par `/` ; le premier segment
-- doit correspondre à `auth.uid()`.
drop policy if exists "Users upload to own folder" on storage.objects;
create policy "Users upload to own folder" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own files" on storage.objects;
create policy "Users update own files" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own files" on storage.objects;
create policy "Users delete own files" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'user-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
