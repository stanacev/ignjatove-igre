import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_EMAIL_DOMAIN, IS_DEMO } from './config';
import { supabase } from './supabase';

const DEMO_KEY = 'ii-demo-admin';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAdmin = signal(false);
  readonly ready: Promise<void>;

  constructor() {
    if (IS_DEMO) {
      this.isAdmin.set(localStorage.getItem(DEMO_KEY) === '1');
      this.ready = Promise.resolve();
      return;
    }
    const sb = supabase();
    this.ready = sb.auth.getSession().then(({ data }) => this.isAdmin.set(!!data.session));
    sb.auth.onAuthStateChange((_, session) => this.isAdmin.set(!!session));
  }

  async signIn(username: string, password: string): Promise<void> {
    const name = username.trim().toLowerCase();
    if (!name || !password) throw new Error('Unesi korisničko ime i šifru.');
    if (IS_DEMO) {
      localStorage.setItem(DEMO_KEY, '1');
      this.isAdmin.set(true);
      return;
    }
    const { error } = await supabase().auth.signInWithPassword({
      email: `${name}@${AUTH_EMAIL_DOMAIN}`,
      password,
    });
    if (error) {
      throw new Error(
        error.status === 400 ? 'Pogrešno korisničko ime ili šifra.' : 'Prijava nije uspela. Proveri internet.',
      );
    }
  }

  async signOut(): Promise<void> {
    if (IS_DEMO) localStorage.removeItem(DEMO_KEY);
    else await supabase().auth.signOut();
    this.isAdmin.set(false);
  }
}

export const adminGuard: CanActivateFn = async (_, state) => {
  const auth = inject(AuthService);
  await auth.ready;
  return auth.isAdmin() || inject(Router).createUrlTree(['/prijava'], { queryParams: { nazad: state.url } });
};
