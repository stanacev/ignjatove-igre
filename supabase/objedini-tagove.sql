-- Objedinjavanje tagova: 83 starih oznaka -> 30 novih.
-- Tagovi kojih nema u mapi ostaju kakvi jesu. Može da se pokrene više puta.

with mapa(staro, novo) as (values
  ('action drafting', 'Draftovanje'),
  ('card drafting', 'Draftovanje'),
  ('drafting', 'Draftovanje'),
  ('draftovanje', 'Draftovanje'),
  ('open drafting', 'Draftovanje'),
  ('deck building', 'Deck building'),
  ('bag building', 'Bag building'),
  ('engine building', 'Engine building'),
  ('income', 'Engine building'),
  ('worker placement', 'Postavljanje radnika'),
  ('different worker types', 'Postavljanje radnika'),
  ('tile placement', 'Postavljanje pločica'),
  ('plocice', 'Postavljanje pločica'),
  ('pattern building', 'Postavljanje pločica'),
  ('tetris', 'Postavljanje pločica'),
  ('sudoku', 'Postavljanje pločica'),
  ('postavljanje u mrežu', 'Postavljanje pločica'),
  ('area majority', 'Kontrola teritorije'),
  ('area movement', 'Kontrola teritorije'),
  ('kontrola teritorije', 'Kontrola teritorije'),
  ('conflict', 'Kontrola teritorije'),
  ('card play conflict', 'Kontrola teritorije'),
  ('ratovanje', 'Kontrola teritorije'),
  ('set collection', 'Sakupljanje setova'),
  ('sakupljanje setova', 'Sakupljanje setova'),
  ('hand managment', 'Menadžment ruku'),
  ('multi-use cards', 'Menadžment ruku'),
  ('menadžment resursa', 'Engine building'),
  ('dice rolling', 'Kockice i sreća'),
  ('bacanje kockica', 'Kockice i sreća'),
  ('postavljanje kockica', 'Kockice i sreća'),
  ('luck', 'Kockice i sreća'),
  ('procena rizika', 'Kockice i sreća'),
  ('grid movement', 'Kretanje po tabli'),
  ('track movement', 'Kretanje po tabli'),
  ('race', 'Kretanje po tabli'),
  ('mankala', 'Kretanje po tabli'),
  ('aukcija', 'Aukcija'),
  ('trgovina', 'Trgovina i pregovaranje'),
  ('trading', 'Trgovina i pregovaranje'),
  ('voting', 'Trgovina i pregovaranje'),
  ('blefiranje', 'Blefiranje'),
  ('laganje', 'Blefiranje'),
  ('skrivene uloge', 'Skrivene uloge'),
  ('socijalna dedukcija', 'Skrivene uloge'),
  ('dedukcija', 'Dedukcija'),
  ('detektivi', 'Dedukcija'),
  ('aplikacija', 'Dedukcija'),
  ('kooperativna', 'Kooperativna'),
  ('co op', 'Kooperativna'),
  ('timska', 'Party'),
  ('party', 'Party'),
  ('asocijacije', 'Asocijacije'),
  ('slike', 'Asocijacije'),
  ('boje', 'Asocijacije'),
  ('pamćenje', 'Pamćenje'),
  ('memorija', 'Pamćenje'),
  ('kartaška igra', 'Kartaška igra'),
  ('mikro igra', 'Kartaška igra'),
  ('clash royale', 'Kartaška igra'),
  ('eliminacija', 'Eliminacija'),
  ('player elimination', 'Eliminacija'),
  ('variable set up', 'Promenljiva postavka'),
  ('variable phase order', 'Promenljiva postavka'),
  ('modularna tabla', 'Promenljiva postavka'),
  ('events', 'Promenljiva postavka'),
  ('variable player powers', 'Asimetrične moći'),
  ('zivotinjsko carstvo', 'Životinje i priroda'),
  ('more', 'Životinje i priroda'),
  ('farma', 'Farma'),
  ('svemir', 'Svemir'),
  ('galaksija', 'Svemir'),
  ('vanzemaljci', 'Svemir'),
  ('mitologija', 'Istorija i mitologija'),
  ('gradovi', 'Gradnja'),
  ('građenje table', 'Gradnja'),
  ('drzava', 'Politika'),
  ('geopolitika', 'Politika'),
  ('velika strategija', 'Politika'),
  ('istraživanje', 'Kretanje po tabli'),
  ('end game bonuses', null),
  ('neighbor', null),
  ('simulation', null)
)
update public.games g
set tags = coalesce((
  select array_agg(distinct t order by t)
  from (
    select case when m.staro is null then trim(x) else m.novo end as t
    from unnest(g.tags) as x
    left join mapa m on m.staro = lower(trim(x))
  ) s
  where t is not null and t <> ''
), '{}');

-- Pregled: svi tagovi posle objedinjavanja i koliko igara ih ima
select t as tag, count(*) as igara
from public.games, unnest(tags) as t
group by t
order by t;
