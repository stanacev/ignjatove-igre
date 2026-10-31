import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { marked } from 'marked';
import { youtubeId } from '../core/media';
import { Icon } from './icon';

/** Markdown (opis, pravila). Angular sam čisti HTML pre prikaza. */
@Component({
  selector: 'app-markdown',
  template: `<div class="prose-igre" [innerHTML]="html()"></div>`,
})
export class Markdown {
  readonly text = input.required<string>();
  protected html = computed(() => marked.parse(this.text(), { async: false, breaks: true }) as string);
}

/**
 * YouTube tutorial: prvo samo sličica (brže, radi i offline),
 * a pravi plejer se učitava tek na klik.
 */
@Component({
  selector: 'app-youtube',
  imports: [Icon],
  template: `
    <div class="relative aspect-video overflow-hidden rounded-md border border-ink-700 bg-black">
      @if (playing()) {
        <iframe
          class="absolute inset-0 size-full"
          [src]="embedUrl()"
          [title]="'Tutorial: ' + title()"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      } @else {
        <img [src]="thumb()" alt="" class="absolute inset-0 size-full object-cover brightness-[.55]" loading="lazy" />
        <button
          type="button"
          class="absolute top-1/2 left-1/2 -mt-8 -ml-8 flex size-16 items-center justify-center rounded bg-cream-50 text-ink-950 transition-colors hover:bg-white"
          [attr.aria-label]="'Pusti video: Kako se igra ' + title()"
          (click)="playing.set(true)"
        >
          <app-icon name="play" [size]="28" />
        </button>
      }
    </div>
    <a [href]="url()" target="_blank" rel="noopener" class="text-[13px] font-semibold text-slate-400 no-underline hover:text-cream-50">
      YouTube · Kako se igra {{ title() }} ↗
    </a>
  `,
  host: { class: 'flex flex-col gap-2.5' },
})
export class Youtube {
  readonly url = input.required<string>();
  readonly title = input.required<string>();
  protected playing = signal(false);

  private sanitizer = inject(DomSanitizer);
  private id = computed(() => youtubeId(this.url()));
  protected thumb = computed(() => `https://i.ytimg.com/vi/${this.id()}/hqdefault.jpg`);
  protected embedUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${this.id()}?autoplay=1&rel=0`,
    ),
  );
}
