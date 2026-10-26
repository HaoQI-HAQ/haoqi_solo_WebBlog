export const SITE_NAME = 'HAOQI / STUDIO';
export const SITE_IMAGE = '/assets/hero-background.png';
export const SITE_PATHS = Object.freeze(['/', '/work.html', '/photography.html', '/music.html', '/contact.html', '/about.html']);

const pageKeys = { '/': 'home', '/work.html': 'work', '/photography.html': 'photo', '/music.html': 'music', '/contact.html': 'contact', '/about.html': 'about' };
const descriptions = {
  mixed: {
    home: '浩祈的个人作品集：游戏策划、视觉设计与 AI 编曲，收录游戏作品、摄影和音乐收藏。',
    work: '浏览浩祈的作品档案：游戏项目、摄影记录与音乐收藏，通过光盘、相框和黑胶模型探索作品。',
    photo: '浩祈的摄影记录：用镜头收藏旅途中值得停下来的片刻，查看阳朔山水与日落全景。',
    music: '浩祈的音乐收藏与聆听记录，浏览专辑、曲目和原作品署名。',
    contact: '联系浩祈，交流游戏策划、视觉设计与音乐合作，也可以访问社交主页。',
    about: '认识浩祈：游戏策划、视觉设计与 AI 编曲，以及最喜欢的游戏和个人游戏库。',
    notFound: '这一页没有找到。可以返回浩祈的首页，或继续浏览作品档案。',
  },
  en: {
    home: 'Haoqi’s portfolio of game design, visual design and AI composition, with game projects, photography and a music collection.',
    work: 'Explore Haoqi’s archive of game projects, photography and music through game discs, photograph frames and vinyl records.',
    photo: 'Photographs by Haoqi: moments from the road, including the mountains, river and sunset of Yangshuo.',
    music: 'Browse Haoqi’s music collection and listening notes, with albums, tracks and credits for the original artists.',
    contact: 'Contact Haoqi to discuss game design, visual design or music, and find links to social profiles.',
    about: 'Meet Haoqi: game design, visual design and AI composition, favorite games and a personal game library.',
    notFound: 'This page could not be found. Return to Haoqi’s homepage or explore the work archive.',
  },
  ja: {
    home: 'HAOQI のポートフォリオ。ゲームデザイン、ビジュアル、AI 作曲を横断する作品、写真、音楽コレクション。',
    work: 'ゲームディスク、写真フレーム、レコードを通して、HAOQI のゲーム作品、写真、音楽アーカイブを見る。',
    photo: 'HAOQI の写真記録。旅先で足を止めた瞬間や、陽朔の山々、川、夕景を収録。',
    music: 'HAOQI の音楽コレクションとリスニングノート。アルバム、楽曲、原作品のアーティスト情報を見る。',
    contact: 'ゲームデザイン、ビジュアル、音楽について HAOQI に連絡する。SNS のリンクも掲載。',
    about: 'HAOQI について。ゲームデザイン、ビジュアル、AI 作曲と、お気に入りのゲーム、個人のゲームライブラリ。',
    notFound: 'このページは見つかりませんでした。ホームまたは作品アーカイブをご覧ください。',
  },
  ru: {
    home: 'Портфолио Haoqi: игровой и визуальный дизайн, AI-композиция, игровые проекты, фотографии и музыкальная коллекция.',
    work: 'Архив игровых проектов, фотографий и музыки Haoqi в виде игровых дисков, фоторамок и виниловых пластинок.',
    photo: 'Фотографии Haoqi: мгновения из путешествий, горы, река и закат в Яншо.',
    music: 'Музыкальная коллекция и заметки Haoqi: альбомы, композиции и имена авторов оригинальных работ.',
    contact: 'Связаться с Haoqi по вопросам игрового и визуального дизайна или музыки. Ссылки на социальные сети.',
    about: 'О Haoqi: игровой и визуальный дизайн, AI-композиция, любимые игры и личная игровая библиотека.',
    notFound: 'Страница не найдена. Вернитесь на главную страницу Haoqi или откройте архив работ.',
  },
};
const titles = {
  mixed: { home: 'HAOQI / Play, Image, Sound', work: 'Work — HAOQI / STUDIO', photo: 'Photography — HAOQI / STUDIO', music: 'Music — HAOQI / STUDIO', contact: 'Contact — HAOQI / STUDIO', about: 'About — HAOQI / STUDIO', notFound: '404 · 页面未找到 — HAOQI / STUDIO' },
  zh: { home: '浩祈 / 游戏、影像与声音', work: '作品档案 — 浩祈 / HAOQI', photo: '摄影作品 — 浩祈 / HAOQI', music: '音乐收藏 — 浩祈 / HAOQI', contact: '联系 — 浩祈 / HAOQI', about: '关于我 — 浩祈 / HAOQI', notFound: '404 · 页面未找到 — 浩祈 / HAOQI' },
  en: { home: 'HAOQI / Play, Image, Sound', work: 'Work — HAOQI / STUDIO', photo: 'Photography — HAOQI / STUDIO', music: 'Music — HAOQI / STUDIO', contact: 'Contact — HAOQI / STUDIO', about: 'About — HAOQI / STUDIO', notFound: '404 · Page not found — HAOQI / STUDIO' },
  ja: { home: 'HAOQI / 遊び、映像、そして音', work: '作品アーカイブ — HAOQI / STUDIO', photo: '写真 — HAOQI / STUDIO', music: '音楽コレクション — HAOQI / STUDIO', contact: '連絡 — HAOQI / STUDIO', about: 'HAOQI について — HAOQI / STUDIO', notFound: '404 · ページが見つかりません — HAOQI / STUDIO' },
  ru: { home: 'HAOQI / Игра, образ и звук', work: 'Архив работ — HAOQI / STUDIO', photo: 'Фотографии — HAOQI / STUDIO', music: 'Музыкальная коллекция — HAOQI / STUDIO', contact: 'Контакты — HAOQI / STUDIO', about: 'Обо мне — HAOQI / STUDIO', notFound: '404 · Страница не найдена — HAOQI / STUDIO' },
};
const locales = { mixed: 'zh_CN', zh: 'zh_CN', en: 'en_US', ja: 'ja_JP', ru: 'ru_RU' };

