# Ignjatove igre

Katalog društvenih igara: Angular 21 + Tailwind 4, Supabase (baza, slike, prijava), hostovano na GitHub Pages. Radi kao PWA (instalira se na telefon i radi offline).

Dok Supabase nije povezan, aplikacija radi u **demo režimu**: prikazuje probne igre, izmene se čuvaju samo u tvom browseru, a prijava prihvata bilo koje ime i šifru.

## Pokretanje na svom računaru

```bash
npm install
npm start
```

Otvori http://localhost:4200

## 1. Supabase (jednom)

1. Napravi nalog na https://supabase.com (tvoj mejl) i klikni **New project**. Ime `ignjatove-igre`, region **Central EU (Frankfurt)**, zapamti lozinku baze.
2. **SQL Editor → New query**: nalepi ceo sadržaj fajla [`supabase/schema.sql`](supabase/schema.sql) i klikni **Run**. To pravi tabelu igara, pravila pristupa i skladište za slike i PDF-ove.
3. **Authentication → Sign In / Providers → Email**:
   - isključi **Allow new users to sign up** (niko ne može da napravi nalog)
   - isključi **Confirm email**
4. **Authentication → Users → Add user → Create new user**:
   - Email: `ignjat@ignjatove-igre.app` (deo pre `@` je korisničko ime za prijavu na sajtu; na ovu adresu se nikad ništa ne šalje)
   - Password: šifra koju će Ignjat koristiti
   - uključi **Auto Confirm User**
5. **Project Settings → API Keys**: kopiraj **Project URL** i **anon / publishable** ključ u [`src/app/core/config.ts`](src/app/core/config.ts):
   ```ts
   export const SUPABASE_URL = 'https://xxxx.supabase.co';
   export const SUPABASE_ANON_KEY = 'eyJ...';
   ```
   Ovaj ključ je javan po dizajnu. Bez prijave se može samo čitati, jer to određuju pravila iz `schema.sql`.

Zaboravljena šifra: Authentication → Users → klikni korisnika → postavi novu šifru.

## 2. GitHub Pages (jednom)

1. Napravi repo `ignjatove-igre` na nalogu `stanacev` i pošalji kod (`git push`).
2. U repou: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Svaki push na `main` automatski objavi sajt na https://stanacev.github.io/ignjatove-igre/

`.github/workflows/keepalive.yml` dva puta nedeljno pročita jedan red iz baze, da se besplatan Supabase projekat ne bi pauzirao posle 7 dana neaktivnosti. Izvršava se na GitHub serverima, ne na tvom računaru.

## Gde je šta

| Šta | Gde |
|---|---|
| Supabase podešavanja | `src/app/core/config.ts` |
| Lista tagova | `src/app/core/tags.ts` |
| Granice oznaka težine | `src/app/core/format.ts` |
| Boje i fontovi (tokeni iz dizajna) | `src/styles.css` |
| Stranice | `src/app/pages/` |
| Šema baze | `supabase/schema.sql` |
| Originalni dizajn (Claude Design) | `Ignjatove igre.html` |
