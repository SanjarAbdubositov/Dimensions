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

### Rang va qalinlik

Oxirgi oʻq qiymati (proyeksiyadan **oldin**, aylanishdan keyin) **ikki** belgi bilan koʻrsatiladi: rang (kobalt koʻk — uzoq, firuza — oʻrta, zafar — yaqin) va chiziq qalinligi/xiraligi (uzoq — ingichka va xira, yaqin — qalin va toʻq). Rangni ajrata olmaydigan odam qalinlikka qaraydi. Qiymat √n ga boʻlinadi, chunki giperkub uchining markazdan masofasi √n. Ranglar CSS oʻzgaruvchilaridan (`--w-far`, `--w-mid`, `--w-near`) oʻqiladi, shuning uchun qorongʻi rejimda oʻzi almashadi. Hisob — `depthStyle()` (`js/sim-render.js`).

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

`@supabase/supabase-js@2.117.2`, jsDelivrʼdan ESM sifatida, **aniq versiya** bilan (manzil bitta joyda: `js/supabase-lib.js`). `latest` ishlatilmaydi: yangi versiya kutilmaganda saytni buzib qoʻyishi mumkin. Versiya chiqqanidan kamida 2 hafta oʻtgan (2026-09-25). U faqat rozilik berilgandan keyin `import()` bilan yuklanadi.

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

## Sayqal va joylash (M5)

| Fayl | Vazifasi |
|---|---|
| `404.html` | Oʻzbekcha “sahifa topilmadi”. Saytning ildizini oʻzi aniqlaydi (pastga qarang) |
| `og-image.png` | Telegram va boshqa ilovalarda ulashish rasmi, 1200×630 |
| `tools/og-image.html` | Shu rasmni saytning oʻz `math4d.js` matematikasi bilan chizadigan sahifa |
| `apple-touch-icon.png` | Telefon bosh ekranidagi ikonka (180×180) |
| `.nojekyll` | GitHub Pages Jekyllʼni ishlatmasin (aks holda `.md` darslar HTMLʼga aylanib qoladi) |
| `tests/meta.test.js` | Har bir sahifada `lang`, `title`, `description`, ulashish teglari; 404 sahifa |
| `tests/preload.test.js` | `modulepreload` roʻyxatlari import grafigiga mosmi |

### Sahifa “sakramasligi” (CLS)

Lighthouse dars, test va simulyator sahifalarida CLS 0.16–0.18 koʻrsatdi. Kontent JavaScript bilan keyinroq chizilgani uchun footer avval tepada koʻrinib, keyin pastga “sakrardi”. Yechim:
- `main` va toʻliq simulyator kamida bir ekran balandligida;
- bosh sahifadagi kichik simulyator uchun joy oldindan ajratilgan (`#mini-sim`, oʻlchov asosida).

Endi hamma sahifada CLS = 0.

### Tezlik: `modulepreload` va darsni oldindan soʻrash

ES modullar zanjir boʻlib yuklanadi. Brauzer `lesson.js` ni olib, uning importlarini koʻradi, keyin ularning importlarini va hokazo. Sekin internetda har bir pogʻona taxminan 0.4 s kutish degani. Ikki yechim:

- **`<link rel="modulepreload">`** — sahifa oʻz modullarining hammasini oldindan aytadi va brauzer ularni bir vaqtda yuklaydi. Lekin bu faqat **asosiy kontenti JS bilan chiziladigan** sahifalarda foydali: dars, test, simulyator, admin. Oddiy matnli sahifalarda u CSS bilan raqobatlashib, matnni kechiktirdi (1.4 s → 1.6 s). Shuning uchun u yerda ishlatilmaydi. `tests/preload.test.js` roʻyxatlar importlarga mosligini tekshiradi: yangi modul qoʻshilsa, test eslatadi.
- **Dars matnini oldindan soʻrash.** `lesson.html` dagi kichik skript `?id=` boʻyicha `.md` va `.json` fayllarni `rel="preload"` bilan darhol soʻraydi. `lesson.js` keyin aynan shu fayllarni `fetch()` qiladi va brauzer ularni qayta yuklamaydi (bu tekshirilgan).

Natija: sekin 3G da (400 ms, 400 kbit/s, CPU ×4, gzip bilan) dars LCP 2.7 s, qolgan sahifalar 1.1–2.4 s.

### Simulyator faqat ekranda ishlaydi

`IntersectionObserver` simulyator koʻrinayotganini kuzatadi. Ekrandan tashqarida u chizmaydi va animatsiya sikli toʻxtaydi. Boshlangʻich holat `visible = false`: sahifa ochilganda ekrandan pastda turgan simulyator birinchi kadrni ham chizmaydi.

### 404 sahifa va `<base>`

GitHub Pages `404.html` ni istalgan notoʻgʻri manzilda koʻrsatadi, masalan `/Dimensions/a/b/c` da. U yerda nisbiy `css/style.css` notoʻgʻri papkadan qidirilardi. Shuning uchun `<head>` dagi kichik skript `<base>` tegini qoʻyadi:
- `github.io` da — birinchi papka (`/Dimensions/`);
- boshqa joyda — `/`.

