import { Component, OnDestroy, computed, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WheelFilters, playersLabel } from '../core/filters';
import { decimal, gamesCount, range, weightLabel } from '../core/format';
import { GamesService } from '../core/games.service';
import { Game } from '../core/models';
import { ViewportService } from '../core/ui.service';
import { Cover } from '../shared/cover';
import { FilterFields } from '../shared/filter-fields';
import { FilterSheet } from '../shared/filter-sheet';
import { Header } from '../shared/header';
import { Icon } from '../shared/icon';
import { EmptyState } from '../shared/status';

/** Više od ovoga ne staje čitljivo na točak; uzima se nasumičan uzorak. */
const MAX_SEGMENTS = 24;
const SPIN_MS = 4200;
const COLORS = ['#22396F', '#0D1C42', '#16295A'];

interface Segment {
  path: string;
  fill: string;
  text: string;
  tx: number;
  ty: number;
  angle: number;
  peg: [number, number];
}

@Component({
  selector: 'app-wheel',
  imports: [RouterLink, Cover, FilterFields, FilterSheet, Header, Icon, EmptyState],
  template: `
    <app-header />
    <main class="mx-auto max-w-[1360px] px-4 pt-4 pb-8 lg:px-10 lg:pt-8">
      <div class="flex items-baseline justify-between gap-3">
        <h1 class="m-0 font-display text-[26px] font-normal lg:text-[32px]">Točak sreće</h1>
        <span class="font-display text-[13px] text-cream-300 lg:text-[15px]">{{ countText() }}</span>
      </div>

      <div class="mt-3 flex flex-col gap-6 lg:mt-6 lg:flex-row lg:items-start lg:gap-12">
        @if (vp.desktop()) {
          <aside class="panel flex w-[340px] flex-none flex-col gap-6 p-5">
            <h2 class="label-caps m-0">Filteri</h2>
            <app-filter-fields [state]="f" />
            <button type="button" class="btn btn-g self-start" (click)="f.reset()" [disabled]="!f.activeCount()">
              <app-icon name="refresh" [size]="18" />Resetuj filtere
            </button>
          </aside>
        } @else {
          <button type="button" class="btn btn-s h-12 w-full justify-between px-3" (click)="sheetOpen.set(true)">
            <span class="flex items-center gap-2 text-sm">
              <app-icon name="sliders" [size]="18" />Filteri
              @if (f.activeCount()) {
                <span class="flex h-5 min-w-5 items-center justify-center rounded-sm bg-cream-50 px-1 font-display text-xs text-ink-950">
                  {{ f.activeCount() }}
                </span>
              }
            </span>
            <span class="truncate text-[13px] font-semibold text-cream-300">{{ summary() }}</span>
          </button>
        }

        <div class="flex min-w-0 flex-1 flex-col items-center">
          @if (!pool().length) {
            <app-empty-state title="Nijedna igra ne odgovara" text="Točak nema šta da vrti. Proširi filtere.">
              <button type="button" class="btn btn-s" (click)="f.reset()"><app-icon name="refresh" [size]="18" />Resetuj filtere</button>
            </app-empty-state>
          } @else {
            <div class="relative mt-6 aspect-square w-full max-w-[310px] lg:mt-2 lg:max-w-[440px]">
              <svg
                viewBox="0 0 320 320"
                role="img"
                [attr.aria-label]="'Točak sa ' + gamesCount(segments().length)"
                class="block size-full"
                [style.transform]="'rotate(' + rotation() + 'deg)'"
                [style.transition]="spinning() ? 'transform ' + spinMs + 'ms cubic-bezier(.15,.75,.15,1)' : 'none'"
              >
                <circle cx="160" cy="160" r="158" fill="#010736" stroke="#FCF1D0" stroke-width="2" />
                @for (s of segments(); track $index) {
                  <path [attr.d]="s.path" [attr.fill]="s.fill" stroke="#010736" stroke-width="1.5" />
                  <text
                    [attr.x]="s.tx"
                    [attr.y]="s.ty"
                    [attr.transform]="'rotate(' + s.angle + ' ' + s.tx + ' ' + s.ty + ')'"
                    text-anchor="end"
                    dominant-baseline="central"
                    fill="#FCF1D0"
                    class="font-display"
                    [attr.font-size]="fontSize()"
                    letter-spacing="0.02em"
                  >
                    {{ s.text }}
                  </text>
                }
                @for (s of segments(); track $index) {
                  <circle [attr.cx]="s.peg[0]" [attr.cy]="s.peg[1]" r="2" fill="#FCF1D0" />
                }
              </svg>
              <div class="absolute top-1/2 left-1/2 flex size-[20%] -translate-1/2 items-center justify-center rounded-full border-2 border-cream-50 bg-ink-950">
                <svg viewBox="0 0 40 40" class="size-[55%]" aria-hidden="true">
                  <rect x="8" y="8" width="24" height="24" rx="3" fill="none" stroke="#FCF1D0" stroke-width="2.6" transform="rotate(-10 20 20)" />
                  <circle cx="15" cy="15" r="2.2" fill="#FCF1D0" /><circle cx="20" cy="20" r="2.2" fill="#FCF1D0" /><circle cx="25" cy="25" r="2.2" fill="#FCF1D0" />
                </svg>
              </div>
              <svg viewBox="0 0 24 22" class="absolute -top-3 left-1/2 w-6 -translate-x-1/2" aria-hidden="true">
                <path d="M2 2h20L12 20z" fill="#FCF1D0" stroke="#010736" stroke-width="2" stroke-linejoin="round" />
              </svg>
            </div>

            <div class="mt-6 flex w-full max-w-[440px] flex-col gap-3">
              @if (result(); as g) {
                <div role="status" class="flex gap-3.5 rounded-md border border-cream-50 bg-ink-900 p-3 shadow-card animate-[toast_.25s_ease-out]">
                  <app-cover class="h-[105px] w-[84px] flex-none rounded" [src]="g.imageUrl" alt="Kutija izabrane igre" [blur]="12" />
                  <div class="flex min-w-0 flex-auto flex-col gap-1.5">
                    <span class="label-caps tracking-[0.1em]">Igra večeras</span>
                    <span class="font-display text-xl leading-[1.15]">{{ g.name }}</span>
                    <span class="flex flex-wrap gap-2.5 text-xs font-bold text-cream-300">
                      <span class="flex items-center gap-1"><app-icon name="meeple" [size]="14" [stroke]="1.8" />{{ range(g.playersMin, g.playersMax) }}</span>
                      <span class="flex items-center gap-1"><app-icon name="clock" [size]="14" [stroke]="1.8" />{{ range(g.timeMin, g.timeMax) }} min</span>
                      <span class="flex items-center gap-1"><app-icon name="weight" [size]="14" [stroke]="1.8" />{{ decimal(g.weight) }} · {{ weightLabel(g.weight) }}</span>
                    </span>
                    <a [routerLink]="['/igra', g.id]" class="btn btn-p mt-1 h-10 self-start px-3.5 text-sm">
                      Otvori igru<app-icon name="chevr" [size]="16" />
                    </a>
                  </div>
                </div>
              }
              <button
                type="button"
                class="btn btn-p h-14 w-full font-display text-xl font-normal tracking-[0.08em] uppercase"
                [disabled]="spinning()"
                (click)="spin()"
              >
                {{ spinning() ? 'Vrti se…' : result() ? 'Zavrti ponovo' : 'Zavrti!' }}
              </button>
            </div>
          }
        </div>
      </div>
    </main>

    @if (sheetOpen() && !vp.desktop()) {
      <app-filter-sheet [state]="f" [count]="pool().length" (close)="sheetOpen.set(false)" />
    }
  `,
})
export class Wheel implements OnDestroy {
  protected f = inject(WheelFilters);
  protected vp = inject(ViewportService);
  private games = inject(GamesService);

