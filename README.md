# Toʻrtinchi oʻlchov

4D geometriya va sunʼiy intellekt boʻyicha oʻzbek tilidagi bepul interaktiv taʼlim sayti: 6 ta qisqa dars, giperkub simulyatori (2D–7D) va testlar.

*A free, Uzbek-language interactive site about 4D geometry and AI: six short lessons, a hypercube simulator (2D–7D) and quizzes. Plain HTML/CSS/JS, no framework, no build step.*

## Ishga tushirish

Build qadam yoʻq. Fayllarni istalgan oddiy server bilan oching:

```bash
python3 -m http.server 8000
# keyin brauzerda: http://localhost:8000
```

(`file://` orqali toʻgʻridan-toʻgʻri ochish ishlamaydi — brauzerlar ES modullarni faqat server orqali yuklaydi.)

## Testlar

Node.js 18+ kerak, hech narsa oʻrnatish shart emas:

```bash
npm test        # yoki: node --test
```

## Holat

- [x] M1 — skelet va simulyator
- [ ] M2 — darslar va testlar
- [ ] M3 — anonim statistika
- [ ] M4 — admin panel
- [ ] M5 — sayqal va joylash

Batafsil: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
