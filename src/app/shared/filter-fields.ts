import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FilterState, PLAYER_OPTIONS, SORT_OPTIONS, Sort, playersLabel, weightRangeLabel } from '../core/filters';
import { decimal, weightLabel } from '../core/format';
import { GamesService } from '../core/games.service';
import { TAG_GROUPS, TagGroup } from '../core/tags';
import { Icon } from './icon';
import { RangeSlider, SliderScale } from './range-slider';

export const WEIGHT_SCALE: SliderScale = {
  toPos: (v) => (v - 1) / 4,
  fromPos: (p) => Math.round((1 + 4 * p) * 10) / 10,
  step: (v, d) => Math.min(5, Math.max(1, Math.round((v + d * 0.1) * 10) / 10)),
  text: (v) => decimal(v, 1),
  ticks: ['1', '2', '3', '4', '5'],
};

/** Trajanje: oznake 15/60/120/180/240+ su ravnomerno raspoređene, pa je skala po delovima. */
const TIME_STOPS = [15, 60, 120, 180, 240];
const TIME_ANY = 240;

export const TIME_SCALE: SliderScale = {
  toPos(v) {
    const i = Math.max(0, TIME_STOPS.findIndex((s, k) => v <= TIME_STOPS[k + 1]));
    return Math.min(1, (i + (v - TIME_STOPS[i]) / (TIME_STOPS[i + 1] - TIME_STOPS[i])) / 4);
  },
  fromPos(p) {
    const x = p * 4;
    const i = Math.min(3, Math.floor(x));
    const v = TIME_STOPS[i] + (x - i) * (TIME_STOPS[i + 1] - TIME_STOPS[i]);
    return Math.round(v / 5) * 5;
  },
  step(v, d) {
    const inc = (d > 0 ? v < 60 : v <= 60) ? 5 : 15;
    return Math.min(TIME_ANY, Math.max(15, v + d * inc));
  },
  text: (v) => (v >= TIME_ANY ? 'bilo koje' : `do ${v} min`),
  ticks: ['15', '60', '120', '180', '240+'],
};

/** Polja filtera; katalog i točak ih dele. `row` je horizontalni raspored za desktop. */
@Component({
  selector: 'app-filter-fields',
  imports: [NgTemplateOutlet, Icon, RangeSlider],
  template: `
    <!-- U "row" rasporedu svako polje ima red za naziv iste visine, a kontrole su poravnate
         tako da je linija klizača na istoj visini kao sredina inputa (22px). -->
    <div [class]="row() ? 'flex min-w-[220px] flex-[2_1_240px] flex-col gap-2' : 'flex flex-col gap-2.5'">
      <div [class]="headClass()">
        <span [class]="labelClass()">Težina</span>
        <span [class]="valueClass()">{{ weightText() }}</span>
      </div>
      <app-range-slider
        [class.pt-2]="row()"
        [values]="state().filters().weight"
        (valuesChange)="state().patch({ weight: [$event[0], $event[1]] })"
        [scale]="weightScale"
        [labels]="['Težina od', 'Težina do']"
      />
      @if (!row()) {
        <span class="field-hint">{{ weightHint() }}</span>
      }
    </div>

    <div [class]="row() ? 'flex min-w-[150px] flex-[1_1_150px] flex-col gap-2' : 'flex flex-col gap-2.5'">
      <div [class]="headClass()">
        <label [for]="id + '-players'" [class]="labelClass()">Broj igrača</label>
      </div>
      <div class="relative">
        <select
          [id]="id + '-players'"
          class="inp"
          [class.text-base]="row()"
          [style.background-color]="row() ? '#010736' : null"
          (change)="onPlayers($event)"
        >
          <option value="" [selected]="state().filters().players === null">Svi</option>
          @for (n of playerOptions; track n) {
            <option [value]="n" [selected]="state().filters().players === n">{{ n > 10 ? '10+' : n }}</option>
          }
        </select>
        <app-icon name="chev" [size]="18" class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-cream-300" />
      </div>
    </div>

    <div [class]="row() ? 'flex min-w-[200px] flex-[2_1_200px] flex-col gap-2' : 'flex flex-col gap-2.5'">
      <div [class]="headClass()">
        <span [class]="labelClass()">Trajanje</span>
        <span [class]="valueClass()">{{ timeText() }}</span>
      </div>
      <app-range-slider
        [class.pt-2]="row()"
        [values]="[state().filters().timeMax ?? timeAny]"
        (valuesChange)="state().patch({ timeMax: $event[0] >= timeAny ? null : $event[0] })"
        [scale]="timeScale"
        [labels]="['Trajanje do']"
      />
    </div>

    @if (allTags().length) {
      <!-- u "row" rasporedu tagovi idu u poseban red ispod (order-last, iza dugmeta Resetuj) -->
      <div class="flex flex-col gap-2.5" [class.basis-full]="row()" [class.order-last]="row()">
        <button
          type="button"
          class="flex items-center justify-between gap-2 text-left"
          [attr.aria-expanded]="tagsOpen()"
          (click)="tagsOpen.set(!tagsOpen())"
        >
          <span [class]="labelClass()">
            Tagovi
            @if (state().filters().tags.length) {
              <span class="ml-1 font-display text-cream-50">({{ state().filters().tags.length }})</span>
            }
          </span>
          <span class="flex items-center gap-1 text-xs font-bold text-slate-400">
            {{ tagsOpen() ? 'Sakrij' : 'Izaberi' }}
            <app-icon name="chev" [size]="16" [class.rotate-180]="tagsOpen()" />
          </span>
        </button>
        @if (tagsOpen()) {
          <!-- tagovi po grupama; "Mehanika" je sklopljena dok se ne otvori -->
          <div class="flex flex-col gap-3.5" aria-label="Tagovi">
            @for (g of groups(); track g.name) {
              <div class="flex flex-col gap-2" role="group" [attr.aria-label]="g.name">
                @if (g.open) {
                  <span class="label-caps">{{ g.name }}</span>
                } @else {
                  <button type="button" class="label-caps flex items-center gap-1 self-start hover:text-cream-50" [attr.aria-expanded]="isGroupOpen(g.name)" (click)="toggleGroup(g.name)">
                    {{ g.name }} ({{ g.tags.length }})
                    <app-icon name="chev" [size]="14" [class.rotate-180]="isGroupOpen(g.name)" />
                  </button>
                }
                @if (g.open || isGroupOpen(g.name) || hasSelected(g.tags)) {
                  <div class="flex flex-wrap gap-2">
                    @for (t of g.open || isGroupOpen(g.name) ? g.tags : selectedOf(g.tags); track t) {
                      <ng-container *ngTemplateOutlet="chip; context: { $implicit: t }" />
                    }
                  </div>
                }
              </div>
            }
          </div>
        } @else if (state().filters().tags.length) {
          <div class="flex flex-wrap gap-2" role="group" aria-label="Izabrani tagovi">
            @for (t of state().filters().tags; track t) {
              <ng-container *ngTemplateOutlet="chip; context: { $implicit: t }" />
            }
          </div>
        }
        @if (state().filters().tags.length > 1) {
          <span class="field-hint">Prikazuju se igre koje imaju sve izabrane tagove.</span>
        }
        <ng-template #chip let-t>
          <button
            type="button"
            class="tag cursor-pointer transition-colors hover:border-ink-500"
            [class]="isOn(t) ? '!border-cream-50 bg-cream-50 !text-ink-950' : ''"
            [attr.aria-pressed]="isOn(t)"
            (click)="state().toggleTag(t)"
          >
            @if (isOn(t)) {
              <app-icon name="check" [size]="14" />
            }
            {{ t }}
          </button>
        </ng-template>
      </div>
    }

    @if (showSort()) {
      <div class="flex flex-col gap-2.5">
        <label [for]="id + '-sort'" class="field-label">Sortiranje</label>
        <div class="relative">
          <select [id]="id + '-sort'" class="inp" (change)="onSort($event)">
            @for (o of sortOptions; track o.value) {
              <option [value]="o.value" [selected]="state().sort() === o.value">{{ o.label }}</option>
            }
          </select>
          <app-icon name="chev" [size]="18" class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-cream-300" />
        </div>
      </div>
    }
  `,
  host: {
    '[class]': "layout() === 'row' ? 'contents' : 'flex flex-col gap-7'",
  },
})
export class FilterFields {
  readonly state = input.required<FilterState>();
  readonly showSort = input(false);
  readonly layout = input<'stack' | 'row'>('stack');

