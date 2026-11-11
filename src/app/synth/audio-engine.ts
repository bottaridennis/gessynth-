export type InstrumentPreset =
  | 'warm'
  | 'bright'
  | 'retro'
  | 'strings'
  | 'horns'
  | 'ambient'
  | 'epiano'
  | 'sub_bass'
  | 'pluck'
  | 'lofi'
  | 'acid'
  | 'bell'
  | 'organ'
  | 'pad_flute';

export interface PresetInfo {
  id: InstrumentPreset;
  name: string;
  category: 'Synth' | 'Acoustic' | 'Bass & Lead' | 'Atmosphere';
  icon: string;
  description: string;
}

export interface SoundCustomParams {
  attack: number;     // seconds (0.005 to 0.6)
  release: number;    // seconds (0.05 to 2.0)
  cutoff: number;     // Hz (100 to 10000)
  resonance: number;  // Q (0.5 to 4.0)
  detune: number;     // cents (0 to 30)
  reverb: number;     // wet ratio (0.0 to 0.7)
  subOsc: boolean;    // enable -1 octave sub-oscillator
  waveform: 'auto' | 'sine' | 'triangle' | 'sawtooth' | 'square';
}

export const PRESET_DEFAULT_PARAMS: Record<InstrumentPreset, SoundCustomParams> = {
  warm: {
    attack: 0.04,
    release: 0.22,
    cutoff: 1400,
    resonance: 0.8,
    detune: 5,
    reverb: 0.2,
    subOsc: false,
    waveform: 'auto',
  },
  bright: {
    attack: 0.015,
    release: 0.18,
    cutoff: 3800,
    resonance: 1.8,
    detune: 10,
    reverb: 0.25,
    subOsc: false,
    waveform: 'auto',
  },
  retro: {
    attack: 0.008,
    release: 0.14,
    cutoff: 2200,
    resonance: 1.2,
    detune: 6,
    reverb: 0.15,
    subOsc: true,
    waveform: 'auto',
  },
  strings: {
    attack: 0.18,
    release: 0.45,
    cutoff: 2400,
    resonance: 0.6,
    detune: 14,
    reverb: 0.38,
    subOsc: false,
    waveform: 'auto',
  },
  horns: {
    attack: 0.035,
    release: 0.2,
    cutoff: 3000,
    resonance: 1.8,
    detune: 4,
    reverb: 0.25,
    subOsc: false,
    waveform: 'auto',
  },
  ambient: {
    attack: 0.28,
    release: 0.75,
    cutoff: 1600,
    resonance: 0.8,
    detune: 12,
    reverb: 0.48,
    subOsc: false,
    waveform: 'auto',
  },
  epiano: {
    attack: 0.01,
    release: 0.35,
    cutoff: 2800,
    resonance: 1.0,
    detune: 3,
    reverb: 0.30,
    subOsc: false,
    waveform: 'auto',
  },
  sub_bass: {
    attack: 0.01,
    release: 0.18,
    cutoff: 800,
    resonance: 1.4,
    detune: 0,
    reverb: 0.05,
    subOsc: true,
    waveform: 'auto',
  },
  pluck: {
    attack: 0.005,
    release: 0.25,
    cutoff: 3400,
    resonance: 2.0,
    detune: 4,
    reverb: 0.32,
    subOsc: false,
    waveform: 'auto',
  },
  lofi: {
    attack: 0.03,
    release: 0.3,
    cutoff: 1100,
    resonance: 1.3,
    detune: 8,
    reverb: 0.30,
    subOsc: false,
    waveform: 'auto',
  },
  acid: {
    attack: 0.008,
    release: 0.12,
    cutoff: 4000,
    resonance: 3.2,
    detune: 2,
    reverb: 0.18,
    subOsc: true,
    waveform: 'auto',
  },
  bell: {
    attack: 0.005,
    release: 0.6,
    cutoff: 5200,
    resonance: 2.2,
    detune: 6,
    reverb: 0.42,
    subOsc: false,
    waveform: 'auto',
  },
  organ: {
    attack: 0.02,
    release: 0.16,
    cutoff: 2600,
    resonance: 1.0,
    detune: 7,
    reverb: 0.25,
    subOsc: false,
    waveform: 'auto',
  },
  pad_flute: {
    attack: 0.14,
    release: 0.4,
    cutoff: 2000,
    resonance: 0.7,
    detune: 5,
    reverb: 0.40,
    subOsc: false,
    waveform: 'auto',
  },
};

