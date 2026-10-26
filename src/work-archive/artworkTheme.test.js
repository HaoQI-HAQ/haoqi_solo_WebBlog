import test from 'node:test';
import assert from 'node:assert/strict';
import { paletteFromPixels } from './artworkTheme.js';

test('artwork colours survive neutral margins, black print and transparency', () => {
  const neutral = Array.from({ length: 200 }, (_, i) => i % 2 ? [245, 244, 242, 255] : [12, 12, 12, 255]).flat();
  const pixels = [...neutral, ...Array(20).fill([10, 150, 230, 255]).flat(), ...Array(5).fill([230, 150, 100, 255]).flat(), ...Array(100).fill([255, 0, 0, 0]).flat()];
  assert.deepEqual(paletteFromPixels(pixels), { primary: [10, 150, 230], accent: [230, 150, 100] });
});

test('different artworks yield different palettes; empty artwork has a stable fallback', () => {
  assert.notDeepEqual(paletteFromPixels([10, 150, 230, 255]), paletteFromPixels([135, 40, 155, 255]));
  assert.deepEqual(paletteFromPixels([]), paletteFromPixels([250, 250, 250, 255, 0, 0, 0, 255]));
});
