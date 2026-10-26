#!/usr/bin/env node
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';
import { assertSafeOutputDirectory, resolveDeployConfig } from './deploy-config.mjs';

export function inspectFiles(directory) {
  const files = [];
  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) throw new Error(`输出目录含符号链接，停止整理：${path}`);
      if (stat.isDirectory()) walk(path);
      else files.push({ path: relative(directory, path).replace(/\\/g, '/'), bytes: stat.size });
    }
  }
  walk(directory);
  return files;
}

export function finalizeStaticBuild(config, { log = console.log } = {}) {
  const output = assertSafeOutputDirectory(config.outDir, config.root);
  if (!existsSync(output)) throw new Error(`找不到构建目录：${output}`);
  const markerPath = join(output, 'deployment.json');
  const marker = existsSync(markerPath) ? JSON.parse(readFileSync(markerPath, 'utf8')) : null;
  if (config.mediaMode === 'external' && (!marker || marker.mediaMode !== 'external' || marker.mediaBase !== config.mediaBase)) throw new Error('构建清单与外置媒体配置不匹配，未删除任何媒体。请重新构建。');
  if (config.mediaMode === 'full' && marker?.mediaMode === 'external') throw new Error('当前配置是完整包，但产物来自外置模式，请重新构建。');
  const removed = [];
  if (config.mediaMode === 'external') {
    inspectFiles(output);
    for (const name of ['media', 'videos']) {
      const target = join(output, name);
      if (!existsSync(target)) continue;
      if (!lstatSync(target).isDirectory()) throw new Error(`媒体输出不是目录：${target}`);
      const bytes = inspectFiles(target).reduce((sum, file) => sum + file.bytes, 0);
      rmSync(target, { recursive: true, force: true });
      removed.push({ name, bytes });
    }
  }
  const files = inspectFiles(output);
  const bytes = files.reduce((sum, file) => sum + file.bytes, 0);
  const largeFiles = files.filter(file => file.bytes > 25 * 1024 * 1024);
  log(`静态包整理完成：${config.mediaMode === 'full' ? '完整包，保留全部本地媒体' : '媒体外置包'}；${files.length} 个文件，${(bytes / 1024 / 1024).toFixed(1)} MiB。`);
  if (largeFiles.length) log(`兼容性提示：${largeFiles.length} 个文件超过 25 MiB；选定平台后核对其单文件和总体积限制。`);
  return { mediaMode: config.mediaMode, files, bytes, removed, largeFiles };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const root = dirname(dirname(fileURLToPath(import.meta.url)));
    finalizeStaticBuild(resolveDeployConfig(loadEnv('deploy', root, ''), { projectRoot: root }));
  } catch (error) { console.error(`整理已停止：${error.message}`); process.exitCode = 1; }
}
