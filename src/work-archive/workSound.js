import { synthesizeSound } from './workSoundSynth.js';
import { createSoundController } from '../audio/siteSound.js';

export const WORK_SOUND_STORAGE = 'haoqi-work-sound';
// Timing adapted from LBEILC/RhineLabUI src/audio.ts (MIT), shifted to our boot.
export const WORK_BOOT_CUES = [
  [4.16, 'brand'], [6.84, 'confirm'], [14.48, 'scan'], [16.84, 'confirm'],
  [17.76, 'welcome'], [18.52, 'text-reveal'], [20.04, 'text-reveal'],
];

// Consume the same visible timeline as WorkBoot. Seeking, reduced motion and
// returning to a background tab must never replay a backlog of sounds.
export function bootSoundEvents(previous, current) {
  if (!previous || current.time <= previous.time || current.time - previous.time > .3) return [];
  const events = WORK_BOOT_CUES.filter(([time]) => previous.time < time && current.time >= time).map(([, type]) => type);
  const added = (field, opacity) => {
    if (current[opacity] <= 0 || !current[field]) return false;
    const before = previous[field] || '';
    return current[field].startsWith(before) ? /\S/.test(current[field].slice(before.length)) : current[field].length === 1;
  };
  if (added('access', 'accessOpacity') || added('message', 'messageOpacity')) events.push('key');
  return events;
}

/** The visual clock belongs to each Work visit; the audio device belongs to the site. */
export function createWorkSoundSession(controller) {
  let previousBoot, bootEnded = false;
  return {
    ...controller,
    play: (type, pan) => controller.activate(type, pan),
    bootFrame(frame, reduced = false) {
      if (!bootEnded && !reduced) bootSoundEvents(previousBoot, frame).forEach(type => controller.play(type));
      previousBoot = frame;
    },
    reveal() { if (bootEnded) return; bootEnded = true; controller.stop(); controller.play('array'); },
  };
}

// Standalone previews/tests can still own an isolated device. Production Work
// receives the persistent site controller through SiteSoundProvider instead.
export function createWorkSound(options = {}) {
  const controller = createSoundController({ storageKey: WORK_SOUND_STORAGE, toggleUnlock: true, synthesize: synthesizeSound, ...options });
  return createWorkSoundSession(controller);
}