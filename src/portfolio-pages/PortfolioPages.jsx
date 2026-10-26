import React, { useLayoutEffect, useRef, useState } from 'react';
import { Photography, Music } from './PhotoMusic.jsx';
import { Contact, About } from './ContactAbout.jsx';
import { enterPage } from './motion.js';
import './portfolio-pages.css';

const components = { photo: Photography, music: Music, contact: Contact, about: About };
const labels = {
  mixed: { home: '返回首页', work: '进入 Work 档案', full: '动态 / 完整', reduced: '动态 / 简化' },
  zh: { home: '返回首页', work: '进入作品档案', full: '动态 / 完整', reduced: '动态 / 简化' },
  en: { home: 'Back home', work: 'Explore Work', full: 'Motion / Full', reduced: 'Motion / Reduced' },
  ja: { home: 'ホームへ', work: '作品を見る', full: '動き / 完全', reduced: '動き / 控えめ' },
  ru: { home: 'На главную', work: 'Смотреть работы', full: 'Анимация / Полная', reduced: 'Анимация / Мягкая' },
};

export default function PortfolioPages({ page, language, header }) {
  const [motion, setMotion] = useState(true);
  const stage = useRef(null);
  const Page = components[page];
  const dark = page === 'music' || page === 'contact';
  const text = labels[language] || labels.mixed;

  useLayoutEffect(() => {
    document.documentElement.dataset.motion = motion ? 'full' : 'reduced';
    const cancel = enterPage(stage.current, page === 'photo' ? 'photography' : page, motion);
    return () => { cancel(); delete document.documentElement.dataset.motion; };
  }, [page, language, motion]);

  return <div className={`site-shell portfolio-pages ${dark ? 'is-dark' : ''}`} data-motion={motion ? 'full' : 'reduced'} data-page={page}>
    {header}
    <main ref={stage} className="portfolio-pages-content"><Page motion={motion} language={language} /></main>
    <footer className="portfolio-footer">
      <a href="/">{text.home}</a>
      <button type="button" onClick={() => setMotion(value => !value)} aria-pressed={motion} data-site-sound="ui-tick" data-site-sound-repeat="true" className="portfolio-motion">{motion ? text.full : text.reduced}</button>
      <a href="/work.html">{text.work} <span aria-hidden="true">↗</span></a>
    </footer>
  </div>;
}
