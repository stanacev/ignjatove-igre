import { Injectable, signal } from '@angular/core';
import { IS_DEMO } from './config';
import { supabase } from './supabase';

export const GROUP_NAMES = ['Vrsta igre', 'Tema', 'Mehanika'] as const;
export type GroupName = (typeof GROUP_NAMES)[number];

export interface TagGroup {
  name: string;
  tags: string[];
}

/**
 * Početne grupe – koriste se dok se grupe iz baze (tabela tag_groups) ne učitaju,
 * ili ako ta tabela još ne postoji.
 */
const DEFAULT_GROUPS: Record<GroupName, string[]> = {
  'Vrsta igre': ['Party', 'Kooperativna', 'Kartaška igra', 'Asocijacije', 'Blefiranje', 'Skrivene uloge', 'Dedukcija', 'Pamćenje'],
  Tema: ['Životinje i priroda', 'Svemir', 'Farma', 'Gradnja', 'Politika', 'Istorija i mitologija'],
  Mehanika: [
    'Draftovanje',
    'Postavljanje pločica',
    'Menadžment ruku',
    'Sakupljanje setova',
    'Postavljanje radnika',
    'Deck building',
    'Engine building',
    'Bag building',
    'Kontrola teritorije',
    'Kockice i sreća',
    'Trgovina i pregovaranje',
    'Aukcija',
    'Kretanje po tabli',
    'Promenljiva postavka',
    'Asimetrične moći',
    'Eliminacija',
  ],
};

const CACHE_KEY = 'ii-tag-groups';

function defaults(): Record<string, GroupName> {
  const map: Record<string, GroupName> = {};
  for (const g of GROUP_NAMES) for (const t of DEFAULT_GROUPS[g]) map[t] = g;
  return map;
}

/** U koju grupu spada koji tag (Vrsta igre / Tema / Mehanika). */
@Injectable({ providedIn: 'root' })
export class TagGroupsService {
  /** tag → grupa */
  readonly map = signal<Record<string, GroupName>>(readCache() ?? defaults());

  constructor() {
    this.load();
  }

  groupOf(tag: string): GroupName | undefined {
    return this.map()[tag];
  }

  /**
   * Tagovi po grupama, redom kao u DEFAULT_GROUPS, pa novi abecedno.
   * Tagovi bez grupe idu u "Ostalo". `onlyUsed` ostavlja samo tagove koji postoje u igrama.
   */
  grouped(usedTags: string[], onlyUsed: boolean): TagGroup[] {
    const map = this.map();
    const used = new Set(usedTags);
    const order = (g: GroupName, tags: string[]) => {
      const known = DEFAULT_GROUPS[g];
      return tags.sort((a, b) => {
        const ia = known.indexOf(a);
        const ib = known.indexOf(b);
        if (ia >= 0 || ib >= 0) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
        return a.localeCompare(b, 'sr');
      });
    };
    const groups: TagGroup[] = GROUP_NAMES.map((g) => ({
      name: g,
      tags: order(
        g,
        Object.keys(map).filter((t) => map[t] === g && (!onlyUsed || used.has(t))),
      ),
    }));
    const rest = usedTags.filter((t) => !map[t]).sort((a, b) => a.localeCompare(b, 'sr'));
    if (rest.length) groups.push({ name: 'Ostalo', tags: rest });
    return groups.filter((g) => g.tags.length);
  }

  /** Svrstava tag u grupu (čuva se u bazi). */
  async setGroup(tag: string, group: GroupName): Promise<void> {
    this.update({ ...this.map(), [tag]: group });
    if (IS_DEMO) return;
    const { error } = await supabase().from('tag_groups').upsert({ tag, grp: group });
    if (error) throw error;
  }

  private async load() {
    if (IS_DEMO) return;
    const { data, error } = await supabase().from('tag_groups').select('tag, grp');
    if (error || !data?.length) return; // tabela još ne postoji – ostaju početne grupe
    const map: Record<string, GroupName> = {};
    for (const r of data as { tag: string; grp: GroupName }[]) map[r.tag] = r.grp;
    this.update(map);
  }

  private update(map: Record<string, GroupName>) {
    this.map.set(map);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(map));
    } catch {}
  }
}

function readCache(): Record<string, GroupName> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
