import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  classifyLeftHandDegree,
  classifyRightHandVoicing,
  calculateHandTilt,
  calculateVolumeFromHeight,
  calculateFilterSweep,
  GestureDebouncer,
  isHandClosed,
  Landmark,
} from './gesture-classifier';

// Helper to create mock 21 landmarks
function createMockHand(extendedFingers: { thumb?: boolean; index?: boolean; middle?: boolean; ring?: boolean; pinky?: boolean }): Landmark[] {
  const landmarks: Landmark[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));

  // Set wrist
  landmarks[0] = { x: 0.5, y: 0.8, z: 0 };
  landmarks[9] = { x: 0.5, y: 0.5, z: 0 };
  landmarks[13] = { x: 0.52, y: 0.52, z: 0 };

  // Thumb
  landmarks[3] = { x: 0.45, y: 0.6, z: 0 };
  landmarks[4] = { x: extendedFingers.thumb ? 0.35 : 0.47, y: 0.55, z: 0 };

  // Index
  landmarks[6] = { x: 0.48, y: 0.5, z: 0 };
  landmarks[8] = { x: 0.48, y: extendedFingers.index ? 0.3 : 0.6, z: 0 };

  // Middle
  landmarks[10] = { x: 0.5, y: 0.48, z: 0 };
  landmarks[12] = { x: 0.5, y: extendedFingers.middle ? 0.28 : 0.62, z: 0 };

  // Ring
  landmarks[14] = { x: 0.52, y: 0.5, z: 0 };
  landmarks[16] = { x: 0.52, y: extendedFingers.ring ? 0.32 : 0.62, z: 0 };

  // Pinky
  landmarks[18] = { x: 0.55, y: 0.55, z: 0 };
  landmarks[20] = { x: 0.55, y: extendedFingers.pinky ? 0.35 : 0.65, z: 0 };

  return landmarks;
}

test('classifyLeftHandDegree identifies finger counts 1 to 5', () => {
  // 1 finger (index)
  const oneFinger = createMockHand({ index: true });
  assert.equal(classifyLeftHandDegree(oneFinger, 'Left'), 'I');

  // 2 fingers (index, middle)
  const twoFingers = createMockHand({ index: true, middle: true });
  assert.equal(classifyLeftHandDegree(twoFingers, 'Left'), 'II');

  // 3 fingers
  const threeFingers = createMockHand({ index: true, middle: true, ring: true });
  assert.equal(classifyLeftHandDegree(threeFingers, 'Left'), 'III');

  // 4 fingers
  const fourFingers = createMockHand({ index: true, middle: true, ring: true, pinky: true });
  assert.equal(classifyLeftHandDegree(fourFingers, 'Left'), 'IV');

  // 5 fingers
  const fiveFingers = createMockHand({ thumb: true, index: true, middle: true, ring: true, pinky: true });
  assert.equal(classifyLeftHandDegree(fiveFingers, 'Left'), 'V');
});

test('classifyLeftHandDegree identifies horns (VI) and ILY (VII) gestures', () => {
  // Horns: index + pinky up, thumb down
  const horns = createMockHand({ index: true, pinky: true, middle: false, ring: false, thumb: false });
  assert.equal(classifyLeftHandDegree(horns, 'Left'), 'VI');

  // I love you: index + pinky + thumb up
  const ily = createMockHand({ index: true, pinky: true, thumb: true, middle: false, ring: false });
  assert.equal(classifyLeftHandDegree(ily, 'Left'), 'VII');
});

test('classifyRightHandVoicing maps fingers to quality index 1-4', () => {
  const hand1 = createMockHand({ index: true });
  assert.equal(classifyRightHandVoicing(hand1), 1);

  const hand2 = createMockHand({ index: true, middle: true });
  assert.equal(classifyRightHandVoicing(hand2), 2);

  const hand3 = createMockHand({ index: true, middle: true, ring: true });
  assert.equal(classifyRightHandVoicing(hand3), 3);

  const hand4 = createMockHand({ index: true, middle: true, ring: true, pinky: true });
  assert.equal(classifyRightHandVoicing(hand4), 4);
});

test('calculateFilterSweep scales frequency and resonance based on tilt', () => {
  const neutral = calculateFilterSweep(0);
  assert.equal(neutral.frequency, 1200);

  const dark = calculateFilterSweep(-1);
  assert.equal(dark.frequency, 250);

  const bright = calculateFilterSweep(1);
  assert.equal(bright.frequency, 5000);
});

test('calculateVolumeFromHeight scales volume between 0.1 and 1.0', () => {
  const highHand: Landmark[] = [{ x: 0.5, y: 0.1 }];
  const lowHand: Landmark[] = [{ x: 0.5, y: 0.9 }];

  assert.ok(calculateVolumeFromHeight(highHand) > 0.8);
  assert.ok(calculateVolumeFromHeight(lowHand) < 0.3);
});

