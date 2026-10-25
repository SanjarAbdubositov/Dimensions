// admin-view.js — hisobotni sahifaga chizish.
// XAVFSIZLIK: seminar kodlari — foydalanuvchi kiritgan matn. Hammasi el(..., { text })
// orqali, yaʼni textContent bilan chiqadi. Bu faylda innerHTML ishlatilmaydi (testda tekshiriladi).
import { el } from './dom.js';
import {
  uniqueDevices, dailyDevices, lessonFunnel, quizAverages, prePostComparison,
  feedbackSummary, isLowN, LOW_N,
} from './stats.js';
import { renderDailyChart } from './chart.js';

const FEEDBACK_LIMIT = 200; // sahifada koʻrsatiladigan fikrlar soni (hammasi CSV'da)
let chartObserver = null;  // grafikni ekran kengligiga moslash (har yangilanishda eskisi yopiladi)

// Foiz: 66.666 → "67%", null → "—"
const pct = (x) => (x === null ? '—' : `${Math.round(x)}%`);
// Oʻzgarish: +12 / −5 foiz punkti
const delta = (x) => (x === null ? '—' : `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.abs(Math.round(x))} f.p.`);
// Ikki xonali son: 4 → "04"
const pad = (n) => String(n).padStart(2, '0');
// Sana va vaqt: 14.10.2026 09:30 (brauzer vaqti boʻyicha)
export function formatDateTime(iso) {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const LOW_TEXT = `Maʼlumot kam — xulosa chiqarish uchun yetarli emas (n < ${LOW_N} qurilma).`;

// n kichik boʻlsa — jadval katagi uchun qisqa belgi (toʻliq matn jadval ostida)
function lowBadge(n) {
  return isLowN(n) ? el('span', { class: 'low-n', title: LOW_TEXT, text: '⚠ maʼlumot kam' }) : '';
}

// Jadval ostidagi izoh: birorta qatorda n kichik boʻlsa, toʻliq ogohlantirish
function lowFootnote(ns) {
  return ns.some(isLowN) ? el('p', { class: 'low-n-note', text: `⚠ ${LOW_TEXT}` }) : '';
}

// Boʻlim: sarlavha, taʼrif va ichki elementlar
function section(title, definition, children) {
  return el('section', { class: 'admin-section card' }, [
    el('h2', { text: title }),
    el('p', { class: 'def', text: definition }),
    ...children,
  ]);
}

// Jadval: telefonda yon tomonga suriladi, shuning uchun klaviatura bilan ham fokuslanadi (tabindex)
function table(label, headers, rows) {
  const head = el('tr', {}, headers.map((h) => el('th', { scope: 'col', text: h })));
  const body = rows.map((cells) => el('tr', {}, cells.map((c) => el('td', {}, [c]))));
  return el('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-label': label }, [
    el('table', {}, [el('thead', {}, [head]), el('tbody', {}, body)]),
  ]);
}

// Kunlik grafik + jadval koʻrinishi (grafikni koʻra olmaydiganlar uchun)
function dailySection(events) {
  const days = dailyDevices(events);
  const holder = el('div', { class: 'chart-holder' });
  const draw = () => renderDailyChart(holder, days);
  requestAnimationFrame(draw);
  let pending = 0;
  chartObserver?.disconnect();
  chartObserver = new ResizeObserver(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(draw); });
  chartObserver.observe(holder);
  const details = el('details', {}, [
    el('summary', { text: 'Jadval koʻrinishi' }),
    table('Kunlik noyob qurilmalar jadvali', ['Kun', 'Noyob qurilmalar'], days.map((d) => [d.day, String(d.devices)])),
  ]);
  return section('Kunlik noyob qurilmalar', 'Har bir kunda saytni ochgan turli qurilmalar soni (brauzeringiz vaqti boʻyicha). Bir qurilma bir kunda necha marta kirsa ham — 1.', [holder, details]);
}

