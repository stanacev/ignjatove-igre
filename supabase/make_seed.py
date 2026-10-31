"""Pravi supabase/seed-igre.sql iz supabase/igre-iz-pdf.json.

Pokretanje:  python supabase/make_seed.py
"""
import json
import sys
import pathlib

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).parent
games = json.loads((root / "igre-iz-pdf.json").read_text(encoding="utf-8"))


def q(v):
    if v is None:
        return "null"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def arr(tags):
    return "array[" + ", ".join(q(t) for t in tags) + "]::text[]" if tags else "'{}'::text[]"


rows = []
for g in games:
    rows.append(
        "  ("
        + ", ".join(
            [
                q(g["name"]),
                q(g["players"][0]),
                q(g["players"][1]),
                q(g["time"][0]),
                q(g["time"][1]),
                q(g["weight"]),
                q(g["description"]),
                arr(g["tags"]),
            ]
        )
        + ")"
    )

sql = f"""-- Igre iz PDF kataloga, ukupno: {len(games)}. Bez slika – Ignjat ih dodaje kroz "Izmeni".
-- Pokreni u Supabase SQL Editoru. Može da se pokrene više puta: postojeće igre (isti naziv) se preskaču.

-- slika nije obavezna dok se ne doda fotografija
alter table public.games alter column image_url drop not null;

-- isti naziv ne može dva puta
create unique index if not exists games_name_unique on public.games (lower(name));

insert into public.games (name, players_min, players_max, time_min, time_max, weight, description, tags)
values
{",\n".join(rows)}
on conflict do nothing;

select count(*) as ukupno_igara from public.games;
"""
(root / "seed-igre.sql").write_text(sql, encoding="utf-8")

tags = sorted({t for g in games for t in g["tags"]}, key=lambda s: s.lower())
print(f"{len(games)} igara, {len(tags)} tagova")
print(json.dumps(tags, ensure_ascii=False))
