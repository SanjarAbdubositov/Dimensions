// quiz.js — test mantigʻi: tuzilmani tekshirish va baholash.
// Sof funksiyalar (DOM yoʻq), shuning uchun Node'da test qilinadi. Interfeys — quiz-ui.js'da.
//
// Test fayli tuzilmasi:
// { "draft": true, "questions": [ { "q": "Savol", "options": ["A", "B"], "answer": 0, "explain": "..." } ] }

// Test toʻgʻri tuzilganmi? Xatolar roʻyxatini qaytaradi (boʻsh roʻyxat = hammasi joyida)
export function validateQuiz(quiz) {
  const errors = [];
  if (!quiz || typeof quiz !== 'object') return ['test obyekt boʻlishi kerak'];
  if (typeof quiz.draft !== 'boolean') errors.push('"draft" true yoki false boʻlishi kerak');
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return [...errors, '"questions" boʻsh boʻlmagan roʻyxat boʻlishi kerak'];
  }
  quiz.questions.forEach((item, k) => {
    const where = `${k + 1}-savol`;
    if (typeof item.q !== 'string' || !item.q.trim()) errors.push(`${where}: "q" matni yoʻq`);
    if (!Array.isArray(item.options) || item.options.length < 2) {
      errors.push(`${where}: kamida 2 ta variant kerak`);
      return;
    }
    if (item.options.some((o) => typeof o !== 'string' || !o.trim())) errors.push(`${where}: boʻsh variant bor`);
    if (new Set(item.options).size !== item.options.length) errors.push(`${where}: variantlar takrorlanmoqda`);
    if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.options.length) {
      errors.push(`${where}: "answer" variantlar ichidagi indeks boʻlishi kerak`);
    }
    if (typeof item.explain !== 'string' || !item.explain.trim()) errors.push(`${where}: "explain" tushuntirish yoʻq`);
  });
  return errors;
}

// Baholash: answers — har savol uchun tanlangan variant indeksi (javob yoʻq boʻlsa null).
// Javob berilmagan savol notoʻgʻri hisoblanadi.
export function gradeQuiz(quiz, answers) {
  const results = quiz.questions.map((item, k) => {
    const chosen = Number.isInteger(answers[k]) ? answers[k] : null;
    return { chosen, answer: item.answer, correct: chosen === item.answer };
  });
  const score = results.filter((r) => r.correct).length;
  return { score, max: quiz.questions.length, results };
}

// Hamma savolga javob berilganmi?
export function isComplete(quiz, answers) {
  return quiz.questions.every((_, k) => Number.isInteger(answers[k]));
}

// Foiz, butun songa yaxlitlangan (max = 0 boʻlsa 0)
export function percent(score, max) {
  return max > 0 ? Math.round((score / max) * 100) : 0;
}
