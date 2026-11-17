import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { SONGS } from './synth/songs';

function createApp(): App {
  return TestBed.runInInjectionContext(() => new App());
}

describe('App', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] });
  });

  it('instantiates with initial values', () => {
    const app = createApp();
    expect(app.activeDegree()).toBe(null);
    expect(app.isHandClosed()).toBe(false);
    expect(app.handsDetected()).toBe(false);
    expect(app.onboardingOpen()).toBe(true);
  });

  it('arrow keys sweep the filter in both directions', () => {
    const app = createApp();
    app.started.set(true);
    app.onboardingOpen.set(false);
    app.audioUnlocked.set(true);
    const start = app.tiltValue();
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(app.tiltValue()).toBeCloseTo(start + 0.2);
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(app.tiltValue()).toBeCloseTo(start - 0.2);
  });

  it('ignores shortcuts with modifier keys and while onboarding is open', () => {
    const app = createApp();
    app.started.set(true);
    app.audioUnlocked.set(true);
    app.handleKeyDown(new KeyboardEvent('keydown', { key: '3' }));
    expect(app.activeDegree()).toBe(null); // onboarding still open
    app.onboardingOpen.set(false);
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }));
    app.handleKeyDown(new KeyboardEvent('keydown', { key: '4', metaKey: true }));
    expect(app.activeDegree()).toBe(null);
    app.handleKeyDown(new KeyboardEvent('keydown', { key: '4' }));
    expect(app.activeDegree()).toBe('IV');
  });

  it('Escape closes the open panel first', () => {
    const app = createApp();
    app.started.set(true);
    app.onboardingOpen.set(false);
    app.sheet.set('library');
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(app.sheet()).toBe(null);
  });

  it('loading Creep sets the key and targets G, B, C, Cm', () => {
    const app = createApp();
    app.startSong(SONGS.find((s) => s.id === 'creep')!);
    expect(app.selectedKey()).toBe('G');
    expect(app.selectedScaleMode()).toBe('major');
    expect(app.practice()!.steps.map((s) => app.stepChordName(s))).toEqual(['G', 'B', 'C', 'Cm']);
    expect(app.practiceStepNotes()).toEqual(['G', 'B', 'D']);
  });

  it('recognises the target chord of the current step', () => {
    const app = createApp();
    app.startSong(SONGS.find((s) => s.id === 'creep')!);
    app.advancePractice(3); // Cm
    app.activeDegree.set('IV');
    app.isMajor.set(true);
    expect(app.practiceSatisfied()).toBe(false);
    app.isMajor.set(false);
    expect(app.practiceSatisfied()).toBe(true);
    app.advancePractice(1);
    expect(app.practiceIndex()).toBe(0);
    expect(app.practiceLoops()).toBe(1);
  });
});
