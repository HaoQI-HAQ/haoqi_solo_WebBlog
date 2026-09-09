import { createElement, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { copy as legacyCopy, gameWorks, languages, mapCities, musicTracks, photoAlbums, socials } from './content.js';
const WorkArchive = lazy(() => import('./work-archive/WorkArchive.jsx'));

const projectItems = [
  {
    number: '01',
    archiveCode: 'WORK-01',
    title: 'Worlds in motion',
    subtitle: 'Game direction / narrative systems',
    detail: '把玩法、叙事与节奏组织成可进入的世界。',
    image: '/assets/desktop-a-contact.jpg',
    tone: 'project-amber',
  },
  {
    number: '02',
    archiveCode: 'WORK-02',
    title: 'A visual language',
    subtitle: 'Visual identity / art direction',
    detail: '从一张海报到一套可以持续生长的视觉系统。',
    image: '/assets/desktop-b-contact.jpg',
    tone: 'project-mint',
  },
  {
    number: '03',
    archiveCode: 'WORK-03',
    title: 'Sound as material',
    subtitle: 'AI composition / sound studies',
    detail: '用算法和直觉，寻找画面之外的情绪线索。',
    image: '/assets/tool-contact.jpg',
    tone: 'project-sand',
  },
];

const capabilityItems = [
  {
    index: '01',
    title: 'Game design',
    chinese: '游戏策划',
    body: '世界观、核心循环、关卡节奏与可玩性验证。让想法变成玩家愿意反复进入的空间。',
    tags: ['Worldbuilding', 'Systems', 'Level design'],
  },
  {
    index: '02',
    title: 'Visual design',
    chinese: '视觉设计',
    body: '视觉叙事、品牌识别、界面与动态海报。用秩序和留白建立一个项目的第一印象。',
    tags: ['Art direction', 'Identity', 'Motion'],
  },
  {
    index: '03',
    title: 'AI composition',
    chinese: 'AI 编曲',
    body: '把旋律、采样和模型能力当作新的乐器，快速探索一段情绪的多种可能。',
    tags: ['Arrangement', 'Sound design', 'Experiments'],
  },
];

const contactGreetings = [
  { prefix: '欢迎来到', name: '浩祈', suffix: '的博客' },
  { prefix: '你好，我是', name: '浩祈', suffix: '' },
];

const languageOptions = [{ code: 'mixed', label: '混' }, ...languages];
const primaryNavigation = [
  { id: 'home', href: '/', labelIndex: 0, number: '01' },
  { id: 'work', href: '/work.html', labelIndex: 1, number: '02' },
  { id: 'photo', href: '/photography.html', labelIndex: 2, number: '03' },
  { id: 'music', href: '/music.html', labelIndex: 3, number: '04' },
  { id: 'contact', href: '/contact.html', labelIndex: 4, number: '05' },
  { id: 'about', href: '/about.html', labelIndex: 5, number: '06' },
];
const mixedText = {
  nav: ['Home', 'Work', 'Photography', 'Music', 'Contact', 'About'],
  heroKicker: 'Game design · Visual direction · AI composition',
  heroTitle: 'I shape <em>play</em><br /><span class="headline-indent">image</span> &amp; sound<br />into <em>worlds</em>',
  heroBody: '我是一名游戏策划、视觉设计师，也是一名 AI 编曲人。',
  explore: 'Explore the work', status: 'Available for selected collaborations', scroll: 'Scroll to enter',
  aboutMarker: 'About the practice', aboutKicker: 'A multidisciplinary practice', aboutTitle: '一半在<em>系统</em>里，<br />一半在<span>感觉里。</span>',
  aboutLarge: '我是一名游戏策划、视觉设计师，也是一名 AI 编曲人。我的工作总是在寻找同一件事：让一个想法拥有自己的气候、节奏和入口。',
  aboutBody: '我相信好的体验不会把答案直接交给你。它会留下一个动作、一种声音或一块空白，让人愿意继续靠近。',
  openContact: 'Open contact page', currently: 'Currently exploring', playable: 'Playable atmospheres', disciplines: 'creative disciplines', iterations: 'iterations before the right feeling', practice: 'practice in progress', statsNote: 'Numbers are placeholders<br />until the archive is filled.',
  selectedWork: 'Selected work', selectedNote: 'Three directions, one curiosity:<br />what makes a world stay with you?', workIntro: 'Pieces of<br /><em>becoming.</em>', archiveProgress: 'Archive in progress', viewNotes: 'View all notes',
  capabilities: 'Capabilities', capabilitiesNote: 'Different tools, same instinct:<br />make the invisible legible.', capabilitiesKicker: 'What I bring into the room', capabilitiesTitle: '从问题出发，<br /><span>到体验落地。</span>',
  photoTitle: '摄影作品', musicTitle: '个人音乐分析', contactTitle: 'Contact', contactKicker: 'Have a world in mind?', contactHeading: 'Let’s make<br /><em>something enterable.</em>', contactFooter: 'Open to selected collaborations / 2026', backTop: 'Back to top', contactMe: '联系我',
  pageAbout: 'About', pageGames: '游戏作品', pagePhoto: '摄影作品', pageMusic: '个人音乐分析', pageContact: '联系与社交',
  photoIntro: '摄影系统按城市与年份归档，点击相册可打开完整帧组。', all: '全部', city: 'City', year: 'Year', viewAlbum: '查看相册', mapTitle: '拍摄城市地图', mapNote: '城市标记会随着摄影档案增加而扩展。', nowPlaying: 'Now playing', audioPending: '音频文件待添加', close: 'Close', previous: 'Previous', next: 'Next',
};

const languageText = {
  mixed: mixedText,
  zh: { ...mixedText, nav: ['首页', '作品', '摄影', '音乐', '联系', '关于'], heroKicker: '游戏策划 · 视觉设计 · AI 编曲', heroTitle: '把<em>玩法</em>、影像与声音做成可以进入的<em>世界</em>。', heroBody: '我是一名游戏策划、视觉设计师，也是一名 AI 编曲人。', explore: '进入作品', status: '欢迎合作', scroll: '向下浏览', aboutMarker: '关于实践', aboutKicker: '跨学科创作实践', aboutTitle: '一半在<em>系统</em>里，<br />一半在<span>感觉里。</span>', openContact: '打开联系页', currently: '正在探索', playable: '可进入的氛围', disciplines: '创作方向', iterations: '直到找到正确感觉的迭代', practice: '进行中的实践', selectedWork: '精选作品', selectedNote: '三个方向，同一种好奇：<br />什么让一个世界被记住？', workIntro: '正在<br /><em>成为。</em>', archiveProgress: '档案持续整理中', viewNotes: '查看全部记录', capabilities: '能力', capabilitiesNote: '不同工具，同一种直觉：<br />让不可见之物变得清晰。', capabilitiesKicker: '我带来的东西', capabilitiesTitle: '从问题出发，<br /><span>到体验落地。</span>', photoTitle: '摄影作品', musicTitle: '个人音乐分析', contactTitle: '联系', contactKicker: '有一个正在形成的世界？', contactHeading: '一起让它<br /><em>变得可以进入。</em>', contactFooter: '开放精选合作 / 2026', backTop: '回到顶部', contactMe: '联系我', pageAbout: '关于', pageGames: '游戏作品', pagePhoto: '摄影作品', pageMusic: '个人音乐分析', pageContact: '联系与社交', photoIntro: '摄影系统按城市与年份归档，点击相册可打开完整帧组。', all: '全部', city: '城市', year: '年份', viewAlbum: '查看相册', mapTitle: '拍摄城市地图', mapNote: '城市标记会随着摄影档案增加而扩展。', nowPlaying: '正在播放', audioPending: '音频文件待添加', close: '关闭', previous: '上一张', next: '下一张' },
  ja: { ...mixedText, nav: ['ホーム', '作品', '写真', '音楽', '連絡', '概要'], heroKicker: 'ゲームデザイン · ビジュアル · AI 作曲', heroTitle: '<em>遊び</em>、映像、音を、入れる<em>世界</em>にする。', heroBody: 'ゲーム、ビジュアル、AI 作曲を横断して、体験の入口をつくります。', explore: '作品を見る', status: '選択的な協業を受付中', scroll: 'スクロールして入る', aboutMarker: '実践について', aboutKicker: '複合的な創作実践', aboutTitle: '半分は<em>システム</em>、<br />半分は<span>感覚。</span>', openContact: '連絡ページを開く', currently: '現在の探索', playable: '入れる雰囲気', disciplines: '創作分野', iterations: '正しい感覚までの反復', practice: '進行中の実践', selectedWork: '選択した作品', selectedNote: '三つの方向、ひとつの好奇心：<br />世界を記憶に残すものは？', workIntro: '生まれつつある<br /><em>断片。</em>', archiveProgress: 'アーカイブ整理中', viewNotes: '記録を見る', capabilities: 'できること', capabilitiesNote: '異なる道具、同じ直感：<br />見えないものを明らかにする。', capabilitiesKicker: '持ち込めるもの', capabilitiesTitle: '問いから始め、<br /><span>体験へ。</span>', photoTitle: '写真作品', musicTitle: '音楽分析', contactTitle: '連絡', contactKicker: '思い描いている世界がありますか？', contactHeading: '一緒に<br /><em>入れるものへ。</em>', contactFooter: '選択的な協業を受付中 / 2026', backTop: 'トップへ戻る', contactMe: '連絡する', pageAbout: '概要', pageGames: 'ゲーム作品', pagePhoto: '写真作品', pageMusic: '音楽分析', pageContact: '連絡とSNS', photoIntro: '都市と年ごとに写真を整理しています。アルバムをクリックするとフレームを開けます。', all: 'すべて', city: '都市', year: '年', viewAlbum: 'アルバムを見る', mapTitle: '撮影都市マップ', mapNote: '写真アーカイブに合わせて都市マーカーが増えます。', nowPlaying: '再生中', audioPending: '音源は未追加', close: '閉じる', previous: '前へ', next: '次へ' },
  en: { ...mixedText, nav: ['Home', 'Work', 'Photography', 'Music', 'Contact', 'About'], heroKicker: legacyCopy.en.heroKicker, heroTitle: 'I shape <em>play</em><br /><span class="headline-indent">image</span> &amp; sound<br />into <em>worlds</em>', heroBody: legacyCopy.en.heroBody, explore: legacyCopy.en.explore, status: 'Available for selected collaborations', scroll: 'Scroll to enter', aboutMarker: 'About the practice', aboutKicker: 'A multidisciplinary practice', aboutTitle: 'Half <em>system</em>,<br />half <span>feeling.</span>', aboutLarge: legacyCopy.en.aboutBody, aboutBody: 'Good experiences leave an action, a sound or a blank space that invites people closer.', openContact: 'Open contact page', currently: 'Currently exploring', playable: 'Playable atmospheres', disciplines: 'creative disciplines', iterations: 'iterations before the right feeling', practice: 'practice in progress', selectedWork: legacyCopy.en.workTitle, selectedNote: 'Three directions, one curiosity:<br />what makes a world stay with you?', workIntro: 'Pieces of<br /><em>becoming.</em>', archiveProgress: 'Archive in progress', viewNotes: 'View all notes', capabilities: 'Capabilities', capabilitiesNote: 'Different tools, same instinct:<br />make the invisible legible.', capabilitiesKicker: 'What I bring into the room', capabilitiesTitle: 'From problem to<br /><span>lived experience.</span>', photoTitle: legacyCopy.en.photoTitle, musicTitle: legacyCopy.en.musicTitle, contactTitle: legacyCopy.en.contactTitle, contactKicker: 'Have a world in mind?', contactHeading: 'Let’s make<br /><em>something enterable.</em>', contactFooter: 'Open to selected collaborations / 2026', backTop: 'Back to top', contactMe: 'Contact', pageAbout: 'About', pageGames: 'Game Works', pagePhoto: 'Photography', pageMusic: 'Music Notes', pageContact: 'Contact & Social', photoIntro: legacyCopy.en.photoIntro, all: 'All', city: 'City', year: 'Year', viewAlbum: 'View album', mapTitle: legacyCopy.en.mapTitle, mapNote: legacyCopy.en.mapNote, nowPlaying: legacyCopy.en.nowPlaying, audioPending: legacyCopy.en.noAudio, close: legacyCopy.en.close, previous: legacyCopy.en.previous, next: legacyCopy.en.next },
  ru: { ...mixedText, nav: ['Главная', 'Работы', 'Фото', 'Музыка', 'Контакты', 'Обо мне'], heroKicker: legacyCopy.ru.heroKicker, heroTitle: 'Я собираю <em>игру</em>, образ и звук в <em>миры</em>, куда можно войти.', heroBody: legacyCopy.ru.heroBody, explore: legacyCopy.ru.explore, status: 'Открыт для выбранных коллабораций', scroll: 'Листайте вниз', aboutMarker: 'О практике', aboutKicker: 'Междисциплинарная практика', aboutTitle: 'Половина — <em>система</em>,<br />половина — <span>чувство.</span>', aboutLarge: legacyCopy.ru.aboutBody, aboutBody: 'Хороший опыт оставляет действие, звук или пустоту, которая зовёт подойти ближе.', openContact: 'Открыть контакты', currently: 'Сейчас исследую', playable: 'Входящие атмосферы', disciplines: 'творческие направления', iterations: 'итераций до правильного чувства', practice: 'практика в процессе', selectedWork: legacyCopy.ru.workTitle, selectedNote: 'Три направления, одно любопытство:<br />что удерживает мир в памяти?', workIntro: 'Фрагменты<br /><em>становления.</em>', archiveProgress: 'Архив пополняется', viewNotes: 'Все заметки', capabilities: 'Возможности', capabilitiesNote: 'Разные инструменты, один инстинкт:<br />сделать невидимое ясным.', capabilitiesKicker: 'Что я привношу', capabilitiesTitle: 'От вопроса к<br /><span>опыту.</span>', photoTitle: legacyCopy.ru.photoTitle, musicTitle: legacyCopy.ru.musicTitle, contactTitle: legacyCopy.ru.contactTitle, contactKicker: 'У вас есть мир в замысле?', contactHeading: 'Давайте создадим<br /><em>то, куда можно войти.</em>', contactFooter: 'Открыт для выбранных коллабораций / 2026', backTop: 'Наверх', contactMe: 'Контакты', pageAbout: 'Обо мне', pageGames: 'Игровые работы', pagePhoto: 'Фотография', pageMusic: 'Музыкальный анализ', pageContact: 'Контакты и соцсети', photoIntro: legacyCopy.ru.photoIntro, all: 'Все', city: 'Город', year: 'Год', viewAlbum: 'Открыть альбом', mapTitle: legacyCopy.ru.mapTitle, mapNote: legacyCopy.ru.mapNote, nowPlaying: legacyCopy.ru.nowPlaying, audioPending: legacyCopy.ru.noAudio, close: legacyCopy.ru.close, previous: legacyCopy.ru.previous, next: legacyCopy.ru.next },
};

const contactText = {
  mixed: { label: 'Contact / 04', kicker: 'A direct line to the practice', intro: '游戏策划、视觉设计师、AI 编曲人。', message: '如果你有一个正在成形的世界，欢迎来聊聊。', email: 'Email', bilibili: 'Bilibili', portrait: 'Portrait / HAOQI' },
  zh: { label: '联系 / 04', kicker: '直接联系我的创作实践', intro: '游戏策划、视觉设计师、AI 编曲人。', message: '如果你有一个正在成形的世界，欢迎来聊聊。', email: '邮箱', bilibili: '哔哩哔哩', portrait: '头像 / 浩祈' },
  ja: { label: '連絡 / 04', kicker: '創作実践へ直接つながる', intro: 'ゲームデザイナー、ビジュアルデザイナー、AI 作曲家。', message: '形になりつつある世界があれば、ぜひ話しましょう。', email: 'メール', bilibili: 'Bilibili', portrait: 'ポートレート / HAOQI' },
  en: { label: 'Contact / 04', kicker: 'A direct line to the practice', intro: 'Game designer, visual designer, and AI composer.', message: 'If you have a world taking shape, let’s talk.', email: 'Email', bilibili: 'Bilibili', portrait: 'Portrait / HAOQI' },
  ru: { label: 'Контакты / 04', kicker: 'Прямая связь с практикой', intro: 'Игровой дизайнер, визуальный дизайнер и AI-композитор.', message: 'Если у вас рождается новый мир, давайте поговорим.', email: 'Почта', bilibili: 'Bilibili', portrait: 'Портрет / HAOQI' },
};

function LanguageSwitcher({ language, setLanguage }) {
  const [isSwitching, setIsSwitching] = useState(false);
  const selectLanguage = (nextLanguage) => {
    if (nextLanguage === language) return;
    setIsSwitching(true);
    setLanguage(nextLanguage);
    window.setTimeout(() => setIsSwitching(false), 360);
  };
  return <div className={`language-switcher ${isSwitching ? 'is-switching' : ''}`} aria-label="Language switcher">{languageOptions.map((item) => <button type="button" className={language === item.code ? 'is-active' : ''} key={item.code} onClick={() => selectLanguage(item.code)}>{item.label}</button>)}</div>;
}

function NavigationItems({ language, currentPage, onNavigate, mobile = false }) {
  const t = languageText[language] || mixedText;
  return primaryNavigation.map((item) => {
    const active = item.id === currentPage;
    return <a key={item.id} href={item.href} className={active ? 'is-active' : undefined} aria-current={active ? 'page' : undefined} onClick={onNavigate}>{t.nav[item.labelIndex]} {mobile && <span>{item.number}</span>}</a>;
  });
}

function SocialIcon({ service }) {
  if (service === 'bilibili') return <svg className="contact-service-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4.5 10 7M16 4.5 14 7M6.5 7h11A3.5 3.5 0 0 1 21 10.5v6A3.5 3.5 0 0 1 17.5 20h-11A3.5 3.5 0 0 1 3 16.5v-6A3.5 3.5 0 0 1 6.5 7Z" /><path d="M8 13h.01M16 13h.01M9 16h6" /></svg>;
  if (service === 'github') return <svg className="contact-service-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 19v-2.5c-1.7.4-3-.2-3-1.6 0-.8.5-1.3 1.1-1.6-.2-1.7.1-3 1.2-3.8A8.3 8.3 0 0 1 12 8a8.3 8.3 0 0 1 5.7 1.5c1.1.8 1.4 2.1 1.2 3.8.6.3 1.1.8 1.1 1.6 0 1.4-1.3 2-3 1.6V19" /><path d="M9 20v-3.2c0-1.1.8-1.8 3-1.8s3 .7 3 1.8V20M9 12h.01M15 12h.01" /></svg>;
  if (service === 'x') return <svg className="contact-service-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4 19 20M19 4 5 20" /></svg>;
  return <svg className="contact-service-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.8" r=".8" fill="currentColor" stroke="none" /></svg>;
}

function parseHeadlineMarkup(markup) {
  const parts = [];
  const tagPattern = /(<br\s*\/?\s*>|<em>|<\/em>|<span[^>]*>|<\/span>)/gi;
  let cursor = 0;
  let state = { accent: false, className: '' };
  const stack = [];
  const pushText = (value) => {
    const text = value.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
    if (text) parts.push({ type: 'text', text, ...state });
  };
  for (const match of markup.matchAll(tagPattern)) {
    pushText(markup.slice(cursor, match.index));
    const tag = match[0].toLowerCase();
    if (tag.startsWith('<br')) parts.push({ type: 'br' });
    else if (tag === '<em>') { stack.push(state); state = { ...state, accent: true }; }
    else if (tag === '</em>') state = stack.pop() || { accent: false, className: '' };
    else if (tag.startsWith('<span')) { stack.push(state); const classMatch = tag.match(/class=["']([^"']+)["']/); state = { ...state, className: classMatch?.[1] || '' }; }
    else if (tag === '</span>') state = stack.pop() || { accent: false, className: '' };
    cursor = match.index + match[0].length;
  }
  pushText(markup.slice(cursor));
  return parts;
}

function TypewriterHeadline({ markup, as = 'span', className = '', stripPunctuation = false }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const parts = parseHeadlineMarkup(stripPunctuation ? markup.replace(/[,.，、。]/g, '') : markup);
  const textLength = parts.reduce((total, part) => total + (part.type === 'text' ? part.text.length : 0), 0);

  useEffect(() => {
    const node = ref.current;
    if (!node || started) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return undefined;
    let index = 0;
    let mode = 'typing';
    let timer;
    const tick = () => {
      if (mode === 'typing') {
        index += 1;
        setVisibleChars(index);
        if (index >= textLength) { mode = 'hold'; timer = window.setTimeout(tick, 2600); }
        else timer = window.setTimeout(tick, 82);
      } else if (mode === 'hold') {
        mode = 'deleting';
        timer = window.setTimeout(tick, 700);
      } else if (index > 0) {
        index -= 1;
        setVisibleChars(index);
        timer = window.setTimeout(tick, 42);
      } else {
        mode = 'typing';
        timer = window.setTimeout(tick, 520);
      }
    };
    setVisibleChars(0);
    tick();
    return () => window.clearTimeout(timer);
  }, [markup, started, textLength]);

  let remaining = visibleChars;
  return createElement(as, { ref, className: `typewriter-headline ${className}`.trim(), 'aria-label': parts.filter((part) => part.type === 'text').map((part) => part.text).join('') }, parts.map((part, index) => {
    if (part.type === 'br') return <br key={`br-${index}`} />;
    const amount = Math.min(remaining, part.text.length);
    remaining -= amount;
    if (!amount) return null;
    const Tag = part.accent ? 'em' : 'span';
    return <Tag className={part.className || undefined} key={`text-${index}`}>{part.text.slice(0, amount)}</Tag>;
  }));
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => {
    try { return window.localStorage.getItem(key) || fallback; } catch { return fallback; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, value); } catch { /* session-only fallback */ }
  }, [key, value]);
  return [value, setValue];
}

