// “Oxiridagi testni topshirish” tugmasi qachon chiqadi
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldShowSeminarBar, BAR_HOURS } from '../js/seminar-bar.js';

const now = Date.parse('2026-10-25T12:00:00Z');
const pre = { score: 2, max: 6, at: now - 3600 * 1000 };

test('seminar tugmasi: kod bor, boshidagi test topshirilgan, oxiridagisi yoʻq — chiqadi', () => {
  assert.equal(shouldShowSeminarBar({ group: 'SYNERGY-9-A', tests: { pre }, now }), true);
});

test('seminar tugmasi: kerak boʻlmaganda chiqmaydi', () => {
  assert.equal(shouldShowSeminarBar({ group: null, tests: { pre }, now }), false, 'seminar kodi yoʻq');
  assert.equal(shouldShowSeminarBar({ group: 'X', tests: {}, now }), false, 'boshidagi test yoʻq');
  assert.equal(shouldShowSeminarBar({ group: 'X', tests: { pre, post: pre }, now }), false, 'oxirgisi ham topshirilgan');
  assert.equal(shouldShowSeminarBar({ group: 'X', tests: { pre }, now, page: 'post' }), false, 'oxirgi test sahifasida');
  const old = { ...pre, at: now - (BAR_HOURS + 1) * 3600 * 1000 };
  assert.equal(shouldShowSeminarBar({ group: 'X', tests: { pre: old }, now }), false, 'seminar allaqachon oʻtib ketgan');
});
