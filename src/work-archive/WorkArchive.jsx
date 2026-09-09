import { useEffect, useRef, useState } from 'react';
import { RollingNumber, RollingText } from '@kitlangton/rolling-number/react';
import '@kitlangton/rolling-number/styles.css';
import { WorkScene } from './scene.js';
import './work-archive.css';

export default function WorkArchive({ works, language }) {
  const host = useRef(null), engine = useRef(null), stage = useRef(null), access = useRef(null), close = useRef(null);
  const [selected, setSelected] = useState(0), [hovered, setHovered] = useState(null);
  const [status, setStatus] = useState('loading'), [detail, setDetail] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const work = works[selected], english = language === 'en';
  useEffect(() => {
    let scene;
    try {
      scene = new WorkScene(host.current, works, index => setSelected(index), setHovered, reduced);
      engine.current = scene; scene.onError = () => setStatus('error');
      scene.load().then(() => { if (!scene.disposed) setStatus('ready'); }).catch(() => { if (!scene.disposed) setStatus('error'); });
    } catch { setStatus('error'); }
    return () => { scene?.dispose(); engine.current = null; };
  }, [works]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { engine.current?.setReduced(reduced); }, [reduced]);
  const openDetail = () => {
    if (status !== 'ready') return;
    engine.current.setDetail(true); setDetail(true); setHovered(null);
  };
  const returnToArray = () => { engine.current?.setDetail(false); setDetail(false); access.current?.focus({ preventScroll: true }); };
  useEffect(() => {
    if (detail) close.current?.focus({ preventScroll: true });
    const keyboard = e => {
      if (e.target.closest('input,select,textarea,video') || e.ctrlKey || e.metaKey || e.altKey) return;
      if (detail) { if (e.key === 'Escape') { e.preventDefault(); returnToArray(); } return; }
      const step = { ArrowUp: ['row',-1], ArrowDown: ['row',1], ArrowLeft: ['lane',-1], ArrowRight: ['lane',1] }[e.key];
      if (step && status === 'ready') { e.preventDefault(); engine.current?.navigate(...step); }
      if (e.key === 'Enter' && !e.target.closest('a,button')) { e.preventDefault(); openDetail(); }
    };
    window.addEventListener('keydown',keyboard); return () => window.removeEventListener('keydown',keyboard);
  }, [detail,status]);
  const choose = index => {
    if (status === 'ready') engine.current.selectIndex(index);
    else setSelected(index);
  };
  const roll = { duration: 460, animated: !reduced, motionBlur: true };
  return <main ref={stage} className={`work-array ${detail ? 'is-reading' : ''}`} data-reduced={reduced} aria-label="作品档案" tabIndex={-1}>
    <div className="work-array-canvas" ref={host} aria-hidden={detail || status === 'error'} />
    <div className="work-array-atmosphere" aria-hidden="true" />
    <div className="work-array-heading"><p>HAOQI / CREATIVE ARCHIVE</p><h1>{english ? 'Selected work' : '游戏作品'}</h1><span>GAME DESIGN · VISUAL SYSTEMS · SOUND</span></div>
    <div className="work-array-state"><i />{status === 'loading' ? 'LOADING ARCHIVE' : status === 'error' ? 'ARCHIVE / LIST VIEW' : 'ARCHIVE / CONNECTED'}</div>
    {status === 'loading' && <div className="work-array-loading" role="status"><span>正在载入三维档案</span><i /></div>}
    {status === 'error' && <div className="work-array-fallback"><p>三维画面暂时不可用，仍可浏览作品档案。</p>{works.map((item,index) => <button key={item.id} onClick={()=>choose(index)} aria-pressed={selected===index}>{item.archiveCode} / {item.title}</button>)}</div>}
    <section className="work-array-selection" aria-label="当前作品" hidden={detail}>
      <p className="work-array-eyebrow">WORK ARCHIVE <span>/</span> {english ? 'SELECTED FILE' : '当前选择'}</p>
      <div className="work-array-code">WORK-<RollingNumber {...roll} value={selected+1} format={{ minimumIntegerDigits: 2 }} /></div>
      <div className="work-array-title"><RollingText {...roll} text={work.title} transition="direct" stagger="none" /></div>
      <p className="work-array-type">{work.type}</p>
      <button ref={access} type="button" className="work-array-access" onClick={openDetail} disabled={status!=='ready'}>{english ? 'ACCESS FILE' : '抽取档案'} <span>↗</span></button>
      <span className="work-array-hint">{english ? 'Click a folder to select' : '点击文件夹选择 · 抽取后查看详情'}</span>
    </section>
    {detail && <section className="work-array-detail" aria-label={`${work.archiveCode} 详情`}>
      <button type="button" className="work-array-return" ref={close} onClick={returnToArray}>← {english ? 'RETURN TO ARCHIVE' : '归位 / 返回档案'} <kbd>ESC</kbd></button>
      <small>{work.archiveCode} / {work.type}</small><h2>{work.title}</h2><p>{work.summary}</p>
      {work.videoSrc ? <video key={work.id} controls playsInline preload="metadata" poster={work.image} src={work.videoSrc} /> : <><img src={work.image} alt={work.title} /><span className="work-array-pending">{english ? 'Work footage to be added' : '作品视频待添加'}</span></>}
      <div className="work-array-detail-footer"><span>HAOQI / STUDIO</span><span>{english ? 'DRAG MODEL TO INSPECT' : '拖动模型旋转查看'}</span></div>
    </section>}
    <div className="work-array-hover" aria-live="off">{hovered !== null && !detail ? `${works[hovered].archiveCode} / ${works[hovered].title}` : '\u00a0'}</div>
    <footer className="work-array-controls" hidden={detail}>
      <div className="work-array-counter"><small>ARCHIVE / SELECT</small><div><RollingNumber {...roll} value={selected+1} format={{ minimumIntegerDigits: 2 }} /><span>/ {String(works.length).padStart(2,'0')}</span></div></div>
      <div className="work-array-navigator"><button aria-label="上一份档案" disabled={status!=='ready'} onClick={()=>engine.current.navigate('row',-1)}>↑</button><div className="work-array-ticks">{works.map((item,index)=><button key={item.id} aria-label={`选择 ${item.archiveCode}`} aria-pressed={selected===index} onClick={()=>choose(index)} className={selected===index?'is-selected':''}><i/><span>{item.archiveCode}</span></button>)}</div><button aria-label="下一份档案" disabled={status!=='ready'} onClick={()=>engine.current.navigate('row',1)}>↓</button></div>
      <div className="work-array-lanes"><button aria-label="向左切换档案列" disabled={status!=='ready'} onClick={()=>engine.current.navigate('lane',-1)}>←</button><span>{english ? 'BROWSE ARCHIVE' : '切换档案列'}</span><button aria-label="向右切换档案列" disabled={status!=='ready'} onClick={()=>engine.current.navigate('lane',1)}>→</button></div>
      <div className="work-array-instructions">↑ ↓ {english ? 'SELECT' : '选档'} <span>/</span> ← → {english ? 'SHIFT' : '切列'} <span>/</span> ENTER {english ? 'OPEN' : '抽取'}</div>
    </footer>
    <div className="work-array-bottom"><span>INDEPENDENT PRACTICE / 2026</span><button type="button" aria-pressed={reduced} onClick={()=>setReduced(v=>!v)}>{reduced ? 'MOTION / REDUCED' : 'MOTION / FULL'}</button></div>
    <p className="work-array-announcement" aria-live="polite">{work.archiveCode} {work.title}</p>
  </main>;
}
