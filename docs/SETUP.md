# Supabaseʼni sozlash (anonim statistika)

Bu yoʻriqnoma statistikani yoqish uchun. **Sozlamasangiz ham sayt toʻliq ishlaydi** — `js/config.js` boʻsh boʻlsa, statistika jim oʻchadi, rozilik banneri ham chiqmaydi.

> Supabase sahifasidagi menyu nomlari vaqt oʻtishi bilan oʻzgarishi mumkin. Bu yerda yozilgan nom topilmasa, oʻxshash maʼnodagi bandni qidiring (masalan, “API Keys”, “Data API”, “Sign In / Providers”).

---

## 1. Loyiha yaratish

1. [supabase.com](https://supabase.com) da roʻyxatdan oʻting va **New project** ni bosing.
2. Nom bering (masalan, `tortinchi-olchov`).
3. **Database password** — kuchli parol qoʻying va xavfsiz joyga yozib qoʻying. U saytda kerak emas, lekin yoʻqotmang.
4. **Region** — Oʻzbekistonga yaqinroq mintaqani tanlang (masalan, Yevropa — Frankfurt). Tanlagan mintaqangizni `privacy.html` dagi bosh joyga yozing.
5. Bepul tarif (**Free**) yetarli.

## 2. Jadvallarni yaratish (`schema.sql`)

1. Chap menyuda **SQL Editor** → **New query**.
2. `supabase/schema.sql` faylining **butun** matnini nusxalab qoʻying va **Run** ni bosing.
3. Kutilgan natija: `Success. No rows returned`.

Faylni qayta ishga tushirish xavfsiz: mavjud jadvallar va maʼlumotlar oʻchmaydi, faqat qoidalar yangilanadi.

## 3. Kalitlarni `config.js` ga qoʻyish

1. **Project Settings → Data API** (yoki yuqoridagi **Connect** tugmasi): **Project URL** ni nusxalang. U `https://abcdefgh.supabase.co` koʻrinishida boʻladi.
2. **Project Settings → API Keys**: **Publishable key** ni nusxalang (`sb_publishable_...` bilan boshlanadi). Eski loyihalarda u **anon public** deb ataladi — u ham boʻladi.
3. `js/config.js` ni oching va ikkalasini qoʻying:

```js
export const SUPABASE_URL = 'https://abcdefgh.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

> ⛔ **Hech qachon** `Secret key` (`sb_secret_...`) yoki `service_role` kalitni `config.js` ga, GitHubʼga yoki saytning boshqa biror joyiga qoʻymang. U barcha RLS himoyasini chetlab oʻtadi: saytni ochgan har kim butun bazani oʻqiy, oʻzgartira va oʻchira oladi. Agar tasodifan qoʻyib yuborsangiz — Supabaseʼda uni darhol **yangilang (rotate)**.
>
> `analytics.js` secret yoki service_role kalitni taniydi va uni ishlatmaydi, lekin bunga tayanmang.

**Publishable/anon kalitni ochiq qoʻyish xavfsizmi?** Ha, u ochiq boʻlishi uchun moʻljallangan. Undan foydalangan kishi faqat `schema.sql` ruxsat bergan ishni qila oladi: yangi hodisa yoki fikr qoʻshish. Oʻqish, oʻzgartirish va oʻchirish taqiqlangan (6-qadamda tekshiramiz).

## 4. Ochiq roʻyxatdan oʻtishni oʻchirish

Admin panelga faqat siz kira olishingiz kerak. Begona odam oʻzi akkaunt ochib olmasligi uchun:

1. **Authentication → Sign In / Providers** (eski versiyada **Authentication → Settings**).
2. **Allow new users to sign up** ni **oʻchiring** va saqlang.

Akkaunt ochilgan taqdirda ham u odam hech narsani koʻrmaydi: maʼlumotni faqat `admins` jadvalidagilar oʻqiy oladi. Bu ikkinchi qavat himoya.

## 5. Admin foydalanuvchini yaratish

1. **Authentication → Users → Add user → Create new user**.
2. Email va **kuchli** parol kiriting, **Auto Confirm User** belgisini qoʻying va yarating.
3. **SQL Editor** da (emailni oʻzingiznikiga almashtiring):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'siz@example.com';
```

4. Tekshirish: `select * from public.admins;` — bitta qator chiqishi kerak.

## 6. XAVFSIZLIK TEKSHIRUVI

### 6.1. SQL orqali (eng toʻliq)

**SQL Editor** da `supabase/rls-test.sql` ning butun matnini ishga tushiring. U `anon`, oddiy foydalanuvchi va admin rollarida ishlab, har bir qoidani tekshiradi.

- Kutilgan natija: `Hammasi joyida: barcha xavfsizlik testlari oʻtdi`.
- Biror qoida ishlamasa: `XATO: ...` degan xabar chiqadi — nima buzilganini aytadi.
- Test oʻz qatorlarini oxirida oʻchiradi.

### 6.2. Anon kalit bilan, xuddi begona odamdek (curl)

Terminalda (Windowsʼda **Git Bash** yoki **PowerShell**dagi `curl.exe`) avval oʻzgaruvchilarni qoʻying:

```bash
URL="https://abcdefgh.supabase.co"
KEY="sb_publishable_..."
```

**(a) Toʻgʻri hodisa qoʻshish → ishlashi kerak**

```bash
curl -i -X POST "$URL/rest/v1/events" \
  -H "apikey: $KEY" -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d '{"anon_id":"11111111-2222-4333-8444-555555555555","session_id":"11111111-2222-4333-8444-555555555555","event_type":"page_view","meta":{"test":true}}'
```

Kutilgan natija: **`HTTP/2 201`**, javob tanasi boʻsh.

**(b) Notoʻgʻri `event_type` → rad etilishi kerak**

```bash
curl -i -X POST "$URL/rest/v1/events" \
  -H "apikey: $KEY" -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d '{"anon_id":"11111111-2222-4333-8444-555555555555","session_id":"11111111-2222-4333-8444-555555555555","event_type":"hack"}'
```

Kutilgan natija: **`HTTP/2 400`**, javobda `"code":"23514"` va `violates check constraint` soʻzlari.

**(c) `events` ni oʻqishga urinish → hech narsa qaytmasligi kerak**

```bash
curl -i "$URL/rest/v1/events?select=*" -H "apikey: $KEY"
```

Kutilgan natija: **`HTTP/2 401`** (yoki `403`), javobda `"code":"42501"` va `permission denied for table events`. Muhimi — **birorta ham qator qaytmaydi**. Agar javobda hodisalar roʻyxati koʻrinsa, bu xavfli: `schema.sql` ni qayta ishga tushiring va 6.1 testini bajaring.

> Eski `anon` kalit (JWT, `eyJ...` bilan boshlanadi) bilan 401 xatosi chiqsa, har bir buyruqqa `-H "Authorization: Bearer $KEY"` ni ham qoʻshing.

### 6.3. Xuddi shu sinov brauzer konsolida

Istalgan sahifada **F12 → Console** ni oching va (URL va KEY ni almashtirib) joylang:

```js
const URL = 'https://abcdefgh.supabase.co', KEY = 'sb_publishable_...';
const headers = { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
const row = (type) => JSON.stringify({ anon_id: crypto.randomUUID(), session_id: crypto.randomUUID(), event_type: type, meta: { test: true } });
console.log('(a) 201 kutiladi:', (await fetch(`${URL}/rest/v1/events`, { method: 'POST', headers, body: row('page_view') })).status);
console.log('(b) 400 kutiladi:', (await fetch(`${URL}/rest/v1/events`, { method: 'POST', headers, body: row('hack') })).status);
const r = await fetch(`${URL}/rest/v1/events?select=*`, { headers: { apikey: KEY } });
console.log('(c) 401/403 kutiladi:', r.status, await r.text());
```

### 6.4. Test qatorlarini tozalash

6.2 va 6.3 da qoʻshilgan test qatorlarini **SQL Editor** da oʻchiring:

```sql
delete from public.events where meta ->> 'test' = 'true';
```

## 7. Sayt bilan tekshirish

1. Saytni oching. Pastda rozilik banneri chiqadi.
2. **“Yoʻq, rahmat”** ni bosing va bir nechta darsni oching. **F12 → Network** oynasida `supabase.co` ga birorta ham soʻrov ketmasligi kerak.
3. Footerʼdagi **“Statistika sozlamalari”** → **“Roziman”**. Endi darsni oching. Supabaseʼda **Table Editor → events** da yangi qatorlar paydo boʻladi.
4. Seminar kodi: saytni `index.html?g=MAKTAB12-A` bilan oching — keyingi hodisalarda `group_code` ustuni `MAKTAB12-A` boʻladi.

## 8. Admin panelni tekshirish

Admin panel manzili: `https://<saytingiz>/admin.html`. Unga saytning boshqa sahifalaridan havola yoʻq va qidiruv tizimlari uni koʻrsatmaydi (`noindex`). Manzilni oʻzingiz yozib ochasiz.

### 8.1. Admin boʻlmagan foydalanuvchi → “Ruxsat yoʻq”

1. Supabaseʼda **Authentication → Users → Add user** orqali ikkinchi, sinov foydalanuvchisini yarating (masalan, `sinov@example.com`). Uni `admins` jadvaliga **qoʻshmang**.
2. `admin.html` ni oching, **F12 → Network** oynasini ochib qoʻying va sinov foydalanuvchisi bilan kiring.
3. Kutilgan natija:
   - **“Ruxsat yoʻq”** degan xabar chiqadi;
   - Network oynasida faqat kirish soʻrovi (`/auth/v1/token`) va `rpc/is_admin` soʻrovi boʻladi. `rpc/is_admin` javobi `false` qaytaradi;
   - `rest/v1/events` yoki `rest/v1/feedback` ga **birorta ham** soʻrov ketmaydi.
4. Sinovdan keyin bu foydalanuvchini **oʻchiring** (Authentication → Users → … → Delete user).

> Agar kimdir panelning kodini oʻzgartirib, `events` ni baribir soʻrasa ham, RLS unga **boʻsh roʻyxat** qaytaradi. Buni `supabase/rls-test.sql` ning (d) qismi tekshiradi.

### 8.2. Admin bilan kirish → raqamlarni solishtirish

Admin akkaunti bilan kiring. Filtrlarni boʻsh qoldiring (barcha maʼlumot), keyin **SQL Editor**da quyidagi soʻrovlarni ishga tushirib, panel bilan solishtiring. Soʻrovlar paneldagi taʼriflarni aynan takrorlaydi.

```sql
-- 1. "Noyob qurilmalar" (katta raqam)
select count(distinct anon_id) as noyob_qurilmalar from public.events;

-- 2. "Dars voronkasi": boshlagan / tugatgan
select lesson_id as dars,
       count(distinct anon_id) filter (where event_type in ('lesson_start', 'lesson_complete')) as boshlagan,
       count(distinct anon_id) filter (where event_type = 'lesson_complete') as tugatgan
from public.events
where lesson_id is not null and event_type in ('lesson_start', 'lesson_complete')
group by lesson_id order by lesson_id;

-- 3. "Testlar boʻyicha oʻrtacha ball": har qurilmaning birinchi urinishi
select lesson_id as dars, count(*) as n, round(avg(100.0 * score / max_score)) as ortacha_foiz
from (
  select distinct on (anon_id, lesson_id) anon_id, lesson_id, score, max_score
  from public.events where event_type = 'quiz_submit'
  order by anon_id, lesson_id, created_at
) birinchi
group by lesson_id order by lesson_id;

-- 4. "Oldin / keyin": faqat ikkala testni topshirganlar
with oldin as (
  select distinct on (anon_id) anon_id, group_code, 100.0 * score / max_score as foiz
  from public.events where event_type = 'pretest_submit' order by anon_id, created_at
), keyin as (
  select distinct on (anon_id) anon_id, 100.0 * score / max_score as foiz
  from public.events where event_type = 'posttest_submit' order by anon_id, created_at
)
select coalesce(oldin.group_code, 'Guruhsiz') as guruh, count(*) as n,
       round(avg(oldin.foiz)) as oldin, round(avg(keyin.foiz)) as keyin
from oldin join keyin using (anon_id)
group by 1 order by 1;

-- 5. "Fikrlar": soni va oʻrtacha reyting
select count(*) as fikrlar, round(avg(rating), 1) as ortacha_reyting from public.feedback;

-- 6. "Kunlik noyob qurilmalar" (Toshkent vaqti)
select (created_at at time zone 'Asia/Tashkent')::date as kun, count(distinct anon_id) as qurilmalar
from public.events group by 1 order by 1;
```

Raqamlar bir xil chiqishi kerak. Ikki holatda farq boʻlishi normal:

- **Kunlik grafik** brauzeringiz soat mintaqasida hisoblanadi. Kompyuteringiz Toshkent vaqtida boʻlmasa, kunlar biroz farq qilishi mumkin.
- **Sana filtri** qoʻyilgan boʻlsa, SQLʼga ham shu chegarani qoʻshing, masalan: `where created_at >= '2026-10-01 00:00+05' and created_at < '2026-10-15 00:00+05'`.

### 8.3. Yana nimalarni tekshirish kerak

- **CSV:** “Hodisalar (CSV)” faylidagi qatorlar soni (sarlavhasiz) paneldagi “N ta hodisa yuklandi” bilan teng boʻlsin. Fayllar faqat kompyuteringizga tushadi — ularni repoga qoʻshmang (`.gitignore` `*.csv` va `exports/` ni eʼtiborsiz qoldiradi).
- **“Bu qurilmani statistikadan chiqar”** tugmasini bosing. Keyin saytni shu brauzerda oching va **Network** oynasida `supabase.co` ga hodisa yuborilmasligini tekshiring.
- **Chiqish:** “Chiqish” tugmasidan keyin hisobot yoʻqoladi. Sessiya `sessionStorage` da saqlanadi, shuning uchun brauzer oynasi yopilsa ham avtomatik chiqiladi.

> **CSP haqida.** `admin.html` faqat `https://*.supabase.co` ga ulanishga ruxsat beradi. Agar Supabase loyihangizga boshqa domen (custom domain) ulasangiz, `admin.html` dagi `connect-src` ga uni qoʻshing. Aks holda panel “Maʼlumotni yuklab boʻlmadi” deydi.

## 9. Muhim eslatmalar

- **Bepul tarifdagi pauza.** Bepul loyiha uzoq vaqt (hozirgi qoidaga koʻra taxminan bir hafta) ishlatilmasa, Supabase uni **pauza** qilishi mumkin. Pauzadagi loyiha hodisalarni qabul qilmaydi, lekin sayt baribir ishlayveradi (statistika shunchaki yozilmaydi). Maʼlumot oʻchmaydi. Loyihani Supabase sahifasida **Restore** tugmasi bilan qayta yoqasiz. **Seminardan oldin** Supabaseʼga kirib, loyiha faolligini tekshiring. Aniq muddatni Supabaseʼning hozirgi tariflar sahifasidan tekshiring.
- **Spam.** Publishable kalit ochiq, shuning uchun kimdir soxta hodisalar yuborishi mumkin. CHECK cheklovlari faqat shaklini cheklaydi, sonini emas. Agar shunday boʻlsa, admin panelda shubhali `anon_id` larni chiqarib tashlash mumkin.
- **Admin qurilmasi.** Oʻz kirishlaringiz hisoblanmasligi uchun admin paneldagi “Bu qurilmani statistikadan chiqar” tugmasini har bir qurilmangizda (telefon, kompyuter) bir marta bosing.
