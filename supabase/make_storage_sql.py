"""Pravi supabase/pravila-u-storage.sql: PDF pravila iz našeg Storage-a za trenutne igre u bazi.

Igre se uparuju po ID-ju (Ignjat ih je u međuvremenu preimenovao/dodao), a YouTube link
se upisuje samo tamo gde ga nema.

Pokretanje:  python supabase/make_storage_sql.py <games.json>
(games.json = izvoz iz /rest/v1/games?select=id,name,youtube_url,rules_pdf_url)
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from pripremi_pdf import OUT_DIR, STORAGE, slug  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8")
ROOT = pathlib.Path(__file__).parent
links = json.loads((ROOT / "linkovi.json").read_text(encoding="utf-8"))["links"]
games = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))

# trenutni naziv u bazi → naziv iz prezentacije (linkovi.json)
RENAMED = {
    "Catan vitezovi": "Catan: Vitezovi",
    "Bitka igracaka": "Bitka igračaka (Toy Battle)",
    "Cluedo": "Find a Clue",
    "Dvorani": "Dvorani (Courtisans)",
    "Endeavor deep sea": "Endeavor: Deep Sea",
    "Hronike zlocina 1400": "1400 (Chronicles of Crime)",
    "Hues and clues": "Hues and Cues",
    "Priroda": "Priroda (Harmonies)",
    "Serif od Notingema 2nd": "Šerif (Sheriff of Nottingham)",
    "Teraformiranje  Mars": "Mars (Terraforming Mars)",
    "Vinhos (Deluxe edition)": "Vinhos",
    "Citadele": "Citadela (Citadels)",
}
# igre koje je Ignjat sam dodao sa svojim PDF-om
OWN_FILES = {"Azul": "azul.pdf", "Kojot": "kojot.pdf"}


def q(v):
    return "null" if v is None else "'" + str(v).replace("'", "''") + "'"


rows, missing = [], []
for g in games:
    key = RENAMED.get(g["name"], g["name"])
    yt, src = links.get(key, (None, None))
    file = OWN_FILES.get(g["name"]) or (slug(key) + ".pdf" if key in links else None)
    if file and (OUT_DIR / file).exists():
        pdf = STORAGE + file
    elif src:  # nema PDF-a (npr. pravila su web stranica) – ostaje spoljni link
        pdf = g["rules_pdf_url"] or src
    else:
        missing.append(g["name"])
        continue
    rows.append((f"  ({q(g['id'])}::uuid, {q(pdf)}, {q(yt)})", g["name"]))

# komentar sa nazivom igre ide posle zareza, da ne "pojede" zarez
values = "\n".join(f"{r}{',' if i < len(rows) - 1 else ''}  -- {n}" for i, (r, n) in enumerate(rows))
sql = f"""-- PDF pravila iz našeg Storage-a (bucket "rules"), da se čitaju na sajtu i rade offline.
-- PRE OVOGA: otpremi sve fajlove iz foldera pravila-pdf/ u Supabase → Storage → rules.
-- YouTube link se upisuje samo igrama koje ga nemaju.

update public.games g
set rules_pdf_url = l.pdf,
    youtube_url = coalesce(g.youtube_url, l.yt)
from (values
{values}
) as l(id, pdf, yt)
where g.id = l.id;

select count(*) filter (where rules_pdf_url like '%/storage/v1/object/public/rules/%') as pravila_u_storage,
       count(*) filter (where youtube_url is not null) as sa_videom,
       count(*) as ukupno_igara
from public.games;
"""
(ROOT / "pravila-u-storage.sql").write_text(sql, encoding="utf-8")
print(f"{len(rows)} igara u SQL-u, PDF fajlova u folderu: {len(list(OUT_DIR.glob('*.pdf')))}")
print("bez PDF-a i linka:", missing or "nema")
