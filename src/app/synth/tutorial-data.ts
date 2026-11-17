import { ChordDegree } from './music-theory';

/** One step of the guided practice ("Esercitazione"). The app checks it live. */
export interface TutorialStep {
  title: string;
  description: string;
  targetDegree: ChordDegree;
  targetMajor: boolean;
  /** Accepted right-hand voicings; omitted = any voicing */
  targetVoicings?: number[];
  theory: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Il primo accordo',
    description: 'Mano sinistra: alza solo l’indice e inclina leggermente la mano verso destra.',
    targetDegree: 'I',
    targetMajor: true,
    theory: 'Il I grado è la tonica, l’accordo “di casa”. L’inclinazione a destra lo rende maggiore.',
  },
  {
    title: 'Da maggiore a minore',
    description: 'Tieni l’indice alzato e inclina la mano verso sinistra.',
    targetDegree: 'I',
    targetMajor: false,
    theory: 'Inclinando a sinistra la terza scende di un semitono: l’accordo diventa minore.',
  },
  {
    title: 'Cambia grado',
    description: 'Alza quattro dita (pollice chiuso) e inclina a destra.',
    targetDegree: 'IV',
    targetMajor: true,
    theory: 'Il IV grado (sottodominante) crea movimento rispetto alla tonica.',
  },
  {
    title: 'Aggiungi la mano destra',
    description: 'Sinistra: indice alzato, inclinata a destra. Destra: alza due dita.',
    targetDegree: 'I',
    targetMajor: true,
    targetVoicings: [2],
    theory: 'La mano destra sceglie il voicing: con due dita la terza va al basso (primo rivolto).',
  },
  {
    title: 'Accordi di settima',
    description: 'Sinistra come prima. Destra: tre dita per la Maj7 oppure quattro per la settima di dominante.',
    targetDegree: 'I',
    targetMajor: true,
    targetVoicings: [3, 4],
    theory: 'Le settime danno il colore tipico di jazz, soul e lo-fi.',
  },
];
