import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Handles "install as app" (PWA):
 * - Chrome / Edge / Android: native install prompt via `beforeinstallprompt`
 * - iOS / iPadOS Safari: no prompt API, the UI shows the "Add to Home Screen" steps
 */
@Injectable({ providedIn: 'root' })
export class InstallService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly promptAvailable = signal(false);
  readonly installed = signal(false);
  readonly isIos = signal(false);

  /** Show an "Install" entry point at all */
  readonly canOfferInstall = computed(() => !this.installed() && (this.promptAvailable() || this.isIos()));

  constructor() {
    if (!this.isBrowser) return;

    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    this.installed.set(!!standalone);

    const ua = navigator.userAgent;
    const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    this.isIos.set(/iPhone|iPad|iPod/.test(ua) || iPadOs);

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.promptAvailable.set(true);
    });
    window.addEventListener('appinstalled', () => {
      this.installed.set(true);
      this.promptAvailable.set(false);
      this.deferredPrompt = null;
    });
  }

  /** Returns true when the native prompt was shown; false means "show manual instructions". */
  async install(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    const event = this.deferredPrompt;
    this.deferredPrompt = null;
    this.promptAvailable.set(false);
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === 'accepted') this.installed.set(true);
    return true;
  }
}
