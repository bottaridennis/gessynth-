import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {
  KeySignature,
  ScaleMode,
  SCALE_MODES,
  ScaleModeInfo,
  getScaleNotes,
  KEY_BASE_FREQUENCIES,
  SemitoneShift,
  calculateChordTones,
  getVoicingFrequencies,
  getChordDisplayName,
  DEGREE_COLORS,
} from './synth/music-theory';
import {
  GestureDetectionResult,
  GestureDebouncer,
  classifyLeftHandDegree,
  classifyRightHandVoicing,
  calculateHandTilt,
  calculateVolumeFromHeight,
  calculateFilterSweep,
  isThumbExtended,
  isHandClosed,
  Landmark,
} from './synth/gesture-classifier';
import {
  AudioEngine,
  INSTRUMENT_PRESETS,
  InstrumentPreset,
  SoundCustomParams,
  PRESET_DEFAULT_PARAMS,
} from './synth/audio-engine';
import { HandTrackerService } from './synth/hand-tracker';
import { TUTORIAL_STEPS, TutorialStep } from './synth/tutorial-data';

interface DegreeGuideItem {
  degree: number;
  roman: string;
  gesture: string;
  name: string;
}

@Component({
  selector: 'app-root',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:keydown)': 'handleKeyDown($event)',
    '(window:resize)': 'handleResize()',
  },
})
export class App implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('webcamVideo') webcamVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayCanvas') overlayCanvasRef!: ElementRef<HTMLCanvasElement>;

  readonly Math = Math;

  // Core App States
  readonly started = signal(false);
  readonly tutorialOpen = signal(false);
  readonly currentTutorialStepIndex = signal(0);
  readonly helpOpen = signal(false);
  readonly guideVisible = signal(true);
  readonly isVirtualMode = signal(false);
  readonly cameraStatus = signal<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');

  // Synth Configuration
  readonly selectedKey = signal<KeySignature>('A');
  readonly selectedScaleMode = signal<ScaleMode>('major');
  readonly selectedPreset = signal<InstrumentPreset>('warm');
  readonly isTwoHandedMode = signal(true);
  readonly semitoneShift = signal<SemitoneShift>('off');
  readonly isAudioMuted = signal(false);
  readonly audioUnlocked = signal(false);
  readonly soundRackOpen = signal(false);
  readonly customParams = signal<SoundCustomParams>({ ...PRESET_DEFAULT_PARAMS.warm });

  // Live Gesture States
  readonly activeDegree = signal<string | null>(null);
  readonly handsDetected = signal(false);
  readonly isHandClosed = signal(false);
  readonly isMajor = signal(true);
  readonly tiltValue = signal(0.3);
  readonly voicingQuality = signal(1); // 1 = Root, 2 = 1st, 3 = 7th, 4 = Dom/Dim
  readonly octaveShift = signal<number>(1.0);
  readonly currentVolume = signal(0.75);
  readonly currentFilterFreq = signal(1200);
  readonly currentFilterQ = signal(0.7);

  // Hand landmarks for drawing
  private liveLeftLandmarks: Landmark[] | null = null;
  private liveRightLandmarks: Landmark[] | null = null;

  // Services
  private readonly audioEngine = new AudioEngine();
  private readonly handTracker = new HandTrackerService();
  private readonly debouncer = new GestureDebouncer();
  private animationFrameId: number | null = null;
  private wavePhase = 0;
  private lastKeyboardInputTime = 0;
  private lastHandsSeenTime = 0;

  // On-screen keyboard bar visible by default
  readonly keyboardBarVisible = signal(true);

  // Static Data
  readonly keysList: KeySignature[] = ['A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab'];
  readonly scaleModesList: ScaleModeInfo[] = SCALE_MODES;
  readonly presetsList = INSTRUMENT_PRESETS;
  readonly tutorialSteps = TUTORIAL_STEPS;
  readonly waveformsList: SoundCustomParams['waveform'][] = ['auto', 'sine', 'triangle', 'sawtooth', 'square'];

  // Computed Values
  readonly currentTutorialStep = computed<TutorialStep>(() => {
    return this.tutorialSteps[this.currentTutorialStepIndex()] ?? this.tutorialSteps[0];
  });

  readonly isTutorialStepSatisfied = computed(() => {
    const step = this.currentTutorialStep();
    const deg = this.activeDegree();
    const maj = this.isMajor();
    const v = this.voicingQuality();

    if (!deg) return false;
    const degreeMatches = deg.toUpperCase() === step.targetDegree.toUpperCase();
    const majorMatches = maj === step.targetMajor;
    const voicingMatches = step.targetVoicing ? v === step.targetVoicing : true;

    return degreeMatches && majorMatches && voicingMatches;
  });

  readonly chordDisplayName = computed(() => {
    return getChordDisplayName(
      this.activeDegree(),
      this.isMajor(),
      this.selectedKey(),
      this.voicingQuality(),
      this.semitoneShift(),
      this.selectedScaleMode()
    );
  });

  readonly activeDegreeColor = computed(() => {
    const deg = this.activeDegree();
    if (!deg) return 'rgb(113, 113, 122)';
    const rgb = DEGREE_COLORS[deg.toUpperCase()] || [232, 161, 61];
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  });

  readonly volumeLedCount = computed(() => {
    if (this.cameraStatus() === 'active' && !this.handsDetected()) {
      return 0;
    }
    if (this.activeDegree() === null) {
      return 0;
    }
    return Math.round(this.currentVolume() * 8);
  });

  readonly guideDegreeRows = computed<DegreeGuideItem[]>(() => {
    const scale = getScaleNotes(this.selectedKey(), this.selectedScaleMode());
    const gestures = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '🤘', '🤟'];
    const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

    // Display descending 7 -> 1 like reference
    return [7, 6, 5, 4, 3, 2, 1].map((deg) => ({
      degree: deg,
      roman: romans[deg - 1],
      gesture: gestures[deg - 1],
      name: scale[deg - 1] || 'C',
    }));
  });

  readonly rightHandVoicings = computed(() => {
    if (this.isMajor()) {
      return [
        { index: 1, gesture: '1️⃣', label: 'Root' },
        { index: 2, gesture: '2️⃣', label: '1st' },
        { index: 3, gesture: '3️⃣', label: 'Maj 7' },
        { index: 4, gesture: '4️⃣', label: 'Dom 7' },
      ];
    } else {
      return [
        { index: 1, gesture: '1️⃣', label: 'Root' },
        { index: 2, gesture: '2️⃣', label: '1st' },
        { index: 3, gesture: '3️⃣', label: 'Min 7' },
        { index: 4, gesture: '4️⃣', label: 'Dim 7' },
      ];
    }
  });

  ngOnInit(): void {
    if (!this.isBrowser) return;

    // Check query params for autostart
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === '1') {
      this.startApp(true);
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.handTracker.stopCamera();
    this.audioEngine.destroy();
  }

  async startApp(skipCamera = false): Promise<void> {
    this.started.set(true);

    // Initialize Web Audio
    await this.audioEngine.init();
    this.audioUnlocked.set(true);

    if (skipCamera) {
      this.isVirtualMode.set(true);
      this.cameraStatus.set('idle');
      this.activeDegree.set('I');
      this.startRenderLoop();
      this.triggerCurrentChord();
      return;
    }

    // Attempt Camera and MediaPipe initialization
    this.activeDegree.set(null);
    this.handsDetected.set(false);
    this.cameraStatus.set('requesting');
    const mediaPipeReady = await this.handTracker.loadMediaPipe();

    if (this.webcamVideoRef?.nativeElement) {
      const cameraSuccess = await this.handTracker.startCamera(this.webcamVideoRef.nativeElement);
      if (cameraSuccess && mediaPipeReady) {
        this.cameraStatus.set('active');
        this.isVirtualMode.set(false);
      } else {
        this.cameraStatus.set(cameraSuccess ? 'active' : 'denied');
        this.isVirtualMode.set(true);
        this.activeDegree.set('I');
        this.triggerCurrentChord();
      }
    } else {
      this.isVirtualMode.set(true);
      this.activeDegree.set('I');
      this.triggerCurrentChord();
    }

    this.startRenderLoop();
    // In camera mode, audio only starts when hands are detected in frame
  }

  async toggleCameraMode(): Promise<void> {
    if (this.cameraStatus() === 'active') {
      this.handTracker.stopCamera(this.webcamVideoRef?.nativeElement);
      this.cameraStatus.set('idle');
      this.isVirtualMode.set(true);
      this.handsDetected.set(false);
      this.audioEngine.stopVoices(true);
      this.activeDegree.set('I');
      this.triggerCurrentChord();
    } else {
      this.audioEngine.stopVoices(true);
      this.activeDegree.set(null);
      this.handsDetected.set(false);
      this.cameraStatus.set('requesting');
      await this.handTracker.loadMediaPipe();
      if (this.webcamVideoRef?.nativeElement) {
        const ok = await this.handTracker.startCamera(this.webcamVideoRef.nativeElement);
        if (ok) {
          this.cameraStatus.set('active');
          this.isVirtualMode.set(false);
          this.handsDetected.set(false);
        } else {
          this.cameraStatus.set('denied');
          this.isVirtualMode.set(true);
          this.activeDegree.set('I');
          this.triggerCurrentChord();
        }
      }
    }
  }

  async unlockAudio(): Promise<void> {
    await this.audioEngine.init();
    this.audioUnlocked.set(true);
    this.triggerCurrentChord();
  }

  onKeyChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as KeySignature;
    this.selectedKey.set(val);
    this.triggerCurrentChord();
  }

  onScaleModeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as ScaleMode;
    this.selectedScaleMode.set(val);
    const modeInfo = SCALE_MODES.find((m) => m.id === val);
    if (modeInfo) {
      this.isMajor.set(modeInfo.defaultMajor);
    }
    this.triggerCurrentChord();
  }

  onToneChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as InstrumentPreset;
    this.selectedPreset.set(val);
    this.audioEngine.setPreset(val);
    this.customParams.set(this.audioEngine.getCustomParams());
  }

  toggleSoundRack(): void {
    this.soundRackOpen.update((v) => !v);
  }

  closeSoundRack(): void {
    this.soundRackOpen.set(false);
  }

  setCustomParam<K extends keyof SoundCustomParams>(key: K, value: SoundCustomParams[K]): void {
    this.audioEngine.updateCustomParams({ [key]: value });
    this.customParams.set(this.audioEngine.getCustomParams());
  }

  setWaveform(waveform: SoundCustomParams['waveform']): void {
    this.setCustomParam('waveform', waveform);
  }

  resetSoundParams(): void {
    this.audioEngine.resetCustomParamsToPreset();
    this.customParams.set(this.audioEngine.getCustomParams());
  }

  toggleGuide(): void {
    this.guideVisible.update((v) => !v);
  }

  openTutorial(): void {
    this.tutorialOpen.set(true);
    this.currentTutorialStepIndex.set(0);
    this.helpOpen.set(false);
    if (!this.started()) {
      this.startApp(true);
    }
  }

  closeTutorial(): void {
    this.tutorialOpen.set(false);
  }

  nextTutorialStep(): void {
    if (this.currentTutorialStepIndex() < this.tutorialSteps.length - 1) {
      this.currentTutorialStepIndex.update((i) => i + 1);
    } else {
      this.closeTutorial();
    }
  }

  prevTutorialStep(): void {
    if (this.currentTutorialStepIndex() > 0) {
      this.currentTutorialStepIndex.update((i) => i - 1);
    }
  }

  openHelp(): void {
    this.helpOpen.set(true);
  }

  closeHelp(): void {
    this.helpOpen.set(false);
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

  toggleKeyboardBar(): void {
    this.keyboardBarVisible.update((v) => !v);
  }

  // Interactive Virtual & Keyboard Controls
  setVirtualDegree(deg: string): void {
    this.lastKeyboardInputTime = performance.now();
    this.activeDegree.set(deg);
    this.triggerCurrentChord();
  }

  toggleVirtualMajorMinor(): void {
    this.lastKeyboardInputTime = performance.now();
    this.isMajor.update((m) => !m);
    this.tiltValue.set(this.isMajor() ? 0.35 : -0.35);
    this.triggerCurrentChord();
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

  setVirtualFilter(tilt: number): void {
    this.lastKeyboardInputTime = performance.now();
    this.tiltValue.set(tilt);
    const sweep = calculateFilterSweep(tilt);
    this.currentFilterFreq.set(Math.round(sweep.frequency));
    this.currentFilterQ.set(sweep.q);
    this.audioEngine.updateFilter(sweep.frequency, sweep.q);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.started()) return;
    const key = event.key.toLowerCase();

    // Auto-resume audio if needed on key press
    if (!this.audioUnlocked()) {
      this.audioEngine.init();
      this.audioUnlocked.set(true);
    }

    // Numbers 1-7: Degrees
    if (['1', '2', '3', '4', '5', '6', '7'].includes(key)) {
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
      this.setVirtualDegree(romans[parseInt(key, 10) - 1]);
    } else if (key === 'm') {
      this.toggleVirtualMajorMinor();
    } else if (key === 'q') {
      this.setVirtualVoicing(1); // Root
    } else if (key === 'w') {
      this.setVirtualVoicing(2); // 1st
    } else if (key === 'e') {
      this.setVirtualVoicing(3); // 7th
    } else if (key === 'r') {
      this.setVirtualVoicing(4); // Dom/Dim 7
    } else if (key === 'z') {
      this.setVirtualOctave(0.5); // Octave down
    } else if (key === 'x') {
      this.setVirtualOctave(2.0); // Octave up
    } else if (key === 'c') {
      this.setVirtualOctave(1.0); // Octave reset
    } else if (key === 'k') {
      this.toggleKeyboardBar();
    } else if (key === 's') {
      this.toggleSoundRack();
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
    } else if (key === '0' || key === 'escape' || key === 'backspace') {
      event.preventDefault();
      this.stopVirtualSound();
    } else if (key === ' ') {
      event.preventDefault();
      this.toggleMute();
    }
  }

  stopVirtualSound(): void {
    this.lastKeyboardInputTime = performance.now();
    this.activeDegree.set(null);
    this.audioEngine.panic();
  }

  handleResize(): void {
    if (!this.isBrowser) return;
    const canvas = this.overlayCanvasRef?.nativeElement;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

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
    const mult = this.octaveShift();
    const rawFrequencies = getVoicingFrequencies(tones, voicing, this.isMajor());
    const finalFrequencies = rawFrequencies.map((f) => f * mult);

    this.audioEngine.playFrequencies(finalFrequencies);
  }

  private startRenderLoop(): void {
    if (!this.isBrowser) return;

    const canvas = this.overlayCanvasRef?.nativeElement;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const loop = (timestamp: number) => {
      this.renderFrame(timestamp);
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private renderFrame(timestamp: number): void {
    const canvas = this.overlayCanvasRef?.nativeElement;
    const video = this.webcamVideoRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    let videoCrop: { sx: number; sy: number; sWidth: number; sHeight: number } | null = null;
    let vW = 0;
    let vH = 0;

    // 1. Process webcam if active
    if (this.cameraStatus() === 'active' && video && video.readyState >= 2) {
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
      videoCrop = { sx, sy, sWidth, sHeight };

      const frame = this.handTracker.detect(video, timestamp);
      this.liveLeftLandmarks = frame.leftHandLandmarks;
      this.liveRightLandmarks = frame.rightHandLandmarks;

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
        let isAnyHandClosed = false;

        if (this.isTwoHandedMode()) {
          // In two-handed mode: if either chord hand is closed or voicing hand is closed (choke/mute), silence!
          if (leftClosed || (frame.rightHandLandmarks && rightClosed)) {
            isAnyHandClosed = true;
            detectedDegree = null;
          } else if (frame.leftHandLandmarks) {
            detectedDegree = classifyLeftHandDegree(frame.leftHandLandmarks, 'Left');
            const tilt = calculateHandTilt(frame.leftHandLandmarks, 'Left');
            detectedTilt = tilt;
            detectedMajor = tilt >= 0;
          }
        } else {
          // Single-handed mode
          if (frame.leftHandLandmarks) {
            if (leftClosed) {
              isAnyHandClosed = true;
              detectedDegree = null;
            } else {
              detectedDegree = classifyLeftHandDegree(frame.leftHandLandmarks, 'Left');
              const tilt = calculateHandTilt(frame.leftHandLandmarks, 'Left');
              detectedTilt = tilt;
              detectedMajor = tilt >= 0;
            }
          } else if (frame.rightHandLandmarks) {
            if (rightClosed) {
              isAnyHandClosed = true;
              detectedDegree = null;
            } else {
              detectedDegree = classifyLeftHandDegree(frame.rightHandLandmarks, 'Right');
              const tilt = calculateHandTilt(frame.rightHandLandmarks, 'Right');
              detectedTilt = tilt;
              detectedMajor = tilt >= 0;
            }
          }
        }

        this.isHandClosed.set(isAnyHandClosed);

        let detectedVoicing = this.voicingQuality();
        let detectedVol = this.currentVolume();
        let detectedOctave = this.octaveShift();

        if (frame.rightHandLandmarks && this.isTwoHandedMode()) {
          const v = classifyRightHandVoicing(frame.rightHandLandmarks);
          if (v > 0) detectedVoicing = v;
          detectedVol = calculateVolumeFromHeight(frame.rightHandLandmarks);
          const rightTilt = calculateHandTilt(frame.rightHandLandmarks, 'Right');
          detectedTilt = rightTilt;
          const thumbOut = isThumbExtended(frame.rightHandLandmarks, 'Right');
          detectedOctave = thumbOut ? 0.5 : 1.0;
        } else if (frame.leftHandLandmarks) {
          detectedVol = calculateVolumeFromHeight(frame.leftHandLandmarks);
        }

        // Process through debouncer to prevent rapid chord jitter
        const rawResult: GestureDetectionResult = {
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

        const smoothed = this.debouncer.process(rawResult, timestamp);

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
          this.activeDegree.set(smoothed.chordDegree);
          this.triggerCurrentChord();
        } else if (!smoothed.chordDegree && this.audioEngine.hasActiveVoices()) {
          this.activeDegree.set(null);
          this.audioEngine.stopVoices(true);
        }

        // Smooth volume & filter updates
        this.currentVolume.set(smoothed.volume);
        this.audioEngine.updateVolume(smoothed.volume);

        const sweep = calculateFilterSweep(detectedTilt);
        this.currentFilterFreq.set(Math.round(sweep.frequency));
        this.currentFilterQ.set(sweep.q);
        this.audioEngine.updateFilter(sweep.frequency, sweep.q);
      } else if (!isRecentKeyboard) {
        // Se non vede le mani il suono si deve fermare
        this.isHandClosed.set(false);
        // Provide 140ms grace buffer to avoid single dropped frame micro-cuts
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

    // 2. Draw Background
    ctx.clearRect(0, 0, width, height);

    if (this.cameraStatus() === 'active' && video && video.readyState >= 2 && videoCrop) {
      // Draw mirrored video with subtle cinematic gradient overlay
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(
        video,
        videoCrop.sx,
        videoCrop.sy,
        videoCrop.sWidth,
        videoCrop.sHeight,
        0,
        0,
        width,
        height
      );
      ctx.restore();

      // Vignette & dark mood tint
      ctx.fillStyle = 'rgba(14, 14, 17, 0.40)';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Futuristic Dark Grid Canvas
      ctx.fillStyle = '#0e0e11';
      ctx.fillRect(0, 0, width, height);

      // Radial center ambient glow using active degree color
      const deg = this.activeDegree() || 'I';
      const rgb = DEGREE_COLORS[deg.toUpperCase()] || [232, 161, 61];
      const grad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.6);
      grad.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.08)`);
      grad.addColorStop(1, 'rgba(14, 14, 17, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle cybernetic dots grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      const step = 40;
      for (let x = 20; x < width; x += step) {
        for (let y = 20; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Draw Hand Skeletal Tracking (if landmarks present)
    if (this.liveLeftLandmarks) {
      const isClosed = isHandClosed(this.liveLeftLandmarks, 'Left');
      this.drawHandSkeleton(
        ctx,
        this.liveLeftLandmarks,
        width,
        height,
        isClosed ? 'rgba(244, 63, 94, 0.9)' : 'rgba(232, 161, 61, 0.85)',
        isClosed ? 'LEFT HAND • ✊ SILENZIO' : 'LEFT HAND',
        videoCrop,
        vW,
        vH,
        isClosed
      );
    }
    if (this.liveRightLandmarks) {
      const isClosed = isHandClosed(this.liveRightLandmarks, 'Right');
      this.drawHandSkeleton(
        ctx,
        this.liveRightLandmarks,
        width,
        height,
        isClosed ? 'rgba(244, 63, 94, 0.9)' : 'rgba(100, 200, 250, 0.85)',
        isClosed ? 'RIGHT HAND • ✊ SILENZIO' : 'RIGHT HAND',
        videoCrop,
        vW,
        vH,
        isClosed
      );
    }

    // 4. Draw Signature Audio Reactive Waveforms radiating from center
    this.drawReactiveWaves(ctx, width, height);
  }

  private drawHandSkeleton(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    width: number,
    height: number,
    color: string,
    label: string,
    crop: { sx: number; sy: number; sWidth: number; sHeight: number } | null = null,
    vW = 0,
    vH = 0,
    isClosed = false
  ): void {
    if (!landmarks || landmarks.length < 21) return;

    // Convert mirrored coords: x is inverted because of selfie camera
    const pts = landmarks.map((pt) => {
      if (crop && vW > 0 && vH > 0) {
        const rawPixelX = (1 - pt.x) * vW;
        const rawPixelY = pt.y * vH;
        const x = ((rawPixelX - crop.sx) / crop.sWidth) * width;
        const y = ((rawPixelY - crop.sy) / crop.sHeight) * height;
        return { x, y };
      }
      return {
        x: (1 - pt.x) * width,
        y: pt.y * height,
      };
    });

    // Hand connections
    const fingers = [
      [0, 1, 2, 3, 4],       // Thumb
      [0, 5, 6, 7, 8],       // Index
      [0, 9, 10, 11, 12],    // Middle
      [0, 13, 14, 15, 16],   // Ring
      [0, 17, 18, 19, 20],   // Pinky
      [5, 9, 13, 17],        // Knuckle bridge
    ];

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    fingers.forEach((chain) => {
      ctx.beginPath();
      chain.forEach((idx, i) => {
        const p = pts[idx];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    });

    // Draw joints
    pts.forEach((p, i) => {
      ctx.beginPath();
      const radius = i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? 5 : 3;
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isClosed ? '#fda4af' : '#ffffff';
      ctx.fill();
      ctx.stroke();
    });

    // Hand Label above palm
    const wrist = pts[0];
    ctx.font = isClosed ? 'bold 11px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(label, wrist.x - 30, wrist.y + 24);
    ctx.restore();
  }

  private drawReactiveWaves(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    this.wavePhase += 0.035;
    const deg = this.activeDegree() || 'I';
    const [r, g, b] = DEGREE_COLORS[deg.toUpperCase()] || [232, 161, 61];
    const isPlaying = this.activeDegree() !== null && !this.isAudioMuted();

    const centerX = width / 2;
    const centerY = height - 120; // Anchored near the bottom chord display
    const waveCount = 3;
    const waveLength = width * 0.42;

    ctx.save();

    for (let w = 0; w < waveCount; w++) {
      const direction = [1, -1]; // radiating both right and left
      direction.forEach((dir) => {
        ctx.beginPath();
        const startX = centerX + dir * 80;
        ctx.moveTo(startX, centerY);

        const segments = 40;
        const amplitude = isPlaying ? (12 + w * 9) * this.currentVolume() : 3;
        const freqFactor = (w + 1) * 2.2;

        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const x = startX + dir * (t * waveLength);
          const envelope = Math.sin(t * Math.PI); // Smooth pinch at endpoints
          const y = centerY + Math.sin(t * freqFactor * Math.PI + this.wavePhase + w) * amplitude * envelope;
          ctx.lineTo(x, y);
        }

        const alpha = isPlaying ? 0.8 - w * 0.22 : 0.15;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 2.5 - w * 0.5;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.shadowBlur = 12;
        ctx.stroke();
      });
    }

    ctx.restore();
  }
}
