export type KeySignature =
  | 'A'
  | 'Bb'
  | 'B'
  | 'C'
  | 'Db'
  | 'D'
  | 'Eb'
  | 'E'
  | 'F'
  | 'Gb'
  | 'G'
  | 'Ab';

export type ScaleMode =
  | 'major'
  | 'minor'
  | 'dorian'
  | 'mixolydian'
  | 'lydian'
  | 'harmonic_minor'
  | 'phrygian'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'hirajoshi';

export interface ScaleModeInfo {
  id: ScaleMode;
  name: string;
  category: 'Standard' | 'Modal' | 'Exotic' | 'Pentatonic';
  description: string;
  defaultMajor: boolean;
  intervals: number[]; // semitone offsets from root
}

export const SCALE_MODES: ScaleModeInfo[] = [
  {
    id: 'major',
    name: 'Maggiore (ionica)',
    category: 'Standard',
    description: 'Luminosa e solare: la base dell’armonia classica',
    defaultMajor: true,
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: 'minor',
    name: 'Minore naturale (eolia)',
    category: 'Standard',
    description: 'Intensa e malinconica',
    defaultMajor: false,
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    id: 'dorian',
    name: 'Dorica',
    category: 'Modal',
    description: 'Morbida, neo-soul, jazz e funk (sesta alzata)',
    defaultMajor: false,
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  {
    id: 'mixolydian',
    name: 'Misolidia',
    category: 'Modal',
    description: 'Rock e blues ottimista (settima abbassata)',
    defaultMajor: true,
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
  {
    id: 'lydian',
    name: 'Lidia',
    category: 'Modal',
    description: 'Sognante e cinematografica (quarta aumentata)',
    defaultMajor: true,
    intervals: [0, 2, 4, 6, 7, 9, 11],
  },
  {
    id: 'phrygian',
    name: 'Frigia',
    category: 'Modal',
    description: 'Scura, sapore flamenco (seconda abbassata)',
    defaultMajor: false,
    intervals: [0, 1, 3, 5, 7, 8, 10],
  },
  {
    id: 'harmonic_minor',
    name: 'Minore armonica',
    category: 'Standard',
    description: 'Drammatica, neoclassica (settima alzata)',
    defaultMajor: false,
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },
  {
    id: 'pentatonic_major',
    name: 'Pentatonica maggiore',
    category: 'Pentatonic',
    description: 'Cinque note sempre consonanti: folk e blues',
    defaultMajor: true,
    intervals: [0, 2, 4, 7, 9, 12, 14],
  },
  {
    id: 'pentatonic_minor',
    name: 'Pentatonica minore',
    category: 'Pentatonic',
    description: 'La spina dorsale di blues, rock e soul',
    defaultMajor: false,
    intervals: [0, 3, 5, 7, 10, 12, 15],
  },
  {
    id: 'hirajoshi',
    name: 'Hirajoshi (giapponese)',
    category: 'Exotic',
    description: 'Pentatonica tradizionale giapponese, meditativa',
    defaultMajor: false,
    intervals: [0, 2, 3, 7, 8, 12, 14],
  },
];

export type ChordDegree = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';

export type SemitoneShift = 'off' | 'raise' | 'lower';

export interface ChordTones {
  root: number;
  third: number;
  fifth: number;
  octaveRoot: number;
  octaveThird: number;
  maj7Tone: number;
  dom7Tone: number;
  dim7Tone: number;
  dim5Tone: number;
}

// Pitch-class names starting from C
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const KEY_SEMITONE_OFFSET: Record<KeySignature, number> = {
  C: 0,
  Db: 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  Gb: 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11,
};

// Base fundamental frequencies for keys (in Hz, octave 3/4)
export const KEY_BASE_FREQUENCIES: Record<KeySignature, number> = {
  A: 220.0,
  Bb: 233.08,
  B: 246.94,
  C: 261.63,
  Db: 277.18,
  D: 293.66,
  Eb: 311.13,
  E: 329.63,
  F: 349.23,
  Gb: 369.99,
  G: 392.0,
  Ab: 415.3,
};

/**
 * Returns dynamic note names for any key and scale mode combination
 */
export function getScaleNotes(key: KeySignature, mode: ScaleMode = 'major'): string[] {
  const rootIndex = KEY_SEMITONE_OFFSET[key] ?? 0;
  const modeInfo = SCALE_MODES.find((m) => m.id === mode) || SCALE_MODES[0];
  const intervals = modeInfo.intervals.slice(0, 7);
  const isHeptatonic = intervals.every((v, i) => i === 0 || (v > intervals[i - 1] && v < 12));

  // Fallback spelling: sharps for sharp keys, flats otherwise
  const fallback = (semitone: number) => {
    const pc = (rootIndex + semitone) % 12;
    return key.length === 1 && key !== 'F' ? SHARP_NAMES[pc] : FLAT_NAMES[pc];
  };

  if (!isHeptatonic) {
    return intervals.map(fallback);
  }

  // Heptatonic scales: one letter per degree (A major -> G#, not Ab)
  const rootLetterIdx = LETTERS.indexOf(key[0]);
  return intervals.map((semitone, degree) => {
    const letter = LETTERS[(rootLetterIdx + degree) % 7];
    const targetPc = (rootIndex + semitone) % 12;
    let diff = (targetPc - LETTER_PC[letter] + 12) % 12;
    if (diff > 6) diff -= 12;
    if (diff === 0) return letter;
    if (diff === 1) return `${letter}#`;
    if (diff === -1) return `${letter}b`;
    return fallback(semitone); // avoid double accidentals
  });
}

// Fallback legacy SCALE_NOTES
export const SCALE_NOTES: Record<KeySignature, string[]> = {
  A: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  Bb: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  B: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  C: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  Db: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  D: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  Eb: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  E: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  F: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
  Gb: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
  G: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  Ab: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
};

export const DEGREE_MAP: Record<string, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
};

// Color accents for each degree
export const DEGREE_COLORS: Record<string, [number, number, number]> = {
  I: [245, 181, 68], // amber
  II: [244, 114, 152], // rose
  III: [167, 139, 250], // violet
  IV: [45, 212, 191], // teal
  V: [96, 165, 250], // sky
  VI: [251, 146, 60], // coral
  VII: [163, 230, 53], // lime
};

/**
 * Calculates fundamental frequency for a scale degree in a given key
 */
/**
 * Calculates fundamental frequency for a scale degree in a given key and scale mode
 */
export function calculateDegreeFrequency(
  degreeIndex: number,
  baseFreq: number,
  mode: ScaleMode = 'major'
): number {
  const modeInfo = SCALE_MODES.find((m) => m.id === mode) || SCALE_MODES[0];
  const idx = Math.max(0, Math.min(modeInfo.intervals.length - 1, degreeIndex - 1));
  const semitones = modeInfo.intervals[idx] ?? 0;

  let freq = baseFreq;
  // Standardize high octave roots
  if (freq === 369.99 || freq === 392.0 || freq === 415.3) {
    freq /= 2;
  }
  return freq * Math.pow(2, semitones / 12);
}

/**
 * Calculates full chord harmonic tones
 */
export function calculateChordTones(
  degree: string | null,
  isMajor: boolean,
  baseFreq: number,
  semitoneShift: SemitoneShift = 'off',
  mode: ScaleMode = 'major'
): ChordTones | null {
  if (!degree || degree === '--') return null;
  const degreeIndex = DEGREE_MAP[degree.toUpperCase()];
  if (!degreeIndex) return null;

  let root = calculateDegreeFrequency(degreeIndex, baseFreq, mode);
  if (semitoneShift === 'raise') {
    root *= Math.pow(2, 1 / 12);
  } else if (semitoneShift === 'lower') {
    root *= Math.pow(2, -1 / 12);
  }

  const thirdInterval = isMajor ? 4 : 3;
  const third = root * Math.pow(2, thirdInterval / 12);
  const fifth = root * Math.pow(2, 7 / 12);
  const octaveRoot = root * 2;
  const octaveThird = third * 2;
  const maj7Tone = root * Math.pow(2, 11 / 12);
  const dom7Tone = root * Math.pow(2, 10 / 12);
  const dim7Tone = root * Math.pow(2, 9 / 12);
  const dim5Tone = root * Math.pow(2, 6 / 12);

  return {
    root,
    third,
    fifth,
    octaveRoot,
    octaveThird,
    maj7Tone,
    dom7Tone,
    dim7Tone,
    dim5Tone,
  };
}

/**
 * Selects specific notes to sound based on Right Hand voicing finger count (1-4)
 */
export function getVoicingFrequencies(
  tones: ChordTones | null,
  qualityIndex: number,
  isMajor: boolean
): number[] {
  if (!tones) return [];
  const {
    root,
    third,
    fifth,
    octaveRoot,
    octaveThird,
    maj7Tone,
    dom7Tone,
    dim7Tone,
    dim5Tone,
  } = tones;

  if (isMajor) {
    switch (qualityIndex) {
      case 1:
        // Root position
        return [root, fifth, octaveRoot, octaveThird];
      case 2:
        // 1st inversion
        return [third, fifth, octaveRoot, octaveThird];
      case 3:
        // Major 7th
        return [root, third, fifth, maj7Tone];
      case 4:
        // Dominant 7th
        return [root, third, fifth, dom7Tone];
      default:
        return [root, fifth, octaveRoot, octaveThird];
    }
  } else {
    // Minor
    switch (qualityIndex) {
      case 1:
        // Minor root position
        return [root, fifth, octaveRoot, octaveThird];
      case 2:
        // Minor 1st inversion
        return [third, fifth, octaveRoot, octaveThird];
      case 3:
        // Minor 7th
        return [root, third, fifth, dom7Tone];
      case 4:
        // Diminished 7th
        return [root, third, dim5Tone, dim7Tone];
      default:
        return [root, fifth, octaveRoot, octaveThird];
    }
  }
}

/**
 * Generates user-friendly chord name display string
 */
export function getChordDisplayName(
  degree: string | null,
  isMajor: boolean,
  key: KeySignature,
  qualityIndex: number,
  semitoneShift: SemitoneShift = 'off',
  mode: ScaleMode = 'major'
): string {
  if (!degree || degree === '--') return '--';
  const root = getDegreeRootName(key, mode, degree, semitoneShift);
  if (!root) return '--';

  // Standard lead-sheet notation: C, Cm, C/E, Cmaj7, C7, Cm7, Cdim7
  switch (qualityIndex) {
    case 2:
      return `${root}${isMajor ? '' : 'm'}/${spellNote(root, 2, isMajor ? 4 : 3)}`;
    case 3:
      return isMajor ? `${root}maj7` : `${root}m7`;
    case 4:
      return isMajor ? `${root}7` : `${root}dim7`;
    default:
      return isMajor ? root : `${root}m`;
  }
}


export const ROMAN_DEGREES: ChordDegree[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/**
 * Spells the note that lies `letterSteps` letters and `semitones` semitones above `root`
 * (e.g. root "B", 2 letters, 4 semitones -> "D#").
 */
export function spellNote(root: string, letterSteps: number, semitones: number): string {
  const rootLetter = root[0];
  const rootAcc = root.slice(1);
  const accValue = [...rootAcc].reduce((acc, ch) => acc + (ch === '#' ? 1 : ch === 'b' ? -1 : 0), 0);
  const rootPc = (LETTER_PC[rootLetter] + accValue + 12) % 12;
  const letter = LETTERS[(LETTERS.indexOf(rootLetter) + letterSteps) % 7];
  const targetPc = (rootPc + semitones) % 12;
  let diff = (targetPc - LETTER_PC[letter] + 12) % 12;
  if (diff > 6) diff -= 12;
  if (diff === 0) return letter;
  return letter + (diff > 0 ? '#'.repeat(diff) : 'b'.repeat(-diff));
}

/** Root note name of a scale degree, including the optional global semitone shift. */
export function getDegreeRootName(
  key: KeySignature,
  mode: ScaleMode,
  degree: string,
  semitoneShift: SemitoneShift = 'off'
): string | null {
  const degreeIndex = DEGREE_MAP[degree.toUpperCase()];
  if (!degreeIndex) return null;
  const name = getScaleNotes(key, mode)[degreeIndex - 1] ?? 'C';
  if (semitoneShift === 'off') return name;
  // Shift on the chromatic circle instead of appending accidentals ("C#b", "Bb#")
  const sharpIdx = SHARP_NAMES.indexOf(name);
  const idx = sharpIdx >= 0 ? sharpIdx : FLAT_NAMES.indexOf(name);
  if (idx < 0) return name;
  const raise = semitoneShift === 'raise';
  return (raise ? SHARP_NAMES : FLAT_NAMES)[(idx + (raise ? 1 : -1) + 12) % 12];
}

/**
 * Note names actually sounding in a chord, ordered from the bass up
 * (matches getVoicingFrequencies: 1 root, 2 first inversion, 3 seventh, 4 dom7 / dim7).
 */
export function getChordNotes(
  degree: string | null,
  isMajor: boolean,
  key: KeySignature,
  qualityIndex = 1,
  semitoneShift: SemitoneShift = 'off',
  mode: ScaleMode = 'major'
): string[] {
  if (!degree) return [];
  const root = getDegreeRootName(key, mode, degree, semitoneShift);
  if (!root) return [];
  const third = spellNote(root, 2, isMajor ? 4 : 3);
  const fifth = spellNote(root, 4, 7);
  switch (qualityIndex) {
    case 2:
      return [third, fifth, root];
    case 3:
      return [root, third, fifth, spellNote(root, 6, isMajor ? 11 : 10)];
    case 4:
      return isMajor
        ? [root, third, fifth, spellNote(root, 6, 10)]
        : [root, third, spellNote(root, 4, 6), spellNote(root, 6, 9)];
    default:
      return [root, third, fifth];
  }
}

/**
 * Typographic accidentals for display: "F#m7" -> "F♯m7", "Bb/D" -> "B♭/D".
 * Only accidentals that directly follow a note letter are converted.
 */
export function formatNoteName(name: string): string {
  if (!name) return name;
  return name.replace(/([A-G])([#b]+)/g, (_m, letter: string, acc: string) =>
    letter + acc.replace(/#/g, '\u266F').replace(/b/g, '\u266D')
  );
}
