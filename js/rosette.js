// rosette.js — rozetka-emblema: n oʻlchamli kubning Petrie tekisligidagi soyasi (SVG).
// Qoʻlda chizilmaydi: uchlar va qirralar math4d.js'dan, proyeksiya projectPetrie() bilan.
import { makeVertices, makeEdges, projectPetrie, maxNorm } from './math4d.js';

const SVG = 'http://www.w3.org/2000/svg';
const NAMES = { 2: 'Kvadrat', 3: 'Kub', 4: 'Tesserakt', 5: 'Penterakt', 6: 'Hekserakt', 7: 'Hepterakt' };

// Emblema tavsifi: nimaning soyasi va qaysi tekislikka
export function rosetteLabel(n) {
  return `${NAMES[n] ?? `${n}-kub`} (${n} oʻlchamli kub) soyasi: Petrie (Coxeter) tekisligiga proyeksiya, tashqi chegarasi ${2 * n} burchakli.`;
}

// Qirralarni bitta SVG yoʻliga aylantiradi (koordinatalar −1..1 oraligʻida)
export function rosettePath(n) {
  const vertices = makeVertices(n);
  const points = projectPetrie(vertices);
  const r = maxNorm(points) || 1;
  // Bitta uch tepaga qarasin: emblema "turgan" koʻrinadi
  const turn = Math.PI / 2 - Math.atan2(points[points.length - 1][1], points[points.length - 1][0]);
  const xy = points.map(([x, y]) => [
    (x * Math.cos(turn) - y * Math.sin(turn)) / r,
    -(x * Math.sin(turn) + y * Math.cos(turn)) / r,
  ]);
  const f = (v) => v.toFixed(3);
  return makeEdges(vertices).map(([a, b]) => `M${f(xy[a][0])} ${f(xy[a][1])}L${f(xy[b][0])} ${f(xy[b][1])}`).join('');
}

// SVG element: size — piksel, label — boʻlsa role="img", boʻlmasa bezak (title faqat sichqoncha uchun)
export function createRosette(n, size, { label = false } = {}) {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '-1.08 -1.08 2.16 2.16');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('class', 'emblem');
  const title = document.createElementNS(SVG, 'title');
  title.textContent = rosetteLabel(n);
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', rosettePath(n));
  // Qirralar koʻp boʻlsa — ingichkaroq (piksel), aks holda kichik emblema qora dogʻga aylanadi
  const px = { 2: 2, 3: 1.8, 4: 1.3, 5: 0.9, 6: 0.55, 7: 0.35 }[n] ?? 0.35;
  path.setAttribute('stroke-width', String(Math.max(px, (px * size) / 96) * (2.16 / size)));
  svg.append(title, path);
  if (label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', rosetteLabel(n)); }
  else svg.setAttribute('aria-hidden', 'true');
  return svg;
}
