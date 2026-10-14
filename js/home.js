// home.js — bosh sahifa: kirish animatsiyasi bilan simulyator, rozetkalar va dars holatlari.
import { createSimulator } from './simulator.js';
import { shouldPlayIntro, playIntro } from './sim-intro.js';
import { createRosette } from './rosette.js';
import { renderProgress } from './progress-bar.js';
import { loadProgress, lessonStatus } from './progress.js';
import { el } from './dom.js';

const sim = createSimulator(document.getElementById('mini-sim'), { dims: [2, 3, 4], controls: ['dims'] });
if (shouldPlayIntro()) playIntro(sim);

// Rozetkalar: katta (tavsifli) va har dars yonidagi kichik (bezak, tavsif — title'da)
for (const slot of document.querySelectorAll('.rosette-big')) slot.append(createRosette(+slot.dataset.cube, 144, { label: true }));
for (const slot of document.querySelectorAll('.emblem-slot')) slot.append(createRosette(+slot.dataset.cube, 44));

renderProgress(document.getElementById('home-progress'));

// Har bir dars havolasiga holat belgisi qoʻshamiz: "Boshlangan" yoki "✓ Tugatilgan · 4/5"
const progress = loadProgress();
for (const link of document.querySelectorAll('[data-lesson]')) {
  const id = link.dataset.lesson;
  const status = lessonStatus(progress, id);
  if (status === 'new') continue;
  const entry = progress.lessons[id];
  const text = status === 'completed' ? `✓ Tugatilgan · ${entry.best}/${entry.max}` : 'Boshlangan';
  link.append(el('span', { class: `status status-${status}`, text }));
}
