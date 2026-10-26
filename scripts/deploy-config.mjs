import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

export function normalizePublicBase(value, key = 'VITE_MEDIA_BASE') {
  const input = String(value || '').trim();
  if (!input) return '';
  let url;
  try { url = new URL(input); } catch { throw new Error(`${key} 必须是完整的 http(s) 地址。`); }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password || url.search || url.hash) {
    throw new Error(`${key} 只接受无凭据、查询参数和片段的 http(s) 地址。`);
  }
  return url.href.replace(/\/+$/, '');
}

export function assertSafeOutputDirectory(directory, projectRoot) {
  const root = resolve(projectRoot);
  const output = resolve(root, directory || 'dist');
  const local = relative(root, output);
  const protectedNames = new Set(['src', 'public', 'scripts', 'deploy', 'docs', 'work', 'node_modules', '.git', '.agents', '.codex', '.github', '.release', 'release-artifacts', '.impeccable']);
  if (!local || ['logs', '.taste-skill'].includes(local) || local.startsWith(`..${sep}`) || local === '..' || isAbsolute(local) || protectedNames.has(local.split(/[\\/]/)[0])) {
    throw new Error(`构建目录必须是项目内独立的输出目录：${output}`);
  }
  let cursor = root;
  for (const segment of local.split(/[\\/]/)) {
    cursor = join(cursor, segment);
    let stat;
    try { stat = lstatSync(cursor); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (stat?.isSymbolicLink()) throw new Error(`构建目录不能经过符号链接或 junction：${cursor}`);
  }
  if (existsSync(output) && !realpathSync(output).startsWith(`${realpathSync(root)}${sep}`)) throw new Error('构建目录解析后超出项目范围。');
  return output;
}

export function resolveDeployConfig(env, { projectRoot, requireExternal = false } = {}) {
  const root = resolve(projectRoot || process.cwd());
  const requested = String(env.VITE_MEDIA_MODE || 'auto').trim();
  if (!['auto', 'full', 'external'].includes(requested)) throw new Error('VITE_MEDIA_MODE 必须是 auto、full 或 external。');
  const mediaBase = normalizePublicBase(env.VITE_MEDIA_BASE);
  const mediaMode = requireExternal || requested === 'external' || (requested === 'auto' && mediaBase) ? 'external' : 'full';
  if (mediaMode === 'external' && !mediaBase) throw new Error('外置媒体构建需要 VITE_MEDIA_BASE；当前未配置，已停止，未删除任何媒体。');
  if (requested === 'full' && mediaBase) throw new Error('完整包模式不能同时设置 VITE_MEDIA_BASE；请清空地址或使用 external 模式。');
  return { root, mediaMode, mediaBase, outDir: assertSafeOutputDirectory(env.VITE_OUT_DIR || 'dist', root), base: String(env.VITE_BASE || '/') };
}

export function deploymentManifestPlugin(config) {
  return {
    name: 'deployment-manifest',
    configResolved(resolved) {
      // CLI flags are merged after the config factory. Validate the effective
      // output too, before Vite can empty a directory supplied with --outDir.
      assertSafeOutputDirectory(resolved.build.outDir, resolved.root);
      if (resolved.base !== '/') throw new Error('当前多页路由只支持根路径部署，请使用 VITE_BASE=/。');
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'deployment.json', source: `${JSON.stringify({ schemaVersion: 1, mediaMode: config.mediaMode, mediaBase: config.mediaBase }, null, 2)}\n` });
    },
  };
}
