# Loyiha tarixi

Bu fayl git tarixi va oʻlchov natijalariga asoslangan. Unda faqat faktlar bor, baholar yoʻq. Portfolio uchun manba sifatida yozilgan.

## Qisqacha

- **Sana:** M1–M5 ning hammasi **2026-yil 14-oktabr** kuni bajarilgan.
- **Qanday ishlangan:** muallif asosiy topshiriqni (talablar, bosqichlar va qabul mezonlari) yozgan va har bir bosqich boshida koʻrsatma bergan. Kod, qoralama dars matnlari va hujjatlarni **Claude Code (AI)** yozgan. Har bir bosqich alohida pull request (PR) boʻlib kelgan va uni muallif merge qilgan.
- **Vaqt:** Toshkent vaqti (UTC+5) boʻyicha. Commit vaqti ish qancha davom etganini emas, oʻzgarish qachon saqlanganini koʻrsatadi.

| Bosqich | PR | Branch | Commitlar | Commit vaqti | Merge | Testlar (bosqich oxirida) |
|---|---|---|---|---|---|---|
| M1 — skelet va simulyator | #1 | `claude/bajar-cbj6r0` | 4 | 13:15 | — | 15 |
| M2 — darslar va testlar | #1 | `claude/bajar-cbj6r0` | 10 | 13:54 | 14:12 (M1 bilan birga) | 56 |
| M3 — anonim statistika | #2 | `claude/m3-analytics` | 8 | 14:17 | 14:20 | 70 |
| M4 — admin panel | #3 | `claude/m4-admin` | 5 + 3¹ | 14:22–14:36 | 15:38 | 88 |
| M1–M4 tekshiruvi | #4 | `claude/audit-m1-m4` | 8 | 17:20–17:23 | 17:25 | 91 |
| M5 — sayqal va joylash | #5 | `claude/m5-polish` | ² | 17:35 dan | ² | 107 |

¹ M3 ning 3 ta tuzatish commiti PR #2 merge qilingandan keyin push qilingan edi, shuning uchun ular `main`ga PR #3 bilan birga tushdi.
² M5 PRʼi merge qilingandan keyin toʻldiriladi.

## Bosqichlar

### M1 — skelet va simulyator
- `js/math4d.js`: giperkub uchlari va qirralari, tekislikdagi aylanish matritsalari, perspektiv va ortogonal proyeksiya. Brauzerga bogʻliq emas, Nodeʼda test qilinadi.
- Simulyator: 2D–7D, 4D da 6 ta aylanish slayderi, sudrash (3D va 4D rejim), klaviatura, avto-aylanish, chuqurlikka qarab rang, darslarga qoʻshiladigan komponent.
- Qaror: perspektiv proyeksiyada kamera masofasi shakl radiusiga nisbatan olinadi. Doimiy masofada 6D–7D da formula buzilardi (`ARCHITECTURE.md`).
- Ombor dastlab boʻsh edi. Push birinchi urinishda 403 xatosi bilan rad etildi. Muallif Claude GitHub Appʼni oʻrnatdi, keyin Claude muallif ruxsati bilan boʻsh boshlangʻich commitʼli `main` yaratdi.

### M2 — darslar va testlar
- Dars dvigateli: Markdown + frontmatter. Parser tashqi kutubxonasiz yozildi (sababi `ARCHITECTURE.md`da). `:::simulator:::` va `:::predict:::` direktivalari.
- 6 ta qoralama dars (602–664 soʻz), 6 ta quiz (5 tadan savol), 6 savolli oldin/keyin testi, lugʻat, “Loyiha haqida” va “Maxfiylik” sahifalari.
- Progress `localStorage`da saqlanadi, bosh sahifada har bir dars holati koʻrinadi.
- Ishonch yetarli boʻlmagan faktlar `TEKSHIRISH.md` roʻyxatiga yozildi, matnga kiritilmadi.

### M3 — anonim statistika
- `supabase/schema.sql`: CHECK cheklovlari, ustun darajasidagi `GRANT INSERT`, RLS, `is_admin()`. `supabase/rls-test.sql` — SQL Editor uchun xavfsizlik testi.
- Rozilik banneri; rozilik berilmasa, tarmoqqa birorta ham soʻrov ketmaydi. Seminar kodi (`?g=`), fikr formasi.
- Sxema lokal PostgreSQL 16'da Supabase rollari taqlidi bilan sinaldi. Ataylab buzilgan 3 ta qoidani test ushladi.

### M4 — admin panel
- Kirish → `is_admin()` → faqat oʻqish. Natijalar 1000 tadan sahifalab yuklanadi. Filtrlar, kunlik SVG grafik, CSV eksport (CSV injection himoyasi bilan).
- `js/stats.js`: voronka, test oʻrtachalari, oldin/keyin taqqoslash. Har bir oʻrtacha qiymat yonida n, n < 5 boʻlsa ogohlantirish.
- `SETUP.md` dagi solishtirish uchun SQL soʻrovlari lokal bazada `stats.js` bilan bir xil natija berdi.
- Kod qayta koʻrib chiqilganda topilgan 2 ta xato tuzatildi: simulyator ikki barmoqda “sakrardi”; oldin/keyin testini qayta topshirish mumkin edi.

### M1–M4 tekshiruvi
- 8 ta tuzatish. Eng muhimi — `.nojekyll` yoʻq edi: usiz GitHub Pages darslarni ochmasdi.
- Sayt `/Dimensions/` pastki manzili ostida ishga tushirilib, barcha brauzer testlari qayta oʻtkazildi.

### M5 — sayqal va joylash
- **Lighthouse** (mobil, lokal), M5 dan oldin: Performance 90–100, Accessibility 100. Lekin 3 ta sahifada CLS 0.16–0.18 edi. Tuzatilgandan keyin: CLS 0, Performance 99–100.
- **Kontrast:** yulduzchalar rangi WCAG AA ga mos emas edi (2.17:1) — tuzatildi (4.25:1). axe-core barcha sahifalarni yorugʻ va qorongʻi rejimda tekshirdi, xato qolmadi.
- **Sekin 3G** (400 ms, 400 kbit/s, CPU ×4, gzip bilan): eng sekin sahifa — dars, LCP 2.7 s. Tuzatishdan oldin u siqilmagan holatda 4.4 s edi.
- **Bosh sahifa hajmi:** 17 fayl, 53 KB (gzip bilan 22 KB). Supabase kutubxonasi faqat rozilikdan keyin yuklanadi, uning hajmi oʻlchanmagan.
- Ulashish uchun meta teglar va 1200×630 rasm; oʻzbekcha 404 sahifa; README (oʻzbekcha va inglizcha), `DEPLOY.md`, shu fayl.

## Hajm (M5 oxirida)

| Nima | Qancha |
|---|---|
| JavaScript | 28 fayl, ~2250 qator |
| CSS | 3 fayl, ~360 qator |
| HTML sahifalar | 9 ta |
| Avtomatik testlar | 107 ta (`node --test`) + `supabase/rls-test.sql` |
| Darslar | 6 ta, hammasi qoralama |
| Tashqi kutubxona | 1 ta: `@supabase/supabase-js@2.117.2` (faqat rozilikdan keyin yuklanadi) |

## Muallifning oʻz hissasi

*[Muallif oʻzi yozadi: nimani oʻzi rejalashtirgan, yozgan, tekshirgan va oʻzgartirgan — masalan, dars matnlarini qayta yozish, oʻqituvchi bilan faktlarni tekshirish, seminar oʻtkazish.]*
