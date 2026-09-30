-- =====================================================================
-- AFROBACK — Commentaires façon YouTube sur les contenus
-- Cahier des charges : app-mobile/cdc-commentaires.md (2026-09-30)
-- À exécuter dans le SQL Editor de Supabase, APRÈS schema-communaute.sql
-- et schema-acces-abonnement.sql. Idempotent (sans risque à relancer).
--
-- Décisions de Yannick : tous les comptes commentent et aiment (D1) ; sur un
-- contenu réservé, lecture pour tous, écriture pour ceux qui y ont accès
-- (D2) ; seulement "j'aime" (D3) ; modération dans le back-office (D4).
--
-- L'app ne touche jamais les tables directement : tout passe par les
-- fonctions ci-dessous (security definer), qui appliquent les règles
-- (accès au contenu, anti-spam, filtre, signalements) côté serveur.
-- =====================================================================

create table if not exists public.content_comments (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('heros', 'mythe', 'decouverte')),
  content_slug text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_id uuid not null references public.community_profiles(id) on delete cascade,
  parent_id uuid references public.content_comments(id) on delete cascade,
  reply_to_pseudo text,
  texte text not null check (char_length(texte) <= 2000),
  statut text not null default 'publie'
    check (statut in ('publie', 'masque_filtre_auto', 'masque_signalements', 'masque_moderation', 'supprime')),
  like_count integer not null default 0,
  reply_count integer not null default 0,
  nb_signalements integer not null default 0,
  created_at timestamptz not null default now(),
  edited_at timestamptz
);
create index if not exists content_comments_content_idx on public.content_comments (content_type, content_slug, parent_id, created_at desc);
create index if not exists content_comments_parent_idx on public.content_comments (parent_id, created_at);
create index if not exists content_comments_user_idx on public.content_comments (user_id, created_at desc);

