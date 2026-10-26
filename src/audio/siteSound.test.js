import test from 'node:test';
import assert from 'node:assert/strict';
import { createSoundController, SITE_SOUND_STORAGE } from './siteSound.js';
import { soundForActivation, attachSiteSoundActions } from './siteSoundEvents.js';
import { createWorkSoundSession } from '../work-archive/workSound.js';
import { workBootFrame } from '../work-archive/bootTimeline.js';

function fixture(saved, delayed = false) {
  const target = new EventTarget(), page = new EventTarget(), played = [], nodes = [], values = new Map(saved || []);
  target.location = { href: 'https://studio.test/' }; page.hidden = false;
  const param = () => ({ value: 0, changes: 0, cancelScheduledValues() {}, setTargetAtTime(value) { this.value = value; this.changes++; } });
  const node = () => { const n = { gain: param(), connect() {}, disconnect() {} }; nodes.push(n); return n; };
  let created = 0, complete, stopped = 0;
  const context = { state: 'suspended', currentTime: 0, destination: {}, createGain: node,
    createDynamicsCompressor: () => Object.assign(node(), Object.fromEntries(['threshold', 'knee', 'ratio', 'attack', 'release'].map(key => [key, param()]))),
    resume() { if (delayed) return new Promise(resolve => { complete = () => { this.state = 'running'; resolve(); }; }); this.state = 'running'; return Promise.resolve(); },
    suspend() { this.state = 'suspended'; return Promise.resolve(); }, close() { this.state = 'closed'; return Promise.resolve(); },
  };
  const sound = createSoundController({ target, document: page, supported: true,
    storage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) },
    createContext: () => { created++; return context; }, synthesize: (ctx, bus, type) => { played.push(type); return { end: ctx.currentTime + 1, stop: () => stopped++ }; },
  });
  return { sound, target, page, played, nodes, values, context, wake: () => sound.gesture({ isTrusted: true }), finish: () => complete(), get created() { return created; }, get stopped() { return stopped; } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('global preference defaults on, retires old Work-only mute, and first toggle mutes without needing opt-in', () => {
  const f = fixture([['haoqi-work-sound', 'off']]);
  assert.equal(f.sound.state().enabled, true); assert.equal(f.created, 0);
  f.sound.toggle(); assert.equal(f.sound.state().enabled, false); assert.equal(f.created, 0);
  f.wake(); assert.equal(f.created, 0); assert.equal(f.values.get(SITE_SOUND_STORAGE), 'off');
  f.sound.toggle(); assert.equal(f.sound.state().enabled, true); assert.equal(f.created, 1);
  f.wake(); f.wake(); assert.equal(f.created, 1); f.sound.dispose();
  const saved = fixture([[SITE_SOUND_STORAGE, 'off']]); assert.equal(saved.sound.state().enabled, false); saved.sound.dispose();
});

test('first activation survives only a brief device resume, with no queued click burst', async () => {
  const f = fixture([], true); f.wake();
  assert.equal(f.sound.activate('nav'), true); f.sound.activate('menu-open');
  assert.deepEqual(f.played, []); f.finish(); await flush();
  assert.deepEqual(f.played, ['menu-open']); f.sound.dispose();
  const muted = fixture([], true); muted.wake(); muted.sound.activate('nav'); muted.sound.setEnabled(false); muted.finish(); await flush();
  assert.deepEqual(muted.played, []); assert.equal(muted.context.state, 'suspended'); muted.sound.dispose();
});

test('a newly audible action supersedes a previous pending action', async () => {
  const f = fixture([], true); f.wake(); f.sound.activate('nav');
  f.context.state = 'running'; f.sound.activate('menu-open'); f.finish(); await flush();
  assert.deepEqual(f.played, ['menu-open']); f.sound.dispose();
});

test('late suspension cannot leave a quickly re-enabled device silent', async () => {
  const f = fixture(); let finishResume, finishSuspend, calls = 0;
  f.context.resume = function () {
    calls++;
    if (calls === 1) return new Promise(resolve => { finishResume = () => { this.state = 'running'; resolve(); }; });
    this.state = 'running'; return Promise.resolve();
  };
  f.context.suspend = function () { return new Promise(resolve => { finishSuspend = () => { this.state = 'suspended'; resolve(); }; }); };
  f.wake(); f.sound.setEnabled(false); f.sound.setEnabled(true);
  finishResume(); finishSuspend(); await flush();
  assert.equal(f.context.state, 'running'); assert.equal(calls, 2); f.sound.dispose();
});

test('each Work visit gets a fresh boot clock while retaining one shared device and global mute', () => {
  const f = fixture(); f.wake();
  const first = createWorkSoundSession(f.sound);
  first.bootFrame(workBootFrame(4.15)); first.bootFrame(workBootFrame(4.17)); first.reveal();
  const second = createWorkSoundSession(f.sound); f.context.currentTime += 1;
  second.bootFrame(workBootFrame(4.15)); second.bootFrame(workBootFrame(4.17)); second.reveal();
  assert.deepEqual(f.played, ['brand', 'array', 'brand', 'array']); assert.equal(f.created, 1);
  first.toggle(); assert.equal(second.state().enabled, false); second.play('open');
  assert.equal(f.played.length, 4); f.sound.dispose();
});

function control(tag = 'BUTTON', attributes = {}, selected = false, work = false) {
  return { tagName: tag, disabled: false, target: '', getAttribute: key => attributes[key] ?? null,
    hasAttribute: key => key in attributes, classList: { contains: value => selected && value === 'is-active' },
    closest: () => work ? {} : null };
}

test('semantic mapping is silent for no-op filters and Work controls, while multi-select can toggle off', () => {
  const location = { href: 'https://studio.test/' };
  assert.equal(soundForActivation(control('BUTTON'), location), null);
  assert.equal(soundForActivation(control('BUTTON', { 'data-site-sound': 'filter', 'aria-pressed': 'true' }), location), null);
  assert.deepEqual(soundForActivation(control('BUTTON', { 'data-site-sound': 'filter', 'aria-pressed': 'true', 'data-site-sound-repeat': 'true' }), location), { type: 'filter' });
  assert.deepEqual(soundForActivation(control('BUTTON', { 'data-site-sound': 'menu', 'aria-expanded': 'true' }), location), { type: 'menu-close' });
  assert.equal(soundForActivation(control('A', { href: '/work.html' }, false, true), location), null);
  assert.deepEqual(soundForActivation(control('A', { href: '/work.html' }), location), { type: 'nav' });
  assert.equal(soundForActivation(control('A', { href: '/' }), location), null);
  assert.equal(soundForActivation(control('A', { href: '#' }), location), null);
  assert.equal(soundForActivation(control('BUTTON', { 'data-site-sound': 'none' }), location), null);
});

test('explicit async result cues share the same bus and detach cleanly', () => {
  const f = fixture(); f.wake(); const detach = attachSiteSoundActions(f.sound, f.target, f.page);
  const emit = () => f.target.dispatchEvent(new CustomEvent('haoqi-site-sound', { detail: { type: 'copy-success' } }));
  emit(); assert.deepEqual(f.played, ['copy-success']); detach(); f.context.currentTime += 1; emit();
  assert.equal(f.played.length, 1); f.sound.dispose();
});

test('music progress updates never rebuild the ducking automation', () => {
  const f = fixture(); f.wake(); const bus = f.nodes[0].gain, before = bus.changes;
  for (let i = 0; i < 100; i++) f.target.dispatchEvent(new CustomEvent('haoqi-player-state', { detail: { isPlaying: true, currentTime: i } }));
  assert.ok(Math.abs(bus.value - .22) < 1e-10); assert.equal(bus.changes, before + 1);
  f.target.dispatchEvent(new CustomEvent('haoqi-player-state', { detail: { isPlaying: false } }));
  assert.equal(bus.value, .55); assert.equal(bus.changes, before + 2); f.sound.dispose();
});
