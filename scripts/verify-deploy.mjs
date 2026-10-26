#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { assertSafeOutputDirectory, deploymentManifestPlugin, resolveDeployConfig } from './deploy-config.mjs';
import { finalizeStaticBuild } from './prune-media.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureParent = join(root, '.taste-skill');
mkdirSync(fixtureParent, { recursive: true });
const fixture = mkdtempSync(join(fixtureParent, 'deploy-verify-'));
const bucket = 'https://media.example.invalid';
let checks = 0;
function check(label, run) { run(); checks += 1; console.log(`  ok ${label}`); }
function write(path, contents = 'fixture') { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, contents); }
function child(source, extraEnv) {
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', source], {
    cwd: root, encoding: 'utf8', env: { ...process.env, VITE_MEDIA_MODE: 'full', VITE_MEDIA_BASE: '', VITE_SITE_URL: '', VITE_OUT_DIR: '', VITE_BASE: '/', ...extraEnv },
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || '隔离子进程失败');
  return JSON.parse(result.stdout.trim());
}
const collect = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(collect) : value && typeof value === 'object' ? Object.values(value).flatMap(collect) : [];

try {
  console.log('部署自检：全部测试在独立环境和微型临时目录内进行。');
  const configProbe = `import configFactory from ${JSON.stringify(pathToFileURL(join(root, 'vite.config.js')).href)}; const config = await configFactory({mode:'deploy',command:'build'}); console.log(JSON.stringify({publicDir:config.publicDir,plugins:config.plugins.map(p=>p.name),pages:Object.keys(config.build.rollupOptions.input),mediaDefine:config.define['import.meta.env.VITE_MEDIA_BASE']}));`;
  const full = child(configProbe, { VITE_MEDIA_MODE: 'auto' });
  const external = child(configProbe, { VITE_MEDIA_MODE: 'external', VITE_MEDIA_BASE: bucket });
  check('空媒体地址使用完整 public 目录', () => assert.equal(full.publicDir, 'public'));
  check('完整模式未启用轻量复制', () => assert.ok(!full.plugins.includes('copy-light-public')));
  check('外置模式关闭自动 public 复制', () => assert.equal(external.publicDir, false));
  check('外置模式按名称找到轻量复制插件', () => assert.ok(external.plugins.includes('copy-light-public')));
  const padded = child(configProbe, { VITE_MEDIA_MODE: 'external', VITE_MEDIA_BASE: ` ${bucket}/ ` });
  check('浏览器与构建清单使用同一规范化媒体地址', () => assert.equal(padded.mediaDefine, JSON.stringify(bucket)));
  check('六个正式入口保留', () => assert.ok(['index', 'work', 'photography', 'music', 'contact', 'about'].every(page => full.pages.includes(page))));

  const raw = await import(pathToFileURL(join(root, 'src/content.js')).href);
  const source = readFileSync(join(root, 'src/content.deploy.js'), 'utf8');
  async function proxy(mediaBase) {
    const transformed = source.replaceAll('import.meta.env', '__deployEnv').replace(/(from\s*['"])(\.\.?\/[^'"]+)(['"])/g, (_, before, specifier, after) => before + new URL(specifier, pathToFileURL(join(root, 'src/content.deploy.js'))).href + after);
    return import(`data:text/javascript;base64,${Buffer.from(`const __deployEnv = ${JSON.stringify({ VITE_MEDIA_BASE: mediaBase })};\n${transformed}`).toString('base64')}`);
  }
  const localProxy = await proxy('');
  const remoteProxy = await proxy(bucket);
  for (const key of ['languages', 'socials', 'copy', 'gameWorks', 'photoAlbums', 'mapCities']) {
    check(`无配置时 ${key} 保持一致`, () => assert.deepEqual(localProxy[key], raw[key]));
  }
  check('无配置时静态音乐目录保留原始 ID 和音轨路径', () => {
    const paths = albums => albums.map(album => ({ id: album.id, tracks: album.tracks?.map(track => ({ id: track.id, src: track.src, lrc: track.lrc })) }));
    assert.deepEqual(paths(localProxy.musicTracks), paths(raw.musicTracks));
  });
  const remoteStrings = collect(Object.values(remoteProxy));
  const sourceStrings = collect(Object.values(localProxy));
  const mediaStrings = sourceStrings.filter(value => /^\/(?:media|videos)\//.test(value));
  check('测试覆盖真实媒体路径', () => assert.ok(mediaStrings.length > 50));
  check('所有 /media 与 /videos 引用均外置', () => {
    assert.equal(remoteStrings.filter(value => /^\/(?:media|videos)\//.test(value)).length, 0);
    for (const path of mediaStrings) assert.ok(remoteStrings.includes(bucket + path), path);
  });
  check('原有外部链接保持原样', () => { for (const url of sourceStrings.filter(value => /^https?:\/\//.test(value))) assert.ok(remoteStrings.includes(url)); });
  check('外置只改写媒体路径，静态元数据保持一致', () => {
    const rewrite = value => typeof value === 'string' ? /^\/(?:media|videos)\//.test(value) ? bucket + value : value : Array.isArray(value) ? value.map(rewrite) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewrite(item)])) : value;
    for (const key of ['languages', 'socials', 'copy', 'gameWorks', 'musicTracks', 'photoAlbums', 'mapCities']) assert.deepEqual(remoteProxy[key], rewrite(localProxy[key]));
  });

  write(join(fixture, 'public/media/music/a.mp3'));
  write(join(fixture, 'public/videos/v.mp4'));
  write(join(fixture, 'public/assets/hero.png'));
  write(join(fixture, 'public/favicon.svg'));
  mkdirSync(join(fixture, 'light'), { recursive: true });
  const copyProbe = `import configFactory from ${JSON.stringify(pathToFileURL(join(root, 'vite.config.js')).href)}; const c=await configFactory({mode:'deploy',command:'build'}); const p=c.plugins.find(p=>p.name==='copy-light-public'); p.configResolved({root:${JSON.stringify(fixture)},build:{outDir:'light'}}); await p.closeBundle(); console.log(JSON.stringify({ok:true}));`;
  child(copyProbe, { VITE_MEDIA_MODE: 'external', VITE_MEDIA_BASE: bucket });
  check('外置包保留站点资源并跳过媒体', () => {
    assert.ok(existsSync(join(fixture, 'light/assets/hero.png')));
    assert.ok(existsSync(join(fixture, 'light/favicon.svg')));
    assert.ok(!existsSync(join(fixture, 'light/media')));
    assert.ok(!existsSync(join(fixture, 'light/videos')));
  });
  for (const mode of ['full', 'external']) {
    const outDir = join(fixture, mode);
    const config = resolveDeployConfig({ VITE_MEDIA_MODE: mode, VITE_MEDIA_BASE: mode === 'external' ? bucket : '', VITE_OUT_DIR: outDir }, { projectRoot: root });
    write(join(outDir, 'media/a.mp3'));
    write(join(outDir, 'videos/a.mp4'));
    write(join(outDir, 'assets/site.js'));
    write(join(outDir, 'deployment.json'), JSON.stringify({ mediaMode: mode, mediaBase: config.mediaBase }));
    finalizeStaticBuild(config, { log() {} });
    check(`${mode} 整理结果符合模式`, () => {
      assert.equal(existsSync(join(outDir, 'media/a.mp3')), mode === 'full');
      assert.equal(existsSync(join(outDir, 'videos/a.mp4')), mode === 'full');
      assert.ok(existsSync(join(outDir, 'assets/site.js')));
    });
  }
  const mismatchDir = join(fixture, 'mismatch');
  write(join(mismatchDir, 'media/keep.mp3'));
  write(join(mismatchDir, 'deployment.json'), JSON.stringify({ mediaMode: 'full', mediaBase: '' }));
  check('整理拒绝配置不匹配，媒体仍存在', () => {
    assert.throws(() => finalizeStaticBuild({ root, outDir: mismatchDir, mediaMode: 'external', mediaBase: bucket }), /不匹配/);
    assert.ok(existsSync(join(mismatchDir, 'media/keep.mp3')));
  });
  check('外置模式缺媒体地址提前失败', () => assert.throws(() => resolveDeployConfig({ VITE_MEDIA_MODE: 'external' }, { projectRoot: root }), /需要 VITE_MEDIA_BASE/));
  check('拒绝非 HTTP(S) 及带凭据地址', () => {
    for (const url of ['ftp://example.org', 'file:///tmp', 'https://name:pass@example.org', 'not-a-url']) assert.throws(() => resolveDeployConfig({ VITE_MEDIA_BASE: url }, { projectRoot: root }));
  });
  check('拒绝源目录、备份目录、共享容器和越界输出目录', () => { for (const path of ['.', 'src', 'public', '.github', '.release/copy', 'release-artifacts/copy', 'logs', '.taste-skill', '../outside']) assert.throws(() => assertSafeOutputDirectory(path, root)); });
  check('CLI 合并后仍验证输出目录和根路径部署', () => {
    const plugin = deploymentManifestPlugin({ mediaMode: 'full', mediaBase: '' });
    assert.throws(() => plugin.configResolved({ root, base: '/', build: { outDir: 'public' } }));
    assert.throws(() => plugin.configResolved({ root, base: '/sub/', build: { outDir: 'dist' } }), /根路径/);
  });
  console.log(`部署自检通过：${checks} 项；不依赖调用终端的媒体配置。`);
} catch (error) {
  console.error(`部署自检失败：${error.stack}`);
  process.exitCode = 1;
} finally {
  const safe = assertSafeOutputDirectory(fixture, root);
  if (!safe.startsWith(`${resolve(fixtureParent)}\\`) && !safe.startsWith(`${resolve(fixtureParent)}/`)) throw new Error('拒绝清理意外临时路径');
  rmSync(safe, { recursive: true, force: true });
}
