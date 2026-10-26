import test from 'node:test';
import assert from 'node:assert/strict';
import { createSiteAudioPlayer } from './siteAudioPlayer.js';

class Media extends EventTarget {
  _src = '';
  sourceWrites = 0;
  loads = 0;
  get src() { return this._src; }
  set src(value) { this._src = value; this.sourceWrites += 1; }
  currentSrc = '';
  currentTime = 0;
  duration = NaN;
  readyState = 0;
  paused = true;
  ended = false;
  error = null;
  plays = [];
  load() { this.loads += 1; this.currentSrc = this.src; this.currentTime = 0; this.duration = NaN; this.readyState = 0; this.error = null; this.ended = false; }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  play() {
    assert.ok(this.src, 'play() requires a bound media source');
    this.paused = false;
    this.dispatchEvent(new Event('play'));
    return new Promise((resolve, reject) => this.plays.push({ resolve, reject }));
  }
  metadata(duration) { assert.ok(this.src, 'metadata requires a real media source'); this.readyState = 4; this.duration = duration; this.dispatchEvent(new Event('loadedmetadata')); }
}
const tracks = [{ id: 'first', src: '/first.mp3' }, { id: 'second', src: '/second.mp3' }];
const tick = () => new Promise((resolve) => setImmediate(resolve));
function fixture() {
  const audio = new Media();
  const target = new EventTarget();
  const states = [];
  target.addEventListener('haoqi-player-state', (event) => states.push(event.detail));
  const player = createSiteAudioPlayer(audio, tracks, { target });
  const command = (detail) => target.dispatchEvent(new CustomEvent('haoqi-player-command', { detail }));
  const requestTrack = (trackId) => target.dispatchEvent(new CustomEvent('haoqi-play-track', { detail: { trackId } }));
  return { audio, target, states, player, command, requestTrack, state: () => states.at(-1) };
}

test('page commands share the dock source, clear old timing, and report actual media time', async () => {
  const f = fixture();
  f.requestTrack('first');
  f.audio.metadata(200);
  f.audio.plays.at(-1).resolve();
  await tick();
  f.audio.currentTime = 42;
  f.audio.dispatchEvent(new Event('timeupdate'));
  assert.equal(f.state().currentTime, 42);
  f.requestTrack('second');
  assert.equal(f.audio.src, '/second.mp3');
  assert.equal(f.state().trackId, 'second');
  assert.equal(f.state().duration, 0);
  assert.equal(f.state().currentTime, 0);
  f.command({ type: 'seek', time: 700 });
  f.audio.metadata(150);
  assert.equal(f.audio.currentTime, 150);
  f.command({ type: 'seek', time: -10 });
  assert.equal(f.audio.currentTime, 0);
  f.command({ type: 'seek', time: NaN });
  assert.equal(f.audio.currentTime, 0);
  const count = f.states.length;
  f.target.dispatchEvent(new Event('haoqi-player-request-state'));
  assert.equal(f.states.length, count + 1);
  assert.equal(f.state().duration, 150);
  f.player.dispose();
});

test('initialization and paused selection do not attach or load any audio resource', () => {
  const f = fixture();
  assert.equal(f.state().trackId, 'first');
  assert.equal(f.audio.src, '');
  assert.equal(f.audio.sourceWrites, 0);
  assert.equal(f.audio.loads, 0);
  f.command({ type: 'next' });
  assert.equal(f.state().trackId, 'second');
  f.command({ type: 'previous' });
  f.command({ type: 'next' });
  assert.equal(f.state().trackId, 'second');
  assert.equal(f.audio.sourceWrites, 0);
  assert.equal(f.audio.loads, 0);
  assert.equal(f.audio.plays.length, 0);
  f.command({ type: 'seek', time: 25 });
  f.target.dispatchEvent(new Event('haoqi-player-request-state'));
  assert.equal(f.state().duration, 0);
  assert.equal(f.state().currentTime, 0);
  assert.equal(f.audio.sourceWrites, 0);
  f.command({ type: 'toggle' });
  assert.equal(f.audio.src, '/second.mp3');
  assert.equal(f.audio.sourceWrites, 1);
  assert.equal(f.audio.loads, 1);
  f.audio.metadata(80);
  assert.equal(f.audio.currentTime, 25);
  f.player.dispose();
});

