# Tekshirish kerak

Darslar va testlarni muallif oʻzi qayta yozgan (2026-10-25). Lekin ulardagi koʻp tarixiy faktlar birinchi qoralamadan — Claude (AI) xotirasidan — qolgan va manba bilan tekshirilmagan. Tekshirilgan bandni `[x]` qilib belgilang. Notoʻgʻri chiqsa — matnni tuzating yoki olib tashlang.

**Belgilar:** ✅ — internetda manba bilan tekshirilgan; ⚠️ — AI xotirasidan, manba ochib koʻrilmagan.

## 1. Muhim — seminar oʻtkazishdan oldin

- [ ] ⚠️ **Qonunchilik.** Oʻzbekistonning “Shaxsga doir maʼlumotlar toʻgʻrisida”gi qonunida fuqarolarning shaxsiy maʼlumotlarini mamlakat ichidagi serverlarda saqlash talabi bor (lokalizatsiya). Bizning maʼlumot anonim (tasodifiy ID, ism yoʻq), server esa Seulda. Bu talab bizga taalluqli emasligini kattalar yoki huquqshunos bilan tekshiring.
- [ ] ⚠️ **Voyaga yetmaganlar roziligi.** Saytdan maktab oʻquvchilari ham foydalanadi. Oʻquvchining oʻz “Roziman” tugmasi yetarlimi yoki seminar uchun ota-ona yoki maktab roziligi ham kerakmi — oʻqituvchi va maktab bilan kelishing.
- [ ] **Admin panel va statistika jonli sinovi.** Bu muhitdan Supabase va jsDelivrʼga ulanib boʻlmagani uchun hali sinalmagan. `SETUP.md`, 8-boʻlim:
  - saytda “Roziman” → bitta darsni oching → Supabase **Table Editor → events** da yangi qatorlar chiqadimi;
  - `admin.html` ga admin bilan kiring → raqamlar SQL bilan bir xilmi; admin boʻlmagan foydalanuvchi → “Ruxsat yoʻq”;
  - brauzer konsolida “Content Security Policy” xatosi chiqmayaptimi.

## 2. Darslardagi faktlar — manba bilan tekshirish

### 1-dars
- [ ] ⚠️ *Flatland* — 1884-yil, muallifi Edwin A. Abbott.
- [ ] ⚠️ Carl Sagan olma va Yassi dunyo misolini *Cosmos* koʻrsatuvining 10-qismida (“The Edge of Forever”, 1980) koʻrsatgan.
- [ ] ⚠️ Eynshteyn 1905-yilda ikki qoidadan (fizika qonunlari barcha tekis harakatlanayotgan kuzatuvchilar uchun bir xil; yorugʻlik tezligi hamma uchun bir xil) vaqt sekinlashuvini keltirib chiqargan.
- [ ] ⚠️ Fazo-vaqt gʻoyasini 1908-yilda Hermann Minkowski taklif qilgan. Oʻzbekcha “German Minkovskiy” deb yozish toʻgʻrimi?
- [ ] ⚠️ Hafele–Keating tajribasi 1971-yilda oʻtkazilgan: atom soatlari samolyotlarda yer atrofida aylantirilgan, natija nazariyaga mos kelgan.

### 3-dars
- [ ] ⚠️ “Qoʻsh aylanish” (ikki mustaqil tekislikda bir vaqtda aylanish) faqat 4 va undan koʻp oʻlchamda mumkin.
- [ ] Kitob bilan tajriba (ikki burish tartibi) — oʻzingiz bajarib koʻring.

### 5-dars
- [ ] ⚠️ Salvador Dalí, *Corpus Hypercubus*, 1954-yil — xoch tesserakt yoyilmasi (8 kub) shaklida. Rasmdagi kublar joylashuvi darsdagi tavsifga mosmi?
- [ ] 5D giperkub nomi “penterakt” (6D — hekserakt, 7D — hepterakt): oʻzbekcha shakli toʻgʻrimi?

### 6-dars
- [ ] ⚠️ Embeddinglar qanday oʻrganilishi juda soddalashtirib aytilgan (“oʻxshash joylarda ishlatiladigan soʻzlar maʼnosi ham oʻxshash”). Bu soddalashtirish maqbulmi?
- [ ] ⚠️ PCA taʼrifi: “eng koʻp yoyilgan yoʻnalish, keyin unga perpendikulyar yoʻnalishlar ichidan eng koʻp yoyilgani”.
- [ ] ⚠️ t-SNE: yaqin qoʻshnilarni saqlaydi, uzoq masofalarni buzadi.
- [ ] ⚠️ Bernhard Riemann 1854-yilda istalgan oʻlchamli geometriya haqida maʼruza oʻqigan.
- [ ] Embedding Projector saytidagi qadamlar (qidiruv, proyeksiya usuli) — saytni ochib tekshiring.

