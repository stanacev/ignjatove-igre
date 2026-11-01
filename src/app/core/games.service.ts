import { Injectable, signal } from '@angular/core';
import { Backend, DemoBackend, SupabaseBackend } from './backend';
import { IS_DEMO } from './config';
import { Game, GameInput } from './models';

const CACHE_KEY = 'ii-games-cache';

export interface SaveFiles {
  /** Nova (već smanjena) slika kutije */
  cover?: Blob;
  /** Novi PDF pravila; zamenjuje link iz `rulesPdfUrl` */
  rulesPdf?: File;
}

@Injectable({ providedIn: 'root' })
export class GamesService {
  private backend: Backend = IS_DEMO ? new DemoBackend() : new SupabaseBackend();
  private loading: Promise<void> | null = null;

  readonly games = signal<Game[]>([]);
  readonly status = signal<'loading' | 'ready' | 'error'>('loading');
  /** Podaci su iz keša jer server nije dostupan */
  readonly stale = signal(false);

  constructor() {
    const cached = readCache();
    if (cached) {
      this.games.set(cached);
      this.status.set('ready');
    }
  }

  load(): Promise<void> {
    this.loading ??= this.fetch().finally(() => (this.loading = null));
    return this.loading;
  }

  byId(id: string): Game | undefined {
    return this.games().find((g) => g.id === id);
  }

  /**
   * @param base verzija igre iz koje je forma popunjena. Kod izmene se šalju samo
   *   polja koja se razlikuju od nje, pa forma otvorena sa starim podacima ne može
   *   da pregazi ono što je u međuvremenu promenjeno u bazi (npr. link za pravila).
   */
  async save(id: string | null, input: GameInput, files: SaveFiles = {}, base?: Game): Promise<Game> {
    const previous = id ? (base ?? this.byId(id)) : undefined;
    const data = { ...input };
    if (files.cover) data.imageUrl = await this.backend.uploadCover(files.cover);
    if (files.rulesPdf) data.rulesPdfUrl = await this.backend.uploadRulesPdf(files.rulesPdf);

    const saved = await this.backend.save(id, previous ? changedFields(data, previous) : data);
    this.setGames(id ? this.games().map((g) => (g.id === id ? saved : g)) : [...this.games(), saved]);

    // stare fajlove brišemo tek kad je red uspešno sačuvan
    if (previous?.imageUrl && previous.imageUrl !== saved.imageUrl) {
      await this.backend.removeFile(previous.imageUrl).catch(() => {});
    }
    if (previous?.rulesPdfUrl && previous.rulesPdfUrl !== saved.rulesPdfUrl) {
      await this.backend.removeFile(previous.rulesPdfUrl).catch(() => {});
    }
    return saved;
  }

  /** Brzo menjanje broja odigranih partija (samo to polje se šalje). */
  async setPlays(game: Game, plays: number): Promise<Game> {
    const saved = await this.backend.save(game.id, { plays });
    this.setGames(this.games().map((g) => (g.id === game.id ? saved : g)));
    return saved;
  }

  /** Uklanja tag iz svih igara koje ga imaju. Vraća broj izmenjenih igara. */
  async removeTagEverywhere(tag: string): Promise<number> {
    const affected = this.games().filter((g) => g.tags.includes(tag));
    for (const g of affected) {
      const saved = await this.backend.save(g.id, { tags: g.tags.filter((t) => t !== tag) });
      this.setGames(this.games().map((x) => (x.id === g.id ? saved : x)));
    }
    return affected.length;
  }

  async remove(game: Game): Promise<void> {
    await this.backend.remove(game);
    this.setGames(this.games().filter((g) => g.id !== game.id));
  }

  private async fetch() {
    if (!this.games().length) this.status.set('loading');
    try {
      this.setGames(await this.backend.list());
      this.stale.set(false);
      this.status.set('ready');
      warmImageCache(this.games());
    } catch (e) {
      console.error(e);
      if (this.games().length) this.stale.set(true);
      else this.status.set('error');
    }
  }

  private setGames(games: Game[]) {
    this.games.set(games);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(games));
    } catch {}
  }
}

function changedFields(data: GameInput, previous: Game): Partial<GameInput> {
  const changed: Partial<GameInput> = {};
  for (const key of Object.keys(data) as (keyof GameInput)[]) {
    if (JSON.stringify(data[key]) !== JSON.stringify(previous[key])) {
      (changed as Record<string, unknown>)[key] = data[key];
    }
  }
  return changed;
}

function readCache(): Game[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Učitava sve slike u pozadini da ih service worker sačuva,
 * pa katalog radi offline i za igre koje još nisu otvorene.
 */
function warmImageCache(games: Game[]) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) return;
  const urls = games.map((g) => g.imageUrl).filter((u): u is string => !!u?.startsWith('http'));
  const run = () => urls.forEach((u) => fetch(u).catch(() => {}));
  'requestIdleCallback' in window ? requestIdleCallback(run) : setTimeout(run, 2000);
}
