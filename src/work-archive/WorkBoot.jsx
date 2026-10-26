import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { WORK_BOOT_HOLD, workBootFrame } from './bootTimeline.js';
import { FOLD_MARK_START, foldMarkFrame } from './foldMarkMotion.js';
import './work-boot.css';

const text = {
  mixed: { label: '进入作品档案', skip: '跳过启动', key: 'ENTER / ESC', waiting: '作品资源正在载入', stages: { access: '打开创作档案', logo: 'HAOQI / STUDIO', auth: '游戏 · 摄影 · 音乐', scan: '整理档案视图', welcome: '欢迎来到我的作品档案', exit: '进入档案' } },
  zh: { label: '进入作品档案', skip: '跳过启动', key: 'ENTER / ESC', waiting: '作品资源正在载入', stages: { access: '打开创作档案', logo: 'HAOQI / STUDIO', auth: '游戏 · 摄影 · 音乐', scan: '整理档案视图', welcome: '欢迎来到我的作品档案', exit: '进入档案' } },
  en: { label: 'Entering the work archive', skip: 'Skip intro', key: 'ENTER / ESC', waiting: 'Loading work resources', stages: { access: 'Opening the creative archive', logo: 'HAOQI / STUDIO', auth: 'Games · Photography · Music', scan: 'Preparing the archive view', welcome: 'Welcome to my creative archive', exit: 'Entering archive' } },
  ja: { label: '作品アーカイブへ', skip: 'イントロをスキップ', key: 'ENTER / ESC', waiting: '作品リソースを読み込み中', stages: { access: '作品アーカイブを開く', logo: 'HAOQI / STUDIO', auth: 'ゲーム · 写真 · 音楽', scan: 'アーカイブ表示を準備中', welcome: '作品アーカイブへようこそ', exit: 'アーカイブへ移動' } },
  ru: { label: 'Вход в архив работ', skip: 'Пропустить', key: 'ENTER / ESC', waiting: 'Загрузка материалов работ', stages: { access: 'Открываем творческий архив', logo: 'HAOQI / STUDIO', auth: 'Игры · Фотография · Музыка', scan: 'Подготовка архива', welcome: 'Добро пожаловать в мой архив', exit: 'Вход в архив' } },
};

const TAU = Math.PI * 2;
function arc(radius, start, sweep, x = 960, y = 540) {
  const point = angle => `${x + Math.cos(angle) * radius},${y + Math.sin(angle) * radius}`;
  if (sweep >= Math.PI * 1.999) return `M${point(start)}A${radius},${radius} 0 1 1 ${point(start + Math.PI)}A${radius},${radius} 0 1 1 ${point(start + TAU)}`;
  return `M${point(start)}A${radius},${radius} 0 ${sweep > Math.PI ? 1 : 0} 1 ${point(start + sweep)}`;
}

// The settled path is identical to the approved fold-H proposal. Switching from
// fragments to this single silhouette avoids hairline seams at small sizes.
const foldSilhouette = 'M48 44h40v62l80-22V44h40v168h-40v-85l-80 22v63H48V44Z';
const foldTab = 'M168 44h40v38l-40-11V44Z';

function FoldMark({ partRefs, wordRef, className = '' }) {
  return <svg className={`work-boot-fold-mark ${className}`} viewBox={wordRef ? '32 28 192 236' : '32 28 192 200'} fill="none" aria-hidden="true">
    {partRefs && <g ref={partRefs.fragments} className="work-boot-fold-fragments" style={{ display: 'none' }}>
      <path ref={partRefs.left} fill="currentColor" d="M48 44h40v168H48Z" />
      <path ref={partRefs.right} fill="currentColor" d="M168 44h40v168h-40Z" />
      <path ref={partRefs.bridge} fill="currentColor" d="M87.5 106.1375 168.5 83.8625v43l-81 22.275Z" />
      <path ref={partRefs.tab} className="work-boot-fold-tab" d={foldTab} />
    </g>}
    <g ref={partRefs?.complete} className="work-boot-fold-complete">
      <path fill="currentColor" d={foldSilhouette} />
      <path className="work-boot-fold-tab" d={foldTab} />
    </g>
    {wordRef && <text ref={wordRef} x="128" y="250" textAnchor="middle" fill="currentColor">HAOQI / STUDIO</text>}
  </svg>;
}

