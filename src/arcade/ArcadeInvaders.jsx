import { useCallback, useEffect, useRef, useState } from 'react';
import { createGame, GAME_HEIGHT, GAME_WIDTH, startGame, stepGame } from './invadersEngine.js';
import { drawGame } from './invadersRenderer.js';
import { createInvadersSound } from './invadersSound.js';
import { useSiteSound } from '../audio/SiteSoundProvider.jsx';
import { arcadeCopy } from './arcade-copy.js';
import './arcade-invaders.css';

const BEST_KEY = 'haoqi-invaders-best-v1';
const activeGame = (game) => game.status === 'playing' || game.status === 'wave-clear';
const gameSnapshot = (game) => ({ status: game.status, score: game.score, best: game.bestScore, lives: game.lives, wave: game.wave });
const keyActions = { ArrowLeft: 'left', ArrowRight: 'right', a: 'left', A: 'left', d: 'right', D: 'right', ' ': 'fire' };

function loadBest() {
  try {
    const value = Number(window.localStorage.getItem(BEST_KEY));
    return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  } catch { return 0; }
}

export default function ArcadeInvaders({ language }) {
  const { sound, state: siteSoundState } = useSiteSound();
  const copy = arcadeCopy[language] || arcadeCopy.mixed;
  const copyRef = useRef(copy);
  copyRef.current = copy;
  const gameRef = useRef(null);
  if (!gameRef.current) gameRef.current = createGame({ seed: Date.now(), bestScore: loadBest() });
  const canvasRef = useRef(null);
  const cabinetRef = useRef(null);
  const heldRef = useRef(new Map());
  const soundRef = useRef(null);
  const pausedRef = useRef(false);
  const persistedBest = useRef(gameRef.current.bestScore);
  const [session, setSession] = useState(() => gameSnapshot(gameRef.current));
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [pressed, setPressed] = useState({});
  const running = activeGame({ status: session.status }) && !paused;
  const soundEnabled = siteSoundState.enabled && soundOn;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    context.setTransform(canvas.width / GAME_WIDTH, 0, 0, canvas.height / GAME_HEIGHT, 0, 0);
    drawGame(context, gameRef.current, { copy: copyRef.current });
  }, []);

  const sync = useCallback(() => {
    const game = gameRef.current;
    setSession(gameSnapshot(game));
    if (game.bestScore > persistedBest.current) {
      persistedBest.current = game.bestScore;
      try { window.localStorage.setItem(BEST_KEY, String(game.bestScore)); } catch { /* Session record still works. */ }
    }
  }, []);

  const clearInput = useCallback(() => {
    heldRef.current.clear();
    setPressed({});
  }, []);

  const pause = useCallback(() => {
    clearInput();
    if (!activeGame(gameRef.current)) return;
    pausedRef.current = true;
    setPaused(true);
    soundRef.current?.pause();
    sync();
    draw();
  }, [clearInput, draw, sync]);

  const pauseWithCue = () => {
    if (activeGame(gameRef.current) && !pausedRef.current) sound.activate('ui-tick');
    pause();
  };

  const begin = (event) => {
    clearInput();
    startGame(gameRef.current);
    pausedRef.current = false;
    setPaused(false);
    // The game owns its retro voices; visiting the homepage never creates its context.
    if (event?.isTrusted && soundEnabled) {
      soundRef.current ||= createInvadersSound();
      soundRef.current.enable(true);
    }
    sound.activate('ui-tick');
    sync();
    draw();
    canvasRef.current?.focus({ preventScroll: true });
    if (window.matchMedia('(max-width: 700px)').matches) {
      const rect = cabinetRef.current.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + rect.top - Math.max(88, (window.innerHeight - rect.height) / 2), behavior: 'instant' });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const resize = () => {
      // Draw into whole logical pixels, then scale the completed image once.
      // Scaling each shield block separately creates hairline seams on narrow screens.
      const dpr = Math.min(Math.max(1, Math.round(window.devicePixelRatio || 1)), 2);
      canvas.width = GAME_WIDTH * dpr;
      canvas.height = GAME_HEIGHT * dpr;
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => { draw(); }, [language, draw]);

  useEffect(() => {
    // The local switch is an additional mute, never an override of the site switch.
    soundRef.current?.enable(soundEnabled && running);
  }, [soundEnabled, running]);

  useEffect(() => {
    if (!running) return undefined;
    let frame;
    let previous;
    let lastSync = 0;
    const tick = (now) => {
      if (pausedRef.current) return;
      const input = {};
      for (const action of heldRef.current.values()) input[action] = true;
      const game = gameRef.current;
      stepGame(game, previous === undefined ? 0 : (now - previous) / 1000, input);
      previous = now;
      soundRef.current?.play(game.events);
      draw();
      if (now - lastSync > 100 || !activeGame(game)) {
        sync();
        lastSync = now;
      }
      if (activeGame(game)) frame = requestAnimationFrame(tick);
      else {
        clearInput();
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, draw, sync, clearInput]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) pause(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.15) pause();
    }, { threshold: [0, 0.15] });
    observer.observe(cabinetRef.current);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', pause);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', pause);
      soundRef.current?.dispose();
      soundRef.current = null;
    };
  }, [pause]);

  const onKeyDown = (event) => {
    if (event.target !== canvasRef.current) return;
    const action = keyActions[event.key];
    if (action) {
      event.preventDefault();
      event.stopPropagation();
      if (activeGame(gameRef.current) && !pausedRef.current) heldRef.current.set(`key:${event.code}`, action);
    } else if (['p', 'P', 'Escape'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat) pausedRef.current ? begin(event) : pauseWithCue();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat && (!activeGame(gameRef.current) || pausedRef.current)) begin(event);
    }
  };

  const hold = (source, action) => {
    if (!activeGame(gameRef.current) || pausedRef.current) return;
    heldRef.current.set(source, action);
    setPressed(Object.fromEntries([...heldRef.current.values()].map((value) => [value, true])));
  };
  const release = (source) => {
    heldRef.current.delete(source);
    setPressed(Object.fromEntries([...heldRef.current.values()].map((value) => [value, true])));
  };
  const control = (action) => ({
    onPointerDown(event) {
      if (event.button !== 0) return;
      event.preventDefault();
      if (event.pointerType === 'mouse') event.currentTarget.focus({ preventScroll: true });
      event.currentTarget.setPointerCapture(event.pointerId);
      hold(`pointer:${event.pointerId}`, action);
    },
    onPointerUp(event) { release(`pointer:${event.pointerId}`); },
    onPointerCancel(event) { release(`pointer:${event.pointerId}`); },
    onLostPointerCapture(event) { release(`pointer:${event.pointerId}`); },
    onKeyDown(event) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        hold(`button:${event.code}`, action);
      }
    },
    onKeyUp(event) { release(`button:${event.code}`); },
    onBlur() { clearInput(); },
  });

  const status = paused ? 'paused' : session.status;
  const statusText = ({ ready: copy.idle, paused: copy.paused, 'game-over': copy.gameOver, 'wave-clear': copy.cleared })[status];
  const overlay = status === 'ready' || status === 'paused' || status === 'game-over';
  const formatted = (value) => String(value).padStart(5, '0');
  const titleLines = language === 'ja' ? ['スペース', 'インベーダー'] : language === 'mixed' || language === 'zh' ? ['太空', '侵略者'] : ['Space', 'Invaders'];

  return <section id="arcade" className="arcade-section section-light" aria-labelledby="arcade-title">
    <div className="page-width arcade-layout">
      <div className="arcade-intro">
        <span className="arcade-kicker">PLAY / 01</span>
        <h2 id="arcade-title" aria-label={copy.sectionTitle}>{titleLines.map((line, index) => <span key={line}>{index > 0 && language !== 'mixed' && language !== 'zh' && language !== 'ja' ? ' ' : ''}{line}</span>)}</h2>
        <p className="arcade-description">{copy.intro}</p>
        <dl className="arcade-records">
          <div><dt>{copy.score}</dt><dd>{formatted(session.score)}</dd></div>
          <div><dt>{copy.best}</dt><dd>{formatted(session.best)}</dd></div>
        </dl>
        <p id="arcade-instructions" className="arcade-instructions"><span className="arcade-desktop-instructions">{copy.controlsDesktop}</span><span className="arcade-mobile-instructions">{copy.controlsMobile}</span></p>
        <a className="arcade-work-link" href="#work" onClick={pause}>{copy.continueToWork}<span aria-hidden="true">↓</span></a>
        <p className="arcade-attribution"><a href="https://spaceinvaders.jp/" target="_blank" rel="noreferrer">{copy.attribution} <span aria-hidden="true">↗</span></a></p>
      </div>

      <div ref={cabinetRef} className="arcade-cabinet" data-game-status={status}
        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) pause(); }}>
        <div className="arcade-screen">
          <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} tabIndex={0}
            aria-label={copy.canvasLabel} aria-describedby="arcade-instructions" role="img"
            onKeyDown={onKeyDown}
            onKeyUp={(event) => { if (keyActions[event.key]) { event.preventDefault(); heldRef.current.delete(`key:${event.code}`); } }}
            onBlur={clearInput} />
          {overlay && <div className="arcade-overlay"><div className="arcade-overlay-content">
            <p>{statusText}</p>
            {status === 'game-over' && <strong>{formatted(session.score)}</strong>}
            <button type="button" className="arcade-primary" onClick={begin}>{status === 'paused' ? copy.resume : status === 'game-over' ? copy.restart : copy.start}<span aria-hidden="true">→</span></button>
          </div></div>}
          {status === 'wave-clear' && <span className="arcade-wave-notice">{copy.cleared}</span>}
        </div>
        <div className="arcade-toolbar">
          <button type="button" onClick={event => paused || session.status === 'ready' || session.status === 'game-over' ? begin(event) : pauseWithCue()}>{paused ? copy.resume : session.status === 'ready' ? copy.start : session.status === 'game-over' ? copy.restart : copy.pause}<span aria-hidden="true">{running ? 'Ⅱ' : '▷'}</span></button>
          <button type="button" aria-pressed={soundEnabled} disabled={!siteSoundState.enabled} onClick={event => {
            const next = !soundOn;
            if (next && running && event.isTrusted) {
              soundRef.current ||= createInvadersSound();
              soundRef.current.enable(true);
            } else soundRef.current?.enable(false);
            setSoundOn(next);
            if (activeGame(gameRef.current) && !pausedRef.current) canvasRef.current?.focus({ preventScroll: true });
          }}>{soundEnabled ? copy.soundOn : copy.soundOff}<span aria-hidden="true">{soundEnabled ? '♪' : '×'}</span></button>
        </div>
        <div className="arcade-touch-controls" aria-label={copy.controlsMobile}>
          <button type="button" aria-label={copy.moveLeft} className={pressed.left ? 'is-held' : ''} disabled={!running} {...control('left')}>←</button>
          <button type="button" aria-label={copy.moveRight} className={pressed.right ? 'is-held' : ''} disabled={!running} {...control('right')}>→</button>
          <button type="button" aria-label={copy.fire} className={`arcade-fire ${pressed.fire ? 'is-held' : ''}`} disabled={!running} {...control('fire')}>{copy.fire}<span aria-hidden="true">↑</span></button>
        </div>
        <span className="arcade-announcement" role="status" aria-live="polite">{statusText || `${copy.wave} ${session.wave} · ${copy.lives} ${session.lives}`}</span>
      </div>
    </div>
  </section>;
}
