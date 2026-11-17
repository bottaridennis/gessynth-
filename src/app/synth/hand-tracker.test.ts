import { describe, expect, test } from 'vitest';
import { assignHands } from './hand-tracker';

const hand = (x: number) => Array.from({ length: 21 }, () => ({ x, y: 0.5 }));

describe('assignHands', () => {
  test('swaps MediaPipe handedness because the camera image is not mirrored', () => {
    const a = hand(0.2);
    const b = hand(0.8);
    const { leftHand, rightHand } = assignHands(
      [a, b],
      [[{ categoryName: 'Left' }], [{ categoryName: 'Right' }]]
    );
    expect(rightHand).toBe(a);
    expect(leftHand).toBe(b);
  });

  test('handles missing results', () => {
    expect(assignHands(undefined, undefined)).toEqual({ leftHand: null, rightHand: null });
  });
});
