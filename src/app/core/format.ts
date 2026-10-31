/** Granice oznaka težine (gornja granica nije uključena). */
const WEIGHT_LEVELS: { below: number; label: string }[] = [
  { below: 1.8, label: 'Lako' },
  { below: 2.6, label: 'Srednje lako' },
  { below: 3.4, label: 'Srednje' },
  { below: 4.2, label: 'Srednje teško' },
  { below: Infinity, label: 'Teško' },
];

export function weightLabel(weight: number): string {
  return WEIGHT_LEVELS.find((l) => weight < l.below)!.label;
}

/** Decimale sa zarezom: 2.35 → "2,35" */
export function decimal(n: number, digits = 2): string {
  return n.toFixed(digits).replace('.', ',');
}

/** Raspon sa crticom: (2, 4) → "2–4", (3, 3) → "3" */
export function range(a: number, b: number | null): string {
  return b === null || b === a ? `${a}` : `${a}–${b}`;
}

/** Srpska množina: plural(n, 'igra', 'igre', 'igara') */
export function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export function gamesCount(n: number): string {
  return `${n} ${plural(n, 'igra', 'igre', 'igara')}`;
}

export function playsText(n: number): string {
  return `${n} ${plural(n, 'partija', 'partije', 'partija')}`;
}
