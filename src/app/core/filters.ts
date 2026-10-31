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
}

export type Sort = 'name' | 'newest' | 'weight-asc' | 'weight-desc';

export const SORT_OPTIONS: { value: Sort; label: string; short: string }[] = [
  { value: 'name', label: 'Abecedno (A–Z)', short: 'A–Z' },
  { value: 'newest', label: 'Najnovije dodate', short: 'Najnovije' },
  { value: 'weight-asc', label: 'Težina: lakše → teže', short: 'Lakše' },
  { value: 'weight-desc', label: 'Težina: teže → lakše', short: 'Teže' },
];

export const DEFAULT_FILTERS: Filters = { weight: [1, 5], players: null, timeMax: null };

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
  return true;
}

const collator = new Intl.Collator('sr-Latn', { sensitivity: 'base', numeric: true });

export function sortGames(games: Game[], sort: Sort): Game[] {
  const byName = (a: Game, b: Game) => collator.compare(a.name, b.name);
  const sorted = [...games];
  switch (sort) {
    case 'name':
      return sorted.sort(byName);
    case 'newest':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || byName(a, b));
    case 'weight-asc':
      return sorted.sort((a, b) => a.weight - b.weight || byName(a, b));
    case 'weight-desc':
      return sorted.sort((a, b) => b.weight - a.weight || byName(a, b));
  }
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
    return chips;
  });

  readonly activeCount = computed(() => this.chips().length);

  patch(p: Partial<Filters>) {
    this.filters.update((f) => ({ ...f, ...p }));
  }

  clear(key: keyof Filters) {
    this.patch({ [key]: DEFAULT_FILTERS[key] });
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
