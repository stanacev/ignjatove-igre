export interface Game {
  id: string;
  createdAt: string;
  name: string;
  /** null dok Ignjat ne doda fotografiju */
  imageUrl: string | null;
  playersMin: number;
  playersMax: number;
  timeMin: number;
  timeMax: number | null;
  /** Težina sa Mipl-a, 1.00–5.00 */
  weight: number;
  description: string | null;
  youtubeUrl: string | null;
  /** Pravila u Markdown formatu */
  rules: string | null;
  rulesPdfUrl: string | null;
  tags: string[];
  language: string | null;
  /** Ignjatova ocena, 0–10 */
  rating: number | null;
  plays: number | null;
}

export type GameInput = Omit<Game, 'id' | 'createdAt'>;

/** Red u Supabase tabeli `games` */
export interface GameRow {
  id: string;
  created_at: string;
  name: string;
  image_url: string | null;
  players_min: number;
  players_max: number;
  time_min: number;
  time_max: number | null;
  weight: number;
  description: string | null;
  youtube_url: string | null;
  rules: string | null;
  rules_pdf_url: string | null;
  tags: string[] | null;
  language: string | null;
  rating: number | null;
  plays: number | null;
}

export function fromRow(r: GameRow): Game {
  return {
    id: r.id,
    createdAt: r.created_at,
    name: r.name,
    imageUrl: r.image_url,
    playersMin: r.players_min,
    playersMax: r.players_max,
    timeMin: r.time_min,
    timeMax: r.time_max,
    weight: Number(r.weight),
    description: r.description,
    youtubeUrl: r.youtube_url,
    rules: r.rules,
    rulesPdfUrl: r.rules_pdf_url,
    tags: r.tags ?? [],
    language: r.language,
    rating: r.rating === null ? null : Number(r.rating),
    plays: r.plays,
  };
}

const COLUMNS: Record<keyof GameInput, keyof GameRow> = {
  name: 'name',
  imageUrl: 'image_url',
  playersMin: 'players_min',
  playersMax: 'players_max',
  timeMin: 'time_min',
  timeMax: 'time_max',
  weight: 'weight',
  description: 'description',
  youtubeUrl: 'youtube_url',
  rules: 'rules',
  rulesPdfUrl: 'rules_pdf_url',
  tags: 'tags',
  language: 'language',
  rating: 'rating',
  plays: 'plays',
};

/** Samo prosleđena polja → kolone (za izmenu šaljemo samo ono što se promenilo). */
export function toRow(g: Partial<GameInput>): Partial<GameRow> {
  const row: Record<string, unknown> = {};
  for (const [key, col] of Object.entries(COLUMNS)) {
    if (key in g) row[col] = g[key as keyof GameInput];
  }
  return row as Partial<GameRow>;
}
