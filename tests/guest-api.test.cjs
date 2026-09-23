const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, randomInt } = require('node:crypto');
const api = import('../supabase/functions/guest-calendar/handler.mjs');
const origin = 'https://jitra2stay.vercel.app';
const token = Buffer.alloc(32, 24).toString('base64url');
const now = () => new Date('2026-09-23T04:00:00Z');
const base = 'https://example.supabase.co/functions/v1/guest-calendar';

function request(action, body, { auth = true, requestOrigin = origin, headers = {} } = {}) {
  const h = { ...headers };
  if (requestOrigin) h.Origin = requestOrigin;
  if (auth) h.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    h['Content-Type'] = 'application/json';
    return new Request(base, { method: 'POST', headers: h, body: JSON.stringify({ action, ...body }) });
  }
  return new Request(`${base}?action=${action}`, { headers: h });
}
function save(overrides = {}) {
  return { request_id: randomUUID(), check_in: '2026-09-24', check_out: '2026-09-26', guest_name: 'Tetamu ujian', guest_count: 4, ...overrides };
}

test('calendar exposes dates only, never private database fields', async () => {
  const { createHandler } = await api;
  const handler = createHandler({ rpc: async (name, params) => {
    assert.equal(name, 'j2s_guest_calendar');
    assert.deepEqual(params, { p_from: '2026-09-01', p_to: '2026-10-01' });
    return { stays: [{ check_in: '2026-09-24', check_out: '2026-09-26', guest_name: 'Private', guest_count: 4, purpose: 'Private', id: randomUUID() }] };
  } });
  const result = await handler(request('calendar&from=2026-09-01&to=2026-10-01', undefined, { auth: false }));
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await result.json(), { stays: [{ check_in: '2026-09-24', check_out: '2026-09-26' }] });
});

test('public upcoming projects only the four owner-authorized fields', async () => {
  const { createHandler } = await api;
  const guest = { check_in: '2026-09-24', check_out: '2026-09-26', guest_name: 'Tetamu contoh', guest_count: 4 };
  const handler = createHandler({ rpc: async name => {
    assert.equal(name, 'j2s_guest_upcoming');
    return { guests: [{ ...guest, id: randomUUID(), purpose: 'Private note', version: 1, request_id: randomUUID() }] };
  } });
  const result = await handler(request('upcoming', undefined, { auth: false }));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { guests: [guest] });
});

test('real date and range validation rejects impossible days and excessive ranges', async () => {
  const { createHandler, isoDate, malaysiaToday } = await api;
  assert.equal(isoDate('2025-02-29'), null);
  assert.notEqual(isoDate('2024-02-29'), null);
  assert.equal(malaysiaToday(new Date('2026-09-22T16:01:00Z')), '2026-09-23');
  let calls = 0;
  const handler = createHandler({ rpc: async () => { calls++; return { stays: [] }; } });
  for (const range of ['from=2026-02-30&to=2026-03-01', 'from=2026-09-01&to=2026-09-01', 'from=2026-09-01&to=2026-11-03', 'from=bad&to=2026-10-01']) {
    assert.equal((await handler(request(`calendar&${range}`))).status, 400);
  }
  assert.equal(calls, 0);
  assert.equal((await handler(request('calendar&from=2026-09-01&to=2026-11-02'))).status, 200);
});

test('database outage never looks like an empty or available calendar', async () => {
  const { createHandler } = await api;
  for (const rpc of [async () => { throw new Error('private database detail'); }, async () => null, async () => ({})]) {
    const handler = createHandler({ rpc });
    const response = await handler(request('calendar&from=2026-09-01&to=2026-10-01'));
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.error, 'unavailable');
    assert.equal('stays' in body, false);
    assert.equal(JSON.stringify(body).includes('private database detail'), false);
  }
});

