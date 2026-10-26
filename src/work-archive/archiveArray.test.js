import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { createArchiveArray } from './archiveArray.js';
import { WorkScene } from './scene.js';

const kinds = ['games', 'photo', 'music'];
const theme = { shell: '#314159', primary: '#547685', accent: '#bfe734', paper: '#ecebe6', ink: '#101010' };
const library = { entries: new Map(kinds.flatMap(kind => [0, 1].map(variant => {
  const code = `${kind}-${variant}`;
  return [code, { kind, work: { archiveCode: code, title: code }, theme, metadata: {} }];
}))) };
const selection = (kind, variant = 0) => ({ group: { id: kind }, item: { archiveCode: `${kind}-${variant}` } });
const slotKinds = Array.from({ length: 576 }, (_, i) => kinds[Math.floor(i / 64) % 3]);
function withArray(layout, run) {
  const originalDocument = globalThis.document;
  const context = new Proxy({}, { get: () => () => {}, set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => context }) };
  const array = createArchiveArray(library, layout.length, layout);
  try { run(array); } finally {
    array.dispose();
    if (originalDocument === undefined) delete globalThis.document;
    else globalThis.document = originalDocument;
  }
}
function closeMatrix(actual, expected) {
  actual.elements.forEach((value, i) => assert.ok(Math.abs(value - expected.elements[i]) < 1e-5));
}

test('576 global archives render in 192-instance category pools with identical matrices, colours and covers', () => {
  withArray(slotKinds, array => {
    assert.equal(array.meshes.length, 11, 'preserve the original parts and materials');
    for (const mesh of array.meshes) assert.equal(mesh.count, 192, 'only draw this category, not hidden copies of other categories');
    const matrix = new THREE.Matrix4(), actual = new THREE.Matrix4();
    slotKinds.forEach((kind, index) => {
      array.setSlot(index, selection(kind));
      matrix.makeTranslation(index % 9, Math.floor(index / 9), -index);
      if (index === 131) matrix.makeScale(0, 0, 0);
      array.setMatrixAt(index, matrix);
      array.getMatrixAt(index, actual); closeMatrix(actual, matrix);
    });
    array.commit();
    for (const mesh of array.meshes) {
      assert.equal(mesh.count, 192);
      assert.equal(mesh.instanceMatrix.count, 192);
      assert.equal(mesh.userData.archiveSlots.length, 192);
      if (mesh.userData.colour === 'artwork') assert.equal(mesh.geometry.attributes.archiveUv.count, 192);
      else assert.equal(mesh.instanceColor.count, 192);
      for (let local = 0; local < mesh.count; local++) {
        const global = mesh.userData.archiveSlots[local];
        assert.equal(slotKinds[global], mesh.userData.kind);
        mesh.getMatrixAt(local, actual);
        matrix.makeTranslation(global % 9, Math.floor(global / 9), -global);
        if (global === 131) matrix.makeScale(0, 0, 0);
        closeMatrix(actual, matrix);
        if (mesh.userData.colour === 'artwork') {
          const uv = mesh.geometry.attributes.archiveUv;
          const tile = [...library.entries.keys()].indexOf(`${mesh.userData.kind}-0`);
          const expected = [(tile * 272 + 8) / (8 * 272), 8 / 272, 256 / (8 * 272), 256 / 272];
          const values = [uv.getX(local), uv.getY(local), uv.getZ(local), uv.getW(local)];
          values.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < 1e-6));
        } else {
          const colour = new THREE.Color(), expected = new THREE.Color(theme[mesh.userData.colour]);
          mesh.getColorAt(local, colour);
          assert.ok(Math.abs(colour.r - expected.r) < 1e-6 && Math.abs(colour.g - expected.g) < 1e-6 && Math.abs(colour.b - expected.b) < 1e-6);
        }
      }
    }
  });
});

test('cover changes and repeated positive/negative lane windows keep the global-to-local mapping stable', () => {
  withArray(slotKinds, array => {
    const mod = (n, period) => ((n % period) + period) % period;
    const occurrence = (n, center, period) => n + Math.round((center - n) / period) * period;
    for (const focus of [-200.3, -10, -4.5, -.2, 0, .5, 5, 72.4]) {
      slotKinds.forEach((kind, index) => {
        const actualLane = occurrence(Math.floor(index / 64), focus, 9);
        const wrappedKind = kinds[mod(actualLane, 3)];
        assert.equal(wrappedKind, kind);
        array.setSlot(index, selection(wrappedKind, focus > 0 ? 1 : 0));
        array.setMatrixAt(index, new THREE.Matrix4().makeTranslation(actualLane, index, 0));
      });
      array.commit();
      for (const mesh of array.meshes) {
        mesh.userData.archiveSlots.forEach(global => assert.equal(slotKinds[global], mesh.userData.kind));
        if (mesh.userData.colour === 'artwork') {
          const variant = focus > 0 ? 1 : 0;
          const tile = [...library.entries.keys()].indexOf(`${mesh.userData.kind}-${variant}`);
          const uv = mesh.geometry.attributes.archiveUv;
          for (let i = 0; i < mesh.count; i++) assert.ok(Math.abs(uv.getX(i) - (tile * 272 + 8) / (8 * 272)) < 1e-6);
        }
      }
    }
  });
});

test('a real ray through a packed cover resolves to the global archive cell, not the category-local instance', () => {
  const layout = ['music', 'photo', 'games', 'music', 'photo', 'games'];
  withArray(layout, array => {
    layout.forEach((kind, index) => {
      array.setSlot(index, selection(kind));
      array.setMatrixAt(index, new THREE.Matrix4().makeTranslation(index === 4 ? 0 : 30 + index * 8, 0, 0));
    });
    array.commit();
    array.meshes.forEach(mesh => mesh.updateMatrixWorld());
    const scene = Object.create(WorkScene.prototype);
    Object.assign(scene, {
      loaded: true, bootLocked: false, targetDetail: 0, detail: { value: 0 },
      canvas: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }) },
      camera: new THREE.PerspectiveCamera(60, 1, .1, 100),
      pointer: new THREE.Vector2(), ray: new THREE.Raycaster(), instances: array.meshes,
      detailModel: new THREE.Group(), cells: layout.map((_, index) => ({ lane: index - 3, row: index + 12 })),
    });
    scene.camera.position.set(0, 1.85, 10); scene.camera.lookAt(0, 1.85, 0); scene.camera.updateMatrixWorld();
    assert.deepEqual(scene.hit({ clientX: 100, clientY: 100 }), scene.cells[4]);
    const hit = scene.ray.intersectObjects(array.meshes, true)[0];
    assert.equal(hit.instanceId, 1, 'the physical cover is local instance one');
    assert.equal(hit.object.userData.archiveSlots[hit.instanceId], 4, 'its archive is global cell four');
  });
});
