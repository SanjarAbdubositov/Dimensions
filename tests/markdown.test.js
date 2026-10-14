// markdown.js (oʻzimizning parser) uchun testlar
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, renderMarkdown, renderInline, parseDirective, countWords } from '../js/markdown.js';

test('frontmatter oʻqiladi: matn, son va true/false', () => {
  const { meta, body } = parseFrontmatter('---\nid: 1\ntitle: "Nuqtadan tesseraktgacha"\ndraft: true\nminutes: 10\n---\n\n## Salom');
  assert.deepEqual(meta, { id: 1, title: 'Nuqtadan tesseraktgacha', draft: true, minutes: 10 });
  assert.equal(body.trim(), '## Salom');
});

test('frontmatter boʻlmasa meta = null', () => {
  assert.deepEqual(parseFrontmatter('Oddiy matn'), { meta: null, body: 'Oddiy matn' });
});

test('sarlavha, paragraf va roʻyxatlar', () => {
  const html = renderMarkdown('## Sarlavha\n\nBirinchi qator\nikkinchi qator\n\n- a\n- b\n\n1. bir\n2. ikki');
  assert.equal(html, '<h2>Sarlavha</h2>\n<p>Birinchi qator ikkinchi qator</p>\n<ul><li>a</li><li>b</li></ul>\n<ol><li>bir</li><li>ikki</li></ol>');
});

test('qator ichidagi belgilash va kod', () => {
  assert.equal(renderInline('**qalin** va *kursiv*'), '<strong>qalin</strong> va <em>kursiv</em>');
  assert.equal(renderInline('`a < b **x**`'), '<code>a &lt; b **x**</code>');
});

test('HTML teglari xavfsiz koʻrinishga oʻtadi', () => {
  assert.equal(renderMarkdown('<script>alert(1)</script>'), '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
});

test('havolalar: xavfsizlari ishlaydi, javascript: tashlanadi', () => {
  assert.equal(renderInline('[sayt](https://example.org)'), '<a href="https://example.org" target="_blank" rel="noopener noreferrer">sayt</a>');
  assert.equal(renderInline('[dars](lesson.html?id=2)'), '<a href="lesson.html?id=2">dars</a>');
  assert.equal(renderInline('[yomon](javascript:void)'), 'yomon');
});

test('kod bloki ichidagi matn oʻzgarmaydi', () => {
  const html = renderMarkdown('```python\nx = [a for a in b if a < 2]\n```');
  assert.equal(html, '<pre><code class="language-python">x = [a for a in b if a &lt; 2]</code></pre>');
});

test('jadval', () => {
  const html = renderMarkdown('| Shakl | Uchlar |\n|---|---|\n| Kub | 8 |');
  assert.match(html, /<th scope="col">Shakl<\/th>/);
  assert.match(html, /<td>Kub<\/td><td>8<\/td>/);
});

test('iqtibos ichida Markdown ishlaydi', () => {
  assert.equal(renderMarkdown('> **Diqqat.** Matn'), '<blockquote><p><strong>Diqqat.</strong> Matn</p></blockquote>');
});

test('simulyator direktivasi joy-egallovchiga aylanadi', () => {
  assert.deepEqual(parseDirective(':::simulator dims=2,3,4 controls=dims:::'), {
    name: 'simulator', params: { dims: '2,3,4', controls: 'dims' },
  });
  assert.equal(
    renderMarkdown(':::predict uchlar=16 qirralar=32:::'),
    '<div class="directive" data-directive="predict" data-uchlar="16" data-qirralar="32"></div>',
  );
  assert.equal(parseDirective('oddiy matn'), null);
});

test('soʻzlarni sanash kod va direktivalarni hisobga olmaydi', () => {
  assert.equal(countWords('Bir ikki uch.\n\n```\nkod kod kod\n```\n:::simulator dims=4:::\n— toʻrt'), 4);
});

test('chuqurroq bloki: yigʻiladigan <details>, ichida oddiy Markdown', () => {
  const html = renderMarkdown(':::chuqurroq Formula\nMatn **qalin**.\n\n`d / (d − w)`\n:::\nKeyingi paragraf.');
  assert.match(html, /^<details class="deeper"><summary>Chuqurroq: Formula<\/summary>/);
  assert.match(html, /<strong>qalin<\/strong>/);
  assert.match(html, /<p class="formula"><code>d \/ \(d − w\)<\/code><\/p><\/details>/);
  assert.match(html, /<\/details>\n<p>Keyingi paragraf\.<\/p>$/);
});

test('chuqurroq sarlavhasi ham ekranlanadi', () => {
  assert.ok(!renderMarkdown(':::chuqurroq <img src=x>\na\n:::').includes('<img'));
});

test('yolgʻiz formula alohida sinf oladi, gap ichidagi kod — yoʻq', () => {
  assert.equal(renderMarkdown('`x + y`'), '<p class="formula"><code>x + y</code></p>');
  assert.equal(renderMarkdown('Bu `x` son.'), '<p>Bu <code>x</code> son.</p>');
});
