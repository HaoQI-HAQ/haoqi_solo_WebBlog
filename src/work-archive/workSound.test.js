import test from 'node:test';
import assert from 'node:assert/strict';
import { bootSoundEvents, createWorkSound, WORK_SOUND_STORAGE } from './workSound.js';
import { workBootFrame } from './bootTimeline.js';

function fixture(initial = 'on', contextFactory) {
  const target = new EventTarget(), page = new EventTarget(), played = [], nodes = [];
  page.hidden = false;
  const storage = new Map([[WORK_SOUND_STORAGE, initial]]);
  const param = () => ({ value: 0, cancelScheduledValues() {}, setTargetAtTime(value) { this.value = value; } });
  const node = () => { const value = { gain: param(), connect() {}, disconnect() { this.disconnected = true; } }; nodes.push(value); return value; };
  let created = 0, stopped = 0;
  const context = { state: 'suspended', currentTime: 0, destination: {}, createGain: node,
    createDynamicsCompressor() { return Object.assign(node(), Object.fromEntries(['threshold', 'knee', 'ratio', 'attack', 'release'].map(key => [key, param()]))); },
    resume() { this.state = 'running'; return Promise.resolve(); },
    suspend() { this.state = 'suspended'; return Promise.resolve(); },
    close() { this.state = 'closed'; return Promise.resolve(); },
  };
  const states = [];
  const sound = createWorkSound({ target, document: page, storage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }, supported: true,
    createContext: () => { created++; return contextFactory ? contextFactory(context) : context; }, onState: state => states.push(state),
    synthesize: (ctx, bus, type, at, pan) => { played.push({ type, at, pan }); return { end: at + 3, stop: () => stopped++ }; },
  });
  const gesture = () => sound.gesture({ isTrusted: true });
  const visibility = async hidden => { page.hidden = hidden; page.dispatchEvent(new Event('visibilitychange')); await new Promise(resolve => setImmediate(resolve)); };
  return { sound, target, page, nodes, context, played, storage, states, gesture, visibility, get created() { return created; }, get stopped() { return stopped; } };
}

test('boot cues follow visible frames, type once per frame, and never catch up after seeks', () => {
  assert.deepEqual(bootSoundEvents(workBootFrame(4.15), workBootFrame(4.17)), ['brand']);
  assert.deepEqual(bootSoundEvents(workBootFrame(1.79), workBootFrame(1.82)), ['key']);
  assert.deepEqual(bootSoundEvents(workBootFrame(2.24), workBootFrame(2.28)), ['key']); // appended E plus a space
  assert.deepEqual(bootSoundEvents(workBootFrame(7.76), workBootFrame(7.8)), ['key']); // appended colon plus a space
  assert.deepEqual(bootSoundEvents(workBootFrame(7.4), workBootFrame(7.44)), []); // unchanged copy
  assert.deepEqual(bootSoundEvents(workBootFrame(0), workBootFrame(21.12)), []);
  assert.deepEqual(bootSoundEvents(workBootFrame(5), workBootFrame(4)), []);
  const all = [];
  for (let time = .02; time <= 21; time += .02) all.push(...bootSoundEvents(workBootFrame(time - .02), workBootFrame(time)));
  assert.deepEqual(all.filter(type => type !== 'key'), ['brand', 'confirm', 'scan', 'confirm', 'welcome', 'text-reveal', 'text-reveal']);
  assert.ok(all.filter(type => type === 'key').length > 30);
});

test('creates no device or queued audio before a trusted gesture; skips cancel boot', () => {
  const f = fixture();
  f.sound.bootFrame(workBootFrame(4.15)); f.sound.bootFrame(workBootFrame(4.17));
  f.sound.gesture({ isTrusted: false }); assert.equal(f.created, 0);
  f.gesture(); assert.equal(f.created, 1); assert.deepEqual(f.played, []);
  f.sound.play('welcome'); f.sound.reveal(); f.sound.reveal();
  f.sound.bootFrame(workBootFrame(17.75)); f.sound.bootFrame(workBootFrame(17.77));
  assert.deepEqual(f.played.map(v => v.type), ['welcome', 'array']); assert.equal(f.stopped, 1);
  f.sound.dispose(); assert.equal(f.context.state, 'closed');
});

test('first toggle unlocks; mute stops voices and stays off on other gestures', () => {
  const f = fixture(); f.sound.toggle(); assert.equal(f.sound.state().unlocked, true);
  f.sound.play('open'); f.sound.toggle();
  assert.equal(f.sound.state().enabled, false); assert.equal(f.stopped, 1);
  assert.equal(f.storage.get(WORK_SOUND_STORAGE), 'off');
  f.gesture(); assert.equal(f.sound.play('back'), false);
  f.sound.toggle(); assert.equal(f.sound.play('back'), true);
  assert.equal(f.nodes[0].gain.value, .55);
  f.sound.dispose();
  const saved = fixture('off'); saved.gesture(); assert.equal(saved.created, 0);
  saved.sound.toggle(); assert.equal(saved.created, 1); saved.sound.dispose();
});

test('visibility stops and suspends, restoring only unlocked enabled devices', async () => {
  const f = fixture(); f.gesture(); f.sound.play('scan');
  await f.visibility(true); assert.equal(f.context.state, 'suspended'); assert.equal(f.stopped, 1);
  assert.equal(f.sound.play('tick'), false);
  await f.visibility(false); assert.equal(f.context.state, 'running'); assert.equal(f.played.length, 1);
  f.sound.toggle(); await f.visibility(true); await f.visibility(false);
  assert.equal(f.context.state, 'suspended');
  f.sound.dispose(); await f.visibility(false); assert.equal(f.context.state, 'closed');
});

test('effects duck beneath existing music and restore without changing music player', () => {
  const f = fixture(); f.gesture(); const bus = f.nodes[0]; assert.equal(bus.gain.value, .55);
  const event = new Event('haoqi-player-state'); event.detail = { isPlaying: true }; f.target.dispatchEvent(event);
  assert.ok(Math.abs(bus.gain.value - .22) < 1e-8);
  event.detail = { isPlaying: false }; f.target.dispatchEvent(event); assert.equal(bus.gain.value, .55);
  f.sound.dispose();
});

test('rapid input is throttled and voices are bounded', () => {
  const f = fixture(); f.gesture();
  for (let i = 0; i < 20; i++) f.sound.play('tick'); assert.equal(f.played.length, 1);
  for (let i = 0; i < 20; i++) { f.context.currentTime += .06; f.sound.play('tick'); }
  assert.equal(f.played.length, 21); assert.equal(f.stopped, 11);
  f.sound.dispose(); assert.ok(f.nodes.every(node => node.disconnected));
});

test('device failure is silent, and pending resume cannot revive a disposed context', async () => {
  const broken = fixture('on', () => { throw Error('no device'); }); broken.gesture();
  assert.equal(broken.sound.state().unavailable, true); assert.equal(broken.sound.play('open'), false); broken.sound.dispose();
  let finish;
  const f = fixture('on', context => { context.resume = () => new Promise(resolve => { finish = resolve; }); return context; });
  f.gesture(); f.sound.dispose(); finish(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.context.state, 'closed'); assert.equal(f.played.length, 0);
});

test('blocked browser storage cannot break Work mounting', () => {
  const target = new EventTarget(), page = new EventTarget();
  Object.defineProperty(target, 'localStorage', { get() { throw new Error('SecurityError'); } });
  const sound = createWorkSound({ target, document: page, supported: false });
  assert.equal(sound.state().unavailable, true); sound.toggle(); sound.dispose();
});