test('rapid commands ignore stale playback failures and preserve pause on next/previous', async () => {
  const f = fixture();
  f.requestTrack('first');
  const stale = f.audio.plays.at(-1);
  f.requestTrack('second');
  f.audio.metadata(100);
  f.audio.plays.at(-1).resolve();
  await tick();
  stale.reject(new Error('Old source aborted'));
  await tick();
  assert.equal(f.state().error, null);
  assert.equal(f.state().trackId, 'second');
  assert.equal(f.state().isPlaying, true);
  f.command({ type: 'toggle' });
  assert.equal(f.state().isPlaying, false);
  f.command({ type: 'previous' });
  assert.equal(f.state().trackId, 'first');
  assert.equal(f.audio.paused, true);
  f.command({ type: 'next' });
  assert.equal(f.state().trackId, 'second');
  assert.equal(f.audio.paused, true);
  f.player.dispose();
});

test('failed playback can retry and disposal removes window listeners', async () => {
  const f = fixture();
  f.command({ type: 'toggle' });
  f.audio.plays.at(-1).reject(new Error('Blocked'));
  await tick();
  assert.match(f.state().error, /重试/);
  f.command({ type: 'toggle' });
  f.audio.metadata(70);
  f.audio.plays.at(-1).resolve();
  await tick();
  assert.equal(f.state().error, null);
  assert.equal(f.state().isPlaying, true);
  f.player.dispose();
  const count = f.states.length;
  f.requestTrack('second');
  assert.equal(f.states.length, count);
  assert.equal(f.audio.src, '/first.mp3');
});

test('paused navigation ignores old source events and binds only the final selection on play', async () => {
  const f = fixture();
  f.requestTrack('first');
  f.audio.metadata(120);
  f.audio.plays.at(-1).resolve();
  await tick();
  f.audio.currentTime = 37;
  f.command({ type: 'toggle' });
  f.command({ type: 'next' });
  assert.equal(f.audio.src, '/first.mp3', 'paused navigation leaves the existing resource untouched');
  assert.equal(f.audio.loads, 1);
  const snapshot = { ...f.state() };
  f.audio.error = { code: 2 };
  f.audio.ended = true;
  for (const type of ['loadedmetadata', 'durationchange', 'timeupdate', 'seeked', 'play', 'playing', 'pause', 'waiting', 'canplay', 'ended', 'error']) {
    f.audio.dispatchEvent(new Event(type));
    assert.deepEqual(f.state(), snapshot, `old ${type} cannot change the selected track`);
  }
  f.command({ type: 'previous' });
  f.command({ type: 'next' });
  assert.equal(f.audio.loads, 1);
  f.command({ type: 'toggle' });
  assert.equal(f.audio.src, '/second.mp3');
  assert.equal(f.audio.loads, 2);
  assert.equal(f.state().duration, 0);
  // A queued event cannot supply timing from the previous currentSrc.
  f.audio.currentSrc = '/first.mp3';
  f.audio.metadata(120);
  assert.equal(f.state().duration, 0);
  f.audio.currentSrc = '/second.mp3';
  f.audio.metadata(95);
  f.audio.plays.at(-1).resolve();
  await tick();
  assert.equal(f.state().duration, 95);
  assert.equal(f.state().isPlaying, true);
  f.player.dispose();
});

