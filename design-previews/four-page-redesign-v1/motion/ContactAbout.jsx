import React, { useEffect, useRef, useState } from 'react';
import './contact-about.css';

const email = '1370228191@qq.com';
const topics = ['游戏', '视觉', '音乐', '其他'];
const photo = new URL('./panorama.webp', import.meta.url).href;
const game = '/media/games/work-04-paoyong/promotion-landscape.webp';
const album = '/media/work-archive/covers/sound-06.webp';

function Arrow({ diagonal = false }) {
  return <svg className="ca-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16M13 5l7 7-7 7'} /></svg>;
}

function CopyIcon({ checked = false }) {
  return <svg className="ca-copy-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">{checked ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="11" height="12" rx="1" /><path d="M15 8V4H4v12h4" /></>}</svg>;
}

export function Contact({ motion = true }) {
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
      setCopyState('copied');
      resetTimer.current = setTimeout(() => setCopyState('idle'), 3000);
    } catch {
      if (task !== copyTask.current) return;
      selectEmail();
      setCopyState('manual');
    }
  }

  const subject = `与浩祈聊聊${topics[topic] === '其他' ? '一个想法' : `${topics[topic]}合作`}`;
  const copyLabel = copyState === 'copied' ? '邮箱已复制' : copyState === 'manual' ? '已选中，请手动复制' : '复制邮箱';

  return <main className="ca-contact" data-motion={motion ? 'full' : 'reduced'}>
    <header className="ca-contact-heading">
      <h1 data-enter="title">Contact</h1>
      <div className="ca-contact-intro" data-enter="copy"><p>聊聊你的下一个作品。</p><span>游戏策划、视觉设计、AI 编曲。</span></div>
    </header>

    <section className="ca-contact-main" aria-label="直接联系" data-enter="media">
      <a className="ca-email" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}><span ref={emailRef}>{email}</span></a>
      <div className="ca-contact-actions">
        <a className="ca-primary" href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}>发送邮件<Arrow diagonal /></a>
        <button className="ca-copy-button" type="button" onClick={copyEmail} data-state={copyState} aria-label={copyLabel}>
          <span className="ca-copy-labels" aria-hidden="true"><span data-show={copyState === 'idle'}>复制邮箱</span><span data-show={copyState === 'copied'}>邮箱已复制</span><span data-show={copyState === 'manual'}>已选中，请手动复制</span></span>
          <CopyIcon checked={copyState === 'copied'} />
        </button>
        <span className="ca-sr-only" role="status">{copyState === 'idle' ? '' : copyLabel}</span>
      </div>
    </section>

    <section className="ca-contact-topics" aria-labelledby="ca-contact-topic-title" data-enter="copy">
      <h2 id="ca-contact-topic-title">想聊些什么？</h2>
      <div className="ca-topic-options" role="group" aria-label="邮件主题">
        <span className="ca-topic-marker" aria-hidden="true" style={{ transform: `translateX(${topic * 100}%)` }} />
        {topics.map((label, index) => <button key={label} type="button" className="ca-topic" aria-pressed={topic === index} onClick={() => setTopic(index)}><span>{label}</span><Arrow diagonal /></button>)}
      </div>
      <p className="ca-subject" aria-live="polite">邮件主题：{subject}</p>
    </section>

    <section className="ca-contact-socials" aria-label="社交主页" data-enter="copy">
      <p>也可以在这里找到我</p>
      <div>{[
        ['Bilibili', 'https://space.bilibili.com/65369165'],
        ['GitHub', 'https://github.com/HaoQI-HAQ'],
        ['X', 'https://x.com/HAOQIHAQ'],
        ['Instagram', 'https://www.instagram.com/qitongwei0001/'],
      ].map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label}<Arrow diagonal /></a>)}</div>
    </section>
    <footer className="ca-contact-signature" data-enter="title">HAOQI <span>/</span> STUDIO</footer>
  </main>;
}

