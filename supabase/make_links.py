"""Pravi supabase/linkovi-iz-prezentacije.sql iz supabase/linkovi.json.

Pokretanje:  python supabase/make_links.py
"""
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(__file__).parent
data = json.loads((root / "linkovi.json").read_text(encoding="utf-8"))


def q(v):
    if v is None:
        return "null"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def arr(tags):
    return "array[" + ", ".join(q(t) for t in tags) + "]::text[]"


new_rows = ",\n".join(
    "  (" + ", ".join([q(g["name"]), q(g["players"][0]), q(g["players"][1]), q(g["time"][0]),
                       q(g["time"][1]), q(g["weight"]), q(g["description"]), arr(g["tags"])]) + ")"
    for g in data["nove_igre"]
)
link_rows = ",\n".join(f"  ({q(name)}, {q(yt)}, {q(pdf)})" for name, (yt, pdf) in data["links"].items())

sql = f"""-- YouTube tutoriali i pravila iz prezentacije + igre koje su falile u PDF katalogu.
-- Pokreni u Supabase SQL Editoru. Može da se pokrene više puta.

-- 1) "Vitezovi" iz PDF kataloga je Catan: Vitezovi (proširenje za Catan)
update public.games
set name = 'Catan: Vitezovi', players_min = 3, players_max = 4, time_min = 90, time_max = null
where name = 'Vitezovi';

-- 2) Igre koje su bile odsečene u PDF-u ({len(data["nove_igre"])}). Težina, igrači i trajanje su okvirni – proveriti na Mipl-u.
insert into public.games (name, players_min, players_max, time_min, time_max, weight, description, tags)
values
{new_rows}
on conflict do nothing;

-- 3) Linkovi za {len(data["links"])} igara
update public.games g
set youtube_url = l.yt, rules_pdf_url = l.pdf
from (values
{link_rows}
) as l(name, yt, pdf)
where g.name = l.name;

-- Provera: igre bez linkova (treba da bude prazno)
select name as igra_bez_linka from public.games where youtube_url is null or rules_pdf_url is null order by name;

select count(*) as ukupno_igara, count(youtube_url) as sa_videom, count(rules_pdf_url) as sa_pravilima from public.games;
"""
(root / "linkovi-iz-prezentacije.sql").write_text(sql, encoding="utf-8")

names_json = set(data["links"])
seed = json.loads((root / "igre-iz-pdf.json").read_text(encoding="utf-8"))
known = {g["name"] for g in seed} | {g["name"] for g in data["nove_igre"]}
print("linkova:", len(names_json), "| novih igara:", len(data["nove_igre"]))
print("link bez igre:", sorted(names_json - known))
print("igra bez linka:", sorted(known - names_json))
