import { Component, ElementRef, OnDestroy, OnInit, inject, input, output } from '@angular/core';

/**
 * Zatamnjena pozadina + dijalog. `sheet` izlazi odozdo (telefon),
 * `dialog` je centriran. Esc i klik na pozadinu zatvaraju.
 */
@Component({
  selector: 'app-modal',
  template: `
    <div class="fixed inset-0 z-40 bg-ink-950/72 animate-[fade_.15s_ease-out]" (click)="close.emit()"></div>
    <div
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="labelledBy()"
      tabindex="-1"
      class="fixed z-50 flex flex-col border-ink-700 bg-ink-900 shadow-sheet outline-none"
      [class]="
        variant() === 'sheet'
          ? 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-lg border-t animate-[sheet_.22s_cubic-bezier(.2,.8,.2,1)]'
          : 'top-1/2 left-1/2 w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-lg border animate-[fade_.15s_ease-out]'
      "
      (keydown.escape)="close.emit()"
    >
      <ng-content />
    </div>
  `,
})
export class Modal implements OnInit, OnDestroy {
  readonly variant = input<'sheet' | 'dialog'>('dialog');
  readonly labelledBy = input<string>();
  readonly close = output();

  private el = inject(ElementRef<HTMLElement>);
  private previousFocus: Element | null = null;

  ngOnInit() {
    this.previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => this.el.nativeElement.querySelector('[role=dialog]')?.focus());
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    (this.previousFocus as HTMLElement | null)?.focus?.();
  }
}
