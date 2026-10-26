import assert from 'node:assert/strict';
import test from 'node:test';
import { FOLD_MARK_DURATION, FOLD_MARK_START, foldMarkFrame } from './foldMarkMotion.js';
import { workBootFrame } from './bootTimeline.js';

test('the two leaves close before the bridge and green tab finish the approved mark', () => {
  const early = foldMarkFrame(.12), bridge = foldMarkFrame(.65), done = foldMarkFrame(FOLD_MARK_DURATION);
  assert.ok(early.left.x < 0 && early.right.x > 0);
  assert.equal(early.bridge.scale, 0);
  assert.equal(bridge.tab.opacity, 0);
  assert.ok(bridge.bridge.scale > .9);
  assert.ok(Math.abs(bridge.left.x) < .1 && Math.abs(bridge.right.x) < .1);
  assert.deepEqual(done, {
    assembled: true,
    left: { x: -0, y: 0, angle: -0, opacity: 1 },
    right: { x: 0, y: -0, angle: 0, opacity: 1 },
    bridge: { scale: 1, opacity: 1 },
    tab: { y: -0, angle: -0, opacity: 1 },
  });
  assert.equal(workBootFrame(FOLD_MARK_START).logoOpacity, 1);
  assert.equal(workBootFrame(FOLD_MARK_START + FOLD_MARK_DURATION).phase, 'logo');
  assert.deepEqual(foldMarkFrame(6.12 - FOLD_MARK_START), done, 'auth retains the assembled mark');
});

test('logo animation is seekable, bounded and has a fully assembled reduced alternative', () => {
  const frames = Array.from({ length: 141 }, (_, i) => i / 100);
  const forward = frames.map(time => foldMarkFrame(time));
  frames.reverse().forEach(time => assert.deepEqual(foldMarkFrame(time), forward[Math.round(time * 100)]));
  let previous = 0;
  for (const state of forward) {
    assert.ok(state.bridge.scale >= previous && state.bridge.scale <= 1);
    previous = state.bridge.scale;
    assert.ok(state.left.x >= -22 && state.left.x <= 0);
    assert.ok(state.right.x >= 0 && state.right.x <= 22);
    for (const part of [state.left, state.right, state.bridge, state.tab]) {
      Object.values(part).forEach(value => assert.ok(Number.isFinite(value)));
      assert.ok(part.opacity >= 0 && part.opacity <= 1);
    }
  }
  assert.deepEqual(foldMarkFrame(-10, true), foldMarkFrame(FOLD_MARK_DURATION));
  assert.deepEqual(foldMarkFrame(NaN), foldMarkFrame(0));
});
