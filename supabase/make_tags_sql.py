"""Pravi supabase/objedini-tagove.sql iz supabase/tagovi-mapa.json.

SQL radi nad trenutnim stanjem baze (ne pamti igre), pa može da se pokrene i kasnije.
Uz <tags.json> (izvoz /rest/v1/games?select=name,tags) prikaže kako će izgledati rezultat.

Pokretanje:  python supabase/make_tags_sql.py [tags.json]
"""
import collections
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = pathlib.Path(__file__).parent
mapping = json.loads((ROOT / "tagovi-mapa.json").read_text(encoding="utf-8"))["map"]
by_lower = {k.lower(): v for k, v in mapping.items()}


def q(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


values = ",\n".join(f"  ({q(old.lower())}, {q(new) if new else 'null'})" for old, new in mapping.items())
sql = f"""-- Objedinjavanje tagova: {len(mapping)} starih oznaka -> {len({v for v in mapping.values() if v})} novih.
-- Tagovi kojih nema u mapi ostaju kakvi jesu. Može da se pokrene više puta.

with mapa(staro, novo) as (values
{values}
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
), '{{}}');

-- Pregled: svi tagovi posle objedinjavanja i koliko igara ih ima
select t as tag, count(*) as igara
from public.games, unnest(tags) as t
group by t
order by t;
"""
(ROOT / "objedini-tagove.sql").write_text(sql, encoding="utf-8")
print("SQL napravljen.")

if len(sys.argv) > 1:
    games = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    after = collections.Counter()
    unmapped = collections.Counter()
    for g in games:
        new = set()
        for t in g["tags"]:
            key = t.strip().lower()
            if key in by_lower:
                if by_lower[key]:
                    new.add(by_lower[key])
            else:
                unmapped[t] += 1
                new.add(t.strip())
        after.update(new)
    before = len({t for g in games for t in g["tags"]})
    print(f"Pre: {before} tagova  ->  posle: {len(after)} tagova")
    for t, n in sorted(after.items(), key=lambda x: x[0].lower()):
        print(f"  {n:3}  {t}")
    if unmapped:
        print("Nisu u mapi (ostaju):", dict(unmapped))
