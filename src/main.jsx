import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  copy,
  gameWorks,
  languages,
  mapCities,
  musicTracks,
  photos,
  siteLaunchDate,
  socials,
} from './content.js';
import './styles.css';

const defaultLanguage = 'zh';

function readStoredValue(key, fallback) {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readStoredValue(key, fallback));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // localStorage can be unavailable in private modes; the UI still works.
    }
  }, [key, value]);

  return [value, setValue];
}

function getRuntimeParts(language) {
  const now = Date.now();
  const started = new Date(siteLaunchDate).getTime();
  const diff = Math.max(0, now - started);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const suffix = copy[language]?.days || copy.zh.days;
  return { days, hours, minutes, suffix };
}

function Header({ language, setLanguage, theme, setTheme, menuOpen, setMenuOpen, t }) {
  const navTargets = ['about', 'games', 'music', 'photo', 'map', 'contact'];

  return (
    <header className={'site-header ' + (menuOpen ? 'is-open' : '')}>
      <a className="brand-lockup" href="#top" onClick={() => setMenuOpen(false)}>
        <span className="brand-orbit" aria-hidden="true" />
        <span>HAOQI<span>/</span>STUDIO</span>
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navTargets.map((target, index) => (
          <a href={'#' + target} key={target}>{t.nav[index]}</a>
        ))}
      </nav>

      <div className="header-actions">
        <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'night' ? 'day' : 'night')}>
          {theme === 'night' ? 'DAY' : 'NIGHT'}
        </button>
        <div className="language-switcher" aria-label="Language switcher">
          {languages.map((item) => (
            <button
              className={item.code === language ? 'is-active' : ''}
              type="button"
              key={item.code}
              onClick={() => setLanguage(item.code)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navTargets.map((target, index) => (
          <a href={'#' + target} key={target} onClick={() => setMenuOpen(false)}>
            {t.nav[index]} <span>0{index + 1}</span>
          </a>
        ))}
        <div className="mobile-preferences">
          <button type="button" onClick={() => setTheme(theme === 'night' ? 'day' : 'night')}>
            {theme === 'night' ? 'DAY MODE' : 'NIGHT MODE'}
          </button>
          <div className="language-switcher" aria-label="Language switcher">
            {languages.map((item) => (
              <button
                className={item.code === language ? 'is-active' : ''}
                type="button"
                key={item.code}
                onClick={() => setLanguage(item.code)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

function Hero({ t, runtime }) {
  return (
    <section id="top" className="hero-section">
      <video className="hero-video" autoPlay muted loop playsInline poster="/assets/hero-poster.png" aria-hidden="true">
        <source src="https://videos.pexels.com/video-files/3129977/3129977-hd_1920_1080_25fps.mp4" type="video/mp4" />
      </video>
      <div className="hero-texture" aria-hidden="true" />
      <div className="page-width hero-inner">
        <div className="hero-topline">
          <span>Independent practice / 2026</span>
          <span>{runtime.days} {runtime.suffix} · {runtime.hours}h {runtime.minutes}m</span>
        </div>
        <div className="hero-main">
          <p className="eyebrow">{t.heroKicker}</p>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroBody}</p>
          <a className="round-link" href="#games">{t.explore}<span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ t, runtime }) {
  return (
    <section id="about" className="section section-light">
      <div className="page-width split-layout">
        <div className="section-marker"><span>01</span><span>About</span></div>
        <div className="section-copy">
          <p className="eyebrow">Framework v0</p>
          <h2>{t.aboutTitle}</h2>
          <p>{t.aboutBody}</p>
        </div>
        <div className="runtime-card">
          <span>{t.runtime}</span>
          <strong>{runtime.days}</strong>
          <small>{runtime.suffix} / {runtime.hours}h {runtime.minutes}m</small>
        </div>
      </div>
    </section>
  );
}

function GameSection({ t }) {
  return (
    <section id="games" className="section section-dark">
      <div className="page-width">
        <div className="section-heading">
          <div className="section-marker section-marker-dark"><span>02</span><span>Archive</span></div>
          <h2>{t.workTitle}</h2>
        </div>
        <div className="card-grid">
          {gameWorks.map((work) => (
            <article className="work-card" key={work.id}>
              <a className="media-frame" href={work.videoUrl} target={work.videoUrl.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                <img src={work.image} alt={work.title} />
                <span>{work.status}</span>
              </a>
              <div className="work-card-copy">
                <small>{work.number} / {work.type}</small>
                <h3>{work.title}</h3>
                <p>{work.summary}</p>
                <a href={work.downloadUrl}>{t.download}<span aria-hidden="true">↗</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MusicSection({ t, activeTrack, setActiveTrack }) {
  const current = musicTracks.find((track) => track.id === activeTrack) || musicTracks[0];

  return (
    <section id="music" className="section section-light music-layout">
      <div className="page-width split-layout">
        <div className="section-marker"><span>03</span><span>Sound</span></div>
        <div className="section-copy">
          <p className="eyebrow">Playlist / Notes</p>
          <h2>{t.musicTitle}</h2>
          <div className="track-list">
            {musicTracks.map((track) => (
              <button className={track.id === current.id ? 'is-active' : ''} type="button" key={track.id} onClick={() => setActiveTrack(track.id)}>
                <span>{track.title}</span>
                <small>{track.mood}</small>
              </button>
            ))}
          </div>
        </div>
        <aside className="player-panel">
          <span>{t.nowPlaying}</span>
          <h3>{current.title}</h3>
          <p>{current.analysis}</p>
          {current.src ? <audio controls src={current.src} /> : <div className="audio-placeholder">{t.noAudio}</div>}
        </aside>
      </div>
    </section>
  );
}

function PhotoSection({ t }) {
  return (
    <section id="photo" className="section section-dark">
      <div className="page-width">
        <div className="section-heading">
          <div className="section-marker section-marker-dark"><span>04</span><span>Photography</span></div>
          <h2>{t.photoTitle}</h2>
        </div>
        <div className="photo-strip">
          {photos.map((photo) => (
            <figure key={photo.id}>
              <img src={photo.image} alt={photo.title} />
              <figcaption>
                <span>{photo.city} / {photo.year}</span>
                <strong>{photo.title}</strong>
                <small>{photo.tag}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function MapSection({ t }) {
  return (
    <section id="map" className="section section-light">
      <div className="page-width map-layout">
        <div>
          <div className="section-marker"><span>05</span><span>China map</span></div>
          <h2>{t.mapTitle}</h2>
          <p className="map-note">当前使用抽象占位地图。下一步可替换为中国 GeoJSON / SVG，并把城市与摄影作品关联。</p>
        </div>
        <div className="china-map" aria-label={t.mapTitle}>
          <div className="map-shape" />
          {mapCities.map((city) => (
            <button className={city.count > 0 ? 'city-pin has-work' : 'city-pin'} style={{ left: city.x + '%', top: city.y + '%' }} type="button" key={city.city}>
              <span>{city.city}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function UploadSection({ t }) {
  return (
    <section id="upload" className="section section-dark compact-section">
      <div className="page-width upload-card">
        <div>
          <div className="section-marker section-marker-dark"><span>06</span><span>Upload seam</span></div>
          <h2>{t.uploadTitle}</h2>
        </div>
        <p>{t.uploadBody}</p>
        <button type="button" disabled>Upload disabled in static v0</button>
      </div>
    </section>
  );
}

function ContactSection({ t }) {
  return (
    <section id="contact" className="section section-light contact-section">
      <div className="page-width">
        <div className="section-heading">
          <div className="section-marker"><span>07</span><span>Contact</span></div>
          <h2>{t.contactTitle}</h2>
        </div>
        <div className="social-grid">
          {socials.map((item) => (
            <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [language, setLanguage] = useStoredState('haoqi-language', defaultLanguage);
  const [theme, setTheme] = useStoredState('haoqi-theme', 'night');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useStoredState('haoqi-track', musicTracks[0].id);
  const [runtime, setRuntime] = useState(() => getRuntimeParts(language));
  const cursorRef = useRef(null);
  const t = copy[language] || copy.zh;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
  }, [theme, language]);

  useEffect(() => {
    const tick = () => setRuntime(getRuntimeParts(language));
    tick();
    const timer = window.setInterval(tick, 30000);
    return () => window.clearInterval(timer);
  }, [language]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || window.matchMedia('(pointer: coarse)').matches) return undefined;
    const move = (event) => {
      cursor.style.transform = 'translate3d(' + event.clientX + 'px, ' + event.clientY + 'px, 0)';
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const pageClassName = useMemo(() => 'site-shell theme-' + theme, [theme]);

  return (
    <div className={pageClassName}>
      <div className="custom-cursor" ref={cursorRef} aria-hidden="true" />
      <Header
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        t={t}
      />
      <main>
        <Hero t={t} runtime={runtime} />
        <AboutSection t={t} runtime={runtime} />
        <GameSection t={t} />
        <MusicSection t={t} activeTrack={activeTrack} setActiveTrack={setActiveTrack} />
        <PhotoSection t={t} />
        <MapSection t={t} />
        <UploadSection t={t} />
        <ContactSection t={t} />
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
