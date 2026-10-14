# Arxitektura

Bu hujjat loyihaning tuzilishini va har bir muhim qaror nega shunday qilinganini tushuntiradi. U har bosqichda (M1–M5) toʻldirib boriladi.

## Umumiy gʻoya

- **Framework yoʻq, build qadam yoʻq.** Sayt oddiy HTML + CSS + JavaScript (ES modules). GitHub Pages fayllarni qanday boʻlsa shunday beradi, brauzer ularni toʻgʻridan-toʻgʻri ishlatadi. Har bir faylni ochib oʻqish va tushuntirish mumkin.
- **Matematika va interfeys ajratilgan.** `js/math4d.js` faqat sonlar bilan ishlaydi va DOMʼni (sahifani) bilmaydi. Shuning uchun uni Nodeʼda test qilish mumkin, brauzer kerak emas.
- **Fayllar kichik** (har biri ~200 qatordan kam), har bir funksiya ustida bir qatorlik izoh bor.

## Fayllar (M1)

| Fayl | Vazifasi |
|---|---|
| `index.html` | Bosh sahifa: loyiha nima, kichik simulyator, darslar roʻyxati |
| `simulator.html` | Toʻliq simulyator sahifasi |
| `css/style.css` | Butun sayt uslubi. Ranglar CSS oʻzgaruvchilarida, qorongʻi rejim `prefers-color-scheme` orqali |
| `js/math4d.js` | Sof matematika: uchlar, qirralar, aylanish matritsalari, proyeksiya |
| `js/simulator.js` | `createSimulator()` komponenti: holat, animatsiya sikli, sudrash, klaviatura |
| `js/sim-controls.js` | Tugmalar, slayderlar va matnlarni yaratadi (hisob-kitobsiz) |
| `js/sim-render.js` | Proyeksiya qilingan nuqtalarni canvasʼga chizadi, chuqurlik rangini hisoblaydi |
| `js/sim-angles.js` | Burchaklar uchun sof funksiyalar: −180..180 ga qaytarish, boshlangʻich koʻrinish, avto-aylanish tekisliklari |
| `tests/math4d.test.js` | Matematika testlari (`node --test`) |
| `tests/orthography.test.js` | Imlo testi: oʻ/gʻ har joyda U+02BB (ʻ) bilan yozilganmi |
| `package.json` | Faqat ikki narsa uchun: `"type": "module"` (Node `import`ni tushunishi uchun) va `npm test` buyrugʻi. Hech qanday kutubxona oʻrnatilmaydi |

## Simulyator qanday ishlaydi

Har bir kadrda quyidagi zanjir bajariladi:

```
uchlar (±1, ±1, …)  →  aylanish matritsasi  →  proyeksiya n → 2  →  miqyos  →  canvas
     math4d.js             math4d.js              math4d.js        simulator.js  sim-render.js
```

1. **Uchlar.** `makeVertices(n)` 0 dan 2ⁿ−1 gacha sonlarni ikkilik koʻrinishda oʻqiydi: i-bit 1 boʻlsa i-koordinata +1, aks holda −1. Shunday qilib barcha 2ⁿ ta kombinatsiya hosil boʻladi.
2. **Qirralar.** `makeEdges` har bir juftlikni tekshiradi: faqat bitta koordinatada farq qilsa — qirra. 7D uchun 128 ta uch → ~8000 juftlik, bu bir marta hisoblanadi va tez.
3. **Aylanish.** Har bir tekislik (XY, XZ, XW, …) uchun burchak saqlanadi. `composeRotations` ularni `listPlanes` tartibida ketma-ket koʻpaytiradi. Tartib muhim (3-darsdagi “XY va XW” misoli) — shuning uchun tartib doim bir xil.
4. **Proyeksiya.** Pastga qara.
5. **Miqyos.** Shakl canvasʼning 85% qismini egallashi uchun maqsadli miqyos hisoblanadi, lekin joriy miqyos unga **asta-sekin** yaqinlashadi (har kadrda farqning bir qismi). Shuning uchun oʻlcham almashganda shakl sakramaydi.

### Bitta holat manbai: burchaklar

