// Admin panel: xavfsizlik qoidalari (statik tekshiruv), sana filtri va grafik geometriyasi
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dateBounds } from '../js/admin-data.js';
import { chartGeometry, niceScale } from '../js/chart.js';

const ROOT = new URL('..', import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');
// Izohlarni olib tashlaymiz: "innerHTML ishlatilmaydi" degan izoh testni chalgʻitmasin
const code = (path) => read(path).replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

test('admin.html: noindex, qatʼiy CSP va parol formasi URLga tushmaydi', () => {
  const html = read('admin.html');
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  const csp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1] ?? '';
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /connect-src https:\/\/\*\.supabase\.co(;|$)/);
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/, 'inline skript yoʻq (CSP buni bloklardi)');
  assert.match(html, /<form id="login-form" method="post">/, 'JS ishlamasa ham parol URLda koʻrinmasin');
});

test('ochiq sahifalarda admin.html ga havola yoʻq', () => {
  const pages = readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== 'admin.html');
  assert.ok(pages.length >= 7);
  for (const page of pages) assert.doesNotMatch(read(page), /admin\.html/, page);
});

test('el() yordamchisida HTML qoʻyish imkoniyati yoʻq', () => {
  assert.doesNotMatch(code('js/dom.js'), /innerHTML/);
});

test('admin kodida innerHTML yoʻq (izohlar faqat textContent bilan chiqadi)', () => {
  for (const file of ['js/admin.js', 'js/admin-view.js', 'js/admin-data.js', 'js/admin-seminar.js', 'js/seminar.js', 'js/chart.js', 'js/stats.js', 'js/csv.js']) {
    const src = code(file);
    assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/, file);
    assert.doesNotMatch(src, /\bhtml\s*:/, `${file}: el(..., { html }) ishlatilmasin`);
  }
});

test('admin panel faqat oʻqiydi: insert / update / delete / upsert yoʻq', () => {
  for (const file of ['js/admin.js', 'js/admin-view.js', 'js/admin-data.js']) {
    assert.doesNotMatch(code(file), /\.(insert|update|delete|upsert)\s*\(/, file);
  }
});

test('sana filtri: "gacha" kuni ham kiradi (keyingi kun boshigacha)', () => {
  const { fromIso, toIso } = dateBounds('2026-10-01', '2026-10-14');
  assert.equal(fromIso, new Date(2026, 9, 1).toISOString());
  assert.equal(toIso, new Date(2026, 9, 15).toISOString());
  assert.deepEqual(dateBounds('', ''), { fromIso: null, toIso: null });
  assert.equal(dateBounds('2026-12-31', '2026-12-31').toIso, new Date(2027, 0, 1).toISOString(), 'yil oxiri');
});

test('grafik: oʻq qadamlari 1/2/5 × 10ⁿ, koʻpi bilan 4 ta', () => {
  assert.deepEqual(niceScale(0), { top: 1, step: 1 });
  assert.deepEqual(niceScale(3), { top: 3, step: 1 });
  assert.deepEqual(niceScale(7), { top: 8, step: 2 });
  assert.deepEqual(niceScale(37), { top: 40, step: 10 });
  assert.deepEqual(niceScale(1234), { top: 1500, step: 500 });
});

test('grafik: ustunlar ≤ 24 px, oraligʻi bor, balandlik qiymatga mos', () => {
  const days = [{ day: '2026-10-12', devices: 4 }, { day: '2026-10-13', devices: 0 }, { day: '2026-10-14', devices: 8 }];
  const g = chartGeometry(days, 400, 220);
  assert.equal(g.bars.length, 3);
  for (const b of g.bars) assert.ok(b.w <= 24 && b.w >= 1);
  assert.equal(g.bars[1].h, 0);
  assert.ok(Math.abs(g.bars[2].h - 2 * g.bars[0].h) < 1e-9, '8 qurilma ustuni 4 qurilmanikidan 2 baravar baland');
  assert.ok(g.bars[0].x + g.bars[0].w < g.bars[1].x, 'qoʻshni ustunlar orasida boʻshliq');
  // 90 kunlik grafikda ham ustunlar ekrandan chiqib ketmaydi
  const many = chartGeometry(Array.from({ length: 90 }, (_, i) => ({ day: `d${i}`, devices: i })), 320, 220);
  assert.ok(many.bars.at(-1).x + many.bars.at(-1).w <= 320);
});
