-- =============================================================================
-- rls-test.sql — xavfsizlik qoidalarini tekshirish (schema.sql'dan keyin).
-- Supabase → SQL Editor'da toʻliq ishga tushiring.
--   Hammasi joyida boʻlsa, oxirida "Hammasi joyida" degan bitta qator chiqadi.
--   Biror qoida ishlamasa, "XATO: ..." degan xabar bilan toʻxtaydi.
-- Test qatorlari anon_id = 00000000-0000-0000-0000-000000000000 bilan yoziladi va oxirida oʻchiriladi.
-- =============================================================================

-- (a) anon toʻgʻri hodisani qoʻsha oladi
do $$
begin
  set local role anon;
  insert into public.events (anon_id, session_id, event_type, lesson_id, score, max_score, group_code, meta)
  values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'quiz_submit', 1, 4, 5, 'TEST-1', '{"test": true}');
  insert into public.feedback (anon_id, lesson_id, rating, comment)
  values ('00000000-0000-0000-0000-000000000000', 1, 5, 'test');
  reset role; -- keyingi blok yana SQL Editor egasi sifatida boshlansin
end $$;

-- (b) notoʻgʻri qiymatlar rad etiladi (CHECK)
do $$
declare
  bad text[] := array[
    $q$insert into public.events (anon_id, session_id, event_type) values (gen_random_uuid(), gen_random_uuid(), 'hack')$q$,
    $q$insert into public.events (anon_id, session_id, event_type, lesson_id) values (gen_random_uuid(), gen_random_uuid(), 'lesson_start', 7)$q$,
    $q$insert into public.events (anon_id, session_id, event_type, lesson_id, score, max_score) values (gen_random_uuid(), gen_random_uuid(), 'quiz_submit', 1, 6, 5)$q$,
    $q$insert into public.events (anon_id, session_id, event_type, lesson_id, score, max_score) values (gen_random_uuid(), gen_random_uuid(), 'quiz_submit', 1, 1, 51)$q$,
    $q$insert into public.events (anon_id, session_id, event_type, lesson_id) values (gen_random_uuid(), gen_random_uuid(), 'quiz_submit', 1)$q$,
    $q$insert into public.events (anon_id, session_id, event_type, group_code) values (gen_random_uuid(), gen_random_uuid(), 'page_view', 'Ali +998901234567')$q$,
    $q$insert into public.events (anon_id, session_id, event_type, meta) values (gen_random_uuid(), gen_random_uuid(), 'page_view', jsonb_build_object('x', repeat('a', 3000)))$q$,
    $q$insert into public.feedback (anon_id, rating) values (gen_random_uuid(), 6)$q$,
    $q$insert into public.feedback (anon_id, rating, comment) values (gen_random_uuid(), 3, repeat('a', 501))$q$
  ];
  q text;
begin
  set local role anon;
  foreach q in array bad loop
    begin
      execute q;
      raise exception 'XATO: notoʻgʻri qator qabul qilindi: %', q;
    exception when check_violation then
      null; -- kutilgan natija: rad etildi
    end;
  end loop;
  reset role; -- keyingi blok yana SQL Editor egasi sifatida boshlansin
end $$;

-- (c) anon hech narsani oʻqiy, oʻzgartira yoki oʻchira olmaydi; created_at'ni oʻzi qoʻya olmaydi
do $$
declare
  forbidden text[] := array[
    'select count(*) from public.events',
    'select count(*) from public.feedback',
    'select count(*) from public.admins',
    $q$update public.events set event_type = 'page_view'$q$,
    'delete from public.events',
    'delete from public.feedback',
    $q$insert into public.events (anon_id, session_id, event_type, created_at) values (gen_random_uuid(), gen_random_uuid(), 'page_view', '2000-01-01')$q$,
    'select public.is_admin()'
  ];
  q text;
begin
  set local role anon;
  foreach q in array forbidden loop
    begin
      execute q;
      raise exception 'XATO: anon uchun ruxsat berilmasligi kerak edi: %', q;
    exception when insufficient_privilege then
      null; -- kutilgan natija: "permission denied"
    end;
  end loop;
  reset role; -- keyingi blok yana SQL Editor egasi sifatida boshlansin
end $$;

-- (d) tizimga kirgan, lekin admin boʻlmagan foydalanuvchi: hech qanday qatorni koʻrmaydi
do $$
declare
  n bigint;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role', 'authenticated')::text, true);
  set local role authenticated;
  if public.is_admin() then raise exception 'XATO: oddiy foydalanuvchi admin deb topildi'; end if;
  select count(*) into n from public.events;
  if n <> 0 then raise exception 'XATO: oddiy foydalanuvchi % ta hodisani koʻrdi', n; end if;
  select count(*) into n from public.feedback;
  if n <> 0 then raise exception 'XATO: oddiy foydalanuvchi % ta fikrni koʻrdi', n; end if;
  begin
    perform count(*) from public.admins;
    raise exception 'XATO: oddiy foydalanuvchi admins jadvalini oʻqidi';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.events;
    raise exception 'XATO: oddiy foydalanuvchi hodisalarni oʻchira oldi';
  exception when insufficient_privilege then null;
  end;
  reset role; -- keyingi blok yana SQL Editor egasi sifatida boshlansin
end $$;

-- (e) admin (agar admins jadvalida kamida bittasi boʻlsa) maʼlumotni koʻra oladi
do $$
declare
  admin_id uuid;
  n bigint;
begin
  select user_id into admin_id from public.admins limit 1;
  if admin_id is null then
    raise notice 'Admin hali qoʻshilmagan — (e) test oʻtkazib yuborildi';
    return;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', admin_id, 'role', 'authenticated')::text, true);
  set local role authenticated;
  if not public.is_admin() then raise exception 'XATO: admin admin deb topilmadi'; end if;
  select count(*) into n from public.events where anon_id = '00000000-0000-0000-0000-000000000000';
  if n < 1 then raise exception 'XATO: admin test hodisasini koʻrmadi'; end if;
  begin
    delete from public.events where anon_id = '00000000-0000-0000-0000-000000000000';
    raise exception 'XATO: admin hodisani oʻchira oldi (admin panel faqat oʻqishi kerak)';
  exception when insufficient_privilege then null;
  end;
  reset role; -- keyingi blok yana SQL Editor egasi sifatida boshlansin
end $$;

reset role;

-- Test qatorlarini tozalash (bu SQL Editor egasi huquqi bilan bajariladi)
delete from public.events   where anon_id = '00000000-0000-0000-0000-000000000000';
delete from public.feedback where anon_id = '00000000-0000-0000-0000-000000000000';

select 'Hammasi joyida: barcha xavfsizlik testlari oʻtdi' as natija;
