// sim-angles.js — simulyator burchaklari uchun sof funksiyalar (DOM yoʻq, Node'da test qilinadi).
import { listPlanes } from './math4d.js';

// Burchakni −180..180 oraligʻiga qaytaradi
export const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;

// Boshlangʻich koʻrinish: kub kvadratga oʻxshab qolmasligi uchun biroz burilgan
export function defaultAngles(n) {
  const angles = Object.fromEntries(listPlanes(n).map(([i, j]) => [`${i}-${j}`, 0]));
  if (n >= 3) Object.assign(angles, { '0-2': 30, '1-2': 20 });
  if (n >= 4) angles[`0-${n - 1}`] = 20;
  return angles;
}

// Avto-aylanishda qaysi tekisliklar buriladi: 3D burish + oxirgi oʻq bilan burish
export function autoPlanes(n) {
  if (n === 2) return [[0, 1, 1]];
  if (n === 3) return [[0, 2, 1], [1, 2, 0.6]];
  return [[0, n - 1, 1], [1, 2, 0.6]]; // masalan 4D: XW va YZ
}
