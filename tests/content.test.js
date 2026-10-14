// Kontent testlari: darslar, dars testlari va oldin/keyin testi toʻgʻri tuzilganmi
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseFrontmatter, parseDirective, countWords, DEEPER_START } from '../js/markdown.js';
import { validateQuiz } from '../js/quiz.js';
import { LESSONS } from '../js/lessons.js';
import { ALL_CONTROLS } from '../js/simulator.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const KNOWN_DIRECTIVES = ['simulator', 'predict'];

test('darslar roʻyxatida 6 ta dars, id lar 1..6', () => {
  assert.deepEqual(LESSONS.map((l) => l.id), [1, 2, 3, 4, 5, 6]);
});

for (const lesson of LESSONS) {
  test(`${lesson.id}-dars: frontmatter toʻliq va roʻyxatga mos`, () => {
    const { meta, body } = parseFrontmatter(read(`content/lessons/${lesson.id}.md`));
    assert.ok(meta, 'frontmatter yoʻq');
    assert.equal(meta.id, lesson.id);
    assert.equal(meta.title, lesson.title, 'sarlavha js/lessons.js dagi bilan bir xil boʻlsin');
    assert.equal(typeof meta.draft, 'boolean');
    assert.ok(Number.isInteger(meta.minutes) && meta.minutes > 0, 'minutes musbat butun son');
    assert.ok(body.trim().length > 0, 'dars matni boʻsh');
    assert.ok(read('index.html').includes(lesson.title), 'bosh sahifada sarlavha yoʻq');
    if (meta.draft) {
      const words = countWords(body);
      assert.ok(words >= 600 && words <= 900, `qoralama 600–900 soʻz boʻlsin, hozir ${words}`);
    }
  });

  test(`${lesson.id}-dars: direktivalar toʻgʻri yozilgan`, () => {
    const all = read(`content/lessons/${lesson.id}.md`).split('\n').filter((l) => l.startsWith(':::'));
    // ":::chuqurroq …" bloklari ochilgan va yopilgan (":::") boʻlishi kerak
    let open = 0;
    for (const line of all) {
      if (DEEPER_START.test(line.trim())) { assert.equal(open, 0, `ichma-ich chuqurroq: ${line}`); open = 1; }
      else if (line.trim() === ':::') { assert.equal(open, 1, 'ortiqcha yopuvchi :::'); open = 0; }
    }
    assert.equal(open, 0, 'chuqurroq bloki yopilmagan');
    const lines = all.filter((l) => !DEEPER_START.test(l.trim()) && l.trim() !== ':::');
    for (const line of lines) {
      const d = parseDirective(line);
      assert.ok(d, `notoʻgʻri direktiva: ${line}`);
      assert.ok(KNOWN_DIRECTIVES.includes(d.name), `nomaʼlum direktiva: ${d.name}`);
      if (d.name === 'simulator') {
        for (const n of (d.params.dims ?? '').split(',').filter(Boolean)) assert.ok(+n >= 2 && +n <= 7, line);
        for (const c of (d.params.controls ?? '').split(',').filter(Boolean)) assert.ok(ALL_CONTROLS.includes(c), line);
      }
      if (d.name === 'predict') {
        for (const v of Object.values(d.params)) assert.ok(Number.isInteger(+v), line);
      }
    }
  });

  test(`${lesson.id}-dars testi: JSON toʻgʻri tuzilgan`, () => {
    const quiz = JSON.parse(read(`content/quizzes/${lesson.id}.json`));
    assert.deepEqual(validateQuiz(quiz), []);
    assert.equal(quiz.lesson, lesson.id);
    assert.ok(quiz.questions.length >= 4 && quiz.questions.length <= 5, '4–5 ta savol boʻlsin');
  });
}

test('oldin/keyin testi: 6 ta savol, toʻgʻri tuzilgan', () => {
  const quiz = JSON.parse(read('content/tests/prepost.json'));
  assert.deepEqual(validateQuiz(quiz), []);
  assert.equal(quiz.questions.length, 6);
});