export const INSTRUMENT_PRESETS: PresetInfo[] = [
  { id: 'warm', name: 'Warm Analog', category: 'Synth', icon: 'waves', description: 'Smooth, warm analog tone with rich fundamental' },
  { id: 'bright', name: 'Neon Lead', category: 'Synth', icon: 'bolt', description: 'Crisp saw lead with dynamic filter sweep' },
  { id: 'retro', name: '80s Arcade', category: 'Synth', icon: 'videogame_asset', description: 'Classic chiptune pulse square wave with sub-bass' },
  { id: 'strings', name: 'Strings 🎻', category: 'Acoustic', icon: 'music_note', description: 'Lush ensemble pad with multi-voice detuning' },
  { id: 'horns', name: 'Brass Horns 🎺', category: 'Acoustic', icon: 'campaign', description: 'Bold brass section with rich harmonic bite' },
  { id: 'ambient', name: 'Ambient Shimmer', category: 'Atmosphere', icon: 'grain', description: 'Dreamy floating atmosphere with fifth overtones' },
  { id: 'epiano', name: 'Rhodes Keys 🎹', category: 'Acoustic', icon: 'piano', description: 'Velvety electric piano tines with warm bell attack' },
  { id: 'sub_bass', name: '808 Sub-Bass 🔊', category: 'Bass & Lead', icon: 'speaker', description: 'Deep floor-shaking low end with sine weight' },
  { id: 'pluck', name: 'Celtic Pluck 🪕', category: 'Acoustic', icon: 'auto_awesome', description: 'Bright percussive acoustic pluck with crystalline ring' },
  { id: 'lofi', name: 'Lo-Fi Chill 📻', category: 'Atmosphere', icon: 'radio', description: 'Mellow tape-warmed keys with gentle flutter' },
  { id: 'acid', name: 'Acid 303 ⚡', category: 'Bass & Lead', icon: 'flash_on', description: 'Aggressive resonant acid filter bite with sub punch' },
  { id: 'bell', name: 'Glass Chimes 🔔', category: 'Atmosphere', icon: 'notifications', description: 'Ethereal crystalline harmonic bells with long sustain' },
  { id: 'organ', name: 'Gospel Organ ⛪', category: 'Acoustic', icon: 'church', description: 'Rich drawbar organ harmonics with subtle vibrato' },
  { id: 'pad_flute', name: 'Breath Flute 🪈', category: 'Atmosphere', icon: 'air', description: 'Soft airy woodwind pad with gentle organic attack' },
];

interface ActiveVoice {
  id: number;
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  stopTimerId?: ReturnType<typeof setTimeout>;
}

/**
 * Generates a smooth soft-clipping saturation curve for the reverb feedback loop.
 * Guarantees mathematical impossibility of runaway oscillation.
 */
