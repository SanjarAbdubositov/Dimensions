# Tekshirish kerak

Darslar va testlarni muallif oʻzi qayta yozgan (2026-10-25). Tarixiy faktlar 2026-10-26 da internetdagi manbalar bilan tekshirildi. Topilgan xatolar tuzatildi (pastda, “Tuzatildi” boʻlimida). Tekshirilgan bandlar `[x]`. Qolgan `[ ]` bandlarni faqat siz (yoki kattalar) bajara olasiz.

**Belgilar:** ✅ — manba bilan tekshirilgan; 🧮 — hisoblab tekshirilgan (Python yoki matematika).

## 1. Muhim — seminar oʻtkazishdan oldin

- [ ] **Qonunchilik.** Ikkilamchi manbalarga koʻra: OʻRQ-1125 (2026) qonunidan keyin maʼlumotni Oʻzbekistonda saqlash majburiyati faqat biometrik, genetik va aloqa foydalanuvchilari maʼlumotiga qoladi; Vazirlar Mahkamasining 415-qarori roʻyxatida Koreya Respublikasi bor. Bu yerdan lex.uz ochilmadi — akangiz (huquqshunos) tasdiqlasa, belgilang.
- [ ] **Voyaga yetmaganlar roziligi.** Seminarda oʻquvchining oʻz “Roziman” tugmasi yetarlimi yoki ota-ona/maktab roziligi ham kerakmi — oʻqituvchi va akangiz bilan kelishing.
- [ ] **Admin panel va statistika jonli sinovi** (`SETUP.md`, 8-boʻlim):
  - saytda “Roziman” → bitta darsni oching → Supabase **Table Editor → events** da yangi qatorlar chiqadimi;
  - `admin.html` ga admin bilan kiring → raqamlar SQL bilan bir xilmi; admin boʻlmagan foydalanuvchi → “Ruxsat yoʻq”;
  - brauzer konsolida “Content Security Policy” xatosi chiqmayaptimi.
- [ ] **Embedding Projector qadamlari** (6-dars). Manbalarga koʻra sayt va undagi maʼlumot (Word2Vec 10K: 10 000 soʻz, 200 oʻlcham, PCA va t-SNE, yaqin qoʻshnilar roʻyxati) darsdagidek. Lekin bu yerdan saytni ochib boʻlmadi: qidiruv darchasi oʻngda, proyeksiya usullari chapda ekanini bir marta koʻrib qoʻying.

## 2. Darslardagi faktlar

### 1-dars
- [x] ✅ *Flatland* — 1884-yil, muallifi Edwin A. Abbott.
- [x] ✅ Carl Sagan olma va Yassi dunyo misolini *Cosmos* ning 10-qismida (“The Edge of Forever”, 1980) koʻrsatgan; shu qismda tesserakt ham bor.
- [x] ✅ Eynshteyn 1905-yildagi “Harakatlanuvchi jismlar elektrodinamikasi” maqolasini ikki postulatdan boshlagan; vaqt sekinlashuvi shu maqolaning 4-boʻlimida.
- [x] ✅ Fazo-vaqt gʻoyasi — Hermann Minkowski, 1908-yil. Oʻzbekcha “German Minkovskiy” — rus manbalaridagi “Герман Минковский” shaklidan, oʻzbek adabiyotida shunday yoziladi.
- [x] ✅ Hafele–Keating, 1971-yil: 4 ta seziy soati oddiy yoʻlovchi samolyotlarida Yer atrofida sharqqa va gʻarbga uchgan. Bashorat: −40 ± 23 ns va +275 ± 21 ns; oʻlchangan: −59 ± 10 ns va +273 ± 7 ns (nanosekund — sekundning milliarddan biri).

### 3-dars
- [x] ✅ Qoʻsh aylanish (ikki mustaqil tekislikda bir vaqtda) faqat 4 va undan koʻp oʻlchamda boʻladi. Ikkala burchak teng boʻlgandagina “Klifford aylanishi” deyiladi — matn shunga moslab tuzatildi.
- [x] 🧮 Kitob tajribasi: ikki xil oʻqdagi 90° burishlar tartibi almashsa, natija boshqacha boʻladi.

### 5-dars
- [x] ✅ Salvador Dalí, *Crucifixion (Corpus Hypercubus)*, 1954-yil. Xoch — tesserakt yoyilmasi: 4 ta kub ustun, yana 4 tasi yuqoridan ikkinchi kubga yopishgan. Darsdagi tavsif aynan shunday.
- [x] ✅ 5D — penterakt, 6D — hekserakt, 7D — hepterakt (inglizcha penteract, hexeract, hepteract; oʻzbekcha shakli “tesserakt”ga oʻxshab yasalgan).

### 6-dars
- [x] Embeddinglar haqidagi soddalashtirish (“oʻxshash joylarda ishlatiladigan soʻzlar maʼnosi ham oʻxshash”) — tilshunoslikdagi taqsimot gipotezasining sodda aytilishi, maqbul.
- [x] ✅ PCA taʼrifi: eng koʻp yoyilgan yoʻnalish, keyin unga perpendikulyarlar ichidan eng koʻp yoyilgani.
- [x] ✅ t-SNE yaqin qoʻshnilarni saqlaydi, guruhlar orasidagi masofa va guruh kattaligi maʼno bermasligi mumkin (Distill, “How to Use t-SNE Effectively”, 2016).
- [x] ✅ Bernhard Riemann 1854-yil 10-iyunda istalgan *n* oʻlchamli geometriya haqida maʼruza oʻqigan.

