// supabase-lib.js — Supabase kutubxonasini yuklash (statistika va admin panel uchun umumiy).
// Aniq versiya (latest emas): kutilmagan yangilanish saytni buzmasligi uchun.
// Versiya chiqqanidan kamida 2 hafta oʻtgan boʻlishi kerak (2.117.2 — 2026-09-25).
export const SUPABASE_ESM = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/+esm';

// Kutubxonani faqat kerak boʻlganda yuklaydi (dinamik import)
export function loadSupabase() {
  return import(SUPABASE_ESM);
}
