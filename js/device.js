// device.js — "Bu qurilmani statistikadan chiqar" bayrogʻi (admin qurilmasi uchun).
// Alohida fayl: admin panel uni analytics.js'ni yuklamasdan ishlata oladi.
export const EXCLUDE_KEY = 'tortinchi-olchov.exclude';

// Bu qurilma statistikadan chiqarilganmi
export function isExcluded() {
  try { return localStorage.getItem(EXCLUDE_KEY) === '1'; } catch { return false; }
}

// Bayroqni oʻrnatish yoki olib tashlash
export function setExcluded(flag) {
  try {
    if (flag) localStorage.setItem(EXCLUDE_KEY, '1');
    else localStorage.removeItem(EXCLUDE_KEY);
  } catch { /* maxfiy rejim — jim oʻtamiz */ }
}
