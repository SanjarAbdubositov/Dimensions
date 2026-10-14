# Saytni internetga chiqarish (GitHub Pages)

Sayt manzili: **https://sanjarabdubositov.github.io/Dimensions/**

Saytning oʻzi uchun build qadam ham, server ham kerak emas: GitHub Pages fayllarni `main` branchdan toʻgʻridan-toʻgʻri beradi. Statistika ishlashi uchun avval [SETUP.md](SETUP.md) dagi Supabase qadamlarini bajaring. Statistikasiz ham sayt toʻliq ishlaydi.

> GitHub sahifasidagi menyu nomlari vaqt oʻtishi bilan oʻzgarishi mumkin. Bu yerda yozilgani topilmasa, oʻxshash bandni qidiring.

---

## 1. GitHub Pagesʼni yoqish

1. Repo sahifasida **Settings → Pages**.
2. **Build and deployment → Source:** “**Deploy from a branch**”.
3. **Branch:** `main`, papka: `/ (root)` → **Save**.
4. 1–2 daqiqa kuting. **Actions** boʻlimida “pages build and deployment” yashil boʻlishi kerak. Keyin sayt yuqoridagi manzilda ochiladi.

Muhim:

- **Repo ochiq (public) boʻlishi kerak.** Bepul tarifda yopiq repo uchun GitHub Pages ishlamaydi.
- Ildizdagi **`.nojekyll`** faylini oʻchirmang. Usiz GitHub Jekyll ishlatib, darslarning `.md` fayllarini HTMLʼga aylantirib yuboradi va birorta dars ochilmaydi.
- Keyingi oʻzgarishlar `main` ga merge qilinganda sayt **oʻzi yangilanadi** (1–2 daqiqa). Eski versiya koʻrinsa, sahifani qattiq yangilang: kompyuterda Ctrl + Shift + R.

## 2. Supabaseʼda sayt manzilini koʻrsatish

Admin panel email va parol bilan kiradi. Supabase yuboradigan xatlardagi havolalar (masalan, parolni tiklash) toʻgʻri manzilga olib borishi uchun:

1. Supabaseʼda **Authentication → URL Configuration**.
2. **Site URL:** `https://sanjarabdubositov.github.io/Dimensions/`
3. **Redirect URLs** ga qoʻshing:
   - `https://sanjarabdubositov.github.io/Dimensions/**`
   - `http://localhost:8000/**` — kompyuterda sinash uchun.
4. **Save**.

`js/config.js` dagi publishable/anon kalitni repoga qoʻyish **mumkin**: u ochiq boʻlishi uchun moʻljallangan. ⛔ Secret yoki `service_role` kalitni hech qachon qoʻymang ([SETUP.md](SETUP.md), 3-qadam).

## 3. Joylagandan keyingi tekshiruv roʻyxati

Telefonda, iloji boʻlsa mobil internet orqali tekshiring.

**Sayt**
- [ ] Bosh sahifa ochiladi, kichik simulyator aylanadi.
- [ ] 6 ta darsning hammasi ochiladi va har birida “Qoralama” belgisi koʻrinadi. Agar darslar ochilmasa, `.nojekyll` ni tekshiring.
- [ ] Simulyator: oʻlcham tugmalari ishlaydi, barmoq bilan sudrash ishlaydi.
- [ ] Notoʻgʻri manzil (masalan, `…/Dimensions/yoq-sahifa`) oʻzbekcha 404 sahifani koʻrsatadi.

**Rozilik va statistika**
- [ ] Birinchi kirishda rozilik banneri chiqadi.
- [ ] **“Roziman”** → 1-darsni oching, simulyatorni aylantiring, testni topshiring. Supabaseʼda **Table Editor → events** jadvalida bir necha soniyada yangi qatorlar paydo boʻladi: `page_view`, `lesson_start`, `simulator_use`, `quiz_submit`, `lesson_complete`.
- [ ] Boshqa brauzerda yoki maxfiy oynada **“Yoʻq, rahmat”** → saytda yuring. Yangi qator qoʻshilmasligi kerak.
- [ ] Footerʼdagi **“Statistika sozlamalari”** orqali tanlovni oʻzgartirish mumkin.
- [ ] Seminar havolasi: `…/Dimensions/?g=SINOV-1` bilan oching. Yangi qatorlarda `group_code` = `SINOV-1` boʻladi.

**Admin panel** (`…/Dimensions/admin.html` — manzilni oʻzingiz yozasiz)
- [ ] Admin email va paroli bilan kirish ishlaydi, raqamlar chiqadi ([SETUP.md](SETUP.md), 8-boʻlim).
- [ ] Admin boʻlmagan akkaunt “Ruxsat yoʻq” xabarini koʻradi.
- [ ] Har bir oʻz qurilmangizda (telefon, kompyuter) **“Bu qurilmani statistikadan chiqar”** tugmasini bir marta bosing.

