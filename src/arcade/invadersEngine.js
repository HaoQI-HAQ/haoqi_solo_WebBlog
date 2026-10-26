/**
 * Deterministic, renderer-independent Space Invaders tribute.
 *
 * Public API: createGame(options) returns plain mutable data; startGame(state)
 * starts/restarts it; resetGame(state, options) returns it to the ready screen;
 * stepGame(state, seconds, input) advances and returns the SAME object. Pause by
 * not calling stepGame. A frame consumes at most 100 ms in fixed 1/120 s ticks,
 * so returning to a background tab cannot teleport a bullet or the formation.
 *
 * All x/y values are rectangle TOP-LEFT coordinates in a 640 x 720 playfield.
 * Input pointerX is a desired player CENTER in those same logical coordinates.
 * Enemy and shield arrays retain dead entries (alive=false / hp=0); the renderer
 * should skip them. Bullets have owner, x/y, width/height and vertical velocity
 * vy. Effects have type, CENTER x/y, life/maxLife and optional points. events is replaced
 * on every public step and contains {type, ...details} objects for audio/UI.
 * PIXEL_SPRITES uses '1' for filled pixels: enemies have two frames, player/ufo
 * one. Scale each bitmap into the corresponding entity's width/height; there is
 * no external sprite sheet or sourceRect to load.
 */

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 720;
export const FIXED_STEP = 1 / 120;
export const MAX_FRAME_TIME = 0.1;
export const INVASION_Y = 646;

export const PIXEL_SPRITES = {
  squid: [
    ['00011000', '00111100', '01111110', '11011011', '11111111', '00100100', '01011010', '10100101'],
    ['00011000', '00111100', '01111110', '11011011', '11111111', '01011010', '10000001', '01000010'],
  ],
  crab: [
    ['00100000100', '00010001000', '00111111100', '01101110110', '11111111111', '10111111101', '10100000101', '00011011000'],
    ['00100000100', '10010001001', '10111111101', '11101110111', '11111111111', '01111111110', '00100000100', '01000000010'],
  ],
  octopus: [
    ['000111111000', '011111111110', '111111111111', '111001100111', '111111111111', '000110011000', '001101101100', '110000000011'],
    ['000111111000', '011111111110', '111111111111', '111001100111', '111111111111', '001110011100', '011001100110', '001100001100'],
  ],
  player: ['0000001000000', '0000011100000', '0000011100000', '0111111111110', '1111111111111', '1111111111111', '1111111111111', '1111111111111'],
  ufo: ['0000011111100000', '0001111111111000', '0011111111111100', '0110110110110110', '1111111111111111', '0011100110011100', '0001000000001000'],
};

