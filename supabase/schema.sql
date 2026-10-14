-- =============================================================================
-- schema.sql — "Toʻrtinchi oʻlchov" anonim statistikasi uchun Supabase sxemasi.
-- Supabase → SQL Editor'da bir marta toʻliq ishga tushiriladi (docs/SETUP.md).
--
-- Asosiy gʻoya: brauzerdagi har kim (anon kalit bilan) faqat YANGI QATOR QOʻSHA OLADI.
-- Oʻqish faqat adminlarga ruxsat. Oʻzgartirish va oʻchirish — hech kimga.
-- Har bir qoidaning ustida u nimadan himoya qilishi yozilgan.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. JADVALLAR
-- -----------------------------------------------------------------------------

-- Hodisalar: "dars ochildi", "test topshirildi" va h.k. Ism, telefon, IP yoʻq.
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  -- Vaqtni faqat server qoʻyadi: mijoz soxta sana yubora olmaydi (pastdagi GRANT'ga qarang)
  created_at  timestamptz not null default now(),
  anon_id     uuid not null,   -- qurilmaning tasodifiy ID'si (localStorage)
  session_id  uuid not null,   -- bitta tashrif ID'si (sessionStorage)

  -- Faqat maʼlum hodisa turlari: bazaga tasodifiy matn yozib boʻlmaydi
  event_type  text not null check (event_type in (
    'page_view', 'lesson_start', 'lesson_complete', 'quiz_submit',
    'pretest_submit', 'posttest_submit', 'simulator_use', 'feedback_submit'
  )),

  -- Darslar faqat 1–6
  lesson_id   smallint check (lesson_id between 1 and 6),

  -- Ball: maks 1–50, ball 0..maks. Soxta "1000 ball" kabi qiymatlar rad etiladi
  score       smallint,
  max_score   smallint check (max_score between 1 and 50),

  -- Seminar kodi: faqat harf, raqam va chiziqcha, ≤ 32 belgi.
  -- Bu yerga ism yoki telefon yozib yuborishning oldini oladi.
  group_code  text check (group_code ~ '^[A-Za-z0-9-]{1,32}$'),

  -- Qoʻshimcha maʼlumot: faqat kichik JSON obyekt (bazani toʻldirib tashlashdan himoya)
  meta        jsonb not null default '{}'::jsonb
              check (jsonb_typeof(meta) = 'object' and pg_column_size(meta) < 2000),

  -- Ball va maks birga keladi: biri bor, ikkinchisi yoʻq holat boʻlmaydi
  constraint events_score_pair check ((score is null) = (max_score is null)),
  constraint events_score_range check (score is null or score between 0 and max_score),

  -- Test hodisalarida ball majburiy
  constraint events_score_required check (
    event_type not in ('quiz_submit', 'pretest_submit', 'posttest_submit') or score is not null
  ),
  -- Darsga oid hodisalarda dars raqami majburiy
  constraint events_lesson_required check (
    event_type not in ('lesson_start', 'lesson_complete', 'quiz_submit') or lesson_id is not null
  )
);

-- Fikrlar: 1–5 yulduz va qisqa izoh
create table if not exists public.feedback (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  anon_id     uuid not null,
  lesson_id   smallint check (lesson_id between 1 and 6),
  rating      smallint not null check (rating between 1 and 5),
  -- Izoh ≤ 500 belgi: uzun matn (yoki spam) bilan bazani toʻldirishdan himoya
  comment     text check (char_length(comment) <= 500),
  group_code  text check (group_code ~ '^[A-Za-z0-9-]{1,32}$')
);

-- Adminlar: Supabase Auth foydalanuvchilaridan qaysilari statistikani koʻra oladi.
-- Bu roʻyxat faqat SQL Editor orqali qoʻlda toʻldiriladi (docs/SETUP.md).
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Admin panel sana boʻyicha filtrlaydi — indeks soʻrovlarni tezlashtiradi
create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists feedback_created_at_idx on public.feedback (created_at);


