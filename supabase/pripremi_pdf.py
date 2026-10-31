"""Preuzima PDF pravila sa linkova iz supabase/linkovi.json, smanjuje velike
i pravi folder pravila-pdf/ za ručni upload u Supabase Storage (bucket "rules"),
plus supabase/pravila-u-storage.sql koji linkove prebacuje na naš Storage.

Pokretanje:  python supabase/pripremi_pdf.py <folder-za-sirove-fajlove>
"""
import json
import pathlib
import re
import sys
import unicodedata
import urllib.request
import subprocess
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).parent
OUT_DIR = ROOT.parent / "pravila-pdf"
STORAGE = "https://lfoijirrquodqmqfhbmw.supabase.co/storage/v1/object/public/rules/"
LIMIT_MB = 19  # bucket "rules" prima do 20 MB
TARGET_MB = 12  # iznad ovoga smanjujemo slike


def slug(name: str) -> str:
    s = name.replace("đ", "dj").replace("Đ", "Dj")
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def download(job):
    name, url, raw = job
    if raw.exists() and raw.stat().st_size > 1000:
        return name, None
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=180) as r:
            data = r.read()
        if not data.startswith(b"%PDF"):
            return name, f"link nije PDF ({url})"
        raw.write_bytes(data)
        return name, None
    except Exception as e:  # noqa: BLE001
        return name, str(e)


def shrink_one(src: pathlib.Path, dest: pathlib.Path) -> None:
    """Prvo samo čišćenje; ako je i dalje veliko, slike na 120 pa 90 dpi."""
    import fitz  # PyMuPDF

    for dpi, quality in [(None, None), (120, 60), (90, 45)]:
        doc = fitz.open(src)
        if dpi:
            doc.rewrite_images(dpi_threshold=dpi + 20, dpi_target=dpi, quality=quality, lossy=True,
                               lossless=True, bitonal=True, color=True, gray=True)
        doc.save(dest, garbage=3, deflate=True)
        doc.close()
        if dest.stat().st_size / 1e6 <= TARGET_MB:
            break


def raster_one(src: pathlib.Path, dest: pathlib.Path, dpi: int = 110) -> None:
    """Rezerva za PDF-ove koje je sporo ili nemoguće smanjiti: svaka strana postaje JPEG slika."""
    import fitz  # PyMuPDF

    doc, out = fitz.open(src), fitz.open()
    for page in doc:
        pix = page.get_pixmap(dpi=dpi)
        new = out.new_page(width=page.rect.width, height=page.rect.height)
        new.insert_image(new.rect, stream=pix.tobytes("jpeg", jpg_quality=70))
    out.save(dest, garbage=3, deflate=True)


def run(mode: str, src: pathlib.Path, dest: pathlib.Path, timeout: int) -> bool:
    dest.unlink(missing_ok=True)
    try:
        r = subprocess.run([sys.executable, "-I", __file__, mode, str(src), str(dest)],
                           capture_output=True, timeout=timeout)
        return r.returncode == 0 and dest.exists()
    except subprocess.TimeoutExpired:
        return False


def shrink(job):
    """Svaki PDF u svom procesu – oštećen ili ogroman fajl ne obara ostale."""
    name, src, dest = job
    size = lambda p: p.stat().st_size / 1e6  # noqa: E731
    # već urađeno u prethodnom pokretanju
    if dest.exists() and dest.stat().st_mtime > src.stat().st_mtime and 0.05 < size(dest) <= LIMIT_MB:
        return name, size(src), size(dest), None
    ok = run("--one", src, dest, timeout=240)
    if not ok or size(dest) > LIMIT_MB:
        if size(src) <= LIMIT_MB:
            dest.write_bytes(src.read_bytes())  # original je dovoljno mali
        elif not run("--raster", src, dest, timeout=600):
            return name, size(src), 0, "ne može da se smanji"
    if size(dest) > size(src):
        dest.write_bytes(src.read_bytes())
    return name, size(src), size(dest), None


def q(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    raw_dir = pathlib.Path(sys.argv[1])
    raw_dir.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(exist_ok=True)
    links = json.loads((ROOT / "linkovi.json").read_text(encoding="utf-8"))["links"]
    files = {name: slug(name) + ".pdf" for name in links}
    problems = []

    with ThreadPoolExecutor(8) as pool:
        for name, err in pool.map(download, [(n, links[n][1], raw_dir / f) for n, f in files.items()]):
            if err:
                problems.append(f"{name}: {err}")
                print(f"{name:42} preuzimanje nije uspelo: {err}", flush=True)
    print("Preuzimanje gotovo.", flush=True)

    jobs = [(n, raw_dir / f, OUT_DIR / f) for n, f in files.items() if (raw_dir / f).exists()]
    updates = []
    with ThreadPoolExecutor(8) as pool:
        for name, before, after, err in pool.map(shrink, jobs):
            if err:
                problems.append(f"{name}: {err}")
                print(f"{name:42} GREŠKA {err}", flush=True)
                continue
            big = after > LIMIT_MB
            print(f"{name:42} {before:6.1f} MB -> {after:5.1f} MB{'  !!! PREVELIKO' if big else ''}", flush=True)
            if big:
                problems.append(f"{name}: i posle smanjivanja {after:.1f} MB")
            else:
                updates.append((name, STORAGE + files[name]))

    rows = ",\n".join(f"  ({q(n)}, {q(u)})" for n, u in updates)
    (ROOT / "pravila-u-storage.sql").write_text(
        f"""-- PDF pravila iz našeg Storage-a (bucket "rules"), da rade u čitaču na sajtu i offline.
-- PRE OVOGA: otpremi sve fajlove iz foldera pravila-pdf/ u Supabase → Storage → rules.

update public.games g
set rules_pdf_url = l.url
from (values
{rows}
) as l(name, url)
where g.name = l.name;

select count(*) filter (where rules_pdf_url like '%/storage/v1/object/public/rules/%') as pravila_u_storage,
       count(*) as ukupno_igara
from public.games;
""",
        encoding="utf-8",
    )
    total = sum(f.stat().st_size for f in OUT_DIR.glob("*.pdf")) / 1e6
    print(f"\nGotovo: {len(updates)} PDF-ova, ukupno {total:.0f} MB")
    print("Problemi:", *problems, sep="\n  ") if problems else print("Problemi: nema")


if __name__ == "__main__":
    if sys.argv[1] == "--one":
        shrink_one(pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3]))
    elif sys.argv[1] == "--raster":
        raster_one(pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3]))
    else:
        main()
