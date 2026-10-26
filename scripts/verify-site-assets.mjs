#!/usr/bin/env node
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as content from '../src/content.js';
import * as games from '../src/content.games.js';
import * as artwork from '../src/work-archive/artworkCatalog.js';
import * as music from '../src/work-archive/musicMetadataCatalogData.js';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
function strings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  return value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
}
function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(?:[cm]?js|jsx|css)$/.test(entry.name) && !/\.test\./.test(entry.name) ? [path] : [];
  });
}

export function verifySiteAssets({ root = projectRoot, log = console.log } = {}) {
  const paths = new Set(strings([content, games, artwork, music]).filter(value => /^\/(?:media|videos|assets|fonts)\/.+\.[a-z0-9]+$/i.test(value)));
  for (const file of sourceFiles(join(root, 'src'))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/['"`](\/(?:media|videos|assets|fonts)\/[^'"`\r\n]+)['"`]/g)) {
      if (!match[1].includes('${') && /\.[a-z0-9]+(?:[?#].*)?$/i.test(match[1])) paths.add(match[1]);
    }
  }
  for (const path of ['/favicon.svg', '/robots.txt', '/404.html']) paths.add(path);
  const missing = [], mediaPaths = [];
  for (const path of paths) {
    const clean = decodeURIComponent(path.split(/[?#]/)[0]);
    const absolute = resolve(root, 'public', `.${clean}`);
    const local = relative(join(root, 'public'), absolute);
    if (local === '..' || local.startsWith(`..${sep}`)) throw new Error(`资源引用越界：${path}`);
    if (!existsSync(absolute) || !lstatSync(absolute).isFile()) missing.push(path);
    if (/^\/(?:media|videos)\//.test(path)) mediaPaths.push(path);
  }
  if (missing.length) throw new Error(`缺少 ${missing.length} 个发布资源：\n${missing.slice(0, 25).join('\n')}${missing.length > 25 ? '\n（其余省略）' : ''}`);
  log(`发布资源检查通过：${paths.size} 条唯一引用，其中 ${mediaPaths.length} 条需完整保留或上传媒体服务。`);
  return { count: paths.size, mediaCount: mediaPaths.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { verifySiteAssets(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
