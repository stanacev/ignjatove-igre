import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CatalogFilters } from '../core/filters';
import { decimal, gamesCount, playsText, range, weightLabel } from '../core/format';
import { GamesService } from '../core/games.service';
import { Game } from '../core/models';
import { youtubeId } from '../core/media';
import { ToastService, ViewportService } from '../core/ui.service';
import { Markdown, Youtube } from '../shared/content';
import { Cover } from '../shared/cover';
import { Header } from '../shared/header';
import { Icon, IconName } from '../shared/icon';
import { Modal } from '../shared/modal';
import { WeightBar } from '../shared/weight-bar';
import { PdfViewer } from '../shared/pdf-viewer';
import { NotFound } from './not-found';

type Tab = 'opis' | 'video' | 'pravila';

@Component({
  selector: 'app-game-detail',
  imports: [NgTemplateOutlet, RouterLink, Markdown, Youtube, Cover, Header, Icon, Modal, WeightBar, NotFound, PdfViewer],
  template: `
    @if (game(); as g) {
      @if (vp.desktop()) {
        <app-header />
      } @else {
        <div class="relative h-[340px] overflow-hidden bg-ink-900">
          <app-cover class="size-full" fit="contain" [src]="g.imageUrl" [alt]="'Kutija igre ' + g.name" pad="0 0 24px" [blur]="24" [dim]="0.45" />
          <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-ink-950"></div>
          <div class="absolute inset-x-3 top-[max(12px,env(safe-area-inset-top))] flex justify-between">
            <a routerLink="/" class="btn-icon" aria-label="Nazad na katalog"><app-icon name="chevl" [size]="22" /></a>
            @if (auth.isAdmin()) {
              <div class="flex gap-2">
                <a [routerLink]="['/igra', g.id, 'izmena']" class="btn-icon" aria-label="Izmeni igru"><app-icon name="edit" /></a>
                <button type="button" class="btn-icon !border-danger-300/45 !text-danger-300" aria-label="Obriši igru" (click)="confirmDelete.set(true)">
                  <app-icon name="trash" />
                </button>
              </div>
            }
          </div>
        </div>
      }

      <main class="mx-auto max-w-[1240px] px-5 pt-1 pb-12 lg:px-10 lg:pt-8 lg:pb-16">
        @if (vp.desktop()) {
          <a routerLink="/" class="btn btn-g mb-6 h-10 gap-1.5 pr-2.5 pl-1 text-sm">
            <app-icon name="chevl" [size]="18" />Nazad na katalog
            @if (backHint()) {
              <span class="font-semibold text-slate-400">· {{ backHint() }}</span>
            }
          </a>
        }

        <div class="flex flex-col gap-5 lg:flex-row lg:gap-12">
          @if (vp.desktop()) {
            <div class="w-[460px] flex-none">
              <app-cover class="aspect-square rounded-md border border-ink-700" [src]="g.imageUrl" [alt]="'Kutija igre ' + g.name" [blur]="24" [dim]="0.45" />
            </div>
          }

          <div class="flex min-w-0 flex-1 flex-col gap-5 lg:gap-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="flex flex-col gap-3 lg:gap-3.5">
                <h1 class="m-0 font-display text-[32px] leading-[1.1] font-normal lg:text-[40px]">{{ g.name }}</h1>
                @if (g.tags.length) {
                  <div class="flex flex-wrap gap-2">
                    @for (t of g.tags; track t) {
                      <span class="tag">{{ t }}</span>
                    }
                  </div>
                }
              </div>
              @if (vp.desktop() && auth.isAdmin()) {
                <div class="flex gap-2.5">
                  <a [routerLink]="['/igra', g.id, 'izmena']" class="btn btn-s"><app-icon name="edit" [size]="18" />Izmeni</a>
                  <button type="button" class="btn btn-g !text-danger-300" (click)="confirmDelete.set(true)">
                    <app-icon name="trash" [size]="18" />Obriši
                  </button>
                </div>
              }
            </div>

            <div class="grid grid-cols-2 gap-2.5 lg:gap-3">
              <div class="panel flex min-w-0 flex-col gap-1.5 px-3 py-3.5">
                <span class="label-caps flex items-center gap-1.5"><app-icon name="meeple" [size]="15" />Igrači</span>
                <span class="font-display text-[22px] whitespace-nowrap">{{ range(g.playersMin, g.playersMax) }}</span>
              </div>
              <div class="panel flex min-w-0 flex-col gap-1.5 px-3 py-3.5">
                <span class="label-caps flex items-center gap-1.5"><app-icon name="clock" [size]="15" />Trajanje</span>
                <span class="font-display text-[22px] whitespace-nowrap">{{ range(g.timeMin, g.timeMax) }}</span>
                <span class="text-xs font-semibold text-slate-400">minuta</span>
              </div>
            </div>

            <div class="panel flex flex-col gap-2.5 p-4">
              <div class="flex items-center justify-between">
                <span class="label-caps flex items-center gap-1.5"><app-icon name="weight" [size]="15" />Težina</span>
                <span class="text-xs font-extrabold tracking-[0.06em] text-cream-300 uppercase">{{ weightLabel(g.weight) }}</span>
              </div>
              <div class="flex items-center gap-3.5">
                <span class="font-display text-[30px] leading-none">{{ decimal(g.weight) }}</span>
                <span class="-ml-2 self-end text-[13px] font-bold text-slate-400">/ 5</span>
                <div class="flex flex-auto flex-col gap-1.5">
                  <app-weight-bar [weight]="g.weight" [height]="10" />
                  <div class="flex gap-[3px] font-display text-[11px] text-slate-400">
                    @for (n of [1, 2, 3, 4, 5]; track n) {
                      <span class="flex-1">{{ n }}</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            @if (extras().length) {
              <dl class="m-0 grid border-y border-ink-700" [style.grid-template-columns]="'repeat(' + extras().length + ', minmax(0, 1fr))'">
                @for (x of extras(); track x.label; let first = $first) {
                  <div class="flex flex-col gap-1 py-3" [class]="first ? '' : 'border-l border-ink-700 pl-3'">
                    <dt class="flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.06em] text-slate-400 uppercase">
                      <app-icon [name]="x.icon" [size]="14" />{{ x.label }}
                    </dt>
                    @if (x.label === 'Odigrano' && auth.isAdmin()) {
                      <!-- Ignjat menja broj partija direktno, bez forme -->
                      <dd class="m-0 flex items-center gap-2">
                        <button
                          type="button"
                          class="btn btn-s size-8 !px-0 text-lg"
                          aria-label="Jedna partija manje"
                          [disabled]="!(g.plays ?? 0) || savingPlays()"
                          (click)="changePlays(g, -1)"
                        >−</button>
                        <span class="min-w-6 text-center font-display text-lg" aria-live="polite">{{ g.plays ?? 0 }}</span>
                        <button
                          type="button"
                          class="btn btn-p size-8 !px-0 text-lg"
                          aria-label="Jedna partija više"
                          [disabled]="savingPlays()"
                          (click)="changePlays(g, 1)"
                        >+</button>
                      </dd>
                    } @else {
                      <dd class="m-0 font-display text-[15px]">{{ x.value }}</dd>
                    }
                  </div>
                }
              </dl>
            }

            @if (vp.desktop() && g.description) {
              <app-markdown class="max-w-[680px]" [text]="g.description" />
            }
          </div>
        </div>

        @if (vp.desktop()) {
          @if (hasVideo() || hasRules()) {
            <!-- video i pravila jedno ispod drugog, da PDF ima dovoljno širine za čitanje -->
            <div class="flex flex-col gap-12 pt-10">
              @if (hasVideo()) {
                <section aria-labelledby="h-video" class="flex max-w-[760px] flex-col gap-4.5">
                  <h2 id="h-video" class="m-0 font-display text-[22px] font-normal">Kako se igra</h2>
                  <app-youtube [url]="g.youtubeUrl!" [title]="g.name" />
                </section>
              }
              @if (hasRules()) {
                <section aria-labelledby="h-rules" class="flex max-w-[960px] flex-col gap-4.5">
                  <h2 id="h-rules" class="m-0 font-display text-[22px] font-normal">Pravila</h2>
                  <ng-container *ngTemplateOutlet="rules" />
                </section>
              }
            </div>
          }
        } @else if (tabs().length) {
          <div
            role="tablist"
            aria-label="Sadržaj"
            class="sticky top-0 z-10 -mx-5 mt-5 flex border-b border-ink-700 bg-ink-950 px-5"
          >
            @for (t of tabs(); track t.id) {
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="tab() === t.id"
                class="-mb-px h-[50px] flex-1 border-b-2 font-display text-[15px]"
                [class]="tab() === t.id ? 'border-cream-50 text-cream-50' : 'border-transparent text-slate-400'"
                (click)="tab.set(t.id)"
              >
                {{ t.label }}
              </button>
            }
          </div>
          <div role="tabpanel" class="pt-5">
            @switch (tab()) {
              @case ('opis') {
                <app-markdown [text]="g.description!" />
              }
              @case ('video') {
                <app-youtube [url]="g.youtubeUrl!" [title]="g.name" />
              }
              @case ('pravila') {
                <ng-container *ngTemplateOutlet="rules" />
              }
            }
          </div>
        }

        <ng-template #rules>
          <div class="flex flex-col gap-3.5">
            @if (g.rulesPdfUrl) {
              @if (isPdf(g.rulesPdfUrl)) {
                <app-pdf-viewer [url]="g.rulesPdfUrl" />
              } @else {
                <a [href]="g.rulesPdfUrl" target="_blank" rel="noopener" class="btn btn-s self-start px-3.5 text-sm">
                  <app-icon name="external" [size]="18" />Pravila (otvara sajt)
                </a>
              }
            }
            @if (g.rules) {
              <app-markdown [text]="g.rules" />
            }
          </div>
        </ng-template>
      </main>

      @if (confirmDelete()) {
        <app-modal labelledBy="del-title" (close)="confirmDelete.set(false)">
          <div class="flex flex-col gap-3 p-6">
            <h2 id="del-title" class="m-0 font-display text-[22px] font-normal">Obrisati „{{ g.name }}“?</h2>
            <p class="m-0 text-[15px] leading-relaxed text-cream-300">
              Igra, slika i pravila biće trajno uklonjeni iz kataloga. Ovo ne može da se poništi.
            </p>
            <div class="mt-3 flex justify-end gap-3">
              <button type="button" class="btn btn-s" (click)="confirmDelete.set(false)">Otkaži</button>
              <button type="button" class="btn btn-d" [disabled]="deleting()" (click)="remove()">
                <app-icon name="trash" [size]="18" />{{ deleting() ? 'Brisanje…' : 'Obriši igru' }}
              </button>
            </div>
          </div>
        </app-modal>
      }
    } @else if (games.status() !== 'loading') {
      <app-not-found title="Igra ne postoji" text="Možda je obrisana ili je link pogrešan." />
    }
  `,
})
export class GameDetail {
  readonly id = input.required<string>();

