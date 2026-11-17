import { ChordDegree, KeySignature, ScaleMode } from './music-theory';

/**
 * Song library: chord progressions only (titles, artists and harmony; no lyrics).
 * Every chord is expressed as a scale degree of the song key, so it can be played
 * with the left-hand gestures. `chord` is the lead-sheet symbol and is verified by
 * unit tests against the app's own harmony engine.
 */
export interface SongChord {
  degree: ChordDegree;
  major: boolean;
  /** Right-hand voicing (1 root, 2 first inversion, 3 seventh, 4 dom7/dim7). Default 1. */
  voicing?: 1 | 2 | 3 | 4;
  chord: string;
}

export interface SongSection {
  name: string;
  chords: SongChord[];
}

export type SongLevel = 'Facile' | 'Intermedio';

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: KeySignature;
  mode: ScaleMode;
  /** Approximate tempo used by the "Ascolta" preview (one chord per bar, 4/4). */
  bpm: number;
  level: SongLevel;
  genre: string;
  sections: SongSection[];
  note?: string;
}

const M = (degree: ChordDegree, chord: string, voicing?: 1 | 2 | 3 | 4): SongChord => ({
  degree,
  major: true,
  chord,
  ...(voicing ? { voicing } : {}),
});
const m = (degree: ChordDegree, chord: string, voicing?: 1 | 2 | 3 | 4): SongChord => ({
  degree,
  major: false,
  chord,
  ...(voicing ? { voicing } : {}),
});

