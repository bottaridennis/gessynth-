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
});
