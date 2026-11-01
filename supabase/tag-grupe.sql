-- Grupe tagova (Vrsta igre / Tema / Mehanika) čuvaju se u bazi,
-- da Ignjat pri dodavanju novog taga može da izabere gde spada.
-- Pokreni jednom u Supabase SQL Editoru. Može da se pokrene više puta.

create table if not exists public.tag_groups (
  tag text primary key,
  grp text not null check (grp in ('Vrsta igre', 'Tema', 'Mehanika'))
);

grant select on public.tag_groups to anon, authenticated;
grant insert, update, delete on public.tag_groups to authenticated;
alter table public.tag_groups enable row level security;

drop policy if exists "Svi vide grupe tagova" on public.tag_groups;
create policy "Svi vide grupe tagova" on public.tag_groups for select using (true);

drop policy if exists "Admin menja grupe tagova" on public.tag_groups;
create policy "Admin menja grupe tagova" on public.tag_groups
  for all to authenticated using (true) with check (true);

-- trenutne grupe (30 tagova); postojeće se ne diraju
insert into public.tag_groups (tag, grp) values
  ('Party', 'Vrsta igre'),
  ('Kooperativna', 'Vrsta igre'),
  ('Kartaška igra', 'Vrsta igre'),
  ('Asocijacije', 'Vrsta igre'),
  ('Blefiranje', 'Vrsta igre'),
  ('Skrivene uloge', 'Vrsta igre'),
  ('Dedukcija', 'Vrsta igre'),
  ('Pamćenje', 'Vrsta igre'),
  ('Životinje i priroda', 'Tema'),
  ('Svemir', 'Tema'),
  ('Farma', 'Tema'),
  ('Gradnja', 'Tema'),
  ('Politika', 'Tema'),
  ('Istorija i mitologija', 'Tema'),
  ('Draftovanje', 'Mehanika'),
  ('Postavljanje pločica', 'Mehanika'),
  ('Menadžment ruku', 'Mehanika'),
  ('Sakupljanje setova', 'Mehanika'),
  ('Postavljanje radnika', 'Mehanika'),
  ('Deck building', 'Mehanika'),
  ('Engine building', 'Mehanika'),
  ('Bag building', 'Mehanika'),
  ('Kontrola teritorije', 'Mehanika'),
  ('Kockice i sreća', 'Mehanika'),
  ('Trgovina i pregovaranje', 'Mehanika'),
  ('Aukcija', 'Mehanika'),
  ('Kretanje po tabli', 'Mehanika'),
  ('Promenljiva postavka', 'Mehanika'),
  ('Asimetrične moći', 'Mehanika'),
  ('Eliminacija', 'Mehanika')
on conflict (tag) do nothing;

select grp as grupa, count(*) as tagova from public.tag_groups group by grp order by grp;
