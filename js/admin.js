// admin.js — admin panel: kirish → is_admin() tekshiruvi → maʼlumotni oʻqish → hisobot.
// Admin boʻlmasa hech qanday maʼlumot soʻralmaydi. Server tomonda ham RLS baribir hech narsa bermaydi.
import { adminConfigured, getAdminClient, checkAdmin, fetchAll, dateBounds, EVENT_SELECT, FEEDBACK_SELECT, NO_GROUP_FILTER } from './admin-data.js';
import { renderReport } from './admin-view.js';
import { groupCodes } from './stats.js';
import { toCsv, csvFilename, EVENT_COLUMNS, FEEDBACK_COLUMNS } from './csv.js';
import { isExcluded, setExcluded } from './device.js';
import { el } from './dom.js';
import { setupSeminars, loadSeminars } from './admin-seminar.js';

const $ = (id) => document.getElementById(id);
const views = { login: $('login'), denied: $('denied'), dashboard: $('dashboard') };
const status = $('admin-status');
const dataStatus = $('data-status');
const report = $('report');

let client = null;
let data = { events: [], feedback: [] };
const knownGroups = new Set();
let loadToken = 0; // eski (kechikkan) soʻrov natijasi yangisining ustiga yozilmasin
let updateSeminars = () => {}; // "Seminarlar" roʻyxatini maʼlumotdagi kodlar bilan yangilash

// Faqat bitta boʻlimni koʻrsatish (yoki hech birini)
function showView(name) {
  for (const [key, node] of Object.entries(views)) node.hidden = key !== name;
}

// Maʼlumotni xotiradan tozalash (chiqishda)
function clearData() {
  data = { events: [], feedback: [] };
  knownGroups.clear();
  report.replaceChildren();
  dataStatus.textContent = '';
}

// "Bu qurilmani statistikadan chiqar" — holat va tugma
function renderDeviceToggle() {
  const excluded = isExcluded();
  $('device-state').textContent = excluded
    ? '✓ Bu qurilma statistikadan chiqarilgan: undan hech qanday hodisa yuborilmaydi.'
    : 'Bu qurilma hozir hisoblanmoqda: saytni shu yerdan ochsangiz, kirishlaringiz statistikaga tushadi.';
  $('device-toggle').textContent = excluded ? 'Qayta hisoblash' : 'Bu qurilmani statistikadan chiqar';
  $('device-toggle').setAttribute('aria-pressed', String(excluded));
}

// Guruh tanlash roʻyxati: Hammasi, Guruhsiz, koʻrilgan va yaratilgan seminar kodlari
function renderGroupOptions() {
  const select = $('filter-group');
  const current = select.value;
  const options = [el('option', { value: '', text: 'Hamma guruhlar' }), el('option', { value: NO_GROUP_FILTER, text: 'Guruhsiz' })];
  const codes = new Set([...knownGroups, ...loadSeminars().map((s) => s.code)]);
  for (const code of [...codes].sort()) options.push(el('option', { value: code, text: code }));
  select.replaceChildren(...options);
  select.value = [...select.options].some((o) => o.value === current) ? current : '';
}

// Filtr boʻyicha maʼlumotni yuklash va hisobotni chizish
async function loadData() {
  const from = $('filter-from').value;
  const to = $('filter-to').value;
  if (from && to && from > to) { dataStatus.textContent = 'Boshlanish sanasi tugash sanasidan keyin boʻlmasin.'; return; }
  const token = ++loadToken;
  const filters = { ...dateBounds(from, to), group: $('filter-group').value };
  dataStatus.textContent = 'Maʼlumot yuklanmoqda…';
  $('refresh').disabled = true;
  try {
    const [events, feedback] = await Promise.all([
      fetchAll(client, 'events', EVENT_SELECT, filters),
      fetchAll(client, 'feedback', FEEDBACK_SELECT, filters),
    ]);
    if (token !== loadToken) return;
    data = { events, feedback };
    groupCodes(events).forEach((g) => knownGroups.add(g));
    renderGroupOptions();
    updateSeminars([...knownGroups]);
    if (!events.length && !feedback.length) {
      report.replaceChildren();
      dataStatus.textContent = 'Tanlangan filtr boʻyicha maʼlumot yoʻq.';
    } else {
      renderReport(report, data);
      dataStatus.textContent = `${events.length} ta hodisa va ${feedback.length} ta fikr yuklandi.`;
    }
  } catch (error) {
    if (token === loadToken) dataStatus.textContent = `Maʼlumotni yuklab boʻlmadi: ${error?.message ?? 'nomaʼlum xato'}`;
  } finally {
    if (token === loadToken) $('refresh').disabled = false;
  }
}