/**
 * Reference-paced introduction. `ready` is the actual scene/resource state.
 * onReveal starts the array entrance; onComplete removes the opening layer.
 * The scene releases archive input after its travelling entry wave has settled.
 * Default full motion is deliberate and matches the user's site preference.
 */
export default function WorkBoot({ language = 'mixed', motion = 'full', ready = true, onReveal, onComplete, onPhaseChange, onFrame, onGesture, soundControl }) {
  const root = useRef(null), nodes = useRef({}), clock = useRef({ elapsed: 0, last: null, skip: false, skipElapsed: 0, revealed: false, completed: false });
  const callbacks = useRef({ onReveal, onComplete, onPhaseChange, onFrame, onGesture }), readyRef = useRef(ready);
  callbacks.current = { onReveal, onComplete, onPhaseChange, onFrame, onGesture };
  readyRef.current = ready;
  const [phase, setPhase] = useState('access');
  const [waiting, setWaiting] = useState(false);
  const copy = text[language] || text.mixed;
  const reduced = motion === 'reduced' || motion === true;
  const ref = name => node => { nodes.current[name] = node; };

  useEffect(() => {
    const state = clock.current;
    let raf = 0, disposed = false, phaseNow = '', waitingNow = false;
    const el = nodes.current;
    // A portal keeps this layer above the site's header/player stacking contexts.
    // Preserve each sibling's own inert state, including pre-existing dialogs.
    const siblings = [...document.body.children]
      .filter(node => node instanceof HTMLElement && node !== root.current && !['SCRIPT', 'STYLE', 'LINK'].includes(node.tagName))
      .map(node => ({ node, inert: node.inert }));
    siblings.forEach(({ node }) => { node.inert = true; });
    const reveal = skipped => {
      if (state.revealed) return;
      state.revealed = true;
      callbacks.current.onReveal?.({ skipped });
    };
    const complete = skipped => {
      if (state.completed || disposed) return;
      state.completed = true;
      callbacks.current.onComplete?.({ skipped });
    };
    function paint(s) {
      root.current.dataset.phase = s.phase;
      root.current.dataset.bootFrame = s.f;
      if (phaseNow !== s.phase) {
        phaseNow = s.phase;
        setPhase(s.phase);
        callbacks.current.onPhaseChange?.(s.phase);
      }
      const opacity = (name, value) => { if (el[name]) el[name].style.opacity = value; };
      const words = (name, value) => { if (el[name] && el[name].textContent !== value) el[name].textContent = value; };
      opacity('access', reduced ? 0 : s.accessOpacity);
      words('access', s.access);
      opacity('identity', reduced ? 0 : s.logoOpacity);
      const logoScale = window.innerWidth > 700 ? Math.min(1, window.innerWidth / 1920) : 0;
      el.logo.style.transform = `translateX(${s.logo.offsetX * logoScale}px)`;
      const mark = foldMarkFrame(s.time - FOLD_MARK_START, reduced);
      el.logo.dataset.mark = mark.assembled ? 'assembled' : 'assembling';
      el.foldFragments.style.display = mark.assembled ? 'none' : '';
      el.foldComplete.style.display = mark.assembled ? '' : 'none';
      if (!mark.assembled) {
        ['Left', 'Right'].forEach(side => {
          const part = mark[side.toLowerCase()], pivot = side === 'Left' ? 68 : 188;
          el[`fold${side}`].setAttribute('transform', `translate(${part.x} ${part.y}) rotate(${part.angle} ${pivot} 128)`);
          opacity(`fold${side}`, part.opacity);
        });
        el.foldBridge.setAttribute('transform', `translate(88 0) scale(${mark.bridge.scale} 1) translate(-88 0)`);
        opacity('foldBridge', mark.bridge.opacity);
        el.foldTab.setAttribute('transform', `translate(0 ${mark.tab.y}) rotate(${mark.tab.angle} 208 44)`);
        opacity('foldTab', mark.tab.opacity);
      }
      words('wordmark', s.logoLetters);
      opacity('message', s.messageOpacity);
      words('messageText', s.message);
      [0, 1, 2].forEach(index => {
        opacity(`brand${index}`, reduced ? 1 : s.brand[index].opacity);
        el[`brand${index}`].style.transform = reduced ? 'none' : `translateX(${s.brand[index].x * .5}px)`;
      });
      opacity('scan', !reduced && s.scanVisible ? 1 : 0);
      if (!reduced && s.scanVisible) {
        const scan = s.scan;
        opacity('rings', s.ringOpacity);
        el.outer.setAttribute('d', arc(scan.radius, scan.outerStart, scan.outerSweep));
        el.white.setAttribute('d', arc(scan.whiteRadius, scan.whiteStart, scan.whiteSweep));
        el.inner0.setAttribute('d', arc(scan.innerRadius, scan.innerStart, scan.innerSweep));
        el.inner1.setAttribute('d', arc(scan.innerRadius, scan.innerStart + Math.PI, scan.innerSweep));
        [0, 1].forEach(index => {
          const side = s.orbit.sides[index];
          el[`side${index}`].setAttribute('d', arc(side.radius, side.start, side.sweep, side.x, side.y));
          opacity(`side${index}`, s.orbit.sideVisible ? 1 : 0);
          el[`orbital${index}`].setAttribute('cx', 960 + Math.cos(scan.orbit + index * Math.PI) * scan.orbitRadius);
          el[`orbital${index}`].setAttribute('cy', 540 + Math.sin(scan.orbit + index * Math.PI) * scan.orbitRadius);
          el[`orbital${index}`].setAttribute('r', scan.dotRadius);
        });
        s.orbit.satellites.forEach((point, index) => {
          const node = el[`satellite${index}`];
          node.setAttribute('cx', point.x); node.setAttribute('cy', point.y); node.setAttribute('r', point.radius);
        });
        el.core.setAttribute('r', s.orbit.coreRadius);
        opacity('core', s.f >= 546 ? 1 : 0);
        opacity('scanText', s.scanTextOpacity);
        el.scanText.style.letterSpacing = `${s.scanTracking * Math.min(1, window.innerWidth / 1500)}px`;
      }
      opacity('welcome', reduced ? 1 : s.welcomeVisible ? s.welcomeOpacity : 0);
      el.welcome.style.transform = reduced ? 'none' : `scale(${s.welcomeScale})`;
      el.welcome.style.filter = reduced ? 'none' : `blur(${s.exit * 5}px)`;
      opacity('welcomeHeading', reduced ? 1 : s.welcomeHeading * s.inkPulse);
      opacity('company', reduced ? 1 : s.companyOpacity);
      opacity('welcomeMark', reduced ? 1 : s.companyOpacity);
      el.highlight.style.clipPath = reduced ? 'none' : `inset(0 ${100 * (1 - s.highlight)}% 0 0)`;
      opacity('database', reduced ? 1 : s.databaseOpacity);
      root.current.style.opacity = state.skip ? Math.max(0, 1 - state.skipElapsed / .18) : s.overlayOpacity;
    }
    function frame(now) {
      if (disposed || state.completed) return;
      // This is a seekable editorial timeline, not a physics integrator. Using
      // wall time keeps its original pace even on a phone or during screenshots.
      const dt = state.last === null ? 0 : Math.min(1, Math.max(0, (now - state.last) / 1000));
      state.last = now;
      if (state.skip) {
        reveal(true);
        state.skipElapsed += dt;
        root.current.style.opacity = Math.max(0, 1 - state.skipElapsed / .18);
        if (state.skipElapsed >= .18) { complete(true); return; }
      } else {
        if (reduced) state.elapsed = Math.max(state.elapsed, WORK_BOOT_HOLD);
        const next = state.elapsed + dt * (reduced ? 2 : 1);
        state.elapsed = !readyRef.current && next >= WORK_BOOT_HOLD ? WORK_BOOT_HOLD : next;
        const isWaiting = !readyRef.current && state.elapsed >= WORK_BOOT_HOLD;
        if (isWaiting !== waitingNow) { waitingNow = isWaiting; setWaiting(isWaiting); }
        const s = workBootFrame(state.elapsed);
        paint(s);
        callbacks.current.onFrame?.(s, reduced);
        if (s.reveal && readyRef.current) reveal(false);
        if (s.done && readyRef.current) { complete(false); return; }
      }
      raf = requestAnimationFrame(frame);
    }
    const skip = event => {
      callbacks.current.onGesture?.(event);
      if (event.key === 'Escape' || (event.key === 'Enter' && !event.target.closest?.('[data-work-sound-toggle]'))) {
        event.preventDefault(); event.stopImmediatePropagation(); state.skip = true;
      } else if (event.key === 'Tab') {
        const buttons = [...root.current.querySelectorAll('button:not(:disabled)')];
        const index = buttons.indexOf(document.activeElement);
        event.preventDefault();
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus({ preventScroll: true });
      }
    };
    const visibility = () => {
      cancelAnimationFrame(raf); state.last = null;
      if (!document.hidden && !state.completed) raf = requestAnimationFrame(frame);
    };
    root.current.focus({ preventScroll: true });
    window.addEventListener('keydown', skip, true);
    document.addEventListener('visibilitychange', visibility);
    state.last = null;
    if (!document.hidden) raf = requestAnimationFrame(frame);
    return () => {
      disposed = true; cancelAnimationFrame(raf);
      window.removeEventListener('keydown', skip, true);
      document.removeEventListener('visibilitychange', visibility);
      siblings.forEach(({ node, inert }) => { node.inert = inert; });
    };
  }, [reduced]);

  return createPortal(<section ref={root} className="work-boot" data-motion={reduced ? 'reduced' : 'full'} data-phase="access" role="dialog" aria-modal="true" aria-label={copy.label} tabIndex={-1}>
    <div className="work-boot-corner" aria-hidden="true">
      <strong ref={ref('brand0')}>HAOQI / STUDIO</strong>
      <span ref={ref('brand1')}>PLAY, IMAGE & SOUND.</span>
      <span ref={ref('brand2')}>CREATIVE ARCHIVE</span>
    </div>
    <div className="work-boot-sound">{soundControl}</div>
    <button ref={ref('skip')} className="work-boot-skip" onClick={() => { clock.current.skip = true; }}>{copy.skip}<kbd>{copy.key}</kbd></button>
    <div className="work-boot-sequence" aria-hidden="true">
      <p ref={ref('access')} className="work-boot-access" />
      <div ref={ref('identity')} className="work-boot-identity">
        <div ref={ref('logo')} className="work-boot-logo"><FoldMark partRefs={{ fragments: ref('foldFragments'), complete: ref('foldComplete'), left: ref('foldLeft'), right: ref('foldRight'), bridge: ref('foldBridge'), tab: ref('foldTab') }} wordRef={ref('wordmark')} /></div>
        <p ref={ref('message')} className="work-boot-message"><span className="work-boot-square" /><span ref={ref('messageText')} /></p>
      </div>
      <div ref={ref('scan')} className="work-boot-scan">
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <g ref={ref('rings')} fill="none" stroke="currentColor" strokeLinecap="round">
            <path ref={ref('outer')} strokeWidth="2.4" /><path ref={ref('white')} className="work-boot-light-ring" strokeWidth="4" />
            <path ref={ref('inner0')} strokeWidth="2.4" /><path ref={ref('inner1')} strokeWidth="2.4" />
            {[0, 1].map(index => <path key={index} ref={ref(`side${index}`)} strokeWidth="2.6" />)}
            {[0, 1].map(index => <circle key={index} ref={ref(`orbital${index}`)} className="work-boot-accent" stroke="none" />)}
            {Array.from({ length: 6 }, (_, index) => <circle key={index} ref={ref(`satellite${index}`)} fill="currentColor" stroke="none" />)}
            <circle ref={ref('core')} cx="959.5" cy="539.5" fill="currentColor" stroke="none" />
          </g>
        </svg>
        <p ref={ref('scanText')}>CREATIVE ARCHIVE</p>
      </div>
      <div ref={ref('welcome')} className="work-boot-welcome">
        <p ref={ref('welcomeHeading')} className="work-boot-welcome-heading">WELCOME TO</p>
        <div ref={ref('company')} className="work-boot-company"><strong>HAOQI / STUDIO</strong><strong ref={ref('highlight')} className="work-boot-highlight">HAOQI / STUDIO</strong></div>
        <p ref={ref('database')} className="work-boot-database">GAMES · PHOTOGRAPHY · MUSIC</p>
        <div ref={ref('welcomeMark')}><FoldMark className="work-boot-welcome-mark" /></div>
      </div>
    </div>
    <div className="work-boot-footer"><span>INDEPENDENT PRACTICE / 2026</span><span aria-hidden="true">PLAY, IMAGE & SOUND.</span></div>
    <p className="work-boot-resource" role="status">{waiting ? copy.waiting : ''}</p>
    <span className="work-boot-sr" role="status" aria-live="polite">{copy.stages[phase]}</span>
  </section>, document.body);
}
