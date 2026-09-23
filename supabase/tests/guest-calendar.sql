-- Run as the project SQL administrator on a dedicated project. All changes roll back.
-- Test values are generated here; no operational PIN appears in this file.
begin;
do $$
declare
  test_pin text := lpad(floor(random() * 10000)::integer::text, 4, '0');
  wrong_pin text;
  session_hash text := encode(extensions.gen_random_bytes(32), 'hex');
  request_id uuid := gen_random_uuid();
  today date := (now() at time zone 'Asia/Kuala_Lumpur')::date;
  result jsonb;
  booking_id uuid;
  version integer;
  row_count integer;
begin
  wrong_pin := lpad(((test_pin::integer + 1) % 10000)::text, 4, '0');
  -- Isolated transaction; restores any existing access settings and bookings on rollback.
  delete from public.j2s_guest_bookings;
  delete from public.j2s_guest_sessions;
  insert into public.j2s_guest_access(singleton, pin_hash) values (true, extensions.crypt(test_pin, extensions.gen_salt('bf', 4)))
    on conflict (singleton) do update set pin_hash = excluded.pin_hash, failed_attempts = 0, window_started_at = now();

  for attempt in 1..5 loop
    result := public.j2s_guest_login(wrong_pin, session_hash);
    if result->>'error' is distinct from 'invalid_pin' then raise exception 'Wrong PIN accepted'; end if;
  end loop;
  result := public.j2s_guest_login(test_pin, session_hash);
  if result->>'error' is distinct from 'rate_limited' then raise exception 'Global rate limit bypassed'; end if;
  if (result->>'retry_after')::integer < 1 then raise exception 'Missing retry duration'; end if;
  update public.j2s_guest_access set window_started_at = now() - interval '16 minutes';
  result := public.j2s_guest_login(test_pin, session_hash);
  if result ? 'error' or not result ? 'expires_at' then raise exception 'Valid PIN rejected after cooldown'; end if;
  if public.j2s_guest_session(session_hash) ? 'error' then raise exception 'New session missing'; end if;

  result := public.j2s_guest_save(session_hash, null, null, request_id, today + 10, today + 12, 'Tetamu ujian', 4, null);
  if result ? 'error' then raise exception 'Create failed: %', result; end if;
  booking_id := (result->'guest'->>'id')::uuid;
  if result->'guest'->>'purpose' is not null then raise exception 'Optional purpose required'; end if;
  result := public.j2s_guest_save(session_hash, null, null, request_id, today + 10, today + 12, 'Tetamu ujian', 4, null);
  if (result->'guest'->>'id')::uuid is distinct from booking_id then raise exception 'Create retry duplicated'; end if;
  select count(*) into row_count from public.j2s_guest_bookings;
  if row_count <> 1 then raise exception 'Duplicate rows after retry'; end if;
  result := public.j2s_guest_save(session_hash, null, null, gen_random_uuid(), today + 11, today + 13, 'Overlap', 2, null);
  if result->>'error' is distinct from 'overlap' then raise exception 'Overlap allowed'; end if;
  result := public.j2s_guest_save(session_hash, null, null, gen_random_uuid(), today + 12, today + 13, 'Next arrival', 2, null);
  if result ? 'error' then raise exception 'Same-day turnover rejected'; end if;

  result := public.j2s_guest_calendar(today + 10, today + 12);
  if jsonb_array_length(result->'stays') <> 1 then raise exception 'Exclusive calendar boundary failed'; end if;
  select count(*) into row_count from jsonb_object_keys(result->'stays'->0);
  if row_count <> 2 then raise exception 'Calendar exposes non-date fields'; end if;
  result := public.j2s_guest_upcoming();
  select count(*) into row_count from jsonb_object_keys(result->'guests'->0);
  if row_count <> 4 or result->'guests'->0 ? 'purpose' then raise exception 'Upcoming exposes private fields'; end if;
  if public.j2s_guest_calendar(today, today + 63)->>'error' is distinct from 'invalid_request' then raise exception 'Calendar range unbounded'; end if;
  if public.j2s_guest_list('invalid', false)->>'error' is distinct from 'unauthorized' then raise exception 'Guest list lacks auth'; end if;
  result := public.j2s_guest_save(session_hash, booking_id, 1, gen_random_uuid(), today + 10, today + 12, 'Edited', 5, 'Majlis');
  if (result->'guest'->>'version')::integer <> 2 then raise exception 'Edit did not increment version'; end if;
  result := public.j2s_guest_save(session_hash, booking_id, 1, gen_random_uuid(), today + 10, today + 12, 'Lost update', 6, null);
  if result->>'error' is distinct from 'stale' then raise exception 'Lost update allowed'; end if;
  if public.j2s_guest_cancel(session_hash, booking_id, 1)->>'error' is distinct from 'stale' then raise exception 'Stale cancellation allowed'; end if;
  result := public.j2s_guest_cancel(session_hash, booking_id, 2);
  if result->>'ok' is distinct from 'true' then raise exception 'Cancel failed'; end if;
  if not exists(select from public.j2s_guest_bookings where id = booking_id and status = 'cancelled') then raise exception 'Cancellation lost history'; end if;
  result := public.j2s_guest_calendar(today + 10, today + 12);
  if jsonb_array_length(result->'stays') <> 0 then raise exception 'Cancelled dates remain occupied'; end if;

  result := public.j2s_guest_save(session_hash, null, null, gen_random_uuid(), today - 1, today + 1, 'Past new', 2, null);
  if result->>'error' is distinct from 'invalid_request' then raise exception 'Past new booking allowed'; end if;
  insert into public.j2s_guest_bookings(request_id, check_in, check_out, guest_name, guest_count)
    values (gen_random_uuid(), today - 1, today + 1, 'Ongoing stay', 2) returning id into booking_id;
  result := public.j2s_guest_save(session_hash, booking_id, 1, gen_random_uuid(), today - 1, today + 1, 'Ongoing edited', 3, null);
  if result ? 'error' then raise exception 'Existing past check-in cannot be retained'; end if;
  result := public.j2s_guest_save(session_hash, booking_id, 2, gen_random_uuid(), today - 2, today + 1, 'Moved back', 3, null);
  if result->>'error' is distinct from 'invalid_request' then raise exception 'Past date moved arbitrarily'; end if;

  update public.j2s_guest_sessions set expires_at = now() - interval '1 second' where token_hash = session_hash;
  if public.j2s_guest_list(session_hash, false)->>'error' is distinct from 'unauthorized' then raise exception 'Expired session accepted'; end if;
  update public.j2s_guest_sessions set expires_at = now() + interval '1 hour' where token_hash = session_hash;
  perform public.j2s_guest_logout(session_hash);
  if public.j2s_guest_session(session_hash)->>'error' is distinct from 'unauthorized' then raise exception 'Logout did not revoke'; end if;
end;
$$;

-- Assert privileges and RLS independently from handler code.
do $$
declare item record; role_name text;
begin
  for item in select c.oid, c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname in ('j2s_guest_access', 'j2s_guest_sessions', 'j2s_guest_bookings') loop
    if not item.relrowsecurity then raise exception 'RLS missing: %', item.relname; end if;
    foreach role_name in array array['anon', 'authenticated'] loop
      if has_table_privilege(role_name, item.oid, 'SELECT,INSERT,UPDATE,DELETE') then raise exception 'Untrusted table grant: % %', role_name, item.relname; end if;
    end loop;
  end loop;
  for item in select p.oid, p.proname, p.prosecdef from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname like 'j2s_guest_%' loop
    if item.prosecdef then raise exception 'Unexpected SECURITY DEFINER'; end if;
    foreach role_name in array array['anon', 'authenticated'] loop
      if has_function_privilege(role_name, item.oid, 'EXECUTE') then raise exception 'Untrusted function grant: % %', role_name, item.proname; end if;
    end loop;
    if not has_function_privilege('service_role', item.oid, 'EXECUTE') then raise exception 'Service role cannot call %', item.proname; end if;
  end loop;
end;
$$;
rollback;
