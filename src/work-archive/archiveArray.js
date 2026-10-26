import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { artworkCatalog } from './artworkCatalog.js';
import { artworkTheme } from './artworkTheme.js';

const mediaBase = import.meta.env?.VITE_MEDIA_BASE?.replace(/\/+$/, '') || '';
const mediaUrl = url => url?.startsWith('/media/') ? mediaBase + url : url;
const themeColour = new THREE.Color();
const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const font = '"Microsoft YaHei", sans-serif';
const neutralTheme = { shell: '#dce0da', primary: '#e0e5df', accent: '#bbc3b4', paper: '#f1f0eb', ink: '#465044' };

export async function prepareArchiveArtwork(groups, anisotropy = 1) {
  const entries = new Map(), textures = new Set();
  const load = async url => {
    if (!url) return undefined;
    try {
      const texture = await new THREE.TextureLoader().loadAsync(mediaUrl(url));
      texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = anisotropy;
      textures.add(texture); return texture;
    } catch { return undefined; }
  };
  await Promise.all(groups.flatMap(group => group.items.map(async work => {
    const known = artworkCatalog[work.archiveCode];
    const coverUrl = work.pending ? '' : known?.cover || (group.id === 'games' ? work.icon : work.image || work.cover);
    const promotionUrl = group.id === 'games' && work.icon ? work.gallery?.find(image => image.kind === 'artwork')?.src || work.image : '';
    const [cover, promotion] = await Promise.all([load(coverUrl), load(promotionUrl)]);
    entries.set(work.archiveCode, { kind: group.id, work, cover, promotion,
      theme: known?.theme || (cover ? artworkTheme(cover.image, group.id) : neutralTheme), metadata: known?.metadata || {} });
  })));
  return { entries, clone(code) {
    const entry = entries.get(code);
    return { ...entry, cover: entry.cover?.clone(), promotion: entry.promotion?.clone() };
  }, dispose() { textures.forEach(texture => texture.dispose()); } };
}

const drawFit = (ctx, image, x, y, width, height) => {
  if (!image) return;
  const scale = Math.min(width / image.width, height / image.height);
  ctx.drawImage(image, x + (width - image.width * scale) / 2, y + (height - image.height * scale) / 2, image.width * scale, image.height * scale);
};

function paintFront(ctx, entry) {
  const { kind, work, theme, cover } = entry;
  ctx.fillStyle = theme.paper; ctx.fillRect(0, 0, 256, 256);
  if (kind === 'photo') {
    // Paint in the actual mount's coordinates, not the square atlas coordinates.
    ctx.save(); ctx.scale(256 / 4.74, 256 / 3.44);
    if (cover) {
      const ratio = cover.image.width / cover.image.height, width = Math.min(4.38, 2.24 * ratio), height = width / ratio;
      drawFit(ctx, cover.image, (4.74 - width) / 2, 1.59 - height / 2, width, height);
    }
    ctx.fillStyle = theme.shell; ctx.font = '.094px monospace'; ctx.fillText('HAOQI / PHOTOGRAPHIC ARCHIVE', .274, 2.865);
    ctx.font = `.162px ${font}`; ctx.fillText(work.title, .274, 3.171, 3.06);
    ctx.font = '.115px monospace'; ctx.fillText(work.archiveCode, 3.549, 3.171, .94);
    ctx.restore();
  } else if (cover && kind === 'music') {
    ctx.save(); ctx.scale(256 / 1100, 256 / 1145);
    drawFit(ctx, cover.image, 22, 22, 1056, 1056);
    ctx.fillStyle = theme.shell; ctx.font = '23px monospace'; ctx.fillText(`${work.archiveCode} / SIDE A`, 25, 1120, 1040);
    ctx.restore();
  } else if (cover) {
    drawFit(ctx, cover.image, 0, 0, 256, 256);
  } else {
    ctx.fillStyle = theme.ink; ctx.font = '8px monospace'; ctx.fillText('HAOQI / STUDIO', 14, 23);
    ctx.fillRect(14, 32, 228, 1); ctx.font = 'bold 20px monospace'; ctx.fillText(work.archiveCode, 14, 120);
    ctx.font = `10px ${font}`; ctx.fillText(work.title, 14, 153, 225);
  }
}