  protected readonly range = range;
  protected readonly decimal = decimal;
  protected readonly weightLabel = weightLabel;
  protected readonly gamesCount = gamesCount;
  protected readonly spinMs = SPIN_MS;

  protected sheetOpen = signal(false);
  protected rotation = signal(0);
  protected spinning = signal(false);
  protected result = signal<Game | null>(null);
  private timer?: ReturnType<typeof setTimeout>;

  protected pool = computed(() => this.f.apply(this.games.games()));
  /** Igre na točku: sve iz filtera, ili nasumičnih MAX_SEGMENTS ako ih ima previše */
  protected onWheel = signal<Game[]>([]);

  protected countText = computed(() => `${gamesCount(this.onWheel().length)} u točku`);
  protected fontSize = computed(() => (this.onWheel().length > 16 ? 9.5 : 11.5));

  protected summary = computed(() => {
    const parts: string[] = [];
    const fl = this.f.filters();
    if (fl.weight[0] !== 1 || fl.weight[1] !== 5) {
      parts.push(fl.weight[0] === 1 ? `Težina do ${decimal(fl.weight[1], 1)}` : `Težina ${decimal(fl.weight[0], 1)}–${decimal(fl.weight[1], 1)}`);
    }
    if (fl.players !== null) parts.push(playersLabel(fl.players));
    if (fl.timeMax !== null) parts.push(`do ${fl.timeMax} min`);
    return parts.join(' · ') || 'Sve igre';
  });

