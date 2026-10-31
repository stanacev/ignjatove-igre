import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/ui.service';
import { Icon } from './icon';
import { Logo } from './logo';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon, Logo],
  template: `
    <header class="pips sticky top-0 z-30 border-b border-ink-700 bg-ink-950 pt-[env(safe-area-inset-top)]">
      <div class="mx-auto flex h-[60px] max-w-[1360px] items-center justify-between gap-3 px-4 lg:h-[72px] lg:px-10">
        <a routerLink="/" class="flex items-center gap-2.5 no-underline lg:gap-3.5" aria-label="Ignjatove igre – katalog">
          <app-logo class="size-[30px] lg:size-[38px]" />
          <span class="font-display text-[17px] tracking-[0.08em] whitespace-nowrap text-cream-50 uppercase lg:text-[22px]">
            Ignjatove igre
          </span>
        </a>

        @if (auth.isAdmin()) {
          <span class="tag h-7 !px-2 text-[11px] font-extrabold tracking-[0.08em] lg:hidden">Admin</span>
          <nav class="hidden items-center gap-2 lg:flex" aria-label="Admin">
            <a
              routerLink="/"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="!border-cream-50 !text-cream-50"
              class="flex h-11 items-center border-b-2 border-transparent px-3 text-[15px] font-bold text-cream-300 no-underline hover:text-cream-50"
              >Katalog</a
            >
            <a
              routerLink="/tocak"
              routerLinkActive="!border-cream-50 !text-cream-50"
              class="flex h-11 items-center border-b-2 border-transparent px-3 text-[15px] font-bold text-cream-300 no-underline hover:text-cream-50"
              >Točak sreće</a
            >
            <a routerLink="/nova" class="btn btn-p ml-2 h-10"><app-icon name="plus" [size]="18" />Dodaj igru</a>
            <span class="mx-1.5 block h-6 w-px bg-ink-700"></span>
            <button type="button" class="btn btn-g h-10 px-2.5 text-sm" (click)="logout()">
              <app-icon name="logout" [size]="18" />Odjavi se
            </button>
          </nav>
        } @else {
          <nav class="flex items-center gap-1 lg:gap-2" aria-label="Glavna">
            <a
              routerLink="/"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="!border-cream-50 !text-cream-50"
              class="hidden h-11 items-center border-b-2 border-transparent px-3 text-[15px] font-bold text-cream-300 no-underline hover:text-cream-50 lg:flex"
              >Katalog</a
            >
            <a
              routerLink="/tocak"
              routerLinkActive="!border-cream-50 !text-cream-50"
              class="flex h-11 items-center gap-2 border-b-2 border-transparent px-2 text-[15px] font-bold text-cream-300 no-underline hover:text-cream-50 lg:px-3"
              aria-label="Točak sreće"
            >
              <app-icon name="wheel" [size]="22" class="lg:hidden" /><span class="hidden lg:inline">Točak sreće</span>
            </a>
            <a routerLink="/prijava" class="btn btn-g -mr-2.5 size-11 !px-0 text-slate-400" aria-label="Prijava (admin)">
              <app-icon name="key" />
            </a>
          </nav>
        }
      </div>
    </header>
  `,
  host: { class: 'contents' },
})
export class Header {
  protected auth = inject(AuthService);
  protected logout = useLogout();
}

function useLogout() {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  return async () => {
    await auth.signOut();
    toast.success('Odjavljen si');
    router.navigateByUrl('/');
  };
}

/** Donja navigacija za admina na telefonu. */
@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <nav
      aria-label="Admin navigacija"
      class="fixed inset-x-0 bottom-0 z-30 flex border-t border-ink-700 bg-ink-900 pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden"
    >
      @for (item of items; track item.label) {
        <a
          [routerLink]="item.link"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          #rla="routerLinkActive"
          [attr.aria-current]="rla.isActive ? 'page' : null"
          class="relative flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold tracking-[0.04em] text-slate-400 uppercase no-underline [&.active]:text-cream-50"
        >
          <span class="absolute inset-x-[30%] top-0 block h-0.5" [class.bg-cream-50]="rla.isActive"></span>
          <app-icon [name]="item.icon" [size]="22" />{{ item.label }}
        </a>
      }
      <button
        type="button"
        class="flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-bold tracking-[0.04em] text-slate-400 uppercase"
        (click)="logout()"
      >
        <app-icon name="logout" [size]="22" />Odjava
      </button>
    </nav>
  `,
})
export class AdminNav {
  protected logout = useLogout();
  protected items = [
    { link: '/', label: 'Katalog', icon: 'grid' as const },
    { link: '/tocak', label: 'Točak', icon: 'wheel' as const },
    { link: '/nova', label: 'Dodaj', icon: 'plus' as const },
  ];
}
