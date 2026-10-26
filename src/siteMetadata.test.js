import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyPageMetadata, getPageMetadata, metadataEntries, normalizeSiteUrl, pageKey, SITE_PATHS } from './siteMetadata.js';
import { renderPageHead, renderRobots, renderSitemap, siteMetadataPlugin } from '../scripts/site-metadata.mjs';

test('only exact public routes are indexed, including the index.html alias', () => {
  assert.equal(pageKey('/index.html'), 'home');
  assert.equal(pageKey('/music.html?track=1#notes'), 'music');
  for (const route of ['/missing', '/nested/about.html', '/about.html/extra', '/404.html']) {
    const metadata = getPageMetadata(route, 'mixed', 'https://haoqi.dev');
    assert.equal(metadata.key, 'notFound');
    assert.equal(metadata.robots, 'noindex, follow');
    assert.equal(metadata.canonical, '');
  }
});

test('local builds have useful page metadata without guessing a production origin', () => {
  for (const path of SITE_PATHS) {
    const metadata = getPageMetadata(path, 'mixed', '');
    assert.equal(metadata.canonical, '');
    assert.equal(metadata.image, '/assets/hero-background.png');
    assert.ok(metadata.title && metadata.description);
    assert.ok(!metadataEntries(metadata).some(([, key]) => key === 'og:url'));
  }
  assert.throws(() => renderSitemap(''), /真实/);
  assert.ok(!renderRobots('').includes('Sitemap:'));
});

test('a configured HTTPS origin produces six canonical sitemap URLs and absolute social images', () => {
  const site = 'https://haoqi.dev/';
  assert.equal(normalizeSiteUrl(site), 'https://haoqi.dev');
  assert.equal(getPageMetadata('/index.html', 'en', site).canonical, 'https://haoqi.dev/');
  assert.equal(getPageMetadata('/about.html', 'en', site).image, 'https://haoqi.dev/assets/hero-background.png');
  const urls = [...renderSitemap(site).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, 6);
  assert.deepEqual(urls, SITE_PATHS.map(path => `https://haoqi.dev${path}`));
  assert.match(renderRobots(site), /Sitemap: https:\/\/haoqi\.dev\/sitemap\.xml/);
});

test('invalid protocols and obvious local or placeholder production URLs are rejected', () => {
  for (const site of ['http://haoqi.dev', 'https://localhost:5173', 'https://127.0.0.1', 'https://example.com', 'https://site.example', 'https://site.test', 'https://name:secret@haoqi.dev', 'https://haoqi.dev/?x=1', 'https://haoqi.dev/portfolio/', 'not a url']) {
    assert.throws(() => normalizeSiteUrl(site), /VITE_SITE_URL/);
  }
  assert.equal(normalizeSiteUrl('https://myexampleportfolio.com'), 'https://myexampleportfolio.com');
});

test('every supported language has metadata for every route and 404', () => {
  for (const language of ['mixed', 'zh', 'en', 'ja', 'ru']) {
    for (const path of [...SITE_PATHS, '/missing']) {
      const metadata = getPageMetadata(path, language, '');
      assert.ok(metadata.title.length > 8 && metadata.description.length > 20);
      assert.equal(metadata.language, ['mixed', 'zh'].includes(language) ? 'zh-CN' : language);
    }
  }
  assert.equal(getPageMetadata('/contact.html', 'unknown', '').language, 'zh-CN');
});

function documentFixture() {
  const nodes = [];
  const page = {
    title: '', documentElement: { lang: '' },
    createElement(tagName) {
      return { tagName, attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, remove() { nodes.splice(nodes.indexOf(this), 1); } };
    },
    head: {
      append(node) { nodes.push(node); },
      querySelector(selector) {
        const [, tag, attribute, value] = selector.match(/^(\w+)\[([^=]+)="([^"]+)"\]$/);
        return nodes.find(node => node.tagName === tag && node.attributes[attribute] === value);
      },
    },
  };
  return { page, nodes };
}

test('client navigation updates titles and language and removes stale canonical/OG URL on 404', () => {
  const { page, nodes } = documentFixture();
  const options = { document: page, siteUrl: 'https://haoqi.dev' };
  applyPageMetadata('/work.html', 'mixed', options);
  applyPageMetadata('/about.html', 'en', options);
  assert.equal(page.title, 'About — HAOQI / STUDIO');
  assert.equal(page.documentElement.lang, 'en');
  assert.equal(page.head.querySelector('link[rel="canonical"]').attributes.href, 'https://haoqi.dev/about.html');
  assert.equal(nodes.filter(node => node.attributes.property === 'og:title').length, 1);
  applyPageMetadata('/missing', 'en', options);
  assert.equal(page.head.querySelector('link[rel="canonical"]'), undefined);
  assert.equal(page.head.querySelector('meta[property="og:url"]'), undefined);
  assert.equal(page.head.querySelector('meta[name="robots"]').attributes.content, 'noindex, follow');
});

test('each HTML entry supplies crawlable metadata and one marked build region', () => {
  for (const path of SITE_PATHS) {
    const filename = path === '/' ? '../index.html' : `..${path}`;
    const html = readFileSync(new URL(filename, import.meta.url), 'utf8');
    const metadata = getPageMetadata(path, 'mixed', '');
    assert.ok(html.includes(`<title>${metadata.title}</title>`));
    for (const [attribute, key] of metadataEntries(metadata)) assert.ok(html.includes(`${attribute}="${key}"`));
    assert.equal((html.match(/site-metadata:start/g) || []).length, 1);
    assert.ok(html.includes('href="/favicon.svg"'));
    assert.ok(!html.includes('rel="canonical"'));
  }
});

test('build HTML transformation creates absolute metadata only after explicit domain configuration', () => {
  const plugin = siteMetadataPlugin();
  plugin.configResolved({ env: { VITE_SITE_URL: 'https://haoqi.dev' }, root: '.', build: { outDir: 'dist' } });
  const original = readFileSync(new URL('../about.html', import.meta.url), 'utf8');
  const output = plugin.transformIndexHtml(original, { path: '/about.html' });
  assert.match(output, /rel="canonical" href="https:\/\/haoqi\.dev\/about\.html"/);
  assert.match(output, /property="og:image" content="https:\/\/haoqi\.dev\/assets\/hero-background\.png"/);
  const emitted = [];
  plugin.generateBundle.call({ emitFile: file => emitted.push(file) });
  assert.deepEqual(emitted.map(file => file.fileName), ['sitemap.xml']);
  assert.equal(plugin.closeBundle.order, 'post');
});

test('head rendering escapes text and static 404 remains usable without JavaScript', () => {
  assert.match(renderPageHead({ ...getPageMetadata('/', 'mixed', ''), title: 'A < B & "C"' }), /A &lt; B &amp; &quot;C&quot;/);
  const html = readFileSync(new URL('../public/404.html', import.meta.url), 'utf8');
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/work\.html"/);
  assert.doesNotMatch(html, /<script/);
});
