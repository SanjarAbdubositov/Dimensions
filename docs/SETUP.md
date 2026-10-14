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

## 8. Muhim eslatmalar

- **Bepul tarifdagi pauza.** Bepul loyiha uzoq vaqt (hozirgi qoidaga koʻra taxminan bir hafta) ishlatilmasa, Supabase uni **pauza** qilishi mumkin. Pauzadagi loyiha hodisalarni qabul qilmaydi, lekin sayt baribir ishlayveradi (statistika shunchaki yozilmaydi). Maʼlumot oʻchmaydi. Loyihani Supabase sahifasida **Restore** tugmasi bilan qayta yoqasiz. **Seminardan oldin** Supabaseʼga kirib, loyiha faolligini tekshiring. Aniq muddatni Supabaseʼning hozirgi tariflar sahifasidan tekshiring.
- **Spam.** Publishable kalit ochiq, shuning uchun kimdir soxta hodisalar yuborishi mumkin. CHECK cheklovlari faqat shaklini cheklaydi, sonini emas. Agar shunday boʻlsa, admin panelda shubhali `anon_id` larni chiqarib tashlash mumkin.
- **Admin qurilmasi.** Oʻz kirishlaringiz hisoblanmasligi uchun admin paneldagi “Bu qurilmani statistikadan chiqar” tugmasini bosing (M4 da qoʻshiladi).
