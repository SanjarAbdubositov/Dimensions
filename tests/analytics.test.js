// analytics-core.js (sof funksiyalar) va Supabase sxemasi uchun testlar. Internet kerak emas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  EVENT_TYPES, isValidGroupCode, parseGroupCode, shouldShowBanner, canSend, normalizeConsent,
  buildEvent, buildFeedback, isForbiddenKey, isConfigured, looksPersonal,
} from '../js/analytics-core.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const CTX = {
  anonId: '3f2b8c1e-1d2a-4c5b-9e8f-0a1b2c3d4e5f',
  sessionId: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
  groupCode: 'MAKTAB12-A',
};
// Soxta JWT: faqat "role" maydoni muhim
const jwt = (role) => ['e30', Buffer.from(JSON.stringify({ role })).toString('base64url'), 'sig'].join('.');

test('seminar kodi: faqat [A-Za-z0-9-], 1–32 belgi', () => {
  for (const ok of ['MAKTAB12-A', 'a', 'X'.repeat(32), '7-SINF-2026']) assert.ok(isValidGroupCode(ok), ok);
  for (const bad of ['', 'X'.repeat(33), 'Ali Valiyev', 'maktab_12', 'oʻquvchi', '+998901234567 ', '<script>', null, 12]) {
    assert.equal(isValidGroupCode(bad), false, String(bad));
  }
});

test('seminar kodi URL dan olinadi va katta harfga oʻtkaziladi', () => {
  assert.equal(parseGroupCode('?g=maktab12-a'), 'MAKTAB12-A');
  assert.equal(parseGroupCode('?id=2&g=7B'), '7B');
  assert.equal(parseGroupCode('?g=Ali%20Valiyev'), null);
  assert.equal(parseGroupCode('?g='), null);
  assert.equal(parseGroupCode('?id=1'), null);
});

test('rozilik: banner faqat sozlangan va hali javob berilmagan boʻlsa', () => {
  assert.equal(shouldShowBanner({ configured: true, consent: null }), true);
  assert.equal(shouldShowBanner({ configured: true, consent: 'granted' }), false);
  assert.equal(shouldShowBanner({ configured: true, consent: 'denied' }), false);
  assert.equal(shouldShowBanner({ configured: false, consent: null }), false);
  assert.equal(shouldShowBanner({ configured: true, consent: 'nimadir' }), true, 'nomaʼlum qiymat = soʻralmagan');
  assert.equal(normalizeConsent('xyz'), null);
});

test('rozilik: faqat "granted" + sozlangan + chiqarilmagan boʻlsa yuboriladi', () => {
  assert.equal(canSend({ configured: true, consent: 'granted', excluded: false }), true);
  assert.equal(canSend({ configured: true, consent: 'denied', excluded: false }), false);
  assert.equal(canSend({ configured: true, consent: null, excluded: false }), false);
  assert.equal(canSend({ configured: true, consent: 'granted', excluded: true }), false, 'admin qurilmasi');
  assert.equal(canSend({ configured: false, consent: 'granted', excluded: false }), false, 'config.js boʻsh');
});

test('buildEvent: toʻgʻri quiz_submit qatori', () => {
  assert.deepEqual(buildEvent('quiz_submit', { lessonId: 3, score: 4, maxScore: 5, meta: { a: 1 } }, CTX), {
    anon_id: CTX.anonId, session_id: CTX.sessionId, event_type: 'quiz_submit',
    lesson_id: 3, score: 4, max_score: 5, group_code: 'MAKTAB12-A', meta: { a: 1 },
  });
});

test('buildEvent: notoʻgʻri maʼlumot yuborilmaydi yoki tozalanadi', () => {
  assert.equal(buildEvent('hack', {}, CTX), null, 'nomaʼlum hodisa');
  assert.equal(buildEvent('page_view', {}, { ...CTX, anonId: 'abc' }), null, 'ID UUID emas');
  assert.equal(buildEvent('quiz_submit', { lessonId: 1, score: 6, maxScore: 5 }, CTX), null, 'ball > maks');
  assert.equal(buildEvent('quiz_submit', { lessonId: 1, score: 1, maxScore: 51 }, CTX), null, 'maks > 50');
  assert.equal(buildEvent('lesson_start', { lessonId: 7 }, CTX), null, 'dars 1–6 dan tashqarida');
  const pv = buildEvent('page_view', { lessonId: '2', score: 3, meta: { big: 'x'.repeat(2000) } }, { ...CTX, groupCode: 'yomon kod' });
  assert.equal(pv.lesson_id, 2, 'satr "2" ham qabul qilinadi');
  assert.equal(pv.score, null, 'maksimumsiz ball tashlanadi');
  assert.deepEqual(pv.meta, {}, 'katta meta tashlanadi');
  assert.equal(pv.group_code, null);
  assert.deepEqual(buildEvent('page_view', { meta: [1, 2] }, CTX).meta, {}, 'meta faqat obyekt');
});