  protected segments = computed<Segment[]>(() => {
    const games = this.onWheel();
    const n = games.length;
    const seg = 360 / n;
    const rad = (d: number) => (d * Math.PI) / 180;
    const pt = (r: number, deg: number): [number, number] => [
      +(160 + r * Math.cos(rad(deg))).toFixed(2),
      +(160 + r * Math.sin(rad(deg))).toFixed(2),
    ];
    const maxChars = n > 16 ? 13 : 15;
    return games.map((g, i) => {
      // segment i je centriran na uglu -90 + i*seg (0 = vrh)
      const mid = -90 + i * seg;
      const [x1, y1] = pt(152, mid - seg / 2);
      const [x2, y2] = pt(152, mid + seg / 2);
      const [tx, ty] = pt(140, mid);
      const path =
        n === 1
          ? 'M160 8 A152 152 0 1 1 159.99 8 Z'
          : `M160 160 L${x1} ${y1} A152 152 0 ${seg > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
      return {
        path,
        fill: COLORS[n % 3 === 1 && i === n - 1 ? 1 : i % 3],
        text: g.name.length > maxChars ? g.name.slice(0, maxChars - 1).trimEnd() + '…' : g.name,
        tx,
        ty,
        angle: mid,
        peg: pt(150, mid + seg / 2),
      };
    });
  });

  constructor() {
    // kad se filteri promene, napravi novi točak (ali ne usred vrtenja)
    effect(() => {
      const pool = this.pool();
      if (untracked(this.spinning)) return;
      this.onWheel.set(pool.length > MAX_SEGMENTS ? shuffle(pool).slice(0, MAX_SEGMENTS) : pool);
      this.result.set(null);
    });
  }

  protected spin() {
    const games = this.onWheel();
    if (this.spinning() || !games.length) return;
    const n = games.length;
    const seg = 360 / n;
    const i = Math.floor(Math.random() * n);
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const base = this.rotation() - (this.rotation() % 360);
    this.result.set(null);
    this.spinning.set(true);
    // sledeći frame, da tranzicija krene od trenutnog ugla
    requestAnimationFrame(() => this.rotation.set(base + 360 * 6 + ((360 - i * seg) % 360) + jitter));
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.result.set(games[i]);
      this.spinning.set(false);
    }, SPIN_MS + 100);
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
