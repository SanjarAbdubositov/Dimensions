// progress-bar.js — "Tugatilgan darslar: 2 / 6" yozuvi va zafar rangli chiziq.
import { el } from './dom.js';
import { loadProgress, lessonStatus } from './progress.js';
import { LESSONS } from './lessons.js';

// Nechta dars tugatilgan (test topshirilgan)
export function completedCount(progress = loadProgress()) {
  return LESSONS.filter((l) => lessonStatus(progress, l.id) === 'completed').length;
}

// holder ichida progressni chizadi; qaytgan funksiya chaqirilsa — yangilaydi (chiziq silliq toʻladi)
export function renderProgress(holder) {
  const label = el('span');
  const fill = el('span', { class: 'progress-fill' });
  holder.classList.add('progress');
  holder.replaceChildren(label, el('span', { class: 'progress-track', 'aria-hidden': 'true' }, [fill]));
  const update = () => {
    const done = completedCount();
    label.textContent = `Tugatilgan darslar: ${done} / ${LESSONS.length}`;
    fill.style.setProperty('--done', String(done / LESSONS.length));
  };
  update();
  return update;
}
