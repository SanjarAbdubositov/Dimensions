# Arxitektura

Bu hujjat loyihaning tuzilishini va har bir muhim qaror nega shunday qilinganini tushuntiradi. U har bosqichda (M1–M5) toʻldirib boriladi.

## Umumiy gʻoya

- **Framework yoʻq, build qadam yoʻq.** Sayt oddiy HTML + CSS + JavaScript (ES modules). GitHub Pages fayllarni qanday boʻlsa shunday beradi, brauzer ularni toʻgʻridan-toʻgʻri ishlatadi. Har bir faylni ochib oʻqish va tushuntirish mumkin.
- **Matematika va interfeys ajratilgan.** `js/math4d.js` faqat sonlar bilan ishlaydi va DOM'ni (sahifani) bilmaydi. Shuning uchun uni Node'da test qilish mumkin, brauzer kerak emas.
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
| `js/sim-render.js` | Proyeksiya qilingan nuqtalarni canvas'ga chizadi, chuqurlik rangini hisoblaydi |
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
5. **Miqyos.** Shakl canvas'ning 85% qismini egallashi uchun maqsadli miqyos hisoblanadi, lekin joriy miqyos unga **asta-sekin** yaqinlashadi (har kadrda farqning bir qismi). Shuning uchun oʻlcham almashganda shakl sakramaydi.

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

`createSimulator(container, { dims, controls, onUse })`:

- `dims` — qaysi oʻlchamlar tugmasi chiqadi, masalan `[2, 3, 4]`.
- `controls` — qaysi boshqaruvlar chiqadi: `dims`, `projection`, `drag`, `auto`, `size`, `sliders`, `reset`. Berilmasa — hammasi.
- `onUse` — foydalanuvchi birinchi marta oʻlcham almashtirsa yoki sudrasa chaqiriladi (M3 da analytics uchun).

### Telefon va tezlik

- Animatsiya kerak boʻlmaganda (avto-aylanish oʻchiq, sudrash yoʻq, miqyos joyiga kelgan) sikl toʻxtaydi — batareya tejaladi.
- Simulyator ekrandan tashqarida boʻlsa (`IntersectionObserver`), chizilmaydi. Bu darsda bir nechta simulyator boʻlganda muhim.
- Canvas `devicePixelRatio` bilan chiziladi, shuning uchun telefon ekranida xira emas.
- `touch-action: none` — barmoq bilan sudraganda sahifa siljimaydi.
- `prefers-reduced-motion` yoqilgan boʻlsa, avto-aylanish boshida oʻchiq.

### Accessibility

- Canvas'da `tabindex="0"` va `aria-label` (shakl nomi, uchlar va qirralar soni). Strelkalar bilan aylantirish mumkin.
- Tanlov tugmalari `aria-pressed` bilan, slayderlar `<label>` bilan bogʻlangan.
- Tugmalar balandligi kamida 44 px (barmoq bilan bosish oson).

## Imlo

Oʻ va gʻ uchun faqat U+02BB (ʻ), tutuq belgisi uchun U+02BC (ʼ, masalan “maʼlumot”). `tests/orthography.test.js` HTML, JS, MD va JSON fayllarda `o'`, `o’`, `oʼ` kabi notoʻgʻri variantlarni qidiradi.
