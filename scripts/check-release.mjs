#!/usr/bin/env node
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { loadEnv } from 'vite';
import { resolveDeployConfig } from './deploy-config.mjs';
import { normalizeSiteUrl } from '../src/siteMetadata.js';
import { musicTracks } from '../src/content.js';
import { verifySiteAssets } from './verify-site-assets.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicRelease = process.argv.includes('--public');
const errors = [], warnings = [];
const report = { schemaVersion: 1, scope: publicRelease ? 'public-preflight' : 'local-preparation', checkedAt: new Date().toISOString(), errors, warnings };
const warn = message => warnings.push(message);
const fail = message => errors.push(message);
const content = path => readFileSync(join(root, path), 'utf8');

function collect(directory, output = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) { fail(`源文件存在符号链接，请先审查：${relative(root, path)}`); continue; }
    if (stat.isDirectory()) collect(path, output);
    else output.push(path);
  }
  return output;
}

try {
  if (process.argv.slice(2).some(arg => arg !== '--public')) throw new Error('用法：npm run check:release [-- --public]');
  if (Number(process.versions.node.split('.')[0]) !== 24) fail('请使用项目声明的 Node.js 24，并执行 npm ci。');
  const env = loadEnv('deploy', root, '');
  const config = resolveDeployConfig(env, { projectRoot: root });
  report.assets = verifySiteAssets({ root, log() {} });
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL || '');
  if (siteUrl && new URL(siteUrl).pathname !== '/') fail('当前站点只支持根路径部署，VITE_SITE_URL 不能带子目录。');
  report.mediaMode = config.mediaMode;
  report.siteConfigured = Boolean(siteUrl);
  if (!siteUrl) (publicRelease ? fail : warn)('正式网站 URL 未配置；本地构建可用，公开前设置 VITE_SITE_URL。');
  if (config.base !== '/') fail('当前多页路由使用根路径，请保持 VITE_BASE=/；子目录托管需要另行改造和验收。');
  if (config.mediaMode === 'full') warn('完整包包含全部媒体；选定平台后核对体积和单文件限制。');
  if (publicRelease && config.mediaMode === 'external') {
    const media = new URL(config.mediaBase);
    const host = media.hostname.toLowerCase();
    if (media.protocol !== 'https:' || /localhost|(?:^|\.)(?:example\.(?:com|org|net)|invalid|test)$|^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host)) fail('公开发布的 VITE_MEDIA_BASE 必须是实际可访问的 HTTPS 地址，不能使用示例地址或局域网。');
  }
  const tracks = musicTracks.flatMap(album => album.tracks || []).filter(track => track.src);
  report.music = { albumCount: musicTracks.filter(album => !album.pending).length, playableTrackCount: tracks.length };

  for (const path of ['package.json', 'package-lock.json', '.nvmrc', 'vite.config.js', ...['index', 'work', 'photography', 'music', 'contact', 'about'].map(name => `${name}.html`)]) {
    if (!existsSync(join(root, path))) fail(`缺少必需源文件：${path}`);
  }
  const pkg = JSON.parse(content('package.json'));
  const lock = JSON.parse(content('package-lock.json'));
  if (JSON.stringify(pkg.dependencies) !== JSON.stringify(lock.packages?.['']?.dependencies)) fail('package.json 与 lockfile 依赖声明不同，请同步 lockfile 后使用 npm ci。');

  const files = ['src', 'public', 'scripts', 'deploy', '.github'].filter(path => existsSync(join(root, path))).flatMap(path => collect(join(root, path)));
  if (existsSync(join(root, 'docs'))) files.push(...collect(join(root, 'docs')).filter(path => /\.(?:md|txt|json)$/i.test(path)));
  files.push(...readdirSync(root, { withFileTypes: true }).filter(entry => entry.isFile() && !entry.name.startsWith('.env')).map(entry => join(root, entry.name)));
  const textExtensions = /\.(?:[cm]?js|jsx|json|html|css|md|txt|ya?ml|xml|svg|sh|ps1|toml)$/i;
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
    /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
    /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
    /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/,
    /(?:secret_access_key|api_key|access_token|client_secret)\s*[:=]\s*['"][A-Za-z0-9/+_.-]{24,}['"]/i,
  ];
  const inventory = [];
  for (const path of files) {
    const stat = lstatSync(path), name = relative(root, path).replace(/\\/g, '/');
    const item = { path: name, bytes: stat.size };
    if (textExtensions.test(name) && stat.size < 2 * 1024 * 1024) {
      const source = readFileSync(path, 'utf8');
      item.sha256 = createHash('sha256').update(source).digest('hex');
      source.split(/\r?\n/).forEach((line, index) => {
        if (secretPatterns.some(pattern => pattern.test(line))) fail(`可能的凭据内容：${name}:${index + 1}（未输出值，请本地核对）。`);
      });
    }
    if (/\.(?:p12|pfx|pem|key)$/i.test(name)) fail(`源文件清单含可能的私钥/证书：${name}；公开前移出发布来源。`);
    inventory.push(item);
  }
  const git = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: root, encoding: 'utf8' });
  if (git.status !== 0) warn('Git 状态无法读取，仍需手动形成可回滚源版本。');
  else {
    const changes = git.stdout.split('\0').filter(Boolean);
    report.gitChanges = changes;
    if (changes.length) (publicRelease ? fail : warn)(`Git 有 ${changes.length} 条未保存变化（含未跟踪文件）；详见检查报告，尚未形成干净发布提交。`);
  }
  const trackedEnv = spawnSync('git', ['ls-files', '--', '.env', '.env.*'], { cwd: root, encoding: 'utf8' });
  if (trackedEnv.status === 0 && trackedEnv.stdout.split(/\r?\n/).some(path => path && !path.endsWith('.example'))) fail('Git 跟踪了真实 .env 配置文件，请先审查并移出版本库。');
  report.sourceFiles = inventory;
  report.sourceFileCount = inventory.length;
  report.sourceBytes = inventory.reduce((sum, item) => sum + item.bytes, 0);
} catch (error) { fail(error.message); }

const directory = join(root, 'logs', 'release-check');
mkdirSync(directory, { recursive: true });
writeFileSync(join(directory, 'source-manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
for (const warning of warnings) console.log(`待确认：${warning}`);
for (const error of errors) console.error(`未通过：${error}`);
console.log(`来源与检查记录：logs/release-check/source-manifest.json（${report.sourceFileCount || 0} 个文件；不含凭据值）。`);
console.log(errors.length ? `${publicRelease ? '公开发布' : '本地准备'}检查未通过：${errors.length} 项。` : publicRelease ? '公开配置预检通过；仍需真实托管下验收 TLS、媒体、CORS/Range、404 与真机。' : '本地上线准备检查通过；未发布到公网。');
process.exitCode = errors.length ? 1 : 0;
