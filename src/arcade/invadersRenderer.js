import { PIXEL_SPRITES } from './invadersEngine.js';

export const ARCADE_PALETTE = Object.freeze({
  background: '#000000',
  text: '#f2f1e9',
  green: '#6ee84a',
  cyan: '#47dce6',
  purple: '#c481ed',
  player: '#47dce6',
  shield: '#f54b4b',
  ufo: '#f54b4b',
  playerBullet: '#f2f1e9',
  enemyBullet: '#f2f1e9',
  ground: '#47dce6',
});

const LOGICAL_WIDTH = 640;
const LOGICAL_HEIGHT = 720;
const FALLBACK_COPY = { score: 'SCORE', best: 'BEST', wave: 'WAVE', lives: 'LIVES' };
const EXPLOSION_DIRECTIONS = [
  [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1],
];

function drawSprite(ctx, key, x, y, width, height, color, frame = 0) {
  const source = PIXEL_SPRITES[key];
  if (!source?.length) return;
  const bitmap = Array.isArray(source[0]) ? source[frame % source.length] : source;
  const columns = bitmap[0].length;
  ctx.fillStyle = color;
  for (let row = 0; row < bitmap.length; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (bitmap[row][column] !== '1') continue;
      // Round cell boundaries, rather than cell sizes, so adjacent pixels never split.
      const left = Math.round(x + column * width / columns);
      const top = Math.round(y + row * height / bitmap.length);
      const right = Math.round(x + (column + 1) * width / columns);
      const bottom = Math.round(y + (row + 1) * height / bitmap.length);
      ctx.fillRect(left, top, right - left, bottom - top);
    }
  }
}

function drawHud(ctx, state, palette, copy) {
  const labels = { ...FALLBACK_COPY, ...copy };
  const score = value => String(Math.max(0, Math.floor(Number(value) || 0))).padStart(5, '0');
  ctx.fillStyle = palette.text;
  ctx.textBaseline = 'top';
  ctx.font = '700 18px "Courier New", ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(labels.score.toUpperCase(), 32, 24);
  ctx.textAlign = 'center';
  ctx.fillText(labels.best.toUpperCase(), 320, 24);
  ctx.textAlign = 'right';
  ctx.fillText(labels.wave.toUpperCase(), 608, 24);
  ctx.font = '700 28px "Courier New", ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(score(state.score), 32, 45);
  ctx.textAlign = 'center';
  ctx.fillText(score(state.bestScore), 320, 45);
  ctx.textAlign = 'right';
  ctx.fillText(String(state.wave || 1).padStart(2, '0'), 608, 45);

  ctx.fillStyle = palette.ground;
  ctx.fillRect(24, 685, 592, 2);
  ctx.fillStyle = palette.text;
  ctx.textAlign = 'left';
  ctx.font = '700 18px "Courier New", ui-monospace, monospace';
  ctx.fillText(`${labels.lives.toUpperCase()} ${Math.max(0, state.lives || 0)}`, 32, 697);
  for (let life = 0; life < Math.max(0, Math.min(6, state.lives || 0)); life += 1) {
    drawSprite(ctx, 'player', 158 + life * 32, 697, 24, 16, palette.player);
  }
}

function drawBullet(ctx, bullet, palette, animation) {
  const { x, y, width, height } = bullet;
  ctx.fillStyle = bullet.owner === 'player' ? palette.playerBullet : palette.enemyBullet;
  if (bullet.owner === 'player') {
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
    return;
  }
  // The descending shot alternates a small jagged pixel pattern.
  const half = Math.max(1, Math.round(width / 2));
  const bands = 4;
  for (let band = 0; band < bands; band += 1) {
    const left = Math.round(x) + ((band + animation) % 2 ? half : 0);
    const top = Math.round(y + band * height / bands);
    const bottom = Math.round(y + (band + 1) * height / bands);
    ctx.fillRect(left, top, half, bottom - top);
  }
}

function drawEffect(ctx, effect, palette) {
  const progress = Math.max(0, Math.min(1, 1 - effect.life / (effect.maxLife || 0.3)));
  const spread = 5 + progress * 18;
  const size = progress < 0.65 ? 4 : 2;
  ctx.fillStyle = effect.type === 'player-hit' ? palette.player
    : effect.type === 'ufo-hit' ? palette.ufo : palette.text;
  for (const [dx, dy] of EXPLOSION_DIRECTIONS) {
    ctx.fillRect(Math.round(effect.x + dx * spread - size / 2),
      Math.round(effect.y + dy * spread - size / 2), size, size);
  }
  if (effect.type === 'ufo-hit' && effect.points) {
    ctx.fillStyle = palette.text;
    ctx.font = '700 16px "Courier New", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(String(effect.points), effect.x, effect.y - 18 - progress * 8);
  }
}

/** Draws one frame in logical game coordinates, preserving the caller's DPR transform. */
export function drawGame(ctx, state, options = {}) {
  if (!ctx || !state) return;
  const { width = LOGICAL_WIDTH, height = LOGICAL_HEIGHT, copy = {} } = options;
  const palette = { ...ARCADE_PALETTE, ...options.palette };
  const animation = state.formation?.animation || 0;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.scale(width / LOGICAL_WIDTH, height / LOGICAL_HEIGHT);
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  const rowColors = [palette.green, palette.cyan, palette.cyan, palette.purple, palette.purple];
  for (const enemy of state.enemies || []) {
    if (enemy.alive === false) continue;
    drawSprite(ctx, enemy.sprite, enemy.x, enemy.y, enemy.width, enemy.height,
      rowColors[enemy.row % rowColors.length], animation);
  }

  if (state.ufo) {
    const { x, y, width: ufoWidth, height: ufoHeight } = state.ufo;
    drawSprite(ctx, 'ufo', x, y, ufoWidth, ufoHeight, palette.ufo);
  }

  ctx.fillStyle = palette.shield;
  for (const block of state.shieldBlocks || []) {
    if (block.hp <= 0) continue;
    ctx.fillRect(Math.round(block.x), Math.round(block.y), block.width, block.height);
  }

  for (const bullet of state.bullets || []) drawBullet(ctx, bullet, palette, animation);

  const player = state.player;
  const playerVisible = !player?.invulnerable || Math.floor((state.time || 0) * 6) % 2 === 0;
  if (player && state.lives > 0 && playerVisible) {
    drawSprite(ctx, 'player', player.x, player.y, player.width, player.height, palette.player);
  }

  for (const effect of state.effects || []) drawEffect(ctx, effect, palette);
  drawHud(ctx, state, palette, copy);
  ctx.restore();
}
