import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import {
  ChordDegree,
  DEGREE_COLORS,
  KEY_BASE_FREQUENCIES,
  KeySignature,
  ROMAN_DEGREES,
  SCALE_MODES,
  ScaleMode,
  SemitoneShift,
  calculateChordTones,
  formatNoteName,
  getChordDisplayName,
  getChordNotes,
  getDegreeRootName,
  getVoicingFrequencies,
} from './synth/music-theory';
import {
  GestureDebouncer,
  GestureDetectionResult,
  Landmark,
  calculateFilterSweep,
  calculateHandTilt,
  calculateVolumeFromHeight,
  classifyLeftHandDegree,
  classifyRightHandVoicing,
  isHandClosed,
  isThumbExtended,
} from './synth/gesture-classifier';
import {
  AudioEngine,
  INSTRUMENT_PRESETS,
  InstrumentPreset,
  PRESET_DEFAULT_PARAMS,
  SoundCustomParams,
} from './synth/audio-engine';
import { HandDetectionFrame, HandTrackerService } from './synth/hand-tracker';
import { TUTORIAL_STEPS } from './synth/tutorial-data';
import { DEGREE_GESTURES, FIST_GESTURE, VOICING_GESTURES } from './synth/gestures';
import { SONGS, Song, getSongSteps } from './synth/songs';
import { IconComponent } from './ui/icon';
import { HandGestureComponent } from './ui/hand-gesture';
import { OnboardingComponent } from './ui/onboarding';
import { SongLibraryComponent } from './ui/song-library';
import { InstallService } from './pwa/install.service';

type Sheet = 'library' | 'sound' | 'help' | 'guide' | 'install' | null;
type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported';

export interface PracticeStep {
  degree: ChordDegree;
  major: boolean;
  voicings?: number[];
  chord?: string;
  title?: string;
  description?: string;
  theory?: string;
  section?: string;
}

export interface Practice {
  kind: 'song' | 'lesson';
  id: string;
  title: string;
  subtitle: string;
  note?: string;
  bpm: number;
  steps: PracticeStep[];
}

const ONBOARDING_KEY = 'gs.onboarding.v2';
const SOLFEGE: Record<string, string> = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };

const degreeRgb = (deg: string | null | undefined): [number, number, number] =>
  DEGREE_COLORS[(deg ?? 'I').toUpperCase()] ?? [245, 181, 68];

