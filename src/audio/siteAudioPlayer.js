// The dock and page controls share this one media element. Commands update the
// intent immediately; media events report what the element is actually doing.
export function createSiteAudioPlayer(audio, tracks, { onState, target = window } = {}) {
  let track = tracks[0] || null;
  let wantsPlayback = false;
  let request = 0;
  let selection = 0;
  let boundSelection = -1;
  let boundSource = '';
  let changingSource = false;
  let metadataReady = false;
  let pendingSeek = null;
  let disposed = false;
  let state = { trackId: track?.id || null, isPlaying: false, loading: false, currentTime: 0, duration: 0, error: null };
  const cleanups = [];

  const listen = (element, type, handler) => {
    element.addEventListener(type, handler);
    cleanups.push(() => element.removeEventListener(type, handler));
  };
  const publish = (patch = {}, force = false) => {
    if (disposed) return;
    const next = { ...state, ...patch };
    const changed = Object.keys(next).some((key) => next[key] !== state[key]);
    state = next;
    if (!changed && !force) return;
    onState?.({ ...state });
    target.dispatchEvent(new CustomEvent('haoqi-player-state', { detail: { ...state } }));
  };
  // A paused selection can differ from the last resource on the media element.
  // Ignore that resource's queued events until explicit playback binds this one.
  const currentSource = () => boundSelection === selection && !!boundSource
    && audio.src === boundSource && (!audio.currentSrc || audio.currentSrc === boundSource);
  const timing = () => {
    const duration = metadataReady && currentSource() && Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    return { duration, currentTime: duration && Number.isFinite(audio.currentTime) ? Math.max(0, Math.min(duration, audio.currentTime)) : 0 };
  };
  const seek = (time) => {
    if (typeof time !== 'number' || !Number.isFinite(time)) return;
    const { duration } = timing();
    if (!duration) { pendingSeek = Math.max(0, time); return; }
    pendingSeek = null;
    audio.currentTime = Math.max(0, Math.min(duration, time));
    publish(timing());
  };
  const play = () => {
    if (!track?.src || disposed) return;
    wantsPlayback = true;
    const token = ++request;
    if (boundSelection !== selection || audio.error) {
      metadataReady = false;
      changingSource = true;
      try {
        audio.pause();
        audio.src = track.src;
        boundSource = audio.src; // Browsers resolve relative paths to absolute URLs.
        audio.load();
        boundSelection = selection;
      } catch {
        wantsPlayback = false;
        boundSelection = -1;
        publish({ isPlaying: false, loading: false, error: '音频加载失败，请点击播放重试。' });
        return;
      } finally { changingSource = false; }
    }
    publish({ ...timing(), loading: true, error: null });
    let result;
    try { result = audio.play(); } catch (error) { result = Promise.reject(error); }
    Promise.resolve(result).then(() => {
      if (disposed || token !== request || !wantsPlayback) return;
      publish({ ...timing(), isPlaying: !audio.paused, loading: audio.readyState < 3, error: null });
    }).catch(() => {
      if (disposed || token !== request || !wantsPlayback) return;
      wantsPlayback = false;
      publish({ isPlaying: false, loading: false, error: '无法播放，请点击播放重试。' });
    });
  };
  const pause = () => {
    wantsPlayback = false;
    request += 1;
    audio.pause();
    publish({ ...timing(), isPlaying: false, loading: false });
  };
  const select = (next, autoplay = wantsPlayback) => {
    if (!next) return;
    request += 1;
    changingSource = true;
    audio.pause();
    track = next;
    selection += 1;
    wantsPlayback = autoplay;
    metadataReady = false;
    pendingSeek = null;
    changingSource = false;
    publish({ trackId: next.id, currentTime: 0, duration: 0, isPlaying: false, loading: autoplay, error: null }, true);
    if (autoplay) play();
  };
  const changeTrack = (direction, autoplay = wantsPlayback) => {
    if (!tracks.length) return;
    const index = Math.max(0, tracks.findIndex((item) => item.id === track?.id));
    select(tracks[(index + direction + tracks.length) % tracks.length], autoplay);
  };
  const playTrack = (trackId) => {
    const next = tracks.find((item) => item.id === trackId);
    if (!next) return;
    if (next.id !== track?.id) { select(next, true); return; }
    seek(0);
    play();
  };
  const toggle = () => { if (wantsPlayback) pause(); else play(); };

  listen(audio, 'loadedmetadata', () => {
    if (changingSource || !currentSource() || !audio.currentSrc || audio.readyState < 1) return;
    metadataReady = true;
    if (pendingSeek !== null) seek(pendingSeek);
    publish({ ...timing(), loading: wantsPlayback && audio.readyState < 3 });
  });
  listen(audio, 'durationchange', () => { if (!changingSource && currentSource() && metadataReady) publish(timing()); });
  listen(audio, 'timeupdate', () => { if (!changingSource && currentSource()) publish(timing()); });
  listen(audio, 'seeked', () => { if (!changingSource && currentSource()) publish(timing()); });
  listen(audio, 'play', () => {
    if (changingSource || !currentSource() || audio.paused) return;
    if (!wantsPlayback) { audio.pause(); return; }
    publish({ isPlaying: !audio.paused, loading: audio.readyState < 3, error: null });
  });
  listen(audio, 'playing', () => {
    if (changingSource || !currentSource() || audio.paused) return;
    if (!wantsPlayback) { audio.pause(); return; }
    publish({ ...timing(), isPlaying: true, loading: false, error: null });
  });
  listen(audio, 'pause', () => {
    if (changingSource || !currentSource() || !audio.paused) return;
    if (!audio.ended) { wantsPlayback = false; request += 1; }
    publish({ ...timing(), isPlaying: false, loading: false });
  });
  listen(audio, 'waiting', () => { if (!changingSource && currentSource() && wantsPlayback) publish({ loading: true }); });
  listen(audio, 'canplay', () => { if (!changingSource && currentSource() && audio.readyState >= 3) publish({ ...timing(), loading: false }); });
  listen(audio, 'ended', () => { if (!changingSource && currentSource() && audio.ended && wantsPlayback) changeTrack(1, true); });
  listen(audio, 'error', () => {
    if (changingSource || !currentSource() || !audio.error) return;
    wantsPlayback = false;
    request += 1;
    publish({ isPlaying: false, loading: false, error: '音频加载失败，请点击播放重试。' });
  });
  listen(target, 'haoqi-play-track', (event) => playTrack(event.detail?.trackId));
  listen(target, 'haoqi-player-command', (event) => {
    const command = event.detail;
    if (command?.type === 'toggle') toggle();
    else if (command?.type === 'seek') seek(command.time);
    else if (command?.type === 'previous') changeTrack(-1);
    else if (command?.type === 'next') changeTrack(1);
  });
  listen(target, 'haoqi-player-request-state', () => publish(timing(), true));
  // Even preload="none" can probe an assigned source when load() is called.
  // Initial state and paused navigation stay entirely logical until play().
  publish({}, true);

  return {
    toggle, changeTrack, playTrack, seek,
    dispose() {
      disposed = true;
      request += 1;
      cleanups.forEach((cleanup) => cleanup());
      audio.pause();
    },
  };
}