Slayderlar, avto-aylanish, sudrash va klaviatura — hammasi bitta narsani oʻzgartiradi: `state.angles` (har bir tekislik burchagi, gradusda). Chizish faqat shu burchaklardan foydalanadi. Bu oddiy va tushuntirish oson: “slayder qiymati = haqiqiy burchak”.

- **3D burish** (sudrash): gorizontal → XZ, vertikal → YZ.
- **4D burish** (yoki Shift): gorizontal → X–oxirgi oʻq, vertikal → Y–oxirgi oʻq.

### Perspektiv proyeksiya va kamera masofasi

Bitta qadam formulasi darsdagidek: `(x, y, z) · d / (d − w)`. U oxirgi oʻqni “bosib”, nuqtani bir oʻlcham pastga tushiradi. 7D → 2D uchun bu 5 marta takrorlanadi.

**Muammo:** har qadamdan keyin yaqin nuqtalar kattalashadi. Agar hamma qadamda bir xil `d` olinsa, yuqori oʻlchamlarda nuqta kameradan oʻtib ketadi (d − w ≤ 0) va formula buziladi.

**Yechim:** `projectPerspective(points, distance)` da `distance` — shakl radiusiga **nisbatan** masofa. Har qadamda radius qayta oʻlchanadi va `d = distance × radius`. Masalan, `distance = 2.5` — “kamera eng uzoq uchdan 2.5 baravar uzoqda”. Har bir nuqtaning |w| qiymati radiusdan katta boʻlolmaydi, shuning uchun `distance > 1` boʻlsa kamera hech qachon shakl ichida qolmaydi. `distance ≤ 1` boʻlsa funksiya xato beradi.

### Rang

Rang oxirgi oʻq qiymatini bildiradi (proyeksiyadan **oldin**, aylanishdan keyin): koʻk — uzoq (w manfiy), qizil — yaqin (w musbat). Qiymat √n ga boʻlinadi, chunki giperkub uchining markazdan masofasi √n.

### Darslarga qoʻshish

`createSimulator(container, { dims, controls })`:

- `dims` — qaysi oʻlchamlar tugmasi chiqadi, masalan `[2, 3, 4]`.
- `controls` — qaysi boshqaruvlar chiqadi: `dims`, `projection`, `drag`, `auto`, `size`, `sliders`, `reset`. Berilmasa — hammasi.
- Foydalanuvchi birinchi marta oʻlcham almashtirsa yoki shaklni sudrasa, simulyator `simulator:use` DOM hodisasini chiqaradi. Statistika (`analytics.js`) shu hodisani tinglaydi — simulyatorning oʻzi statistika haqida hech narsa bilmaydi.

### Telefon va tezlik

- Animatsiya kerak boʻlmaganda (avto-aylanish oʻchiq, sudrash yoʻq, miqyos joyiga kelgan) sikl toʻxtaydi — batareya tejaladi.
- Simulyator ekrandan tashqarida boʻlsa (`IntersectionObserver`), chizilmaydi. Bu darsda bir nechta simulyator boʻlganda muhim.
- Canvas `devicePixelRatio` bilan chiziladi, shuning uchun telefon ekranida xira emas.
- `touch-action: none` — barmoq bilan sudraganda sahifa siljimaydi.
- `prefers-reduced-motion` yoqilgan boʻlsa, avto-aylanish boshida oʻchiq.

### Accessibility

- Canvasʼda `tabindex="0"` va `aria-label` (shakl nomi, uchlar va qirralar soni). Strelkalar bilan aylantirish mumkin.
- Tanlov tugmalari `aria-pressed` bilan, slayderlar `<label>` bilan bogʻlangan.
- Tugmalar balandligi kamida 44 px (barmoq bilan bosish oson).

## Imlo

Oʻ va gʻ uchun faqat U+02BB (ʻ), tutuq belgisi uchun U+02BC (ʼ, masalan “maʼlumot”). `tests/orthography.test.js` HTML, JS, MD va JSON fayllarda `o'`, `o’`, `oʼ` kabi notoʻgʻri variantlarni qidiradi.

## Darslar va testlar (M2)

