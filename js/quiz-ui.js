// quiz-ui.js — testni sahifada koʻrsatish. Baholash quiz.js'dagi sof funksiyalarda.
import { el } from './dom.js';
import { gradeQuiz, isComplete, percent } from './quiz.js';

let uid = 0; // sahifada bir nechta test boʻlsa, radio nomlari takrorlanmasin

// Testni container ichida chizadi.
// options.reveal — topshirgandan keyin toʻgʻri javob va tushuntirish koʻrsatilsinmi
// options.onSubmit(result) — natija tayyor boʻlganda chaqiriladi
export function renderQuiz(container, quiz, { reveal = true, onSubmit } = {}) {
  const prefix = `quiz-${++uid}`;
  const answers = quiz.questions.map(() => null);
  const form = el('form', { class: 'quiz', novalidate: '' });

  if (quiz.draft) form.append(el('p', { class: 'draft-badge', text: 'Qoralama savollar — muallif hali tekshirmagan' }));

  // Har bir savol — alohida fieldset (ekran oʻquvchi dasturlar uchun ham tushunarli)
  const blocks = quiz.questions.map((item, k) => {
    const feedback = el('p', { class: 'quiz-feedback', hidden: '' });
    const options = item.options.map((text, v) => {
      const input = el('input', { type: 'radio', name: `${prefix}-${k}`, value: String(v) });
      input.addEventListener('change', () => { answers[k] = v; });
      return el('label', { class: 'quiz-option' }, [input, el('span', { text })]);
    });
    const fieldset = el('fieldset', { class: 'quiz-question' }, [
      el('legend', { text: `${k + 1}. ${item.q}` }), ...options, feedback,
    ]);
    form.append(fieldset);
    return { fieldset, feedback, options };
  });

  const status = el('p', { class: 'quiz-status', 'aria-live': 'polite' });
  const button = el('button', { type: 'submit', class: 'btn', text: 'Javoblarni tekshirish' });
  form.append(status, button);
  container.replaceChildren(form);

  let submitted = false;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitted) return reset();
    if (!isComplete(quiz, answers)) {
      const left = answers.filter((a) => a === null).length;
      status.textContent = `Hamma savolga javob bering (yana ${left} ta qoldi).`;
      return;
    }
    submitted = true;
    const result = gradeQuiz(quiz, answers);
    showResult(result);
    onSubmit?.(result);
  });

  // Natijani koʻrsatish: har savol yonida belgi va (reveal boʻlsa) tushuntirish
  function showResult(result) {
    blocks.forEach(({ fieldset, feedback, options }, k) => {
      options.forEach((label) => { label.querySelector('input').disabled = true; });
      if (!reveal) return;
      const r = result.results[k];
      const item = quiz.questions[k];
      fieldset.classList.add(r.correct ? 'is-correct' : 'is-wrong');
      options[item.answer].classList.add('is-answer');
      feedback.textContent = (r.correct ? '✓ Toʻgʻri. ' : `✗ Toʻgʻri javob: ${item.options[item.answer]}. `) + item.explain;
      feedback.hidden = false;
    });
    status.textContent = `Natija: ${result.score} / ${result.max} (${percent(result.score, result.max)}%)`;
    button.textContent = 'Qayta urinish';
  }

  // Testni boshidan boshlash
  function reset() {
    submitted = false;
    answers.fill(null);
    form.reset();
    blocks.forEach(({ fieldset, feedback, options }) => {
      fieldset.classList.remove('is-correct', 'is-wrong');
      feedback.hidden = true;
      options.forEach((label) => {
        label.classList.remove('is-answer');
        label.querySelector('input').disabled = false;
      });
    });
    status.textContent = '';
    button.textContent = 'Javoblarni tekshirish';
    blocks[0]?.options[0]?.querySelector('input').focus();
  }
}
