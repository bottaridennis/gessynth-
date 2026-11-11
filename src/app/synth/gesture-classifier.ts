export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export type HandSide = 'Left' | 'Right';

export interface GestureDetectionResult {
  chordDegree: string | null;      // 'I', 'II', ..., 'VII' or null
  isMajorMode: boolean;            // true = Major (↗️), false = Minor (↖️)
  tiltValue: number;               // -1.0 to +1.0
  qualityIndex: number;            // 1 (Root), 2 (1st), 3 (Maj/Min 7), 4 (Dom/Dim 7), 0 (Closed / Mute)
  octaveMultiplier: number;        // 0.5 (low), 1.0 (mid), 2.0 (high)
  volume: number;                  // 0.0 to 1.0
  filterFrequency: number;         // 250 to 5000 Hz
  filterQ: number;                 // 0.7 to 5.2
  leftHandDetected: boolean;
  rightHandDetected: boolean;
  leftHandLandmarks: Landmark[] | null;
  rightHandLandmarks: Landmark[] | null;
  isLeftHandClosed?: boolean;
  isRightHandClosed?: boolean;
}

const FINGER_JOINTS: Record<'thumb' | 'index' | 'middle' | 'ring' | 'pinky', { pip: number; tip: number }> = {
  thumb: { pip: 3, tip: 4 },
  index: { pip: 6, tip: 8 },
  middle: { pip: 10, tip: 12 },
  ring: { pip: 14, tip: 16 },
  pinky: { pip: 18, tip: 20 },
};

/**
 * Checks whether a finger is extended based on tip and pip landmarks
 */
export function isFingerExtended(landmarks: Landmark[], finger: 'index' | 'middle' | 'ring' | 'pinky'): boolean {
  if (!landmarks || landmarks.length < 21) return false;
  const { pip, tip } = FINGER_JOINTS[finger];
  // In screen coordinates, y=0 is top, so tip.y < pip.y means pointing up
  return landmarks[tip].y < landmarks[pip].y;
}

/**
 * Checks whether thumb is extended
 */
export function isThumbExtended(landmarks: Landmark[], side: HandSide): boolean {
  if (!landmarks || landmarks.length < 21) return false;
  const tip = landmarks[4];
  const ip = landmarks[3];
  // For Right hand, thumb extends to the right (x > ip.x)
  // For Left hand, thumb extends to the left (x < ip.x)
  return side === 'Right' ? tip.x > ip.x : tip.x < ip.x;
}

/**
 * Checks whether a finger is curled into the palm (closed/fist)
 */
export function isFingerCurled(landmarks: Landmark[], finger: 'index' | 'middle' | 'ring' | 'pinky'): boolean {
  if (!landmarks || landmarks.length < 21) return true;
  const { pip, tip } = FINGER_JOINTS[finger];
  const wrist = landmarks[0];

  // 1. Upright screen Y check
  const isBelowPip = landmarks[tip].y >= landmarks[pip].y;

  // 2. Distance check: in a closed fist, fingertip is closer or equal to wrist compared to PIP joint
  if (wrist) {
    const dTipWrist = Math.hypot(landmarks[tip].x - wrist.x, landmarks[tip].y - wrist.y);
    const dPipWrist = Math.hypot(landmarks[pip].x - wrist.x, landmarks[pip].y - wrist.y);
    if (dTipWrist < dPipWrist * 1.15) {
      return true;
    }
  }

  return isBelowPip;
}

/**
 * Checks whether a hand is closed into a fist (no fingers extended or all fingers curled)
 * When a hand is closed, no sound should be played.
 */
export function isHandClosed(landmarks: Landmark[], side: HandSide = 'Left'): boolean {
  if (!landmarks || landmarks.length < 21) return false;

  const index = isFingerExtended(landmarks, 'index');
  const middle = isFingerExtended(landmarks, 'middle');
  const ring = isFingerExtended(landmarks, 'ring');
  const pinky = isFingerExtended(landmarks, 'pinky');
  const thumb = isThumbExtended(landmarks, side);

  const extendedCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;
  // If 0 extended fingers, it's definitely a closed fist
  if (extendedCount === 0) return true;

  // If all 4 fingers (index, middle, ring, pinky) are curled/not extended:
  if (!index && !middle && !ring && !pinky) {
    // Check if it's an explicit "thumbs-up" (thumb tip significantly higher than index MCP)
    const thumbTip = landmarks[4];
    const indexMcp = landmarks[5];
    const wrist = landmarks[0];
    const isThumbsUp = thumb && thumbTip && indexMcp && wrist && thumbTip.y < indexMcp.y && thumbTip.y < wrist.y;
    if (!isThumbsUp) {
      return true;
    }
  }

  // Also check curled status of all 4 fingers
  const indexCurled = isFingerCurled(landmarks, 'index');
  const middleCurled = isFingerCurled(landmarks, 'middle');
  const ringCurled = isFingerCurled(landmarks, 'ring');
  const pinkyCurled = isFingerCurled(landmarks, 'pinky');
  if (indexCurled && middleCurled && ringCurled && pinkyCurled && !thumb) {
    return true;
  }

  return false;
}

/**
 * Classifies Left hand gesture into chord degree I - VII
 * Returns null if the hand is closed (fist) or gesture is unrecognized
 */