| Fayl | Vazifasi |
|---|---|
| `lesson.html` + `js/lesson.js` | Dars sahifasi: `lesson.html?id=N` |
| `js/markdown.js` | Oʻzimizning kichik Markdown parser + frontmatter oʻquvchi (sof funksiyalar) |
| `js/widgets.js` | `:::simulator:::` va `:::predict:::` direktivalarini jonlantiradi |
| `js/quiz.js` | Test tuzilmasini tekshirish va baholash (sof funksiyalar) |
| `js/quiz-ui.js` | Testni sahifada chizish, natija va tushuntirishni koʻrsatish |
| `js/progress.js` | Progress: boshlangan/tugatilgan darslar, test natijalari (`localStorage`) |
| `js/lessons.js` | Darslar roʻyxati (id, sarlavha) — yagona manba |
| `js/home.js` | Bosh sahifa: kichik simulyator va dars holatlari |
| `test.html` + `js/prepost.js` | Seminar uchun oldin/keyin testi (`?type=pre` / `?type=post`) |
| `js/dom.js` | `el()` — element yaratish yordamchisi (simulyator va darslar uchun umumiy) |
| `glossary.html`, `about.html`, `privacy.html` | Lugʻat, loyiha haqida, maxfiylik |
| `css/content.css` | Dars, test va matnli sahifalar uslubi |
| `content/lessons/N.md` | Dars matnlari (frontmatter + Markdown) |
| `content/quizzes/N.json`, `content/tests/prepost.json` | Testlar |

### Dars dvigateli qanday ishlaydi

1. `lesson.js` URLʼdan `id` ni oladi va `js/lessons.js` roʻyxatida borligini tekshiradi.
2. `content/lessons/N.md` ni `fetch` bilan yuklaydi. `parseFrontmatter` boshidagi `---` bloki ichidan `title`, `draft`, `minutes` ni oʻqiydi. `draft: true` boʻlsa, tepada sariq “Qoralama” belgisi chiqadi.
3. `renderMarkdown` matnni HTMLʼga aylantiradi. `:::simulator dims=2,3,4 controls=dims:::` kabi qatorlar boʻsh `<div class="directive" data-…>` boʻlib chiqadi. Keyin `widgets.js` ularni topib, `createSimulator()` yoki bashorat elementiga aylantiradi.
4. Pastda `content/quizzes/N.json` testi chiziladi. Dars ochilganda `markStarted`, test topshirilganda `markCompleted` chaqiriladi. Bosh sahifa shu maʼlumotdan “Boshlangan” / “Tugatilgan · 4/5” belgisini chiqaradi.

### Nega `marked` emas, oʻzimizning parser?

- Bizga Markdownʼning kichik qismi kerak: sarlavha, paragraf, roʻyxat, jadval, iqtibos, kod, qalin/kursiv, havola. Bu ~140 qatorda yoziladi va har bir qatorini tushuntirish mumkin.
- `:::direktiva:::` sintaksisi `marked`da yoʻq — baribir qoʻshimcha kod yozish kerak boʻlardi.
- Tashqi kutubxona yoʻq: tezroq yuklanadi, versiyani kuzatish shart emas.
- Xavfsizlik: avval hamma matn `escapeHtml` qilinadi, keyin faqat oʻzimiz bilgan teglar qoʻshiladi. Havolalar faqat `http(s)`, nisbiy yoʻl yoki `#` boʻlishi mumkin (`javascript:` oʻtmaydi). Testlari: `tests/markdown.test.js`.

### Test (quiz) qanday tuzilgan

```json
{ "lesson": 1, "draft": true,
  "questions": [ { "q": "Savol", "options": ["A", "B", "C"], "answer": 1, "explain": "Nega B toʻgʻri" } ] }
```

`answer` — toʻgʻri variantning indeksi (0 dan boshlanadi). `validateQuiz` tuzilmani tekshiradi, `gradeQuiz(quiz, answers)` esa natijani qaytaradi va hech narsani oʻzgartirmaydi — shuning uchun oson test qilinadi.

