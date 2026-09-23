-- Guest count is optional. This metadata-only column change preserves existing records and counts.
-- The existing CHECK still enforces 1–20 whenever a count is supplied.
alter table public.j2s_guest_bookings alter column guest_count drop not null;

create or replace function public.j2s_guest_save(
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
      or (p_guest_count is not null and p_guest_count not between 1 and 20)
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
          or booking.guest_count is distinct from p_guest_count or booking.purpose is distinct from clean_purpose or booking.status <> 'confirmed' then
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

-- CREATE OR REPLACE preserves permissions; restate the intended service-only access.
revoke all on function public.j2s_guest_save(text, uuid, integer, uuid, date, date, text, integer, text) from public, anon, authenticated;
grant execute on function public.j2s_guest_save(text, uuid, integer, uuid, date, date, text, integer, text) to service_role;
