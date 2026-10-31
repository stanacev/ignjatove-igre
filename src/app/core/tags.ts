/**
 * Grupe tagova u filteru. Tagovi koji ovde ne postoje (npr. novi koje Ignjat doda)
 * prikazuju se u grupi "Ostalo".
 */
export interface TagGroup {
  name: string;
  tags: string[];
  /** Grupa je otvorena čim se otvori filter po tagovima */
  open: boolean;
}

export const TAG_GROUPS: TagGroup[] = [
  {
    name: 'Vrsta igre',
    open: true,
    tags: ['Party', 'Kooperativna', 'Kartaška igra', 'Asocijacije', 'Blefiranje', 'Skrivene uloge', 'Dedukcija', 'Pamćenje'],
  },
  {
    name: 'Tema',
    open: true,
    tags: ['Životinje i priroda', 'Svemir', 'Farma', 'Gradnja', 'Politika', 'Istorija i mitologija'],
  },
  {
    name: 'Mehanika',
    open: true,
    tags: [
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
  },
];
