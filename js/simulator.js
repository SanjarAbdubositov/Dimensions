// simulator.js — giperkub simulyatori komponenti.
// Ishlatish: createSimulator(container, { dims: [2, 3, 4], controls: ['dims', 'sliders'] })
import {
  makeVertices, makeEdges, listPlanes, composeRotations, applyMatrix,
  projectPerspective, projectOrthographic, maxNorm,
} from './math4d.js';
import { buildControls } from './sim-controls.js';
import { drawFrame } from './sim-render.js';

export const ALL_CONTROLS = ['dims', 'projection', 'drag', 'auto', 'size', 'sliders', 'reset'];
const CAMERA_DISTANCE = 2.5; // shakl radiusiga nisbatan (math4d.js'dagi projectPerspective'ga qara)
const FILL = 0.85;           // shakl canvas'ning qancha qismini egallaydi
const DRAG_DEG_PER_PX = 0.5; // sudrashda 1 piksel = 0.5°
const KEY_STEP = 5;          // strelka bosilganda 5°

// Burchakni −180..180 oraligʻiga qaytaradi
const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;

// Boshlangʻich koʻrinish: kub kvadratga oʻxshab qolmasligi uchun biroz burilgan
function defaultAngles(n) {
  const angles = Object.fromEntries(listPlanes(n).map(([i, j]) => [`${i}-${j}`, 0]));
  if (n >= 3) Object.assign(angles, { '0-2': 30, '1-2': 20 });
  if (n >= 4) angles[`0-${n - 1}`] = 20;
  return angles;
}

// Avto-aylanishda qaysi tekisliklar buriladi: 3D burish + oxirgi oʻq bilan burish
function autoPlanes(n) {
  if (n === 2) return [[0, 1, 1]];
  if (n === 3) return [[0, 2, 1], [1, 2, 0.6]];
  return [[0, n - 1, 1], [1, 2, 0.6]]; // masalan 4D: XW va YZ
}

