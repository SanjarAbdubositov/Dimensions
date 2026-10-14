// sim-controls.js — simulyator uchun HTML elementlar: canvas, tugmalar, slayderlar.
// Bu yerda hisob-kitob yoʻq: faqat interfeys yaratiladi va hodisalar simulator.js'ga uzatiladi.
import { listPlanes } from './math4d.js';
import { el } from './dom.js';

// Oʻq nomlari: X, Y, Z, W, keyin 5D–7D uchun V, U, T
export const AXES = ['X', 'Y', 'Z', 'W', 'V', 'U', 'T'];

const NAMES = {
  2: 'Kvadrat',
  3: 'Kub',
  4: 'Tesserakt (4-kub)',
  5: 'Penterakt (5-kub)',
  6: 'Hekserakt (6-kub)',
  7: 'Hepterakt (7-kub)',
};

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
let uid = 0; // sahifada bir nechta simulyator boʻlsa, id'lar takrorlanmasligi uchun

// Tugmalar guruhi: bir vaqtda faqat bittasi tanlangan (aria-pressed="true")
function segmented(label, options, onPick) {
  const group = el('div', { class: 'seg', role: 'group', 'aria-label': label });
  const buttons = options.map(([value, text]) =>
    el('button', { type: 'button', text, onclick: () => { group.select(value); onPick(value); } }));
  group.append(...buttons);
  group.select = (value) => buttons.forEach((b, k) => b.setAttribute('aria-pressed', String(options[k][0] === value)));
  return group;
}

// Yorliqli slayder; set(v) — tashqaridan qiymatni yangilash
function range(labelText, { min, max, step = 1 }, format, onInput) {
  const id = `sim-range-${++uid}`;
  const input = el('input', { type: 'range', id, min, max, step });
  const output = el('output', { for: id });
  input.addEventListener('input', () => { output.textContent = format(+input.value); onInput(+input.value); });
  const wrap = el('div', { class: 'range' }, [el('label', { for: id, text: labelText }), output, input]);
  wrap.set = (v) => { input.value = v; output.textContent = format(+input.value); };
  return wrap;
}

// Butun interfeysni yaratadi va uni yangilash uchun funksiyalar qaytaradi
export function buildControls(root, { dims, controls }, on) {
  const has = (name) => controls.includes(name);
  const info = el('p', { class: 'sim-info', 'aria-live': 'polite' });
  const canvas = el('canvas', { class: 'sim-canvas', tabindex: '0', role: 'img' });
  const legend = el('div', { class: 'sim-legend' });
  const panel = el('div', { class: 'sim-panel' });
  const stage = el('div', { class: 'sim-stage' }, [canvas, info]);
  root.append(stage, el('div', { class: 'sim-side' }, [legend, panel]));

  const ui = { canvas, info, stage, n: null, infoText: '' };
  const add = (title, node) => panel.append(el('div', { class: 'sim-row' }, title ? [el('span', { class: 'sim-label', text: title }), node] : [node]));

  if (has('dims')) {
    ui.dims = segmented('Oʻlchamni tanlang', dims.map((d) => [d, `${d}D`]), on.dim);
    add('Oʻlcham', ui.dims);
  }
  if (has('projection')) {
    ui.projection = segmented('Proyeksiya turi', [['perspective', 'Perspektiv'], ['orthographic', 'Ortogonal']], on.projection);
    add('Proyeksiya', ui.projection);
  }
  if (has('drag')) {
    ui.drag = segmented('Sudrash rejimi', [['3d', '3D burish'], ['4d', '4D burish']], on.dragMode);
    add('Sudrash', el('div', {}, [ui.drag, el('small', { class: 'hint', text: 'Shift bosib tursangiz ham 4D burish boʻladi.' })]));
  }
  if (has('auto')) {
    ui.autoBtn = el('button', { type: 'button', class: 'btn', onclick: on.toggleAuto });
    ui.speed = range('Tezlik', { min: 0, max: 90 }, (v) => `${v}°/s`, on.speed);
    add(null, el('div', { class: 'sim-auto' }, [ui.autoBtn, ui.speed]));
  }
  if (has('size')) {
    ui.size = range('Kattalik', { min: 50, max: 150, step: 5 }, (v) => `${v}%`, (v) => on.size(v / 100));
    add(null, ui.size);
  }
  if (has('sliders')) {
    ui.planesSummary = el('summary');
    ui.planesGrid = el('div', { class: 'planes-grid' });
    ui.planes = el('details', { class: 'planes' }, [ui.planesSummary, ui.planesGrid]);
    add(null, ui.planes);
  }
  if (has('lamp')) Object.assign(ui, lampControl(add, on.lamp));
  if (has('reset')) add(null, el('button', { type: 'button', class: 'btn btn-secondary', text: 'Qayta tiklash', onclick: on.reset }));

  // Oʻlcham oʻzgarganda: matnlar va tekislik slayderlarini qayta quradi
  ui.setDim = (n, vertexCount, edgeCount, lampD) => {
    ui.n = n;
    const counts = `${vertexCount} uch (2${SUP[n]}) · ${edgeCount} qirra (${n}·2${SUP[n - 1]})`;
    ui.infoText = `${NAMES[n]} · ${counts}`;
    ui.refreshInfo();
    ui.setLampRange?.(n, lampD);
    canvas.setAttribute('aria-label', `${NAMES[n]}: ${counts}. Strelkalar bilan aylantiring, Shift bilan — 4D burish.`);
    legend.replaceChildren(...legendContent(n));
    ui.dims?.select(n);
    if (!ui.planes) return;
    const planes = listPlanes(n);
    ui.planesSummary.textContent = `Aylanish tekisliklari (${planes.length} ta)`;
    ui.planes.open = n <= 4; // 5D+ da slayderlar koʻp, shuning uchun yigʻilgan holda
    ui.sliders = planes.map(([i, j]) => {
      const r = range(AXES[i] + AXES[j], { min: -180, max: 180 }, (v) => `${v}°`, (v) => on.angle(i, j, v));
      r.key = `${i}-${j}`;
      return r;
    });
    ui.planesGrid.replaceChildren(...ui.sliders);
  };

  // Yuqoridagi yozuvni qayta koʻrsatadi (kirish animatsiyasidan keyin)
  ui.refreshInfo = () => { info.textContent = ui.infoText; };

  // Burchak slayderlarini holatga moslaydi (avto-aylanish yoki sudrashdan keyin)
  ui.syncAngles = (angles) => ui.sliders?.forEach((r) => r.set(Math.round(angles[r.key] ?? 0)));

  // Qolgan barcha boshqaruvlarni holatga moslaydi
  ui.syncState = (state) => {
    ui.projection?.select(state.projection);
    ui.drag?.select(state.dragMode);
    if (ui.autoBtn) {
      ui.autoBtn.textContent = state.auto ? '⏸ Toʻxtatish' : '▶ Aylantirish';
      ui.autoBtn.setAttribute('aria-pressed', String(state.auto));
    }
    ui.speed?.set(state.speed);
    ui.size?.set(Math.round(state.size * 100));
    ui.syncAngles(state.angles);
  };

  return ui;
}

