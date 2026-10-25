// admin-data.js — admin panel uchun Supabase: kirish, admin tekshiruvi va maʼlumotni FAQAT oʻqish.
// Bu faylda insert / update / delete yoʻq — admin panel hech narsani oʻzgartirmaydi.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { isConfigured } from './analytics-core.js';
import { loadSupabase } from './supabase-lib.js';

export const EVENT_SELECT = 'id,created_at,anon_id,session_id,event_type,lesson_id,score,max_score,group_code,meta';
export const FEEDBACK_SELECT = 'id,created_at,anon_id,lesson_id,rating,group_code';
export const NO_GROUP_FILTER = '__none__'; // "Guruhsiz" filtri: group_code boʻsh boʻlgan qatorlar
const PAGE = 1000;      // Supabase bir soʻrovda koʻpi bilan shuncha qator beradi
const MAX_PAGES = 500;  // xavfsizlik chegarasi: 500 000 qator

// config.js toʻldirilganmi
export function adminConfigured() {
  return isConfigured(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let clientPromise = null;

// Admin klienti. Sessiya sessionStorage'da: brauzer oynasi yopilsa, avtomatik chiqiladi
// (maktabdagi umumiy kompyuterda kimdir admin panelda qolib ketmasin).
export function getAdminClient() {
  clientPromise ??= loadSupabase().then(({ createClient }) =>
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: globalThis.sessionStorage,
        storageKey: 'tortinchi-olchov-admin',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }));
  return clientPromise;
}

// Joriy foydalanuvchi adminmi — serverdagi is_admin() funksiyasi hal qiladi
export async function checkAdmin(client) {
  const { data, error } = await client.rpc('is_admin');
  if (error) throw error;
  return data === true;
}

// Sana filtri: "2026-10-01" … "2026-10-14" → mahalliy vaqtdagi chegaralar (ISO).
// "to" kuni ham kiradi, shuning uchun yuqori chegara — keyingi kunning boshi.
export function dateBounds(from, to) {
  const start = (day) => {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const fromIso = from ? start(from).toISOString() : null;
  let toIso = null;
  if (to) {
    const next = start(to);
    next.setDate(next.getDate() + 1);
    toIso = next.toISOString();
  }
  return { fromIso, toIso };
}

// Jadvaldagi BARCHA mos qatorlarni sahifalab olib keladi (range bilan, 1000 tadan).
// Boʻsh sahifa kelguncha davom etadi: server chegarasi 1000 dan kichik boʻlsa ham hammasi olinadi.
export async function fetchAll(client, table, columns, { fromIso, toIso, group } = {}) {
  const rows = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    let query = client.from(table).select(columns)
      .order('id', { ascending: true })
      .range(rows.length, rows.length + PAGE - 1);
    if (fromIso) query = query.gte('created_at', fromIso);
    if (toIso) query = query.lt('created_at', toIso);
    if (group === NO_GROUP_FILTER) query = query.is('group_code', null);
    else if (group) query = query.eq('group_code', group);
    const { data, error } = await query;
    if (error) throw error;
    if (!data.length) return rows;
    rows.push(...data);
  }
  throw new Error(`Qatorlar juda koʻp (${rows.length} dan ortiq). Sana oraligʻini qisqartiring.`);
}
