import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { mediaBase, musicTracks, photoAlbums } from '../content.deploy.js';
import { artworkCatalog } from '../work-archive/artworkCatalog.js';
import { photoMusicCopy } from './photo-music-copy.js';
import { emitSiteSound } from '../audio/siteSoundEvents.js';
import './photo-music.css';

const media = path => mediaBase && path.startsWith('/media/') ? mediaBase + path : path;
const photograph = photoAlbums.find(album => !album.pending);
const photoPreview = new URL('./panorama.webp', import.meta.url).href;
const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

function Arrow({ direction = 'right' }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={`pm-icon pm-icon-${direction}`}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}

function PlayIcon({ paused = true }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="pm-icon">{paused ? <path d="m9 5 11 7-11 7Z" className="pm-fill" /> : <path d="M8 5v14M16 5v14" className="pm-pause" />}</svg>;
}

export function Photography({ motion = true, language = 'mixed' }) {
  const t = photoMusicCopy(language);
  const root = useRef(null), source = useRef(null), dialog = useRef(null), expanded = useRef(null), transition = useRef(null);
  const [open, setOpen] = useState(false), [fullReady, setFullReady] = useState(false), [closing, setClosing] = useState(false);
  const original = photograph.images[0].src;
  const origin = useRef(null), closeRequest = useRef(0);
  const interaction = useRef({ open: false, closing: false });

  useEffect(() => { if (!motion) transition.current?.cancel(); }, [motion]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const modal = dialog.current;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    modal.showModal();
    const image = expanded.current, end = image.getBoundingClientRect(), start = origin.current;
    transition.current?.cancel();
    if (motion && start && end.width && end.height) {
      transition.current = image.animate([
        { transformOrigin: '0 0', transform: `translate(${start.left - end.left}px, ${start.top - end.top}px) scale(${start.width / end.width}, ${start.height / end.height})` },
        { transformOrigin: '0 0', transform: 'translate(0, 0) scale(1)' },
      ], { duration: 480, easing: ease });
    }
    let active = true;
    const full = new Image();
    full.onload = () => { if (active) setFullReady(true); };
    full.src = original;
    const observer = new MutationObserver(() => {
      if (root.current?.closest('[hidden]')) {
        transition.current?.cancel();
        modal.close();
        interaction.current = { open: false, closing: false };
        setOpen(false);
        setClosing(false);
      }
    });
    let ancestor = root.current?.parentElement;
    while (ancestor) { observer.observe(ancestor, { attributes: true, attributeFilter: ['hidden'] }); ancestor = ancestor.parentElement; }
    return () => {
      active = false;
      closeRequest.current += 1;
      interaction.current = { open: false, closing: false };
      transition.current?.cancel();
      observer.disconnect();
      full.onload = null;
      document.documentElement.style.overflow = previousOverflow;
      if (modal.open) modal.close();
    };
  }, [open]);

  const show = () => {
    if (interaction.current.open) return;
    interaction.current = { open: true, closing: false };
    origin.current = source.current.getBoundingClientRect();
    emitSiteSound('page-open');
    setClosing(false);
    setOpen(true);
  };
  const close = async () => {
    if (interaction.current.closing || !interaction.current.open) return;
    interaction.current.closing = true;
    emitSiteSound('page-close');
    const version = ++closeRequest.current;
    setClosing(true);
    const image = expanded.current, start = image.getBoundingClientRect(), end = source.current.getBoundingClientRect();
    transition.current?.cancel();
    const base = image.getBoundingClientRect();
    const frames = motion ? [
      { transformOrigin: '0 0', transform: `translate(${start.left - base.left}px, ${start.top - base.top}px) scale(${start.width / base.width}, ${start.height / base.height})`, opacity: 1 },
      { transformOrigin: '0 0', transform: `translate(${end.left - base.left}px, ${end.top - base.top}px) scale(${end.width / base.width}, ${end.height / base.height})`, opacity: 1 },
    ] : [{ opacity: 1 }, { opacity: 0 }];
    const animation = image.animate(frames, { duration: motion ? 300 : 100, easing: ease, fill: 'forwards' });
    transition.current = animation;
    try { await animation.finished; } catch { /* An interruption closes to the same resting state. */ }
    if (version !== closeRequest.current) return;
    dialog.current?.close();
    animation.cancel();
    interaction.current = { open: false, closing: false };
    setOpen(false);
    setClosing(false);
    source.current?.focus({ preventScroll: true });
  };

  return <section ref={root} className="pm-photo" data-motion={motion ? 'full' : 'reduced'} data-language={language}>
    <header className="pm-photo-heading">
      <h1 data-enter="title">{t.photography}</h1>
      <p data-enter="copy">{t.photoIntro}</p>
    </header>
    <figure className="pm-photo-figure" data-enter="media">
      <button className="pm-photo-open" ref={source} onClick={show} aria-label={t.expandLabel} style={{ visibility: open ? 'hidden' : 'visible' }} data-testid="photo-open">
        <img src={photoPreview} alt={t.photoAlt} fetchPriority="high" />
        <span className="pm-photo-cue">{t.expand} <Arrow /></span>
      </button>
      <figcaption className="pm-photo-caption">
        <h2>{t.photoTitle}</h2>
        <p>{photograph.city} <span>{photograph.date}</span></p>
        <button className="pm-action" onClick={show}>{t.original} <Arrow /></button>
      </figcaption>
    </figure>
    <section className="pm-photo-albums" aria-labelledby="pm-photo-albums-title" data-enter="copy">
      <h2 id="pm-photo-albums-title">{t.albums}</h2>
      <button onClick={show} className="pm-photo-album"><img src={photoPreview} alt="" loading="lazy" /><span><strong>{t.photoTitle}</strong><span>{photograph.city} · {photograph.date}</span></span><Arrow /></button>
    </section>
    <dialog ref={dialog} className={`pm-photo-dialog ${closing ? 'pm-is-closing' : ''}`} aria-labelledby="pm-photo-dialog-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }} data-testid="photo-dialog">
      <div className="pm-photo-dialog-inner">
        <div className="pm-photo-dialog-bar"><h2 id="pm-photo-dialog-title">{t.photoTitle} / {photograph.date}</h2><button className="pm-dialog-close" onClick={close} autoFocus aria-label={t.closeOriginal}>{t.close} <svg viewBox="0 0 24 24" aria-hidden="true" className="pm-icon"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
        <img ref={expanded} className="pm-photo-expanded" src={fullReady ? original : photoPreview} alt={t.fullAlt} />
        <div className="pm-photo-dialog-meta"><p>{photograph.city}</p><a href={original} target="_blank" rel="noreferrer">{t.newTab} <Arrow /></a></div>
      </div>
    </dialog>
  </section>;
}

