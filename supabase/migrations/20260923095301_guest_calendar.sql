-- PIN is provisioned separately. Never put a PIN or its hash in a migration.
create extension if not exists pgcrypto with schema extensions;

create table public.j2s_guest_access (
  singleton boolean primary key default true check (singleton),
  pin_hash text not null check (pin_hash like '$2%'),
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  window_started_at timestamptz not null default now()
);

create table public.j2s_guest_sessions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index j2s_guest_sessions_expiry on public.j2s_guest_sessions (expires_at);

create table public.j2s_guest_bookings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  check_in date not null,
  check_out date not null,
  guest_name text not null check (char_length(btrim(guest_name)) between 1 and 120),
  guest_count integer not null check (guest_count between 1 and 20),
  purpose text check (char_length(purpose) <= 500),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint j2s_guest_dates check (check_out > check_in and check_out - check_in <= 366),
  -- Entire house; checkout day is available for the next arrival.
  constraint j2s_guest_no_overlap exclude using gist
    (daterange(check_in, check_out, '[)') with &&) where (status = 'confirmed')
);
create index j2s_guest_bookings_upcoming on public.j2s_guest_bookings (check_out, check_in)
  where status = 'confirmed';

alter table public.j2s_guest_access enable row level security;
alter table public.j2s_guest_sessions enable row level security;
alter table public.j2s_guest_bookings enable row level security;
revoke all on public.j2s_guest_access, public.j2s_guest_sessions, public.j2s_guest_bookings from public, anon, authenticated;
grant select, insert, update, delete on public.j2s_guest_access, public.j2s_guest_sessions, public.j2s_guest_bookings to service_role;

