import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { archiveWave, damp, returnStep, smooth } from './motion.ts';
import { sampleArrayMotion, ARRAY_MOTION_BOUNDS } from './arrayMotion.js';
import { prepareArchiveArtwork, createArchiveArray } from './archiveArray.js';
import { createArchiveObject } from './archiveObject.js';

// Retain the archive's spacing, signed selection wave and critical damping.
// Closed array models and selected models now share artwork and palette.
// Extend the repeating window beyond the visible frustum before feathering it.
// The old 32-row window exposed its last case tops on wide screens.
const LANES = 9, ROWS = 64, SPACING_X = 5.2, SPACING_Z = .62;
const BASE_Y = -4.6, CASE_TOP = 3.7, INSPECTION_Y = 1.85;
const mod = (n, count) => ((n % count) + count) % count;
const occurrence = (n, center, period) => n + Math.round((center - n) / period) * period;
const spring = (value = 0) => ({ value, velocity: 0 });

export class WorkScene {
  constructor(host, groups, onSelect, onHover, onActivate, onBlank, reduced) {
    this.host = host; this.groups = groups; this.onSelect = onSelect; this.onHover = onHover; this.onActivate = onActivate; this.onBlank = onBlank;
    this.reduced = reduced; this.disposed = false; this.loaded = false;
    this.active = false; this.dirty = true; this.animationFrame = 0; this.lastFrame = 0;
    this.selected = { lane: 0, row: 0 }; this.pulses = []; this.time = 0;
    this.lastInteraction = 0; this.idleGain = 0; this.bootLocked = false; this.entrance = null;
    this.extractionSource = spring(); this.renderCount = 0;
    this.detail = spring(); this.targetDetail = 0; this.recordReveal = spring();
    this.trackX = spring(); this.trackZ = spring(); this.lifts = new Map();
    this.instances = []; this.cells = []; this.cellKeys = []; this.materials = new Set(); this.geometries = new Set();
    this.detailModel = new THREE.Group(); this.pointer = new THREE.Vector2();
    this.ray = new THREE.Raycaster(); this.dummy = new THREE.Object3D();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1 : 1.25));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute('aria-label', '三维创作档案：左右切换游戏、摄影与音乐；上下选择当前分类作品');
    this.host.appendChild(this.canvas);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#f1f0eb');
    this.scene.fog = new THREE.Fog('#f1f0eb', 95, 170);
    this.camera = new THREE.PerspectiveCamera(7, 1, 5, 300);
    const pmrem = new THREE.PMREMGenerator(this.renderer), room = new RoomEnvironment();
    this.environment = pmrem.fromScene(room, .04);
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = .5;
    room.dispose(); pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight('#fffaf5', '#b4b2a7', .78));
    const light = new THREE.DirectionalLight('#fffaf5', 1.5);
    light.position.set(-8, 18, 5); light.castShadow = true;
    Object.assign(light.shadow.camera, { left: -25, right: 25, top: 22, bottom: -22, near: .5, far: 70 });
    light.shadow.mapSize.set(2048, 2048); light.shadow.normalBias = .018;
    this.light = light; this.scene.add(light);
    const fill = new THREE.DirectionalLight('#f1f0eb', .6); fill.position.set(8, 9, -10); this.scene.add(fill);
    const floorGeometry = new THREE.PlaneGeometry(180, 180);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#deddd6', roughness: .9 });
    this.geometries.add(floorGeometry); this.materials.add(floorMaterial);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -4.63; floor.receiveShadow = true; this.scene.add(floor);
    this.scene.add(this.detailModel);
    this.down = (e) => {
      if (this.bootLocked) return;
      this.lastInteraction = this.time;
      if (e.button === 0 && this.targetDetail) {
        this.inspecting = Boolean(this.hitDetail(e));
        this.detailBlankPointer = !this.inspecting;
        this.startPointer = { x: e.clientX, y: e.clientY, pointerId: e.pointerId };
        this.canvas.setPointerCapture?.(e.pointerId);
        this.canvas.style.cursor = this.inspecting ? 'grab' : 'default';
        return;
      }
      if (e.button === 0) {
        this.startPointer = { x: e.clientX, y: e.clientY, cell: this.hit(e) };
        this.canvas.setPointerCapture?.(e.pointerId);
      }
    };
    this.move = (e) => {
      if (this.inspecting && this.startPointer) {
        const distance = Math.hypot(e.clientX - this.startPointer.x, e.clientY - this.startPointer.y);
        if (distance > 4 && !this.orbiting) { this.orbiting = true; this.onInspect?.(); }
        if (this.orbiting) {
          this.detailModel.rotation.y += e.movementX * .006;
          this.canvas.style.cursor = 'grabbing';
          this.invalidate();
        }
        return;
      }
      const hit = this.hit(e); this.canvas.style.cursor = hit ? 'pointer' : 'default';
      this.onHover(hit ? this.selectionAt(hit) : null);
    };
    this.up = (e) => {
      if (this.targetDetail) {
        const blank = this.detailBlankPointer;
        this.inspecting = false; this.detailBlankPointer = false; this.orbiting = false;
        this.canvas.releasePointerCapture?.(e.pointerId);
        this.canvas.style.cursor = 'default';
        this.startPointer = null;
        if (blank) this.onBlank?.();
        return;
      }
      const press = this.startPointer;
      this.startPointer = null;
      if (this.canvas.hasPointerCapture?.(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);
      if (press?.cell && Math.hypot(e.clientX-press.x, e.clientY-press.y) < 8 && !this.targetDetail) this.select(press.cell);
    };
    this.leave = () => { this.inspecting = false; this.detailBlankPointer = false; this.orbiting = false; this.startPointer = null; this.onHover(null); };
    this.contextMenu = (e) => { if (this.targetDetail) e.preventDefault(); };
    this.lost = (e) => { e.preventDefault(); this.onError?.('三维画面暂时不可用，请重新载入'); };
    this.canvas.addEventListener('pointerdown', this.down);
    this.canvas.addEventListener('pointermove', this.move);
    this.canvas.addEventListener('pointerup', this.up);
    this.canvas.addEventListener('pointerleave', this.leave);
    this.canvas.addEventListener('pointercancel', this.leave);
    this.canvas.addEventListener('contextmenu', this.contextMenu);
    this.canvas.addEventListener('webglcontextlost', this.lost);
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.active = entry.isIntersecting;
      if (this.active) this.invalidate();
      else if (this.animationFrame) { cancelAnimationFrame(this.animationFrame); this.animationFrame = 0; }
    }, { threshold: 0 });
    this.visibilityObserver.observe(host);
    this.onVisibilityChange = () => {
      if (document.hidden && this.animationFrame) { cancelAnimationFrame(this.animationFrame); this.animationFrame = 0; }
      else if (!document.hidden && this.active) this.invalidate();
    };
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }
  groupIndexAt(cell) { return mod(cell.lane, this.groups.length); }
  selectionAt(cell) {
    const groupIndex = this.groupIndexAt(cell);
    const items = this.groups[groupIndex].items;
    const itemIndex = mod(cell.row, items.length);
    return { groupIndex, itemIndex, group: this.groups[groupIndex], item: items[itemIndex] };
  }
  async load() {
    this.artwork = await prepareArchiveArtwork(this.groups, Math.min(4, this.renderer.capabilities.getMaxAnisotropy()));
    if (this.disposed) { this.artwork.dispose(); return; }
    const slotKinds = Array.from({ length: LANES * ROWS }, (_, i) => this.groups[mod(Math.floor(i / ROWS), this.groups.length)].id);
    this.arrayModels = createArchiveArray(this.artwork, LANES * ROWS, slotKinds);
    this.instances = this.arrayModels.meshes;
    this.instances.forEach(mesh => this.scene.add(mesh));
    this.updateLabel(); this.loaded = true; this.select(this.selected);
    this.last = performance.now(); this.invalidate();
  }
  replaceArchiveObject(object) {
    this.detailModel.clear(); this.archiveObject?.dispose();
    this.archiveObject = object; this.detailModel.add(object.group);
    object.setReveal(this.recordReveal.value);
    this.host.dataset.modelKind = object.group.userData.kind;
    this.host.dataset.modelArtwork = object.group.userData.hasArtwork ? 'ready' : 'placeholder';
    this.invalidate();
  }
  updateLabel() {
    const { group, item: work } = this.selectionAt(this.selected);
    const key = group.id + ':' + work.archiveCode;
    if (key === this.artworkSelection) return;
    this.artworkSelection = key;
    const request = this.artworkRequest = (this.artworkRequest || 0) + 1;
    const isCurrent = () => !this.disposed && request === this.artworkRequest;
    const entry = this.artwork.clone(work.archiveCode);
    this.replaceArchiveObject(createArchiveObject(entry));
    // The array already has the exact artwork and palette. Only sharpen the photo
    // after selection; switching never waits for metadata or swaps a neutral case.
    if (group.id !== 'photo' || work.pending || !work.image) return;
    new THREE.TextureLoader().loadAsync(work.image).then(cover => {
      cover.colorSpace = THREE.SRGBColorSpace;
      cover.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
      if (!isCurrent()) { cover.dispose(); return; }
      const entry = this.artwork.clone(work.archiveCode); entry.cover?.dispose();
      this.replaceArchiveObject(createArchiveObject({ ...entry, cover }));
    }).catch(() => {});
  }
  select(cell) {
    if (!this.loaded || this.bootLocked || this.targetDetail || this.detail.value > .1) return;
    if (this.selected.lane === cell.lane && this.selected.row === cell.row) { this.onActivate?.(this.selectionAt(cell)); return; }
    this.lastInteraction = this.time;
    this.selected = { ...cell }; this.pulses.push({ ...cell, time: this.time }); this.invalidate();
    this.updateLabel(); this.onSelect(this.selectionAt(cell), cell);
  }
  navigate(axis, delta) { this.select({ ...this.selected, [axis]: this.selected[axis] + delta }); }
  selectItemIndex(index) {
    const items = this.groups[this.groupIndexAt(this.selected)].items;
    const row = occurrence(index, this.selected.row, items.length);
    this.select({ lane: this.selected.lane, row });
  }
  setDetail(open) {
    if (open && this.bootLocked) return;
    if (open && !this.targetDetail) {
      // Freeze the departure height: an inspected archive must not breathe or
      // chase a moving wave beneath it while the camera reframes the model.
      if (this.detail.value < .999) this.extractionSource.value = (this.detailModel.position.y - INSPECTION_Y * this.detail.value) / (1 - this.detail.value);
      this.extractionSource.velocity = 0;
    }
    this.lastInteraction = this.time;
    if (!open) {
      this.returnHold = this.detail.value;
      const id = this.startPointer?.pointerId;
      if (id !== undefined && this.canvas.hasPointerCapture?.(id)) this.canvas.releasePointerCapture(id);
      this.inspecting = false; this.orbiting = false; this.detailBlankPointer = false; this.startPointer = null;
      this.canvas.style.cursor = 'default';
    }
    this.targetDetail = open ? 1 : 0; this.invalidate();
  }
  setReduced(reduced) { this.reduced = reduced; if (reduced) this.pulses = []; this.invalidate(); }
  prepareEntrance() {
    this.bootLocked = true;
    this.bootReleased = false;
    this.entrance = { started: false, age: 0 };
    this.invalidate();
  }
  startEntrance(skipped = false) {
    this.entrance = skipped || this.reduced ? null : { started: true, age: 0 };
    this.lastInteraction = this.time;
    this.invalidate();
  }
  finishEntrance(skipped = false) {
    this.bootReleased = true;
    if (skipped) this.entrance = null;
    this.bootLocked = Boolean(this.entrance?.started && this.entrance.age < 4.5);
    this.lastInteraction = this.time;
    if (!this.bootLocked) { this.entrance = null; this.onEntranceComplete?.(); }
    this.invalidate();
  }
  invalidate() {
    this.dirty = true;
    if (!this.disposed && this.active && !document.hidden && !this.animationFrame) {
      this.animationFrame = requestAnimationFrame(now => { this.animationFrame = 0; this.frame(now); });
    }
  }
  hit(e) {
    if (!this.loaded || this.bootLocked || this.targetDetail || this.detail.value > .1) return null;
    const bounds = this.canvas.getBoundingClientRect();
    this.pointer.set((e.clientX-bounds.left)/bounds.width*2-1, -(e.clientY-bounds.top)/bounds.height*2+1);
    this.ray.setFromCamera(this.pointer, this.camera);
    // Pick the closest visible shell, not just the small optical insert behind it.
    const hit = this.ray.intersectObjects([...this.instances, this.detailModel], true)[0];
    return hit ? hit.instanceId === undefined ? this.selected : this.cells[hit.object.userData.archiveSlots?.[hit.instanceId] ?? hit.instanceId] : null;
  }
  hitDetail(e) {
    if (!this.loaded || !this.targetDetail) return null;
    const bounds = this.canvas.getBoundingClientRect();
    this.pointer.set((e.clientX-bounds.left)/bounds.width*2-1, -(e.clientY-bounds.top)/bounds.height*2+1);
    this.ray.setFromCamera(this.pointer, this.camera);
    return this.ray.intersectObject(this.detailModel, true)[0] || null;
  }
  resize() {
    const w = Math.max(1, this.host.clientWidth), h = Math.max(1, this.host.clientHeight);
    // Read layout only on ResizeObserver updates. The opening SVG writes styles
    // during its fade, so reading client sizes in every GL frame can force layout.
    this.viewportWidth = w; this.viewportHeight = h;
    this.stageHeight = this.host.parentElement.clientHeight;
    this.renderer.setSize(w, h); this.camera.aspect = w/h; this.camera.updateProjectionMatrix(); this.invalidate();
  }
  frame(now) {
    if (this.disposed || !this.loaded) return;
    const dt = Math.min((now-this.lastFrame)/1000, .05); this.lastFrame = now;
    if (document.hidden || !this.active) return;
    this.dirty = false;
    this.time += dt; const rate = this.reduced ? 1000 : 4.2;
    const heldForBoot = this.entrance && !this.entrance.started;
    if (this.entrance?.started) this.entrance.age += dt;
    if (this.bootReleased && this.bootLocked && this.entrance?.age >= 4.5) this.finishEntrance();
    const entering = !this.reduced && this.entrance?.started && this.entrance.age < 4.5;
    const entryAge = entering ? this.entrance.age : 4.5;
    const entryZ = entering ? -23 * (1 - Math.min(1, entryAge / .75)) ** 2 : 0;
    damp(this.trackX, this.selected.lane*SPACING_X, rate, dt);
    damp(this.trackZ, this.selected.row*SPACING_Z, rate, dt);
    if (!this.targetDetail) this.detailModel.rotation.y = returnStep(this.detailModel.rotation.y, dt, this.reduced);
    const aligning = !this.targetDetail && this.detailModel.rotation.y !== 0;
    const music = this.selectionAt(this.selected).group.id === 'music';
    // The disc must clear the actual raised neighbours, not the old flat shelf.
    // Pulses/breathing disappear in detail, so the reference terrain bound is
    // sufficient for the entire sideways path, including a rotation on return.
    const neighbourTop = BASE_Y + CASE_TOP + ARRAY_MOTION_BOUNDS.terrainMax;
    const clearOfArray = this.detailModel.position.y + .35 > neighbourTop + .18;
    const revealTarget = music && this.targetDetail && (this.reduced || this.detail.value > .6 && clearOfArray) ? 1 : 0;
    if (this.reduced) { this.recordReveal.value = revealTarget; this.recordReveal.velocity = 0; }
    else damp(this.recordReveal, revealTarget, revealTarget ? 8.5 : 12, dt);
    if (Math.abs(this.recordReveal.value - revealTarget) < .001 && Math.abs(this.recordReveal.velocity) < .01) {
      this.recordReveal.value = revealTarget; this.recordReveal.velocity = 0;
    }
    this.archiveObject.setReveal(this.recordReveal.value);
    // Return the disc to its sleeve before the archive descends into its slot.
    const closingRecord = !this.targetDetail && this.recordReveal.value > .001;
    const detailTargetProgress = this.targetDetail ? 1 : aligning || closingRecord ? this.returnHold ?? this.detail.value : 0;
    damp(this.detail, detailTargetProgress, this.reduced ? 1000 : 4.5, dt);
    this.pulses = this.pulses.filter(p => this.time-p.time < 3.2).slice(-12);
    const idle = !this.reduced && !this.bootLocked && !entering && !this.targetDetail && this.detail.value < .01 && !aligning && this.time - this.lastInteraction > 2.5;
    this.idleGain += (Number(idle) - this.idleGain) * (1 - Math.exp(-dt * (idle ? .8 : 4)));
    if (this.reduced) this.idleGain = 0;
    const motionOptions = { focusLane: this.trackX.value / SPACING_X, focusRow: this.trackZ.value / SPACING_Z,
      detail: this.detail.value, reduced: this.reduced, pulses: this.pulses, idleGain: this.idleGain };
    const field = (lane, row) => {
      const sample = sampleArrayMotion(lane, row, this.time, motionOptions);
      if (entering) {
        // The travelling crest hands over to a permanent settled shoulder.
        const scan = (atRow) => archiveWave(atRow - motionOptions.focusRow + 12, lane - motionOptions.focusLane + 2, 22 + entryAge);
        const gain = 1 - smooth((entryAge - 3.4) / 1.1);
        sample.height += scan(row) * gain;
        sample.tilt += (scan(row + .5) - scan(row - .5)) * .024 * gain;
      }
      return sample;
    };
    let selectedY = 0, low = Infinity, high = -Infinity; const alive = new Set();
    for (let i=0; i<LANES*ROWS; i++) {
      const lane = occurrence(Math.floor(i/ROWS), this.trackX.value/SPACING_X, LANES);
      const row = occurrence(i%ROWS, this.trackZ.value/SPACING_Z, ROWS);
      let cell = this.cells[i];
      if (!cell || cell.lane !== lane || cell.row !== row) {
        // Immutable coordinates keep an in-flight pointer press tied to its file.
        // Covers/UVs only change when the repeating window remaps a slot.
        cell = this.cells[i] = { lane, row };
        this.cellKeys[i] = `${lane}:${row}`;
        this.arrayModels.setSlot(i, this.selectionAt(cell));
      }
      const key = this.cellKeys[i]; alive.add(key); const active = lane===this.selected.lane && row===this.selected.row;
      let lift = this.lifts.get(key); if (!lift) { lift=spring(); this.lifts.set(key,lift); }
      damp(lift, active ? .55 : 0, rate, dt);
      const motion = field(lane, row);
      low = Math.min(low, motion.terrain); high = Math.max(high, motion.terrain);
      const y = BASE_Y + motion.height + lift.value;
      this.dummy.position.set(lane*SPACING_X-this.trackX.value,y,row*SPACING_Z-this.trackZ.value + entryZ);
      this.dummy.rotation.set(motion.tilt,0,0);
      this.dummy.scale.setScalar(active ? 0 : 1); this.dummy.updateMatrix();
      this.arrayModels.setMatrixAt(i, this.dummy.matrix);
      if (active) {
        this.detailModel.position.copy(this.dummy.position);
        if (!this.targetDetail) damp(this.extractionSource, y, this.reduced ? 1000 : 4.5, dt);
        if (this.detail.value > .0001 || this.targetDetail) this.detailModel.position.y = THREE.MathUtils.lerp(this.extractionSource.value, INSPECTION_Y, this.detail.value);
        this.detailModel.rotation.x = motion.tilt * (1 - this.detail.value);
        selectedY = this.detailModel.position.y;
      }
    }
    this.lifts.forEach((_,key) => { if (!alive.has(key)) this.lifts.delete(key); });
    this.arrayModels.commit();
    const detail=this.detail.value;
    const orbit = smooth((entryAge - .6) / 1.6), settle = smooth((entryAge - 2.25) / 2.25);
    const previewYaw = entering ? THREE.MathUtils.lerp(THREE.MathUtils.lerp(89, 67, orbit), 59, settle) : 59;
    const previewElevation = entering ? THREE.MathUtils.lerp(THREE.MathUtils.lerp(3, 43, orbit), 19, settle) : 19;
    const yaw=THREE.MathUtils.degToRad(THREE.MathUtils.lerp(previewYaw, 18, detail)), elevation=THREE.MathUtils.degToRad(THREE.MathUtils.lerp(previewElevation, 14, detail));
    // Keep the opened archive vivid while the surrounding shelves recede.
    this.scene.fog.near = THREE.MathUtils.lerp(105, 99, detail);
    this.scene.fog.far = THREE.MathUtils.lerp(138, 120, detail);
    const distance=100, direction=new THREE.Vector3(-Math.sin(yaw)*Math.cos(elevation),Math.sin(elevation),Math.cos(yaw)*Math.cos(elevation));
    const settledSpan=this.camera.aspect < .85 ? 12 : 8.8;
    const span=entering ? THREE.MathUtils.lerp(10.8, settledSpan, settle) : settledSpan;
    const target=new THREE.Vector3(-.8,-.05,0);
    // Anchor the crest at the approved red-box position (about 29% screen width).
    // Compact screens keep their centred composition; inspection has its own target.
    const wideMix = THREE.MathUtils.smoothstep(this.viewportWidth, 900, 1300);
    const screenRight = new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).normalize();
    target.addScaledVector(screenRight, span * this.camera.aspect * .235 * wideMix);
    const detailTarget=this.detailModel.position.clone().add(new THREE.Vector3(0,1.85,0));
    let detailSpan = span - 2;
    if (this.viewportWidth <= 1000) {
      // Compact detail panel: bottom 55px, maximum 40% of the stage height.
      // Fit the entire model between the heading and that panel, also in landscape.
      const panelTop = this.stageHeight * .6 - 55;
      const modelTop = 170, space = Math.max(120, panelTop - modelTop - 20);
      detailSpan = Math.max(4.8, 5.6 / this.camera.aspect, 4.2 * this.viewportHeight / space);
      const modelCenter = (modelTop + panelTop - 20) / 2;
      detailTarget.y -= (this.viewportHeight / 2 - modelCenter) * detailSpan / (this.viewportHeight * Math.cos(elevation));
    } else if (this.camera.aspect>1) detailTarget.add(new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).multiplyScalar(2.1));
    target.lerp(detailTarget,detail);
    this.camera.position.copy(target).addScaledVector(direction,distance); this.camera.lookAt(target);
    this.camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(THREE.MathUtils.lerp(span,detailSpan,detail)/(2*distance))); this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene,this.camera);
    this.renderCount += 1;
    const selected = this.selectionAt(this.selected);
    this.host.dataset.selected=`${selected.group.id}:${selected.itemIndex}`;
    this.host.dataset.lift=selectedY.toFixed(3);
    this.host.dataset.recordReveal=this.recordReveal.value.toFixed(3);
    this.host.dataset.terrainRange = (high - low).toFixed(3);
    this.host.dataset.idleGain = this.idleGain.toFixed(3);
    this.host.dataset.renderCount = String(this.renderCount);
    this.host.dataset.entry = heldForBoot ? 'waiting' : entering ? 'entering' : 'settled';
    this.host.dataset.phase=this.targetDetail ? (detail>.95?'detail':'extracting') : detail>.05?'returning':'browsing';
    const moving = entering || !heldForBoot && !this.reduced && !this.targetDetail && this.detail.value < .01
      || !this.reduced && this.pulses.length > 0
      || Math.abs(this.trackX.value-this.selected.lane*SPACING_X) > .001
      || Math.abs(this.trackZ.value-this.selected.row*SPACING_Z) > .001
      || Math.abs(this.detail.value-this.targetDetail) > .001
      || Math.abs(this.recordReveal.value-revealTarget) > .001 || Math.abs(this.recordReveal.velocity) > .001
      || !this.targetDetail && Math.abs(this.detailModel.rotation.y) > .001
      || [...this.lifts.entries()].some(([key, lift]) => {
        const targetLift = key === `${this.selected.lane}:${this.selected.row}` ? .55 : 0;
        return Math.abs(lift.value - targetLift) > .001 || Math.abs(lift.velocity) > .001;
      });
    if (moving || this.dirty) this.invalidate();
  }
  dispose() {
    this.disposed=true; this.renderer.setAnimationLoop(null); this.observer.disconnect(); this.visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.canvas.removeEventListener('pointerdown',this.down); this.canvas.removeEventListener('pointermove',this.move);
    this.canvas.removeEventListener('pointerup',this.up); this.canvas.removeEventListener('pointerleave',this.leave);
    this.canvas.removeEventListener('pointercancel',this.leave);
    this.canvas.removeEventListener('contextmenu',this.contextMenu);
    this.canvas.removeEventListener('webglcontextlost',this.lost);
    this.arrayModels?.dispose(); this.artwork?.dispose(); this.geometries.forEach(g=>g.dispose()); this.materials.forEach(m=>m.dispose());
    this.archiveObject?.dispose(); this.environment.dispose(); this.light.shadow.map?.dispose(); this.renderer.dispose(); this.canvas.remove();
  }
}
