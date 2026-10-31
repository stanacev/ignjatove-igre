import { Component, computed, input } from '@angular/core';
import { decimal } from '../core/format';

/** Indikator težine: 5 segmenata, poslednji delimično popunjen. */
@Component({
  selector: 'app-weight-bar',
  template: `
    @for (fill of fills(); track $index) {
      <span class="relative block flex-1 overflow-hidden bg-ink-700" [style.height.px]="height()">
        <span class="absolute inset-y-0 left-0 block bg-cream-50" [style.width.%]="fill"></span>
      </span>
    }
  `,
  host: {
    role: 'img',
    class: 'flex min-w-0 flex-auto',
    '[style.gap.px]': 'height() > 6 ? 3 : 2',
    '[attr.aria-label]': '"Težina " + label() + " od 5"',
  },
})
export class WeightBar {
  readonly weight = input.required<number>();
  readonly height = input(5);

  protected readonly label = computed(() => decimal(this.weight()));
  protected readonly fills = computed(() =>
    [0, 1, 2, 3, 4].map((i) => Math.round(Math.min(1, Math.max(0, this.weight() - i)) * 100)),
  );
}
