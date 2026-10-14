// feedback.js — dars oxiridagi fikr formasi: 1–5 yulduz va ixtiyoriy izoh.
// Statistika sozlanmagan boʻlsa, forma umuman koʻrsatilmaydi.
import { el } from './dom.js';
import { getStatus, sendFeedback, openConsentSettings } from './analytics.js';
import { COMMENT_MAX, looksPersonal } from './analytics-core.js';

const MESSAGES = {
  sent: 'Rahmat! Fikringiz yuborildi.',
  excluded: 'Bu qurilma statistikadan chiqarilgan — fikr yuborilmadi.',
  invalid: `Izoh ${COMMENT_MAX} belgidan oshmasin.`,
  error: 'Yuborib boʻlmadi. Internetni tekshirib, qayta urinib koʻring.',
  disabled: 'Fikr yuborish hozircha oʻchirilgan.',
};

// Formani container ichida chizadi
export function renderFeedback(container, lessonId) {
  if (!getStatus().configured) { container.remove(); return; }

  let rating = 0;
  const stars = [1, 2, 3, 4, 5].map((v) => {
    const id = `rating-${v}`;
    const input = el('input', { type: 'radio', name: 'rating', id, value: String(v), class: 'sr-only' });
    input.addEventListener('change', () => { rating = v; paint(); });
    const label = el('label', { for: id, class: 'star' }, [
      el('span', { 'aria-hidden': 'true', text: '★' }),
      el('span', { class: 'sr-only', text: `${v} yulduz` }),
    ]);
    return { input, label };
  });
  // Tanlangan yulduzgacha boʻlganlarini boʻyash
  const paint = () => stars.forEach((s, k) => s.label.classList.toggle('on', k < rating));

  const comment = el('textarea', { id: 'feedback-comment', rows: '3', maxlength: String(COMMENT_MAX), 'aria-describedby': 'feedback-warning feedback-count' });
  const count = el('small', { id: 'feedback-count', class: 'hint', text: `0 / ${COMMENT_MAX}` });
  comment.addEventListener('input', () => { count.textContent = `${comment.value.length} / ${COMMENT_MAX}`; });
  const status = el('p', { class: 'feedback-status', 'aria-live': 'polite' });
  const button = el('button', { type: 'submit', class: 'btn', text: 'Yuborish' });

  const form = el('form', { class: 'feedback card', novalidate: '' }, [
    el('fieldset', { class: 'stars' }, [
      el('legend', { text: 'Dars sizga qanchalik foydali boʻldi?' }),
      el('div', { class: 'star-row' }, stars.flatMap((s) => [s.input, s.label])),
    ]),
    el('label', { for: 'feedback-comment', class: 'feedback-label', text: 'Izoh (ixtiyoriy)' }),
    comment,
    el('p', { id: 'feedback-warning', class: 'feedback-warning', text: 'Ism, telefon yoki shaxsiy maʼlumot yozmang.' }),
    count,
    button,
    status,
  ]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!rating) { status.textContent = 'Avval 1 dan 5 gacha yulduzlardan birini tanlang.'; return; }
    if (looksPersonal(comment.value)) {
      status.textContent = 'Izohda telefon raqami yoki email koʻrinyapti. Iltimos, uni olib tashlang.';
      return;
    }
    button.disabled = true;
    const result = await sendFeedback({ lessonId, rating, comment: comment.value });
    if (result === 'no-consent') {
      status.replaceChildren('Fikr yuborish uchun statistikaga rozilik kerak. ',
        el('button', { type: 'button', class: 'link-button', text: 'Sozlamalarni ochish', onclick: () => openConsentSettings(true) }));
      button.disabled = false;
      return;
    }
    status.textContent = MESSAGES[result] ?? MESSAGES.error;
    if (result === 'sent') form.querySelectorAll('input, textarea, button').forEach((x) => { x.disabled = true; });
    else button.disabled = false;
  });

  container.replaceChildren(el('h2', { id: 'feedback-title', text: 'Fikringiz' }), form);
}
