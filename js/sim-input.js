// sim-input.js — simulyatorni sichqoncha, barmoq va klaviatura bilan boshqarish.
// Bu yerda matematika yoʻq: faqat "qancha surildi" hisoblanadi va simulator.js'ga uzatiladi.

const DRAG_DEG_PER_PX = 0.5; // sudrashda 1 piksel = 0.5°
const KEY_STEP = 5;          // strelka bosilganda 5°

// on.start() — foydalanuvchi tegdi; on.turn(dx, dy, force4d) — gradusda burish; on.end() — qoʻyib yubordi
export function attachInput(canvas, on) {
  let drag = null; // { id, x, y } — qaysi barmoq va oxirgi nuqta

  // Faqat birinchi barmoq kuzatiladi: ikkinchi barmoq tegsa, shakl sakrab ketmasligi kerak
  canvas.addEventListener('pointerdown', (e) => {
    if (drag) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    try { canvas.setPointerCapture(e.pointerId); } catch { /* baʼzi brauzerlarda ushlab boʻlmaydi */ }
    on.start();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = (e.clientX - drag.x) * DRAG_DEG_PER_PX;
    const dy = (e.clientY - drag.y) * DRAG_DEG_PER_PX;
    drag = { id: drag.id, x: e.clientX, y: e.clientY };
    on.turn(dx, dy, e.shiftKey);
  });
  // window'da tinglaymiz: barmoq canvas'dan tashqarida qoʻyib yuborilsa ham sudrash tugaydi
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    on.end();
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  // Klaviatura: strelkalar bilan burish (Shift — 4D)
  canvas.addEventListener('keydown', (e) => {
    const moves = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, -KEY_STEP], ArrowDown: [0, KEY_STEP] };
    if (!moves[e.key]) return;
    e.preventDefault();
    on.start();
    on.turn(...moves[e.key], e.shiftKey);
  });

  return { dragging: () => drag !== null };
}
