import { COVERS_BUCKET, RULES_BUCKET } from './config';
import { demoGames } from './demo-data';
import { Game, GameInput, GameRow, fromRow, toRow } from './models';
import { supabase } from './supabase';

export interface Backend {
  list(): Promise<Game[]>;
  /** Nova igra: sva polja; izmena: samo promenjena polja */
  save(id: string | null, data: Partial<GameInput>): Promise<Game>;
  remove(game: Game): Promise<void>;
  uploadCover(blob: Blob): Promise<string>;
  uploadRulesPdf(file: File): Promise<string>;
  removeFile(url: string): Promise<void>;
}

export class SupabaseBackend implements Backend {
  private sb = supabase();

  async list(): Promise<Game[]> {
    const { data, error } = await this.sb.from('games').select('*');
    if (error) throw error;
    return (data as GameRow[]).map(fromRow);
  }

  async save(id: string | null, data: Partial<GameInput>): Promise<Game> {
    const row = toRow(data);
    const query = !id
      ? this.sb.from('games').insert(row)
      : Object.keys(row).length
        ? this.sb.from('games').update(row).eq('id', id)
        : this.sb.from('games').select('*').eq('id', id); // ništa nije promenjeno
    const { data: saved, error } = await query.select().single();
    if (error) throw error;
    return fromRow(saved as GameRow);
  }

  async remove(game: Game): Promise<void> {
    const { error } = await this.sb.from('games').delete().eq('id', game.id);
    if (error) throw error;
    if (game.imageUrl) await this.removeFile(game.imageUrl);
    if (game.rulesPdfUrl) await this.removeFile(game.rulesPdfUrl);
  }

  uploadCover(blob: Blob): Promise<string> {
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    return this.upload(COVERS_BUCKET, `${crypto.randomUUID()}.${ext}`, blob);
  }

  uploadRulesPdf(file: File): Promise<string> {
    return this.upload(RULES_BUCKET, `${crypto.randomUUID()}.pdf`, file);
  }

  /** Brisanje fajla iz Storage-a; greške se ignorišu jer je red već obrisan. */
  async removeFile(url: string): Promise<void> {
    const m = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (!m) return;
    await this.sb.storage.from(m[1]).remove([decodeURIComponent(m[2])]);
  }

  private async upload(bucket: string, path: string, body: Blob): Promise<string> {
    const { error } = await this.sb.storage
      .from(bucket)
      .upload(path, body, { contentType: body.type, cacheControl: '31536000' });
    if (error) throw error;
    return this.sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
}

/** Demo: sve u localStorage ovog browsera, slike kao data URL. */
export class DemoBackend implements Backend {
  private key = 'ii-demo-games';

  async list(): Promise<Game[]> {
    return this.read();
  }

  async save(id: string | null, data: Partial<GameInput>): Promise<Game> {
    const games = this.read();
    const existing = id ? games.find((g) => g.id === id) : undefined;
    const game: Game = existing
      ? { ...existing, ...data }
      : { ...(data as GameInput), id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    this.write(existing ? games.map((g) => (g.id === id ? game : g)) : [...games, game]);
    return game;
  }

  async remove(game: Game): Promise<void> {
    this.write(this.read().filter((g) => g.id !== game.id));
  }

  uploadCover(blob: Blob): Promise<string> {
    return toDataUrl(blob);
  }

  uploadRulesPdf(file: File): Promise<string> {
    return toDataUrl(file);
  }

  async removeFile(): Promise<void> {}

  private read(): Game[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw);
    } catch {}
    const seeded = demoGames();
    this.write(seeded);
    return seeded;
  }

  private write(games: Game[]) {
    try {
      localStorage.setItem(this.key, JSON.stringify(games));
    } catch {
      throw new Error('Nema mesta u browseru za demo podatke.');
    }
  }
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