export const SONGS: Song[] = [
  {
    id: 'creep',
    title: 'Creep',
    artist: 'Radiohead',
    key: 'G',
    mode: 'major',
    bpm: 92,
    level: 'Intermedio',
    genre: 'Rock',
    note: 'Il passaggio da Do maggiore a Do minore (stesso grado, inclinazione opposta) è il cuore del brano.',
    sections: [
      {
        name: 'Strofa e ritornello',
        chords: [M('I', 'G'), M('III', 'B'), M('IV', 'C'), m('IV', 'Cm')],
      },
    ],
  },
  {
    id: 'let-it-be',
    title: 'Let It Be',
    artist: 'The Beatles',
    key: 'C',
    mode: 'major',
    bpm: 72,
    level: 'Facile',
    genre: 'Pop',
    sections: [
      { name: 'Strofa', chords: [M('I', 'C'), M('V', 'G'), m('VI', 'Am'), M('IV', 'F')] },
      { name: 'Chiusura', chords: [M('I', 'C'), M('V', 'G'), M('IV', 'F'), M('I', 'C')] },
    ],
  },
  {
    id: 'knockin',
    title: "Knockin' on Heaven's Door",
    artist: 'Bob Dylan',
    key: 'G',
    mode: 'major',
    bpm: 69,
    level: 'Facile',
    genre: 'Folk rock',
    sections: [
      {
        name: 'Giro completo',
        chords: [M('I', 'G'), M('V', 'D'), m('II', 'Am'), M('I', 'G'), M('V', 'D'), M('IV', 'C')],
      },
    ],
  },
  {
    id: 'stand-by-me',
    title: 'Stand By Me',
    artist: 'Ben E. King',
    key: 'A',
    mode: 'major',
    bpm: 118,
    level: 'Facile',
    genre: 'Soul',
    sections: [
      { name: 'Giro', chords: [M('I', 'A'), m('VI', 'F#m'), M('IV', 'D'), M('V', 'E'), M('I', 'A')] },
    ],
  },
  {
    id: 'no-woman-no-cry',
    title: 'No Woman, No Cry',
    artist: 'Bob Marley',
    key: 'C',
    mode: 'major',
    bpm: 78,
    level: 'Facile',
    genre: 'Reggae',
    sections: [{ name: 'Giro', chords: [M('I', 'C'), M('V', 'G'), m('VI', 'Am'), M('IV', 'F')] }],
  },
  {
    id: 'someone-like-you',
    title: 'Someone Like You',
    artist: 'Adele',
    key: 'A',
    mode: 'major',
    bpm: 67,
    level: 'Facile',
    genre: 'Pop',
    sections: [{ name: 'Strofa', chords: [M('I', 'A'), M('V', 'E'), m('VI', 'F#m'), M('IV', 'D')] }],
  },
  {
    id: 'zombie',
    title: 'Zombie',
    artist: 'The Cranberries',
    key: 'G',
    mode: 'major',
    bpm: 84,
    level: 'Facile',
    genre: 'Rock',
    note: 'Versione semplificata con triadi.',
    sections: [{ name: 'Giro', chords: [m('VI', 'Em'), M('IV', 'C'), M('I', 'G'), M('V', 'D')] }],
  },
  {
    id: 'wonderwall',
    title: 'Wonderwall',
    artist: 'Oasis',
    key: 'G',
    mode: 'major',
    bpm: 87,
    level: 'Intermedio',
    genre: 'Britpop',
    note: 'Versione semplificata senza capotasto. Il La maggiore è il II grado con inclinazione maggiore.',
    sections: [{ name: 'Strofa', chords: [m('VI', 'Em'), M('I', 'G'), M('V', 'D'), M('II', 'A')] }],
  },
  {
    id: 'hotel-california',
    title: 'Hotel California',
    artist: 'Eagles',
    key: 'B',
    mode: 'minor',
    bpm: 74,
    level: 'Intermedio',
    genre: 'Rock',
    note: 'In Si minore: il V grado (Fa diesis) si suona maggiore, come nella scala minore armonica.',
    sections: [
      {
        name: 'Strofa',
        chords: [
          m('I', 'Bm'),
          M('V', 'F#'),
          M('VII', 'A'),
          M('IV', 'E'),
          M('VI', 'G'),
          M('III', 'D'),
          m('IV', 'Em'),
          M('V', 'F#'),
        ],
      },
    ],
  },
  {
    id: 'despacito',
    title: 'Despacito',
    artist: 'Luis Fonsi',
    key: 'D',
    mode: 'major',
    bpm: 89,
    level: 'Facile',
    genre: 'Latin pop',
    sections: [{ name: 'Giro', chords: [m('VI', 'Bm'), M('IV', 'G'), M('I', 'D'), M('V', 'A')] }],
  },
  {
    id: 'get-lucky',
    title: 'Get Lucky',
    artist: 'Daft Punk',
    key: 'D',
    mode: 'major',
    bpm: 116,
    level: 'Intermedio',
    genre: 'Funk',
    sections: [{ name: 'Giro', chords: [m('VI', 'Bm'), M('I', 'D'), m('III', 'F#m'), M('II', 'E')] }],
  },
  {
    id: 'sweet-home-alabama',
    title: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    key: 'D',
    mode: 'mixolydian',
    bpm: 98,
    level: 'Facile',
    genre: 'Southern rock',
    note: 'Scala misolidia: il VII grado (Do) è naturale e maggiore.',
    sections: [{ name: 'Riff', chords: [M('I', 'D'), M('VII', 'C'), M('IV', 'G')] }],
  },
  {
    id: 'dont-stop-believin',
    title: "Don't Stop Believin'",
    artist: 'Journey',
    key: 'E',
    mode: 'major',
    bpm: 119,
    level: 'Intermedio',
    genre: 'Rock',
    sections: [
      {
        name: 'Strofa',
        chords: [
          M('I', 'E'),
          M('V', 'B'),
          m('VI', 'C#m'),
          M('IV', 'A'),
          M('I', 'E'),
          M('V', 'B'),
          m('III', 'G#m'),
          M('IV', 'A'),
        ],
      },
    ],
  },
  {
    id: 'riptide',
    title: 'Riptide',
    artist: 'Vance Joy',
    key: 'C',
    mode: 'major',
    bpm: 101,
    level: 'Facile',
    genre: 'Indie folk',
    sections: [{ name: 'Giro', chords: [m('VI', 'Am'), M('V', 'G'), M('I', 'C')] }],
  },
  {
    id: 'perfect',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    key: 'Ab',
    mode: 'major',
    bpm: 63,
    level: 'Facile',
    genre: 'Pop',
    note: 'Nella tonalità del disco (La bemolle). Alla chitarra si suona in Sol con capotasto al primo tasto.',
    sections: [{ name: 'Strofa', chords: [M('I', 'Ab'), m('VI', 'Fm'), M('IV', 'Db'), M('V', 'Eb')] }],
  },
  {
    id: 'hit-the-road-jack',
    title: 'Hit the Road Jack',
    artist: 'Ray Charles',
    key: 'A',
    mode: 'minor',
    bpm: 86,
    level: 'Facile',
    genre: 'R&B',
    sections: [{ name: 'Giro discendente', chords: [m('I', 'Am'), M('VII', 'G'), M('VI', 'F'), M('V', 'E')] }],
  },
  {
    id: 'canon-in-d',
    title: 'Canone in Re',
    artist: 'Johann Pachelbel',
    key: 'D',
    mode: 'major',
    bpm: 60,
    level: 'Intermedio',
    genre: 'Classica',
    sections: [
      {
        name: 'Basso ostinato',
        chords: [
          M('I', 'D'),
          M('V', 'A'),
          m('VI', 'Bm'),
          m('III', 'F#m'),
          M('IV', 'G'),
          M('I', 'D'),
          M('IV', 'G'),
          M('V', 'A'),
        ],
      },
    ],
  },
  {
    id: 'la-bamba',
    title: 'La Bamba',
    artist: 'Ritchie Valens',
    key: 'C',
    mode: 'major',
    bpm: 150,
    level: 'Facile',
    genre: 'Rock and roll',
    sections: [{ name: 'Giro', chords: [M('I', 'C'), M('IV', 'F'), M('V', 'G')] }],
  },
];

export interface SongStep extends SongChord {
  section: string;
}

/** Flattens the sections of a song into a single list of practice steps. */
export function getSongSteps(song: Song): SongStep[] {
  return song.sections.flatMap((section) =>
    section.chords.map((chord) => ({ ...chord, section: section.name }))
  );
}