test('login returns a random opaque token and persists only its hash', async () => {
  const { createHandler, sha256 } = await api;
  const syntheticPin = String(randomInt(10_000)).padStart(4, '0');
  const hashes = [];
  const handler = createHandler({ rpc: async (name, params) => {
    assert.equal(name, 'j2s_guest_login');
    assert.equal(params.p_pin, syntheticPin);
    assert.match(params.p_token_hash, /^[a-f0-9]{64}$/);
    hashes.push(params.p_token_hash);
    return { expires_at: '2026-09-23T12:00:00Z' };
  } });
  const first = await (await handler(request('login', { pin: syntheticPin }, { auth: false }))).json();
  const second = await (await handler(request('login', { pin: syntheticPin }, { auth: false }))).json();
  assert.match(first.token, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first.token, second.token);
  assert.equal(await sha256(first.token), hashes[0]);
  assert.deepEqual(Object.keys(first).sort(), ['expires_at', 'token']);
});

test('login distinguishes incorrect PIN from durable lockout without leaking data', async () => {
  const { createHandler } = await api;
  const pin = String(randomInt(10_000)).padStart(4, '0');
  const invalid = createHandler({ rpc: async () => ({ error: 'invalid_pin' }) });
  assert.equal((await invalid(request('login', { pin }))).status, 401);
  const locked = createHandler({ rpc: async () => ({ error: 'rate_limited', retry_after: 730 }) });
  const response = await locked(request('login', { pin }));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '730');
  assert.equal((await response.json()).retry_after, 730);
});

test('protected reads and writes reject missing or malformed credentials', async () => {
  const { createHandler } = await api;
  let calls = 0;
  const handler = createHandler({ rpc: async () => { calls++; return {}; } });
  for (const action of ['session', 'guests']) assert.equal((await handler(request(action, undefined, { auth: false }))).status, 401);
  for (const action of ['save', 'cancel', 'logout']) assert.equal((await handler(request(action, {}, { auth: false }))).status, 401);
  assert.equal((await handler(request('session', undefined, { auth: false, headers: { Authorization: 'Bearer wrong' } }))).status, 401);
  assert.equal(calls, 0);
});

test('protected routes authenticate with a token hash, and propagate session expiry', async () => {
  const { createHandler, sha256 } = await api;
  const hash = await sha256(token);
  const handler = createHandler({ rpc: async (name, params) => {
    assert.equal(name, 'j2s_guest_list');
    assert.deepEqual(params, { p_session_hash: hash, p_past: true });
    return { error: 'unauthorized' };
  } });
  assert.equal((await handler(request('guests&past=1'))).status, 401);
});

test('purpose can be omitted and whitespace is normalized on save', async () => {
  const { createHandler } = await api;
  const input = save({ guest_name: '  Tetamu ujian  ' });
  const handler = createHandler({ now, rpc: async (name, params) => {
    assert.equal(name, 'j2s_guest_save');
    assert.equal(params.p_guest_name, 'Tetamu ujian');
    assert.equal(params.p_purpose, null);
    assert.equal(params.p_request_id, input.request_id);
    assert.equal(params.p_id, null);
    return { guest: { id: randomUUID(), version: 1 } };
  } });
  assert.equal((await handler(request('save', input))).status, 200);
});

test('save validates required fields, count bounds, real dates, duration and Malaysia arrival dates', async () => {
  const { createHandler } = await api;
  let calls = 0;
  const handler = createHandler({ now, rpc: async () => { calls++; return {}; } });
  const invalid = [
    { guest_name: '' }, { guest_name: 'x'.repeat(121) }, { guest_name: 'bad\nname' },
    { guest_count: 0 }, { guest_count: 21 }, { guest_count: 1.5 }, { guest_count: '4' },
    { check_in: '2026-09-22' }, { check_in: '2028-01-01', check_out: '2028-01-02' },
    { check_out: '2026-09-24' }, { check_out: '2026-09-23' }, { check_out: '2026-02-30' },
    { check_out: '2027-09-26' }, { purpose: 'x'.repeat(501) }, { purpose: {} },
    { request_id: 'bad' }, { id: randomUUID() }, { id: randomUUID(), version: 0 },
  ];
  for (const override of invalid) {
    const response = await handler(request('save', save(override)));
    assert.equal(response.status, 400, JSON.stringify(override));
  }
  assert.equal(calls, 0);
});

