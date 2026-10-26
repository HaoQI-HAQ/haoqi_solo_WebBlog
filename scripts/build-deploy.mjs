#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, loadEnv } from 'vite';
import { resolveDeployConfig } from './deploy-config.mjs';
import { finalizeStaticBuild } from './prune-media.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
try {
  const flags = process.argv.slice(2);
  if (flags.some(flag => !['--full', '--external'].includes(flag)) || (flags.includes('--full') && flags.includes('--external'))) throw new Error('用法：node scripts/build-deploy.mjs [--full | --external]');
  if (flags.includes('--external')) process.env.VITE_MEDIA_MODE = 'external';
  if (flags.includes('--full')) { process.env.VITE_MEDIA_MODE = 'full'; process.env.VITE_MEDIA_BASE = ''; }
  const config = resolveDeployConfig(loadEnv('deploy', root, ''), { projectRoot: root });
  console.log(config.mediaMode === 'full' ? '构建完整静态包：媒体随站点保留。' : `构建外置媒体包：${config.mediaBase}`);
  await build({ root, configFile: join(root, 'vite.config.js'), mode: 'deploy' });
  finalizeStaticBuild(config);
} catch (error) {
  console.error(`构建已停止：${error.message}`);
  process.exitCode = 1;
}
