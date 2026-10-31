import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { filter } from 'rxjs';
import { AuthService } from './core/auth.service';
import { GamesService } from './core/games.service';
import { ToastService } from './core/ui.service';
import { AdminNav } from './shared/header';
import { OfflineBanner, Toasts } from './shared/status';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AdminNav, OfflineBanner, Toasts],
  template: `
    <app-offline-banner />
    <div [class.pb-24]="auth.isAdmin()" class="lg:pb-0">
      <router-outlet />
    </div>
    @if (auth.isAdmin()) {
      <app-admin-nav />
    }
    <app-toasts [admin]="auth.isAdmin()" />
  `,
})
export class App {
  protected auth = inject(AuthService);

  constructor() {
    const games = inject(GamesService);
    games.load();
    // posle povratka interneta osveži podatke
    window.addEventListener('online', () => games.load());
    useAutoUpdate();
  }
}

/**
 * Kad service worker preuzme novu verziju sajta, odmah je prikaži
 * (inače bi se videla tek pri sledećem otvaranju). Na formi ne
 * osvežavamo, da se ne izgube nesačuvane izmene.
 */
function useAutoUpdate() {
  const sw = inject(SwUpdate);
  const router = inject(Router);
  const toast = inject(ToastService);
  if (!sw.isEnabled) return;

  sw.versionUpdates.pipe(filter((e) => e.type === 'VERSION_READY')).subscribe(() => {
    if (/\/(nova|izmena)/.test(router.url)) {
      toast.success('Nova verzija sajta je spremna – osveži stranicu posle čuvanja.');
    } else {
      document.location.reload();
    }
  });
  // proveri da li postoji nova verzija i kad se aplikacija vrati u fokus
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') sw.checkForUpdate().catch(() => {});
  });
}