test('calculateHandTilt computes left and right tilt values', () => {
  const hand = createMockHand({ index: true });
  // Set wrist to the left of knuckles
  hand[0] = { x: 0.3, y: 0.8 };
  hand[9] = { x: 0.5, y: 0.5 };
  hand[13] = { x: 0.52, y: 0.5 };
  const leftTilt = calculateHandTilt(hand, 'Left');
  assert.ok(leftTilt < 0); // negative = Minor

  // Set wrist to the right of knuckles
  hand[0] = { x: 0.7, y: 0.8 };
  const rightTilt = calculateHandTilt(hand, 'Left');
  assert.ok(rightTilt > 0); // positive = Major
});

test('GestureDebouncer stabilizes transient chord flicker', () => {
  const debouncer = new GestureDebouncer();
  const baseResult = {
    chordDegree: 'I',
    isMajorMode: true,
    tiltValue: 0.2,
    qualityIndex: 1,
    octaveMultiplier: 1.0,
    volume: 0.7,
    filterFrequency: 1200,
    filterQ: 0.7,
    leftHandDetected: true,
    rightHandDetected: false,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
  };

  const initial = debouncer.process(baseResult, 1000);
  assert.equal(initial.chordDegree, 'I');

  // Immediate transient flicker at t=1020 (<70ms debounce window)
  const transient = debouncer.process({ ...baseResult, chordDegree: 'IV' }, 1020);
  assert.equal(transient.chordDegree, 'I'); // Holds last stable chord

  // After debounce time t=1100 (>70ms)
  const settled = debouncer.process({ ...baseResult, chordDegree: 'IV' }, 1100);
  assert.equal(settled.chordDegree, 'IV');
});

test('GestureDebouncer reset clears state when hands disappear', () => {
  const debouncer = new GestureDebouncer();
  const baseResult = {
    chordDegree: 'V',
    isMajorMode: true,
    tiltValue: 0.2,
    qualityIndex: 1,
    octaveMultiplier: 1.0,
    volume: 0.7,
    filterFrequency: 1200,
    filterQ: 0.7,
    leftHandDetected: true,
    rightHandDetected: false,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
  };

  debouncer.process(baseResult, 1000);

  // When hands leave frame, reset is called
  debouncer.reset();

  // When hands return with a new gesture (e.g. 'II'), it immediately registers without waiting for old comparison
  const newHandResult = debouncer.process({ ...baseResult, chordDegree: 'II' }, 2000);
  assert.equal(newHandResult.chordDegree, 'II');
});

test('isHandClosed accurately identifies a closed fist vs open hands', () => {
  // Closed fist: all fingers down/curled
  const closedFist = createMockHand({
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false,
  });
  assert.equal(isHandClosed(closedFist, 'Left'), true);
  assert.equal(isHandClosed(closedFist, 'Right'), true);

  // Open 1 finger (index)
  const oneFinger = createMockHand({ index: true });
  assert.equal(isHandClosed(oneFinger, 'Left'), false);

  // Open 5 fingers
  const fiveFingers = createMockHand({
    thumb: true,
    index: true,
    middle: true,
    ring: true,
    pinky: true,
  });
  assert.equal(isHandClosed(fiveFingers, 'Left'), false);
});

test('classifyLeftHandDegree returns null on a closed hand (silence / no sound)', () => {
  const closedFist = createMockHand({
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false,
  });

  // Must return null, so no chord is played
  assert.equal(classifyLeftHandDegree(closedFist, 'Left'), null);
});

test('classifyRightHandVoicing returns 0 on a closed hand (choke / mute)', () => {
  const closedFist = createMockHand({
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false,
  });

  // Must return 0 (closed fist / mute)
  assert.equal(classifyRightHandVoicing(closedFist), 0);
});

test('GestureDebouncer mutes immediately (0ms delay) when hand is closed (chordDegree null)', () => {
  const debouncer = new GestureDebouncer();
  const baseResult = {
    chordDegree: 'IV',
    isMajorMode: true,
    tiltValue: 0.2,
    qualityIndex: 1,
    octaveMultiplier: 1.0,
    volume: 0.7,
    filterFrequency: 1200,
    filterQ: 0.7,
    leftHandDetected: true,
    rightHandDetected: false,
    leftHandLandmarks: null,
    rightHandLandmarks: null,
  };

  // Currently playing chord IV
  debouncer.process(baseResult, 1000);

  // User closes hand at t=1010 (< 70ms debounce window)
  const muted = debouncer.process({ ...baseResult, chordDegree: null }, 1010);

  // Must immediately mute to null without waiting for 70ms debounce delay
  assert.equal(muted.chordDegree, null);
});
