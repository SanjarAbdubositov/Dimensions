// math4d.js uchun testlar. Ishga tushirish: npm test (yoki node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeVertices, makeEdges, listPlanes, identity, planeRotation, multiply,
  applyMatrix, norm, perspectiveStep, projectPerspective, projectOrthographic,
} from '../js/math4d.js';

const EPS = 1e-9;

// Ikki matritsa deyarli tengmi (kasr sonlardagi kichik xatolarni hisobga olmaymiz)
function assertMatrixClose(a, b) {
  a.forEach((row, r) => row.forEach((x, c) => {
    assert.ok(Math.abs(x - b[r][c]) < EPS, `[${r}][${c}]: ${x} ≠ ${b[r][c]}`);
  }));
}

// Transponirlash: qatorlar ustunlarga aylanadi
function transpose(m) {
  return m[0].map((_, c) => m.map((row) => row[c]));
}

// Determinant (Gauss usuli bilan)
function determinant(m) {
  const a = m.map((row) => row.slice());
  let det = 1;
  for (let c = 0; c < a.length; c++) {
    let pivot = c;
    for (let r = c + 1; r < a.length; r++) if (Math.abs(a[r][c]) > Math.abs(a[pivot][c])) pivot = r;
    if (Math.abs(a[pivot][c]) < EPS) return 0;
    if (pivot !== c) { [a[pivot], a[c]] = [a[c], a[pivot]]; det = -det; }
    det *= a[c][c];
    for (let r = c + 1; r < a.length; r++) {
      const f = a[r][c] / a[c][c];
      for (let k = c; k < a.length; k++) a[r][k] -= f * a[c][k];
    }
  }
  return det;
}

test('uchlar soni 2ⁿ, qirralar soni n·2ⁿ⁻¹ (0D–7D)', () => {
  for (let n = 0; n <= 7; n++) {
    const v = makeVertices(n);
    assert.equal(v.length, 2 ** n, `${n}D uchlar`);
    assert.equal(makeEdges(v).length, n === 0 ? 0 : n * 2 ** (n - 1), `${n}D qirralar`);
  }
});

test('tesserakt: 16 uch, 32 qirra, har bir uch ±1 dan iborat', () => {
  const v = makeVertices(4);
  assert.equal(v.length, 16);
  assert.equal(makeEdges(v).length, 32);
  for (const p of v) assert.ok(p.every((x) => x === 1 || x === -1));
  assert.equal(new Set(v.map(String)).size, 16, 'uchlar takrorlanmasligi kerak');
});

test('har bir qirra uzunligi 2 (faqat bitta koordinata farq qiladi)', () => {
  const v = makeVertices(5);
  for (const [a, b] of makeEdges(v)) {
    assert.equal(norm(v[a].map((x, i) => x - v[b][i])), 2);
  }
});

test('4D da 6 ta aylanish tekisligi bor: XY, XZ, XW, YZ, YW, ZW', () => {
  const axes = 'XYZW';
  assert.deepEqual(listPlanes(4).map(([i, j]) => axes[i] + axes[j]), ['XY', 'XZ', 'XW', 'YZ', 'YW', 'ZW']);
});

test('aylanish matritsasi ortogonal (R·Rᵀ = I) va det = 1', () => {
  for (const n of [2, 3, 4, 7]) {
    for (const [i, j] of listPlanes(n)) {
      for (const theta of [0, 0.3, -1.2, Math.PI]) {
        const r = planeRotation(n, i, j, theta);
        assertMatrixClose(multiply(r, transpose(r)), identity(n));
        assert.ok(Math.abs(determinant(r) - 1) < EPS);
      }
    }
  }
});

test('aylanish uzunlikni saqlaydi', () => {
  const p = [[0.3, -1.7, 2.2, 0.9]];
  const r = multiply(planeRotation(4, 0, 3, 0.8), planeRotation(4, 1, 2, -2.1));
  assert.ok(Math.abs(norm(applyMatrix(r, p)[0]) - norm(p[0])) < EPS);
});

test('XY va ZW kommutativ (umumiy oʻqi yoʻq)', () => {
  const xy = planeRotation(4, 0, 1, 0.7);
  const zw = planeRotation(4, 2, 3, 0.4);
  assertMatrixClose(multiply(xy, zw), multiply(zw, xy));
});

test('XY va XW kommutativ emas (umumiy X oʻqi bor)', () => {
  const xy = planeRotation(4, 0, 1, 0.7);
  const xw = planeRotation(4, 0, 3, 0.4);
  const a = multiply(xy, xw);
  const b = multiply(xw, xy);
  const maxDiff = Math.max(...a.flatMap((row, r) => row.map((x, c) => Math.abs(x - b[r][c]))));
  assert.ok(maxDiff > 0.01, 'tartib oʻzgarsa natija ham oʻzgarishi kerak');
});

test('notoʻgʻri tekislik berilsa xato', () => {
  assert.throws(() => planeRotation(4, 1, 1, 0.5), RangeError);
  assert.throws(() => planeRotation(3, 0, 3, 0.5), RangeError);
});

test('w = 0 boʻlgan nuqtalar 4D → 3D proyeksiyada oʻzgarmaydi', () => {
  const pts = [[1, -1, 1, 0], [0.5, 2, -3, 0]];
  assert.deepEqual(perspectiveStep(pts, 3), [[1, -1, 1], [0.5, 2, -3]]);
  assert.deepEqual(projectPerspective([[1, 2, 0], [-1, 0.5, 0]], 2), [[1, 2], [-1, 0.5]]);
});

test('perspektiv: yaqin nuqta (w > 0) kattalashadi, uzoq nuqta (w < 0) kichrayadi', () => {
  const [near, far] = perspectiveStep([[1, 1, 1, 1], [1, 1, 1, -1]], 3);
  assert.ok(near[0] > 1 && far[0] < 1);
  assert.ok(Math.abs(near[0] - 1.5) < EPS); // 3 / (3 − 1) = 1.5
});

test('perspektiv: 2D–7D giperkub doim 2D ga tushadi, sonlar chekli', () => {
  for (let n = 2; n <= 7; n++) {
    const out = projectPerspective(makeVertices(n), 2.5);
    assert.ok(out.every((p) => p.length === 2 && p.every(Number.isFinite)), `${n}D`);
  }
});

test('notoʻgʻri kamera masofasida xato', () => {
  const pts = makeVertices(4);
  for (const bad of [1, 0.5, 0, -2, NaN, Infinity]) {
    assert.throws(() => projectPerspective(pts, bad), RangeError, `distance = ${bad}`);
  }
  assert.throws(() => perspectiveStep([[0, 0, 0, 2]], 2), RangeError); // d − w = 0
});

test('ortogonal proyeksiya oxirgi koordinatalarni tashlaydi', () => {
  assert.deepEqual(projectOrthographic([[1, 2, 3, 4, 5], [-1, -2, 7]]), [[1, 2], [-1, -2]]);
});

test('simulyator burchaklari: −180..180 oraligʻi va boshlangʻich koʻrinish', async () => {
  const { wrap, defaultAngles, autoPlanes } = await import('../js/sim-angles.js');
  assert.equal(wrap(190), -170);
  assert.equal(wrap(-190), 170);
  assert.equal(wrap(540), -180);
  assert.equal(Object.keys(defaultAngles(4)).length, 6, '4D: 6 ta tekislik');
  assert.equal(defaultAngles(4)['0-3'], 20, 'XW biroz burilgan');
  assert.deepEqual(autoPlanes(4).map(([i, j]) => `${i}-${j}`), ['0-3', '1-2']);
});