**Telegramʼda ulashish**
- [ ] Havolani Telegramʼda “Saved Messages” ga yuboring: rasm, sarlavha va tavsif chiqishi kerak.
- [ ] Telegram eski koʻrinishni eslab qolgan boʻlsa, uni [@WebpageBot](https://t.me/WebpageBot) ga havolani yuborib yangilating.

**Tozalash** — sinov qatorlarini Supabase SQL Editorʼda oʻchiring:

```sql
delete from public.events where group_code = 'SINOV-1';
```

## 4. Lighthouseʼni oʻzingiz ishga tushirish

Lighthouse — Chromeʼga oʻrnatilgan, sahifa tezligi va qulayligini baholaydigan vosita.

1. Kompyuterda Chromeʼni **maxfiy oynada** oching (Ctrl + Shift + N): kengaytmalar natijani buzmasin.
2. Sayt sahifasini oching, keyin **F12** (yoki sichqonchaning oʻng tugmasi → “Inspect”).
3. Yuqoridagi yorliqlardan **Lighthouse** ni tanlang. Koʻrinmasa, `»` belgisini bosing.
4. Sozlamalar:
   - **Mode:** Navigation;
   - **Device:** Mobile;
   - **Categories:** Performance, Accessibility, Best practices, SEO.
5. **Analyze page load** tugmasini bosing va natijani kuting.
6. Har bir sahifani 2–3 marta oʻlchang: Performance har safar biroz farq qiladi.

**Maqsad** (asosiy promptdagi M5 qabul mezoni): Performance ≥ 90 va Accessibility ≥ 90.

**Lokal oʻlchov natijalari.** Lighthouse 12, mobil rejim, men lokal serverda oʻlchaganman. “Koshin” dizaynidan oldin va keyin:

| Sahifa | Performance (oldin → keyin) | Accessibility | Best practices | SEO | LCP (oldin → keyin) |
|---|---|---|---|---|---|
| Bosh sahifa | 99 → 99 | 100 | 100 | 100 | 1.8 → 1.9 s |
| Dars (1-dars) | 99 → 95–99 | 100 | 100 | 100 | 1.7 → 2.1 s |
| Simulyator | 100 → 100 | 100 | 100 | 100 | 1.4 → 1.5 s |
| Oldin/keyin testi | 100 → 100 | 100 | 100 | 100 | 1.3 → 1.7 s |
| Lugʻat, Loyiha haqida, Maxfiylik | 100 → 100 | 100 | 100 | 100 | 1.3–1.4 → 1.4 s |
| Admin panel | 100 → 99 | 100 | 100 | 54* | 1.4 → 1.7 s |

LCP oʻsishining asosiy sababi — Literata shrifti (28 KB). CLS hamma joyda 0.

Sekin 3G (400 kbit/s, 400 ms kechikish, CPU 4×, gzip bilan, 3 oʻlchov medianasi): bosh sahifa LCP 1.1 → 1.4 s, 1-dars 2.8 → 3.3 s, simulyator 1.2 → 1.4 s, lugʻat 1.2 → 1.3 s.

\* Admin panelda SEO ataylab past: sahifa `noindex` — qidiruv tizimlari uni koʻrsatmasligi kerak.

Internetdagi haqiqiy natija biroz farq qilishi mumkin. Oʻzingiz oʻlchagan raqamlarni shu jadval yoniga yozib qoʻying.

**Sekin internetni sinash.** DevTools → **Network** yorligʻi → “No throttling” roʻyxatidan **3G** ni tanlang va sahifani yangilang.

## 5. Manzil oʻzgarsa

Repo nomi oʻzgarsa yoki oʻz domeningizni ulasangiz:

1. Sayt manzili yozilgan **meta teglarni** yangilang. Ular `og:url` va `og:image` da, 7 ta sahifada turibdi (`index`, `simulator`, `lesson`, `test`, `glossary`, `about`, `privacy`). Hammasini bir yoʻla almashtirsa boʻladi: `https://sanjarabdubositov.github.io/Dimensions/` → yangi manzil.
2. `tests/meta.test.js` dagi `SITE` qiymatini ham yangilang va `npm test` ni ishga tushiring.
3. Supabaseʼdagi **Site URL** va **Redirect URLs** ni yangilang (2-qadam).
4. Supabase loyihasiga oʻz domeningizni ulasangiz, `admin.html` dagi CSP qatoridagi `connect-src` ga uni qoʻshing.

**404 sahifa** manzilni oʻzi aniqlaydi:
- `github.io` da — birinchi papka, yaʼni `/Dimensions/`;
- boshqa joyda — saytning ildizi `/`.

Shuning uchun u GitHub Pagesʼda ham, oʻz domeningizda ham, `python -m http.server` bilan lokal ishga tushirganda ham ishlaydi.

## 6. Ulashish rasmini qayta yaratish

`og-image.png` (1200×630) `tools/og-image.html` sahifasidan olingan. Rasmni oʻzgartirmoqchi boʻlsangiz:
1. Sahifani tahrirlang.
2. Uni lokal serverda oching: `http://localhost:8000/tools/og-image.html`.
3. Chrome DevToolsʼda qurilma oʻlchamini 1200×630 qiling va skrinshot oling: Ctrl + Shift + P → “Capture screenshot”.
4. Rasmni `og-image.png` nomi bilan saqlang.
