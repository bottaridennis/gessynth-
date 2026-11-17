import { describe, expect, test } from 'vitest';
import { SONGS, getSongSteps } from './songs';
import { getChordDisplayName, SCALE_MODES } from './music-theory';

describe('Song library', () => {
  test('ids are unique and every song has chords', () => {
    const ids = SONGS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    SONGS.forEach((song) => {
      expect(getSongSteps(song).length).toBeGreaterThan(0);
      expect(SCALE_MODES.some((mode) => mode.id === song.mode)).toBe(true);
    });
  });

  test('Creep is mapped to G, B, C, Cm', () => {
    const creep = SONGS.find((s) => s.id === 'creep');
    expect(creep).toBeTruthy();
    expect(getSongSteps(creep!).map((s) => s.chord)).toEqual(['G', 'B', 'C', 'Cm']);
  });

  // Guarantees that the degree + tilt written in the library really produce the
  // documented chord with the app's harmony engine.
  test.each(SONGS.map((song) => [song.title, song] as const))('%s: degrees match chord symbols', (_title, song) => {
    getSongSteps(song).forEach((step) => {
      const name = getChordDisplayName(step.degree, step.major, song.key, step.voicing ?? 1, 'off', song.mode);
      expect(name).toBe(step.chord);
    });
  });
});
