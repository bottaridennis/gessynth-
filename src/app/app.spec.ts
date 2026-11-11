import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { App } from './app';

describe('App', () => {
  it('instantiates App with initial values', () => {
    const injector = Injector.create({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const app = runInInjectionContext(injector, () => new App());
    expect(app).toBeTruthy();
    expect(app.activeDegree()).toBe(null);
    expect(app.isHandClosed()).toBe(false);
    expect(app.handsDetected()).toBe(false);
  });

  it('arrow keys sweep the filter in both directions', () => {
    const injector = Injector.create({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const app = runInInjectionContext(injector, () => new App());
    app.started.set(true);
    app.audioUnlocked.set(true);
    const start = app.tiltValue();
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(app.tiltValue()).toBeCloseTo(start + 0.2);
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(app.tiltValue()).toBeCloseTo(start - 0.2);
  });

  it('ignores shortcuts with modifier keys', () => {
    const injector = Injector.create({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const app = runInInjectionContext(injector, () => new App());
    app.started.set(true);
    app.audioUnlocked.set(true);
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true }));
    app.handleKeyDown(new KeyboardEvent('keydown', { key: '4', metaKey: true }));
    expect(app.activeDegree()).toBe(null);
  });

  it('Escape closes open overlays', () => {
    const injector = Injector.create({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    const app = runInInjectionContext(injector, () => new App());
    app.started.set(true);
    app.helpOpen.set(true);
    app.handleKeyDown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(app.helpOpen()).toBe(false);
  });
});
