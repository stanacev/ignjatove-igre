import { Component, input } from '@angular/core';

/** Dve kockice iz dizajna. Veličina preko `size` ili CSS klasa na elementu. */
@Component({
  selector: 'app-logo',
  template: `
    <svg viewBox="0 0 40 40" aria-hidden="true" class="block size-full">
      <g transform="rotate(-10 15 17)">
        <rect x="4" y="6" width="20" height="20" rx="3" fill="none" stroke="#FCF1D0" stroke-width="2.4" />
        <circle cx="10" cy="12" r="1.9" fill="#FCF1D0" />
        <circle cx="18" cy="20" r="1.9" fill="#FCF1D0" />
      </g>
      <g transform="rotate(8 26 25)">
        <rect x="15" y="14" width="21" height="21" rx="3" fill="#FCF1D0" stroke="#010736" stroke-width="2.4" />
        <circle cx="20.5" cy="19.5" r="1.9" fill="#010736" />
        <circle cx="25.5" cy="24.5" r="1.9" fill="#010736" />
        <circle cx="30.5" cy="29.5" r="1.9" fill="#010736" />
      </g>
    </svg>
  `,
  host: {
    class: 'inline-block shrink-0',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
})
export class Logo {
  readonly size = input<number | null>(null);
}
