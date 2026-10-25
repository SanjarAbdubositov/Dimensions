// seminar.js — seminar kodlari va havolalar uchun sof funksiyalar (DOM yoʻq, Node'da test qilinadi).
import { isValidGroupCode } from './analytics-core.js';
import { qrcode } from './vendor/qrcode.js';

// Seminar nomidan kod yasaydi: "Synergy 9-A" → "SYNERGY-9-A".
// Faqat lotin harf, raqam va chiziqcha qoladi (saytdagi ?g= bilan bir xil qoida), 32 belgigacha.
export function codeFromName(name) {
  const code = String(name ?? '')
    .toUpperCase()
    .replace(/[\u02BB\u02BC\u2018\u2019'`]/g, '') // oʻ/gʻ belgisi va tutuq belgisi tashlanadi: OʻZBEK → OZBEK
    .replace(/[^A-Z0-9]+/g, '-')     // boʻsh joy va boshqa belgilar → chiziqcha
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
    .replace(/-+$/, '');
  return isValidGroupCode(code) ? code : '';
}

// Seminar uchun uchta havola. base — sayt ildizi, masalan "https://…/Dimensions/"
export function seminarLinks(base, code) {
  const root = new URL('.', base);
  const g = encodeURIComponent(code);
  return [
    { key: 'home', label: 'Bosh sahifa', url: new URL(`index.html?g=${g}`, root).href },
    { key: 'pre', label: 'Seminar boshidagi test', url: new URL(`test.html?type=pre&g=${g}`, root).href },
    { key: 'post', label: 'Seminar oxiridagi test', url: new URL(`test.html?type=post&g=${g}`, root).href },
  ];
}

// Saqlangan seminarlar va maʼlumotda uchragan kodlarni bitta roʻyxatga birlashtiradi (yangilari tepada)
export function mergeSeminars(saved, codesFromData) {
  const list = saved.filter((s) => isValidGroupCode(s?.code)).map((s) => ({ ...s, saved: true }));
  const known = new Set(list.map((s) => s.code));
  for (const code of codesFromData) {
    if (isValidGroupCode(code) && !known.has(code)) list.push({ code, name: '', created: null, saved: false });
  }
  return list.sort((a, b) => (b.created ?? '').localeCompare(a.created ?? '') || a.code.localeCompare(b.code));
}

// QR-kod: qora katakchalar matritsasi (true — qora). Xatoni tuzatish darajasi M (~15%)
export function qrMatrix(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

// Matritsani bitta SVG yoʻliga aylantiradi (har qora katak — 1×1 kvadrat)
export function qrPath(matrix) {
  let d = '';
  matrix.forEach((row, r) => row.forEach((dark, c) => { if (dark) d += `M${c} ${r}h1v1h-1z`; }));
  return d;
}
