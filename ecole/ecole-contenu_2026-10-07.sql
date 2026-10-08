-- École des Héros, étape 1 (Lire + Quiz) : contenu FR + EN des 11 leçons et des 4 grands quiz
-- Produit le 2026-10-07 par l'agent afroback-pedagogue. BROUILLON à relire (FR par Yannick, EN par un anglophone).
-- Source : export Supabase du 2026-10-07 (lignes heros) et récits du griot.
-- Prérequis : supabase/schema-ecole-contenu.sql exécuté (colonnes _en, explication, nouveau découpage des leçons).
-- Rejouable : update des textes, upsert des questions (on conflict).

begin;

-- ===================== NIVEAU 1 · Les Premiers Récits (3-5 ans) =====================

-- Leçon Sultan Njoya (niveau 1)
update public.ecole_lecons l set texte_adapte = $t$Il était une fois, dans un royaume de l'ouest du Cameroun, un roi qui s'appelait Njoya. Son peuple, les Bamoun, n'avait pas encore d'écriture à lui : les histoires du royaume étaient gardées seulement dans la mémoire des anciens. On raconte qu'un jour, Njoya fit un rêve, et qu'une grande idée lui vint : inventer une écriture rien que pour son peuple. Il dessina, il essaya, il recommença, pendant plus de vingt ans, sans jamais abandonner. Puis il ouvrit des écoles pour que les enfants apprennent à tracer ses signes. Aujourd'hui encore, à Foumban, des enfants apprennent l'écriture du roi Njoya !$t$,
  texte_adapte_en = $t$Once upon a time, in a kingdom in the west of Cameroon, there lived a king called Njoya. His people, the Bamum, did not yet have a writing of their own: the stories of the kingdom were kept only in the memory of the elders. It is said that one day Njoya had a dream, and a big idea came to him: to invent a writing just for his people. He drew, he tried, he started again, for more than twenty years, and he never gave up. Then he opened schools so that children could learn to draw his signs. Even today, in Foumban, children still learn King Njoya's writing!$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'sultan-njoya' and l.niveau = 1;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Qui était Njoya ?$t$, $t$Who was Njoya?$t$, $t$["👑 Un roi", "🐟 Un pêcheur"]$t$, $t$["👑 A king", "🐟 A fisherman"]$t$, 0, $t$Njoya était le roi des Bamoun, un royaume de l'ouest du Cameroun.$t$, $t$Njoya was the king of the Bamum, a kingdom in the west of Cameroon.$t$),
    (2, $t$Qu'est-ce que Njoya a inventé ?$t$, $t$What did Njoya invent?$t$, $t$["🚲 Un vélo", "✍️ Une écriture"]$t$, $t$["🚲 A bicycle", "✍️ A way to write"]$t$, 1, $t$Njoya a inventé une écriture rien que pour son peuple. Il a travaillé plus de vingt ans !$t$, $t$Njoya invented a writing just for his people. He worked on it for more than twenty years!$t$),
    (3, $t$Où les enfants apprenaient-ils l'écriture de Njoya ?$t$, $t$Where did children learn Njoya's writing?$t$, $t$["🏫 À l'école", "🏖️ À la plage"]$t$, $t$["🏫 At school", "🏖️ At the beach"]$t$, 0, $t$Njoya a ouvert des écoles. Aujourd'hui encore, à Foumban, des enfants apprennent ses signes !$t$, $t$Njoya opened schools. Even today, in Foumban, children still learn his signs!$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'sultan-njoya' and l.niveau = 1
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Leçon Reine Nzinga (niveau 1)
update public.ecole_lecons l set texte_adapte = $t$Il y a très longtemps, en Afrique, dans le pays qu'on appelle aujourd'hui l'Angola, vivait une princesse nommée Nzinga. Son papa, le roi, la gardait près de lui, et elle apprit à bien observer et à bien parler. Un jour, les Portugais, venus sur de grands bateaux, voulurent prendre son pays. Nzinga alla leur parler avec courage pour demander la paix, et elle l'obtint. Plus tard, elle devint reine et ne cessa jamais de défendre son peuple. Elle vécut jusqu'à quatre-vingts ans, et elle était toujours reine !$t$,
  texte_adapte_en = $t$A very long time ago, in Africa, in the country we now call Angola, there lived a princess named Nzinga. Her father, the king, kept her close to him, and she learned to watch carefully and to speak well. One day, the Portuguese, who came on big ships, wanted to take her country. Nzinga bravely went to talk to them to ask for peace, and she got it. Later she became queen, and she never stopped standing up for her people. She lived to be eighty, and she was still queen!$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'reine-nzinga' and l.niveau = 1;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Nzinga était la fille de qui ?$t$, $t$Whose daughter was Nzinga?$t$, $t$["🧺 D'un marchand", "👑 Du roi"]$t$, $t$["🧺 A merchant's", "👑 The king's"]$t$, 1, $t$Nzinga était la fille du roi. Il la gardait près de lui pour qu'elle apprenne.$t$, $t$Nzinga was the king's daughter. He kept her close to him so that she could learn.$t$),
    (2, $t$Qu'est-ce que Nzinga demanda aux Portugais ?$t$, $t$What did Nzinga ask the Portuguese for?$t$, $t$["🕊️ La paix", "🍬 Des bonbons"]$t$, $t$["🕊️ Peace", "🍬 Sweets"]$t$, 0, $t$Nzinga alla parler aux Portugais pour demander la paix, et elle l'obtint !$t$, $t$Nzinga went to talk to the Portuguese to ask for peace, and she got it!$t$),
    (3, $t$Que devint Nzinga plus tard ?$t$, $t$What did Nzinga become later?$t$, $t$["🍞 Une boulangère", "👸 Une reine"]$t$, $t$["🍞 A baker", "👸 A queen"]$t$, 1, $t$Nzinga devint reine, et elle était toujours reine à quatre-vingts ans.$t$, $t$Nzinga became queen, and she was still queen at eighty.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'reine-nzinga' and l.niveau = 1
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Grand quiz du niveau 1
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (1, 1, $t$Dans quel pays vivait le roi Njoya ?$t$, $t$In which country did King Njoya live?$t$, $t$["🌍 Au Cameroun", "❄️ Au pôle Nord"]$t$::jsonb, $t$["🌍 In Cameroon", "❄️ At the North Pole"]$t$::jsonb, 0, $t$Njoya était roi des Bamoun, dans l'ouest du Cameroun. Sa ville s'appelle Foumban.$t$, $t$Njoya was king of the Bamum, in the west of Cameroon. His town is called Foumban.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (1, 2, $t$Njoya a-t-il abandonné quand c'était difficile ?$t$, $t$Did Njoya give up when it was hard?$t$, $t$["🛑 Oui, très vite", "💪 Non, jamais"]$t$::jsonb, $t$["🛑 Yes, very quickly", "💪 No, never"]$t$::jsonb, 1, $t$Njoya a essayé et recommencé pendant plus de vingt ans, sans jamais abandonner.$t$, $t$Njoya tried and started again for more than twenty years, and he never gave up.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (1, 3, $t$Comment les Portugais arrivèrent-ils au pays de Nzinga ?$t$, $t$How did the Portuguese come to Nzinga's country?$t$, $t$["🚢 En bateau", "✈️ En avion"]$t$::jsonb, $t$["🚢 By ship", "✈️ By plane"]$t$::jsonb, 0, $t$Les Portugais arrivèrent sur de grands bateaux. Nzinga alla leur parler pour demander la paix.$t$, $t$The Portuguese came on big ships. Nzinga went to talk to them to ask for peace.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (1, 4, $t$Nzinga était-elle courageuse ?$t$, $t$Was Nzinga brave?$t$, $t$["🙈 Non, elle avait peur", "🦁 Oui, très courageuse"]$t$::jsonb, $t$["🙈 No, she was scared", "🦁 Yes, very brave"]$t$::jsonb, 1, $t$Oui ! Nzinga alla parler aux Portugais avec courage, et elle défendit son peuple toute sa vie.$t$, $t$Yes! Nzinga bravely went to talk to the Portuguese, and she stood up for her people all her life.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- ===================== NIVEAU 2 · Petits Explorateurs (6-8 ans) =====================

-- Leçon Reine Nzinga (niveau 2)
update public.ecole_lecons l set texte_adapte = $t$Tu sais d'où vient le nom de l'Angola ? Il y a très longtemps, le peuple mbundu appelait son roi le ngola. Les Portugais, arrivés par la mer, ont tiré de ce mot le nom de tout le pays !

Vers 1583 naît une princesse, Nzinga, fille du roi. Son père l'emmène au conseil : elle apprend à observer et à bien parler.

En 1621, son royaume, le Ndongo, est en danger. Nzinga part à Luanda pour discuter avec le gouverneur portugais. On raconte qu'on ne lui avait pas préparé de siège, et qu'elle trouva quand même le moyen de s'asseoir à sa hauteur, pour parler d'égale à égal. Ce qui est sûr, c'est qu'elle obtint la paix grâce à ses mots.

En 1624, Nzinga devient reine. Elle lutte pendant des années pour son peuple. En 1656, elle signe enfin la paix avec le Portugal et garde son royaume, le Matamba. Elle meurt à quatre-vingts ans, toujours reine. Nzinga, c'est l'intelligence qui ne plie jamais !$t$,
  texte_adapte_en = $t$Do you know where the name Angola comes from? A very long time ago, the Mbundu people called their king the ngola. The Portuguese, who arrived by sea, took this word to name the whole country!

Around 1583, a princess is born: Nzinga, the king's daughter. Her father takes her to the council, where she learns to watch carefully and to speak well.

In 1621, her kingdom, Ndongo, is in danger. Nzinga travels to Luanda to talk with the Portuguese governor. It is said that no seat had been prepared for her, and that she still found a way to sit at his level and speak as his equal. What we know for sure is that her words won peace.

In 1624, Nzinga becomes queen. For years she fights for her people. In 1656, she finally makes peace with Portugal and keeps her kingdom, Matamba. She dies at eighty, still a queen. Nzinga is intelligence that never bends!$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'reine-nzinga' and l.niveau = 2;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$De quel mot vient le nom de l'Angola ?$t$, $t$Which word does the name Angola come from?$t$, $t$["Luanda, une ville", "Ngola, le titre du roi", "Mbundu, un peuple"]$t$, $t$["Luanda, a city", "Ngola, the king's title", "Mbundu, a people"]$t$, 1, $t$Le peuple mbundu appelait son roi le ngola. Les Portugais en ont tiré le nom du pays : l'Angola !$t$, $t$The Mbundu people called their king the ngola. The Portuguese took this word to name the country: Angola!$t$),
    (2, $t$Pourquoi Nzinga va-t-elle à Luanda en 1621 ?$t$, $t$Why does Nzinga go to Luanda in 1621?$t$, $t$["Pour faire du commerce", "Pour se marier", "Pour discuter de la paix"]$t$, $t$["To trade", "To get married", "To talk about peace"]$t$, 2, $t$Nzinga part à Luanda pour discuter avec le gouverneur portugais. Grâce à ses mots, elle obtient la paix.$t$, $t$Nzinga travels to Luanda to talk with the Portuguese governor. Thanks to her words, she wins peace.$t$),
    (3, $t$Que raconte-t-on sur sa rencontre avec le gouverneur ?$t$, $t$What is said about her meeting with the governor?$t$, $t$["Il n'y avait pas de siège pour elle", "Elle est arrivée en retard", "Elle a chanté une chanson"]$t$, $t$["There was no seat for her", "She arrived late", "She sang a song"]$t$, 0, $t$On raconte qu'on ne lui avait pas préparé de siège. C'est une légende, mais elle montre sa fierté.$t$, $t$It is said that no seat had been prepared for her. It is a legend, but it shows her pride.$t$),
    (4, $t$Quel royaume Nzinga garde-t-elle grâce à la paix de 1656 ?$t$, $t$Which kingdom does Nzinga keep thanks to the peace of 1656?$t$, $t$["Le Ndongo", "Le Matamba", "Le Kongo"]$t$, $t$["Ndongo", "Matamba", "Kongo"]$t$, 1, $t$En 1656, Nzinga signe la paix avec le Portugal et garde le Matamba. Elle reste reine jusqu'à sa mort.$t$, $t$In 1656, Nzinga makes peace with Portugal and keeps Matamba. She remains queen until her death.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'reine-nzinga' and l.niveau = 2
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Leçon Sultan Njoya (niveau 2)
update public.ecole_lecons l set texte_adapte = $t$Tu aimes dessiner ? Le roi Njoya aussi, et ses dessins ont changé l'histoire de son peuple !

Njoya devient roi des Bamoun, dans l'ouest du Cameroun, il y a plus de cent ans. Sa capitale s'appelle Foumban. À cette époque, les Bamoun n'ont pas d'écriture à eux.

Vers 1896, Njoya raconte un rêve à sa cour. Selon son récit, un maître lui serait apparu pour lui montrer comment dessiner une main sur une planchette de bois. Dès lors, Njoya veut une écriture rien qu'à son peuple.

Certains se moquent de lui et disent que cela ne marchera jamais. Njoya s'entête. Il commence avec près de cinq cents dessins, puis il simplifie, encore et encore. Après sept versions et plus de vingt ans de travail, il obtient environ quatre-vingts signes. Il les appelle A ka u ku, d'après les quatre premiers.

Dès 1898, il ouvre des écoles au palais pour enseigner son écriture. Njoya, c'est la preuve qu'avec de la patience, on peut inventer de grandes choses !$t$,
  texte_adapte_en = $t$Do you like drawing? So did King Njoya, and his drawings changed the history of his people!

Njoya becomes king of the Bamum, in the west of Cameroon, more than a hundred years ago. His capital is called Foumban. At that time, the Bamum have no writing of their own.

Around 1896, Njoya tells his court about a dream. According to his story, a master appeared to him and showed him how to draw a hand on a small wooden board. From then on, Njoya wants a writing just for his people.

Some people laugh at him and say it will never work. Njoya refuses to give up. He starts with nearly five hundred drawings, then simplifies them, again and again. After seven versions and more than twenty years of work, he has about eighty signs. He calls them A ka u ku, after the first four.

From 1898, he opens schools at the palace to teach his writing. Njoya is proof that with patience, you can invent great things!$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'sultan-njoya' and l.niveau = 2;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Comment s'appelle la capitale du roi Njoya ?$t$, $t$What is the name of King Njoya's capital?$t$, $t$["Yaoundé", "Foumban", "Douala"]$t$, $t$["Yaoundé", "Foumban", "Douala"]$t$, 1, $t$La capitale de Njoya s'appelle Foumban. Il y ouvre des écoles au palais dès 1898.$t$, $t$Njoya's capital is called Foumban. He opens schools at the palace there from 1898.$t$),
    (2, $t$Combien de dessins Njoya utilise-t-il au début ?$t$, $t$How many drawings does Njoya use at the start?$t$, $t$["Près de cinq cents", "Exactement dix", "Près de dix mille"]$t$, $t$["Nearly five hundred", "Exactly ten", "Nearly ten thousand"]$t$, 0, $t$Njoya part de près de cinq cents dessins, puis il simplifie jusqu'à environ quatre-vingts signes.$t$, $t$Njoya starts with nearly five hundred drawings, then simplifies them down to about eighty signs.$t$),
    (3, $t$Comment Njoya appelle-t-il son écriture ?$t$, $t$What does Njoya call his writing?$t$, $t$["Abécédaire", "Hiéroglyphes", "A ka u ku"]$t$, $t$["ABC book", "Hieroglyphs", "A ka u ku"]$t$, 2, $t$Son écriture s'appelle A ka u ku, d'après ses quatre premiers signes.$t$, $t$His writing is called A ka u ku, after its first four signs.$t$),
    (4, $t$Que fait Njoya quand certains se moquent de lui ?$t$, $t$What does Njoya do when some people laugh at him?$t$, $t$["Il abandonne", "Il continue", "Il se fâche"]$t$, $t$["He gives up", "He keeps going", "He gets angry"]$t$, 1, $t$Njoya s'entête ! Il travaille plus de vingt ans et fait sept versions de son écriture.$t$, $t$Njoya refuses to give up! He works for more than twenty years and makes seven versions of his writing.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'sultan-njoya' and l.niveau = 2
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Leçon Martin Paul Samba (niveau 2)
update public.ecole_lecons l set texte_adapte = $t$Tu sais qu'on peut changer de chemin et choisir le bon ? Martin Paul Samba l'a fait.

Il naît près d'Ebolowa, dans le sud du Cameroun, au pays bulu. Son premier nom est Mebenga m'Ebono. Il perd très tôt son papa et sa maman.

En 1891, encore adolescent, il part en Allemagne pour devenir soldat. Là-bas, on lui donne un nouveau nom : Martin-Paul Samba. À son retour, il travaille d'abord pour l'armée allemande, qui commande alors le pays.

En 1902, il quitte l'armée et s'installe à Ebolowa. Il voit alors de près combien son peuple souffre : travail forcé, punitions, injustices. Son cœur change de camp.

Il devient chef chez les Bulu. En secret, avec le roi duala Rudolf Duala Manga Bell, il prépare une grande révolte contre le pouvoir allemand. En 1914, le plan est découvert. Samba a donné sa vie pour son peuple.

Aujourd'hui, sa statue veille sur Ebolowa, du haut d'une colline.$t$,
  texte_adapte_en = $t$Did you know that you can change paths and choose the right one? Martin Paul Samba did.

He is born near Ebolowa, in the south of Cameroon, in Bulu country. His first name is Mebenga m'Ebono. He loses his father and his mother very early.

In 1891, still a teenager, he goes to Germany to become a soldier. There, he is given a new name: Martin-Paul Samba. When he comes back, he first works for the German army, which then rules the country.

In 1902, he leaves the army and settles in Ebolowa. There he sees up close how much his people are suffering: forced labour, punishments, injustice. His heart changes sides.

He becomes a chief among the Bulu. In secret, with the Duala king Rudolf Duala Manga Bell, he prepares a great revolt against German rule. In 1914, the plan is discovered. Samba gave his life for his people.

Today, his statue watches over Ebolowa from the top of a hill.$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'martin-paul-samba' and l.niveau = 2;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Quel était le premier nom de Martin Paul Samba ?$t$, $t$What was Martin Paul Samba's first name?$t$, $t$["Charles Atangana", "Rudolf Manga Bell", "Mebenga m'Ebono"]$t$, $t$["Charles Atangana", "Rudolf Manga Bell", "Mebenga m'Ebono"]$t$, 2, $t$Il s'appelait Mebenga m'Ebono. On lui a donné le nom de Martin-Paul Samba en Allemagne.$t$, $t$His name was Mebenga m'Ebono. He was given the name Martin-Paul Samba in Germany.$t$),
    (2, $t$Où part-il en 1891 ?$t$, $t$Where does he go in 1891?$t$, $t$["En Allemagne", "En France", "Au Nigeria"]$t$, $t$["To Germany", "To France", "To Nigeria"]$t$, 0, $t$En 1891, encore adolescent, il part en Allemagne pour devenir soldat.$t$, $t$In 1891, still a teenager, he goes to Germany to become a soldier.$t$),
    (3, $t$Qu'est-ce qui fait changer son cœur de camp ?$t$, $t$What makes his heart change sides?$t$, $t$["Un rêve", "La souffrance de son peuple", "Un cadeau"]$t$, $t$["A dream", "His people's suffering", "A present"]$t$, 1, $t$À Ebolowa, il voit de près le travail forcé et les injustices. Son cœur change de camp.$t$, $t$In Ebolowa, he sees forced labour and injustice up close. His heart changes sides.$t$),
    (4, $t$Avec qui prépare-t-il une révolte en secret ?$t$, $t$Who does he secretly prepare a revolt with?$t$, $t$["Son professeur", "Rudolf Duala Manga Bell", "Un marchand"]$t$, $t$["His teacher", "Rudolf Duala Manga Bell", "A merchant"]$t$, 1, $t$Il prépare une grande révolte avec Rudolf Duala Manga Bell, un roi duala.$t$, $t$He prepares a great revolt with Rudolf Duala Manga Bell, a Duala king.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'martin-paul-samba' and l.niveau = 2
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Grand quiz du niveau 2
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (2, 1, $t$En quelle année Nzinga devient-elle reine ?$t$, $t$In which year does Nzinga become queen?$t$, $t$["1583", "1624", "1914"]$t$::jsonb, $t$["1583", "1624", "1914"]$t$::jsonb, 1, $t$Nzinga devient reine en 1624, trois ans après être allée à Luanda pour la paix.$t$, $t$Nzinga becomes queen in 1624, three years after going to Luanda for peace.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (2, 2, $t$Avec qui Nzinga discute-t-elle à Luanda ?$t$, $t$Who does Nzinga talk with in Luanda?$t$, $t$["Un pêcheur", "Le gouverneur portugais", "Son professeur"]$t$::jsonb, $t$["A fisherman", "The Portuguese governor", "Her teacher"]$t$::jsonb, 1, $t$À Luanda, Nzinga discute avec le gouverneur portugais et obtient la paix grâce à ses mots.$t$, $t$In Luanda, Nzinga talks with the Portuguese governor and wins peace with her words.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (2, 3, $t$Combien de signes compte l'écriture finale de Njoya ?$t$, $t$How many signs does Njoya's final writing have?$t$, $t$["Environ trois", "Environ dix mille", "Environ quatre-vingts"]$t$::jsonb, $t$["About three", "About ten thousand", "About eighty"]$t$::jsonb, 2, $t$Après sept versions, l'écriture de Njoya compte environ quatre-vingts signes.$t$, $t$After seven versions, Njoya's writing has about eighty signs.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (2, 4, $t$Où Njoya ouvre-t-il ses premières écoles ?$t$, $t$Where does Njoya open his first schools?$t$, $t$["Au palais", "Au marché", "Sur un bateau"]$t$::jsonb, $t$["At the palace", "At the market", "On a ship"]$t$::jsonb, 0, $t$Dès 1898, Njoya ouvre des écoles au palais pour enseigner son écriture.$t$, $t$From 1898, Njoya opens schools at the palace to teach his writing.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (2, 5, $t$Dans quelle ville Samba s'installe-t-il en 1902 ?$t$, $t$Which town does Samba settle in in 1902?$t$, $t$["Foumban", "Luanda", "Ebolowa"]$t$::jsonb, $t$["Foumban", "Luanda", "Ebolowa"]$t$::jsonb, 2, $t$Samba s'installe à Ebolowa en 1902. Aujourd'hui, sa statue veille sur la ville.$t$, $t$Samba settles in Ebolowa in 1902. Today, his statue watches over the town.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (2, 6, $t$Que devient Samba chez les Bulu ?$t$, $t$What does Samba become among the Bulu?$t$, $t$["Un musicien", "Un chef", "Un pêcheur"]$t$::jsonb, $t$["A musician", "A chief", "A fisherman"]$t$::jsonb, 1, $t$Samba devient chef chez les Bulu, puis prépare en secret une grande révolte.$t$, $t$Samba becomes a chief among the Bulu, then secretly prepares a great revolt.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- ===================== NIVEAU 3 · Grands Explorateurs (9-11 ans) =====================

-- Leçon Martin Paul Samba (niveau 3)
update public.ecole_lecons l set texte_adapte = $t$Le chemin d'un héros n'est pas toujours tout droit. Celui de Martin Paul Samba fait même un grand virage.

Il naît vers 1874 ou 1875 près d'Ebolowa, au pays bulu, dans le sud de ce qu'on appelle alors le Kamerun, une colonie allemande. On le nomme Mebenga m'Ebono. Orphelin très jeune, il est envoyé à Kribi, sur la côte. Un explorateur allemand, Kurt von Morgan, le remarque. En 1891, il part en Allemagne pour une formation militaire, et on le baptise Martin-Paul Samba.

Il faut être honnête : quand il revient en 1894, devenu officier, Samba sert l'administration coloniale. Pendant huit ans, il accompagne les expéditions de l'officier allemand Hans Dominik contre d'autres communautés camerounaises. Il a commencé du mauvais côté de l'histoire, et il a fini par en changer.

En 1902, il quitte l'armée et devient homme d'affaires à Ebolowa. Là, il voit chaque jour le travail forcé et les injustices que subit son peuple. Quelque chose se brise en lui.

En 1910, il devient chef chez les Bulu. En 1911, les Allemands nomment Charles Atangana chef supérieur des Ewondo, un peuple voisin. Samba s'inquiète : il pense que les Allemands veulent diviser les peuples pour mieux régner. Il décide de préparer un soulèvement.

En secret, il s'allie avec Rudolf Duala Manga Bell, roi du clan Bell chez les Duala. Samba cherche des armes auprès des Français, Manga Bell auprès des Britanniques. Pendant deux ans, Samba rassemble des soutiens et d'autres chefs. Ce n'était pas facile : il savait ce qu'il risquait.

En 1914, il écrit aux Français de Brazzaville, mais la lettre tombe entre les mains des Allemands. Il est arrêté le 1er août, puis tué par les autorités coloniales le 8 août 1914, à Ebolowa.

Selon la tradition d'Ebolowa, il aurait dit qu'il n'avait pas peur, et que les Allemands n'auraient jamais le Cameroun. Aucune archive ne le prouve : c'est une légende, transmise de bouche à oreille.

Quelques années plus tard, l'Allemagne perd le Kamerun. Samba avait vu juste.$t$,
  texte_adapte_en = $t$A hero's path is not always straight. Martin Paul Samba's even takes a big turn.

He is born around 1874 or 1875 near Ebolowa, in Bulu country, in the south of what was then called German Kamerun, a German colony. He is named Mebenga m'Ebono. Orphaned very young, he is sent to Kribi, on the coast. A German explorer, Kurt von Morgan, notices him. In 1891, he goes to Germany for military training, and he is baptised Martin-Paul Samba.

We have to be honest: when he returns in 1894 as an officer, Samba serves the colonial administration. For eight years, he goes along on the expeditions of the German officer Hans Dominik against other Cameroonian communities. He started on the wrong side of history, and in the end he changed sides.

In 1902, he leaves the army and becomes a businessman in Ebolowa. There, every day, he sees the forced labour and injustice his people suffer. Something breaks inside him.

In 1910, he becomes a chief among the Bulu. In 1911, the Germans make Charles Atangana paramount chief of the Ewondo, a neighbouring people. Samba is worried: he thinks the Germans want to divide the peoples so as to rule them more easily. He decides to prepare an uprising.

In secret, he joins forces with Rudolf Duala Manga Bell, king of the Bell clan among the Duala. Samba looks for weapons from the French, Manga Bell from the British. For two years, Samba gathers supporters and other chiefs. It was not easy: he knew what he was risking.

In 1914, he writes to the French in Brazzaville, but the letter falls into German hands. He is arrested on 1 August, then killed by the colonial authorities on 8 August 1914, in Ebolowa.

According to the tradition of Ebolowa, he said he was not afraid, and that the Germans would never have Cameroon. No archive proves it: it is a legend, passed on by word of mouth.

A few years later, Germany loses Kamerun. Samba had seen clearly.$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'martin-paul-samba' and l.niveau = 3;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Qui remarque le jeune Samba à Kribi ?$t$, $t$Who notices young Samba in Kribi?$t$, $t$["Hans Dominik", "Kurt von Morgan", "Charles Atangana"]$t$, $t$["Hans Dominik", "Kurt von Morgan", "Charles Atangana"]$t$, 1, $t$L'explorateur allemand Kurt von Morgan le remarque. En 1891, Samba part se former en Allemagne.$t$, $t$The German explorer Kurt von Morgan notices him. In 1891, Samba goes to Germany for training.$t$),
    (2, $t$Pour qui Samba travaille-t-il en revenant d'Allemagne ?$t$, $t$Who does Samba work for when he comes back from Germany?$t$, $t$["L'administration coloniale", "Les Britanniques", "Le roi Manga Bell"]$t$, $t$["The colonial administration", "The British", "King Manga Bell"]$t$, 0, $t$Devenu officier, il sert d'abord l'administration coloniale allemande pendant huit ans.$t$, $t$Now an officer, he first serves the German colonial administration for eight years.$t$),
    (3, $t$Pourquoi la nomination d'Atangana en 1911 inquiète-t-elle Samba ?$t$, $t$Why does Atangana's appointment in 1911 worry Samba?$t$, $t$["Il veut ce titre pour lui", "Atangana est son frère", "Il craint qu'on divise les peuples"]$t$, $t$["He wants the title for himself", "Atangana is his brother", "He fears the peoples will be divided"]$t$, 2, $t$Samba pense que les Allemands veulent diviser les peuples pour mieux régner. Il décide d'agir.$t$, $t$Samba thinks the Germans want to divide the peoples so as to rule them more easily. He decides to act.$t$),
    (4, $t$Auprès de qui Samba cherche-t-il des armes ?$t$, $t$Who does Samba look to for weapons?$t$, $t$["Les Français", "Les Britanniques", "Les Portugais"]$t$, $t$["The French", "The British", "The Portuguese"]$t$, 0, $t$Samba cherche des armes auprès des Français, et Manga Bell auprès des Britanniques.$t$, $t$Samba looks for weapons from the French, and Manga Bell from the British.$t$),
    (5, $t$Comment les Allemands découvrent-ils son plan ?$t$, $t$How do the Germans discover his plan?$t$, $t$["Un espion le suit", "Ils trouvent sa lettre", "Il l'avoue lui-même"]$t$, $t$["A spy follows him", "They find his letter", "He confesses himself"]$t$, 1, $t$Sa lettre aux Français de Brazzaville tombe entre les mains des Allemands. Il est arrêté le 1er août 1914.$t$, $t$His letter to the French in Brazzaville falls into German hands. He is arrested on 1 August 1914.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'martin-paul-samba' and l.niveau = 3
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Leçon Charles Atangana (niveau 3)
update public.ecole_lecons l set texte_adapte = $t$Écoute bien, car cette histoire ne se raconte pas d'une seule voix.

Charles Atangana naît vers 1880 à Mvolyé, un village qui fait aujourd'hui partie de Yaoundé. Il s'appelle d'abord Ntsama, onzième de douze enfants, chez les Ewondo. Son père meurt quand il a environ six ans.

Vers 1896, il est envoyé à l'école de la mission catholique de Kribi. Il y apprend l'allemand, l'histoire, la géographie et le calcul. Il devient le premier Ewondo baptisé catholique et reçoit un nouveau nom : Charles.

Ensuite, Atangana travaille pour l'administration allemande, qui contrôle alors le pays. Il est interprète, puis il organise la collecte de l'impôt chez les Ewondo. Il devient le bras droit du commandant allemand Hans Dominik. En 1911, les Allemands le nomment chef supérieur des Ewondo et des Bane, un titre nouveau qu'ils ont inventé.

La même année, il part en Allemagne. À Hambourg, il enseigne la langue ewondo et rassemble des contes et des proverbes beti dans un recueil, le Jaunde-Texte. En 1913, il est reçu par l'empereur d'Allemagne et par le pape.

Pendant la Première Guerre mondiale, en 1916, il fuit avec les Allemands jusqu'en Guinée espagnole, suivi par des milliers de personnes. Il revient au Cameroun en 1920, quand la France a pris la place de l'Allemagne, et redevient chef supérieur.

Il obtient des financements pour des routes, des écoles, des dispensaires et des églises, et aide à faire de Yaoundé le début d'une capitale. Son palais d'Efoulan est aujourd'hui un monument historique. Mais sa fortune vient aussi de l'impôt payé par les siens : en 1924, les Bane portent plainte, disant qu'ils travaillent pendant qu'Atangana reçoit l'argent.

Il meurt en 1943 à Mvolyé, là où tout avait commencé.

Alors, qui était Atangana ? Pour les uns, un homme qui a servi les colons pour son propre pouvoir ; pour les autres, un bâtisseur qui a obtenu ce qu'il pouvait pour les siens. Les historiens en débattent encore, et toi aussi, tu peux y réfléchir.$t$,
  texte_adapte_en = $t$Listen carefully, because this story cannot be told with just one voice.

Charles Atangana is born around 1880 in Mvolyé, a village that is now part of Yaoundé. His first name is Ntsama, and he is the eleventh of twelve children, among the Ewondo. His father dies when he is about six.

Around 1896, he is sent to the Catholic mission school in Kribi. There he learns German, history, geography and arithmetic. He becomes the first Ewondo to be baptised a Catholic and receives a new name: Charles.

After that, Atangana works for the German administration, which then controls the country. He is an interpreter, then he organises the collection of taxes among the Ewondo. He becomes the right-hand man of the German commander Hans Dominik. In 1911, the Germans make him paramount chief of the Ewondo and the Bane, a new title that they invented.

That same year, he travels to Germany. In Hamburg, he teaches the Ewondo language and gathers Beti tales and proverbs in a collection, the Jaunde-Texte. In 1913, he is received by the German emperor and by the Pope.

During the First World War, in 1916, he flees with the Germans to Spanish Guinea, followed by thousands of people. He returns to Cameroon in 1920, when France has taken Germany's place, and becomes paramount chief again.

He obtains funding for roads, schools, clinics and churches, and helps turn Yaoundé into the beginnings of a capital. His palace at Efoulan is a historic monument today. But his wealth also comes from the taxes paid by his own people: in 1924, the Bane file a complaint, saying that they do the work while Atangana receives the money.

He dies in 1943 in Mvolyé, where it all began.

So, who was Atangana? For some, a man who served the colonisers for his own power; for others, a builder who obtained what he could for his people. Historians still debate it, and you too can think about it.$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'charles-atangana' and l.niveau = 3;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Quel était le premier nom de Charles Atangana ?$t$, $t$What was Charles Atangana's first name?$t$, $t$["Ntsama", "Mebenga", "Njoya"]$t$, $t$["Ntsama", "Mebenga", "Njoya"]$t$, 0, $t$Il s'appelait Ntsama. Il reçoit le nom de Charles à son baptême, à la mission de Kribi.$t$, $t$His name was Ntsama. He receives the name Charles at his baptism, at the Kribi mission.$t$),
    (2, $t$Quelle langue enseigne-t-il à Hambourg ?$t$, $t$Which language does he teach in Hamburg?$t$, $t$["L'allemand", "Le bulu", "L'ewondo"]$t$, $t$["German", "Bulu", "Ewondo"]$t$, 2, $t$À Hambourg, il enseigne l'ewondo et rassemble des contes et proverbes beti : le Jaunde-Texte.$t$, $t$In Hamburg, he teaches Ewondo and gathers Beti tales and proverbs: the Jaunde-Texte.$t$),
    (3, $t$Qui reçoit Atangana en 1913 ?$t$, $t$Who receives Atangana in 1913?$t$, $t$["Le roi du Portugal", "L'empereur d'Allemagne et le pape", "Le sultan Njoya"]$t$, $t$["The king of Portugal", "The German emperor and the Pope", "Sultan Njoya"]$t$, 1, $t$En 1913, il est reçu par l'empereur Guillaume II et par le pape Pie X. Rares sont les Africains de son temps reçus ainsi.$t$, $t$In 1913, he is received by Emperor Wilhelm II and Pope Pius X. Few Africans of his time were received like this.$t$),
    (4, $t$Jusqu'où Atangana fuit-il avec les Allemands en 1916 ?$t$, $t$How far does Atangana flee with the Germans in 1916?$t$, $t$["Jusqu'en Guinée espagnole", "Jusqu'en Angola", "Jusqu'au Nigeria"]$t$, $t$["To Spanish Guinea", "To Angola", "To Nigeria"]$t$, 0, $t$En 1916, il fuit jusqu'en Guinée espagnole, suivi par des milliers de personnes.$t$, $t$In 1916, he flees to Spanish Guinea, followed by thousands of people.$t$),
    (5, $t$Quel monument rappelle Atangana à Yaoundé ?$t$, $t$Which monument recalls Atangana in Yaoundé?$t$, $t$["Le palais de Foumban", "Le palais d'Efoulan", "La statue d'Ebolowa"]$t$, $t$["The palace of Foumban", "The palace at Efoulan", "The statue in Ebolowa"]$t$, 1, $t$Son palais d'Efoulan, à Yaoundé, est aujourd'hui un monument historique classé.$t$, $t$His palace at Efoulan, in Yaoundé, is now a listed historic monument.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'charles-atangana' and l.niveau = 3
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Leçon Ruben Um Nyobè (niveau 3)
update public.ecole_lecons l set texte_adapte = $t$Tu sais ce que veut dire Mpodol ? C'est le surnom qu'un peuple entier a donné à Ruben Um Nyobè : celui qui porte la parole des siens.

Il naît le 10 avril 1913 à Song Mpeck, un village du pays bassa, près d'Éséka. Ses parents sont des paysans. Il étudie dans les écoles de la mission presbytérienne, puis il devient employé dans les tribunaux. Là, chaque jour, il voit passer les dossiers et les injustices que subissent les Camerounais sous la colonisation. C'est dans ces couloirs qu'il comprend vraiment ce que veut dire être colonisé.

Il devient syndicaliste, pour défendre les travailleurs. En 1947, il aide à créer un premier parti, mais l'administration française le dissout deux mois plus tard. Um Nyobè ne se décourage pas. Le 10 avril 1948, à Douala, un nouveau parti naît : l'Union des Populations du Cameroun, l'UPC. Um Nyobè n'est pas là ce soir-là, mais en novembre, on vient le chercher pour le diriger. On sait qu'il tiendra bon.

Um Nyobè préfère les armes de la paix : la grève, le boycott, les réunions patientes dans les villages. Il réclame la réunification du Cameroun, coupé en deux entre la France et la Grande-Bretagne, et l'indépendance. Le 17 décembre 1952, il parle à New York, devant les Nations unies. Imagine ce fils de paysans, debout devant le monde entier, en train de demander une date pour l'indépendance de son pays !

Mais ce n'était pas facile. En 1955, la France interdit l'UPC. D'autres dirigeants partent à l'étranger. Um Nyobè, lui, reste : il se cache dans la forêt bassa, sa terre natale. Pendant trois ans, il change de refuge, il écrit, il organise. Il crée même des actes de naissance et des cartes d'identité pour un pays qui n'existe pas encore.

Le 13 septembre 1958, il est tué par l'armée française près de Boumnyébel.

Pendant plus de trente ans, au Cameroun, il est interdit de prononcer son nom. En 1991, le pays le proclame enfin héros national. Um Nyobè n'était pas un homme parfait, mais il a porté la parole des siens jusqu'au bout.$t$,
  texte_adapte_en = $t$Do you know what Mpodol means? It is the nickname a whole people gave to Ruben Um Nyobè: the one who carries the voice of his people.

He is born on 10 April 1913 in Song Mpeck, a village in Bassa country, near Éséka. His parents are farmers. He studies at the Presbyterian mission schools, then he becomes a clerk in the courts. There, every day, he sees the case files go by, and the injustice that Cameroonians suffer under colonial rule. It is in those corridors that he truly understands what it means to be colonised.

He becomes a trade unionist, to stand up for workers. In 1947, he helps to create a first party, but the French administration dissolves it two months later. Um Nyobè does not give up. On 10 April 1948, in Douala, a new party is born: the Union of the Peoples of Cameroon, the UPC. Um Nyobè is not there that evening, but in November they come to fetch him to lead it. They know he will hold firm.

Um Nyobè prefers peaceful weapons: strikes, boycotts, patient meetings in the villages. He calls for the reunification of Cameroon, split in two between France and Britain, and for independence. On 17 December 1952, he speaks in New York, before the United Nations. Imagine this farmers' son, standing before the whole world, asking for a date for his country's independence!

But it was not easy. In 1955, France bans the UPC. Other leaders go abroad. Um Nyobè stays: he hides in the Bassa forest, the land where he was born. For three years, he moves from hideout to hideout, he writes, he organises. He even creates birth certificates and identity cards for a country that does not exist yet.

On 13 September 1958, he is killed by the French army near Boumnyébel.

For more than thirty years, in Cameroon, it is forbidden to speak his name. In 1991, the country finally proclaims him a national hero. Um Nyobè was not a perfect man, but he carried the voice of his people to the very end.$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'ruben-um-nyobe' and l.niveau = 3;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Que veut dire le surnom Mpodol ?$t$, $t$What does the nickname Mpodol mean?$t$, $t$["Le roi de la forêt", "Celui qui porte la parole des siens", "Le grand guerrier"]$t$, $t$["The king of the forest", "The one who carries his people's voice", "The great warrior"]$t$, 1, $t$Mpodol veut dire « celui qui porte la parole des siens ». C'est tout un peuple qui a donné ce surnom à Um Nyobè.$t$, $t$Mpodol means "the one who carries the voice of his people". A whole people gave Um Nyobè this nickname.$t$),
    (2, $t$Où Um Nyobè voit-il chaque jour les injustices coloniales ?$t$, $t$Where does Um Nyobè see colonial injustice every day?$t$, $t$["Dans les tribunaux", "Sur un bateau", "Au palais d'un roi"]$t$, $t$["In the courts", "On a ship", "In a king's palace"]$t$, 0, $t$Employé dans les tribunaux, il voit passer chaque jour les dossiers et les injustices. C'est là qu'il comprend la colonisation.$t$, $t$As a clerk in the courts, he sees case files and injustice every day. That is where he understands colonial rule.$t$),
    (3, $t$Quel parti Um Nyobè dirige-t-il à partir de novembre 1948 ?$t$, $t$Which party does Um Nyobè lead from November 1948?$t$, $t$["L'UPC", "Le parti du gouverneur", "Un parti allemand"]$t$, $t$["The UPC", "The governor's party", "A German party"]$t$, 0, $t$L'UPC naît à Douala le 10 avril 1948. Um Nyobè n'est pas là ce soir-là, mais on vient le chercher pour la diriger.$t$, $t$The UPC is born in Douala on 10 April 1948. Um Nyobè is not there that evening, but they come to fetch him to lead it.$t$),
    (4, $t$Où Um Nyobè prend-il la parole le 17 décembre 1952 ?$t$, $t$Where does Um Nyobè speak on 17 December 1952?$t$, $t$["À Paris", "Aux Nations unies, à New York", "À Berlin"]$t$, $t$["In Paris", "At the United Nations, in New York", "In Berlin"]$t$, 1, $t$À New York, devant les Nations unies, il demande la réunification du Cameroun et une date pour l'indépendance.$t$, $t$In New York, before the United Nations, he asks for Cameroon's reunification and a date for independence.$t$),
    (5, $t$Que fait Um Nyobè quand l'UPC est interdite en 1955 ?$t$, $t$What does Um Nyobè do when the UPC is banned in 1955?$t$, $t$["Il part vivre en France", "Il abandonne la lutte", "Il se cache dans la forêt bassa"]$t$, $t$["He goes to live in France", "He gives up the struggle", "He hides in the Bassa forest"]$t$, 2, $t$Il reste au pays et se cache dans la forêt bassa, sa terre natale. Pendant trois ans, il continue d'organiser la lutte.$t$, $t$He stays in the country and hides in the Bassa forest, the land of his birth. For three years, he keeps organising.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'ruben-um-nyobe' and l.niveau = 3
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Grand quiz du niveau 3
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (3, 1, $t$Quel était le nom de naissance de Martin Paul Samba ?$t$, $t$What was Martin Paul Samba's birth name?$t$, $t$["Mebenga m'Ebono", "Ntsama", "Mpodol"]$t$::jsonb, $t$["Mebenga m'Ebono", "Ntsama", "Mpodol"]$t$::jsonb, 0, $t$Samba s'appelait Mebenga m'Ebono. Il reçoit le nom de Martin-Paul Samba lors de son baptême, en Allemagne.$t$, $t$Samba's name was Mebenga m'Ebono. He is baptised Martin-Paul Samba in Germany.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (3, 2, $t$Avec quel roi Samba s'allie-t-il en secret ?$t$, $t$Which king does Samba secretly join forces with?$t$, $t$["Hans Dominik", "Rudolf Duala Manga Bell", "Kurt von Morgan"]$t$::jsonb, $t$["Hans Dominik", "Rudolf Duala Manga Bell", "Kurt von Morgan"]$t$::jsonb, 1, $t$Samba s'allie avec Rudolf Duala Manga Bell, roi du clan Bell chez les Duala, pour préparer un soulèvement.$t$, $t$Samba joins forces with Rudolf Duala Manga Bell, king of the Bell clan among the Duala, to prepare an uprising.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (3, 3, $t$En quelle année Samba devient-il chef chez les Bulu ?$t$, $t$In which year does Samba become a chief among the Bulu?$t$, $t$["1894", "1902", "1910"]$t$::jsonb, $t$["1894", "1902", "1910"]$t$::jsonb, 2, $t$Samba devient chef chez les Bulu en 1910, huit ans après avoir quitté l'armée.$t$, $t$Samba becomes a chief among the Bulu in 1910, eight years after leaving the army.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (3, 4, $t$Dans quelle école Atangana est-il envoyé vers 1896 ?$t$, $t$Which school is Atangana sent to around 1896?$t$, $t$["La mission catholique de Kribi", "Une école de Hambourg", "Une école de Brazzaville"]$t$::jsonb, $t$["The Catholic mission in Kribi", "A school in Hamburg", "A school in Brazzaville"]$t$::jsonb, 0, $t$À la mission catholique de Kribi, il apprend l'allemand, l'histoire, la géographie et le calcul.$t$, $t$At the Catholic mission in Kribi, he learns German, history, geography and arithmetic.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (3, 5, $t$Qu'est-ce que le Jaunde-Texte ?$t$, $t$What is the Jaunde-Texte?$t$, $t$["Une loi allemande", "Un recueil de contes et proverbes beti", "Un journal de Yaoundé"]$t$::jsonb, $t$["A German law", "A collection of Beti tales and proverbs", "A Yaoundé newspaper"]$t$::jsonb, 1, $t$À Hambourg, Atangana rassemble des contes et des proverbes beti dans un recueil : le Jaunde-Texte.$t$, $t$In Hamburg, Atangana gathers Beti tales and proverbs in a collection: the Jaunde-Texte.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (3, 6, $t$Pourquoi les Bane portent-ils plainte en 1924 ?$t$, $t$Why do the Bane file a complaint in 1924?$t$, $t$["Ils veulent un nouveau roi", "Ils refusent les routes", "Ils travaillent, Atangana touche l'argent"]$t$::jsonb, $t$["They want a new king", "They refuse the roads", "They work, Atangana gets the money"]$t$::jsonb, 2, $t$Les Bane disent qu'ils travaillent pendant qu'Atangana reçoit l'argent de l'impôt. C'est la part sombre de sa fortune.$t$, $t$The Bane say they do the work while Atangana receives the tax money. It is the dark side of his wealth.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (3, 7, $t$Dans quel village naît Ruben Um Nyobè ?$t$, $t$In which village is Ruben Um Nyobè born?$t$, $t$["Mvolyé", "Song Mpeck", "Ebolowa"]$t$::jsonb, $t$["Mvolyé", "Song Mpeck", "Ebolowa"]$t$::jsonb, 1, $t$Um Nyobè naît le 10 avril 1913 à Song Mpeck, en pays bassa, près d'Éséka. Ses parents sont paysans.$t$, $t$Um Nyobè is born on 10 April 1913 in Song Mpeck, in Bassa country, near Éséka. His parents are farmers.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (3, 8, $t$Que se passe-t-il pour Um Nyobè en 1991 ?$t$, $t$What happens for Um Nyobè in 1991?$t$, $t$["Il est proclamé héros national", "On construit son palais", "Son nom est interdit"]$t$::jsonb, $t$["He is proclaimed a national hero", "His palace is built", "His name is banned"]$t$::jsonb, 0, $t$En 1991, après plus de trente ans de silence imposé, le Cameroun proclame Um Nyobè héros national.$t$, $t$In 1991, after more than thirty years of enforced silence, Cameroon proclaims Um Nyobè a national hero.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- ===================== NIVEAU 4 · Héritiers de l'Histoire (12 ans et plus) =====================

-- Leçon Ruben Um Nyobè (niveau 4)
update public.ecole_lecons l set texte_adapte = $t$Le 10 avril 1913, à Song Mpeck, en pays bassa, non loin d'Éséka, naît un fils de paysans : Ruben Um Nyobè. Un jour, tout un peuple l'appellera Mpodol, « celui qui porte la parole des siens ».

Formé dans les écoles de la mission presbytérienne, il obtient son baccalauréat à vingt-six ans, à Édéa, tout en travaillant comme employé aux greffes des tribunaux. C'est là, au cœur de la justice coloniale, face aux peines et aux injustices infligées aux siens, qu'il apprend ce que signifie être colonisé.

Il s'engage dans le syndicalisme. En 1945, il entre à la direction de l'Union des syndicats confédérés du Cameroun, dont il devient secrétaire général en 1947. En septembre 1946, il traverse le continent jusqu'à Bamako, au premier congrès du Rassemblement démocratique africain, et comprend que la colonisation est un système qui pèse sur toute l'Afrique.

Son parcours politique commence par un échec. En avril 1947, il participe à la création du Rassemblement camerounais ; deux mois plus tard, l'administration française dissout le parti et mute Um Nyobè de force à Ngaoundéré. Le 10 avril 1948, dans un bar de Douala, des syndicalistes fondent l'Union des Populations du Cameroun (UPC). Um Nyobè n'y est pas. Mais en novembre 1948, après le retrait de Léopold Moumé Etia, c'est lui qu'on porte au poste de secrétaire général. L'histoire vraie n'est pas toujours celle du fondateur présent au premier jour.

Um Nyobè refuse le repli tribal et choisit la lutte pacifique : boycott, grève, manifestation, organisation patiente à la base. Le 17 décembre 1952, devant la Quatrième Commission de l'ONU, à New York, il réclame la révision des accords de tutelle, la réunification immédiate du Kamerun français et du Kamerun britannique, et un « programme-école » de dix ans vers l'indépendance, sous la supervision de l'ONU.

En mai 1955, des émeutes éclatent et sont durement réprimées. Le 13 juillet 1955, un décret du haut-commissaire Roland Pré dissout l'UPC. Plusieurs dirigeants partent en exil ; Um Nyobè, lui, entre dans le maquis bassa. Pendant trois ans, il organise une administration parallèle, avec actes de naissance, actes de mariage et cartes d'identité, sans renoncer à chercher une solution politique.

En face, la France parle de « maintien de l'ordre ». Les historiens parlent aujourd'hui d'une véritable guerre de décolonisation, dont le bilan humain reste discuté, mais dont la brutalité ne fait aucun doute.

Le 13 septembre 1958, après des mois de traque, Um Nyobè est tué par l'armée française près de Boumnyébel. Il a quarante-cinq ans. Il est enterré sans nom et sans cérémonie, comme si l'on voulait effacer jusqu'à son souvenir.

Pendant plus de trente ans, son nom est interdit au Cameroun. En 1991, l'Assemblée nationale le proclame héros national, et une loi lève l'interdit qui pesait sur sa mémoire. En 2007, une statue est inaugurée en son honneur à Éséka. La France, elle, a longtemps nié toute implication. Le 30 juillet 2025, après le rapport d'une commission d'historiens franco-camerounais, le président Emmanuel Macron reconnaît, dans une lettre à Paul Biya, la responsabilité de la France dans sa mort.

Um Nyobè n'était ni un saint ni un homme sans échec. Mais il a choisi, jusqu'au bout, de porter la parole des siens.$t$,
  texte_adapte_en = $t$On 10 April 1913, in Song Mpeck, in Bassa country, not far from Éséka, a farmers' son is born: Ruben Um Nyobè. One day, a whole people will call him Mpodol, "the one who carries the voice of his people".

Educated at the Presbyterian mission schools, he passes his baccalaureate at twenty-six, in Édéa, while working as a court registry clerk. It is there, at the heart of colonial justice, facing the sentences and injustice handed out to his own people, that he learns what it means to be colonised.

He becomes a trade unionist. In 1945, he joins the leadership of the Union of Confederated Trade Unions of Cameroon, and becomes its general secretary in 1947. In September 1946, he crosses the continent to Bamako, for the first congress of the African Democratic Rally, and understands that colonialism is a system weighing on the whole of Africa.

His political journey begins with a failure. In April 1947, he helps to create the Rassemblement camerounais; two months later, the French administration dissolves the party and forcibly transfers Um Nyobè to Ngaoundéré. On 10 April 1948, in a bar in Douala, trade unionists found the Union of the Peoples of Cameroon (UPC). Um Nyobè is not there. But in November 1948, after Léopold Moumé Etia steps aside, he is the one chosen as general secretary. True history is not always the story of a founder present on the very first day.

Um Nyobè rejects ethnic division and chooses peaceful struggle: boycotts, strikes, demonstrations, patient grassroots organising. On 17 December 1952, before the Fourth Committee of the UN, in New York, he calls for the revision of the trusteeship agreements, the immediate reunification of French and British Kamerun, and a ten-year "school programme" towards independence, supervised by the UN.

In May 1955, riots break out and are harshly put down. On 13 July 1955, a decree by High Commissioner Roland Pré dissolves the UPC. Several leaders go into exile; Um Nyobè goes into the Bassa maquis, the resistance hidden in the forest. For three years, he runs a parallel administration, with birth certificates, marriage certificates and identity cards, while still seeking a political solution.

On the other side, France speaks of "keeping order". Historians today speak of a real war of decolonisation, whose human toll is still debated, but whose brutality is beyond doubt.

On 13 September 1958, after months of pursuit, Um Nyobè is killed by the French army near Boumnyébel. He is forty-five. He is buried without a name and without a ceremony, as if someone wanted to erase even his memory.

For more than thirty years, his name is banned in Cameroon. In 1991, the National Assembly proclaims him a national hero, and a law lifts the ban on his memory. In 2007, a statue is unveiled in his honour in Éséka. France, for its part, long denied any involvement. On 30 July 2025, after the report of a joint commission of French and Cameroonian historians, President Emmanuel Macron acknowledges, in a letter to Paul Biya, France's responsibility for his death.

Um Nyobè was neither a saint nor a man without failures. But he chose, to the very end, to carry the voice of his people.$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'ruben-um-nyobe' and l.niveau = 4;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Que devient le Rassemblement camerounais, créé en avril 1947 ?$t$, $t$What happens to the Rassemblement camerounais, created in April 1947?$t$, $t$["Il gagne les élections", "Il est dissous deux mois plus tard", "Il devient l'UPC", "Il s'installe à New York"]$t$, $t$["It wins the elections", "It is dissolved two months later", "It becomes the UPC", "It moves to New York"]$t$, 1, $t$L'administration française le dissout deux mois plus tard et mute Um Nyobè à Ngaoundéré. Un échec qui ne l'arrête pas.$t$, $t$The French administration dissolves it two months later and transfers Um Nyobè to Ngaoundéré. A failure that does not stop him.$t$),
    (2, $t$Quelles méthodes de lutte Um Nyobè choisit-il ?$t$, $t$Which methods of struggle does Um Nyobè choose?$t$, $t$["Boycott, grève, manifestation", "Le sabotage des ports", "Une alliance avec l'Allemagne", "Le repli sur son ethnie"]$t$, $t$["Boycotts, strikes, demonstrations", "Sabotaging the ports", "An alliance with Germany", "Withdrawing into his own group"]$t$, 0, $t$Um Nyobè refuse le repli tribal et choisit la lutte pacifique, avec une organisation patiente à la base.$t$, $t$Um Nyobè rejects ethnic division and chooses peaceful struggle, with patient grassroots organising.$t$),
    (3, $t$Combien d'années dure le « programme-école » proposé à l'ONU ?$t$, $t$How many years does the "school programme" put to the UN last?$t$, $t$["Deux ans", "Cinq ans", "Dix ans", "Vingt-cinq ans"]$t$, $t$["Two years", "Five years", "Ten years", "Twenty-five years"]$t$, 2, $t$En 1952, il propose un « programme-école » de dix ans, sous la supervision de l'ONU, pour mener le pays à l'indépendance.$t$, $t$In 1952, he proposes a ten-year "school programme", supervised by the UN, to lead the country to independence.$t$),
    (4, $t$Que met en place Um Nyobè dans le maquis ?$t$, $t$What does Um Nyobè set up in the maquis?$t$, $t$["Une monnaie", "Une radio", "Une université", "Des actes d'état civil et des cartes d'identité"]$t$, $t$["A currency", "A radio station", "A university", "Civil records and identity cards"]$t$, 3, $t$Dans la clandestinité, il organise une administration parallèle : actes de naissance, de mariage, cartes d'identité.$t$, $t$In hiding, he runs a parallel administration: birth and marriage certificates, identity cards.$t$),
    (5, $t$Que reconnaît la France le 30 juillet 2025 ?$t$, $t$What does France acknowledge on 30 July 2025?$t$, $t$["Le tracé d'une frontière", "Sa responsabilité dans sa mort", "Le siège de l'UPC à l'ONU", "Le surnom de Mpodol"]$t$, $t$["The line of a border", "Its responsibility for his death", "The UPC's seat at the UN", "The nickname Mpodol"]$t$, 1, $t$Dans une lettre à Paul Biya, Emmanuel Macron reconnaît la responsabilité de la France dans la mort d'Um Nyobè.$t$, $t$In a letter to Paul Biya, Emmanuel Macron acknowledges France's responsibility for Um Nyobè's death.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'ruben-um-nyobe' and l.niveau = 4
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Leçon Félix-Roland Moumié (niveau 4)
update public.ecole_lecons l set texte_adapte = $t$Félix-Roland Moumié naît le 1er novembre 1925 à l'hôpital protestant de Njissé, près de Foumban. Son père, Samuel Mekou Moumié, est évangéliste ; sa mère s'appelle Suzanne Mvuh. Le Cameroun est alors un territoire sous tutelle, confié à la France.

À une époque où très peu d'enfants africains font des études, il réussit brillamment : l'école régionale de Dschang, puis l'école Édouard-Renard de Brazzaville en 1941. En 1945, il part à Dakar se former comme médecin. L'administration coloniale forme une poignée d'Africains pour en faire ses auxiliaires. Mais ce genre de formation produit parfois l'inverse : des hommes qui voient de l'intérieur comment fonctionne le système, et qui décident de le combattre.

En 1947, Moumié devient médecin dans le sud du pays. À Kribi, petite ville de la côte, il rencontre Ruben Um Nyobè. Il rejoint l'Union des Populations du Cameroun (UPC), fondée en 1948. Son ascension est rapide : vice-président en 1950, il est élu président du parti en 1952, au congrès d'Éséka. Um Nyobè reste le stratège sur le terrain ; Moumié devient la voix qui porte le message au-delà des frontières.

Le 22 mai 1955, l'UPC adopte son emblème, un crabe noir sur fond rouge. Quelques jours plus tard, des manifestations sont violemment réprimées, à Douala et ailleurs ; le nombre exact de morts reste discuté, mais l'ampleur du drame ne l'est pas. Le 13 juillet, l'UPC est interdite. Moumié passe au Cameroun britannique : c'est le début de cinq années d'exil.

Il y organise des comités clandestins et cofonde le mouvement « One Kamerun », qui réclame la réunification des deux Cameroun. En 1956, une première tentative d'assassinat contre lui échoue. En 1957, les Britanniques l'arrêtent et l'expulsent vers le Soudan. En 1958, à Accra, il se lie d'amitié avec Frantz Fanon. Après la mort d'Um Nyobè, en septembre 1958, il devient le chef en exil d'un mouvement interdit.

En 1959, devant l'ONU, il demande que des élections libres précèdent l'indépendance. Pour lui, celle du 1er janvier 1960, préparée sous le contrôle de la France avec Ahmadou Ahidjo, n'est qu'une souveraineté sous surveillance. En 1960, il se rend au Congo avec un autre militant, Osendé Afana, pour rencontrer Patrice Lumumba.

En octobre 1960, à Genève, il dîne avec un homme qui se présente comme journaliste : William Bechtel. Ce soir-là, il est empoisonné au thallium, un poison presque indétectable. Il meurt à Genève quelques semaines plus tard. Bechtel, arrêté des années après, bénéficie d'un non-lieu en 1980 : il ne sera jamais condamné.

Qui a commandité ce crime ? La piste la mieux documentée mène aux services secrets français, le SDECE, et à Jacques Foccart, qui dirigeait dans l'ombre la politique africaine de la France. Certaines sources camerounaises évoquent plutôt le gouvernement d'Ahmadou Ahidjo, mais cette piste repose sur des preuves moins solides. Distinguer ce qui est prouvé de ce qui est supposé, c'est aussi cela, faire de l'histoire.

Le 16 décembre 1991, le Cameroun le proclame héros national. Moumié n'a pas eu besoin de légende : il lui a suffi de réclamer, devant le monde entier, que son peuple choisisse lui-même son destin.$t$,
  texte_adapte_en = $t$Félix-Roland Moumié is born on 1 November 1925 at the Protestant hospital in Njissé, near Foumban. His father, Samuel Mekou Moumié, is an evangelist; his mother's name is Suzanne Mvuh. Cameroon is then a trust territory, placed under French administration.

At a time when very few African children go on to study, he does brilliantly: the regional school in Dschang, then the Édouard-Renard school in Brazzaville in 1941. In 1945, he goes to Dakar to train as a doctor. The colonial administration trains a handful of Africans to become its assistants. But this kind of training sometimes produces the opposite: men who see from the inside how the system works, and who decide to fight it.

In 1947, Moumié becomes a doctor in the south of the country. In Kribi, a small coastal town, he meets Ruben Um Nyobè. He joins the Union of the Peoples of Cameroon (UPC), founded in 1948. He rises fast: vice-president in 1950, he is elected president of the party in 1952, at the Éséka congress. Um Nyobè remains the strategist on the ground; Moumié becomes the voice that carries the message beyond the borders.

On 22 May 1955, the UPC adopts its emblem, a black crab on a red background. A few days later, demonstrations are violently put down, in Douala and elsewhere; the exact number of dead is still debated, but the scale of the tragedy is not. On 13 July, the UPC is banned. Moumié crosses into British Cameroon: it is the start of five years of exile.

There he organises underground committees and co-founds the "One Kamerun" movement, which calls for the reunification of the two Cameroons. In 1956, a first attempt on his life fails. In 1957, the British arrest him and expel him to Sudan. In 1958, in Accra, he becomes friends with Frantz Fanon. After Um Nyobè's death, in September 1958, he becomes the leader in exile of a banned movement.

In 1959, before the UN, he asks for free elections to come before independence. For him, the independence of 1 January 1960, prepared under French control with Ahmadou Ahidjo, is only sovereignty under watch. In 1960, he travels to the Congo with another activist, Osendé Afana, to meet Patrice Lumumba.

In October 1960, in Geneva, he has dinner with a man who presents himself as a journalist: William Bechtel. That evening, he is poisoned with thallium, a poison that is almost impossible to detect. He dies in Geneva a few weeks later. Bechtel, arrested years afterwards, has the case against him dismissed in 1980: he will never be convicted.

Who ordered this crime? The best-documented lead points to the French secret service, the SDECE, and to Jacques Foccart, who ran France's African policy from the shadows. Some Cameroonian sources point instead to Ahmadou Ahidjo's government, but that lead rests on weaker evidence. Telling what is proven apart from what is supposed is also what history is about.

On 16 December 1991, Cameroon proclaims him a national hero. Moumié did not need a legend: it was enough for him to demand, before the whole world, that his people choose their own destiny.$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'felix-moumie' and l.niveau = 4;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Quel métier Félix Moumié apprend-il à Dakar ?$t$, $t$Which profession does Félix Moumié train for in Dakar?$t$, $t$["Instituteur", "Avocat", "Médecin", "Journaliste"]$t$, $t$["Teacher", "Lawyer", "Doctor", "Journalist"]$t$, 2, $t$À Dakar, il est formé comme médecin. En 1947, il devient médecin dans le sud du pays, où il rencontre Um Nyobè à Kribi.$t$, $t$In Dakar, he trains as a doctor. In 1947, he becomes a doctor in the south, where he meets Um Nyobè in Kribi.$t$),
    (2, $t$Que réclame le mouvement « One Kamerun » cofondé par Moumié ?$t$, $t$What does the "One Kamerun" movement co-founded by Moumié call for?$t$, $t$["L'union avec le Nigeria", "La réunification des deux Cameroun", "Le retour de l'Allemagne", "Un roi pour tout le pays"]$t$, $t$["Union with Nigeria", "The reunification of the two Cameroons", "Germany's return", "A king for the whole country"]$t$, 1, $t$Depuis le Cameroun britannique, Moumié cofonde « One Kamerun » pour réunir les deux Cameroun séparés par la colonisation.$t$, $t$From British Cameroon, Moumié co-founds "One Kamerun" to reunite the two Cameroons split by colonial rule.$t$),
    (3, $t$De qui Moumié devient-il l'ami à Accra en 1958 ?$t$, $t$Who does Moumié become friends with in Accra in 1958?$t$, $t$["Frantz Fanon", "Patrice Lumumba", "Ahmadou Ahidjo", "William Bechtel"]$t$, $t$["Frantz Fanon", "Patrice Lumumba", "Ahmadou Ahidjo", "William Bechtel"]$t$, 0, $t$À Accra, Moumié se lie d'amitié avec Frantz Fanon. Il ne rencontrera Patrice Lumumba qu'en 1960, au Congo.$t$, $t$In Accra, Moumié becomes friends with Frantz Fanon. He will only meet Patrice Lumumba in 1960, in the Congo.$t$),
    (4, $t$Comment Moumié est-il assassiné en 1960 ?$t$, $t$How is Moumié assassinated in 1960?$t$, $t$["Dans un accident de voiture", "Lors d'une manifestation", "Dans un incendie", "Il est empoisonné au thallium"]$t$, $t$["In a car accident", "During a demonstration", "In a fire", "He is poisoned with thallium"]$t$, 3, $t$À Genève, en octobre 1960, il est empoisonné au thallium lors d'un dîner avec William Bechtel.$t$, $t$In Geneva, in October 1960, he is poisoned with thallium at a dinner with William Bechtel.$t$),
    (5, $t$Selon les sources, quelle piste est la mieux établie sur le commanditaire ?$t$, $t$According to the sources, which lead on who ordered it is best established?$t$, $t$["Les services secrets français", "La police suisse", "Le gouvernement du Ghana", "Les autorités britanniques"]$t$, $t$["The French secret service", "The Swiss police", "The government of Ghana", "The British authorities"]$t$, 0, $t$La piste du SDECE et de Jacques Foccart est la mieux documentée ; celle du gouvernement Ahidjo repose sur des preuves plus faibles.$t$, $t$The SDECE and Jacques Foccart lead is the best documented; the Ahidjo government lead rests on weaker evidence.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'felix-moumie' and l.niveau = 4
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Leçon Ernest Ouandié (niveau 4)
update public.ecole_lecons l set texte_adapte = $t$Ernest Ouandié naît en 1924 au pays bamiléké, dans l'ouest du Cameroun. Les sources ne s'accordent pas sur le nom exact de son village ni sur sa famille. On sait en revanche qu'il étudie à l'École primaire supérieure de Yaoundé, la meilleure formation que le système colonial offre alors à un jeune Camerounais. En novembre 1943, il en sort diplômé et devient instituteur. Comme pour Um Nyobè, c'est l'école du colonisateur qui forme celui qui va se dresser contre lui.

De 1944 à 1948, il enseigne à Edéa, à Dschang et à Douala. En 1948, il adhère à l'UPC, qui réclame l'indépendance immédiate et la réunification des deux Cameroun. En 1952, à vingt-huit ans, il est élu vice-président du parti. Il croit encore que le combat se gagnera par la parole, les congrès et les pétitions à l'ONU.

Tout bascule le 13 juillet 1955 : l'administration française interdit l'UPC. Le parti passe dans la clandestinité et devient maquis. Commence une guerre longtemps cachée, qui durera quinze ans et fera des dizaines de milliers de morts.

En 1956, Ouandié se réfugie à Kumba, au Cameroun britannique. En juillet 1957, sous la pression française, les Britanniques le déportent à Khartoum, au Soudan. Commence alors un long exil, au Caire, à Conakry, à Accra, où il devient un homme du mouvement panafricain.

Pendant ce temps, les dirigeants de l'UPC tombent un à un. Ruben Um Nyobè est tué en 1958. Le 1er janvier 1960, le Cameroun devient indépendant sous la présidence d'Ahmadou Ahidjo, soutenu par la France ; pour l'UPC, ce n'est qu'un trompe-l'œil. À l'automne 1960, Félix Moumié est empoisonné à Genève. Ouandié prend alors la présidence de l'UPC.

En juillet 1961, il fait un choix d'un rare courage : il rentre clandestinement au Cameroun pour diriger lui-même la lutte armée, dans les montagnes de l'Ouest et le Moungo. En 1964, Abel Kingué meurt en exil : Ouandié reste le dernier des grands dirigeants historiques. Le pouvoir d'Ahidjo fait de lui l'ennemi public numéro un.

Dix ans de maquis, ce n'est pas une épopée romantique : c'est la faim, la maladie, l'épuisement, des villages vidés par l'armée, des rangs qui s'amenuisent. Mgr Albert Ndongmo, évêque bamiléké, tente une médiation avec le président Ahidjo. En 1970, un catéchiste chez qui Ouandié devait se cacher refuse de l'accueillir et alerte la police. Épuisé, affamé, perdu, Ouandié se rend le 19 août 1970.

Son procès devant le tribunal militaire n'a de justice que le nom : ses avocats français se voient refuser le visa d'entrée au Cameroun. Le 5 janvier 1971, il est condamné à mort. Le 15 janvier 1971, il est exécuté en public, sur la place du marché de Bafoussam, par un peloton commandé par un officier français, avec deux de ses compagnons, devant une foule d'environ quarante mille personnes obligées d'y assister.

Sur ses derniers mots, la mémoire populaire rapporte plusieurs versions : il aurait annoncé que d'autres poursuivraient le combat, ou en aurait appelé au jugement de l'histoire. Aucune n'est confirmée par un document de l'époque.

Pendant vingt ans, le récit officiel fait de lui un rebelle. En 1991, l'Assemblée nationale le reconnaît enfin héros national. Ouandié n'est pas né héros : instituteur, il a cru aux mots avant de choisir les armes, et il a tenu jusqu'au bout pour un pays qu'il voulait vraiment libre.$t$,
  texte_adapte_en = $t$Ernest Ouandié is born in 1924 in Bamiléké country, in western Cameroon. The sources do not agree on the exact name of his village or on his family. What we do know is that he studies at the Higher Primary School in Yaoundé, the best training the colonial system then offers a young Cameroonian. In November 1943, he graduates and becomes a teacher. As with Um Nyobè, it is the coloniser's school that trains the man who will stand up against it.

From 1944 to 1948, he teaches in Edéa, Dschang and Douala. In 1948, he joins the UPC, which calls for immediate independence and the reunification of the two Cameroons. In 1952, at twenty-eight, he is elected vice-president of the party. He still believes the fight will be won with words, congresses and petitions to the UN.

Everything changes on 13 July 1955: the French administration bans the UPC. The party goes underground and becomes a maquis, an armed resistance hidden in the forests. A long-hidden war begins, which will last fifteen years and kill tens of thousands of people.

In 1956, Ouandié takes refuge in Kumba, in British Cameroon. In July 1957, under French pressure, the British deport him to Khartoum, in Sudan. A long exile begins, in Cairo, Conakry and Accra, where he becomes a man of the whole Pan-African movement.

Meanwhile, the UPC's leaders fall one after another. Ruben Um Nyobè is killed in 1958. On 1 January 1960, Cameroon becomes independent under the presidency of Ahmadou Ahidjo, backed by France; for the UPC, it is only an illusion. In the autumn of 1960, Félix Moumié is poisoned in Geneva. Ouandié then becomes president of the UPC.

In July 1961, he makes a choice of rare courage: he returns secretly to Cameroon to lead the armed struggle himself, in the western mountains and the Moungo. In 1964, Abel Kingué dies in exile: Ouandié is left as the last of the great historic leaders. Ahidjo's government names him public enemy number one.

Ten years in the maquis is no romantic adventure: it means hunger, illness, exhaustion, villages emptied by the army, ranks growing thinner. Mgr Albert Ndongmo, a Bamiléké bishop, attempts to mediate with President Ahidjo. In 1970, a catechist with whom Ouandié was meant to hide refuses to take him in and alerts the police. Exhausted, starving and lost, Ouandié gives himself up on 19 August 1970.

His trial before the military court is justice in name only: his French lawyers are refused entry visas to Cameroon. On 5 January 1971, he is sentenced to death. On 15 January 1971, he is executed in public, in the market square of Bafoussam, by a firing squad commanded by a French officer, together with two of his companions, before a crowd of about forty thousand people forced to watch.

About his last words, popular memory tells several versions: he is said to have announced that others would carry on the fight, or to have called on history to judge. None is confirmed by a document from the time.

For twenty years, the official story calls him a rebel. In 1991, the National Assembly finally recognises him as a national hero. Ouandié was not born a hero: a teacher, he believed in words before choosing arms, and he held on to the end for a country he wanted to be truly free.$t$,
  updated_at = now()
  from public.heros h where h.id = l.heros_id and h.slug = 'ernest-ouandie' and l.niveau = 4;

insert into public.ecole_quiz_questions (lecon_id, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
select l.id, v.ordre, v.q, v.q_en, v.c::jsonb, v.c_en::jsonb, v.r, v.e, v.e_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  cross join (values
    (1, $t$Quel métier Ernest Ouandié exerce-t-il avant d'entrer à l'UPC ?$t$, $t$What job does Ernest Ouandié do before joining the UPC?$t$, $t$["Médecin", "Instituteur", "Greffier", "Pasteur"]$t$, $t$["Doctor", "Teacher", "Court clerk", "Pastor"]$t$, 1, $t$Diplômé de l'École primaire supérieure de Yaoundé en 1943, il enseigne à Edéa, Dschang et Douala.$t$, $t$After graduating from the Higher Primary School in Yaoundé in 1943, he teaches in Edéa, Dschang and Douala.$t$),
    (2, $t$Où les Britanniques déportent-ils Ouandié en juillet 1957 ?$t$, $t$Where do the British deport Ouandié in July 1957?$t$, $t$["À Genève", "À Paris", "À Khartoum, au Soudan", "À Pékin"]$t$, $t$["To Geneva", "To Paris", "To Khartoum, in Sudan", "To Beijing"]$t$, 2, $t$Sous la pression française, il est déporté à Khartoum. Suit un long exil : Le Caire, Conakry, Accra.$t$, $t$Under French pressure, he is deported to Khartoum. A long exile follows: Cairo, Conakry, Accra.$t$),
    (3, $t$Que fait Ouandié en juillet 1961 ?$t$, $t$What does Ouandié do in July 1961?$t$, $t$["Il rentre en secret au Cameroun", "Il s'installe à Genève", "Il devient ministre", "Il part plaider à l'ONU"]$t$, $t$["He secretly returns to Cameroon", "He settles in Geneva", "He becomes a minister", "He goes to plead at the UN"]$t$, 0, $t$Il rentre clandestinement au Cameroun pour diriger lui-même la lutte armée, dans l'Ouest et le Moungo.$t$, $t$He returns to Cameroon in secret to lead the armed struggle himself, in the West and the Moungo.$t$),
    (4, $t$Qui tente une médiation entre Ouandié et le président Ahidjo ?$t$, $t$Who tries to mediate between Ouandié and President Ahidjo?$t$, $t$["Kwame Nkrumah", "Abel Kingué", "Félix Moumié", "Mgr Albert Ndongmo"]$t$, $t$["Kwame Nkrumah", "Abel Kingué", "Félix Moumié", "Mgr Albert Ndongmo"]$t$, 3, $t$Mgr Albert Ndongmo, évêque bamiléké, tente une médiation. Ouandié se rend finalement le 19 août 1970.$t$, $t$Mgr Albert Ndongmo, a Bamiléké bishop, attempts to mediate. Ouandié finally gives himself up on 19 August 1970.$t$),
    (5, $t$Sur quel point les témoignages de 1971 ne s'accordent-ils pas ?$t$, $t$On which point do the 1971 accounts disagree?$t$, $t$["La ville de son procès", "Ses derniers mots", "La date de sa condamnation", "Le nom de son parti"]$t$, $t$["The town of his trial", "His last words", "The date of his sentence", "The name of his party"]$t$, 1, $t$Plusieurs versions de ses derniers mots circulent dans la mémoire populaire. Aucune n'est confirmée par un document de l'époque.$t$, $t$Several versions of his last words circulate in popular memory. None is confirmed by a document from the time.$t$)
  ) as v(ordre, q, q_en, c, c_en, r, e, e_en)
 where h.slug = 'ernest-ouandie' and l.niveau = 4
on conflict (lecon_id, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

-- Grand quiz du niveau 4
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 1, $t$Où Um Nyobè se rend-il en septembre 1946 ?$t$, $t$Where does Um Nyobè travel in September 1946?$t$, $t$["À Bamako", "À Dakar", "À Accra", "À Genève"]$t$::jsonb, $t$["To Bamako", "To Dakar", "To Accra", "To Geneva"]$t$::jsonb, 0, $t$À Bamako, au premier congrès du Rassemblement démocratique africain, il voit que la colonisation pèse sur toute l'Afrique.$t$, $t$In Bamako, at the first congress of the African Democratic Rally, he sees that colonialism weighs on all of Africa.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 2, $t$Dans quelle ville l'UPC est-elle fondée le 10 avril 1948 ?$t$, $t$In which city is the UPC founded on 10 April 1948?$t$, $t$["Yaoundé", "Douala", "Éséka", "Foumban"]$t$::jsonb, $t$["Yaoundé", "Douala", "Éséka", "Foumban"]$t$::jsonb, 1, $t$L'UPC est fondée dans un bar de Douala par des syndicalistes. Um Nyobè en devient secrétaire général en novembre.$t$, $t$The UPC is founded in a bar in Douala by trade unionists. Um Nyobè becomes its general secretary in November.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 3, $t$Qui signe le décret qui dissout l'UPC le 13 juillet 1955 ?$t$, $t$Who signs the decree dissolving the UPC on 13 July 1955?$t$, $t$["Jacques Foccart", "Ahmadou Ahidjo", "Roland Pré", "William Bechtel"]$t$::jsonb, $t$["Jacques Foccart", "Ahmadou Ahidjo", "Roland Pré", "William Bechtel"]$t$::jsonb, 2, $t$Le haut-commissaire français Roland Pré dissout l'UPC par décret. Um Nyobè entre alors dans le maquis bassa.$t$, $t$French High Commissioner Roland Pré dissolves the UPC by decree. Um Nyobè then goes into the Bassa maquis.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 4, $t$Où une statue d'Um Nyobè est-elle inaugurée en 2007 ?$t$, $t$Where is a statue of Um Nyobè unveiled in 2007?$t$, $t$["À Douala", "À Bafoussam", "À Genève", "À Éséka"]$t$::jsonb, $t$["In Douala", "In Bafoussam", "In Geneva", "In Éséka"]$t$::jsonb, 3, $t$En 2007, une statue est inaugurée à Éséka, près de son village natal de Song Mpeck.$t$, $t$In 2007, a statue is unveiled in Éséka, near his home village of Song Mpeck.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 5, $t$Où naît Félix-Roland Moumié en 1925 ?$t$, $t$Where is Félix-Roland Moumié born in 1925?$t$, $t$["À Njissé, près de Foumban", "À Song Mpeck", "À Bafoussam", "À Mvolyé"]$t$::jsonb, $t$["In Njissé, near Foumban", "In Song Mpeck", "In Bafoussam", "In Mvolyé"]$t$::jsonb, 0, $t$Moumié naît le 1er novembre 1925 à l'hôpital protestant de Njissé, près de Foumban. Son père est évangéliste.$t$, $t$Moumié is born on 1 November 1925 at the Protestant hospital in Njissé, near Foumban. His father is an evangelist.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 6, $t$Quel emblème l'UPC adopte-t-elle le 22 mai 1955 ?$t$, $t$Which emblem does the UPC adopt on 22 May 1955?$t$, $t$["Un lion d'or", "Un crabe noir sur fond rouge", "Un éléphant blanc", "Une étoile verte"]$t$::jsonb, $t$["A golden lion", "A black crab on a red background", "A white elephant", "A green star"]$t$::jsonb, 1, $t$L'UPC adopte un crabe noir sur fond rouge, quelques jours avant la répression de mai 1955.$t$, $t$The UPC adopts a black crab on a red background, a few days before the crackdown of May 1955.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 7, $t$Quel militant accompagne Moumié au Congo en 1960 ?$t$, $t$Which activist goes with Moumié to the Congo in 1960?$t$, $t$["Ernest Ouandié", "Frantz Fanon", "Osendé Afana", "Abel Kingué"]$t$::jsonb, $t$["Ernest Ouandié", "Frantz Fanon", "Osendé Afana", "Abel Kingué"]$t$::jsonb, 2, $t$Avec Osendé Afana, Moumié va au Congo rencontrer Patrice Lumumba, quelques mois avant sa propre mort.$t$, $t$With Osendé Afana, Moumié goes to the Congo to meet Patrice Lumumba, a few months before his own death.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 8, $t$Dans quelle école Ouandié obtient-il son diplôme en 1943 ?$t$, $t$At which school does Ouandié graduate in 1943?$t$, $t$["L'école de médecine de Dakar", "L'École primaire supérieure de Yaoundé", "La mission catholique de Kribi", "L'école Édouard-Renard"]$t$::jsonb, $t$["The medical school in Dakar", "The Higher Primary School in Yaoundé", "The Catholic mission in Kribi", "The Édouard-Renard school"]$t$::jsonb, 1, $t$Ouandié sort de l'École primaire supérieure de Yaoundé en novembre 1943 et devient instituteur.$t$, $t$Ouandié graduates from the Higher Primary School in Yaoundé in November 1943 and becomes a teacher.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 9, $t$Pourquoi les avocats français d'Ouandié ne peuvent-ils pas plaider ?$t$, $t$Why can't Ouandié's French lawyers plead for him?$t$, $t$["Ils sont malades", "Le procès est annulé", "Ouandié les renvoie", "On leur refuse le visa d'entrée"]$t$::jsonb, $t$["They are ill", "The trial is cancelled", "Ouandié dismisses them", "They are refused entry visas"]$t$::jsonb, 3, $t$Ses avocats se voient refuser le visa d'entrée au Cameroun : un procès qui n'a de justice que le nom.$t$, $t$His lawyers are refused entry visas to Cameroon: a trial that is justice in name only.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;
insert into public.ecole_quiz_niveau (niveau, ordre, question, question_en, choix, choix_en, reponse_correcte_index, explication, explication_en)
values (4, 10, $t$En quelle année Um Nyobè, Moumié et Ouandié sont-ils proclamés héros nationaux ?$t$, $t$In which year are Um Nyobè, Moumié and Ouandié proclaimed national heroes?$t$, $t$["1960", "1971", "1991", "2025"]$t$::jsonb, $t$["1960", "1971", "1991", "2025"]$t$::jsonb, 2, $t$En 1991, après des décennies de silence, le Cameroun reconnaît les trois dirigeants de l'UPC comme héros nationaux.$t$, $t$In 1991, after decades of silence, Cameroon recognises the three UPC leaders as national heroes.$t$)
on conflict (niveau, ordre) do update set question = excluded.question, question_en = excluded.question_en,
  choix = excluded.choix, choix_en = excluded.choix_en, reponse_correcte_index = excluded.reponse_correcte_index,
  explication = excluded.explication, explication_en = excluded.explication_en;

commit;

-- ===================== CONTRÔLE =====================
-- Questions par leçon (attendu : niveau 1 = 3, niveau 2 = 4, niveaux 3 et 4 = 5) et leçons sans texte
select l.niveau, h.slug, count(q.id) as nb_questions,
       (l.texte_adapte is null or l.texte_adapte = '') as sans_texte_fr,
       (l.texte_adapte_en is null or l.texte_adapte_en = '') as sans_texte_en
  from public.ecole_lecons l join public.heros h on h.id = l.heros_id
  left join public.ecole_quiz_questions q on q.lecon_id = l.id
 group by l.niveau, h.slug, l.texte_adapte, l.texte_adapte_en order by l.niveau, h.slug;

-- Grand quiz par niveau (attendu : 4 / 6 / 8 / 10)
select niveau, count(*) as nb_questions from public.ecole_quiz_niveau group by niveau order by niveau;
