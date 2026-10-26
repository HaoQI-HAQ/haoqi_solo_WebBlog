import { existsSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPageMetadata, metadataEntries, normalizeSiteUrl, SITE_PATHS } from '../src/siteMetadata.js';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function renderPageHead(metadata) {
  return [
    `    <title>${escape(metadata.title)}</title>`,
    ...metadataEntries(metadata).map(([attribute, key, content]) => `    <meta ${attribute}="${escape(key)}" content="${escape(content)}" />`),
    '    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    ...(metadata.canonical ? [`    <link rel="canonical" href="${escape(metadata.canonical)}" />`] : []),
  ].join('\n');
}

export function renderSitemap(siteUrl) {
  const site = normalizeSiteUrl(siteUrl);
  if (!site) throw new Error('生成 sitemap.xml 前需要真实 VITE_SITE_URL。');
  const items = SITE_PATHS.map(path => `  <url><loc>${escape(new URL(path.slice(1), `${site}/`).href)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</urlset>\n`;
}

export function renderRobots(siteUrl = '') {
  const site = normalizeSiteUrl(siteUrl);
  return `User-agent: *\nAllow: /\nDisallow: /404.html\n${site ? `\nSitemap: ${new URL('sitemap.xml', `${site}/`).href}\n` : ''}`;
}

export function siteMetadataPlugin() {
  let siteUrl = '', output = '', generated = false;
  return {
    name: 'site-metadata', apply: 'build',
    configResolved(config) {
      siteUrl = normalizeSiteUrl(config.env?.VITE_SITE_URL || process.env.VITE_SITE_URL || '');
      output = resolve(config.root, config.build.outDir);
    },
    buildStart() {
      if (!siteUrl) this.warn('VITE_SITE_URL 未配置：保留本地预览，正式上线前填写域名以生成 canonical、绝对分享地址与 sitemap.xml。');
    },
    transformIndexHtml(html, context) {
      const metadata = getPageMetadata(context.path, 'mixed', siteUrl);
      const region = `<!-- site-metadata:start -->\n${renderPageHead(metadata)}\n    <!-- site-metadata:end -->`;
      return html.replace(/<!-- site-metadata:start -->[\s\S]*?<!-- site-metadata:end -->/, region);
    },
    generateBundle() {
      generated = true;
      if (siteUrl) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap(siteUrl) });
    },
    closeBundle: {
      order: 'post',
      handler() {
        // Both Vite's normal public copy and the light-public plugin must finish
        // first; otherwise their static robots.txt would erase the Sitemap line.
        if (generated && existsSync(output)) writeFileSync(resolve(output, 'robots.txt'), renderRobots(siteUrl));
      },
    },
  };
}
