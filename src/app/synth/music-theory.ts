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
    name: 'Major (Ionian)',
    category: 'Standard',
    description: 'Bright, cheerful, classic harmonic foundation',
    defaultMajor: true,
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: 'minor',
    name: 'Natural Minor (Aeolian)',
    category: 'Standard',
    description: 'Soulful, contemplative, melancholic emotion',
    defaultMajor: false,
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    id: 'dorian',
    name: 'Dorian',
    category: 'Modal',
    description: 'Smooth neo-soul, jazz & funk with a raised 6th',
    defaultMajor: false,
    intervals: [0, 2, 3, 5, 7, 9, 10],
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian',
    category: 'Modal',
    description: 'Bluesy, optimistic rock groove with flattened 7th',
    defaultMajor: true,
    intervals: [0, 2, 4, 5, 7, 9, 10],
  },
  {
    id: 'lydian',
    name: 'Lydian',
    category: 'Modal',
    description: 'Dreamy, ethereal, spacey cinema sound with #4',
    defaultMajor: true,
    intervals: [0, 2, 4, 6, 7, 9, 11],
  },
  {
    id: 'phrygian',
    name: 'Phrygian',
    category: 'Modal',
    description: 'Dark, mystical Spanish/flamenco mood with flat 2nd',
    defaultMajor: false,
    intervals: [0, 1, 3, 5, 7, 8, 10],
  },
  {
    id: 'harmonic_minor',
    name: 'Harmonic Minor',
    category: 'Standard',
    description: 'Neo-classical, dramatic Baroque tension with raised 7th',
    defaultMajor: false,
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },
  {
    id: 'pentatonic_major',
    name: 'Major Pentatonic',
    category: 'Pentatonic',
    description: 'Universally harmonious, folk & blues 5-note purity',
    defaultMajor: true,
    intervals: [0, 2, 4, 7, 9, 12, 14],
  },
  {
    id: 'pentatonic_minor',
    name: 'Minor Pentatonic',
    category: 'Pentatonic',
    description: 'Raw blues, rock and soul pentatonic backbone',
    defaultMajor: false,
    intervals: [0, 3, 5, 7, 10, 12, 15],
  },
  {
    id: 'hirajoshi',
    name: 'Hirajoshi (Japanese)',
    category: 'Exotic',
    description: 'Traditional Japanese meditative pentatonic tranquility',
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

// Chromatic pitch classes starting from C
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

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
  return modeInfo.intervals.slice(0, 7).map((semitone) => {
    const noteIdx = (rootIndex + semitone) % 12;
    return CHROMATIC_NOTES[noteIdx];
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
  I: [232, 161, 61],   // Gold / Amber
  II: [210, 50, 120],  // Magenta / Rose
  III: [180, 40, 150], // Deep Violet
  IV: [240, 210, 40],  // Electric Yellow
  V: [245, 120, 30],   // Vibrant Orange
  VI: [230, 40, 40],   // Crimson Red
  VII: [100, 200, 250], // Cyan Sky
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
  const degreeIndex = DEGREE_MAP[degree.toUpperCase()];
  if (!degreeIndex) return '--';

  const scale = getScaleNotes(key, mode);
  let noteName = scale[degreeIndex - 1] || 'C';

  if (semitoneShift === 'raise') {
    noteName += '#';
  } else if (semitoneShift === 'lower') {
    noteName += 'b';
  }

  const baseName = isMajor ? noteName : `${noteName}m`;

  let extension = '';
  if (qualityIndex === 2) {
    extension = ' (1st)';
  } else if (qualityIndex === 3) {
    extension = isMajor ? ' Maj 7' : ' 7';
  } else if (qualityIndex === 4) {
    extension = isMajor ? ' 7' : ' dim 7';
  }

  return `${baseName}${extension}`;
}

