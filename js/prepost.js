// prepost.js — seminar uchun oldin/keyin testi: test.html?type=pre yoki ?type=post
// Ikkalasida savollar bir xil. "pre" da toʻgʻri javoblar koʻrsatilmaydi,
// aks holda seminar oxiridagi test oʻquvchi nimani oʻrganganini oʻlchamay qoladi.
import { renderQuiz } from './quiz-ui.js';
import { loadProgress, saveTestResult } from './progress.js';
import { el } from './dom.js';

const TEXT = {
  pre: {
    title: 'Seminar boshidagi test',
    intro: 'Bu test baho uchun emas. Hozir nimani bilishingizni koʻrish uchun. Bilmasangiz, taxmin qiling — bu mutlaqo normal.',
    done: 'Rahmat! Toʻgʻri javoblarni seminar oxirida, ikkinchi testdan keyin koʻrasiz.',
  },
  post: {
    title: 'Seminar oxiridagi test',
    intro: 'Savollar seminar boshidagi bilan bir xil. Endi nima oʻzgarganini koʻramiz.',
    done: 'Rahmat! Quyida toʻgʻri javoblar va tushuntirishlar.',
  },
};

const root = document.getElementById('test-root');
const type = new URLSearchParams(location.search).get('type');

// Turi notoʻgʻri yoki berilmagan boʻlsa — tanlash havolalari
function showChooser() {
  root.replaceChildren(
    el('h1', { text: 'Oldin/keyin testi' }),
    el('p', { text: 'Bu test seminarlar uchun. Oʻqituvchingiz bergan havolani oching yoki tanlang:' }),
    el('div', { class: 'btn-row' }, [
      el('a', { class: 'btn', href: 'test.html?type=pre', text: 'Seminar boshida' }),
      el('a', { class: 'btn btn-secondary', href: 'test.html?type=post', text: 'Seminar oxirida' }),
    ]),
  );
}

// Natijadan keyingi xabar; "post" da shu qurilmadagi "pre" natijasi bilan solishtiradi
function afterSubmit(result, message) {
  saveTestResult(type, result.score, result.max);
  const pre = loadProgress().tests.pre;
  let text = TEXT[type].done;
  if (type === 'post' && pre) text += ` Seminar boshida: ${pre.score}/${pre.max}, hozir: ${result.score}/${result.max}.`;
  message.textContent = text;
  message.hidden = false;
}

async function init() {
  if (!TEXT[type]) return showChooser();
  document.title = `${TEXT[type].title} — Toʻrtinchi oʻlchov`;
  const res = await fetch('content/tests/prepost.json');
  if (!res.ok) throw new Error(res.status);
  const quiz = await res.json();
  const message = el('p', { class: 'notice', role: 'status', hidden: '' });
  const holder = el('div');
  root.replaceChildren(el('h1', { text: TEXT[type].title }), el('p', { class: 'lead', text: TEXT[type].intro }), message, holder);
  renderQuiz(holder, quiz, { reveal: type === 'post', onSubmit: (r) => afterSubmit(r, message) });
}

init().catch(() => {
  root.replaceChildren(el('h1', { text: 'Test ochilmadi' }), el('p', { text: 'Internet aloqasini tekshirib, sahifani yangilang.' }));
});
