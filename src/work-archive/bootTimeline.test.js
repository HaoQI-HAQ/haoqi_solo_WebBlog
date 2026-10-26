import test from 'node:test';
import assert from 'node:assert/strict';
import { WORK_BOOT_DURATION, WORK_BOOT_HOLD, WORK_BOOT_REVEAL, workBootFrame, scanOrbitTrack, track } from './bootTimeline.js';

test('the intro follows the reference editorial phases and hands off after the welcome', () => {
  const phases = [[0, 'access'], [4.2, 'logo'], [6.2, 'auth'], [14.5, 'scan'], [17.8, 'welcome'], [21.2, 'exit']];
  for (const [time, phase] of phases) assert.equal(workBootFrame(time).phase, phase);
  assert.ok(WORK_BOOT_HOLD < WORK_BOOT_REVEAL);
  assert.equal(workBootFrame(WORK_BOOT_HOLD).reveal, false);
  assert.equal(workBootFrame(WORK_BOOT_REVEAL).reveal, true);
  assert.equal(workBootFrame(WORK_BOOT_DURATION - .01).done, false);
  assert.equal(workBootFrame(WORK_BOOT_DURATION).done, true);
  assert.equal(workBootFrame(WORK_BOOT_DURATION).overlayOpacity, 0);
});

test('each frame is finite, deterministic and independent of seek direction', () => {
  const finite = value => {
    if (typeof value === 'number') assert.ok(Number.isFinite(value));
    if (value && typeof value === 'object') Object.values(value).forEach(finite);
  };
  const frames = Array.from({ length: 550 }, (_, index) => index / 25);
  const forward = frames.map(time => workBootFrame(time));
  forward.forEach(finite);
  frames.reverse().forEach(time => assert.deepEqual(workBootFrame(time), forward[Math.round(time * 25)]));
  assert.equal(workBootFrame(-1).time, 0);
  assert.equal(workBootFrame(NaN).time, 0);
});

test('typing holds real portfolio copy and does not imply authentication', () => {
  assert.equal(workBootFrame(2.7).access, 'OPENING CREATIVE ARCHIVE');
  assert.equal(workBootFrame(8.6).message, 'PORTFOLIO : HAOQI');
  assert.equal(workBootFrame(10.65).message, 'GAMES / PHOTO / MUSIC');
  assert.equal(workBootFrame(13.8).message, 'PREPARING ARCHIVE...');
  assert.equal(workBootFrame(3).logoOpacity, 0);
  assert.equal(workBootFrame(4.5).logoOpacity, 1);
});

test('the scan contracts continuously and its side arcs counter-rotate while growing', () => {
  const early = workBootFrame(15).scan, late = workBootFrame(16.6).scan;
  assert.ok(early.radius > late.radius);
  assert.ok(early.whiteRadius > late.whiteRadius);
  assert.ok(early.outerSweep < late.outerSweep);
  const first = scanOrbitTrack(551), last = scanOrbitTrack(568);
  assert.ok(last.sides[0].start > first.sides[0].start);
  assert.ok(last.sides[1].start < first.sides[1].start);
  assert.ok(last.sides[0].sweep > first.sides[0].sweep);
  assert.ok(last.sides[1].sweep > first.sides[1].sweep);
  assert.equal(last.satellites.length, 6);
  assert.ok(last.satellites.every(point => point.radius > 0));
});

test('measured interpolation preserves endpoints and never overshoots a monotone span', () => {
  const keys = [[0, 234], [1, 216], [2, 181], [4, 115], [7, 45], [12, 0]];
  assert.equal(track(keys, -1), 234);
  assert.equal(track(keys, 20), 0);
  let previous = 234;
  for (let time = 0; time <= 12; time += .025) {
    const next = track(keys, time);
    assert.ok(next <= previous + 1e-9);
    assert.ok(next >= 0);
    previous = next;
  }
});
