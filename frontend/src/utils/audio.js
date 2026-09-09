/**
 * Tactical Web Audio API Synthesizer.
 * Generates crisp, low-latency tactical radar and alert chimes natively.
 * Requires 0 external audio files or MP3 network downloads (100% offline-ready for venue presentations).
 */

class TacticalAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('rakshanet_audio_muted') === 'true';
  }

  getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('rakshanet_audio_muted', this.muted ? 'true' : 'false');
    return this.muted;
  }

  /**
   * Play high-tech tactical radar ping for new threats (880Hz -> 1760Hz).
   */
  playTacticalAlert() {
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Primary tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);

      // Secondary confirmation harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
      osc2.frequency.setValueAtTime(1760, now + 0.2); // A6

      gain2.gain.setValueAtTime(0.08, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.08);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.debug('Audio playback suppressed:', e);
    }
  }

  /**
   * Play deep resonant chime when an official Bank Lien is confirmed.
   */
  playLienConfirmed() {
    if (this.muted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Harmonic major chord (C5 - E5 - G5)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.45);
      });
    } catch (e) {
      console.debug('Audio playback suppressed:', e);
    }
  }
}

export const tacticalAudio = new TacticalAudioEngine();
