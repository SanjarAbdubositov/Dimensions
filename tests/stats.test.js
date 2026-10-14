// stats.js (admin panel hisob-kitoblari) va csv.js uchun testlar
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  uniqueDevices, dailyDevices, lessonFunnel, quizAverages, prePostComparison,
  feedbackSummary, groupCodes, isLowN, mean, LOW_N, NO_GROUP,
} from '../js/stats.js';
import { escapeCell, toCsv, csvFilename } from '../js/csv.js';

// Mahalliy vaqt boʻyicha sana (testlar soat mintaqasiga bogʻliq boʻlmasin)
const at = (day, hour = 10, min = 0) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, hour, min).toISOString();
};
// Qisqa hodisa yaratuvchi
const ev = (anon, type, extra = {}) => ({
  anon_id: anon, event_type: type, lesson_id: null, score: null, max_score: null,
  group_code: null, created_at: at('2026-10-14'), ...extra,
});

test('noyob qurilmalar: bir qurilmaning koʻp hodisasi bitta hisoblanadi', () => {
  const events = [ev('a', 'page_view'), ev('a', 'lesson_start'), ev('b', 'page_view')];
  assert.equal(uniqueDevices(events), 2);
  assert.equal(uniqueDevices([]), 0);
});

test('kunlik grafik: har kun noyob qurilmalar, oradagi boʻsh kunlar 0', () => {
  const events = [
    ev('a', 'page_view', { created_at: at('2026-10-12', 9) }),
    ev('a', 'page_view', { created_at: at('2026-10-12', 18) }),
    ev('b', 'page_view', { created_at: at('2026-10-12', 23, 59) }),
    ev('a', 'page_view', { created_at: at('2026-10-14', 0, 1) }),
    ev('x', 'page_view', { created_at: 'buzilgan sana' }),
  ];
  assert.deepEqual(dailyDevices(events), [
    { day: '2026-10-12', devices: 2 },
    { day: '2026-10-13', devices: 0 },
    { day: '2026-10-14', devices: 1 },
  ]);
  assert.deepEqual(dailyDevices([]), []);
});

test('voronka: boshlaganlar → tugatganlar → foiz', () => {
  const events = [
    ev('a', 'lesson_start', { lesson_id: 1 }),
    ev('a', 'lesson_start', { lesson_id: 1 }), // takror — bitta qurilma
    ev('b', 'lesson_start', { lesson_id: 1 }),
    ev('c', 'lesson_start', { lesson_id: 1 }),
    ev('d', 'lesson_start', { lesson_id: 1 }),
    ev('a', 'lesson_complete', { lesson_id: 1 }),
    ev('e', 'lesson_complete', { lesson_id: 1 }), // lesson_start'siz tugatgan (rozilik keyin berilgan)
    ev('b', 'lesson_start', { lesson_id: 2 }),
  ];
  const [l1, l2, l3] = lessonFunnel(events, [1, 2, 3]);
  assert.deepEqual(l1, { lessonId: 1, started: 5, completed: 2, rate: 40 });
  assert.deepEqual(l2, { lessonId: 2, started: 1, completed: 0, rate: 0 });
  assert.deepEqual(l3, { lessonId: 3, started: 0, completed: 0, rate: null }, 'hech kim boshlamagan — foiz yoʻq');
  assert.ok(lessonFunnel(events).every((r) => r.rate === null || r.rate <= 100), 'foiz 100 dan oshmaydi');
});

test('test oʻrtachasi: har qurilmaning faqat birinchi urinishi, foizda', () => {
  const events = [
    ev('a', 'quiz_submit', { lesson_id: 1, score: 2, max_score: 5, created_at: at('2026-10-14', 10) }),
    ev('a', 'quiz_submit', { lesson_id: 1, score: 5, max_score: 5, created_at: at('2026-10-14', 11) }), // qayta urinish
    ev('b', 'quiz_submit', { lesson_id: 1, score: 4, max_score: 5 }),
    ev('c', 'quiz_submit', { lesson_id: 2, score: 3, max_score: 4 }),
  ];
  const [q1, q2, q3] = quizAverages(events, [1, 2, 3]);
  assert.equal(q1.n, 2);
  assert.equal(q1.meanPercent, 60); // (40 + 80) / 2 — a ning 2-urinishi (100%) hisoblanmaydi
  assert.deepEqual(q2, { lessonId: 2, n: 1, meanPercent: 75 });
  assert.deepEqual(q3, { lessonId: 3, n: 0, meanPercent: null });
});

