// Offline verification: catch missing deploy assets, incorrect downloads, or
// accidental reintroduction of a runtime font CDN dependency.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(root, 'public/fonts/sources.json'), 'utf8'));
const css = await readFile(resolve(root, 'src/fonts.css'), 'utf8');
assert.doesNotMatch(css, /@import|url\(\s*['"]?https?:/i, 'Font CSS must not depend on external requests');
const declaredFiles = [...css.matchAll(/src:\s*url\(['"]\/fonts\/([^'"]+)['"]\)/g)].map(match => match[1]);
const fontFiles = manifest.files.filter(file => file.file.endsWith('.woff2'));
assert.equal(fontFiles.length, 10);
assert.deepEqual([...declaredFiles].sort(), fontFiles.map(file => file.file).sort(), 'Every declared face must be bundled');
assert.equal((css.match(/font-display:\s*swap/g) || []).length, fontFiles.length);
assert.equal((css.match(/unicode-range:/g) || []).length, fontFiles.length);
assert.match(css, /font-family: 'Space Grotesk';[\s\S]*?font-weight: 400 700;/);
assert.match(css, /font-family: 'Syne';[\s\S]*?font-weight: 400 800;/);
let bytes = 0;
for (const entry of manifest.files) {
  const source = new URL(entry.url);
  assert.ok(['fonts.gstatic.com', 'raw.githubusercontent.com'].includes(source.hostname), 'Only official font sources are used');
  const content = await readFile(resolve(root, 'public/fonts', entry.file));
  assert.equal(content.length, entry.bytes, `${entry.file}: expected byte length`);
  assert.equal(createHash('sha256').update(content).digest('hex'), entry.sha256, `${entry.file}: expected original checksum`);
  if (entry.file.endsWith('.woff2')) {
    assert.equal(content.toString('ascii', 0, 4), 'wOF2', `${entry.file}: valid WOFF2 signature`);
    assert.equal(content.readUInt32BE(8), content.length, `${entry.file}: complete WOFF2 length`);
    bytes += content.length;
  } else {
    assert.match(content.toString('utf8'), /SIL OPEN FONT LICENSE Version 1\.1/);
    assert.match(content.toString('utf8'), /Copyright/);
  }
}
console.log(`Verified ${fontFiles.length} self-hosted WOFF2 files (${bytes} bytes), CSS ranges/weights, and 3 original OFL notices.`);