test('resume preserves time and replaying the selected track resets time without reloading it', async () => {
  const f = fixture();
  f.requestTrack('first');
  f.audio.metadata(150);
  f.audio.plays.at(-1).resolve();
  await tick();
  f.command({ type: 'seek', time: 42 });
  f.command({ type: 'toggle' });
  f.command({ type: 'toggle' });
  f.audio.plays.at(-1).resolve();
  await tick();
  assert.equal(f.audio.currentTime, 42);
  assert.equal(f.audio.loads, 1);
  f.requestTrack('first');
  assert.equal(f.audio.currentTime, 0);
  assert.equal(f.audio.sourceWrites, 1);
  assert.equal(f.audio.loads, 1);
  f.audio.plays.at(-1).resolve();
  await tick();
  assert.equal(f.state().currentTime, 0);
  assert.equal(f.state().isPlaying, true);
  f.player.dispose();
});

test('deferred seeks use the latest valid time and do not leak into another selection', () => {
  const f = fixture();
  f.player.seek(35);
  f.player.seek(12);
  f.player.seek(Infinity);
  f.command({ type: 'toggle' });
  f.audio.metadata(100);
  assert.equal(f.audio.currentTime, 12);
  f.command({ type: 'toggle' });
  f.command({ type: 'next' });
  f.player.seek(70);
  f.command({ type: 'previous' });
  assert.equal(f.audio.loads, 1);
  f.command({ type: 'toggle' });
  f.audio.metadata(100);
  assert.equal(f.audio.currentTime, 0, 'returning to a selected track starts its new selection at zero');
  assert.equal(f.audio.loads, 2);
  f.player.dispose();
});

test('rapid autoplay next/previous and a final pause invalidate all earlier play results', async () => {
  const f = fixture();
  f.requestTrack('first');
  const firstAttempt = f.audio.plays.at(-1);
  f.command({ type: 'next' });
  const secondAttempt = f.audio.plays.at(-1);
  f.command({ type: 'previous' });
  const finalAttempt = f.audio.plays.at(-1);
  assert.equal(f.audio.loads, 3);
  f.command({ type: 'toggle' });
  f.command({ type: 'next' });
  assert.equal(f.audio.loads, 3, 'the paused final selection must not load');
  firstAttempt.resolve();
  secondAttempt.reject(new Error('interrupted previous source'));
  finalAttempt.reject(new Error('paused current source'));
  await tick();
  assert.equal(f.state().trackId, 'second');
  assert.equal(f.state().error, null);
  assert.equal(f.state().isPlaying, false);
  assert.equal(f.state().loading, false);
  f.player.dispose();
});

test('only an active media source that actually ended advances automatically', async () => {
  const f = fixture();
  f.requestTrack('first');
  f.audio.metadata(100);
  f.audio.plays.at(-1).resolve();
  await tick();
  f.audio.dispatchEvent(new Event('ended'));
  assert.equal(f.state().trackId, 'first', 'an obsolete ended event is ignored');
  f.audio.ended = true;
  f.audio.paused = true;
  f.audio.dispatchEvent(new Event('pause'));
  f.audio.dispatchEvent(new Event('ended'));
  assert.equal(f.state().trackId, 'second');
  assert.equal(f.audio.loads, 2);
  f.audio.dispatchEvent(new Event('ended'));
  assert.equal(f.state().trackId, 'second', 'a queued duplicate cannot skip the next track');
  f.player.dispose();
});

test('a real media failure retries the selected resource and blank-source events are ignored', async () => {
  const f = fixture();
  const initial = { ...f.state() };
  for (const type of ['loadedmetadata', 'playing', 'error', 'canplay', 'ended']) f.audio.dispatchEvent(new Event(type));
  assert.deepEqual(f.state(), initial);
  f.command({ type: 'toggle' });
  const failedAttempt = f.audio.plays.at(-1);
  f.audio.error = { code: 2 };
  f.audio.dispatchEvent(new Event('error'));
  assert.match(f.state().error, /加载失败/);
  f.command({ type: 'toggle' });
  assert.equal(f.audio.loads, 2);
  assert.equal(f.audio.error, null);
  f.audio.metadata(75);
  f.audio.plays.at(-1).resolve();
  failedAttempt.reject(new Error('previous failed load'));
  await tick();
  assert.equal(f.state().error, null);
  assert.equal(f.state().duration, 75);
  assert.equal(f.state().isPlaying, true);
  f.player.dispose();
});