// Asosiy hisobot. data = { events, feedback }
export function renderReport(root, { events, feedback }) {
  const devices = uniqueDevices(events);
  const summary = el('section', { class: 'admin-section card' }, [
    el('h2', { text: 'Umumiy' }),
    el('p', { class: 'hero-number', text: String(devices) }),
    el('p', { class: 'hero-label', text: 'Noyob qurilmalar' }),
    el('p', { class: 'def', text: 'Bu odamlar soni emas, qurilmalar soni. Bir odam telefon va kompyuterdan kirsa — 2 ta. Bir nechta oʻquvchi bitta kompyuterdan kirsa — 1 ta. Faqat rozilik bergan qurilmalar hisoblanadi.' }),
    el('p', { text: `Hodisalar: ${events.length} · Fikrlar: ${feedback.length}` }),
  ]);

  const funnel = lessonFunnel(events);
  const funnelSection = section('Dars voronkasi',
    'Boshlaganlar — darsni ochgan (yoki tugatgan) noyob qurilmalar. Tugatganlar — dars matnini oxirigacha koʻrib, testni topshirgan qurilmalar. Tugatish foizi = tugatganlar ÷ boshlaganlar.',
    [table('Dars voronkasi', ['Dars', 'Boshlagan', 'Tugatgan', 'Foiz', 'Izoh'],
      funnel.map((r) => [`${r.lessonId}-dars`, String(r.started), String(r.completed), pct(r.rate), lowBadge(r.started)])),
    lowFootnote(funnel.map((r) => r.started))]);

  const quizzes = quizAverages(events);
  const quizSection = section('Testlar boʻyicha oʻrtacha ball',
    'Har bir qurilmaning faqat birinchi urinishi olinadi (qayta urinishlar hisoblanmaydi). Ball foizda: 5 tadan 4 ta = 80%. n — nechta qurilma.',
    [table('Testlar boʻyicha oʻrtacha ball', ['Dars testi', 'Oʻrtacha', 'n', 'Izoh'],
      quizzes.map((r) => [`${r.lessonId}-dars`, pct(r.meanPercent), String(r.n), lowBadge(r.n)])),
    lowFootnote(quizzes.map((r) => r.n))]);

  const prepost = prePostComparison(events);
  const prepostSection = section('Oldin / keyin taqqoslash',
    'Faqat ikkala testni ham (seminar boshida va oxirida) topshirgan qurilmalar hisoblanadi — n shular soni. Har testdan birinchi urinish olinadi. Guruh — “oldin” testidagi seminar kodi. Oʻzgarish — foiz punktlarida (f.p.).',
    [table('Oldin / keyin taqqoslash', ['Guruh', 'n', 'Oldin', 'Keyin', 'Oʻzgarish', 'Faqat oldin', 'Faqat keyin', 'Izoh'],
      prepost.map((r) => [r.group, String(r.n), pct(r.before), pct(r.after), delta(r.change), String(r.preOnly), String(r.postOnly), lowBadge(r.n)])),
    lowFootnote(prepost.map((r) => r.n))]);

  root.replaceChildren(summary, dailySection(events), funnelSection, quizSection, prepostSection, feedbackSection(feedback));
}

// Fikrlar roʻyxati: reyting, dars va sana
function feedbackSection(feedback) {
  const { n, meanRating, items } = feedbackSummary(feedback);
  const avg = meanRating === null ? '—' : meanRating.toFixed(1);
  const list = items.slice(0, FEEDBACK_LIMIT).map((f) => el('li', { class: 'feedback-item' }, [
    el('p', { class: 'feedback-meta' }, [
      el('span', { class: 'stars-static', 'aria-hidden': 'true', text: '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating) }),
      el('span', { text: ` ${f.rating}/5 · ${f.lesson_id ? `${f.lesson_id}-dars` : 'dars koʻrsatilmagan'} · ${formatDateTime(f.created_at)}` }),
      f.group_code ? el('span', { class: 'muted', text: ` · ${f.group_code}` }) : '',
    ]),
  ]));
  const more = items.length > FEEDBACK_LIMIT ? el('p', { class: 'def', text: `Oxirgi ${FEEDBACK_LIMIT} tasi koʻrsatildi. Hammasi CSV faylda.` }) : '';
  return section('Fikrlar', `Oʻrtacha reyting: ${avg} (n = ${n}). Yangilari birinchi.`,
    [lowFootnote([n]), n ? el('ul', { class: 'feedback-list' }, list) : el('p', { class: 'muted', text: 'Hali fikr yoʻq.' }), more]);
}