### Hisob-kitoblar (tez tekshiriladi)
- [ ] 2-dars: Python kodi `product([-1, 1], repeat=4)` → 16 uch, 32 qirra — kompyuterda ishga tushirib koʻring; (1, 1, 1, 1) va (1, −1, 1, −1) orasidagi masofa √8 ≈ 2,83.
- [ ] 4-dars: d = 3 da koeffitsientlar 1,5 / 1 / 0,75; “XW, YW, ZW burilmagan boʻlsa, ortogonal proyeksiyada ichki va tashqi kub ustma-ust tushadi” — simulyatorda tekshiring.
- [ ] 6-dars: mushuk/it/mashina misolidagi masofalar 0,09 va 1,28.

### Lugʻat
- [ ] `glossary.html` dagi taʼriflarni Claude yozgan — oddiy va toʻgʻrimi, oʻqib chiqing.

## 3. Manbalar sahifasi (`about.html`)

- [ ] ✅ Valentine va Kopcha (ICLS 2014) maqolasi nomi DBLP orqali topilgan; havola qoʻyilmagan.
- [ ] ⚠️ Banchoff va Strauss filmi nomi: *The Hypercube: Projections and Slicing*.
- [ ] ⚠️ *Dimensions* filmi mualliflari: Jos Leys, Étienne Ghys, Aurélien Alvarez.
- [ ] ⚠️ HyperPhysics (Hafele–Keating) va Gravity Probe B (`einstein.stanford.edu`) havolalari ochilishini tekshiring.

## 4. Ixtiyoriy

- [ ] `docs/LOYIHA-TARIXI.md` — “Muallifning oʻz hissasi” boʻlimi (2–3 gap).
- [ ] Bosh sahifadagi kirish matnini (`index.html`) AI yozgan — xohlasangiz oʻz soʻzlaringiz bilan qayta yozing.
- [ ] “Soya va naqsh” boʻlimiga koshin tarixi (`index.html` da HTML izoh bilan joy qoldirilgan). Faqat manbalar tekshirilgandan keyin:
  - Samarqand koshinlarida 8 burchakli yulduz naqshi — qaysi binoda, qaysi asrda?
  - Darb-i Imom (Isfahon) girih naqshlari;
  - Lu va Steinhardt, 2007, *Science* — maqola nimani daʼvo qiladi va nimani daʼvo qilmaydi.
- [ ] Telegramʼda sayt havolasi qanday koʻrinishini tekshiring (rasm, sarlavha) — `DEPLOY.md`, 3-boʻlim.
- [ ] Lighthouseʼni joylangan saytda ishga tushirib, `DEPLOY.md` dagi lokal raqamlar bilan solishtiring.
- [ ] ⚠️ Supabase bepul loyihasi uzoq ishlatilmasa pauza qilinadi — qancha vaqtdan keyin ekanini Supabase tariflar sahifasidan tekshiring.

## Bajarildi

- [x] Darslar va testlar muallif tomonidan qayta yozildi; “Qoralama” belgilari olib tashlandi (2026-10-25).
- [x] Sayt `https://sanjarabdubositov.github.io/Dimensions/` manzilida ishlayapti.
- [x] Supabase: loyiha yaratildi (Seul), `schema.sql` va `rls-test.sql` muvaffaqiyatli ishladi, admin qoʻshildi, roʻyxatdan oʻtish oʻchirildi, Site URL koʻrsatildi; `SETUP.md` dagi menyu nomlari mos keldi.
- [x] Maʼlumot 1 yil saqlanadi: Supabaseʼda `pg_cron` vazifasi har kuni 1 yildan eski yozuvlarni oʻchiradi.
- [x] `privacy.html` toʻldirildi: server mintaqasi, saqlash muddati, bogʻlanish.
- [x] “Loyiha haqida” va README: muallif va AI yordami boʻlimlari.

## Maʼlumot uchun (tekshirish shart emas)

- Literata shriftida oʻzbek kirill harfi **ҳ / Ҳ** yoʻq (rus va qozoq harflari bor — `tools/font-check.py`). Hozir saytga faqat lotin harflari yuklanadi; rus yoki qozoq tili qoʻshilganda kirill qismini `tools/font-subset.py` bilan yarating.
- Simulyatorda w ranglari oʻrtada (firuza → zafar) zaytun rangga oʻtadi — palitraning tabiiy natijasi. Yoqmasa, `css/style.css` dagi `--w-mid` ni oʻzgartiring.
- Bosh sahifadagi emblemalar: n-dars yonida (n+1) oʻlchamli kub — dizayn qarori, dars mavzusiga bogʻliq emas.
- “Tesserakt soyasi va koshin naqshi bir xil 8 tomonlama simmetriyaga ega” — matematik qismi testda isbotlangan (soya 45° burilganda oʻzgarmaydi).
