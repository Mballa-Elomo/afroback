-- =====================================================================
-- AFROBACK · Traductions anglaises : titres des chapitres des récits de héros
-- (2026-10-07, agent afroback-traduction-fr-en, premier passage de contrôle)
--
-- Constat : dans recit_chapitres_en des 7 héros publiés, le texte de chaque
-- chapitre est bien en anglais, mais le champ "titre" est resté en français
-- (28 titres). Ces titres s'affichent en anglais sur le site (lecteur et
-- titres des vidéos par chapitre, lib/content.ts) et serviront aussi à
-- l'app pour les chapitres du storyboard et de l'audio.
--
-- Ce script ne remplace QUE la clé "titre" de chaque chapitre de
-- recit_chapitres_en, repérée par son "numero". Le texte anglais des
-- chapitres, l'ordre et les autres clés restent intacts. Aucune colonne
-- française n'est touchée. Rejouable sans risque.
--
-- Source : export du 2026-10-07 (context/import/Supabase Snippet Untitled
-- query.csv), champ recit_chapitres_fr[].titre.
-- BROUILLON à faire relire par un anglophone.
-- =====================================================================

update public.heros h set recit_chapitres_en = (
  select jsonb_agg(case when t.titre is not null then e.c || jsonb_build_object('titre', t.titre) else e.c end order by e.ord)
  from jsonb_array_elements(h.recit_chapitres_en) with ordinality as e(c, ord)
  left join (values
    (1, $t$Born into a world that is closing in$t$),  -- Naître dans un monde qui se referme
    (2, $t$The negotiator$t$),  -- La négociatrice
    (3, $t$The queen without a kingdom$t$),  -- La reine sans royaume
    (4, $t$The sovereign who stays standing$t$)  -- La souveraine qui reste debout
  ) as t(numero, titre) on (e.c->>'numero')::int = t.numero
)
where h.slug = $t$reine-nzinga$t$ and jsonb_array_length(coalesce(h.recit_chapitres_en, '[]'::jsonb)) > 0;

update public.heros h set recit_chapitres_en = (
  select jsonb_agg(case when t.titre is not null then e.c || jsonb_build_object('titre', t.titre) else e.c end order by e.ord)
  from jsonb_array_elements(h.recit_chapitres_en) with ordinality as e(c, ord)
  left join (values
    (1, $t$Born at the crossroads of two worlds$t$),  -- Naître à la croisée de deux mondes
    (2, $t$Seeing with his own eyes$t$),  -- Voir avec ses propres yeux
    (3, $t$The letter and the firing squad$t$),  -- La lettre et le peloton
    (4, $t$What the earth keeps$t$)  -- Ce que la terre garde
  ) as t(numero, titre) on (e.c->>'numero')::int = t.numero
)
where h.slug = $t$martin-paul-samba$t$ and jsonb_array_length(coalesce(h.recit_chapitres_en, '[]'::jsonb)) > 0;

update public.heros h set recit_chapitres_en = (
  select jsonb_agg(case when t.titre is not null then e.c || jsonb_build_object('titre', t.titre) else e.c end order by e.ord)
  from jsonb_array_elements(h.recit_chapitres_en) with ordinality as e(c, ord)
  left join (values
    (1, $t$Born in a kingdom without writing$t$),  -- Naître dans un royaume sans écriture
    (2, $t$A throne to win, a dream to carry$t$),  -- Un trône à conquérir, un rêve à porter
    (3, $t$Twenty years to invent a memory$t$),  -- Vingt ans pour inventer une mémoire
    (4, $t$What a king can save without an army$t$)  -- Ce qu'un roi peut sauver sans une armée
  ) as t(numero, titre) on (e.c->>'numero')::int = t.numero
)
where h.slug = $t$sultan-njoya$t$ and jsonb_array_length(coalesce(h.recit_chapitres_en, '[]'::jsonb)) > 0;

