import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createGame, startGame, resetGame, stepGame, getEnemyMoveInterval,
  FIXED_STEP, MAX_FRAME_TIME, INVASION_Y,
} from './invadersEngine.js';

function advance(state, seconds, input = {}) {
  const frames = Math.round(seconds / FIXED_STEP);
  for (let index = 0; index < frames; index += 1) stepGame(state, FIXED_STEP, input);
  return state;
}

function quietGame() {
  const state = startGame(createGame({ seed: 42 }));
  state.enemyShotTimer = 1000;
  state.ufoTimer = 1000;
  state.formation.stepTimer = -1000;
  return state;
}

function bullet(state, { owner = 'player', x = 100, y = 570, vy = -640 } = {}) {
  const shot = { id: state.nextBulletId++, owner, x, y, width: 4, height: 14, vy };
  state.bullets.push(shot);
  return shot;
}

test('initial formation, shields and reset are plain deterministic state', () => {
  const state = createGame({ seed: 7, bestScore: 123 });
  assert.deepEqual(state, createGame({ seed: 7, bestScore: 123 }));
  assert.equal(state.status, 'ready');
  assert.equal(state.enemies.length, 55);
  assert.equal(new Set(state.enemies.map((enemy) => enemy.column)).size, 11);
  assert.equal(new Set(state.enemies.map((enemy) => enemy.row)).size, 5);
  assert.equal(new Set(state.shieldBlocks.map((block) => block.shield)).size, 4);
  assert.equal(state.lives, 3);
  const before = structuredClone(state);
  stepGame(state, 0.1, { fire: true, left: true });
  assert.deepEqual(state, before, 'ready state does not run until explicitly started');
  assert.equal(startGame(state), state);
  state.score = 250;
  state.bestScore = 250;
  state.lives = 0;
  state.status = 'game-over';
  startGame(state);
  assert.equal(state.status, 'playing');
  assert.equal(state.lives, 3);
  assert.equal(state.score, 0);
  assert.equal(state.bestScore, 250);
  assert.equal(resetGame(state), state);
  assert.equal(state.status, 'ready');
});

test('seeded gameplay and fixed ticks reproduce across different frame subdivisions', () => {
  const first = startGame(createGame({ seed: 1337 }));
  const second = startGame(createGame({ seed: 1337 }));
  for (let index = 0; index < 120; index += 1) stepGame(first, 0.1, { fire: true, right: index < 5 });
  for (let index = 0; index < 1440; index += 1) stepGame(second, FIXED_STEP, { fire: true, right: index < 60 });
  first.events = [];
  second.events = [];
  assert.deepEqual(first, second);
});

test('formation reaches either boundary, reverses, descends once, and accelerates as enemies die', () => {
  const state = startGame(createGame());
  state.enemyShotTimer = 1000;
  const interval = getEnemyMoveInterval(state);
  const rightmost = state.enemies.at(-1);
  const offset = 616 - (rightmost.x + rightmost.width);
  state.enemies.forEach((enemy) => { enemy.x += offset; });
  const originalY = state.enemies[0].y;
  advance(state, interval + FIXED_STEP);
  assert.equal(state.formation.direction, -1);
  assert.equal(state.enemies[0].y, originalY + 20);
  assert.equal(Math.max(...state.enemies.map((enemy) => enemy.x + enemy.width)), 616);

  const leftOffset = Math.min(...state.enemies.map((enemy) => enemy.x)) - 24;
  state.enemies.forEach((enemy) => { enemy.x -= leftOffset; });
  state.formation.stepTimer = interval;
  stepGame(state, FIXED_STEP);
  assert.equal(state.formation.direction, 1);
  assert.equal(state.enemies[0].y, originalY + 40);
  state.enemies.slice(1).forEach((enemy) => { enemy.alive = false; });
  assert.ok(getEnemyMoveInterval(state) < interval / 3);
});

test('a shield absorbs an upward shot before the enemy behind it and loses exactly the contacted block', () => {
  const state = quietGame();
  state.shieldBlocks = [
    { id: 'first', shield: 0, x: 100, y: 550, width: 6, height: 6, hp: 1 },
    { id: 'behind', shield: 0, x: 100, y: 544, width: 6, height: 6, hp: 1 },
  ];
  const enemy = state.enemies[0];
  Object.assign(enemy, { x: 100, y: 510 });
  bullet(state, { x: 101, y: 570, vy: -4000 });
  stepGame(state, 0.1);
  assert.equal(state.shieldBlocks[0].hp, 0);
  assert.equal(state.shieldBlocks[1].hp, 1);
  assert.equal(enemy.alive, true);
  assert.equal(state.bullets.length, 0);
  assert.equal(state.score, 0);
});

test('an enemy shot is stopped by a shield and a later shot can pass through its destroyed block', () => {
  const state = quietGame();
  state.shieldBlocks = [{ id: 'only', shield: 0, x: 319, y: 550, width: 6, height: 6, hp: 1 }];
  bullet(state, { owner: 'enemy', x: 320, y: 530, vy: 2000 });
  stepGame(state, 0.1);
  assert.equal(state.shieldBlocks[0].hp, 0);
  assert.equal(state.lives, 3);
  assert.equal(state.bullets.length, 0);
  bullet(state, { owner: 'enemy', x: 320, y: 530, vy: 2000 });
  stepGame(state, 0.1);
  assert.equal(state.lives, 2);
  assert.equal(state.bullets.length, 0);
});

