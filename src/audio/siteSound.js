import { synthesizeSiteSound } from './siteSoundSynth.js';

export const SITE_SOUND_STORAGE = 'haoqi-site-sound';

/** One effects device for the entire SPA. A fresh preference defaults to on;
 * the browser unlocks its device on the first real gesture, without an opt-in. */
export function createSoundController({ target = window, document: page = document, storage,
  storageKey = SITE_SOUND_STORAGE, toggleUnlock = false,
  createContext = () => new (target.AudioContext || target.webkitAudioContext)(),
  supported = Boolean(target.AudioContext || target.webkitAudioContext), synthesize = synthesizeSiteSound, onState = () => {} } = {}) {
  let enabled = true;
  // The former Work-only preference is intentionally not carried into this new
  // site-wide default. Subsequent explicit global mutes remain respected.
  try { storage ??= target.localStorage; enabled = storage?.getItem(storageKey) !== 'off'; } catch { /* private storage */ }
  let context, effects, master, compressor, disposed = false, unavailable = !supported, music = false;
  let voices = [], pendingResume, activation = 0;
  const last = new Map();
  const state = () => ({ enabled, unlocked: context?.state === 'running', unavailable });
  const publish = () => { if (!disposed) onState(state()); };
  const stop = () => {
    activation++;
    voices.forEach(voice => voice.stop(context?.currentTime || 0)); voices = []; last.clear();
  };
  const level = () => {
    if (!effects) return;
    const now = context.currentTime;
    effects.gain.cancelScheduledValues(now);
    effects.gain.setTargetAtTime(enabled ? .55 * (music ? .4 : 1) : 0, now, .025);
  };
  const suspend = () => {
    if (!context || disposed || context.state === 'closed') return;
    Promise.resolve(context.suspend()).then(async () => {
      // A late suspension can finish behind an earlier resume. Let that resume
      // settle (including its cleanup) before deciding whether to wake again.
      await pendingResume;
      if (!disposed && enabled && !page.hidden) return resume();
      publish();
    }).catch(() => {});
  };
  const resume = () => {
    if (!context || disposed || !enabled || page.hidden) return;
    if (context.state === 'running') return Promise.resolve();
    if (pendingResume) return pendingResume;
    pendingResume = Promise.resolve(context.resume()).then(() => {
      if (disposed) return;
      if (!enabled || page.hidden) suspend();
      publish();
    }).catch(() => publish()).finally(() => { pendingResume = undefined; });
    return pendingResume;
  };
  const wake = () => {
    if (disposed || unavailable || !enabled || page.hidden) return;
    try {
      if (!context) {
        context = createContext();
        effects = context.createGain(); master = context.createGain(); compressor = context.createDynamicsCompressor();
        master.gain.value = .8;
        compressor.threshold.value = -8; compressor.knee.value = 8; compressor.ratio.value = 6;
        compressor.attack.value = .003; compressor.release.value = .18;
        effects.connect(master); master.connect(compressor); compressor.connect(context.destination);
        level();
      }
      resume(); publish();
    } catch { unavailable = true; publish(); }
  };
  const play = (type, pan = 0) => {
    if (disposed || !enabled || page.hidden || context?.state !== 'running') return false;
    const now = context.currentTime;
    const gap = type === 'key' ? .024 : ['tick', 'column', 'filter'].includes(type) ? .055 : .12;
    if (now - (last.get(type) ?? -Infinity) < gap) return false;
    voices = voices.filter(voice => voice.end > now);
    while (voices.length >= 10) voices.shift().stop(now);
    try {
      voices.push(synthesize(context, effects, type, now + .005, pan)); last.set(type, now); return true;
    } catch { return false; }
  };
  const activate = (type, pan = 0) => {
    const token = ++activation;
    if (play(type, pan)) return true;
    // Only the current physical action may survive the device's brief resume.
    // Never queue boot frames, old clicks, hidden/muted events or autoplay.
    if (!pendingResume || !enabled || page.hidden || disposed || context?.state === 'running') return false;
    const requestedAt = Date.now();
    pendingResume.then(() => {
      if (activation === token && Date.now() - requestedAt < 200) play(type, pan);
    });
    return true;
  };
  const gesture = event => {
    if (event.isTrusted && !event.target?.closest?.('[data-site-sound-toggle],[data-work-sound-toggle]')) wake();
  };
  const setEnabled = value => {
    if (unavailable) return;
    enabled = Boolean(value); level();
    if (enabled) wake(); else { stop(); suspend(); }
    try { storage?.setItem(storageKey, enabled ? 'on' : 'off'); } catch { /* private storage */ }
    publish();
  };
  const toggle = () => setEnabled(toggleUnlock && enabled && context?.state !== 'running' ? true : !enabled);
  const visibility = () => { stop(); if (page.hidden) suspend(); else resume(); };
  const player = event => {
    const next = Boolean(event.detail?.isPlaying);
    if (next === music) return;
    music = next; level();
  };
  page.addEventListener('pointerdown', gesture, true);
  page.addEventListener('keydown', gesture, true);
  page.addEventListener('visibilitychange', visibility);
  target.addEventListener('haoqi-player-state', player);
  target.dispatchEvent(new Event('haoqi-player-request-state'));
  publish();
  return {
    state, play, activate, gesture, toggle, setEnabled, stop,
    dispose() {
      disposed = true; stop();
      page.removeEventListener('pointerdown', gesture, true);
      page.removeEventListener('keydown', gesture, true);
      page.removeEventListener('visibilitychange', visibility);
      target.removeEventListener('haoqi-player-state', player);
      if (context) {
        effects?.disconnect(); master?.disconnect(); compressor?.disconnect();
        Promise.resolve(context.close()).catch(() => {});
      }
    },
  };
}
