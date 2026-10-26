#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { lstat, mkdir, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createGzip } from 'node:zlib';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const allowedDirectories = new Set(['src', 'scripts', 'public', 'deploy', 'docs', '.github']);
const privateDirectories = new Set(['.git', 'node_modules', '.aws', '.ssh', '.agents', '.codex', '.vscode', '.idea', '.vercel', '.netlify', 'secrets', 'credentials', 'private', '__pycache__']);
const temporaryDirectories = new Set(['logs', 'work', 'dist', 'coverage', 'test-results', 'playwright-report', 'design-previews', 'release-artifacts', '.release', '.vite', '.taste-skill', '.impeccable']);
const sourceFile = /^(?:package(?:-lock)?\.json|vite\.config\.[cm]?[jt]s|[^.].*\.(?:html|md|[cm]?[jt]s)|\.gitignore|\.node-version|\.nvmrc|\.env.*\.example)$/i;
const secretFile = /(?:^\.env(?!.*\.example$)|\.(?:pem|key|p12|pfx|keystore|kdbx)$|^(?:id_rsa|id_ed25519|credentials|secrets|api[-_]?keys)(?:\.|$))/i;
const mediaFile = /\.(?:mp3|mp4|m4a|wav|ogg|flac|aac|mov|webm|avi|mkv|aiff)$/i;
const lightMediaFile = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|json|txt)$/i;
const lightLimit = 8 * 1024 * 1024;

const slash = value => value.split(sep).join('/');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
async function digestFile(path) {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(path)) digest.update(chunk);
  return digest.digest('hex');
}

function gitCommand(root, args) {
  try { return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd(); }
  catch { return null; }
}

function gitEvidence(root, output) {
  const head = gitCommand(root, ['rev-parse', '--verify', 'HEAD']);
  return {
    available: Boolean(head), head, tree: gitCommand(root, ['rev-parse', '--verify', 'HEAD^{tree}']),
    branch: gitCommand(root, ['symbolic-ref', '--short', '-q', 'HEAD']),
    statusPorcelainV1: gitCommand(root, ['status', '--porcelain=v1', '--untracked-files=all']),
    trackedFiles: gitCommand(root, ['ls-files', '-z'])?.split('\0').filter(Boolean) || [],
    outputIgnored: gitCommand(root, ['check-ignore', '--', slash(relative(root, join(output, 'snapshot.tar.gz')))]) !== null,
  };
}

export async function collectSnapshotFiles(root, { withMedia = false } = {}) {
  const files = [], media = [], omitted = [];
  async function visit(directory, prefix = '') {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    for (const entry of entries) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = join(directory, entry.name);
      if (entry.isSymbolicLink()) { omitted.push({ path, reason: 'symlink-or-junction; not followed' }); continue; }
      if (entry.isDirectory()) {
        if (privateDirectories.has(entry.name.toLowerCase()) || temporaryDirectories.has(entry.name.toLowerCase()) || (!prefix && !allowedDirectories.has(entry.name))) {
          omitted.push({ path: `${path}/`, reason: 'private, generated or outside source scope' });
        } else await visit(absolute, path);
        continue;
      }
      if (!entry.isFile()) { omitted.push({ path, reason: 'not a regular file' }); continue; }
      if (secretFile.test(entry.name)) { omitted.push({ path, reason: 'environment value or secret file' }); continue; }
      if (!prefix && !sourceFile.test(entry.name)) { omitted.push({ path, reason: 'outside root source-file scope' }); continue; }
      if (prefix === 'docs' || prefix.startsWith('docs/')) {
        if (!/\.(?:md|txt|json)$/i.test(entry.name)) { omitted.push({ path, reason: 'reference media; docs snapshot includes text only' }); continue; }
      }
      const info = await lstat(absolute);
      const isMedia = /^public\/(?:media|videos)\//.test(path) || mediaFile.test(entry.name) || (path.startsWith('public/') && info.size > lightLimit);
      const included = !isMedia || withMedia || (lightMediaFile.test(entry.name) && info.size <= lightLimit);
      const record = { path, size: info.size, sha256: await digestFile(absolute), mtimeMs: info.mtimeMs };
      if (isMedia) media.push({ ...record, included, originalPath: absolute });
      if (included) files.push(record);
    }
  }
  await visit(root);
  return { files, media, omitted };
}

function octal(buffer, value, offset, length) {
  const text = Math.floor(value).toString(8);
  if (text.length > length - 1) throw new Error('A file is too large for this tar header. Split the media archive first.');
  buffer.write(`${text.padStart(length - 1, '0')}\0`, offset, length, 'ascii');
}

