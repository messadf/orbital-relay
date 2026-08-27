const STORAGE_KEY = "orbital-relay-muted";

export class RelayAudio {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
    this.context = null;
    this.muted = this.storage?.getItem(STORAGE_KEY) === "true";
  }

  setMuted(value) {
    this.muted = Boolean(value);
    this.storage?.setItem(STORAGE_KEY, String(this.muted));
    return this.muted;
  }

  toggle() {
    return this.setMuted(!this.muted);
  }

  ensureContext() {
    if (this.muted) return null;
    const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContextClass) return null;
    this.context ||= new AudioContextClass();
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  }

  tone(frequency, duration = 0.06, delay = 0, volume = 0.035, type = "square") {
    const context = this.ensureContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  rotate() {
    this.tone(180, 0.045, 0, 0.025);
  }

  connected() {
    this.tone(280, 0.05, 0, 0.025);
  }

  success() {
    [392, 523, 659, 784].forEach((note, index) => this.tone(note, 0.16, index * 0.07, 0.035, "triangle"));
  }

  failure() {
    [190, 150, 110].forEach((note, index) => this.tone(note, 0.18, index * 0.1, 0.04, "sawtooth"));
  }
}

