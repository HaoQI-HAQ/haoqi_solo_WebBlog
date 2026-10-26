import React from 'react';
import './not-found.css';

const copy = {
  mixed: { label: 'ARCHIVE / PAGE NOT FOUND', title: '这一页，暂时不在档案里。', body: '链接可能已经移动，或地址有误。回到首页，或者从作品档案继续探索。', home: '返回首页', work: '浏览作品' },
  zh: { label: '档案 / 页面未找到', title: '这一页，暂时不在档案里。', body: '链接可能已经移动，或地址有误。回到首页，或者从作品档案继续探索。', home: '返回首页', work: '浏览作品' },
  en: { label: 'ARCHIVE / PAGE NOT FOUND', title: 'This page is outside the archive.', body: 'The link may have moved, or the address may be incorrect. Return home or keep exploring the work archive.', home: 'Back to home', work: 'Explore work' },
  ja: { label: 'アーカイブ / ページが見つかりません', title: 'このページは見つかりませんでした。', body: 'リンク先が移動したか、アドレスが間違っている可能性があります。ホームまたは作品アーカイブをご覧ください。', home: 'ホームへ', work: '作品を見る' },
  ru: { label: 'АРХИВ / СТРАНИЦА НЕ НАЙДЕНА', title: 'Этой страницы нет в архиве.', body: 'Возможно, ссылка изменилась или в адресе есть ошибка. Вернитесь на главную или откройте архив работ.', home: 'На главную', work: 'Смотреть работы' },
};

export default function NotFound({ language = 'mixed', header }) {
  const text = copy[language] || copy.mixed;
  return <div className="site-shell not-found-page">
    {header}
    <main className="not-found-main" id="main-content">
      <p className="not-found-eyebrow">{text.label}</p>
      <p className="not-found-number" aria-hidden="true">4<span>0</span>4</p>
      <h1>{text.title}</h1>
      <p className="not-found-description">{text.body}</p>
      <nav className="not-found-actions" aria-label={text.label}>
        <a href="/">{text.home}<span aria-hidden="true">↗</span></a>
        <a href="/work.html">{text.work}<span aria-hidden="true">→</span></a>
      </nav>
    </main>
    <footer className="not-found-footer">HAOQI / STUDIO <span>PLAY, IMAGE &amp; SOUND.</span></footer>
  </div>;
}
