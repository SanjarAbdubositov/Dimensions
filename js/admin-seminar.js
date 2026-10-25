// admin-seminar.js — admin paneldagi "Seminarlar" boʻlimi: yaratish, havolani nusxalash, QR-kod.
// Seminarlar roʻyxati shu brauzerning localStorage'ida saqlanadi: bazaga hech narsa yozilmaydi
// (admin panel bazani faqat oʻqiydi). Maʼlumotda uchragan kodlar roʻyxatga oʻzi qoʻshiladi.
// XAVFSIZLIK: hamma matn el(..., { text }) — textContent bilan chiqadi.
import { el } from './dom.js';
import { codeFromName, seminarLinks, mergeSeminars, qrMatrix, qrPath } from './seminar.js';

const KEY = 'tortinchi-olchov.seminars';
const SVG = 'http://www.w3.org/2000/svg';

// Saqlangan seminarlar (localStorage ishlamasa — boʻsh roʻyxat)
export function loadSeminars() {
  try { const list = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(list) ? list : []; } catch { return []; }
}

// Roʻyxatni saqlash
function saveSeminars(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* maxfiy rejim — faqat shu sessiya */ }
}

// QR-kod SVG koʻrinishida (oq hoshiya bilan, telefon kamerasi oson oʻqishi uchun)
function qrSvg(url, label) {
  const m = qrMatrix(url);
  const size = m.length + 8;
  const svg = document.createElementNS(SVG, 'svg');
  Object.entries({ viewBox: `-4 -4 ${size} ${size}`, width: 220, height: 220, role: 'img', 'aria-label': `QR-kod: ${label}`, class: 'qr' })
    .forEach(([k, v]) => svg.setAttribute(k, v));
  const bg = document.createElementNS(SVG, 'rect');
  Object.entries({ x: -4, y: -4, width: size, height: size, fill: '#ffffff' }).forEach(([k, v]) => bg.setAttribute(k, v));
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', qrPath(m));
  path.setAttribute('fill', '#000000');
  svg.append(bg, path);
  return svg;
}

// QR-kodni PNG fayl qilib yuklab berish (chop etish yoki slaydga qoʻyish uchun)
function downloadPng(url, filename) {
  const m = qrMatrix(url);
  const cell = 12;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = (m.length + 8) * cell;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  m.forEach((row, r) => row.forEach((dark, c) => { if (dark) ctx.fillRect((c + 4) * cell, (r + 4) * cell, cell, cell); }));
  canvas.toBlob((blob) => {
    const href = URL.createObjectURL(blob);
    const a = el('a', { href, download: filename });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  });
}

// Matnni nusxalash; tugma qisqa vaqt "✓ Nusxalandi" deb turadi
async function copy(text, button, input) {
  try { await navigator.clipboard.writeText(text); } catch { input.select(); document.execCommand?.('copy'); }
  button.textContent = '✓ Nusxalandi';
  setTimeout(() => { button.textContent = 'Nusxa olish'; }, 2000);
}

// Bitta havola qatori: nom, havola, "Nusxa olish", "QR-kod"
function linkRow(link, code) {
  const id = `seminar-${code}-${link.key}`;
  const input = el('input', { id, type: 'text', readonly: '', value: link.url, class: 'seminar-url' });
  input.addEventListener('focus', () => input.select());
  const copyBtn = el('button', { type: 'button', class: 'btn btn-secondary', text: 'Nusxa olish' });
  copyBtn.addEventListener('click', () => copy(link.url, copyBtn, input));
  const qrBox = el('div', { class: 'qr-box', hidden: '' });
  const qrBtn = el('button', { type: 'button', class: 'btn btn-secondary', text: 'QR-kod', 'aria-expanded': 'false' });
  qrBtn.addEventListener('click', () => {
    if (!qrBox.childElementCount) {
      const png = el('button', { type: 'button', class: 'link-button', text: 'PNG yuklab olish' });
      png.addEventListener('click', () => downloadPng(link.url, `qr-${code}-${link.key}.png`));
      qrBox.append(qrSvg(link.url, `${code}, ${link.label}`), png);
    }
    qrBox.hidden = !qrBox.hidden;
    qrBtn.setAttribute('aria-expanded', String(!qrBox.hidden));
  });
  return el('div', { class: 'seminar-link' }, [
    el('label', { for: id, text: link.label }), input,
    el('div', { class: 'btn-row' }, [copyBtn, qrBtn]), qrBox,
  ]);
}

// "Seminarlar" boʻlimini quradi. on.showReport(code) — shu seminar natijalariga oʻtish.
// Qaytgan update(codesFromData) — maʼlumot yuklangandan keyin roʻyxatni yangilaydi.
export function setupSeminars(root, on) {
  const nameInput = root.querySelector('#seminar-name');
  const preview = root.querySelector('#seminar-preview');
  const list = root.querySelector('#seminar-list');
  let dataCodes = [];
  let justCreated = null; // yangi yaratilgan seminar ochiq holda koʻrsatiladi

  // Nom yozilganda kod qanday chiqishini darhol koʻrsatamiz
  nameInput.addEventListener('input', () => {
    const code = codeFromName(nameInput.value);
    preview.textContent = nameInput.value.trim() ? (code ? `Kod: ${code}` : 'Nomda kamida bitta lotin harf yoki raqam boʻlsin.') : '';
  });

  root.querySelector('#seminar-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = codeFromName(nameInput.value);
    if (!code) { preview.textContent = 'Nomda kamida bitta lotin harf yoki raqam boʻlsin.'; return; }
    const saved = loadSeminars();
    if (!saved.some((s) => s.code === code)) saved.push({ code, name: nameInput.value.trim(), created: new Date().toISOString() });
    saveSeminars(saved);
    justCreated = code;
    nameInput.value = '';
    preview.textContent = `“${code}” seminari yaratildi. Havolalar pastda.`;
    render();
    on.codesChanged();
  });

  // Roʻyxatni chizish
  function render() {
    const items = mergeSeminars(loadSeminars(), dataCodes);
    if (!items.length) { list.replaceChildren(el('p', { class: 'muted', text: 'Hali seminar yoʻq.' })); return; }
    list.replaceChildren(...items.map((s) => {
      const actions = [el('button', { type: 'button', class: 'btn', text: 'Natijalarni koʻrish', onclick: () => on.showReport(s.code) })];
      if (s.saved) actions.push(el('button', { type: 'button', class: 'link-button', text: 'Roʻyxatdan olib tashlash', onclick: () => remove(s.code) }));
      const meta = s.saved
        ? `${s.name || s.code} · ${new Date(s.created).toLocaleDateString('uz')}`
        : 'Maʼlumotda uchragan kod (bu brauzerda yaratilmagan)';
      const details = el('details', { class: 'seminar' }, [
        el('summary', {}, [el('span', { class: 'seminar-code', text: s.code }), el('span', { class: 'def', text: meta })]),
        ...seminarLinks(location.href, s.code).map((link) => linkRow(link, s.code)),
        el('div', { class: 'btn-row' }, actions),
      ]);
      details.open = s.code === justCreated;
      return el('li', {}, [details]);
    }));
  }

  // Roʻyxatdan olib tashlash (yigʻilgan maʼlumot oʻchmaydi)
  function remove(code) {
    if (!confirm(`“${code}” roʻyxatdan olib tashlansinmi? Yigʻilgan natijalar oʻchmaydi.`)) return;
    saveSeminars(loadSeminars().filter((s) => s.code !== code));
    render();
    on.codesChanged();
  }

  render();
  return (codes) => { dataCodes = codes; render(); };
}