const cleanedTrack = (track, album) => {
  if (track.title !== 'READING MP3 METADATA') return track;
  let filename = track.src.split('/').at(-1).replace(/\.mp3$/i, '');
  try { filename = decodeURIComponent(filename); } catch { /* Raw filenames remain readable. */ }
  const parts = filename.split(' - ');
  if (parts.length < 2) return { ...track, title: filename, artist: album.artist };
  const first = parts[0];
  const artistFirst = /^(Reol|Hoshina Anniversary|Mariya Ise|TeddyLoid|Aimee b)(,|$)/i.test(first);
  return { ...track, title: artistFirst ? parts.slice(1).join(' - ') : parts.slice(0, -1).join(' - '), artist: artistFirst ? first : parts.at(-1) };
};
const albums = musicTracks.filter(album => !album.pending && album.tracks?.length).map(album => {
  const entry = artworkCatalog[album.archiveCode];
  const result = { ...album, title: entry?.metadata?.album || album.title, artist: entry?.metadata?.artist || album.tracks[0].artist, cover: media(entry?.cover || album.image) };
  return { ...result, tracks: album.tracks.map(track => cleanedTrack(track, result)) };
});
const durationText = seconds => Number.isFinite(seconds) && seconds >= 0 ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '—';

function TransportIcon({ next = false }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={`pm-icon ${next ? 'pm-next-icon' : ''}`}><path d="M5 5v14m14-14-11 7 11 7Z" /></svg>;
}

