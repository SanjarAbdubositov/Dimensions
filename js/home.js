// home.js — bosh sahifa: kichik simulyator va har bir dars yonida progress holati.
import { createSimulator } from './simulator.js';
import { loadProgress, lessonStatus } from './progress.js';
import { el } from './dom.js';

createSimulator(document.getElementById('mini-sim'), { dims: [2, 3, 4], controls: ['dims'] });

// Har bir dars havolasiga holat belgisi qoʻshamiz: "Boshlangan" yoki "Tugatilgan · 4/5"
const progress = loadProgress();
for (const link of document.querySelectorAll('[data-lesson]')) {
  const id = link.dataset.lesson;
  const status = lessonStatus(progress, id);
  if (status === 'new') continue;
  const entry = progress.lessons[id];
  const text = status === 'completed' ? `Tugatilgan · ${entry.best}/${entry.max}` : 'Boshlangan';
  link.append(el('span', { class: `status status-${status}`, text }));
}
