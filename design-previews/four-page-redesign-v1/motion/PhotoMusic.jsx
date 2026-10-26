import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { mediaBase, musicTracks, photoAlbums } from '../../../src/content.deploy.js';
import { artworkCatalog } from '../../../src/work-archive/artworkCatalog.js';
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

export function Photography({ motion = true }) {
  const root = useRef(null), source = useRef(null), dialog = useRef(null), expanded = useRef(null), transition = useRef(null);
  const [open, setOpen] = useState(false), [fullReady, setFullReady] = useState(false), [closing, setClosing] = useState(false);
  const original = photograph.images[0].src;
  const origin = useRef(null);

  useEffect(() => () => transition.current?.cancel(), []);
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
        setOpen(false);
        setClosing(false);
      }
    });
    let ancestor = root.current?.parentElement;
    while (ancestor) { observer.observe(ancestor, { attributes: true, attributeFilter: ['hidden'] }); ancestor = ancestor.parentElement; }
    return () => {
      active = false;
      observer.disconnect();
      document.documentElement.style.overflow = previousOverflow;
      if (modal.open) modal.close();
    };
  }, [open]);

  const show = () => {
    if (open) return;
    origin.current = source.current.getBoundingClientRect();
    setClosing(false);
    setOpen(true);
  };
  const close = async () => {
    if (closing || !open) return;
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
    dialog.current?.close();
    animation.cancel();
    setOpen(false);
    setClosing(false);
    source.current?.focus({ preventScroll: true });
  };

  return <section ref={root} className="pm-photo" data-motion={motion ? 'full' : 'reduced'}>
    <header className="pm-photo-heading">
      <h1 data-enter="title">Photography</h1>
      <p data-enter="copy">把路过的地方，留在这里。</p>
    </header>
    <figure className="pm-photo-figure" data-enter="media">
      <button className="pm-photo-open" ref={source} onClick={show} aria-label="放大查看阳朔全景" style={{ visibility: open ? 'hidden' : 'visible' }} data-testid="photo-open">
        <img src={photoPreview} alt="广西桂林阳朔相公山的山峰、江流与日落全景" fetchPriority="high" />
        <span className="pm-photo-cue">展开全景 <Arrow /></span>
      </button>
      <figcaption className="pm-photo-caption">
        <h2>阳朔</h2>
        <p>{photograph.city} <span>{photograph.date}</span></p>
        <button className="pm-action" onClick={show}>查看原图 <Arrow /></button>
      </figcaption>
    </figure>
    <section className="pm-photo-albums" aria-labelledby="pm-photo-albums-title" data-enter="copy">
      <h2 id="pm-photo-albums-title">摄影相册</h2>
      <button onClick={show} className="pm-photo-album"><img src={photoPreview} alt="" loading="lazy" /><span><strong>阳朔</strong><span>{photograph.city} · {photograph.date}</span></span><Arrow /></button>
    </section>
    <dialog ref={dialog} className={`pm-photo-dialog ${closing ? 'pm-is-closing' : ''}`} aria-labelledby="pm-photo-dialog-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }} data-testid="photo-dialog">
      <div className="pm-photo-dialog-inner">
        <div className="pm-photo-dialog-bar"><h2 id="pm-photo-dialog-title">阳朔 / {photograph.date}</h2><button className="pm-dialog-close" onClick={close} autoFocus aria-label="关闭原图">关闭 <svg viewBox="0 0 24 24" aria-hidden="true" className="pm-icon"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
        <img ref={expanded} className="pm-photo-expanded" src={fullReady ? original : photoPreview} alt="阳朔相公山全景原图" />
        <div className="pm-photo-dialog-meta"><p>{photograph.city}</p><a href={original} target="_blank" rel="noreferrer">在新标签页查看原图 <Arrow /></a></div>
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

