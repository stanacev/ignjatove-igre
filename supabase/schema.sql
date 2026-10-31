-- Ignjatove igre – šema baze
-- Pokreni jednom u Supabase: SQL Editor → New query → nalepi sve → Run.

-- 1) Tabela igara -------------------------------------------------------------
create table if not exists public.games (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null check (length(trim(name)) > 0),
  image_url     text,
  players_min   smallint not null check (players_min >= 1),
  players_max   smallint not null check (players_max >= players_min),
  time_min      smallint not null check (time_min >= 1),
  time_max      smallint check (time_max is null or time_max >= time_min),
  weight        numeric(3,2) not null check (weight between 1 and 5),
  description   text,
  youtube_url   text,
  rules         text,
  rules_pdf_url text,
  tags          text[] not null default '{}',
  language      text,
  rating        numeric(3,1) check (rating is null or rating between 0 and 10),
  plays         integer check (plays is null or plays >= 0)
);

-- 2) Pravila pristupa (RLS): svi čitaju, samo prijavljeni (Ignjat) menja ------
-- Tabela se izričito izlaže API-ju (radi i kad je "Automatically expose new tables" isključeno)
grant select on public.games to anon, authenticated;
grant insert, update, delete on public.games to authenticated;

alter table public.games enable row level security;

drop policy if exists "Svi vide igre" on public.games;
create policy "Svi vide igre" on public.games
  for select using (true);

drop policy if exists "Admin dodaje igre" on public.games;
create policy "Admin dodaje igre" on public.games
  for insert to authenticated with check (true);

drop policy if exists "Admin menja igre" on public.games;
create policy "Admin menja igre" on public.games
  for update to authenticated using (true) with check (true);

drop policy if exists "Admin briše igre" on public.games;
create policy "Admin briše igre" on public.games
  for delete to authenticated using (true);

-- 3) Storage: slike kutija i PDF pravila (javno čitanje) ------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('covers', 'covers', true, 5242880, array['image/webp', 'image/jpeg', 'image/png']),
  ('rules', 'rules', true, 20971520, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "Admin upload fajlova" on storage.objects;
create policy "Admin upload fajlova" on storage.objects
  for insert to authenticated with check (bucket_id in ('covers', 'rules'));

drop policy if exists "Admin menja fajlove" on storage.objects;
create policy "Admin menja fajlove" on storage.objects
  for update to authenticated using (bucket_id in ('covers', 'rules'));

drop policy if exists "Admin briše fajlove" on storage.objects;
create policy "Admin briše fajlove" on storage.objects
  for delete to authenticated using (bucket_id in ('covers', 'rules'));
