import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { emitSiteSound } from '../audio/siteSoundEvents.js';
import './game-project.css';

const labels = {
  mixed: { all: '全部', artwork: '宣传图', screenshot: '实机截图', poster: '海报', icon: '图标', store: '前往 TapTap', demo: '观看 B 站演示', enlarge: '放大查看', close: '关闭大图', previous: '上一张', next: '下一张', gallery: '作品影像' },
  zh: { all: '全部', artwork: '宣传图', screenshot: '实机截图', poster: '海报', icon: '图标', store: '前往 TapTap', demo: '观看 B 站演示', enlarge: '放大查看', close: '关闭大图', previous: '上一张', next: '下一张', gallery: '作品影像' },
  en: { all: 'All', artwork: 'Artwork', screenshot: 'Gameplay', poster: 'Poster', icon: 'Icon', store: 'View on TapTap', demo: 'Watch on Bilibili', enlarge: 'Enlarge image', close: 'Close image', previous: 'Previous image', next: 'Next image', gallery: 'Project images' },
  ja: { all: 'すべて', artwork: '宣伝画像', screenshot: 'ゲーム画面', poster: 'ポスター', icon: 'アイコン', store: 'TapTap で見る', demo: 'Bilibili で見る', enlarge: '画像を拡大', close: '画像を閉じる', previous: '前の画像', next: '次の画像', gallery: '作品画像' },
  ru: { all: 'Все', artwork: 'Промо', screenshot: 'Геймплей', poster: 'Постер', icon: 'Иконка', store: 'Открыть TapTap', demo: 'Смотреть Bilibili', enlarge: 'Увеличить', close: 'Закрыть', previous: 'Предыдущее', next: 'Следующее', gallery: 'Изображения проекта' },
};

function Arrow({ direction = 'out' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={direction === 'left' ? 'M20 12H4m6-6-6 6 6 6' : direction === 'right' ? 'M4 12h16m-6-6 6 6-6 6' : 'M5 19 19 5M5 5h14v14'} /></svg>;
}

function ImageViewer({ frames, index, onChange, onClose, copy, title }) {
  const dialog = useRef(null);
  const frame = frames[index];
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  return createPortal(<dialog className="game-image-viewer" ref={dialog} aria-label={`${title} · ${copy.enlarge}`}
    onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={(event) => {
      event.stopPropagation();
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); const direction = event.key === 'ArrowRight' ? 1 : -1; onChange(index + direction, direction); }
    }}>
    <button className="game-viewer-close" type="button" onClick={onClose} autoFocus>{copy.close}<span aria-hidden="true">×</span></button>
    <img src={frame.src} alt={frame.caption} width={frame.width} height={frame.height} />
    <div className="game-viewer-controls"><button type="button" onClick={() => onChange(index - 1, -1)} aria-label={copy.previous} disabled={frames.length < 2}><Arrow direction="left" /></button><p aria-live="polite">{frame.caption}<span>{index + 1} / {frames.length}</span></p><button type="button" onClick={() => onChange(index + 1, 1)} aria-label={copy.next} disabled={frames.length < 2}><Arrow direction="right" /></button></div>
  </dialog>, document.body);
}

function GameGallery({ work, copy }) {
  const [category, setCategory] = useState('all');
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const expandedState = useRef(false);
  const frames = work.gallery.filter((frame) => category === 'all' || frame.kind === category);
  const frame = frames[index];
  const categories = ['all', 'screenshot', 'artwork', 'poster', 'icon'].filter((kind) => kind === 'all' || work.gallery.some((image) => image.kind === kind));
  const changeImage = (value, direction = value > index ? 1 : -1) => {
    const next = (value + frames.length) % frames.length;
    if (next === index) return;
    emitSiteSound(direction > 0 ? 'gallery-next' : 'gallery-prev', direction > 0 ? 0.25 : -0.25);
    setIndex(next);
  };
  const chooseCategory = kind => {
    if (kind === category && index === 0) return;
    emitSiteSound('filter');
    setCategory(kind);
    setIndex(0);
  };
  const showImage = () => {
    if (expandedState.current) return;
    expandedState.current = true;
    emitSiteSound('page-open');
    setExpanded(true);
  };
  const closeImage = () => {
    if (!expandedState.current) return;
    expandedState.current = false;
    emitSiteSound('page-close');
    setExpanded(false);
  };
  return <div className="game-gallery" role="group" aria-label={`${work.title} · ${copy.gallery}`}>
    <div className="game-gallery-filters" aria-label={copy.gallery}>{categories.map((kind) => <button type="button" key={kind} aria-pressed={category === kind} onClick={() => chooseCategory(kind)}>{copy[kind]}</button>)}</div>
    <button type="button" className="game-gallery-image" onClick={showImage} aria-label={`${copy.enlarge}: ${frame.caption}`}>
      <img src={frame.src} alt={frame.caption} width={frame.width} height={frame.height} loading="lazy" decoding="async" />
      <span>{copy.enlarge}<Arrow /></span>
    </button>
    <div className="game-gallery-navigation"><button type="button" onClick={() => changeImage(index - 1, -1)} aria-label={copy.previous} disabled={frames.length < 2}><Arrow direction="left" /></button><p aria-live="polite">{frame.caption}<span>{String(index + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}</span></p><button type="button" onClick={() => changeImage(index + 1, 1)} aria-label={copy.next} disabled={frames.length < 2}><Arrow direction="right" /></button></div>
    <div className="game-gallery-thumbnails" aria-label={copy.gallery}>{frames.map((image, position) => <button type="button" key={image.src} aria-label={image.caption} aria-pressed={index === position} onClick={() => changeImage(position)}><img src={image.thumbnail} alt="" loading="lazy" decoding="async" width="110" height="70" /></button>)}</div>
    {expanded && <ImageViewer frames={frames} index={index} onChange={changeImage} onClose={closeImage} copy={copy} title={work.title} />}
  </div>;
}

export default function GameProject({ work, language, showTitle = false }) {
  const copy = labels[language] || labels.mixed;
  return <div className="game-project">
    <div className="game-project-copy">
      <div className="game-project-identity"><img className="game-project-icon" src={work.icon} alt={`${work.title} · ${copy.icon}`} width="88" height="88" loading="lazy" decoding="async" /><div>{showTitle && <h3>{work.title}</h3>}<p>{work.type}</p></div></div>
      <p className="game-project-summary">{work.summary}</p>
      {work.description?.map((paragraph) => <p className="game-project-description" key={paragraph}>{paragraph}</p>)}
      <ul className="game-project-features">{work.features?.map((feature) => <li key={feature}>{feature}</li>)}</ul>
      <div className="game-project-links"><a className="game-project-store" href={work.storeUrl} target="_blank" rel="noreferrer">{copy.store}<Arrow /></a>{work.bilibiliUrl && <a href={work.bilibiliUrl} target="_blank" rel="noreferrer">{copy.demo}<Arrow /></a>}</div>
    </div>
    <GameGallery work={work} copy={copy} />
  </div>;
}
