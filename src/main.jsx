import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  copy,
  gameWorks,
  languages,
  mapCities,
  musicTracks,
  photoAlbums,
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
      // Preferences remain session-only when localStorage is unavailable.
    }
  }, [key, value]);

  return [value, setValue];
}

function getRuntimeParts(language) {
  const diff = Math.max(0, Date.now() - new Date(siteLaunchDate).getTime());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return { days, hours, minutes, suffix: copy[language]?.days || copy.zh.days };
}

function Header({ language, setLanguage, theme, setTheme, menuOpen, setMenuOpen, t }) {
  const navTargets = ['about', 'games', 'music', 'contact'];

  return (
    <header className={'site-header ' + (menuOpen ? 'is-open' : '')}>
      <a className="brand-lockup" href="#top" onClick={() => setMenuOpen(false)} aria-label="Back to top">
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
            <button className={item.code === language ? 'is-active' : ''} type="button" key={item.code} onClick={() => setLanguage(item.code)}>
              {item.label}
            </button>
          ))}
        </div>
        <button className="menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'}</button>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navTargets.map((target, index) => (
          <a href={'#' + target} key={target} onClick={() => setMenuOpen(false)}>{t.nav[index]} <span>0{index + 1}</span></a>
        ))}
        <div className="mobile-preferences">
          <button type="button" onClick={() => setTheme(theme === 'night' ? 'day' : 'night')}>{theme === 'night' ? 'DAY MODE' : 'NIGHT MODE'}</button>
          <div className="language-switcher" aria-label="Language switcher">
            {languages.map((item) => (
              <button className={item.code === language ? 'is-active' : ''} type="button" key={item.code} onClick={() => setLanguage(item.code)}>{item.label}</button>
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
          <a className="round-link" href="#games"><span>{t.explore}</span><b aria-hidden="true">↓</b></a>
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

function Lightbox({ album, imageIndex, setImageIndex, onClose, t }) {
  const image = album.images[imageIndex];
  const previous = () => setImageIndex((imageIndex - 1 + album.images.length) % album.images.length);
  const next = () => setImageIndex((imageIndex + 1) % album.images.length);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={album.title}>
      <button className="lightbox-close" type="button" onClick={onClose}>{t.close} ×</button>
      <img src={image.src} alt={image.caption} />
      <div className="lightbox-caption"><span>{album.title}</span><small>{image.caption} / {imageIndex + 1} — {album.images.length}</small></div>
      <button className="lightbox-arrow lightbox-prev" type="button" onClick={previous} aria-label={t.previous}>←</button>
      <button className="lightbox-arrow lightbox-next" type="button" onClick={next} aria-label={t.next}>→</button>
    </div>
  );
}

function PhotoSection({ t }) {
  const cities = [t.allCities, ...new Set(photoAlbums.map((album) => album.city))];
  const years = [t.allYears, ...new Set(photoAlbums.map((album) => album.year))];
  const [cityFilter, setCityFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const albums = photoAlbums.filter((album) => (cityFilter === 'all' || album.city === cityFilter) && (yearFilter === 'all' || album.year === yearFilter));

  const openAlbum = (album) => {
    setActiveAlbum(album);
    setImageIndex(0);
  };

  return (
    <section id="photo" className="section section-dark">
      <div className="page-width">
        <div className="section-heading">
          <div className="section-marker section-marker-dark"><span>04</span><span>Photography</span></div>
          <h2>{t.photoTitle}</h2>
        </div>
        <p className="photo-intro">{t.photoIntro}</p>
        <div className="archive-controls">
          <div className="filter-group">
            <span>City</span>
            {cities.map((city, index) => <button className={(index === 0 ? cityFilter === 'all' : city === cityFilter) ? 'is-active' : ''} type="button" key={city} onClick={() => setCityFilter(index === 0 ? 'all' : city)}>{city}</button>)}
          </div>
          <div className="filter-group">
            <span>Year</span>
            {years.map((year, index) => <button className={(index === 0 ? yearFilter === 'all' : year === yearFilter) ? 'is-active' : ''} type="button" key={year} onClick={() => setYearFilter(index === 0 ? 'all' : year)}>{year}</button>)}
          </div>
        </div>
        <div className="photo-album-grid">
          {albums.map((album) => (
            <article className="photo-album" key={album.id}>
              <button className="album-cover" type="button" onClick={() => openAlbum(album)} aria-label={t.openLightbox + ': ' + album.title}>
                <img src={album.cover} alt={album.title} />
                <span>{album.number} / {album.frameCount} {t.frames}</span>
                <b aria-hidden="true">↗</b>
              </button>
              <div className="album-meta">
                <div><span>{album.city} / {album.year}</span><small>{album.date}</small></div>
                <h3>{album.title}</h3>
                <p>{album.summary}</p>
                <div className="album-details"><span>{t.camera}: {album.camera}</span><span>{album.tags.join(' / ')}</span></div>
                <button type="button" onClick={() => openAlbum(album)}>{t.viewSet} <span aria-hidden="true">↗</span></button>
              </div>
            </article>
          ))}
        </div>
        <div id="map" className="photo-map">
          <div className="map-copy">
            <div className="section-marker section-marker-dark"><span>05</span><span>Map inside photography</span></div>
            <h3>{t.mapTitle}</h3>
            <p>{t.mapNote}</p>
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
      </div>
      {activeAlbum && <Lightbox album={activeAlbum} imageIndex={imageIndex} setImageIndex={setImageIndex} onClose={() => setActiveAlbum(null)} t={t} />}
    </section>
  );
}

function UploadSection({ t }) {
  return (
    <section id="upload" className="section section-dark compact-section">
      <div className="page-width upload-card">
        <div>
          <div className="section-marker"><span>06</span><span>Upload seam</span></div>
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
          <div className="section-marker section-marker-dark"><span>07</span><span>Contact</span></div>
          <h2>{t.contactTitle}</h2>
        </div>
        <div className="social-grid">
          {socials.map((item) => (
            <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" key={item.label}>
              <span>{item.label}</span><strong>{item.value}</strong><i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SidebarPlayer({ t, activeTrack, setActiveTrack }) {
  const [open, setOpen] = useState(false);
  const current = musicTracks.find((track) => track.id === activeTrack) || musicTracks[0];
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    if (!current.src || !audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(() => setIsPlaying(false));
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [current.id]);

  return (
    <aside className={'sidebar-player ' + (open ? 'is-open' : '')}>
      <button className="sidebar-player-tab" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="player-signal" aria-hidden="true"><i /><i /><i /></span>
        <span>{t.nowPlaying}</span>
      </button>
      <div className="sidebar-player-panel">
        <span className="player-label">{t.nowPlaying}</span>
        <strong>{current.title}</strong>
        <button className="player-play" type="button" onClick={togglePlayback} disabled={!current.src}>{isPlaying ? 'Pause' : 'Play'}</button>
        {current.src && <audio ref={audioRef} src={current.src} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />}
        <select value={current.id} onChange={(event) => setActiveTrack(event.target.value)} aria-label="Select music">
          {musicTracks.map((track) => <option value={track.id} key={track.id}>{track.title}</option>)}
        </select>
        {!current.src && <small>{t.noAudio}</small>}
      </div>
    </aside>
  );
}

function App() {
  const [language, setLanguage] = useStoredState('haoqi-language', defaultLanguage);
  const [theme, setTheme] = useStoredState('haoqi-theme', 'night');
  const [activeTrack, setActiveTrack] = useStoredState('haoqi-track', musicTracks[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
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
    const move = (event) => { cursor.style.transform = 'translate3d(' + event.clientX + 'px, ' + event.clientY + 'px, 0)'; };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const pageClassName = useMemo(() => 'site-shell theme-' + theme, [theme]);

  return (
    <div className={pageClassName}>
      <div className="custom-cursor" ref={cursorRef} aria-hidden="true" />
      <Header language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} menuOpen={menuOpen} setMenuOpen={setMenuOpen} t={t} />
      <main>
        <Hero t={t} runtime={runtime} />
        <AboutSection t={t} runtime={runtime} />
        <GameSection t={t} />
        <MusicSection t={t} activeTrack={activeTrack} setActiveTrack={setActiveTrack} />
        <PhotoSection t={t} />
        <UploadSection t={t} />
        <ContactSection t={t} />
      </main>
      <SidebarPlayer t={t} activeTrack={activeTrack} setActiveTrack={setActiveTrack} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
