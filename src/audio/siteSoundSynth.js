/**
 * Original short interface sounds for HAOQI / STUDIO.
 * A shared glass / paper-air palette extends Work's existing sound language.
 * No device creation, media fetch, background music, or event listeners live here.
 */
import { synthesizeSound } from '../work-archive/workSoundSynth.js';

export const SITE_SOUND_TYPES = Object.freeze([
  'nav', 'menu-open', 'menu-close', 'filter', 'copy-success', 'home-enter',
  'gallery-next', 'gallery-prev',
]);

const customTypes = new Set(SITE_SOUND_TYPES);
const airBuffers = new WeakMap();

/** Same voice contract as Work: times use the supplied context's clock. */
export function synthesizeSiteSound(context, destination, type, at, pan = 0) {
  if (!customTypes.has(type)) return synthesizeSound(context, destination, type, at, pan);

  const output = context.createGain();
  const stereo = context.createStereoPanner();
  const direction = type === 'gallery-prev' ? -.28 : type === 'gallery-next' ? .28 : 0;
  stereo.pan.value = Math.max(-.65, Math.min(.65, pan || direction));
  output.connect(stereo);
  stereo.connect(destination);

  const sources = [];
  let remaining = 0;
  let end = at;
  let stopped = false;

  const voice = (source, path, gain, delay, duration, attack = .003) => {
    const start = at + delay;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(gain, start + Math.min(attack, duration * .3));
    envelope.gain.exponentialRampToValueAtTime(.000001, start + duration);
    envelope.gain.linearRampToValueAtTime(0, start + duration + .006);
    path[path.length - 1].connect(envelope);
    envelope.connect(output);
    sources.push(source);
    remaining++;
    source.onended = () => {
      for (const node of new Set([source, ...path, envelope])) node.disconnect();
      if (--remaining === 0) {
        output.disconnect();
        stereo.disconnect();
      }
    };
    source.start(start);
    source.stop(start + duration + .009);
    end = Math.max(end, start + duration + .009);
  };

  const tone = (frequency, to, gain, duration, delay = 0, attack = .003) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, at + delay);
    oscillator.frequency.exponentialRampToValueAtTime(to, at + delay + duration);
    voice(oscillator, [oscillator], gain, delay, duration, attack);
  };

  // Unequal modes give a contact with thin glass, rather than a long tuned bell.
  const glass = (frequency, gain, duration, delay = 0) => {
    tone(frequency, frequency * .998, gain, duration, delay);
    tone(frequency * 1.491, frequency * 1.486, gain * .29, duration * .58, delay, .002);
    tone(frequency * 2.137, frequency * 2.13, gain * .105, duration * .29, delay, .0015);
  };

  const air = (frequency, to, gain, duration, delay = 0) => {
    let buffer = airBuffers.get(context);
    if (!buffer) {
      buffer = context.createBuffer(1, Math.ceil(context.sampleRate * .24), context.sampleRate);
      const samples = buffer.getChannelData(0);
      let seed = 1741;
      for (let index = 0; index < samples.length; index++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        samples[index] = seed / 2147483648 - 1;
      }
      airBuffers.set(context, buffer);
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.Q.value = .85;
    filter.frequency.setValueAtTime(frequency, at + delay);
    filter.frequency.exponentialRampToValueAtTime(to, at + delay + duration);
    source.connect(filter);
    voice(source, [filter], gain, delay, duration, .007);
  };

  switch (type) {
    case 'nav':
      glass(1420, .048, .086);
      tone(2130, 2124, .009, .047, .024);
      break;
    case 'menu-open':
      air(1080, 2650, .027, .128);
      glass(1180, .029, .083);
      tone(1770, 1770, .016, .096, .045, .006);
      break;
    case 'menu-close':
      air(2280, 1030, .024, .103);
      tone(1416, 1180, .025, .094, 0, .005);
      tone(708, 590, .009, .061, .025, .004);
      break;
    case 'filter':
      glass(1840, .039, .061);
      break;
    case 'copy-success':
      glass(1180, .033, .078);
      glass(1770, .028, .105, .065);
      break;
    case 'home-enter':
      glass(885, .031, .126);
      glass(1327.5, .023, .148, .055);
      air(1450, 2850, .013, .128, .027);
      break;
    case 'gallery-next':
      glass(1575, .038, .081);
      air(1680, 2340, .018, .072, .012);
      break;
    case 'gallery-prev':
      glass(1400, .038, .081);
      air(2340, 1680, .018, .072, .012);
      break;
  }

  return {
    end,
    stop(now = context.currentTime) {
      if (stopped) return;
      stopped = true;
      const time = Math.max(now, context.currentTime);
      output.gain.cancelScheduledValues(time);
      output.gain.setValueAtTime(output.gain.value, time);
      output.gain.linearRampToValueAtTime(0, time + .012);
      for (const source of sources) {
        try { source.stop(time + .014); } catch { /* An already ended source is harmless. */ }
      }
    },
  };
}
