// analytics-core.js — statistikaning sof funksiyalari (DOM, tarmoq va localStorage yoʻq).
// Shuning uchun ular Node'da internetsiz test qilinadi. Brauzer qismi — analytics.js'da.
// Bu yerdagi tekshiruvlar supabase/schema.sql'dagi CHECK cheklovlarini takrorlaydi:
// notoʻgʻri qator umuman yuborilmaydi, server esa baribir oʻzi ham tekshiradi.

// Ruxsat etilgan hodisalar (schema.sql'dagi roʻyxat bilan bir xil — testda tekshiriladi)
export const EVENT_TYPES = [
  'page_view', 'lesson_start', 'lesson_complete', 'quiz_submit',
  'pretest_submit', 'posttest_submit', 'simulator_use', 'feedback_submit',
];

const GROUP_RE = /^[A-Za-z0-9-]{1,32}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const META_MAX_CHARS = 1000; // serverdagi chegara (2000 bayt) dan ancha kichik
export const COMMENT_MAX = 500;

// Seminar kodi toʻgʻrimi: faqat harf, raqam, chiziqcha, 1–32 belgi
export function isValidGroupCode(code) {
  return typeof code === 'string' && GROUP_RE.test(code);
}

// URL'dagi ?g= qiymatidan seminar kodini oladi. Katta harfga oʻtkaziladi,
// shunda "maktab12-a" va "MAKTAB12-A" bitta guruh boʻlib hisoblanadi. Notoʻgʻri boʻlsa — null.
export function parseGroupCode(search) {
  const raw = new URLSearchParams(search).get('g');
  if (raw === null) return null;
  const code = raw.trim().toUpperCase();
  return isValidGroupCode(code) ? code : null;
}

// UUID koʻrinishi toʻgʻrimi
export function isUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

// Rozilik holati: 'granted' (roziman), 'denied' (yoʻq) yoki null (hali soʻralmagan)
export function normalizeConsent(value) {
  return value === 'granted' || value === 'denied' ? value : null;
}

// Banner koʻrsatilsinmi: statistika sozlangan va foydalanuvchi hali javob bermagan boʻlsa
export function shouldShowBanner({ configured, consent }) {
  return Boolean(configured) && normalizeConsent(consent) === null;
}

// Yuborish mumkinmi: sozlangan + rozilik berilgan + bu qurilma chiqarilmagan
export function canSend({ configured, consent, excluded }) {
  return Boolean(configured) && normalizeConsent(consent) === 'granted' && !excluded;
}

// Frontend'ga hech qachon qoʻyilmasligi kerak boʻlgan kalit (secret / service_role)
export function isForbiddenKey(key) {
  if (typeof key !== 'string') return false;
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

// Statistika sozlanganmi: URL va kalit bor, kalit esa taqiqlangan turdagi emas
export function isConfigured(url, key) {
  return typeof url === 'string' && /^https:\/\//.test(url) && typeof key === 'string' && key.length > 0 && !isForbiddenKey(key);
}

// 1..6 oraligʻidagi dars raqami yoki null
function lessonOrNull(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 6 ? n : null;
}

// Kichik oddiy obyekt boʻlsa — oʻzi, aks holda {} (katta yoki notoʻgʻri meta yuborilmaydi)
function safeMeta(meta) {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return {};
  try {
    return JSON.stringify(meta).length <= META_MAX_CHARS ? meta : {};
  } catch {
    return {};
  }
}

// events jadvali uchun qator tuzadi. Notoʻgʻri boʻlsa — null (umuman yuborilmaydi).
// ctx = { anonId, sessionId, groupCode }, data = { lessonId, score, maxScore, meta }
export function buildEvent(eventType, data = {}, ctx = {}) {
  if (!EVENT_TYPES.includes(eventType)) return null;
  if (!isUuid(ctx.anonId) || !isUuid(ctx.sessionId)) return null;

  const lessonId = lessonOrNull(data.lessonId);
  let score = Number.isInteger(data.score) ? data.score : null;
  let maxScore = Number.isInteger(data.maxScore) ? data.maxScore : null;
  if (score === null || maxScore === null || maxScore < 1 || maxScore > 50 || score < 0 || score > maxScore) {
    score = null;
    maxScore = null;
  }

  // Serverdagi majburiy maydonlar: test hodisasida ball, dars hodisasida dars raqami
  if (['quiz_submit', 'pretest_submit', 'posttest_submit'].includes(eventType) && score === null) return null;
  if (['lesson_start', 'lesson_complete', 'quiz_submit'].includes(eventType) && lessonId === null) return null;

  return {
    anon_id: ctx.anonId,
    session_id: ctx.sessionId,
    event_type: eventType,
    lesson_id: lessonId,
    score,
    max_score: maxScore,
    group_code: isValidGroupCode(ctx.groupCode) ? ctx.groupCode : null,
    meta: safeMeta(data.meta),
  };
}

// feedback jadvali uchun qator tuzadi. Reyting 1–5 boʻlmasa — null.
export function buildFeedback({ lessonId, rating, comment } = {}, ctx = {}) {
  if (!isUuid(ctx.anonId)) return null;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  const text = typeof comment === 'string' ? comment.trim() : '';
  if (text.length > COMMENT_MAX) return null;
  return {
    anon_id: ctx.anonId,
    lesson_id: lessonOrNull(lessonId),
    rating,
    comment: text || null,
    group_code: isValidGroupCode(ctx.groupCode) ? ctx.groupCode : null,
  };
}

// Izohda shaxsiy maʼlumotga oʻxshash narsa bormi: telefon raqami (9+ raqam) yoki email.
// Foydalanuvchilar voyaga yetmaganlar — bunday izoh umuman yuborilmaydi.
export function looksPersonal(text) {
  if (typeof text !== 'string') return false;
  const digits = text.match(/\+?\d[\d\s().-]{7,}\d/g) ?? [];
  const hasPhone = digits.some((d) => d.replace(/\D/g, '').length >= 9);
  const hasEmail = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text);
  return hasPhone || hasEmail;
}
