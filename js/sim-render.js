// sim-render.js — proyeksiya qilingan shaklni canvas'ga chizish.
// Yashirin oʻq (w) ikki xil belgi bilan koʻrsatiladi: rang VA qalinlik/xiralik.
// Rangni ajrata olmaydigan odam ham qaysi qirra yaqinligini qalinlikdan biladi.

// "#1d4e9e" → [29, 78, 158]
export function hexToRgb(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  return m ? m.slice(1).map((h) => parseInt(h, 16)) : [128, 128, 128];
}

// Ranglarni CSS oʻzgaruvchilaridan oʻqiydi (yorugʻ/qorongʻi rejimga qarab har xil)
export function readPalette(element) {
  const css = getComputedStyle(element);
  return ['--w-far', '--w-mid', '--w-near'].map((name) => hexToRgb(css.getPropertyValue(name) || '#808080'));
}

// t = −1 (uzoq) … +1 (yaqin) → rang, chiziq qalinligi (asosiyga nisbatan) va shaffoflik
export function depthStyle(t, palette) {
  const u = (Math.max(-1, Math.min(1, t)) + 1) / 2;
  const [a, b, k] = u < 0.5 ? [palette[0], palette[1], u * 2] : [palette[1], palette[2], u * 2 - 1];
  const rgb = a.map((x, i) => Math.round(x + (b[i] - x) * k));
  return { rgb, width: 0.45 + 1.1 * u, alpha: 0.4 + 0.6 * u };
}

// Bir kadrni chizadi. projected — 2D nuqtalar, depth — har uch uchun −1..1 chuqurlik
export function drawFrame(ctx, { projected, depth, edges, scale, width, height, palette }) {
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  // Matematikada y yuqoriga oʻsadi, ekranda esa pastga — shuning uchun minus
  const sx = (p) => cx + p[0] * scale;
  const sy = (p) => cy - p[1] * scale;

  // Uzoq qirralar avval chiziladi, yaqinlari ularning ustida qoladi
  const order = edges
    .map(([a, b]) => [a, b, (depth[a] + depth[b]) / 2])
    .sort((e1, e2) => e1[2] - e2[2]);

  ctx.lineCap = 'round';
  const base = edges.length > 100 ? 1.6 : 2.6;
  for (const [a, b, d] of order) {
    const s = depthStyle(d, palette);
    ctx.strokeStyle = `rgb(${s.rgb.join(' ')} / ${s.alpha.toFixed(2)})`;
    ctx.lineWidth = base * s.width;
    ctx.beginPath();
    ctx.moveTo(sx(projected[a]), sy(projected[a]));
    ctx.lineTo(sx(projected[b]), sy(projected[b]));
    ctx.stroke();
  }

  // Uchlar kichik doiracha: yaqinlari kattaroq (koʻp boʻlsa — hammasi kichikroq)
  const r = projected.length > 32 ? 1.6 : 2.8;
  projected.forEach((p, k) => {
    const s = depthStyle(depth[k], palette);
    ctx.fillStyle = `rgb(${s.rgb.join(' ')} / ${s.alpha.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(sx(p), sy(p), r * (0.6 + 0.6 * s.width), 0, Math.PI * 2);
    ctx.fill();
  });
}
