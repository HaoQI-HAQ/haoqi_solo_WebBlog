import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { createVinylReveal } from './vinylReveal.js';

test('a closed sleeve fully encloses its record and returning restores that state', () => {
  const sleeve = new THREE.Group(), vinyl = new THREE.Group();
  const sleeveGeometry = new THREE.BoxGeometry(3.36, 3.5, .15);
  const recordGeometry = new THREE.CylinderGeometry(1.5, 1.5, .04, 128);
  const material = new THREE.MeshBasicMaterial();
  const record = new THREE.Mesh(recordGeometry, material); record.rotation.x = Math.PI / 2;
  sleeve.add(new THREE.Mesh(sleeveGeometry, material)); vinyl.add(record);
  sleeve.position.y = vinyl.position.y = 1.85;
  const object = new THREE.Group(); object.add(sleeve, vinyl);
  const motion = createVinylReveal(sleeve, vinyl);
  try {
    assert.equal(vinyl.visible, false);
    assert.ok(new THREE.Box3().setFromObject(sleeve).containsBox(new THREE.Box3().setFromObject(vinyl)));
    for (const progress of [.1, .35, .6, .85, 1]) {
      motion.setReveal(progress);
      assert.equal(vinyl.visible, true);
      assert.equal(vinyl.position.y, 1.85, 'the record must not jump vertically');
      assert.ok(Math.abs(vinyl.rotation.z) < Math.PI / 3, 'a restrained turn preserves the cover orientation');
      const size = new THREE.Box3().setFromObject(object, true).getSize(new THREE.Vector3());
      assert.ok(size.x <= 5.01 && size.y <= 3.7 && size.z <= .377, 'all reveal states fit the existing archive envelope');
    }
    motion.setReveal(0);
    assert.equal(motion.revealProgress, 0);
    assert.equal(vinyl.visible, false);
    assert.equal(sleeve.position.x, 0);
    assert.ok(new THREE.Box3().setFromObject(sleeve).containsBox(new THREE.Box3().setFromObject(vinyl)));
  } finally {
    sleeveGeometry.dispose(); recordGeometry.dispose(); material.dispose();
  }
});
