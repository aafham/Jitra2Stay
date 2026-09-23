// Shared by the Deno Edge Function and Node tests. No secrets or SDK in the browser.
const DAY = 86_400_000;
const MAX_BODY_BYTES = 8192;
const ORIGINS = new Set([
  'https://jitra2stay.vercel.app',
  'https://aafham.github.io',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const ERRORS = {
  invalid_request: [400, 'Sila semak maklumat yang dimasukkan.'],
  invalid_pin: [401, 'PIN tidak betul. Sila cuba lagi.'],
  unauthorized: [401, 'Sesi telah tamat. Sila masukkan PIN semula.'],
  forbidden: [403, 'Permintaan tidak dibenarkan.'],
  not_found: [404, 'Rekod tetamu tidak ditemui.'],
  method_not_allowed: [405, 'Kaedah permintaan tidak dibenarkan.'],
  overlap: [409, 'Tarikh ini bertindih dengan tempahan lain. Sila pilih tarikh lain.'],
  stale: [409, 'Rekod sudah diubah. Muat semula sebelum mencuba lagi.'],
  request_conflict: [409, 'Permintaan ini sudah digunakan. Sila muat semula.'],
  too_large: [413, 'Maklumat yang dihantar terlalu panjang.'],
  rate_limited: [429, 'Terlalu banyak cubaan PIN. Sila tunggu sebelum mencuba lagi.'],
  unavailable: [503, 'Sambungan tidak tersedia. Sila cuba lagi sebentar nanti.'],
};

export function isoDate(value) {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value ? time : null;
}

export function malaysiaToday(now = new Date()) {
  return new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function sha256(value, cryptoImpl = globalThis.crypto) {
  const digest = await cryptoImpl.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function randomToken(cryptoImpl) {
  const bytes = cryptoImpl.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function readBody(request) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) throw new Error('too_large');
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
    throw new Error('invalid_request');
  }
  if (!request.body) throw new Error('invalid_request');
  const reader = request.body.getReader();
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error('too_large');
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { all.set(chunk, offset); offset += chunk.byteLength; }
  let result;
  try { result = JSON.parse(new TextDecoder().decode(all)); } catch { throw new Error('invalid_request'); }
  if (!result || Array.isArray(result) || typeof result !== 'object') throw new Error('invalid_request');
  return result;
}

function validateSave(body, today) {
  const checkIn = isoDate(body.check_in);
  const checkOut = isoDate(body.check_out);
  const editing = body.id !== undefined;
  if (!UUID.test(body.request_id || '') || (editing && (!UUID.test(body.id) || !Number.isSafeInteger(body.version) || body.version < 1))) return null;
  if (checkIn === null || checkOut === null || checkOut <= checkIn || checkOut - checkIn > 366 * DAY) return null;
  if (!editing && (body.check_in < today || checkIn > isoDate(today) + 365 * DAY)) return null;
  if (typeof body.guest_name !== 'string' || typeof body.guest_count !== 'number' || !Number.isInteger(body.guest_count)) return null;
  if (body.purpose !== undefined && body.purpose !== null && typeof body.purpose !== 'string') return null;
  const name = body.guest_name.trim();
  const purpose = (body.purpose || '').trim();
  if (!name || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name) || purpose.length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(purpose) || body.guest_count < 1 || body.guest_count > 20) return null;
  return {
    p_id: editing ? body.id : null,
    p_version: editing ? body.version : null,
    p_request_id: body.request_id,
    p_check_in: body.check_in,
    p_check_out: body.check_out,
    p_guest_name: name,
    p_guest_count: body.guest_count,
    p_purpose: purpose || null,
  };
}

export function createHandler({ rpc, now = () => new Date(), cryptoImpl = globalThis.crypto }) {
  return async function handler(request) {
    const origin = request.headers.get('origin');
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Origin',
    };
    if (ORIGINS.has(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Headers'] = 'authorization, content-type';
      headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      headers['Access-Control-Expose-Headers'] = 'Retry-After';
    }
    const reply = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } });
    const failure = (code, retryAfter) => {
      const known = ERRORS[code] ? code : 'unavailable';
      const [status, message] = ERRORS[known];
      const wait = Number.isFinite(retryAfter) ? Math.max(1, Math.ceil(retryAfter)) : 900;
      return reply({ error: known, message, ...(known === 'rate_limited' ? { retry_after: wait } : {}) }, status,
        known === 'rate_limited' ? { 'Retry-After': String(wait) } : {});
    };
    if (origin && !ORIGINS.has(origin)) return failure('forbidden');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!['GET', 'POST'].includes(request.method)) return failure('method_not_allowed');
    try {
      const url = new URL(request.url);
      const body = request.method === 'POST' ? await readBody(request) : null;
      const action = body ? body.action : url.searchParams.get('action');
      let result;
      if (action === 'upcoming' && request.method === 'GET') {
        result = await rpc('j2s_guest_upcoming', {});
        if (result?.error) return failure(result.error, result.retry_after);
        if (!Array.isArray(result?.guests)) return failure('unavailable');
        return reply({ guests: result.guests.map(guest => ({
          guest_name: guest.guest_name,
          guest_count: guest.guest_count,
          check_in: guest.check_in,
          check_out: guest.check_out,
        })) });
      }
      if (action === 'calendar' && request.method === 'GET') {
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        const start = isoDate(from), end = isoDate(to);
        if (start === null || end === null || end <= start || end - start > 62 * DAY) return failure('invalid_request');
        result = await rpc('j2s_guest_calendar', { p_from: from, p_to: to });
        if (result?.error) return failure(result.error, result.retry_after);
        if (!Array.isArray(result?.stays)) return failure('unavailable');
        // Explicit response projection prevents a future database change exposing personal details.
        return reply({ stays: result.stays.map(stay => ({ check_in: stay.check_in, check_out: stay.check_out })) });
      }
      if (action === 'login' && request.method === 'POST') {
        if (typeof body.pin !== 'string' || !/^\d{4}$/.test(body.pin)) return failure('invalid_request');
        const token = randomToken(cryptoImpl);
        result = await rpc('j2s_guest_login', { p_pin: body.pin, p_token_hash: await sha256(token, cryptoImpl) });
        if (result?.error) return failure(result.error, result.retry_after);
        if (!result?.expires_at) return failure('unavailable');
        return reply({ token, expires_at: result.expires_at });
      }
      const validActions = request.method === 'GET' ? ['session', 'guests'] : ['save', 'cancel', 'logout'];
      if (!validActions.includes(action)) return failure('invalid_request');
      const authorization = request.headers.get('authorization') || '';
      const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
      if (!TOKEN.test(token)) return failure('unauthorized');
      const auth = { p_session_hash: await sha256(token, cryptoImpl) };
      if (action === 'session') result = await rpc('j2s_guest_session', auth);
      if (action === 'guests') {
        const past = url.searchParams.get('past');
        if (past !== null && past !== '1') return failure('invalid_request');
        result = await rpc('j2s_guest_list', { ...auth, p_past: past === '1' });
      }
      if (action === 'save') {
        const data = validateSave(body, malaysiaToday(now()));
        if (!data) return failure('invalid_request');
        result = await rpc('j2s_guest_save', { ...auth, ...data });
      }
      if (action === 'cancel') {
        if (!UUID.test(body.id || '') || !Number.isSafeInteger(body.version) || body.version < 1) return failure('invalid_request');
        result = await rpc('j2s_guest_cancel', { ...auth, p_id: body.id, p_version: body.version });
      }
      if (action === 'logout') result = await rpc('j2s_guest_logout', auth);
      if (!result || typeof result !== 'object') return failure('unavailable');
      return result.error ? failure(result.error, result.retry_after) : reply(result);
    } catch (error) {
      // Never forward database errors, request bodies, PINs or tokens to logs / callers.
      return failure(['invalid_request', 'too_large'].includes(error?.message) ? error.message : 'unavailable');
    }
  };
}

export function createRpcClient({ url, serviceKey, fetchImpl = globalThis.fetch }) {
  return async (name, parameters) => {
    if (!url || !serviceKey || !/^j2s_guest_[a-z]+$/.test(name)) throw new Error('unavailable');
    const response = await fetchImpl(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error('unavailable');
    return response.json();
  };
}