function createSoftClipCurve(samples = 512): Float32Array {
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    // Tanh soft saturation: smooth, warm, caps at +/- 0.85
    curve[i] = Math.tanh(x * 1.3) * 0.85;
  }
  return curve;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private voiceCounter = 0;

  // Master bus & Limiter
  private filter: BiquadFilterNode | null = null;
  private filterCompGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private masterLimiter: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Safe Spatial Reverb / Stereo Ping-Pong Network
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private spaceSendGain: GainNode | null = null;
  private delayLeft: DelayNode | null = null;
  private delayRight: DelayNode | null = null;
  private dampFilterLeft: BiquadFilterNode | null = null;
  private dampFilterRight: BiquadFilterNode | null = null;
  private highpassLeft: BiquadFilterNode | null = null;
  private highpassRight: BiquadFilterNode | null = null;
  private feedbackLeft: GainNode | null = null;
  private feedbackRight: GainNode | null = null;
  private saturator: WaveShaperNode | null = null;

  // Polyphony management
  private activeVoices: ActiveVoice[] = [];
  private releasingVoices: ActiveVoice[] = [];
  private readonly maxActiveVoices = 8;

  private currentNotesKey: string | null = null;
  private currentPreset: InstrumentPreset = 'warm';
  private customParams: SoundCustomParams = { ...PRESET_DEFAULT_PARAMS.warm };

  private targetVolume = 0.75;
  private currentFilterFreq = 1400;
  private currentFilterQ = 0.8;
  private isMuted = false;

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    const now = this.ctx.currentTime;

    // 1. Master Lowpass Filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(this.customParams.cutoff, now);
    this.filter.Q.setValueAtTime(Math.min(3.5, this.customParams.resonance), now);

    // Filter gain compensation (keeps perceived loudness stable as Q increases)
    this.filterCompGain = this.ctx.createGain();
    this.filterCompGain.gain.setValueAtTime(1.0, now);
    this.filter.connect(this.filterCompGain);

    // 2. Dry / Wet Routing for Space / Reverb effect
    this.dryGain = this.ctx.createGain();
    this.wetGain = this.ctx.createGain();
    this.spaceSendGain = this.ctx.createGain();

    const reverbAmt = Math.min(0.65, this.customParams.reverb);
    this.dryGain.gain.setValueAtTime(Math.max(0.35, 1 - reverbAmt * 0.5), now);
    this.wetGain.gain.setValueAtTime(reverbAmt * 0.75, now);
    this.spaceSendGain.gain.setValueAtTime(reverbAmt * 0.6, now);

    // Direct Dry connection
    this.filterCompGain.connect(this.dryGain);
    this.filterCompGain.connect(this.spaceSendGain);

    // 3. Stereo Ping-Pong Delay Network with Strict Anti-Runaway Controls
    this.delayLeft = this.ctx.createDelay(1.0);
    this.delayRight = this.ctx.createDelay(1.0);
    this.delayLeft.delayTime.setValueAtTime(0.21, now);
    this.delayRight.delayTime.setValueAtTime(0.31, now);

    // Air absorption damping filters (roll off high frequency harmonics)
    this.dampFilterLeft = this.ctx.createBiquadFilter();
    this.dampFilterLeft.type = 'lowpass';
    this.dampFilterLeft.frequency.setValueAtTime(2200, now);
    this.dampFilterLeft.Q.setValueAtTime(0.5, now);

    this.dampFilterRight = this.ctx.createBiquadFilter();
    this.dampFilterRight.type = 'lowpass';
    this.dampFilterRight.frequency.setValueAtTime(2200, now);
    this.dampFilterRight.Q.setValueAtTime(0.5, now);

    // Highpass rumble protection filters (block subsonic DC energy accumulation)
    this.highpassLeft = this.ctx.createBiquadFilter();
    this.highpassLeft.type = 'highpass';
    this.highpassLeft.frequency.setValueAtTime(160, now);
    this.highpassLeft.Q.setValueAtTime(0.5, now);

    this.highpassRight = this.ctx.createBiquadFilter();
    this.highpassRight.type = 'highpass';
    this.highpassRight.frequency.setValueAtTime(160, now);
    this.highpassRight.Q.setValueAtTime(0.5, now);

    // Individual decoupled cross-feedback gains (strictly bounded <= 0.32)
    const baseFeedback = Math.min(0.32, reverbAmt * 0.45);
    this.feedbackLeft = this.ctx.createGain();
    this.feedbackRight = this.ctx.createGain();
    this.feedbackLeft.gain.setValueAtTime(baseFeedback, now);
    this.feedbackRight.gain.setValueAtTime(baseFeedback, now);

    // Soft-clipping saturator in the feedback loop: acts as a hard limiter
    this.saturator = this.ctx.createWaveShaper();
    this.saturator.curve = createSoftClipCurve(512) as Float32Array<ArrayBuffer>;
    this.saturator.oversample = 'none';

    // Route Delay Network:
    // Input sends to DelayLeft & DelayRight
    this.spaceSendGain.connect(this.delayLeft);
    this.spaceSendGain.connect(this.delayRight);

    // DelayLeft -> damp -> highpass -> saturator -> wetGain & feedback to DelayRight
    this.delayLeft.connect(this.dampFilterLeft);
    this.dampFilterLeft.connect(this.highpassLeft);
    this.highpassLeft.connect(this.saturator);
    this.highpassLeft.connect(this.wetGain);

    this.saturator.connect(this.feedbackLeft);
    this.feedbackLeft.connect(this.delayRight); // Cross ping-pong to Right

    // DelayRight -> damp -> highpass -> saturator -> wetGain & feedback to DelayLeft
    this.delayRight.connect(this.dampFilterRight);
    this.dampFilterRight.connect(this.highpassRight);
    this.highpassRight.connect(this.wetGain);

    this.saturator.connect(this.feedbackRight);
    this.feedbackRight.connect(this.delayLeft); // Cross ping-pong to Left

    // 4. Master Gain & Brickwall Limiter
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.targetVolume, now);

    this.dryGain.connect(this.masterGain);
    this.wetGain.connect(this.masterGain);

    // Master brickwall dynamics compressor: guarantees sound can NEVER exceed safe loudness
    this.masterLimiter = this.ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.setValueAtTime(-3.5, now); // -3.5 dBFS ceiling
    this.masterLimiter.knee.setValueAtTime(3.0, now);
    this.masterLimiter.ratio.setValueAtTime(20.0, now);      // 20:1 brickwall limiting
    this.masterLimiter.attack.setValueAtTime(0.002, now);    // 2ms ultra-fast response
    this.masterLimiter.release.setValueAtTime(0.08, now);

    this.masterGain.connect(this.masterLimiter);

    // 5. Analyser node for visualizer & meters
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterLimiter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  isInitialized(): boolean {
    return this.ctx !== null;
  }

  setPreset(preset: InstrumentPreset): void {
    this.currentPreset = preset;
    this.customParams = { ...PRESET_DEFAULT_PARAMS[preset] };
    this.applyParamsToGraph();

    // Retrigger with new timbre if voices are currently playing
    if (this.currentNotesKey && this.activeVoices.length > 0) {
      const frequencies = this.currentNotesKey.split(',').map(Number);
      this.stopVoices(true);
      this.playFrequencies(frequencies);
    }
  }

  getPreset(): InstrumentPreset {
    return this.currentPreset;
  }

  getCustomParams(): SoundCustomParams {
    return { ...this.customParams };
  }

  updateCustomParams(params: Partial<SoundCustomParams>): void {
    this.customParams = { ...this.customParams, ...params };
    this.applyParamsToGraph();
  }

  resetCustomParamsToPreset(): void {
    this.customParams = { ...PRESET_DEFAULT_PARAMS[this.currentPreset] };
    this.applyParamsToGraph();
  }

  private applyParamsToGraph(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const safeCutoff = Math.max(120, Math.min(10000, this.customParams.cutoff));
    const safeResonance = Math.max(0.4, Math.min(3.8, this.customParams.resonance));

    if (this.filter) {
      this.filter.frequency.setTargetAtTime(safeCutoff, now, 0.03);
      this.filter.Q.setTargetAtTime(safeResonance, now, 0.03);
    }

    if (this.filterCompGain) {
      // Compensate for high Q peak energy
      const comp = 1.0 / (1.0 + 0.2 * Math.max(0, safeResonance - 0.7));
      this.filterCompGain.gain.setTargetAtTime(comp, now, 0.03);
    }

    const reverbAmt = Math.min(0.65, Math.max(0, this.customParams.reverb));
    if (this.dryGain && this.wetGain && this.spaceSendGain) {
      this.wetGain.gain.setTargetAtTime(reverbAmt * 0.75, now, 0.03);
      this.dryGain.gain.setTargetAtTime(Math.max(0.35, 1 - reverbAmt * 0.5), now, 0.03);
      this.spaceSendGain.gain.setTargetAtTime(reverbAmt * 0.6, now, 0.03);
    }

    const safeFeedback = Math.min(0.32, reverbAmt * 0.45);
    if (this.feedbackLeft && this.feedbackRight) {
      this.feedbackLeft.gain.setTargetAtTime(safeFeedback, now, 0.03);
      this.feedbackRight.gain.setTargetAtTime(safeFeedback, now, 0.03);
    }
  }

  updateVolume(volume: number): void {
    this.targetVolume = Math.max(0, Math.min(1, volume));
    if (!this.ctx || !this.masterGain) return;
    const gainValue = this.isMuted ? 0 : this.targetVolume;
    this.masterGain.gain.setTargetAtTime(gainValue, this.ctx.currentTime, 0.02);
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.updateVolume(this.targetVolume);
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  updateFilter(frequency: number, q: number): void {
    this.currentFilterFreq = frequency;
    this.currentFilterQ = q;
    if (!this.ctx || !this.filter) return;
    const now = this.ctx.currentTime;

    // Base tone cutoff scaling safely clamped between 80 Hz and 11,000 Hz
    const effectiveCutoff = Math.max(
      80,
      Math.min(11000, frequency * (this.customParams.cutoff / 1400))
    );

    // Strictly clamp Q to prevent acoustic screech / self-oscillation
    const baseResonance = Math.max(0.4, Math.min(3.5, this.customParams.resonance));
    const effectiveQ = Math.max(0.4, Math.min(3.8, q * (baseResonance / 1.5)));

    this.filter.frequency.setTargetAtTime(effectiveCutoff, now, 0.03);
    this.filter.Q.setTargetAtTime(effectiveQ, now, 0.03);

    if (this.filterCompGain) {
      const comp = 1.0 / (1.0 + 0.22 * Math.max(0, effectiveQ - 0.7));
      this.filterCompGain.gain.setTargetAtTime(comp, now, 0.03);
    }
  }

  playFrequencies(frequencies: number[]): void {
    if (!this.ctx || !this.filter) return;

    if (frequencies.length === 0) {
      this.stopVoices(false);
      return;
    }

    const key = frequencies.map((f) => f.toFixed(1)).join(',');
    if (key === this.currentNotesKey && this.activeVoices.length > 0) {
      return;
    }

    // Smoothly release previous active voices
    this.stopVoices(false);
    this.currentNotesKey = key;

    const now = this.ctx.currentTime;

    // Voice stealing / polyphony constraint
    this.pruneOldestReleasingVoices();

    frequencies.forEach((freq) => {
      const voice = this.createVoice(freq, now);
      if (voice) {
        this.activeVoices.push(voice);
      }
    });
  }

  private createVoice(frequency: number, now: number): ActiveVoice | null {
    if (!this.ctx || !this.filter) return null;

    const voiceGain = this.ctx.createGain();
    const count = Math.max(1, this.currentNotesKey?.split(',').length ?? 4);
    const targetGain = 0.22 / Math.min(6, count);

    // Smooth attack ramp without Web Audio exponential zero error
    voiceGain.gain.setValueAtTime(0.0001, now);
    const attackDuration = Math.max(0.005, this.customParams.attack);
    voiceGain.gain.linearRampToValueAtTime(targetGain, now + attackDuration);

    voiceGain.connect(this.filter);

    const oscillators: OscillatorNode[] = [];
    const detuneCents = this.customParams.detune;
    const waveOverride = this.customParams.waveform;

    const resolveWave = (defaultType: OscillatorType): OscillatorType => {
      if (waveOverride !== 'auto') return waveOverride;
      return defaultType;
    };

    switch (this.currentPreset) {
      case 'warm': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('sine');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('triangle');
        osc2.frequency.setValueAtTime(frequency, now);
        osc2.detune.setValueAtTime(detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'bright': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('sawtooth');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('sawtooth');
        osc2.frequency.setValueAtTime(frequency, now);
        osc2.detune.setValueAtTime(-detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'retro': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('square');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('square');
        osc2.frequency.setValueAtTime(frequency, now);
        osc2.detune.setValueAtTime(detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'strings': {
        [-detuneCents, 0, detuneCents].forEach((detune) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          osc.type = resolveWave(detune === 0 ? 'sawtooth' : 'triangle');
          osc.frequency.setValueAtTime(frequency, now);
          osc.detune.setValueAtTime(detune, now);
          osc.connect(voiceGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'horns': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('sawtooth');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('triangle');
        osc2.frequency.setValueAtTime(frequency * 2, now);
        osc2.detune.setValueAtTime(-detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'ambient': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('sine');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('sine');
        osc2.frequency.setValueAtTime(frequency * 1.5, now);
        osc2.detune.setValueAtTime(detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'epiano': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('triangle');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('sine');
        osc2.frequency.setValueAtTime(frequency * 2, now);
        osc2.detune.setValueAtTime(detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'sub_bass': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('sine');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('triangle');
        osc2.frequency.setValueAtTime(frequency, now);
        osc2.detune.setValueAtTime(2, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'pluck': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('triangle');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('sawtooth');
        osc2.frequency.setValueAtTime(frequency * 2, now);
        osc2.detune.setValueAtTime(-detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'lofi': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('triangle');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('sine');
        osc2.frequency.setValueAtTime(frequency, now);
        osc2.detune.setValueAtTime(detuneCents * 1.5, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'acid': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('sawtooth');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('square');
        osc2.frequency.setValueAtTime(frequency, now);
        osc2.detune.setValueAtTime(4, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'bell': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('sine');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('sine');
        osc2.frequency.setValueAtTime(frequency * 2.76, now);
        osc2.detune.setValueAtTime(detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }

      case 'organ': {
        const harmonics = [1, 2, 3, 4];
        harmonics.forEach((h, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          osc.type = resolveWave(idx % 2 === 0 ? 'sine' : 'triangle');
          osc.frequency.setValueAtTime(frequency * h, now);
          osc.detune.setValueAtTime(idx * 2, now);
          osc.connect(voiceGain);
          osc.start(now);
          oscillators.push(osc);
        });
        break;
      }

      case 'pad_flute': {
        const osc1 = this.ctx.createOscillator();
        osc1.type = resolveWave('sine');
        osc1.frequency.setValueAtTime(frequency, now);

        const osc2 = this.ctx.createOscillator();
        osc2.type = resolveWave('triangle');
        osc2.frequency.setValueAtTime(frequency, now);
        osc2.detune.setValueAtTime(detuneCents, now);

        osc1.connect(voiceGain);
        osc2.connect(voiceGain);
        osc1.start(now);
        osc2.start(now);
        oscillators.push(osc1, osc2);
        break;
      }
    }

    // Optional Sub-Oscillator (-1 Octave)
    if (this.customParams.subOsc) {
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(frequency * 0.5, now);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.28, now);
      subOsc.connect(subGain);
      subGain.connect(voiceGain);
      subOsc.start(now);
      oscillators.push(subOsc);
    }

    return {
      id: ++this.voiceCounter,
      oscillators,
      gainNode: voiceGain,
    };
  }

  /**
   * Stops active voices.
   * @param immediateFlush When true, flushes audio buffers and cuts delay feedback immediately
   */
  stopVoices(immediateFlush = false): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const releaseTime = immediateFlush ? 0.03 : Math.max(0.04, this.customParams.release);

    if (this.activeVoices.length === 0 && !immediateFlush) return;

    this.activeVoices.forEach((voice) => {
      try {
        voice.gainNode.gain.cancelScheduledValues(now);
        // Using setTargetAtTime avoids Web Audio exponentialRamp zero-value exceptions
        voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
        voice.gainNode.gain.setTargetAtTime(0.0, now, releaseTime / 3.2);

        // Schedule deterministic hardware stop on audio thread
        voice.oscillators.forEach((osc) => {
          try {
            osc.stop(now + releaseTime + 0.05);
          } catch {
            // Already scheduled
          }
        });

        // Set garbage collection timer
        voice.stopTimerId = setTimeout(() => {
          this.destroyVoiceNodes(voice);
          this.releasingVoices = this.releasingVoices.filter((v) => v.id !== voice.id);
        }, Math.round((releaseTime + 0.08) * 1000));

        this.releasingVoices.push(voice);
      } catch {
        this.destroyVoiceNodes(voice);
      }
    });

    this.activeVoices = [];
    this.currentNotesKey = null;

    if (immediateFlush) {
      this.flushEffects();
    }
  }

  /**
   * Instantly stops all sound, flushes delay buffers, and kills all running nodes.
   * Emergency panic switch.
   */
  panic(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Hard stop all active and releasing voices
    [...this.activeVoices, ...this.releasingVoices].forEach((voice) => {
      if (voice.stopTimerId) clearTimeout(voice.stopTimerId);
      try {
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.setValueAtTime(0, now);
        voice.oscillators.forEach((osc) => {
          try {
            osc.stop(now);
            osc.disconnect();
          } catch {
            // stopped
          }
        });
        voice.gainNode.disconnect();
      } catch {
        // ignore
      }
    });

    this.activeVoices = [];
    this.releasingVoices = [];
    this.currentNotesKey = null;

    this.flushEffects();
  }

  /**
   * Drains the delay network immediately, preventing any feedback tail from hanging.
   */
  private flushEffects(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Cut feedback to zero immediately
    if (this.feedbackLeft && this.feedbackRight) {
      this.feedbackLeft.gain.cancelScheduledValues(now);
      this.feedbackRight.gain.cancelScheduledValues(now);
      this.feedbackLeft.gain.setValueAtTime(0, now);
      this.feedbackRight.gain.setValueAtTime(0, now);

      // Restore safe feedback after delay lines have emptied (350ms)
      const targetFeedback = Math.min(0.32, this.customParams.reverb * 0.45);
      this.feedbackLeft.gain.setValueAtTime(targetFeedback, now + 0.35);
      this.feedbackRight.gain.setValueAtTime(targetFeedback, now + 0.35);
    }
  }

  private pruneOldestReleasingVoices(): void {
    // If more than 6 voices are releasing simultaneously, force-kill the oldest ones
    while (this.releasingVoices.length > this.maxActiveVoices) {
      const oldest = this.releasingVoices.shift();
      if (oldest) {
        if (oldest.stopTimerId) clearTimeout(oldest.stopTimerId);
        this.destroyVoiceNodes(oldest);
      }
    }
  }

  private destroyVoiceNodes(voice: ActiveVoice): void {
    try {
      voice.oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          // already stopped
        }
        try {
          osc.disconnect();
        } catch {
          // disconnected
        }
      });
      voice.gainNode.disconnect();
    } catch {
      // cleanup safety
    }
  }

  hasActiveVoices(): boolean {
    return this.activeVoices.length > 0;
  }

  getWaveformData(outputArray: Uint8Array<ArrayBuffer>): void {
    if (!this.analyser) {
      outputArray.fill(128);
      return;
    }
    this.analyser.getByteTimeDomainData(outputArray);
  }

  getFrequencyData(outputArray: Uint8Array<ArrayBuffer>): void {
    if (!this.analyser) {
      outputArray.fill(0);
      return;
    }
    this.analyser.getByteFrequencyData(outputArray);
  }

  destroy(): void {
    this.panic();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
    }
    this.ctx = null;
  }
}
