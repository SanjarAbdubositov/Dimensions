// config.js — Supabase ulanish sozlamalari (docs/SETUP.md, 3-qadam).
// Ikkalasi ham boʻsh qolsa, statistika butunlay oʻchadi — sayt baribir toʻliq ishlaydi.
//
// ⚠️ Bu yerga FAQAT "Publishable key" (sb_publishable_...) yoki eski "anon public" kalitni qoʻying.
//    U ochiq boʻlishi uchun moʻljallangan: maʼlumotni RLS qoidalari himoya qiladi.
// ⛔ "Secret key" (sb_secret_...) yoki "service_role" kalitni HECH QACHON qoʻymang:
//    u barcha himoyani chetlab oʻtadi va saytni ochgan har kim butun bazani oʻqiy oladi.
//    analytics.js bunday kalitni taniydi va ishlatishdan bosh tortadi.

export const SUPABASE_URL = 'https://pjwodxgivejscdgphxyo.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_ixyR_AZGVbBQEGvt41F_0g_omAZ1BaO'; // ochiq kalit — RLS himoyalaydi
