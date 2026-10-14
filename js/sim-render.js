// sim-render.js — proyeksiya qilingan shaklni canvas'ga chizish.

// Rang shkalasi: t = −1 → koʻk (uzoq), t = +1 → qizil (yaqin), oʻrtasi binafsha
export function depthColor(t) {
  const u = (Math.max(-1, Math.min(1, t)) + 1) / 2;
  const hue = (220 + u * 140) % 360; // 220 koʻk → 290 binafsha → 360 qizil
  return `hsl(${hue.toFixed(0)}, 80%, 55%)`;
}

// Bir kadrni chizadi. projected — 2D nuqtalar, depth — har uch uchun −1..1 chuqurlik
export function drawFrame(ctx, { projected, depth, edges, scale, width, height }) {
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
  ctx.lineWidth = edges.length > 100 ? 1.5 : 2.5;
  for (const [a, b, d] of order) {
    ctx.strokeStyle = depthColor(d);
    ctx.beginPath();
    ctx.moveTo(sx(projected[a]), sy(projected[a]));
    ctx.lineTo(sx(projected[b]), sy(projected[b]));
    ctx.stroke();
  }

  // Uchlar kichik doiracha boʻlib chiziladi (koʻp boʻlsa — kichikroq)
  const r = projected.length > 32 ? 2 : 3.5;
  projected.forEach((p, k) => {
    ctx.fillStyle = depthColor(depth[k]);
    ctx.beginPath();
    ctx.arc(sx(p), sy(p), r, 0, Math.PI * 2);
    ctx.fill();
  });
}
