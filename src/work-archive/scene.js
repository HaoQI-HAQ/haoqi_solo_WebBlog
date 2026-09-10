import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { baselineSelectionWave, columnStrength, damp, returnStep } from './motion.ts';

// RhineLabUI's cassette geometry, spacing and signed wave/critical damping.
// The React adapter, navigation and rendering below belong to HAOQI's archive.
const LANES = 9, ROWS = 32, SPACING_X = 5.2, SPACING_Z = .62;
const mod = (n, count) => ((n % count) + count) % count;
const occurrence = (n, center, period) => n + Math.round((center - n) / period) * period;
const spring = (value = 0) => ({ value, velocity: 0 });
const shellNames = ['Frosted_Polymer', 'Ivory_Edges', 'Optical_Diffuser', 'Index_Inlay', 'Titanium_Fasteners'];

export class WorkScene {
  constructor(host, groups, onSelect, onHover, onActivate, onBlank, reduced) {
    this.host = host; this.groups = groups; this.onSelect = onSelect; this.onHover = onHover; this.onActivate = onActivate; this.onBlank = onBlank;
    this.reduced = reduced; this.disposed = false; this.loaded = false;
    this.selected = { lane: 0, row: 0 }; this.pulses = []; this.time = 0;
    this.detail = spring(); this.targetDetail = 0;
    this.trackX = spring(); this.trackZ = spring(); this.lifts = new Map();
    this.instances = []; this.cells = []; this.materials = new Set(); this.geometries = new Set();
    this.detailModel = new THREE.Group(); this.pointer = new THREE.Vector2();
    this.ray = new THREE.Raycaster(); this.dummy = new THREE.Object3D();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1 : 1.5));
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
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#969d9e', 1));
    const light = new THREE.DirectionalLight('#ffffff', 1.7);
    light.position.set(-8, 18, 5); light.castShadow = true;
    Object.assign(light.shadow.camera, { left: -25, right: 25, top: 22, bottom: -22, near: .5, far: 70 });
    light.shadow.mapSize.set(2048, 2048); light.shadow.normalBias = .018;
    this.light = light; this.scene.add(light);
    const fill = new THREE.DirectionalLight('#f1f0eb', .7); fill.position.set(8, 9, -10); this.scene.add(fill);
    const floorGeometry = new THREE.PlaneGeometry(180, 180);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#deddd6', roughness: .9 });
    this.geometries.add(floorGeometry); this.materials.add(floorMaterial);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -4.63; floor.receiveShadow = true; this.scene.add(floor);
    this.scene.add(this.detailModel);
    this.down = (e) => {
      if (e.button === 0 && this.targetDetail) {
        this.inspecting = Boolean(this.hitDetail(e));
        this.detailBlankPointer = !this.inspecting;
        this.startPointer = { x: e.clientX, y: e.clientY };
        this.canvas.setPointerCapture?.(e.pointerId);
        this.canvas.style.cursor = this.inspecting ? 'grab' : 'default';
        return;
      }
      if (e.button === 0) this.startPointer = { x: e.clientX, y: e.clientY };
    };
    this.move = (e) => {
      if (this.inspecting) {
        const distance = Math.hypot(e.clientX - this.startPointer.x, e.clientY - this.startPointer.y);
        if (distance > 4) this.orbiting = true;
        if (this.orbiting) {
          this.detailModel.rotation.y += e.movementX * .006;
          this.canvas.style.cursor = 'grabbing';
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
      if (this.startPointer && Math.hypot(e.clientX-this.startPointer.x, e.clientY-this.startPointer.y) < 8 && !this.targetDetail) {
        const cell = this.hit(e); if (cell) this.select(cell);
      }
      this.startPointer = null;
    };
    this.leave = () => { this.inspecting = false; this.detailBlankPointer = false; this.orbiting = false; this.startPointer = null; this.onHover(null); };
    this.contextMenu = (e) => { if (this.targetDetail) e.preventDefault(); };
    this.lost = (e) => { e.preventDefault(); this.onError?.('三维画面暂时不可用，请重新载入'); };
    this.canvas.addEventListener('pointerdown', this.down);
    this.canvas.addEventListener('pointermove', this.move);
    this.canvas.addEventListener('pointerup', this.up);
    this.canvas.addEventListener('pointerleave', this.leave);
    this.canvas.addEventListener('contextmenu', this.contextMenu);
    this.canvas.addEventListener('webglcontextlost', this.lost);
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
  }
  groupIndexAt(cell) { return mod(cell.lane, this.groups.length); }
  selectionAt(cell) {
    const groupIndex = this.groupIndexAt(cell);
    const items = this.groups[groupIndex].items;
    const itemIndex = mod(cell.row, items.length);
    return { groupIndex, itemIndex, group: this.groups[groupIndex], item: items[itemIndex] };
  }
  async load() {
    const gltf = await new GLTFLoader().loadAsync('/assets/work-archive/archive-cassette.glb');
    if (this.disposed) { gltf.scene.traverse(o => { o.geometry?.dispose(); if(o.material) [o.material].flat().forEach(m=>m.dispose()); }); return; }
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse(mesh => {
      if (!mesh.isMesh) return;
      const name = mesh.material.name.replace(/\.\d+$/, '');
      // Replace branded printing with the current work's generated label.
      if (['Carbon_Ink', 'Moulded_Lettering'].includes(name)) return;
      const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld); this.geometries.add(geometry);
      const material = mesh.material.clone(); this.materials.add(material);
      material.color.set(name.includes('Inlay') || name === 'Champagne_Index' ? '#d8ff4f' : ['Optical_Diffuser','Internal_Ceramic','Subsurface_Optics'].includes(name) ? '#969d9e' : '#f1f0eb');
      material.envMapIntensity = .6; material.roughness = .35;
      if ('transmission' in material) { material.transmission = name === 'Frosted_Polymer' ? .9 : 0; material.thickness = .12; }
      if (name === 'Frosted_Polymer') { this.coverMaterial = material; material.roughness = .22; }
      const modelPart = new THREE.Mesh(geometry, material);
      modelPart.castShadow = name === 'Optical_Diffuser'; modelPart.receiveShadow = true;
      this.detailModel.add(modelPart);
      if (!shellNames.includes(name)) return;
      const arrayMaterial = new THREE.MeshStandardMaterial({ color: name === 'Index_Inlay' ? '#c9ceca' : name === 'Optical_Diffuser' ? '#969d9e' : '#e8e9df', roughness: .43, metalness: name === 'Titanium_Fasteners' ? .65 : .02 });
      this.materials.add(arrayMaterial);
      const inst = new THREE.InstancedMesh(geometry, arrayMaterial, LANES * ROWS);
      inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage); inst.frustumCulled = false;
      inst.castShadow = name === 'Optical_Diffuser'; inst.receiveShadow = true;
      this.instances.push(inst); this.scene.add(inst);
      if (name === 'Optical_Diffuser') this.hitSurface = inst;
    });
    gltf.scene.traverse(o => { o.geometry?.dispose(); if (o.material) [o.material].flat().forEach(m => m.dispose()); });
    const labelCanvas = document.createElement('canvas'); labelCanvas.width = 1024; labelCanvas.height = 384;
    this.labelCanvas = labelCanvas; this.labelTexture = new THREE.CanvasTexture(labelCanvas);
    this.labelTexture.colorSpace = THREE.SRGBColorSpace;
    const labelGeo = new THREE.PlaneGeometry(1.25, .47), labelMat = new THREE.MeshBasicMaterial({ map: this.labelTexture });
    this.geometries.add(labelGeo); this.materials.add(labelMat);
    const label = new THREE.Mesh(labelGeo, labelMat); label.position.set(-1.3, 3.04, .265); this.detailModel.add(label);
    const albumCoverBackGeo = new THREE.PlaneGeometry(4.64, 3.3), albumCoverBackMat = new THREE.MeshBasicMaterial({ color: '#f1f0eb' });
    this.geometries.add(albumCoverBackGeo); this.materials.add(albumCoverBackMat); this.albumCoverBackMaterial = albumCoverBackMat;
    this.albumCoverBack = new THREE.Mesh(albumCoverBackGeo, albumCoverBackMat);
    this.albumCoverBack.position.set(0, 1.85, -.14); this.albumCoverBack.rotation.y = Math.PI;
    this.albumCoverBack.visible = false; this.detailModel.add(this.albumCoverBack);
    // Geometry coordinates are baked from the cassette: the main hub is (-.425, 1.8).
    this.albumVinyl = new THREE.Group(); this.albumVinyl.position.set(-.425, 1.8, .22);
    this.albumVinyl.visible = false; this.detailModel.add(this.albumVinyl);
    const addRing = (inner, outer, color, z) => {
      const geometry = new THREE.RingGeometry(inner, outer, 128);
      const material = new THREE.MeshBasicMaterial({ color });
      this.geometries.add(geometry); this.materials.add(material);
      const ring = new THREE.Mesh(geometry, material); ring.position.z = z; this.albumVinyl.add(ring);
    };
    addRing(.025, .515, '#121514', 0);
    for (let i = 0; i < 15; i++) addRing(.365 + i * .01, .367 + i * .01, i % 3 ? '#272c29' : '#394038', .001);
    addRing(.345, .351, '#d8ff4f', .002);
    const albumCoverFrontGeo = new THREE.RingGeometry(.025, .338, 128), albumCoverFrontMat = new THREE.MeshBasicMaterial();
    this.geometries.add(albumCoverFrontGeo); this.materials.add(albumCoverFrontMat); this.albumCoverFrontMaterial = albumCoverFrontMat;
    this.albumCoverFront = new THREE.Mesh(albumCoverFrontGeo, albumCoverFrontMat); this.albumCoverFront.position.z = .003; this.albumVinyl.add(this.albumCoverFront);
    this.updateLabel(); this.loaded = true; this.select(this.selected);
    this.last = performance.now(); this.renderer.setAnimationLoop(now => this.frame(now));
  }
  updateLabel() {
    if (!this.labelCanvas) return;
    const ctx = this.labelCanvas.getContext('2d'), selection = this.selectionAt(this.selected), work = selection.item;
    ctx.fillStyle = '#f1f0eb'; ctx.fillRect(0, 0, 1024, 384);
    ctx.fillStyle = '#0d0f10'; ctx.font = 'bold 64px monospace'; ctx.fillText('HAOQI / STUDIO', 30, 90);
    ctx.fillRect(30, 115, 964, 3); ctx.font = 'bold 120px monospace'; ctx.fillText(work.archiveCode, 30, 258);
    ctx.font = '30px monospace'; ctx.fillText(`${selection.group.id.toUpperCase()} / CREATIVE ARCHIVE`, 30, 342); this.labelTexture.needsUpdate = true;
    this.updateAlbumCover(selection.group.id, work);
  }
  updateAlbumCover(groupId, work) {
    if (!this.albumCoverBack || !this.albumCoverFront) return;
    const source = groupId === 'music' && work.image && !work.pending ? work.image : '';
    this.albumCoverBack.visible = Boolean(source && source === this.albumCoverLoadedSource);
    this.albumVinyl.visible = this.albumCoverBack.visible;
    if (source === this.albumCoverSource) return;
    this.albumCoverSource = source;
    if (!source) return;
    new THREE.TextureLoader().load(source, (texture) => {
      if (this.disposed || source !== this.albumCoverSource) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      this.albumCoverTexture?.dispose(); this.albumCoverTexture = texture;
      // A fitted sleeve insert, facing outwards on the rear rather than mirrored through the case.
      const sleeve = document.createElement('canvas'); sleeve.width = 1406; sleeve.height = 1000;
      const ctx = sleeve.getContext('2d');
      ctx.fillStyle = '#151916'; ctx.fillRect(0, 0, sleeve.width, sleeve.height);
      const image = texture.image, size = 904;
      const scale = Math.min(size / image.width, size / image.height);
      ctx.drawImage(image, 32 + (size - image.width * scale) / 2, 48 + (size - image.height * scale) / 2, image.width * scale, image.height * scale);
      ctx.fillStyle = '#d8ff4f'; ctx.fillRect(976, 48, 2, 904);
      ctx.font = '24px monospace'; ctx.fillText('HAOQI / STUDIO', 1010, 83);
      ctx.fillStyle = '#f1f0eb'; ctx.font = 'bold 38px sans-serif'; ctx.fillText(work.title || work.archiveCode, 1010, 164, 358);
      ctx.font = '22px monospace'; ctx.fillText(work.archiveCode, 1010, 211);
      ctx.fillStyle = '#a4aca2'; ctx.font = '18px monospace';
      ctx.fillText('ORIGINAL SOUNDTRACK', 1010, 257);
      (work.tracks || []).slice(0, 12).forEach((track, i) => {
        ctx.fillText(`${String(i + 1).padStart(2, '0')} / ${track.title}`, 1010, 330 + i * 42, 355);
      });
      ctx.fillStyle = '#d8ff4f'; ctx.fillText('SIDE B / ARCHIVE EDITION', 1010, 914, 355);
      this.albumSleeveTexture?.dispose(); this.albumSleeveTexture = new THREE.CanvasTexture(sleeve);
      this.albumSleeveTexture.colorSpace = THREE.SRGBColorSpace;
      this.albumCoverBackMaterial.map = this.albumSleeveTexture; this.albumCoverBackMaterial.needsUpdate = true;
      this.albumCoverFrontMaterial.map = texture; this.albumCoverFrontMaterial.needsUpdate = true;
      this.albumCoverLoadedSource = source; this.albumCoverBack.visible = true; this.albumVinyl.visible = true;
    }, undefined, () => {
      if (source === this.albumCoverSource) this.albumCoverSource = '';
    });
  }
  select(cell) {
    if (!this.loaded || this.targetDetail || this.detail.value > .1) return;
    if (this.selected.lane === cell.lane && this.selected.row === cell.row) { this.onActivate?.(this.selectionAt(cell)); return; }
    this.selected = { ...cell }; this.pulses.push({ ...cell, time: this.time });
    this.updateLabel(); this.onSelect(this.selectionAt(cell), cell);
  }
  navigate(axis, delta) { this.select({ ...this.selected, [axis]: this.selected[axis] + delta }); }
  selectItemIndex(index) {
    const items = this.groups[this.groupIndexAt(this.selected)].items;
    const row = occurrence(index, this.selected.row, items.length);
    this.select({ lane: this.selected.lane, row });
  }
  setDetail(open) { this.targetDetail = open ? 1 : 0; }
  setReduced(reduced) { this.reduced = reduced; }
  hit(e) {
    if (!this.loaded || this.targetDetail || this.detail.value > .1) return null;
    const bounds = this.canvas.getBoundingClientRect();
    this.pointer.set((e.clientX-bounds.left)/bounds.width*2-1, -(e.clientY-bounds.top)/bounds.height*2+1);
    this.ray.setFromCamera(this.pointer, this.camera);
    const hit = this.ray.intersectObjects([this.hitSurface, this.detailModel].filter(Boolean), true)[0];
    return hit ? hit.instanceId === undefined ? this.selected : this.cells[hit.instanceId] : null;
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
    this.renderer.setSize(w, h); this.camera.aspect = w/h; this.camera.updateProjectionMatrix();
  }
  frame(now) {
    if (this.disposed) return;
    const dt = Math.min((now-this.last)/1000, .05); this.last = now;
    if (document.hidden) return;
    this.time += dt; const rate = this.reduced ? 1000 : 4.2;
    damp(this.trackX, this.selected.lane*SPACING_X, rate, dt);
    damp(this.trackZ, this.selected.row*SPACING_Z, rate, dt);
    if (!this.targetDetail) this.detailModel.rotation.y = returnStep(this.detailModel.rotation.y, dt, this.reduced);
    const aligning = !this.targetDetail && this.detailModel.rotation.y !== 0;
    damp(this.detail, aligning ? 1 : this.targetDetail, this.reduced ? 1000 : 4.5, dt);
    if (this.coverMaterial) this.coverMaterial.roughness = .22 - this.detail.value * .18;
    this.pulses = this.pulses.filter(p => this.time-p.time < 3.2).slice(-12);
    const wave = (lane, row) => this.reduced ? 0 : this.pulses.reduce((total,p) => total + baselineSelectionWave(Math.abs(row-p.row), this.time-p.time) * columnStrength(lane,p.lane), 0) * (1-this.detail.value);
    let selectedY = 0; const alive = new Set();
    for (let i=0; i<LANES*ROWS; i++) {
      const lane = occurrence(Math.floor(i/ROWS), this.trackX.value/SPACING_X, LANES);
      const row = occurrence(i%ROWS, this.trackZ.value/SPACING_Z, ROWS);
      const key = `${lane}:${row}`; alive.add(key); const active = lane===this.selected.lane && row===this.selected.row;
      let lift = this.lifts.get(key); if (!lift) { lift=spring(); this.lifts.set(key,lift); }
      damp(lift, active ? .55+this.detail.value*3.5 : 0, rate, dt);
      const y = -4.6+wave(lane,row)+lift.value;
      this.cells[i] = { lane,row };
      this.dummy.position.set(lane*SPACING_X-this.trackX.value,y,row*SPACING_Z-this.trackZ.value);
      this.dummy.rotation.set((wave(lane,row+.5)-wave(lane,row-.5))*.024,0,0);
      this.dummy.scale.setScalar(active ? 0 : 1); this.dummy.updateMatrix();
      this.instances.forEach(inst => inst.setMatrixAt(i,this.dummy.matrix));
      if (active) { this.detailModel.position.copy(this.dummy.position); selectedY=y; }
    }
    this.lifts.forEach((_,key) => { if (!alive.has(key)) this.lifts.delete(key); });
    this.instances.forEach(inst => { inst.instanceMatrix.needsUpdate=true; });
    const detail=this.detail.value, yaw=THREE.MathUtils.degToRad(59-41*detail), elevation=THREE.MathUtils.degToRad(19-5*detail);
    const distance=100, direction=new THREE.Vector3(-Math.sin(yaw)*Math.cos(elevation),Math.sin(elevation),Math.cos(yaw)*Math.cos(elevation));
    const span=this.camera.aspect < .85 ? 12 : 8.8;
    const target=new THREE.Vector3(-.8,-1.5,0);
    const detailTarget=this.detailModel.position.clone().add(new THREE.Vector3(0,1.85,0));
    if (this.camera.aspect>1) detailTarget.add(new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),direction).multiplyScalar(2.1));
    target.lerp(detailTarget,detail);
    this.camera.position.copy(target).addScaledVector(direction,distance); this.camera.lookAt(target);
    this.camera.fov=THREE.MathUtils.radToDeg(2*Math.atan((span-detail*2)/(2*distance))); this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene,this.camera);
    const selected = this.selectionAt(this.selected);
    this.host.dataset.selected=`${selected.group.id}:${selected.itemIndex}`;
    this.host.dataset.lift=selectedY.toFixed(3);
    this.host.dataset.phase=this.targetDetail ? (detail>.95?'detail':'extracting') : detail>.05?'returning':'browsing';
  }
  dispose() {
    this.disposed=true; this.renderer.setAnimationLoop(null); this.observer.disconnect();
    this.canvas.removeEventListener('pointerdown',this.down); this.canvas.removeEventListener('pointermove',this.move);
    this.canvas.removeEventListener('pointerup',this.up); this.canvas.removeEventListener('pointerleave',this.leave);
    this.canvas.removeEventListener('contextmenu',this.contextMenu);
    this.canvas.removeEventListener('webglcontextlost',this.lost);
    this.instances.forEach(inst=>inst.dispose()); this.geometries.forEach(g=>g.dispose()); this.materials.forEach(m=>m.dispose());
    this.labelTexture?.dispose(); this.albumCoverTexture?.dispose(); this.albumSleeveTexture?.dispose(); this.environment.dispose(); this.light.shadow.map?.dispose(); this.renderer.dispose(); this.canvas.remove();
  }
}
