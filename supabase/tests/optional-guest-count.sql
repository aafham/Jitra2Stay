-- Run after the optional_guest_count migration. Uses synthetic rows only and
-- leaves existing bookings, access settings and sessions untouched on rollback.
begin;
do $$
declare
  session_hash text := encode(extensions.gen_random_bytes(32), 'hex');
  request_id uuid := gen_random_uuid();
  guest_label text := '__optional_count_test_' || request_id::text;
  today date := (now() at time zone 'Asia/Kuala_Lumpur')::date;
  arrival date;
  booking_id uuid;
  result jsonb;
  public_guest jsonb;
begin
  select today + offset_days into arrival from generate_series(0, 364) offset_days
    where not exists (select from public.j2s_guest_bookings
      where status = 'confirmed' and check_in < today + offset_days + 1 and check_out > today + offset_days)
    order by offset_days limit 1;
  if arrival is null then raise exception 'No available test date within the next year'; end if;
  insert into public.j2s_guest_sessions(token_hash, expires_at) values (session_hash, now() + interval '1 hour');

  result := public.j2s_guest_save(session_hash, null, null, request_id, arrival, arrival + 1, guest_label, null, null);
  if result ? 'error' then raise exception 'Save without count/purpose failed: %', result; end if;
  booking_id := (result->'guest'->>'id')::uuid;
  if result->'guest'->'guest_count' is distinct from 'null'::jsonb or result->'guest'->'purpose' is distinct from 'null'::jsonb then
    raise exception 'Optional fields were not stored/returned as null';
  end if;
  result := public.j2s_guest_save(session_hash, null, null, request_id, arrival, arrival + 1, guest_label, null, null);
  if (result->'guest'->>'id')::uuid is distinct from booking_id then raise exception 'Null-count create retry duplicated'; end if;
  result := public.j2s_guest_save(session_hash, null, null, request_id, arrival, arrival + 1, guest_label, 5, null);
  if result->>'error' is distinct from 'request_conflict' then raise exception 'Idempotency failed to distinguish NULL and numeric count'; end if;

  select value into public_guest from jsonb_array_elements(public.j2s_guest_upcoming()->'guests') where value->>'guest_name' = guest_label;
  if public_guest is null or public_guest->'guest_count' is distinct from 'null'::jsonb then raise exception 'Public list lost unknown count'; end if;
  if public_guest ? 'purpose' or public_guest ? 'id' or public_guest ? 'version' then raise exception 'Public projection leaked private fields'; end if;
  select value into public_guest from jsonb_array_elements(public.j2s_guest_list(session_hash, false)->'guests') where value->>'id' = booking_id::text;
  if public_guest is null or public_guest->'guest_count' is distinct from 'null'::jsonb then raise exception 'Admin list lost unknown count'; end if;

  result := public.j2s_guest_save(session_hash, booking_id, 1, gen_random_uuid(), arrival, arrival + 1, guest_label, 5, 'Private test note');
  if result ? 'error' or (result->'guest'->>'guest_count')::integer is distinct from 5 or (result->'guest'->>'version')::integer is distinct from 2 then
    raise exception 'Cannot add count to existing null-count booking';
  end if;
  result := public.j2s_guest_save(session_hash, null, null, request_id, arrival, arrival + 1, guest_label, null, null);
  if result->>'error' is distinct from 'request_conflict' then raise exception 'Retry ignored a numeric count changed to null'; end if;
  result := public.j2s_guest_save(session_hash, booking_id, 2, gen_random_uuid(), arrival, arrival + 1, guest_label, null, null);
  if result ? 'error' or result->'guest'->'guest_count' is distinct from 'null'::jsonb or (result->'guest'->>'version')::integer is distinct from 3 then
    raise exception 'Cannot clear existing count';
  end if;
  result := public.j2s_guest_save(session_hash, booking_id, 2, gen_random_uuid(), arrival, arrival + 1, guest_label, 6, null);
  if result->>'error' is distinct from 'stale' then raise exception 'Null count weakened optimistic version check'; end if;
  result := public.j2s_guest_save(session_hash, null, null, gen_random_uuid(), arrival, arrival + 1, 'Overlapping null count', null, null);
  if result->>'error' is distinct from 'overlap' then raise exception 'Null count bypassed overlap constraint'; end if;

  result := public.j2s_guest_save(session_hash, booking_id, 3, gen_random_uuid(), arrival, arrival + 1, guest_label, 0, null);
  if result->>'error' is distinct from 'invalid_request' then raise exception 'Zero count accepted'; end if;
  result := public.j2s_guest_save(session_hash, booking_id, 3, gen_random_uuid(), arrival, arrival + 1, guest_label, 21, null);
  if result->>'error' is distinct from 'invalid_request' then raise exception 'Excessive count accepted'; end if;
  begin
    update public.j2s_guest_bookings set guest_count = 0 where id = booking_id;
    raise exception 'Database CHECK no longer rejects zero';
  exception when check_violation then null;
  end;
  if public.j2s_guest_save('invalid', booking_id, 3, gen_random_uuid(), arrival, arrival + 1, guest_label, null, null)->>'error' is distinct from 'unauthorized' then
    raise exception 'Null count bypassed session authentication';
  end if;
  if has_function_privilege('anon', 'public.j2s_guest_save(text,uuid,integer,uuid,date,date,text,integer,text)', 'EXECUTE')
      or has_function_privilege('authenticated', 'public.j2s_guest_save(text,uuid,integer,uuid,date,date,text,integer,text)', 'EXECUTE') then
    raise exception 'Replacing save RPC opened public execution';
  end if;
end;
$$;
rollback;