export function normalizeSiteUrl(value = '') {
  const input = String(value).trim();
  if (!input) return '';
  let url;
  try { url = new URL(input); } catch { throw new Error('VITE_SITE_URL 必须是实际网站的完整 HTTPS 地址。'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_SITE_URL 必须使用 HTTPS，且不能包含账号、查询参数或锚点。');
  }
  if (url.pathname !== '/') {
    throw new Error('当前站点只支持根路径部署，VITE_SITE_URL 不能包含子目录。');
  }
  const hostname = url.hostname.toLowerCase();
  const reserved = /^(?:localhost|127\.|0\.|\[::1\])|(?:^|\.)(?:example\.(?:com|org|net)|example|invalid|test|localhost)$/.test(hostname);
  if (!hostname.includes('.') || reserved || /你的|placeholder/i.test(input)) {
    throw new Error('VITE_SITE_URL 请填写真实正式域名，不要使用 localhost 或示例地址。');
  }
  return url.href.replace(/\/+$/, '');
}

export function pageKey(pathname = '/') {
  const path = String(pathname || '/').split(/[?#]/)[0];
  return pageKeys[path === '/index.html' ? '/' : path] || 'notFound';
}

export function getPageMetadata(pathname = '/', language = 'mixed', siteUrl = import.meta.env?.VITE_SITE_URL || '') {
  const key = pageKey(pathname), locale = titles[language] ? language : 'mixed';
  const site = normalizeSiteUrl(siteUrl);
  const path = key === 'home' ? '/' : SITE_PATHS.find(value => pageKeys[value] === key) || '/404.html';
  const canonical = site && key !== 'notFound' ? new URL(path.slice(1), `${site}/`).href : '';
  return {
    key, path, language: locale === 'mixed' || locale === 'zh' ? 'zh-CN' : locale,
    title: titles[locale][key], description: (descriptions[locale] || descriptions.mixed)[key],
    themeColor: '#0d0f10', siteName: SITE_NAME, type: 'website', locale: locales[locale],
    robots: key === 'notFound' ? 'noindex, follow' : 'index, follow', canonical,
    image: site ? new URL(SITE_IMAGE.slice(1), `${site}/`).href : SITE_IMAGE,
    imageAlt: ({ en: 'HAOQI / STUDIO portfolio preview', ja: 'HAOQI / STUDIO ポートフォリオ', ru: 'Портфолио HAOQI / STUDIO' })[locale] || 'HAOQI / STUDIO 个人作品集预览',
  };
}

export function metadataEntries(metadata) {
  const entries = [
    ['name', 'description', metadata.description], ['name', 'theme-color', metadata.themeColor], ['name', 'robots', metadata.robots],
    ['property', 'og:type', metadata.type], ['property', 'og:site_name', metadata.siteName], ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description], ['property', 'og:locale', metadata.locale], ['property', 'og:image', metadata.image],
    ['property', 'og:image:alt', metadata.imageAlt], ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', metadata.title], ['name', 'twitter:description', metadata.description], ['name', 'twitter:image', metadata.image],
    ['name', 'twitter:image:alt', metadata.imageAlt],
  ];
  if (metadata.canonical) entries.push(['property', 'og:url', metadata.canonical]);
  return entries;
}

export function applyPageMetadata(pathname, language = 'mixed', { document: page = globalThis.document, siteUrl = import.meta.env?.VITE_SITE_URL || '' } = {}) {
  const metadata = getPageMetadata(pathname, language, siteUrl);
  if (!page) return metadata;
  page.title = metadata.title;
  page.documentElement.lang = metadata.language;
  for (const [attribute, key, content] of metadataEntries(metadata)) {
    let tag = page.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!tag) { tag = page.createElement('meta'); tag.setAttribute(attribute, key); page.head.append(tag); }
    tag.setAttribute('content', content);
  }
  let icon = page.head.querySelector('link[rel="icon"]');
  if (!icon) { icon = page.createElement('link'); icon.setAttribute('rel', 'icon'); page.head.append(icon); }
  icon.setAttribute('type', 'image/svg+xml'); icon.setAttribute('href', '/favicon.svg');
  let canonical = page.head.querySelector('link[rel="canonical"]');
  if (metadata.canonical) {
    if (!canonical) { canonical = page.createElement('link'); canonical.setAttribute('rel', 'canonical'); page.head.append(canonical); }
    canonical.setAttribute('href', metadata.canonical);
  } else {
    canonical?.remove();
    page.head.querySelector('meta[property="og:url"]')?.remove();
  }
  return metadata;
}
