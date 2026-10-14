// quiz.js (baholash) va progress.js uchun testlar
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gradeQuiz, validateQuiz, isComplete, percent } from '../js/quiz.js';
import { loadProgress, markStarted, markCompleted, saveTestResult, lessonStatus } from '../js/progress.js';

const QUIZ = {
  draft: true,
  questions: [
    { q: '1+1?', options: ['1', '2', '3'], answer: 1, explain: 'Ikki.' },
    { q: '2+2?', options: ['4', '5'], answer: 0, explain: 'Toʻrt.' },
    { q: '3+3?', options: ['5', '6', '7'], answer: 1, explain: 'Olti.' },
  ],
};

test('hammasi toʻgʻri — maksimal ball', () => {
  const r = gradeQuiz(QUIZ, [1, 0, 1]);
  assert.equal(r.score, 3);
  assert.equal(r.max, 3);
  assert.ok(r.results.every((x) => x.correct));
});

test('qisman toʻgʻri: har bir savol alohida baholanadi', () => {
  const r = gradeQuiz(QUIZ, [1, 1, 0]);
  assert.equal(r.score, 1);
  assert.deepEqual(r.results.map((x) => x.correct), [true, false, false]);
  assert.deepEqual(r.results[1], { chosen: 1, answer: 0, correct: false });
});

test('javob berilmagan savol notoʻgʻri hisoblanadi', () => {
  const r = gradeQuiz(QUIZ, [1, null]);
  assert.equal(r.score, 1);
  assert.equal(r.results[1].chosen, null);
  assert.equal(r.results[2].correct, false);
  assert.equal(isComplete(QUIZ, [1, null, 2]), false);
  assert.equal(isComplete(QUIZ, [1, 0, 2]), true);
});

test('baholash testni oʻzgartirmaydi (sof funksiya)', () => {
  const copy = structuredClone(QUIZ);
  gradeQuiz(QUIZ, [0, 0, 0]);
  assert.deepEqual(QUIZ, copy);
});

test('foiz hisoblash', () => {
  assert.equal(percent(2, 3), 67);
  assert.equal(percent(0, 0), 0);
});

test('validateQuiz notoʻgʻri tuzilmani topadi', () => {
  assert.deepEqual(validateQuiz(QUIZ), []);
  const bad = { draft: 'ha', questions: [{ q: '', options: ['A'], answer: 3 }] };
  const errors = validateQuiz(bad);
  assert.ok(errors.length >= 3, errors.join('; '));
  assert.ok(validateQuiz({ draft: true, questions: [{ q: 'x', options: ['a', 'b'], answer: 2, explain: 'e' }] })
    .some((e) => e.includes('answer')));
});

// Sinov uchun localStorage oʻrnini bosuvchi oddiy obyekt
function fakeStorage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) };
}

test('progress: boshlangan → tugatilgan, eng yaxshi natija saqlanadi', () => {
  const s = fakeStorage();
  assert.equal(lessonStatus(loadProgress(s), 1), 'new');
  markStarted(1, s, 100);
  assert.equal(lessonStatus(loadProgress(s), 1), 'started');
  markCompleted(1, 4, 5, s, 200);
  markCompleted(1, 2, 5, s, 300);
  const entry = loadProgress(s).lessons[1];
  assert.equal(lessonStatus(loadProgress(s), 1), 'completed');
  assert.deepEqual(entry, { started: 100, completed: 300, score: 2, max: 5, best: 4 });
  markStarted(1, s, 400);
  assert.equal(loadProgress(s).lessons[1].started, 100, 'birinchi ochilgan vaqt oʻzgarmasligi kerak');
});

test('progress: buzilgan maʼlumot sayt ishini toʻxtatmaydi', () => {
  const s = fakeStorage();
  s.setItem('tortinchi-olchov.progress.v1', '{buzilgan');
  assert.deepEqual(loadProgress(s), { lessons: {}, tests: {} });
  saveTestResult('pre', 2, 6, s, 1);
  assert.deepEqual(loadProgress(s).tests.pre, { score: 2, max: 6, at: 1 });
});
