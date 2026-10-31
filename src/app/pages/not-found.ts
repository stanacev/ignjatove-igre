import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../shared/header';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Header, Icon],
  template: `
    <app-header />
    <main class="flex min-h-[calc(100dvh-60px)] flex-col items-center justify-center gap-3 px-6 pb-20 text-center">
      <div class="flex items-center gap-3 font-display text-[88px] leading-none lg:text-[120px]" aria-hidden="true">
        4
        <svg viewBox="0 0 40 40" class="size-[72px] lg:size-[100px]">
          <rect x="5" y="5" width="30" height="30" rx="4" fill="none" stroke="#FCF1D0" stroke-width="2.6" transform="rotate(-10 20 20)" />
        </svg>
        4
      </div>
      <h1 class="m-0 font-display text-[26px] font-normal">{{ title() }}</h1>
      <p class="m-0 max-w-[320px] text-[15px] text-cream-300">{{ text() }}</p>
      <a routerLink="/" class="btn btn-p mt-4"><app-icon name="grid" [size]="18" />Nazad na katalog</a>
    </main>
  `,
})
export class NotFound {
  readonly title = input('Ova stranica ne postoji');
  readonly text = input('Kockice su pale pored table. Vrati se u katalog.');
}
