/**
 * WebAudio sound synthesizer for The Gateway
 * Zero external audio files required - 100% self-contained and offline-ready.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Check if muted preference is stored
    const saved = localStorage.getItem('gateway_sound_muted');
    if (saved !== null) {
      this.muted = saved === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('gateway_sound_muted', String(this.muted));
    return this.muted;
  }

  public playClick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio fallback silent
    }
  }

  public playStarPing(noteIndex: number = 0) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
      const freq = notes[noteIndex % notes.length];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  public playUnlock() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Harmonic triumphant arpeggio: C5 -> E5 -> G5 -> C6
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + i * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.46);
      });
    } catch {}
  }

  public playError() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {}
  }

  public playWhoosh() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Pink noise burst with bandpass sweep
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1.5;

      const now = this.ctx.currentTime;
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.51);
    } catch {}
  }

  public playFanfare() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [
        [523.25, 0.0, 0.4],
        [659.25, 0.08, 0.4],
        [783.99, 0.16, 0.4],
        [1046.50, 0.24, 0.8],
        [1318.51, 0.32, 1.2],
        [1567.98, 0.40, 1.4],
      ];

      chord.forEach(([freq, delay, dur]) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + delay;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.02);
      });
    } catch {}
  }
}

export const sound = new SoundController();

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'celebrate' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(30);
          break;
        case 'medium':
          navigator.vibrate(60);
          break;
        case 'heavy':
          navigator.vibrate([70, 40, 90]);
          break;
        case 'celebrate':
          navigator.vibrate([80, 50, 100, 50, 150]);
          break;
      }
    } catch {}
  }
}
