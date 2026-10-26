import { cpSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { deploymentManifestPlugin, resolveDeployConfig } from './scripts/deploy-config.mjs';
import { siteMetadataPlugin } from './scripts/site-metadata.mjs';

const root = dirname(fileURLToPath(import.meta.url));

// 站点是多页入口：main.jsx 会用 location.pathname 的最后一段当路由，
// 所以这几个 html 必须真的存在于产物里，否则刷新 /about.html 会 404。
const pages = ['index.html', 'about.html', 'work.html', 'photography.html', 'music.html', 'contact.html'];

// 这两类目录是重媒体，上线时由对象存储提供（见 src/content.deploy.js）。
const heavyDirs = ['media', 'videos'];

// 轻量构建：只要设置了 VITE_MEDIA_BASE，就跳过 public/media、public/videos 的拷贝。
// 否则每次部署都要先把 1.6GB 复制进 dist 再删掉，CI 上尤其浪费时间。
function copyLightPublic() {
  let publicDir;
  let outDir;

  return {
    name: 'copy-light-public',
    apply: 'build',
    configResolved(config) {
      publicDir = resolve(config.root, 'public');
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      for (const entry of readdirSync(publicDir, { withFileTypes: true })) {
        if (heavyDirs.includes(entry.name)) continue;
        cpSync(join(publicDir, entry.name), join(outDir, entry.name), { recursive: true });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');
  const deployment = resolveDeployConfig(env, { projectRoot: root });
  const lightBuild = deployment.mediaMode === 'external';

  return {
    // 当前路由和 public 资源使用根路径；子目录托管需要另行适配。
    base: deployment.base,
    define: { 'import.meta.env.VITE_MEDIA_BASE': JSON.stringify(deployment.mediaBase) },

    publicDir: lightBuild ? false : 'public',
    plugins: [siteMetadataPlugin(), deploymentManifestPlugin(deployment), ...(lightBuild ? [copyLightPublic()] : [])],

    build: {
      outDir: deployment.outDir,
      emptyOutDir: true,
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        input: Object.fromEntries(pages.map(page => [page.replace(/\.html$/, ''), resolve(root, page)])),
      },
    },

    // 手机联调：npm run dev 后用同一 WiFi 访问 http://<本机IP>:5173，
    // 上线前先在自己手机上确认扫码体验。
    server: {
      host: true,
      port: 5173,
      // Generated previews and logs are not source files. On Windows, watching a
      // build while it copies assets can raise EBUSY and terminate the dev server.
      watch: { ignored: ['**/logs/**', '**/.taste-skill/**', '**/dist/**'] },
    },
    preview: { host: true, port: 4173 },
  };
});