create function public.j2s_guest_session(p_session_hash text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select coalesce(
    (select jsonb_build_object('expires_at', expires_at) from public.j2s_guest_sessions
      where token_hash = p_session_hash and expires_at > now()),
    jsonb_build_object('error', 'unauthorized'));
$$;

create function public.j2s_guest_login(p_pin text, p_token_hash text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  access_row public.j2s_guest_access%rowtype;
  expiry timestamptz := now() + interval '8 hours';
  retry_seconds integer;
begin
  if p_pin is null or p_pin !~ '^[0-9]{4}$' or p_token_hash is null or p_token_hash !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('error', 'invalid_request');
  end if;
  -- A row lock serializes attempts across all Edge instances and source addresses.
  select * into access_row from public.j2s_guest_access where singleton = true for update;
  if not found then return jsonb_build_object('error', 'unavailable'); end if;
  if access_row.window_started_at <= now() - interval '15 minutes' then
    access_row.failed_attempts := 0;
    access_row.window_started_at := now();
  end if;
  if access_row.failed_attempts >= 5 then
    retry_seconds := greatest(1, ceil(extract(epoch from (access_row.window_started_at + interval '15 minutes' - now())))::integer);
    return jsonb_build_object('error', 'rate_limited', 'retry_after', retry_seconds);
  end if;
  if extensions.crypt(p_pin, access_row.pin_hash) <> access_row.pin_hash then
    update public.j2s_guest_access set failed_attempts = access_row.failed_attempts + 1,
      window_started_at = access_row.window_started_at where singleton = true;
    return jsonb_build_object('error', 'invalid_pin');
  end if;
  update public.j2s_guest_access set failed_attempts = 0, window_started_at = now() where singleton = true;
  delete from public.j2s_guest_sessions where expires_at <= now();
  insert into public.j2s_guest_sessions(token_hash, expires_at) values (p_token_hash, expiry);
  return jsonb_build_object('expires_at', expiry);
end;
$$;

create function public.j2s_guest_logout(p_session_hash text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
begin
  delete from public.j2s_guest_sessions where token_hash = p_session_hash;
  return jsonb_build_object('ok', true);
end;
$$;

create function public.j2s_guest_calendar(p_from date, p_to date)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare stays jsonb;
begin
  if p_from is null or p_to is null or not isfinite(p_from) or not isfinite(p_to) or p_to <= p_from or p_to - p_from > 62 then
    return jsonb_build_object('error', 'invalid_request');
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('check_in', check_in, 'check_out', check_out) order by check_in), '[]'::jsonb)
    into stays from public.j2s_guest_bookings
    where status = 'confirmed' and check_in < p_to and check_out > p_from;
  return jsonb_build_object('stays', stays);
end;
$$;

-- Owner explicitly chooses to publish names, party sizes and stay dates.
-- Purpose, internal identifiers, session data and request metadata stay private.
create function public.j2s_guest_upcoming()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('guests', coalesce(jsonb_agg(jsonb_build_object(
    'guest_name', guest_name, 'guest_count', guest_count, 'check_in', check_in, 'check_out', check_out
  ) order by check_in, id), '[]'::jsonb)) from (
    select id, guest_name, guest_count, check_in, check_out from public.j2s_guest_bookings
      where status = 'confirmed' and check_out > (now() at time zone 'Asia/Kuala_Lumpur')::date
      and check_in <= (now() at time zone 'Asia/Kuala_Lumpur')::date + 365
      order by check_in, id limit 1000
  ) upcoming;
$$;

create function public.j2s_guest_list(p_session_hash text, p_past boolean default false)
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare
  today date := (now() at time zone 'Asia/Kuala_Lumpur')::date;
  guests jsonb;
begin
  if public.j2s_guest_session(p_session_hash) ? 'error' then return jsonb_build_object('error', 'unauthorized'); end if;
  select coalesce(jsonb_agg(to_jsonb(booking) - 'request_id' - 'created_at' - 'updated_at' order by check_in, id), '[]'::jsonb)
  into guests from (
    select * from public.j2s_guest_bookings where status = 'confirmed'
      and check_out > today - case when p_past then 90 else 0 end
      and check_in <= today + 365 order by check_in, id limit 1000
  ) booking;
  return jsonb_build_object('guests', guests);
end;
$$;

create function public.j2s_guest_save(
  p_session_hash text, p_id uuid, p_version integer, p_request_id uuid,
  p_check_in date, p_check_out date, p_guest_name text, p_guest_count integer, p_purpose text
)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  today date := (now() at time zone 'Asia/Kuala_Lumpur')::date;
  booking public.j2s_guest_bookings%rowtype;
  clean_name text := btrim(p_guest_name);
  clean_purpose text := nullif(btrim(p_purpose), '');
begin
  if public.j2s_guest_session(p_session_hash) ? 'error' then return jsonb_build_object('error', 'unauthorized'); end if;
  if p_request_id is null or p_check_in is null or p_check_out is null or not isfinite(p_check_in) or not isfinite(p_check_out)
      or p_check_out <= p_check_in or p_check_out - p_check_in > 366
      or p_guest_count is null or p_guest_count not between 1 and 20
      or clean_name is null or char_length(clean_name) not between 1 and 120
      or char_length(clean_purpose) > 500 or p_check_in > today + 365 then
    return jsonb_build_object('error', 'invalid_request');
  end if;
  if p_id is null then
    if p_check_in < today then return jsonb_build_object('error', 'invalid_request'); end if;
    -- Same request id serializes retries; no duplicate after a lost HTTP response.
    perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
    select * into booking from public.j2s_guest_bookings where request_id = p_request_id;
    if found then
      if booking.check_in <> p_check_in or booking.check_out <> p_check_out or booking.guest_name <> clean_name
          or booking.guest_count <> p_guest_count or booking.purpose is distinct from clean_purpose or booking.status <> 'confirmed' then
        return jsonb_build_object('error', 'request_conflict');
      end if;
      return jsonb_build_object('guest', to_jsonb(booking) - 'request_id' - 'created_at' - 'updated_at');
    end if;
    insert into public.j2s_guest_bookings(request_id, check_in, check_out, guest_name, guest_count, purpose)
      values (p_request_id, p_check_in, p_check_out, clean_name, p_guest_count, clean_purpose) returning * into booking;
  else
    select * into booking from public.j2s_guest_bookings where id = p_id for update;
    if not found then return jsonb_build_object('error', 'not_found'); end if;
    if p_version is null or booking.version <> p_version or booking.status <> 'confirmed' then return jsonb_build_object('error', 'stale'); end if;
    if p_check_in < today and p_check_in <> booking.check_in then return jsonb_build_object('error', 'invalid_request'); end if;
    update public.j2s_guest_bookings set check_in = p_check_in, check_out = p_check_out,
      guest_name = clean_name, guest_count = p_guest_count, purpose = clean_purpose,
      version = version + 1, updated_at = now() where id = p_id returning * into booking;
  end if;
  return jsonb_build_object('guest', to_jsonb(booking) - 'request_id' - 'created_at' - 'updated_at');
exception
  when exclusion_violation then return jsonb_build_object('error', 'overlap');
end;
$$;

create function public.j2s_guest_cancel(p_session_hash text, p_id uuid, p_version integer)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare booking public.j2s_guest_bookings%rowtype;
begin
  if public.j2s_guest_session(p_session_hash) ? 'error' then return jsonb_build_object('error', 'unauthorized'); end if;
  select * into booking from public.j2s_guest_bookings where id = p_id for update;
  if not found then return jsonb_build_object('error', 'not_found'); end if;
  if p_version is null or booking.version <> p_version or booking.status <> 'confirmed' then return jsonb_build_object('error', 'stale'); end if;
  update public.j2s_guest_bookings set status = 'cancelled', version = version + 1, updated_at = now() where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- Functions default to EXECUTE for PUBLIC. Explicitly remove it; only the Edge
-- function's server-held service key may call them. No SECURITY DEFINER bypass.
revoke all on function public.j2s_guest_session(text) from public, anon, authenticated;
revoke all on function public.j2s_guest_login(text, text) from public, anon, authenticated;
revoke all on function public.j2s_guest_logout(text) from public, anon, authenticated;
revoke all on function public.j2s_guest_calendar(date, date) from public, anon, authenticated;
revoke all on function public.j2s_guest_upcoming() from public, anon, authenticated;
revoke all on function public.j2s_guest_list(text, boolean) from public, anon, authenticated;
revoke all on function public.j2s_guest_save(text, uuid, integer, uuid, date, date, text, integer, text) from public, anon, authenticated;
revoke all on function public.j2s_guest_cancel(text, uuid, integer) from public, anon, authenticated;
grant execute on function public.j2s_guest_session(text), public.j2s_guest_login(text, text), public.j2s_guest_logout(text),
  public.j2s_guest_calendar(date, date), public.j2s_guest_upcoming(), public.j2s_guest_list(text, boolean),
  public.j2s_guest_save(text, uuid, integer, uuid, date, date, text, integer, text),
  public.j2s_guest_cancel(text, uuid, integer) to service_role;
