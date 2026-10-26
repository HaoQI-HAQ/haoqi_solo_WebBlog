#!/usr/bin/env node
// Rebuild the lightweight Work archive catalogue from the original local artwork.
// Run: node scripts/build-archive-artwork.mjs
// Optional: SHARP_MODULE=/absolute/path/to/sharp (no extra project dependency needed).
import { existsSync } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gameWorks, musicTracks, photoAlbums } from '../src/content.js';
import { readAudioMetadata } from '../src/work-archive/audioMetadata.js';
import { paletteFromPixels, themeFromPalette } from '../src/work-archive/artworkTheme.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = resolve(projectRoot, 'public');
const outputDirectory = resolve(publicRoot, 'media/work-archive/covers');
const require = createRequire(import.meta.url);

function loadSharp() {
  const candidates = [process.env.SHARP_MODULE, 'sharp',
    'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'].filter(Boolean);
  for (const candidate of candidates) {
    try { return require(candidate); } catch { /* Try the next installed runtime. */ }
  }
  throw new Error('Sharp is required to rebuild artwork previews. Set SHARP_MODULE to an installed sharp package.');
}

function localMediaPath(url) {
  if (typeof url !== 'string' || !url.startsWith('/media/')) throw new Error(`Expected local /media/ artwork: ${url}`);
  const fullPath = resolve(publicRoot, `.${url}`);
  const offset = relative(publicRoot, fullPath);
  if (offset.startsWith('..') || isAbsolute(offset)) throw new Error('Media path leaves the project public folder.');
  return fullPath;
}

// Reuse the site's ID3/APIC reader. Its /media/ fetches read local files here;
// native fetch is used only for the in-memory blob URLs created by that reader.
const nativeFetch = globalThis.fetch;
globalThis.fetch = async url => {
  if (typeof url === 'string' && url.startsWith('blob:')) return nativeFetch(url);
  const buffer = await readFile(localMediaPath(url));
  return new Response(buffer);
};

const sharp = loadSharp();
const catalogue = {};
const previews = [];

async function themeFromSource(source, kind) {
  const { data } = await sharp(source).rotate().resize(80, 80, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return themeFromPalette(paletteFromPixels(data), kind);
}

async function previewFromSource(source, archiveCode) {
  const filename = `${archiveCode.toLowerCase()}.webp`;
  const output = resolve(outputDirectory, filename);
  // 'inside' retains the entire original image and its aspect ratio.
  await sharp(source).rotate().resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 }).toFile(output);
  const [info, file] = await Promise.all([sharp(output).metadata(), stat(output)]);
  previews.push({ archiveCode, width: info.width, height: info.height, bytes: file.size });
  return `/media/work-archive/covers/${filename}`;
}

try {
  await mkdir(outputDirectory, { recursive: true });
  for (const work of gameWorks.filter(work => !work.pending && work.icon)) {
    catalogue[work.archiveCode] = {
      kind: 'games', theme: await themeFromSource(localMediaPath(work.icon), 'games'), cover: work.icon,
    };
  }

  for (const work of photoAlbums.filter(work => !work.pending && work.cover)) {
    const source = localMediaPath(work.cover);
    catalogue[work.archiveCode] = {
      kind: 'photo', theme: await themeFromSource(source, 'photo'),
      cover: await previewFromSource(source, work.archiveCode),
    };
  }

  for (const work of musicTracks.filter(work => !work.pending && work.tracks?.length)) {
    let metadata = {}, source;
    for (const track of work.tracks) {
      const embedded = await readAudioMetadata(track.src);
      metadata = { ...embedded, album: embedded.album || metadata.album, artist: embedded.artist || metadata.artist };
      if (!embedded.cover) continue;
      const response = await nativeFetch(embedded.cover);
      source = Buffer.from(await response.arrayBuffer());
      URL.revokeObjectURL(embedded.cover);
      break;
    }
    if (!source && work.image?.startsWith('/media/') && existsSync(localMediaPath(work.image))) source = localMediaPath(work.image);
    if (!source) throw new Error(`${work.archiveCode} has no real embedded artwork or local cover.`);
    catalogue[work.archiveCode] = {
      kind: 'music', theme: await themeFromSource(source, 'music'),
      cover: await previewFromSource(source, work.archiveCode),
      metadata: { album: metadata.album || work.title, artist: metadata.artist || work.tracks[0].artist || '' },
    };
  }

  const generated = '// Generated from local original artwork by scripts/build-archive-artwork.mjs.\n'
    + '// Rebuild this catalogue when a cover or embedded album artwork changes.\n'
    + `export const artworkCatalog = ${JSON.stringify(catalogue, null, 2)};\n`;
  await writeFile(resolve(projectRoot, 'src/work-archive/artworkCatalog.js'), generated);
  console.table(previews);
  console.log(`${Object.keys(catalogue).length} archive entries; ${previews.length} previews; ${previews.reduce((sum, preview) => sum + preview.bytes, 0)} bytes total.`);
} finally {
  globalThis.fetch = nativeFetch;
}