// Simulyatorni container ichida yaratadi va boshqarish funksiyalarini qaytaradi
export function createSimulator(container, options = {}) {
  const dims = options.dims ?? [2, 3, 4, 5, 6, 7];
  const controls = options.controls ?? ALL_CONTROLS;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startDim = options.dim ?? (dims.includes(4) ? 4 : dims[0]);

  const state = {
    n: startDim, angles: {}, auto: !reduceMotion, speed: 20, size: 1,
    dragMode: '3d', projection: 'perspective', scale: 0,
  };
  let shape = null;
  let used = false;     // simulator_use hodisasi sessiyada bir marta
  let drag = null;      // sudrash: { id, x, y } — qaysi barmoq va oxirgi nuqta
  let visible = true;
  let rafId = 0;
  let lastTime = 0;

  container.classList.add('sim');
  const ui = buildControls(container, { dims, controls }, {
    dim: (n) => { markUsed(); setDim(n); },
    projection: (p) => { state.projection = p; requestFrame(); },
    dragMode: (m) => { state.dragMode = m; },
    toggleAuto: () => { state.auto = !state.auto; ui.syncState(state); requestFrame(); },
    speed: (v) => { state.speed = v; },
    size: (v) => { state.size = v; requestFrame(); },
    angle: (i, j, v) => { state.angles[`${i}-${j}`] = v; requestFrame(); },
    reset,
  });
  const canvas = ui.canvas;
  const ctx = canvas.getContext('2d');

  // Foydalanuvchi simulyatordan haqiqatan foydalandi. Simulyator statistikani bilmaydi:
  // u faqat "simulator:use" hodisasini chiqaradi, analytics.js esa uni tinglaydi.
  function markUsed() {
    if (used) return;
    used = true;
    options.onUse?.();
    container.dispatchEvent(new CustomEvent('simulator:use', { bubbles: true, detail: { dim: state.n } }));
  }

  // Oʻlchamni almashtirish: yangi uchlar, qirralar va boshlangʻich burchaklar
  function setDim(n) {
    state.n = n;
    const vertices = makeVertices(n);
    shape = { vertices, edges: makeEdges(vertices) };
    state.angles = defaultAngles(n);
    ui.setDim(n, vertices.length, shape.edges.length);
    ui.syncState(state);
    requestFrame();
  }

  // Hammasini boshlangʻich holatga qaytarish
  function reset() {
    Object.assign(state, { auto: !reduceMotion, speed: 20, size: 1, dragMode: '3d', projection: 'perspective' });
    setDim(startDim);
  }

  // Tekislik burchagini oʻzgartiradi (gradusda)
  function turn(i, j, deg) {
    const key = `${i}-${j}`;
    state.angles[key] = wrap((state.angles[key] ?? 0) + deg);
  }

  // Ekrandagi siljishni burishga aylantiradi: 3D rejim — XZ/YZ, 4D rejim — X/Y bilan oxirgi oʻq
  function rotateBy(dx, dy, force4d) {
    const n = state.n;
    if (n === 2) {
      turn(0, 1, -dx + dy);
    } else {
      const k = force4d || state.dragMode === '4d' ? n - 1 : 2;
      turn(0, k, -dx);
      turn(1, k, dy);
    }
    ui.syncAngles(state.angles);
    requestFrame();
  }

  // Faqat birinchi barmoq kuzatiladi: ikkinchi barmoq tegsa, shakl sakrab ketmasligi kerak
  canvas.addEventListener('pointerdown', (e) => {
    if (drag) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    try { canvas.setPointerCapture(e.pointerId); } catch { /* baʼzi brauzerlarda ushlab boʻlmaydi */ }
    markUsed();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = (e.clientX - drag.x) * DRAG_DEG_PER_PX;
    const dy = (e.clientY - drag.y) * DRAG_DEG_PER_PX;
    drag = { id: drag.id, x: e.clientX, y: e.clientY };
    rotateBy(dx, dy, e.shiftKey);
  });
  // window'da tinglaymiz: barmoq canvas'dan tashqarida qoʻyib yuborilsa ham sudrash tugaydi
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    requestFrame();
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // Klaviatura: strelkalar bilan burish (Shift — 4D)
  canvas.addEventListener('keydown', (e) => {
    const moves = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] };
    if (!moves[e.key]) return;
    e.preventDefault();
    markUsed();
    rotateBy(...moves[e.key], e.shiftKey);
  });

  // Canvas oʻlchami: CSS piksel × devicePixelRatio (retina ekranda ham tiniq)
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    requestFrame();
  }

  // Bitta kadr: burish → proyeksiya → miqyosni silliq moslash → chizish
  function render(dt) {
    const n = state.n;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const rotations = listPlanes(n).map(([i, j]) => [i, j, (state.angles[`${i}-${j}`] * Math.PI) / 180]);
    const rotated = applyMatrix(composeRotations(n, rotations), shape.vertices);
    const radius = Math.sqrt(n); // giperkub uchining markazdan masofasi
    const depth = rotated.map((p) => (n > 2 ? p[n - 1] / radius : 0));
    const projected = state.projection === 'perspective'
      ? projectPerspective(rotated, CAMERA_DISTANCE)
      : projectOrthographic(rotated);

    // Avtomatik moslash: maqsadli miqyosga sakramasdan, asta-sekin yaqinlashamiz
    const target = (Math.min(width, height) / 2) * FILL / (maxNorm(projected) || 1);
    state.scale = state.scale ? state.scale + (target - state.scale) * Math.min(1, dt * 4) : target;

    drawFrame(ctx, { projected, depth, edges: shape.edges, scale: state.scale * state.size, width, height });
    return Math.abs(target - state.scale) > 0.5; // hali moslashyaptimi
  }

  // Animatsiya sikli: kerak boʻlmasa toʻxtaydi (telefon batareyasini tejash uchun)
  function frame(now) {
    const dt = lastTime ? Math.min(0.1, (now - lastTime) / 1000) : 0;
    lastTime = now;
    const spinning = state.auto && !drag && state.speed > 0;
    if (spinning) {
      for (const [i, j, factor] of autoPlanes(state.n)) turn(i, j, state.speed * factor * dt);
      ui.syncAngles(state.angles);
    }
    const settling = render(dt);
    if (visible && (spinning || settling)) {
      rafId = requestAnimationFrame(frame);
    } else {
      rafId = 0;
      lastTime = 0;
    }
  }

  // Yangi kadr soʻrash (agar sikl toʻxtagan boʻlsa, qayta boshlaydi)
  function requestFrame() {
    if (!rafId && visible && shape) rafId = requestAnimationFrame(frame);
  }

  // Ekrandan tashqarida boʻlsa chizmaymiz (darsda bir nechta simulyator boʻlishi mumkin)
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) requestFrame();
  }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);

  setDim(startDim);
  return { setDim, reset, state };
}