**Oldin/keyin testi:** savollar ikkalasida bir xil. `?type=pre` da toʻgʻri javoblar **koʻrsatilmaydi** — aks holda oʻquvchi javoblarni eslab qolib, seminar oxiridagi test oʻrganilgan bilimni emas, xotirani oʻlchab qoladi. `?type=post` da tushuntirishlar va shu qurilmadagi “oldin” natijasi bilan taqqoslash chiqadi. Ikkala testda ham “Qayta urinish” tugmasi yoʻq: aks holda oʻquvchi toʻgʻri javoblarni koʻrib, qayta topshirardi va seminar natijasi soxta oshib ketardi. Sahifani yangilab qayta topshirish baribir mumkin, shuning uchun admin panel (M4) har bir qurilmaning **birinchi** natijasini hisoblashi kerak.

### Progress (`localStorage`)

Kalit: `tortinchi-olchov.progress.v1`. Agar `localStorage` ishlamasa (maxfiy rejim), xotiradagi oʻrinbosar ishlatiladi — sayt xato bermaydi, faqat progress sahifa yopilganda unutiladi. Hech narsa serverga yuborilmaydi (M3 gacha).

### Kontent testlari

`tests/content.test.js` tekshiradi: har bir darsda frontmatter bor va sarlavha `lessons.js` hamda `index.html` bilan bir xil; direktivalar toʻgʻri; qoralama darslar 600–900 soʻz; har bir test JSON toʻgʻri tuzilgan va `answer` variantlar ichida.

**Eslatma:** fayl nomi `test-` bilan boshlansa, `node --test` uni test deb ishga tushiradi. Shuning uchun oldin/keyin testi skripti `js/prepost.js` deb nomlangan.

## Anonim statistika (M3)

| Fayl | Vazifasi |
|---|---|
| `supabase/schema.sql` | Jadvallar, CHECK cheklovlari, GRANT, `is_admin()`, RLS siyosatlari |
| `supabase/rls-test.sql` | Xavfsizlik testi: SQL Editorʼda `anon`, oddiy foydalanuvchi va admin sifatida har bir qoidani tekshiradi |
| `js/analytics-core.js` | Sof funksiyalar: seminar kodi, rozilik mantigʻi, qator tuzish, taqiqlangan kalitni aniqlash |
| `js/analytics.js` | Brauzer qismi: IDʼlar, `track()`, `sendFeedback()`, Supabase klientini yuklash |
| `js/consent-ui.js` | Rozilik banneri va “Statistika sozlamalari” oynasi |
| `js/feedback.js` | Dars oxiridagi fikr formasi (1–5 yulduz, izoh) |
| `js/config.js` | Supabase URL va publishable/anon kalit (boʻsh = statistika oʻchiq) |
| `docs/SETUP.md` | Supabaseʼni qadamma-qadam sozlash va xavfsizlik tekshiruvi |

### Maʼlumot qanday oqadi

```
sahifa → track('quiz_submit', {...}) → canSend? → buildEvent (tekshiruv) → Supabase insert
                                         │ yoʻq                │ notoʻgʻri
                                         └→ hech narsa          └→ hech narsa
```

1. **Rozilik birinchi.** `canSend` faqat uchta shart bajarilganda `true` beradi: `config.js` toʻldirilgan, foydalanuvchi “Roziman” degan va qurilma admin tomonidan chiqarilmagan. Aks holda Supabase kutubxonasi **umuman yuklanmaydi** — tarmoqqa birorta ham soʻrov ketmaydi.
2. **IDʼlar rozilikdan keyin yaratiladi.** `anon_id` — `crypto.randomUUID()`, `localStorage`da. `session_id` — `sessionStorage`da (oyna yopilganda yoʻqoladi). “Yoʻq, rahmat” bosilsa, `anon_id` oʻchiriladi.
3. **Ikki qavatli tekshiruv.** `buildEvent` serverdagi CHECK qoidalarini brauzerda takrorlaydi va notoʻgʻri qatorni umuman yubormaydi. Server esa baribir oʻzi ham tekshiradi — brauzerga ishonib boʻlmaydi (kimdir kodni oʻzgartirishi mumkin).
4. **Hech qachon xato tashlamaydi.** `track()` hamma narsani `try/catch` ichida bajaradi va natijani kutmaydi. Internet uzilsa ham, Supabase pauzada boʻlsa ham sayt ishlayveradi.

### Simulyator va statistika ajratilgan

