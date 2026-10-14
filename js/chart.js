// chart.js — kunlik noyob qurilmalar grafigi: oddiy SVG, kutubxonasiz.
// chartGeometry — sof funksiya (testlanadi), renderDailyChart — uni sahifaga chizadi.

const PAD = { top: 12, right: 8, bottom: 24, left: 36 };
const BAR_MAX = 24; // ustun eni 24 px dan oshmaydi
const GAP = 2;      // qoʻshni ustunlar orasidagi boʻshliq

// Oʻqdagi "chiroyli" maksimum va qadam: 1, 2, 5 × 10ⁿ (koʻpi bilan 4 ta chiziq)
export function niceScale(max) {
  if (max <= 0) return { top: 1, step: 1 };
  for (let p = 1; ; p *= 10) {
    for (const m of [1, 2, 5]) {
      const step = m * p;
      if (Math.ceil(max / step) <= 4) return { top: Math.ceil(max / step) * step, step };
    }
  }
}

// Ustunlar va oʻq chiziqlarining koordinatalari. days = [{ day, devices }]
export function chartGeometry(days, width, height) {
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = Math.max(0, height - PAD.top - PAD.bottom);
  const { top, step } = niceScale(Math.max(0, ...days.map((d) => d.devices)));
  const slot = days.length ? plotW / days.length : 0;
  const barW = Math.max(1, Math.min(BAR_MAX, slot - GAP));
  const base = PAD.top + plotH;
  const bars = days.map((d, i) => {
    const h = (d.devices / top) * plotH;
    const x = PAD.left + i * slot + (slot - barW) / 2;
    return { ...d, x, y: base - h, w: barW, h, slotX: PAD.left + i * slot, slotW: slot };
  });
  const ticks = [];
  for (let v = 0; v <= top; v += step) ticks.push({ value: v, y: base - (v / top) * plotH });
  return { bars, ticks, base, plotLeft: PAD.left, plotRight: width - PAD.right };
}

// Tepasi 4 px yumaloq, pastki tomoni toʻgʻri ustun (SVG path)
function barPath({ x, y, w, h }) {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

// "2026-10-14" → "14.10"
const shortDay = (day) => `${day.slice(8)}.${day.slice(5, 7)}`;

// SVG element yaratish (atributlar bilan)
function svg(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

// Grafikni container ichiga chizadi. Hover / klaviatura (← →) bilan tooltip chiqadi.
export function renderDailyChart(container, days) {
  const width = Math.max(280, container.clientWidth);
  const height = 220;
  const g = chartGeometry(days, width, height);
  const root = svg('svg', {
    width, height, viewBox: `0 0 ${width} ${height}`, class: 'chart', tabindex: '0', role: 'img',
    'aria-label': `Kunlik noyob qurilmalar, ${days.length} kun. Strelkalar bilan kunlarni koʻring; aniq raqamlar pastdagi jadvalda.`,
  });

  for (const t of g.ticks) {
    root.append(svg('line', { x1: g.plotLeft, x2: g.plotRight, y1: t.y, y2: t.y, class: t.value === 0 ? 'chart-axis' : 'chart-grid' }));
    const label = svg('text', { x: g.plotLeft - 6, y: t.y + 4, 'text-anchor': 'end', class: 'chart-label' });
    label.textContent = String(t.value);
    root.append(label);
  }
  // X oʻqida faqat birinchi va oxirgi kun (koʻp yozuv bir-birini bosib qolmasin)
  const ends = days.length > 1 ? [g.bars[0], g.bars.at(-1)] : g.bars;
  ends.forEach((b, i) => {
    const label = svg('text', { x: b.slotX + b.slotW / 2, y: height - 6, 'text-anchor': ends.length > 1 ? (i ? 'end' : 'start') : 'middle', class: 'chart-label' });
    label.textContent = shortDay(b.day);
    root.append(label);
  });

  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;
  let active = -1;

  // Ustunni ajratib koʻrsatish va tooltipni uning ustiga qoʻyish
  const show = (i) => {
    marks.forEach((m, k) => m.classList.toggle('is-active', k === i));
    active = i;
    if (i < 0) { tip.hidden = true; return; }
    const b = g.bars[i];
    tip.textContent = `${shortDay(b.day)}: ${b.devices} ta qurilma`;
    tip.hidden = false;
    tip.style.left = `${Math.min(Math.max(b.x + b.w / 2, 60), width - 60)}px`;
    tip.style.top = `${Math.max(0, b.y - 8)}px`;
  };

  const marks = g.bars.map((b, i) => {
    const mark = svg('path', { d: barPath(b), class: 'chart-bar' });
    // Sichqoncha uchun nishon — butun ustun balandligi (ustunning oʻzidan kattaroq)
    const hit = svg('rect', { x: b.slotX, y: PAD.top, width: b.slotW, height: g.base - PAD.top, class: 'chart-hit' });
    hit.addEventListener('pointerenter', () => show(i));
    root.append(mark, hit);
    return mark;
  });
  root.addEventListener('pointerleave', () => show(-1));
  root.addEventListener('blur', () => show(-1));
  root.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step || !days.length) return;
    e.preventDefault();
    show(Math.min(days.length - 1, Math.max(0, (active < 0 ? (step > 0 ? -1 : days.length) : active) + step)));
  });

  const wrap = document.createElement('div');
  wrap.className = 'chart-wrap';
  wrap.append(root, tip);
  container.replaceChildren(wrap);
}
