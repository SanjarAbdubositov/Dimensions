// seminar-bar.js — seminar paytida saytning tepasida chiqadigan “Oxiridagi testni topshirish” tugmasi.
// Oʻquvchi faqat bitta QR (seminar boshidagi test) bilan kiradi. Oxirgi testni ikkinchi QR orqali emas,
// shu tugma orqali — oʻsha brauzerda ochadi. Shunda ikkala test bitta qurilma deb hisoblanadi va juftlanadi.
import { el } from './dom.js';
import { loadProgress } from './progress.js';

const GROUP_KEY = 'tortinchi-olchov.group';
export const BAR_HOURS = 24; // boshidagi test topshirilgandan keyin tugma qancha vaqt koʻrinadi

// Tugma kerakmi: seminar kodi bor, boshidagi test yaqinda topshirilgan, oxiridagisi hali yoʻq
export function shouldShowSeminarBar({ group, tests, now, page }) {
  if (!group || !tests?.pre || tests.post) return false;
  if (page === 'post') return false; // oxirgi test sahifasining oʻzida kerak emas
  return now - (tests.pre.at ?? 0) < BAR_HOURS * 3600 * 1000;
}

// Sahifaga tugmani qoʻyadi (sarlavha ostiga). Hech qachon xato tashlamaydi
export function showSeminarBar() {
  try {
    const params = new URLSearchParams(location.search);
    const page = location.pathname.endsWith('test.html') ? params.get('type') : null;
    const state = { group: localStorage.getItem(GROUP_KEY), tests: loadProgress().tests, now: Date.now(), page };
    if (!shouldShowSeminarBar(state) || document.querySelector('.seminar-bar')) return;
    const bar = el('div', { class: 'seminar-bar', role: 'region', 'aria-label': 'Seminar' }, [
      el('div', { class: 'wrap wrap-wide' }, [
        el('p', { text: 'Seminar tugaganda oxirgi testni shu yerdan oching:' }),
        el('a', { class: 'btn', href: 'test.html?type=post', text: 'Oxiridagi testni topshirish' }),
      ]),
    ]);
    (document.querySelector('.site-header') ?? document.body.firstElementChild).after(bar);
  } catch { /* xotira ishlamasa — tugma shunchaki chiqmaydi */ }
}