  protected games = inject(GamesService);
  protected auth = inject(AuthService);
  protected vp = inject(ViewportService);
  private filters = inject(CatalogFilters);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected readonly range = range;
  protected readonly decimal = decimal;
  protected readonly weightLabel = weightLabel;

  /** Link vodi na PDF (a ne na web stranicu sa pravilima) */
  protected isPdf = (url: string) => /\.pdf($|[?#])/i.test(url) || url.startsWith('data:application/pdf');

  protected game = computed(() => this.games.byId(this.id()));
  protected hasVideo = computed(() => !!youtubeId(this.game()?.youtubeUrl));
  protected hasRules = computed(() => !!(this.game()?.rules || this.game()?.rulesPdfUrl));

  protected extras = computed(() => {
    const g = this.game();
    const out: { icon: IconName; label: string; value: string }[] = [];
    if (!g) return out;
    if (g.language) out.push({ icon: 'globe', label: 'Jezik', value: g.language });
    if (g.rating !== null) out.push({ icon: 'star', label: 'Ignjatova ocena', value: `${decimal(g.rating, 1).replace(',0', '')} / 10` });
    // admin uvek vidi brojač partija (sa − i +), i kad još nije upisan
    if (g.plays !== null || this.auth.isAdmin()) out.push({ icon: 'dice', label: 'Odigrano', value: playsText(g.plays ?? 0) });
    return out;
  });

  protected tabs = computed(() => {
    const t: { id: Tab; label: string }[] = [];
    if (this.game()?.description) t.push({ id: 'opis', label: 'Opis' });
    if (this.hasVideo()) t.push({ id: 'video', label: 'Tutorial' });
    if (this.hasRules()) t.push({ id: 'pravila', label: 'Pravila' });
    return t;
  });
  protected tab = signal<Tab>('opis');

  protected backHint = computed(() => {
    const n = this.filters.activeCount();
    if (!n) return '';
    return `${gamesCount(this.filters.apply(this.games.games()).length)}, ${n} ${n === 1 ? 'filter' : 'filtera'}`;
  });

  protected savingPlays = signal(false);

  protected async changePlays(g: Game, delta: number) {
    const plays = Math.max(0, (g.plays ?? 0) + delta);
    this.savingPlays.set(true);
    try {
      await this.games.setPlays(g, plays);
    } catch (e) {
      console.error(e);
      this.toast.error('Broj partija nije sačuvan. Proveri internet.');
    } finally {
      this.savingPlays.set(false);
    }
  }

  protected confirmDelete = signal(false);
  protected deleting = signal(false);

  constructor() {
    // prvi tab koji postoji za ovu igru
    effect(() => {
      const tabs = this.tabs();
      if (tabs.length && !tabs.some((t) => t.id === this.tab())) this.tab.set(tabs[0].id);
    });
  }

  protected async remove() {
    const g = this.game();
    if (!g) return;
    this.deleting.set(true);
    try {
      await this.games.remove(g);
      this.toast.success(`„${g.name}“ je obrisana`);
      this.router.navigateByUrl('/');
    } catch (e) {
      console.error(e);
      this.toast.error('Brisanje nije uspelo. Pokušaj ponovo.');
      this.deleting.set(false);
      this.confirmDelete.set(false);
    }
  }
}
