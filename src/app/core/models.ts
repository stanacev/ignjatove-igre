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

export function toRow(g: GameInput): Omit<GameRow, 'id' | 'created_at'> {
  return {
    name: g.name,
    image_url: g.imageUrl,
    players_min: g.playersMin,
    players_max: g.playersMax,
    time_min: g.timeMin,
    time_max: g.timeMax,
    weight: g.weight,
    description: g.description,
    youtube_url: g.youtubeUrl,
    rules: g.rules,
    rules_pdf_url: g.rulesPdfUrl,
    tags: g.tags,
    language: g.language,
    rating: g.rating,
    plays: g.plays,
  };
}
