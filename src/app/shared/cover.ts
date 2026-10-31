import { Component, input } from '@angular/core';

/**
 * Slika kutije.
 * - `contain` (podrazumevano): cela kutija, skoro do ivica, preko zamućene kopije iste slike –
 *   prozirne (PNG) i bele pozadine izgledaju ujednačeno.
 * - `cover`: slika popunjava ceo okvir, ivice se po potrebi odseku.
 */
@Component({
  selector: 'app-cover',
  template: `
    @if (src()) {
      @if (fit() === 'contain') {
        <img
          [src]="src()"
          crossorigin="anonymous"
          alt=""
          aria-hidden="true"
          class="absolute inset-0 size-full scale-130 object-cover"
          [style.filter]="'blur(' + blur() + 'px) brightness(' + dim() + ') saturate(1.15)'"
          loading="lazy"
          decoding="async"
        />
      }
      <img
        [src]="src()"
        crossorigin="anonymous"
        [alt]="alt()"
        class="absolute inset-0 size-full"
        [class]="fit() === 'contain' ? 'object-contain' : 'object-cover'"
        [style.padding]="fit() === 'contain' ? pad() : null"
        loading="lazy"
        decoding="async"
      />
    } @else if (placeholder()) {
      <div class="pips absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-800/60" [attr.aria-label]="alt()" role="img">
        <svg viewBox="0 0 40 40" class="w-[32%] max-w-24 opacity-70" aria-hidden="true">
          <g transform="rotate(-10 20 20)">
            <rect x="6" y="6" width="28" height="28" rx="4" fill="none" stroke="#3E5A9C" stroke-width="2" stroke-dasharray="4 3" />
            <circle cx="14" cy="14" r="2.4" fill="#3E5A9C" />
            <circle cx="20" cy="20" r="2.4" fill="#FCF1D0" />
            <circle cx="26" cy="26" r="2.4" fill="#3E5A9C" />
          </g>
        </svg>
      </div>
    }
  `,
  host: { class: 'relative block overflow-hidden bg-ink-900' },
})
export class Cover {
  readonly src = input<string | null>();
  readonly alt = input('');
  readonly fit = input<'cover' | 'contain'>('contain');
  /** Samo za `contain` */
  readonly pad = input('0');
  readonly blur = input(18);
  readonly dim = input(0.5);
  /** Kockica umesto slike kada igra još nema fotografiju */
  readonly placeholder = input(true);
}