function tarHeader(name, size, type = '0', mtime = Date.now() / 1000) {
  const buffer = Buffer.alloc(512);
  buffer.write(name, 0, 100, 'utf8');
  octal(buffer, 0o644, 100, 8); octal(buffer, 0, 108, 8); octal(buffer, 0, 116, 8);
  octal(buffer, size, 124, 12); octal(buffer, mtime, 136, 12);
  buffer.fill(32, 148, 156); buffer.write(type, 156, 1, 'ascii');
  buffer.write('ustar\0', 257, 6, 'ascii'); buffer.write('00', 263, 2, 'ascii');
  const checksum = buffer.reduce((sum, byte) => sum + byte, 0);
  buffer.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii');
  return buffer;
}

function paxRecord(key, value) {
  const body = `${key}=${value}\n`;
  let length = Buffer.byteLength(body) + 3;
  while (true) {
    const record = `${length} ${body}`;
    const actual = Buffer.byteLength(record);
    if (actual === length) return Buffer.from(record);
    length = actual;
  }
}

const padding = size => Buffer.alloc((512 - size % 512) % 512);
async function* archiveEntries(root, entries) {
  let index = 0;
  for (const entry of entries) {
    const body = entry.content === undefined ? null : Buffer.from(entry.content);
    const size = body ? body.length : entry.size;
    // PAX path records preserve UTF-8 and long names on both BSD tar (Windows)
    // and GNU tar without truncating a multibyte character in the ustar header.
    const pax = paxRecord('path', entry.archivePath);
    yield tarHeader(`PaxHeaders/${index}`, pax.length, 'x'); yield pax; yield padding(pax.length);
    yield tarHeader(`file-${index++}`, size, '0', entry.mtimeMs ? entry.mtimeMs / 1000 : undefined);
    if (body) yield body;
    else {
      const source = join(root, entry.path);
      const digest = createHash('sha256');
      let written = 0;
      for await (const chunk of createReadStream(source)) { written += chunk.length; digest.update(chunk); yield chunk; }
      if (written !== size || digest.digest('hex') !== entry.sha256) throw new Error(`Source changed while archiving: ${entry.path}. Freeze edits and retry.`);
    }
    yield padding(size);
  }
  yield Buffer.alloc(1024);
}

function recoveryReadme(manifest) {
  return `# HAOQI local source snapshot\n\nCreated: ${manifest.createdAt}\nOriginal working directory: ${manifest.sourceRoot}\nMode: ${manifest.withMedia ? 'source + all inventoried media' : 'source + lightweight local assets; heavy media NOT included'}\n\nThis private local archive was created without git add, commit or push. It contains the current working copies of the files listed in snapshot-manifest.json, not a Git repository or Git history. Git HEAD/tree hashes and the observed status are evidence only; this archive does not recreate the Git index/staging state.\n\n## Restore into a NEW empty directory\n\n1. Verify the .tar.gz against its adjacent .sha256 file (PowerShell: Get-FileHash -Algorithm SHA256).\n2. Run: tar -xzf <snapshot.tar.gz> -C <empty-directory>\n3. Enter the extracted source/ directory. Check each included file against snapshot-manifest.json if desired. Never extract over the only working project copy.\n4. ${manifest.withMedia ? 'All inventoried public/media and public/videos files are included in source/.' : 'Heavy audio/video and large local assets are NOT in this archive. Reattach the original files from the original working directory or your separate media backup, preserving paths. media-manifest.json lists every inventoried media file, original path, byte size and SHA256, and marks which lightweight files were included. A matching remote URL alone is not a backup of these local originals.'}\n5. Environment values and private key/credential directories were excluded. Recreate .env files locally using the included .env*.example templates and your private records. Do not publish these values.\n6. Use the Node version in .node-version/.nvmrc, then run npm ci, npm test and npm run build. Deployment still requires your actual domain, media configuration and rights checks.\n\n## Scope\n\nIncluded: root HTML/package/Vite/README/config files; src/ (including regression tests), scripts/, deploy/, .github/, public/ lightweight assets; textual docs (.md/.txt/.json). ${manifest.withMedia ? 'All regular inventoried media files are included.' : 'Images/fonts/JSON/text in public/media or public/videos are included only at 8 MiB or less; audio/video and larger assets remain external dependencies.'}\n\nExcluded: .git/, node_modules/, actual .env values, secret/key directories and files, symlinks/junctions, build outputs, logs, previews, temporary test outputs, work/ reference captures and non-text docs. See the omitted list and media-manifest.json for the exact boundary. This is a source recovery candidate, not a full disk backup.\n\nGit HEAD: ${manifest.git.head || 'unavailable'}\nGit tree: ${manifest.git.tree || 'unavailable'}\n`;
}

