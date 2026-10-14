// math4d.js — n oʻlchamli giperkub matematikasi.
// Bu faylda DOM yoʻq: u brauzerda ham, Node'da (testlarda) ham bir xil ishlaydi.

// n oʻlchamli giperkub uchlari: 2ⁿ ta nuqta, har bir koordinata −1 yoki +1
export function makeVertices(n) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n manfiy boʻlmagan butun son boʻlishi kerak');
  const vertices = [];
  for (let k = 0; k < 2 ** n; k++) {
    // k sonining i-biti 1 boʻlsa, i-koordinata +1, aks holda −1
    const v = [];
    for (let i = 0; i < n; i++) v.push((k >> i) & 1 ? 1 : -1);
    vertices.push(v);
  }
  return vertices;
}

// Qirralar: faqat bitta koordinatada farq qiluvchi uchlar juftligi (n·2ⁿ⁻¹ ta)
export function makeEdges(vertices) {
  const edges = [];
  for (let a = 0; a < vertices.length; a++) {
    for (let b = a + 1; b < vertices.length; b++) {
      let diff = 0;
      for (let i = 0; i < vertices[a].length; i++) {
        if (vertices[a][i] !== vertices[b][i]) diff++;
      }
      if (diff === 1) edges.push([a, b]);
    }
  }
  return edges;
}

// Barcha aylanish tekisliklari: (i, j) juftliklari, i < j. 4D uchun 6 ta: C(4,2)
export function listPlanes(n) {
  const planes = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) planes.push([i, j]);
  }
  return planes;
}

// n×n birlik matritsa
export function identity(n) {
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r === c ? 1 : 0)));
}

// i–j tekisligida theta radianga burish matritsasi (qolgan oʻqlar joyida qoladi)
export function planeRotation(n, i, j, theta) {
  if (i === j || i < 0 || j < 0 || i >= n || j >= n) {
    throw new RangeError('i va j 0..n−1 oraligʻidagi turli sonlar boʻlishi kerak');
  }
  const m = identity(n);
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  m[i][i] = c;
  m[i][j] = -s;
  m[j][i] = s;
  m[j][j] = c;
  return m;
}

// Ikki matritsa koʻpaytmasi: A·B
export function multiply(a, b) {
  return a.map((row) => b[0].map((_, c) => row.reduce((sum, x, k) => sum + x * b[k][c], 0)));
}

// Matritsani har bir nuqtaga qoʻllash: p' = M·p
export function applyMatrix(m, points) {
  return points.map((p) => m.map((row) => row.reduce((sum, x, k) => sum + x * p[k], 0)));
}

// Bir nechta tekislik burishini ketma-ket birlashtiradi: rotations = [[i, j, theta], ...]
export function composeRotations(n, rotations) {
  let m = identity(n);
  for (const [i, j, theta] of rotations) m = multiply(planeRotation(n, i, j, theta), m);
  return m;
}

// Vektor uzunligi: √(x² + y² + ...)
export function norm(p) {
  return Math.sqrt(p.reduce((sum, x) => sum + x * x, 0));
}

// Nuqtalar ichidagi eng katta uzunlik (shakl "radiusi")
export function maxNorm(points) {
  return points.reduce((best, p) => Math.max(best, norm(p)), 0);
}

// Bitta qadam: kamera oxirgi oʻqda d masofada turadi, p' = p · d / (d − w)
export function perspectiveStep(points, d) {
  return points.map((p) => {
    const w = p[p.length - 1];
    if (!(d - w > 0)) throw new RangeError('Kamera shakl ichida qoldi: d barcha w qiymatlaridan katta boʻlishi kerak');
    const k = d / (d - w);
    return p.slice(0, -1).map((x) => x * k);
  });
}

// n → 2 perspektiv proyeksiya: oxirgi oʻqni ketma-ket "bosib" tushiradi.
// distance — shakl radiusiga nisbatan kamera masofasi (2 = eng uzoq uchdan 2 baravar uzoq).
// Radius har qadamda qayta oʻlchanadi, chunki proyeksiyadan keyin shakl kattalashadi.
export function projectPerspective(points, distance) {
  if (!Number.isFinite(distance) || distance <= 1) {
    throw new RangeError('distance 1 dan katta boʻlishi kerak (aks holda kamera shakl ichida)');
  }
  let current = points;
  while (current.length > 0 && current[0].length > 2) {
    const radius = maxNorm(current) || 1;
    current = perspectiveStep(current, distance * radius);
  }
  return current;
}

// Ortogonal proyeksiya: faqat birinchi ikki koordinata qoladi, qolganlari tashlanadi
export function projectOrthographic(points) {
  return points.map((p) => p.slice(0, 2));
}