// A global archive slot keeps its category while the nine-lane window repeats.
// Pack each category's parts into its own pool rather than drawing zero-scaled
// copies of all other categories. archiveSlots maps ray hits back to global cells.
export function createArchiveArray(library, count, slotKinds) {
  const localSlots = new Int32Array(count), globalSlots = new Map();
  slotKinds.forEach((kind, index) => {
    if (!globalSlots.has(kind)) globalSlots.set(kind, []);
    const pool = globalSlots.get(kind);
    localSlots[index] = pool.length; pool.push(index);
  });
  for (const [kind, indices] of globalSlots) globalSlots.set(kind, Int32Array.from(indices));
  const entries = [...library.entries.values()], columns = 8, tile = 272, inset = 8;
  const canvas = document.createElement('canvas'); canvas.width = columns * tile; canvas.height = Math.ceil(entries.length / columns) * tile;
  const ctx = canvas.getContext('2d'), artworkUv = new Map();
  entries.forEach((entry, index) => {
    const x = index % columns * tile, y = Math.floor(index / columns) * tile;
    ctx.fillStyle = entry.theme.paper; ctx.fillRect(x, y, tile, tile);
    ctx.save(); ctx.translate(x + inset, y + inset); paintFront(ctx, entry); ctx.restore();
    artworkUv.set(entry.work.archiveCode, [(x + inset) / canvas.width, 1 - (y + inset + 256) / canvas.height, 256 / canvas.width, 256 / canvas.height]);
  });
  const atlas = new THREE.CanvasTexture(canvas); atlas.colorSpace = THREE.SRGBColorSpace;
  atlas.anisotropy = 4;
  const meshes = [], parts = new Map(), slots = [], geometries = new Set(), materials = new Set();
  const geometryBox = (w, h, d, x = 0, y = 1.85, z = 0) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
  const merged = list => { const result = mergeGeometries(list); list.forEach(geometry => geometry.dispose()); return result; };
  const add = (kind, geometry, colour, options = {}) => {
    const archiveSlots = globalSlots.get(kind) || new Int32Array(0), capacity = archiveSlots.length;
    const printed = colour === 'artwork';
    const material = printed ? new THREE.MeshBasicMaterial({ map: atlas, toneMapped: false }) : options.clear
      ? new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: .08, roughness: .2, transparent: true, opacity: .58, clearcoat: 1 })
      : new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: options.metalness ?? .15, roughness: options.roughness ?? .45 });
    if (printed) {
      geometry.setAttribute('archiveUv', new THREE.InstancedBufferAttribute(new Float32Array(capacity * 4), 4));
      material.onBeforeCompile = shader => {
        shader.vertexShader = 'attribute vec4 archiveUv;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = vMapUv * archiveUv.zw + archiveUv.xy;\n#endif');
      };
      material.customProgramCacheKey = () => 'archive-cover-atlas-v1';
    }
    const mesh = new THREE.InstancedMesh(geometry, material, capacity);
    mesh.name = `closed-${kind}-${colour}`; mesh.userData = { kind, colour, archiveSlots };
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false;
    mesh.castShadow = !printed; mesh.receiveShadow = !printed;
    for (let i = 0; i < capacity; i++) mesh.setMatrixAt(i, hiddenMatrix);
    if (!printed && capacity) mesh.setColorAt(0, themeColour.set('#ffffff'));
    meshes.push(mesh); if (!parts.has(kind)) parts.set(kind, []); parts.get(kind).push(mesh);
    geometries.add(geometry); materials.add(material);
  };
  add('games', geometryBox(3.62, 3.58, .24), 'shell', { metalness: .6, roughness: .4 });
  add('games', merged([
    ...[.05, 3.65].map(y => geometryBox(3.7, .1, .35, 0, y)),
    ...[-1.8, 1.8].map(x => geometryBox(.1, 3.5, .35, x)),
  ]), 'primary', { clear: true });
  add('games', geometryBox(.035, 3.35, .35, -1.54), 'accent');
  add('games', new THREE.PlaneGeometry(3.3, 3.3).translate(.09, 1.85, .128), 'artwork');
  add('photo', geometryBox(4.9, 3.6, .28), 'shell', { roughness: .78 });
  add('photo', merged([
    ...[.05, 3.65].map(y => geometryBox(5, .1, .35, 0, y)),
    ...[-2.45, 2.45].map(x => geometryBox(.1, 3.5, .35, x)),
  ]), 'shell', { metalness: .6, roughness: .4 });
  add('photo', merged([
    ...[.11, 3.59].map(y => geometryBox(4.8, .028, .026, 0, y, .16)),
    ...[-2.385, 2.385].map(x => geometryBox(.028, 3.45, .026, x, 1.85, .16)),
  ]), 'accent');
  add('photo', new THREE.PlaneGeometry(4.74, 3.44).translate(0, 1.85, .151), 'artwork');
  add('music', geometryBox(3.36, 3.5, .15, 0, 1.85, .025), 'paper', { roughness: .94 });
  add('music', geometryBox(.035, 3.5, .155, -1.67, 1.85, .025), 'accent');
  add('music', new THREE.PlaneGeometry(3.34, 3.48).translate(0, 1.85, .105), 'artwork');
  return { meshes, setSlot(index, selection) {
    const { group, item } = selection, key = item.archiveCode, localIndex = localSlots[index];
    if (slotKinds[index] !== group.id) throw new Error('Archive category changed outside its repeating pool');
    if (slots[index]?.key === key) return;
    const entry = library.entries.get(key);
    slots[index] = { key, kind: group.id };
    for (const mesh of parts.get(group.id)) {
      if (mesh.userData.colour === 'artwork') {
        mesh.geometry.attributes.archiveUv.setXYZW(localIndex, ...artworkUv.get(key)); mesh.geometry.attributes.archiveUv.needsUpdate = true;
      } else { mesh.setColorAt(localIndex, themeColour.set(entry.theme[mesh.userData.colour])); mesh.instanceColor.needsUpdate = true; }
    }
  }, setMatrixAt(index, matrix) {
    for (const mesh of parts.get(slots[index].kind)) mesh.setMatrixAt(localSlots[index], matrix);
  }, getMatrixAt(index, matrix) {
    parts.get(slotKinds[index])[0].getMatrixAt(localSlots[index], matrix);
  }, commit() {
    meshes.forEach(mesh => { mesh.instanceMatrix.needsUpdate = true; mesh.boundingSphere = null; });
  }, dispose() {
    meshes.forEach(mesh => mesh.dispose()); geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); atlas.dispose();
  } };
}
