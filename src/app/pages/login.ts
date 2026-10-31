import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IS_DEMO } from '../core/config';
import { ToastService } from '../core/ui.service';
import { Header } from '../shared/header';
import { Icon } from '../shared/icon';
import { Logo } from '../shared/logo';

@Component({
  selector: 'app-login',
  imports: [Header, Icon, Logo],
  template: `
    <app-header />
    <main class="flex justify-center px-4 pt-10 pb-16 lg:pt-20">
      <form class="flex w-full max-w-[380px] flex-col gap-5" (submit)="submit($event)" novalidate>
        <div class="flex flex-col items-center gap-3 pb-2 text-center">
          <app-logo [size]="56" />
          <h1 class="m-0 font-display text-[30px] font-normal">Prijava</h1>
          <p class="m-0 text-[15px] text-cream-300">Samo za Ignjata – dodavanje i izmena igara.</p>
        </div>

        @if (error()) {
          <div role="alert" class="flex items-start gap-2.5 rounded border border-danger-600 bg-danger-600/15 px-3.5 py-3 text-[14px] font-bold text-danger-300">
            <app-icon name="alert" [size]="18" class="mt-px" />{{ error() }}
          </div>
        }

        <div class="flex flex-col gap-2">
          <label for="user" class="field-label">Korisničko ime</label>
          <input
            id="user"
            class="inp"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            [attr.aria-invalid]="!!error()"
            [value]="username()"
            (input)="username.set($any($event.target).value)"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="pass" class="field-label">Šifra</label>
          <div class="relative">
            <input
              id="pass"
              class="inp pr-12"
              autocomplete="current-password"
              [type]="showPass() ? 'text' : 'password'"
              [attr.aria-invalid]="!!error()"
              [value]="password()"
              (input)="password.set($any($event.target).value)"
            />
            <button
              type="button"
              class="absolute top-0 right-0 flex size-11 items-center justify-center text-slate-400 hover:text-cream-50"
              [attr.aria-label]="showPass() ? 'Sakrij šifru' : 'Prikaži šifru'"
              [attr.aria-pressed]="showPass()"
              (click)="showPass.set(!showPass())"
            >
              <app-icon name="eye" [size]="20" />
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-p mt-1 h-12" [disabled]="busy()">
          {{ busy() ? 'Prijavljivanje…' : 'Prijavi se' }}
        </button>

        @if (demo) {
          <p class="m-0 text-center text-[13px] text-slate-400">
            Demo režim: Supabase još nije povezan, pa radi bilo koje ime i šifra.
          </p>
        }
      </form>
    </main>
  `,
})
export class Login {
  /** Gde se vraća posle prijave (?nazad=/tocak) */
  readonly nazad = input<string>();

  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected demo = IS_DEMO;
  protected username = signal('');
  protected password = signal('');
  protected showPass = signal(false);
  protected busy = signal(false);
  protected error = signal('');

  protected async submit(e: Event) {
    e.preventDefault();
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.signIn(this.username(), this.password());
      this.toast.success('Zdravo, Ignjate!');
      this.router.navigateByUrl(this.nazad() || '/');
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.busy.set(false);
    }
  }
}
