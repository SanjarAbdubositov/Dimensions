// Imlo testi: oʻ va gʻ uchun faqat U+02BB (ʻ) ishlatilganini tekshiradi.
// Notoʻgʻri variantlar: o' (ASCII), o’ / o‘ (qoʻshtirnoq), oʼ (U+02BC — bu tutuq belgisi uchun).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SKIP_DIRS = new Set(['.git', 'node_modules', 'tests']);
const WRONG = /[oOgG]['’‘`ʼ]/g;

// Tekshiriladigan fayllar: HTML, Markdown, JSON va JS izohlari/matnlari
function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return SKIP_DIRS.has(name) ? [] : listFiles(path);
    return ['.html', '.md', '.json', '.js'].includes(extname(name)) ? [path] : [];
  });
}

// HTML ichidagi <script> bloklari kod, matn emas — ularni olib tashlaymiz
function textOf(path) {
  const raw = readFileSync(path, 'utf8');
  return extname(path) === '.html' ? raw.replace(/<script[\s\S]*?<\/script>/g, '') : raw;
}

test('oʻ va gʻ har joyda U+02BB (ʻ) bilan yozilgan', () => {
  const problems = [];
  for (const path of listFiles(ROOT)) {
    if (path.endsWith('package.json') || path.endsWith('package-lock.json')) continue;
    textOf(path).split('\n').forEach((line, k) => {
      // JS'da 'log' kabi kod satrlari tasodifan mos kelmasligi uchun faqat oʻzbekcha harf ketma-ketligini tekshiramiz
      const hits = [...line.matchAll(WRONG)].filter((m) => /[a-zʻʼ]/i.test(line[m.index + 2] ?? ''));
      if (hits.length) problems.push(`${path.replace(ROOT, '')}:${k + 1}: ${line.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(problems, [], `Notoʻgʻri belgi topildi:\n${problems.join('\n')}`);
});

test('ʻ (U+02BB) faqat o va g dan keyin keladi; tutuq belgisi uchun ʼ (U+02BC)', () => {
  const problems = [];
  for (const path of listFiles(ROOT)) {
    textOf(path).split('\n').forEach((line, k) => {
      // "(ʻ)" — belgining oʻzini koʻrsatish, xato emas
      if (/[^oOgG(]ʻ/.test(line)) problems.push(`${path.replace(ROOT, '')}:${k + 1}: ${line.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(problems, [], `Notoʻgʻri ʻ topildi (maʼno, taʼlim kabi soʻzlarda ʼ boʻlishi kerak):\n${problems.join('\n')}`);
});

test('matnli fayllarda soʻz ichida ASCII tutuq belgisi (\') yoʻq', () => {
  const problems = [];
  for (const path of listFiles(ROOT).filter((p) => ['.md', '.json', '.html'].includes(extname(p)))) {
    // Kod bloklari va HTML teglari ichidagi belgilar hisobga olinmaydi
    const text = textOf(path).replace(/```[\s\S]*?```/g, '').replace(/<[^>]*>/g, ' ');
    text.split('\n').forEach((line, k) => {
      if (/\p{L}'\p{L}/u.test(line)) problems.push(`${path.replace(ROOT, '')}:${k + 1}: ${line.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(problems, [], `ASCII ' topildi (oʻrniga ʼ yoki ʻ ishlating):\n${problems.join('\n')}`);
});

test('JS dagi foydalanuvchiga koʻrinadigan matnda ASCII tutuq belgisi (\') yoʻq', () => {
  const problems = [];
  // "..." yoki `...` ichidagi matn; '...' ichida ' boʻlolmaydi. Izoh qatorlari tekshirilmaydi.
  const STRING_WITH_APOSTROPHE = /(["`])(?:(?!\1).)*\p{L}'\p{L}(?:(?!\1).)*\1/u;
  for (const path of listFiles(ROOT).filter((p) => extname(p) === '.js')) {
    readFileSync(path, 'utf8').split('\n').forEach((line, k) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      if (STRING_WITH_APOSTROPHE.test(line)) problems.push(`${path.replace(ROOT, '')}:${k + 1}: ${line.trim().slice(0, 80)}`);
    });
  }
  assert.deepEqual(problems, [], `JS matnida ASCII ' topildi (oʻrniga ʼ ishlating):\n${problems.join('\n')}`);
});