export function Music({ motion = true }) {
  const [albumIndex, setAlbumIndex] = useState(5), [now, setNow] = useState(null), [paused, setPaused] = useState(true), [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0), [duration, setDuration] = useState(0), [loading, setLoading] = useState(false);
  const [outgoing, setOutgoing] = useState(null), [slideDirection, setSlideDirection] = useState(1);
  const audio = useRef(null), cover = useRef(null), previousCover = useRef(null), animation = useRef([]), request = useRef(0), switching = useRef(0);
  const album = albums[albumIndex], playingAlbum = now ? albums[now.album] : album, playingTrack = now ? playingAlbum.tracks[now.track] : null;

  useEffect(() => () => { request.current += 1; animation.current.forEach(item => item.cancel()); audio.current?.pause(); }, []);
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
    switching.current += 1;
    animation.current.forEach(item => item.cancel());
    setOutgoing(album);
    setSlideDirection(index > albumIndex ? 1 : -1);
    setAlbumIndex(index);
  };
  const play = async (nextAlbum, nextTrack) => {
    const element = audio.current, track = albums[nextAlbum].tracks[nextTrack], version = ++request.current;
    const sameTrack = now?.album === nextAlbum && now?.track === nextTrack;
    setError('');
    setLoading(true);
    if (!sameTrack || !element.src) {
      element.src = track.src;
      setNow({ album: nextAlbum, track: nextTrack });
      setCurrentTime(0);
      setDuration(0);
    }
    try {
      await element.play();
      if (request.current === version) { setPaused(false); setLoading(false); }
    } catch (failure) {
      if (request.current !== version) return;
      setPaused(true);
      setLoading(false);
      if (failure.name !== 'AbortError') setError('暂时无法播放这首曲目，请重试或选择其他曲目。');
    }
  };
  const toggle = () => {
    if (!playingTrack) { play(albumIndex, 0); return; }
    if (audio.current.paused) play(now.album, now.track);
    else { request.current += 1; audio.current.pause(); setPaused(true); setLoading(false); }
  };
  const moveTrack = offset => {
    const index = now?.album ?? albumIndex, trackIndex = now?.track ?? 0;
    play(index, (trackIndex + offset + albums[index].tracks.length) % albums[index].tracks.length);
  };

  return <section className="pm-music" data-motion={motion ? 'full' : 'reduced'}>
    <header className="pm-music-heading"><h1 data-enter="title">Music</h1><p data-enter="copy">私人聆听室</p></header>
    <div className="pm-listening-room">
      <div className="pm-cover-stage" data-enter="media" data-testid="music-cover-stage">
        {outgoing && <img className="pm-album-cover pm-cover-outgoing" ref={previousCover} src={outgoing.cover} alt="" aria-hidden="true" />}
        <img className="pm-album-cover" ref={cover} src={album.cover} alt={`${album.title} 专辑封面`} fetchPriority="high" data-testid="music-cover" />
      </div>
      <div className="pm-album-content" data-enter="copy">
        <h2 className={`pm-album-title ${album.title.length > 42 ? 'pm-long-title' : ''}`}>{album.title}</h2>
        <p className="pm-album-artist">{album.artist.replaceAll('/', ' · ')}</p>
        <div className="pm-album-play-row"><button className="pm-action" onClick={() => now?.album === albumIndex ? toggle() : play(albumIndex, 0)} data-testid="music-play-album"><PlayIcon paused={now?.album !== albumIndex || paused} />{now?.album === albumIndex && !paused ? '暂停播放' : '播放专辑'}</button><span>{album.tracks.length} 首曲目</span></div>
        <ol className="pm-track-list" aria-label={`${album.title} 曲目`} data-testid="music-tracks">{album.tracks.map((track, index) => {
          const selected = now?.album === albumIndex && now?.track === index;
          return <li key={track.id}><button className={`pm-track ${selected ? 'pm-track-selected' : ''}`} onClick={() => selected ? toggle() : play(albumIndex, index)} aria-label={`${selected && !paused ? '暂停' : '播放'} ${track.title}`} aria-current={selected ? 'true' : undefined}><span className="pm-track-index">{selected && !paused ? <PlayIcon paused={false} /> : index + 1}</span><span className="pm-track-name"><strong>{track.title}</strong><span>{track.artist.replaceAll(',', ' · ')}</span></span><PlayIcon paused={!selected || paused} /></button></li>;
        })}</ol>
      </div>
    </div>
    <section className="pm-player" aria-label="音乐播放控制" data-enter="copy">
      <div className="pm-player-title"><p>{playingTrack?.title || '选择一首歌，开始聆听。'}</p><span>{playingTrack ? playingTrack.artist : '个人音乐收藏 · 第三方唱片'}</span></div>
      <div className="pm-transport"><button onClick={() => moveTrack(-1)} aria-label="上一首"><TransportIcon /></button><button className="pm-play-toggle" onClick={toggle} aria-label={paused ? '播放' : '暂停'} data-testid="music-play-toggle"><PlayIcon paused={paused} /></button><button onClick={() => moveTrack(1)} aria-label="下一首"><TransportIcon next /></button></div>
      <div className="pm-seek"><time>{durationText(currentTime)}</time><input aria-label="播放进度" type="range" min="0" max={duration || 1} step="0.1" value={Math.min(currentTime, duration || 1)} disabled={!duration} onChange={event => { const time = Number(event.target.value); audio.current.currentTime = time; setCurrentTime(time); }} /><time>{duration ? durationText(duration) : '—'}</time></div>
      <p className={`pm-player-status ${error ? 'pm-error' : ''}`} role="status">{error || (loading ? '正在加载音频…' : '')}</p>
      {error && <button className="pm-retry" onClick={() => now && play(now.album, now.track)}>重试播放</button>}
      <audio ref={audio} preload="none" onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)} onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)} onPause={() => setPaused(true)} onPlay={() => setPaused(false)} onPlaying={() => setLoading(false)} onWaiting={() => setLoading(true)} onEnded={() => moveTrack(1)} onError={() => { setPaused(true); setLoading(false); setError('音频未能加载，请重试或选择其他曲目。'); }} />
    </section>
    <section className="pm-collection" aria-labelledby="pm-collection-title" data-enter="copy"><div className="pm-collection-heading"><h2 id="pm-collection-title">我的音乐收藏</h2><p>十二张唱片，随时切换。</p></div><div className="pm-album-library" data-testid="music-albums">{albums.map((item, index) => <button key={item.id} onClick={() => chooseAlbum(index)} className={`pm-album-choice ${index === albumIndex ? 'pm-album-choice-current' : ''}`} aria-pressed={index === albumIndex} aria-label={`查看专辑 ${item.title}`}><img src={item.cover} alt="" loading="lazy" /><span>{item.title}</span></button>)}</div></section>
  </section>;
}