export function classifyLeftHandDegree(landmarks: Landmark[], side: HandSide = 'Left'): string | null {
  if (!landmarks || landmarks.length < 21) return null;

  // A closed hand / fist must NEVER play sound
  if (isHandClosed(landmarks, side)) {
    return null;
  }

  const thumb = isThumbExtended(landmarks, side);
  const index = isFingerExtended(landmarks, 'index');
  const middle = isFingerExtended(landmarks, 'middle');
  const ring = isFingerExtended(landmarks, 'ring');
  const pinky = isFingerExtended(landmarks, 'pinky');

  // Rock horns gesture (index + pinky up, middle + ring down, thumb down) -> VI
  if (index && pinky && !middle && !ring && !thumb) {
    return 'VI';
  }

  // "I love you" gesture (index + pinky + thumb up, middle + ring down) -> VII
  if (index && pinky && !middle && !ring && thumb) {
    return 'VII';
  }

  // Count total extended fingers
  const extendedCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;
  if (extendedCount === 0) {
    return null; // Closed fist
  }

  const degreeMap: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
  };

  return degreeMap[extendedCount] ?? null;
}

/**
 * Calculates hand tilt: negative = Left tilt (Minor), positive = Right tilt (Major)
 */
export function calculateHandTilt(landmarks: Landmark[], side: HandSide = 'Left'): number {
  if (!landmarks || landmarks.length < 18) return 0;
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const ringMcp = landmarks[13];
  if (!wrist || !middleMcp || !ringMcp) return 0;

  const minX = Math.min(middleMcp.x, ringMcp.x);
  const maxX = Math.max(middleMcp.x, ringMcp.x);
  const tolerance = 0.12;

  let rawTilt = 0;
  if (wrist.x < minX) {
    rawTilt = (wrist.x - minX) / tolerance;
  } else if (wrist.x > maxX) {
    rawTilt = (wrist.x - maxX) / tolerance;
  }

  let clamped = Math.max(-1, Math.min(1, rawTilt));
  if (side === 'Right') {
    clamped = -clamped;
  }
  return clamped;
}

/**
 * Classifies Right hand quality/inversion finger count (1 to 4)
 * Returns 0 if right hand is closed into a fist (choke/mute)
 */
export function classifyRightHandVoicing(landmarks: Landmark[]): number {
  if (!landmarks || landmarks.length < 21) return 1;

  if (isHandClosed(landmarks, 'Right')) {
    return 0; // Closed fist / choke
  }

  const count = [
    isFingerExtended(landmarks, 'index'),
    isFingerExtended(landmarks, 'middle'),
    isFingerExtended(landmarks, 'ring'),
    isFingerExtended(landmarks, 'pinky'),
  ].filter(Boolean).length;

  if (count === 0) {
    return 0; // Closed hand
  }

  return Math.max(1, Math.min(4, count));
}

/**
 * Calculates volume from hand height (higher hand = louder)
 */
export function calculateVolumeFromHeight(landmarks: Landmark[]): number {
  if (!landmarks || landmarks.length === 0) return 0.75;
  const wrist = landmarks[0];
  const minY = 0.05;
  const maxY = 0.95;
  const clampedY = Math.max(minY, Math.min(maxY, wrist.y));
  const normalized = 1 - (clampedY - minY) / (maxY - minY);
  return Math.max(0.1, Math.min(1.0, normalized));
}

/**
 * Calculates filter cutoff sweep and resonance from tilt or horizontal position
 */
export function calculateFilterSweep(tilt: number): { frequency: number; q: number } {
  let freq = 1200;
  let q = 0.7;

  if (tilt < 0) {
    const abs = Math.abs(tilt);
    freq = 1200 - abs * 950; // down to 250 Hz
    q = 0.7 + abs * 1.5;
  } else if (tilt > 0) {
    freq = 1200 + tilt * 3800; // up to 5000 Hz
    q = 0.7 + tilt * 4.5;
  }

  return {
    frequency: Math.max(200, Math.min(6000, freq)),
    q: Math.max(0.5, Math.min(6.0, q)),
  };
}

/**
 * Smooth state manager for debouncing transient hand detections
 */
export class GestureDebouncer {
  private lastStableResult: GestureDetectionResult | null = null;
  private pendingResult: GestureDetectionResult | null = null;
  private pendingStartTime = 0;
  private debounceMs = 70;

  process(current: GestureDetectionResult, now: number = performance.now()): GestureDetectionResult {
    // When chordDegree is null (closed hand / silence), silence IMMEDIATELY without debounce delay
    if (current.chordDegree === null) {
      this.lastStableResult = {
        ...current,
        chordDegree: null,
      };
      this.pendingResult = null;
      return this.lastStableResult;
    }

    if (!this.lastStableResult) {
      this.lastStableResult = current;
      this.pendingResult = current;
      this.pendingStartTime = now;
      return current;
    }

    const chordChanged =
      current.chordDegree !== this.pendingResult?.chordDegree ||
      current.isMajorMode !== this.pendingResult?.isMajorMode ||
      current.qualityIndex !== this.pendingResult?.qualityIndex;

    if (chordChanged) {
      this.pendingResult = current;
      this.pendingStartTime = now;
    } else if (now - this.pendingStartTime >= this.debounceMs) {
      this.lastStableResult = {
        ...current,
        chordDegree: this.pendingResult?.chordDegree ?? current.chordDegree,
        isMajorMode: this.pendingResult?.isMajorMode ?? current.isMajorMode,
        qualityIndex: this.pendingResult?.qualityIndex ?? current.qualityIndex,
      };
    }

    return {
      ...current,
      chordDegree: this.lastStableResult.chordDegree,
      isMajorMode: this.lastStableResult.isMajorMode,
      qualityIndex: this.lastStableResult.qualityIndex,
    };
  }

  reset(): void {
    this.lastStableResult = null;
    this.pendingResult = null;
    this.pendingStartTime = 0;
  }
}
