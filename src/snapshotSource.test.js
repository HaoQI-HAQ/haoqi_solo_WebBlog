import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { gunzipSync } from 'node:zlib';
import { createSourceSnapshot } from '../scripts/snapshot-source.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
async function write(root, path, content) {
  await mkdir(dirname(join(root, path)), { recursive: true });
  await writeFile(join(root, path), content);
}
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'haoqi-snapshot-test-'));
  await write(directory, 'package.json', '{"name":"snapshot-fixture","type":"module"}\n');
  await write(directory, 'src/main.js', 'export const greeting = "你好，世界";\n');
  await write(directory, '.env', 'DEPLOY_TOKEN=private-fixture-secret\n');
  await write(directory, '.env.local', 'OTHER_SECRET=private-local-secret\n');
  await write(directory, '.env.deploy.example', 'VITE_SITE_URL=\n');
  await write(directory, 'public/media/cover.png', Buffer.from([137, 80, 78, 71, 0, 1, 2]));
  await write(directory, 'public/media/music/song.mp3', Buffer.from('fixture audio bytes'));
  await write(directory, 'public/videos/demo.mp4', Buffer.from('fixture video bytes'));
  await write(directory, 'node_modules/dependency/index.js', 'should not be copied');
  await write(directory, '.aws/credentials', 'should not be copied');
  await write(directory, 'logs/temporary.txt', 'should not be copied');
  await write(directory, 'src/secrets/secret.json', '{"token":"private-nested-secret"}');
  const longPath = `public/media/摄影作品/${'跨越山河的旅行记录'.repeat(5)}/阳朔全景.webp`;
  await write(directory, longPath, Buffer.from('long Unicode image path'));
  return { directory, longPath };
}
async function cleanup(directory) {
  // Validate the absolute target before a recursive Windows deletion; every
  // deleted directory was created by mkdtemp for this test only.
  const target = resolve(directory), temporaryRoot = `${resolve(tmpdir())}${sep}`;
  assert.ok(target.startsWith(temporaryRoot) && basename(target).startsWith('haoqi-snapshot-test-'));
  await rm(target, { recursive: true, force: true });
}

test('light source archive restores exact UTF-8 content and PAX long paths while excluding environment values', async () => {
  const { directory, longPath } = await fixture();
  try {
    const result = await createSourceSnapshot({ root: directory });
    const archive = await readFile(result.archive);
    assert.equal(hash(archive), result.sha256);
    assert.match(await readFile(`${result.archive}.sha256`, 'utf8'), new RegExp(`^${result.sha256}  `));
    const tar = gunzipSync(archive);
    assert.ok(!tar.includes(Buffer.from('private-fixture-secret')));
    assert.ok(!tar.includes(Buffer.from('private-local-secret')));
    assert.ok(!tar.includes(Buffer.from('private-nested-secret')));
    assert.ok(tar.includes(Buffer.from(`path=source/${longPath}`)));
    const restored = join(directory, 'restored');
    await mkdir(restored);
    execFileSync('tar', ['-xzf', result.archive, '-C', restored], { windowsHide: true, stdio: 'pipe' });
    const manifest = JSON.parse(await readFile(join(restored, 'snapshot-manifest.json'), 'utf8'));
    for (const file of manifest.files) {
      const actual = await readFile(join(restored, 'source', file.path));
      assert.equal(hash(actual), file.sha256, file.path);
      assert.equal(actual.length, file.size, file.path);
    }
    assert.equal(await readFile(join(restored, 'source', longPath), 'utf8'), 'long Unicode image path');
    assert.equal(await readFile(join(restored, 'source', 'src/main.js'), 'utf8'), 'export const greeting = "你好，世界";\n');
    assert.ok(manifest.files.some(file => file.path === '.env.deploy.example'));
    assert.ok(!manifest.files.some(file => /^\.env(?:$|\.(?!.*example))/.test(file.path)));
    assert.ok(!manifest.files.some(file => /node_modules|\.aws|logs\/|src\/secrets/.test(file.path)));
    const media = JSON.parse(await readFile(join(restored, 'media-manifest.json'), 'utf8'));
    assert.equal(media.files.length, 4);
    assert.equal(result.externalMediaCount, 2);
    assert.ok(media.files.find(file => file.path.endsWith('song.mp3')).sha256 === hash(Buffer.from('fixture audio bytes')));
    assert.equal(media.files.find(file => file.path.endsWith('song.mp3')).included, false);
    assert.equal(media.files.find(file => file.path.endsWith('cover.png')).included, true);
    assert.match(await readFile(join(restored, 'RESTORE.md'), 'utf8'), /Heavy audio\/video and large local assets are NOT in this archive/);
  } finally { await cleanup(directory); }
});

test('--with-media archives original media bytes too, without changing source or copying .env values', async () => {
  const { directory } = await fixture();
  try {
    const result = await createSourceSnapshot({ root: directory, withMedia: true });
    const restored = join(directory, 'restored');
    await mkdir(restored);
    execFileSync('tar', ['-xzf', result.archive, '-C', restored], { windowsHide: true, stdio: 'pipe' });
    assert.equal(result.externalMediaCount, 0);
    assert.equal(await readFile(join(restored, 'source/public/media/music/song.mp3'), 'utf8'), 'fixture audio bytes');
    assert.equal(await readFile(join(restored, 'source/public/videos/demo.mp4'), 'utf8'), 'fixture video bytes');
    assert.equal(await readFile(join(directory, '.env'), 'utf8'), 'DEPLOY_TOKEN=private-fixture-secret\n');
    const archive = gunzipSync(await readFile(result.archive));
    assert.ok(!archive.includes(Buffer.from('private-fixture-secret')));
    assert.match(await readFile(join(restored, 'RESTORE.md'), 'utf8'), /All inventoried public\/media and public\/videos files are included/);
  } finally { await cleanup(directory); }
});

test('snapshot name collisions preserve existing archives and pre-existing partial files', async () => {
  const { directory } = await fixture();
  try {
    const now = new Date('2026-10-25T00:00:00.000Z');
    const original = await createSourceSnapshot({ root: directory, now });
    await assert.rejects(() => createSourceSnapshot({ root: directory, now }), /EEXIST/);
    assert.equal(hash(await readFile(original.archive)), original.sha256);
    await writeFile(`${original.archive}.partial`, 'a pre-existing partial snapshot');
    await assert.rejects(() => createSourceSnapshot({ root: directory, now }), /EEXIST/);
    assert.equal(await readFile(`${original.archive}.partial`, 'utf8'), 'a pre-existing partial snapshot');
  } finally { await cleanup(directory); }
});
