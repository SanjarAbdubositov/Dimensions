// stats.js — admin panel uchun hisob-kitoblar. Sof funksiyalar: DOM ham, tarmoq ham yoʻq.
// Kirish: Supabase'dan kelgan qatorlar. events: { anon_id, event_type, lesson_id, score, max_score, group_code, created_at }
// Hammasi qurilmalar (anon_id) boʻyicha sanaladi — odamlar boʻyicha emas (bir odam = bir nechta qurilma boʻlishi mumkin).

export const LOW_N = 5; // bundan kam qurilma boʻlsa, xulosa chiqarish uchun maʼlumot yetarli emas
export const NO_GROUP = 'Guruhsiz';

// n kichikmi (ogohlantirish kerakmi)
export function isLowN(n) {
  return n < LOW_N;
}

// Oʻrtacha qiymat; boʻsh roʻyxat uchun null
export function mean(values) {
  return values.length ? values.reduce((s, x) => s + x, 0) / values.length : null;
}

// Ballni foizga aylantirish: 4/5 → 80
export function toPercent(score, max) {
  return max > 0 ? (score / max) * 100 : null;
}

// Mahalliy vaqt boʻyicha kun: "2026-10-14" (brauzer soat mintaqasida)
export function dayKey(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Noyob qurilmalar soni (turli anon_id lar)
export function uniqueDevices(events) {
  return new Set(events.map((e) => e.anon_id)).size;
}

// Kunlik grafik uchun: har kun nechta noyob qurilma. Oradagi boʻsh kunlar ham 0 bilan qoʻshiladi.
export function dailyDevices(events) {
  const byDay = new Map();
  for (const e of events) {
    if (Number.isNaN(Date.parse(e.created_at))) continue; // buzilgan sana — sikl cheksiz boʻlib qolmasin
    const day = dayKey(e.created_at);
    if (!byDay.has(day)) byDay.set(day, new Set());
    byDay.get(day).add(e.anon_id);
  }
  if (byDay.size === 0) return [];
  const days = [...byDay.keys()].sort();
  const out = [];
  // Birinchi kundan oxirgisigacha ketma-ket yuramiz (soat 12:00 — yozgi vaqt oʻtishida ham kun adashmasin)
  for (let d = new Date(`${days[0]}T12:00:00`); dayKey(d) <= days.at(-1); d.setDate(d.getDate() + 1)) {
    const key = dayKey(d);
    out.push({ day: key, devices: byDay.get(key)?.size ?? 0 });
  }
  return out;
}

// Dars voronkasi: har dars uchun boshlagan va tugatgan qurilmalar.
// Boshlaganlar = lesson_start YOKI lesson_complete yuborgan qurilmalar (rozilik dars oʻrtasida berilsa,
// lesson_start yuborilmay qolishi mumkin — lekin tugatgan odam albatta boshlagan). Shuning uchun foiz ≤ 100.
export function lessonFunnel(events, lessonIds = [1, 2, 3, 4, 5, 6]) {
  return lessonIds.map((lessonId) => {
    const started = new Set();
    const completed = new Set();
    for (const e of events) {
      if (e.lesson_id !== lessonId) continue;
      if (e.event_type === 'lesson_start' || e.event_type === 'lesson_complete') started.add(e.anon_id);
      if (e.event_type === 'lesson_complete') completed.add(e.anon_id);
    }
    const rate = started.size ? (completed.size / started.size) * 100 : null;
    return { lessonId, started: started.size, completed: completed.size, rate };
  });
}

// Har qurilmaning BIRINCHI hodisasi (vaqt boʻyicha). Qayta urinishlar natijani buzmasin.
function firstPerDevice(events) {
  const first = new Map();
  for (const e of [...events].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    if (!first.has(e.anon_id)) first.set(e.anon_id, e);
  }
  return first;
}

// Har dars testi boʻyicha oʻrtacha ball (foizda). Har qurilmaning faqat birinchi urinishi hisoblanadi.
export function quizAverages(events, lessonIds = [1, 2, 3, 4, 5, 6]) {
  return lessonIds.map((lessonId) => {
    const attempts = events.filter((e) => e.event_type === 'quiz_submit' && e.lesson_id === lessonId);
    const firsts = [...firstPerDevice(attempts).values()];
    const percents = firsts.map((e) => toPercent(e.score, e.max_score));
    return { lessonId, n: firsts.length, meanPercent: mean(percents) };
  });
}

// Oldin/keyin taqqoslash guruh boʻyicha.
// Faqat IKKALA testni ham topshirgan qurilmalar hisoblanadi; har biridan birinchi urinish olinadi.
// Qurilmaning guruhi — uning birinchi "oldin" testidagi seminar kodi.
// Natija: har guruh uchun qator va oxirida "Hammasi" qatori.
export function prePostComparison(events) {
  const pre = firstPerDevice(events.filter((e) => e.event_type === 'pretest_submit'));
  const post = firstPerDevice(events.filter((e) => e.event_type === 'posttest_submit'));

  const groups = new Map();
  const add = (name, field, value) => {
    if (!groups.has(name)) groups.set(name, { group: name, pairs: [], preOnly: 0, postOnly: 0 });
    const g = groups.get(name);
    if (field === 'pairs') g.pairs.push(value);
    else g[field]++;
  };
  for (const [id, p] of pre) {
    const group = p.group_code || NO_GROUP;
    if (post.has(id)) add(group, 'pairs', [p, post.get(id)]);
    else add(group, 'preOnly');
  }
  for (const [id, p] of post) if (!pre.has(id)) add(p.group_code || NO_GROUP, 'postOnly');

  // Bitta guruh (yoki "Hammasi") uchun yakuniy raqamlar
  const summarize = (group, pairs, preOnly, postOnly) => {
    const before = mean(pairs.map(([a]) => toPercent(a.score, a.max_score)));
    const after = mean(pairs.map(([, b]) => toPercent(b.score, b.max_score)));
    const change = before === null ? null : after - before;
    return { group, n: pairs.length, before, after, change, preOnly, postOnly };
  };
  const rows = [...groups.values()]
    .sort((a, b) => (a.group === NO_GROUP) - (b.group === NO_GROUP) || a.group.localeCompare(b.group))
    .map((g) => summarize(g.group, g.pairs, g.preOnly, g.postOnly));
  const all = [...groups.values()];
  rows.push(summarize('Hammasi', all.flatMap((g) => g.pairs),
    all.reduce((s, g) => s + g.preOnly, 0), all.reduce((s, g) => s + g.postOnly, 0)));
  return rows;
}

// Fikrlar: oʻrtacha reyting va yangilari birinchi boʻlib tartiblangan roʻyxat
export function feedbackSummary(feedback) {
  const items = [...feedback].sort((a, b) => b.created_at.localeCompare(a.created_at));
  return { n: items.length, meanRating: mean(items.map((f) => f.rating)), items };
}

// Hodisalardagi barcha seminar kodlari (filtr roʻyxati uchun), alifbo tartibida
export function groupCodes(events) {
  return [...new Set(events.map((e) => e.group_code).filter(Boolean))].sort();
}
