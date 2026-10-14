// modulepreload roʻyxati: har bir sahifa oʻz modullarining HAMMASINI oldindan aytadi.
// Aks holda brauzer importlarni pogʻonama-pogʻona topadi va sekin internetda har pogʻona ~0.4 s kutadi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { posix } from 'node:path';

const ROOT = new URL('..', import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');

// Faylning statik importlari (dinamik import() — masalan Supabase — hisobga olinmaydi)
function imports(file) {
  return [...read(file).matchAll(/^import\s[^;]*?from\s+'(\.[^']+)'/gms)].map((m) => posix.join(posix.dirname(file), m[1]));
}

// Kirish modullaridan boshlab butun grafik
export function moduleGraph(entries) {
  const seen = new Set();
  const visit = (f) => { if (seen.has(f)) return; seen.add(f); imports(f).forEach(visit); };
  entries.forEach(visit);
  return [...seen].sort();
}

// Sahifadagi kirish modullari: <script type="module" src> va ichki skriptdagi importlar
function entries(html) {
  const src = [...html.matchAll(/<script type="module" src="([^"]+)"/g)].map((m) => m[1]);
  const inline = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
    .flatMap((m) => [...m[1].matchAll(/from\s+'\.\/([^']+)'/g)].map((x) => x[1]));
  return [...src, ...inline];
}

const preloads = (html) => [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((m) => m[1]).sort();
// Qoida: modulepreload faqat asosiy kontenti JS bilan chiziladigan sahifalarda.
// Oddiy matnli sahifalarda u CSS bilan raqobatlashib, matnni kechiktiradi (sekin 3G oʻlchovi: 1.4 s → 1.6 s).
const JS_PAGES = ['simulator.html', 'lesson.html', 'test.html', 'admin.html'];
const STATIC_PAGES = ['index.html', 'glossary.html', 'about.html', 'privacy.html', '404.html'];

for (const page of JS_PAGES) {
  test(`${page}: modulepreload roʻyxati import grafigiga toʻliq mos`, () => {
    const html = read(page);
    assert.deepEqual(preloads(html), moduleGraph(entries(html)), 'HTML dagi <link rel="modulepreload"> roʻyxatini yangilang');
  });
}

for (const page of STATIC_PAGES) {
  test(`${page}: matnli sahifada modulepreload yoʻq`, () => {
    assert.deepEqual(preloads(read(page)), []);
  });
}

test('lesson.html: dars matni va testi modullardan oldin soʻraladi', () => {
  const html = read('lesson.html');
  assert.match(html, /link\.rel = 'preload'/);
  assert.match(html, /'content\/lessons\/' \+ id \+ '\.md'/);
  assert.match(html, /'content\/quizzes\/' \+ id \+ '\.json'/);
});