-- -----------------------------------------------------------------------------
-- 2. HUQUQLAR (GRANT)
-- Supabase odatda yangi jadvallarga anon va authenticated rollariga HAMMA huquqni beradi.
-- Avval hammasini olib qoʻyamiz, keyin faqat keraklisini qaytaramiz.
-- -----------------------------------------------------------------------------

revoke all on table public.events, public.feedback, public.admins from anon, authenticated, public;

-- Mijoz faqat shu ustunlarga yoza oladi. id va created_at roʻyxatda yoʻq:
-- ularni faqat server qoʻyadi (soxta vaqt yoki ID yuborib boʻlmaydi).
grant insert (anon_id, session_id, event_type, lesson_id, score, max_score, group_code, meta)
  on table public.events to anon, authenticated;

grant insert (anon_id, lesson_id, rating, comment, group_code)
  on table public.feedback to anon, authenticated;

-- Oʻqish huquqi faqat tizimga kirganlarga. Lekin kim nimani koʻrishini
-- pastdagi RLS siyosati hal qiladi: faqat adminlar.
grant select on table public.events, public.feedback to authenticated;

-- admins jadvaliga hech qanday GRANT yoʻq: uni API orqali hech kim oʻqiy olmaydi.
-- UPDATE va DELETE hech kimga berilmagan: yuborilgan maʼlumotni oʻzgartirib yoki oʻchirib boʻlmaydi.


-- -----------------------------------------------------------------------------
-- 3. is_admin() — joriy foydalanuvchi adminmi?
-- security definer: funksiya admins jadvalini oʻz egasi huquqi bilan oʻqiydi,
-- shuning uchun foydalanuvchiga admins jadvalini koʻrsatish shart emas.
-- search_path = '' — kimdir "admins" nomli soxta jadval yaratib, funksiyani
-- aldashining oldini oladi (hamma nom toʻliq yoziladi: public.admins).
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

-- Funksiyani faqat tizimga kirganlar chaqira oladi: admin panel uni RPC sifatida
-- (POST /rest/v1/rpc/is_admin) chaqirib, "Ruxsat yoʻq"ni aniqlaydi. anon uchun yopiq.
-- U faqat true/false qaytaradi — admins roʻyxatini ochib bermaydi.
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) — har bir qator uchun "kim nima qila oladi"
-- RLS yoqilgan jadvalda siyosat ruxsat bermagan har qanday amal taqiqlanadi.
-- -----------------------------------------------------------------------------

alter table public.events   enable row level security;
alter table public.feedback enable row level security;
alter table public.admins   enable row level security;  -- siyosat yoʻq = hech kimga ruxsat yoʻq

-- Qayta ishga tushirilganda xato bermasligi uchun eski siyosatlarni oʻchiramiz
drop policy if exists events_insert_anyone   on public.events;
drop policy if exists events_select_admin    on public.events;
drop policy if exists feedback_insert_anyone on public.feedback;
drop policy if exists feedback_select_admin  on public.feedback;

-- Hamma yangi hodisa qoʻsha oladi. Qiymatlarni yuqoridagi CHECK cheklovlari tekshiradi.
create policy events_insert_anyone on public.events
  for insert to anon, authenticated
  with check (true);

create policy feedback_insert_anyone on public.feedback
  for insert to anon, authenticated
  with check (true);

-- Oʻqish faqat adminlarga. Oddiy foydalanuvchi (hatto tizimga kirgan boʻlsa ham) boʻsh natija oladi.
create policy events_select_admin on public.events
  for select to authenticated
  using ((select public.is_admin()));

create policy feedback_select_admin on public.feedback
  for select to authenticated
  using ((select public.is_admin()));

-- UPDATE va DELETE uchun siyosat ham, GRANT ham yoʻq — ikki qavatli taqiq.