test('oldin/keyin: faqat ikkala testni topshirganlar, guruh boʻyicha va jami', () => {
  const pre = (id, score, group, hour = 9) => ev(id, 'pretest_submit', { score, max_score: 6, group_code: group, created_at: at('2026-10-14', hour) });
  const post = (id, score, group, hour = 15) => ev(id, 'posttest_submit', { score, max_score: 6, group_code: group, created_at: at('2026-10-14', hour) });
  const events = [
    pre('a', 3, 'MAKTAB12-A'), post('a', 6, 'MAKTAB12-A'),
    pre('b', 0, 'MAKTAB12-A'), post('b', 3, 'MAKTAB12-A'),
    post('b', 6, 'MAKTAB12-A', 16), // qayta urinish — hisoblanmaydi
    pre('c', 6, 'MAKTAB12-A'), // faqat oldin
    pre('d', 3, null), post('d', 3, null),
    post('e', 6, '7B'), // faqat keyin
  ];
  const rows = prePostComparison(events);
  assert.deepEqual(rows.map((r) => r.group), ['7B', 'MAKTAB12-A', NO_GROUP, 'Hammasi']);
  const m12 = rows.find((r) => r.group === 'MAKTAB12-A');
  assert.deepEqual(m12, { group: 'MAKTAB12-A', n: 2, before: 25, after: 75, change: 50, preOnly: 1, postOnly: 0 });
  const b7 = rows.find((r) => r.group === '7B');
  assert.deepEqual(b7, { group: '7B', n: 0, before: null, after: null, change: null, preOnly: 0, postOnly: 1 });
  const all = rows.at(-1);
  assert.equal(all.n, 3);
  assert.equal(Math.round(all.before * 100) / 100, 33.33); // (50 + 0 + 50) / 3
  assert.equal(Math.round(all.after * 100) / 100, 66.67);  // (100 + 50 + 50) / 3
  assert.equal(all.preOnly, 1);
  assert.equal(all.postOnly, 1);
});

test('n < 5 — maʼlumot kam', () => {
  assert.equal(LOW_N, 5);
  assert.equal(isLowN(0), true);
  assert.equal(isLowN(4), true);
  assert.equal(isLowN(5), false);
  assert.equal(mean([]), null);
});

test('fikrlar: oʻrtacha reyting va yangilari birinchi', () => {
  const s = feedbackSummary([
    { rating: 5, created_at: at('2026-10-12') },
    { rating: 2, created_at: at('2026-10-14') },
  ]);
  assert.equal(s.n, 2);
  assert.equal(s.meanRating, 3.5);
  assert.equal(s.items[0].rating, 2);
  assert.deepEqual(feedbackSummary([]), { n: 0, meanRating: null, items: [] });
});

test('seminar kodlari roʻyxati: takrorsiz va tartibli', () => {
  assert.deepEqual(groupCodes([ev('a', 'page_view', { group_code: 'B' }), ev('b', 'page_view', { group_code: 'A' }), ev('c', 'page_view'), ev('d', 'page_view', { group_code: 'B' })]), ['A', 'B']);
});

test('CSV: vergul, qoʻshtirnoq va yangi qator ekranlanadi', () => {
  assert.equal(escapeCell('oddiy'), 'oddiy');
  assert.equal(escapeCell('a, b'), '"a, b"');
  assert.equal(escapeCell('u "zoʻr" dedi'), '"u ""zoʻr"" dedi"');
  assert.equal(escapeCell('1-qator\n2-qator'), '"1-qator\n2-qator"');
  assert.equal(escapeCell(null), '');
  assert.equal(escapeCell(undefined), '');
  assert.equal(escapeCell(5), '5');
  assert.equal(escapeCell({ page: 'a,b' }), '"{""page"":""a,b""}"');
});

test('CSV injection: =, +, -, @ bilan boshlangan qiymat oldiga \' qoʻyiladi', () => {
  assert.equal(escapeCell('=HYPERLINK("http://x","bos")'), '"\'=HYPERLINK(""http://x"",""bos"")"');
  assert.equal(escapeCell('+998901234567'), "'+998901234567");
  assert.equal(escapeCell('-2+3'), "'-2+3");
  assert.equal(escapeCell('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(escapeCell('\t=1'), "'\t=1");
  assert.equal(escapeCell('a=b'), 'a=b', 'oʻrtadagi = xavfsiz');
});

test('CSV: toʻliq fayl va sana bilan fayl nomi', () => {
  const csv = toCsv([{ id: 1, comment: 'Zoʻr, rahmat' }, { id: 2, comment: null }], ['id', 'comment']);
  assert.equal(csv, 'id,comment\r\n1,"Zoʻr, rahmat"\r\n2,\r\n');
  assert.equal(csvFilename('events', new Date(2026, 9, 4)), 'tortinchi-olchov-events-2026-10-04.csv');
});
