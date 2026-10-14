// Dizayn uchun sof funksiyalar: w chuqurlik uslubi, kirish animatsiyasi, rozetka
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { depthStyle, hexToRgb } from '../js/sim-render.js';
import { introStretch, introStage, INTRO_SECONDS, STAGES } from '../js/sim-intro.js';
import { rosettePath, rosetteLabel } from '../js/rosette.js';

const palette = ['#2f5fc4', '#0e7471', '#b07810'].map(hexToRgb);

test('hexToRgb: "#1d4e9e" → [29, 78, 158]', () => {
  assert.deepEqual(hexToRgb('#1d4e9e'), [29, 78, 158]);
});

test('depthStyle: uchlarida aynan palitra ranglari', () => {
  assert.deepEqual(depthStyle(-1, palette).rgb, palette[0]);
  assert.deepEqual(depthStyle(0, palette).rgb, palette[1]);
  assert.deepEqual(depthStyle(1, palette).rgb, palette[2]);
});

test('depthStyle: yaqinlashgan sari qirra qalinroq va toʻqroq (rang yagona belgi emas)', () => {
  let prev = depthStyle(-1, palette);
  for (let t = -0.9; t <= 1.0001; t += 0.1) {
    const s = depthStyle(t, palette);
    assert.ok(s.width > prev.width && s.alpha > prev.alpha, `t = ${t.toFixed(1)}`);
    prev = s;
  }
  assert.ok(depthStyle(1, palette).width >= 3 * depthStyle(-1, palette).width, 'farq koʻzga koʻrinarli boʻlsin');
});

test('kirish animatsiyasi: nuqtadan boshlanib, 3–4 s ichida toʻliq tesseraktga keladi', () => {
  assert.deepEqual(introStretch(0), [0, 0, 0, 0]);
  assert.deepEqual(introStretch(INTRO_SECONDS), [1, 1, 1, 1]);
  assert.ok(INTRO_SECONDS >= 3 && INTRO_SECONDS <= 4);
  assert.equal(introStage(0), STAGES[0]);
  assert.equal(introStage(INTRO_SECONDS), STAGES[4]);
});

test('kirish animatsiyasi: oʻqlar navbat bilan choʻziladi (avval x, keyin y, …)', () => {
  for (let t = 0; t <= INTRO_SECONDS; t += 0.05) {
    const s = introStretch(t);
    for (let k = 1; k < 4; k++) assert.ok(s[k] <= s[k - 1], `t = ${t.toFixed(2)}`);
  }
});

test('rozetka: qirralar soni n·2ⁿ⁻¹, koordinatalar −1..1 ichida, tavsifda tekislik nomi', () => {
  for (const n of [2, 3, 4, 5]) {
    const segments = rosettePath(n).match(/M/g).length;
    assert.equal(segments, n * 2 ** (n - 1));
    const nums = rosettePath(n).match(/-?\d+\.\d+/g).map(Number);
    assert.ok(nums.every((x) => Math.abs(x) <= 1.0005));
    assert.match(rosetteLabel(n), /Petrie \(Coxeter\) tekisligiga/);
    assert.match(rosetteLabel(n), new RegExp(`${2 * n} burchakli`));
  }
});
