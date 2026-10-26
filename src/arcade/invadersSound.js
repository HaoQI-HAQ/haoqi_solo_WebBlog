// Short, synthesized arcade cues. Nothing is loaded or played before a gesture.
export function createInvadersSound() {
  let context;
  let enabled = false;
  const voices = new Set();
  const silence = () => {
    for (const voice of voices) {
      try { voice.stop(); } catch { /* A finished voice needs no cleanup. */ }
    }
    voices.clear();
  };
  const wake = () => {
    if (!enabled) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    try {
      context ||= new AudioContext();
      void context.resume().catch(() => {});
    } catch { /* Sound is optional; the game remains playable. */ }
  };
  return {
    enable(value) {
      enabled = value;
      if (enabled) wake();
      else this.pause();
    },
    wake,
    pause() {
      silence();
      if (context?.state === 'running') void context.suspend().catch(() => {});
    },
    play(events) {
      if (!enabled || context?.state !== 'running') return;
      const tones = {
        shot: [620, 180, 0.07, 'square'],
        hit: [160, 70, 0.09, 'sawtooth'],
        'player-hit': [130, 30, 0.24, 'sawtooth'],
        ufo: [420, 690, 0.19, 'triangle'],
        wave: [260, 780, 0.25, 'triangle'],
        'game-over': [180, 45, 0.4, 'triangle'],
      };
      for (const event of events.slice(0, 4)) {
        const tone = tones[event.type];
        if (!tone || voices.size >= 8) continue;
        const [from, to, duration, type] = tone;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(from, now);
        oscillator.frequency.exponentialRampToValueAtTime(to, now + duration);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        oscillator.connect(gain).connect(context.destination);
        voices.add(oscillator);
        oscillator.onended = () => {
          voices.delete(oscillator);
          oscillator.disconnect();
          gain.disconnect();
        };
        oscillator.start(now);
        oscillator.stop(now + duration + 0.01);
      }
    },
    dispose() {
      enabled = false;
      silence();
      if (context) void context.close().catch(() => {});
    },
  };
}
