// Hero visual: "messy → sorted".
// Tiles start scattered, then snap into a neat grid where coral tiles spell an S.
// They shy away from the mouse and loosen up again as you scroll past the hero.
// Colours are read from the theme's CSS variables and refresh on theme switch.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const S_SHAPE = [
  '.#####.',
  '##...##',
  '##.....',
  '.####..',
  '...###.',
  '.....##',
  '##...##',
  '.#####.',
];
const COLS = S_SHAPE[0].length;
const ROWS = S_SHAPE.length;

type Tile = {
  gx: number; // grid slot (0..1 of the grid box)
  gy: number;
  sx: number; // scattered position (0..1 of the canvas)
  sy: number;
  rot: number; // scattered rotation
  accent: boolean;
  ink: boolean;
  delay: number;
  ox: number; // mouse offset (springy)
  oy: number;
};

export function heroTiles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tiles: Tile[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const accent = S_SHAPE[r][c] === '#';
      tiles.push({
        gx: c / (COLS - 1),
        gy: r / (ROWS - 1),
        sx: Math.random(),
        sy: Math.random(),
        rot: (Math.random() - 0.5) * Math.PI * 1.4,
        accent,
        ink: !accent && Math.random() < 0.12,
        // tiles near the middle settle first
        delay: Math.hypot(c / (COLS - 1) - 0.5, r / (ROWS - 1) - 0.5) * 0.9 + Math.random() * 0.25,
        ox: 0,
        oy: 0,
      });
    }
  }

  let colors = { accent: '#ff6b4a', ink: '#1d1b4b', tile: '#e4e2f0' };
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    colors = {
      accent: cs.getPropertyValue('--accent').trim() || colors.accent,
      // In dark mode --ink is near-white, which shouts; the muted tone sits better
      ink:
        cs.getPropertyValue(document.documentElement.dataset.theme === 'dark' ? '--muted' : '--ink').trim() ||
        colors.ink,
      tile: cs.getPropertyValue('--line').trim() || colors.tile,
    };
  };
  readColors();
  new MutationObserver(() => {
    readColors();
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let W = 0;
  let H = 0;
  let dpr = 1;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    draw();
  };

  // 0 = scattered, 1 = sorted. `scatter` is how much scrolling loosens it again.
  const state = { sort: reduce ? 1 : 0, scatter: 0 };
  const mouse = { x: -9999, y: -9999 };

  const easeBack = (t: number) => {
    const c1 = 1.5;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  function draw() {
    if (!W || !H) return;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, W, H);

    // Size the grid to fit the canvas with some breathing room
    const cell = Math.min((W * 0.86) / COLS, (H * 0.86) / ROWS);
    const size = cell * 0.78;
    const gw = cell * (COLS - 1);
    const gh = cell * (ROWS - 1);
    const left = (W - gw) / 2;
    const top = (H - gh) / 2;

    for (const t of tiles) {
      // each tile has its own start time within the sort animation
      const local = gsap.utils.clamp(0, 1, (state.sort * 1.6 - t.delay) / 0.7);
      const k = Math.max(0, Math.min(1.15, easeBack(local)) - state.scatter * 0.9);
      const tx = left + t.gx * gw;
      const ty = top + t.gy * gh;
      const sx = t.sx * W;
      const sy = t.sy * H;
      let x = sx + (tx - sx) * k;
      let y = sy + (ty - sy) * k;

      // springy push away from the mouse
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const d = Math.hypot(dx, dy);
      const R = cell * 2.4;
      const push = d < R ? (1 - d / R) * cell * 0.9 : 0;
      const txo = d ? (dx / d) * push : 0;
      const tyo = d ? (dy / d) * push : 0;
      t.ox += (txo - t.ox) * 0.15;
      t.oy += (tyo - t.oy) * 0.15;
      x += t.ox;
      y += t.oy;

      const rot = t.rot * (1 - Math.min(1, k)) + (push / cell) * 0.6;
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(rot);
      ctx!.fillStyle = t.accent ? colors.accent : t.ink ? colors.ink : colors.tile;
      ctx!.globalAlpha = t.accent ? 1 : t.ink ? 0.9 : 0.85;
      ctx!.beginPath();
      ctx!.roundRect(-size / 2, -size / 2, size, size, size * 0.24);
      ctx!.fill();
      ctx!.restore();
    }
  }

  resize();
  new ResizeObserver(resize).observe(canvas);
  if (reduce) return;

  // Sort on load
  gsap.to(state, { sort: 1, duration: 2.2, ease: 'power2.out', delay: 0.35 });

  // Loosen up again as the hero scrolls away
  gsap.registerPlugin(ScrollTrigger);
  gsap.to(state, {
    scatter: 1,
    ease: 'none',
    scrollTrigger: { trigger: canvas.closest('section') ?? canvas, start: 'top top', end: 'bottom top', scrub: true },
  });

  canvas.parentElement?.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.parentElement?.addEventListener('pointerleave', () => {
    mouse.x = mouse.y = -9999;
  });

  // Only animate while the canvas is on screen
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  gsap.ticker.add(() => {
    if (visible) draw();
  });
}
