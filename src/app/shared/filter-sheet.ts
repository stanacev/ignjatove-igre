import { Component, input, output } from '@angular/core';
import { FilterState } from '../core/filters';
import { gamesCount } from '../core/format';
import { FilterFields } from './filter-fields';
import { Icon } from './icon';
import { Modal } from './modal';

/** Filteri na telefonu: bottom sheet. */
@Component({
  selector: 'app-filter-sheet',
  imports: [FilterFields, Icon, Modal],
  template: `
    <app-modal variant="sheet" labelledBy="filter-title" (close)="close.emit()">
      <div class="flex justify-center pt-2.5"><span class="block h-1 w-10 bg-ink-700"></span></div>
      <div class="flex items-center justify-between py-2 pr-4 pl-5">
        <h2 id="filter-title" class="m-0 font-display text-[22px] font-normal">Filteri</h2>
        <button type="button" class="btn btn-g size-11 !px-0 !text-cream-50" aria-label="Zatvori filtere" (click)="close.emit()">
          <app-icon name="x" [size]="22" />
        </button>
      </div>
      <div class="overflow-y-auto px-5 pt-2 pb-6">
        <app-filter-fields [state]="state()" [showSort]="showSort()" />
      </div>
      <div class="flex gap-3 border-t border-ink-700 px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))]">
        <button type="button" class="btn btn-s flex-none" (click)="state().reset()">Resetuj</button>
        <button type="button" class="btn btn-p flex-auto" (click)="close.emit()">
          {{ count() === 0 ? 'Nema igara' : 'Prikaži ' + gamesCount(count()) }}
        </button>
      </div>
    </app-modal>
  `,
})
export class FilterSheet {
  readonly state = input.required<FilterState>();
  readonly count = input.required<number>();
  readonly showSort = input(false);
  readonly close = output();
  protected readonly gamesCount = gamesCount;
}
