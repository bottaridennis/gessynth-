import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  calculateDegreeFrequency,
  calculateChordTones,
  getVoicingFrequencies,
  getChordDisplayName,
  KEY_BASE_FREQUENCIES,
  SCALE_NOTES,
  getScaleNotes,
  getChordNotes,
  spellNote,
  formatNoteName,
} from './music-theory';

test('Key scales contain 7 diatonic notes', () => {
  assert.equal(SCALE_NOTES.C.length, 7);
  assert.deepEqual(SCALE_NOTES.C, ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  assert.deepEqual(SCALE_NOTES.A, ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']);
});

test('calculateDegreeFrequency calculates correct fundamental frequencies', () => {
  const cFreq = KEY_BASE_FREQUENCIES.C;
  const root = calculateDegreeFrequency(1, cFreq);
  assert.equal(Math.round(root), 262);

  // Perfect fifth is 7 semitones up
  const fifth = calculateDegreeFrequency(5, cFreq);
  assert.equal(Math.round(fifth), Math.round(root * Math.pow(2, 7 / 12)));
});

test('calculateChordTones returns correct intervals for Major and Minor', () => {
  const cFreq = KEY_BASE_FREQUENCIES.C;
  const majorTones = calculateChordTones('I', true, cFreq);
  assert.ok(majorTones);
  // Major third is 4 semitones
  assert.equal(Math.round(majorTones!.third), Math.round(majorTones!.root * Math.pow(2, 4 / 12)));

  const minorTones = calculateChordTones('I', false, cFreq);
  assert.ok(minorTones);
  // Minor third is 3 semitones
  assert.equal(Math.round(minorTones!.third), Math.round(minorTones!.root * Math.pow(2, 3 / 12)));
});

test('getVoicingFrequencies returns 4 voices per chord quality', () => {
  const tones = calculateChordTones('I', true, 261.63);
  assert.ok(tones);

  const rootVoicing = getVoicingFrequencies(tones!, 1, true);
  assert.equal(rootVoicing.length, 4);

  const maj7Voicing = getVoicingFrequencies(tones!, 3, true);
  assert.equal(maj7Voicing.length, 4);
  assert.equal(maj7Voicing[3], tones!.maj7Tone);
});

test('getChordDisplayName produces accurate chord labels', () => {
  assert.equal(getChordDisplayName('I', true, 'C', 1), 'C');
  assert.equal(getChordDisplayName('I', false, 'A', 1), 'Am');
  assert.equal(getChordDisplayName('I', true, 'C', 3), 'Cmaj7');
  assert.equal(getChordDisplayName('IV', true, 'A', 1), 'D');
  assert.equal(getChordDisplayName('IV', false, 'A', 1), 'Dm');
  assert.equal(getChordDisplayName('I', true, 'C', 4), 'C7');
  assert.equal(getChordDisplayName('I', false, 'A', 3), 'Am7');
  assert.equal(getChordDisplayName('I', false, 'A', 4), 'Adim7');
  assert.equal(getChordDisplayName('I', true, 'C', 2), 'C/E');
});

test('ScaleMode and getScaleNotes produce correct modal notes', () => {
  // C Major (Ionian)
  assert.deepEqual(getScaleNotes('C', 'major'), ['C', 'D', 'E', 'F', 'G', 'A', 'B']);

  // D Dorian (0, 2, 3, 5, 7, 9, 10 from D): D, E, F, G, A, B, C
  assert.deepEqual(getScaleNotes('D', 'dorian'), ['D', 'E', 'F', 'G', 'A', 'B', 'C']);

  // A Natural Minor (Aeolian): A, B, C, D, E, F, G
  assert.deepEqual(getScaleNotes('A', 'minor'), ['A', 'B', 'C', 'D', 'E', 'F', 'G']);

  // A Harmonic Minor (raised 7th): A, B, C, D, E, F, G#
  const aHarmonic = getScaleNotes('A', 'harmonic_minor');
  assert.equal(aHarmonic[0], 'A');
  assert.equal(aHarmonic[6], 'G#');

  // C Pentatonic Major: C, D, E, G, A
  const cPent = getScaleNotes('C', 'pentatonic_major');
  assert.equal(cPent[0], 'C');
  assert.equal(cPent[2], 'E');
  assert.equal(cPent[3], 'G');

  // A Hirajoshi: A, B, C, E, F
  const aHirajoshi = getScaleNotes('A', 'hirajoshi');
  assert.equal(aHirajoshi[0], 'A');
  assert.equal(aHirajoshi[1], 'B');
  assert.equal(aHirajoshi[2], 'C');
  assert.equal(aHirajoshi[3], 'E');
  assert.equal(aHirajoshi[4], 'F');
});

test('calculateDegreeFrequency honors ScaleMode intervals', () => {
  const cFreq = 261.63;
  // Major 3rd: E (4 semitones)
  const majorThird = calculateDegreeFrequency(3, cFreq, 'major');
  assert.equal(Math.round(majorThird), Math.round(cFreq * Math.pow(2, 4 / 12)));

  // Minor 3rd: Eb (3 semitones)
  const minorThird = calculateDegreeFrequency(3, cFreq, 'minor');
  assert.equal(Math.round(minorThird), Math.round(cFreq * Math.pow(2, 3 / 12)));
});


test('getChordDisplayName applies semitone shift chromatically', () => {
  // A major, degree III = C#; raising gives D, lowering gives C
  assert.equal(getChordDisplayName('III', true, 'A', 1, 'raise'), 'D');
  assert.equal(getChordDisplayName('III', true, 'A', 1, 'lower'), 'C');
  // Wrap-around: B raised -> C
  assert.equal(getChordDisplayName('I', false, 'B', 1, 'raise'), 'Cm');
});

test('getScaleNotes uses correct enharmonic spelling', () => {
  assert.deepEqual(getScaleNotes('A', 'major'), ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']);
  assert.deepEqual(getScaleNotes('Gb', 'major'), ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F']);
  assert.deepEqual(getScaleNotes('C', 'minor'), ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb']);
  assert.deepEqual(getScaleNotes('A', 'harmonic_minor'), ['A', 'B', 'C', 'D', 'E', 'F', 'G#']);
});

test('spellNote spells intervals by letter', () => {
  assert.equal(spellNote('B', 2, 4), 'D#');
  assert.equal(spellNote('Eb', 2, 3), 'Gb');
  assert.equal(spellNote('F#', 4, 7), 'C#');
  assert.equal(spellNote('C', 6, 9), 'Bbb');
});

test('getChordNotes returns the sounding notes of each voicing', () => {
  assert.deepEqual(getChordNotes('III', true, 'G', 1), ['B', 'D#', 'F#']);
  assert.deepEqual(getChordNotes('IV', false, 'G', 1), ['C', 'Eb', 'G']);
  assert.deepEqual(getChordNotes('I', true, 'C', 2), ['E', 'G', 'C']);
  assert.deepEqual(getChordNotes('I', true, 'C', 3), ['C', 'E', 'G', 'B']);
  assert.deepEqual(getChordNotes('V', true, 'C', 4), ['G', 'B', 'D', 'F']);
  assert.deepEqual(getChordNotes(null, true, 'C', 1), []);
});

test('formatNoteName uses typographic accidentals only after note letters', () => {
  assert.equal(formatNoteName('F#m7'), 'F\u266Fm7');
  assert.equal(formatNoteName('Bb/D'), 'B\u266D/D');
  assert.equal(formatNoteName('Bdim7'), 'Bdim7');
});