  private static nextId = 0;
  protected readonly id = `ff${FilterFields.nextId++}`;
  protected readonly weightScale = WEIGHT_SCALE;
  protected readonly timeScale = TIME_SCALE;
  protected readonly timeAny = TIME_ANY;
  protected readonly playerOptions = PLAYER_OPTIONS;
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly playersLabel = playersLabel;

  protected row = computed(() => this.layout() === 'row');

  private games = inject(GamesService);
  /** Svi tagovi koji postoje u katalogu */
  protected allTags = computed(() =>
    [...new Set(this.games.games().flatMap((g) => g.tags))].sort((a, b) => a.localeCompare(b, 'sr')),
  );
  protected tagsOpen = signal(false);
  private openGroups = signal<string[]>([]);

  /** Grupe sa tagovima koji stvarno postoje u katalogu; nepoznati tagovi idu u "Ostalo" */
  protected groups = computed<TagGroup[]>(() => {
    const present = new Set(this.allTags());
    const known = new Set(TAG_GROUPS.flatMap((g) => g.tags));
    const groups = TAG_GROUPS.map((g) => ({ ...g, tags: g.tags.filter((t) => present.has(t)) }));
    const rest = this.allTags().filter((t) => !known.has(t));
    if (rest.length) groups.push({ name: 'Ostalo', open: false, tags: rest });
    return groups.filter((g) => g.tags.length);
  });
  protected isGroupOpen = (name: string) => this.openGroups().includes(name);
  protected toggleGroup(name: string) {
    this.openGroups.update((o) => (o.includes(name) ? o.filter((x) => x !== name) : [...o, name]));
  }
  protected selectedOf = (tags: string[]) => tags.filter((t) => this.isOn(t));
  protected hasSelected = (tags: string[]) => tags.some((t) => this.isOn(t));
  protected isOn = (t: string) => this.state().filters().tags.includes(t);
  /** Klase za red sa nazivom polja – iste u svim poljima, da sve kontrole počnu na istoj visini */
  protected headClass = computed(() => (this.row() ? 'flex h-7 items-center justify-between gap-2' : 'flex items-baseline justify-between'));
  protected labelClass = computed(() => (this.row() ? 'field-label text-[15px]' : 'field-label'));
  protected valueClass = computed(() => (this.row() ? 'font-display text-base' : 'font-display text-lg'));

  protected weightText = computed(() => weightRangeLabel(this.state().filters().weight));
  protected weightHint = computed(() => {
    const [a, b] = this.state().filters().weight;
    const la = weightLabel(a);
    const lb = weightLabel(b);
    return la === lb ? la : `${la} → ${lb}`;
  });
  protected timeText = computed(() => TIME_SCALE.text(this.state().filters().timeMax ?? TIME_ANY));

  protected onPlayers(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.state().patch({ players: v ? Number(v) : null });
  }

  protected onSort(e: Event) {
    this.state().sort.set((e.target as HTMLSelectElement).value as Sort);
  }
}