export async function createSourceSnapshot({ root = projectRoot, output, withMedia = false, now = new Date() } = {}) {
  root = resolve(root);
  output = resolve(output || join(root, 'release-artifacts', 'source-snapshots'));
  await stat(join(root, 'package.json'));
  const inventory = await collectSnapshotFiles(root, { withMedia });
  const git = gitEvidence(root, output);
  const createdAt = now.toISOString();
  const stamp = createdAt.replace(/[:.]/g, '-');
  const filename = `haoqi-source-${stamp}${withMedia ? '-with-media' : ''}.tar.gz`;
  const archive = join(output, filename), partial = `${archive}.partial`;
  const manifest = {
    format: 'haoqi-source-snapshot-v1', createdAt, sourceRoot: root, withMedia, git,
    includedFileCount: inventory.files.length, includedBytes: inventory.files.reduce((sum, file) => sum + file.size, 0),
    externalMediaCount: inventory.media.filter(file => !file.included).length,
    externalMediaBytes: inventory.media.filter(file => !file.included).reduce((sum, file) => sum + file.size, 0),
    files: inventory.files, omitted: inventory.omitted,
  };
  const mediaManifest = { format: 'haoqi-media-dependencies-v1', sourceRoot: root, createdAt, files: inventory.media };
  const entries = [
    ...inventory.files.map(file => ({ ...file, archivePath: `source/${file.path}` })),
    { archivePath: 'snapshot-manifest.json', content: json(manifest) },
    { archivePath: 'media-manifest.json', content: json(mediaManifest) },
    { archivePath: 'RESTORE.md', content: recoveryReadme(manifest) },
  ];
  await mkdir(output, { recursive: true, mode: 0o700 });
  let partialOwned = false, finalReserved = false;
  try {
    const destination = createWriteStream(partial, { flags: 'wx', mode: 0o600 });
    await once(destination, 'open'); partialOwned = true;
    await pipeline(Readable.from(archiveEntries(root, entries)), createGzip({ level: 6 }), destination);
    for (const file of inventory.media.filter(file => !file.included)) {
      const info = await stat(join(root, file.path));
      if (info.size !== file.size || info.mtimeMs !== file.mtimeMs) throw new Error(`Media changed while archiving: ${file.path}. Freeze edits and retry.`);
    }
    // rename() could overwrite an old archive on some systems, so reserve the
    // destination first and never reuse an existing snapshot name.
    const reservation = createWriteStream(archive, { flags: 'wx', mode: 0o600 });
    await once(reservation, 'open'); finalReserved = true;
    reservation.end(); await once(reservation, 'close');
    await rename(partial, archive);
    finalReserved = false;
  } catch (error) {
    if (partialOwned) await unlink(partial).catch(() => {});
    if (finalReserved) await unlink(archive).catch(() => {});
    throw error;
  }
  const sha256 = await digestFile(archive);
  await writeFile(`${archive}.sha256`, `${sha256}  ${basename(archive)}\n`, { flag: 'wx', mode: 0o600 });
  await writeFile(`${archive}.manifest.json`, json(manifest), { flag: 'wx', mode: 0o600 });
  await writeFile(`${archive}.media.json`, json(mediaManifest), { flag: 'wx', mode: 0o600 });
  return { archive, sha256, includedFileCount: manifest.includedFileCount, includedBytes: manifest.includedBytes, externalMediaCount: manifest.externalMediaCount, externalMediaBytes: manifest.externalMediaBytes, outputIgnored: git.outputIgnored };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const args = process.argv.slice(2), options = {};
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--with-media') options.withMedia = true;
    else if (argument === '--root' || argument === '--output') {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a path.`);
      options[argument.slice(2)] = value;
    } else if (argument === '--help') {
      console.log('node scripts/snapshot-source.mjs [--with-media] [--root <project>] [--output <directory>]\nDefault: private local release-artifacts/source-snapshots/*.tar.gz; heavy media inventoried, not copied.');
      process.exit(0);
    } else throw new Error(`Unknown option: ${argument}`);
  }
  createSourceSnapshot(options).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
}
