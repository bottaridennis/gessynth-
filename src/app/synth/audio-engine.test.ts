import { test, expect, describe } from 'vitest';
import {
  PRESET_DEFAULT_PARAMS,
  INSTRUMENT_PRESETS,
  InstrumentPreset,
} from './audio-engine';

describe('AudioEngine Presets & DSP Safety Bounds', () => {
  test('All instrument presets have safe resonance and reverb bounds', () => {
    const presetKeys = Object.keys(PRESET_DEFAULT_PARAMS) as InstrumentPreset[];
    expect(presetKeys.length).toBe(14);

    presetKeys.forEach((key) => {
      const params = PRESET_DEFAULT_PARAMS[key];
      expect(params.resonance).toBeLessThanOrEqual(3.8);
      expect(params.resonance).toBeGreaterThanOrEqual(0.4);
      expect(params.reverb).toBeLessThanOrEqual(0.65);
      expect(params.attack).toBeGreaterThanOrEqual(0.005);
      expect(params.release).toBeGreaterThanOrEqual(0.05);
      expect(params.cutoff).toBeLessThanOrEqual(10000);
    });
  });

  test('Instrument presets metadata covers all defined presets', () => {
    expect(INSTRUMENT_PRESETS.length).toBe(14);
    const ids = INSTRUMENT_PRESETS.map((p) => p.id);
    const presetKeys = Object.keys(PRESET_DEFAULT_PARAMS);
    presetKeys.forEach((k) => {
      expect(ids).toContain(k);
    });
  });
});
