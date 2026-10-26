import { baselineSelectionWave, columnStrength, idleWave, settlingWave } from './motion.ts';

// The reference's settled scan leaves one broad shoulder around the current
// archive. This fixed sample preserves that terrain while time only drives the
// quiet idle breath and short interaction ripples. See the adjacent MIT notice.
const SETTLED_SCAN_TIME = 26.56;
const RIPPLE_LIMIT = .6;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const smooth = value => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

export const ARRAY_MOTION_BOUNDS = Object.freeze({
  terrainMin: -.44,
  terrainMax: 2.21,
  breathingAmplitude: .102,
  rippleAmplitude: RIPPLE_LIMIT,
  minHeight: -1.142,
  maxHeight: 2.912,
});

// focusLane/focusRow are the damped camera-track coordinates, never the newly
// selected integer coordinates. The shoulder then travels with the array rather
// than replacing every case's altitude on the selection frame.
export function arrayTerrainHeight(lane, row, focusLane = 0, focusRow = 0) {
  return settlingWave(row - focusRow, SETTLED_SCAN_TIME) * columnStrength(lane, focusLane);
}

export function arraySelectionRipple(lane, row, time, pulses = []) {
  let ripple = 0;
  for (const pulse of pulses) {
    const age = time - pulse.time;
    if (age < 0 || age > 3.2) continue;
    // The original signed packet propagates between columns as well as rows.
    // A physical column is much wider than a row gap, hence the 2.2 ratio.
    const distance = Math.hypot(row - pulse.row, (lane - pulse.lane) * 2.2);
    ripple += baselineSelectionWave(distance, age);
  }
  return clamp(ripple, -RIPPLE_LIMIT, RIPPLE_LIMIT);
}

export function sampleArrayMotion(lane, row, time, options = {}) {
  const {
    focusLane = 0, focusRow = 0, detail = 0, reduced = false,
    pulses = [], idleGain = 1, pulseGain = 1,
  } = options;
  const dynamicGain = reduced ? 0 : 1 - smooth(detail);
  const breathGain = dynamicGain * clamp(idleGain, 0, 1);
  const interactionGain = dynamicGain * clamp(pulseGain, 0, 1);
  const sample = atRow => {
    const terrain = arrayTerrainHeight(lane, atRow, focusLane, focusRow);
    const breathing = breathGain ? idleWave(atRow, lane, time) * breathGain : 0;
    const ripple = interactionGain ? arraySelectionRipple(lane, atRow, time, pulses) * interactionGain : 0;
    return { height: terrain + breathing + ripple, terrain, breathing, ripple };
  };
  const result = sample(row);
  // Cases follow the shared surface's slope. There is no per-case random spin.
  const tilt = (sample(row + .5).height - sample(row - .5).height) * .024;
  return { ...result, tilt };
}
