// feedback.js — dars oxiridagi fikr formasi: faqat 1–5 yulduz.
// Matn maydoni ataylab yoʻq: oʻquvchi ismini yozib qoʻymasin, maʼlumot toʻliq anonim qolsin.
// Statistika sozlanmagan boʻlsa, forma umuman koʻrsatilmaydi.
import { el } from './dom.js';
import { getStatus, sendFeedback, openConsentSettings } from './analytics.js';

const MESSAGES = {
  sent: 'Rahmat! Fikringiz yuborildi.',
  excluded: 'Bu qurilma statistikadan chiqarilgan — fikr yuborilmadi.',
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
      el('span', { 'aria-hidden': 'true', text: '☆' }),
      el('span', { class: 'sr-only', text: `${v} yulduz` }),
    ]);
    return { input, label };
  });
  // Tanlangan yulduzlar toʻla (★), qolganlari boʻsh (☆) — holat rangdan tashqari shakl bilan ham koʻrinadi
  const paint = () => stars.forEach((s, k) => {
    s.label.classList.toggle('on', k < rating);
    s.label.firstChild.textContent = k < rating ? '★' : '☆';
  });

  const status = el('p', { class: 'feedback-status', 'aria-live': 'polite' });
  const button = el('button', { type: 'submit', class: 'btn', text: 'Yuborish' });

  const form = el('form', { class: 'feedback card', novalidate: '' }, [
    el('fieldset', { class: 'stars' }, [
      el('legend', { text: 'Dars sizga qanchalik foydali boʻldi?' }),
      el('div', { class: 'star-row' }, stars.flatMap((s) => [s.input, s.label])),
    ]),
    button,
    status,
  ]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!rating) { status.textContent = 'Avval 1 dan 5 gacha yulduzlardan birini tanlang.'; return; }
    button.disabled = true;
    const result = await sendFeedback({ lessonId, rating });
    if (result === 'no-consent') {
      status.replaceChildren('Fikr yuborish uchun statistikaga rozilik kerak. ',
        el('button', { type: 'button', class: 'link-button', text: 'Sozlamalarni ochish', onclick: () => openConsentSettings(true) }));
      button.disabled = false;
      return;
    }
    status.textContent = MESSAGES[result] ?? MESSAGES.error;
    if (result === 'sent') form.querySelectorAll('input, button').forEach((x) => { x.disabled = true; });
    else button.disabled = false;
  });

  container.replaceChildren(el('h2', { id: 'feedback-title', text: 'Fikringiz' }), form);
}
