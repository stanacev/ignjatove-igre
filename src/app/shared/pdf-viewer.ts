import {
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { Icon } from './icon';

/** pdf.js se učitava tek kad je čitač potreban (~1 MB), da katalog ostane brz. */
const pdfjs = () =>
  import('pdfjs-dist').then((m) => {
    m.GlobalWorkerOptions.workerSrc = asset('pdf.worker.min.mjs');
    return m;
  });

function asset(path: string): string {
  return new URL(`pdfjs/${path}`, document.baseURI).href;
}

interface PageSlot {
  n: number;
  /** visina / širina */
  ratio: number;
}

/**
 * PDF pravila prikazana na stranici: strane jedna ispod druge, crtaju se tek kad
 * dođu blizu ekrana. Ceo fajl se preuzima jednim zahtevom, pa ga service worker
 * sačuva i pravila posle rade offline.
 */
@Component({
  selector: 'app-pdf-viewer',
  imports: [Icon],
  template: `
    <div
      class="flex flex-col"
      [class]="full() ? 'fixed inset-0 z-50 bg-ink-950' : 'rounded-md border border-ink-700 bg-ink-900'"
    >
      <div class="flex items-center gap-2 border-b border-ink-700 px-3 py-2" [style.padding-top]="full() ? 'max(8px, env(safe-area-inset-top))' : null">
        <app-icon name="doc" [size]="18" class="text-slate-400" />
        <span class="flex-1 truncate text-sm font-bold text-cream-300">
          @if (status() === 'ready') {
            Pravila · {{ pages().length }} {{ pages().length === 1 ? 'strana' : pages().length < 5 ? 'strane' : 'strana' }}
          } @else {
            Pravila (PDF)
          }
        </span>
        <a [href]="url()" target="_blank" rel="noopener" class="btn btn-g h-9 px-2.5 text-[13px]" aria-label="Otvori PDF u novom prozoru">
          <app-icon name="external" [size]="16" /><span class="hidden sm:inline">Otvori</span>
        </a>
        <button type="button" class="btn btn-s h-9 px-2.5 text-[13px]" (click)="toggleFull()">
          @if (full()) {
            <app-icon name="x" [size]="16" />Zatvori
          } @else {
            <app-icon name="expand" [size]="16" />Ceo ekran
          }
        </button>
      </div>

      <div
        #scroller
        class="overflow-y-auto overscroll-contain"
        [class]="full() ? 'flex-1' : 'max-h-[80vh] lg:max-h-[85vh]'"
      >
        @switch (status()) {
          @case ('loading') {
            <div class="flex flex-col items-center gap-3 px-4 py-16 text-center text-sm font-semibold text-slate-400">
              <div class="skeleton h-1.5 w-40 rounded-full"></div>
              {{ progress() ? 'Učitavanje pravila… ' + progress() + '%' : 'Učitavanje pravila…' }}
            </div>
          }
          @case ('error') {
            <div class="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <app-icon name="alert" [size]="28" class="text-slate-400" />
              <p class="m-0 max-w-[320px] text-[15px] text-cream-300">{{ error() }}</p>
              <a [href]="url()" target="_blank" rel="noopener" class="btn btn-p"><app-icon name="doc" [size]="18" />Otvori PDF</a>
            </div>
          }
          @default {
            <div #pagesEl class="mx-auto flex flex-col gap-3 p-3" [style.max-width.px]="full() ? 1000 : null">
              @for (p of pages(); track p.n) {
                <div
                  class="relative w-full overflow-hidden rounded-sm bg-white shadow-card"
                  [style.aspect-ratio]="1 / p.ratio"
                  [attr.data-page]="p.n"
                >
                  <span class="absolute inset-0 flex items-center justify-center font-display text-sm text-ink-700">{{ p.n }}</span>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class PdfViewer implements OnDestroy {
  readonly url = input.required<string>();

  protected status = signal<'loading' | 'ready' | 'error'>('loading');
  protected progress = signal(0);
  protected error = signal('');
  protected pages = signal<PageSlot[]>([]);
  protected full = signal(false);

  private scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private pagesEl = viewChild<ElementRef<HTMLElement>>('pagesEl');

  private task?: PDFDocumentLoadingTask;
  private doc?: PDFDocumentProxy;
  private observer?: IntersectionObserver;
  private resize?: ResizeObserver;
  private rendered = new Map<number, { width: number; task?: RenderTask }>();
  private lastWidth = 0;

  constructor() {
    effect(() => {
      const url = this.url();
      untracked(() => this.open(url));
    });

    // kad se strane pojave u DOM-u, prati koje su blizu ekrana
    effect(() => {
      const el = this.pagesEl()?.nativeElement;
      const root = this.scroller()?.nativeElement;
      if (!el || !root) return;
      this.watch(el, root);
    });
  }

  ngOnDestroy() {
    this.cleanup();
    document.body.style.overflow = '';
  }

  protected toggleFull() {
    this.full.update((f) => !f);
    document.body.style.overflow = this.full() ? 'hidden' : '';
  }

  private async open(url: string) {
    this.cleanup();
    this.status.set('loading');
    this.progress.set(0);
    try {
      const lib = await pdfjs();
      this.task = lib.getDocument({
        url,
        // ceo fajl jednim zahtevom → service worker ga čuva za offline
        disableRange: true,
        disableStream: true,
        standardFontDataUrl: asset('standard_fonts/'),
        cMapUrl: asset('cmaps/'),
        cMapPacked: true,
        wasmUrl: asset('wasm/'),
        iccUrl: asset('iccs/'),
      });
      this.task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
        if (total) this.progress.set(Math.min(99, Math.round((loaded / total) * 100)));
      };
      this.doc = await this.task.promise;

      // pretpostavka: sve strane iste veličine kao prva; prava se postavi kad se strana nacrta
      const first = (await this.doc.getPage(1)).getViewport({ scale: 1 });
      const ratio = first.height / first.width;
      this.pages.set(Array.from({ length: this.doc.numPages }, (_, i) => ({ n: i + 1, ratio })));
      this.status.set('ready');
    } catch (e) {
      console.error(e);
      this.status.set('error');
      this.error.set(
        navigator.onLine
          ? 'Ova pravila ne mogu da se prikažu ovde (sajt sa kog su ne dozvoljava prikaz). Otvori ih u novom prozoru.'
          : 'Nema interneta, a ova pravila još nisu sačuvana na uređaju.',
      );
    }
  }

  private watch(container: HTMLElement, root: HTMLElement) {
    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) this.render(e.target as HTMLElement);
        }
      },
      { root, rootMargin: '800px 0px' },
    );
    container.querySelectorAll<HTMLElement>('[data-page]').forEach((el) => this.observer!.observe(el));

    // promena širine (npr. ceo ekran, okretanje telefona) → ponovo nacrtaj vidljive strane
    this.resize?.disconnect();
    this.resize = new ResizeObserver(() => {
      const w = container.clientWidth;
      if (Math.abs(w - this.lastWidth) < 2) return;
      this.lastWidth = w;
      this.rendered.forEach((r) => r.task?.cancel());
      this.rendered.clear();
      container.querySelectorAll<HTMLElement>('[data-page]').forEach((el) => {
        this.observer!.unobserve(el);
        this.observer!.observe(el);
      });
    });
    this.resize.observe(container);
  }

  private async render(slot: HTMLElement) {
    const n = Number(slot.dataset['page']);
    const width = slot.clientWidth;
    if (!this.doc || !width || this.rendered.get(n)?.width === width) return;
    const entry: { width: number; task?: RenderTask } = { width };
    this.rendered.set(n, entry);

    try {
      const page = await this.doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: (width / base.width) * dpr });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.className = 'absolute inset-0 size-full';
      canvas.setAttribute('aria-label', `Strana ${n}`);

      entry.task = page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport });
      await entry.task.promise;
      if (this.rendered.get(n) !== entry) return; // u međuvremenu promenjena širina
      slot.style.aspectRatio = `${base.width} / ${base.height}`;
      slot.querySelector('canvas')?.remove();
      slot.appendChild(canvas);
    } catch (e) {
      if ((e as Error)?.name !== 'RenderingCancelledException') console.error(e);
      if (this.rendered.get(n) === entry) this.rendered.delete(n);
    }
  }

  private cleanup() {
    this.observer?.disconnect();
    this.resize?.disconnect();
    this.rendered.forEach((r) => r.task?.cancel());
    this.rendered.clear();
    this.lastWidth = 0;
    this.task?.destroy();
    this.doc = undefined;
    this.pages.set([]);
  }
}
