// lesson.js — dars sahifasi: lesson.html?id=N
// Ish tartibi: Markdown faylni yuklash → frontmatter'ni oʻqish → HTML'ga aylantirish →
// direktivalarni jonlantirish → testni koʻrsatish → progressni saqlash.
import { parseFrontmatter, renderMarkdown, escapeHtml } from './markdown.js';
import { LESSONS } from './lessons.js';
import { markStarted, markCompleted } from './progress.js';
import { renderQuiz } from './quiz-ui.js';
import { mountDirectives } from './widgets.js';
import { el } from './dom.js';
import { track } from './analytics.js';
import { renderFeedback } from './feedback.js';
import { createRosette } from './rosette.js';
import { renderProgress } from './progress-bar.js';

const header = document.getElementById('lesson-header');
const body = document.getElementById('lesson-body');
const quizBox = document.getElementById('lesson-quiz');
const nav = document.getElementById('lesson-nav');
const feedbackBox = document.getElementById('lesson-feedback');

let reachedEnd = false; // dars matni oxirigacha koʻrildimi (lesson_complete uchun)
let updateProgress = () => {}; // test topshirilganda progress chizigʻini yangilash

// Faylni matn sifatida yuklash (topilmasa xato)
async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.text();
}

// Sarlavha qismi: emblema, "N-dars · ≈ M daqiqa", nom, (kerak boʻlsa) qoralama belgisi va progress.
// Emblema — (N+1) oʻlchamli kubning soyasi, bosh sahifadagi roʻyxatdagi bilan bir xil.
function renderHeader(id, meta) {
  const parts = [`${id}-dars / ${LESSONS.length}`];
  if (meta.minutes) parts.push(`≈ ${meta.minutes} daqiqa`);
  header.replaceChildren(el('div', { class: 'lesson-head' }, [
    createRosette(id + 1, 56, { label: true }),
    el('div', {}, [el('p', { class: 'eyebrow', text: parts.join(' · ') }), el('h1', { text: meta.title })]),
  ]));
  if (meta.draft) header.append(el('p', { class: 'draft-banner', role: 'note', text: 'Qoralama — muallif hali qayta yozmagan' }));
  const progress = el('p');
  header.append(progress);
  updateProgress = renderProgress(progress);
  document.title = `${meta.title} — Toʻrtinchi oʻlchov`;
}

// Oldingi / keyingi dars havolalari
function renderNav(id) {
  const prev = LESSONS.find((l) => l.id === id - 1);
  const next = LESSONS.find((l) => l.id === id + 1);
  const link = (href, label, title, cls) => el('a', { class: `lesson-nav-link ${cls}`, href }, [
    el('small', { text: label }), el('span', { text: title }),
  ]);
  nav.replaceChildren(
    prev ? link(`lesson.html?id=${prev.id}`, 'Oldingi dars', prev.title, 'prev') : el('span'),
    next
      ? link(`lesson.html?id=${next.id}`, 'Keyingi dars', next.title, 'next')
      : link('index.html#darslar', 'Hammasi tugadi', 'Darslar roʻyxatiga', 'next'),
  );
}

// Darsning testi: content/quizzes/N.json
async function renderLessonQuiz(id) {
  const quiz = JSON.parse(await fetchText(`content/quizzes/${id}.json`));
  quizBox.prepend(el('h2', { id: 'quiz-title', text: 'Oʻzingizni tekshiring' }));
  const holder = el('div');
  quizBox.append(holder);
  renderQuiz(holder, quiz, {
    onSubmit: (result) => {
      markCompleted(id, result.score, result.max);
      updateProgress();
      track('quiz_submit', { lessonId: id, score: result.score, maxScore: result.max });
      // "Tugatdi" = matn oxirigacha oʻqildi VA test topshirildi
      if (reachedEnd) track('lesson_complete', { lessonId: id }, { once: `lesson_complete_${id}` });
    },
  });
}

// Matn oxiriga koʻrinmas belgi qoʻyib, u ekranda paydo boʻlganini kuzatamiz
function watchLessonEnd() {
  const marker = el('div', { class: 'lesson-end', 'aria-hidden': 'true' });
  body.after(marker);
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { reachedEnd = true; observer.disconnect(); }
  });
  observer.observe(marker);
}

// Xato xabari (masalan, dars topilmasa yoki internet uzilsa)
function showError(message) {
  header.replaceChildren(el('h1', { text: 'Dars ochilmadi' }));
  body.innerHTML = `<p>${escapeHtml(message)}</p><p><a href="index.html#darslar">Darslar roʻyxatiga qaytish</a></p>`;
}

// Sahifa ochilganda: id ni tekshirish, darsni yuklash va chizish, testni koʻrsatish
async function init() {
  const id = Number(new URLSearchParams(location.search).get('id'));
  if (!LESSONS.some((l) => l.id === id)) return showError('Bunday dars yoʻq. Darslar raqami 1 dan 6 gacha.');

  const { meta, body: markdown } = parseFrontmatter(await fetchText(`content/lessons/${id}.md`));
  renderHeader(id, meta ?? { title: `${id}-dars` });
  body.innerHTML = renderMarkdown(markdown);
  mountDirectives(body);
  markStarted(id);
  track('lesson_start', { lessonId: id }, { once: `lesson_start_${id}` });
  watchLessonEnd();
  renderNav(id);
  renderFeedback(feedbackBox, id);
  try {
    await renderLessonQuiz(id);
  } catch {
    quizBox.replaceChildren(el('p', { text: 'Testni yuklab boʻlmadi. Sahifani yangilab koʻring.' }));
  }
}

init().catch(() => showError('Darsni yuklab boʻlmadi. Internet aloqasini tekshirib, sahifani yangilang.'));
