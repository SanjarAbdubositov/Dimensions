// progress.js — oʻquvchi progressini qurilmaning oʻzida (localStorage) saqlash.
// Hech narsa serverga yuborilmaydi. Tuzilma:
// { lessons: { "1": { started, completed, score, max, best } }, tests: { pre: {...}, post: {...} } }

const KEY = 'tortinchi-olchov.progress.v1';

// localStorage ishlamasa (maxfiy rejim, bloklangan) — xotiradagi oʻrinbosar
const memory = new Map();
const memoryStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
};

// Xavfsiz storage: localStorage mavjud va ishlasa — u, aks holda xotira
export function defaultStorage() {
  try {
    const s = globalThis.localStorage;
    s.setItem('__t', '1');
    s.removeItem('__t');
    return s;
  } catch {
    return memoryStorage;
  }
}

// Progressni oʻqish (buzilgan yoki yoʻq boʻlsa — boʻsh holat)
export function loadProgress(storage = defaultStorage()) {
  try {
    const data = JSON.parse(storage.getItem(KEY));
    if (data && typeof data === 'object') return { lessons: data.lessons ?? {}, tests: data.tests ?? {} };
  } catch { /* buzilgan JSON — boshidan boshlaymiz */ }
  return { lessons: {}, tests: {} };
}

// Progressni yozish (xato boʻlsa jim oʻtib ketadi — sayt ishlashda davom etadi)
function save(progress, storage) {
  try { storage.setItem(KEY, JSON.stringify(progress)); } catch { /* joy tugagan va h.k. */ }
  return progress;
}

// Dars ochildi: birinchi ochilgan vaqt saqlanadi
export function markStarted(id, storage = defaultStorage(), now = Date.now()) {
  const p = loadProgress(storage);
  const entry = p.lessons[id] ?? {};
  if (!entry.started) entry.started = now;
  p.lessons[id] = entry;
  return save(p, storage);
}

// Dars testi topshirildi: oxirgi va eng yaxshi natija saqlanadi
export function markCompleted(id, score, max, storage = defaultStorage(), now = Date.now()) {
  const p = loadProgress(storage);
  const entry = p.lessons[id] ?? { started: now };
  entry.completed = now;
  entry.score = score;
  entry.max = max;
  entry.best = Math.max(entry.best ?? 0, score);
  p.lessons[id] = entry;
  return save(p, storage);
}

// Oldin/keyin testi natijasi ("pre" yoki "post")
export function saveTestResult(type, score, max, storage = defaultStorage(), now = Date.now()) {
  const p = loadProgress(storage);
  p.tests[type] = { score, max, at: now };
  return save(p, storage);
}

// Dars holati: 'new' (ochilmagan), 'started' (boshlangan) yoki 'completed' (tugatilgan)
export function lessonStatus(progress, id) {
  const entry = progress.lessons[id];
  if (entry?.completed) return 'completed';
  if (entry?.started) return 'started';
  return 'new';
}
