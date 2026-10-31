import { Game } from './models';

/** Jednostavne "kutije" kao SVG, da demo ne zavisi od tuđih slika. */
function cover(bg: string, fg: string, accent: string, pattern: 'hex' | 'stripes' | 'rings' | 'dots' | 'tri'): string {
  const patterns = {
    hex: `<g fill="none" stroke="${accent}" stroke-width="3">${Array.from({ length: 20 }, (_, i) => {
      const x = 40 + (i % 5) * 52 + (Math.floor(i / 5) % 2) * 26;
      const y = 130 + Math.floor(i / 5) * 44;
      return `<polygon points="${x},${y - 26} ${x + 22},${y - 13} ${x + 22},${y + 13} ${x},${y + 26} ${x - 22},${y + 13} ${x - 22},${y - 13}"/>`;
    }).join('')}</g>`,
    stripes: `<g fill="${accent}">${Array.from({ length: 10 }, (_, i) => `<polygon points="${i * 40 - 60},330 ${i * 40 - 40},330 ${i * 40 + 100},110 ${i * 40 + 80},110"/>`).join('')}</g>`,
    rings: `<g fill="none" stroke="${accent}" stroke-width="16">${[90, 60, 30].map((r) => `<circle cx="160" cy="220" r="${r}"/>`).join('')}</g>`,
    dots: `<g fill="${accent}">${Array.from({ length: 24 }, (_, i) => `<circle cx="${50 + (i % 6) * 44}" cy="${135 + Math.floor(i / 6) * 48}" r="12"/>`).join('')}</g>`,
    tri: `<g fill="${accent}"><polygon points="50,320 100,150 150,320"/><polygon points="130,320 180,170 230,320"/><polygon points="210,320 260,140 300,320"/></g>`,
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 340"><rect width="320" height="340" fill="#f4efe4"/><rect x="20" y="30" width="280" height="290" fill="${bg}"/><clipPath id="c"><rect x="20" y="30" width="280" height="290"/></clipPath><g clip-path="url(#c)">${patterns[pattern]}</g><rect x="50" y="52" width="220" height="30" fill="${fg}"/><rect x="58" y="60" width="204" height="14" fill="${bg}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const day = (n: number) => new Date(Date.UTC(2026, 9, 1 + n)).toISOString();

export function demoGames(): Game[] {
  const base = {
    youtubeUrl: null,
    rules: null,
    rulesPdfUrl: null,
    language: null,
    rating: null,
    plays: null,
    description: null,
    timeMax: null,
    tags: [] as string[],
  };
  return [
    {
      ...base,
      id: 'demo-catan',
      createdAt: day(0),
      name: 'Catan',
      imageUrl: cover('#b8322b', '#f4efe4', '#e8a33a', 'hex'),
      playersMin: 3,
      playersMax: 4,
      timeMin: 60,
      timeMax: 120,
      weight: 2.29,
      tags: ['Strategija', 'Trgovina', 'Porodična'],
      language: 'Srpski',
      rating: 8.5,
      plays: 23,
      description:
        'Naseljavate ostrvo Katan: gradite naselja, puteve i gradove, a sirovine dobijate bacanjem kockica. Drvo, cigla, žito, vuna i ruda – nikad ih nema dovoljno, pa se trguje za stolom.\n\nPrvi igrač sa 10 poena pobeđuje. Igra je odlična za porodično veče i kao prva „ozbiljnija“ igra za društvo.',
      rules:
        '### Priprema\n1. Složite ostrvo od 19 heksagonalnih pločica.\n2. Na polja postavite brojeve 2–12.\n3. Svako postavlja 2 naselja i 2 puta.\n\n### Tok poteza\n- **Baci** kockice – sva polja sa tim brojem daju sirovine.\n- **Trguj** sa igračima ili bankom (4:1).\n- **Gradi** puteve, naselja, gradove ili kupi kartu razvoja.\n\n### Kraj igre\nPobeđuje prvi igrač koji na svom potezu ima 10 pobedničkih poena.',
    },
    { ...base, id: 'demo-wingspan', createdAt: day(1), name: 'Wingspan', imageUrl: cover('#5b2d8e', '#f4efe4', '#f0b43c', 'tri'), playersMin: 1, playersMax: 5, timeMin: 40, timeMax: 70, weight: 2.45, tags: ['Strategija', 'Karte'] },
    { ...base, id: 'demo-azul', createdAt: day(2), name: 'Azul', imageUrl: cover('#1d5fa8', '#f4efe4', '#f2c14e', 'dots'), playersMin: 2, playersMax: 4, timeMin: 30, timeMax: 45, weight: 1.76, tags: ['Apstraktna', 'Porodična'] },
    { ...base, id: 'demo-tm', createdAt: day(3), name: 'Terraforming Mars', imageUrl: cover('#a8481f', '#f4efe4', '#e07a3c', 'rings'), playersMin: 1, playersMax: 5, timeMin: 120, weight: 3.26, tags: ['Strategija', 'Ekonomija'] },
    { ...base, id: 'demo-codenames', createdAt: day(4), name: 'Codenames', imageUrl: cover('#2b2b2b', '#f4efe4', '#d9b13b', 'stripes'), playersMin: 4, playersMax: 8, timeMin: 15, weight: 1.27, tags: ['Party', 'Timska'], language: 'Srpski' },
    { ...base, id: 'demo-ttr', createdAt: day(5), name: 'Ticket to Ride', imageUrl: cover('#2f6b3a', '#f4efe4', '#c9a54a', 'stripes'), playersMin: 2, playersMax: 5, timeMin: 30, timeMax: 60, weight: 1.83, tags: ['Porodična'] },
    { ...base, id: 'demo-carcassonne', createdAt: day(6), name: 'Carcassonne', imageUrl: cover('#3d6e9e', '#f4efe4', '#9cc06a', 'dots'), playersMin: 2, playersMax: 5, timeMin: 30, timeMax: 45, weight: 1.9, tags: ['Porodična'] },
    { ...base, id: 'demo-pandemic', createdAt: day(7), name: 'Pandemic', imageUrl: cover('#14506b', '#f4efe4', '#d6453a', 'rings'), playersMin: 2, playersMax: 4, timeMin: 45, weight: 2.4, tags: ['Kooperativna'] },
    { ...base, id: 'demo-splendor', createdAt: day(8), name: 'Splendor', imageUrl: cover('#24324f', '#f4efe4', '#c43c6b', 'tri'), playersMin: 2, playersMax: 4, timeMin: 30, weight: 1.79, tags: ['Karte', 'Ekonomija'] },
    { ...base, id: 'demo-7w', createdAt: day(9), name: '7 Wonders', imageUrl: cover('#8a6a2b', '#f4efe4', '#e8d18a', 'tri'), playersMin: 3, playersMax: 7, timeMin: 30, weight: 2.32, tags: ['Draft', 'Karte'] },
    { ...base, id: 'demo-crew', createdAt: day(10), name: 'The Crew', imageUrl: cover('#101a3a', '#f4efe4', '#7fb3e0', 'dots'), playersMin: 2, playersMax: 5, timeMin: 20, weight: 1.98, tags: ['Kooperativna', 'Karte'] },
    { ...base, id: 'demo-agricola', createdAt: day(11), name: 'Agricola', imageUrl: cover('#6d8a2d', '#f4efe4', '#d9a441', 'stripes'), playersMin: 1, playersMax: 4, timeMin: 30, timeMax: 150, weight: 3.64, tags: ['Strategija'] },
    { ...base, id: 'demo-brass', createdAt: day(12), name: 'Brass: Birmingham', imageUrl: cover('#3a2a1f', '#f4efe4', '#c98a3a', 'hex'), playersMin: 2, playersMax: 4, timeMin: 60, timeMax: 120, weight: 3.86, tags: ['Strategija', 'Ekonomija'] },
    { ...base, id: 'demo-twilight', createdAt: day(13), name: 'Twilight Imperium', imageUrl: cover('#0b0b1e', '#f4efe4', '#9a7bd6', 'rings'), playersMin: 3, playersMax: 6, timeMin: 240, timeMax: 480, weight: 4.32, tags: ['Strategija'] },
    { ...base, id: 'demo-werewolf', createdAt: day(14), name: 'Vukodlaci', imageUrl: cover('#4b1d1d', '#f4efe4', '#c9c2b0', 'tri'), playersMin: 8, playersMax: 18, timeMin: 30, weight: 1.35, tags: ['Party'] },
  ];
}