const practices = [
  { title: '玩法', statement: '把有趣的规则，变成可游玩的体验。', description: '从核心循环到关卡节奏，关注玩家怎样理解规则、做出选择，再走进一个世界。', image: game, alt: '《泡涌》蓝色水母与水下遗迹宣传视觉', imageClass: 'ca-practice-game', caption: '泡涌 · 游戏作品', link: '查看游戏作品', href: '/work.html' },
  { title: '影像', statement: '用镜头收藏路过的世界。', description: '在地点、光线和画面之间寻找叙事。阳朔的山与河，是一次真实行走留下的片段。', image: photo, alt: '阳朔相公山日落与漓江全景', imageClass: 'ca-practice-photo', caption: '阳朔 · 2026.08.27', link: '进入摄影画册', href: '#photography' },
  { title: '声音', statement: '让情绪，在旋律中发生。', description: '从聆听中理解旋律、编排与叙事。这里收录的是音乐收藏与分析，保留原作品和艺人的署名。', image: album, alt: 'Nujabes feat. Shing02 的 Luv(sic) Hexalogy 专辑封面', imageClass: 'ca-practice-music', caption: 'Luv(sic) Hexalogy · Nujabes feat. Shing02 · 音乐收藏', link: '进入私人聆听室', href: '#music' },
];

export function About({ motion = true }) {
  const [selected, setSelected] = useState(0);
  const controls = useRef([]);
  const practice = practices[selected];

  function navigatePractice(event, index) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? practices.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + practices.length) % practices.length;
    setSelected(next);
    controls.current[next]?.focus();
  }

  return <main className="ca-about" data-motion={motion ? 'full' : 'reduced'}>
    <header className="ca-about-hero">
      <div className="ca-about-intro">
        <h1 data-enter="title">HAOQI</h1>
        <div className="ca-about-identity" data-enter="copy"><h2>我是浩祈</h2><p>游戏策划 · 视觉设计 · AI 编曲</p></div>
        <p className="ca-about-statement" data-enter="copy">我在玩法、影像与声音之间工作。<br />让一个想法，拥有自己的气候、<br className="ca-desktop-break" />节奏和入口。</p>
      </div>
      <div className="ca-about-hero-media" data-enter="media">
        <img className="ca-about-game-image" src={game} alt="《泡涌》游戏宣传图" width="1672" height="941" />
        <img className="ca-about-photo-strip" src={photo} alt="阳朔日落全景局部" width="1920" height="780" />
      </div>
    </header>

    <section className="ca-practice" aria-label="我的三个创作方向">
      <div className="ca-practice-control" data-enter="copy">
        <h2>同一个想法，<br />不同的入口。</h2>
        <div className="ca-practice-options" role="group" aria-label="选择创作方向">
          {practices.map((item, index) => <button type="button" key={item.title} ref={node => { controls.current[index] = node; }} className="ca-practice-option" aria-pressed={selected === index} onKeyDown={event => navigatePractice(event, index)} onClick={() => setSelected(index)}><span>{item.title}</span><Arrow /></button>)}
        </div>
        <div className="ca-practice-copy" aria-live="polite"><p className="ca-practice-statement">{practice.statement}</p><p>{practice.description}</p><a className="ca-practice-link" href={practice.href}>{practice.link}<Arrow diagonal /></a></div>
      </div>
      <figure className="ca-practice-media" data-enter="media">
        <div className="ca-practice-stage" data-kind={selected}>
          {practices.map((item, index) => <img key={item.title} className={`ca-practice-image ${item.imageClass}`} data-active={selected === index} src={item.image} alt={item.alt} aria-hidden={selected !== index} width={index === 2 ? '512' : '1920'} height={index === 2 ? '512' : '1080'} />)}
        </div>
        <figcaption>{practice.caption}</figcaption>
      </figure>
    </section>

    <footer className="ca-about-footer" data-enter="copy"><p>有个正在成形的世界？</p><a href="#contact">来聊聊<Arrow diagonal /></a></footer>
  </main>;
}
