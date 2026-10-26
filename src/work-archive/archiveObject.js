import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { artworkTheme } from './artworkTheme.js';
import { createVinylReveal } from './vinylReveal.js';

const FONT = '"Microsoft YaHei", sans-serif';
const MONO = 'Consolas, monospace';
const fitImage = (ctx, image, x, y, width, height) => {
  if (!image) return;
  const scale = Math.min(width / image.width, height / image.height);
  ctx.drawImage(image, x + (width - image.width * scale) / 2, y + (height - image.height * scale) / 2, image.width * scale, image.height * scale);
};

// Each selected archive owns its resources; the stable scene root handles motion.
export function createArchiveObject({ kind, work, cover, promotion, metadata = {}, theme: preparedTheme }) {
  const group = new THREE.Group(); group.name = `${kind}:${work.archiveCode}`;
  const geometries = new Set(), materials = new Set(), textures = new Set([cover, promotion].filter(Boolean));
  const theme = preparedTheme || artworkTheme(cover?.image || promotion?.image, kind);
  let reveal;
  group.userData = { kind, archiveCode: work.archiveCode, theme, hasArtwork: Boolean(cover || promotion) };
  const material = (options, basic = false) => {
    const result = basic ? new THREE.MeshBasicMaterial({ toneMapped: false, fog: false, ...options }) : new THREE.MeshStandardMaterial({ fog: false, ...options });
    materials.add(result); return result;
  };
  const mesh = (geometry, mat, x, y, z, name) => {
    geometries.add(geometry);
    const result = new THREE.Mesh(geometry, mat); result.position.set(x, y, z);
    result.name = name || ''; result.castShadow = !mat.isMeshBasicMaterial; result.receiveShadow = !mat.isMeshBasicMaterial;
    group.add(result); return result;
  };
  const box = (w, h, d, x, y, z, mat, name) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, name);
  const plane = (w, h, x, y, z, mat, name, back = false) => {
    const result = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, name);
    if (back) result.rotation.y = Math.PI;
    return result;
  };
  const print = (width, height, paint) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    paint(canvas.getContext('2d'));
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4; textures.add(texture);
    return material({ map: texture }, true);
  };
  const paper = material({ color: theme.paper, roughness: .94 });
  const metal = material({ color: theme.shell, metalness: .6, roughness: .4 });
  const accent = material({ color: theme.accent, metalness: .28, roughness: .48 });
  const label = work.archiveCode || 'ARCHIVE';
  const title = work.title || label;
  const printIdentity = (ctx, width, height, subtitle) => {
    ctx.fillStyle = theme.paper; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = theme.ink; ctx.font = `26px ${MONO}`; ctx.fillText('HAOQI / STUDIO', 52, 75);
    ctx.fillRect(52, 105, width - 104, 2);
    ctx.font = `bold 74px ${MONO}`; ctx.fillText(label, 52, height * .48, width - 104);
    ctx.font = `36px ${FONT}`; ctx.fillText(title, 52, height * .62, width - 104);
    ctx.font = `22px ${MONO}`; ctx.fillText(subtitle, 52, height - 55, width - 104);
  };

  if (kind === 'photo') {
    // Same measured envelope as the approved preview: 5 × 3.7 × .35.
    const backing = material({ color: theme.shell, roughness: .78 });
    box(4.9, 3.6, .28, 0, 1.85, 0, backing, 'frame-backing');
    for (const y of [.05, 3.65]) box(5, .1, .35, 0, y, 0, metal, 'frame-rail');
    for (const x of [-2.45, 2.45]) box(.1, 3.5, .35, x, 1.85, 0, metal, 'frame-rail');
    for (const y of [.11, 3.59]) box(4.8, .028, .026, 0, y, .16, accent, 'inner-bevel');
    for (const x of [-2.385, 2.385]) box(.028, 3.45, .026, x, 1.85, .16, accent, 'inner-bevel');
    plane(4.74, 3.44, 0, 1.85, .151, paper, 'archival-mount');
    if (cover) {
      const ratio = cover.image.width / cover.image.height;
      const width = Math.min(4.38, 2.24 * ratio), height = width / ratio;
      plane(width, height, 0, 1.98, .158, material({ map: cover }, true), 'original-photograph');
    } else {
      plane(4.38, 2.24, 0, 1.98, .158, print(1300, 665, ctx => printIdentity(ctx, 1300, 665, 'PHOTOGRAPHIC ARCHIVE')), 'photo-placeholder');
    }
    const caption = print(1300, 210, ctx => {
      ctx.fillStyle = theme.paper; ctx.fillRect(0, 0, 1300, 210);
      ctx.fillStyle = theme.shell; ctx.font = `28px ${MONO}`; ctx.fillText('HAOQI / PHOTOGRAPHIC ARCHIVE', 28, 47);
      ctx.fillStyle = theme.ink; ctx.font = `48px ${FONT}`; ctx.fillText(title, 28, 138, 910);
      ctx.font = `bold 34px ${MONO}`; ctx.fillText(label, 1000, 138, 280);
    });
    plane(4.38, .707, 0, .51, .158, caption, 'photo-caption');
    const catalog = print(800, 580, ctx => {
      ctx.fillStyle = theme.paper; ctx.fillRect(0, 0, 800, 580);
      ctx.fillStyle = theme.ink; ctx.font = `bold 68px ${MONO}`; ctx.fillText(label, 45, 110, 710);
      if (cover) fitImage(ctx, cover.image, 45, 145, 300, 135);
      ctx.font = `38px ${FONT}`; ctx.fillText(work.city || title, 45, 350, 710);
      ctx.font = `42px ${MONO}`; ctx.fillText(work.date || work.year || '', 45, 415, 710);
      ctx.fillStyle = theme.shell; ctx.font = `25px ${MONO}`; ctx.fillText('HAOQI / PHOTOGRAPHIC ARCHIVE', 45, 525, 710);
    });
    plane(2.4, 1.74, -.7, 1.5, -.145, catalog, 'photo-catalog', true);
    const clip = material({ color: '#b7b8b4', metalness: .8, roughness: .45 });
    for (const x of [-2.18, 2.18]) for (const y of [.35, 3.35]) box(.115, .33, .035, x, y, -.158, clip, 'retaining-clip');
    box(.58, .095, .025, 0, 3.35, -.153, material({ color: '#19212b', roughness: .9 }), 'hanging-recess');
  } else if (kind === 'games') {
    const polymer = new THREE.MeshPhysicalMaterial({ color: theme.primary, metalness: .08, roughness: .2, transparent: true, opacity: .58, clearcoat: 1, fog: false });
    materials.add(polymer);
    box(3.62, 3.58, .24, 0, 1.85, 0, metal, 'game-case');
    for (const y of [.05, 3.65]) box(3.7, .1, .35, 0, y, 0, polymer, 'clear-case-edge');
    for (const x of [-1.8, 1.8]) box(.1, 3.5, .35, x, 1.85, 0, polymer, 'clear-case-edge');
    const front = print(1200, 1200, ctx => {
      ctx.fillStyle = theme.paper; ctx.fillRect(0, 0, 1200, 1200);
      if (cover) fitImage(ctx, cover.image, 0, 0, 1200, 1200);
      else printIdentity(ctx, 1200, 1200, 'GAME DISC / CREATIVE ARCHIVE');
    });
    // An uninterrupted printed insert sits above the enclosed disc: no front hub.
    plane(3.3, 3.3, .09, 1.85, .128, front, 'complete-game-cover');
    const spine = print(150, 1200, ctx => {
      ctx.fillStyle = theme.paper; ctx.fillRect(0, 0, 150, 1200);
      ctx.save(); ctx.translate(75, 1100); ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = theme.shell; ctx.font = `bold 55px ${FONT}`; ctx.fillText(title, 0, 15, 850);
      ctx.font = `24px ${MONO}`; ctx.fillText(label, 690, 15, 290); ctx.restore();
    });
    plane(.14, 3.3, -1.67, 1.85, .13, spine, 'game-spine');
    const rear = print(1200, 1200, ctx => {
      ctx.fillStyle = theme.shell; ctx.fillRect(0, 0, 1200, 1200);
      if (promotion || cover) fitImage(ctx, (promotion || cover).image, 45, 45, 1110, 865);
      else { printIdentity(ctx, 1200, 1200, 'GAME DISC'); return; }
      ctx.fillStyle = theme.paper; ctx.font = `bold 76px ${FONT}`; ctx.fillText(title, 55, 1030, 1060);
      ctx.fillStyle = theme.accent; ctx.font = `28px ${MONO}`; ctx.fillText(`${label} / GAME DISC`, 55, 1120, 1050);
    });
    plane(3.44, 3.3, 0, 1.85, -.128, rear, 'game-promotion', true);
    // Small perimeter hinges and catches belong to the case, away from the art.
    for (const y of [.18, 3.52]) for (const x of [-1.65, 1.65]) box(.19, .09, .34, x, y, 0, polymer, 'case-catch');
    box(.035, 3.35, .35, -1.54, 1.85, 0, accent, 'case-hinge');
  } else {
    const sleeve = new THREE.Group(); sleeve.name = 'sleeve-assembly'; group.add(sleeve);
    const vinylAssembly = new THREE.Group(); vinylAssembly.name = 'vinyl-assembly';
    vinylAssembly.position.y = 1.85; group.add(vinylAssembly);
    // Keep the printed sleeve and record separate so extraction moves each as one object.
    const inSleeve = item => { sleeve.add(item); return item; };
    const inVinyl = item => { vinylAssembly.add(item); return item; };
    const sleeveFront = .105, sleeveBack = -.055;
    inSleeve(box(3.36, 3.5, .15, 0, 1.85, .025, paper, 'paper-sleeve'));
    const front = print(1100, 1145, ctx => {
      ctx.fillStyle = theme.paper; ctx.fillRect(0, 0, 1100, 1145);
      if (cover) fitImage(ctx, cover.image, 22, 22, 1056, 1056);
      else printIdentity(ctx, 1100, 1145, 'VINYL / ARCHIVE EDITION');
      ctx.fillStyle = theme.shell; ctx.font = `23px ${MONO}`; ctx.fillText(`${label} / SIDE A`, 25, 1120, 1040);
    });
    inSleeve(plane(3.34, 3.48, 0, 1.85, sleeveFront, front, 'album-sleeve-front'));
    const rear = print(1100, 1145, ctx => {
      ctx.fillStyle = theme.paper; ctx.fillRect(0, 0, 1100, 1145);
      ctx.fillStyle = theme.shell; ctx.font = `27px ${MONO}`; ctx.fillText(`HAOQI / ${label}`, 65, 85);
      if (cover) fitImage(ctx, cover.image, 65, 130, 430, 430);
      ctx.fillStyle = theme.ink; ctx.font = `bold 48px ${FONT}`; ctx.fillText(metadata.album || title, 65, 645, 970);
      ctx.font = `30px ${FONT}`; ctx.fillText(metadata.artist || work.artist || '', 65, 705, 970);
      ctx.fillStyle = theme.shell; ctx.fillRect(65, 760, 970, 2);
      ctx.font = `25px ${MONO}`;
      ctx.fillText(`${String(work.tracks?.length || 0).padStart(2, '0')} TRACKS / VINYL ARCHIVE`, 65, 830, 970);
      ctx.fillText('SIDE B / ARCHIVE EDITION', 65, 1065, 970);
    });
    inSleeve(plane(3.34, 3.48, 0, 1.85, sleeveBack, rear, 'album-sleeve-back', true));
    inSleeve(box(.035, 3.5, .155, -1.67, 1.85, .025, accent, 'paper-spine'));
    const vinyl = material({ color: '#101211', metalness: .18, roughness: .33 });
    const disc = inVinyl(mesh(new THREE.CylinderGeometry(1.5, 1.5, .04, 128), vinyl, 0, 0, 0, 'black-vinyl'));
    disc.rotation.x = Math.PI / 2;
    const grooves = [];
    for (let radius = .62; radius < 1.47; radius += .021) grooves.push(new THREE.RingGeometry(radius, radius + .0025, 128));
    const grooveGeometry = mergeGeometries(grooves); grooves.forEach(geometry => geometry.dispose());
    const grooveInk = material({ color: '#363a35' }, true);
    for (const back of [false, true]) {
      const lines = inVinyl(mesh(grooveGeometry, grooveInk, 0, 0, back ? -.022 : .022, 'vinyl-grooves'));
      if (back) lines.rotation.y = Math.PI;
      const centre = print(480, 480, ctx => {
        ctx.fillStyle = theme.accent; ctx.fillRect(0, 0, 480, 480);
        if (cover) { ctx.globalAlpha = .85; fitImage(ctx, cover.image, 0, 0, 480, 480); ctx.globalAlpha = 1; }
        ctx.fillStyle = theme.paper; ctx.fillRect(0, 330, 480, 150);
        ctx.fillStyle = theme.shell; ctx.font = `bold 25px ${MONO}`; ctx.fillText(label, 105, 375);
        ctx.font = `18px ${MONO}`; ctx.fillText(back ? 'SIDE B' : 'SIDE A', 165, 412);
      });
      const hub = inVinyl(mesh(new THREE.RingGeometry(.045, .5, 96), centre, 0, 0, back ? -.024 : .024, 'vinyl-label'));
      if (back) hub.rotation.y = Math.PI;
    }
    reveal = createVinylReveal(sleeve, vinylAssembly);
  }
  return { group, setReveal(progress) { reveal?.setReveal(progress); },
    get revealProgress() { return reveal?.revealProgress || 0; }, dispose() {
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(mat => mat.dispose()); textures.forEach(texture => texture.dispose());
  } };
}