function BootSequence() {
  const [visible, setVisible] = useState(() => {
    try { return window.localStorage.getItem('haoqi-signal-seen') !== '1'; } catch { return true; }
  });
  const dismiss = () => {
    try { window.localStorage.setItem('haoqi-signal-seen', '1'); } catch { /* session-only fallback */ }
    setVisible(false);
  };
  useEffect(() => {
    if (!visible) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(dismiss, reducedMotion ? 1 : 1350);
    const onKeyDown = (event) => { if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') dismiss(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.clearTimeout(timer); window.removeEventListener('keydown', onKeyDown); };
  }, [visible]);
  if (!visible) return null;
  return <div className="signal-boot" role="status" aria-label="HAOQI STUDIO signal connecting">
    <div className="signal-boot-grid" aria-hidden="true" />
    <div className="signal-boot-copy"><span>Signal / incoming</span><strong>HAOQI <i>/</i> STUDIO</strong><small>ARCHIVE LINK · 01 / 01</small></div>
    <div className="signal-boot-progress" aria-hidden="true"><i /></div>
    <button type="button" onClick={dismiss}>Skip <span>↗</span></button>
  </div>;
}

function useArchiveExtract() {
  const [focus, setFocus] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const openArchive = (kind, item, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setIsClosing(false);
    setFocus({ kind, item, origin: { x: rect.left, y: rect.top, width: rect.width, height: rect.height } });
  };
  const closeArchive = () => {
    setIsClosing(true);
    window.setTimeout(() => { setFocus(null); setIsClosing(false); }, 380);
  };
  return { focus, isClosing, openArchive, closeArchive };
}

function ArchiveExtract({ focus, isClosing, onClose }) {
  useEffect(() => {
    if (!focus) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [focus, onClose]);
  if (!focus) return null;
  const { item, kind, origin } = focus;
  const image = kind === 'photo' ? item.cover : item.image;
  const detail = kind === 'photo' ? `${item.city} / ${item.year} · ${item.frameCount} frames` : item.type;
  return <div className={`archive-extract ${isClosing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-label={`${item.title} archive`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="archive-origin-echo" style={{ '--origin-x': `${origin.x}px`, '--origin-y': `${origin.y}px`, '--origin-w': `${origin.width}px`, '--origin-h': `${origin.height}px` }} aria-hidden="true" />
    <article className="archive-extract-panel">
      <div className="archive-extract-bar"><span>ARCHIVE / EXTRACTED</span><span className="archive-code">{item.archiveCode}</span><button type="button" onClick={onClose}>Close <i>×</i></button></div>
      <div className="archive-extract-body"><div className={`archive-extract-image ${kind === 'work' && item.videoSrc ? 'is-video' : ''}`}>{kind === 'work' && item.videoSrc ? <div className="work-video-deck"><span className="work-video-deck-sheet work-video-deck-sheet-a" aria-hidden="true" /><span className="work-video-deck-sheet work-video-deck-sheet-b" aria-hidden="true" /><div className="work-video-frame"><video controls playsInline preload="metadata" poster={image} aria-label={`${item.title} video preview`}><source src={item.videoSrc} type="video/mp4" />Your browser does not support this video.</video><div className="work-video-hud" aria-hidden="true"><span>{item.archiveCode} / VIDEO READOUT</span><span>{item.videoLabel || 'Archive preview'}</span></div></div></div> : <><img src={image} alt={item.title} /><span className="archive-extract-scan" aria-hidden="true" /></>}</div><div className="archive-extract-copy"><small>{detail}</small><h2>{item.title}</h2><p>{item.summary || item.detail}</p><div className="archive-extract-meta"><span>{kind === 'photo' ? 'PHOTO GROUP' : 'WORK FILE'}</span><span>{kind === 'work' && item.videoSrc ? 'VIDEO / READY' : 'RETURN / CARD POSITION'}</span></div></div></div>
    </article>
  </div>;
}

function Lightbox({ album, index, onChange, onClose }) {
  const image = album.images[index];
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onChange((index - 1 + album.images.length) % album.images.length);
      if (event.key === 'ArrowRight') onChange((index + 1) % album.images.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKeyDown); };
  }, [album, index, onChange, onClose]);
  return <div className="archive-lightbox" role="dialog" aria-modal="true" aria-label={album.title}>
    <button type="button" onClick={onClose}>Close ×</button>
    <img src={image.src} alt={image.caption} />
    <p>{album.title} / {image.caption} / {index + 1} — {album.images.length}</p>
    <button type="button" onClick={() => onChange((index - 1 + album.images.length) % album.images.length)} aria-label="上一张">←</button>
    <button type="button" onClick={() => onChange((index + 1) % album.images.length)} aria-label="下一张">→</button>
  </div>;
}

function MusicTools({ language }) {
  const [activeTrack, setActiveTrack] = usePersistentState('haoqi-track', musicTracks[0].id);
  const [open, setOpen] = useState(false);
  const current = musicTracks.find((track) => track.id === activeTrack) || musicTracks[0];
  const t = languageText[language] || mixedText;
  return <aside className={`music-dock ${open ? 'is-open' : ''}`}>
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span className="music-signal">•••</span> {t.nowPlaying}</button>
    <div className="music-dock-panel"><small>{t.nowPlaying}</small><strong>{current.title}</strong><select value={current.id} onChange={(event) => setActiveTrack(event.target.value)} aria-label={t.nowPlaying}>{musicTracks.map((track) => <option value={track.id} key={track.id}>{track.title}</option>)}</select><span>{current.src ? 'Audio ready' : t.audioPending}</span></div>
  </aside>;
}

function FunctionalPage({ page, language, setLanguage }) {
  const [city, setCity] = useState('all');
  const [year, setYear] = useState('all');
  const [activeTrack, setActiveTrack] = usePersistentState('haoqi-track', musicTracks[0].id);
  const { focus, isClosing, openArchive, closeArchive } = useArchiveExtract();
  const t = languageText[language] || mixedText;
  const albums = photoAlbums.filter((album) => (city === 'all' || album.city === city) && (year === 'all' || album.year === year));
  const activeMusicTrack = musicTracks.find((track) => track.id === activeTrack) || musicTracks[0];
  const pageTitle = page === 'games' ? t.pageGames : page === 'photo' ? t.pagePhoto : page === 'music' ? t.pageMusic : page === 'about' ? t.pageAbout : t.pageContact;
  const currentPage = page === 'games' ? 'work' : page;
  return <div className="site-shell functional-shell">
    <header className="site-header is-scrolled functional-header">
      <a className="brand-lockup" href="/" aria-label="回到首页"><span className="brand-orbit" aria-hidden="true" /><span>HAOQI<span className="brand-slash">/</span>STUDIO</span></a>
      <nav className="desktop-nav" aria-label="主导航"><NavigationItems language={language} currentPage={currentPage} /></nav>
      <div className="header-actions"><LanguageSwitcher language={language} setLanguage={setLanguage} /><span className="header-divider" aria-hidden="true">/</span><a className="header-contact" href="/contact.html">{t.contactMe} <span aria-hidden="true">↗</span></a></div>
    </header>
    {page === 'games' ? <Suspense fallback={<div className="archive-page section-light">Loading archive…</div>}><WorkArchive works={gameWorks} language={language} /></Suspense> : <section className="archive-page section-light">
      <div className="page-width archive-page-inner">
        <div className="section-marker"><span>/{page}</span><span>Archive view</span></div>
        <TypewriterHeadline as="h1" className="archive-page-title" markup={pageTitle} />
        {page === 'about' && <div className="about-archive"><div><p className="archive-intro">{t.heroKicker}</p><TypewriterHeadline as="h2" markup={t.aboutTitle} /><p>{t.aboutLarge}</p></div><div className="about-archive-profile"><img src="/assets/haoqi-portrait.jpg" alt="HAOQI portrait" /><span>HAOQI / PRACTICE / 2026</span></div></div>}
        {page === 'games' && <div className="archive-grid">{gameWorks.map((work) => <article className="archive-card" key={work.id}><button className="archive-image-button" type="button" onClick={(event) => openArchive('work', work, event)}><img src={work.image} alt={work.title} /><span>{work.archiveCode} / extract ↗</span></button><small className="archive-code">{work.archiveCode} / {work.type}</small><h2>{work.title}</h2><p>{work.summary}</p><a href={work.downloadUrl}>下载 / 跳转 ↗</a></article>)}</div>}
        {page === 'photo' && <>
          <p className="archive-intro">{t.photoIntro}</p>
          <div className="archive-filters"><span>{t.city}</span>{['all', ...new Set(photoAlbums.map((album) => album.city))].map((value) => <button type="button" className={city === value ? 'is-active' : ''} onClick={() => setCity(value)} key={value}>{value === 'all' ? t.all : value}</button>)}<span>{t.year}</span>{['all', ...new Set(photoAlbums.map((album) => album.year))].map((value) => <button type="button" className={year === value ? 'is-active' : ''} onClick={() => setYear(value)} key={value}>{value === 'all' ? t.all : value}</button>)}</div>
          <div className="archive-grid" key={`${city}-${year}`}>{albums.map((album) => <article className="archive-card" key={album.id}><button className="archive-image-button" type="button" onClick={(event) => openArchive('photo', album, event)}><img src={album.cover} alt={album.title} /><span>{album.archiveCode} / {album.frameCount} frames ↗</span></button><small className="archive-code">{album.archiveCode} / {album.city} / {album.year} · {album.date}</small><h2>{album.title}</h2><p>{album.summary}</p></article>)}</div>
          <div className="archive-map"><div><small>Map inside photography</small><TypewriterHeadline as="h2" className="map-typewriter" markup={t.mapTitle} /><p>{t.mapNote}</p></div><div className="archive-map-shape">{mapCities.map((item) => <button type="button" key={item.city} style={{ left: `${item.x}%`, top: `${item.y}%` }} className={item.count ? 'has-work' : ''}>{item.city}</button>)}</div></div>
        </>}
        {page === 'music' && <div className="music-archive"><div><p className="archive-intro">{t.musicTitle}</p>{musicTracks.map((track) => <button type="button" className={`track-row ${activeTrack === track.id ? 'is-active' : ''}`} onClick={() => setActiveTrack(track.id)} key={track.id}><span>{track.title}</span><small><b className="archive-code">{track.archiveCode}</b> / {track.mood}</small></button>)}</div><aside key={activeTrack}><small>{t.nowPlaying} / <b className="archive-code">{activeMusicTrack.archiveCode}</b></small><h2>{activeMusicTrack.title}</h2><p>{activeMusicTrack.analysis}</p><span>{t.audioPending}</span></aside></div>}
        {page === 'contact' && <div className="archive-contact-grid">{socials.map((item) => <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" key={item.label}><small>{item.label}</small><strong>{item.value}</strong><span>↗</span></a>)}</div>}
      </div>
    </section>}
    {page !== 'games' && <MusicTools language={language} />}
    <ArchiveExtract focus={focus} isClosing={isClosing} onClose={closeArchive} />
  </div>;
}

function HomeArchiveFlow({ language, onOpenArchive }) {
  const [city, setCity] = useState('all');
  const [activeTrack, setActiveTrack] = usePersistentState('haoqi-track', musicTracks[0].id);
  const t = languageText[language] || mixedText;
  const albums = photoAlbums.filter((album) => city === 'all' || album.city === city);
  return <>
    <section id="photo" className="archive-flow section-dark"><div className="page-width archive-flow-inner"><div className="section-marker section-marker-dark"><span>04</span><span>Photography archive</span></div><TypewriterHeadline as="h2" className="archive-flow-typewriter" markup={t.photoTitle} /><div className="archive-filters"><span>{t.city}</span>{['all', ...new Set(photoAlbums.map((album) => album.city))].map((value) => <button type="button" className={city === value ? 'is-active' : ''} onClick={() => setCity(value)} key={value}>{value === 'all' ? t.all : value}</button>)}</div><div className="archive-grid" key={city}>{albums.map((album) => <article className="archive-card" key={album.id}><button className="archive-image-button" type="button" onClick={(event) => onOpenArchive('photo', album, event)}><img src={album.cover} alt={album.title} /><span>{album.archiveCode} / {album.frameCount} frames ↗</span></button><small className="archive-code">{album.archiveCode} / {album.city} / {album.year} · {album.date}</small><h3>{album.title}</h3><p>{album.summary}</p></article>)}</div></div></section>
    <section id="music" className="archive-flow section-light"><div className="page-width archive-flow-inner"><div className="section-marker"><span>05</span><span>Sound studies</span></div><TypewriterHeadline as="h2" className="archive-flow-typewriter" markup={t.musicTitle} /><div className="music-archive"><div>{musicTracks.map((track) => <button type="button" className={`track-row ${activeTrack === track.id ? 'is-active' : ''}`} onClick={() => setActiveTrack(track.id)} key={track.id}><span>{track.title}</span><small><b className="archive-code">{track.archiveCode}</b> / {track.mood}</small></button>)}</div><aside key={activeTrack}><small>{t.nowPlaying} / <b className="archive-code">{(musicTracks.find((track) => track.id === activeTrack) || musicTracks[0]).archiveCode}</b></small><h3>{(musicTracks.find((track) => track.id === activeTrack) || musicTracks[0]).title}</h3><p>{(musicTracks.find((track) => track.id === activeTrack) || musicTracks[0]).analysis}</p><span>{t.audioPending}</span></aside></div></div></section>
  </>;
}

function ContactPage({ language, setLanguage }) {
  const [typedGreeting, setTypedGreeting] = useState('');
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);
  const t = languageText[language] || mixedText;
  const ct = contactText[language] || contactText.mixed;

  useEffect(() => {
    let phraseIndex = 0;
    let index = 0;
    let deleting = false;
    let holdUntil = 0;
    let timer;

    const tick = () => {
      const phrase = contactGreetings[phraseIndex];
      const fullText = `${phrase.prefix}${phrase.name}${phrase.suffix}`;
      if (!deleting && index < fullText.length) {
        index += 1;
        setTypedGreeting(fullText.slice(0, index));
        timer = window.setTimeout(tick, 110);
        return;
      }
      if (!deleting && holdUntil === 0) {
        holdUntil = Date.now() + 2800;
        timer = window.setTimeout(tick, 80);
        return;
      }
      if (!deleting && Date.now() < holdUntil) {
        timer = window.setTimeout(tick, 80);
        return;
      }
      if (!deleting) deleting = true;
      if (index > 0) {
        index -= 1;
        setTypedGreeting(fullText.slice(0, index));
        timer = window.setTimeout(tick, 52);
        return;
      }
      deleting = false;
      holdUntil = 0;
      phraseIndex = (phraseIndex + 1) % contactGreetings.length;
      setActivePhraseIndex(phraseIndex);
      timer = window.setTimeout(tick, 360);
    };

    tick();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="contact-page">
      <header className="contact-page-header">
        <a className="brand-lockup" href="/" aria-label="返回首页"><span className="brand-orbit" aria-hidden="true" /><span>HAOQI<span className="brand-slash">/</span>STUDIO</span></a>
        <div className="contact-page-actions"><span className="header-divider" aria-hidden="true">/</span><LanguageSwitcher language={language} setLanguage={setLanguage} /><a className="contact-back" href="/">{t.backTop} <span aria-hidden="true">↗</span></a></div>
      </header>
      <main className="contact-page-main">
        <div className="contact-page-label">{ct.label}</div>
        <div className="contact-page-grid">
          <div className="contact-page-copy">
            <p className="section-kicker">{ct.kicker}</p>
            <h1 className="contact-greeting">
              {(() => {
                const phrase = contactGreetings[activePhraseIndex];
                const prefix = typedGreeting.slice(0, phrase.prefix.length);
                const nameStart = phrase.prefix.length;
                const name = typedGreeting.slice(nameStart, nameStart + phrase.name.length);
                const suffixStart = nameStart + phrase.name.length;
                const suffix = typedGreeting.slice(suffixStart, suffixStart + phrase.suffix.length);
                const isPrefixTyping = typedGreeting.length <= phrase.prefix.length;
                return (
                  <>
                    <span className="contact-greeting-prefix"><span className="contact-typed-fragment">{prefix}</span></span>
                    <span className="contact-greeting-second-line"><span className="contact-typed-fragment"><em>{name}</em>{suffix}</span></span>
                  </>
                );
              })()}
            </h1>
            <p className="contact-page-intro">{ct.intro}<br />{ct.message}</p>
            <div className="contact-page-links">
              <a href="mailto:1370228191@qq.com"><span>{ct.email}</span><strong>1370228191@qq.com</strong><i aria-hidden="true">↗</i></a>
              <a href="https://space.bilibili.com/65369165?spm_id_from=333.1387.0.0" target="_blank" rel="noreferrer"><span><SocialIcon service="bilibili" />{ct.bilibili}</span><strong>{t.nav[4] === 'Контакты' ? 'Моя страница Bilibili' : language === 'en' ? 'My Bilibili page' : language === 'ja' ? 'Bilibili ページ' : language === 'zh' ? '我的 B 站首页' : '我的 B 站首页'}</strong><i aria-hidden="true">↗</i></a>
              <a href="https://github.com/HaoQI-HAQ" target="_blank" rel="noreferrer"><span><SocialIcon service="github" />GitHub</span><strong>HaoQI-HAQ</strong><i aria-hidden="true">↗</i></a>
              <div className="contact-social-pair">
                <a href="https://x.com/HAOQIHAQ" target="_blank" rel="noreferrer"><span><SocialIcon service="x" />X / Twitter</span><strong>@HAOQIHAQ</strong><i aria-hidden="true">↗</i></a>
                <a href="https://www.instagram.com/qitongwei0001/" target="_blank" rel="noreferrer"><span><SocialIcon service="instagram" />Instagram</span><strong>@qitongwei0001</strong><i aria-hidden="true">↗</i></a>
              </div>
            </div>
          </div>
          <div className="contact-page-portrait"><img src="/assets/haoqi-portrait.jpg" alt="HAOQI portrait" /><span className="portrait-tag">{ct.portrait}</span></div>
        </div>
      </main>
      <footer className="contact-page-footer"><span>Available for selected collaborations / 2026</span><span>25° 02' N / 121° 32' E</span></footer>
    </div>
  );
}

function App({ language, setLanguage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const cursorRef = useRef(null);
  const { focus, isClosing, openArchive, closeArchive } = useArchiveExtract();
  const t = languageText[language] || mixedText;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const time = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date());
      setCurrentTime(time.replace(':', ' : '));
    };

    updateTime();
    const timer = window.setInterval(updateTime, 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll('[data-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );

    revealNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return undefined;

    const handlePointerMove = (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const handlePointerDown = () => cursor.classList.add('is-pressed');
    const handlePointerUp = () => cursor.classList.remove('is-pressed');

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <BootSequence />
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
      <header className={`site-header ${menuOpen ? 'menu-is-open' : ''} ${isScrolled ? 'is-scrolled' : ''}`}>
        <a className="brand-lockup" href="#top" onClick={closeMenu} aria-label="回到首页">
          <span className="brand-orbit" aria-hidden="true" />
          <span>HAOQI<span className="brand-slash">/</span>STUDIO</span>
        </a>
      <nav className="desktop-nav" aria-label="主导航"><NavigationItems language={language} currentPage="home" /></nav>
        <div className="header-actions"><LanguageSwitcher language={language} setLanguage={setLanguage} /><span className="header-divider" aria-hidden="true">/</span><a className="header-contact" href="/contact.html">{t.contactMe} <span aria-hidden="true">↗</span></a></div>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
          <span className="menu-icon" aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="mobile-nav" className="mobile-nav" aria-label="移动端导航">
          <NavigationItems language={language} currentPage="home" onNavigate={closeMenu} mobile />
          <div className="mobile-language"><span>/</span><LanguageSwitcher language={language} setLanguage={setLanguage} /></div>
        </nav>
      </header>

      <main>
        <section id="top" className="hero-section">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/hero-poster.png"
            aria-hidden="true"
          >
            <source src="https://videos.pexels.com/video-files/3129977/3129977-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div className="hero-noise" aria-hidden="true" />
          <div className="hero-vignette" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-inner page-width">
            <div className="hero-topline">
              <span>Independent practice / 2026</span>
              <span className="hero-topline-status"><i /> {t.status}</span>
            </div>
            <div className="hero-content">
              <p className="eyebrow">{t.heroKicker}</p>
              <TypewriterHeadline as="h1" className="hero-typewriter" markup={t.heroTitle} stripPunctuation />
              <div className="hero-bottomline">
                <a className="round-link" href="/work.html" aria-label="进入游戏作品档案">
                  <span>{t.explore}</span>
                  <span className="round-link-arrow" aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
            <div className="hero-footer">
              <span>25° 02' N / 121° 32' E</span>
              <span>{currentTime || '— : —'} / UTC+8</span>
              <span className="hero-footer-scroll">{t.scroll} <span aria-hidden="true">↓</span></span>
            </div>
          </div>
        </section>

        <section id="about" className="about-section section-light">
          <div className="page-width about-layout">
            <div className="section-marker" data-reveal><span>01</span><span>{t.aboutMarker}</span></div>
            <div className="about-copy" data-reveal>
              <p className="section-kicker">{t.aboutKicker}</p>
              <TypewriterHeadline as="h2" className="about-typewriter" markup={t.aboutTitle} />
              <p className="large-copy">{t.aboutLarge}</p>
              <p className="body-copy">{t.aboutBody}</p>
              <div className="about-links">
                <a href="mailto:1370228191@qq.com">1370228191@qq.com <span aria-hidden="true">↗</span></a>
                <a href="/contact.html">{t.openContact} <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <div className="profile-column" data-reveal>
              <div className="profile-card">
                <div className="profile-scanline" aria-hidden="true" />
                <img className="profile-image" src="/assets/haoqi-portrait.jpg" alt="浩祈个人头像" />
                <div className="profile-overlay" aria-hidden="true" />
                <div className="profile-coordinates">HAOQI<br />PRACTICE / 2026</div>
                <div className="profile-caption">Game design / visual<br />sound studies</div>
              </div>
              <div className="profile-note"><span>{t.currently}</span><strong>{t.playable}</strong></div>
            </div>
          </div>
          <div className="stats-row page-width" data-reveal>
            <div className="stat-item"><strong>03</strong><span>{t.disciplines}</span></div>
            <div className="stat-item"><strong>∞</strong><span>{t.iterations}</span></div>
            <div className="stat-item"><strong>01</strong><span>{t.practice}</span></div>
            <div className="stats-note" dangerouslySetInnerHTML={{ __html: t.statsNote }} />
          </div>
        </section>

        <section id="work" className="work-section section-dark">
          <div className="page-width">
            <div className="section-heading-row" data-reveal>
              <div className="section-marker section-marker-dark"><span>02</span><span>{t.selectedWork}</span></div>
              <p className="section-note" dangerouslySetInnerHTML={{ __html: t.selectedNote }} />
            </div>
            <div className="work-intro" data-reveal>
              <TypewriterHeadline as="h2" className="work-typewriter" markup={t.workIntro} />
              <span className="work-count">[ 03 / 03 ]</span>
            </div>
            <div className="project-grid">
              {projectItems.map((project) => (
                <article className={`project-card ${project.tone}`} key={project.number} data-reveal>
                  <button className="project-image-wrap" type="button" onClick={(event) => openArchive('work', project, event)} aria-label={`打开项目档案 ${project.title}`}>
                    <img src={project.image} alt={project.title} />
                    <div className="project-image-overlay" />
                    <span className="project-open" aria-hidden="true">↗</span>
                  </button>
                  <div className="project-meta">
                    <span className="project-number archive-code">{project.archiveCode}</span>
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.subtitle}</p>
                      <small>{project.detail}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="work-footer" data-reveal><span>{t.archiveProgress}</span><a href="#contact">{t.viewNotes} <span aria-hidden="true">↗</span></a></div>
          </div>
        </section>

          <section id="capabilities" className="capabilities-section section-light">
          <div className="page-width">
            <div className="section-heading-row" data-reveal>
              <div className="section-marker"><span>03</span><span>{t.capabilities}</span></div>
              <p className="section-note" dangerouslySetInnerHTML={{ __html: t.capabilitiesNote }} />
            </div>
            <div className="capability-lead" data-reveal>
              <p className="section-kicker">{t.capabilitiesKicker}</p>
              <TypewriterHeadline as="h2" className="capabilities-typewriter" markup={t.capabilitiesTitle} />
            </div>
            <div className="capability-grid">
              {capabilityItems.map((item) => (
                <article className="capability-card" key={item.index} data-reveal>
                  <div className="capability-top"><span>{item.index}</span><span className="capability-plus" aria-hidden="true">+</span></div>
                  <div className="capability-title"><h3>{item.title}</h3><span>{item.chinese}</span></div>
                  <p>{item.body}</p>
                  <div className="tag-list">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </article>
              ))}
            </div>
          </div>
          </section>

          <HomeArchiveFlow language={language} onOpenArchive={openArchive} />

          <section id="contact" className="contact-section section-dark">
          <div className="contact-orbit contact-orbit-a" aria-hidden="true" />
          <div className="contact-orbit contact-orbit-b" aria-hidden="true" />
          <div className="page-width contact-inner">
            <div className="section-marker section-marker-dark" data-reveal><span>06</span><span>{t.contactTitle}</span></div>
            <div className="contact-content" data-reveal>
              <p className="section-kicker">{t.contactKicker}</p>
              <TypewriterHeadline as="h2" className="contact-typewriter" markup={t.contactHeading} />
              <a className="contact-email" href="mailto:1370228191@qq.com">1370228191@qq.com <span aria-hidden="true">↗</span></a>
            </div>
            <div className="contact-footer" data-reveal>
              <span>{t.contactFooter}</span>
              <div className="contact-footer-links"><a href="#top">{t.backTop} <span aria-hidden="true">↑</span></a><a href="https://github.com/HaoQI-HAQ/haoqi_solo_WebBlog" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a></div>
            </div>
          </div>
        </section>
      </main>
      <ArchiveExtract focus={focus} isClosing={isClosing} onClose={closeArchive} />
    </div>
  );
}

const route = window.location.pathname.split('/').pop() || 'index.html';
const pageByRoute = { 'about.html': 'about', 'work.html': 'games', 'photography.html': 'photo', 'music.html': 'music' };

function SiteRouter() {
  const [language, setLanguage] = usePersistentState('haoqi-language', 'mixed');
  useEffect(() => {
    document.documentElement.lang = language === 'mixed' ? 'zh-CN' : language;
    document.documentElement.dataset.language = language;
  }, [language]);
  if (route === 'contact.html') return <ContactPage language={language} setLanguage={setLanguage} />;
  if (pageByRoute[route]) return <FunctionalPage page={pageByRoute[route]} language={language} setLanguage={setLanguage} />;
  return <App language={language} setLanguage={setLanguage} />;
}

createRoot(document.getElementById('root')).render(<SiteRouter />);
