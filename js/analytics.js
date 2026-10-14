// analytics.js — anonim statistika: rozilik, ID'lar va hodisalarni Supabase'ga yuborish.
// Har bir sahifa uni yuklaydi; import qilinganda oʻzi ishga tushadi (banner + page_view).
// Asosiy qoida: bu fayldagi hech narsa xato tashlamaydi va saytning ishiga xalaqit bermaydi.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import {
  buildEvent, buildFeedback, canSend, shouldShowBanner, normalizeConsent,
  parseGroupCode, isConfigured, isForbiddenKey, isUuid,
} from './analytics-core.js';
import { showConsentBanner } from './consent-ui.js';

// Aniq versiya (latest emas): kutilmagan yangilanish saytni buzmasligi uchun
const SUPABASE_ESM = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';

const KEYS = {
  consent: 'tortinchi-olchov.consent',   // localStorage: 'granted' | 'denied'
  anonId: 'tortinchi-olchov.anon-id',    // localStorage: qurilma ID'si (faqat rozilikdan keyin)
  group: 'tortinchi-olchov.group',       // localStorage: seminar kodi
  exclude: 'tortinchi-olchov.exclude',   // localStorage: '1' — admin qurilmasi, hech narsa yuborilmaydi
  sessionId: 'tortinchi-olchov.session-id', // sessionStorage: shu tashrif ID'si
  once: 'tortinchi-olchov.once.',        // sessionStorage: sessiyada bir marta yuboriladigan hodisalar
};

const configured = isConfigured(SUPABASE_URL, SUPABASE_ANON_KEY);
if (isForbiddenKey(SUPABASE_ANON_KEY)) {
  console.error('config.js: bu secret/service_role kalit! Uni darhol oʻchiring. Statistika oʻchirildi.');
}

// Xotiradan oʻqish (maxfiy rejimda localStorage ishlamasa ham xato bermaydi)
function read(store, key) {
  try { return globalThis[store].getItem(key); } catch { return null; }
}

// Xotiraga yozish; value = null boʻlsa — oʻchirish
function write(store, key, value) {
  try {
    if (value === null) globalThis[store].removeItem(key);
    else globalThis[store].setItem(key, value);
  } catch { /* jim oʻtamiz */ }
}

// Joriy holat: sozlanganmi, rozilik, qurilma chiqarilganmi, seminar kodi
export function getStatus() {
  return {
    configured,
    consent: normalizeConsent(read('localStorage', KEYS.consent)),
    excluded: read('localStorage', KEYS.exclude) === '1',
    groupCode: read('localStorage', KEYS.group),
  };
}

// Rozilikni saqlash. Rad etilsa, qurilma ID'si ham unutiladi
export function setConsent(value) {
  write('localStorage', KEYS.consent, normalizeConsent(value));
  if (value === 'denied') write('localStorage', KEYS.anonId, null);
}

// "Bu qurilmani statistikadan chiqar" (admin panel uchun)
export function setExcluded(flag) {
  write('localStorage', KEYS.exclude, flag ? '1' : null);
}

// ID'ni oʻqish yoki yangisini yaratish (crypto.randomUUID — tasodifiy, hech kimga bogʻliq emas)
function getOrCreateId(store, key) {
  let id = read(store, key);
  if (!isUuid(id)) {
    id = crypto.randomUUID();
    write(store, key, id);
  }
  return id;
}

// Hodisaga qoʻshiladigan kontekst: anon_id, session_id, seminar kodi
function context() {
  return {
    anonId: getOrCreateId('localStorage', KEYS.anonId),
    sessionId: getOrCreateId('sessionStorage', KEYS.sessionId),
    groupCode: read('localStorage', KEYS.group),
  };
}

let clientPromise = null;

// Supabase klientini faqat birinchi kerak boʻlganda yuklaymiz (rozilik bermaganlar uni umuman yuklamaydi)
function getClient() {
  clientPromise ??= import(SUPABASE_ESM).then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }));
  return clientPromise;
}

// Jadvalga bitta qator qoʻshish. Natija: true/false, hech qachon xato tashlamaydi
async function insert(table, row) {
  try {
    const client = await getClient();
    const { error } = await client.from(table).insert(row); // javob qaytarilmaydi: SELECT huquqi kerak emas
    return !error;
  } catch {
    clientPromise = null; // internet uzilgan boʻlsa, keyingi safar qayta urinamiz
    return false;
  }
}

// Hodisani yuborish. options.once — shu kalit bilan sessiyada faqat bir marta yuboriladi
export function track(eventType, data = {}, options = {}) {
  try {
    if (!canSend(getStatus())) return;
    if (options.once) {
      if (read('sessionStorage', KEYS.once + options.once)) return;
      write('sessionStorage', KEYS.once + options.once, '1');
    }
    const row = buildEvent(eventType, data, context());
    if (row) void insert('events', row);
  } catch { /* statistika hech qachon saytni buzmasin */ }
}

// Fikr yuborish. Natija: 'sent' | 'disabled' | 'no-consent' | 'excluded' | 'invalid' | 'error'
export async function sendFeedback(input) {
  try {
    const status = getStatus();
    if (!status.configured) return 'disabled';
    if (status.excluded) return 'excluded';
    if (!canSend(status)) return 'no-consent';
    const row = buildFeedback(input, context());
    if (!row) return 'invalid';
    if (!(await insert('feedback', row))) return 'error';
    track('feedback_submit', { lessonId: input.lessonId, meta: { rating: input.rating } });
    return 'sent';
  } catch {
    return 'error';
  }
}

// Joriy sahifa nomi (toʻliq URL yuborilmaydi)
function pageName() {
  return location.pathname.split('/').pop() || 'index.html';
}

// Page_view: dars sahifasida dars raqami ham qoʻshiladi
function trackPageView() {
  const page = pageName();
  const lessonId = page === 'lesson.html' ? new URLSearchParams(location.search).get('id') : null;
  track('page_view', { lessonId, meta: { page } });
}

// Banner yoki sozlamalar oynasini ochish
export function openConsentSettings(settingsMode = true) {
  showConsentBanner({
    status: getStatus(),
    settingsMode,
    onChoose: (value) => {
      const before = getStatus().consent;
      setConsent(value);
      if (value === 'granted' && before !== 'granted') trackPageView();
    },
  });
}

// Ishga tushirish: seminar kodi, banner, tinglovchilar va page_view
function init() {
  const code = parseGroupCode(location.search);
  if (code) write('localStorage', KEYS.group, code);

  // Simulyator "simulator:use" hodisasini chiqaradi (simulator.js) — sessiyada bir marta yuboramiz
  document.addEventListener('simulator:use', (e) => {
    track('simulator_use', { meta: { dim: e.detail?.dim, page: pageName() } }, { once: 'simulator_use' });
  });

  // Footer'dagi "Statistika sozlamalari" havolasi
  document.addEventListener('click', (e) => {
    const link = e.target.closest?.('[data-analytics-settings]');
    if (!link || !configured) return; // sozlanmagan boʻlsa — oddiy havola (privacy.html) ochiladi
    e.preventDefault();
    openConsentSettings(true);
  });

  if (shouldShowBanner(getStatus())) openConsentSettings(false);
  trackPageView();
}

try { init(); } catch { /* jim */ }