@Component({
  selector: 'app-root',
  imports: [NgTemplateOutlet, IconComponent, HandGestureComponent, OnboardingComponent, SongLibraryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:keydown)': 'handleKeyDown($event)',
    '(window:resize)': 'handleResize()',
    '(document:visibilitychange)': 'handleVisibility()',
  },
})
export class App implements OnInit, OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly installer = inject(InstallService);

  private readonly webcamVideo = viewChild<ElementRef<HTMLVideoElement>>('webcamVideo');
  private readonly overlayCanvas = viewChild<ElementRef<HTMLCanvasElement>>('overlayCanvas');

  // ---------------------------------------------------------------- app state
  readonly started = signal(false);
  readonly onboardingOpen = signal(true);
  readonly onboardingSeen = signal(false);
  readonly sheet = signal<Sheet>(null);
  readonly guideVisible = signal(true);
  readonly padVisible = signal(true);
  readonly isVirtualMode = signal(false);
  readonly cameraStatus = signal<CameraStatus>('idle');
  readonly cameraNoticeVisible = signal(false);

  // ---------------------------------------------------------- synth settings
  readonly selectedKey = signal<KeySignature>('C');
  readonly selectedScaleMode = signal<ScaleMode>('major');
  readonly selectedPreset = signal<InstrumentPreset>('warm');
  readonly isTwoHandedMode = signal(true);
  readonly semitoneShift = signal<SemitoneShift>('off');
  readonly isAudioMuted = signal(false);
  readonly audioUnlocked = signal(false);
  readonly customParams = signal<SoundCustomParams>({ ...PRESET_DEFAULT_PARAMS.warm });

  // -------------------------------------------------------- live performance
  readonly activeDegree = signal<string | null>(null);
  readonly handsDetected = signal(false);
  readonly isHandClosed = signal(false);
  readonly isMajor = signal(true);
  readonly tiltValue = signal(0.3);
  readonly voicingQuality = signal(1);
  readonly octaveShift = signal<number>(1.0);
  readonly currentVolume = signal(0.75);
  readonly currentFilterFreq = signal(1200);
  readonly currentFilterQ = signal(0.7);

  // ---------------------------------------------------------------- practice
  readonly practice = signal<Practice | null>(null);
  readonly practiceIndex = signal(0);
  readonly practiceLoops = signal(0);
  readonly practiceHit = signal(false);
  readonly demoPlaying = signal(false);

  // ------------------------------------------------------------- static data
  readonly keysList: KeySignature[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  readonly scaleModesList = SCALE_MODES;
  readonly presetsList = INSTRUMENT_PRESETS;
  readonly songs = SONGS;
  readonly romans = ROMAN_DEGREES;
  readonly degreeGestures = DEGREE_GESTURES;
  readonly fistGesture = FIST_GESTURE;
  readonly voicingGestures = VOICING_GESTURES;
  readonly waveformsList: { id: SoundCustomParams['waveform']; label: string }[] = [
    { id: 'auto', label: 'Preset' },
    { id: 'sine', label: 'Sinusoide' },
    { id: 'triangle', label: 'Triangolo' },
    { id: 'sawtooth', label: 'Dente di sega' },
    { id: 'square', label: 'Quadra' },
  ];
  readonly octaves = [
    { value: 0.5, label: '−1' },
    { value: 1.0, label: '0' },
    { value: 2.0, label: '+1' },
  ];
  readonly formatNoteName = formatNoteName;

  // ---------------------------------------------------------------- services
  private readonly audioEngine = new AudioEngine();
  private readonly handTracker = new HandTrackerService();
  private readonly debouncer = new GestureDebouncer();
  private animationFrameId: number | null = null;
  private lastKeyboardInputTime = 0;
  private lastHandsSeenTime = 0;
  private liveLeftLandmarks: Landmark[] | null = null;
  private liveRightLandmarks: Landmark[] | null = null;
  private readonly scopeBuffer = new Uint8Array(512);
  private canvasDpr = 1;
  private practiceTimer: ReturnType<typeof setTimeout> | null = null;
  private demoTimer: ReturnType<typeof setTimeout> | null = null;

  // ------------------------------------------------------------------ derived
  readonly chordDisplayName = computed(() =>
    formatNoteName(
      getChordDisplayName(
        this.activeDegree(),
        this.isMajor(),
        this.selectedKey(),
        this.isTwoHandedMode() ? this.voicingQuality() : 1,
        this.semitoneShift(),
        this.selectedScaleMode()
      )
    )
  );

  readonly chordNotes = computed(() =>
    getChordNotes(
      this.activeDegree(),
      this.isMajor(),
      this.selectedKey(),
      this.isTwoHandedMode() ? this.voicingQuality() : 1,
      this.semitoneShift(),
      this.selectedScaleMode()
    ).map(formatNoteName)
  );

  readonly activeDegreeColor = computed(() => {
    const deg = this.activeDegree();
    if (!deg) return 'var(--color-muted)';
    return `rgb(${degreeRgb(deg).join(',')})`;
  });

  readonly volumePercent = computed(() => Math.round(this.currentVolume() * 100));

  readonly keyLabel = computed(() => this.keyName(this.selectedKey()));

  readonly scaleLabel = computed(
    () => SCALE_MODES.find((m) => m.id === this.selectedScaleMode())?.name ?? this.selectedScaleMode()
  );

  /** The 7 chord buttons / guide rows for the current key and scale */
  readonly degreeItems = computed(() => {
    const key = this.selectedKey();
    const mode = this.selectedScaleMode();
    const shift = this.semitoneShift();
    const major = this.isMajor();
    return ROMAN_DEGREES.map((roman, i) => ({
      roman,
      number: i + 1,
      gesture: DEGREE_GESTURES[roman],
      note: formatNoteName(getDegreeRootName(key, mode, roman, shift) ?? ''),
      chord: formatNoteName(getChordDisplayName(roman, major, key, 1, shift, mode)),
      color: `rgb(${degreeRgb(roman).join(',')})`,
    }));
  });

  readonly practiceStep = computed<PracticeStep | null>(() => {
    const p = this.practice();
    if (!p) return null;
    return p.steps[this.practiceIndex()] ?? null;
  });

  readonly practiceNext = computed<PracticeStep | null>(() => {
    const p = this.practice();
    if (!p || p.steps.length < 2) return null;
    return p.steps[(this.practiceIndex() + 1) % p.steps.length];
  });

  readonly practiceStepChord = computed(() => {
    const step = this.practiceStep();
    return step ? this.stepChordName(step) : '';
  });

  readonly practiceStepNotes = computed(() => {
    const step = this.practiceStep();
    if (!step) return [];
    return getChordNotes(
      step.degree,
      step.major,
      this.selectedKey(),
      step.voicings?.[0] ?? 1,
      'off',
      this.selectedScaleMode()
    ).map(formatNoteName);
  });

  readonly practiceSatisfied = computed(() => {
    const step = this.practiceStep();
    const deg = this.activeDegree();
    if (!step || !deg) return false;
    const voicingOk =
      !step.voicings || !this.isTwoHandedMode() || step.voicings.includes(this.voicingQuality());
    return deg.toUpperCase() === step.degree && this.isMajor() === step.major && voicingOk;
  });

  constructor() {
    // Practice: advance automatically once the target chord has been held briefly
    effect(() => {
      const satisfied = this.practiceSatisfied();
      const demo = this.demoPlaying();
      if (this.practiceTimer) {
        clearTimeout(this.practiceTimer);
        this.practiceTimer = null;
      }
      if (!satisfied || demo) return;
      this.practiceHit.set(true);
      this.practiceTimer = setTimeout(() => {
        this.practiceTimer = null;
        this.practiceHit.set(false);
        this.advancePractice(1);
      }, 650);
    });
  }

  // ===================================================================== life
  ngOnInit(): void {
    if (!this.isBrowser) return;
    const seen = this.safeStorageGet(ONBOARDING_KEY) === '1';
    this.onboardingSeen.set(seen);
    this.guideVisible.set(window.matchMedia?.('(min-width: 1024px)').matches ?? true);

    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      void this.startApp(true);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.stopDemo();
    this.handTracker.stopCamera();
    this.audioEngine.destroy();
  }

  // ================================================================ start-up
  async startApp(skipCamera = false): Promise<void> {
    this.started.set(true);
    this.onboardingOpen.set(false);
    this.markOnboardingSeen();

    await this.audioEngine.init();
    this.audioEngine.setMuted(this.isAudioMuted());
    this.audioUnlocked.set(true);
    this.startRenderLoop();

    if (skipCamera) {
      this.enterVirtualMode();
      return;
    }
    await this.enableCamera();
  }

  async openLibraryFromOnboarding(): Promise<void> {
    if (this.started()) {
      this.onboardingOpen.set(false);
    } else {
      await this.startApp(true);
    }
    this.sheet.set('library');
  }

  /** Final onboarding step: start (or switch) with or without the webcam. */
  async onboardingStart(useCamera: boolean): Promise<void> {
    if (!this.started()) {
      await this.startApp(!useCamera);
      return;
    }
    this.onboardingOpen.set(false);
    const active = this.cameraStatus() === 'active';
    if (useCamera !== active) await this.toggleCameraMode();
  }

  reopenOnboarding(): void {
    this.sheet.set(null);
    this.onboardingOpen.set(true);
  }

  closeOnboarding(): void {
    this.onboardingOpen.set(false);
  }

  private async enableCamera(): Promise<void> {
    this.audioEngine.stopVoices(true);
    this.activeDegree.set(null);
    this.handsDetected.set(false);

    const video = this.webcamVideo()?.nativeElement;
    if (!video || !navigator.mediaDevices?.getUserMedia) {
      this.cameraStatus.set('unsupported');
      this.cameraNoticeVisible.set(true);
      this.enterVirtualMode();
      return;
    }

    this.cameraStatus.set('requesting');
    const mediaPipeReady = await this.handTracker.loadMediaPipe();
    const cameraOk = mediaPipeReady ? await this.handTracker.startCamera(video) : false;

    if (cameraOk) {
      this.cameraStatus.set('active');
      this.cameraNoticeVisible.set(false);
      this.isVirtualMode.set(false);
      this.debouncer.reset();
    } else {
      // Without hand tracking the camera is useless: fall back to virtual mode
      this.cameraStatus.set(mediaPipeReady ? 'denied' : 'unsupported');
      this.cameraNoticeVisible.set(true);
      this.enterVirtualMode();
    }
  }

  private enterVirtualMode(): void {
    this.isVirtualMode.set(true);
    this.handsDetected.set(false);
    this.liveLeftLandmarks = null;
    this.liveRightLandmarks = null;
  }

  async toggleCameraMode(): Promise<void> {
    if (this.cameraStatus() === 'requesting') return;
    if (this.cameraStatus() === 'active') {
      this.handTracker.stopCamera(this.webcamVideo()?.nativeElement);
      this.cameraStatus.set('idle');
      this.audioEngine.stopVoices(true);
      this.activeDegree.set(null);
      this.enterVirtualMode();
    } else {
      this.stopDemo();
      await this.enableCamera();
    }
  }

  dismissCameraNotice(): void {
    this.cameraNoticeVisible.set(false);
  }

  async installApp(): Promise<void> {
    const shown = await this.installer.install();
    if (!shown) {
      this.onboardingOpen.set(false);
      this.sheet.set('install');
    }
  }

  // ================================================================== sheets
  toggleSheet(sheet: Exclude<Sheet, null>): void {
    this.sheet.update((current) => (current === sheet ? null : sheet));
  }

  closeSheet(): void {
    this.sheet.set(null);
  }

  toggleGuide(): void {
    // On small screens the guide is a bottom sheet, on large screens a side panel
    if (this.isBrowser && !window.matchMedia?.('(min-width: 1024px)').matches) {
      this.toggleSheet('guide');
    } else {
      this.guideVisible.update((v) => !v);
    }
  }

  togglePad(): void {
    this.padVisible.update((v) => !v);
  }

  // ========================================================= synth settings
  onKeyChange(event: Event): void {
    this.selectedKey.set((event.target as HTMLSelectElement).value as KeySignature);
    this.triggerCurrentChord();
  }

  onScaleModeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as ScaleMode;
    this.selectedScaleMode.set(val);
    const modeInfo = SCALE_MODES.find((m) => m.id === val);
    if (modeInfo) this.isMajor.set(modeInfo.defaultMajor);
    this.triggerCurrentChord();
  }

  onPresetChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as InstrumentPreset;
    this.selectedPreset.set(val);
    this.audioEngine.setPreset(val);
    this.customParams.set(this.audioEngine.getCustomParams());
  }

  setCustomParam<K extends keyof SoundCustomParams>(key: K, value: SoundCustomParams[K]): void {
    this.audioEngine.updateCustomParams({ [key]: value });
    this.customParams.set(this.audioEngine.getCustomParams());
  }

  onRange(key: 'attack' | 'release' | 'cutoff' | 'resonance' | 'reverb' | 'detune', event: Event): void {
    this.setCustomParam(key, Number((event.target as HTMLInputElement).value));
  }

  resetSoundParams(): void {
    this.audioEngine.resetCustomParamsToPreset();
    this.customParams.set(this.audioEngine.getCustomParams());
  }

  setHandMode(twoHanded: boolean): void {
    this.isTwoHandedMode.set(twoHanded);
    this.triggerCurrentChord();
  }

  setSemitoneShift(shift: SemitoneShift): void {
    this.semitoneShift.set(shift);
    this.triggerCurrentChord();
  }

  toggleMute(): void {
    this.isAudioMuted.update((m) => !m);
    this.audioEngine.setMuted(this.isAudioMuted());
  }

  keyName(key: string): string {
    const solfege = SOLFEGE[key[0]] ?? '';
    const accidental = key.slice(1).replace(/#/g, '♯').replace(/b/g, '♭');
    return `${formatNoteName(key)} · ${solfege}${accidental}`;
  }

  // ========================================================= virtual playing
  setVirtualDegree(deg: string): void {
    this.lastKeyboardInputTime = performance.now();
    this.stopDemo();
    this.activeDegree.set(deg);
    this.triggerCurrentChord();
  }

  setMajor(major: boolean): void {
    this.lastKeyboardInputTime = performance.now();
    this.isMajor.set(major);
    this.tiltValue.set(major ? 0.35 : -0.35);
    this.triggerCurrentChord();
  }

  toggleVirtualMajorMinor(): void {
    this.setMajor(!this.isMajor());
  }

  setVirtualVoicing(v: number): void {
    this.lastKeyboardInputTime = performance.now();
    this.voicingQuality.set(v);
    this.triggerCurrentChord();
  }

  setVirtualOctave(mult: number): void {
    this.lastKeyboardInputTime = performance.now();
    this.octaveShift.set(mult);
    this.triggerCurrentChord();
  }

  setVirtualVolume(vol: number): void {
    this.lastKeyboardInputTime = performance.now();
    this.currentVolume.set(vol);
    this.audioEngine.updateVolume(vol);
  }

  onVolumeInput(event: Event): void {
    this.setVirtualVolume(Number((event.target as HTMLInputElement).value) / 100);
  }

  setVirtualFilter(tilt: number): void {
    this.lastKeyboardInputTime = performance.now();
    this.tiltValue.set(tilt);
    const sweep = calculateFilterSweep(tilt);
    this.currentFilterFreq.set(Math.round(sweep.frequency));
    this.currentFilterQ.set(sweep.q);
    this.audioEngine.updateFilter(sweep.frequency, sweep.q);
  }

  stopVirtualSound(): void {
    this.lastKeyboardInputTime = performance.now();
    this.stopDemo();
    this.activeDegree.set(null);
    this.audioEngine.stopVoices(true);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.started() || this.onboardingOpen()) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
    const key = event.key.toLowerCase();

    if (key === 'escape' && this.sheet()) {
      event.preventDefault();
      this.sheet.set(null);
      return;
    }

    const target = event.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
    if ((key === ' ' || key === 'enter') && tag === 'BUTTON') return;

    if (!this.audioUnlocked()) void this.unlockAudio();

    if (key >= '1' && key <= '7') {
      this.setVirtualDegree(ROMAN_DEGREES[Number(key) - 1]);
    } else if (key === 'm') {
      this.toggleVirtualMajorMinor();
    } else if (key === 'q') {
      this.setVirtualVoicing(1);
    } else if (key === 'w') {
      this.setVirtualVoicing(2);
    } else if (key === 'e') {
      this.setVirtualVoicing(3);
    } else if (key === 'r') {
      this.setVirtualVoicing(4);
    } else if (key === 'z') {
      this.setVirtualOctave(0.5);
    } else if (key === 'x') {
      this.setVirtualOctave(2.0);
    } else if (key === 'c') {
      this.setVirtualOctave(1.0);
    } else if (key === 'k') {
      this.togglePad();
    } else if (key === 's') {
      this.toggleSheet('sound');
    } else if (key === 'l') {
      this.toggleSheet('library');
    } else if (key === 'g') {
      this.toggleGuide();
    } else if (key === 'h' || key === '?') {
      this.toggleSheet('help');
    } else if (key === 'p' && this.practice()) {
      this.toggleDemo();
    } else if (key === 'arrowup') {
      event.preventDefault();
      this.setVirtualVolume(Math.min(1.0, this.currentVolume() + 0.1));
    } else if (key === 'arrowdown') {
      event.preventDefault();
      this.setVirtualVolume(Math.max(0.1, this.currentVolume() - 0.1));
    } else if (key === 'arrowright') {
      event.preventDefault();
      this.setVirtualFilter(Math.min(1.0, this.tiltValue() + 0.2));
    } else if (key === 'arrowleft') {
      event.preventDefault();
      this.setVirtualFilter(Math.max(-1.0, this.tiltValue() - 0.2));
    } else if (key === '0' || key === 'escape' || key === 'backspace') {
      event.preventDefault();
      this.stopVirtualSound();
    } else if (key === ' ') {
      event.preventDefault();
      this.toggleMute();
    }
  }

  async unlockAudio(): Promise<void> {
    await this.audioEngine.init();
    this.audioUnlocked.set(true);
  }

  handleVisibility(): void {
    if (!this.isBrowser || document.visibilityState !== 'hidden') return;
    // Leaving the app (tab switch, phone lock): never keep a chord hanging
    this.stopDemo();
    this.audioEngine.stopVoices(true);
    this.activeDegree.set(null);
  }

  handleResize(): void {
    this.resizeCanvas();
  }

  // ================================================================ practice
  startSong(song: Song): void {
    this.stopDemo();
    this.selectedKey.set(song.key);
    this.selectedScaleMode.set(song.mode);
    this.practice.set({
      kind: 'song',
      id: song.id,
      title: song.title,
      subtitle: song.artist,
      note: song.note,
      bpm: song.bpm,
      steps: getSongSteps(song).map((s) => ({
        degree: s.degree,
        major: s.major,
        chord: s.chord,
        section: s.section,
        voicings: s.voicing ? [s.voicing] : undefined,
      })),
    });
    this.practiceIndex.set(0);
    this.practiceLoops.set(0);
    this.sheet.set(null);
    this.stopVirtualSound();
  }

  startLesson(): void {
    this.stopDemo();
    this.practice.set({
      kind: 'lesson',
      id: 'lesson',
      title: 'Esercitazione guidata',
      subtitle: 'Cinque passi per imparare i gesti',
      bpm: 60,
      steps: TUTORIAL_STEPS.map((t) => ({
        degree: t.targetDegree,
        major: t.targetMajor,
        voicings: t.targetVoicings,
        title: t.title,
        description: t.description,
        theory: t.theory,
      })),
    });
    this.practiceIndex.set(0);
    this.practiceLoops.set(0);
    this.sheet.set(null);
  }

  stopPractice(): void {
    this.stopDemo();
    this.practice.set(null);
    this.practiceHit.set(false);
  }

  advancePractice(delta: number): void {
    const p = this.practice();
    if (!p) return;
    const next = this.practiceIndex() + delta;
    if (next >= p.steps.length) {
      if (p.kind === 'lesson') {
        this.stopPractice();
        return;
      }
      this.practiceLoops.update((n) => n + 1);
    }
    this.practiceIndex.set(((next % p.steps.length) + p.steps.length) % p.steps.length);
  }

  goToPracticeStep(index: number): void {
    this.practiceIndex.set(index);
    if (this.demoPlaying()) this.playStep(index);
  }

  /** Plays the current target chord once (helps to hear what to aim for). */
  previewStep(): void {
    const step = this.practiceStep();
    if (!step) return;
    this.stopDemo();
    this.applyStep(step);
  }

  toggleDemo(): void {
    if (this.demoPlaying()) {
      this.stopDemo();
      this.activeDegree.set(null);
      this.audioEngine.stopVoices();
    } else {
      this.demoPlaying.set(true);
      this.playStep(this.practiceIndex());
    }
  }

  private playStep(index: number): void {
    const p = this.practice();
    if (!p || !this.demoPlaying()) return;
    if (this.demoTimer) clearTimeout(this.demoTimer);
    this.practiceIndex.set(index);
    this.applyStep(p.steps[index]);
    const barMs = (60_000 / p.bpm) * 4;
    this.demoTimer = setTimeout(() => this.playStep((index + 1) % p.steps.length), barMs);
  }

  private stopDemo(): void {
    if (this.demoTimer) clearTimeout(this.demoTimer);
    this.demoTimer = null;
    this.demoPlaying.set(false);
  }

  private applyStep(step: PracticeStep): void {
    this.lastKeyboardInputTime = performance.now();
    this.activeDegree.set(step.degree);
    this.isMajor.set(step.major);
    this.voicingQuality.set(step.voicings?.[0] ?? 1);
    this.triggerCurrentChord();
  }

  /** "r,g,b" colour of a degree, for inline styles */
  degreeColor(degree: string): string {
    return degreeRgb(degree).join(',');
  }

  stepChordName(step: PracticeStep): string {
    return formatNoteName(
      step.chord ??
        getChordDisplayName(step.degree, step.major, this.selectedKey(), step.voicings?.[0] ?? 1, 'off', this.selectedScaleMode())
    );
  }

  // ================================================================== audio
  private triggerCurrentChord(): void {
    if (!this.audioUnlocked() || !this.started()) return;

    const baseFreq = KEY_BASE_FREQUENCIES[this.selectedKey()] || 220;
    const tones = calculateChordTones(
      this.activeDegree(),
      this.isMajor(),
      baseFreq,
      this.semitoneShift(),
      this.selectedScaleMode()
    );
    if (!tones) {
      this.audioEngine.stopVoices();
      return;
    }
    const voicing = this.isTwoHandedMode() ? this.voicingQuality() : 1;
    const frequencies = getVoicingFrequencies(tones, voicing, this.isMajor()).map((f) => f * this.octaveShift());
    this.audioEngine.playFrequencies(frequencies);
  }

  // =============================================================== rendering
  private resizeCanvas(): void {
    if (!this.isBrowser) return;
    const canvas = this.overlayCanvas()?.nativeElement;
    if (!canvas) return;
    // Render at device resolution so lines stay sharp on retina / phone screens
    this.canvasDpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * this.canvasDpr);
    canvas.height = Math.round(window.innerHeight * this.canvasDpr);
  }

  private startRenderLoop(): void {
    if (!this.isBrowser || this.animationFrameId !== null) return;
    this.resizeCanvas();
    const loop = (timestamp: number) => {
      this.renderFrame(timestamp);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private renderFrame(timestamp: number): void {
    const canvas = this.overlayCanvas()?.nativeElement;
    const video = this.webcamVideo()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = this.canvasDpr;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let crop: { sx: number; sy: number; sWidth: number; sHeight: number } | null = null;
    let vW = 0;
    let vH = 0;
    const cameraLive = this.cameraStatus() === 'active' && !!video && video.readyState >= 2;

    if (cameraLive && video) {
      vW = video.videoWidth;
      vH = video.videoHeight;
      const vAspect = vW / vH;
      const cAspect = width / height;
      let sx = 0;
      let sy = 0;
      let sWidth = vW;
      let sHeight = vH;
      if (vAspect > cAspect) {
        sWidth = vH * cAspect;
        sx = (vW - sWidth) / 2;
      } else {
        sHeight = vW / cAspect;
        sy = (vH - sHeight) / 2;
      }
      crop = { sx, sy, sWidth, sHeight };

      const frame = this.handTracker.detect(video, timestamp);
      this.liveLeftLandmarks = frame.leftHandLandmarks;
      this.liveRightLandmarks = frame.rightHandLandmarks;
      if (!this.demoPlaying()) this.processHands(frame, timestamp);
    }

    // Background
    ctx.clearRect(0, 0, width, height);
    if (cameraLive && video && crop) {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, crop.sx, crop.sy, crop.sWidth, crop.sHeight, 0, 0, width, height);
      ctx.restore();
      ctx.fillStyle = 'rgba(13, 14, 18, 0.55)';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#0d0e12';
      ctx.fillRect(0, 0, width, height);
      const [r, g, b] = degreeRgb(this.activeDegree());
      const playing = this.activeDegree() !== null;
      const grad = ctx.createRadialGradient(width / 2, height * 0.45, 20, width / 2, height * 0.45, Math.max(width, height) * 0.6);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${playing ? 0.14 : 0.05})`);
      grad.addColorStop(1, 'rgba(13, 14, 18, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    if (this.liveLeftLandmarks) {
      const closed = isHandClosed(this.liveLeftLandmarks, 'Left');
      this.drawHandSkeleton(ctx, this.liveLeftLandmarks, width, height, closed ? '#f87171' : '#f5b544', closed ? 'Sinistra · silenzio' : 'Sinistra · accordo', crop, vW, vH);
    }
    if (this.liveRightLandmarks) {
      const closed = isHandClosed(this.liveRightLandmarks, 'Right');
      this.drawHandSkeleton(ctx, this.liveRightLandmarks, width, height, closed ? '#f87171' : '#60a5fa', closed ? 'Destra · silenzio' : 'Destra · colore', crop, vW, vH);
    }

    this.drawScope(ctx, width, height);
  }

  private processHands(frame: HandDetectionFrame, timestamp: number): void {
    const hasHands = frame.leftHandLandmarks !== null || frame.rightHandLandmarks !== null;
    const isRecentKeyboard = timestamp - this.lastKeyboardInputTime < 1400;

    if (hasHands && !isRecentKeyboard) {
      this.lastHandsSeenTime = timestamp;
      this.handsDetected.set(true);

      const leftClosed = frame.leftHandLandmarks ? isHandClosed(frame.leftHandLandmarks, 'Left') : false;
      const rightClosed = frame.rightHandLandmarks ? isHandClosed(frame.rightHandLandmarks, 'Right') : false;

      let detectedDegree: string | null = null;
      let detectedMajor = this.isMajor();
      let detectedTilt = this.tiltValue();
      let anyClosed = false;

      if (this.isTwoHandedMode()) {
        if (leftClosed || (frame.rightHandLandmarks && rightClosed)) {
          anyClosed = true;
        } else if (frame.leftHandLandmarks) {
          detectedDegree = classifyLeftHandDegree(frame.leftHandLandmarks, 'Left');
          detectedTilt = calculateHandTilt(frame.leftHandLandmarks, 'Left');
          detectedMajor = detectedTilt >= 0;
        }
      } else {
        const hand = frame.leftHandLandmarks ?? frame.rightHandLandmarks;
        const side = frame.leftHandLandmarks ? 'Left' : 'Right';
        const closed = frame.leftHandLandmarks ? leftClosed : rightClosed;
        if (hand) {
          if (closed) {
            anyClosed = true;
          } else {
            detectedDegree = classifyLeftHandDegree(hand, side);
            detectedTilt = calculateHandTilt(hand, side);
            detectedMajor = detectedTilt >= 0;
          }
        }
      }
      this.isHandClosed.set(anyClosed);

      let detectedVoicing = this.voicingQuality();
      let detectedVol = this.currentVolume();
      let detectedOctave = this.octaveShift();

      if (frame.rightHandLandmarks && this.isTwoHandedMode()) {
        const v = classifyRightHandVoicing(frame.rightHandLandmarks);
        if (v > 0) detectedVoicing = v;
        detectedVol = calculateVolumeFromHeight(frame.rightHandLandmarks);
        detectedTilt = calculateHandTilt(frame.rightHandLandmarks, 'Right');
        detectedOctave = isThumbExtended(frame.rightHandLandmarks, 'Right') ? 0.5 : 1.0;
      } else if (frame.leftHandLandmarks) {
        detectedVol = calculateVolumeFromHeight(frame.leftHandLandmarks);
      }

      const raw: GestureDetectionResult = {
        chordDegree: detectedDegree,
        isMajorMode: detectedMajor,
        tiltValue: detectedTilt,
        qualityIndex: detectedVoicing,
        octaveMultiplier: detectedOctave,
        volume: detectedVol,
        filterFrequency: this.currentFilterFreq(),
        filterQ: this.currentFilterQ(),
        leftHandDetected: frame.leftHandLandmarks !== null,
        rightHandDetected: frame.rightHandLandmarks !== null,
        leftHandLandmarks: frame.leftHandLandmarks,
        rightHandLandmarks: frame.rightHandLandmarks,
        isLeftHandClosed: leftClosed,
        isRightHandClosed: rightClosed,
      };
      const smoothed = this.debouncer.process(raw, timestamp);

      const chordChanged =
        smoothed.chordDegree !== this.activeDegree() ||
        smoothed.isMajorMode !== this.isMajor() ||
        smoothed.qualityIndex !== this.voicingQuality() ||
        detectedOctave !== this.octaveShift();

      if (chordChanged) {
        this.activeDegree.set(smoothed.chordDegree);
        this.isMajor.set(smoothed.isMajorMode);
        this.voicingQuality.set(smoothed.qualityIndex);
        this.octaveShift.set(detectedOctave);
        this.triggerCurrentChord();
      } else if (!this.audioEngine.hasActiveVoices() && smoothed.chordDegree) {
        this.triggerCurrentChord();
      } else if (!smoothed.chordDegree && this.audioEngine.hasActiveVoices()) {
        this.activeDegree.set(null);
        this.audioEngine.stopVoices(true);
      }

      this.currentVolume.set(smoothed.volume);
      this.audioEngine.updateVolume(smoothed.volume);
      const sweep = calculateFilterSweep(detectedTilt);
      this.currentFilterFreq.set(Math.round(sweep.frequency));
      this.currentFilterQ.set(sweep.q);
      this.audioEngine.updateFilter(sweep.frequency, sweep.q);
    } else if (!isRecentKeyboard) {
      // No hands in frame: the sound must stop (140 ms grace against dropped frames)
      this.isHandClosed.set(false);
      if (timestamp - this.lastHandsSeenTime > 140) {
        if (this.handsDetected() || this.activeDegree() !== null || this.audioEngine.hasActiveVoices()) {
          this.handsDetected.set(false);
          this.activeDegree.set(null);
          this.audioEngine.stopVoices(true);
          this.debouncer.reset();
        }
      }
    }
  }

  private drawHandSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    width: number,
    height: number,
    color: string,
    label: string,
    crop: { sx: number; sy: number; sWidth: number; sHeight: number } | null,
    vW: number,
    vH: number
  ): void {
    if (!landmarks || landmarks.length < 21) return;
    // Mirror x because the video is shown as a selfie
    const pts = landmarks.map((pt) => {
      if (crop && vW > 0 && vH > 0) {
        const px = (1 - pt.x) * vW;
        const py = pt.y * vH;
        return { x: ((px - crop.sx) / crop.sWidth) * width, y: ((py - crop.sy) / crop.sHeight) * height };
      }
      return { x: (1 - pt.x) * width, y: pt.y * height };
    });

    const chains = [
      [0, 1, 2, 3, 4],
      [0, 5, 6, 7, 8],
      [0, 9, 10, 11, 12],
      [0, 13, 14, 15, 16],
      [0, 17, 18, 19, 20],
      [5, 9, 13, 17],
    ];

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    chains.forEach((chain) => {
      ctx.beginPath();
      chain.forEach((idx, i) => (i === 0 ? ctx.moveTo(pts[idx].x, pts[idx].y) : ctx.lineTo(pts[idx].x, pts[idx].y)));
      ctx.stroke();
    });
    ctx.fillStyle = '#ffffff';
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, [4, 8, 12, 16, 20].includes(i) ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Label pill under the wrist
    const wrist = pts[0];
    ctx.font = '600 12px system-ui, -apple-system, "Segoe UI", sans-serif';
    const textW = ctx.measureText(label).width;
    const x = wrist.x - textW / 2 - 10;
    const y = wrist.y + 16;
    ctx.fillStyle = 'rgba(13, 14, 18, 0.8)';
    ctx.beginPath();
    ctx.roundRect(x, y, textW + 20, 24, 12);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(label, x + 10, y + 16);
    ctx.restore();
  }

  /** Real oscilloscope of the audio output (analyser node), coloured by the chord degree. */
  private drawScope(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.audioEngine.getWaveformData(this.scopeBuffer);
    const [r, g, b] = degreeRgb(this.activeDegree());
    const playing = this.activeDegree() !== null && !this.isAudioMuted();
    const centerY = height * 0.5;
    const amp = Math.min(height * 0.16, 120);
    const data = this.scopeBuffer;
    const n = data.length;

    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      // Fade the trace at both edges
      const edge = Math.sin(t * Math.PI);
      const y = centerY + ((data[i] - 128) / 128) * amp * 2.2 * edge;
      const x = t * width;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${playing ? 0.55 : 0.12})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // ================================================================= helpers
  private markOnboardingSeen(): void {
    this.onboardingSeen.set(true);
    try {
      localStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      // private mode: ignore
    }
  }

  private safeStorageGet(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
}