// Izoh: rang VA qalinlik — uzoq qirra ingichka, xira, koʻk; yaqini qalin, toʻq, zafar rang
function legendContent(n) {
  if (n < 3) return [el('p', { text: '2D shaklda yashirin oʻq yoʻq, shuning uchun hamma qirra bir xil.' })];
  const last = AXES[n - 1];
  return [
    el('div', { class: 'legend-wedge', 'aria-hidden': 'true' }),
    el('p', { class: 'legend-ends' }, [el('span', { text: 'uzoq: ingichka, xira' }), el('span', { text: 'yaqin: qalin, toʻq' })]),
    el('p', { class: 'hint', text: `Har bir qirraning ${last} oʻqidagi oʻrni ikki belgi bilan koʻrsatiladi: rang (koʻkdan firuza orqali zafarga) va qalinlik. Ranglarni ajratish qiyin boʻlsa, qalinlikka qarang: yaqin qirralar qalinroq.` }),
  ];
}

// Raqam: 1.5 → "1,50" (oʻzbekcha kasr vergul bilan)
const num = (x, digits = 2) => x.toFixed(digits).replace('.', ',').replace('-', '−');

// Chiroq: surilsa kamera masofasi d oʻzgaradi, ostida jonli formula d / (d − w)
function lampControl(add, onLamp) {
  const id = `sim-lamp-${++uid}`;
  const input = el('input', { type: 'range', id, step: '0.1' });
  const output = el('output', { for: id });
  const formula = el('div', { class: 'lamp-formula' });
  input.addEventListener('input', () => { output.textContent = `d = ${num(+input.value, 1)}`; onLamp(+input.value); });
  add(null, el('div', { class: 'lamp' }, [
    el('div', { class: 'lamp-head' }, [el('label', { for: id, text: 'Chiroq masofasi' }), output]), input,
    el('p', { class: 'legend-ends' }, [el('span', { text: 'yaqin' }), el('span', { text: 'uzoq' })]),
    formula,
  ]));
  let last = '';
  return {
    // Oʻlcham almashganda: chiroq shakl ichiga kirib qolmasin (d > radius)
    setLampRange(n, d) {
      const r = Math.sqrt(n);
      Object.assign(input, { min: Math.ceil(r * 11) / 10, max: Math.round(r * 5) });
      input.value = d;
      output.textContent = `d = ${num(+input.value, 1)}`;
    },
    // Har kadrda: eng yaqin va eng uzoq uch uchun koeffitsient (faqat oʻzgarsa yoziladi)
    showLamp({ d, ws, n, perspective }) {
      const w = AXES[n - 1].toLowerCase();
      const round = (x) => (Math.abs(x) < 0.005 ? 0 : x); // "−0,00" chiqmasin
      const near = round(Math.max(...ws));
      const far = round(Math.min(...ws));
      const line = (name, x) => `${name} (${w} = ${num(x)}): ${num(d, 1)} / (${num(d, 1)} ${x < 0 ? '+' : '−'} ${num(Math.abs(x))}) = ${num(d / (d - x))}`;
      const lines = perspective
        ? [`Kattalashtirish: d / (d − ${w})`, line('eng yaqin uch', near), line('eng uzoq uch', far)]
        : ['Ortogonal proyeksiya: chiroq cheksiz uzoqda, hamma uch uchun koeffitsient 1.'];
      const text = lines.join('\n');
      if (text === last) return;
      last = text;
      formula.replaceChildren(...lines.map((t) => el('p', { text: t })));
    },
  };
}
