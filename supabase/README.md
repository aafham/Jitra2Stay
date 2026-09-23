# Guest calendar backend

The static website calls the single `guest-calendar` Edge Function. The function
uses Supabase's built-in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` server
environment variables to call narrowly scoped PostgREST RPCs. No API key or PIN
is required in the browser bundle. There are no runtime package dependencies.

## Data and access

- `j2s_guest_bookings`: stay dates, guest name, party size, optional private purpose,
  cancellation status, optimistic version, and create-request ID.
- `j2s_guest_access`: one salted bcrypt PIN hash and the persistent login limit.
- `j2s_guest_sessions`: SHA-256 hashes of random 256-bit session tokens; 8-hour expiry.

All three tables have RLS enabled and no `anon` / `authenticated` privileges or
policies. Only the Edge Function's server-held service role can call the RPCs.
All RPCs use `SECURITY INVOKER`, an empty search path, and explicit schema names.
Every protected RPC validates the session before reading or changing bookings.
Logout deletes the server session immediately.

The owner explicitly chose to show upcoming guest names, party sizes and dates
on the public homepage. Public calendar responses contain dates only. Public
upcoming responses contain exactly those four chosen fields. Purpose, record IDs,
request IDs, versions, access settings and sessions remain private. Both the SQL
RPC and the Edge response project public fields explicitly.

## Initial setup

1. Apply the CLI-created migration in `migrations/` to the selected project.
2. On a **new or disposable test database**, execute `tests/guest-calendar.sql`.
   It tests synthetic records inside a transaction and rolls back everything.
   It temporarily replaces rows in that transaction, so do not use it against
   an active booking database during normal operations.
3. Initialize the PIN using a trusted administrative connection with a parameter
   supplied at runtime. Never put the real PIN or its hash in a source file,
   migration, terminal history, browser bundle, fixture, or public output.

   ```sql
   -- Bind $1 to the PIN in a parameterized administrative query.
   insert into public.j2s_guest_access (singleton, pin_hash)
   values (true, extensions.crypt($1, extensions.gen_salt('bf', 12)))
   on conflict (singleton) do update
     set pin_hash = excluded.pin_hash,
         failed_attempts = 0,
         window_started_at = now();
   ```

4. Deploy `functions/guest-calendar/index.ts` **and** its imported `handler.mjs`.
   The function must use `verify_jwt = false`, as configured in `config.toml`:
   its public endpoints need no JWT, and protected endpoints use its own opaque
   session tokens. Turning off this platform check does not disable the
   handler's session validation.
5. Set the website's public endpoint URL to the deployed function. Do not put
   a service key in website configuration. Test unauthenticated reads, login,
   create, edit, cancel, expiry and logout before launch.

Before changing the PIN, delete all `j2s_guest_sessions` in the same administrative
transaction so existing sessions cannot continue using the old access grant.

## Login limit and recovery

Five incorrect PIN attempts in a 15-minute window temporarily block further login
attempts. A database row lock enforces the shared counter across Edge instances;
it does not trust caller-supplied IP headers. Successful login resets that counter.
The response includes `retry_after` and the `Retry-After` header. Expired sessions
are removed at the next successful login.

A four-digit PIN has limited entropy. A shared rate limit slows distributed
guessing, but a visitor can intentionally trigger the temporary lockout. Waiting
for the window to expire is the ordinary recovery. A trusted administrator can
reset `failed_attempts` to zero and `window_started_at` to `now()` in the private
access row if necessary. Repeated attacks warrant stronger authentication;
increasing the guessing allowance is not the recommended response.

## API contract

All responses use `Cache-Control: no-store`. Errors are non-2xx JSON containing
`error` and a safe Malay `message`; database errors are never returned or logged.

| Request | Authentication | Result |
| --- | --- | --- |
| `GET ?action=calendar&from=YYYY-MM-DD&to=YYYY-MM-DD` | Public | `{stays:[{check_in,check_out}]}`; maximum 62 days |
| `GET ?action=upcoming` | Public | `{guests:[{guest_name,guest_count,check_in,check_out}]}` |
| `POST {action:"login",pin}` | Public; rate limited | `{token,expires_at}` |
| `GET ?action=session` | Bearer token | `{expires_at}` |
| `GET ?action=guests` | Bearer token | Active upcoming / ongoing records |
| `GET ?action=guests&past=1` | Bearer token | Above plus previous 90 days |
| `POST {action:"save",request_id,check_in,check_out,guest_name,guest_count,purpose?}` | Bearer token | `{guest}` |
| Same save request with `id` and `version` | Bearer token | Updated `{guest}` |
| `POST {action:"cancel",id,version}` | Bearer token | `{ok:true}`; retains cancelled history |
| `POST {action:"logout"}` | Bearer token | `{ok:true}` |

Calendar ranges and bookings include check-in and exclude check-out. Same-day
turnover is permitted. A GiST exclusion constraint prevents confirmed overlaps
even if requests race. Create retries reuse the same UUID `request_id`; concurrent
edits and cancellation require the latest `version`. Conflicts return HTTP 409
with distinct `overlap`, `stale`, or `request_conflict` codes.

New arrivals must be between today in Malaysia and the next 365 days. A stay is
at most 366 nights. An existing record may retain its original past check-in when
edited, but cannot move to a different past check-in. Party size is 1–20, guest
name is 1–120 characters, and optional purpose is at most 500 characters.

Exact CORS origins are the two production hosts and localhost / 127.0.0.1 on port
4173. CORS is a browser policy, not an authentication boundary.

## Verification

- `node --test tests/guest-api.test.cjs` from the repository root runs the
  dependency-injected handler tests, including public field projection, date
  validation, session hashing, error handling, validation, CORS and payload limits.
- `supabase/tests/guest-calendar.sql` checks real database constraints, idempotency,
  optimistic updates, cancellations, PIN cooldown, sessions, RLS and grants.
- Check Supabase security advisors after applying the migration. RLS without
  policies is intentional for these service-only tables; do not add public
  policies to silence that informational notice. The
  [RLS enabled, no policy advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
  describes this deny-all state: `anon` and `authenticated` must have no direct
  access here; only the authenticated server-held service role uses the tables.

Documentation checked for this implementation:
[function authorization](https://supabase.com/docs/guides/functions/auth-headers),
[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[changelog](https://supabase.com/changelog).