create table if not exists public.content_comment_likes (
  comment_id uuid not null references public.content_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.content_comment_reports (
  comment_id uuid not null references public.content_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  motif text not null check (motif in ('contenu_inapproprie', 'harcelement', 'desinformation', 'spam', 'autre')),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

-- Aucune policy : lecture/écriture uniquement via les fonctions (et le back-office en service_role).
alter table public.content_comments enable row level security;
alter table public.content_comment_likes enable row level security;
alter table public.content_comment_reports enable row level security;
revoke all on public.content_comments, public.content_comment_likes, public.content_comment_reports from anon, authenticated;

-- ---------------------------------------------------------------------
-- Aides
-- ---------------------------------------------------------------------

-- Représentation d'un commentaire pour l'app (pseudo/avatar publics, jamais l'email).
create or replace function public._commentaire_json(c public.content_comments)
returns jsonb
language sql
stable
security definer
set search_path = public, auth
as $$
  select jsonb_build_object(
    'id', c.id,
    'parent_id', c.parent_id,
    'reply_to_pseudo', c.reply_to_pseudo,
    'texte', case when c.statut = 'supprime' then null else c.texte end,
    'statut', c.statut,
    'like_count', c.like_count,
    'reply_count', c.reply_count,
    'created_at', c.created_at,
    'edited', c.edited_at is not null,
    'mine', c.user_id = auth.uid(),
    'liked', exists (select 1 from public.content_comment_likes l where l.comment_id = c.id and l.user_id = auth.uid()),
    'author', jsonb_build_object(
      'id', p.id,
      'pseudo', p.pseudo,
      'avatar_url', p.avatar_url,
      'equipe', exists (
        select 1 from public.admin_users a join auth.users u on lower(u.email) = lower(a.email) where u.id = c.user_id
      )
    )
  )
  from public.community_profiles p
  where p.id = c.author_id;
$$;

-- Visible : publié, ou mon propre commentaire (même masqué par le filtre), ou supprimé mais avec des réponses.
create or replace function public._commentaire_visible(c public.content_comments)
returns boolean
language sql
stable
as $$
  select c.statut = 'publie'
      or c.user_id = auth.uid() and c.statut <> 'supprime'
      or c.statut = 'supprime' and c.reply_count > 0;
$$;

-- ---------------------------------------------------------------------
-- Lecture (invités compris)
-- ---------------------------------------------------------------------

-- Fil d'un contenu : total + commentaires de premier niveau, triés.
create or replace function public.lister_commentaires(
  p_type text,
  p_slug text,
  p_tri text default 'pertinents',
  p_limite integer default 20,
  p_decalage integer default 0
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_items jsonb;
begin
  select count(*) into v_total
    from public.content_comments c
   where c.content_type = p_type and c.content_slug = p_slug and c.statut = 'publie';

  select coalesce(jsonb_agg(public._commentaire_json(x.com) order by x.rang), '[]'::jsonb) into v_items
  from (
    select c as com, row_number() over (
             order by
               case when p_tri = 'recents' then null else (c.like_count * 2 + c.reply_count) end desc nulls last,
               c.created_at desc
           ) as rang
      from public.content_comments c
     where c.content_type = p_type and c.content_slug = p_slug and c.parent_id is null
       and public._commentaire_visible(c)
     order by rang
     limit least(greatest(p_limite, 1), 50) offset greatest(p_decalage, 0)
  ) x;

  return jsonb_build_object(
    'total', v_total,
    'peut_commenter', auth.uid() is not null and public.acces_contenu(p_type, p_slug),
    'connecte', auth.uid() is not null,
    'items', v_items
  );
end;
$$;
grant execute on function public.lister_commentaires(text, text, text, integer, integer) to anon, authenticated;

-- Réponses d'un commentaire (ordre chronologique, comme YouTube).
create or replace function public.lister_reponses(p_parent uuid, p_limite integer default 20, p_decalage integer default 0)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(public._commentaire_json(x.com) order by (x.com).created_at), '[]'::jsonb)
  from (
    select c as com from public.content_comments c
     where c.parent_id = p_parent and public._commentaire_visible(c)
     order by c.created_at
     limit least(greatest(p_limite, 1), 50) offset greatest(p_decalage, 0)
  ) x;
$$;
grant execute on function public.lister_reponses(uuid, integer, integer) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Écriture (comptes connectés)
-- ---------------------------------------------------------------------

create or replace function public.publier_commentaire(p_type text, p_slug text, p_texte text, p_parent uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profil public.community_profiles;
  v_texte text := trim(p_texte);
  v_parent public.content_comments;
  v_racine uuid;
  v_reply_to text;
  v_statut text := 'publie';
  v_new public.content_comments;
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'error', 'non_connecte'); end if;
  select * into v_profil from public.community_profiles where user_id = auth.uid();
  if v_profil.id is null then return jsonb_build_object('ok', false, 'error', 'sans_profil'); end if;
  if v_profil.is_banned then return jsonb_build_object('ok', false, 'error', 'banni'); end if;
  if char_length(v_texte) = 0 or char_length(v_texte) > 2000 then return jsonb_build_object('ok', false, 'error', 'longueur'); end if;
  if not public.acces_contenu(p_type, p_slug) then return jsonb_build_object('ok', false, 'error', 'acces'); end if;
  -- Anti-spam : 10 commentaires maximum par tranche de 10 minutes.
  if (select count(*) from public.content_comments where user_id = auth.uid() and created_at > now() - interval '10 minutes') >= 10 then
    return jsonb_build_object('ok', false, 'error', 'trop_rapide');
  end if;

  if p_parent is not null then
    select * into v_parent from public.content_comments where id = p_parent;
    if v_parent.id is null or v_parent.content_type <> p_type or v_parent.content_slug <> p_slug then
      return jsonb_build_object('ok', false, 'error', 'parent');
    end if;
    -- Un seul niveau de réponses (YouTube) : répondre à une réponse la rattache au commentaire d'origine.
    v_racine := coalesce(v_parent.parent_id, v_parent.id);
    if v_parent.parent_id is not null then
      select pseudo into v_reply_to from public.community_profiles where id = v_parent.author_id;
    end if;
  end if;

  if exists (select 1 from public.community_banned_terms bt where v_texte ilike '%' || bt.term || '%') then
    v_statut := 'masque_filtre_auto';
  end if;

  insert into public.content_comments (content_type, content_slug, user_id, author_id, parent_id, reply_to_pseudo, texte, statut)
  values (p_type, p_slug, auth.uid(), v_profil.id, v_racine, v_reply_to, v_texte, v_statut)
  returning * into v_new;

  if v_racine is not null and v_statut = 'publie' then
    update public.content_comments set reply_count = reply_count + 1 where id = v_racine;
  end if;

  return jsonb_build_object('ok', true, 'comment', public._commentaire_json(v_new));
end;
$$;
grant execute on function public.publier_commentaire(text, text, text, uuid) to authenticated;

create or replace function public.modifier_commentaire(p_id uuid, p_texte text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_texte text := trim(p_texte);
  v_c public.content_comments;
begin
  if char_length(v_texte) = 0 or char_length(v_texte) > 2000 then return jsonb_build_object('ok', false, 'error', 'longueur'); end if;
  update public.content_comments
     set texte = v_texte,
         edited_at = now(),
         statut = case when exists (select 1 from public.community_banned_terms bt where v_texte ilike '%' || bt.term || '%')
                       then 'masque_filtre_auto' else statut end
   where id = p_id and user_id = auth.uid() and statut in ('publie', 'masque_filtre_auto')
  returning * into v_c;
  if v_c.id is null then return jsonb_build_object('ok', false, 'error', 'introuvable'); end if;
  return jsonb_build_object('ok', true, 'comment', public._commentaire_json(v_c));
end;
$$;
grant execute on function public.modifier_commentaire(uuid, text) to authenticated;

create or replace function public.supprimer_commentaire(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_c public.content_comments;
begin
  update public.content_comments set statut = 'supprime'
   where id = p_id and user_id = auth.uid() and statut <> 'supprime'
  returning * into v_c;
  if v_c.id is null then return jsonb_build_object('ok', false, 'error', 'introuvable'); end if;
  if v_c.parent_id is not null then
    update public.content_comments set reply_count = greatest(reply_count - 1, 0) where id = v_c.parent_id;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.supprimer_commentaire(uuid) to authenticated;

-- J'aime / je n'aime plus (bascule). Renvoie l'état et le compteur à jour.
create or replace function public.aimer_commentaire(p_id uuid, p_aime boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'error', 'non_connecte'); end if;
  if not exists (select 1 from public.content_comments where id = p_id and statut = 'publie') then
    return jsonb_build_object('ok', false, 'error', 'introuvable');
  end if;
  if p_aime then
    insert into public.content_comment_likes (comment_id, user_id) values (p_id, auth.uid()) on conflict do nothing;
  else
    delete from public.content_comment_likes where comment_id = p_id and user_id = auth.uid();
  end if;
  select count(*) into v_n from public.content_comment_likes where comment_id = p_id;
  update public.content_comments set like_count = v_n where id = p_id;
  return jsonb_build_object('ok', true, 'liked', p_aime, 'like_count', v_n);
end;
$$;
grant execute on function public.aimer_commentaire(uuid, boolean) to authenticated;

-- Signalement : une fois par personne ; masqué automatiquement à 3 signalements.
create or replace function public.signaler_commentaire(p_id uuid, p_motif text default 'contenu_inapproprie')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n integer;
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'error', 'non_connecte'); end if;
  insert into public.content_comment_reports (comment_id, user_id, motif)
  values (p_id, auth.uid(), coalesce(p_motif, 'contenu_inapproprie'))
  on conflict do nothing;
  select count(*) into v_n from public.content_comment_reports where comment_id = p_id;
  update public.content_comments
     set nb_signalements = v_n,
         statut = case when v_n >= 3 and statut = 'publie' then 'masque_signalements' else statut end
   where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;
grant execute on function public.signaler_commentaire(uuid, text) to authenticated;