test('a shot hits the nearest living invader and cannot award duplicate score', () => {
  const state = quietGame();
  state.shieldBlocks = [];
  const first = state.enemies[0];
  const behind = state.enemies[1];
  Object.assign(first, { x: 100, y: 300 });
  Object.assign(behind, { x: 100, y: 250 });
  bullet(state, { x: 110, y: 340, vy: -4000 });
  stepGame(state, 0.1);
  assert.equal(first.alive, false);
  assert.equal(behind.alive, true);
  assert.equal(state.score, first.points);
  assert.equal(state.events.filter((event) => event.type === 'hit').length, 1);
  advance(state, 0.3);
  assert.equal(state.score, first.points);
  assert.equal(state.bestScore, first.points);
});

test('three separate hits end the game; overlapping shots respect respawn invulnerability', () => {
  const state = quietGame();
  state.shieldBlocks = [];
  const hit = () => bullet(state, { owner: 'enemy', x: state.player.x + 10, y: 630, vy: 2000 });
  hit();
  hit();
  stepGame(state, FIXED_STEP);
  assert.equal(state.lives, 2);
  assert.ok(state.player.invulnerable > 1.4);
  assert.equal(state.events.filter((event) => event.type === 'player-hit').length, 1);
  hit();
  stepGame(state, FIXED_STEP);
  assert.equal(state.lives, 2);
  advance(state, 1.6);
  hit();
  stepGame(state, FIXED_STEP);
  assert.equal(state.lives, 1);
  advance(state, 1.6);
  hit();
  stepGame(state, FIXED_STEP);
  assert.equal(state.lives, 0);
  assert.equal(state.status, 'game-over');
  assert.equal(state.events.filter((event) => event.type === 'game-over').length, 1);
  const after = structuredClone(state);
  after.events = [];
  stepGame(state, 1, { fire: true, left: true });
  assert.deepEqual(state, after);
});

test('clearing a wave pauses projectiles, preserves shield damage, and starts a harder full formation', () => {
  const state = quietGame();
  const firstWaveInterval = getEnemyMoveInterval(state);
  state.shieldBlocks[0].hp = 0;
  state.enemies.forEach((enemy) => { enemy.alive = false; });
  const finalEnemy = state.enemies[0];
  Object.assign(finalEnemy, { alive: true, x: 100, y: 300 });
  bullet(state, { x: 110, y: 325, vy: -2000 });
  stepGame(state, FIXED_STEP);
  assert.equal(state.status, 'wave-clear');
  assert.equal(state.wave, 1);
  assert.equal(state.bullets.length, 0);
  advance(state, 1.5, { fire: true });
  assert.equal(state.status, 'wave-clear');
  assert.equal(state.bullets.length, 0);
  advance(state, 0.1);
  assert.equal(state.status, 'playing');
  assert.equal(state.wave, 2);
  assert.equal(state.enemies.filter((enemy) => enemy.alive).length, 55);
  assert.equal(state.shieldBlocks[0].hp, 0);
  assert.ok(getEnemyMoveInterval(state) < firstWaveInterval);
});

test('crossing the defense line ends the run even with lives remaining', () => {
  const state = quietGame();
  const enemy = state.enemies[0];
  Object.assign(enemy, { x: 616 - enemy.width, y: INVASION_Y - enemy.height - 1 });
  state.enemies.slice(1).forEach((other) => { other.alive = false; });
  state.formation.stepTimer = getEnemyMoveInterval(state);
  stepGame(state, FIXED_STEP);
  assert.equal(state.status, 'game-over');
  assert.equal(state.lives, 3);
});

test('large frames clamp elapsed time, invalid deltas do nothing, and keyboard/pointer stay in bounds', () => {
  const large = quietGame();
  const capped = quietGame();
  stepGame(large, 30, { right: true });
  stepGame(capped, MAX_FRAME_TIME, { right: true });
  assert.deepEqual(large, capped);
  const tick = large.tick;
  for (const delta of [-1, NaN, Infinity, 0]) stepGame(large, delta, { fire: true });
  assert.equal(large.tick, tick);
  advance(large, 2, { right: true });
  assert.equal(large.player.x, 616 - large.player.width);
  advance(large, 3, { pointerX: -100 });
  assert.equal(large.player.x, 24);
});

test('UFO appears on its timer, awards its one seeded bonus, and schedules another crossing', () => {
  const state = quietGame();
  state.shieldBlocks = [];
  state.ufoTimer = 0;
  stepGame(state, FIXED_STEP);
  assert.ok(state.ufo);
  assert.ok(state.events.some((event) => event.type === 'ufo'));
  state.ufo.x = 100;
  const bonus = state.ufo.points;
  bullet(state, { x: 110, y: 120, vy: -4000 });
  stepGame(state, FIXED_STEP);
  assert.equal(state.ufo, null);
  assert.equal(state.score, bonus);
  assert.ok(state.ufoTimer >= 14);
  advance(state, 0.1);
  assert.equal(state.score, bonus);
});

test('held fire and enemy fire remain bounded during a long run', () => {
  const state = startGame(createGame({ seed: 71 }));
  state.player.invulnerable = 1000;
  for (let index = 0; index < 600; index += 1) {
    stepGame(state, 0.1, { fire: true });
    assert.ok(state.bullets.filter((shot) => shot.owner === 'player').length <= 2);
    assert.ok(state.bullets.filter((shot) => shot.owner === 'enemy').length <= Math.min(7, 3 + state.wave));
  }
});
