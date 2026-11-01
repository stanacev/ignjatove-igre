import { NgTemplateOutlet } from '@angular/common';
import { Component, OnDestroy, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { decimal, weightLabel } from '../core/format';
import { GamesService } from '../core/games.service';
import { Game, GameInput } from '../core/models';
import { resizeImage, youtubeId } from '../core/media';
import { GROUP_NAMES, GroupName, TagGroupsService } from '../core/tags';
import { ToastService } from '../core/ui.service';
import { Youtube } from '../shared/content';
import { Cover } from '../shared/cover';
import { Header } from '../shared/header';
import { Modal } from '../shared/modal';
import { Icon } from '../shared/icon';

type Field = 'image' | 'name' | 'players' | 'time' | 'weight' | 'rating' | 'plays' | 'youtube' | 'pdf';

const MAX_IMAGE_MB = 15;
const MAX_PDF_MB = 20;

/** Broj iz polja; prihvata i zarez kao decimalni separator. */
function num(s: string): number | null {
  const t = s.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

@Component({
  selector: 'app-game-form',
  imports: [NgTemplateOutlet, RouterLink, Youtube, Cover, Header, Icon, Modal],
  template: `
    <app-header />
    <main class="mx-auto max-w-[1240px] px-4 pt-4 pb-32 lg:px-10 lg:pt-8">
      <a [routerLink]="id() ? ['/igra', id()] : '/'" class="btn btn-g mb-2 h-10 gap-1.5 pr-2.5 pl-1 text-sm">
        <app-icon name="chevl" [size]="18" />{{ id() ? 'Nazad na igru' : 'Katalog' }}
      </a>
      <h1 class="m-0 mb-6 font-display text-[28px] font-normal lg:text-[32px]">{{ id() ? 'Izmena igre' : 'Nova igra' }}</h1>

      @if (id() && !original()) {
        <p class="text-cream-300">Igra nije pronađena.</p>
      } @else {
        <form id="game-form" class="grid gap-8 lg:grid-cols-[360px_1fr] lg:gap-12" (submit)="save($event)" novalidate>
          <!-- Slika -->
          <div class="flex flex-col gap-2 lg:sticky lg:top-28 lg:self-start">
            <span class="field-label"><span>Slika kutije@if (!id()) {<span class="text-danger-300" aria-hidden="true"> *</span>}</span></span>
            <button
              type="button"
              class="group relative flex aspect-[4/5] w-full max-w-[260px] lg:max-w-none flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed bg-ink-900 text-center transition-colors hover:border-ink-500"
              [class]="dragOver() ? 'border-cream-50' : showError('image') ? 'border-danger-300' : 'border-ink-700'"
              (click)="fileInput.click()"
              (dragover)="$event.preventDefault(); dragOver.set(true)"
              (dragleave)="dragOver.set(false)"
              (drop)="onDrop($event)"
              [attr.aria-label]="preview() ? 'Promeni sliku kutije' : 'Izaberi sliku kutije'"
            >
              @if (preview()) {
                <div class="absolute inset-0"><app-cover class="size-full" [src]="preview()" alt="Pregled slike kutije" /></div>
                <span class="absolute right-3 bottom-3 flex items-center gap-1.5 rounded bg-ink-950/85 px-3 py-2 text-sm font-bold opacity-90 group-hover:opacity-100">
                  <app-icon name="upload" [size]="16" />Promeni sliku
                </span>
              } @else {
                <app-icon name="image" [size]="40" class="text-slate-400" />
                <span class="font-display text-base">Izaberi ili prevuci sliku</span>
                <span class="px-6 text-xs font-semibold text-slate-400">JPG, PNG ili WEBP · smanjuje se automatski</span>
              }
              @if (processing()) {
                <span class="absolute inset-0 flex items-center justify-center bg-ink-950/70 font-bold">Obrada slike…</span>
              }
            </button>
            <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFile($event)" />
            @if (showError('image')) {
              <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().image }}</span>
            }
          </div>

          <div class="flex min-w-0 flex-col gap-8">
            <!-- Osnovno -->
            <fieldset class="m-0 flex flex-col gap-5 border-0 p-0">
              <legend class="label-caps mb-4 p-0">Osnovno</legend>

              <div class="flex flex-col gap-2">
                <label for="f-name" class="field-label"><span>Naziv<span class="text-danger-300" aria-hidden="true"> *</span></span></label>
                <input id="f-name" class="inp" placeholder="npr. Wingspan" [value]="name()" (input)="name.set(val($event))" (blur)="touch('name')" [attr.aria-invalid]="showError('name')" />
                @if (showError('name')) {
                  <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().name }}</span>
                }
              </div>

              <div class="grid gap-5 sm:grid-cols-2">
                <div class="flex flex-col gap-2">
                  <span class="field-label"><span>Broj igrača<span class="text-danger-300" aria-hidden="true"> *</span></span></span>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="relative">
                      <input aria-label="Najmanje igrača" class="inp pr-12" inputmode="numeric" [value]="playersMin()" (input)="playersMin.set(val($event))" (blur)="touch('players')" [attr.aria-invalid]="showError('players')" />
                      <span class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">min</span>
                    </div>
                    <div class="relative">
                      <input aria-label="Najviše igrača" class="inp pr-12" inputmode="numeric" [value]="playersMax()" (input)="playersMax.set(val($event))" (blur)="touch('players')" [attr.aria-invalid]="showError('players')" />
                      <span class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">max</span>
                    </div>
                  </div>
                  @if (showError('players')) {
                    <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().players }}</span>
                  }
                </div>

                <div class="flex flex-col gap-2">
                  <span class="field-label"><span>Trajanje (min)<span class="text-danger-300" aria-hidden="true"> *</span></span><span class="field-hint">„do“ je opciono</span></span>
                  <div class="grid grid-cols-2 gap-2">
                    <div class="relative">
                      <input aria-label="Trajanje od, minuta" class="inp pr-10" inputmode="numeric" [value]="timeMin()" (input)="timeMin.set(val($event))" (blur)="touch('time')" [attr.aria-invalid]="showError('time')" />
                      <span class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">od</span>
                    </div>
                    <div class="relative">
                      <input aria-label="Trajanje do, minuta" class="inp pr-10" inputmode="numeric" [value]="timeMax()" (input)="timeMax.set(val($event))" (blur)="touch('time')" [attr.aria-invalid]="showError('time')" />
                      <span class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">do</span>
                    </div>
                  </div>
                  @if (showError('time')) {
                    <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().time }}</span>
                  }
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="f-weight" class="field-label"><span>Težina (sa Mipl-a)<span class="text-danger-300" aria-hidden="true"> *</span></span><span class="field-hint">1,00 – 5,00</span></label>
                <div class="flex items-center gap-3">
                  <input id="f-weight" class="inp max-w-[140px]" inputmode="decimal" placeholder="npr. 2,35" [value]="weight()" (input)="weight.set(val($event))" (blur)="touch('weight')" [attr.aria-invalid]="showError('weight')" />
                  <span class="text-sm font-bold text-cream-300">{{ weightPreview() }}</span>
                </div>
                @if (showError('weight')) {
                  <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().weight }}</span>
                }
              </div>
            </fieldset>

            <!-- Detalji -->
            <fieldset class="m-0 flex flex-col gap-5 border-0 p-0">
              <legend class="label-caps mb-4 p-0">Detalji</legend>

              <div class="flex flex-col gap-2">
                <label for="f-tag" class="field-label"><span>Tagovi</span><span class="field-hint">opciono · Enter ili zarez dodaje tag</span></label>
                <div
                  class="flex min-h-11 flex-wrap items-center gap-2 rounded border border-ink-700 bg-ink-900 px-2 py-1.5 transition-colors focus-within:border-cream-50 hover:border-ink-500"
                  (click)="tagInput.focus()"
                >
                  @for (t of tags(); track t) {
                    <span class="tag h-7 bg-ink-800 text-cream-50">
                      {{ t }}
                      <button type="button" class="ml-0.5 flex" [attr.aria-label]="'Ukloni tag ' + t" (click)="removeTag(t)">
                        <app-icon name="x" [size]="14" />
                      </button>
                    </span>
                  }
                  <input
                    #tagInput
                    id="f-tag"
                    list="tag-suggestions"
                    class="h-8 min-w-[140px] flex-1 border-0 bg-transparent px-1 text-[15px] font-semibold outline-none"
                    [placeholder]="tags().length ? '' : 'npr. Blefiranje'"
                    [value]="tagDraft()"
                    (input)="onTagInput($event)"
                    (keydown)="onTagKey($event)"
                    (blur)="commitTag()"
                  />
                  <datalist id="tag-suggestions">
                    @for (t of tagSuggestions(); track t) {
                      <option [value]="t"></option>
                    }
                  </datalist>
                </div>
                @if (pendingTag(); as t) {
                  <div class="flex flex-col gap-2 rounded border border-cream-50/60 bg-ink-800 p-3" role="group" aria-label="Grupa za novi tag">
                    <span class="text-sm font-bold">Gde spada „{{ t }}“?</span>
                    <div class="flex flex-wrap gap-2">
                      @for (g of groupNames; track g) {
                        <button type="button" class="btn btn-s h-9 px-3 text-sm" (click)="chooseGroup(t, g)">{{ g }}</button>
                      }
                      <button type="button" class="btn btn-g h-9 px-3 text-sm" (click)="chooseGroup(t, null)">Kasnije</button>
                    </div>
                  </div>
                }
                <!-- svi postojeći tagovi po grupama: klik dodaje/uklanja; u režimu uređivanja klik briše tag svuda -->
                <div class="mt-1 flex flex-col gap-3 rounded border bg-ink-900/50 p-3" [class]="editTags() ? 'border-danger-300/60' : 'border-ink-700'">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-slate-400">
                      {{ editTags() ? 'Klikni tag koji želiš da obrišeš iz svih igara.' : 'Klikni tag da ga dodaš ili ukloniš.' }}
                    </span>
                    <button type="button" class="btn btn-g h-8 px-2 text-xs" [class.!text-danger-300]="!editTags()" (click)="editTags.set(!editTags())">
                      @if (editTags()) {
                        <app-icon name="check" [size]="14" />Gotovo
                      } @else {
                        <app-icon name="trash" [size]="14" />Obriši tagove
                      }
                    </button>
                  </div>
                  @for (g of tagGroups(); track g.name) {
                    <div class="flex flex-col gap-2" role="group" [attr.aria-label]="g.name">
                      <span class="label-caps">{{ g.name }}</span>
                      <div class="flex flex-wrap gap-2">
                        @for (t of g.tags; track t) {
                          @if (editTags()) {
                            <button
                              type="button"
                              class="tag cursor-pointer !border-danger-300/50 !text-danger-300 transition-colors hover:!bg-danger-600 hover:!text-white"
                              [attr.aria-label]="'Obriši tag ' + t"
                              (click)="askDeleteTag(t)"
                            >
                              <app-icon name="x" [size]="14" />{{ t }}
                            </button>
                          } @else {
                            <button
                              type="button"
                              class="tag cursor-pointer transition-colors hover:border-ink-500"
                              [class]="tags().includes(t) ? '!border-cream-50 bg-cream-50 !text-ink-950' : ''"
                              [attr.aria-pressed]="tags().includes(t)"
                              (click)="toggleTag(t)"
                            >
                              @if (tags().includes(t)) {
                                <app-icon name="check" [size]="14" />
                              }
                              {{ t }}
                            </button>
                            @if (g.name === 'Ostalo') {
                              <button type="button" class="-ml-1 text-xs font-bold text-slate-400 underline hover:text-cream-50" (click)="pendingTag.set(t)">
                                svrstaj
                              </button>
                            }
                          }
                        }
                      </div>
                    </div>
                  }
                  @if (!editTags()) {
                    <span class="field-hint">Novi tag ukucaj u polje iznad.</span>
                  }
                </div>
              </div>

              @if (deleteTag(); as t) {
                <app-modal labelledBy="del-tag-title" (close)="deleteTag.set(null)">
                  <div class="flex flex-col gap-3 p-6">
                    <h2 id="del-tag-title" class="m-0 font-display text-[22px] font-normal">Obrisati tag „{{ t }}“?</h2>
                    <p class="m-0 text-[15px] leading-relaxed text-cream-300">
                      @if (tagUsage(t); as n) {
                        Tag će biti uklonjen iz {{ n }} {{ n === 1 ? 'igre' : 'igara' }} i iz liste tagova.
                      } @else {
                        Tag će biti uklonjen iz liste tagova. Nijedna igra ga trenutno nema.
                      }
                    </p>
                    <div class="mt-3 flex justify-end gap-3">
                      <button type="button" class="btn btn-s" (click)="deleteTag.set(null)">Otkaži</button>
                      <button type="button" class="btn btn-d" [disabled]="deletingTag()" (click)="confirmDeleteTag(t)">
                        <app-icon name="trash" [size]="18" />{{ deletingTag() ? 'Brisanje…' : 'Obriši tag' }}
                      </button>
                    </div>
                  </div>
                </app-modal>
              }

              <div class="grid gap-5 sm:grid-cols-3">
                <div class="flex flex-col gap-2">
                  <label for="f-lang" class="field-label"><span>Jezik</span><span class="field-hint">opciono</span></label>
                  <input id="f-lang" class="inp" placeholder="npr. Srpski" [value]="language()" (input)="language.set(val($event))" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="f-rating" class="field-label"><span>Ignjatova ocena</span><span class="field-hint">opciono</span></label>
                  <div class="relative">
                    <input id="f-rating" class="inp pr-12" inputmode="decimal" placeholder="–" [value]="rating()" (input)="rating.set(val($event))" (blur)="touch('rating')" [attr.aria-invalid]="showError('rating')" />
                    <span class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-slate-400">/ 10</span>
                  </div>
                  @if (showError('rating')) {
                    <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().rating }}</span>
                  }
                </div>
                <div class="flex flex-col gap-2">
                  <label for="f-plays" class="field-label"><span>Odigrano partija</span><span class="field-hint">opciono</span></label>
                  <input id="f-plays" class="inp" inputmode="numeric" placeholder="–" [value]="plays()" (input)="plays.set(val($event))" (blur)="touch('plays')" [attr.aria-invalid]="showError('plays')" />
                  @if (showError('plays')) {
                    <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().plays }}</span>
                  }
                </div>
              </div>
            </fieldset>

            <!-- Sadržaj -->
            <fieldset class="m-0 flex flex-col gap-5 border-0 p-0">
              <legend class="label-caps mb-4 p-0">Sadržaj</legend>

              <div class="flex flex-col gap-2">
                <label for="f-yt" class="field-label"><span>YouTube tutorial</span><span class="field-hint">opciono</span></label>
                <input id="f-yt" class="inp" inputmode="url" placeholder="Nalepi link sa YouTube-a" [value]="youtube()" (input)="youtube.set(val($event))" (blur)="touch('youtube')" [attr.aria-invalid]="showError('youtube')" />
                @if (showError('youtube')) {
                  <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().youtube }}</span>
                }
                @if (ytValid()) {
                  <app-youtube class="max-w-[480px]" [url]="youtube()" [title]="name() || 'igra'" />
                }
              </div>

              <div class="flex flex-col gap-2">
                <label for="f-desc" class="field-label"><span>Opis</span><span class="field-hint">opciono</span></label>
                <div class="overflow-hidden rounded border border-ink-700 bg-ink-900 focus-within:border-cream-50">
                  <ng-container *ngTemplateOutlet="toolbar; context: { $implicit: descEl }" />
                  <textarea #descEl id="f-desc" rows="5" class="block w-full resize-y border-0 bg-transparent px-3 py-2.5 text-[15px] leading-relaxed outline-none" [value]="description()" (input)="description.set(val($event))"></textarea>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="f-rules" class="field-label"><span>Pravila</span><span class="field-hint">opciono · Markdown</span></label>
                <div class="overflow-hidden rounded border border-ink-700 bg-ink-900 focus-within:border-cream-50">
                  <ng-container *ngTemplateOutlet="toolbar; context: { $implicit: rulesEl }" />
                  <textarea #rulesEl id="f-rules" rows="8" class="block w-full resize-y border-0 bg-transparent px-3 py-2.5 text-[15px] leading-relaxed outline-none" [value]="rules()" (input)="rules.set(val($event))"></textarea>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="f-pdf" class="field-label"><span>PDF pravila</span><span class="field-hint">opciono · link ili fajl</span></label>
                @if (pdf(); as file) {
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="tag h-9 normal-case"><app-icon name="doc" [size]="14" />{{ file.name }}
                      <button type="button" class="ml-0.5 flex" aria-label="Ukloni izabrani PDF" (click)="pdf.set(null)"><app-icon name="x" [size]="14" /></button>
                    </span>
                    <span class="field-hint">otpremiće se pri čuvanju</span>
                  </div>
                } @else {
                  <div class="flex flex-col gap-2 sm:flex-row">
                    <input
                      id="f-pdf"
                      class="inp flex-1"
                      inputmode="url"
                      placeholder="Nalepi link do PDF-a (https://…)"
                      [value]="pdfUrl()"
                      (input)="pdfUrl.set(val($event))"
                      (blur)="touch('pdf')"
                      [attr.aria-invalid]="showError('pdf')"
                    />
                    <button type="button" class="btn btn-s flex-none px-3 text-sm" (click)="pdfInput.click()">
                      <app-icon name="upload" [size]="16" />Otpremi fajl
                    </button>
                  </div>
                  @if (showError('pdf')) {
                    <span class="field-error"><app-icon name="alert" [size]="16" />{{ errors().pdf }}</span>
                  } @else if (pdfUrl().trim()) {
                    <a [href]="pdfUrl().trim()" target="_blank" rel="noopener" class="text-[13px] font-semibold text-slate-400 no-underline hover:text-cream-50">Otvori link da proveriš ↗</a>
                  }
                  <span class="field-hint">
                    Otpremljen fajl se čita direktno na sajtu i radi offline. Link sa drugog sajta se najčešće samo otvara u novom prozoru.
                  </span>
                }
                <input #pdfInput type="file" accept="application/pdf" class="hidden" (change)="onPdf($event)" />
              </div>
            </fieldset>

            @if (id()) {
              <div class="border-t border-ink-700 pt-6">
                <a [routerLink]="['/igra', id()]" class="text-sm font-bold text-slate-400 no-underline hover:text-cream-50">
                  Brisanje igre je na stranici igre (dugme sa kantom).
                </a>
              </div>
            }
          </div>
        </form>

        <ng-template #toolbar let-el>
          <div role="toolbar" aria-label="Formatiranje" class="flex gap-1 border-b border-ink-700 px-1.5 py-1">
            <button type="button" class="btn btn-g size-9 !px-0" aria-label="Naslov" (click)="format(el, 'heading')"><app-icon name="heading" [size]="16" /></button>
            <button type="button" class="btn btn-g size-9 !px-0" aria-label="Podebljano" (click)="format(el, 'bold')"><app-icon name="bold" [size]="16" /></button>
            <button type="button" class="btn btn-g size-9 !px-0" aria-label="Lista" (click)="format(el, 'list')"><app-icon name="list" [size]="16" /></button>
          </div>
        </ng-template>

        <div class="fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-20 border-t border-ink-700 bg-ink-950/95 backdrop-blur lg:bottom-0">
          <div class="mx-auto flex max-w-[1240px] items-center justify-end gap-3 px-4 py-3 lg:px-10">
            @if (submitted() && errorCount()) {
              <span role="alert" class="field-error mr-auto text-[13px]">
                <app-icon name="alert" [size]="16" />Ispravi {{ errorCount() }} {{ errorCount() === 1 ? 'polje' : 'polja' }}
              </span>
            }
            <a [routerLink]="id() ? ['/igra', id()] : '/'" class="btn btn-s">Otkaži</a>
            <button type="submit" form="game-form" class="btn btn-p" [disabled]="saving() || processing()">
              <app-icon name="check" [size]="18" />{{ saving() ? 'Čuvanje…' : 'Sačuvaj igru' }}
            </button>
          </div>
        </div>
      }
    </main>
  `,
})
export class GameForm implements OnDestroy {
  /** Postoji samo kod izmene (/igra/:id/izmena) */
  readonly id = input<string>();

  private games = inject(GamesService);
  private router = inject(Router);
  private toast = inject(ToastService);

  /** Igra kakva je bila kad je forma popunjena – čuvaju se samo razlike u odnosu na nju */
  private base?: Game;
  protected original = computed(() => (this.id() ? this.games.byId(this.id()!) : undefined));

  protected name = signal('');
  protected playersMin = signal('');
  protected playersMax = signal('');
  protected timeMin = signal('');
  protected timeMax = signal('');
  protected weight = signal('');
  protected tags = signal<string[]>([]);
  protected tagDraft = signal('');
  /** Svi tagovi koji se već koriste u katalogu – predlozi dok se kuca */
  protected allTags = computed(() =>
    [...new Set(this.games.games().flatMap((g) => g.tags))].sort((a, b) => a.localeCompare(b, 'sr')),
  );
  /** Grupe tagova kao u filteru; tagovi van grupa idu u "Ostalo" */
  private tagGroupsSvc = inject(TagGroupsService);
  protected readonly groupNames = GROUP_NAMES;
  /** Svi tagovi po grupama (i oni koji još nisu ni na jednoj igri); bez grupe → "Ostalo" */
  protected tagGroups = computed(() => this.tagGroupsSvc.grouped([...new Set([...this.allTags(), ...this.tags()])], false));
  protected editTags = signal(false);
  protected deleteTag = signal<string | null>(null);
  protected deletingTag = signal(false);
  protected tagUsage = (t: string) => this.games.games().filter((g) => g.tags.includes(t)).length;

  protected askDeleteTag(t: string) {
    this.deleteTag.set(t);
  }

  /** Briše tag iz svih igara u bazi i iz grupa tagova. */
  protected async confirmDeleteTag(t: string) {
    this.deletingTag.set(true);
    try {
      const n = await this.games.removeTagEverywhere(t);
      await this.tagGroupsSvc.remove(t);
      this.tags.update((tags) => tags.filter((x) => x !== t));
      // i verzija iz koje je forma popunjena više nema taj tag, da ga čuvanje ne bi vratilo
      if (this.base) this.base = { ...this.base, tags: this.base.tags.filter((x) => x !== t) };
      this.toast.success(n ? `Tag „${t}“ je obrisan iz ${n} ${n === 1 ? 'igre' : 'igara'}` : `Tag „${t}“ je obrisan`);
    } catch (e) {
      console.error(e);
      this.toast.error('Brisanje taga nije uspelo. Pokušaj ponovo.');
    } finally {
      this.deletingTag.set(false);
      this.deleteTag.set(null);
    }
  }

  /** Novi tag za koji Ignjat bira grupu */
  protected pendingTag = signal<string | null>(null);
  protected tagSuggestions = computed(() => this.allTags().filter((t) => !this.tags().includes(t)));
  protected language = signal('');
  protected rating = signal('');
  protected plays = signal('');
  protected youtube = signal('');
  protected description = signal('');
  protected rules = signal('');

  protected cover = signal<Blob | null>(null);
  protected preview = signal<string | null>(null);
  private objectUrl: string | null = null;
  /** Novi PDF fajl za upload; ima prednost nad linkom */
  protected pdf = signal<File | null>(null);
  /** Link do PDF-a (spoljni ili ranije otpremljen fajl) */
  protected pdfUrl = signal('');

  protected dragOver = signal(false);
  protected processing = signal(false);
  protected saving = signal(false);
  protected submitted = signal(false);
  private touched = signal<Set<Field>>(new Set());

  protected ytValid = computed(() => !!youtubeId(this.youtube()));

  protected weightPreview = computed(() => {
    const w = num(this.weight());
    return w !== null && w >= 1 && w <= 5 ? `${decimal(w)} → ${weightLabel(w)}` : 'Oznaka se računa sama';
  });

  protected errors = computed(() => {
    const e: Partial<Record<Field, string>> = {};
    // nova igra mora imati sliku; uvezene igre (iz PDF-a) mogu da se menjaju i bez nje
    if (!this.preview() && !this.id()) e.image = 'Slika je obavezna';
    if (!this.name().trim()) e.name = 'Naziv je obavezan';

    const pMin = num(this.playersMin());
    const pMax = num(this.playersMax());
    if (pMin === null || pMax === null) e.players = 'Unesi najmanji i najveći broj igrača';
    else if (!Number.isInteger(pMin) || !Number.isInteger(pMax) || pMin < 1) e.players = 'Broj igrača mora biti ceo broj, bar 1';
    else if (pMax < pMin) e.players = 'Max ne može biti manji od min';

    const tMin = num(this.timeMin());
    const tMax = num(this.timeMax());
    if (tMin === null) e.time = 'Unesi trajanje u minutima';
    else if (!Number.isInteger(tMin) || tMin < 1 || (tMax !== null && (!Number.isInteger(tMax) || tMax < tMin)))
      e.time = '„Do“ mora biti ceo broj, veći od „od“';

    const w = num(this.weight());
    if (w === null) e.weight = 'Težina je obavezna';
    else if (Number.isNaN(w) || w < 1 || w > 5) e.weight = 'Težina mora biti između 1,00 i 5,00';

    const r = num(this.rating());
    if (r !== null && (Number.isNaN(r) || r < 0 || r > 10)) e.rating = 'Ocena je od 0 do 10';
    const p = num(this.plays());
    if (p !== null && (!Number.isInteger(p) || p < 0)) e.plays = 'Unesi ceo broj';
    if (this.youtube().trim() && !this.ytValid()) e.youtube = 'Ovo ne liči na YouTube link';
    const pdf = this.pdfUrl().trim();
    if (!this.pdf() && pdf && !/^https?:\/\/\S+$/i.test(pdf)) e.pdf = 'Link mora da počinje sa http:// ili https://';
    return e;
  });

  protected errorCount = computed(() => Object.keys(this.errors()).length);

  constructor() {
    // popuni formu jednom, kad su podaci igre dostupni; ta verzija je "base" za čuvanje
    effect(() => {
      const g = this.original();
      if (!g || this.base) return;
      this.base = g;
      untracked(() => {
        this.name.set(g.name);
        this.playersMin.set(String(g.playersMin));
        this.playersMax.set(String(g.playersMax));
        this.timeMin.set(String(g.timeMin));
        this.timeMax.set(g.timeMax === null ? '' : String(g.timeMax));
        this.weight.set(decimal(g.weight));
        this.tags.set([...g.tags]);
        this.language.set(g.language ?? '');
        this.rating.set(g.rating === null ? '' : decimal(g.rating, 1));
        this.plays.set(g.plays === null ? '' : String(g.plays));
        this.youtube.set(g.youtubeUrl ?? '');
        this.description.set(g.description ?? '');
        this.rules.set(g.rules ?? '');
        this.pdfUrl.set(g.rulesPdfUrl ?? '');
        if (!this.cover()) this.preview.set(g.imageUrl);
      });
    });
  }

  ngOnDestroy() {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  protected val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  protected touch(f: Field) {
    this.touched.update((s) => new Set(s).add(f));
  }

  protected showError(f: Field): boolean {
    return !!this.errors()[f] && (this.submitted() || this.touched().has(f));
  }

  protected removeTag(t: string) {
    this.tags.update((tags) => tags.filter((x) => x !== t));
  }

  protected onTagInput(e: Event) {
    const v = this.val(e);
    // zarez (ili izbor iz predloga) odmah pravi tag
    if (v.includes(',')) {
      v.split(',').forEach((part) => this.addTag(part));
      this.tagDraft.set('');
      (e.target as HTMLInputElement).value = '';
    } else {
      this.tagDraft.set(v);
    }
  }

  protected toggleTag(t: string) {
    this.tags.update((tags) => (tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]));
  }

  protected onTagKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      this.commitTag();
    } else if (e.key === 'Backspace' && !this.tagDraft() && this.tags().length) {
      this.tags.update((tags) => tags.slice(0, -1));
    }
  }

  protected commitTag() {
    this.addTag(this.tagDraft());
    this.tagDraft.set('');
  }

  /** Tag sa velikim početnim slovom; isti tag (bez obzira na velika slova) se ne dodaje dvaput. */
  private addTag(raw: string) {
    const t = raw.trim().replace(/\s+/g, ' ');
    if (!t) return;
    const tag = t[0].toLocaleUpperCase('sr') + t.slice(1);
    // ako već postoji u drugim igrama, preuzmi tačan oblik (npr. "deck building" → "Deck building")
    const existing = this.allTags().find((x) => x.toLocaleLowerCase('sr') === tag.toLocaleLowerCase('sr'));
    const final = existing ?? tag;
    if (this.tags().some((x) => x.toLocaleLowerCase('sr') === final.toLocaleLowerCase('sr'))) return;
    this.tags.update((tags) => [...tags, final]);
    if (!this.tagGroupsSvc.groupOf(final)) this.pendingTag.set(final);
  }

  protected async chooseGroup(tag: string, group: GroupName | null) {
    this.pendingTag.set(null);
    if (!group) return;
    try {
      await this.tagGroupsSvc.setGroup(tag, group);
      this.toast.success(`„${tag}“ je u grupi ${group}`);
    } catch (e) {
      console.error(e);
      this.toast.error('Grupa nije sačuvana. Da li je pokrenut SQL tag-grupe.sql?');
    }
  }

  protected onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.setImage(file);
  }

  protected onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.setImage(file);
  }

  private async setImage(file: File) {
    if (!file.type.startsWith('image/')) return this.toast.error('Izaberi sliku (JPG, PNG, WEBP).');
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return this.toast.error(`Slika je veća od ${MAX_IMAGE_MB} MB.`);
    this.processing.set(true);
    try {
      const blob = await resizeImage(file);
      if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = URL.createObjectURL(blob);
      this.cover.set(blob);
      this.preview.set(this.objectUrl);
      this.touch('image');
    } catch {
      this.toast.error('Slika ne može da se pročita.');
    } finally {
      this.processing.set(false);
    }
  }

  protected onPdf(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') return this.toast.error('Izaberi PDF fajl.');
    if (file.size > MAX_PDF_MB * 1024 * 1024) return this.toast.error(`PDF je veći od ${MAX_PDF_MB} MB.`);
    this.pdf.set(file);
  }

  /** Mini Markdown alati za opis i pravila */
  protected format(el: HTMLTextAreaElement, kind: 'heading' | 'bold' | 'list') {
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e);
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    let next: string;
    let cursor: number;
    if (kind === 'bold') {
      next = value.slice(0, s) + `**${sel || 'tekst'}**` + value.slice(e);
      cursor = s + 2 + (sel || 'tekst').length;
    } else {
      const prefix = kind === 'heading' ? '### ' : '- ';
      next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      cursor = e + prefix.length;
    }
    (el.id === 'f-desc' ? this.description : this.rules).set(next);
    el.value = next;
    el.focus();
    el.setSelectionRange(cursor, cursor);
  }

  protected async save(e: Event) {
    e.preventDefault();
    this.commitTag();
    this.submitted.set(true);
    if (this.errorCount()) {
      document.querySelector<HTMLElement>('[aria-invalid=true]')?.focus();
      return;
    }
    const orig = this.original();
    const opt = (s: string) => s.trim() || null;
    const input: GameInput = {
      name: this.name().trim(),
      imageUrl: orig?.imageUrl ?? null,
      playersMin: num(this.playersMin())!,
      playersMax: num(this.playersMax())!,
      timeMin: num(this.timeMin())!,
      timeMax: num(this.timeMax()),
      weight: Math.round(num(this.weight())! * 100) / 100,
      description: opt(this.description()),
      youtubeUrl: opt(this.youtube()),
      rules: opt(this.rules()),
      // otpremljeni fajl (ako postoji) zameniće ovaj link u GamesService.save
      rulesPdfUrl: opt(this.pdfUrl()),
      tags: this.tags(),
      language: opt(this.language()),
      rating: num(this.rating()),
      plays: num(this.plays()),
    };
    this.saving.set(true);
    try {
      const saved = await this.games.save(
        this.id() ?? null,
        input,
        { cover: this.cover() ?? undefined, rulesPdf: this.pdf() ?? undefined },
        this.base,
      );
      this.toast.success(this.id() ? 'Izmene su sačuvane' : 'Igra je sačuvana');
      this.router.navigate(['/igra', saved.id]);
    } catch (err) {
      console.error(err);
      this.toast.error('Čuvanje nije uspelo. Pokušaj ponovo.');
    } finally {
      this.saving.set(false);
    }
  }
}