const ENEMY_COUNT = 55;
const PLAYER_SPEED = 320;
const PLAYER_FIRE_INTERVAL = 0.25;
const RESPAWN_INVULNERABILITY = 1.5;
const WAVE_CLEAR_TIME = 1.6;
const FIELD_LEFT = 24;
const FIELD_RIGHT = GAME_WIDTH - 24;
const SHIELD_PATTERN = [
  '001111111100',
  '011111111110',
  '111111111111',
  '111111111111',
  '111111111111',
  '111100001111',
  '111000000111',
  '111000000111',
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const liveEnemies = (state) => state.enemies.filter((enemy) => enemy.alive);
const overlaps = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x
  && a.y < b.y + b.height && a.y + a.height > b.y;

function random(state) {
  // Mulberry32: every random choice is reproducible from state.rng.
  state.rng = (state.rng + 0x6D2B79F5) >>> 0;
  let value = state.rng;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function createEnemies(wave) {
  return Array.from({ length: ENEMY_COUNT }, (_, index) => {
    const row = Math.floor(index / 11);
    const column = index % 11;
    return {
      id: `w${wave}-e${index}`, row, column,
      x: 68 + column * 46,
      y: 128 + row * 40 + Math.min(wave - 1, 5) * 8,
      width: 30, height: 24,
      sprite: row === 0 ? 'squid' : row < 3 ? 'crab' : 'octopus',
      points: row === 0 ? 30 : row < 3 ? 20 : 10,
      alive: true,
    };
  });
}

function createShields() {
  const blocks = [];
  for (let shield = 0; shield < 4; shield += 1) {
    SHIELD_PATTERN.forEach((row, rowIndex) => {
      [...row].forEach((pixel, column) => {
        if (pixel === '1') blocks.push({
          id: `s${shield}-${rowIndex}-${column}`, shield,
          x: 72 + shield * 140 + column * 6, y: 550 + rowIndex * 6,
          width: 6, height: 6, hp: 1,
        });
      });
    });
  }
  return blocks;
}

export function createGame({ seed = 1, bestScore = 0 } = {}) {
  const initialSeed = Number.isFinite(seed) ? seed >>> 0 : 1;
  const state = {
    width: GAME_WIDTH, height: GAME_HEIGHT,
    status: 'ready', initialSeed, rng: initialSeed,
    time: 0, tick: 0, accumulator: 0,
    score: 0, bestScore: Number.isFinite(bestScore) ? Math.max(0, Math.floor(bestScore)) : 0,
    lives: 3, wave: 1, waveTimer: 0,
    player: { x: 302, y: 650, width: 36, height: 24, sprite: 'player', invulnerable: 0, fireCooldown: 0 },
    enemies: createEnemies(1), shieldBlocks: createShields(), bullets: [],
    formation: { direction: 1, animation: 0, stepTimer: 0 },
    enemyShotTimer: 0.9, ufoTimer: 0, ufo: null,
    effects: [], events: [], nextBulletId: 1,
  };
  state.ufoTimer = 14 + random(state) * 8;
  return state;
}

export function resetGame(state, { seed = state.initialSeed, bestScore = state.bestScore } = {}) {
  Object.assign(state, createGame({ seed, bestScore }));
  return state;
}

export function startGame(state) {
  if (state.status === 'game-over') resetGame(state);
  if (state.status === 'ready') {
    state.status = 'playing';
    state.events = [{ type: 'wave', wave: state.wave }];
  }
  return state;
}

/** The formation accelerates as its ranks thin, and again on later waves. */
export function getEnemyMoveInterval(state) {
  const remaining = liveEnemies(state).length;
  return Math.max(0.065, 0.62 * (remaining / ENEMY_COUNT) ** 0.75 - (state.wave - 1) * 0.035);
}

function emit(state, type, details = {}) {
  state.events.push({ type, ...details });
}

function addEffect(state, type, target, life, points) {
  state.effects.push({
    type, x: target.x + target.width / 2, y: target.y + target.height / 2,
    life, maxLife: life, ...(points === undefined ? {} : { points }),
  });
}

function endGame(state) {
  if (state.status === 'game-over') return;
  state.status = 'game-over';
  state.bestScore = Math.max(state.bestScore, state.score);
  state.accumulator = 0;
  emit(state, 'game-over', { score: state.score });
}

function updatePlayer(state, dt, input, allowFire) {
  const player = state.player;
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
  if (input.left || input.right) player.x += direction * PLAYER_SPEED * dt;
  else if (Number.isFinite(input.pointerX)) {
    const distance = input.pointerX - player.width / 2 - player.x;
    player.x += clamp(distance, -PLAYER_SPEED * dt, PLAYER_SPEED * dt);
  }
  player.x = clamp(player.x, FIELD_LEFT, FIELD_RIGHT - player.width);

  if (allowFire && input.fire && player.fireCooldown <= 0
    && state.bullets.filter((bullet) => bullet.owner === 'player').length < 2) {
    state.bullets.push({
      id: state.nextBulletId++, owner: 'player', x: player.x + player.width / 2 - 2,
      y: player.y - 14, width: 4, height: 14, vy: -640,
    });
    player.fireCooldown = PLAYER_FIRE_INTERVAL;
    emit(state, 'shot', { x: player.x + player.width / 2, y: player.y });
  }
}

function updateFormation(state, dt) {
  const enemies = liveEnemies(state);
  if (!enemies.length) return;
  state.formation.stepTimer += dt;
  const interval = getEnemyMoveInterval(state);
  while (state.formation.stepTimer + 1e-10 >= interval) {
    state.formation.stepTimer -= interval;
    const left = Math.min(...enemies.map((enemy) => enemy.x));
    const right = Math.max(...enemies.map((enemy) => enemy.x + enemy.width));
    const desired = state.formation.direction * 12;
    const dx = clamp(desired, FIELD_LEFT - left, FIELD_RIGHT - right);
    const turn = dx !== desired;
    enemies.forEach((enemy) => {
      enemy.x += dx;
      if (turn) enemy.y += 20;
    });
    if (turn) state.formation.direction *= -1;
    state.formation.animation = 1 - state.formation.animation;

    // Descending invaders physically eat away any remaining shield pixels.
    for (const block of state.shieldBlocks) {
      if (block.hp > 0 && enemies.some((enemy) => overlaps(enemy, block))) block.hp = 0;
    }
    if (enemies.some((enemy) => enemy.y + enemy.height >= INVASION_Y)) {
      endGame(state);
      return;
    }
  }
}

function updateEnemyFire(state, dt) {
  state.enemyShotTimer -= dt;
  if (state.enemyShotTimer > 0) return;
  const interval = Math.max(0.3, 0.9 - (state.wave - 1) * 0.075);
  state.enemyShotTimer = interval * (0.75 + random(state) * 0.5);
  const cap = Math.min(7, 3 + state.wave);
  if (state.bullets.filter((bullet) => bullet.owner === 'enemy').length >= cap) return;

  // Only the bottom surviving invader in a column may shoot.
  const columns = new Map();
  for (const enemy of state.enemies) {
    if (!enemy.alive) continue;
    const bottom = columns.get(enemy.column);
    if (!bottom || enemy.y > bottom.y) columns.set(enemy.column, enemy);
  }
  const shooters = [...columns.values()];
  if (!shooters.length) return;
  const shooter = shooters[Math.floor(random(state) * shooters.length)];
  state.bullets.push({
    id: state.nextBulletId++, owner: 'enemy',
    x: shooter.x + shooter.width / 2 - 2, y: shooter.y + shooter.height,
    width: 4, height: 14, vy: 210 + state.wave * 16,
  });
}

function updateUfo(state, dt) {
  if (state.ufo) {
    state.ufo.x += state.ufo.vx * dt;
    if (state.ufo.x > GAME_WIDTH + 50 || state.ufo.x + state.ufo.width < -50) {
      state.ufo = null;
      state.ufoTimer = 14 + random(state) * 10;
    }
    return;
  }
  state.ufoTimer -= dt;
  if (state.ufoTimer > 0) return;
  const direction = random(state) < 0.5 ? 1 : -1;
  state.ufo = {
    x: direction > 0 ? -44 : GAME_WIDTH + 2, y: 82,
    width: 42, height: 20, sprite: 'ufo', vx: direction * 86,
    points: [50, 100, 150, 300][Math.floor(random(state) * 4)],
  };
  emit(state, 'ufo', { x: state.ufo.x, y: state.ufo.y });
}

/**
 * Distance to the first contact along a vertical swept bullet. Testing the full
 * path, rather than only the final rectangle, prevents tunnelling through a 6px
 * shield block even at the fastest bullet speed or largest accepted frame.
 */
function contactDistance(bullet, target, travel) {
  if (bullet.x >= target.x + target.width || bullet.x + bullet.width <= target.x) return Infinity;
  if (overlaps(bullet, target)) return 0;
  const distance = bullet.vy < 0
    ? bullet.y - (target.y + target.height)
    : target.y - (bullet.y + bullet.height);
  return distance >= 0 && distance <= travel ? distance : Infinity;
}

function hitPlayer(state) {
  if (state.player.invulnerable > 0) return;
  state.lives = Math.max(0, state.lives - 1);
  state.player.invulnerable = RESPAWN_INVULNERABILITY;
  addEffect(state, 'player-hit', state.player, 0.65);
  emit(state, 'player-hit', { lives: state.lives, x: state.player.x, y: state.player.y });
  if (state.lives === 0) endGame(state);
}

function updateBullets(state, dt) {
  const survivors = [];
  for (const bullet of state.bullets) {
    let hit = null;
    let distance = Infinity;
    const travel = Math.abs(bullet.vy * dt);
    const consider = (target, type) => {
      const nextDistance = contactDistance(bullet, target, travel);
      if (nextDistance < distance) {
        hit = { target, type };
        distance = nextDistance;
      }
    };
    for (const block of state.shieldBlocks) if (block.hp > 0) consider(block, 'shield');
    if (bullet.owner === 'player') {
      for (const enemy of state.enemies) if (enemy.alive) consider(enemy, 'enemy');
      if (state.ufo) consider(state.ufo, 'ufo');
    } else consider(state.player, 'player');

    if (hit) {
      if (hit.type === 'shield') hit.target.hp = 0;
      else if (hit.type === 'player') hitPlayer(state);
      else {
        const points = hit.target.points;
        state.score += points;
        state.bestScore = Math.max(state.bestScore, state.score);
        if (hit.type === 'enemy') hit.target.alive = false;
        else {
          state.ufo = null;
          state.ufoTimer = 14 + random(state) * 10;
        }
        addEffect(state, hit.type === 'enemy' ? 'enemy-hit' : 'ufo-hit', hit.target, 0.35, points);
        emit(state, 'hit', { points, target: hit.type, x: hit.target.x, y: hit.target.y });
      }
      if (state.status === 'game-over') break;
      continue; // A spent bullet cannot damage another block or score twice.
    }
    bullet.y += bullet.vy * dt;
    if (bullet.y + bullet.height >= 70 && bullet.y < GAME_HEIGHT) survivors.push(bullet);
  }
  state.bullets = state.status === 'game-over' ? [] : survivors;
}

function advance(state, input) {
  const dt = FIXED_STEP;
  state.tick += 1;
  state.time = state.tick * dt;
  state.effects.forEach((effect) => { effect.life -= dt; });
  state.effects = state.effects.filter((effect) => effect.life > 0);
  updatePlayer(state, dt, input, state.status === 'playing');

  if (state.status === 'wave-clear') {
    state.waveTimer = Math.max(0, state.waveTimer - dt);
    if (state.waveTimer < 1e-10) {
      state.wave += 1;
      state.enemies = createEnemies(state.wave);
      state.formation = { direction: state.wave % 2 ? 1 : -1, animation: 0, stepTimer: 0 };
      state.enemyShotTimer = 0.8;
      state.ufoTimer = 14 + random(state) * 8;
      state.status = 'playing';
      emit(state, 'wave', { wave: state.wave });
    }
    return;
  }

  updateFormation(state, dt);
  if (state.status === 'game-over') return;
  updateEnemyFire(state, dt);
  updateUfo(state, dt);
  updateBullets(state, dt);
  if (state.status === 'playing' && !state.enemies.some((enemy) => enemy.alive)) {
    state.status = 'wave-clear';
    state.waveTimer = WAVE_CLEAR_TIME;
    state.bullets = [];
    state.ufo = null;
  }
}

export function stepGame(state, dtSeconds, input = {}) {
  state.events = [];
  if (state.status !== 'playing' && state.status !== 'wave-clear') return state;
  const elapsed = Number.isFinite(dtSeconds) ? clamp(dtSeconds, 0, MAX_FRAME_TIME) : 0;
  state.accumulator += elapsed;
  while (state.accumulator + 1e-10 >= FIXED_STEP) {
    state.accumulator = Math.max(0, state.accumulator - FIXED_STEP);
    advance(state, input);
    if (state.status === 'game-over') break;
  }
  if (state.accumulator < 1e-10) state.accumulator = 0;
  return state;
}