### Hisob-kitoblar
- [x] 🧮 2-dars: Python kodi → 16 uch, 32 qirra (`repeat=5` → 32 va 80); (1, 1, 1, 1) va (1, −1, 1, −1) orasi √8 ≈ 2,83.
- [x] 🧮 3-dars: 5D da C(5, 2) = 10 tekislik. 5-dars: penterakt — 32 uch, 80 qirra, 80 kvadrat, 40 kub, 10 tesserakt.
- [x] 🧮 4-dars: d = 3 da 1,5 / 1 / 0,75. XW, YW, ZW burilmagan boʻlsa, ortogonal proyeksiya w ni tashlaydi — ikki kub ustma-ust tushadi.
- [x] 🧮 6-dars: masofalar 0,087 ≈ 0,09 va 1,281 ≈ 1,28.

### Lugʻat
- [x] `glossary.html` dagi 10 ta taʼrif oʻqib chiqildi — toʻgʻri.

## 3. Manbalar sahifasi (`about.html`)

- [x] ✅ Valentine va Kopcha (ICLS 2014) maqolasi nomi — DBLP.
- [x] ✅ Banchoff va Strauss, *The Hypercube: Projections and Slicing* — 1978-yil (yili qoʻshildi).
- [x] ✅ *Dimensions* filmi: Jos Leys, Étienne Ghys, Aurélien Alvarez (dimensions-math.org).
- [x] ✅ Gravity Probe B sayti `einstein.stanford.edu` ishlayapti. HyperPhysics havolasi yangi manzilga almashtirildi: `hyperphysics.gsu.edu`.
- [x] ✅ Smilkov va boshq. (2016), arXiv:1611.05469 — nomi va raqami toʻgʻri.

## 4. Ixtiyoriy

- [ ] `docs/LOYIHA-TARIXI.md` — “Muallifning oʻz hissasi” boʻlimi (2–3 gap).
- [ ] Bosh sahifadagi kirish matnini (`index.html`) AI yozgan — xohlasangiz oʻz soʻzlaringiz bilan qayta yozing.
- [ ] “Soya va naqsh” boʻlimiga koshin tarixi (`index.html` da HTML izoh bilan joy qoldirilgan). Faqat manbalar tekshirilgandan keyin.
- [ ] Telegramʼda sayt havolasi qanday koʻrinishini tekshiring (rasm, sarlavha) — `DEPLOY.md`, 3-boʻlim.
- [ ] Lighthouseʼni joylangan saytda ishga tushirib, `DEPLOY.md` dagi lokal raqamlar bilan solishtiring.

## Tuzatildi (2026-10-26)

- 1, 2, 4, 5-darslardagi “loppa-loʻppi” va 6-darsdagi “2-darsda” soʻzlarida lotin harfi oʻrniga kirill harfi turgan edi. Endi buni test oʻzi tekshiradi.
- 6-dars: “matematigiuz” → “matematigi”; “1850-yillarga kelibgina” → “1840–1850-yillardagina” (Cayley 1843, Grassmann 1844, Schläfli 1852 — Riemanndan oldin).
- 3-dars: “qoʻsh aylanish (yoki Klifford aylanishi)” aniqlashtirildi; 5D slayderlarini sanash uchun 2-dars simulyatori emas, “Simulyator” sahifasi koʻrsatildi (2-darsdagi simulyatorda slayder yoʻq).

## Bajarildi

- [x] Darslar va testlar muallif tomonidan qayta yozildi; “Qoralama” belgilari olib tashlandi (2026-10-25).
- [x] Sayt `https://sanjarabdubositov.github.io/Dimensions/` manzilida ishlayapti.
- [x] Supabase: loyiha yaratildi (Seul), `schema.sql` va `rls-test.sql` muvaffaqiyatli ishladi, admin qoʻshildi, roʻyxatdan oʻtish oʻchirildi, Site URL koʻrsatildi.
- [x] Maʼlumot 1 yil saqlanadi: `pg_cron` har kuni 1 yildan eski yozuvlarni oʻchiradi.
- [x] `privacy.html` toʻldirildi: server mintaqasi, saqlash muddati, bogʻlanish.
- [x] “Loyiha haqida” va README: muallif va AI yordami boʻlimlari.
- [x] Fikr formasida matn maydoni olib tashlandi; bazadagi `comment` ustuni oʻchirildi (2026-10-26).

## Maʼlumot uchun (tekshirish shart emas)

- **Supabase pauzasi.** ✅ Bepul loyiha 7 kun davomida deyarli ishlatilmasa, pauza qilinadi (oldindan email keladi). Pauzadagi loyihani 90 kun ichida Supabase sahifasidagi “Restore” tugmasi bilan qayta yoqish mumkin. Seminardan 1–2 kun oldin Supabaseʼga kirib, loyiha yoqiqligini tekshiring.
- Literata shriftida oʻzbek kirill harfi **ҳ / Ҳ** yoʻq (rus va qozoq harflari bor — `tools/font-check.py`). Hozir saytga faqat lotin harflari yuklanadi.
- Simulyatorda w ranglari oʻrtada (firuza → zafar) zaytun rangga oʻtadi — palitraning tabiiy natijasi. Yoqmasa, `css/style.css` dagi `--w-mid` ni oʻzgartiring.
- Bosh sahifadagi emblemalar: n-dars yonida (n+1) oʻlchamli kub — dizayn qarori.
- “Tesserakt soyasi va koshin naqshi bir xil 8 tomonlama simmetriyaga ega” — matematik qismi testda isbotlangan (soya 45° burilganda oʻzgarmaydi).
