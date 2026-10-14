// widgets.js — dars matnidagi :::direktiva::: joy-egallovchilarini interaktiv elementga aylantiradi.
//   :::simulator dims=2,3,4 controls=dims:::        → kichik simulyator
//   :::predict uchlar=16 qirralar=32:::              → "avval bashorat qil, keyin tekshir"
import { el } from './dom.js';
import { createSimulator, ALL_CONTROLS } from './simulator.js';

// "2,3,4" → [2, 3, 4]
const numberList = (s) => s.split(',').map(Number).filter((n) => Number.isInteger(n) && n >= 2 && n <= 7);

// Root ichidagi barcha direktivalarni topib, har birini jonlantiradi
export function mountDirectives(root, { onSimulatorUse } = {}) {
  for (const node of root.querySelectorAll('.directive')) {
    const params = { ...node.dataset };
    delete params.directive;
    if (node.dataset.directive === 'simulator') mountSimulator(node, params, onSimulatorUse);
    else if (node.dataset.directive === 'predict') mountPredict(node, params);
    else node.remove(); // nomaʼlum direktiva — koʻrsatmaymiz
  }
}

// Kichik simulyator: dims va controls parametrlari bilan
function mountSimulator(node, params, onUse) {
  const parsed = params.dims ? numberList(params.dims) : [];
  const dims = parsed.length ? parsed : [2, 3, 4]; // notoʻgʻri qiymat butun darsni buzmasin
  const controls = params.controls ? params.controls.split(',').filter((c) => ALL_CONTROLS.includes(c)) : ['dims'];
  node.classList.add('lesson-sim');
  createSimulator(node, { dims, controls, onUse });
}

// Bashorat: har kalit — maydon nomi, qiymat — toʻgʻri javob
function mountPredict(node, params) {
  const fields = Object.entries(params).map(([name, expected]) => {
    const id = `predict-${Math.random().toString(36).slice(2, 8)}`;
    const input = el('input', { id, type: 'number', inputmode: 'numeric', min: '0' });
    const mark = el('span', { class: 'predict-mark' });
    const label = name.charAt(0).toUpperCase() + name.slice(1);
    return { input, mark, expected: Number(expected), row: el('div', { class: 'predict-field' }, [el('label', { for: id, text: label }), input, mark]) };
  });
  const status = el('p', { class: 'predict-status', 'aria-live': 'polite' });
  const button = el('button', { type: 'button', class: 'btn', text: 'Tekshirish' });

  // Har maydonni toʻgʻri javob bilan solishtiradi
  button.addEventListener('click', () => {
    let right = 0;
    for (const f of fields) {
      const ok = f.input.value !== '' && Number(f.input.value) === f.expected;
      if (ok) right++;
      f.row.classList.toggle('is-correct', ok);
      f.row.classList.toggle('is-wrong', !ok);
      f.mark.textContent = ok ? '✓' : `✗ javob: ${f.expected}`;
    }
    status.textContent = `${fields.length} tadan ${right} tasi toʻgʻri.`;
  });

  node.classList.add('predict', 'card');
  node.replaceChildren(
    el('p', { class: 'predict-title', text: 'Avval bashorat qiling, keyin tekshiring' }),
    el('div', { class: 'predict-grid' }, fields.map((f) => f.row)),
    button,
    status,
  );
}