test('editing an existing past arrival reaches database validation with its version', async () => {
  const { createHandler } = await api;
  const data = save({ id: randomUUID(), version: 3, check_in: '2026-09-22', check_out: '2026-09-25' });
  const handler = createHandler({ now, rpc: async (name, params) => {
    assert.equal(params.p_id, data.id);
    assert.equal(params.p_version, 3);
    return { guest: { ...data, version: 4 } };
  } });
  assert.equal((await handler(request('save', data))).status, 200);
});

test('overlap and concurrent edit errors remain distinct 409 responses', async () => {
  const { createHandler } = await api;
  for (const error of ['overlap', 'stale', 'request_conflict']) {
    const handler = createHandler({ now, rpc: async () => ({ error }) });
    const response = await handler(request('save', save()));
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error, error);
  }
});

test('cancel requires a version and logout invokes revocation RPC', async () => {
  const { createHandler } = await api;
  const calls = [];
  const handler = createHandler({ rpc: async (name, params) => { calls.push([name, params]); return { ok: true }; } });
  assert.equal((await handler(request('cancel', { id: randomUUID() }))).status, 400);
  assert.equal((await handler(request('cancel', { id: randomUUID(), version: 1 }))).status, 200);
  assert.equal((await handler(request('logout', {}))).status, 200);
  assert.deepEqual(calls.map(([name]) => name), ['j2s_guest_cancel', 'j2s_guest_logout']);
});

test('CORS permits only exact website and preview origins without relaxing authentication', async () => {
  const { createHandler } = await api;
  const handler = createHandler({ rpc: async () => { throw new Error('must not run'); } });
  for (const allowed of [origin, 'https://aafham.github.io', 'http://localhost:4173', 'http://127.0.0.1:4173']) {
    const response = await handler(new Request(base, { method: 'OPTIONS', headers: { Origin: allowed } }));
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), allowed);
  }
  for (const denied of ['https://jitra2stay.vercel.app.evil.example', 'https://evil.example', 'null']) {
    const response = await handler(request('session', undefined, { requestOrigin: denied }));
    assert.equal(response.status, 403);
    assert.equal(response.headers.has('access-control-allow-origin'), false);
  }
  assert.equal((await handler(request('session', undefined, { requestOrigin: origin, auth: false }))).status, 401);
});

test('unsupported methods/actions, bad JSON and oversize bodies fail safely', async () => {
  const { createHandler } = await api;
  let calls = 0;
  const handler = createHandler({ rpc: async () => { calls++; return {}; } });
  assert.equal((await handler(new Request(base, { method: 'DELETE' }))).status, 405);
  assert.equal((await handler(request('unknown'))).status, 400);
  assert.equal((await handler(request('login'))).status, 400);
  for (const body of ['{', 'null', '[]']) {
    assert.equal((await handler(new Request(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }))).status, 400);
  }
  assert.equal((await handler(new Request(base, { method: 'POST', body: 'text' }))).status, 400);
  assert.equal((await handler(request('save', save({ purpose: 'x'.repeat(9000) })))).status, 413);
  assert.equal(calls, 0);
});

test('PostgREST adapter uses only server credentials and rejects transport errors', async () => {
  const { createRpcClient } = await api;
  const rpc = createRpcClient({ url: 'https://example.supabase.co/', serviceKey: 'synthetic-server-key', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://example.supabase.co/rest/v1/rpc/j2s_guest_session');
    assert.equal(options.headers.Authorization, 'Bearer synthetic-server-key');
    assert.equal(options.headers.apikey, 'synthetic-server-key');
    assert.deepEqual(JSON.parse(options.body), { p_session_hash: 'synthetic-hash' });
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 200 });
  } });
  assert.deepEqual(await rpc('j2s_guest_session', { p_session_hash: 'synthetic-hash' }), { error: 'unauthorized' });
  const unavailable = createRpcClient({ url: 'https://example.supabase.co', serviceKey: 'synthetic-server-key', fetchImpl: async () => new Response('sensitive', { status: 500 }) });
  await assert.rejects(unavailable('j2s_guest_session', {}), { message: 'unavailable' });
  await assert.rejects(rpc('../bad', {}), { message: 'unavailable' });
});
