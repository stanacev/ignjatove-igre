import { Component, inject, input } from '@angular/core';
import { OnlineService, ToastService } from '../core/ui.service';
import { Icon } from './icon';

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  template: `
    <div
      class="pointer-events-none fixed inset-x-4 z-[60] flex flex-col items-center gap-2 lg:inset-x-auto lg:top-24 lg:right-10 lg:bottom-auto lg:w-[380px]"
      [class]="admin() ? 'bottom-[96px]' : 'bottom-6'"
      aria-live="polite"
    >
      @for (t of toast.toasts(); track t.id) {
        <div
          role="status"
          class="pointer-events-auto flex w-full max-w-[420px] animate-[toast_.2s_ease-out] items-center gap-3 rounded border py-3 pr-3.5 pl-3 text-[15px] font-bold shadow-pop"
          [class]="
            t.kind === 'success'
              ? 'border-cream-50/60 bg-ink-800 text-cream-50'
              : 'border-danger-600 bg-danger-600 text-white'
          "
        >
          <app-icon [name]="t.kind === 'success' ? 'check' : 'alert'" [class.text-success-300]="t.kind === 'success'" />
          <span class="flex-auto">{{ t.text }}</span>
          <button type="button" class="flex p-1 opacity-80 hover:opacity-100" aria-label="Zatvori obaveštenje" (click)="toast.dismiss(t.id)">
            <app-icon name="x" [size]="18" />
          </button>
        </div>
      }
    </div>
  `,
})
export class Toasts {
  readonly admin = input(false);
  protected toast = inject(ToastService);
}

@Component({
  selector: 'app-offline-banner',
  imports: [Icon],
  template: `
    @if (!net.online()) {
      <div role="status" class="flex items-center justify-center gap-2 bg-ink-700 px-4 py-2 text-center text-[13px] font-bold text-cream-50">
        <app-icon name="wifioff" [size]="16" />Nema interneta – prikazuju se sačuvani podaci
      </div>
    }
  `,
})
export class OfflineBanner {
  protected net = inject(OnlineService);
}

/** Prazno stanje sa motivom kockice */
@Component({
  selector: 'app-empty-state',
  template: `
    <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true" class="mb-2">
      <g transform="rotate(-8 44 44)">
        <rect x="14" y="14" width="60" height="60" rx="8" fill="none" stroke="#22396F" stroke-width="3" stroke-dasharray="7 6" />
        <circle cx="32" cy="32" r="4.5" fill="#3E5A9C" />
        <circle cx="56" cy="56" r="4.5" fill="#3E5A9C" />
        <circle cx="44" cy="44" r="4.5" fill="#FCF1D0" />
      </g>
    </svg>
    <h2 class="m-0 font-display text-[22px] font-normal">{{ title() }}</h2>
    <p class="m-0 max-w-[320px] text-[15px] text-cream-300">{{ text() }}</p>
    <div class="mt-3"><ng-content /></div>
  `,
  host: { class: 'flex flex-col items-center gap-2 px-6 py-16 text-center' },
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly text = input('');
}