const command = (type, time) => window.dispatchEvent(new CustomEvent('haoqi-player-command', { detail: { type, ...(time === undefined ? {} : { time }) } }));

export function Music({ motion = true, language = 'mixed' }) {
  const t = photoMusicCopy(language);
  const [albumIndex, setAlbumIndex] = useState(5);
  const [playback, setPlayback] = useState({ trackId: null, isPlaying: false, loading: false, currentTime: 0, duration: 0, error: '' });
  const [outgoing, setOutgoing] = useState(null), [slideDirection, setSlideDirection] = useState(1);
  const cover = useRef(null), previousCover = useRef(null), animation = useRef([]), switching = useRef(0);
  const album = albums[albumIndex];
  const playingAlbumIndex = albums.findIndex(item => item.tracks.some(track => track.id === playback.trackId));
  const playingAlbum = albums[playingAlbumIndex];
  const playingTrack = playingAlbum?.tracks.find(track => track.id === playback.trackId);
  const paused = !playback.isPlaying;
  const currentTime = Number.isFinite(playback.currentTime) ? Math.max(0, playback.currentTime) : 0;
  const duration = Number.isFinite(playback.duration) ? Math.max(0, playback.duration) : 0;
  const { loading, error } = playback;

  useEffect(() => {
    const receive = event => {
      if (event.detail && typeof event.detail === 'object') setPlayback(event.detail);
    };
    window.addEventListener('haoqi-player-state', receive);
    window.dispatchEvent(new CustomEvent('haoqi-player-request-state'));
    return () => {
      window.removeEventListener('haoqi-player-state', receive);
      animation.current.forEach(item => item.cancel());
    };
  }, []);
  useLayoutEffect(() => {
    animation.current.forEach(item => item.cancel());
    animation.current = [];
    if (!outgoing) return undefined;
    if (!motion) { setOutgoing(null); return undefined; }
    const version = switching.current;
    const enter = cover.current.animate([{ transform: `translateX(${slideDirection * 14}%)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 420, easing: ease });
    const exit = previousCover.current?.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${-slideDirection * 9}%)`, opacity: 0 }], { duration: 280, easing: ease });
    animation.current = [enter, exit].filter(Boolean);
    enter.finished.then(() => { if (switching.current === version) setOutgoing(null); }).catch(() => {});
    return () => animation.current.forEach(item => item.cancel());
  }, [albumIndex, outgoing, motion]);

  const chooseAlbum = index => {
    if (index === albumIndex) return;
    emitSiteSound('filter', index > albumIndex ? 0.2 : -0.2);
    switching.current += 1;
    animation.current.forEach(item => item.cancel());
    setOutgoing(album);
    setSlideDirection(index > albumIndex ? 1 : -1);
    setAlbumIndex(index);
  };
  const play = (nextAlbum, nextTrack) => {
    const track = albums[nextAlbum]?.tracks[nextTrack];
    if (track) window.dispatchEvent(new CustomEvent('haoqi-play-track', { detail: { trackId: track.id } }));
  };
  const toggle = () => {
    if (!playingTrack) { play(albumIndex, 0); return; }
    command('toggle');
  };
  const moveTrack = offset => {
    if (!playingTrack) { play(albumIndex, 0); return; }
    command(offset < 0 ? 'previous' : 'next');
  };

  return <section className="pm-music" data-motion={motion ? 'full' : 'reduced'} data-language={language}>
    <header className="pm-music-heading"><h1 data-enter="title">{t.music}</h1><p data-enter="copy">{t.musicIntro}</p></header>
    <div className="pm-listening-room">
      <div className="pm-cover-stage" data-enter="media" data-testid="music-cover-stage">
        {outgoing && <img className="pm-album-cover pm-cover-outgoing" ref={previousCover} src={outgoing.cover} alt="" aria-hidden="true" />}
        <img className="pm-album-cover" ref={cover} src={album.cover} alt={`${album.title} · ${t.cover}`} fetchPriority="high" data-testid="music-cover" />
      </div>
      <div className="pm-album-content" data-enter="copy">
        <h2 className={`pm-album-title ${album.title.length > 42 ? 'pm-long-title' : ''}`}>{album.title}</h2>
        <p className="pm-album-artist">{album.artist.replaceAll('/', ' · ')}</p>
        <div className="pm-album-play-row"><button className="pm-action" onClick={() => playingAlbumIndex === albumIndex ? toggle() : play(albumIndex, 0)} data-site-sound="ui-tick" data-testid="music-play-album"><PlayIcon paused={playingAlbumIndex !== albumIndex || paused} />{playingAlbumIndex === albumIndex && !paused ? t.pausePlayback : t.playAlbum}</button><span>{t.trackCount(album.tracks.length)}</span></div>
        <ol className="pm-track-list" aria-label={`${album.title} · ${t.tracks}`} data-testid="music-tracks">{album.tracks.map((track, index) => {
          const selected = track.id === playback.trackId;
          return <li key={track.id}><button className={`pm-track ${selected ? 'pm-track-selected' : ''}`} onClick={() => selected ? toggle() : play(albumIndex, index)} data-site-sound="ui-tick" data-site-sound-repeat="true" aria-label={`${selected && !paused ? t.pause : t.play} ${track.title}`} aria-current={selected ? 'true' : undefined}><span className="pm-track-index">{selected && !paused ? <PlayIcon paused={false} /> : index + 1}</span><span className="pm-track-name"><strong>{track.title}</strong><span>{track.artist.replaceAll(',', ' · ')}</span></span><PlayIcon paused={!selected || paused} /></button></li>;
        })}</ol>
      </div>
    </div>
    <section className="pm-player" aria-label={t.controls} data-enter="copy">
      <div className="pm-player-title"><p>{playingTrack?.title || t.choose}</p><span>{playingTrack ? playingTrack.artist : t.collectionNote}</span></div>
      <div className="pm-transport"><button onClick={() => moveTrack(-1)} data-site-sound="gallery-prev" aria-label={t.previous}><TransportIcon /></button><button className="pm-play-toggle" onClick={toggle} data-site-sound="ui-tick" aria-label={paused ? t.play : t.pause} data-testid="music-play-toggle"><PlayIcon paused={paused} /></button><button onClick={() => moveTrack(1)} data-site-sound="gallery-next" aria-label={t.next}><TransportIcon next /></button></div>
      <div className="pm-seek"><time>{durationText(currentTime)}</time><input aria-label={t.progress} type="range" min="0" max={duration || 1} step="0.1" value={Math.min(currentTime, duration || 1)} disabled={!duration} onChange={event => command('seek', Number(event.target.value))} /><time>{duration ? durationText(duration) : '—'}</time></div>
      <p className={`pm-player-status ${error ? 'pm-error' : ''}`} role="status">{error ? t.playbackError : (loading ? t.loading : '')}</p>
      {error && <button className="pm-retry" data-site-sound="ui-tick" onClick={() => playingTrack && play(playingAlbumIndex, playingAlbum.tracks.indexOf(playingTrack))}>{t.retry}</button>}
    </section>
    <section className="pm-collection" aria-labelledby="pm-collection-title" data-enter="copy"><div className="pm-collection-heading"><h2 id="pm-collection-title">{t.collection}</h2><p>{t.collectionIntro(albums.length)}</p></div><div className="pm-album-library" data-testid="music-albums">{albums.map((item, index) => <button key={item.id} onClick={() => chooseAlbum(index)} className={`pm-album-choice ${index === albumIndex ? 'pm-album-choice-current' : ''}`} aria-pressed={index === albumIndex} aria-label={`${t.viewAlbum} ${item.title}`}><img src={item.cover} alt="" loading="lazy" /><span>{item.title}</span></button>)}</div></section>
  </section>;
}
