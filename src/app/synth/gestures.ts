import { ChordDegree } from './music-theory';

/** Which fingers are extended in a hand pose (used by the vector hand drawings). */
export interface HandShape {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

export interface GestureInfo {
  shape: HandShape;
  /** Short label, e.g. "2 dita" */
  label: string;
}

const shape = (thumb: boolean, index: boolean, middle: boolean, ring: boolean, pinky: boolean): HandShape => ({
  thumb,
  index,
  middle,
  ring,
  pinky,
});

/** Left hand (chord hand): one pose per scale degree. Mirrors classifyLeftHandDegree. */
export const DEGREE_GESTURES: Record<ChordDegree, GestureInfo> = {
  I: { shape: shape(false, true, false, false, false), label: '1 dito' },
  II: { shape: shape(false, true, true, false, false), label: '2 dita' },
  III: { shape: shape(false, true, true, true, false), label: '3 dita' },
  IV: { shape: shape(false, true, true, true, true), label: '4 dita' },
  V: { shape: shape(true, true, true, true, true), label: 'Mano aperta' },
  VI: { shape: shape(false, true, false, false, true), label: 'Corna' },
  VII: { shape: shape(true, true, false, false, true), label: 'Pollice, indice, mignolo' },
};

export const FIST_GESTURE: GestureInfo = {
  shape: shape(false, false, false, false, false),
  label: 'Pugno',
};

export interface VoicingInfo {
  index: number;
  shape: HandShape;
  fingers: string;
  majorLabel: string;
  minorLabel: string;
  description: string;
}

/** Right hand (voicing hand): number of raised fingers, thumb excluded. Mirrors classifyRightHandVoicing. */
export const VOICING_GESTURES: VoicingInfo[] = [
  {
    index: 1,
    shape: shape(false, true, false, false, false),
    fingers: '1 dito',
    majorLabel: 'Fondamentale',
    minorLabel: 'Fondamentale',
    description: 'Accordo base, la nota del grado al basso',
  },
  {
    index: 2,
    shape: shape(false, true, true, false, false),
    fingers: '2 dita',
    majorLabel: 'Primo rivolto',
    minorLabel: 'Primo rivolto',
    description: 'La terza va al basso: suono più morbido',
  },
  {
    index: 3,
    shape: shape(false, true, true, true, false),
    fingers: '3 dita',
    majorLabel: 'Maj7',
    minorLabel: 'm7',
    description: 'Aggiunge la settima: colore jazz e soul',
  },
  {
    index: 4,
    shape: shape(false, true, true, true, true),
    fingers: '4 dita',
    majorLabel: 'Dominante 7',
    minorLabel: 'Diminuito 7',
    description: 'Settima di tensione, chiede di risolvere',
  },
];
