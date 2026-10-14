// sim-intro.js — bosh sahifadagi kirish animatsiyasi: nuqta → kesma → kvadrat → kub → tesserakt.
// Tesseraktning 16 ta uchi har bir oʻq boʻylab 0 dan 1 gacha "choʻziladi": hamma oʻq 0 — nuqta,
// birinchi oʻq 1 — kesma, ikkitasi — kvadrat va hokazo. Oxirida bu oddiy jonli simulyatorga aylanadi.
import { el } from './dom.js';

export const STAGES = ['Nuqta · 0D', 'Kesma · 1D', 'Kvadrat · 2D', 'Kub · 3D', 'Tesserakt · 4D'];
const PAUSE = 0.4;  // boshida nuqta qancha turadi (soniya)
const STEP = 0.7;   // har bir oʻqning choʻzilishi
export const INTRO_SECONDS = PAUSE + 4 * STEP + 0.3; // ≈ 3.5 s
const SEEN_KEY = 'tortinchi-olchov.intro'; // sessiyada bir marta

// t soniyada har bir oʻq qanchalik choʻzilgan: masalan [1, 1, 0.4, 0]
export function introStretch(t) {
  return [0, 1, 2, 3].map((k) => {
    const x = Math.max(0, Math.min(1, (t - PAUSE - k * STEP) / STEP));
    return x * x * (3 - 2 * x); // silliq boshlanib, silliq tugaydi
  });
}

// t soniyada qaysi bosqich nomi koʻrsatiladi
export function introStage(t) {
  return STAGES[introStretch(t).filter((s) => s > 0).length];
}

// Animatsiya kerakmi: reduced-motion yoqilgan yoki shu sessiyada koʻrilgan boʻlsa — yoʻq
export function shouldPlayIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return !sessionStorage.getItem(SEEN_KEY); } catch { return false; }
}

// Animatsiyani simulyatorga ulaydi. sim — createSimulator() natijasi
export function playIntro(sim) {
  const skip = el('button', { type: 'button', class: 'btn btn-secondary sim-skip', text: 'Oʻtkazib yuborish' });
  sim.stage.append(skip);
  sim.info.setAttribute('aria-live', 'off'); // bosqich nomlari ekran oʻquvchida ketma-ket oʻqilmasin
  let t = 0;

  // Tugatish: tugma, sudrash, klaviatura yoki vaqt tugaganda
  const finish = () => {
    if (!sim.intro) return;
    sim.intro = null;
    skip.remove();
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* maxfiy rejim — muhim emas */ }
    sim.setStretch(null);
    sim.info.setAttribute('aria-live', 'polite');
    sim.refreshInfo();
  };
  skip.addEventListener('click', () => { finish(); sim.canvas.focus(); });

  // Har kadrda simulyator shu funksiyani chaqiradi; true — animatsiya davom etyapti
  sim.intro = {
    tick(dt) {
      t += dt;
      if (t >= INTRO_SECONDS) { finish(); return false; }
      sim.setStretch(introStretch(t));
      sim.info.textContent = introStage(t);
      return true;
    },
    finish,
  };
  sim.requestFrame();
}