Bu loyihadagi yagona “ildizni bilish kerak” boʻlgan joy. Qolgan hamma yoʻllar nisbiy.

### Ulashish teglari

`og:image` va `og:url` — **toʻliq manzil** (`https://…`), chunki Telegram nisbiy yoʻlni tushunmaydi. Bu loyihadagi yagona qatʼiy yozilgan manzil. U oʻzgarsa — `docs/DEPLOY.md`, 5-boʻlim.

### Accessibility

- Rang juftliklari yorugʻ va qorongʻi rejimda WCAG AA ga tekshirilgan: matn ≥ 4.5:1, interfeys elementlari ≥ 3:1.
- Fikr formasidagi yulduzlar holatni rang bilan emas, shakl bilan ham koʻrsatadi (★ / ☆).
- Admin jadvallari telefonda yon tomonga suriladi, shuning uchun ular klaviatura bilan ham fokuslanadi (`tabindex="0"`).
- axe-core barcha sahifalarda, ikkala rejimda va interaktiv holatlarda (banner, quiz natijasi, admin hisoboti) xatosiz oʻtdi.

## Dizayn: “Koshin”

Yoʻnalish: Samarqand koshinlarining ranglari (sir oq fon, lojuvard siyoh matn, kobalt, firuza, anor, zafar) va tesseraktning simmetrik soyasi. Bezak uchun fon naqshlari yoʻq: yagona “naqsh” — matematik hisoblangan rozetka.

| Fayl | Vazifasi |
|---|---|
| `fonts/literata.woff2` | Literata shrifti, faqat oʻzbek lotin matni uchun kerakli belgilar va 400–700 ogʻirlik (28 KB). Kursiv fayl yoʻq — brauzer oʻzi yasaydi. Litsenziya — `fonts/OFL.txt` |
| `tools/font-subset.py`, `tools/font-check.py` | Shriftni kichraytirish va kerakli harflar (ʻ ʼ, kirill, qozoq) borligini tekshirish |
| `css/home.css` | Faqat bosh sahifa: hero, “Soya va naqsh”, darslar roʻyxati |
| `js/rosette.js` | Rozetka-emblema: n-kubning Petrie tekisligidagi soyasi, SVG |
| `js/sim-intro.js` | Bosh sahifadagi kirish animatsiyasi (nuqta → tesserakt) |
| `js/sim-input.js` | Simulyatorni sichqoncha, barmoq va klaviatura bilan boshqarish |
| `js/progress-bar.js` | “Tugatilgan darslar: 2 / 6” va zafar rangli chiziq |

### Rozetka qanday hisoblanadi

n oʻlchamli kubning har bir uchi — n ta ±1 son. Har bir oʻqqa tekislikda bitta yoʻnalish beriladi: k-oʻq k·180°/n burchakka qaragan birlik vektorga tushadi (`projectPetrie`, `js/math4d.js`). Uchning soyasi shu vektorlarning ±1 marta yigʻindisi. Bu **Petrie** (Coxeter) tekisligiga proyeksiya: soyaning tashqi chegarasi muntazam 2n burchak boʻladi, chunki n ta turli yoʻnalishdagi kesmalar yigʻindisi doim 2n burchak beradi, yoʻnalishlar teng taqsimlangani uchun esa u muntazam. Tesseraktda (n = 4) bu sakkiz burchak, rasm 45° ga burilganda oʻzgarmaydi. Testlar (`tests/math4d.test.js`): `convexHull` bilan chegara n = 3, 4, 5 da 6, 8, 10 burchakli va muntazam ekani, 4-kub soyasi 45° burishda oʻzgarmasligi tekshiriladi.

Bosh sahifadagi darslar yonida (dars raqami + 1) oʻlchamli kub turadi: 1-darsda kvadrat, 6-darsda 7-kub. Bu dizayn qarori, dars mavzusi bilan bogʻliq emas — sahifada shunday yozilgan.

### Kirish animatsiyasi

Tesseraktning 16 ta uchi har bir oʻq boʻylab 0 dan 1 gacha “choʻziladi” (`introStretch`): hamma oʻq 0 — nuqta, birinchisi 1 — kesma va hokazo. Bitta kod yoʻli, alohida shakl yoʻq: oxirida choʻzish olib tashlanadi va oddiy jonli simulyator qoladi. ≈ 3.5 s, “Oʻtkazib yuborish” tugmasi bor, sessiyada bir marta (`sessionStorage`). `prefers-reduced-motion` yoqilgan boʻlsa animatsiya umuman boʻlmaydi — darhol yakuniy holat. Foydalanuvchi shaklga tegsa, animatsiya darhol tugaydi.

### Chiroq (faqat 4-dars)

