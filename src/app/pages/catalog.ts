import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CatalogFilters, SORT_OPTIONS, Sort } from '../core/filters';
import { gamesCount } from '../core/format';
import { GamesService } from '../core/games.service';
import { ViewportService } from '../core/ui.service';
import { FilterFields } from '../shared/filter-fields';
import { FilterSheet } from '../shared/filter-sheet';
import { GameCard } from '../shared/game-card';
import { Header } from '../shared/header';
import { Icon } from '../shared/icon';
import { EmptyState } from '../shared/status';

@Component({
  selector: 'app-catalog',
  imports: [NgTemplateOutlet, RouterLink, FilterFields, FilterSheet, GameCard, Header, Icon, EmptyState],
  template: `
    <app-header />
    <main class="mx-auto max-w-[1360px] px-4 pt-4 pb-8 lg:px-10 lg:pt-8 lg:pb-16">
      @if (vp.desktop()) {
        <form
          role="search"
          aria-label="Pretraga i filteri"
          class="panel flex flex-wrap items-start gap-x-7 gap-y-6 p-5"
          (submit)="$event.preventDefault()"
        >
          <!-- naziv u redu visine h-7 + gap-2, kao u app-filter-fields, da sve kontrole budu u istoj liniji -->
          <div class="flex min-w-[220px] flex-[2_1_260px] flex-col gap-2">
            <div class="flex h-7 items-center">
              <label for="q-desktop" class="field-label text-[15px]">Pretraga</label>
            </div>
            <div class="relative">
              <app-icon name="search" [size]="18" class="absolute top-[13px] left-3 text-slate-400" />
              <input
                id="q-desktop"
                type="search"
                class="inp !bg-ink-950 pl-10 text-base"
                placeholder="Naziv igre"
                [value]="f.query()"
                (input)="onQuery($event)"
              />
            </div>
          </div>
          <app-filter-fields [state]="f" layout="row" />
        </form>

        <div class="mt-7 mb-5 flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3.5">
            <h1 class="m-0 font-display text-[26px] font-normal" aria-live="polite">{{ countText() }}</h1>
            <ng-container *ngTemplateOutlet="chips" />
            <!-- samo kad je neki filter ili pretraga uključena -->
            @if (f.activeCount() || f.query()) {
              <button type="button" class="btn btn-g h-8 px-2 text-sm" (click)="resetAll()">
                <app-icon name="refresh" [size]="16" />Resetuj filtere
              </button>
            }
          </div>
          <div class="flex items-center gap-2.5">
            <label for="sort-desktop" class="text-[13px] font-bold text-cream-300">Sortiraj</label>
            <div class="relative w-60">
              <select id="sort-desktop" class="inp" (change)="onSort($event)">
                @for (o of sortOptions; track o.value) {
                  <option [value]="o.value" [selected]="f.sort() === o.value">{{ o.label }}</option>
                }
              </select>
              <app-icon name="chev" [size]="18" class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-cream-300" />
            </div>
          </div>
        </div>
      } @else {
        <div class="flex flex-col gap-3 pb-3">
          <div class="relative">
            <label for="q" class="sr-only">Pretraga po nazivu</label>
            <app-icon name="search" [size]="18" class="absolute top-[13px] left-3 text-slate-400" />
            <input
              id="q"
              type="search"
              class="inp pl-10"
              placeholder="Pretraži igre po nazivu"
              [value]="f.query()"
              (input)="onQuery($event)"
            />
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="btn btn-s h-10 px-3 text-sm"
              [style.border-color]="f.activeCount() ? '#FCF1D0' : null"
              (click)="sheetOpen.set(true)"
            >
              <app-icon name="sliders" [size]="18" />Filteri
              @if (f.activeCount()) {
                <span class="flex h-5 min-w-5 items-center justify-center rounded-sm bg-cream-50 px-1 font-display text-xs text-ink-950">
                  {{ f.activeCount() }}
                </span>
              }
            </button>
            <div class="btn btn-s relative h-10 gap-1.5 pr-2.5 pl-3 text-sm">
              {{ sortShort() }}
              <app-icon name="chev" [size]="16" class="text-cream-300" />
              <select
                class="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Sortiranje"
                (change)="onSort($event)"
              >
                @for (o of sortOptions; track o.value) {
                  <option [value]="o.value" [selected]="f.sort() === o.value">{{ o.label }}</option>
                }
              </select>
            </div>
            <span class="ml-auto font-display text-[13px] text-cream-300" aria-live="polite">{{ countText() }}</span>
          </div>
          @if (f.activeCount()) {
            <div class="flex flex-wrap gap-2">
              <ng-container *ngTemplateOutlet="chips" />
            </div>
          }
        </div>
      }

      <ng-template #chips>
        @for (c of f.chips(); track c.key + c.label) {
          <span class="tag">
            {{ c.label }}
            <button type="button" class="ml-0.5 flex" [attr.aria-label]="'Ukloni ' + c.label" (click)="f.clear(c.key, c.tag)">
              <app-icon name="x" [size]="14" />
            </button>
          </span>
        }
      </ng-template>

      @if (games.status() === 'loading') {
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5 xl:grid-cols-6" aria-label="Učitavanje">
          @for (i of skeletons; track i) {
            <div class="overflow-hidden rounded-md border border-ink-700 bg-ink-900">
              <div class="skeleton aspect-[4/5]"></div>
              <div class="flex flex-col gap-2.5 p-2.5">
                <div class="skeleton h-4 w-3/4"></div>
                <div class="skeleton h-3 w-1/2"></div>
                <div class="skeleton h-1.5 w-full"></div>
              </div>
            </div>
          }
        </div>
      } @else if (games.status() === 'error') {
        <app-empty-state title="Katalog nije učitan" text="Proveri internet vezu i pokušaj ponovo.">
          <button type="button" class="btn btn-s" (click)="games.load()"><app-icon name="refresh" [size]="18" />Pokušaj ponovo</button>
        </app-empty-state>
      } @else if (!games.games().length) {
        <app-empty-state title="Katalog je prazan" text="Još nijedna igra nije dodata.">
          @if (auth.isAdmin()) {
            <a routerLink="/nova" class="btn btn-p"><app-icon name="plus" [size]="18" />Dodaj prvu igru</a>
          }
        </app-empty-state>
      } @else if (!visible().length) {
        <app-empty-state title="Nema igara za ove filtere" text="Probaj širi raspon težine ili drugi broj igrača.">
          <button type="button" class="btn btn-s" (click)="resetAll()"><app-icon name="refresh" [size]="18" />Resetuj filtere</button>
        </app-empty-state>
      } @else {
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5 xl:grid-cols-6">
          @for (g of visible(); track g.id) {
            <app-game-card [game]="g" />
          }
        </div>
      }
    </main>

    @if (sheetOpen() && !vp.desktop()) {
      <app-filter-sheet [state]="f" [count]="visible().length" (close)="sheetOpen.set(false)" />
    }
  `,
})
export class Catalog {
  protected games = inject(GamesService);
  protected auth = inject(AuthService);
  protected vp = inject(ViewportService);
  protected f = inject(CatalogFilters);

  protected sheetOpen = signal(false);
  protected sortOptions = SORT_OPTIONS;
  protected skeletons = Array.from({ length: 8 }, (_, i) => i);

  protected visible = computed(() => this.f.apply(this.games.games()));
  protected countText = computed(() => gamesCount(this.visible().length));
  protected sortShort = computed(() => SORT_OPTIONS.find((o) => o.value === this.f.sort())!.short);

  protected onQuery(e: Event) {
    this.f.query.set((e.target as HTMLInputElement).value);
  }

  protected onSort(e: Event) {
    this.f.sort.set((e.target as HTMLSelectElement).value as Sort);
  }

  protected resetAll() {
    this.f.reset();
    this.f.query.set('');
  }
}