`simulator.js` statistika haqida hech narsa bilmaydi. Foydalanuvchi oʻlchamni oʻzgartirsa yoki shaklni sudrasa, u faqat `simulator:use` DOM hodisasini chiqaradi. `analytics.js` esa `document` da shu hodisani tinglaydi va sessiyada bir marta `simulator_use` yuboradi. Natijada simulyatorni statistikasiz boshqa loyihada ham ishlatish mumkin.

### `lesson_complete` qachon yuboriladi

Taʼrif: “dars oxirigacha oʻqildi **va** test topshirildi”. Dars matni oxiriga koʻrinmas belgi (`.lesson-end`) qoʻyiladi va `IntersectionObserver` u ekranda paydo boʻlganini kuzatadi. Test topshirilganda belgi koʻringan boʻlsa — `lesson_complete` (sessiyada bir marta).

### RLS va huquqlar — qisqacha

- **GRANT** — rol qaysi jadval va **ustunlarga** umuman tegina olishi. Mijoz faqat kerakli ustunlarga INSERT qila oladi. `id` va `created_at` ga yoza olmaydi, shuning uchun soxta vaqt yuborib boʻlmaydi.
- **RLS** — har bir **qator** uchun qoida. INSERT hammaga ochiq, SELECT faqat `is_admin()` true boʻlganda. UPDATE va DELETE uchun na GRANT, na siyosat bor.
- **`is_admin()`** — `security definer` (egasi huquqi bilan ishlaydi), shuning uchun `admins` jadvalini oʻzi oʻqiy oladi. Foydalanuvchiga esa bu jadvalga hech qanday huquq berilmagan. `search_path = ''` — funksiyani soxta jadval bilan aldashning oldini oladi.
- **CHECK** — maʼlumot shakli: hodisa turi roʻyxatdan, dars 1–6, ball 0..maks, seminar kodi faqat `[A-Za-z0-9-]` (bu maydonga ism yoki telefon yozib boʻlmaydi), meta kichik.

### Supabase kutubxonasi

`@supabase/supabase-js@2.117.2`, jsDelivrʼdan ESM sifatida, **aniq versiya** bilan. `latest` ishlatilmaydi: yangi versiya kutilmaganda saytni buzib qoʻyishi mumkin. Versiya chiqqanidan kamida 2 hafta oʻtgan (2026-09-25). U faqat rozilik berilgandan keyin `import()` bilan yuklanadi.

Qatorlar `return=minimal` rejimida yuboriladi (supabase-jsʼda `.insert()` dan keyin `.select()` yoʻq). Shuning uchun anon rolga SELECT huquqi kerak emas.

## Admin panel (M4)

| Fayl | Vazifasi |
|---|---|
| `admin.html` | Panel sahifasi: `noindex`, qatʼiy CSP, ochiq sahifalardan havola yoʻq |
| `js/admin.js` | Kirish → `is_admin()` → maʼlumot → hisobot; filtrlar, CSV, “qurilmani chiqar” |
| `js/admin-data.js` | Supabase: kirish, admin tekshiruvi, sahifalab FAQAT oʻqish |
| `js/admin-view.js` | Hisobotni chizish (faqat `textContent`, `innerHTML` yoʻq) |
| `js/stats.js` | Hisob-kitoblar — sof funksiyalar (voronka, oʻrtachalar, oldin/keyin, n < 5) |
| `js/chart.js` | Kunlik grafik: SVG, kutubxonasiz; geometriya — sof funksiya |
| `js/csv.js` | CSV: ekranlashtirish va CSV injection himoyasi |
| `js/supabase-lib.js` | Supabase kutubxonasi manzili (aniq versiya) — statistika va panel uchun umumiy |
| `js/device.js` | “Bu qurilmani statistikadan chiqar” bayrogʻi |
| `css/admin.css` | Panel uslubi (grafik rangi yorugʻ/qorongʻi rejim uchun alohida tekshirilgan) |

### Himoya qatlamlari

