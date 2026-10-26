import React, { useEffect, useRef, useState } from 'react';
import { mediaBase } from '../content.deploy.js';
import { contactAboutCopy } from './contact-about-copy.js';
import AboutInterests from './AboutInterests.jsx';
import GameCollection from './GameCollection.jsx';
import { emitSiteSound } from '../audio/siteSoundEvents.js';
import './contact-about.css';

const email = '1370228191@qq.com';
const photo = new URL('./panorama.webp', import.meta.url).href;
const media = path => path.startsWith('/media/') ? `${mediaBase}${path}` : path;
const game = media('/media/games/work-04-paoyong/promotion-landscape.webp');
const album = media('/media/work-archive/covers/sound-06.webp');

function Arrow({ diagonal = false }) {
  return <svg className="ca-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16M13 5l7 7-7 7'} /></svg>;
}

function CopyIcon({ checked = false }) {
  return <svg className="ca-copy-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">{checked ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="11" height="12" rx="1" /><path d="M15 8V4H4v12h4" /></>}</svg>;
}

export function Contact({ motion = true, language = 'mixed' }) {
  const t = (contactAboutCopy[language] || contactAboutCopy.mixed).contact;
  const [topic, setTopic] = useState(0);
  const [copyState, setCopyState] = useState('idle');
  const emailRef = useRef(null);
  const copyTask = useRef(0);
  const resetTimer = useRef(null);
  useEffect(() => () => {
    copyTask.current += 1;
    clearTimeout(resetTimer.current);
  }, []);

  function selectEmail() {
    if (!emailRef.current || !window.getSelection) return;
    const range = document.createRange();
    range.selectNodeContents(emailRef.current);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function copyEmail() {
    const task = ++copyTask.current;
    clearTimeout(resetTimer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(email);
      if (task !== copyTask.current) return;
      emitSiteSound('copy-success');
      setCopyState('copied');
      resetTimer.current = setTimeout(() => setCopyState('idle'), 3000);
    } catch {
      if (task !== copyTask.current) return;
      selectEmail();
      setCopyState('manual');
    }
  }

  const subject = t.subjects[topic];
  const copyLabel = copyState === 'copied' ? t.copied : copyState === 'manual' ? t.manual : t.copy;

  return <section className="ca-contact" data-language={language} data-motion={motion ? 'full' : 'reduced'}>
    <header className="ca-contact-heading">
      <h1 data-enter="title">{t.title}</h1>
      <div className="ca-contact-intro" data-enter="copy"><p>{t.intro}</p><span>{t.roles}</span></div>
    </header>

    <section className="ca-contact-main" aria-label={t.direct} data-enter="media">
      <a className="ca-email" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}><span ref={emailRef}>{email}</span></a>
      <div className="ca-contact-actions">
        <a className="ca-primary" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}>{t.send}<Arrow diagonal /></a>
        <button className="ca-copy-button" type="button" onClick={copyEmail} data-state={copyState} aria-label={copyLabel}>
          <span className="ca-copy-labels" aria-hidden="true"><span data-show={copyState === 'idle'}>{t.copy}</span><span data-show={copyState === 'copied'}>{t.copied}</span><span data-show={copyState === 'manual'}>{t.manual}</span></span>
          <CopyIcon checked={copyState === 'copied'} />
        </button>
        <span className="ca-sr-only" role="status">{copyState === 'idle' ? '' : copyLabel}</span>
      </div>
    </section>

    <section className="ca-contact-topics" aria-labelledby="ca-contact-topic-title" data-enter="copy">
      <h2 id="ca-contact-topic-title">{t.topicTitle}</h2>
      <div className="ca-topic-options" role="group" aria-label={t.topicGroup}>
        <span className="ca-topic-marker" aria-hidden="true" style={{ transform: `translateX(${topic * 100}%)` }} />
        {t.topics.map((label, index) => <button key={index} type="button" className="ca-topic" data-site-sound="filter" aria-pressed={topic === index} onClick={() => setTopic(index)}><span>{label}</span><Arrow diagonal /></button>)}
      </div>
      <p className="ca-subject" aria-live="polite">{t.subjectLabel}{subject}</p>
    </section>

    <section className="ca-contact-socials" aria-label={t.socials} data-enter="copy">
      <p>{t.findMe}</p>
      <div>{[
        ['Bilibili', 'https://space.bilibili.com/65369165'],
        ['GitHub', 'https://github.com/HaoQI-HAQ'],
        ['X', 'https://x.com/HAOQIHAQ'],
        ['Instagram', 'https://www.instagram.com/qitongwei0001/'],
      ].map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label}<Arrow diagonal /></a>)}</div>
    </section>
    <footer className="ca-contact-signature" data-enter="title">HAOQI <span>/</span> STUDIO</footer>
  </section>;
}

const practiceMedia = [
  { image: game, imageClass: 'ca-practice-game', href: '/work.html' },
  { image: photo, imageClass: 'ca-practice-photo', href: '/photography.html' },
  { image: album, imageClass: 'ca-practice-music', href: '/music.html' },
];

export function About({ motion = true, language = 'mixed' }) {
  const t = (contactAboutCopy[language] || contactAboutCopy.mixed).about;
  const practices = t.practices.map((item, index) => ({ ...item, ...practiceMedia[index] }));
  const [selected, setSelected] = useState(0);
  const controls = useRef([]);
  const practice = practices[selected];

  function choosePractice(index) {
    if (index === selected) return;
    emitSiteSound('filter', index > selected ? 0.2 : -0.2);
    setSelected(index);
  }

  function navigatePractice(event, index) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? practices.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + practices.length) % practices.length;
    choosePractice(next);
    controls.current[next]?.focus();
  }

  return <section className="ca-about" data-language={language} data-motion={motion ? 'full' : 'reduced'}>
    <AboutInterests language={language} />

    <GameCollection language={language} motion={motion} />

    <section className="ca-practice" aria-label={t.practiceLabel}>
      <div className="ca-practice-control" data-enter="copy">
        <h2>{t.heading[0]}<br />{t.heading[1]}</h2>
        <div className="ca-practice-options" role="group" aria-label={t.choosePractice}>
          {practices.map((item, index) => <button type="button" key={index} ref={node => { controls.current[index] = node; }} className="ca-practice-option" aria-pressed={selected === index} onKeyDown={event => navigatePractice(event, index)} onClick={() => choosePractice(index)}><span>{item.title}</span><Arrow /></button>)}
        </div>
        <div className="ca-practice-copy" aria-live="polite"><p className="ca-practice-statement">{practice.statement}</p><p>{practice.description}</p><a className="ca-practice-link" href={practice.href}>{practice.link}<Arrow diagonal /></a></div>
      </div>
      <figure className="ca-practice-media" data-enter="media">
        <div className="ca-practice-stage" data-kind={selected}>
          {practices.map((item, index) => <img key={index} className={`ca-practice-image ${item.imageClass}`} data-active={selected === index} src={item.image} alt={item.alt} aria-hidden={selected !== index} width={index === 2 ? '512' : '1920'} height={index === 2 ? '512' : '1080'} />)}
        </div>
        <figcaption>{practice.caption}</figcaption>
      </figure>
    </section>

    <footer className="ca-about-footer" data-enter="copy"><p>{t.invitation}</p><a href="/contact.html">{t.contactLink}<Arrow diagonal /></a></footer>
  </section>;
}
