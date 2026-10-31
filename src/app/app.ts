import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { GamesService } from './core/games.service';
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
  }
}
