// Seminar kodlari, havolalar va QR-kod uchun testlar
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { codeFromName, seminarLinks, mergeSeminars, qrMatrix, qrPath } from '../js/seminar.js';
import { parseGroupCode } from '../js/analytics-core.js';

test('codeFromName: nomdan sayt qabul qiladigan kod yasaladi', () => {
  assert.equal(codeFromName('Synergy 9-A'), 'SYNERGY-9-A');
  assert.equal(codeFromName('  maktab 12  a '), 'MAKTAB-12-A');
  assert.equal(codeFromName('Oʻzbek tili / 2-guruh'), 'OZBEK-TILI-2-GURUH');
  assert.equal(codeFromName('???'), '');
  assert.equal(codeFromName(''), '');
  const long = codeFromName('a'.repeat(31) + ' bbbb');
  assert.ok(long.length <= 32 && !long.endsWith('-'), long);
});

test('yaratilgan kod saytdagi ?g= orqali aynan oʻzi boʻlib oʻqiladi', () => {
  for (const name of ['Synergy 9-A', 'Seminar 1', 'oʻqituvchilar']) {
    const code = codeFromName(name);
    assert.equal(parseGroupCode(`?g=${code}`), code);
  }
});

test('seminarLinks: bosh sahifa, boshidagi va oxiridagi test havolalari', () => {
  const links = seminarLinks('https://sanjarabdubositov.github.io/Dimensions/admin.html', 'SYNERGY-9-A');
  assert.deepEqual(links.map((l) => l.url), [
    'https://sanjarabdubositov.github.io/Dimensions/index.html?g=SYNERGY-9-A',
    'https://sanjarabdubositov.github.io/Dimensions/test.html?type=pre&g=SYNERGY-9-A',
    'https://sanjarabdubositov.github.io/Dimensions/test.html?type=post&g=SYNERGY-9-A',
  ]);
  for (const l of links) assert.equal(parseGroupCode(new URL(l.url).search), 'SYNERGY-9-A');
});

test('mergeSeminars: saqlanganlar + maʼlumotdagi kodlar, takrorsiz, yangilari tepada', () => {
  const saved = [
    { code: 'ESKI', name: 'Eski', created: '2026-10-01T10:00:00Z' },
    { code: 'YANGI', name: 'Yangi', created: '2026-10-20T10:00:00Z' },
    { code: 'bad code!', created: '2026-10-21T10:00:00Z' },
  ];
  const list = mergeSeminars(saved, ['ESKI', 'DATA-1']);
  assert.deepEqual(list.map((s) => [s.code, s.saved]), [['YANGI', true], ['ESKI', true], ['DATA-1', false]]);
});

test('QR-kod: kvadrat matritsa, burchaklarda uchta qidiruv belgisi', () => {
  const m = qrMatrix('https://sanjarabdubositov.github.io/Dimensions/test.html?type=pre&g=SYNERGY-9-A');
  const n = m.length;
  assert.ok(n >= 21 && (n - 17) % 4 === 0, `oʻlcham ${n}`);
  assert.ok(m.every((row) => row.length === n));
  // Qidiruv belgisi: 7×7 qora ramka, ichida oq halqa va 3×3 qora markaz
  const finder = (r0, c0) => [0, 6].every((k) => [0, 1, 2, 3, 4, 5, 6].every((i) => m[r0 + k][c0 + i] && m[r0 + i][c0 + k]))
    && !m[r0 + 1][c0 + 1] && m[r0 + 3][c0 + 3];
  assert.ok(finder(0, 0) && finder(0, n - 7) && finder(n - 7, 0));
  assert.equal(qrPath(m).match(/M/g).length, m.flat().filter(Boolean).length);
});
