import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { WorkScene } from './scene.js';

test('a visible cassette cover selects its own archive rather than an index part behind it', () => {
  const scene = Object.create(WorkScene.prototype);
  const coverGeometry = new THREE.BoxGeometry(4, 4, .1);
  const indexGeometry = new THREE.BoxGeometry(.2, .2, .1);
  const material = new THREE.MeshBasicMaterial();
  const covers = new THREE.InstancedMesh(coverGeometry, material, 2);
  const indices = new THREE.InstancedMesh(indexGeometry, material, 2);
  covers.setMatrixAt(0, new THREE.Matrix4().makeTranslation(0, 0, 1));
  covers.setMatrixAt(1, new THREE.Matrix4());
  indices.setMatrixAt(0, new THREE.Matrix4().makeTranslation(1.7, 1.7, 1));
  indices.setMatrixAt(1, new THREE.Matrix4());
  Object.assign(scene, {
    loaded: true, targetDetail: 0, detail: { value: 0 },
    canvas: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 200, height: 200 }) },
    camera: new THREE.PerspectiveCamera(60, 1, .1, 100),
    pointer: new THREE.Vector2(), ray: new THREE.Raycaster(),
    instances: [covers, indices], hitSurface: indices,
    detailModel: new THREE.Group(),
    cells: [{ lane: 1, row: 10 }, { lane: 2, row: 8 }],
  });
  scene.camera.position.set(0, 0, 10);
  scene.camera.updateMatrixWorld();
  try {
    assert.deepEqual(scene.hit({ clientX: 100, clientY: 100 }), scene.cells[0]);
  } finally {
    covers.dispose(); indices.dispose();
    coverGeometry.dispose(); indexGeometry.dispose(); material.dispose();
  }
});

test('intro selection stays locked through the travelling wave and skip releases it immediately', () => {
  const scene = Object.create(WorkScene.prototype);
  let completed = 0;
  Object.assign(scene, { time: 0, reduced: false, invalidate() {}, onEntranceComplete() { completed++; } });
  scene.prepareEntrance();
  scene.startEntrance();
  scene.entrance.age = .76;
  scene.finishEntrance();
  assert.equal(scene.bootLocked, true, 'the moving entry crest must not overlap an extracted record');
  assert.equal(completed, 0);
  scene.entrance.age = 4.5;
  scene.finishEntrance();
  assert.equal(scene.bootLocked, false);
  assert.equal(completed, 1);
  scene.prepareEntrance();
  scene.startEntrance(true);
  scene.finishEntrance(true);
  assert.equal(scene.bootLocked, false);
  assert.equal(scene.entrance, null);
  assert.equal(completed, 2);
});

test('reopening during return preserves altitude, and returning mid-extraction holds current progress', () => {
  const scene = Object.create(WorkScene.prototype);
  Object.assign(scene, { bootLocked: false, targetDetail: 0, detail: { value: .45 }, time: 2,
    detailModel: { position: { y: -.2 } }, extractionSource: { value: -2, velocity: 1 },
    canvas: { style: {} }, invalidate() {},
  });
  scene.setDetail(true);
  assert.ok(Math.abs(THREE.MathUtils.lerp(scene.extractionSource.value, 1.85, scene.detail.value) + .2) < 1e-10);
  assert.equal(scene.extractionSource.velocity, 0);
  scene.setDetail(false);
  assert.equal(scene.returnHold, .45);
  assert.equal(scene.targetDetail, 0);
});
