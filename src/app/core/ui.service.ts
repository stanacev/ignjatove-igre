import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  kind: 'success' | 'error';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  success(text: string) {
    this.show('success', text);
  }

  error(text: string) {
    this.show('error', text);
  }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }

  private show(kind: Toast['kind'], text: string) {
    const id = this.nextId++;
    this.toasts.update((t) => [...t, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), kind === 'error' ? 6000 : 3500);
  }
}

@Injectable({ providedIn: 'root' })
export class OnlineService {
  readonly online = signal(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));
  }
}

/** Desktop raspored (lg breakpoint u Tailwind-u) */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private mq = window.matchMedia('(min-width: 1024px)');
  readonly desktop = signal(this.mq.matches);

  constructor() {
    this.mq.addEventListener('change', (e) => this.desktop.set(e.matches));
  }
}
