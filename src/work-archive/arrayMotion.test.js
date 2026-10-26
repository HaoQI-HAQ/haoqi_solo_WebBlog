import assert from 'node:assert/strict';
import test from 'node:test';
import { ARRAY_MOTION_BOUNDS, arraySelectionRipple, arrayTerrainHeight, sampleArrayMotion } from './arrayMotion.js';

test('the settled array forms a broad shoulder with lower neighbouring columns and a shallow trough', () => {
  const center = arrayTerrainHeight(0, 0);
  assert.ok(center > 2.15 && center < 2.21);
  assert.ok(arrayTerrainHeight(0, 4) > 1.5, 'the crest is several files wide');
  assert.ok(arrayTerrainHeight(0, 10) < center - 1.3, 'the field has a visible height difference');
  assert.ok(arrayTerrainHeight(0, 17) < -.3, 'the departing shoulder includes its signed trough');
  assert.ok(arrayTerrainHeight(1, 0) > arrayTerrainHeight(2, 0));
  assert.ok(arrayTerrainHeight(2, 0) >= center * .25);
  assert.ok(Math.abs(arrayTerrainHeight(0, 40)) < 1e-12, 'distant shelves return to the baseline');
});

test('the terrain moves continuously with a fractional camera track', () => {
  let maximumStep = 0;
  for (let frame = 0; frame < 60; frame++) {
    const previous = frame / 60, next = (frame + 1) / 60;
    for (let lane = -2; lane <= 3; lane++) for (let row = -25; row <= 25; row++) {
      maximumStep = Math.max(maximumStep, Math.abs(
        arrayTerrainHeight(lane, row, next, next) - arrayTerrainHeight(lane, row, previous, previous),
      ));
    }
  }
  assert.ok(maximumStep > .01 && maximumStep < .04, 'no selection-frame altitude replacement');
  assert.equal(arrayTerrainHeight(8, -7, 8, -7), arrayTerrainHeight(0, 0));
});

test('idle motion is slow, bounded and out of phase across neighbouring files', () => {
  let minimum = Infinity, maximum = -Infinity, maximumStep = 0, phased = false;
  for (let frame = 0; frame < 60 * 28; frame++) {
    const time = frame / 60;
    const current = sampleArrayMotion(0, 0, time);
    const next = sampleArrayMotion(0, 0, time + 1 / 60);
    const neighbour = sampleArrayMotion(0, 1, time);
    minimum = Math.min(minimum, current.breathing);
    maximum = Math.max(maximum, current.breathing);
    maximumStep = Math.max(maximumStep, Math.abs(next.breathing - current.breathing));
    phased ||= Math.abs(current.breathing - neighbour.breathing) > .015;
    assert.ok(Math.abs(current.breathing) <= ARRAY_MOTION_BOUNDS.breathingAmplitude + 1e-12);
  }
  assert.ok(minimum < -.09 && maximum > .09);
  assert.ok(maximumStep < .0013, 'breathing must not become independent per-frame hops');
  assert.equal(phased, true);
});

test('reduced motion keeps the full terrain while suppressing breathing and interaction ripples', () => {
  const options = { focusLane: .5, focusRow: -3.2, reduced: true, pulses: [{ lane: 0, row: 0, time: 0 }] };
  const early = sampleArrayMotion(0, 1, .35, options);
  const late = sampleArrayMotion(0, 1, 19, options);
  assert.deepEqual(early, late);
  assert.equal(early.height, arrayTerrainHeight(0, 1, .5, -3.2));
  assert.equal(early.breathing, 0);
  assert.equal(early.ripple, 0);
  assert.notEqual(early.tilt, 0);
});

test('selection packets retain both signed phases, expire and stay bounded after rapid selection', () => {
  const pulses = [{ lane: 0, row: 0, time: 0 }];
  assert.ok(arraySelectionRipple(0, 3, .4, pulses) > .3);
  assert.ok(arraySelectionRipple(0, 0, .65, pulses) < 0);
  assert.equal(arraySelectionRipple(0, 3, -.1, pulses), 0);
  assert.equal(arraySelectionRipple(0, 3, 3.3, pulses), 0);
  assert.equal(arraySelectionRipple(1, 0, .4, pulses), arraySelectionRipple(0, 2.2, .4, pulses));
  const repeated = Array.from({ length: 60 }, () => ({ lane: 0, row: 0, time: 0 }));
  assert.equal(arraySelectionRipple(0, 3, .4, repeated), ARRAY_MOTION_BOUNDS.rippleAmplitude);
  assert.equal(arraySelectionRipple(0, 0, .65, repeated), -ARRAY_MOTION_BOUNDS.rippleAmplitude);
});

test('inspection suppresses the live field without flattening its static shoulder', () => {
  const sample = sampleArrayMotion(0, 3, .4, {
    detail: 1, pulses: [{ lane: 0, row: 0, time: 0 }],
  });
  assert.equal(sample.breathing, 0);
  assert.equal(sample.ripple, 0);
  assert.equal(sample.height, arrayTerrainHeight(0, 3));
});

test('the field stays inside published clearance bounds across coordinates, time and pulse overlap', () => {
  const pulses = Array.from({ length: 12 }, (_, index) => ({ lane: index % 3 - 1, row: index - 4, time: index * .07 }));
  for (let time = 0; time < 15; time += .13) for (let lane = -3; lane <= 3; lane++) for (let row = -30; row <= 30; row++) {
    const sample = sampleArrayMotion(lane, row, time, { focusLane: .3, focusRow: -.7, pulses });
    assert.ok(sample.height >= ARRAY_MOTION_BOUNDS.minHeight);
    assert.ok(sample.height <= ARRAY_MOTION_BOUNDS.maxHeight);
    assert.ok(Math.abs(sample.tilt) < .035, 'models tilt gently along the surface');
  }
});
