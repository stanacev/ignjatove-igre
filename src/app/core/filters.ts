import { Injectable, computed, signal } from '@angular/core';
import { Game } from './models';
import { decimal, plural } from './format';

/** Vrednost "10+" u filteru broja igrača */
export const PLAYERS_10_PLUS = 11;
export const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, PLAYERS_10_PLUS];

export interface Filters {
  weight: [number, number];
  players: number | null;
  /** null = bilo koje trajanje */
  timeMax: number | null;
  /** Igra mora imati bar jedan od izabranih tagova */
  tags: string[];
  /** Jezik malim slovima (npr. "srpski"); null = svi */
  language: string | null;
}

export type Sort = 'name' | 'rating-desc' | 'rating-asc' | 'weight-asc' | 'weight-desc' | 'time-asc' | 'time-desc';

export const SORT_OPTIONS: { value: Sort; label: string; short: string }[] = [
  { value: 'name', label: 'Abecedno (A–Z)', short: 'A–Z' },
  { value: 'rating-desc', label: 'Ignjatova ocena: najbolje prvo', short: 'Najbolje' },
  { value: 'rating-asc', label: 'Ignjatova ocena: najlošije prvo', short: 'Najlošije' },
  { value: 'weight-asc', label: 'Težina: lakše → teže', short: 'Lakše' },
  { value: 'weight-desc', label: 'Težina: teže → lakše', short: 'Teže' },
  { value: 'time-asc', label: 'Trajanje: kraće → duže', short: 'Kraće' },
  { value: 'time-desc', label: 'Trajanje: duže → kraće', short: 'Duže' },
];

export const DEFAULT_FILTERS: Filters = { weight: [1, 5], players: null, timeMax: null, tags: [], language: null };

export function playersLabel(n: number): string {
  if (n === PLAYERS_10_PLUS) return '10+ igrača';
  return `${n} ${plural(n, 'igrač', 'igrača', 'igrača')}`;
}

export function weightRangeLabel([a, b]: [number, number]): string {
  return `${decimal(a, 1)} – ${decimal(b, 1)}`;
}

/** Igra se prikazuje ako izabrani broj igrača upada između min i max. */
export function matchesFilters(g: Game, f: Filters): boolean {
  if (g.weight < f.weight[0] || g.weight > f.weight[1]) return false;
  if (f.players !== null) {
    if (f.players === PLAYERS_10_PLUS) {
      if (g.playersMax <= 10) return false;
    } else if (f.players < g.playersMin || f.players > g.playersMax) {
      return false;
    }
  }
  if (f.timeMax !== null && (g.timeMax ?? g.timeMin) > f.timeMax) return false;
  if (f.tags.length) {
    const own = g.tags.map((t) => t.toLowerCase());
    // unija: dovoljno je da igra ima bar jedan od izabranih tagova
    if (!f.tags.some((t) => own.includes(t.toLowerCase()))) return false;
  }
  if (f.language !== null && languageKey(g.language) !== f.language) return false;
  return true;
}

/** Ključ za poređenje jezika: "Engleski" i "engleski " su isti jezik */
export function languageKey(language: string | null): string | null {
  const key = language?.trim().toLowerCase();
  return key || null;
}

/** Jezici koji postoje u katalogu (za filter), najčešći prvi */
export function languageOptions(games: Game[]): { key: string; label: string; count: number }[] {
  const byKey = new Map<string, { key: string; label: string; count: number }>();
  for (const g of games) {
    const key = languageKey(g.language);
    if (!key) continue;
    const label = g.language!.trim();
    const o = byKey.get(key) ?? { key, label, count: 0 };
    o.count++;
    // prikaz: varijanta sa velikim početnim slovom, ako postoji
    if (label[0] !== label[0].toLowerCase()) o.label = label;
    byKey.set(key, o);
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'sr'));
}

const collator = new Intl.Collator('sr-Latn', { sensitivity: 'base', numeric: true });

export function sortGames(games: Game[], sort: Sort): Game[] {
  const byName = (a: Game, b: Game) => collator.compare(a.name, b.name);
  const sorted = [...games];
  switch (sort) {
    case 'name':
      return sorted.sort(byName);
    case 'rating-desc':
      // igre bez ocene idu na kraj
      return sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1) || byName(a, b));
    case 'rating-asc':
      // i ovde igre bez ocene idu na kraj
      return sorted.sort((a, b) => (a.rating ?? 99) - (b.rating ?? 99) || byName(a, b));
    case 'weight-asc':
      return sorted.sort((a, b) => a.weight - b.weight || byName(a, b));
    case 'weight-desc':
      return sorted.sort((a, b) => b.weight - a.weight || byName(a, b));
    case 'time-asc':
      return sorted.sort((a, b) => a.timeMin - b.timeMin || duration(a) - duration(b) || byName(a, b));
    case 'time-desc':
      return sorted.sort((a, b) => duration(b) - duration(a) || b.timeMin - a.timeMin || byName(a, b));
  }
}

/** Najduže trajanje igre (gornja granica, ili jedina vrednost) */
function duration(g: Game): number {
  return g.timeMax ?? g.timeMin;
}

/** Pretraga bez obzira na velika slova i dijakritike (č, ć, š…) */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'dj');
}

export interface ActiveChip {
  key: keyof Filters;
  label: string;
  /** za tagove: koji tag uklanja ovaj čip */
  tag?: string;
}

/** Stanje filtera; katalog i točak imaju svako svoje. */
export class FilterState {
  readonly query = signal('');
  readonly filters = signal<Filters>(DEFAULT_FILTERS);
  readonly sort = signal<Sort>('name');

  readonly chips = computed<ActiveChip[]>(() => {
    const f = this.filters();
    const chips: ActiveChip[] = [];
    if (f.weight[0] !== 1 || f.weight[1] !== 5) {
      chips.push({ key: 'weight', label: `Težina ${weightRangeLabel(f.weight).replace(/ /g, '')}` });
    }
    if (f.players !== null) chips.push({ key: 'players', label: playersLabel(f.players) });
    if (f.timeMax !== null) chips.push({ key: 'timeMax', label: `do ${f.timeMax} min` });
    if (f.language !== null) chips.push({ key: 'language', label: `Jezik: ${f.language[0].toUpperCase()}${f.language.slice(1)}` });
    for (const tag of f.tags) chips.push({ key: 'tags', label: tag, tag });
    return chips;
  });

  readonly activeCount = computed(() => this.chips().length);

  patch(p: Partial<Filters>) {
    this.filters.update((f) => ({ ...f, ...p }));
  }

  clear(key: keyof Filters, tag?: string) {
    if (key === 'tags' && tag) this.toggleTag(tag);
    else this.patch({ [key]: DEFAULT_FILTERS[key] });
  }

  toggleTag(tag: string) {
    const tags = this.filters().tags;
    this.patch({ tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] });
  }

  reset() {
    this.filters.set(DEFAULT_FILTERS);
  }

  apply(games: Game[]): Game[] {
    const q = normalize(this.query().trim());
    const f = this.filters();
    const matched = games.filter(
      (g) => matchesFilters(g, f) && (!q || normalize(g.name).includes(q)),
    );
    return sortGames(matched, this.sort());
  }
}

@Injectable({ providedIn: 'root' })
export class CatalogFilters extends FilterState {}

@Injectable({ providedIn: 'root' })
export class WheelFilters extends FilterState {}