// CSV faylni kompyuterga yuklab berish (BOM — Excel oʻzbekcha harflarni toʻgʻri ochishi uchun)
function download(kind, rows, columns) {
  if (!rows.length) { dataStatus.textContent = 'Eksport uchun maʼlumot yoʻq.'; return; }
  const blob = new Blob(['﻿', toCsv(rows, columns)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: csvFilename(kind) });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Kirgandan keyin: adminmi? Yoʻq boʻlsa — "Ruxsat yoʻq", maʼlumot soʻralmaydi
async function afterLogin(user) {
  status.textContent = 'Ruxsat tekshirilmoqda…';
  let admin = false;
  try {
    admin = await checkAdmin(client);
  } catch {
    status.textContent = 'Ruxsatni tekshirib boʻlmadi. Internetni tekshirib, sahifani yangilang.';
    showView('denied');
    return;
  }
  status.textContent = '';
  if (!admin) { showView('denied'); return; }
  $('who').textContent = user.email ?? '';
  showView('dashboard');
  renderDeviceToggle();
  await loadData();
}

// Chiqish: sessiya va xotiradagi maʼlumot tozalanadi
async function logout() {
  try { await client.auth.signOut(); } catch { /* baribir chiqamiz */ }
  clearData();
  $('login-form').reset();
  showView('login');
  status.textContent = 'Siz tizimdan chiqdingiz.';
}

// Sahifa ochilganda: sozlamani tekshirish, klientni yuklash, tugmalarni ulash, sessiyani tiklash
async function init() {
  if (!adminConfigured()) {
    status.textContent = 'Supabase sozlanmagan: js/config.js boʻsh. docs/SETUP.md ga qarang.';
    return;
  }
  status.textContent = 'Yuklanmoqda…';
  try {
    client = await getAdminClient();
  } catch {
    status.textContent = 'Supabase kutubxonasini yuklab boʻlmadi. Internetni tekshiring.';
    return;
  }

  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = $('login-button');
    button.disabled = true;
    $('login-error').textContent = '';
    let result = null;
    try {
      const { data: d, error } = await client.auth.signInWithPassword({
        email: $('login-email').value.trim(),
        password: $('login-password').value,
      });
      // Qaysi biri notoʻgʻriligini aytmaymiz: begona odam emailni taxmin qila olmasin
      if (error) $('login-error').textContent = 'Email yoki parol notoʻgʻri.';
      else result = d;
    } catch {
      $('login-error').textContent = 'Serverga ulanib boʻlmadi. Internetni tekshiring.';
    }
    button.disabled = false;
    $('login-password').value = '';
    if (result) await afterLogin(result.user);
  });
  for (const id of ['logout', 'logout-denied']) $(id).addEventListener('click', logout);
  $('filters').addEventListener('submit', (e) => { e.preventDefault(); loadData(); });
  $('filters-clear').addEventListener('click', () => { $('filters').reset(); loadData(); });
  $('export-events').addEventListener('click', () => download('events', data.events, EVENT_COLUMNS));
  $('export-feedback').addEventListener('click', () => download('feedback', data.feedback, FEEDBACK_COLUMNS));
  $('device-toggle').addEventListener('click', () => { setExcluded(!isExcluded()); renderDeviceToggle(); });
  // Seminar tanlansa — filtr shu kodga oʻrnatiladi va hisobot yuklanadi
  updateSeminars = setupSeminars($('seminars'), {
    codesChanged: renderGroupOptions,
    showReport: (code) => { renderGroupOptions(); $('filter-group').value = code; loadData(); $('filters').scrollIntoView(); },
  });

  const { data: { session } } = await client.auth.getSession();
  status.textContent = '';
  if (session) await afterLogin(session.user);
  else showView('login');
}

init().catch(() => { status.textContent = 'Admin panelni ochib boʻlmadi. Sahifani yangilang.'; });