test('buildEvent: barcha 8 hodisa turi toʻgʻri maʼlumot bilan quriladi', () => {
  const data = { lessonId: 1, score: 2, maxScore: 6 };
  for (const type of EVENT_TYPES) assert.ok(buildEvent(type, data, CTX), type);
});

test('buildFeedback: reyting 1–5, izoh ≤ 500, boʻsh izoh = null', () => {
  assert.deepEqual(buildFeedback({ lessonId: 2, rating: 5, comment: '  Zoʻr!  ' }, CTX), {
    anon_id: CTX.anonId, lesson_id: 2, rating: 5, comment: 'Zoʻr!', group_code: 'MAKTAB12-A',
  });
  assert.equal(buildFeedback({ rating: 4, comment: '   ' }, CTX).comment, null);
  assert.equal(buildFeedback({ rating: 0 }, CTX), null);
  assert.equal(buildFeedback({ rating: 6 }, CTX), null);
  assert.equal(buildFeedback({ rating: 3, comment: 'a'.repeat(501) }, CTX), null);
  assert.ok(buildFeedback({ rating: 3, comment: 'a'.repeat(500) }, CTX));
});

test('izohdagi telefon raqami va email aniqlanadi', () => {
  for (const bad of ['tel: +998 90 123 45 67', '901234567 ga yozing', 'ali@mail.uz']) assert.ok(looksPersonal(bad), bad);
  for (const ok of ['5 ta dars yoqdi', 'tesseraktda 16 uch, 32 qirra', '2026-yil zoʻr', '']) assert.equal(looksPersonal(ok), false, ok);
});

test('secret / service_role kalit taniladi va ishlatilmaydi', () => {
  assert.equal(isForbiddenKey('sb_secret_abc123'), true);
  assert.equal(isForbiddenKey(jwt('service_role')), true);
  assert.equal(isForbiddenKey(jwt('anon')), false);
  assert.equal(isForbiddenKey('sb_publishable_abc123'), false);
  assert.equal(isConfigured('https://x.supabase.co', 'sb_publishable_abc'), true);
  assert.equal(isConfigured('https://x.supabase.co', 'sb_secret_abc'), false);
  assert.equal(isConfigured('', ''), false);
  assert.equal(isConfigured('http://x.supabase.co', 'sb_publishable_abc'), false, 'faqat https');
});

test('config.js da secret kalit yoʻq', () => {
  const config = read('js/config.js');
  const key = /SUPABASE_ANON_KEY\s*=\s*'([^']*)'/.exec(config)[1];
  assert.equal(isForbiddenKey(key), false);
  assert.ok(!/sb_secret_/.test(config.replace(/^\s*\/\/.*$/gm, '')), 'sb_secret_ kalit kodda boʻlmasin');
});

test('Supabase kutubxonasi aniq versiya bilan yuklanadi', () => {
  assert.match(read('js/analytics.js'), /@supabase\/supabase-js@\d+\.\d+\.\d+\/\+esm/);
});

test('schema.sql: hodisa turlari JS roʻyxati bilan bir xil', () => {
  const sql = read('supabase/schema.sql');
  const list = /event_type in \(([\s\S]*?)\)\)/.exec(sql)[1];
  assert.deepEqual([...list.matchAll(/'(\w+)'/g)].map((m) => m[1]), EVENT_TYPES);
});

test('schema.sql: RLS yoqilgan, UPDATE/DELETE va anon SELECT berilmagan', () => {
  const sql = read('supabase/schema.sql').replace(/--.*$/gm, '').toLowerCase();
  for (const table of ['events', 'feedback', 'admins']) {
    assert.match(sql, new RegExp(`alter table public\\.${table}\\s+enable row level security`), table);
  }
  assert.doesNotMatch(sql, /grant[^;]*\b(update|delete|all)\b[^;]*\bto\b/, 'UPDATE/DELETE/ALL hech kimga berilmasin');
  assert.doesNotMatch(sql, /grant select[^;]*to[^;]*\banon\b/, 'anon oʻqiy olmasin');
  assert.doesNotMatch(sql, /grant[^;]*public\.admins[^;]*to/, 'admins jadvaliga GRANT yoʻq');
  assert.doesNotMatch(sql, /for (update|delete|all)\b/, 'UPDATE/DELETE siyosati yoʻq');
  assert.match(sql, /security definer\s+set search_path = ''/, 'is_admin: search_path qatʼiy');
});