`:::simulator … controls=…,lamp:::` — suriladigan chiroq (oddiy `<input type="range">`, shuning uchun barmoq, sichqoncha va strelkalar bilan ishlaydi). U `d` ni oʻzgartiradi, ostida eng yaqin va eng uzoq uch uchun `d / (d − w)` jonli hisoblanadi. Koʻrsatilgan `d` — uch koordinatalari ±1 boʻlgan birliklarda (4D da radius 2, shuning uchun d > 2). Formula canvas ekrandan chiqib ketgan boʻlsa ham yangilanadi.

### Oʻqish va tipografiya

- Matn 18px, qator oraligʻi 1.6, sarlavhalar taxminan 1.25 shkalada. Matn kengligi `28em`: oʻlchovda qator ≤ 64 belgi (talab ≤ 68).
- Shrift — bitta oila (Literata) + kod uchun tizim monospace. `font-display: swap`; yuklanguncha Noto Serif / Georgia Literata oʻlchamiga moslanadi (`size-adjust`), shuning uchun almashganda matn sakramaydi.
- Formulalar, jadvallar va kod telefonda oʻz ichida suriladi. Sigʻmasa — Tab bilan tanlanadigan boʻladi (`watchScrollables`, `js/widgets.js`).
- “Chuqurroq” bloklari: `:::chuqurroq Sarlavha` … `:::` → `<details>`. Formulalar shu ichida, asosiy matn 13 yoshli tushunadigan tilda.

### Harakat qoidalari

Faqat `transform` va `opacity`. Oʻz-oʻzidan harakat — faqat bosh sahifadagi bitta animatsiya. Qolgani foydalanuvchi biror narsa qilganda: tugma bosilganda choʻkishi, test javobi chiqishi, dars tugaganda progress chizigʻining toʻlishi. Oltin (zafar) rang faqat progress va “yaqin” uchun.

## Seminarlar (admin panel)

Admin panelda “Seminarlar” boʻlimi: seminar nomini yozasiz (masalan, “Synergy 9-A”), u `SYNERGY-9-A` kodiga aylanadi va havolalar chiqadi. Asosiysi — birinchisi (seminar boshidagi test); oxirgi test va bosh sahifa havolalari zaxira uchun.

**Bitta QR qoidasi.** Telefonda har bir brauzerning (Telegram ichidagi brauzer, QR skaner, Chrome, maxfiy oyna) xotirasi alohida. Oʻquvchi ikki testni ikki xil yoʻl bilan ochsa, sayt uni ikki qurilma deb biladi va oldin/keyin juftlanmaydi. Shuning uchun oʻquvchi faqat bitta QR bilan kiradi; boshidagi testdan keyin har sahifada “Oxiridagi testni topshirish” tugmasi chiqadi (`js/seminar-bar.js`, 24 soat davomida) va oxirgi test oʻsha brauzerda ochiladi. Oʻquvchi hech narsa yozmaydi. Telefonlarni “taniydigan” boshqa usullar (IP, qurilma modeli) ataylab ishlatilmaydi — maxfiylik sahifasidagi vaʼdaga zid.

**Rozilik.** “Roziman” — `localStorage`da, boshqa soʻralmaydi. “Yoʻq, rahmat” — faqat `sessionStorage`da: shu tashrif davomida soʻralmaydi, keyingi kirishda yana soʻraladi (`resolveConsent`, `js/analytics-core.js`). Har bir havolani nusxalash, QR-kodini koʻrish va PNG qilib yuklab olish mumkin. “Natijalarni koʻrish” — filtrni shu kodga qoʻyib, hisobotni yuklaydi.

| Fayl | Vazifasi |
|---|---|
| `js/seminar.js` | Sof funksiyalar: nomdan kod (`?g=` qoidasi bilan bir xil), havolalar, roʻyxatni birlashtirish, QR matritsasi |
| `js/admin-seminar.js` | Boʻlim interfeysi: forma, roʻyxat, nusxalash, QR (SVG) va PNG yuklab olish |
| `js/seminar-bar.js` | Seminar paytida sarlavha ostidagi “Oxiridagi testni topshirish” tugmasi |
| `js/vendor/qrcode.js` | QR-kod kutubxonasi: qrcode-generator 2.0.4 (Kazuhiko Arase, MIT), oʻzgartirilmagan. Tarmoqqa chiqmaydi |

**Nega bazaga yozilmaydi?** Admin panel bazani faqat oʻqiydi — bu xavfsizlik qoidasi. Shuning uchun yaratilgan seminarlar roʻyxati shu brauzerning `localStorage`ʼida saqlanadi. Boshqa kompyuterdan kirsangiz, roʻyxat boʻsh boʻladi, lekin natijasi yigʻilgan har bir kod roʻyxatga baribir oʻzi qoʻshiladi (maʼlumotdan olinadi). Roʻyxatdan olib tashlash yigʻilgan natijalarni oʻchirmaydi.

QR-kodlar testda tuzilishi boʻyicha (`tests/seminar.test.js`), qoʻlda esa jsQR dekoderi bilan qayta oʻqib tekshirilgan.
