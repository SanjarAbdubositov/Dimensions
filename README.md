# Toʻrtinchi oʻlchov

4D geometriya va sunʼiy intellekt boʻyicha oʻzbek tilidagi bepul interaktiv taʼlim sayti: 6 ta qisqa dars, giperkub simulyatori (2D–7D) va testlar.

*A free, Uzbek-language interactive site about 4D geometry and AI: six short lessons, a hypercube simulator (2D–7D) and quizzes. Plain HTML/CSS/JS, no framework, no build step.*

## Ishga tushirish

Build qadam yoʻq, lekin sayt **albatta server orqali** ochilishi kerak. Repo papkasida:

```bash
python -m http.server 8000     # Windows
python3 -m http.server 8000    # macOS / Linux
```

Keyin brauzerda oching: <http://localhost:8000>

`index.html` ni ikki marta bosib (`file://` orqali) ochsangiz, sayt ishlamaydi: brauzer ES modullarni ham, darslarni `fetch()` bilan yuklashni ham faqat `http://` orqali ruxsat beradi.

## Testlar

Node.js 18+ kerak, hech narsa oʻrnatish shart emas:

```bash
npm test        # yoki: node --test
```

## Holat

- [x] M1 — skelet va simulyator
- [x] M2 — darslar va testlar (qoralama)
- [x] M3 — anonim statistika (Supabaseʼni sozlash: [docs/SETUP.md](docs/SETUP.md))
- [x] M4 — admin panel (`admin.html`, tekshirish: [docs/SETUP.md](docs/SETUP.md) 8-boʻlim)
- [ ] M5 — sayqal va joylash

Batafsil: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Dars matnlaridagi tekshirilishi kerak boʻlgan faktlar: [docs/TEKSHIRISH.md](docs/TEKSHIRISH.md).

## Litsenziya

Kod — MIT, dars matnlari (`content/`) — CC BY 4.0. Qarang: [LICENSE](LICENSE).