1. **Server (asosiy).** RLS: `events` va `feedback` ni faqat `is_admin()` true boʻlgan foydalanuvchi oʻqiy oladi. Panelning kodi oʻzgartirilsa ham, admin boʻlmagan odam boʻsh roʻyxat oladi. Yozish, oʻzgartirish va oʻchirish hech kimga ruxsat etilmagan.
2. **Panel.** Kirgandan keyin avval `rpc('is_admin')` chaqiriladi. `false` boʻlsa, “Ruxsat yoʻq” chiqadi va jadvallarga **birorta ham soʻrov yuborilmaydi**.
3. **Brauzer.** Content-Security-Policy faqat shu saytdan va jsDelivrʼdan skript yuklashga, faqat `*.supabase.co` ga ulanishga ruxsat beradi. XSS boʻlib qolsa ham, begona skript ishlamaydi va maʼlumot begona serverga keta olmaydi.
4. **Sessiya `sessionStorage`da.** Brauzer oynasi yopilsa, avtomatik chiqiladi — maktabdagi umumiy kompyuter uchun xavfsizroq.

### XSS va `textContent`

Izohlar va seminar kodlarini **foydalanuvchilar** yozadi. Agar ular `innerHTML` bilan sahifaga qoʻyilsa, `<img src=x onerror="…">` kabi matn **kod sifatida** ishga tushib, admin sessiyasini oʻgʻirlashi mumkin edi. `textContent` esa har qanday matnni faqat harf sifatida koʻrsatadi. `tests/admin.test.js` admin fayllarida `innerHTML` yoʻqligini tekshiradi.

### Sahifalab yuklash

Supabase bir soʻrovda koʻpi bilan 1000 qator beradi. `fetchAll` `range(0, 999)`, `range(1000, 1999)` … soʻraydi va **boʻsh sahifa** kelganda toʻxtaydi. Agar loyiha sozlamasida chegara 1000 dan kichik boʻlsa ham, maʼlumot yoʻqolmaydi. Tartib `id` boʻyicha: yuklash paytida yangi qator qoʻshilsa ham, sahifalar siljib ketmaydi.

### Hisob-kitob qoidalari (stats.js)

- Hammasi **qurilmalar** (`anon_id`) boʻyicha sanaladi, odamlar boʻyicha emas.
- Test natijalarida har qurilmaning **birinchi** urinishi olinadi: qayta urinish yoki sahifani yangilab qayta topshirish natijani oshirib yubormaydi.
- Voronkada “boshlaganlar” = `lesson_start` **yoki** `lesson_complete` yuborganlar. Rozilik dars oʻrtasida berilgan boʻlsa, `lesson_start` yuborilmay qolishi mumkin. Shuning uchun foiz hech qachon 100 dan oshmaydi.
- n < 5 boʻlsa, “Maʼlumot kam — xulosa chiqarish uchun yetarli emas” ogohlantirishi chiqadi.
- `docs/SETUP.md` (8.2) dagi SQL soʻrovlari xuddi shu qoidalarni takrorlaydi. Ular lokal PostgreSQLʼda `stats.js` bilan bir xil natija berishi tekshirilgan.

## Testlar

Hammasi `node --test` (yoki `npm test`) bilan ishga tushadi, internet kerak emas.

| Fayl | Nimani tekshiradi |
|---|---|
| `tests/math4d.test.js` | Uchlar va qirralar soni, aylanish matritsalari, proyeksiya, simulyator burchaklari |
| `tests/markdown.test.js` | Markdown parser, frontmatter, direktivalar, xavfsiz havolalar |
| `tests/quiz.test.js` | Test baholash va progress (`localStorage`) |
| `tests/content.test.js` | Darslar va testlar tuzilmasi, qoralama soʻz soni |
| `tests/analytics.test.js` | Seminar kodi, rozilik mantigʻi, hodisa qatorini tuzish, taqiqlangan kalitlar, `schema.sql` qoidalari |
| `tests/stats.test.js` | Admin hisob-kitoblari (voronka, oʻrtachalar, oldin/keyin, n < 5) va CSV |
| `tests/admin.test.js` | Admin panel xavfsizligi (noindex, CSP, `innerHTML` yoʻqligi, faqat oʻqish), sana filtri, grafik |
| `tests/orthography.test.js` | Imlo: oʻ/gʻ uchun U+02BB, tutuq belgisi uchun U+02BC |

`supabase/rls-test.sql` — alohida, Supabase SQL Editorʼda ishga tushiriladigan xavfsizlik testi (`docs/SETUP.md`, 6.1).