update public.heros h set recit_chapitres_en = (
  select jsonb_agg(case when t.titre is not null then e.c || jsonb_build_object('titre', t.titre) else e.c end order by e.ord)
  from jsonb_array_elements(h.recit_chapitres_en) with ordinality as e(c, ord)
  left join (values
    (1, $t$Born the subject of an empire changing masters$t$),  -- Naître sujet d'un empire qui change de maître
    (2, $t$The Mpodol, from the grassroots to the UN rostrum$t$),  -- Le Mpodol, de la base à la tribune de l'ONU
    (3, $t$The maquis and the manhunt$t$),  -- Le maquis et la traque
    (4, $t$Silence, then recognition$t$)  -- Le silence, puis la reconnaissance
  ) as t(numero, titre) on (e.c->>'numero')::int = t.numero
)
where h.slug = $t$ruben-um-nyobe$t$ and jsonb_array_length(coalesce(h.recit_chapitres_en, '[]'::jsonb)) > 0;

update public.heros h set recit_chapitres_en = (
  select jsonb_agg(case when t.titre is not null then e.c || jsonb_build_object('titre', t.titre) else e.c end order by e.ord)
  from jsonb_array_elements(h.recit_chapitres_en) with ordinality as e(c, ord)
  left join (values
    (1, $t$Born at the hinge of two worlds$t$),  -- Naître à la charnière de deux mondes
    (2, $t$Rising through loyalty, and the price paid$t$),  -- L'ascension par la loyauté, le prix payé
    (3, $t$Flight, exodus and a return under surveillance$t$),  -- La fuite, l'exode et le retour sous surveillance
    (4, $t$Power, wealth and a memory that remains a battlefield$t$)  -- Le pouvoir, la richesse et une mémoire qui reste un champ de bataille
  ) as t(numero, titre) on (e.c->>'numero')::int = t.numero
)
where h.slug = $t$charles-atangana$t$ and jsonb_array_length(coalesce(h.recit_chapitres_en, '[]'::jsonb)) > 0;

update public.heros h set recit_chapitres_en = (
  select jsonb_agg(case when t.titre is not null then e.c || jsonb_build_object('titre', t.titre) else e.c end order by e.ord)
  from jsonb_array_elements(h.recit_chapitres_en) with ordinality as e(c, ord)
  left join (values
    (1, $t$The child the colonial system trained$t$),  -- L'enfant que le système colonial a formé
    (2, $t$The rise, the blood of New-Bell, the flight$t$),  -- L'ascension, le sang de New-Bell, la fuite
    (3, $t$Exile, brotherhood, poison$t$),  -- L'exil, la fraternité, le poison
    (4, $t$Silence, the shadow of doubt, the legacy$t$)  -- Le silence, l'ombre du doute, l'héritage
  ) as t(numero, titre) on (e.c->>'numero')::int = t.numero
)
where h.slug = $t$felix-moumie$t$ and jsonb_array_length(coalesce(h.recit_chapitres_en, '[]'::jsonb)) > 0;

update public.heros h set recit_chapitres_en = (
  select jsonb_agg(case when t.titre is not null then e.c || jsonb_build_object('titre', t.titre) else e.c end order by e.ord)
  from jsonb_array_elements(h.recit_chapitres_en) with ordinality as e(c, ord)
  left join (values
    (1, $t$The coloniser's schoolteacher$t$),  -- L'instituteur du colonisateur
    (2, $t$From words to arms$t$),  -- De la parole aux armes
    (3, $t$The last of the four$t$),  -- Le dernier des quatre
    (4, $t$Back to the roots$t$)  -- Retour aux origines
  ) as t(numero, titre) on (e.c->>'numero')::int = t.numero
)
where h.slug = $t$ernest-ouandie$t$ and jsonb_array_length(coalesce(h.recit_chapitres_en, '[]'::jsonb)) > 0;

-- Ajout Jarvis : l'avertissement de lecture anglais doit être lisible dans le
-- catalogue public, comme sa version française (l'app l'affiche aussi aux
-- non-abonnés, ex. Charles Atangana).
grant select (avertissement_lecture_en) on public.heros to anon, authenticated;

-- Contrôle : doit renvoyer 7 lignes, chacune avec 4 chapitres et 0 titre
-- identique au français.
select slug,
  jsonb_array_length(recit_chapitres_en) as chapitres_en,
  (select count(*) from jsonb_array_elements(recit_chapitres_en) en
     join jsonb_array_elements(recit_chapitres_fr) fr on fr->>'numero' = en->>'numero'
   where fr->>'titre' = en->>'titre') as titres_encore_en_francais
from public.heros
where coalesce(statut_publication, 'publie') <> 'depublie'
order by ordre_affichage;
