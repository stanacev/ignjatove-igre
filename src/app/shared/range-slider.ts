import { Component, ElementRef, computed, input, model, viewChild } from '@angular/core';

/** Skala klizača: pretvara vrednost u poziciju 0–1 i nazad. */
export interface SliderScale {
  toPos(v: number): number;
  /** Pozicija → najbliža dozvoljena vrednost */
  fromPos(p: number): number;
  /** Sledeća vrednost za strelice na tastaturi */
  step(v: number, dir: 1 | -1): number;
  text(v: number): string;
  ticks: string[];
}

/**
 * Klizač sa jednom ili dve ručice (male kockice sa jednom tačkom).
 * Sa jednom ručicom popunjava se od početka; sa dve, između ručica.
 */
@Component({
  selector: 'app-range-slider',
  template: `
    <div
      #track
      class="relative mx-[11px] h-7 touch-none select-none"
      (pointerdown)="onDown($event)"
      (pointermove)="onMove($event)"
      (pointerup)="active = -1"
      (pointercancel)="active = -1"
    >
      <div class="absolute inset-x-0 top-3 h-1 bg-ink-700"></div>
      <div
        class="absolute top-3 h-1 bg-cream-50"
        [style.left.%]="fill()[0] * 100"
        [style.width.%]="(fill()[1] - fill()[0]) * 100"
      ></div>
      @for (v of values(); track $index) {
        <span
          role="slider"
          tabindex="0"
          [attr.aria-label]="labels()[$index]"
          [attr.aria-valuenow]="v"
          [attr.aria-valuetext]="scale().text(v)"
          class="absolute top-1/2 -mt-[11px] -ml-[11px] flex size-[22px] cursor-grab items-center justify-center rounded bg-cream-50 shadow-[0_2px_8px_rgba(0,0,0,.5)] active:cursor-grabbing"
          [style.left.%]="scale().toPos(v) * 100"
          (keydown)="onKey($event, $index)"
        >
          <span class="block size-1.5 rounded-full bg-ink-950"></span>
        </span>
      }
    </div>
    <div class="mt-2.5 flex justify-between font-display text-xs text-slate-400">
      @for (t of scale().ticks; track t) {
        <span>{{ t }}</span>
      }
    </div>
  `,
  host: { class: 'block' },
})
export class RangeSlider {
  readonly values = model.required<number[]>();
  readonly scale = input.required<SliderScale>();
  readonly labels = input.required<string[]>();

  private track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected active = -1;

  protected fill = computed(() => {
    const p = this.values().map((v) => this.scale().toPos(v));
    return p.length === 1 ? [0, p[0]] : [p[0], p[1]];
  });

  protected onDown(e: PointerEvent) {
    const p = this.posFrom(e);
    const pos = this.values().map((v) => this.scale().toPos(v));
    // najbliža ručica; kad se preklapaju, smer odlučuje koja se pomera
    this.active =
      pos.length === 1
        ? 0
        : Math.abs(p - pos[0]) < Math.abs(p - pos[1]) || (pos[0] === pos[1] && p < pos[0])
          ? 0
          : 1;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.setAt(this.active, this.scale().fromPos(p));
    (this.track().nativeElement.querySelectorAll('[role=slider]')[this.active] as HTMLElement)?.focus();
  }

  protected onMove(e: PointerEvent) {
    if (this.active < 0) return;
    this.setAt(this.active, this.scale().fromPos(this.posFrom(e)));
  }

  protected onKey(e: KeyboardEvent, i: number) {
    const v = this.values()[i];
    const s = this.scale();
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowUp'
        ? s.step(v, 1)
        : e.key === 'ArrowLeft' || e.key === 'ArrowDown'
          ? s.step(v, -1)
          : e.key === 'Home'
            ? s.fromPos(0)
            : e.key === 'End'
              ? s.fromPos(1)
              : null;
    if (next === null) return;
    e.preventDefault();
    this.setAt(i, next);
  }

  private posFrom(e: PointerEvent): number {
    const r = this.track().nativeElement.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  }

  private setAt(i: number, v: number) {
    const vals = [...this.values()];
    if (vals.length === 2) v = i === 0 ? Math.min(v, vals[1]) : Math.max(v, vals[0]);
    if (vals[i] === v) return;
    vals[i] = v;
    this.values.set(vals);
  }
}
