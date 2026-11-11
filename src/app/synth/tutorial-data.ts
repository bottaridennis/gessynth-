export interface TutorialStep {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  leftHandGoal: string; // e.g. "1️⃣ ↗️"
  rightHandGoal?: string; // e.g. "2️⃣"
  targetDegree: string; // "I", "IV", etc.
  targetMajor: boolean;
  targetVoicing?: number; // 1, 2, 3, 4
  theory: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    step: 1,
    totalSteps: 5,
    title: 'Play your first chord (I Major)',
    description: 'Raise 1 finger (index) on your Left Hand and tilt your hand slightly right (↗️).',
    leftHandGoal: '1️⃣ ↗️ (Index finger, tilt right)',
    targetDegree: 'I',
    targetMajor: true,
    theory: 'Degree I is the tonic (home) chord. 1 finger selects the 1st scale degree.',
  },
  {
    step: 2,
    totalSteps: 5,
    title: 'Tilt for Minor (I minor)',
    description: 'Keep your 1 finger extended on your Left Hand, but tilt your hand left (↖️).',
    leftHandGoal: '1️⃣ ↖️ (Tilt left)',
    targetDegree: 'I',
    targetMajor: false,
    theory: 'Tilting left drops the 3rd by one semitone, instantly creating an emotive minor chord.',
  },
  {
    step: 3,
    totalSteps: 5,
    title: 'Change degrees (IV Major)',
    description: 'Now raise 4 fingers on your Left Hand and tilt right (↗️).',
    leftHandGoal: '4️⃣ ↗️ (4 fingers, tilt right)',
    targetDegree: 'IV',
    targetMajor: true,
    theory: 'Raising 4 fingers triggers the IV chord (Subdominant), creating musical movement.',
  },
  {
    step: 4,
    totalSteps: 5,
    title: 'Add Right Hand: Inversions',
    description: 'Left Hand on 1️⃣ ↗️ (Root chord). Now raise 2 fingers on your Right Hand.',
    leftHandGoal: '1️⃣ ↗️',
    rightHandGoal: '2️⃣ (1st Inversion)',
    targetDegree: 'I',
    targetMajor: true,
    targetVoicing: 2,
    theory: 'Right hand controls chord voicings. 2 fingers plays the 1st inversion (3rd in the bass).',
  },
  {
    step: 5,
    totalSteps: 5,
    title: 'Lush 7th Chords',
    description: 'Keep Left Hand on 1️⃣ ↗️. Raise 3 fingers on your Right Hand for Maj 7, or 4 fingers for Dom 7!',
    leftHandGoal: '1️⃣ ↗️',
    rightHandGoal: '3️⃣ (Maj 7) or 4️⃣ (Dom 7)',
    targetDegree: 'I',
    targetMajor: true,
    targetVoicing: 3,
    theory: 'Extensions give chords colorful richness used in jazz, neo-soul, lo-fi, and cinema.',
  },
];
