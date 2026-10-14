// csv.js — CSV eksport uchun sof funksiyalar (DOM'siz, testlari bor).

// Excel bu belgilar bilan boshlangan katakni formula deb bajarishi mumkin (CSV injection).
// Masalan, izohga "=HYPERLINK(...)" yozilsa, fayl ochilganda havola ishga tushardi.
const FORMULA_START = /^[=+\-@\t\r]/;

// Bitta katakni xavfsiz matnga aylantirish
export function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let s = typeof value === 'object' ? JSON.stringify(value) : String(value);
  // 1) Formula boʻlib qolmasin: oldiga ' qoʻyamiz (Excel uni oddiy matn deb koʻrsatadi)
  if (FORMULA_START.test(s)) s = `'${s}`;
  // 2) Vergul, qoʻshtirnoq yoki yangi qator boʻlsa — qoʻshtirnoq ichiga olamiz, ichidagi " → ""
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

// Qatorlar roʻyxatidan CSV matni: birinchi qator — ustun nomlari. Qatorlar CRLF bilan ajratiladi (RFC 4180).
export function toCsv(rows, columns) {
  const lines = [columns.map(escapeCell).join(',')];
  for (const row of rows) lines.push(columns.map((c) => escapeCell(row[c])).join(','));
  return lines.join('\r\n') + '\r\n';
}

// Fayl nomi sana bilan: tortinchi-olchov-events-2026-10-14.csv
export function csvFilename(kind, date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `tortinchi-olchov-${kind}-${day}.csv`;
}

export const EVENT_COLUMNS = ['id', 'created_at', 'anon_id', 'session_id', 'event_type', 'lesson_id', 'score', 'max_score', 'group_code', 'meta'];
export const FEEDBACK_COLUMNS = ['id', 'created_at', 'anon_id', 'lesson_id', 'rating', 'comment', 'group_code'];
