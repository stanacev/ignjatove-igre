import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { decimal, range } from '../core/format';
import { GamesService } from '../core/games.service';
import { ToastService } from '../core/ui.service';
import { Game } from '../core/models';
import { Cover } from './cover';
import { Icon } from './icon';
import { WeightBar } from './weight-bar';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink, Cover, Icon, WeightBar],
  template: `
    <a
      [routerLink]="['/igra', game().id]"
      class="flex h-full min-w-0 flex-col overflow-hidden rounded-md border border-ink-700 bg-ink-900 text-cream-50 no-underline transition duration-150 hover:-translate-y-[3px] hover:border-cream-50/50 hover:shadow-card focus-visible:outline-offset-[3px] active:translate-y-0 active:scale-[.98]"
    >
      <div class="relative">
        <app-cover class="aspect-[4/5]" [src]="game().imageUrl" [alt]="'Kutija igre ' + game().name" />
        @if (game().rating !== null) {
          <span
            class="absolute top-2 right-2 flex items-center gap-1 rounded-sm bg-ink-950/85 px-1.5 py-0.5 font-display text-[13px] text-cream-50 shadow-pop"
            [attr.aria-label]="'Ignjatova ocena ' + rating() + ' od 10'"
          >
            <app-icon name="star" [size]="13" [stroke]="2.2" class="text-cream-50" />{{ rating() }}
          </span>
        }
        @if (auth.isAdmin()) {
          <!-- Ignjat: brzo +1 partija iz kataloga (ne otvara igru) -->
          <button
            type="button"
            class="absolute bottom-2 left-2 flex h-[22px] items-center gap-1 rounded-sm border border-transparent bg-ink-950/85 px-1.5 font-display text-[13px] text-cream-50 shadow-pop transition-colors hover:border-cream-50/60 hover:bg-ink-800 disabled:opacity-60"
            [attr.aria-label]="'Dodaj odigranu partiju: ' + game().name"
            [disabled]="saving()"
            (click)="addPlay($event)"
          >
            <app-icon name="plus" [size]="13" [stroke]="2.4" />
          </button>
        }
        @if (game().plays) {
          <span
            class="absolute right-2 bottom-2 flex items-center gap-1 rounded-sm bg-ink-950/85 px-1.5 py-0.5 font-display text-[13px] text-cream-50 shadow-pop"
            [attr.aria-label]="'Odigrano ' + game().plays + ' puta'"
          >
            <app-icon name="die3d" [size]="15" [stroke]="1.8" />{{ game().plays }}
          </span>
        }
      </div>
      <div class="flex flex-1 flex-col gap-2 px-2.5 pt-2.5 pb-3 lg:px-3 lg:pb-3.5">
        <h3 class="clamp2 m-0 min-h-9 font-display text-[15px] leading-[1.2] font-normal lg:text-base">
          {{ game().name }}
        </h3>
        <div class="flex items-center gap-2.5 text-xs font-bold whitespace-nowrap text-cream-300">
          <span class="flex items-center gap-1"><app-icon name="meeple" [size]="14" [stroke]="1.8" />{{ players() }}</span>
          <span class="flex items-center gap-1"><app-icon name="clock" [size]="14" [stroke]="1.8" />{{ time() }} min</span>
        </div>
        <div class="mt-auto flex items-center gap-2">
          <app-weight-bar [weight]="game().weight" />
          <span class="font-display text-[13px]">{{ weight() }}</span>
        </div>
      </div>
    </a>
  `,
  host: { class: 'block min-w-0' },
})
export class GameCard {
  readonly game = input.required<Game>();

  protected auth = inject(AuthService);
  private games = inject(GamesService);
  private toast = inject(ToastService);
  protected saving = signal(false);

  protected async addPlay(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const g = this.game();
    this.saving.set(true);
    try {
      const saved = await this.games.setPlays(g, (g.plays ?? 0) + 1);
      this.toast.success(`${g.name}: ${saved.plays}. partija`);
    } catch (err) {
      console.error(err);
      this.toast.error('Partija nije sačuvana. Proveri internet.');
    } finally {
      this.saving.set(false);
    }
  }
  protected players = () => range(this.game().playersMin, this.game().playersMax);
  protected time = () => range(this.game().timeMin, this.game().timeMax);
  protected weight = () => decimal(this.game().weight);
  /** 8.5 → "8,5", 10 → "10" */
  protected rating = () => decimal(this.game().rating ?? 0, 1).replace(',0', '');
}
