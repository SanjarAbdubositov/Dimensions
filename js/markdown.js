// markdown.js — darslar uchun juda oddiy Markdown parser (tashqi kutubxonasiz).
// Sof funksiyalar: DOM yoʻq, shuning uchun Node'da test qilinadi.
// Qoʻllab-quvvatlanadi: sarlavha, paragraf, roʻyxat, jadval, iqtibos (>), kod bloki,
// **qalin**, *kursiv*, `kod`, [havola](url) va :::nom kalit=qiymat::: direktivalari.

// Frontmatter: fayl boshidagi --- ... --- orasidagi "kalit: qiymat" qatorlari
export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { meta: null, body: text };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(line.trim());
    if (kv) meta[kv[1]] = parseValue(kv[2]);
  }
  return { meta, body: text.slice(match[0].length) };
}

// "true" → true, "10" → 10, "\"Matn\"" → Matn
function parseValue(raw) {
  const v = raw.trim();
  if (v === 'true' || v === 'false') return v === 'true';
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v.replace(/^"(.*)"$/, '$1');
}

// HTML maxsus belgilarini xavfsiz koʻrinishga oʻtkazish
export function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Faqat xavfsiz havolalar: http(s), nisbiy yoʻl yoki #langar
function safeUrl(url) {
  return /^(https?:\/\/|#|\.{0,2}\/|[\w-]+\.html)/.test(url) ? url : null;
}

// Qator ichidagi belgilash: `kod`, **qalin**, *kursiv*, [matn](url)
export function renderInline(text) {
  return text.split(/(`[^`]+`)/).map((part) => {
    if (/^`[^`]+`$/.test(part)) return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
    return escapeHtml(part)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, label, url) => {
        const href = safeUrl(url);
        if (!href) return label;
        const external = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${href}"${external}>${label}</a>`;
      });
  }).join('');
}

// Direktiva: ":::simulator dims=2,3,4 controls=dims:::" → { name, params }
export function parseDirective(line) {
  const m = /^:::(\w+)((?:\s+[\w-]+=[^\s:]+)*)\s*:::$/.exec(line.trim());
  if (!m) return null;
  const params = {};
  for (const pair of m[2].trim().split(/\s+/).filter(Boolean)) {
    const [key, value] = pair.split('=');
    params[key] = value;
  }
  return { name: m[1], params };
}

// Direktivani HTML joy-egallovchiga aylantiradi; uni lesson.js keyin "jonlantiradi"
function renderDirective({ name, params }) {
  const attrs = Object.entries(params).map(([k, v]) => ` data-${escapeHtml(k)}="${escapeHtml(v)}"`).join('');
  return `<div class="directive" data-directive="${escapeHtml(name)}"${attrs}></div>`;
}

// Jadval qatorini kataklarga boʻlish: "| a | b |" → ["a", "b"]
function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

// Jadval: birinchi qator — sarlavha, ikkinchisi — ajratuvchi (|---|), qolganlari — tana
function renderTable(lines) {
  const head = splitRow(lines[0]).map((c) => `<th scope="col">${renderInline(c)}</th>`).join('');
  const rows = lines.slice(2).map((l) => `<tr>${splitRow(l).map((c) => `<td>${renderInline(c)}</td>`).join('')}</tr>`);
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

const BLOCK_START = /^(#{1,4}\s|```|>|\||[-*]\s|\d+\.\s|:::)/;

// Asosiy funksiya: Markdown matnni HTML qatoriga aylantiradi
export function renderMarkdown(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  // Shart bajarilguncha qatorlarni yigʻadi
  const collect = (test) => {
    const block = [];
    while (i < lines.length && test(lines[i])) block.push(lines[i++]);
    return block;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      i++;
      const code = collect((l) => !l.startsWith('```'));
      i++; // yopuvchi ```
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      out.push(`<pre><code${cls}>${escapeHtml(code.join('\n'))}</code></pre>`);
    } else if (parseDirective(line)) {
      out.push(renderDirective(parseDirective(line)));
      i++;
    } else if (/^#{1,4}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      out.push(`<h${level}>${renderInline(line.slice(level).trim())}</h${level}>`);
      i++;
    } else if (line.startsWith('>')) {
      const inner = collect((l) => l.startsWith('>')).map((l) => l.replace(/^>\s?/, ''));
      out.push(`<blockquote>${renderMarkdown(inner.join('\n'))}</blockquote>`);
    } else if (line.startsWith('|')) {
      out.push(renderTable(collect((l) => l.startsWith('|'))));
    } else if (/^[-*]\s/.test(line)) {
      const items = collect((l) => /^[-*]\s/.test(l)).map((l) => `<li>${renderInline(l.replace(/^[-*]\s+/, ''))}</li>`);
      out.push(`<ul>${items.join('')}</ul>`);
    } else if (/^\d+\.\s/.test(line)) {
      const items = collect((l) => /^\d+\.\s/.test(l)).map((l) => `<li>${renderInline(l.replace(/^\d+\.\s+/, ''))}</li>`);
      out.push(`<ol>${items.join('')}</ol>`);
    } else {
      const para = [line];
      i++;
      para.push(...collect((l) => l.trim() && !BLOCK_START.test(l)));
      out.push(`<p>${renderInline(para.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}

// Soʻzlar soni (frontmatter'siz matn uchun; kod bloklari va belgilar hisobga olinmaydi)
export function countWords(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^:::.*:::$/gm, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\d]/u.test(w)).length;
}
