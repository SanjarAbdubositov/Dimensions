// Sahifa meta teglari: lang, title, description, ulashish (og:*) teglari, ikonka va 404 sahifa
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');
const SITE = 'https://sanjarabdubositov.github.io/Dimensions/';
const meta = (html, attr, name) => new RegExp(`<meta ${attr}="${name}" content="([^"]+)">`).exec(html)?.[1];

// Ochiq sahifalar: admin (yopiq) va 404 dan tashqari hamma .html
const PUBLIC = readdirSync(ROOT).filter((f) => f.endsWith('.html') && !['admin.html', '404.html'].includes(f));

test('har bir sahifada lang="uz", title va description bor', () => {
  for (const page of [...PUBLIC, 'admin.html', '404.html']) {
    const html = read(page);
    assert.match(html, /<html lang="uz">/, page);
    assert.match(html, /<title>[^<]{5,}<\/title>/, page);
    assert.ok(meta(html, 'name', 'description')?.length > 10, `${page}: description`);
  }
});

test('ochiq sahifalarda ulashish teglari bor va rasm manzili toʻliq (https)', () => {
  assert.ok(PUBLIC.length >= 7);
  for (const page of PUBLIC) {
    const html = read(page);
    for (const name of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) assert.ok(meta(html, 'property', name), `${page}: ${name}`);
    assert.equal(meta(html, 'property', 'og:image'), `${SITE}og-image.png`, page);
    assert.ok(meta(html, 'property', 'og:url').startsWith(SITE), `${page}: og:url`);
    assert.equal(meta(html, 'property', 'og:title'), /<title>([^<]+)<\/title>/.exec(html)[1], `${page}: og:title = title`);
    assert.equal(meta(html, 'name', 'twitter:card'), 'summary_large_image', page);
    assert.match(html, /<link rel="icon" href="favicon\.svg"/, page);
    assert.match(html, /<link rel="apple-touch-icon" href="apple-touch-icon\.png">/, page);
  }
});

test('og-image.png 1200×630, ikonka fayllari mavjud', () => {
  const png = readFileSync(new URL('og-image.png', ROOT));
  assert.equal(png.readUInt32BE(16), 1200, 'kenglik');
  assert.equal(png.readUInt32BE(20), 630, 'balandlik');
  assert.ok(png.length < 300 * 1024, 'rasm 300 KB dan kichik (Telegram tez yuklasin)');
  for (const f of ['favicon.svg', 'apple-touch-icon.png', '.nojekyll']) assert.ok(existsSync(new URL(f, ROOT)), f);
});

test('404.html: noindex, ildizni aniqlovchi <base> skripti stillardan oldin, bosh sahifaga havola', () => {
  const html = read('404.html');
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.ok(html.indexOf("createElement('base')") < html.indexOf('href="css/style.css"'), '<base> stillardan oldin qoʻyilishi kerak');
  assert.match(html, /href="index\.html"[^>]*>Bosh sahifaga qaytish/);
});

test('admin.html ulashilmaydi: og teglari yoʻq', () => {
  assert.doesNotMatch(read('admin.html'), /og:image/);
});
